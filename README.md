# 🤖 AI Trading Platform V2.0

**Advanced AI-Powered Trading Intelligence Platform**

A comprehensive, enterprise-grade trading system that combines multi-source data integration, hybrid AI prediction models, real-time streaming, computer vision analysis, and social trading features.

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 **Key Features**

### **🧠 Hybrid AI Prediction Engine**
- **5 Model Types**: ARIMA, LSTM, Transformer, Reinforcement Learning, LLM
- **Ensemble Methods**: Dynamic weighting and consensus algorithms
- **Explainable AI**: Clear reasoning and factor importance scoring
- **Confidence Scoring**: Risk-adjusted predictions with scenario analysis

### **📊 Multi-Source Data Intelligence**
- **Price Data**: Yahoo Finance, Alpha Vantage, TradingView integration
- **News Analysis**: Multi-source news with sentiment analysis
- **Social Sentiment**: Twitter/X, Reddit, StockTwits integration
- **Alternative Data**: ESG scores, economic indicators, insider trading

### **🔴 Real-Time Processing**
- **WebSocket Streaming**: Live data distribution
- **Live Predictions**: Continuous AI model inference
- **Risk Monitoring**: Real-time portfolio risk assessment
- **Market Events**: Live news and sentiment updates

### **👁️ Computer Vision Analysis**
- **Chart Pattern Recognition**: Advanced OpenCV-based detection
- **Support/Resistance**: Automated level identification
- **Multimodal Analysis**: Combined chart, text, and social data
- **Technical Insights**: AI-powered trading recommendations

### **🏦 Broker Integration**
- **Live Trading**: Direct execution with Alpaca Markets
- **Paper Trading**: Risk-free strategy testing
- **Portfolio Sync**: Real-time position tracking
- **Risk Controls**: Automated position sizing and limits

### **🔒 Enterprise Security**
- **Multi-Factor Authentication**: JWT with session management
- **Threat Detection**: Real-time security monitoring
- **Audit Trails**: Comprehensive compliance logging
- **Data Encryption**: Advanced cryptographic protection

### **👥 Social Trading Platform**
- **Strategy Sharing**: Community-driven trading strategies
- **Leaderboards**: Performance-based rankings
- **Copy Trading**: Automated strategy following
- **Competitions**: Gamified trading challenges

## 🚀 **Quick Start**

### **Option 1: Simple Startup (Recommended)**

```bash
# Clone the repository
git clone <repository-url>
cd ai-trading-platform

# Configure environment
cp .env.example .env
# Edit .env with your API keys (especially GOOGLE_API_KEY for Gemini)

# Windows
start.bat

# Linux/Mac
./start.sh
```

### **Option 2: Docker Deployment**

```bash
# Start with Docker Compose
docker-compose up -d

# Access services
# Backend API: http://localhost:8000
# Frontend: http://localhost:5173
# API Docs: http://localhost:8000/docs
```

### **Option 3: Manual Setup**

1. **Prerequisites**:
   ```bash
   # Install Python 3.8+, Node.js 16+
   pip install -r backend/requirements.txt
   cd frontend/vite-project && npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys (GOOGLE_API_KEY is essential)
   ```

3. **Start Services**:
   ```bash
   # Backend
   cd backend
   uvicorn app.main:app --reload --port 8000
   
   # Frontend (in new terminal)
   cd frontend/vite-project
   npm run dev
   ```

## 📡 **API Endpoints**

### **Market Data**
- `GET /api/v1/market/ohlcv/{ticker}` - OHLCV data with technical indicators
- `GET /api/v1/market/news/{ticker}` - Multi-source news with sentiment
- `GET /api/v1/market/sentiment/{ticker}` - Social media sentiment analysis

### **AI Predictions**
- `POST /api/v1/predictions/predict/{ticker}` - Generate AI predictions
- `GET /api/v1/predictions/explain/{ticker}` - Explainable AI analysis
- `GET /api/v1/predictions/scenarios/{ticker}` - Scenario analysis

### **Real-Time Streaming**
- `WebSocket /api/v1/streaming/ws/{client_id}` - Live data streaming
- `POST /api/v1/streaming/live-predictions/start` - Start live predictions
- `POST /api/v1/streaming/risk-monitoring/start` - Risk monitoring

### **Computer Vision**
- `POST /api/v1/computer-vision/analyze-chart` - Chart pattern analysis
- `POST /api/v1/computer-vision/multimodal-analysis` - Multi-data analysis
- `POST /api/v1/computer-vision/support-resistance` - S/R level detection

