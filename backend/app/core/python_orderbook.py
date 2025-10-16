"""
Python-only Order Book Implementation

A high-performance order book implementation in pure Python for when
Cython compilation is not available. While not as fast as the Cython version,
it still provides good performance for testing and development.
"""

import time
import heapq
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
from collections import deque
import logging

class OrderSide(Enum):
    BUY = 0
    SELL = 1

class OrderType(Enum):
    MARKET = 0
    LIMIT = 1
    STOP = 2
    STOP_LIMIT = 3
    IOC = 4  # Immediate or Cancel
    FOK = 5  # Fill or Kill

class OrderStatus(Enum):
    PENDING = 0
    PARTIAL = 1
    FILLED = 2
    CANCELLED = 3
    REJECTED = 4

@dataclass
class Order:
    """Order data structure"""
    order_id: str
    symbol: str
    side: OrderSide
    order_type: OrderType
    quantity: int
    price: float
    timestamp_ns: int
    client_id: str
    remaining_quantity: int = 0
    status: OrderStatus = OrderStatus.PENDING
    
    def __post_init__(self):
        if self.remaining_quantity == 0:
            self.remaining_quantity = self.quantity

@dataclass
class Trade:
    """Trade execution result"""
    trade_id: str
    buy_order_id: str
    sell_order_id: str
    symbol: str
    quantity: int
    price: float
    timestamp_ns: int
    buyer_client_id: str
    seller_client_id: str

@dataclass
class MatchResult:
    """Result of order matching operation"""
    trades: List[Trade]
    remaining_order: Optional[Order]
    total_matched_quantity: int
    avg_execution_price: float

class PriceLevel:
    """Price level containing orders at the same price"""
    
    def __init__(self, price: float):
        self.price = price
        self.orders = deque()  # FIFO queue of orders
        self.total_quantity = 0
        
    def add_order(self, order: Order):
        """Add order to this price level"""
        self.orders.append(order)
        self.total_quantity += order.remaining_quantity
        
    def remove_order(self, order: Order):
        """Remove order from this price level"""
        try:
            self.orders.remove(order)
            self.total_quantity -= order.remaining_quantity
        except ValueError:
            pass  # Order not in queue
            
    def get_first_order(self) -> Optional[Order]:
        """Get the first order in the queue (FIFO)"""
        return self.orders[0] if self.orders else None
        
    def is_empty(self) -> bool:
        """Check if this price level has no orders"""
        return len(self.orders) == 0
        
    def __len__(self):
        return len(self.orders)

