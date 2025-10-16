"""
Real-time streaming engine for live data processing and WebSocket connections
"""
import asyncio
import json
import logging
from typing import Dict, List, Set, Any, Optional
from datetime import datetime, timedelta
import websockets
from fastapi import WebSocket, WebSocketDisconnect
import redis.asyncio as redis
from ..models.market_data import OHLCVData, NewsArticle, SocialSentiment
from ..models.predictions import EnsemblePrediction
from .data_integration import MultiSourceDataIntegrator
from .prediction_engine import HybridPredictionEngine

logger = logging.getLogger(__name__)

class StreamingDataAgent:
    """Agent for real-time data streaming and processing"""
    
    def __init__(self):
        self.redis_client = None
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.data_integrator = MultiSourceDataIntegrator()
        self.prediction_engine = HybridPredictionEngine()
        self.streaming_tasks: Dict[str, asyncio.Task] = {}
        
    async def initialize(self):
        """Initialize Redis connection and streaming infrastructure"""
        try:
            self.redis_client = redis.Redis(
                host='localhost', 
                port=6379, 
                decode_responses=True
            )
            await self.redis_client.ping()
            logger.info("Streaming engine initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize streaming engine: {e}")
            # Use in-memory fallback
            self.redis_client = None
    
    async def connect_websocket(self, websocket: WebSocket, client_id: str, subscriptions: List[str]):
        """Connect a WebSocket client with specific subscriptions"""
        await websocket.accept()
        
        for subscription in subscriptions:
            if subscription not in self.active_connections:
                self.active_connections[subscription] = set()
            self.active_connections[subscription].add(websocket)
        
        logger.info(f"Client {client_id} connected with subscriptions: {subscriptions}")
        
        # Start streaming tasks if not already running
        for subscription in subscriptions:
            if subscription not in self.streaming_tasks:
                self.streaming_tasks[subscription] = asyncio.create_task(
                    self._stream_data(subscription)
                )
    
    async def disconnect_websocket(self, websocket: WebSocket, subscriptions: List[str]):
        """Disconnect a WebSocket client"""
        for subscription in subscriptions:
            if subscription in self.active_connections:
                self.active_connections[subscription].discard(websocket)
                
                # Stop streaming task if no more connections
                if not self.active_connections[subscription]:
                    if subscription in self.streaming_tasks:
                        self.streaming_tasks[subscription].cancel()
                        del self.streaming_tasks[subscription]
    
    async def _stream_data(self, subscription: str):
        """Stream data for a specific subscription"""
        try:
            while True:
                if subscription.startswith('ticker:'):
                    ticker = subscription.split(':')[1]
                    await self._stream_ticker_data(ticker)
                elif subscription == 'market_overview':
                    await self._stream_market_overview()
                elif subscription == 'social_sentiment':
                    await self._stream_social_sentiment()
                elif subscription.startswith('predictions:'):
                    ticker = subscription.split(':')[1]
                    await self._stream_predictions(ticker)
                
                await asyncio.sleep(1)  # Stream every second
                
        except asyncio.CancelledError:
            logger.info(f"Streaming task cancelled for {subscription}")
        except Exception as e:
            logger.error(f"Error in streaming task for {subscription}: {e}")
    
    async def _stream_ticker_data(self, ticker: str):
        """Stream real-time ticker data"""
        try:
            # Fetch latest data (in production, this would be real-time feeds)
            ohlcv_data = await self.data_integrator.get_ohlcv_data(ticker, period="1d", interval="1m")
            
            if ohlcv_data:
                latest_data = ohlcv_data[-1]
                stream_data = {
                    'type': 'ticker_update',
                    'ticker': ticker,
                    'data': {
                        'price': latest_data.close,
                        'change': latest_data.close - ohlcv_data[-2].close if len(ohlcv_data) > 1 else 0,
                        'change_percent': ((latest_data.close - ohlcv_data[-2].close) / ohlcv_data[-2].close * 100) if len(ohlcv_data) > 1 else 0,
                        'volume': latest_data.volume,
                        'timestamp': latest_data.timestamp.isoformat()
                    }
                }
                
                await self._broadcast_to_subscribers(f'ticker:{ticker}', stream_data)
                
        except Exception as e:
            logger.error(f"Error streaming ticker data for {ticker}: {e}")
    
    async def _stream_market_overview(self):
        """Stream market overview data"""
        try:
            market_data = {
                'type': 'market_overview',
                'data': {
                    'indices': {
                        'SPY': {'price': 450.0, 'change': 1.2, 'change_percent': 0.27},
                        'QQQ': {'price': 380.0, 'change': -0.5, 'change_percent': -0.13},
                        'DIA': {'price': 340.0, 'change': 0.8, 'change_percent': 0.24}
                    },
                    'market_sentiment': 0.15,
                    'timestamp': datetime.now().isoformat()
                }
            }
            
            await self._broadcast_to_subscribers('market_overview', market_data)
            
        except Exception as e:
            logger.error(f"Error streaming market overview: {e}")
    
    async def _stream_social_sentiment(self):
        """Stream social sentiment updates"""
        try:
            sentiment_data = {
                'type': 'social_sentiment',
                'data': {
                    'overall_sentiment': 0.15,
                    'trending_tickers': [
                        {'ticker': 'AAPL', 'sentiment': 0.25, 'mentions': 245},
                        {'ticker': 'TSLA', 'sentiment': -0.12, 'mentions': 189}
                    ],
                    'timestamp': datetime.now().isoformat()
                }
            }
            
            await self._broadcast_to_subscribers('social_sentiment', sentiment_data)
            
        except Exception as e:
            logger.error(f"Error streaming social sentiment: {e}")
    
    async def _stream_predictions(self, ticker: str):
        """Stream AI prediction updates"""
        try:
            # Generate fresh predictions periodically
            ohlcv_data = await self.data_integrator.get_ohlcv_data(ticker, period="1y", interval="1d")
            prediction = await self.prediction_engine.generate_prediction(ticker, ohlcv_data)
            
            prediction_data = {
                'type': 'prediction_update',
                'ticker': ticker,
                'data': {
                    'action': prediction.final_action,
                    'target_price': prediction.final_target_price,
                    'confidence': prediction.final_confidence,
                    'consensus_strength': prediction.consensus_strength,
                    'timestamp': prediction.created_at.isoformat()
                }
            }
            
            await self._broadcast_to_subscribers(f'predictions:{ticker}', prediction_data)
            
        except Exception as e:
            logger.error(f"Error streaming predictions for {ticker}: {e}")
    
    async def _broadcast_to_subscribers(self, subscription: str, data: Dict[str, Any]):
        """Broadcast data to all subscribers of a channel"""
        if subscription not in self.active_connections:
            return
        
        message = json.dumps(data)
        disconnected_clients = set()
        
        for websocket in self.active_connections[subscription]:
            try:
                await websocket.send_text(message)
            except WebSocketDisconnect:
                disconnected_clients.add(websocket)
            except Exception as e:
                logger.error(f"Error sending message to WebSocket: {e}")
                disconnected_clients.add(websocket)
        
        # Remove disconnected clients
        for websocket in disconnected_clients:
            self.active_connections[subscription].discard(websocket)

