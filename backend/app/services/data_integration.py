import asyncio
import aiohttp
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from ..models.market_data import OHLCVData, NewsArticle, SocialSentiment, DataSource
import logging

logger = logging.getLogger(__name__)

class MultiSourceDataIntegrator:
    """Integrates data from multiple sources with quality scoring and anomaly detection"""
    
    def __init__(self):
        self.data_sources = {
            DataSource.YAHOO_FINANCE: self._fetch_yahoo_data,
            DataSource.ALPHA_VANTAGE: self._fetch_alpha_vantage_data,
            # Add other sources as needed
        }
        self.quality_weights = {
            DataSource.YAHOO_FINANCE: 0.8,
            DataSource.ALPHA_VANTAGE: 0.9,
            DataSource.TRADINGVIEW: 0.95,
            DataSource.IEX_CLOUD: 0.85
        }
    
    async def get_ohlcv_data(self, ticker: str, period: str = "1y", interval: str = "1d") -> List[OHLCVData]:
        """Fetch OHLCV data from multiple sources and return consolidated results"""
        tasks = []
        for source, fetch_func in self.data_sources.items():
            tasks.append(self._safe_fetch(fetch_func, ticker, period, interval, source))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter successful results
        valid_results = [r for r in results if not isinstance(r, Exception)]
        
        if not valid_results:
            raise Exception("No data sources available")
        
        # Consolidate and validate data
        return self._consolidate_ohlcv_data(valid_results)
    
    async def _safe_fetch(self, fetch_func, ticker: str, period: str, interval: str, source: DataSource):
        """Safely fetch data with error handling"""
        try:
            return await fetch_func(ticker, period, interval, source)
        except Exception as e:
            logger.error(f"Failed to fetch from {source}: {e}")
            return None
    
    async def _fetch_yahoo_data(self, ticker: str, period: str, interval: str, source: DataSource) -> List[OHLCVData]:
        """Fetch data from Yahoo Finance"""
        try:
            # Lazy import to avoid heavy dependencies at module import time
            import yfinance as yf
            import pandas as pd
            import numpy as np

            stock = yf.Ticker(ticker)
            df = stock.history(period=period, interval=interval)
            
            data = []
            for index, row in df.iterrows():
                data.append(OHLCVData(
                    timestamp=index,
                    open=row['Open'],
                    high=row['High'],
                    low=row['Low'],
                    close=row['Close'],
                    volume=int(row['Volume']),
                    source=source,
                    quality_score=self.quality_weights[source]
                ))
            return data
        except Exception as e:
            logger.error(f"Yahoo Finance fetch error: {e}")
            raise
    
    async def _fetch_alpha_vantage_data(self, ticker: str, period: str, interval: str, source: DataSource) -> List[OHLCVData]:
        """Fetch data from Alpha Vantage (placeholder)"""
        # Implement Alpha Vantage API integration
        logger.info(f"Alpha Vantage fetch for {ticker} - placeholder")
        return []
    
    def _consolidate_ohlcv_data(self, data_lists: List[List[OHLCVData]]) -> List[OHLCVData]:
        """Consolidate data from multiple sources using quality-weighted averaging"""
        if not data_lists:
            return []
        # Create a DataFrame for easier manipulation
        all_data = []
        for data_list in data_lists:
            if data_list:
                all_data.extend(data_list)

        if not all_data:
            return []

        # Lazy-import heavy libraries
        import pandas as pd
        import numpy as np

        df = pd.DataFrame([{
            'timestamp': d.timestamp,
            'open': d.open,
            'high': d.high,
            'low': d.low,
            'close': d.close,
            'volume': d.volume,
            'source': d.source,
            'quality_score': d.quality_score
        } for d in all_data])

        # Apply anomaly detection
        df = self._detect_and_clean_anomalies(df)

        # Group by timestamp and create weighted averages
        consolidated = []
        for timestamp, group in df.groupby('timestamp'):
            weights = group['quality_score'].values

            consolidated_data = OHLCVData(
                timestamp=timestamp,
                open=float(np.average(group['open'], weights=weights)),
                high=float(np.average(group['high'], weights=weights)),
                low=float(np.average(group['low'], weights=weights)),
                close=float(np.average(group['close'], weights=weights)),
                volume=int(np.average(group['volume'], weights=weights)),
                source=DataSource.YAHOO_FINANCE,  # Primary source
                quality_score=float(np.mean(weights))
            )
            consolidated.append(consolidated_data)

        return sorted(consolidated, key=lambda x: x.timestamp)
    
    def _detect_and_clean_anomalies(self, df):
        """Detect and clean anomalies in price data"""
        # Calculate price change percentages
        df = df.sort_values('timestamp')
        df['price_change'] = df['close'].pct_change()
        
        # Detect outliers using IQR method
        Q1 = df['price_change'].quantile(0.25)
        Q3 = df['price_change'].quantile(0.75)
        IQR = Q3 - Q1
        
        # Define outlier bounds
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        # Flag outliers
        outliers = (df['price_change'] < lower_bound) | (df['price_change'] > upper_bound)
        
        if outliers.any():
            logger.warning(f"Detected {outliers.sum()} potential anomalies in price data")
            # For now, just reduce quality score for outliers
            df.loc[outliers, 'quality_score'] *= 0.5
        
        return df

class NewsDataIntegrator:
    """Integrates news data from multiple sources"""
    
    async def get_news_data(self, ticker: str, limit: int = 10) -> List[NewsArticle]:
        """Fetch news from multiple sources"""
        # Placeholder for news integration
        sample_news = [
            NewsArticle(
                headline=f"Sample news for {ticker}",
                summary="This is a sample news article",
                source="Sample Source",
                published_date=datetime.now(),
                sentiment_score=0.1,
                relevance_score=0.8,
                tickers=[ticker]
            )
        ]
        return sample_news[:limit]

class SentimentDataIntegrator:
    """Integrates social media sentiment data"""
    
    async def get_sentiment_data(self, ticker: str, hours_back: int = 24) -> List[SocialSentiment]:
        """Fetch sentiment data from social media"""
        # Placeholder for sentiment integration
        return []