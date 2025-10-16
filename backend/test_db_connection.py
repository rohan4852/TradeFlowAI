#!/usr/bin/env python3
"""
Simple database connection test
"""

import os
import asyncio
import asyncpg
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_connection():
    """Test Railway database connection"""
    
    # Get database URL
    db_url = os.getenv("RAILWAY_DATABASE_URL")
    
    if not db_url:
        print("❌ No RAILWAY_DATABASE_URL found in environment")
        return False
    
    print(f"🔍 Testing connection to Railway database...")
    print(f"📡 Database URL: {db_url[:50]}...")
    
    try:
        # Test connection
        conn = await asyncpg.connect(db_url)
        
        # Test query
        result = await conn.fetchval("SELECT version()")
        print(f"✅ Connection successful!")
        print(f"📊 PostgreSQL version: {result}")
        
        # Close connection
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

async def create_tables():
    """Create basic tables"""
    
    db_url = os.getenv("RAILWAY_DATABASE_URL")
    
    try:
        conn = await asyncpg.connect(db_url)
        
        # Create users table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(255) UNIQUE NOT NULL,
                hashed_password VARCHAR(255),
                full_name VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                google_id VARCHAR(255) UNIQUE,
                avatar_url VARCHAR(500)
            )
        """)
        
        print("✅ Users table created successfully!")
        
        # Create user_profiles table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS user_profiles (
                id SERIAL PRIMARY KEY,
                user_id INTEGER UNIQUE REFERENCES users(id),
                phone VARCHAR(50),
                address TEXT,
                date_of_birth TIMESTAMP,
                timezone VARCHAR(50) DEFAULT 'UTC',
                risk_tolerance VARCHAR(20) DEFAULT 'medium',
                trading_experience VARCHAR(20) DEFAULT 'beginner',
                preferred_assets JSONB DEFAULT '[]',
                email_notifications BOOLEAN DEFAULT TRUE,
                push_notifications BOOLEAN DEFAULT TRUE,
                sms_notifications BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        print("✅ User profiles table created successfully!")
        
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        return False

async def main():
    """Main function"""
    print("🚀 Railway Database Connection Test")
    print("=" * 50)
    
    # Test connection
    if await test_connection():
        print("\n🏗️  Creating database tables...")
        if await create_tables():
            print("\n🎉 Database setup completed successfully!")
            print("\nNext steps:")
            print("1. Your Railway database is ready to use")
            print("2. Start your FastAPI application")
            print("3. Test user registration and login")
        else:
            print("\n❌ Failed to create tables")
    else:
        print("\n❌ Database connection failed")
        print("\nTroubleshooting:")
        print("1. Check your RAILWAY_DATABASE_URL in .env file")
        print("2. Verify your Railway database is running")
        print("3. Check network connectivity")

if __name__ == "__main__":
    asyncio.run(main())