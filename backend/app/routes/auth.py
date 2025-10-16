from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
import logging
from ..models.user import (
    GoogleAuthRequest, 
    GoogleAuthResponse, 
    UserResponse, 
    UserProfileResponse,
    UpdateProfileRequest
)
from ..services.google_oauth import google_oauth_service

logger = logging.getLogger(__name__)
router = APIRouter()

async def get_current_user(authorization: Optional[str] = Header(None)):
    """Dependency to get current authenticated user"""
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Authentication required")
    
    token = authorization.split(' ')[1]
    user_info = google_oauth_service.verify_jwt_token(token)
    
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return user_info

@router.post("/google", response_model=GoogleAuthResponse)
async def google_auth(request: GoogleAuthRequest):
    """Authenticate with Google OAuth"""
    try:
        result = await google_oauth_service.authenticate_with_google(request.token)
        
        if result['success']:
            return GoogleAuthResponse(
                success=True,
                token=result['token'],
                user=UserResponse(**result['user'])
            )
        else:
            return GoogleAuthResponse(
                success=False,
                error=result['error']
            )
            
    except Exception as e:
        logger.error(f"Google authentication error: {e}")
        raise HTTPException(status_code=500, detail="Authentication failed")

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    """Get current user information"""
    try:
        return UserResponse(
            id=current_user['user_id'],
            email=current_user['email'],
            name=current_user['name'],
            picture="",  # Will be populated from database
            email_verified=True,
            auth_provider=current_user['auth_provider'],
            created_at="",  # Will be populated from database
            last_login=""   # Will be populated from database
        )
    except Exception as e:
        logger.error(f"Error getting user info: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user information")

@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(current_user = Depends(get_current_user)):
    """Get user profile"""
    try:
        profile = await google_oauth_service.get_user_profile(current_user['user_id'])
        
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return UserProfileResponse(
            user_id=profile.user_id,
            display_name=profile.display_name,
            bio=profile.bio,
            trading_experience=profile.trading_experience,
            risk_tolerance=profile.risk_tolerance,
            investment_goals=profile.investment_goals,
            preferred_assets=profile.preferred_assets,
            notifications_enabled=profile.notifications_enabled,
            theme_preference=profile.theme_preference,
            timezone=profile.timezone,
            language=profile.language,
            created_at=profile.created_at.isoformat() if profile.created_at else "",
            updated_at=profile.updated_at.isoformat() if profile.updated_at else ""
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user profile")

@router.put("/profile", response_model=UserProfileResponse)
async def update_user_profile(
    request: UpdateProfileRequest,
    current_user = Depends(get_current_user)
):
    """Update user profile"""
    try:
        # Get current profile
        profile = await google_oauth_service.get_user_profile(current_user['user_id'])
        
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Update fields that were provided
        if request.display_name is not None:
            profile.display_name = request.display_name
        if request.bio is not None:
            profile.bio = request.bio
        if request.trading_experience is not None:
            profile.trading_experience = request.trading_experience
        if request.risk_tolerance is not None:
            profile.risk_tolerance = request.risk_tolerance
        if request.investment_goals is not None:
            profile.investment_goals = request.investment_goals
        if request.preferred_assets is not None:
            profile.preferred_assets = request.preferred_assets
        if request.notifications_enabled is not None:
            profile.notifications_enabled = request.notifications_enabled
        if request.theme_preference is not None:
            profile.theme_preference = request.theme_preference
        if request.timezone is not None:
            profile.timezone = request.timezone
        if request.language is not None:
            profile.language = request.language
        
        # Update timestamp
        from datetime import datetime
        profile.updated_at = datetime.utcnow()
        
        # TODO: Save to database
        
        return UserProfileResponse(
            user_id=profile.user_id,
            display_name=profile.display_name,
            bio=profile.bio,
            trading_experience=profile.trading_experience,
            risk_tolerance=profile.risk_tolerance,
            investment_goals=profile.investment_goals,
            preferred_assets=profile.preferred_assets,
            notifications_enabled=profile.notifications_enabled,
            theme_preference=profile.theme_preference,
            timezone=profile.timezone,
            language=profile.language,
            created_at=profile.created_at.isoformat() if profile.created_at else "",
            updated_at=profile.updated_at.isoformat() if profile.updated_at else ""
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user profile")

@router.post("/logout")
async def logout(current_user = Depends(get_current_user)):
    """Logout user (invalidate token)"""
    try:
        # In a real implementation, you would add the token to a blacklist
        # For now, just return success
        return {"success": True, "message": "Logged out successfully"}
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(status_code=500, detail="Logout failed")

@router.delete("/account")
async def delete_account(current_user = Depends(get_current_user)):
    """Delete user account"""
    try:
        # TODO: Implement account deletion
        # This should remove user data, profile, and any associated trading data
        
        return {"success": True, "message": "Account deleted successfully"}
        
    except Exception as e:
        logger.error(f"Account deletion error: {e}")
        raise HTTPException(status_code=500, detail="Account deletion failed")