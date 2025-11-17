import os
import logging
import re
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from databases import Database
import asyncpg
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

# Cloud Database Configuration
def get_database_url():
    """
    Get database URL with cloud provider support
    Supports: Supabase, Railway, Render, Heroku, AWS RDS, Google Cloud SQL, Azure
    """
    # Check for cloud-specific environment variables first
    # Prefer the first non-placeholder value among known env vars.
    candidates = [
        "SUPABASE_DATABASE_URL",
        "RAILWAY_DATABASE_URL",
        "RENDER_DATABASE_URL",
        "HEROKU_POSTGRESQL_URL",
        "AWS_RDS_URL",
        "GOOGLE_CLOUD_SQL_URL",
        "AZURE_DATABASE_URL",
        "DATABASE_URL",
    ]

    def _is_placeholder(val: str) -> bool:
        if not val:
            return True
        if placeholder_pattern.search(val):
            return True
        if re.search(r"YOUR[-_ ]?PASSWORD", val, re.I):
            return True
        return False

    # Detect placeholder tokens like [PROJECT-REF] used in example .env files
    placeholder_pattern = re.compile(r"\[[A-Z0-9_\-]+\]")

    cloud_db_url = None
    used_env = None
    for name in candidates:
        val = os.getenv(name)
        if not val:
            continue
        # If it's a placeholder-like value, ignore and continue.
        if _is_placeholder(val):
            logger.info(f"Ignoring placeholder-like DB URL in env var {name}")
            continue
        cloud_db_url = val
        used_env = name
        break
    
    # Default to local if no cloud URL provided
    if not cloud_db_url:
        # If we found any candidate env vars but they were all placeholders,
        # warn the developer specifically about placeholder values.
        # Otherwise (no env vars present), warn about using the local DB.
        any_candidate = any(os.getenv(n) for n in candidates)
        if any_candidate:
            logger.warning(
                "Detected placeholder values in database URL (likely from .env). "
                "Using local development database instead. Update your .env with a real DATABASE_URL."
            )
        else:
            logger.warning("No cloud database URL found, using local database")

        return "postgresql://postgres:password@localhost:5432/ai_trading"

    # Detect obvious placeholder patterns that often appear in example .env
    # entries (e.g. [PROJECT-REF], [YOUR-PASSWORD]) and avoid attempting to
    # parse them as real URLs. If placeholders are detected, fall back to the
    # local DB and warn the developer.
    placeholder_pattern = re.compile(r"\[[A-Z0-9_\-]+\]")
    if placeholder_pattern.search(cloud_db_url) or re.search(r"YOUR[-_ ]?PASSWORD", cloud_db_url, re.I):
        logger.warning(
            "Detected placeholder values in database URL (likely from .env). "
            "Using local development database instead. Update your .env with a real DATABASE_URL."
        )
        # Keep the fallback aligned with docker-compose local Postgres
        return "postgresql://postgres:password@localhost:5432/ai_trading"

    # Try to parse the URL for provider detection, but be defensive: if
    # parsing fails (malformed URL), fall back to string-based checks and
    # ultimately to the local DB.
    try:
        parsed = urlparse(cloud_db_url)
        hostname = (parsed.hostname or "").lower()
    except Exception:
        logger.debug("Failed to parse cloud DB URL; using string checks")
        hostname = ""

    # Provider detection using hostname when available, else using the raw URL string.
    raw = cloud_db_url.lower()
    provider_target = hostname or raw

    if used_env:
        logger.info(f"Using database URL from environment variable: {used_env}")

    if "supabase" in provider_target:
        logger.info("Using Supabase PostgreSQL database")
    elif "railway" in provider_target:
        logger.info("Using Railway PostgreSQL database")
    elif "render" in provider_target:
        logger.info("Using Render PostgreSQL database")
    elif "amazonaws.com" in provider_target or "rds" in provider_target:
        logger.info("Using AWS RDS PostgreSQL database")
    elif "googleapis.com" in provider_target or "cloudsql" in provider_target:
        logger.info("Using Google Cloud SQL database")
    elif "database.windows.net" in provider_target or "azure" in provider_target:
        logger.info("Using Azure Database for PostgreSQL")
    else:
        logger.info("Using cloud PostgreSQL database")
    
    return cloud_db_url

DATABASE_URL = get_database_url()

# Cloud database connection configuration
def create_database_connections():
    """Create database connections with cloud-optimized settings"""
    
    # Connection pool settings for cloud databases
    engine_kwargs = {
        "pool_size": 10,
        "max_overflow": 20,
        "pool_pre_ping": True,  # Verify connections before use
        "pool_recycle": 3600,   # Recycle connections every hour
        # Note: only include connection options accepted by the DB-API used by
        # the sync SQLAlchemy engine (psycopg2). asyncpg supports additional
        # options like `command_timeout` but passing them here causes an
        # "invalid dsn" error. Keep connect_args minimal for the sync engine.
        "connect_args": {
            "sslmode": "require" if "localhost" not in DATABASE_URL else "prefer",
            "connect_timeout": 30,
        }
    }
    
    # For async operations
    database = Database(DATABASE_URL)

    # SQLAlchemy sync engine doesn't accept the '+asyncpg' scheme. If the
    # provided DATABASE_URL contains a dialect+driver (e.g. postgresql+asyncpg://)
    # strip the '+asyncpg' suffix for the sync engine creation while continuing
    # to use the original URL for async Database connections.
    sync_db_url = DATABASE_URL
    try:
        # Only replace the first occurrence (defensive)
        if "+asyncpg" in sync_db_url:
            sync_db_url = sync_db_url.replace("+asyncpg", "", 1)
    except Exception:
        # If anything goes wrong, fall back to the original URL and let
        # create_engine raise a helpful error which will be logged.
        sync_db_url = DATABASE_URL

    # For sync operations with cloud optimizations
    engine = create_engine(sync_db_url, **engine_kwargs)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    return database, engine, SessionLocal

# Initialize connections
database, engine, SessionLocal = create_database_connections()

# Base class for models
Base = declarative_base()
metadata = MetaData()

async def connect_database():
    """Connect to the database"""
    try:
        await database.connect()
        logger.info("Database connected successfully")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        raise

async def disconnect_database():
    """Disconnect from the database"""
    try:
        await database.disconnect()
        logger.info("Database disconnected")
    except Exception as e:
        logger.error(f"Error disconnecting from database: {e}")

def get_database():
    """Dependency to get database connection"""
    return database

def get_db_session():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def create_tables():
    """Create all database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise

    