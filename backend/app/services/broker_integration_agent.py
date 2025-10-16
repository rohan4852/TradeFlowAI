"""
Broker Integration Agent for live trading execution and portfolio synchronization
"""
import asyncio
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
from enum import Enum
import aiohttp
import json
from dataclasses import dataclass
from ..models.predictions import PredictionAction

logger = logging.getLogger(__name__)

class OrderType(str, Enum):
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    STOP_LIMIT = "stop_limit"

class OrderSide(str, Enum):
    BUY = "buy"
    SELL = "sell"

class OrderStatus(str, Enum):
    PENDING = "pending"
    FILLED = "filled"
    PARTIALLY_FILLED = "partially_filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"

@dataclass
class Order:
    id: str
    symbol: str
    side: OrderSide
    type: OrderType
    quantity: float
    price: Optional[float] = None
    stop_price: Optional[float] = None
    status: OrderStatus = OrderStatus.PENDING
    filled_quantity: float = 0.0
    average_fill_price: Optional[float] = None
    created_at: datetime = None
    updated_at: datetime = None

@dataclass
class Position:
    symbol: str
    quantity: float
    average_price: float
    market_value: float
    unrealized_pnl: float
    side: str  # "long" or "short"

@dataclass
class Account:
    id: str
    buying_power: float
    cash: float
    portfolio_value: float
    day_trade_count: int
    positions: List[Position]

class BrokerInterface:
    """Base interface for broker integrations"""
    
    async def authenticate(self, credentials: Dict[str, str]) -> bool:
        raise NotImplementedError
    
    async def get_account(self) -> Account:
        raise NotImplementedError
    
    async def get_positions(self) -> List[Position]:
        raise NotImplementedError
    
    async def place_order(self, order: Order) -> Order:
        raise NotImplementedError
    
    async def cancel_order(self, order_id: str) -> bool:
        raise NotImplementedError
    
    async def get_order_status(self, order_id: str) -> Order:
        raise NotImplementedError
    
    async def get_market_data(self, symbol: str) -> Dict[str, Any]:
        raise NotImplementedError