### **Broker Integration**
- `POST /api/v1/broker/connect` - Connect to broker
- `POST /api/v1/broker/execute-ai-recommendation` - Execute AI trades
- `GET /api/v1/broker/positions` - Get current positions

### **Social Trading**
- `GET /api/v1/social/strategies` - Community strategies
- `GET /api/v1/social/leaderboard` - Performance rankings
- `POST /api/v1/social/copy-strategy/{id}` - Copy trading strategy

## 🔧 **Configuration**

### **Environment Variables**

```bash
# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/ai_trading
REDIS_URL=redis://localhost:6379

# API Keys
GOOGLE_API_KEY=your_gemini_api_key  # Primary AI model
NEWS_API_KEY=your_news_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
FINNHUB_API_KEY=your_finnhub_key

# Broker Integration
ALPACA_API_KEY=your_alpaca_key
ALPACA_SECRET_KEY=your_alpaca_secret
ALPACA_PAPER_TRADING=true

# Security
JWT_SECRET_KEY=your_jwt_secret
PASSWORD_MIN_LENGTH=12
```

## 🧪 **Testing**

```bash
# Run all tests
pytest backend/tests/ -v

# Test specific components
pytest backend/tests/test_api_endpoints.py -v

# Test API endpoints interactively
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/market/ohlcv/AAPL
```

## 📊 **Usage Examples**

### **1. Get Market Data**
```python
import requests

# Get OHLCV data
response = requests.get("http://localhost:8000/api/v1/market/ohlcv/AAPL")
data = response.json()

# Get news with sentiment
response = requests.get("http://localhost:8000/api/v1/market/news/AAPL?limit=5")
news = response.json()
```

### **2. Generate AI Predictions**
```python
# Generate prediction
response = requests.post("http://localhost:8000/api/v1/predictions/predict/AAPL")
prediction = response.json()

print(f"Action: {prediction['final_action']}")
print(f"Confidence: {prediction['final_confidence']:.2%}")
print(f"Target Price: ${prediction['final_target_price']:.2f}")
```

### **3. Analyze Chart Patterns**
```python
# Upload chart image for analysis
with open("chart.png", "rb") as f:
    files = {"image": f}
    response = requests.post(
        "http://localhost:8000/api/v1/computer-vision/analyze-chart",
        files=files
    )
    analysis = response.json()

print("Detected patterns:", analysis["analysis"]["patterns_detected"])
```

### **4. Real-Time Data Streaming**
```javascript
// WebSocket connection for real-time data
const ws = new WebSocket('ws://localhost:8000/api/v1/streaming/ws/client123?subscriptions=ticker:AAPL,market_overview');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Real-time update:', data);
};
```

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Redis Cache   │
                       └─────────────────┘
                                │
        ┌──────────────────────────────────────────────────┐
        │                AI Services                        │
        ├─────────────┬─────────────┬─────────────┬────────┤
        │ Prediction  │ Computer    │ Streaming   │ Broker │
        │ Engine      │ Vision      │ Engine      │ Agent  │
        └─────────────┴─────────────┴─────────────┴────────┘
```

## 🔒 **Security Features**

- **Authentication**: Multi-factor authentication with JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: AES-256 encryption for sensitive data
- **Audit Logging**: Comprehensive security event tracking
- **Rate Limiting**: API abuse prevention
- **Threat Detection**: Real-time security monitoring

## 📈 **Performance Metrics**

- **API Response Time**: < 200ms average
- **Uptime**: 99.9% target
- **Real-time Latency**: < 1 second
- **Prediction Accuracy**: > 65% directional accuracy
- **Data Quality**: > 95% accuracy across sources

## ⚠️ **Disclaimer**

**This platform is for educational and research purposes only.**

- **Not Financial Advice**: All predictions and recommendations are for informational purposes
- **Risk Warning**: Trading involves substantial risk of loss
- **Paper Trading**: Always test strategies with paper trading before using real money
- **Compliance**: Ensure compliance with local financial regulations
- **No Guarantees**: Past performance does not guarantee future results

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: Visit `http://localhost:8000/docs` for interactive API documentation
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Testing**: Use the comprehensive test suite in `backend/tests/`

---

**Built with ❤️ for the AI Trading Community**

*Transforming trading through artificial intelligence*