# VVP Core Components

Ultra-high performance core components for the AI Trading Platform's low-latency order matching system.

## Overview

The VVP (Very Very Fast) Core provides microsecond-level performance components that form the foundation of the trading system:

- **Lock-free data structures** for concurrent access without thread contention
- **Advanced memory management** to minimize garbage collection pauses
- **Cython-optimized order book** for ultra-fast order matching

## Performance Targets

- **Order processing**: < 10 microseconds end-to-end
- **Queue operations**: > 1M operations/second
- **Memory allocation**: < 100MB/second rate
- **GC pauses**: < 1 millisecond

## Components

### 1. Lock-Free Data Structures (`lockfree_structures.py`)

High-performance, thread-safe data structures using atomic operations:

```python
from backend.app.core import LockFreeSPSCQueue, ObjectPool

# Single Producer Single Consumer queue
queue = LockFreeSPSCQueue(capacity=65536)
queue.enqueue(item)
item = queue.dequeue()

# Object pool for memory efficiency
pool = ObjectPool(MyClass, initial_size=1000)
obj = pool.acquire()
pool.release(obj)
```

**Features:**
- SPSC/MPSC queue implementations
- Object pooling with automatic memory management
- Cache-aligned memory layouts
- Performance monitoring and metrics

### 2. Memory Manager (`memory_manager.py`)

Advanced memory optimization for low-latency applications:

```python
from backend.app.core import initialize_memory_manager

# Initialize global memory manager
manager = initialize_memory_manager({
    'max_gc_pause_ms': 1.0,
    'monitoring_interval': 1.0
})

# Create object pools
pool = manager.create_pool('orders', Order, initial_size=10000)

# Create shared memory regions
shared_region = manager.create_shared_region('market_data', size_mb=100)
```

**Features:**
- Garbage collection optimization
- Object pooling with generational management
- Memory-mapped files and shared memory
- Real-time memory pressure monitoring

### 3. Fast Order Book (`fast_orderbook.pyx`)

Cython-optimized order book for microsecond-level matching:

```python
from backend.app.core import FastOrderBook, Order, OrderSide, OrderType

# Create order book
book = FastOrderBook("AAPL", max_orders=100000)

# Create and add orders
order = Order(
    order_id="order_1",
    symbol="AAPL",
    side=OrderSide.BUY,
    order_type=OrderType.LIMIT,
    quantity=100,
    price=150.0,
    timestamp_ns=time.time_ns(),
    client_id="client_1"
)

result = book.add_order(order)
```

**Features:**
- Price-time priority matching
- O(log n) price operations
- FIFO order queues at each price level
- Support for all order types (Market, Limit, Stop, IOC, FOK)
- Real-time performance metrics

## Installation

### 1. Install Dependencies

```bash
cd backend/app/core
pip install -r requirements.txt
```

### 2. Compile Cython Extensions

```bash
# Automated compilation
python compile.py

# Or manual compilation
python setup.py build_ext --inplace
```

### 3. Run Tests

```bash
python test_core.py
```

## Usage Examples

### Basic Lock-Free Queue

```python
import threading
from backend.app.core import LockFreeSPSCQueue

queue = LockFreeSPSCQueue(1024)

def producer():
    for i in range(1000):
        while not queue.enqueue(f"item_{i}"):
            pass  # Retry if queue full

def consumer():
    items = []
    while len(items) < 1000:
        item = queue.dequeue()
        if item:
            items.append(item)
    return items

# Run producer and consumer in separate threads
producer_thread = threading.Thread(target=producer)
consumer_thread = threading.Thread(target=consumer)

producer_thread.start()
consumer_thread.start()

producer_thread.join()
consumer_thread.join()
```

### Memory-Optimized Object Pool

```python
from backend.app.core import initialize_memory_manager

class TradingOrder:
    def __init__(self):
        self.symbol = ""
        self.quantity = 0
        self.price = 0.0
    
    def reset(self):
        self.symbol = ""
        self.quantity = 0
        self.price = 0.0

# Initialize memory manager
manager = initialize_memory_manager()

# Create pool
pool = manager.create_pool('orders', TradingOrder, initial_size=10000)

# Use pool
order = pool.acquire()
order.symbol = "AAPL"
order.quantity = 100
order.price = 150.0

# Process order...

# Return to pool
pool.release(order)

# Get statistics
stats = pool.get_stats()
print(f"Cache hit rate: {stats['cache_hit_rate']:.2%}")
```

