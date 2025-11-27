import asyncio
import json
import logging
from typing import Dict, Set, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime
import uuid

from .professional_data_service import professional_data_service, RealTimeQuote

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections like TradingView/Upstox"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.subscriptions: Dict[str, Set[str]] = {}  # symbol -> set of connection_ids
        self.connection_symbols: Dict[str, Set[str]] = {}  # connection_id -> set of symbols
        self.update_tasks: Dict[str, asyncio.Task] = {}
        
    async def connect(self, websocket: WebSocket, connection_id: str = None) -> str:
        """Connect a WebSocket client"""
        if connection_id is None:
            connection_id = str(uuid.uuid4())
        
        await websocket.accept()
        self.active_connections[connection_id] = websocket
        self.connection_symbols[connection_id] = set()
        
        logger.info(f"WebSocket client connected: {connection_id}")
        
        # Send connection confirmation
        await self._send_to_connection(connection_id, {
            "type": "connection_established",
            "connection_id": connection_id,
            "timestamp": datetime.now().isoformat()
        })
        
        return connection_id
    
    async def disconnect(self, connection_id: str):
        """Disconnect a WebSocket client"""
        if connection_id in self.active_connections:
            # Unsubscribe from all symbols
            symbols = self.connection_symbols.get(connection_id, set()).copy()
            for symbol in symbols:
                await self.unsubscribe(connection_id, symbol)
            
            # Remove connection
            del self.active_connections[connection_id]
            if connection_id in self.connection_symbols:
                del self.connection_symbols[connection_id]
            
            logger.info(f"WebSocket client disconnected: {connection_id}")
    
    async def subscribe(self, connection_id: str, symbol: str):
        """Subscribe to a symbol"""
        if connection_id not in self.active_connections:
            return False
        
        # Add to subscriptions
        if symbol not in self.subscriptions:
            self.subscriptions[symbol] = set()
        self.subscriptions[symbol].add(connection_id)
        
        # Add to connection symbols
        self.connection_symbols[connection_id].add(symbol)
        
        # Start data updates for this symbol if not already running
        if symbol not in self.update_tasks:
            self.update_tasks[symbol] = asyncio.create_task(
                self._symbol_update_loop(symbol)
            )
        
        # Send current quote immediately
        try:
            quote = await professional_data_service.get_quote(symbol)
            if quote:
                await self._send_to_connection(connection_id, {
                    "type": "quote_update",
                    "symbol": symbol,
                    "data": self._quote_to_dict(quote)
                })
        except Exception as e:
            logger.error(f"Error sending initial quote for {symbol}: {e}")
        
        logger.info(f"Client {connection_id} subscribed to {symbol}")
        return True
    
    async def unsubscribe(self, connection_id: str, symbol: str):
        """Unsubscribe from a symbol"""
        if connection_id not in self.active_connections:
            return False
        
        # Remove from subscriptions
        if symbol in self.subscriptions:
            self.subscriptions[symbol].discard(connection_id)
            if not self.subscriptions[symbol]:
                del self.subscriptions[symbol]
                
                # Stop update task if no more subscribers
                if symbol in self.update_tasks:
                    self.update_tasks[symbol].cancel()
                    del self.update_tasks[symbol]
        
        # Remove from connection symbols
        self.connection_symbols[connection_id].discard(symbol)
        
        logger.info(f"Client {connection_id} unsubscribed from {symbol}")
        return True
    
    async def _symbol_update_loop(self, symbol: str):
        """Update loop for a specific symbol"""
        try:
            while symbol in self.subscriptions and self.subscriptions[symbol]:
                try:
                    # Get fresh quote
                    quote = await professional_data_service.get_quote(symbol)
                    
                    if quote:
                        # Broadcast to all subscribers
                        message = {
                            "type": "quote_update",
                            "symbol": symbol,
                            "data": self._quote_to_dict(quote)
                        }
                        
                        await self._broadcast_to_symbol_subscribers(symbol, message)
                    
                    # Update frequency based on market hours and symbol type
                    await asyncio.sleep(self._get_update_interval(symbol))
                    
                except Exception as e:
                    logger.error(f"Error in update loop for {symbol}: {e}")
                    await asyncio.sleep(5)  # Wait before retrying
                    
        except asyncio.CancelledError:
            logger.info(f"Update loop cancelled for {symbol}")
        except Exception as e:
            logger.error(f"Update loop error for {symbol}: {e}")
    
    def _get_update_interval(self, symbol: str) -> float:
        """Get update interval based on symbol type and market conditions"""
        # Crypto: 1 second
        if any(crypto in symbol for crypto in ['BTC', 'ETH', 'USD']):
            return 1.0
        
        # Forex: 2 seconds
        if '=' in symbol:
            return 2.0
        
        # Stocks: 3 seconds during market hours, 30 seconds after hours
        now = datetime.now()
        market_hours = 9 <= now.hour <= 16  # Simplified market hours
        return 3.0 if market_hours else 30.0
    
    async def _broadcast_to_symbol_subscribers(self, symbol: str, message: Dict[str, Any]):
        """Broadcast message to all subscribers of a symbol"""
        if symbol not in self.subscriptions:
            return
        
        disconnected_connections = []
        
        for connection_id in self.subscriptions[symbol].copy():
            try:
                await self._send_to_connection(connection_id, message)
            except Exception as e:
                logger.error(f"Error sending to connection {connection_id}: {e}")
                disconnected_connections.append(connection_id)
        
        # Clean up disconnected connections
        for connection_id in disconnected_connections:
            await self.disconnect(connection_id)
    
    async def _send_to_connection(self, connection_id: str, message: Dict[str, Any]):
        """Send message to a specific connection"""
        if connection_id not in self.active_connections:
            return
        
        websocket = self.active_connections[connection_id]
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending message to {connection_id}: {e}")
            raise
    
    def _quote_to_dict(self, quote: RealTimeQuote) -> Dict[str, Any]:
        """Convert quote to dictionary for JSON serialization"""
        return {
            "symbol": quote.symbol,
            "price": quote.price,
            "change": quote.change,
            "change_percent": quote.change_percent,
            "volume": quote.volume,
            "bid": quote.bid,
            "ask": quote.ask,
            "high": quote.high,
            "low": quote.low,
            "open": quote.open_price,
            "previous_close": quote.previous_close,
            "timestamp": quote.timestamp.isoformat(),
            "source": quote.source
        }
    
    async def handle_message(self, connection_id: str, message: str):
        """Handle incoming WebSocket message"""
        try:
            data = json.loads(message)
            action = data.get("action")
            
            if action == "subscribe":
                symbol = data.get("symbol", "").upper()
                if symbol:
                    success = await self.subscribe(connection_id, symbol)
                    await self._send_to_connection(connection_id, {
                        "type": "subscription_response",
                        "action": "subscribe",
                        "symbol": symbol,
                        "success": success
                    })
            
            elif action == "unsubscribe":
                symbol = data.get("symbol", "").upper()
                if symbol:
                    success = await self.unsubscribe(connection_id, symbol)
                    await self._send_to_connection(connection_id, {
                        "type": "subscription_response",
                        "action": "unsubscribe",
                        "symbol": symbol,
                        "success": success
                    })
            
            elif action == "get_quote":
                symbol = data.get("symbol", "").upper()
                if symbol:
                    quote = await professional_data_service.get_quote(symbol)
                    await self._send_to_connection(connection_id, {
                        "type": "quote_response",
                        "symbol": symbol,
                        "data": self._quote_to_dict(quote) if quote else None
                    })
            
            elif action == "ping":
                await self._send_to_connection(connection_id, {
                    "type": "pong",
                    "timestamp": datetime.now().isoformat()
                })
            
            else:
                await self._send_to_connection(connection_id, {
                    "type": "error",
                    "message": f"Unknown action: {action}"
                })
                
        except json.JSONDecodeError:
            await self._send_to_connection(connection_id, {
                "type": "error",
                "message": "Invalid JSON format"
            })
        except Exception as e:
            logger.error(f"Error handling message from {connection_id}: {e}")
            await self._send_to_connection(connection_id, {
                "type": "error",
                "message": "Internal server error"
            })
    
    def get_stats(self) -> Dict[str, Any]:
        """Get connection manager statistics"""
        return {
            "active_connections": len(self.active_connections),
            "total_subscriptions": sum(len(subs) for subs in self.subscriptions.values()),
            "unique_symbols": len(self.subscriptions),
            "active_update_tasks": len(self.update_tasks),
            "symbols_by_subscribers": {
                symbol: len(subscribers) 
                for symbol, subscribers in self.subscriptions.items()
            }
        }

