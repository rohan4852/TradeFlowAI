#!/usr/bin/env python3
"""
Cloud Database Migration Script
Helps migrate from local to cloud database
"""

import os
import sys
import asyncio
import logging
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.database.connection import connect_database, create_tables, get_database_url
from app.database.models import *  # Import all models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_connection():
    """Test database connection"""
    try:
        await connect_database()
        logger.info("✅ Database connection successful!")
        return True
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return False

async def create_database_schema():
    """Create all database tables"""
    try:
        await create_tables()
        logger.info("✅ Database schema created successfully!")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to create database schema: {e}")
        return False

def check_environment():
    """Check if cloud database environment variables are set"""
    cloud_vars = [
        "SUPABASE_DATABASE_URL",
        "RAILWAY_DATABASE_URL", 
        "RENDER_DATABASE_URL",
        "HEROKU_POSTGRESQL_URL",
        "AWS_RDS_URL",
        "GOOGLE_CLOUD_SQL_URL",
        "AZURE_DATABASE_URL"
    ]
    
    set_vars = [var for var in cloud_vars if os.getenv(var)]
    
    if not set_vars:
        logger.warning("⚠️  No cloud database environment variables found")
        logger.info("Please set one of the following environment variables:")
        for var in cloud_vars:
            logger.info(f"  - {var}")
        return False
    
    logger.info(f"✅ Found cloud database configuration: {set_vars[0]}")
    return True

async def main():
    """Main migration function"""
    logger.info("🚀 Starting cloud database migration...")
    
    # Check environment variables
    if not check_environment():
        logger.error("❌ Migration aborted: No cloud database configuration found")
        return False
    
    # Display current database URL (masked for security)
    db_url = get_database_url()
    masked_url = db_url.replace(db_url.split('@')[0].split('//')[1], '***:***')
    logger.info(f"📡 Target database: {masked_url}")
    
    # Test connection
    logger.info("🔍 Testing database connection...")
    if not await test_connection():
        return False
    
    # Create schema
    logger.info("🏗️  Creating database schema...")
    if not await create_database_schema():
        return False
    
    logger.info("🎉 Cloud database migration completed successfully!")
    logger.info("Next steps:")
    logger.info("1. Update your application deployment configuration")
    logger.info("2. Test your application with the cloud database")
    logger.info("3. Set up monitoring and backups")
    
    return True

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)