class LivePredictionAgent:
    """Agent for real-time prediction generation and monitoring"""
    
    def __init__(self):
        self.prediction_engine = HybridPredictionEngine()
        self.data_integrator = MultiSourceDataIntegrator()
        self.active_predictions: Dict[str, EnsemblePrediction] = {}
        self.prediction_tasks: Dict[str, asyncio.Task] = {}
        
    async def start_live_predictions(self, tickers: List[str], update_interval: int = 300):
        """Start live prediction generation for specified tickers"""
        for ticker in tickers:
            if ticker not in self.prediction_tasks:
                self.prediction_tasks[ticker] = asyncio.create_task(
                    self._generate_live_predictions(ticker, update_interval)
                )
                logger.info(f"Started live predictions for {ticker}")
    
    async def stop_live_predictions(self, tickers: List[str]):
        """Stop live prediction generation for specified tickers"""
        for ticker in tickers:
            if ticker in self.prediction_tasks:
                self.prediction_tasks[ticker].cancel()
                del self.prediction_tasks[ticker]
                logger.info(f"Stopped live predictions for {ticker}")
    
    async def _generate_live_predictions(self, ticker: str, update_interval: int):
        """Generate predictions at regular intervals"""
        try:
            while True:
                # Fetch latest data
                ohlcv_data = await self.data_integrator.get_ohlcv_data(ticker, period="1y", interval="1d")
                
                # Generate prediction
                prediction = await self.prediction_engine.generate_prediction(ticker, ohlcv_data)
                
                # Store and compare with previous prediction
                previous_prediction = self.active_predictions.get(ticker)
                self.active_predictions[ticker] = prediction
                
                # Check for significant changes
                if previous_prediction:
                    confidence_change = abs(prediction.final_confidence - previous_prediction.final_confidence)
                    action_change = prediction.final_action != previous_prediction.final_action
                    
                    if confidence_change > 0.1 or action_change:
                        logger.info(f"Significant prediction change for {ticker}: {prediction.final_action} (confidence: {prediction.final_confidence:.2f})")
                        # Trigger alerts or notifications here
                
                await asyncio.sleep(update_interval)
                
        except asyncio.CancelledError:
            logger.info(f"Live prediction task cancelled for {ticker}")
        except Exception as e:
            logger.error(f"Error in live prediction generation for {ticker}: {e}")

