#!/usr/bin/env python3
"""
Supabase Database Connection Test
"""

import os
import asyncio
import asyncpg
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_supabase_connection():
    """Test Supabase database connection"""
    
    # Get database URL
    db_url = os.getenv("SUPABASE_DATABASE_URL")
    
    if not db_url:
        print("❌ No SUPABASE_DATABASE_URL found in environment")
        print("💡 Run: python backend/setup_supabase.py")
        return False
    
    print(f"🔍 Testing connection to Supabase database...")
    print(f"📡 Database URL: {db_url[:50]}...")
    
    try:
        # Test connection
        conn = await asyncpg.connect(db_url)
        
        # Test query
        result = await conn.fetchval("SELECT version()")
        print(f"✅ Connection successful!")
        print(f"📊 PostgreSQL version: {result}")
        
        # Test Supabase extensions
        extensions = await conn.fetch("""
            SELECT extname FROM pg_extension 
            WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pgjwt')
        """)
        
        if extensions:
            print(f"🔧 Supabase extensions available:")
            for ext in extensions:
                print(f"   - {ext['extname']}")
        
        # Close connection
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print()
        print("🔧 Troubleshooting:")
        print("1. Check your Supabase URL in .env file")
        print("2. Verify your Supabase project is active")
        print("3. Check your database password")
        print("4. Ensure you're using the external connection string")
        return False

async def create_supabase_tables():
    """Create tables optimized for Supabase"""
    
    db_url = os.getenv("SUPABASE_DATABASE_URL")
    
    try:
        conn = await asyncpg.connect(db_url)
        
        # Enable UUID extension (common in Supabase)
        await conn.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")
        
        # Create users table with UUID
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(255) UNIQUE NOT NULL,
                hashed_password VARCHAR(255),
                full_name VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                google_id VARCHAR(255) UNIQUE,
                avatar_url VARCHAR(500)
            )
        """)
        
        print("✅ Users table created successfully!")
        
        # Create user_profiles table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS user_profiles (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                phone VARCHAR(50),
                address TEXT,
                date_of_birth TIMESTAMP WITH TIME ZONE,
                timezone VARCHAR(50) DEFAULT 'UTC',
                risk_tolerance VARCHAR(20) DEFAULT 'medium',
                trading_experience VARCHAR(20) DEFAULT 'beginner',
                preferred_assets JSONB DEFAULT '[]',
                email_notifications BOOLEAN DEFAULT TRUE,
                push_notifications BOOLEAN DEFAULT TRUE,
                sms_notifications BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """)
        
        print("✅ User profiles table created successfully!")
        
        # Create trading_accounts table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS trading_accounts (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                account_name VARCHAR(255) NOT NULL,
                account_type VARCHAR(50) NOT NULL,
                broker VARCHAR(100) NOT NULL,
                api_key VARCHAR(500),
                api_secret VARCHAR(500),
                is_active BOOLEAN DEFAULT TRUE,
                is_paper_trading BOOLEAN DEFAULT TRUE,
                cash_balance DECIMAL(15,2) DEFAULT 0.00,
                buying_power DECIMAL(15,2) DEFAULT 0.00,
                portfolio_value DECIMAL(15,2) DEFAULT 0.00,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """)
        
        print("✅ Trading accounts table created successfully!")
        
        # Create orders table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                trading_account_id UUID REFERENCES trading_accounts(id) ON DELETE CASCADE,
                symbol VARCHAR(20) NOT NULL,
                asset_type VARCHAR(50) NOT NULL,
                order_type VARCHAR(50) NOT NULL,
                side VARCHAR(10) NOT NULL,
                quantity DECIMAL(15,8) NOT NULL,
                price DECIMAL(15,2),
                stop_price DECIMAL(15,2),
                filled_quantity DECIMAL(15,8) DEFAULT 0,
                average_fill_price DECIMAL(15,2),
                status VARCHAR(50) DEFAULT 'pending',
                broker_order_id VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                filled_at TIMESTAMP WITH TIME ZONE,
                order_data JSONB DEFAULT '{}'
            )
        """)
        
        print("✅ Orders table created successfully!")
        
        # Create indexes for better performance
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_symbol ON orders(symbol)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)")
        
        print("✅ Database indexes created successfully!")
        
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        return False

async def test_supabase_features():
    """Test Supabase-specific features"""
    
    db_url = os.getenv("SUPABASE_DATABASE_URL")
    
    try:
        conn = await asyncpg.connect(db_url)
        
        # Test JSON operations
        await conn.execute("""
            INSERT INTO user_profiles (user_id, preferred_assets) 
            SELECT users.id, '["stocks", "crypto"]'::jsonb 
            FROM users LIMIT 1
            ON CONFLICT (user_id) DO NOTHING
        """)
        
        # Test JSONB query
        result = await conn.fetchval("""
            SELECT COUNT(*) FROM user_profiles 
            WHERE preferred_assets ? 'stocks'
        """)
        
        print(f"✅ JSONB operations working! Found {result} profiles with stocks preference")
        
        await conn.close()
        return True
        
    except Exception as e:
        print(f"⚠️  Supabase features test failed: {e}")
        return False

async def main():
    """Main function"""
    print("🚀 Supabase Database Test")
    print("=" * 50)
    
    # Test connection
    if await test_supabase_connection():
        print("\n🏗️  Creating database tables...")
        if await create_supabase_tables():
            print("\n🧪 Testing Supabase features...")
            await test_supabase_features()
            
            print("\n🎉 Supabase database setup completed successfully!")
            print("\n📋 What you can do now:")
            print("1. 🌐 Visit your Supabase dashboard")
            print("2. 📊 View your tables in the Table Editor")
            print("3. 🔐 Set up Row Level Security (RLS)")
            print("4. 🚀 Start your FastAPI application")
            print("5. 🧪 Test user registration and login")
            
            print("\n💡 Supabase Dashboard Features:")
            print("- Table Editor: Visual database management")
            print("- SQL Editor: Run custom queries")
            print("- Authentication: Built-in user management")
            print("- Storage: File uploads and management")
            print("- Real-time: Live data subscriptions")
        else:
            print("\n❌ Failed to create tables")
    else:
        print("\n❌ Database connection failed")

if __name__ == "__main__":
    asyncio.run(main())