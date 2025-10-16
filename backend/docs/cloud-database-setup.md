# Cloud Database Setup Guide

This guide will help you migrate from a local PostgreSQL database to a cloud-hosted database for your TradeFlowAI application.

## Recommended Cloud Database Providers

### 1. Supabase (Recommended)
**Best for**: Beginners, free tier, built-in auth and real-time features

**Setup Steps:**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Add to your `.env` file:
   ```
   SUPABASE_DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   ```

**Pros:**
- Free tier with 500MB storage
- Built-in authentication
- Real-time subscriptions
- Easy to use dashboard

### 2. Railway
**Best for**: Simple deployment, automatic scaling

**Setup Steps:**
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL service
4. Copy the connection string from variables
5. Add to your `.env` file:
   ```
   RAILWAY_DATABASE_URL=postgresql://postgres:[password]@[host].railway.app:5432/railway
   ```

**Pros:**
- Simple deployment
- Automatic scaling
- Good free tier

### 3. Render
**Best for**: Free hosting, simple setup

**Setup Steps:**
1. Go to [render.com](https://render.com)
2. Create a new PostgreSQL database
3. Copy the connection string
4. Add to your `.env` file:
   ```
   RENDER_DATABASE_URL=postgresql://[username]:[password]@[host].render.com/[database]
   ```

**Pros:**
- Free tier available
- Easy setup
- Good for small applications

### 4. AWS RDS
**Best for**: Enterprise applications, advanced features

**Setup Steps:**
1. Go to AWS Console > RDS
2. Create a new PostgreSQL database
3. Configure security groups
4. Get the endpoint and credentials
5. Add to your `.env` file:
   ```
   AWS_RDS_URL=postgresql://[username]:[password]@[endpoint].rds.amazonaws.com:5432/[database]
   ```

**Pros:**
- Highly scalable
- Advanced monitoring
- Enterprise features

## Migration Steps

### 1. Backup Your Local Database (if you have data)
```bash
pg_dump -h localhost -U tradeflow -d tradeflowai > backup.sql
```

### 2. Update Environment Variables
Copy your chosen database URL to your `.env` file:
```bash
cp backend/.env.example backend/.env
# Edit the .env file with your cloud database URL
```

### 3. Install Dependencies (if not already installed)
```bash
cd backend
pip install psycopg2-binary asyncpg databases[postgresql]
```

### 4. Test Connection
```bash
cd backend
python -c "
import asyncio
from app.database.connection import connect_database
asyncio.run(connect_database())
print('Database connection successful!')
"
```

### 5. Create Tables
```bash
cd backend
python -c "
import asyncio
from app.database.connection import create_tables
asyncio.run(create_tables())
print('Tables created successfully!')
"
```

### 6. Restore Data (if you have a backup)
```bash
# For cloud databases, use the cloud provider's tools or:
psql [your-cloud-database-url] < backup.sql
```

## Environment Variables Reference

Add ONE of these to your `.env` file:

```bash
# Supabase
SUPABASE_DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Railway  
RAILWAY_DATABASE_URL=postgresql://postgres:[password]@[host].railway.app:5432/railway

# Render
RENDER_DATABASE_URL=postgresql://[username]:[password]@[host].render.com/[database]

# Heroku
HEROKU_POSTGRESQL_URL=postgres://[username]:[password]@[host].compute-1.amazonaws.com:5432/[database]

# AWS RDS
AWS_RDS_URL=postgresql://[username]:[password]@[endpoint].rds.amazonaws.com:5432/[database]

# Google Cloud SQL
GOOGLE_CLOUD_SQL_URL=postgresql://[username]:[password]@[ip-address]:5432/[database]

# Azure
AZURE_DATABASE_URL=postgresql://[username]:[password]@[server].postgres.database.azure.com:5432/[database]
```

## Security Best Practices

1. **Use SSL**: All cloud providers support SSL connections
2. **Restrict IP Access**: Configure firewall rules to only allow your application
3. **Use Strong Passwords**: Generate secure passwords for database users
4. **Environment Variables**: Never commit database URLs to version control
5. **Connection Pooling**: The updated connection.py includes optimized pooling settings

## Troubleshooting

### Connection Issues
- Verify the database URL format
- Check firewall/security group settings
- Ensure SSL is properly configured
- Test connection from your local machine first

### Performance Issues
- Monitor connection pool usage
- Adjust pool settings in `connection.py`
- Consider read replicas for high-traffic applications

### SSL Certificate Issues
```python
# If you encounter SSL issues, you can modify connect_args:
"connect_args": {
    "sslmode": "require",
    "sslcert": "path/to/client-cert.pem",
    "sslkey": "path/to/client-key.pem",
    "sslrootcert": "path/to/ca-cert.pem"
}
```

## Cost Optimization

1. **Start with Free Tiers**: Most providers offer generous free tiers
2. **Monitor Usage**: Set up billing alerts
3. **Optimize Queries**: Use indexes and efficient queries
4. **Connection Pooling**: Reduces connection overhead
5. **Scheduled Backups**: Use provider backup services

## Next Steps

After setting up your cloud database:

1. Update your deployment configuration
2. Set up monitoring and alerts
3. Configure automated backups
4. Test your application thoroughly
5. Consider setting up a staging environment

For production deployments, consider:
- Database replicas for high availability
- Connection pooling optimization
- Monitoring and alerting
- Automated backup strategies