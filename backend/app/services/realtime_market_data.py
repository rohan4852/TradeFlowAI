import asyncio
import aiohttp
import websockets
import json
import logging
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
# Heavy libs imported lazily inside functions to avoid startup overhead

logger = logging.getLogger(__name__)

class AssetType(str, Enum):
    STOCK = "stock"
    FOREX = "forex"
    CRYPTO = "crypto"
    COMMODITY = "commodity"
    INDEX = "index"
    IPO = "ipo"
    BOND = "bond"
    OPTION = "option"
    FUTURE = "future"

class DataProvider(str, Enum):
    YAHOO_FINANCE = "yahoo_finance"
    ALPHA_VANTAGE = "alpha_vantage"
    FINNHUB = "finnhub"
    POLYGON = "polygon"
    IEX_CLOUD = "iex_cloud"
    BINANCE = "binance"
    COINBASE = "coinbase"
    FOREX_COM = "forex_com"
    TRADINGVIEW = "tradingview"

@dataclass
class RealTimeQuote:
    symbol: str
    asset_type: AssetType
    price: float
    change: float
    change_percent: float
    volume: int
    bid: Optional[float] = None
    ask: Optional[float] = None
    bid_size: Optional[int] = None
    ask_size: Optional[int] = None
    high_24h: Optional[float] = None
    low_24h: Optional[float] = None
    open_price: Optional[float] = None
    previous_close: Optional[float] = None
    market_cap: Optional[float] = None
    timestamp: datetime = None
    provider: DataProvider = DataProvider.YAHOO_FINANCE
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()

@dataclass
class OHLCVData:
    symbol: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int
    asset_type: AssetType
    provider: DataProvider

