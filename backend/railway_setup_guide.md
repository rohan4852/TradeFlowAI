# 🚂 Railway Database Setup Guide

## Issue: Internal vs External Database URL

The database URL you entered uses `postgres.railway.internal` which only works from within Railway's network. You need the **external** connection string for local development.

## ✅ How to Get the Correct Railway Database URL

### Step 1: Go to Railway Dashboard
1. Visit [railway.app](https://railway.app)
2. Log into your account
3. Select your project

### Step 2: Get External Database URL
1. Click on your **PostgreSQL service**
2. Go to the **Variables** tab
3. Look for these variables:
   - `DATABASE_URL` (this is the external URL you need)
   - `PGHOST` (external hostname)
   - `PGPORT` (usually 5432)
   - `PGDATABASE` (database name)
   - `PGUSER` (username)
   - `PGPASSWORD` (password)

### Step 3: Copy the Correct URL
The external URL should look like:
```
postgresql://postgres:[password]@[external-host].railway.app:5432/railway
```

**NOT** like this (internal):
```
postgresql://postgres:[password]@postgres.railway.internal:5432/railway
```

### Step 4: Update Your .env File
Replace the current `RAILWAY_DATABASE_URL` in your `.env` file with the external URL.

## 🔧 Alternative: Manual Connection String

If you can't find the `DATABASE_URL` variable, create it manually:

```
postgresql://[PGUSER]:[PGPASSWORD]@[PGHOST]:[PGPORT]/[PGDATABASE]
```

Example:
```
postgresql://postgres:wjfPNTlKlQwZfYTfMzeqrhSmHCopiIza@containers-us-west-123.railway.app:5432/railway
```

## 🧪 Test Your Connection

After updating the URL, test it:

```bash
cd backend
python test_db_connection.py
```

## 🆘 Still Having Issues?

### Option 1: Use Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and connect
railway login
railway link [your-project-id]

# Get database URL
railway variables
```

### Option 2: Check Railway Dashboard
1. Go to your PostgreSQL service
2. Click "Connect"
3. Copy the "External Connection" string

### Option 3: Try a Different Provider
If Railway continues to have issues, consider:
- **Supabase**: Easy setup, free tier
- **Render**: Simple PostgreSQL hosting
- **Neon**: Serverless PostgreSQL

## 📝 Next Steps

Once you have the correct external URL:

1. Update your `.env` file
2. Run `python test_db_connection.py`
3. If successful, run `python scripts/migrate_to_cloud.py`
4. Start your application with `uvicorn app.main:app --reload`