from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime
from ..models.market_data import OHLCVData, NewsArticle, SocialSentiment, ESGScore
from ..services.data_integration import MultiSourceDataIntegrator, NewsDataIntegrator, SentimentDataIntegrator
from ..services.realtime_market_data import realtime_service, AssetType, RealTimeQuote
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Dependency injection
def get_data_integrator():
    return MultiSourceDataIntegrator()

def get_news_integrator():
    return NewsDataIntegrator()

def get_sentiment_integrator():
    return SentimentDataIntegrator()

def get_realtime_service():
    return realtime_service

@router.get("/ohlcv/{ticker}", response_model=List[OHLCVData])
async def get_ohlcv_data(
    ticker: str,
    period: str = Query("1y", description="Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, max)"),
    interval: str = Query("1d", description="Data interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)"),
    integrator: MultiSourceDataIntegrator = Depends(get_data_integrator)
):
    """Get OHLCV data from multiple sources with quality scoring"""
    try:
        logger.info(f"Fetching OHLCV data for {ticker}, period: {period}, interval: {interval}")
        data = await integrator.get_ohlcv_data(ticker.upper(), period, interval)
        
        if not data:
            raise HTTPException(status_code=404, detail=f"No data found for ticker {ticker}")
        
        logger.info(f"Successfully retrieved {len(data)} data points for {ticker}")
        return data
    
    except Exception as e:
        logger.error(f"Error fetching OHLCV data for {ticker}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch data: {str(e)}")

@router.get("/news/{ticker}", response_model=List[NewsArticle])
async def get_news_data(
    ticker: str,
    limit: int = Query(10, ge=1, le=100, description="Number of articles to return"),
    integrator: NewsDataIntegrator = Depends(get_news_integrator)
):
    """Get news articles for a specific ticker"""
    try:
        logger.info(f"Fetching news data for {ticker}, limit: {limit}")
        news = await integrator.get_news_data(ticker.upper(), limit)
        
        logger.info(f"Successfully retrieved {len(news)} news articles for {ticker}")
        return news
    
    except Exception as e:
        logger.error(f"Error fetching news data for {ticker}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch news: {str(e)}")

@router.get("/sentiment/{ticker}", response_model=List[SocialSentiment])
async def get_sentiment_data(
    ticker: str,
    hours_back: int = Query(24, ge=1, le=168, description="Hours of historical sentiment data"),
    integrator: SentimentDataIntegrator = Depends(get_sentiment_integrator)
):
    """Get social media sentiment for a specific ticker"""
    try:
        logger.info(f"Fetching sentiment data for {ticker}, hours_back: {hours_back}")
        sentiment = await integrator.get_sentiment_data(ticker.upper(), hours_back)
        
        logger.info(f"Successfully retrieved {len(sentiment)} sentiment data points for {ticker}")
        return sentiment
    
    except Exception as e:
        logger.error(f"Error fetching sentiment data for {ticker}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch sentiment: {str(e)}")

@router.get("/market-overview")
async def get_market_overview(service = Depends(get_realtime_service)):
    """Get overall market overview with key indices and sentiment"""
    try:
        # Fetch real-time data for major indices
        indices_symbols = ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX']
        indices_data = {}
        
        for symbol in indices_symbols:
            try:
                quote = await service.get_quote(symbol, AssetType.INDEX)
                if quote:
                    indices_data[symbol] = {
                        "price": quote.price,
                        "change": quote.change,
                        "change_percent": quote.change_percent,
                        "volume": quote.volume
                    }
            except Exception as e:
                logger.warning(f"Failed to fetch data for {symbol}: {e}")
        
        # Fetch top movers from popular stocks
        popular_stocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX']
        stock_changes = []
        
        for symbol in popular_stocks:
            try:
                quote = await service.get_quote(symbol, AssetType.STOCK)
                if quote:
                    stock_changes.append({
                        "ticker": symbol,
                        "change_percent": quote.change_percent,
                        "price": quote.price
                    })
            except Exception as e:
                logger.warning(f"Failed to fetch data for {symbol}: {e}")
        
        # Sort by change percentage
        stock_changes.sort(key=lambda x: x['change_percent'], reverse=True)
        gainers = [stock for stock in stock_changes if stock['change_percent'] > 0][:5]
        losers = [stock for stock in stock_changes if stock['change_percent'] < 0][-5:]
        
        # Calculate market sentiment based on VIX and overall market performance
        vix_data = indices_data.get('^VIX', {})
        sp500_data = indices_data.get('^GSPC', {})
        
        # Simple sentiment calculation
        market_sentiment = 0.0
        if vix_data and sp500_data:
            vix_level = vix_data.get('price', 20)
            sp500_change = sp500_data.get('change_percent', 0)
            
            # Lower VIX = higher sentiment, positive S&P change = higher sentiment
            vix_sentiment = max(0, min(1, (30 - vix_level) / 20))  # Normalize VIX (10-30 range)
            sp500_sentiment = max(-1, min(1, sp500_change / 2))  # Normalize S&P change
            
            market_sentiment = (vix_sentiment + sp500_sentiment) / 2
        
        return {
            "indices": indices_data,
            "market_sentiment": {
                "overall": round(market_sentiment, 3),
                "vix_level": vix_data.get('price', 0),
                "sp500_change": sp500_data.get('change_percent', 0),
                "last_updated": datetime.now().isoformat()
            },
            "top_movers": {
                "gainers": gainers,
                "losers": losers
            },
            "market_status": "open" if datetime.now().weekday() < 5 else "closed"
        }
        
    except Exception as e:
        logger.error(f"Error fetching market overview: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch market overview: {str(e)}")

