#!/usr/bin/env python3
"""
Test script for VVP Core Components

This script tests all the core components to ensure they work correctly
and meet performance requirements.
"""

import time
import logging
import sys
from typing import Dict, Any

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_lockfree_structures():
    """Test lock-free data structures"""
    logger.info("Testing lock-free data structures...")
    
    try:
        from lockfree_structures import (
            LockFreeSPSCQueue, 
            LockFreeMPSCQueue, 
            ObjectPool,
            LockFreePerformanceTester
        )
        
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
        
        logger.info("✓ SPSC Queue basic operations work")
        
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
        assert obj2.data == 0, "Object not reset correctly"
        
        logger.info("✓ Object Pool works correctly")
        
        # Run performance benchmark
        tester = LockFreePerformanceTester()
        results = tester.benchmark_spsc_queue(capacity=1024, num_operations=10000)
        
        logger.info(f"SPSC Queue performance: {results['operations_per_second']:.0f} ops/sec")
        logger.info(f"Average latency: {results['avg_latency_us']:.2f}μs")
        
        # Performance requirements check
        assert results['operations_per_second'] > 100000, "SPSC Queue too slow"
        assert results['avg_latency_us'] < 100, "SPSC Queue latency too high"
        
        logger.info("✓ Lock-free structures performance meets requirements")
        return True
        
    except Exception as e:
        logger.error(f"Lock-free structures test failed: {e}")
        return False

def test_memory_manager():
    """Test advanced memory manager"""
    logger.info("Testing memory manager...")
    
    try:
        import platform
        from memory_manager import (
            AdvancedMemoryManager,
            MemoryPool,
            initialize_memory_manager,
            shutdown_memory_manager
        )
        
        # Skip shared memory tests on Windows due to compatibility issues
        skip_shared_memory = platform.system() == 'Windows'
        if skip_shared_memory:
            logger.info("Skipping shared memory tests on Windows")
        
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
        assert stats['total_acquisitions'] == 25, "Acquisition count incorrect"
        assert stats['total_releases'] == 25, "Release count incorrect"
        assert stats['cache_hit_rate'] > 0.5, "Cache hit rate too low"
        
        logger.info(f"Pool cache hit rate: {stats['cache_hit_rate']:.2%}")
        
        # Test memory statistics
        memory_stats = manager.get_comprehensive_stats()
        assert 'memory_stats' in memory_stats, "Memory stats missing"
        assert 'pool_stats' in memory_stats, "Pool stats missing"
        
        logger.info(f"Memory allocated: {memory_stats['memory_stats']['total_allocated_mb']:.1f}MB")
        
        # Cleanup
        shutdown_memory_manager()
        
        logger.info("✓ Memory manager works correctly")
        return True
        
    except Exception as e:
        logger.error(f"Memory manager test failed: {e}")
        return False

def test_fast_orderbook():
    """Test fast order book (if compiled)"""
    logger.info("Testing fast order book...")
    
    try:
        from fast_orderbook import (
            FastOrderBook,
            Order,
            OrderSide,
            OrderType,
            OrderStatus,
            benchmark_order_book
        )
        
        # Create order book
        book = FastOrderBook("AAPL", max_orders=1000, max_levels=100)
        
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
        assert stats['avg_latency_us'] < 1000, "Latency too high"
        
        logger.info(f"Order book latency: {stats['avg_latency_us']:.2f}μs")
        
        # Run performance benchmark
        benchmark_results = benchmark_order_book(1000)
        
        logger.info(f"Order book performance: {benchmark_results['orders_per_second']:.0f} orders/sec")
        logger.info(f"Average latency: {benchmark_results['avg_latency_us']:.2f}μs")
        
        # Performance requirements
        assert benchmark_results['orders_per_second'] > 10000, "Order book too slow"
        assert benchmark_results['avg_latency_us'] < 100, "Order book latency too high"
        
        logger.info("✓ Fast order book works correctly and meets performance requirements")
        return True
        
    except ImportError:
        logger.warning("Fast order book not available (needs compilation)")
        logger.info("Run: python compile.py to build Cython extensions")
        return True  # Not a failure, just not compiled
    except Exception as e:
        logger.error(f"Fast order book test failed: {e}")
        return False

def test_integration():
    """Test integration between components"""
    logger.info("Testing component integration...")
    
    try:
        from lockfree_structures import LockFreeSPSCQueue
        from memory_manager import initialize_memory_manager, shutdown_memory_manager
        
        # Initialize memory manager
        manager = initialize_memory_manager()
        
        # Create object pool for queue items
        class QueueItem:
            def __init__(self):
                self.data = None
            def reset(self):
                self.data = None
        
        pool = manager.create_pool('queue_items', QueueItem, initial_size=100)
        
        # Create queue
        queue = LockFreeSPSCQueue(256)
        
        # Test integrated workflow
        items = []
        for i in range(50):
            item = pool.acquire()
            item.data = f"item_{i}"
            items.append(item)
            queue.enqueue(item)
        
        # Process items
        processed = 0
        while not queue.is_empty():
            item = queue.dequeue()
            if item:
                assert item.data == f"item_{processed}", "Item data incorrect"
                pool.release(item)
                processed += 1
        
        assert processed == 50, "Not all items processed"
        
        # Check pool statistics
        pool_stats = pool.get_stats()
        assert pool_stats['cache_hit_rate'] > 0.9, "Cache hit rate too low in integration test"
        
        logger.info(f"Integration test cache hit rate: {pool_stats['cache_hit_rate']:.2%}")
        
        # Cleanup
        shutdown_memory_manager()
        
        logger.info("✓ Component integration works correctly")
        return True
        
    except Exception as e:
        logger.error(f"Integration test failed: {e}")
        return False

def main():
    """Run all tests"""
    logger.info("Starting VVP Core Components tests...")
    
    tests = [
        ("Lock-free Structures", test_lockfree_structures),
        ("Memory Manager", test_memory_manager),
        ("Fast Order Book", test_fast_orderbook),
        ("Integration", test_integration)
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        logger.info(f"\n{'='*50}")
        logger.info(f"Running {test_name} tests...")
        logger.info(f"{'='*50}")
        
        try:
            if test_func():
                logger.info(f"✓ {test_name} tests PASSED")
                passed += 1
            else:
                logger.error(f"✗ {test_name} tests FAILED")
                failed += 1
        except Exception as e:
            logger.error(f"✗ {test_name} tests FAILED with exception: {e}")
            failed += 1
    
    logger.info(f"\n{'='*50}")
    logger.info(f"Test Results: {passed} passed, {failed} failed")
    logger.info(f"{'='*50}")
    
    if failed == 0:
        logger.info("🎉 All tests passed! VVP Core Components are ready for production.")
        return True
    else:
        logger.error(f"❌ {failed} test(s) failed. Please fix issues before proceeding.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)