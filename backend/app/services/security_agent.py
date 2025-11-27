import asyncio
import hashlib
import hmac
import jwt
import secrets
import logging
from typing import Dict, List, Any, Optional, Set
from datetime import datetime, timedelta
from enum import Enum
import bcrypt
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import json
import re
from dataclasses import dataclass, asdict
import ipaddress
# [Fix] Import UserRepository
from ..database.repositories import UserRepository

logger = logging.getLogger(__name__)
REDIS_AVAILABLE = False
aioredis = None

class SecurityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class UserRole(str, Enum):
    VIEWER = "viewer"
    TRADER = "trader"
    ANALYST = "analyst"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class AuditEventType(str, Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    TRADE_EXECUTION = "trade_execution"
    DATA_ACCESS = "data_access"
    SETTINGS_CHANGE = "settings_change"
    SECURITY_VIOLATION = "security_violation"
    API_ACCESS = "api_access"

@dataclass
class SecurityEvent:
    event_type: AuditEventType
    user_id: str
    ip_address: str
    user_agent: str
    timestamp: datetime
    details: Dict[str, Any]
    risk_score: float
    blocked: bool = False

@dataclass
class UserSession:
    session_id: str
    user_id: str
    ip_address: str
    user_agent: str
    created_at: datetime
    last_activity: datetime
    expires_at: datetime
    mfa_verified: bool = False
    permissions: Set[str] = None

class AdvancedSecurityAgent:
    """Enterprise-grade security agent with comprehensive protection"""
    
    def __init__(self):
        self.redis_client = None
        self.encryption_key = None
        self.jwt_secret = secrets.token_urlsafe(32)
        self.failed_attempts: Dict[str, List[datetime]] = {}
        self.blocked_ips: Set[str] = set()
        self.security_rules = self._load_security_rules()
        self.audit_log: List[SecurityEvent] = []
        # In-memory session storage as fallback
        self.memory_sessions: Dict[str, Dict[str, Any]] = {}
        
    async def initialize(self):
        """Initialize security infrastructure"""
        global REDIS_AVAILABLE, aioredis
        
        try:
            # Try to import aioredis
            try:
                import aioredis as redis_module
                aioredis = redis_module
                REDIS_AVAILABLE = True
                
                # Initialize Redis for session management
                self.redis_client = aioredis.from_url("redis://localhost:6379")
                await self.redis_client.ping()
                logger.info("Redis connected successfully")
                
            except (ImportError, Exception) as redis_error:
                logger.warning(f"Redis not available ({redis_error}), using in-memory session storage")
                REDIS_AVAILABLE = False
                self.redis_client = None
            
            # Initialize encryption
            self.encryption_key = self._generate_encryption_key()
            
            logger.info("Security agent initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize security agent: {e}")
            # Use in-memory fallback
            self.redis_client = None
    
    def _generate_encryption_key(self) -> Fernet:
        """Generate encryption key for sensitive data"""
        password = b"ai_trading_platform_secret_key"  # In production, use environment variable
        salt = b"stable_salt_for_consistency"  # In production, use random salt per encryption
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password))
        return Fernet(key)
    
    def _load_security_rules(self) -> Dict[str, Any]:
        """Load security rules and thresholds"""
        return {
            'max_login_attempts': 5,
            'lockout_duration': 900,  # 15 minutes
            'session_timeout': 3600,  # 1 hour
            'password_min_length': 12,
            'password_complexity': True,
            'mfa_required_roles': [UserRole.ADMIN, UserRole.SUPER_ADMIN],
            'api_rate_limits': {
                'default': 1000,  # requests per hour
                'trading': 100,   # trading requests per hour
                'data': 5000      # data requests per hour
            },
            'suspicious_activity_threshold': 0.7,
            'geo_restrictions': [],  # List of allowed countries
            'allowed_ip_ranges': []  # List of allowed IP ranges
        }
    
    async def authenticate_user(self, 
                              username: str, 
                              password: str, 
                              ip_address: str, 
                              user_agent: str,
                              mfa_token: Optional[str] = None) -> Dict[str, Any]:
        """Authenticate user with comprehensive security checks"""
        try:
            # Check if IP is blocked
            if self._is_ip_blocked(ip_address):
                await self._log_security_event(
                    AuditEventType.SECURITY_VIOLATION,
                    username,
                    ip_address,
                    user_agent,
                    {'reason': 'blocked_ip_attempt'},
                    risk_score=1.0,
                    blocked=True
                )
                return {'success': False, 'error': 'Access denied', 'blocked': True}
            
            # Check failed login attempts
            if self._check_failed_attempts(username, ip_address):
                await self._log_security_event(
                    AuditEventType.SECURITY_VIOLATION,
                    username,
                    ip_address,
                    user_agent,
                    {'reason': 'too_many_failed_attempts'},
                    risk_score=0.8,
                    blocked=True
                )
                return {'success': False, 'error': 'Too many failed attempts', 'locked_out': True}
            
            # Validate credentials
            user_data = await self._validate_credentials(username, password)
            if not user_data:
                self._record_failed_attempt(username, ip_address)
                await self._log_security_event(
                    AuditEventType.LOGIN,
                    username,
                    ip_address,
                    user_agent,
                    {'success': False, 'reason': 'invalid_credentials'},
                    risk_score=0.5
                )
                return {'success': False, 'error': 'Invalid credentials'}
            
            # Check MFA if required
            if user_data.get('role') in self.security_rules['mfa_required_roles']:
                if not mfa_token or not self._verify_mfa_token(user_data['user_id'], mfa_token):
                    return {'success': False, 'error': 'MFA required', 'mfa_required': True}
            
            # Perform risk assessment
            risk_score = await self._assess_login_risk(user_data, ip_address, user_agent)
            
            # Create session
            session = await self._create_session(user_data, ip_address, user_agent, mfa_verified=bool(mfa_token))
            
            # Generate JWT token
            token = self._generate_jwt_token(user_data, session.session_id)
            
            # Clear failed attempts
            self._clear_failed_attempts(username, ip_address)
            
            # Log successful login
            await self._log_security_event(
                AuditEventType.LOGIN,
                user_data['user_id'],
                ip_address,
                user_agent,
                {'success': True, 'session_id': session.session_id},
                risk_score=risk_score
            )
            
            return {
                'success': True,
                'token': token,
                'session_id': session.session_id,
                'user': {
                    'id': user_data['user_id'],
                    'username': user_data['username'],
                    'role': user_data.get('role', 'trader'),
                    'permissions': user_data.get('permissions', [])
                },
                'risk_score': risk_score
            }
            
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return {'success': False, 'error': 'Authentication failed'}
    
    async def _validate_credentials(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """Validate user credentials against database"""
        try:
            # Attempt to find user by email (used as username)
            user = await UserRepository.get_user_by_email(username)
            
            if not user:
                # Fallback: could add get_user_by_username here if needed
                return None
                
            # Verify password
            # Note: Ensure 'hashed_password' exists and is not None (OAuth users might not have one)
            if user.get('hashed_password'):
                stored_hash = user['hashed_password']
                if isinstance(stored_hash, str):
                    stored_hash = stored_hash.encode('utf-8')
                
                if bcrypt.checkpw(password.encode('utf-8'), stored_hash):
                    # Construct the user data object expected by authenticate_user
                    return {
                        'user_id': str(user['id']),
                        'username': user['username'],
                        'email': user['email'],
                        'role': UserRole.TRADER, # Defaulting to TRADER as role column is missing in standard User model
                        'permissions': {'read', 'write', 'trade'} # Default permissions
                    }
            
            return None
        except Exception as e:
            logger.error(f"Credential validation error: {e}")
            return None
    
    def _verify_mfa_token(self, user_id: str, token: str) -> bool:
        """Verify MFA token (placeholder implementation)"""
        # In production, integrate with TOTP/SMS/hardware token verification
        return token == "123456"
    
    async def _assess_login_risk(self, user_data: Dict[str, Any], ip_address: str, user_agent: str) -> float:
        """Assess risk score for login attempt"""
        risk_score = 0.0
        
        # Check for unusual IP address
        if not self._is_known_ip(user_data['user_id'], ip_address):
            risk_score += 0.3
        
        # Check for unusual user agent
        if not self._is_known_user_agent(user_data['user_id'], user_agent):
            risk_score += 0.2
        
        # Check time-based patterns
        if self._is_unusual_login_time():
            risk_score += 0.1
        
        return min(risk_score, 1.0)
    
    def _is_known_ip(self, user_id: str, ip_address: str) -> bool:
        """Check if IP address is known for this user"""
        return True  # Placeholder
    
    def _is_known_user_agent(self, user_id: str, user_agent: str) -> bool:
        """Check if user agent is known for this user"""
        return True  # Placeholder
    
    def _is_unusual_login_time(self) -> bool:
        """Check if login time is unusual"""
        current_hour = datetime.now().hour
        return current_hour < 6 or current_hour > 22
    
    def _is_suspicious_location(self, ip_address: str) -> bool:
        """Check if IP address is from suspicious location"""
        return False  # Placeholder
    
    async def _create_session(self, 
                            user_data: Dict[str, Any], 
                            ip_address: str, 
                            user_agent: str,
                            mfa_verified: bool = False) -> UserSession:
        """Create secure user session"""
        session_id = secrets.token_urlsafe(32)
        now = datetime.now()
        expires_at = now + timedelta(seconds=self.security_rules['session_timeout'])
        
        session = UserSession(
            session_id=session_id,
            user_id=user_data['user_id'],
            ip_address=ip_address,
            user_agent=user_agent,
            created_at=now,
            last_activity=now,
            expires_at=expires_at,
            mfa_verified=mfa_verified,
            permissions=user_data.get('permissions')
        )
        
        # Store session in Redis or memory
        if self.redis_client:
            await self.redis_client.setex(
                f"session:{session_id}",
                self.security_rules['session_timeout'],
                json.dumps(asdict(session), default=str)
            )
        else:
            # Store in memory as fallback
            self.memory_sessions[session_id] = {
                'data': asdict(session),
                'expires_at': expires_at
            }
        
        return session
    
    def _generate_jwt_token(self, user_data: Dict[str, Any], session_id: str) -> str:
        """Generate JWT token for API access"""
        payload = {
            'user_id': user_data['user_id'],
            'username': user_data['username'],
            'role': user_data.get('role', 'trader'),
            'session_id': session_id,
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(seconds=self.security_rules['session_timeout'])
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm='HS256')
    
    async def validate_session(self, session_id: str, ip_address: str) -> Optional[UserSession]:
        """Validate and refresh user session"""
        try:
            session_data = None
            
            if self.redis_client:
                session_data = await self.redis_client.get(f"session:{session_id}")
                if session_data:
                    session_dict = json.loads(session_data)
                else:
                    return None
            else:
                # Use memory storage
                session_info = self.memory_sessions.get(session_id)
                if session_info:
                    # Check if expired
                    if datetime.now() > session_info['expires_at']:
                        del self.memory_sessions[session_id]
                        return None
                    session_dict = session_info['data']
                else:
                    return None
            
            # Convert datetime strings back to datetime objects
            for key in ['created_at', 'last_activity', 'expires_at']:
                if isinstance(session_dict.get(key), str):
                    session_dict[key] = datetime.fromisoformat(session_dict[key])
            
            session = UserSession(**session_dict)
            
            # Check if session is expired
            if datetime.now() > session.expires_at:
                if self.redis_client:
                    await self.redis_client.delete(f"session:{session_id}")
                else:
                    self.memory_sessions.pop(session_id, None)
                return None
            
            # Update last activity
            session.last_activity = datetime.now()
            
            if self.redis_client:
                await self.redis_client.setex(
                    f"session:{session_id}",
                    self.security_rules['session_timeout'],
                    json.dumps(asdict(session), default=str)
                )
            else:
                self.memory_sessions[session_id] = {
                    'data': asdict(session),
                    'expires_at': session.expires_at
                }
            
            return session
            
        except Exception as e:
            logger.error(f"Session validation error: {e}")
            return None
    
    def _is_ip_blocked(self, ip_address: str) -> bool:
        """Check if IP address is blocked"""
        return ip_address in self.blocked_ips
    
    def _check_failed_attempts(self, username: str, ip_address: str) -> bool:
        """Check if user/IP has too many failed attempts"""
        now = datetime.now()
        cutoff = now - timedelta(seconds=self.security_rules['lockout_duration'])
        
        user_attempts = self.failed_attempts.get(f"user:{username}", [])
        recent_user_attempts = [attempt for attempt in user_attempts if attempt > cutoff]
        
        ip_attempts = self.failed_attempts.get(f"ip:{ip_address}", [])
        recent_ip_attempts = [attempt for attempt in ip_attempts if attempt > cutoff]
        
        return (len(recent_user_attempts) >= self.security_rules['max_login_attempts'] or
                len(recent_ip_attempts) >= self.security_rules['max_login_attempts'])
    
    def _record_failed_attempt(self, username: str, ip_address: str):
        """Record failed login attempt"""
        now = datetime.now()
        if f"user:{username}" not in self.failed_attempts:
            self.failed_attempts[f"user:{username}"] = []
        self.failed_attempts[f"user:{username}"].append(now)
        if f"ip:{ip_address}" not in self.failed_attempts:
            self.failed_attempts[f"ip:{ip_address}"] = []
        self.failed_attempts[f"ip:{ip_address}"].append(now)
        self._clean_old_attempts()
    
    def _clear_failed_attempts(self, username: str, ip_address: str):
        """Clear failed attempts after successful login"""
        self.failed_attempts.pop(f"user:{username}", None)
        self.failed_attempts.pop(f"ip:{ip_address}", None)
    
    def _clean_old_attempts(self):
        """Clean old failed attempts"""
        cutoff = datetime.now() - timedelta(seconds=self.security_rules['lockout_duration'])
        for key in list(self.failed_attempts.keys()):
            self.failed_attempts[key] = [t for t in self.failed_attempts[key] if t > cutoff]
            if not self.failed_attempts[key]:
                del self.failed_attempts[key]
    
    async def _log_security_event(self, event_type, user_id, ip_address, user_agent, details, risk_score, blocked=False):
        """Log security event for audit trail"""
        event = SecurityEvent(
            event_type=event_type,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            timestamp=datetime.now(),
            details=details,
            risk_score=risk_score,
            blocked=blocked
        )
        self.audit_log.append(event)
        logger.info(f"Security event: {event_type} - User: {user_id} - Risk: {risk_score:.2f}")
        if risk_score >= self.security_rules['suspicious_activity_threshold']:
            await self._trigger_security_alert(event)
    
    async def _trigger_security_alert(self, event: SecurityEvent):
        """Trigger security alert for suspicious activity"""
        logger.warning(f"SECURITY ALERT: User {event.user_id} from IP {event.ip_address}, Risk: {event.risk_score}")
        if event.risk_score >= 0.9:
            self.blocked_ips.add(event.ip_address)
            logger.critical(f"IP {event.ip_address} automatically blocked due to high risk score")
    
    def encrypt_sensitive_data(self, data: str) -> str:
        if self.encryption_key:
            return self.encryption_key.encrypt(data.encode()).decode()
        return data
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        if self.encryption_key:
            return self.encryption_key.decrypt(encrypted_data.encode()).decode()
        return encrypted_data
    
    def validate_password_strength(self, password: str) -> Dict[str, Any]:
        issues = []
        score = 0
        if len(password) < self.security_rules['password_min_length']:
            issues.append(f"Password must be at least {self.security_rules['password_min_length']} characters")
        else:
            score += 1
        if self.security_rules['password_complexity']:
            if not re.search(r'[A-Z]', password): issues.append("Password must contain uppercase letters")
            else: score += 1
            if not re.search(r'[a-z]', password): issues.append("Password must contain lowercase letters")
            else: score += 1
            if not re.search(r'\d', password): issues.append("Password must contain numbers")
            else: score += 1
            if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password): issues.append("Password must contain special characters")
            else: score += 1
        
        strength = "weak"
        if score >= 4: strength = "strong"
        elif score >= 2: strength = "medium"
        return {'valid': len(issues) == 0, 'strength': strength, 'score': score, 'issues': issues}
    
    async def get_security_metrics(self) -> Dict[str, Any]:
        now = datetime.now()
        last_24h = now - timedelta(hours=24)
        recent_events = [e for e in self.audit_log if e.timestamp > last_24h]
        return {
            'total_events_24h': len(recent_events),
            'high_risk_events_24h': len([e for e in recent_events if e.risk_score >= 0.7]),
            'blocked_events_24h': len([e for e in recent_events if e.blocked]),
            'unique_users_24h': len(set(e.user_id for e in recent_events)),
            'unique_ips_24h': len(set(e.ip_address for e in recent_events)),
            'blocked_ips_count': len(self.blocked_ips),
            'failed_attempts_count': sum(len(a) for a in self.failed_attempts.values()),
            'event_types_24h': {et: len([e for e in recent_events if e.event_type == et]) for et in AuditEventType}
        }
    
    async def logout_user(self, session_id: str, user_id: str, ip_address: str):
        try:
            if self.redis_client:
                await self.redis_client.delete(f"session:{session_id}")
            else:
                self.memory_sessions.pop(session_id, None)
            await self._log_security_event(AuditEventType.LOGOUT, user_id, ip_address, "", {'session_id': session_id}, 0.0)
            logger.info(f"User {user_id} logged out successfully")
        except Exception as e:
            logger.error(f"Logout error: {e}")

# Global instance
security_agent = AdvancedSecurityAgent()