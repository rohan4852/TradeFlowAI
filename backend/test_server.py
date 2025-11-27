#!/usr/bin/env python3
"""
Simple test script to verify the server is working
"""
import requests
import json

def test_server():
    """Test basic server functionality"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing AI Trading Backend Server...")
    print("=" * 50)
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check: PASSED")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check: FAILED (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Health check: FAILED (Error: {e})")
    
    # Test 2: API Documentation
    try:
        response = requests.get(f"{base_url}/docs", timeout=5)
        if response.status_code == 200:
            print("✅ API Documentation: ACCESSIBLE")
            print(f"   URL: {base_url}/docs")
        else:
            print(f"❌ API Documentation: FAILED (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ API Documentation: FAILED (Error: {e})")
    
    # Test 3: Market data endpoint (if available)
    try:
        response = requests.get(f"{base_url}/api/v1/market/quote/AAPL", timeout=10)
        if response.status_code == 200:
            print("✅ Market Data: WORKING")
            data = response.json()
            print(f"   AAPL Price: ${data.get('price', 'N/A')}")
        else:
            print(f"⚠️  Market Data: Limited (Status: {response.status_code})")
    except Exception as e:
        print(f"⚠️  Market Data: Limited (Error: {e})")
    
    print("=" * 50)
    print("🎉 Server test completed!")
    print(f"📊 Access your trading platform at: {base_url}")
    print(f"📖 API Documentation: {base_url}/docs")

if __name__ == "__main__":
    test_server()