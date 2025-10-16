"""
Advanced Memory Manager for Ultra-Low Latency Trading (Windows Compatible)

This module provides sophisticated memory management techniques to minimize
garbage collection pauses and optimize memory access patterns for trading systems.

Key Features:
- Object pooling with generational management
- Memory-mapped shared data structures (with Windows fallback)
- Cache-friendly memory layouts
- Garbage collection optimization
- Memory pressure monitoring
- Cross-platform compatibility
"""

import gc
import mmap
import os
import sys
import time
import threading
import multiprocessing
import platform
from typing import Dict, List, Optional, Any, TypeVar, Generic, Callable
from dataclasses import dataclass, field
from collections import deque, defaultdict
from abc import ABC, abstractmethod
import numpy as np
import logging
import weakref

# Try to import psutil, fall back gracefully
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    logging.warning("psutil not available, memory monitoring will be limited")

T = TypeVar('T')

# Memory alignment constants
CACHE_LINE_SIZE = 64
PAGE_SIZE = 4096
HUGE_PAGE_SIZE = 2 * 1024 * 1024  # 2MB

@dataclass
class MemoryStats:
    """Memory usage statistics"""
    total_allocated_mb: float = 0.0
    pool_allocated_mb: float = 0.0
    mmap_allocated_mb: float = 0.0
    gc_collections: int = 0
    gc_time_ms: float = 0.0
    allocation_rate_mb_per_sec: float = 0.0
    deallocation_rate_mb_per_sec: float = 0.0
    fragmentation_ratio: float = 0.0
    cache_hit_rate: float = 0.0
    
    def update_from_gc_stats(self):
        """Update statistics from garbage collector"""
        gc_stats = gc.get_stats()
        self.gc_collections = sum(stat['collections'] for stat in gc_stats)
        
    def get_memory_pressure(self) -> float:
        """Calculate memory pressure score (0.0 to 1.0)"""
        if not PSUTIL_AVAILABLE:
            return 0.0
            
        try:
            process = psutil.Process()
            memory_info = process.memory_info()
            system_memory = psutil.virtual_memory()
            
            # Calculate pressure based on multiple factors
            usage_pressure = memory_info.rss / system_memory.total
            gc_pressure = min(self.gc_time_ms / 1000.0, 1.0)  # Normalize to 1 second
            fragmentation_pressure = self.fragmentation_ratio
            
            return min((usage_pressure + gc_pressure + fragmentation_pressure) / 3.0, 1.0)
        except Exception:
            return 0.0

