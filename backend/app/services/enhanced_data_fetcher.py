import asyncio
import aiohttp
import logging
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass
import yfinance as yf
from ..models.market_data import OHLCVData

logger = logging.getLogger(__name__)

@dataclass
class EnhancedQuote:
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
    market_cap: Optional[int] = None
    timestamp: datetime = None
    source: str = "unknown"
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()

class EnhancedDataFetcher:
    """Enhanced data fetcher with multiple free sources and robust fallbacks"""
    
    def __init__(self):
        self.cache = {}
        self.cache_ttl = 30  # seconds
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=15),
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def _is_cache_valid(self, symbol: str) -> bool:
        """Check if cached data is still valid"""
        if symbol not in self.cache:
            return False
        
        cached_time = self.cache[symbol].get('timestamp', datetime.min)
        return (datetime.now() - cached_time).total_seconds() < self.cache_ttl
    
    def _get_cached_quote(self, symbol: str) -> Optional[EnhancedQuote]:
        """Get cached quote if valid"""
        if self._is_cache_valid(symbol):
            return self.cache[symbol]['quote']
        return None
    
    def _cache_quote(self, symbol: str, quote: EnhancedQuote):
        """Cache a quote"""
        self.cache[symbol] = {
            'quote': quote,
            'timestamp': datetime.now()
        }
    
    async def get_quote(self, symbol: str) -> Optional[EnhancedQuote]:
        """Get quote using multiple sources with fallbacks"""
        
        # Check cache first
        cached = self._get_cached_quote(symbol)
        if cached:
            return cached
        
        # Try multiple sources in order of reliability
        sources = [
            self._fetch_yahoo_comprehensive,
            self._fetch_yahoo_direct_api,
            self._fetch_marketstack_free,
            self._fetch_mock_realistic
        ]
        
        for source_func in sources:
            try:
                quote = await source_func(symbol)
                if quote and quote.price > 0:
                    self._cache_quote(symbol, quote)
                    return quote
            except Exception as e:
                logger.debug(f"Source {source_func.__name__} failed for {symbol}: {e}")
                continue
        
        logger.error(f"All sources failed for {symbol}")
        return None
    
    async def _fetch_yahoo_comprehensive(self, symbol: str) -> Optional[EnhancedQuote]:
        """Comprehensive Yahoo Finance fetch using yfinance"""
        try:
            def _fetch_data():
                ticker = yf.Ticker(symbol)
                
                # Try multiple methods
                methods = [
                    ('fast_info', lambda: ticker.fast_info),
                    ('history', lambda: ticker.history(period="2d", interval="1m")),
                    ('info', lambda: ticker.info)
                ]
                
                for method_name, method_func in methods:
                    try:
                        if method_name == 'fast_info':
                            fast_info = method_func()
                            if fast_info and hasattr(fast_info, 'last_price'):
                                return {
                                    'method': method_name,
                                    'price': fast_info.last_price,
                                    'previous_close': getattr(fast_info, 'previous_close', fast_info.last_price),
                                    'volume': getattr(fast_info, 'last_volume', 0),
                                    'day_high': getattr(fast_info, 'day_high', None),
                                    'day_low': getattr(fast_info, 'day_low', None),
                                    'open': getattr(fast_info, 'open', None),
                                }
                        
                        elif method_name == 'history':
                            hist = method_func()
                            if not hist.empty:
                                latest = hist.iloc[-1]
                                prev_close = hist.iloc[-2]['Close'] if len(hist) > 1 else latest['Open']
                                return {
                                    'method': method_name,
                                    'price': float(latest['Close']),
                                    'previous_close': float(prev_close),
                                    'volume': int(latest['Volume']),
                                    'day_high': float(latest['High']),
                                    'day_low': float(latest['Low']),
                                    'open': float(latest['Open']),
                                }
                        
                        elif method_name == 'info':
                            info = method_func()
                            if info and len(info) > 5:
                                price = info.get('currentPrice') or info.get('regularMarketPrice', 0)
                                if price > 0:
                                    return {
                                        'method': method_name,
                                        'price': price,
                                        'previous_close': info.get('previousClose', price),
                                        'volume': info.get('volume', 0),
                                        'day_high': info.get('dayHigh'),
                                        'day_low': info.get('dayLow'),
                                        'open': info.get('open'),
                                        'bid': info.get('bid'),
                                        'ask': info.get('ask'),
                                        'market_cap': info.get('marketCap'),
                                    }
                    except Exception as e:
                        logger.debug(f"Yahoo {method_name} failed for {symbol}: {e}")
                        continue
                
                return None
            
            result = await asyncio.to_thread(_fetch_data)
            
            if not result:
                raise Exception("All Yahoo methods failed")
            
            data = result
            price = float(data['price'])
            previous_close = float(data.get('previous_close', price))
            change = price - previous_close
            change_percent = (change / previous_close * 100) if previous_close else 0
            
            return EnhancedQuote(
                symbol=symbol,
                price=price,
                change=change,
                change_percent=change_percent,
                volume=int(data.get('volume', 0) or 0),
                bid=float(data['bid']) if data.get('bid') else None,
                ask=float(data['ask']) if data.get('ask') else None,
                high=float(data['day_high']) if data.get('day_high') else None,
                low=float(data['day_low']) if data.get('day_low') else None,
                open_price=float(data['open']) if data.get('open') else None,
                previous_close=previous_close,
                market_cap=int(data['market_cap']) if data.get('market_cap') else None,
                source=f"yahoo_{data['method']}",
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.debug(f"Yahoo comprehensive fetch failed for {symbol}: {e}")
            raise
    
    async def _fetch_yahoo_direct_api(self, symbol: str) -> Optional[EnhancedQuote]:
        """Direct Yahoo Finance API call"""
        try:
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
            
            async with self.session.get(url) as response:
                if response.status != 200:
                    raise Exception(f"HTTP {response.status}")
                
                data = await response.json()
                result = data['chart']['result'][0]
                meta = result['meta']
                
                price = float(meta.get('regularMarketPrice', 0))
                previous_close = float(meta.get('previousClose', price))
                
                if price == 0:
                    raise Exception("No valid price data")
                
                change = price - previous_close
                change_percent = (change / previous_close * 100) if previous_close else 0
                
                return EnhancedQuote(
                    symbol=symbol,
                    price=price,
                    change=change,
                    change_percent=change_percent,
                    volume=int(meta.get('regularMarketVolume', 0) or 0),
                    high=float(meta.get('regularMarketDayHigh', 0)) if meta.get('regularMarketDayHigh') else None,
                    low=float(meta.get('regularMarketDayLow', 0)) if meta.get('regularMarketDayLow') else None,
                    open_price=float(meta.get('regularMarketOpen', 0)) if meta.get('regularMarketOpen') else None,
                    previous_close=previous_close,
                    source="yahoo_direct_api",
                    timestamp=datetime.now()
                )
                
        except Exception as e:
            logger.debug(f"Yahoo direct API failed for {symbol}: {e}")
            raise
    
    async def _fetch_marketstack_free(self, symbol: str) -> Optional[EnhancedQuote]:
        """Fetch from Marketstack free tier (no API key required for basic quotes)"""
        try:
            # Note: This is a placeholder for a free API service
            # You can replace with any free financial API
            url = f"https://api.marketstack.com/v1/eod/latest?access_key=free&symbols={symbol}"
            
            async with self.session.get(url) as response:
                if response.status != 200:
                    raise Exception(f"HTTP {response.status}")
                
                data = await response.json()
                
                if 'data' not in data or not data['data']:
                    raise Exception("No data returned")
                
                quote_data = data['data'][0]
                price = float(quote_data['close'])
                previous_close = float(quote_data.get('open', price))
                
                change = price - previous_close
                change_percent = (change / previous_close * 100) if previous_close else 0
                
                return EnhancedQuote(
                    symbol=symbol,
                    price=price,
                    change=change,
                    change_percent=change_percent,
                    volume=int(quote_data.get('volume', 0) or 0),
                    high=float(quote_data.get('high', 0)) if quote_data.get('high') else None,
                    low=float(quote_data.get('low', 0)) if quote_data.get('low') else None,
                    open_price=float(quote_data.get('open', 0)) if quote_data.get('open') else None,
                    previous_close=previous_close,
                    source="marketstack_free",
                    timestamp=datetime.now()
                )
                
        except Exception as e:
            logger.debug(f"Marketstack free failed for {symbol}: {e}")
            raise
    
    async def _fetch_mock_realistic(self, symbol: str) -> Optional[EnhancedQuote]:
        """Generate realistic mock data as final fallback"""
        try:
            import random
            import hashlib
            
            # Use symbol hash for consistent "random" data
            seed = int(hashlib.md5(symbol.encode()).hexdigest()[:8], 16)
            random.seed(seed + int(datetime.now().timestamp() / 3600))  # Change hourly
            
            # Base prices for common symbols
            base_prices = {
                "AAPL": 175.0, "GOOGL": 140.0, "MSFT": 380.0, "TSLA": 220.0,
                "NVDA": 480.0, "AMZN": 145.0, "META": 320.0, "NFLX": 450.0,
                "SPY": 450.0, "QQQ": 380.0, "BTC-USD": 43000.0, "ETH-USD": 2600.0,
                "EURUSD=X": 1.08, "GBPUSD=X": 1.27, "GC=F": 2000.0, "CL=F": 75.0
            }
            
            base_price = base_prices.get(symbol, 100.0)
            
            # Add realistic variation
            price = base_price * (1 + random.uniform(-0.03, 0.03))  # ±3%
            previous_close = base_price * (1 + random.uniform(-0.02, 0.02))  # ±2%
            
            change = price - previous_close
            change_percent = (change / previous_close * 100) if previous_close else 0
            
            return EnhancedQuote(
                symbol=symbol,
                price=round(price, 2),
                change=round(change, 2),
                change_percent=round(change_percent, 2),
                volume=random.randint(100000, 10000000),
                bid=round(price * 0.999, 2),
                ask=round(price * 1.001, 2),
                high=round(price * 1.015, 2),
                low=round(price * 0.985, 2),
                open_price=round(previous_close * 1.005, 2),
                previous_close=round(previous_close, 2),
                market_cap=random.randint(1000000000, 3000000000000) if symbol not in ["EURUSD=X", "GC=F"] else None,
                source="mock_realistic",
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Mock data generation failed for {symbol}: {e}")
            raise
    
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
    
    def clear_cache(self):
        """Clear the cache"""
        self.cache.clear()
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        valid_entries = sum(1 for symbol in self.cache if self._is_cache_valid(symbol))
        return {
            'total_entries': len(self.cache),
            'valid_entries': valid_entries,
            'cache_hit_rate': valid_entries / len(self.cache) if self.cache else 0
        }

# Global instance
enhanced_data_fetcher = EnhancedDataFetcher()