### High-Performance Order Matching

```python
import time
from backend.app.core import FastOrderBook, Order, OrderSide, OrderType

# Create order book
book = FastOrderBook("AAPL")

# Add buy order
buy_order = Order(
    order_id="buy_1",
    symbol="AAPL",
    side=OrderSide.BUY,
    order_type=OrderType.LIMIT,
    quantity=100,
    price=150.0,
    timestamp_ns=time.time_ns(),
    client_id="trader_1"
)

result1 = book.add_order(buy_order)
print(f"Added buy order, trades: {len(result1.trades)}")

# Add matching sell order
sell_order = Order(
    order_id="sell_1",
    symbol="AAPL",
    side=OrderSide.SELL,
    order_type=OrderType.LIMIT,
    quantity=50,
    price=150.0,
    timestamp_ns=time.time_ns(),
    client_id="trader_2"
)

result2 = book.add_order(sell_order)
print(f"Added sell order, trades: {len(result2.trades)}")
print(f"Trade: {result2.trades[0].quantity} @ ${result2.trades[0].price}")

# Get performance stats
stats = book.get_performance_stats()
print(f"Average latency: {stats['avg_latency_us']:.2f}μs")
```

## Performance Benchmarks

Run benchmarks to verify performance:

```python
from backend.app.core import LockFreePerformanceTester, benchmark_order_book

# Test lock-free structures
tester = LockFreePerformanceTester()
results = tester.run_all_benchmarks()

for structure, metrics in results.items():
    print(f"{structure}: {metrics['operations_per_second']:.0f} ops/sec")

# Test order book
orderbook_results = benchmark_order_book(10000)
print(f"Order book: {orderbook_results['orders_per_second']:.0f} orders/sec")
print(f"Latency: {orderbook_results['avg_latency_us']:.2f}μs")
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VVP Core Components                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Lock-Free     │  │     Memory      │  │    Fast     │ │
│  │  Structures     │  │    Manager      │  │ Order Book  │ │
│  │                 │  │                 │  │  (Cython)   │ │
│  │ • SPSC Queue    │  │ • Object Pools  │  │ • Matching  │ │
│  │ • MPSC Queue    │  │ • GC Optimizer  │  │ • Price     │ │
│  │ • Object Pool   │  │ • Shared Memory │  │   Levels    │ │
│  │ • Hash Map      │  │ • Memory Maps   │  │ • Statistics│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Performance Layer                        │
│  • Atomic Operations  • Cache Alignment  • Memory Barriers │
│  • NUMA Awareness    • GC Optimization   • Profiling       │
└─────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Compilation Issues

If Cython compilation fails:

1. **Check dependencies:**
   ```bash
   pip install numpy cython psutil
   ```

2. **Update build tools:**
   ```bash
   pip install --upgrade setuptools wheel
   ```

3. **Manual compilation:**
   ```bash
   cd backend/app/core
   python setup.py build_ext --inplace --force
   ```

### Performance Issues

If performance is below targets:

1. **Check CPU affinity:**
   ```python
   import os
   os.sched_setaffinity(0, {0, 1})  # Pin to specific cores
   ```

2. **Disable CPU frequency scaling:**
   ```bash
   echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
   ```

3. **Increase process priority:**
   ```bash
   sudo nice -n -20 python your_script.py
   ```

### Memory Issues

If experiencing high memory usage:

1. **Monitor GC statistics:**
   ```python
   from backend.app.core import get_memory_manager
   manager = get_memory_manager()
   stats = manager.get_comprehensive_stats()
   print(stats['gc_stats'])
   ```

2. **Adjust GC thresholds:**
   ```python
   manager.gc_optimizer.optimize_thresholds(target_pause_ms=0.5)
   ```

3. **Use object pools:**
   ```python
   pool = manager.create_pool('my_objects', MyClass, initial_size=10000)
   ```

## Contributing

When contributing to VVP Core:

1. **Maintain performance targets** - all changes must meet latency requirements
2. **Add comprehensive tests** - include performance benchmarks
3. **Document optimizations** - explain why specific techniques are used
4. **Profile changes** - measure impact on performance

## License

MIT License - see LICENSE file for details.