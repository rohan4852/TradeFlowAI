"""
Database Repositories
Data access layer for PostgreSQL operations
"""

import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from .models import User, UserProfile, TradingAccount, Order, Position, Watchlist, Notification, PriceAlert, SessionToken
from .connection import get_db_session, database
import hashlib
import uuid

logger = logging.getLogger(__name__)

class UserRepository:
    """User data access operations"""
    
    @staticmethod
    async def create_user(user_data: Dict[str, Any]) -> Optional[User]:
        """Create a new user"""
        try:
            query = """
                INSERT INTO users (id, google_id, email, name, given_name, family_name, 
                                 picture, email_verified, locale, auth_provider, created_at, updated_at)
                VALUES (:id, :google_id, :email, :name, :given_name, :family_name, 
                        :picture, :email_verified, :locale, :auth_provider, :created_at, :updated_at)
                RETURNING *
            """
            
            user_id = str(uuid.uuid4())
            now = datetime.utcnow()
            
            values = {
                "id": user_id,
                "google_id": user_data.get("google_id"),
                "email": user_data["email"],
                "name": user_data["name"],
                "given_name": user_data.get("given_name"),
                "family_name": user_data.get("family_name"),
                "picture": user_data.get("picture"),
                "email_verified": user_data.get("email_verified", False),
                "locale": user_data.get("locale", "en"),
                "auth_provider": user_data.get("auth_provider", "google"),
                "created_at": now,
                "updated_at": now
            }
            
            result = await database.fetch_one(query=query, values=values)
            if result:
                logger.info(f"Created user: {user_data['email']}")
                return dict(result)
            return None
            
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None
    
    @staticmethod
    async def get_user_by_google_id(google_id: str) -> Optional[Dict[str, Any]]:
        """Get user by Google ID"""
        try:
            query = "SELECT * FROM users WHERE google_id = :google_id AND is_active = true"
            result = await database.fetch_one(query=query, values={"google_id": google_id})
            return dict(result) if result else None
        except Exception as e:
            logger.error(f"Error getting user by Google ID: {e}")
            return None
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        try:
            query = "SELECT * FROM users WHERE email = :email AND is_active = true"
            result = await database.fetch_one(query=query, values={"email": email})
            return dict(result) if result else None
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            return None
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            query = "SELECT * FROM users WHERE id = :user_id AND is_active = true"
            result = await database.fetch_one(query=query, values={"user_id": user_id})
            return dict(result) if result else None
        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
            return None
    
    @staticmethod
    async def update_user(user_id: str, updates: Dict[str, Any]) -> bool:
        """Update user information"""
        try:
            updates["updated_at"] = datetime.utcnow()
            
            # Build dynamic update query
            set_clauses = []
            values = {"user_id": user_id}
            
            for key, value in updates.items():
                set_clauses.append(f"{key} = :{key}")
                values[key] = value
            
            query = f"UPDATE users SET {', '.join(set_clauses)} WHERE id = :user_id"
            await database.execute(query=query, values=values)
            return True
            
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            return False
    
    @staticmethod
    async def update_last_login(user_id: str) -> bool:
        """Update user's last login timestamp"""
        try:
            query = "UPDATE users SET last_login = :last_login WHERE id = :user_id"
            values = {"user_id": user_id, "last_login": datetime.utcnow()}
            await database.execute(query=query, values=values)
            return True
        except Exception as e:
            logger.error(f"Error updating last login: {e}")
            return False

