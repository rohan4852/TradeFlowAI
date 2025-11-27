"""
Database Models for TradeFlowAI
SQLAlchemy models for PostgreSQL database
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    """User model for authentication and profile management"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth users
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # OAuth fields
    google_id = Column(String, unique=True, nullable=True)
    avatar_url = Column(String, nullable=True)
    
    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    trading_accounts = relationship("TradingAccount", back_populates="user")
    orders = relationship("Order", back_populates="user")
    positions = relationship("Position", back_populates="user")

class UserProfile(Base):
    """Extended user profile information"""
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Profile information
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    timezone = Column(String, default="UTC")
    
    # Trading preferences
    risk_tolerance = Column(String, default="medium")  # low, medium, high
    trading_experience = Column(String, default="beginner")  # beginner, intermediate, advanced
    preferred_assets = Column(JSON, default=list)  # List of preferred asset types
    
    # Notification preferences
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="profile")

class TradingAccount(Base):
    """Trading account information"""
    __tablename__ = "trading_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Account details
    account_name = Column(String, nullable=False)
    account_type = Column(String, nullable=False)  # paper, live
    broker = Column(String, nullable=False)  # alpaca, interactive_brokers, etc.
    
    # API credentials (encrypted)
    api_key = Column(String, nullable=True)
    api_secret = Column(String, nullable=True)
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_paper_trading = Column(Boolean, default=True)
    
    # Balance information
    cash_balance = Column(Float, default=0.0)
    buying_power = Column(Float, default=0.0)
    portfolio_value = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="trading_accounts")
    orders = relationship("Order", back_populates="trading_account")
    positions = relationship("Position", back_populates="trading_account")

class Order(Base):
    """Trading orders"""
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    trading_account_id = Column(Integer, ForeignKey("trading_accounts.id"))
    
    # Order details
    symbol = Column(String, nullable=False, index=True)
    asset_type = Column(String, nullable=False)  # stock, crypto, forex, etc.
    order_type = Column(String, nullable=False)  # market, limit, stop, etc.
    side = Column(String, nullable=False)  # buy, sell
    
    # Quantities and prices
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=True)  # For limit orders
    stop_price = Column(Float, nullable=True)  # For stop orders
    filled_quantity = Column(Float, default=0.0)
    average_fill_price = Column(Float, nullable=True)
    
    # Order status
    status = Column(String, default="pending")  # pending, filled, cancelled, rejected
    broker_order_id = Column(String, nullable=True)  # External order ID
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    filled_at = Column(DateTime, nullable=True)
    
    # Additional data
    order_data = Column(JSON, default=dict)  # Additional order metadata
    
    # Relationships
    user = relationship("User", back_populates="orders")
    trading_account = relationship("TradingAccount", back_populates="orders")

class Position(Base):
    """Current trading positions"""
    __tablename__ = "positions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    trading_account_id = Column(Integer, ForeignKey("trading_accounts.id"))
    
    # Position details
    symbol = Column(String, nullable=False, index=True)
    asset_type = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    average_cost = Column(Float, nullable=False)
    current_price = Column(Float, nullable=True)
    
    # P&L information
    unrealized_pnl = Column(Float, default=0.0)
    realized_pnl = Column(Float, default=0.0)
    
    # Position status
    is_open = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)
    
    # Additional data
    position_data = Column(JSON, default=dict)
    
    # Relationships
    user = relationship("User", back_populates="positions")
    trading_account = relationship("TradingAccount", back_populates="positions")

class MarketData(Base):
    """Market data storage"""
    __tablename__ = "market_data"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, nullable=False, index=True)
    asset_type = Column(String, nullable=False)
    
    # OHLCV data
    timestamp = Column(DateTime, nullable=False, index=True)
    open_price = Column(Float, nullable=False)
    high_price = Column(Float, nullable=False)
    low_price = Column(Float, nullable=False)
    close_price = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)
    
    # Additional market data
    vwap = Column(Float, nullable=True)  # Volume Weighted Average Price
    trades_count = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

class Watchlist(Base):
    """User watchlists"""
    __tablename__ = "watchlists"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    name = Column(String, nullable=False)
    symbols = Column(JSON, default=list)  # List of symbols
    is_default = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TradingSession(Base):
    """User trading sessions for analytics"""
    __tablename__ = "trading_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    session_start = Column(DateTime, default=datetime.utcnow)
    session_end = Column(DateTime, nullable=True)
    
    # Session analytics
    orders_placed = Column(Integer, default=0)
    trades_executed = Column(Integer, default=0)
    pnl = Column(Float, default=0.0)
    
    # Session data
    session_data = Column(JSON, default=dict)

class SessionToken(Base):
    """Session tokens for authentication"""
    __tablename__ = "session_tokens"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    token_hash = Column(String, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used = Column(DateTime, default=datetime.utcnow)

class PriceAlert(Base):
    """Price alerts for users"""
    __tablename__ = "price_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symbol = Column(String, nullable=False, index=True)
    alert_type = Column(String, nullable=False)  # above, below, change_percent
    target_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    is_triggered = Column(Boolean, default=False)
    triggered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Notification(Base):
    """User notifications"""
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String, nullable=False)  # alert, trade, system, etc.
    is_read = Column(Boolean, default=False)
    priority = Column(String, default="normal")  # low, normal, high, urgent
    data = Column(JSON, default=dict)  # Additional notification data
    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)