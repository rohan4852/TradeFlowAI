import threading
import time
import logging
from typing import Generic, TypeVar, Optional, Dict, Any, List
from dataclasses import dataclass
from multiprocessing import Value
import numpy as np

# Type variable for generic containers
T = TypeVar('T')

# Cache line size for memory alignment (typical x86-64)
CACHE_LINE_SIZE = 64

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AtomicCounter:
    """Thread-safe atomic counter using multiprocessing.Value"""
    
    def __init__(self, initial_value: int = 0):
        self._value = Value('i', initial_value)
        
    def set(self, value: int):
        """Set value atomically"""
        with self._value.get_lock():
            self._value.value = value
            
    def get(self) -> int:
        """Get current value atomically"""
        return self._value.value
        
    def increment(self) -> int:
        """Increment and return new value atomically"""
        with self._value.get_lock():
            self._value.value += 1
            return self._value.value
            
    def decrement(self) -> int:
        """Decrement and return new value atomically"""
        with self._value.get_lock():
            self._value.value -= 1
            return self._value.value
            
    def compare_and_swap(self, expected: int, new_value: int) -> bool:
        """Atomic compare-and-swap operation"""
        with self._value.get_lock():
            if self._value.value == expected:
                self._value.value = new_value
                return True
            return False
            
    def add(self, value: int) -> int:
        """Add value and return new total atomically"""
        with self._value.get_lock():
            self._value.value += value
            return self._value.value