class MemoryPool(Generic[T]):
    """High-performance object pool with advanced memory management"""
    
    def __init__(self, 
                 factory_func: Callable[[], T],
                 reset_func: Optional[Callable[[T], None]] = None,
                 initial_size: int = 1000,
                 max_size: int = 10000,
                 growth_factor: float = 1.5,
                 shrink_threshold: float = 0.25):
        
        self.factory_func = factory_func
        self.reset_func = reset_func or (lambda obj: None)
        self.initial_size = initial_size
        self.max_size = max_size
        self.growth_factor = growth_factor
        self.shrink_threshold = shrink_threshold
        
        # Object storage with generational management
        self.available_objects = deque(maxlen=max_size)
        self.in_use_objects = weakref.WeakSet()
        
        # Performance tracking
        self.total_acquisitions = 0
        self.total_releases = 0
        self.cache_hits = 0
        self.cache_misses = 0
        self.peak_usage = 0
        
        # Memory management
        self.last_shrink_time = time.time()
        self.shrink_interval = 60.0  # 1 minute
        
        # Thread safety
        self._lock = threading.RLock()
        
        # Pre-allocate initial objects
        self._preallocate(initial_size)
        
        logging.info(f"MemoryPool initialized with {initial_size} objects, max {max_size}")
        
    def _preallocate(self, count: int):
        """Pre-allocate objects to avoid allocation during trading"""
        with self._lock:
            for _ in range(count):
                if len(self.available_objects) < self.max_size:
                    obj = self.factory_func()
                    self.available_objects.append(obj)
                    
    def acquire(self) -> T:
        """Acquire object from pool"""
        with self._lock:
            self.total_acquisitions += 1
            
            # Try to get from pool
            if self.available_objects:
                obj = self.available_objects.popleft()
                self.cache_hits += 1
            else:
                # Pool empty - create new object
                obj = self.factory_func()
                self.cache_misses += 1
                
            # Track usage
            self.in_use_objects.add(obj)
            current_usage = len(self.in_use_objects)
            self.peak_usage = max(self.peak_usage, current_usage)
            
            return obj
            
    def release(self, obj: T) -> bool:
        """Release object back to pool"""
        with self._lock:
            self.total_releases += 1
            
            # Reset object state
            try:
                self.reset_func(obj)
            except Exception as e:
                logging.warning(f"Error resetting object: {e}")
                return False
                
            # Return to pool if not full
            if len(self.available_objects) < self.max_size:
                self.available_objects.append(obj)
                return True
            else:
                # Pool full - let object be garbage collected
                return False
                
    def shrink_if_needed(self) -> int:
        """Shrink pool if usage is low"""
        current_time = time.time()
        if current_time - self.last_shrink_time < self.shrink_interval:
            return 0
            
        with self._lock:
            current_usage = len(self.in_use_objects)
            available_count = len(self.available_objects)
            total_objects = current_usage + available_count
            
            if total_objects > self.initial_size:
                usage_ratio = current_usage / total_objects if total_objects > 0 else 0
                
                if usage_ratio < self.shrink_threshold:
                    # Shrink pool
                    target_size = max(self.initial_size, int(total_objects * 0.7))
                    objects_to_remove = available_count - (target_size - current_usage)
                    
                    removed = 0
                    for _ in range(max(0, objects_to_remove)):
                        if self.available_objects:
                            self.available_objects.pop()
                            removed += 1
                            
                    self.last_shrink_time = current_time
                    logging.info(f"MemoryPool shrunk by {removed} objects")
                    return removed
                    
        return 0
        
    def get_stats(self) -> Dict[str, Any]:
        """Get pool statistics"""
        with self._lock:
            cache_hit_rate = self.cache_hits / self.total_acquisitions if self.total_acquisitions > 0 else 0.0
            
            return {
                'total_acquisitions': self.total_acquisitions,
                'total_releases': self.total_releases,
                'cache_hits': self.cache_hits,
                'cache_misses': self.cache_misses,
                'cache_hit_rate': cache_hit_rate,
                'in_use_count': len(self.in_use_objects),
                'available_count': len(self.available_objects),
                'peak_usage': self.peak_usage,
                'pool_utilization': len(self.in_use_objects) / self.max_size
            }

