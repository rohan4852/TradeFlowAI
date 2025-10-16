# 🚀 Quick Cloud Database Setup

## Option 1: Interactive Setup (Recommended)
```bash
cd backend
python scripts/setup_cloud_db.py
```

## Option 2: Manual Setup

### 1. Choose a Provider & Get Database URL

**Supabase (Recommended for beginners):**
- Go to [supabase.com](https://supabase.com)
- Create project → Settings → Database
- Copy connection string

**Railway (Simple deployment):**
- Go to [railway.app](https://railway.app) 
- Create project → Add PostgreSQL → Copy DATABASE_URL

**Render (Free tier):**
- Go to [render.com](https://render.com)
- Create PostgreSQL database → Copy connection string

### 2. Update Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit .env and add ONE of these:
SUPABASE_DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
RAILWAY_DATABASE_URL=postgresql://postgres:[password]@[host].railway.app:5432/railway  
RENDER_DATABASE_URL=postgresql://[username]:[password]@[host].render.com/[database]
```

### 3. Run Migration
```bash
python scripts/migrate_to_cloud.py
```

### 4. Test Your App
```bash
uvicorn app.main:app --reload
```

## 🆘 Need Help?
- See detailed guide: `docs/cloud-database-setup.md`
- Check connection: `python scripts/migrate_to_cloud.py`
- Issues? Verify your database URL format and credentials

## 💡 Pro Tips
- Start with Supabase free tier (500MB)
- Use SSL connections (automatically configured)
- Set up backups through your provider
- Monitor usage to avoid unexpected costs