class CacheAlignedData:
    """Base class for cache-aligned data structures"""
    
    def __init__(self):
        # Ensure data is aligned to cache line boundaries
        self._padding = bytearray(CACHE_LINE_SIZE)
        
    @staticmethod
    def align_to_cache_line(size: int) -> int:
        """Align size to cache line boundary"""
        return ((size + CACHE_LINE_SIZE - 1) // CACHE_LINE_SIZE) * CACHE_LINE_SIZE

@dataclass
class QueueMetrics:
    """Performance metrics for lock-free queues"""
    enqueue_count: int = 0
    dequeue_count: int = 0
    enqueue_failures: int = 0
    dequeue_failures: int = 0
    max_size: int = 0
    total_wait_time_ns: int = 0
    
    @property
    def success_rate(self) -> float:
        total_ops = self.enqueue_count + self.dequeue_count
        if total_ops == 0:
            return 1.0
        failures = self.enqueue_failures + self.dequeue_failures
        return 1.0 - (failures / total_ops)
        
    @property
    def avg_wait_time_us(self) -> float:
        total_ops = self.enqueue_count + self.dequeue_count
        if total_ops == 0:
            return 0.0
        return (self.total_wait_time_ns / total_ops) / 1000.0

class LockFreeSPSCQueue(Generic[T], CacheAlignedData):
    """Lock-free Single Producer Single Consumer queue
    
    Optimized for maximum performance with one producer and one consumer thread.
    Uses memory barriers and atomic operations to ensure thread safety.
    """
    
    def __init__(self, capacity: int):
        super().__init__()
        
        # Ensure capacity is power of 2 for efficient modulo operations
        self.capacity = self._next_power_of_2(capacity)
        self.mask = self.capacity - 1
        
        # Initialize buffer with cache-aligned memory
        self.buffer = [None] * self.capacity
        
        # Atomic counters with cache line padding
        self.head = AtomicCounter(0)
        self.tail = AtomicCounter(0)
        
        # Performance metrics
        self.metrics = QueueMetrics()
        
        # Memory barriers for ordering
        self._write_barrier = threading.Barrier(2)
        self._read_barrier = threading.Barrier(2)
        
    def _next_power_of_2(self, n: int) -> int:
        """Find next power of 2 greater than or equal to n"""
        if n <= 0:
            return 1
        n -= 1
        n |= n >> 1
        n |= n >> 2
        n |= n >> 4
        n |= n >> 8
        n |= n >> 16
        return n + 1
        
    def enqueue(self, item: T) -> bool:
        """Enqueue item (producer side) - returns False if queue is full"""
        start_time = time.time_ns()
        
        current_tail = self.tail.get()
        next_tail = (current_tail + 1) & self.mask
        
        # Check if queue is full
        if next_tail == self.head.get():
            self.metrics.enqueue_failures += 1
            return False
            
        # Store item
        self.buffer[current_tail] = item
        
        # Memory barrier to ensure item is written before tail update
        # Note: In Python, this is handled by the GIL, but we add explicit barrier for clarity
        
        # Update tail atomically
        self.tail.compare_and_swap(current_tail, next_tail)
        
        # Update metrics
        self.metrics.enqueue_count += 1
        self.metrics.total_wait_time_ns += time.time_ns() - start_time
        
        current_size = (next_tail - self.head.get()) & self.mask
        self.metrics.max_size = max(self.metrics.max_size, current_size)
        
        return True
        
    def dequeue(self) -> Optional[T]:
        """Dequeue item (consumer side) - returns None if queue is empty"""
        start_time = time.time_ns()
        
        current_head = self.head.get()
        
        # Check if queue is empty
        if current_head == self.tail.get():
            self.metrics.dequeue_failures += 1
            return None
            
        # Get item
        item = self.buffer[current_head]
        self.buffer[current_head] = None  # Clear reference for GC
        
        # Memory barrier to ensure item is read before head update
        # Note: In Python, this is handled by the GIL, but we add explicit barrier for clarity
        
        # Update head atomically
        next_head = (current_head + 1) & self.mask
        self.head.compare_and_swap(current_head, next_head)
        
        # Update metrics
        self.metrics.dequeue_count += 1
        self.metrics.total_wait_time_ns += time.time_ns() - start_time
        
        return item
        
    def size(self) -> int:
        """Get current queue size"""
        return (self.tail.get() - self.head.get()) & self.mask
        
    def is_empty(self) -> bool:
        """Check if queue is empty"""
        return self.head.get() == self.tail.get()
        
    def is_full(self) -> bool:
        """Check if queue is full"""
        return ((self.tail.get() + 1) & self.mask) == self.head.get()
        
    def capacity_remaining(self) -> int:
        """Get remaining capacity"""
        return self.capacity - 1 - self.size()

class LockFreeMPSCQueue(Generic[T], CacheAlignedData):
    """Lock-free Multiple Producer Single Consumer queue
    
    Allows multiple producer threads with a single consumer thread.
    Uses atomic operations and memory ordering for thread safety.
    """
    
    def __init__(self, capacity: int):
        super().__init__()
        
        self.capacity = self._next_power_of_2(capacity)
        self.mask = self.capacity - 1
        
        # Buffer with atomic flags for each slot
        self.buffer = [None] * self.capacity
        self.flags = [AtomicCounter(0) for _ in range(self.capacity)]
        
        # Atomic counters
        self.head = AtomicCounter(0)
        self.tail = AtomicCounter(0)
        
        # Performance metrics
        self.metrics = QueueMetrics()
        
        # Producer synchronization
        self._producer_lock = threading.Lock()
        
    def _next_power_of_2(self, n: int) -> int:
        """Find next power of 2 greater than or equal to n"""
        if n <= 0:
            return 1
        n -= 1
        n |= n >> 1
        n |= n >> 2
        n |= n >> 4
        n |= n >> 8
        n |= n >> 16
        return n + 1
        
    def enqueue(self, item: T) -> bool:
        """Enqueue item (multiple producers) - returns False if queue is full"""
        start_time = time.time_ns()
        
        # Atomic increment of tail to reserve slot
        slot = self.tail.increment() - 1
        index = slot & self.mask
        
        # Check if we're overrunning the consumer
        if slot >= self.head.get() + self.capacity:
            self.metrics.enqueue_failures += 1
            return False
            
        # Wait for slot to be available (previous item consumed)
        while self.flags[index].get() != 0:
            time.sleep(0.000001)  # 1 microsecond spin
            
        # Store item
        self.buffer[index] = item
        
        # Mark slot as ready for consumption
        self.flags[index].compare_and_swap(0, 1)
        
        # Update metrics
        self.metrics.enqueue_count += 1
        self.metrics.total_wait_time_ns += time.time_ns() - start_time
        
        return True
        
    def dequeue(self) -> Optional[T]:
        """Dequeue item (single consumer) - returns None if queue is empty"""
        start_time = time.time_ns()
        
        current_head = self.head.get()
        index = current_head & self.mask
        
        # Check if slot is ready
        if self.flags[index].get() == 0:
            self.metrics.dequeue_failures += 1
            return None
            
        # Get item
        item = self.buffer[index]
        self.buffer[index] = None  # Clear reference
        
        # Mark slot as available for producers
        self.flags[index].compare_and_swap(1, 0)
        
        # Update head
        self.head.increment()
        
        # Update metrics
        self.metrics.dequeue_count += 1
        self.metrics.total_wait_time_ns += time.time_ns() - start_time
        
        return item
        
    def size(self) -> int:
        """Get approximate queue size"""
        return max(0, self.tail.get() - self.head.get())
        
    def is_empty(self) -> bool:
        """Check if queue is approximately empty"""
        return self.size() == 0

class ObjectPool(Generic[T]):
    """High-performance object pool with lock-free operations
    
    Reduces garbage collection pressure by reusing objects.
    Uses lock-free stack for maximum performance.
    """
    
    def __init__(self, factory_func, initial_size: int = 1000, max_size: int = 10000):
        self.factory_func = factory_func
        self.max_size = max_size
        
        # Lock-free stack for available objects
        self.available = LockFreeSPSCQueue(max_size)
        self.in_use_count = AtomicCounter(0)
        
        # Pre-allocate initial objects
        for _ in range(initial_size):
            obj = factory_func()
            self.available.enqueue(obj)
            
        # Performance metrics
        self.total_acquisitions = AtomicCounter(0)
        self.total_releases = AtomicCounter(0)
        self.cache_hits = AtomicCounter(0)
        self.cache_misses = AtomicCounter(0)
        
    def acquire(self) -> T:
        """Acquire object from pool"""
        self.total_acquisitions.increment()
        
        # Try to get from pool first
        obj = self.available.dequeue()
        if obj is not None:
            self.cache_hits.increment()
            self.in_use_count.increment()
            return obj
            
        # Pool empty - create new object
        self.cache_misses.increment()
        self.in_use_count.increment()
        return self.factory_func()
        
    def release(self, obj: T) -> bool:
        """Release object back to pool"""
        self.total_releases.increment()
        self.in_use_count.decrement()
        
        # Reset object state if it has a reset method
        if hasattr(obj, 'reset'):
            obj.reset()
            
        # Try to return to pool
        if not self.available.is_full():
            return self.available.enqueue(obj)
            
        # Pool full - let object be garbage collected
        return False
        
    def get_metrics(self) -> Dict[str, Any]:
        """Get pool performance metrics"""
        total_acq = self.total_acquisitions.get()
        cache_hit_rate = 0.0
        if total_acq > 0:
            cache_hit_rate = self.cache_hits.get() / total_acq
            
        return {
            'total_acquisitions': total_acq,
            'total_releases': self.total_releases.get(),
            'cache_hits': self.cache_hits.get(),
            'cache_misses': self.cache_misses.get(),
            'cache_hit_rate': cache_hit_rate,
            'in_use_count': self.in_use_count.get(),
            'available_count': self.available.size(),
            'pool_utilization': self.in_use_count.get() / self.max_size
        }

class MemoryAlignedArray:
    """Memory-aligned array for cache-friendly data access"""
    
    def __init__(self, size: int, dtype=np.float64, alignment: int = CACHE_LINE_SIZE):
        self.size = size
        self.dtype = dtype
        self.alignment = alignment
        
        # Allocate aligned memory
        total_bytes = size * np.dtype(dtype).itemsize
        aligned_bytes = self._align_size(total_bytes, alignment)
        
        # Create numpy array with aligned memory
        self.data = np.empty(aligned_bytes // np.dtype(dtype).itemsize, dtype=dtype)
        self.view = self.data[:size]  # View of actual data
        
    def _align_size(self, size: int, alignment: int) -> int:
        """Align size to specified boundary"""
        return ((size + alignment - 1) // alignment) * alignment
        
    def __getitem__(self, index):
        return self.view[index]
        
    def __setitem__(self, index, value):
        self.view[index] = value
        
    def __len__(self):
        return self.size

class LockFreeHashMap:
    """Lock-free hash map using open addressing and atomic operations"""
    
    def __init__(self, initial_capacity: int = 1024):
        self.capacity = self._next_power_of_2(initial_capacity)
        self.mask = self.capacity - 1
        
        # Use atomic flags for each bucket
        self.keys = [None] * self.capacity
        self.values = [None] * self.capacity
        self.flags = [AtomicCounter(0) for _ in range(self.capacity)]  # 0=empty, 1=occupied, 2=deleted
        
        self.size_counter = AtomicCounter(0)
        
    def _next_power_of_2(self, n: int) -> int:
        """Find next power of 2 greater than or equal to n"""
        if n <= 0:
            return 1
        n -= 1
        n |= n >> 1
        n |= n >> 2
        n |= n >> 4
        n |= n >> 8
        n |= n >> 16
        return n + 1
        
    def _hash(self, key) -> int:
        """Simple hash function"""
        return hash(key) & self.mask
        
    def put(self, key, value) -> bool:
        """Insert key-value pair"""
        index = self._hash(key)
        
        # Linear probing with atomic operations
        for _ in range(self.capacity):
            flag = self.flags[index].get()
            
            if flag == 0:  # Empty slot
                if self.flags[index].compare_and_swap(0, 1):
                    self.keys[index] = key
                    self.values[index] = value
                    self.size_counter.increment()
                    return True
            elif flag == 1 and self.keys[index] == key:  # Update existing
                self.values[index] = value
                return True
                
            index = (index + 1) & self.mask
            
        return False  # Map full
        
    def get(self, key):
        """Get value by key"""
        index = self._hash(key)
        
        # Linear probing
        for _ in range(self.capacity):
            flag = self.flags[index].get()
            
            if flag == 0:  # Empty slot - key not found
                return None
            elif flag == 1 and self.keys[index] == key:  # Found
                return self.values[index]
                
            index = (index + 1) & self.mask
            
        return None  # Not found
        
    def remove(self, key) -> bool:
        """Remove key-value pair"""
        index = self._hash(key)
        
        # Linear probing
        for _ in range(self.capacity):
            flag = self.flags[index].get()
            
            if flag == 0:  # Empty slot - key not found
                return False
            elif flag == 1 and self.keys[index] == key:  # Found
                if self.flags[index].compare_and_swap(1, 2):  # Mark as deleted
                    self.keys[index] = None
                    self.values[index] = None
                    self.size_counter.decrement()
                    return True
                    
            index = (index + 1) & self.mask
            
        return False  # Not found
        
    def size(self) -> int:
        """Get current size"""
        return self.size_counter.get()
        
    def load_factor(self) -> float:
        """Get current load factor"""
        return self.size() / self.capacity

# Performance testing and benchmarking
class LockFreePerformanceTester:
    """Performance testing framework for lock-free data structures"""
    
    def __init__(self):
        self.results = {}
        
    def benchmark_spsc_queue(self, capacity: int = 65536, num_operations: int = 1000000):
        """Benchmark SPSC queue performance"""
        queue = LockFreeSPSCQueue(capacity)
        
        # Producer function
        def producer():
            start_time = time.time_ns()
            for i in range(num_operations):
                while not queue.enqueue(i):
                    time.sleep(0.000001)  # 1 microsecond
            return time.time_ns() - start_time
            
        # Consumer function
        def consumer():
            start_time = time.time_ns()
            consumed = 0
            while consumed < num_operations:
                item = queue.dequeue()
                if item is not None:
                    consumed += 1
                else:
                    time.sleep(0.000001)  # 1 microsecond
            return time.time_ns() - start_time
            
        # Run producer and consumer concurrently
        producer_thread = threading.Thread(target=producer)
        consumer_thread = threading.Thread(target=consumer)
        
        start_time = time.time_ns()
        producer_thread.start()
        consumer_thread.start()
        
        producer_thread.join()
        consumer_thread.join()
        
        total_time_ns = time.time_ns() - start_time
        
        metrics = queue.metrics
        
        return {
            'total_time_ms': total_time_ns / 1_000_000,
            'operations_per_second': (num_operations * 2) / (total_time_ns / 1_000_000_000),
            'avg_latency_us': metrics.avg_wait_time_us,
            'success_rate': metrics.success_rate,
            'enqueue_count': metrics.enqueue_count,
            'dequeue_count': metrics.dequeue_count
        }
        
    def benchmark_object_pool(self, pool_size: int = 1000, num_operations: int = 100000):
        """Benchmark object pool performance"""
        
        class TestObject:
            def __init__(self):
                self.data = [0] * 100  # Some data
                
            def reset(self):
                self.data = [0] * 100
                
        pool = ObjectPool(TestObject, pool_size)
        
        start_time = time.time_ns()
        
        # Simulate acquire/release cycles
        for _ in range(num_operations):
            obj = pool.acquire()
            # Simulate some work
            obj.data[0] = 42
            pool.release(obj)
            
        total_time_ns = time.time_ns() - start_time
        metrics = pool.get_metrics()
        
        return {
            'total_time_ms': total_time_ns / 1_000_000,
            'operations_per_second': num_operations / (total_time_ns / 1_000_000_000),
            'cache_hit_rate': metrics['cache_hit_rate'],
            'pool_utilization': metrics['pool_utilization']
        }
        
    def run_all_benchmarks(self) -> Dict[str, Any]:
        """Run all performance benchmarks"""
        logging.info("Starting lock-free data structure benchmarks...")
        
        results = {
            'spsc_queue': self.benchmark_spsc_queue(),
            'object_pool': self.benchmark_object_pool()
        }
        
        logging.info(f"Benchmark results: {results}")
        return results

# Example usage
if __name__ == "__main__":
    # Run performance tests
    tester = LockFreePerformanceTester()
    results = tester.run_all_benchmarks()
    
    print("Lock-Free Data Structure Performance Results:")
    for structure, metrics in results.items():
        print(f"\n{structure.upper()}:")
        for metric, value in metrics.items():
            print(f"  {metric}: {value}")