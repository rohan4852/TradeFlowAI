#!/usr/bin/env python3
"""
Simple test script for VVP Core Components (Python-only)

This script tests the core components without requiring Cython compilation.
"""

import sys
import time
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_memory_manager():
    """Test memory manager (Python-only)"""
    logger.info("Testing memory manager...")
    
    try:
        from memory_manager import (
            AdvancedMemoryManager,
            MemoryPool,
            initialize_memory_manager,
            shutdown_memory_manager
        )
        
        # Initialize memory manager
        manager = initialize_memory_manager({
            'max_gc_pause_ms': 1.0,
            'monitoring_interval': 0.1
        })
        
        # Test object pool creation
        class TestObject:
            def __init__(self):
                self.value = 42
            def reset(self):
                self.value = 0
        
        pool = manager.create_pool('test_pool', TestObject, initial_size=50)
        
        # Test pool operations
        objects = []
        for _ in range(25):
            obj = pool.acquire()
            objects.append(obj)
        
        for obj in objects:
            pool.release(obj)
        
        # Check pool statistics
        stats = pool.get_stats()
        logger.info(f"Pool cache hit rate: {stats['cache_hit_rate']:.2%}")
        
        # Test memory statistics
        memory_stats = manager.get_comprehensive_stats()
        logger.info(f"Memory allocated: {memory_stats['memory_stats']['total_allocated_mb']:.1f}MB")
        
        # Cleanup
        shutdown_memory_manager()
        
        logger.info("✅ Memory manager works correctly")
        return True
        
    except Exception as e:
        logger.error(f"❌ Memory manager test failed: {e}")
        return False

def test_basic_imports():
    """Test basic imports"""
    logger.info("Testing basic imports...")
    
    try:
        # Test memory manager import
        from memory_manager import AdvancedMemoryManager
        logger.info("✅ Memory manager import successful")
        
        # Test lock-free structures import
        from lockfree_structures import LockFreeSPSCQueue, ObjectPool
        logger.info("✅ Lock-free structures import successful")
        
        # Test if we can create instances
        manager = AdvancedMemoryManager()
        logger.info("✅ Memory manager creation successful")
        
        queue = LockFreeSPSCQueue(1024)
        logger.info("✅ Lock-free queue creation successful")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Import test failed: {e}")
        return False

def test_lockfree_structures():
    """Test lock-free data structures"""
    logger.info("Testing lock-free data structures...")
    
    try:
        from lockfree_structures import LockFreeSPSCQueue, ObjectPool
        
        # Test SPSC Queue
        queue = LockFreeSPSCQueue(1024)
        
        # Test basic operations
        assert queue.enqueue("test1"), "Failed to enqueue item"
        assert queue.enqueue("test2"), "Failed to enqueue second item"
        
        item1 = queue.dequeue()
        assert item1 == "test1", f"Expected 'test1', got {item1}"
        
        item2 = queue.dequeue()
        assert item2 == "test2", f"Expected 'test2', got {item2}"
        
        assert queue.dequeue() is None, "Queue should be empty"
        
        logger.info("✅ SPSC Queue basic operations work")
        
        # Test Object Pool
        class TestObject:
            def __init__(self):
                self.data = 42
            def reset(self):
                self.data = 0
        
        pool = ObjectPool(TestObject, initial_size=10)
        
        obj1 = pool.acquire()
        assert obj1.data == 42, "Object not initialized correctly"
        
        obj1.data = 100
        pool.release(obj1)
        
        obj2 = pool.acquire()
        # obj2 might be the same instance as obj1 (reset) or a different pre-allocated object (data=42)
        # Let's test the pool behavior more carefully
        if obj2 is obj1:
            assert obj2.data == 0, "Object not reset correctly after release"
        else:
            # Different object from pre-allocated pool
            assert obj2.data == 42, "Pre-allocated object should have initial value"
        
        logger.info("✅ Object Pool works correctly")
        
        # Get performance metrics
        metrics = pool.get_metrics()
        logger.info(f"Pool cache hit rate: {metrics['cache_hit_rate']:.2%}")
        
        logger.info("✅ Lock-free structures work correctly")
        return True
        
    except Exception as e:
        logger.error(f"❌ Lock-free structures test failed: {e}")
        return False

