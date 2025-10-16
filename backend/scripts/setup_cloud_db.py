#!/usr/bin/env python3
"""
Interactive Cloud Database Setup Script
Helps you choose and configure a cloud database provider
"""

import os
import sys
from pathlib import Path

def print_header():
    print("=" * 60)
    print("🚀 TradeFlowAI Cloud Database Setup")
    print("=" * 60)
    print()

def print_provider_info():
    providers = {
        "1": {
            "name": "Supabase",
            "description": "PostgreSQL with built-in auth and real-time features",
            "free_tier": "500MB storage, 2 databases",
            "best_for": "Beginners, rapid prototyping",
            "url": "https://supabase.com"
        },
        "2": {
            "name": "Railway", 
            "description": "Simple deployment platform with PostgreSQL",
            "free_tier": "$5 credit monthly",
            "best_for": "Simple deployment, auto-scaling",
            "url": "https://railway.app"
        },
        "3": {
            "name": "Render",
            "description": "Cloud platform with free PostgreSQL tier",
            "free_tier": "1GB storage, 90 days retention",
            "best_for": "Free hosting, small applications",
            "url": "https://render.com"
        },
        "4": {
            "name": "AWS RDS",
            "description": "Enterprise-grade managed PostgreSQL",
            "free_tier": "750 hours/month for 12 months",
            "best_for": "Enterprise applications, scalability",
            "url": "https://aws.amazon.com/rds/"
        }
    }
    
    print("Available Cloud Database Providers:")
    print()
    
    for key, provider in providers.items():
        print(f"{key}. {provider['name']}")
        print(f"   Description: {provider['description']}")
        print(f"   Free Tier: {provider['free_tier']}")
        print(f"   Best For: {provider['best_for']}")
        print(f"   URL: {provider['url']}")
        print()

def get_user_choice():
    while True:
        choice = input("Choose a provider (1-4) or 'q' to quit: ").strip()
        if choice.lower() == 'q':
            return None
        if choice in ['1', '2', '3', '4']:
            return choice
        print("Invalid choice. Please enter 1, 2, 3, 4, or 'q'")

def get_database_url(provider_choice):
    provider_configs = {
        "1": {
            "name": "Supabase",
            "env_var": "SUPABASE_DATABASE_URL",
            "format": "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres",
            "instructions": [
                "1. Go to https://supabase.com and create an account",
                "2. Create a new project",
                "3. Go to Settings > Database",
                "4. Copy the connection string",
                "5. Replace [password] with your database password"
            ]
        },
        "2": {
            "name": "Railway",
            "env_var": "RAILWAY_DATABASE_URL", 
            "format": "postgresql://postgres:[password]@[host].railway.app:5432/railway",
            "instructions": [
                "1. Go to https://railway.app and create an account",
                "2. Create a new project",
                "3. Add a PostgreSQL service",
                "4. Go to the PostgreSQL service variables tab",
                "5. Copy the DATABASE_URL value"
            ]
        },
        "3": {
            "name": "Render",
            "env_var": "RENDER_DATABASE_URL",
            "format": "postgresql://[username]:[password]@[host].render.com/[database]",
            "instructions": [
                "1. Go to https://render.com and create an account",
                "2. Create a new PostgreSQL database",
                "3. Copy the connection string from the database info page"
            ]
        },
        "4": {
            "name": "AWS RDS",
            "env_var": "AWS_RDS_URL",
            "format": "postgresql://[username]:[password]@[endpoint].rds.amazonaws.com:5432/[database]",
            "instructions": [
                "1. Go to AWS Console > RDS",
                "2. Create a new PostgreSQL database instance",
                "3. Configure security groups to allow connections",
                "4. Get the endpoint from the RDS console",
                "5. Format: postgresql://username:password@endpoint:5432/database"
            ]
        }
    }
    
    config = provider_configs[provider_choice]
    
    print(f"\n📋 Setup Instructions for {config['name']}:")
    print("-" * 40)
    for instruction in config['instructions']:
        print(instruction)
    
    print(f"\n📝 Connection String Format:")
    print(config['format'])
    print()
    
    database_url = input("Enter your database connection string: ").strip()
    
    if not database_url:
        print("❌ No database URL provided")
        return None, None
    
    return config['env_var'], database_url

def update_env_file(env_var, database_url):
    env_file = Path(__file__).parent.parent / '.env'
    env_example = Path(__file__).parent.parent / '.env.example'
    
    # Create .env from .env.example if it doesn't exist
    if not env_file.exists() and env_example.exists():
        print("📄 Creating .env file from .env.example...")
        with open(env_example, 'r') as f:
            content = f.read()
        with open(env_file, 'w') as f:
            f.write(content)
    
    # Read current .env content
    if env_file.exists():
        with open(env_file, 'r') as f:
            lines = f.readlines()
    else:
        lines = []
    
    # Update or add the database URL
    updated = False
    for i, line in enumerate(lines):
        if line.startswith(f'{env_var}='):
            lines[i] = f'{env_var}={database_url}\n'
            updated = True
            break
    
    if not updated:
        lines.append(f'{env_var}={database_url}\n')
    
    # Write back to .env file
    with open(env_file, 'w') as f:
        f.writelines(lines)
    
    print(f"✅ Updated .env file with {env_var}")

def main():
    print_header()
    
    print("This script will help you set up a cloud database for TradeFlowAI.")
    print("You'll need to create an account with your chosen provider first.")
    print()
    
    print_provider_info()
    
    choice = get_user_choice()
    if choice is None:
        print("Setup cancelled.")
        return
    
    env_var, database_url = get_database_url(choice)
    if not database_url:
        print("Setup cancelled.")
        return
    
    # Update .env file
    try:
        update_env_file(env_var, database_url)
        print()
        print("🎉 Cloud database configuration completed!")
        print()
        print("Next steps:")
        print("1. Run the migration script: python backend/scripts/migrate_to_cloud.py")
        print("2. Test your application with the cloud database")
        print("3. Deploy your application")
        print()
        print("For detailed setup instructions, see: backend/docs/cloud-database-setup.md")
        
    except Exception as e:
        print(f"❌ Error updating .env file: {e}")
        print(f"Please manually add this line to your .env file:")
        print(f"{env_var}={database_url}")

if __name__ == "__main__":
    main()