class SharedMemoryRegion:
    """Memory-mapped shared memory region for inter-process communication (Windows compatible)"""
    
    def __init__(self, name: str, size_mb: int, create: bool = True):
        self.name = name
        self.size = size_mb * 1024 * 1024
        self.create = create
        self.is_fallback = False
        
        try:
            # Check if shared memory is available (Python 3.8+)
            if not hasattr(multiprocessing, 'shared_memory'):
                raise ImportError("shared_memory not available in this Python version")
            
            if create:
                # Create new shared memory
                self.shm = multiprocessing.shared_memory.SharedMemory(
                    name=name, create=True, size=self.size
                )
            else:
                # Attach to existing shared memory
                self.shm = multiprocessing.shared_memory.SharedMemory(name=name)
                
            # Create memory-mapped view
            self.buffer = memoryview(self.shm.buf)
            
            # Create numpy array view for structured access
            self.array = np.frombuffer(self.shm.buf, dtype=np.uint8)
            
            logging.info(f"SharedMemoryRegion '{name}' initialized: {size_mb}MB")
            
        except (ImportError, OSError, FileExistsError) as e:
            if platform.system() == 'Windows':
                logging.warning(f"Shared memory may have limited support on Windows: {e}")
                # Fall back to memory-mapped file on Windows
                self._fallback_to_mmap(name, size_mb)
            else:
                logging.error(f"Failed to create shared memory region '{name}': {e}")
                raise
    
    def _fallback_to_mmap(self, name: str, size_mb: int):
        """Fallback to memory-mapped file for Windows compatibility"""
        import tempfile
        
        self.is_fallback = True
        
        # Create temporary file
        self.temp_file = tempfile.NamedTemporaryFile(
            prefix=f"shm_{name}_", 
            suffix=".tmp", 
            delete=False
        )
        
        # Write zeros to create file of correct size
        self.temp_file.write(b'\x00' * self.size)
        self.temp_file.flush()
        
        # Create memory mapping
        self.mmap_obj = mmap.mmap(self.temp_file.fileno(), self.size)
        self.buffer = memoryview(self.mmap_obj)
        self.array = np.frombuffer(self.mmap_obj, dtype=np.uint8)
        
        # Create a mock shm object for compatibility
        class MockShm:
            def __init__(self, buf):
                self.buf = buf
            def close(self):
                pass
            def unlink(self):
                pass
        
        self.shm = MockShm(self.mmap_obj)
        
        logging.info(f"SharedMemoryRegion '{name}' using file fallback: {size_mb}MB")
            
    def __del__(self):
        """Cleanup shared memory"""
        try:
            if hasattr(self, 'shm'):
                self.shm.close()
                if self.create and not self.is_fallback:
                    self.shm.unlink()
            
            # Clean up fallback resources
            if self.is_fallback:
                if hasattr(self, 'mmap_obj'):
                    self.mmap_obj.close()
                if hasattr(self, 'temp_file'):
                    self.temp_file.close()
                    try:
                        os.unlink(self.temp_file.name)
                    except OSError:
                        pass
        except Exception as e:
            logging.warning(f"Error cleaning up shared memory: {e}")
            
    def write_at_offset(self, offset: int, data: bytes) -> bool:
        """Write data at specific offset"""
        try:
            if offset + len(data) > self.size:
                return False
            self.buffer[offset:offset + len(data)] = data
            return True
        except Exception as e:
            logging.error(f"Error writing to shared memory: {e}")
            return False
            
    def read_at_offset(self, offset: int, length: int) -> Optional[bytes]:
        """Read data from specific offset"""
        try:
            if offset + length > self.size:
                return None
            return bytes(self.buffer[offset:offset + length])
        except Exception as e:
            logging.error(f"Error reading from shared memory: {e}")
            return None
            
    def get_numpy_view(self, dtype=np.float64, offset: int = 0, count: Optional[int] = None) -> np.ndarray:
        """Get numpy array view of shared memory"""
        if count is None:
            count = (self.size - offset) // np.dtype(dtype).itemsize
        return np.frombuffer(self.shm.buf, dtype=dtype, count=count, offset=offset)

class MemoryMappedFile:
    """Memory-mapped file for persistent, high-performance data storage"""
    
    def __init__(self, filepath: str, size_mb: int, mode: str = 'r+b'):
        self.filepath = filepath
        self.size = size_mb * 1024 * 1024
        self.mode = mode
        
        # Create file if it doesn't exist
        if not os.path.exists(filepath) and ('w' in mode or '+' in mode):
            with open(filepath, 'wb') as f:
                f.write(b'\\x00' * self.size)
                
        # Open file and create memory mapping
        self.file = open(filepath, mode)
        self.mmap = mmap.mmap(self.file.fileno(), self.size)
        
        # Create numpy array view
        self.array = np.frombuffer(self.mmap, dtype=np.uint8)
        
        logging.info(f"MemoryMappedFile '{filepath}' initialized: {size_mb}MB")
        
    def __del__(self):
        """Cleanup memory mapping"""
        try:
            if hasattr(self, 'mmap'):
                self.mmap.close()
            if hasattr(self, 'file'):
                self.file.close()
        except Exception as e:
            logging.warning(f"Error cleaning up memory-mapped file: {e}")
            
    def flush(self):
        """Flush changes to disk"""
        self.mmap.flush()
        
    def get_numpy_view(self, dtype=np.float64, offset: int = 0, count: Optional[int] = None) -> np.ndarray:
        """Get numpy array view of mapped memory"""
        if count is None:
            count = (self.size - offset) // np.dtype(dtype).itemsize
        return np.frombuffer(self.mmap, dtype=dtype, count=count, offset=offset)