@router.get("/esg/{ticker}", response_model=ESGScore)
async def get_esg_score(ticker: str):
    """Get ESG (Environmental, Social, Governance) scores for a ticker"""
    try:
        # Placeholder ESG data
        return ESGScore(
            ticker=ticker.upper(),
            environmental_score=75.0,
            social_score=68.0,
            governance_score=82.0,
            overall_score=75.0,
            provider="Sample ESG Provider",
            last_updated=datetime.now()
        )
    except Exception as e:
        logger.error(f"Error fetching ESG data for {ticker}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch ESG data: {str(e)}")

@router.get("/realtime/quote/{symbol}")
async def get_realtime_quote(
    symbol: str,
    asset_type: AssetType = Query(AssetType.STOCK, description="Asset type"),
    service = Depends(get_realtime_service)
):
    """Get real-time quote for any asset type"""
    try:
        quote = await service.get_quote(symbol.upper(), asset_type)
        if not quote:
            raise HTTPException(status_code=404, detail=f"No quote found for {symbol}")
        
        return {
            "symbol": quote.symbol,
            "asset_type": quote.asset_type,
            "price": quote.price,
            "change": quote.change,
            "change_percent": quote.change_percent,
            "volume": quote.volume,
            "bid": quote.bid,
            "ask": quote.ask,
            "high_24h": quote.high_24h,
            "low_24h": quote.low_24h,
            "open_price": quote.open_price,
            "previous_close": quote.previous_close,
            "market_cap": quote.market_cap,
            "timestamp": quote.timestamp,
            "provider": quote.provider
        }
    except Exception as e:
        logger.error(f"Error fetching real-time quote for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch quote: {str(e)}")