class RiskMonitoringAgent:
    """Agent for continuous portfolio risk monitoring"""
    
    def __init__(self):
        self.risk_thresholds = {
            'max_position_size': 0.1,  # 10% max position
            'max_sector_allocation': 0.3,  # 30% max sector
            'max_daily_loss': 0.05,  # 5% max daily loss
            'min_diversification': 10  # Minimum 10 positions
        }
        self.monitoring_tasks: Dict[str, asyncio.Task] = {}
    
    async def start_risk_monitoring(self, portfolio_id: str, check_interval: int = 60):
        """Start continuous risk monitoring for a portfolio"""
        if portfolio_id not in self.monitoring_tasks:
            self.monitoring_tasks[portfolio_id] = asyncio.create_task(
                self._monitor_portfolio_risk(portfolio_id, check_interval)
            )
            logger.info(f"Started risk monitoring for portfolio {portfolio_id}")
    
    async def _monitor_portfolio_risk(self, portfolio_id: str, check_interval: int):
        """Monitor portfolio risk continuously"""
        try:
            while True:
                # Fetch portfolio data (placeholder)
                portfolio_data = await self._get_portfolio_data(portfolio_id)
                
                # Calculate risk metrics
                risk_metrics = await self._calculate_risk_metrics(portfolio_data)
                
                # Check for threshold breaches
                alerts = self._check_risk_thresholds(risk_metrics)
                
                if alerts:
                    await self._send_risk_alerts(portfolio_id, alerts)
                
                await asyncio.sleep(check_interval)
                
        except asyncio.CancelledError:
            logger.info(f"Risk monitoring task cancelled for portfolio {portfolio_id}")
        except Exception as e:
            logger.error(f"Error in risk monitoring for portfolio {portfolio_id}: {e}")
    
    async def _get_portfolio_data(self, portfolio_id: str) -> Dict[str, Any]:
        """Fetch current portfolio data"""
        # Placeholder implementation
        return {
            'positions': [
                {'ticker': 'AAPL', 'quantity': 100, 'value': 15000, 'sector': 'Technology'},
                {'ticker': 'MSFT', 'quantity': 50, 'value': 19000, 'sector': 'Technology'}
            ],
            'total_value': 34000,
            'cash': 5000
        }
    
    async def _calculate_risk_metrics(self, portfolio_data: Dict[str, Any]) -> Dict[str, float]:
        """Calculate comprehensive risk metrics"""
        positions = portfolio_data['positions']
        total_value = portfolio_data['total_value']
        
        # Position concentration
        max_position = max(pos['value'] / total_value for pos in positions) if positions else 0
        
        # Sector concentration
        sector_allocation = {}
        for pos in positions:
            sector = pos['sector']
            sector_allocation[sector] = sector_allocation.get(sector, 0) + pos['value']
        
        max_sector = max(allocation / total_value for allocation in sector_allocation.values()) if sector_allocation else 0
        
        # Diversification
        num_positions = len(positions)
        
        return {
            'max_position_concentration': max_position,
            'max_sector_concentration': max_sector,
            'num_positions': num_positions,
            'portfolio_value': total_value
        }
    
    def _check_risk_thresholds(self, risk_metrics: Dict[str, float]) -> List[Dict[str, Any]]:
        """Check if any risk thresholds are breached"""
        alerts = []
        
        if risk_metrics['max_position_concentration'] > self.risk_thresholds['max_position_size']:
            alerts.append({
                'type': 'position_concentration',
                'severity': 'high',
                'message': f"Position concentration {risk_metrics['max_position_concentration']:.1%} exceeds threshold {self.risk_thresholds['max_position_size']:.1%}"
            })
        
        if risk_metrics['max_sector_concentration'] > self.risk_thresholds['max_sector_allocation']:
            alerts.append({
                'type': 'sector_concentration',
                'severity': 'medium',
                'message': f"Sector concentration {risk_metrics['max_sector_concentration']:.1%} exceeds threshold {self.risk_thresholds['max_sector_allocation']:.1%}"
            })
        
        if risk_metrics['num_positions'] < self.risk_thresholds['min_diversification']:
            alerts.append({
                'type': 'insufficient_diversification',
                'severity': 'medium',
                'message': f"Portfolio has only {risk_metrics['num_positions']} positions, minimum recommended: {self.risk_thresholds['min_diversification']}"
            })
        
        return alerts
    
    async def _send_risk_alerts(self, portfolio_id: str, alerts: List[Dict[str, Any]]):
        """Send risk alerts to appropriate channels"""
        for alert in alerts:
            logger.warning(f"Risk alert for portfolio {portfolio_id}: {alert['message']}")
            # In production, send to notification service, email, SMS, etc.

# Global instances
streaming_agent = StreamingDataAgent()
live_prediction_agent = LivePredictionAgent()
risk_monitoring_agent = RiskMonitoringAgent()