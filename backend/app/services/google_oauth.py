import os
import json
import logging
from typing import Dict, Optional, Any
from datetime import datetime, timedelta
import httpx
from google.oauth2 import id_token
from google.auth.transport import requests
from ..models.user import User, UserProfile
import jwt
from ..config import settings

logger = logging.getLogger(__name__)


class GoogleOAuthService:
    """Google OAuth authentication and user management service"""
    
    def __init__(self):
        # Prefer environment variables, fall back to loaded settings (pydantic Settings loads .env)
        self.google_client_id = os.getenv('GOOGLE_CLIENT_ID') or getattr(settings, 'GOOGLE_CLIENT_ID', None)
        self.google_client_secret = os.getenv('GOOGLE_CLIENT_SECRET') or getattr(settings, 'GOOGLE_CLIENT_SECRET', None)
        self.jwt_secret = os.getenv('JWT_SECRET', 'your-secret-key')
        self.jwt_algorithm = 'HS256'
        self.token_expiry_hours = 24
        
        if not self.google_client_id:
            logger.warning("GOOGLE_CLIENT_ID not set - Google OAuth will not work")
    
    async def verify_google_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify Google ID token and extract user information"""
        try:
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                self.google_client_id
            )
            
            # Verify the issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')
            
            # Extract user information
            user_info = {
                'google_id': idinfo['sub'],
                'email': idinfo['email'],
                'name': idinfo['name'],
                'given_name': idinfo.get('given_name', ''),
                'family_name': idinfo.get('family_name', ''),
                'picture': idinfo.get('picture', ''),
                'email_verified': idinfo.get('email_verified', False),
                'locale': idinfo.get('locale', 'en')
            }
            
            return user_info
            
        except ValueError as e:
            logger.error(f"Invalid Google token: {e}")
            return None
        except Exception as e:
            logger.error(f"Error verifying Google token: {e}")
            return None
    
    async def authenticate_with_google(self, google_token: str) -> Dict[str, Any]:
        """Authenticate user with Google and return JWT token"""
        try:
            # Verify Google token
            google_user_info = await self.verify_google_token(google_token)
            if not google_user_info:
                return {
                    'success': False,
                    'error': 'Invalid Google token'
                }
            
            # Check if user exists or create new user
            user = await self.get_or_create_user(google_user_info)
            
            # Generate JWT token
            jwt_token = self.generate_jwt_token(user)
            
            # Update last login
            user.last_login = datetime.utcnow()
            await self.update_user(user)
            
            return {
                'success': True,
                'token': jwt_token,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'picture': user.picture,
                    'email_verified': user.email_verified,
                    'created_at': user.created_at.isoformat(),
                    'last_login': user.last_login.isoformat() if user.last_login else None
                }
            }
            
        except Exception as e:
            logger.error(f"Google authentication error: {e}")
            return {
                'success': False,
                'error': 'Authentication failed'
            }
    
    async def get_or_create_user(self, google_user_info: Dict[str, Any]) -> User:
        """Get existing user or create new user from Google info"""
        try:
            # Try to find existing user by Google ID or email
            user = await self.find_user_by_google_id(google_user_info['google_id'])
            
            if not user:
                user = await self.find_user_by_email(google_user_info['email'])
            
            if user:
                # Update existing user with latest Google info
                user.google_id = google_user_info['google_id']
                user.name = google_user_info['name']
                user.picture = google_user_info['picture']
                user.email_verified = google_user_info['email_verified']
                user.updated_at = datetime.utcnow()
            else:
                # Create new user
                user = User(
                    google_id=google_user_info['google_id'],
                    email=google_user_info['email'],
                    name=google_user_info['name'],
                    given_name=google_user_info['given_name'],
                    family_name=google_user_info['family_name'],
                    picture=google_user_info['picture'],
                    email_verified=google_user_info['email_verified'],
                    locale=google_user_info['locale'],
                    auth_provider='google',
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                
                # Save new user
                await self.save_user(user)
                
                # Create user profile
                await self.create_user_profile(user)
            
            return user
            
        except Exception as e:
            logger.error(f"Error getting/creating user: {e}")
            raise
    
    def generate_jwt_token(self, user: User) -> str:
        """Generate JWT token for authenticated user"""
        payload = {
            'user_id': user.id,
            'email': user.email,
            'name': user.name,
            'auth_provider': user.auth_provider,
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(hours=self.token_expiry_hours)
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
    
    def verify_jwt_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token and return user info"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid JWT token: {e}")
            return None
    
    async def find_user_by_google_id(self, google_id: str) -> Optional[User]:
        """Find user by Google ID (placeholder - implement with your database)"""
        # TODO: Implement database query
        # For now, return None to create new users
        return None
    
    async def find_user_by_email(self, email: str) -> Optional[User]:
        """Find user by email (placeholder - implement with your database)"""
        # TODO: Implement database query
        return None
    
    async def save_user(self, user: User) -> User:
        """Save user to database (placeholder - implement with your database)"""
        # TODO: Implement database save
        # For now, assign a random ID
        import uuid
        user.id = str(uuid.uuid4())
        logger.info(f"Created new user: {user.email}")
        return user
    
    async def update_user(self, user: User) -> User:
        """Update user in database (placeholder - implement with your database)"""
        # TODO: Implement database update
        logger.info(f"Updated user: {user.email}")
        return user
    
    async def create_user_profile(self, user: User) -> UserProfile:
        """Create initial user profile"""
        profile = UserProfile(
            user_id=user.id,
            display_name=user.name,
            bio="",
            trading_experience="beginner",
            risk_tolerance="moderate",
            investment_goals=[],
            preferred_assets=[],
            notifications_enabled=True,
            theme_preference="dark",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # TODO: Save profile to database
        logger.info(f"Created profile for user: {user.email}")
        return profile
    
    async def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile by user ID"""
        # TODO: Implement database query
        # For now, return a basic profile
        return UserProfile(
            user_id=user_id,
            display_name="User",
            bio="Welcome to TradeFlowAI",
            trading_experience="beginner",
            risk_tolerance="moderate",
            investment_goals=["long_term_growth"],
            preferred_assets=["stocks", "crypto"],
            notifications_enabled=True,
            theme_preference="dark",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

# Global instance
google_oauth_service = GoogleOAuthService()