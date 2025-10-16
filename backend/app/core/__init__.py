"""
Core VVP (Very Very Fast) Components

This package contains the ultra-high performance core components for the
AI Trading Platform's low-latency order matching system.

Components:
- lockfree_structures: Lock-free data structures for concurrent access
- memory_manager: Advanced memory management and optimization
- fast_orderbook: Cython-optimized order book implementation
"""

# Import key components for easy access
try:
    from .lockfree_structures import (
        LockFreeSPSCQueue,
        LockFreeMPSCQueue,
        ObjectPool,
        MemoryAlignedArray,
        LockFreeHashMap,
        LockFreePerformanceTester
    )
except ImportError as e:
    print(f"Warning: Could not import lockfree_structures: {e}")

try:
    from .memory_manager import (
        AdvancedMemoryManager,
        MemoryPool,
        SharedMemoryRegion,
        MemoryMappedFile,
        GarbageCollectionOptimizer,
        get_memory_manager,
        initialize_memory_manager,
        shutdown_memory_manager
    )
except ImportError as e:
    print(f"Warning: Could not import memory_manager: {e}")

# Fast order book requires compilation
try:
    from .fast_orderbook import (
        FastOrderBook,
        Order,
        Trade,
        MatchResult,
        OrderSide,
        OrderType,
        OrderStatus,
        create_fast_order_book,
        benchmark_order_book
    )
    FAST_ORDERBOOK_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Could not import fast_orderbook (needs compilation): {e}")
    print("To compile: cd backend/app/core && python setup.py build_ext --inplace")
    FAST_ORDERBOOK_AVAILABLE = False

# Python-only order book (always available)
try:
    from .python_orderbook import (
        PythonOrderBook,
        Order as PyOrder,
        Trade as PyTrade,
        MatchResult as PyMatchResult,
        OrderSide as PyOrderSide,
        OrderType as PyOrderType,
        OrderStatus as PyOrderStatus,
        create_python_order_book,
        benchmark_python_order_book
    )
    
    # If Cython version not available, use Python version as default
    if not FAST_ORDERBOOK_AVAILABLE:
        Order = PyOrder
        Trade = PyTrade
        MatchResult = PyMatchResult
        OrderSide = PyOrderSide
        OrderType = PyOrderType
        OrderStatus = PyOrderStatus
        
except ImportError as e:
    print(f"Warning: Could not import python_orderbook: {e}")

__all__ = [
    # Lock-free structures
    'LockFreeSPSCQueue',
    'LockFreeMPSCQueue', 
    'ObjectPool',
    'MemoryAlignedArray',
    'LockFreeHashMap',
    'LockFreePerformanceTester',
    
    # Memory management
    'AdvancedMemoryManager',
    'MemoryPool',
    'SharedMemoryRegion',
    'MemoryMappedFile',
    'GarbageCollectionOptimizer',
    'get_memory_manager',
    'initialize_memory_manager',
    'shutdown_memory_manager',
    
    # Fast order book (if compiled)
    'FastOrderBook',
    'Order',
    'Trade',
    'MatchResult',
    'OrderSide',
    'OrderType',
    'OrderStatus',
    'create_fast_order_book',
    'benchmark_order_book',
    
    # Python order book (always available)
    'PythonOrderBook',
    'create_python_order_book',
    'benchmark_python_order_book'
]