# Global connection manager
connection_manager = ConnectionManager()

class RealTimeWebSocketService:
    """Main WebSocket service for real-time data"""
    
    def __init__(self):
        self.manager = connection_manager
    
    async def websocket_endpoint(self, websocket: WebSocket, client_id: str = None):
        """Main WebSocket endpoint"""
        connection_id = await self.manager.connect(websocket, client_id)
        
        try:
            while True:
                # Wait for message from client
                message = await websocket.receive_text()
                await self.manager.handle_message(connection_id, message)
                
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected: {connection_id}")
        except Exception as e:
            logger.error(f"WebSocket error for {connection_id}: {e}")
        finally:
            await self.manager.disconnect(connection_id)
    
    async def start_service(self):
        """Start the WebSocket service"""
        await professional_data_service.start()
        logger.info("Real-time WebSocket service started")
    
    async def stop_service(self):
        """Stop the WebSocket service"""
        await professional_data_service.stop()
        logger.info("Real-time WebSocket service stopped")
    
    def get_service_status(self) -> Dict[str, Any]:
        """Get service status"""
        return {
            "websocket_stats": self.manager.get_stats(),
            "data_service_stats": professional_data_service.get_service_status()
        }

# Global service instance
realtime_websocket_service = RealTimeWebSocketService()