class UserProfileRepository:
    """User profile data access operations"""
    
    @staticmethod
    async def create_profile(user_id: str, profile_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create user profile"""
        try:
            query = """
                INSERT INTO user_profiles (id, user_id, display_name, bio, trading_experience,
                                         risk_tolerance, investment_goals, preferred_assets,
                                         notifications_enabled, theme_preference, timezone, language,
                                         created_at, updated_at)
                VALUES (:id, :user_id, :display_name, :bio, :trading_experience,
                        :risk_tolerance, :investment_goals, :preferred_assets,
                        :notifications_enabled, :theme_preference, :timezone, :language,
                        :created_at, :updated_at)
                RETURNING *
            """
            
            profile_id = str(uuid.uuid4())
            now = datetime.utcnow()
            
            values = {
                "id": profile_id,
                "user_id": user_id,
                "display_name": profile_data.get("display_name", ""),
                "bio": profile_data.get("bio", ""),
                "trading_experience": profile_data.get("trading_experience", "beginner"),
                "risk_tolerance": profile_data.get("risk_tolerance", "moderate"),
                "investment_goals": profile_data.get("investment_goals", []),
                "preferred_assets": profile_data.get("preferred_assets", []),
                "notifications_enabled": profile_data.get("notifications_enabled", True),
                "theme_preference": profile_data.get("theme_preference", "dark"),
                "timezone": profile_data.get("timezone", "UTC"),
                "language": profile_data.get("language", "en"),
                "created_at": now,
                "updated_at": now
            }
            
            result = await database.fetch_one(query=query, values=values)
            return dict(result) if result else None
            
        except Exception as e:
            logger.error(f"Error creating profile: {e}")
            return None
    
    @staticmethod
    async def get_profile_by_user_id(user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile by user ID"""
        try:
            query = "SELECT * FROM user_profiles WHERE user_id = :user_id"
            result = await database.fetch_one(query=query, values={"user_id": user_id})
            return dict(result) if result else None
        except Exception as e:
            logger.error(f"Error getting profile: {e}")
            return None
    
    @staticmethod
    async def update_profile(user_id: str, updates: Dict[str, Any]) -> bool:
        """Update user profile"""
        try:
            updates["updated_at"] = datetime.utcnow()
            
            # Build dynamic update query
            set_clauses = []
            values = {"user_id": user_id}
            
            for key, value in updates.items():
                set_clauses.append(f"{key} = :{key}")
                values[key] = value
            
            query = f"UPDATE user_profiles SET {', '.join(set_clauses)} WHERE user_id = :user_id"
            await database.execute(query=query, values=values)
            return True
            
        except Exception as e:
            logger.error(f"Error updating profile: {e}")
            return False

class SessionRepository:
    """Session management operations"""
    
    @staticmethod
    async def create_session(user_id: str, token: str, ip_address: str = None, user_agent: str = None) -> bool:
        """Create a new session"""
        try:
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            expires_at = datetime.utcnow() + timedelta(hours=24)
            
            query = """
                INSERT INTO session_tokens (id, user_id, token_hash, expires_at, ip_address, user_agent, created_at, last_used)
                VALUES (:id, :user_id, :token_hash, :expires_at, :ip_address, :user_agent, :created_at, :last_used)
            """
            
            values = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "token_hash": token_hash,
                "expires_at": expires_at,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "created_at": datetime.utcnow(),
                "last_used": datetime.utcnow()
            }
            
            await database.execute(query=query, values=values)
            return True
            
        except Exception as e:
            logger.error(f"Error creating session: {e}")
            return False
    
    @staticmethod
    async def validate_session(token: str) -> Optional[Dict[str, Any]]:
        """Validate session token"""
        try:
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            
            query = """
                SELECT st.*, u.email, u.name FROM session_tokens st
                JOIN users u ON st.user_id = u.id
                WHERE st.token_hash = :token_hash 
                AND st.is_active = true 
                AND st.expires_at > :now
            """
            
            result = await database.fetch_one(
                query=query, 
                values={"token_hash": token_hash, "now": datetime.utcnow()}
            )
            
            if result:
                # Update last used timestamp
                await database.execute(
                    query="UPDATE session_tokens SET last_used = :now WHERE token_hash = :token_hash",
                    values={"now": datetime.utcnow(), "token_hash": token_hash}
                )
                return dict(result)
            
            return None
            
        except Exception as e:
            logger.error(f"Error validating session: {e}")
            return None
    
    @staticmethod
    async def invalidate_session(token: str) -> bool:
        """Invalidate a session token"""
        try:
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            
            query = "UPDATE session_tokens SET is_active = false WHERE token_hash = :token_hash"
            await database.execute(query=query, values={"token_hash": token_hash})
            return True
            
        except Exception as e:
            logger.error(f"Error invalidating session: {e}")
            return False
    
    @staticmethod
    async def cleanup_expired_sessions() -> int:
        """Clean up expired sessions"""
        try:
            query = "DELETE FROM session_tokens WHERE expires_at < :now"
            result = await database.execute(query=query, values={"now": datetime.utcnow()})
            return result
        except Exception as e:
            logger.error(f"Error cleaning up sessions: {e}")
            return 0

class TradingRepository:
    """Trading-related data access operations"""
    
    @staticmethod
    async def create_trading_account(user_id: str, account_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create trading account"""
        try:
            query = """
                INSERT INTO trading_accounts (id, user_id, broker_name, account_id, is_paper_trading, created_at, updated_at)
                VALUES (:id, :user_id, :broker_name, :account_id, :is_paper_trading, :created_at, :updated_at)
                RETURNING *
            """
            
            values = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "broker_name": account_data["broker_name"],
                "account_id": account_data["account_id"],
                "is_paper_trading": account_data.get("is_paper_trading", True),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = await database.fetch_one(query=query, values=values)
            return dict(result) if result else None
            
        except Exception as e:
            logger.error(f"Error creating trading account: {e}")
            return None
    
    @staticmethod
    async def get_user_trading_accounts(user_id: str) -> List[Dict[str, Any]]:
        """Get user's trading accounts"""
        try:
            query = "SELECT * FROM trading_accounts WHERE user_id = :user_id AND is_active = true"
            results = await database.fetch_all(query=query, values={"user_id": user_id})
            return [dict(row) for row in results]
        except Exception as e:
            logger.error(f"Error getting trading accounts: {e}")
            return []