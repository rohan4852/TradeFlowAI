import asyncio
import aiohttp
import websockets
import json
import logging
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import yfinance as yf
from enum import Enum

logger = logging.getLogger(__name__)

class DataSource(str, Enum):
    IEX_CLOUD = "iex_cloud"
    TWELVE_DATA = "twelve_data"
    POLYGON = "polygon"
    YAHOO_FINANCE = "yahoo_finance"
    WEBSOCKET_STREAM = "websocket_stream"

@dataclass
class RealTimeQuote:
    symbol: str
    price: float
    change: float
    change_percent: float
    volume: int
    bid: Optional[float] = None
    ask: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    open_price: Optional[float] = None
    previous_close: Optional[float] = None
    timestamp: datetime = None
    source: str = "unknown"
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()

class ProfessionalDataService:
    """Professional-grade data service similar to trading platforms"""
    
    def __init__(self):
        self.websocket_connections = {}
        self.subscribers = {}
        self.data_cache = {}
        self.session = None
        self.is_running = False
        
        # Rate limiting for free APIs
        self.rate_limits = {
            DataSource.IEX_CLOUD: {"calls": 0, "reset_time": datetime.now()},
            DataSource.TWELVE_DATA: {"calls": 0, "reset_time": datetime.now()},
            DataSource.POLYGON: {"calls": 0, "reset_time": datetime.now()},
        }
        
        # Free API limits per day/minute
        self.api_limits = {
            DataSource.IEX_CLOUD: {"daily": 100000, "per_minute": 100},  # Free tier
            DataSource.TWELVE_DATA: {"daily": 800, "per_minute": 8},
            DataSource.POLYGON: {"daily": 1000, "per_minute": 5},
        }
    
    async def start(self):
        """Start the professional data service"""
        if self.is_running:
            return
            
        self.is_running = True
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=10),
            headers={'User-Agent': 'Professional Trading Platform v1.0'}
        )
        
        # Start WebSocket connections for real-time data
        await self._start_websocket_streams()
        
        logger.info("Professional data service started")
    
    async def stop(self):
        """Stop the service"""
        self.is_running = False
        
        # Close WebSocket connections
        for ws in self.websocket_connections.values():
            if ws and not ws.closed:
                await ws.close()
        
        if self.session:
            await self.session.close()
        
        logger.info("Professional data service stopped")
    
    async def get_quote(self, symbol: str) -> Optional[RealTimeQuote]:
        """Get real-time quote using professional methods"""
        
        # Check cache first (for rate limiting)
        cached = self._get_cached_quote(symbol)
        if cached and (datetime.now() - cached.timestamp).seconds < 5:
            return cached
        
        # Try data sources in order of reliability and cost
        sources = [
            self._fetch_iex_cloud_quote,
            self._fetch_twelve_data_quote,
            self._fetch_yahoo_professional,
            self._fetch_polygon_quote,
        ]
        
        for source_func in sources:
            try:
                quote = await source_func(symbol)
                if quote and quote.price > 0:
                    self._cache_quote(symbol, quote)
                    await self._notify_subscribers(symbol, quote)
                    return quote
            except Exception as e:
                logger.debug(f"Source {source_func.__name__} failed for {symbol}: {e}")
                continue
        
        # Final fallback to cached data
        if cached:
            logger.warning(f"All sources failed for {symbol}, returning cached data")
            return cached
        
        logger.error(f"All sources failed for {symbol}")
        return None
    
    async def _fetch_iex_cloud_quote(self, symbol: str) -> Optional[RealTimeQuote]:
        """Fetch from IEX Cloud (most reliable free source)"""
        if not self._check_rate_limit(DataSource.IEX_CLOUD):
            raise Exception("Rate limit exceeded")
        
        # IEX Cloud free endpoint (no API key required for basic quotes)
        url = f"https://cloud.iexapis.com/stable/stock/{symbol}/quote?token=demo"
        
        try:
            async with self.session.get(url) as response:
                if response.status == 429:
                    raise Exception("Rate limit exceeded")
                elif response.status != 200:
                    raise Exception(f"HTTP {response.status}")
                
                data = await response.json()
                
                price = float(data.get('latestPrice', 0))
                if price == 0:
                    raise Exception("No valid price")
                
                change = float(data.get('change', 0))
                change_percent = float(data.get('changePercent', 0)) * 100
                
                return RealTimeQuote(
                    symbol=symbol,
                    price=price,
                    change=change,
                    change_percent=change_percent,
                    volume=int(data.get('latestVolume', 0) or 0),
                    high=float(data.get('high', 0)) if data.get('high') else None,
                    low=float(data.get('low', 0)) if data.get('low') else None,
                    open_price=float(data.get('open', 0)) if data.get('open') else None,
                    previous_close=float(data.get('previousClose', 0)) if data.get('previousClose') else None,
                    source="iex_cloud",
                    timestamp=datetime.now()
                )
                
        except Exception as e:
            logger.debug(f"IEX Cloud failed for {symbol}: {e}")
            raise
    
    async def _fetch_twelve_data_quote(self, symbol: str) -> Optional[RealTimeQuote]:
        """Fetch from Twelve Data (good free tier)"""
        if not self._check_rate_limit(DataSource.TWELVE_DATA):
            raise Exception("Rate limit exceeded")
        
        # Twelve Data free endpoint
        url = f"https://api.twelvedata.com/quote?symbol={symbol}&apikey=demo"
        
        try:
            async with self.session.get(url) as response:
                if response.status == 429:
                    raise Exception("Rate limit exceeded")
                elif response.status != 200:
                    raise Exception(f"HTTP {response.status}")
                
                data = await response.json()
                
                if 'price' not in data:
                    raise Exception("No price data")
                
                price = float(data['price'])
                previous_close = float(data.get('previous_close', price))
                change = price - previous_close
                change_percent = (change / previous_close * 100) if previous_close else 0
                
                return RealTimeQuote(
                    symbol=symbol,
                    price=price,
                    change=change,
                    change_percent=change_percent,
                    volume=int(data.get('volume', 0) or 0),
                    high=float(data.get('high', 0)) if data.get('high') else None,
                    low=float(data.get('low', 0)) if data.get('low') else None,
                    open_price=float(data.get('open', 0)) if data.get('open') else None,
                    previous_close=previous_close,
                    source="twelve_data",
                    timestamp=datetime.now()
                )
                
        except Exception as e:
            logger.debug(f"Twelve Data failed for {symbol}: {e}")
            raise
    
    async def _fetch_yahoo_professional(self, symbol: str) -> Optional[RealTimeQuote]:
        """Professional Yahoo Finance implementation"""
        try:
            # Method 1: Yahoo Finance API v8 (most reliable)
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
            
            async with self.session.get(url) as response:
                if response.status != 200:
                    raise Exception(f"HTTP {response.status}")
                
                data = await response.json()
                
                if 'chart' not in data or not data['chart']['result']:
                    raise Exception("No chart data")
                
                result = data['chart']['result'][0]
                meta = result['meta']
                
                price = float(meta.get('regularMarketPrice', 0))
                if price == 0:
                    raise Exception("No valid price")
                
                previous_close = float(meta.get('previousClose', price))
                change = price - previous_close
                change_percent = (change / previous_close * 100) if previous_close else 0
                
                return RealTimeQuote(
                    symbol=symbol,
                    price=price,
                    change=change,
                    change_percent=change_percent,
                    volume=int(meta.get('regularMarketVolume', 0) or 0),
                    high=float(meta.get('regularMarketDayHigh', 0)) if meta.get('regularMarketDayHigh') else None,
                    low=float(meta.get('regularMarketDayLow', 0)) if meta.get('regularMarketDayLow') else None,
                    open_price=float(meta.get('regularMarketOpen', 0)) if meta.get('regularMarketOpen') else None,
                    previous_close=previous_close,
                    source="yahoo_professional",
                    timestamp=datetime.now()
                )
                
        except Exception as e:
            logger.debug(f"Yahoo professional failed for {symbol}: {e}")
            
            # Fallback to yfinance
            try:
                def _fetch_yf():
                    ticker = yf.Ticker(symbol)
                    info = ticker.fast_info
                    if hasattr(info, 'last_price') and info.last_price > 0:
                        return {
                            'price': info.last_price,
                            'previous_close': getattr(info, 'previous_close', info.last_price),
                            'volume': getattr(info, 'last_volume', 0),
                        }
                    return None
                
                result = await asyncio.to_thread(_fetch_yf)
                if result:
                    price = float(result['price'])
                    previous_close = float(result['previous_close'])
                    change = price - previous_close
                    change_percent = (change / previous_close * 100) if previous_close else 0
                    
                    return RealTimeQuote(
                        symbol=symbol,
                        price=price,
                        change=change,
                        change_percent=change_percent,
                        volume=int(result['volume']),
                        previous_close=previous_close,
                        source="yahoo_yfinance",
                        timestamp=datetime.now()
                    )
            except Exception as yf_error:
                logger.debug(f"YFinance fallback failed for {symbol}: {yf_error}")
            
            raise
    
    async def _fetch_polygon_quote(self, symbol: str) -> Optional[RealTimeQuote]:
        """Fetch from Polygon (limited free tier)"""
        if not self._check_rate_limit(DataSource.POLYGON):
            raise Exception("Rate limit exceeded")
        
        # Note: Polygon requires API key even for free tier
        # This is a placeholder - you'd need to sign up for free API key
        url = f"https://api.polygon.io/v2/aggs/ticker/{symbol}/prev?adjusted=true&apikey=demo"
        
        try:
            async with self.session.get(url) as response:
                if response.status == 429:
                    raise Exception("Rate limit exceeded")
                elif response.status != 200:
                    raise Exception(f"HTTP {response.status}")
                
                data = await response.json()
                
                if 'results' not in data or not data['results']:
                    raise Exception("No results")
                
                result = data['results'][0]
                price = float(result['c'])  # close price
                
                return RealTimeQuote(
                    symbol=symbol,
                    price=price,
                    change=0,  # Would need current vs previous
                    change_percent=0,
                    volume=int(result.get('v', 0)),
                    high=float(result.get('h', 0)) if result.get('h') else None,
                    low=float(result.get('l', 0)) if result.get('l') else None,
                    open_price=float(result.get('o', 0)) if result.get('o') else None,
                    source="polygon",
                    timestamp=datetime.now()
                )
                
        except Exception as e:
            logger.debug(f"Polygon failed for {symbol}: {e}")
            raise
    
    async def _start_websocket_streams(self):
        """Start WebSocket streams for real-time data (like TradingView)"""
        # This would connect to WebSocket feeds from data providers
        # For now, we'll simulate with periodic updates
        asyncio.create_task(self._simulate_realtime_updates())
    
    async def _simulate_realtime_updates(self):
        """Simulate real-time updates (replace with actual WebSocket feeds)"""
        while self.is_running:
            try:
                # Update cached quotes with small random changes
                for symbol, cached_quote in list(self.data_cache.items()):
                    if (datetime.now() - cached_quote.timestamp).seconds > 10:
                        # Simulate small price movement
                        import random
                        price_change = cached_quote.price * random.uniform(-0.001, 0.001)
                        new_price = cached_quote.price + price_change
                        
                        updated_quote = RealTimeQuote(
                            symbol=symbol,
                            price=new_price,
                            change=new_price - cached_quote.previous_close,
                            change_percent=((new_price - cached_quote.previous_close) / cached_quote.previous_close * 100) if cached_quote.previous_close else 0,
                            volume=cached_quote.volume,
                            bid=cached_quote.bid,
                            ask=cached_quote.ask,
                            high=max(cached_quote.high or 0, new_price),
                            low=min(cached_quote.low or float('inf'), new_price),
                            open_price=cached_quote.open_price,
                            previous_close=cached_quote.previous_close,
                            source=f"{cached_quote.source}_simulated",
                            timestamp=datetime.now()
                        )
                        
                        self._cache_quote(symbol, updated_quote)
                        await self._notify_subscribers(symbol, updated_quote)
                
                await asyncio.sleep(1)  # Update every second
                
            except Exception as e:
                logger.error(f"Error in simulated updates: {e}")
                await asyncio.sleep(5)
    
    def _check_rate_limit(self, source: DataSource) -> bool:
        """Check if we can make a request to this source"""
        now = datetime.now()
        rate_info = self.rate_limits[source]
        
        # Reset daily counter
        if (now - rate_info["reset_time"]).days >= 1:
            rate_info["calls"] = 0
            rate_info["reset_time"] = now
        
        # Check limits
        limits = self.api_limits[source]
        if rate_info["calls"] >= limits["daily"]:
            return False
        
        # Increment counter
        rate_info["calls"] += 1
        return True
    
    def _get_cached_quote(self, symbol: str) -> Optional[RealTimeQuote]:
        """Get cached quote"""
        return self.data_cache.get(symbol)
    
    def _cache_quote(self, symbol: str, quote: RealTimeQuote):
        """Cache a quote"""
        self.data_cache[symbol] = quote
    
    def subscribe(self, symbol: str, callback: Callable[[RealTimeQuote], None]):
        """Subscribe to real-time updates"""
        if symbol not in self.subscribers:
            self.subscribers[symbol] = []
        self.subscribers[symbol].append(callback)
    
    def unsubscribe(self, symbol: str, callback: Callable):
        """Unsubscribe from updates"""
        if symbol in self.subscribers:
            try:
                self.subscribers[symbol].remove(callback)
                if not self.subscribers[symbol]:
                    del self.subscribers[symbol]
            except ValueError:
                pass
    
    async def _notify_subscribers(self, symbol: str, quote: RealTimeQuote):
        """Notify subscribers of quote updates"""
        if symbol in self.subscribers:
            for callback in self.subscribers[symbol]:
                try:
                    callback(quote)
                except Exception as e:
                    logger.error(f"Error in subscriber callback: {e}")
    
    async def get_historical_data(self, symbol: str, period: str = "1d", interval: str = "1m") -> List[Dict]:
        """Get historical OHLCV data"""
        try:
            def _fetch_history():
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period=period, interval=interval)
                
                if hist.empty:
                    return []
                
                data = []
                for index, row in hist.iterrows():
                    data.append({
                        'timestamp': index.isoformat(),
                        'open': float(row['Open']),
                        'high': float(row['High']),
                        'low': float(row['Low']),
                        'close': float(row['Close']),
                        'volume': int(row['Volume'])
                    })
                
                return data
            
            return await asyncio.to_thread(_fetch_history)
            
        except Exception as e:
            logger.error(f"Historical data fetch failed for {symbol}: {e}")
            return []
    
    def get_service_status(self) -> Dict[str, Any]:
        """Get service status"""
        return {
            "is_running": self.is_running,
            "cached_symbols": len(self.data_cache),
            "active_subscriptions": len(self.subscribers),
            "websocket_connections": len(self.websocket_connections),
            "rate_limits": {
                source.value: {
                    "calls_made": info["calls"],
                    "daily_limit": self.api_limits[source]["daily"]
                }
                for source, info in self.rate_limits.items()
            }
        }

# Global instance
professional_data_service = ProfessionalDataService()