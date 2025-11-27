#!/usr/bin/env python3
"""
Simplified main.py for AI Trading Backend
Minimal version that avoids rate limiting and API key issues
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Suppress noisy loggers
logging.getLogger('yfinance').setLevel(logging.ERROR)
logging.getLogger('urllib3').setLevel(logging.WARNING)
logging.getLogger('asyncio').setLevel(logging.WARNING)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Simplified lifespan handler"""
    logger.info("🚀 AI Trading Backend starting...")
    
    # Try to connect to database (optional)
    try:
        from app.database.connection import connect_database, create_tables
        await connect_database()
        await create_tables()
        logger.info("✅ Database connected")
    except Exception as e:
        logger.warning(f"⚠️  Database connection failed (continuing): {e}")
    
    # Start mock market data service
    try:
        from app.services.market_data_fix import fixed_market_service
        await fixed_market_service.start()
        logger.info("✅ Mock market data service started")
    except Exception as e:
        logger.warning(f"⚠️  Market data service failed (continuing): {e}")
    
    logger.info("🎉 Backend startup complete!")
    yield
    
    # Cleanup
    logger.info("🛑 Shutting down backend...")

# Create FastAPI app
app = FastAPI(
    title="AI Trading Backend",
    description="Simplified AI Trading Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI Trading Backend",
        "version": "1.0.0",
        "timestamp": "2024-01-01T00:00:00Z"
    }

# Basic market data endpoint
@app.get("/api/v1/market/quote/{symbol}")
async def get_quote(symbol: str):
    """Get market quote for a symbol"""
    try:
        from app.services.market_data_fix import fixed_market_service
        quote = await fixed_market_service.get_quote(symbol.upper())
        return {
            "success": True,
            "data": quote
        }
    except Exception as e:
        logger.error(f"Error getting quote for {symbol}: {e}")
        return {
            "success": False,
            "error": str(e),
            "data": {
                "symbol": symbol.upper(),
                "price": 0.0,
                "status": "error"
            }
        }

# Market overview endpoint
@app.get("/api/v1/market/overview")
async def market_overview():
    """Get market overview"""
    try:
        from app.services.market_data_fix import fixed_market_service
        symbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA"]
        quotes = await fixed_market_service.get_multiple_quotes(symbols)
        return {
            "success": True,
            "data": {
                "quotes": quotes,
                "timestamp": "2024-01-01T00:00:00Z"
            }
        }
    except Exception as e:
        logger.error(f"Error getting market overview: {e}")
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting AI Trading Backend (Simplified)...")
    print("📡 Server: http://localhost:8000")
    print("📖 Docs: http://localhost:8000/docs")
    print("🧪 Test: py test_server.py")
    
    uvicorn.run(
        "simple_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )