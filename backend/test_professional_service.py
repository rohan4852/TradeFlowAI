#!/usr/bin/env python3
"""
Test script for the professional data service
Run this to verify data fetching works before starting the full server
"""
import asyncio
import sys
import os
from pathlib import Path

# Add backend to path
backend_root = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_root))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

try:
    from app.services.professional_data_service import professional_data_service
except ImportError as e:
    print(f"Import error: {e}")
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "yfinance", "aiohttp", "python-dotenv"])
    from app.services.professional_data_service import professional_data_service

async def test_data_service():
    """Test the professional data service"""
    print("🚀 Testing Professional Data Service...")
    
    try:
        # Start the service
        await professional_data_service.start()
        print("✅ Service started successfully")
        
        # Test symbols
        test_symbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "BTC-USD", "EURUSD=X"]
        7
        for symbol in test_symbols:
            print(f"\n📊 Testing {symbol}...")
            try:
                quote = await professional_data_service.get_quote(symbol)
                if quote:
                    print(f"✅ {symbol}: ${quote.price:.2f} ({quote.change_percent:+.2f}%) - Source: {quote.source}")
                else:
                    print(f"❌ {symbol}: No data received")
            except Exception as e:
                print(f"❌ {symbol}: Error - {e}")
        
        # Test historical data
        print(f"\n📈 Testing historical data for AAPL...")
        try:
            hist_data = await professional_data_service.get_historical_data("AAPL", "1d", "5m")
            if hist_data:
                print(f"✅ Historical data: {len(hist_data)} data points")
                if len(hist_data) > 0:
                    latest = hist_data[-1]
                    print(f"   Latest: {latest['timestamp']} - Close: ${latest['close']:.2f}")
            else:
                print("❌ No historical data received")
        except Exception as e:
            print(f"❌ Historical data error: {e}")
        
        # Get service status
        print(f"\n📊 Service Status:")
        status = professional_data_service.get_service_status()
        print(f"   Running: {status['is_running']}")
        print(f"   Cached symbols: {status['cached_symbols']}")
        print(f"   Rate limits: {status['rate_limits']}")
        
    except Exception as e:
        print(f"❌ Service test failed: {e}")
    finally:
        # Stop the service
        await professional_data_service.stop()
        print("\n🛑 Service stopped")

if __name__ == "__main__":
    asyncio.run(test_data_service())