@router.get("/realtime/historical/{symbol}")
async def get_realtime_historical(
    symbol: str,
    asset_type: AssetType = Query(AssetType.STOCK, description="Asset type"),
    period: str = Query("1d", description="Time period"),
    interval: str = Query("1m", description="Data interval"),
    service = Depends(get_realtime_service)
):
    """Get historical data for real-time charting"""
    try:
        data = await service.get_historical_data(symbol.upper(), asset_type, period, interval)
        
        return {
            "symbol": symbol.upper(),
            "asset_type": asset_type,
            "period": period,
            "interval": interval,
            "data": [
                {
                    "timestamp": item.timestamp.isoformat(),
                    "open": item.open,
                    "high": item.high,
                    "low": item.low,
                    "close": item.close,
                    "volume": item.volume
                }
                for item in data
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching historical data for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch historical data: {str(e)}")

@router.get("/realtime/supported-symbols")
async def get_supported_symbols(service = Depends(get_realtime_service)):
    """Get all supported symbols by asset type"""
    try:
        return service.get_supported_symbols()
    except Exception as e:
        logger.error(f"Error fetching supported symbols: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch supported symbols: {str(e)}")

@router.get("/realtime/market-status")
async def get_market_status(service = Depends(get_realtime_service)):
    """Get real-time market data service status"""
    try:
        return service.get_market_status()
    except Exception as e:
        logger.error(f"Error fetching market status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch market status: {str(e)}")

@router.get("/forex/pairs")
async def get_forex_pairs():
    """Get available forex currency pairs"""
    return {
        "major_pairs": [
            {"symbol": "EURUSD=X", "name": "EUR/USD", "description": "Euro to US Dollar"},
            {"symbol": "GBPUSD=X", "name": "GBP/USD", "description": "British Pound to US Dollar"},
            {"symbol": "USDJPY=X", "name": "USD/JPY", "description": "US Dollar to Japanese Yen"},
            {"symbol": "USDCHF=X", "name": "USD/CHF", "description": "US Dollar to Swiss Franc"},
            {"symbol": "AUDUSD=X", "name": "AUD/USD", "description": "Australian Dollar to US Dollar"},
            {"symbol": "USDCAD=X", "name": "USD/CAD", "description": "US Dollar to Canadian Dollar"}
        ],
        "minor_pairs": [
            {"symbol": "EURGBP=X", "name": "EUR/GBP", "description": "Euro to British Pound"},
            {"symbol": "EURJPY=X", "name": "EUR/JPY", "description": "Euro to Japanese Yen"},
            {"symbol": "GBPJPY=X", "name": "GBP/JPY", "description": "British Pound to Japanese Yen"}
        ],
        "inr_pairs": [
            {"symbol": "USDINR=X", "name": "USD/INR", "description": "US Dollar to Indian Rupee"},
            {"symbol": "EURINR=X", "name": "EUR/INR", "description": "Euro to Indian Rupee"},
            {"symbol": "GBPINR=X", "name": "GBP/INR", "description": "British Pound to Indian Rupee"},
            {"symbol": "JPYINR=X", "name": "JPY/INR", "description": "Japanese Yen to Indian Rupee"},
            {"symbol": "AUDINR=X", "name": "AUD/INR", "description": "Australian Dollar to Indian Rupee"},
            {"symbol": "CADINR=X", "name": "CAD/INR", "description": "Canadian Dollar to Indian Rupee"}
        ]
    }

@router.get("/crypto/pairs")
async def get_crypto_pairs():
    """Get available cryptocurrency pairs"""
    return {
        "major_crypto": [
            {"symbol": "BTC-USD", "name": "Bitcoin", "description": "Bitcoin to US Dollar"},
            {"symbol": "ETH-USD", "name": "Ethereum", "description": "Ethereum to US Dollar"},
            {"symbol": "ADA-USD", "name": "Cardano", "description": "Cardano to US Dollar"},
            {"symbol": "SOL-USD", "name": "Solana", "description": "Solana to US Dollar"},
            {"symbol": "DOT-USD", "name": "Polkadot", "description": "Polkadot to US Dollar"},
            {"symbol": "MATIC-USD", "name": "Polygon", "description": "Polygon to US Dollar"}
        ],
        "altcoins": [
            {"symbol": "LINK-USD", "name": "Chainlink", "description": "Chainlink to US Dollar"},
            {"symbol": "UNI-USD", "name": "Uniswap", "description": "Uniswap to US Dollar"},
            {"symbol": "AVAX-USD", "name": "Avalanche", "description": "Avalanche to US Dollar"}
        ]
    }

@router.get("/commodities/list")
async def get_commodities():
    """Get available commodities"""
    return {
        "precious_metals": [
            {"symbol": "GC=F", "name": "Gold", "description": "Gold Futures"},
            {"symbol": "SI=F", "name": "Silver", "description": "Silver Futures"},
            {"symbol": "PL=F", "name": "Platinum", "description": "Platinum Futures"}
        ],
        "energy": [
            {"symbol": "CL=F", "name": "Crude Oil", "description": "Crude Oil Futures"},
            {"symbol": "NG=F", "name": "Natural Gas", "description": "Natural Gas Futures"},
            {"symbol": "HO=F", "name": "Heating Oil", "description": "Heating Oil Futures"}
        ],
        "industrial_metals": [
            {"symbol": "HG=F", "name": "Copper", "description": "Copper Futures"},
            {"symbol": "PA=F", "name": "Palladium", "description": "Palladium Futures"}
        ]
    }

@router.get("/indices/list")
async def get_indices():
    """Get available market indices"""
    return {
        "us_indices": [
            {"symbol": "^GSPC", "name": "S&P 500", "description": "Standard & Poor's 500"},
            {"symbol": "^DJI", "name": "Dow Jones", "description": "Dow Jones Industrial Average"},
            {"symbol": "^IXIC", "name": "NASDAQ", "description": "NASDAQ Composite"},
            {"symbol": "^RUT", "name": "Russell 2000", "description": "Russell 2000 Small Cap"},
            {"symbol": "^VIX", "name": "VIX", "description": "Volatility Index"}
        ],
        "international_indices": [
            {"symbol": "^FTSE", "name": "FTSE 100", "description": "Financial Times Stock Exchange 100"},
            {"symbol": "^GDAXI", "name": "DAX", "description": "German Stock Index"},
            {"symbol": "^N225", "name": "Nikkei 225", "description": "Nikkei Stock Average"}
        ]
    }