class RealTimeMarketDataService:
    """Comprehensive real-time market data service"""
    
    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = {}
        self.active_symbols: Dict[str, AssetType] = {}
        self.websocket_connections: Dict[DataProvider, Any] = {}
        self.data_cache: Dict[str, RealTimeQuote] = {}
        self.is_running = False
        
        # Asset class configurations
        self.asset_configs = {
            AssetType.STOCK: {
                "providers": [DataProvider.YAHOO_FINANCE, DataProvider.ALPHA_VANTAGE, DataProvider.FINNHUB],
                "update_interval": 1,  # seconds
                "symbols": ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA", "AMZN", "META", "NFLX"]
            },
            AssetType.FOREX: {
                "providers": [DataProvider.YAHOO_FINANCE, DataProvider.FOREX_COM],
                "update_interval": 1,
                "symbols": ["EURUSD=X", "GBPUSD=X", "USDJPY=X", "USDCHF=X", "AUDUSD=X", "USDCAD=X"]
            },
            AssetType.CRYPTO: {
                "providers": [DataProvider.BINANCE, DataProvider.COINBASE, DataProvider.YAHOO_FINANCE],
                "update_interval": 1,
                "symbols": ["BTC-USD", "ETH-USD", "ADA-USD", "SOL-USD", "DOT-USD", "MATIC-USD"]
            },
            AssetType.COMMODITY: {
                "providers": [DataProvider.YAHOO_FINANCE, DataProvider.ALPHA_VANTAGE],
                "update_interval": 5,
                "symbols": ["GC=F", "CL=F", "SI=F", "NG=F", "HG=F"]  # Gold, Oil, Silver, Natural Gas, Copper
            },
            AssetType.INDEX: {
                "providers": [DataProvider.YAHOO_FINANCE],
                "update_interval": 2,
                "symbols": ["^GSPC", "^DJI", "^IXIC", "^RUT", "^VIX"]
            }
        }
        # Provider health / circuit-breaker state to avoid hammering failing providers
        # Structure: { DataProvider: { 'failure_count': int, 'backoff_until': datetime | None } }
        self.provider_health: Dict[DataProvider, Dict[str, Any]] = {
            DataProvider.YAHOO_FINANCE: {'failure_count': 0, 'backoff_until': None}
        }
    
    async def start(self):
        """Start the real-time data service"""
        if self.is_running:
            return
        
        self.is_running = True
        logger.info("Starting real-time market data service...")
        
        # Start data fetching tasks for each asset class
        tasks = []
        for asset_type, config in self.asset_configs.items():
            task = asyncio.create_task(self._fetch_asset_class_data(asset_type, config))
            tasks.append(task)
        
        # Start WebSocket connections
        tasks.append(asyncio.create_task(self._start_websocket_connections()))
        
        await asyncio.gather(*tasks, return_exceptions=True)
    
    async def stop(self):
        """Stop the real-time data service"""
        self.is_running = False
        
        # Close WebSocket connections
        for provider, ws in self.websocket_connections.items():
            if ws:
                await ws.close()
        
        logger.info("Real-time market data service stopped")
    
    def subscribe(self, symbol: str, asset_type: AssetType, callback: Callable[[RealTimeQuote], None]):
        """Subscribe to real-time updates for a symbol"""
        key = f"{symbol}:{asset_type}"
        if key not in self.subscribers:
            self.subscribers[key] = []
        
        self.subscribers[key].append(callback)
        self.active_symbols[symbol] = asset_type
        
        # Send cached data if available
        if symbol in self.data_cache:
            callback(self.data_cache[symbol])
        
        logger.info(f"Subscribed to {symbol} ({asset_type})")
    
    def unsubscribe(self, symbol: str, asset_type: AssetType, callback: Callable):
        """Unsubscribe from real-time updates"""
        key = f"{symbol}:{asset_type}"
        if key in self.subscribers and callback in self.subscribers[key]:
            self.subscribers[key].remove(callback)
            
            if not self.subscribers[key]:
                del self.subscribers[key]
                if symbol in self.active_symbols:
                    del self.active_symbols[symbol]
        
        logger.info(f"Unsubscribed from {symbol} ({asset_type})")
    
    async def get_quote(self, symbol: str, asset_type: AssetType) -> Optional[RealTimeQuote]:
        """Get current quote for a symbol"""
        try:
            if asset_type == AssetType.STOCK or asset_type == AssetType.FOREX or asset_type == AssetType.CRYPTO:
                return await self._fetch_yahoo_quote(symbol, asset_type)
            elif asset_type == AssetType.COMMODITY:
                return await self._fetch_commodity_quote(symbol)
            elif asset_type == AssetType.INDEX:
                return await self._fetch_index_quote(symbol)
            else:
                logger.warning(f"Unsupported asset type: {asset_type}")
                return None
        except Exception as e:
            logger.error(f"Error fetching quote for {symbol}: {e}")
            return None
    
    async def get_historical_data(self, symbol: str, asset_type: AssetType, 
                                period: str = "1d", interval: str = "1m") -> List[OHLCVData]:
        """Get historical OHLCV data"""
        try:
            # Perform blocking yfinance call off the event loop
            def _fetch_history():
                import yfinance as yf
                stock = yf.Ticker(symbol)
                return stock.history(period=period, interval=interval)

            df = await asyncio.to_thread(_fetch_history)

            data: List[OHLCVData] = []
            for index, row in df.iterrows():
                data.append(OHLCVData(
                    symbol=symbol,
                    timestamp=index,
                    open=float(row['Open']),
                    high=float(row['High']),
                    low=float(row['Low']),
                    close=float(row['Close']),
                    volume=int(row['Volume']),
                    asset_type=asset_type,
                    provider=DataProvider.YAHOO_FINANCE
                ))

            return data
        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {e}")
            return []
    
    async def _fetch_asset_class_data(self, asset_type: AssetType, config: Dict):
        """Continuously fetch data for an asset class"""
        while self.is_running:
            try:
                symbols = config["symbols"]
                update_interval = config["update_interval"]
                
                # Fetch data for all symbols in this asset class
                tasks = []
                for symbol in symbols:
                    if symbol in self.active_symbols or len(self.subscribers) == 0:
                        task = asyncio.create_task(self.get_quote(symbol, asset_type))
                        tasks.append((symbol, task))
                
                # Wait for all quotes
                for symbol, task in tasks:
                    try:
                        quote = await task
                        if quote:
                            self.data_cache[symbol] = quote
                            await self._notify_subscribers(symbol, asset_type, quote)
                    except Exception as e:
                        logger.error(f"Error processing quote for {symbol}: {e}")
                
                await asyncio.sleep(update_interval)
                
            except Exception as e:
                logger.error(f"Error in asset class data fetch for {asset_type}: {e}")
                await asyncio.sleep(5)
    
    async def _fetch_yahoo_quote(self, symbol: str, asset_type: AssetType) -> RealTimeQuote:
        """Fetch real-time quote from Yahoo Finance"""
        provider = DataProvider.YAHOO_FINANCE
        health = self.provider_health.get(provider, {'failure_count': 0, 'backoff_until': None})
        now = datetime.now()

        # If provider is in backoff, immediately return mock data to avoid hammering DNS
        backoff_until = health.get('backoff_until')
        if backoff_until and now < backoff_until:
            logger.warning(f"Yahoo provider in backoff until {backoff_until.isoformat()}, returning mock quote for {symbol}")
            return self._get_mock_quote(symbol, asset_type)

        try:
            # Run blocking yfinance call in a thread
            def _fetch_info():
                import yfinance as yf
                ticker = yf.Ticker(symbol)
                return getattr(ticker, 'info', {})

            info = await asyncio.to_thread(_fetch_info)

            # Get current price data
            current_price = info.get('currentPrice') or info.get('regularMarketPrice', 0)
            previous_close = info.get('previousClose', 0)

            change = current_price - previous_close if previous_close else 0
            change_percent = (change / previous_close * 100) if previous_close else 0

            # Reset provider health on success
            self.provider_health[provider] = {'failure_count': 0, 'backoff_until': None}

            return RealTimeQuote(
                symbol=symbol,
                asset_type=asset_type,
                price=current_price,
                change=change,
                change_percent=change_percent,
                volume=info.get('volume', 0),
                bid=info.get('bid'),
                ask=info.get('ask'),
                bid_size=info.get('bidSize'),
                ask_size=info.get('askSize'),
                high_24h=info.get('dayHigh'),
                low_24h=info.get('dayLow'),
                open_price=info.get('open'),
                previous_close=previous_close,
                market_cap=info.get('marketCap'),
                provider=DataProvider.YAHOO_FINANCE
            )
        except Exception as e:
            # Increase failure count and set backoff with exponential backoff
            msg = str(e)
            fc = health.get('failure_count', 0) + 1
            # base backoff 60s, double each time, cap 1 hour
            backoff_seconds = min(60 * (2 ** (fc - 1)), 3600)
            backoff_until = now + timedelta(seconds=backoff_seconds)
            self.provider_health[provider] = {'failure_count': fc, 'backoff_until': backoff_until}

            # Log higher-level message but avoid huge repeated logs; include exception once
            logger.error(f"Error fetching Yahoo quote for {symbol}: {e}. Marking Yahoo provider down for {backoff_seconds}s (failure_count={fc})")

            # Prefer returning a cached last-known-good quote if available (higher fidelity fallback)
            cached = self.data_cache.get(symbol)
            if cached:
                logger.warning(f"Returning cached quote for {symbol} due to provider error (failure_count={fc})")
                return cached

            # If no cached quote, return mock data. This keeps the system running during outages.
            return self._get_mock_quote(symbol, asset_type)

    def _get_mock_quote(self, symbol: str, asset_type: AssetType) -> RealTimeQuote:
        """Generate mock quote data for development/offline mode"""
        import random
        from datetime import datetime

        # Base prices for different assets
        base_prices = {
            "AAPL": 150.0, "GOOGL": 2800.0, "MSFT": 300.0, "TSLA": 200.0, "NVDA": 400.0,
            "AMZN": 3000.0, "META": 300.0, "NFLX": 400.0,
            "EURUSD=X": 1.08, "GBPUSD=X": 1.27, "USDJPY=X": 150.0, "USDCHF=X": 0.92,
            "AUDUSD=X": 0.67, "USDCAD=X": 1.35,
            "BTC-USD": 45000.0, "ETH-USD": 2500.0, "ADA-USD": 0.45, "SOL-USD": 95.0,
            "DOT-USD": 7.50, "MATIC-USD": 0.85,
            "GC=F": 1950.0, "CL=F": 78.0, "SI=F": 23.0, "NG=F": 2.80, "HG=F": 3.85,
            "^GSPC": 4200.0, "^DJI": 33000.0, "^IXIC": 13000.0, "^RUT": 1800.0, "^VIX": 18.0
        }

        base_price = base_prices.get(symbol, 100.0)
        # Add some random variation (±5%)
        price = base_price * (1 + random.uniform(-0.05, 0.05))
        change = random.uniform(-10, 10)
        change_percent = (change / (price - change)) * 100 if (price - change) != 0 else 0

        return RealTimeQuote(
            symbol=symbol,
            asset_type=asset_type,
            price=round(price, 2),
            change=round(change, 2),
            change_percent=round(change_percent, 2),
            volume=random.randint(100000, 10000000),
            bid=round(price * 0.999, 2),
            ask=round(price * 1.001, 2),
            bid_size=random.randint(100, 1000),
            ask_size=random.randint(100, 1000),
            high_24h=round(price * 1.02, 2),
            low_24h=round(price * 0.98, 2),
            open_price=round(price * (1 + random.uniform(-0.01, 0.01)), 2),
            previous_close=round(price * (1 + random.uniform(-0.02, 0.02)), 2),
            market_cap=random.randint(1000000000, 1000000000000) if asset_type == AssetType.STOCK else None,
            provider=DataProvider.YAHOO_FINANCE
        )
    
    async def _fetch_commodity_quote(self, symbol: str) -> RealTimeQuote:
        """Fetch commodity quote"""
        return await self._fetch_yahoo_quote(symbol, AssetType.COMMODITY)
    
    async def _fetch_index_quote(self, symbol: str) -> RealTimeQuote:
        """Fetch index quote"""
        return await self._fetch_yahoo_quote(symbol, AssetType.INDEX)
    
    async def _start_websocket_connections(self):
        """Start WebSocket connections for real-time data"""
        # Placeholder for WebSocket implementations
        # This would connect to various WebSocket APIs for real-time data
        logger.info("WebSocket connections started (placeholder)")
    
    async def _notify_subscribers(self, symbol: str, asset_type: AssetType, quote: RealTimeQuote):
        """Notify all subscribers of a quote update"""
        key = f"{symbol}:{asset_type}"
        if key in self.subscribers:
            for callback in self.subscribers[key]:
                try:
                    callback(quote)
                except Exception as e:
                    logger.error(f"Error in subscriber callback for {symbol}: {e}")
    
    def get_supported_symbols(self) -> Dict[AssetType, List[str]]:
        """Get all supported symbols by asset type"""
        return {asset_type: config["symbols"] for asset_type, config in self.asset_configs.items()}
    
    def get_market_status(self) -> Dict[str, Any]:
        """Get current market status"""
        return {
            "is_running": self.is_running,
            "active_symbols": len(self.active_symbols),
            "subscribers": len(self.subscribers),
            "cached_quotes": len(self.data_cache),
            "supported_assets": list(self.asset_configs.keys()),
            "last_update": datetime.now().isoformat()
        }

# Global instance
realtime_service = RealTimeMarketDataService()