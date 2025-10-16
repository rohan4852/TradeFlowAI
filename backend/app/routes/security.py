from fastapi import APIRouter, HTTPException, Depends, Body, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, List, Any, Optional
import logging
from ..services.security_agent import security_agent

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

def get_client_info(request: Request) -> Dict[str, str]:
    """Extract client information from request"""
    return {
        'ip_address': request.client.host,
        'user_agent': request.headers.get('user-agent', '')
    }

@router.post("/login")
async def login(
    request: Request,
    credentials: Dict[str, str] = Body(..., description="Login credentials")
):
    """Authenticate user with comprehensive security checks"""
    try:
        client_info = get_client_info(request)
        
        username = credentials.get('username')
        password = credentials.get('password')
        mfa_token = credentials.get('mfa_token')
        
        if not username or not password:
            raise HTTPException(status_code=400, detail="Username and password required")
        
        result = await security_agent.authenticate_user(
            username=username,
            password=password,
            ip_address=client_info['ip_address'],
            user_agent=client_info['user_agent'],
            mfa_token=mfa_token
        )
        
        if result['success']:
            return {
                'success': True,
                'token': result['token'],
                'session_id': result['session_id'],
                'user': result['user'],
                'risk_score': result['risk_score']
            }
        else:
            status_code = 429 if result.get('locked_out') else 401
            if result.get('blocked'):
                status_code = 403
            
            raise HTTPException(
                status_code=status_code,
                detail=result['error']
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Authentication failed")

@router.post("/logout")
async def logout(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Securely logout user"""
    try:
        client_info = get_client_info(request)
        
        # Extract session info from token (simplified)
        # In production, decode JWT token to get session_id and user_id
        session_id = "extracted_from_token"  # Placeholder
        user_id = "extracted_from_token"     # Placeholder
        
        await security_agent.logout_user(
            session_id=session_id,
            user_id=user_id,
            ip_address=client_info['ip_address']
        )
        
        return {
            'success': True,
            'message': 'Logged out successfully'
        }
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(status_code=500, detail="Logout failed")

@router.post("/validate-session")
async def validate_session(
    request: Request,
    session_data: Dict[str, str] = Body(..., description="Session validation data")
):
    """Validate and refresh user session"""
    try:
        client_info = get_client_info(request)
        session_id = session_data.get('session_id')
        
        if not session_id:
            raise HTTPException(status_code=400, detail="Session ID required")
        
        session = await security_agent.validate_session(
            session_id=session_id,
            ip_address=client_info['ip_address']
        )
        
        if session:
            return {
                'success': True,
                'valid': True,
                'session': {
                    'user_id': session.user_id,
                    'expires_at': session.expires_at.isoformat(),
                    'mfa_verified': session.mfa_verified,
                    'permissions': list(session.permissions) if session.permissions else []
                }
            }
        else:
            return {
                'success': True,
                'valid': False,
                'message': 'Session expired or invalid'
            }
            
    except Exception as e:
        logger.error(f"Session validation error: {e}")
        raise HTTPException(status_code=500, detail="Session validation failed")

@router.post("/validate-password")
async def validate_password(
    password_data: Dict[str, str] = Body(..., description="Password validation data")
):
    """Validate password strength"""
    try:
        password = password_data.get('password')
        
        if not password:
            raise HTTPException(status_code=400, detail="Password required")
        
        validation = security_agent.validate_password_strength(password)
        
        return {
            'success': True,
            'validation': validation
        }
        
    except Exception as e:
        logger.error(f"Password validation error: {e}")
        raise HTTPException(status_code=500, detail="Password validation failed")

@router.get("/security-metrics")
async def get_security_metrics(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get security metrics and statistics (admin only)"""
    try:
        # In production, verify admin permissions from token
        
        metrics = await security_agent.get_security_metrics()
        
        return {
            'success': True,
            'metrics': metrics
        }
        
    except Exception as e:
        logger.error(f"Error getting security metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get security metrics")

@router.post("/encrypt-data")
async def encrypt_sensitive_data(
    data: Dict[str, str] = Body(..., description="Data to encrypt"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Encrypt sensitive data"""
    try:
        sensitive_data = data.get('data')
        
        if not sensitive_data:
            raise HTTPException(status_code=400, detail="Data required")
        
        encrypted_data = security_agent.encrypt_sensitive_data(sensitive_data)
        
        return {
            'success': True,
            'encrypted_data': encrypted_data
        }
        
    except Exception as e:
        logger.error(f"Encryption error: {e}")
        raise HTTPException(status_code=500, detail="Encryption failed")

@router.post("/decrypt-data")
async def decrypt_sensitive_data(
    data: Dict[str, str] = Body(..., description="Data to decrypt"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Decrypt sensitive data"""
    try:
        encrypted_data = data.get('encrypted_data')
        
        if not encrypted_data:
            raise HTTPException(status_code=400, detail="Encrypted data required")
        
        decrypted_data = security_agent.decrypt_sensitive_data(encrypted_data)
        
        return {
            'success': True,
            'decrypted_data': decrypted_data
        }
        
    except Exception as e:
        logger.error(f"Decryption error: {e}")
        raise HTTPException(status_code=500, detail="Decryption failed")

@router.get("/audit-log")
async def get_audit_log(
    limit: int = 100,
    event_type: Optional[str] = None,
    user_id: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get security audit log (admin only)"""
    try:
        # In production, verify admin permissions from token
        
        # Filter audit log
        filtered_events = security_agent.audit_log
        
        if event_type:
            filtered_events = [e for e in filtered_events if e.event_type == event_type]
        
        if user_id:
            filtered_events = [e for e in filtered_events if e.user_id == user_id]
        
        # Limit results
        filtered_events = filtered_events[-limit:]
        
        # Convert to dict for JSON serialization
        events = []
        for event in filtered_events:
            events.append({
                'event_type': event.event_type,
                'user_id': event.user_id,
                'ip_address': event.ip_address,
                'timestamp': event.timestamp.isoformat(),
                'details': event.details,
                'risk_score': event.risk_score,
                'blocked': event.blocked
            })
        
        return {
            'success': True,
            'events': events,
            'total_events': len(events),
            'filters': {
                'event_type': event_type,
                'user_id': user_id,
                'limit': limit
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting audit log: {e}")
        raise HTTPException(status_code=500, detail="Failed to get audit log")

@router.post("/security-settings")
async def update_security_settings(
    settings: Dict[str, Any] = Body(..., description="Security settings to update"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update security settings (admin only)"""
    try:
        # In production, verify admin permissions from token
        
        # Update security rules
        for key, value in settings.items():
            if key in security_agent.security_rules:
                security_agent.security_rules[key] = value
                logger.info(f"Updated security setting {key}: {value}")
        
        return {
            'success': True,
            'message': 'Security settings updated successfully',
            'updated_settings': settings
        }
        
    except Exception as e:
        logger.error(f"Error updating security settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to update security settings")

@router.get("/blocked-ips")
async def get_blocked_ips(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get list of blocked IP addresses (admin only)"""
    try:
        # In production, verify admin permissions from token
        
        return {
            'success': True,
            'blocked_ips': list(security_agent.blocked_ips),
            'total_blocked': len(security_agent.blocked_ips)
        }
        
    except Exception as e:
        logger.error(f"Error getting blocked IPs: {e}")
        raise HTTPException(status_code=500, detail="Failed to get blocked IPs")

@router.post("/unblock-ip")
async def unblock_ip(
    ip_data: Dict[str, str] = Body(..., description="IP address to unblock"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Unblock an IP address (admin only)"""
    try:
        # In production, verify admin permissions from token
        
        ip_address = ip_data.get('ip_address')
        
        if not ip_address:
            raise HTTPException(status_code=400, detail="IP address required")
        
        if ip_address in security_agent.blocked_ips:
            security_agent.blocked_ips.remove(ip_address)
            logger.info(f"Unblocked IP address: {ip_address}")
            
            return {
                'success': True,
                'message': f'IP address {ip_address} unblocked successfully'
            }
        else:
            return {
                'success': False,
                'message': f'IP address {ip_address} was not blocked'
            }
            
    except Exception as e:
        logger.error(f"Error unblocking IP: {e}")
        raise HTTPException(status_code=500, detail="Failed to unblock IP")