class GarbageCollectionOptimizer:
    """Garbage collection optimization for low-latency applications"""
    
    def __init__(self):
        self.original_thresholds = gc.get_threshold()
        self.gc_stats_history = deque(maxlen=100)
        self.last_collection_time = time.time()
        
        # Disable automatic GC initially
        gc.disable()
        
        logging.info("GC Optimizer initialized - automatic GC disabled")
        
    def optimize_thresholds(self, target_pause_ms: float = 1.0):
        """Optimize GC thresholds based on target pause time"""
        # Increase thresholds to reduce frequency
        new_thresholds = (
            self.original_thresholds[0] * 10,  # Generation 0
            self.original_thresholds[1] * 5,   # Generation 1
            self.original_thresholds[2] * 2    # Generation 2
        )
        
        gc.set_threshold(*new_thresholds)
        logging.info(f"GC thresholds updated: {new_thresholds}")
        
    def manual_collect(self, generation: int = 0) -> Dict[str, Any]:
        """Perform manual garbage collection with timing"""
        start_time = time.time_ns()
        
        # Collect specific generation
        collected = gc.collect(generation)
        
        end_time = time.time_ns()
        pause_time_ms = (end_time - start_time) / 1_000_000
        
        stats = {
            'generation': generation,
            'objects_collected': collected,
            'pause_time_ms': pause_time_ms,
            'timestamp': time.time()
        }
        
        self.gc_stats_history.append(stats)
        self.last_collection_time = time.time()
        
        logging.debug(f"Manual GC gen {generation}: {collected} objects, {pause_time_ms:.2f}ms")
        
        return stats
        
    def should_collect(self, max_pause_ms: float = 1.0, min_interval_sec: float = 1.0) -> bool:
        """Determine if GC should be triggered"""
        current_time = time.time()
        
        # Check minimum interval
        if current_time - self.last_collection_time < min_interval_sec:
            return False
            
        # Check object counts
        counts = gc.get_count()
        thresholds = gc.get_threshold()
        
        # Trigger if any generation exceeds threshold
        for i, (count, threshold) in enumerate(zip(counts, thresholds)):
            if count > threshold:
                return True
                
        return False
        
    def get_gc_stats(self) -> Dict[str, Any]:
        """Get garbage collection statistics"""
        if not self.gc_stats_history:
            return {}
            
        recent_stats = list(self.gc_stats_history)[-10:]  # Last 10 collections
        
        total_pause_time = sum(stat['pause_time_ms'] for stat in recent_stats)
        avg_pause_time = total_pause_time / len(recent_stats) if recent_stats else 0
        max_pause_time = max(stat['pause_time_ms'] for stat in recent_stats) if recent_stats else 0
        
        return {
            'total_collections': len(self.gc_stats_history),
            'avg_pause_time_ms': avg_pause_time,
            'max_pause_time_ms': max_pause_time,
            'total_pause_time_ms': total_pause_time,
            'current_counts': gc.get_count(),
            'current_thresholds': gc.get_threshold(),
            'time_since_last_collection': time.time() - self.last_collection_time
        }
        
    def restore_defaults(self):
        """Restore original GC settings"""
        gc.set_threshold(*self.original_thresholds)
        gc.enable()
        logging.info("GC settings restored to defaults")

class AdvancedMemoryManager:
    """Central memory manager coordinating all memory optimization techniques"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        
        # Initialize components
        self.pools: Dict[str, MemoryPool] = {}
        self.shared_regions: Dict[str, SharedMemoryRegion] = {}
        self.mapped_files: Dict[str, MemoryMappedFile] = {}
        self.gc_optimizer = GarbageCollectionOptimizer()
        
        # Performance monitoring
        self.stats = MemoryStats()
        self.monitoring_thread = None
        self.monitoring_active = False
        
        # Configuration
        self.max_gc_pause_ms = self.config.get('max_gc_pause_ms', 1.0)
        self.monitoring_interval = self.config.get('monitoring_interval', 1.0)
        
        # Optimize GC settings
        self.gc_optimizer.optimize_thresholds(self.max_gc_pause_ms)
        
        logging.info("AdvancedMemoryManager initialized")
        
    def create_pool(self, name: str, factory_func: Callable, **kwargs) -> MemoryPool:
        """Create a new object pool"""
        if name in self.pools:
            raise ValueError(f"Pool '{name}' already exists")
            
        pool = MemoryPool(factory_func, **kwargs)
        self.pools[name] = pool
        
        logging.info(f"Created memory pool '{name}'")
        return pool
        
    def get_pool(self, name: str) -> Optional[MemoryPool]:
        """Get existing pool by name"""
        return self.pools.get(name)
        
    def create_shared_region(self, name: str, size_mb: int) -> SharedMemoryRegion:
        """Create shared memory region"""
        if name in self.shared_regions:
            raise ValueError(f"Shared region '{name}' already exists")
            
        region = SharedMemoryRegion(name, size_mb)
        self.shared_regions[name] = region
        
        logging.info(f"Created shared memory region '{name}': {size_mb}MB")
        return region
        
    def create_mapped_file(self, name: str, filepath: str, size_mb: int) -> MemoryMappedFile:
        """Create memory-mapped file"""
        if name in self.mapped_files:
            raise ValueError(f"Mapped file '{name}' already exists")
            
        mapped_file = MemoryMappedFile(filepath, size_mb)
        self.mapped_files[name] = mapped_file
        
        logging.info(f"Created memory-mapped file '{name}': {filepath} ({size_mb}MB)")
        return mapped_file
        
    def start_monitoring(self):
        """Start memory monitoring thread"""
        if self.monitoring_active:
            return
            
        self.monitoring_active = True
        self.monitoring_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
        self.monitoring_thread.start()
        
        logging.info("Memory monitoring started")
        
    def stop_monitoring(self):
        """Stop memory monitoring"""
        self.monitoring_active = False
        if self.monitoring_thread:
            self.monitoring_thread.join(timeout=5.0)
            
        logging.info("Memory monitoring stopped")
        
    def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.monitoring_active:
            try:
                # Update statistics
                self._update_stats()
                
                # Check if GC should be triggered
                if self.gc_optimizer.should_collect(self.max_gc_pause_ms):
                    self.gc_optimizer.manual_collect(0)  # Collect generation 0
                    
                # Shrink pools if needed
                for pool in self.pools.values():
                    pool.shrink_if_needed()
                    
                # Check memory pressure
                pressure = self.stats.get_memory_pressure()
                if pressure > 0.8:  # High memory pressure
                    logging.warning(f"High memory pressure detected: {pressure:.2f}")
                    self.gc_optimizer.manual_collect(2)  # Full GC
                    
                time.sleep(self.monitoring_interval)
                
            except Exception as e:
                logging.error(f"Error in memory monitoring loop: {e}")
                time.sleep(1.0)
                
    def _update_stats(self):
        """Update memory statistics"""
        if not PSUTIL_AVAILABLE:
            return
            
        try:
            # Get process memory info
            process = psutil.Process()
            memory_info = process.memory_info()
            
            self.stats.total_allocated_mb = memory_info.rss / (1024 * 1024)
            
            # Update pool statistics
            total_cache_hits = 0
            total_acquisitions = 0
            
            for pool in self.pools.values():
                pool_stats = pool.get_stats()
                total_cache_hits += pool_stats['cache_hits']
                total_acquisitions += pool_stats['total_acquisitions']
                
            if total_acquisitions > 0:
                self.stats.cache_hit_rate = total_cache_hits / total_acquisitions
                
            # Update GC statistics
            self.stats.update_from_gc_stats()
            gc_stats = self.gc_optimizer.get_gc_stats()
            if gc_stats:
                self.stats.gc_time_ms = gc_stats.get('total_pause_time_ms', 0.0)
        except Exception as e:
            logging.warning(f"Error updating memory stats: {e}")
            
    def get_comprehensive_stats(self) -> Dict[str, Any]:
        """Get comprehensive memory statistics"""
        pool_stats = {}
        for name, pool in self.pools.items():
            pool_stats[name] = pool.get_stats()
            
        return {
            'memory_stats': {
                'total_allocated_mb': self.stats.total_allocated_mb,
                'pool_allocated_mb': self.stats.pool_allocated_mb,
                'mmap_allocated_mb': self.stats.mmap_allocated_mb,
                'memory_pressure': self.stats.get_memory_pressure()
            },
            'pool_stats': pool_stats,
            'gc_stats': self.gc_optimizer.get_gc_stats(),
            'shared_regions': list(self.shared_regions.keys()),
            'mapped_files': list(self.mapped_files.keys()),
            'platform_info': {
                'system': platform.system(),
                'python_version': platform.python_version(),
                'psutil_available': PSUTIL_AVAILABLE
            }
        }
        
    def cleanup(self):
        """Cleanup all resources"""
        # Stop monitoring
        self.stop_monitoring()
        
        # Cleanup shared regions
        for region in list(self.shared_regions.values()):
            del region
        self.shared_regions.clear()
        
        # Cleanup mapped files
        for mapped_file in list(self.mapped_files.values()):
            del mapped_file
        self.mapped_files.clear()
        
        # Restore GC settings
        self.gc_optimizer.restore_defaults()
        
        logging.info("AdvancedMemoryManager cleanup complete")

# Global memory manager instance
_memory_manager: Optional[AdvancedMemoryManager] = None

def get_memory_manager() -> AdvancedMemoryManager:
    """Get global memory manager instance"""
    global _memory_manager
    if _memory_manager is None:
        _memory_manager = AdvancedMemoryManager()
    return _memory_manager

def initialize_memory_manager(config: Dict[str, Any] = None) -> AdvancedMemoryManager:
    """Initialize global memory manager"""
    global _memory_manager
    if _memory_manager is None:
        _memory_manager = AdvancedMemoryManager(config)
        _memory_manager.start_monitoring()
    return _memory_manager

def shutdown_memory_manager():
    """Shutdown global memory manager"""
    global _memory_manager
    if _memory_manager is not None:
        _memory_manager.cleanup()
        _memory_manager = None

# Example usage and testing
if __name__ == "__main__":
    # Test memory manager
    manager = initialize_memory_manager({
        'max_gc_pause_ms': 0.5,
        'monitoring_interval': 0.5
    })
    
    # Create test object pool
    class TestObject:
        def __init__(self):
            self.data = [0] * 1000
            
        def reset(self):
            self.data = [0] * 1000
            
    pool = manager.create_pool('test_objects', TestObject, initial_size=100)
    
    # Test pool operations
    objects = []
    for _ in range(50):
        obj = pool.acquire()
        objects.append(obj)
        
    for obj in objects:
        pool.release(obj)
        
    # Print statistics
    stats = manager.get_comprehensive_stats()
    print("Memory Manager Statistics:")
    for category, data in stats.items():
        print(f"  {category}: {data}")
        
    # Cleanup
    time.sleep(2)  # Let monitoring run
    shutdown_memory_manager()