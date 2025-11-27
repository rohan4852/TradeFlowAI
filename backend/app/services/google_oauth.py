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
from ..database.repositories import UserRepository, UserProfileRepository

logger = logging.getLogger(__name__)

class GoogleOAuthService:
    """Google OAuth authentication and user management service"""
    
    def __init__(self):
        # Prefer environment variables, fall back to loaded settings
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
            await UserRepository.update_last_login(str(user.id))
            
            return {
                'success': True,
                'token': jwt_token,
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'name': user.name,
                    'picture': user.picture,
                    'email_verified': user.email_verified,
                    'created_at': user.created_at.isoformat() if hasattr(user, 'created_at') and user.created_at else datetime.now().isoformat(),
                    'last_login': datetime.utcnow().isoformat()
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
            user_data = await self.find_user_by_google_id(google_user_info['google_id'])
            
            if not user_data:
                user_data = await self.find_user_by_email(google_user_info['email'])
            
            if user_data:
                # Update existing user with latest Google info if needed
                updates = {
                    "google_id": google_user_info['google_id'],
                    "name": google_user_info['name'],
                    "picture": google_user_info['picture'],
                    "email_verified": google_user_info['email_verified']
                }
                await UserRepository.update_user(str(user_data['id']), updates)
                # Update user_data object to reflect changes
                user_data.update(updates)
                # Return as User object
                return self._dict_to_user(user_data)
            else:
                # Create new user
                user_dict = {
                    "google_id": google_user_info['google_id'],
                    "email": google_user_info['email'],
                    "name": google_user_info['name'],
                    "given_name": google_user_info.get('given_name'),
                    "family_name": google_user_info.get('family_name'),
                    "picture": google_user_info['picture'],
                    "email_verified": google_user_info['email_verified'],
                    "locale": google_user_info.get('locale'),
                    "auth_provider": 'google'
                }
                
                # Save new user to DB
                created_user_data = await UserRepository.create_user(user_dict)
                if not created_user_data:
                    raise Exception("Failed to create user in database")
                
                user_obj = self._dict_to_user(created_user_data)
                
                # Create user profile
                await self.create_user_profile(user_obj)
                
                return user_obj
            
        except Exception as e:
            logger.error(f"Error getting/creating user: {e}")
            raise
    
    def _dict_to_user(self, data: Dict[str, Any]) -> User:
        """Helper to convert DB dict to User model (Pydantic/DataClass)"""
        # Ensure compatible field types for the User model constructor
        return User(
            id=str(data['id']),
            email=data['email'],
            name=data.get('name') or data.get('username'), # Fallback
            google_id=data.get('google_id'),
            picture=data.get('picture') or data.get('avatar_url'),
            email_verified=data.get('email_verified', False),
            auth_provider=data.get('auth_provider', 'google'),
            created_at=data.get('created_at', datetime.utcnow()),
            updated_at=data.get('updated_at', datetime.utcnow())
        )

    def generate_jwt_token(self, user: User) -> str:
        """Generate JWT token for authenticated user"""
        payload = {
            'user_id': str(user.id),
            'email': user.email,
            'name': user.name,
            'auth_provider': getattr(user, 'auth_provider', 'google'),
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
    
    async def find_user_by_google_id(self, google_id: str) -> Optional[Dict[str, Any]]:
        """Find user by Google ID"""
        return await UserRepository.get_user_by_google_id(google_id)
    
    async def find_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Find user by email"""
        return await UserRepository.get_user_by_email(email)
    
    async def create_user_profile(self, user: User) -> Any:
        """Create initial user profile"""
        profile_data = {
            "display_name": user.name,
            "trading_experience": "beginner",
            "risk_tolerance": "moderate",
            "notifications_enabled": True,
            "theme_preference": "dark"
        }
        
        profile = await UserProfileRepository.create_profile(str(user.id), profile_data)
        logger.info(f"Created profile for user: {user.email}")
        return profile
    
    async def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile by user ID"""
        data = await UserProfileRepository.get_profile_by_user_id(user_id)
        if data:
            # Convert dict to UserProfile object
            # Handle potential field mismatches
            return UserProfile(
                user_id=data['user_id'],
                display_name=data.get('display_name', ''),
                bio=data.get('bio', ''),
                trading_experience=data.get('trading_experience', 'beginner'),
                risk_tolerance=data.get('risk_tolerance', 'moderate'),
                investment_goals=data.get('investment_goals', []),
                preferred_assets=data.get('preferred_assets', []),
                notifications_enabled=data.get('notifications_enabled', True),
                theme_preference=data.get('theme_preference', 'dark'),
                timezone=data.get('timezone', 'UTC'),
                language=data.get('language', 'en'),
                created_at=data['created_at'],
                updated_at=data['updated_at']
            )
        return None

# Global instance
google_oauth_service = GoogleOAuthService()