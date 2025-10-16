import os
from typing import Dict, Any, Optional
# pydantic v2 split BaseSettings into pydantic-settings package. Prefer the
# new package when available, but fall back to pydantic.BaseSettings so the
# project can run in environments without the separate package installed.
try:
    from pydantic_settings import BaseSettings
    from pydantic import field_validator
    _PydanticSettingsAvailable = True
except Exception:
    # Fallback: try to import BaseSettings from pydantic. In pydantic v2
    # accessing `BaseSettings` from `pydantic` raises a PydanticImportError
    # instructing users to install `pydantic-settings`. Catch that case and
    # provide a lightweight shim so the application can run in minimal
    # environments (it won't provide full pydantic validation features).
    try:
        from pydantic import BaseSettings  # type: ignore
        try:
            from pydantic import validator as field_validator  # type: ignore
        except Exception:
            # Provide a no-op decorator if validator is not available
            def field_validator(*_args, **_kwargs):
                def _decorator(func):
                    return func
                return _decorator
        _PydanticSettingsAvailable = False
    except Exception:
        # Provide a minimal BaseSettings shim that reads environment
        # variables by attribute name. This is intentionally small and
        # defensive: it allows the app to run without pydantic but does
        # not replace full validation behavior.
        class BaseSettings:  # type: ignore
            def __init_subclass__(cls, **kwargs):
                # Preserve class attributes (defaults) on subclass creation
                super().__init_subclass__(**kwargs)

            def __init__(self, **_kwargs):
                # For every uppercase attribute defined on the class, try
                # to override it from the environment. Otherwise fall back
                # to the class default value.
                for name, val in list(self.__class__.__dict__.items()):
                    if name.isupper():
                        env_val = os.getenv(name)
                        if env_val is None:
                            # keep class default
                            setattr(self, name, val)
                        else:
                            # try to coerce simple types
                            try:
                                if isinstance(val, bool):
                                    setattr(self, name, env_val.lower() in ("1", "true", "yes"))
                                elif isinstance(val, int):
                                    setattr(self, name, int(env_val))
                                elif isinstance(val, float):
                                    setattr(self, name, float(env_val))
                                else:
                                    setattr(self, name, env_val)
                            except Exception:
                                setattr(self, name, env_val)

        def field_validator(*_args, **_kwargs):
            def _decorator(func):
                return func
            return _decorator
        _PydanticSettingsAvailable = False
import secrets

class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application
    APP_NAME: str = "AI Trading Platform"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    SECRET_KEY: str = secrets.token_urlsafe(32)
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/ai_trading"
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    JWT_SECRET_KEY: str = secrets.token_urlsafe(32)
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    PASSWORD_MIN_LENGTH: int = 12
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 15
    
    # API Keys
    NEWS_API_KEY: Optional[str] = None
    ALPHA_VANTAGE_API_KEY: Optional[str] = None
    FINNHUB_API_KEY: Optional[str] = None
    TWITTER_API_KEY: Optional[str] = None
    TWITTER_API_SECRET: Optional[str] = None
    REDDIT_CLIENT_ID: Optional[str] = None
    REDDIT_CLIENT_SECRET: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None  # Gemini AI API
    OPENAI_API_KEY: Optional[str] = None  # Fallback
    
    # Broker Integration
    ALPACA_API_KEY: Optional[str] = None
    ALPACA_SECRET_KEY: Optional[str] = None
    ALPACA_PAPER_TRADING: bool = True
    IB_USERNAME: Optional[str] = None
    IB_PASSWORD: Optional[str] = None
    IB_ACCOUNT_ID: Optional[str] = None
    
    # Rate Limiting
    RATE_LIMIT_DEFAULT: int = 1000  # requests per hour
    RATE_LIMIT_TRADING: int = 100   # trading requests per hour
    RATE_LIMIT_DATA: int = 5000     # data requests per hour
    
    # Real-time Features
    WEBSOCKET_HEARTBEAT_INTERVAL: int = 30
    STREAMING_BUFFER_SIZE: int = 1000
    PREDICTION_UPDATE_INTERVAL: int = 300  # seconds
    RISK_CHECK_INTERVAL: int = 60          # seconds
    
    # Model Configuration
    DEFAULT_MODEL_CONFIDENCE_THRESHOLD: float = 0.6
    ENSEMBLE_WEIGHTS: Dict[str, float] = {
        "arima": 0.15,
        "lstm": 0.25,
        "transformer": 0.25,
        "reinforcement_learning": 0.20,
        "llm": 0.15
    }
    
    # Data Quality
    DATA_QUALITY_THRESHOLD: float = 0.8
    ANOMALY_DETECTION_SENSITIVITY: float = 2.0
    DATA_RETENTION_DAYS: int = 365
    
    # Performance
    API_TIMEOUT_SECONDS: int = 30
    DATABASE_POOL_SIZE: int = 20
    CACHE_TTL_SECONDS: int = 3600
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: Optional[str] = None
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]
    
    @field_validator('ENSEMBLE_WEIGHTS')
    def validate_ensemble_weights(cls, v):
        if abs(sum(v.values()) - 1.0) > 0.01:
            raise ValueError("Ensemble weights must sum to 1.0")
        return v
    # In this project we load `.env` early in `app.main` to ensure the
    # environment is populated for code that runs at import-time. Tell
    # pydantic to ignore extra keys present in `.env` and keep case
    # sensitivity.
    model_config = {"extra": "ignore", "case_sensitive": True}

