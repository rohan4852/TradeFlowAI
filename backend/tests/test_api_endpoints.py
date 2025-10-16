import pytest
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.connection import db_manager

@pytest.fixture
async def async_client():
    """Async test client fixture"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture
def test_client():
    """Sync test client fixture"""
    return TestClient(app)

class TestMarketDataEndpoints:
    """Test market data API endpoints"""
    
    def test_get_ohlcv_data(self, test_client):
        """Test OHLCV data retrieval"""
        response = test_client.get("/api/v1/market/ohlcv/AAPL")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if data:
            assert "timestamp" in data[0]
            assert "close" in data[0]
    
    def test_get_news_data(self, test_client):
        """Test news data retrieval"""
        response = test_client.get("/api/v1/market/news/AAPL?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 5
    
    def test_get_market_overview(self, test_client):
        """Test market overview endpoint"""
        response = test_client.get("/api/v1/market/market-overview")
        assert response.status_code == 200
        data = response.json()
        assert "indices" in data
        assert "market_sentiment" in data

class TestPredictionEndpoints:
    """Test AI prediction API endpoints"""
    
    @pytest.mark.asyncio
    async def test_generate_prediction(self, async_client):
        """Test AI prediction generation"""
        response = await async_client.post("/api/v1/predictions/predict/AAPL")
        assert response.status_code == 200
        data = response.json()
        assert "final_action" in data
        assert "final_confidence" in data
        assert data["final_action"] in ["BUY", "SELL", "HOLD"]
    
    def test_explain_prediction(self, test_client):
        """Test prediction explanation"""
        response = test_client.get("/api/v1/predictions/explain/AAPL")
        assert response.status_code == 200
        data = response.json()
        assert "explanation" in data
        assert "key_factors" in data["explanation"]
    
    def test_scenario_analysis(self, test_client):
        """Test scenario analysis"""
        response = test_client.get("/api/v1/predictions/scenarios/AAPL")
        assert response.status_code == 200
        data = response.json()
        assert "scenarios" in data
        assert len(data["scenarios"]) >= 3  # Bull, Base, Bear

class TestSocialTradingEndpoints:
    """Test social trading API endpoints"""
    
    def test_get_strategies(self, test_client):
        """Test community strategies retrieval"""
        response = test_client.get("/api/v1/social/strategies")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_leaderboard(self, test_client):
        """Test leaderboard retrieval"""
        response = test_client.get("/api/v1/social/leaderboard")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_sentiment_overview(self, test_client):
        """Test sentiment overview"""
        response = test_client.get("/api/v1/social/sentiment-overview")
        assert response.status_code == 200
        data = response.json()
        assert "overall_sentiment" in data
        assert "trending_tickers" in data

class TestTradingToolsEndpoints:
    """Test trading tools API endpoints"""
    
    def test_get_alerts(self, test_client):
        """Test alerts retrieval"""
        response = test_client.get("/api/v1/tools/alerts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_create_alert(self, test_client):
        """Test alert creation"""
        response = test_client.post(
            "/api/v1/tools/alerts",
            params={
                "ticker": "AAPL",
                "condition": "price_above",
                "target_value": 150.0
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "alert" in data
    
    def test_paper_trading_portfolios(self, test_client):
        """Test paper trading portfolios"""
        response = test_client.get("/api/v1/tools/paper-trading/portfolios")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_stock_screener(self, test_client):
        """Test stock screener"""
        response = test_client.get("/api/v1/tools/screener?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert len(data["results"]) <= 10

class TestStreamingEndpoints:
    """Test real-time streaming endpoints"""
    
    def test_streaming_status(self, test_client):
        """Test streaming status"""
        response = test_client.get("/api/v1/streaming/status")
        assert response.status_code == 200
        data = response.json()
        assert "active_connections" in data
        assert "streaming_tasks" in data
    
    def test_start_live_predictions(self, test_client):
        """Test starting live predictions"""
        response = test_client.post(
            "/api/v1/streaming/live-predictions/start",
            json={"tickers": ["AAPL", "MSFT"]}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "tickers" in data

class TestComputerVisionEndpoints:
    """Test computer vision API endpoints"""
    
    def test_pattern_templates(self, test_client):
        """Test pattern templates retrieval"""
        response = test_client.get("/api/v1/computer-vision/pattern-templates")
        assert response.status_code == 200
        data = response.json()
        assert "patterns" in data
        assert data["success"] is True

class TestBrokerIntegrationEndpoints:
    """Test broker integration endpoints"""
    
    def test_supported_brokers(self, test_client):
        """Test supported brokers list"""
        response = test_client.get("/api/v1/broker/supported-brokers")
        assert response.status_code == 200
        data = response.json()
        assert "brokers" in data
        assert data["success"] is True

class TestSecurityEndpoints:
    """Test security API endpoints"""
    
    def test_validate_password(self, test_client):
        """Test password validation"""
        response = test_client.post(
            "/api/v1/security/validate-password",
            json={"password": "TestPassword123!"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "validation" in data
        assert "strength" in data["validation"]

class TestErrorHandling:
    """Test error handling and edge cases"""
    
    def test_invalid_ticker(self, test_client):
        """Test handling of invalid ticker symbols"""
        response = test_client.get("/api/v1/market/ohlcv/INVALID")
        # Should handle gracefully, either 404 or empty data
        assert response.status_code in [200, 404, 500]
    
    def test_rate_limiting(self, test_client):
        """Test rate limiting (if implemented)"""
        # Make multiple rapid requests
        responses = []
        for _ in range(10):
            response = test_client.get("/api/v1/market/market-overview")
            responses.append(response.status_code)
        
        # Should not fail catastrophically
        assert all(code in [200, 429, 500] for code in responses)
    
    def test_malformed_requests(self, test_client):
        """Test handling of malformed requests"""
        response = test_client.post(
            "/api/v1/predictions/predict/AAPL",
            json={"invalid": "data"}
        )
        # Should handle gracefully
        assert response.status_code in [200, 400, 422]

@pytest.mark.integration
class TestIntegrationScenarios:
    """Integration tests for complete workflows"""
    
    @pytest.mark.asyncio
    async def test_complete_trading_workflow(self, async_client):
        """Test complete trading workflow"""
        # 1. Get market data
        market_response = await async_client.get("/api/v1/market/ohlcv/AAPL")
        assert market_response.status_code == 200
        
        # 2. Generate prediction
        prediction_response = await async_client.post("/api/v1/predictions/predict/AAPL")
        assert prediction_response.status_code == 200
        
        # 3. Get explanation
        explain_response = await async_client.get("/api/v1/predictions/explain/AAPL")
        assert explain_response.status_code == 200
        
        # 4. Check portfolio (if available)
        portfolio_response = await async_client.get("/api/v1/tools/paper-trading/portfolios")
        assert portfolio_response.status_code == 200
    
    def test_data_consistency(self, test_client):
        """Test data consistency across endpoints"""
        # Get market overview
        overview_response = test_client.get("/api/v1/market/market-overview")
        assert overview_response.status_code == 200
        
        # Get individual ticker data for tickers in overview
        overview_data = overview_response.json()
        if "top_movers" in overview_data and "gainers" in overview_data["top_movers"]:
            for gainer in overview_data["top_movers"]["gainers"][:2]:  # Test first 2
                ticker = gainer["ticker"]
                ticker_response = test_client.get(f"/api/v1/market/ohlcv/{ticker}")
                # Should be able to get data for tickers mentioned in overview
                assert ticker_response.status_code in [200, 404]  # 404 acceptable for some tickers

if __name__ == "__main__":
    pytest.main([__file__, "-v"])