class AlpacaBroker(BrokerInterface):
    """Alpaca broker integration"""
    
    def __init__(self):
        self.base_url = "https://paper-api.alpaca.markets"  # Paper trading by default
        self.api_key = None
        self.secret_key = None
        self.session = None
        
    async def authenticate(self, credentials: Dict[str, str]) -> bool:
        try:
            self.api_key = credentials.get('api_key')
            self.secret_key = credentials.get('secret_key')
            
            if credentials.get('live_trading', False):
                self.base_url = "https://api.alpaca.markets"
            
            self.session = aiohttp.ClientSession(
                headers={
                    'APCA-API-KEY-ID': self.api_key,
                    'APCA-API-SECRET-KEY': self.secret_key
                }
            )
            
            # Test authentication
            async with self.session.get(f"{self.base_url}/v2/account") as response:
                if response.status == 200:
                    logger.info("Alpaca authentication successful")
                    return True
                else:
                    logger.error(f"Alpaca authentication failed: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"Alpaca authentication error: {e}")
            return False
    
    async def get_account(self) -> Account:
        try:
            async with self.session.get(f"{self.base_url}/v2/account") as response:
                if response.status == 200:
                    data = await response.json()
                    positions = await self.get_positions()
                    
                    return Account(
                        id=data['id'],
                        buying_power=float(data['buying_power']),
                        cash=float(data['cash']),
                        portfolio_value=float(data['portfolio_value']),
                        day_trade_count=int(data['daytrade_count']),
                        positions=positions
                    )
                else:
                    raise Exception(f"Failed to get account: {response.status}")
                    
        except Exception as e:
            logger.error(f"Error getting Alpaca account: {e}")
            raise
    
    async def get_positions(self) -> List[Position]:
        try:
            async with self.session.get(f"{self.base_url}/v2/positions") as response:
                if response.status == 200:
                    data = await response.json()
                    positions = []
                    
                    for pos_data in data:
                        positions.append(Position(
                            symbol=pos_data['symbol'],
                            quantity=float(pos_data['qty']),
                            average_price=float(pos_data['avg_entry_price']),
                            market_value=float(pos_data['market_value']),
                            unrealized_pnl=float(pos_data['unrealized_pl']),
                            side=pos_data['side']
                        ))
                    
                    return positions
                else:
                    raise Exception(f"Failed to get positions: {response.status}")
                    
        except Exception as e:
            logger.error(f"Error getting Alpaca positions: {e}")
            return []
    
    async def place_order(self, order: Order) -> Order:
        try:
            order_data = {
                'symbol': order.symbol,
                'qty': str(order.quantity),
                'side': order.side.value,
                'type': order.type.value,
                'time_in_force': 'day'
            }
            
            if order.type in [OrderType.LIMIT, OrderType.STOP_LIMIT]:
                order_data['limit_price'] = str(order.price)
            
            if order.type in [OrderType.STOP, OrderType.STOP_LIMIT]:
                order_data['stop_price'] = str(order.stop_price)
            
            async with self.session.post(
                f"{self.base_url}/v2/orders",
                json=order_data
            ) as response:
                if response.status == 201:
                    data = await response.json()
                    order.id = data['id']
                    order.status = OrderStatus(data['status'])
                    order.created_at = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
                    
                    logger.info(f"Order placed successfully: {order.id}")
                    return order
                else:
                    error_data = await response.json()
                    raise Exception(f"Failed to place order: {error_data}")
                    
        except Exception as e:
            logger.error(f"Error placing Alpaca order: {e}")
            order.status = OrderStatus.REJECTED
            raise
    
    async def cancel_order(self, order_id: str) -> bool:
        try:
            async with self.session.delete(f"{self.base_url}/v2/orders/{order_id}") as response:
                if response.status == 204:
                    logger.info(f"Order cancelled successfully: {order_id}")
                    return True
                else:
                    logger.error(f"Failed to cancel order: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error cancelling Alpaca order: {e}")
            return False
    
    async def get_order_status(self, order_id: str) -> Order:
        try:
            async with self.session.get(f"{self.base_url}/v2/orders/{order_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    return Order(
                        id=data['id'],
                        symbol=data['symbol'],
                        side=OrderSide(data['side']),
                        type=OrderType(data['order_type']),
                        quantity=float(data['qty']),
                        price=float(data['limit_price']) if data.get('limit_price') else None,
                        stop_price=float(data['stop_price']) if data.get('stop_price') else None,
                        status=OrderStatus(data['status']),
                        filled_quantity=float(data['filled_qty']),
                        average_fill_price=float(data['filled_avg_price']) if data.get('filled_avg_price') else None,
                        created_at=datetime.fromisoformat(data['created_at'].replace('Z', '+00:00')),
                        updated_at=datetime.fromisoformat(data['updated_at'].replace('Z', '+00:00'))
                    )
                else:
                    raise Exception(f"Failed to get order status: {response.status}")
                    
        except Exception as e:
            logger.error(f"Error getting Alpaca order status: {e}")
            raise
    
    async def get_market_data(self, symbol: str) -> Dict[str, Any]:
        try:
            async with self.session.get(
                f"{self.base_url}/v2/stocks/{symbol}/quotes/latest"
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    quote = data['quote']
                    
                    return {
                        'symbol': symbol,
                        'bid': float(quote['bp']),
                        'ask': float(quote['ap']),
                        'bid_size': int(quote['bs']),
                        'ask_size': int(quote['as']),
                        'timestamp': quote['t']
                    }
                else:
                    raise Exception(f"Failed to get market data: {response.status}")
                    
        except Exception as e:
            logger.error(f"Error getting Alpaca market data: {e}")
            return {}

class InteractiveBrokersBroker(BrokerInterface):
    """Interactive Brokers integration (placeholder)"""
    
    async def authenticate(self, credentials: Dict[str, str]) -> bool:
        # Placeholder for IB integration
        logger.info("Interactive Brokers integration not yet implemented")
        return False
    
    async def get_account(self) -> Account:
        raise NotImplementedError("Interactive Brokers integration pending")
    
    async def get_positions(self) -> List[Position]:
        raise NotImplementedError("Interactive Brokers integration pending")
    
    async def place_order(self, order: Order) -> Order:
        raise NotImplementedError("Interactive Brokers integration pending")
    
    async def cancel_order(self, order_id: str) -> bool:
        raise NotImplementedError("Interactive Brokers integration pending")
    
    async def get_order_status(self, order_id: str) -> Order:
        raise NotImplementedError("Interactive Brokers integration pending")
    
    async def get_market_data(self, symbol: str) -> Dict[str, Any]:
        raise NotImplementedError("Interactive Brokers integration pending")

class BrokerIntegrationAgent:
    """Main agent for managing broker integrations and live trading"""
    
    def __init__(self):
        self.brokers: Dict[str, BrokerInterface] = {
            'alpaca': AlpacaBroker(),
            'interactive_brokers': InteractiveBrokersBroker()
        }
        self.active_broker: Optional[BrokerInterface] = None
        self.active_broker_name: Optional[str] = None
        self.risk_limits = {
            'max_position_size': 0.1,  # 10% of portfolio
            'max_daily_trades': 10,
            'max_daily_loss': 0.05,  # 5% of portfolio
            'min_account_balance': 1000.0
        }
        self.daily_stats = {
            'trades_count': 0,
            'realized_pnl': 0.0,
            'last_reset': datetime.now().date()
        }
    
    async def connect_broker(self, broker_name: str, credentials: Dict[str, str]) -> bool:
        """Connect to a specific broker"""
        try:
            if broker_name not in self.brokers:
                raise ValueError(f"Unsupported broker: {broker_name}")
            
            broker = self.brokers[broker_name]
            success = await broker.authenticate(credentials)
            
            if success:
                self.active_broker = broker
                self.active_broker_name = broker_name
                logger.info(f"Successfully connected to {broker_name}")
                return True
            else:
                logger.error(f"Failed to connect to {broker_name}")
                return False
                
        except Exception as e:
            logger.error(f"Error connecting to broker {broker_name}: {e}")
            return False
    
    async def execute_ai_recommendation(self, 
                                      symbol: str, 
                                      recommendation: Dict[str, Any],
                                      position_size: float = 0.05) -> Optional[Order]:
        """Execute trading based on AI recommendation"""
        try:
            if not self.active_broker:
                raise Exception("No active broker connection")
            
            # Reset daily stats if new day
            if datetime.now().date() > self.daily_stats['last_reset']:
                self.daily_stats = {
                    'trades_count': 0,
                    'realized_pnl': 0.0,
                    'last_reset': datetime.now().date()
                }
            
            # Check risk limits
            risk_check = await self._check_risk_limits(symbol, recommendation, position_size)
            if not risk_check['allowed']:
                logger.warning(f"Trade blocked by risk limits: {risk_check['reason']}")
                return None
            
            # Get current account info
            account = await self.active_broker.get_account()
            
            # Calculate position size
            trade_value = account.portfolio_value * position_size
            market_data = await self.active_broker.get_market_data(symbol)
            
            if not market_data:
                raise Exception(f"Could not get market data for {symbol}")
            
            current_price = (market_data['bid'] + market_data['ask']) / 2
            quantity = int(trade_value / current_price)
            
            if quantity == 0:
                logger.warning(f"Calculated quantity is 0 for {symbol}")
                return None
            
            # Determine order side based on recommendation
            action = recommendation.get('action', 'HOLD')
            if action == 'BUY':
                side = OrderSide.BUY
            elif action == 'SELL':
                side = OrderSide.SELL
            else:
                logger.info(f"No action needed for {symbol}: {action}")
                return None
            
            # Create and place order
            order = Order(
                id="",  # Will be set by broker
                symbol=symbol,
                side=side,
                type=OrderType.MARKET,  # Use market orders for simplicity
                quantity=quantity
            )
            
            placed_order = await self.active_broker.place_order(order)
            
            # Update daily stats
            self.daily_stats['trades_count'] += 1
            
            logger.info(f"AI recommendation executed: {action} {quantity} shares of {symbol}")
            return placed_order
            
        except Exception as e:
            logger.error(f"Error executing AI recommendation for {symbol}: {e}")
            return None
    
    async def _check_risk_limits(self, 
                               symbol: str, 
                               recommendation: Dict[str, Any], 
                               position_size: float) -> Dict[str, Any]:
        """Check if trade meets risk management criteria"""
        try:
            # Check daily trade limit
            if self.daily_stats['trades_count'] >= self.risk_limits['max_daily_trades']:
                return {'allowed': False, 'reason': 'Daily trade limit exceeded'}
            
            # Check position size limit
            if position_size > self.risk_limits['max_position_size']:
                return {'allowed': False, 'reason': 'Position size exceeds limit'}
            
            # Check account balance
            account = await self.active_broker.get_account()
            if account.cash < self.risk_limits['min_account_balance']:
                return {'allowed': False, 'reason': 'Insufficient account balance'}
            
            # Check daily loss limit
            if abs(self.daily_stats['realized_pnl']) > account.portfolio_value * self.risk_limits['max_daily_loss']:
                return {'allowed': False, 'reason': 'Daily loss limit exceeded'}
            
            # Check recommendation confidence
            confidence = recommendation.get('confidence', 0)
            if confidence < 0.6:
                return {'allowed': False, 'reason': 'Recommendation confidence too low'}
            
            return {'allowed': True, 'reason': 'All risk checks passed'}
            
        except Exception as e:
            logger.error(f"Error checking risk limits: {e}")
            return {'allowed': False, 'reason': f'Risk check error: {str(e)}'}
    
    async def sync_portfolio(self) -> Dict[str, Any]:
        """Synchronize portfolio data with broker"""
        try:
            if not self.active_broker:
                raise Exception("No active broker connection")
            
            account = await self.active_broker.get_account()
            positions = await self.active_broker.get_positions()
            
            portfolio_data = {
                'account_id': account.id,
                'total_value': account.portfolio_value,
                'cash': account.cash,
                'buying_power': account.buying_power,
                'positions': [
                    {
                        'symbol': pos.symbol,
                        'quantity': pos.quantity,
                        'average_price': pos.average_price,
                        'market_value': pos.market_value,
                        'unrealized_pnl': pos.unrealized_pnl,
                        'side': pos.side
                    }
                    for pos in positions
                ],
                'last_sync': datetime.now().isoformat(),
                'broker': self.active_broker_name
            }
            
            logger.info(f"Portfolio synchronized: {len(positions)} positions, ${account.portfolio_value:.2f} total value")
            return portfolio_data
            
        except Exception as e:
            logger.error(f"Error synchronizing portfolio: {e}")
            return {}
    
    async def get_trading_performance(self) -> Dict[str, Any]:
        """Get trading performance metrics"""
        try:
            if not self.active_broker:
                return {}
            
            account = await self.active_broker.get_account()
            positions = await self.active_broker.get_positions()
            
            total_unrealized_pnl = sum(pos.unrealized_pnl for pos in positions)
            
            performance = {
                'portfolio_value': account.portfolio_value,
                'cash_balance': account.cash,
                'total_unrealized_pnl': total_unrealized_pnl,
                'daily_trades': self.daily_stats['trades_count'],
                'daily_pnl': self.daily_stats['realized_pnl'],
                'positions_count': len(positions),
                'day_trade_count': account.day_trade_count,
                'broker': self.active_broker_name
            }
            
            return performance
            
        except Exception as e:
            logger.error(f"Error getting trading performance: {e}")
            return {}
    
    async def set_risk_limits(self, new_limits: Dict[str, float]):
        """Update risk management limits"""
        try:
            for key, value in new_limits.items():
                if key in self.risk_limits:
                    self.risk_limits[key] = value
                    logger.info(f"Updated risk limit {key}: {value}")
            
            return {'success': True, 'updated_limits': self.risk_limits}
            
        except Exception as e:
            logger.error(f"Error setting risk limits: {e}")
            return {'success': False, 'error': str(e)}

# Global instance
broker_agent = BrokerIntegrationAgent()