# Global settings instance
settings = Settings()

# Configuration for different environments
class DevelopmentConfig(Settings):
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"

class ProductionConfig(Settings):
    DEBUG: bool = False
    LOG_LEVEL: str = "WARNING"
    
    # Production security settings
    PASSWORD_MIN_LENGTH: int = 16
    MAX_LOGIN_ATTEMPTS: int = 3
    JWT_EXPIRATION_HOURS: int = 8

class TestingConfig(Settings):
    DEBUG: bool = True
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/ai_trading_test"
    REDIS_URL: str = "redis://localhost:6379/1"

# Environment-specific configuration
def get_config() -> Settings:
    """Get configuration based on environment"""
    env = os.getenv("ENVIRONMENT", "development").lower()
    
    if env == "production":
        return ProductionConfig()
    elif env == "testing":
        return TestingConfig()
    else:
        return DevelopmentConfig()

# API Configuration
API_CONFIG = {
    "title": settings.APP_NAME,
    "description": "Advanced AI-powered trading intelligence platform",
    "version": settings.APP_VERSION,
    "docs_url": "/docs" if settings.DEBUG else None,
    "redoc_url": "/redoc" if settings.DEBUG else None,
}

# Model Configuration
MODEL_CONFIG = {
    "arima": {
        "order": (1, 1, 1),
        "seasonal_order": (1, 1, 1, 12),
        "confidence_threshold": 0.7
    },
    "lstm": {
        "sequence_length": 60,
        "hidden_units": 50,
        "dropout": 0.2,
        "epochs": 100,
        "batch_size": 32
    },
    "transformer": {
        "d_model": 512,
        "nhead": 8,
        "num_layers": 6,
        "dropout": 0.1,
        "max_sequence_length": 1000
    },
    "reinforcement_learning": {
        "learning_rate": 0.001,
        "gamma": 0.95,
        "epsilon": 0.1,
        "memory_size": 10000,
        "batch_size": 32
    },
    "llm": {
        "model_name": "mistralai/Mistral-7B-Instruct-v0.1",
        "max_tokens": 512,
        "temperature": 0.7,
        "top_p": 0.9
    }
}

# Risk Management Configuration
RISK_CONFIG = {
    "max_position_size": 0.1,        # 10% of portfolio
    "max_sector_allocation": 0.3,    # 30% per sector
    "max_daily_loss": 0.05,          # 5% daily loss limit
    "max_daily_trades": 10,          # Maximum trades per day
    "min_account_balance": 1000.0,   # Minimum account balance
    "stop_loss_percentage": 0.02,    # 2% stop loss
    "take_profit_percentage": 0.04,  # 4% take profit
    "position_sizing_method": "kelly_criterion",
    "risk_free_rate": 0.02,          # 2% risk-free rate
}

# Data Source Configuration
DATA_SOURCES = {
    "yahoo_finance": {
        "enabled": True,
        "weight": 0.8,
        "rate_limit": 2000,  # requests per hour
        "timeout": 10
    },
    "alpha_vantage": {
        "enabled": bool(settings.ALPHA_VANTAGE_API_KEY),
        "weight": 0.9,
        "rate_limit": 500,
        "timeout": 15
    },
    "finnhub": {
        "enabled": bool(settings.FINNHUB_API_KEY),
        "weight": 0.85,
        "rate_limit": 300,
        "timeout": 10
    },
    "news_api": {
        "enabled": bool(settings.NEWS_API_KEY),
        "weight": 0.7,
        "rate_limit": 1000,
        "timeout": 20
    },
    "twitter": {
        "enabled": bool(settings.TWITTER_API_KEY),
        "weight": 0.6,
        "rate_limit": 300,
        "timeout": 15
    },
    "reddit": {
        "enabled": bool(settings.REDDIT_CLIENT_ID),
        "weight": 0.5,
        "rate_limit": 600,
        "timeout": 10
    }
}

# Monitoring Configuration
MONITORING_CONFIG = {
    "health_check_interval": 60,     # seconds
    "metrics_collection_interval": 30,
    "alert_thresholds": {
        "api_response_time": 1000,   # milliseconds
        "error_rate": 0.05,          # 5%
        "memory_usage": 0.8,         # 80%
        "cpu_usage": 0.8,            # 80%
        "disk_usage": 0.9            # 90%
    },
    "notification_channels": {
        "email": True,
        "slack": False,
        "sms": False
    }
}

# Export current configuration
current_config = get_config()