#!/usr/bin/env python3
"""
Supabase Database Setup Guide
Interactive setup for Supabase PostgreSQL
"""

def print_header():
    print("=" * 60)
    print("🚀 Supabase Database Setup for TradeFlowAI")
    print("=" * 60)
    print()

def print_instructions():
    print("📋 Step-by-Step Supabase Setup:")
    print()
    print("1. 🌐 Go to https://supabase.com")
    print("2. 📝 Create a free account (if you don't have one)")
    print("3. ➕ Click 'New Project'")
    print("4. 📊 Fill in project details:")
    print("   - Name: TradeFlowAI")
    print("   - Database Password: (create a strong password)")
    print("   - Region: Choose closest to you")
    print("5. ⏳ Wait for project to be created (1-2 minutes)")
    print("6. ⚙️  Go to Settings > Database")
    print("7. 📋 Copy the connection string")
    print()
    print("🔗 The connection string should look like:")
    print("postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres")
    print()

def get_supabase_url():
    print_instructions()
    
    print("📝 Enter your Supabase connection string:")
    print("(Paste the full URL from Supabase Settings > Database)")
    print()
    
    while True:
        url = input("Supabase URL: ").strip()
        
        if not url:
            print("❌ Please enter a URL")
            continue
            
        if not url.startswith("postgresql://"):
            print("❌ URL should start with 'postgresql://'")
            continue
            
        if "supabase.co" not in url:
            print("❌ This doesn't look like a Supabase URL")
            continue
            
        return url

def update_env_file(supabase_url):
    """Update .env file with Supabase URL"""
    import os
    from pathlib import Path
    
    env_file = Path("backend/.env")
    
    # Read current .env content
    if env_file.exists():
        with open(env_file, 'r') as f:
            lines = f.readlines()
    else:
        print("❌ .env file not found. Please run from project root directory.")
        return False
    
    # Update or add Supabase URL
    updated = False
    new_lines = []
    
    for line in lines:
        if line.startswith("SUPABASE_DATABASE_URL="):
            new_lines.append(f"SUPABASE_DATABASE_URL={supabase_url}\n")
            updated = True
        elif line.startswith("RAILWAY_DATABASE_URL="):
            # Comment out Railway URL
            new_lines.append(f"# {line}")
        else:
            new_lines.append(line)
    
    # Add Supabase URL if not found
    if not updated:
        new_lines.append(f"\n# Supabase Database Configuration\n")
        new_lines.append(f"SUPABASE_DATABASE_URL={supabase_url}\n")
    
    # Write back to .env file
    with open(env_file, 'w') as f:
        f.writelines(new_lines)
    
    print("✅ Updated .env file with Supabase URL")
    return True

def main():
    print_header()
    
    print("🎯 Why Supabase?")
    print("- ✅ Easy setup (5 minutes)")
    print("- ✅ Free tier: 500MB storage")
    print("- ✅ Built-in authentication")
    print("- ✅ Real-time features")
    print("- ✅ Reliable external connections")
    print("- ✅ Great dashboard and tools")
    print()
    
    # Get Supabase URL
    supabase_url = get_supabase_url()
    
    # Update .env file
    if update_env_file(supabase_url):
        print()
        print("🎉 Supabase configuration completed!")
        print()
        print("📋 Next steps:")
        print("1. Test connection: python backend/test_supabase.py")
        print("2. Create tables: python backend/scripts/migrate_to_cloud.py")
        print("3. Start your app: uvicorn app.main:app --reload")
        print()
        print("💡 Pro tip: Supabase also provides:")
        print("- Built-in user authentication")
        print("- Real-time subscriptions")
        print("- Storage for files")
        print("- Edge functions")

if __name__ == "__main__":
    main()