class PythonOrderBook:
    """Python-only order book implementation"""
    
    def __init__(self, symbol: str):
        self.symbol = symbol
        
        # Price levels - using sorted dictionaries for O(log n) operations
        self.buy_levels: Dict[float, PriceLevel] = {}  # Price -> PriceLevel
        self.sell_levels: Dict[float, PriceLevel] = {}  # Price -> PriceLevel
        
        # Order tracking
        self.orders: Dict[str, Order] = {}  # OrderID -> Order
        
        # Performance statistics
        self.stats = {
            'total_orders': 0,
            'total_trades': 0,
            'total_volume': 0,
            'total_value': 0.0,
            'avg_latency_ns': 0,
            'max_latency_ns': 0,
            'min_latency_ns': float('inf')
        }
        
        # Trade counter for unique IDs
        self.trade_counter = 0
        
        logging.info(f"PythonOrderBook initialized for {symbol}")
        
    def add_order(self, order: Order) -> MatchResult:
        """Add order to book and attempt matching"""
        start_time = time.time_ns()
        
        # Store order
        self.orders[order.order_id] = order
        
        # Attempt matching first
        trades = []
        if order.order_type in [OrderType.MARKET, OrderType.LIMIT]:
            trades = self._match_order(order)
            
        # Add remaining quantity to book if any
        remaining_order = None
        if order.remaining_quantity > 0:
            remaining_order = self._add_to_book(order)
            
        # Update statistics
        end_time = time.time_ns()
        latency = end_time - start_time
        
        self.stats['total_orders'] += 1
        self.stats['avg_latency_ns'] = (
            (self.stats['avg_latency_ns'] * (self.stats['total_orders'] - 1) + latency) 
            // self.stats['total_orders']
        )
        self.stats['max_latency_ns'] = max(self.stats['max_latency_ns'], latency)
        self.stats['min_latency_ns'] = min(self.stats['min_latency_ns'], latency)
        
        return MatchResult(
            trades=trades,
            remaining_order=remaining_order,
            total_matched_quantity=order.quantity - order.remaining_quantity,
            avg_execution_price=self._calculate_avg_price(trades)
        )
        
    def _match_order(self, order: Order) -> List[Trade]:
        """Match order against existing orders in book"""
        trades = []
        
        # Determine which side to match against
        if order.side == OrderSide.BUY:
            # Match against sell orders (ascending price order)
            price_levels = sorted(self.sell_levels.items())
        else:
            # Match against buy orders (descending price order)
            price_levels = sorted(self.buy_levels.items(), reverse=True)
            
        for price, level in price_levels:
            if order.remaining_quantity <= 0:
                break
                
            # Check if price is acceptable for limit orders
            if order.order_type == OrderType.LIMIT:
                if order.side == OrderSide.BUY and price > order.price:
                    break  # Price too high for buy order
                if order.side == OrderSide.SELL and price < order.price:
                    break  # Price too low for sell order
                    
            # Match against orders at this level
            while level.orders and order.remaining_quantity > 0:
                matching_order = level.orders[0]  # FIFO
                
                # Calculate match quantity
                match_quantity = min(order.remaining_quantity, matching_order.remaining_quantity)
                
                if match_quantity > 0:
                    # Create trade
                    trade = self._create_trade(order, matching_order, match_quantity, price)
                    trades.append(trade)
                    
                    # Update quantities
                    order.remaining_quantity -= match_quantity
                    matching_order.remaining_quantity -= match_quantity
                    level.total_quantity -= match_quantity
                    
                    # Update statistics
                    self.stats['total_trades'] += 1
                    self.stats['total_volume'] += match_quantity
                    self.stats['total_value'] += match_quantity * price
                    
                    # Remove filled orders
                    if matching_order.remaining_quantity == 0:
                        level.orders.popleft()
                        matching_order.status = OrderStatus.FILLED
                        
            # Remove empty price level
            if level.is_empty():
                if order.side == OrderSide.BUY:
                    del self.sell_levels[price]
                else:
                    del self.buy_levels[price]
                    
        return trades
        
    def _add_to_book(self, order: Order) -> Order:
        """Add order to order book"""
        price = order.price
        
        # Get or create price level
        if order.side == OrderSide.BUY:
            if price not in self.buy_levels:
                self.buy_levels[price] = PriceLevel(price)
            level = self.buy_levels[price]
        else:
            if price not in self.sell_levels:
                self.sell_levels[price] = PriceLevel(price)
            level = self.sell_levels[price]
            
        # Add order to level
        level.add_order(order)
        order.status = OrderStatus.PENDING
        
        return order
        
    def _create_trade(self, order1: Order, order2: Order, quantity: int, price: float) -> Trade:
        """Create trade from matched orders"""
        self.trade_counter += 1
        
        # Determine buy and sell orders
        if order1.side == OrderSide.BUY:
            buy_order, sell_order = order1, order2
        else:
            buy_order, sell_order = order2, order1
            
        return Trade(
            trade_id=f"trade_{self.trade_counter}",
            buy_order_id=buy_order.order_id,
            sell_order_id=sell_order.order_id,
            symbol=self.symbol,
            quantity=quantity,
            price=price,
            timestamp_ns=time.time_ns(),
            buyer_client_id=buy_order.client_id,
            seller_client_id=sell_order.client_id
        )
        
    def _calculate_avg_price(self, trades: List[Trade]) -> float:
        """Calculate average execution price from trades"""
        if not trades:
            return 0.0
            
        total_value = sum(trade.quantity * trade.price for trade in trades)
        total_quantity = sum(trade.quantity for trade in trades)
        
        return total_value / total_quantity if total_quantity > 0 else 0.0
        
    def get_order_book_snapshot(self) -> Dict[str, Any]:
        """Get current order book snapshot"""
        # Collect buy levels (highest price first)
        buy_levels = []
        for price in sorted(self.buy_levels.keys(), reverse=True):
            level = self.buy_levels[price]
            if not level.is_empty():
                buy_levels.append({
                    'price': price,
                    'quantity': level.total_quantity,
                    'orders': len(level.orders)
                })
                
        # Collect sell levels (lowest price first)
        sell_levels = []
        for price in sorted(self.sell_levels.keys()):
            level = self.sell_levels[price]
            if not level.is_empty():
                sell_levels.append({
                    'price': price,
                    'quantity': level.total_quantity,
                    'orders': len(level.orders)
                })
                
        # Calculate best bid/ask and spread
        best_bid = max(self.buy_levels.keys()) if self.buy_levels else 0.0
        best_ask = min(self.sell_levels.keys()) if self.sell_levels else 0.0
        spread = best_ask - best_bid if best_bid > 0 and best_ask > 0 else 0.0
        
        return {
            'symbol': self.symbol,
            'timestamp_ns': time.time_ns(),
            'bids': buy_levels,
            'asks': sell_levels,
            'best_bid': best_bid,
            'best_ask': best_ask,
            'spread': spread
        }
        
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        return {
            'total_orders': self.stats['total_orders'],
            'total_trades': self.stats['total_trades'],
            'total_volume': self.stats['total_volume'],
            'total_value': self.stats['total_value'],
            'avg_latency_ns': self.stats['avg_latency_ns'],
            'avg_latency_us': self.stats['avg_latency_ns'] / 1000.0,
            'max_latency_ns': self.stats['max_latency_ns'],
            'max_latency_us': self.stats['max_latency_ns'] / 1000.0,
            'min_latency_ns': self.stats['min_latency_ns'],
            'min_latency_us': self.stats['min_latency_ns'] / 1000.0,
            'buy_levels': len(self.buy_levels),
            'sell_levels': len(self.sell_levels),
            'total_orders_in_book': len(self.orders)
        }
        
    def cancel_order(self, order_id: str) -> bool:
        """Cancel order by ID"""
        if order_id not in self.orders:
            return False
            
        order = self.orders[order_id]
        
        # Remove from price level
        price = order.price
        if order.side == OrderSide.BUY and price in self.buy_levels:
            level = self.buy_levels[price]
            level.remove_order(order)
            if level.is_empty():
                del self.buy_levels[price]
        elif order.side == OrderSide.SELL and price in self.sell_levels:
            level = self.sell_levels[price]
            level.remove_order(order)
            if level.is_empty():
                del self.sell_levels[price]
                
        # Update order status
        order.status = OrderStatus.CANCELLED
        del self.orders[order_id]
        
        return True

