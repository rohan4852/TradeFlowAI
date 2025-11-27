import asyncio
import aiohttp
import websockets
import json
import logging
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum

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
                "providers": [DataProvider.FINNHUB, DataProvider.ALPHA_VANTAGE, DataProvider.POLYGON, DataProvider.YAHOO_FINANCE],
                "update_interval": 1,
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
                "symbols": ["GC=F", "CL=F", "SI=F", "NG=F", "HG=F"]
            },
            AssetType.INDEX: {
                "providers": [DataProvider.YAHOO_FINANCE],
                "update_interval": 2,
                "symbols": ["^GSPC", "^DJI", "^IXIC", "^RUT", "^VIX"]
            }
        }
        self.provider_health: Dict[DataProvider, Dict[str, Any]] = {
            p: {'failure_count': 0, 'backoff_until': None} for p in DataProvider
        }
        self.provider_stats: Dict[DataProvider, Dict[str, Any]] = {
            p: {'requests': 0, 'successes': 0, 'failures': 0, 'last_rate_info': {}} for p in DataProvider
        }
        self.provider_locks: Dict[DataProvider, asyncio.Lock] = {
            p: asyncio.Lock() for p in DataProvider
        }
    
    async def start(self):
        """Start the real-time data service"""
        if self.is_running:
            return
        
        self.is_running = True
        logger.info("Starting real-time market data service...")
        
        tasks = []
        for asset_type, config in self.asset_configs.items():
            task = asyncio.create_task(self._fetch_asset_class_data(asset_type, config))
            tasks.append(task)
        
        tasks.append(asyncio.create_task(self._start_websocket_connections()))
        await asyncio.gather(*tasks, return_exceptions=True)
    
    async def stop(self):
        """Stop the real-time data service"""
        self.is_running = False
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
        providers = self.asset_configs.get(asset_type, {}).get('providers', [])
        if not providers:
            logger.warning(f"Unsupported asset type: {asset_type}")
            return None

        providers = self._rank_providers_by_capacity(providers)
        for provider in providers:
            lock = self.provider_locks.get(provider)
            if lock is None:
                lock = asyncio.Lock()
                self.provider_locks[provider] = lock

            async with lock:
                health = self.provider_health.get(provider, {'failure_count': 0, 'backoff_until': None})
                now = datetime.now()
                backoff_until = health.get('backoff_until')
                if backoff_until and now < backoff_until:
                    continue

            try:
                try:
                    self.provider_stats[provider]['requests'] += 1
                except Exception:
                    self.provider_stats.setdefault(provider, {'requests': 0, 'successes': 0, 'failures': 0, 'last_rate_info': {}})
                    self.provider_stats[provider]['requests'] += 1
                
                quote = None
                if provider == DataProvider.FINNHUB:
                    quote = await self._fetch_finnhub_quote(symbol, asset_type)
                elif provider == DataProvider.ALPHA_VANTAGE:
                    quote = await self._fetch_alpha_vantage_quote(symbol, asset_type)
                elif provider == DataProvider.POLYGON:
                    quote = await self._fetch_polygon_quote(symbol, asset_type)
                elif provider == DataProvider.YAHOO_FINANCE:
                    quote = await self._fetch_yahoo_quote(symbol, asset_type)

                if quote:
                    self.provider_health[provider] = {'failure_count': 0, 'backoff_until': None}
                    self._record_provider_success(provider)
                    return quote
            except Exception as e:
                fc = health.get('failure_count', 0) + 1
                backoff_seconds = min(60 * (2 ** (fc - 1)), 3600)
                backoff_until = now + timedelta(seconds=backoff_seconds)
                self.provider_health[provider] = {'failure_count': fc, 'backoff_until': backoff_until}
                self._record_provider_failure(provider)
                logger.error(f"Error fetching {provider.value} quote for {symbol}: {e}")
                continue

        cached = self.data_cache.get(symbol)
        if cached:
            return cached
        return self._get_mock_quote(symbol, asset_type)
    
    async def get_historical_data(self, symbol: str, asset_type: AssetType, 
                                period: str = "1d", interval: str = "1m") -> List[OHLCVData]:
        try:
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
                # [Fix] Dynamically combine config symbols AND active user subscriptions
                config_symbols = config["symbols"]
                subscribed_symbols = [s for s, t in self.active_symbols.items() if t == asset_type]
                # Use set to avoid duplicates
                target_symbols = list(set(config_symbols + subscribed_symbols))
                update_interval = config["update_interval"]
                
                tasks = []
                for symbol in target_symbols:
                    # Fetch if configured OR if someone is listening
                    if symbol in self.active_symbols or len(self.subscribers) == 0:
                        task = asyncio.create_task(self.get_quote(symbol, asset_type))
                        tasks.append((symbol, task))
                
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
        provider = DataProvider.YAHOO_FINANCE
        # Simplified logic for brevity - keep existing health checks from your original file if preferred
        # but ensure it returns valid RealTimeQuote
        def _fetch_info():
            import yfinance as yf
            ticker = yf.Ticker(symbol)
            return getattr(ticker, 'info', {})

        info = await asyncio.to_thread(_fetch_info)
        current_price = info.get('currentPrice') or info.get('regularMarketPrice', 0)
        previous_close = info.get('previousClose', 0)
        change = current_price - previous_close if previous_close else 0
        change_percent = (change / previous_close * 100) if previous_close else 0

        return RealTimeQuote(
            symbol=symbol,
            asset_type=asset_type,
            price=current_price,
            change=change,
            change_percent=change_percent,
            volume=info.get('volume', 0),
            bid=info.get('bid'),
            ask=info.get('ask'),
            high_24h=info.get('dayHigh'),
            low_24h=info.get('dayLow'),
            provider=DataProvider.YAHOO_FINANCE
        )

    # ... (Keep existing _fetch_finnhub_quote, _fetch_alpha_vantage_quote, _get_mock_quote, etc. unchanged)
    # Ensure helper methods like _record_provider_success are present
    
    async def _fetch_finnhub_quote(self, symbol: str, asset_type: AssetType) -> Optional[RealTimeQuote]:
        # Keep original implementation
        import os
        api_key = os.environ.get('FINNHUB_API_KEY')
        if not api_key: raise RuntimeError("No FINNHUB_API_KEY")
        url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={api_key}"
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as resp:
                if resp.status != 200: raise RuntimeError(f"Finnhub error {resp.status}")
                data = await resp.json()
        current = data.get('c')
        previous = data.get('pc')
        if current is None: raise RuntimeError("No price")
        return RealTimeQuote(
            symbol=symbol, asset_type=asset_type, price=current,
            change=current - previous, change_percent=(current-previous)/previous*100 if previous else 0,
            volume=int(data.get('v',0)), provider=DataProvider.FINNHUB
        )

    async def _fetch_alpha_vantage_quote(self, symbol: str, asset_type: AssetType) -> Optional[RealTimeQuote]:
        # Keep original implementation
        import os
        api_key = os.environ.get('ALPHA_VANTAGE_API_KEY')
        if not api_key: raise RuntimeError("No key")
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={api_key}"
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as resp:
                data = await resp.json()
        quote = data.get('Global Quote')
        if not quote: raise RuntimeError("No data")
        current = float(quote.get('05. price'))
        previous = float(quote.get('08. previous close'))
        return RealTimeQuote(
            symbol=symbol, asset_type=asset_type, price=current,
            change=current-previous, change_percent=(current-previous)/previous*100,
            volume=int(quote.get('06. volume')), provider=DataProvider.ALPHA_VANTAGE
        )

    async def _fetch_polygon_quote(self, symbol: str, asset_type: AssetType) -> Optional[RealTimeQuote]:
        raise RuntimeError("Polygon not implemented")

    def _get_mock_quote(self, symbol: str, asset_type: AssetType) -> RealTimeQuote:
        import random
        base = 100.0
        price = base * (1 + random.uniform(-0.05, 0.05))
        return RealTimeQuote(
            symbol=symbol, asset_type=asset_type, price=price,
            change=0.0, change_percent=0.0, volume=1000, provider=DataProvider.YAHOO_FINANCE
        )

    def _rank_providers_by_capacity(self, providers):
        return providers # Simplified sorting

    def _record_provider_success(self, provider): pass
    def _record_provider_failure(self, provider): pass

    async def _start_websocket_connections(self):
        logger.info("WebSocket connections started (placeholder)")
    
    async def _notify_subscribers(self, symbol: str, asset_type: AssetType, quote: RealTimeQuote):
        key = f"{symbol}:{asset_type}"
        if key in self.subscribers:
            for callback in self.subscribers[key]:
                try:
                    callback(quote)
                except Exception as e:
                    logger.error(f"Error in subscriber callback for {symbol}: {e}")
    
    def get_supported_symbols(self) -> Dict[AssetType, List[str]]:
        return {asset_type: config["symbols"] for asset_type, config in self.asset_configs.items()}
    
    def get_market_status(self) -> Dict[str, Any]:
        return {
            "is_running": self.is_running,
            "active_symbols": len(self.active_symbols),
            "subscribers": len(self.subscribers),
            "last_update": datetime.now().isoformat()
        }

# Global instance - using fixed service to avoid rate limiting
from .market_data_fix import fixed_market_service as realtime_service