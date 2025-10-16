"""
Real Trading Service
Integration with real brokers (Alpaca, Interactive Brokers, etc.)
"""

import os
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum
import asyncio
import aiohttp
from dataclasses import dataclass

logger = logging.getLogger(__name__)

class BrokerType(str, Enum):
    ALPACA = "alpaca"
    INTERACTIVE_BROKERS = "interactive_brokers"
    TD_AMERITRADE = "td_ameritrade"
    PAPER_TRADING = "paper_trading"

class OrderSide(str, Enum):
    BUY = "buy"
    SELL = "sell"

class OrderType(str, Enum):
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    STOP_LIMIT = "stop_limit"

class OrderStatus(str, Enum):
    PENDING = "pending"
    FILLED = "filled"
    PARTIALLY_FILLED = "partially_filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"

@dataclass
class TradingOrder:
    symbol: str
    side: OrderSide
    order_type: OrderType
    quantity: float
    price: Optional[float] = None
    stop_price: Optional[float] = None
    time_in_force: str = "day"

@dataclass
class OrderResult:
    success: bool
    order_id: Optional[str] = None
    message: str = ""
    data: Optional[Dict[str, Any]] = None

class AlpacaTradingClient:
    """Alpaca trading integration"""
    
    def __init__(self, api_key: str, api_secret: str, paper_trading: bool = True):
        self.api_key = api_key
        self.api_secret = api_secret
        self.paper_trading = paper_trading
        
        # Alpaca URLs
        if paper_trading:
            self.base_url = "https://paper-api.alpaca.markets"
            self.data_url = "https://data.alpaca.markets"
        else:
            self.base_url = "https://api.alpaca.markets"
            self.data_url = "https://data.alpaca.markets"
        
        self.headers = {
            "APCA-API-KEY-ID": api_key,
            "APCA-API-SECRET-KEY": api_secret,
            "Content-Type": "application/json"
        }
    
    async def get_account(self) -> Optional[Dict[str, Any]]:
        """Get account information"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/v2/account",
                    headers=self.headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.error(f"Alpaca account error: {response.status}")
                        return None
        except Exception as e:
            logger.error(f"Error getting Alpaca account: {e}")
            return None
    
    async def place_order(self, order: TradingOrder) -> OrderResult:
        """Place a trading order"""
        try:
            order_data = {
                "symbol": order.symbol,
                "qty": str(order.quantity),
                "side": order.side.value,
                "type": order.order_type.value,
                "time_in_force": order.time_in_force
            }
            
            if order.price:
                order_data["limit_price"] = str(order.price)
            
            if order.stop_price:
                order_data["stop_price"] = str(order.stop_price)
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/v2/orders",
                    headers=self.headers,
                    json=order_data
                ) as response:
                    result = await response.json()
                    
                    if response.status == 201:
                        return OrderResult(
                            success=True,
                            order_id=result.get("id"),
                            message="Order placed successfully",
                            data=result
                        )
                    else:
                        return OrderResult(
                            success=False,
                            message=result.get("message", "Order failed"),
                            data=result
                        )
                        
        except Exception as e:
            logger.error(f"Error placing Alpaca order: {e}")
            return OrderResult(
                success=False,
                message=f"Order error: {str(e)}"
            )
    
    async def cancel_order(self, order_id: str) -> OrderResult:
        """Cancel an order"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.delete(
                    f"{self.base_url}/v2/orders/{order_id}",
                    headers=self.headers
                ) as response:
                    if response.status == 204:
                        return OrderResult(
                            success=True,
                            message="Order cancelled successfully"
                        )
                    else:
                        result = await response.json()
                        return OrderResult(
                            success=False,
                            message=result.get("message", "Cancellation failed")
                        )
                        
        except Exception as e:
            logger.error(f"Error cancelling Alpaca order: {e}")
            return OrderResult(
                success=False,
                message=f"Cancellation error: {str(e)}"
            )
    
    async def get_positions(self) -> List[Dict[str, Any]]:
        """Get current positions"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/v2/positions",
                    headers=self.headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.error(f"Alpaca positions error: {response.status}")
                        return []
        except Exception as e:
            logger.error(f"Error getting Alpaca positions: {e}")
            return []
    
    async def get_orders(self, status: str = "all") -> List[Dict[str, Any]]:
        """Get orders"""
        try:
            params = {"status": status, "limit": 100}
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/v2/orders",
                    headers=self.headers,
                    params=params
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.error(f"Alpaca orders error: {response.status}")
                        return []
        except Exception as e:
            logger.error(f"Error getting Alpaca orders: {e}")
            return []

class PaperTradingClient:
    """Paper trading simulation"""
    
    def __init__(self):
        self.initial_balance = 100000.0  # $100k starting balance
        self.positions = {}
        self.orders = {}
        self.balance = self.initial_balance
        self.order_counter = 1
    
    async def get_account(self) -> Dict[str, Any]:
        """Get simulated account information"""
        return {
            "id": "paper_account",
            "account_number": "PAPER123456",
            "status": "ACTIVE",
            "currency": "USD",
            "cash": self.balance,
            "portfolio_value": self.balance + sum(
                pos["quantity"] * pos["current_price"] 
                for pos in self.positions.values()
            ),
            "buying_power": self.balance,
            "equity": self.balance,
            "last_equity": self.balance,
            "multiplier": "1",
            "created_at": "2024-01-01T00:00:00Z",
            "trading_blocked": False,
            "transfers_blocked": False,
            "account_blocked": False,
            "pattern_day_trader": False
        }
    
    async def place_order(self, order: TradingOrder) -> OrderResult:
        """Simulate placing an order"""
        try:
            # Get current market price (simplified)
            current_price = order.price or 100.0  # Use limit price or default
            
            order_id = f"paper_{self.order_counter}"
            self.order_counter += 1
            
            # Calculate order value
            order_value = order.quantity * current_price
            
            # Check if we have enough buying power
            if order.side == OrderSide.BUY and order_value > self.balance:
                return OrderResult(
                    success=False,
                    message="Insufficient buying power"
                )
            
            # Check if we have enough shares to sell
            if order.side == OrderSide.SELL:
                current_position = self.positions.get(order.symbol, {}).get("quantity", 0)
                if order.quantity > current_position:
                    return OrderResult(
                        success=False,
                        message="Insufficient shares to sell"
                    )
            
            # Execute the order immediately (market simulation)
            if order.side == OrderSide.BUY:
                self.balance -= order_value
                if order.symbol in self.positions:
                    self.positions[order.symbol]["quantity"] += order.quantity
                else:
                    self.positions[order.symbol] = {
                        "symbol": order.symbol,
                        "quantity": order.quantity,
                        "avg_cost": current_price,
                        "current_price": current_price
                    }
            else:  # SELL
                self.balance += order_value
                if order.symbol in self.positions:
                    self.positions[order.symbol]["quantity"] -= order.quantity
                    if self.positions[order.symbol]["quantity"] <= 0:
                        del self.positions[order.symbol]
            
            # Store order record
            self.orders[order_id] = {
                "id": order_id,
                "symbol": order.symbol,
                "qty": order.quantity,
                "side": order.side.value,
                "type": order.order_type.value,
                "status": "filled",
                "filled_qty": order.quantity,
                "filled_avg_price": current_price,
                "created_at": datetime.utcnow().isoformat(),
                "filled_at": datetime.utcnow().isoformat()
            }
            
            return OrderResult(
                success=True,
                order_id=order_id,
                message="Paper order executed successfully",
                data=self.orders[order_id]
            )
            
        except Exception as e:
            logger.error(f"Error in paper trading order: {e}")
            return OrderResult(
                success=False,
                message=f"Paper trading error: {str(e)}"
            )
    
    async def cancel_order(self, order_id: str) -> OrderResult:
        """Cancel a paper order (always succeeds for simulation)"""
        if order_id in self.orders:
            self.orders[order_id]["status"] = "cancelled"
            return OrderResult(
                success=True,
                message="Paper order cancelled"
            )
        else:
            return OrderResult(
                success=False,
                message="Order not found"
            )
    
    async def get_positions(self) -> List[Dict[str, Any]]:
        """Get simulated positions"""
        return list(self.positions.values())
    
    async def get_orders(self, status: str = "all") -> List[Dict[str, Any]]:
        """Get simulated orders"""
        if status == "all":
            return list(self.orders.values())
        else:
            return [order for order in self.orders.values() if order["status"] == status]

class TradingService:
    """Main trading service that manages different brokers"""
    
    def __init__(self):
        self.clients = {}
        self.paper_client = PaperTradingClient()
    
    def add_broker_client(self, user_id: str, broker_type: BrokerType, credentials: Dict[str, str]):
        """Add a broker client for a user"""
        try:
            if broker_type == BrokerType.ALPACA:
                client = AlpacaTradingClient(
                    api_key=credentials["api_key"],
                    api_secret=credentials["api_secret"],
                    paper_trading=credentials.get("paper_trading", True)
                )
                self.clients[f"{user_id}:{broker_type}"] = client
                logger.info(f"Added Alpaca client for user {user_id}")
                
            elif broker_type == BrokerType.PAPER_TRADING:
                self.clients[f"{user_id}:{broker_type}"] = self.paper_client
                logger.info(f"Added paper trading client for user {user_id}")
                
            return True
            
        except Exception as e:
            logger.error(f"Error adding broker client: {e}")
            return False
    
    def get_client(self, user_id: str, broker_type: BrokerType):
        """Get trading client for user and broker"""
        client_key = f"{user_id}:{broker_type}"
        return self.clients.get(client_key)
    
    async def place_order(self, user_id: str, broker_type: BrokerType, order: TradingOrder) -> OrderResult:
        """Place an order through the specified broker"""
        client = self.get_client(user_id, broker_type)
        if not client:
            return OrderResult(
                success=False,
                message="Trading client not configured"
            )
        
        return await client.place_order(order)
    
    async def cancel_order(self, user_id: str, broker_type: BrokerType, order_id: str) -> OrderResult:
        """Cancel an order"""
        client = self.get_client(user_id, broker_type)
        if not client:
            return OrderResult(
                success=False,
                message="Trading client not configured"
            )
        
        return await client.cancel_order(order_id)
    
    async def get_account_info(self, user_id: str, broker_type: BrokerType) -> Optional[Dict[str, Any]]:
        """Get account information"""
        client = self.get_client(user_id, broker_type)
        if not client:
            return None
        
        return await client.get_account()
    
    async def get_positions(self, user_id: str, broker_type: BrokerType) -> List[Dict[str, Any]]:
        """Get current positions"""
        client = self.get_client(user_id, broker_type)
        if not client:
            return []
        
        return await client.get_positions()
    
    async def get_orders(self, user_id: str, broker_type: BrokerType, status: str = "all") -> List[Dict[str, Any]]:
        """Get orders"""
        client = self.get_client(user_id, broker_type)
        if not client:
            return []
        
        return await client.get_orders(status)

# Global trading service instance
trading_service = TradingService()