# Convenience functions
def create_python_order_book(symbol: str) -> PythonOrderBook:
    """Create a new PythonOrderBook instance"""
    return PythonOrderBook(symbol)

def benchmark_python_order_book(num_orders: int = 1000) -> Dict[str, Any]:
    """Benchmark Python order book performance"""
    import random
    
    book = create_python_order_book("AAPL")
    
    start_time = time.time_ns()
    
    # Add random orders
    for i in range(num_orders):
        order = Order(
            order_id=f"order_{i}",
            symbol="AAPL",
            side=OrderSide.BUY if random.random() > 0.5 else OrderSide.SELL,
            order_type=OrderType.LIMIT,
            quantity=100,
            price=150.0 + random.uniform(-5.0, 5.0),
            timestamp_ns=time.time_ns(),
            client_id="test_client"
        )
        
        result = book.add_order(order)
        
    end_time = time.time_ns()
    
    stats = book.get_performance_stats()
    
    return {
        'total_time_ms': (end_time - start_time) / 1_000_000,
        'orders_per_second': num_orders / ((end_time - start_time) / 1_000_000_000),
        'avg_latency_us': stats['avg_latency_us'],
        'max_latency_us': stats['max_latency_us'],
        'total_trades': stats['total_trades'],
        'total_volume': stats['total_volume']
    }

# Example usage
if __name__ == "__main__":
    # Test the Python order book
    results = benchmark_python_order_book(1000)
    
    print("Python Order Book Performance Results:")
    for metric, value in results.items():
        print(f"  {metric}: {value}")