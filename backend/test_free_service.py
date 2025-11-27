#!/usr/bin/env python3
"""
Test script for the free market data service
Run this to verify data fetching works without API keys
"""
import asyncio
import sys
import os
from pathlib import Path

# Add backend to path
backend_root = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_root))

try:
    from app.services.free_market_data_service import free_market_data_service
except ImportError as e:
    print(f"Import error: {e}")
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "aiohttp"])
    from app.services.free_market_data_service import free_market_data_service

async def test_free_service():
    """Test the free market data service"""
    print("🆓 Testing Free Market Data Service (No API Keys Required)...")
    
    try:
        # Start the service
        await free_market_data_service.start()
        print("✅ Free service started successfully")
        
        # Test symbols
        test_symbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "BTC-USD", "EURUSD=X"]
        
        for symbol in test_symbols:
            print(f"\n📊 Testing {symbol}...")
            try:
                quote = await free_market_data_service.get_quote(symbol)
                if quote:
                    print(f"✅ {symbol}: ${quote.price:.2f} ({quote.change_percent:+.2f}%) - Source: {quote.source}")
                else:
                    print(f"❌ {symbol}: No data received")
            except Exception as e:
                print(f"❌ {symbol}: Error - {e}")
        
        # Test historical data
        print(f"\n📈 Testing historical data for AAPL...")
        try:
            hist_data = await free_market_data_service.get_historical_data("AAPL", "1d", "5m")
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
        status = free_market_data_service.get_service_status()
        print(f"   Running: {status['is_running']}")
        print(f"   Cached symbols: {status['cached_symbols']}")
        print(f"   Available sources: {status['sources']}")
        
        # Test cache functionality
        print(f"\n🔄 Testing cache functionality...")
        start_time = asyncio.get_event_loop().time()
        quote1 = await free_market_data_service.get_quote("AAPL")
        mid_time = asyncio.get_event_loop().time()
        quote2 = await free_market_data_service.get_quote("AAPL")  # Should be cached
        end_time = asyncio.get_event_loop().time()
        
        print(f"   First call: {(mid_time - start_time)*1000:.1f}ms")
        print(f"   Cached call: {(end_time - mid_time)*1000:.1f}ms")
        print(f"   Cache working: {'✅' if (end_time - mid_time) < 0.01 else '❌'}")
        
    except Exception as e:
        print(f"❌ Service test failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Stop the service
        await free_market_data_service.stop()
        print("\n🛑 Free service stopped")

if __name__ == "__main__":
    asyncio.run(test_free_service())