def test_python_orderbook():
    """Test Python order book implementation"""
    logger.info("Testing Python order book...")
    
    try:
        from python_orderbook import (
            PythonOrderBook, Order, OrderSide, OrderType, OrderStatus,
            benchmark_python_order_book
        )
        
        # Create order book
        book = PythonOrderBook("AAPL")
        
        # Create test orders
        buy_order = Order(
            order_id="buy_1",
            symbol="AAPL",
            side=OrderSide.BUY,
            order_type=OrderType.LIMIT,
            quantity=100,
            price=150.0,
            timestamp_ns=time.time_ns(),
            client_id="test_client"
        )
        
        sell_order = Order(
            order_id="sell_1",
            symbol="AAPL",
            side=OrderSide.SELL,
            order_type=OrderType.LIMIT,
            quantity=50,
            price=150.0,
            timestamp_ns=time.time_ns(),
            client_id="test_client"
        )
        
        # Add orders and test matching
        result1 = book.add_order(buy_order)
        assert len(result1.trades) == 0, "No trades should occur with single order"
        
        result2 = book.add_order(sell_order)
        assert len(result2.trades) == 1, "One trade should occur"
        assert result2.trades[0].quantity == 50, "Trade quantity incorrect"
        assert result2.trades[0].price == 150.0, "Trade price incorrect"
        
        # Check order book snapshot
        snapshot = book.get_order_book_snapshot()
        assert snapshot['symbol'] == "AAPL", "Symbol incorrect"
        assert len(snapshot['bids']) == 1, "Should have one bid level"
        assert snapshot['bids'][0]['quantity'] == 50, "Remaining quantity incorrect"
        
        # Check performance stats
        stats = book.get_performance_stats()
        assert stats['total_orders'] == 2, "Order count incorrect"
        assert stats['total_trades'] == 1, "Trade count incorrect"
        
        logger.info(f"Order book latency: {stats['avg_latency_us']:.2f}μs")
        
        # Run performance benchmark
        benchmark_results = benchmark_python_order_book(100)
        
        logger.info(f"Order book performance: {benchmark_results['orders_per_second']:.0f} orders/sec")
        logger.info(f"Average latency: {benchmark_results['avg_latency_us']:.2f}μs")
        
        logger.info("✅ Python order book works correctly")
        return True
        
    except Exception as e:
        logger.error(f"❌ Python order book test failed: {e}")
        return False

def main():
    """Main test function"""
    logger.info("Starting VVP Core Components simple tests...")
    
    tests = [
        ("Basic Imports", test_basic_imports),
        ("Lock-free Structures", test_lockfree_structures),
        ("Python Order Book", test_python_orderbook),
        ("Memory Manager", test_memory_manager)
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        logger.info(f"\n{'='*40}")
        logger.info(f"Running {test_name} test...")
        logger.info(f"{'='*40}")
        
        try:
            if test_func():
                logger.info(f"✅ {test_name} test PASSED")
                passed += 1
            else:
                logger.error(f"❌ {test_name} test FAILED")
                failed += 1
        except Exception as e:
            logger.error(f"❌ {test_name} test FAILED with exception: {e}")
            failed += 1
    
    logger.info(f"\n{'='*40}")
    logger.info(f"Test Results: {passed} passed, {failed} failed")
    logger.info(f"{'='*40}")
    
    if failed == 0:
        logger.info("🎉 All tests passed! Core components are working.")
        logger.info("Note: Cython compilation failed, but Python components work fine.")
        return True
    else:
        logger.error(f"❌ {failed} test(s) failed.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)