import time
import json
import logging
from typing import Dict, Optional
from fastapi import Request, HTTPException
try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    _HAS_SLOWAPI = True
except Exception:
    # slowapi is optional; provide no-op fallbacks so the app can run without it.
    _HAS_SLOWAPI = False

    def get_remote_address(request):
        # Basic fallback to get client IP from request
        return request.client.host if request.client else "127.0.0.1"

    class RateLimitExceeded(Exception):
        pass

    class Limiter:
        def __init__(self, *args, **kwargs):
            self.key_func = kwargs.get('key_func') if kwargs else None
        def __call__(self, *args, **kwargs):
            return lambda f: f
    def _rate_limit_exceeded_handler(request, exc):
        return None
try:
    import redis
    _HAS_REDIS_PACKAGE = True
except Exception:
    redis = None
    _HAS_REDIS_PACKAGE = False
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Redis connection for rate limiting (optional)
redis_client = None
if _HAS_REDIS_PACKAGE:
    try:
        redis_client = redis.Redis(host='localhost', port=6379, db=1, decode_responses=True)
        redis_client.ping()
        logger.info("Redis connected for rate limiting")
    except Exception as e:
        # Connection refused or other network issues are non-fatal. Use in-memory fallback.
        logger.info(f"Redis not available for rate limiting (using in-memory): {e}")
        redis_client = None
else:
    logger.debug("redis package not installed; using in-memory rate limiting")

def get_client_ip(request: Request) -> str:
    """Get client IP address with proxy support"""
    # Check for forwarded headers first
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fallback to direct connection
    return get_remote_address(request)

def get_user_identifier(request: Request) -> str:
    """Get user identifier for rate limiting"""
    # Try to get user ID from JWT token
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        try:
            # Extract user ID from token (simplified)
            token = auth_header.split(" ")[1]
            # In a real implementation, decode JWT and extract user_id
            return f"user:{token[:10]}"  # Use token prefix as identifier
        except:
            pass
    
    # Fallback to IP address
    return f"ip:{get_client_ip(request)}"

# Create limiter instance
limiter = Limiter(
    key_func=get_user_identifier,
    storage_uri="redis://localhost:6379/1" if redis_client else "memory://",
    default_limits=["1000/hour", "100/minute"]
)

class AdvancedRateLimiter:
    """Advanced rate limiting with custom rules"""
    
    def __init__(self):
        self.redis_client = redis_client
        self.rate_limits = {
            # Authentication endpoints
            "auth_login": {"limit": 5, "window": 300},  # 5 attempts per 5 minutes
            "auth_signup": {"limit": 3, "window": 3600},  # 3 signups per hour
            
            # Trading endpoints
            "trading_order": {"limit": 100, "window": 3600},  # 100 orders per hour
            "trading_cancel": {"limit": 200, "window": 3600},  # 200 cancellations per hour
            
            # Market data endpoints
            "market_data": {"limit": 1000, "window": 3600},  # 1000 requests per hour
            "realtime_quote": {"limit": 500, "window": 300},  # 500 quotes per 5 minutes
            
            # General API
            "api_general": {"limit": 2000, "window": 3600},  # 2000 requests per hour
        }
    
    async def check_rate_limit(self, identifier: str, endpoint_type: str) -> bool:
        """Check if request is within rate limits"""
        if not self.redis_client:
            return True  # Allow if Redis is not available
        
        try:
            limits = self.rate_limits.get(endpoint_type, self.rate_limits["api_general"])
            key = f"rate_limit:{endpoint_type}:{identifier}"
            
            current_time = int(time.time())
            window_start = current_time - limits["window"]
            
            # Remove old entries
            self.redis_client.zremrangebyscore(key, 0, window_start)
            
            # Count current requests
            current_count = self.redis_client.zcard(key)
            
            if current_count >= limits["limit"]:
                return False
            
            # Add current request
            self.redis_client.zadd(key, {str(current_time): current_time})
            self.redis_client.expire(key, limits["window"])
            
            return True
            
        except Exception as e:
            logger.error(f"Rate limiting error: {e}")
            return True  # Allow on error
    
    async def get_rate_limit_info(self, identifier: str, endpoint_type: str) -> Dict[str, int]:
        """Get current rate limit status"""
        if not self.redis_client:
            return {"remaining": 1000, "reset_time": int(time.time()) + 3600}
        
        try:
            limits = self.rate_limits.get(endpoint_type, self.rate_limits["api_general"])
            key = f"rate_limit:{endpoint_type}:{identifier}"
            
            current_time = int(time.time())
            window_start = current_time - limits["window"]
            
            # Remove old entries
            self.redis_client.zremrangebyscore(key, 0, window_start)
            
            # Count current requests
            current_count = self.redis_client.zcard(key)
            remaining = max(0, limits["limit"] - current_count)
            reset_time = current_time + limits["window"]
            
            return {
                "remaining": remaining,
                "reset_time": reset_time,
                "limit": limits["limit"],
                "window": limits["window"]
            }
            
        except Exception as e:
            logger.error(f"Rate limit info error: {e}")
            return {"remaining": 1000, "reset_time": int(time.time()) + 3600}

# Global rate limiter instance
advanced_limiter = AdvancedRateLimiter()

async def rate_limit_middleware(request: Request, endpoint_type: str = "api_general"):
    """Rate limiting middleware"""
    identifier = get_user_identifier(request)
    
    if not await advanced_limiter.check_rate_limit(identifier, endpoint_type):
        rate_info = await advanced_limiter.get_rate_limit_info(identifier, endpoint_type)
        
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "retry_after": rate_info["reset_time"] - int(time.time()),
                "limit": rate_info["limit"],
                "window": rate_info["window"]
            }
        )
    
    return True

def rate_limit_dependency(endpoint_type: str = "api_general"):
    """Dependency for rate limiting specific endpoints"""
    async def _rate_limit(request: Request):
        return await rate_limit_middleware(request, endpoint_type)
    return _rate_limit