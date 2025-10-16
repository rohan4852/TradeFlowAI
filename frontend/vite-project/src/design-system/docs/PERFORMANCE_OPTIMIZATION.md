# Performance Optimization Features

This document describes the comprehensive performance optimization features implemented in the design system.

## Overview

The performance optimization system provides automatic fallback modes, intelligent caching, budget enforcement, and component virtualization to ensure optimal performance under various conditions.

## Features

### 1. Automatic Fallback Modes

The system automatically detects performance degradation and applies appropriate fallback modes:

- **Normal Mode**: Full functionality with all visual effects
- **Reduced Mode**: Simplified animations and effects
- **Minimal Mode**: Essential functionality only, non-essential elements hidden

#### Configuration

```javascript
const fallbackManager = new AutomaticFallbackManager({
    enableAutoFallback: true,
    fallbackThresholds: {
        frameRate: { warning: 30, critical: 15 },
        renderTime: { warning: 16, critical: 33 },
        memoryUsage: { warning: 70, critical: 85 },
        networkLatency: { warning: 1000, critical: 3000 }
    }
});
```

#### Usage with Hook

```javascript
const { optimizationState, forceFallbackMode } = usePerformanceOptimization({
    enableAutoFallback: true,
    fallbackConfig: {
        fallbackThresholds: {
            frameRate: { warning: 30, critical: 15 }
        }
    }
});

// Force a specific mode for testing
forceFallbackMode('minimal');
```

### 2. Intelligent Caching

Advanced caching system with multiple invalidation strategies:

- **TTL-based expiration**
- **Tag-based invalidation**
- **Dependency tracking**
- **Pattern-based invalidation**
- **Smart cleanup under memory pressure**

#### Basic Usage

```javascript
const { cache } = usePerformanceOptimization({
    enableIntelligentCaching: true,
    cacheConfig: {
        maxSize: 100,
        ttl: 300000, // 5 minutes
        enableLRU: true,
        enableTagging: true,
        enableDependencyTracking: true
    }
});

// Set with tags and dependencies
cache.set('user:1', userData, {
    tags: ['user', 'profile'],
    dependencies: ['auth:token'],
    ttl: 600000 // 10 minutes
});

// Get cached data
const user = cache.get('user:1');

// Invalidate by tag
cache.invalidateByTag('user');

// Invalidate by pattern
cache.invalidateByPattern('^user:');
```

#### Advanced Features

```javascript
// Smart cleanup under memory pressure
cache.smartCleanup('high'); // Removes 50% of cache

// Get comprehensive statistics
const stats = cache.getStats();
console.log(`Hit rate: ${stats.hitRate * 100}%`);
console.log(`Efficiency: ${stats.efficiency}%`);

// Get analysis and recommendations
const analysis = cache.getAnalysis();
analysis.recommendations.forEach(rec => {
    console.log(`${rec.type}: ${rec.message}`);
});
```

### 3. Performance Budget Enforcement

Automated budget enforcement with configurable thresholds:

```javascript
const budgetEnforcer = new AutomatedPerformanceBudget({
    maxRenderTime: 16, // ms
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    minFrameRate: 30, // fps
    maxComponentCount: 1000,
    maxDOMNodes: 5000
});

// Check budget and take automated actions
const result = budgetEnforcer.enforceBudget(metrics);
console.log('Violations:', result.violations);
console.log('Actions taken:', result.actions);
```

#### Budget Compliance

```javascript
// Calculate compliance percentage
const compliance = budgetEnforcer.calculateCompliance(metrics);
console.log(`Budget compliance: ${compliance}%`);

// Get recommendations
const recommendations = budgetEnforcer.generateRecommendations(metrics);
recommendations.forEach(rec => {
    console.log(`${rec.type} (${rec.priority}): ${rec.message}`);
});
```

### 4. Component Virtualization

Automatic virtualization for large datasets:

```javascript
const virtualizer = new ComponentVirtualizer({
    itemHeight: 50,
    containerHeight: 400,
    overscan: 5,
    threshold: 100 // Minimum items before virtualization
});

// Virtualize a large list
virtualizer.virtualize(containerElement, largeItemArray);

// Update items
virtualizer.updateItems(containerElement, newItemArray);

// Get statistics
const stats = virtualizer.getStats();
console.log(`Virtualized containers: ${stats.totalContainers}`);
```

#### React Integration

```javascript
const { virtualizeComponent } = usePerformanceOptimization();

useEffect(() => {
    if (listRef.current && items.length > 100) {
        virtualizeComponent(listRef.current, items);
    }
}, [items, virtualizeComponent]);
```

## Hook Usage

### Basic Setup

```javascript
import usePerformanceOptimization from '../hooks/usePerformanceOptimization';

const MyComponent = () => {
    const {
        optimizationState,
        startOptimization,
        stopOptimization,
        cache,
        virtualizeComponent,
        getOptimizationReport
    } = usePerformanceOptimization({
        enableAutoFallback: true,
        enableBudgetEnforcement: true,
        enableIntelligentCaching: true,
        enableComponentVirtualization: true,
        budgets: {
            maxRenderTime: 16,
            maxMemoryUsage: 100 * 1024 * 1024,
            minFrameRate: 30
        },
        updateInterval: 2000
    });

    useEffect(() => {
        startOptimization();
        return () => stopOptimization();
    }, [startOptimization, stopOptimization]);

    return (
        <div>
            <p>Performance Score: {optimizationState.performanceScore}/100</p>
            <p>Current Mode: {optimizationState.currentMode}</p>
            <p>Active Optimizations: {optimizationState.activeOptimizations.length}</p>
        </div>
    );
};
```

### Advanced Usage

```javascript
const {
    optimizationState,
    cache,
    forceFallbackMode,
    getOptimizationReport
} = usePerformanceOptimization({
    budgets: {
        maxRenderTime: 16,
        maxMemoryUsage: 100 * 1024 * 1024,
        minFrameRate: 30,
        maxComponentCount: 500,
        maxDOMNodes: 2000
    },
    fallbackConfig: {
        fallbackThresholds: {
            frameRate: { warning: 30, critical: 15 },
            renderTime: { warning: 16, critical: 33 }
        }
    },
    cacheConfig: {
        maxSize: 200,
        ttl: 600000,
        enableCompression: true
    }
});

// Cache expensive computations
const expensiveData = useMemo(() => {
    const cached = cache.get('expensive-computation');
    if (cached) return cached;
    
    const result = performExpensiveComputation();
    cache.set('expensive-computation', result, {
        tags: ['computation'],
        ttl: 300000
    });
    
    return result;
}, [cache]);

// Get comprehensive report
const handleShowReport = () => {
    const report = getOptimizationReport();
    console.log('Performance Report:', report);
};
```

## Performance Monitoring

### Metrics Collected

- **Frame Rate**: Current and average FPS
- **Render Time**: Component render duration
- **Memory Usage**: Heap size and percentage
- **DOM Complexity**: Node count and component count
- **Network Latency**: Connection round-trip time

### Performance Score Calculation

The performance score (0-100) is calculated based on:

- Frame Rate (30% weight)
- Memory Usage (25% weight)
- Budget Violations (25% weight)
- DOM Complexity (20% weight)

### Event System

The system dispatches custom events for integration:

```javascript
// Listen for performance fallback events
window.addEventListener('performanceFallback', (event) => {
    console.log('Fallback mode changed:', event.detail.mode);
});

// Listen for performance violations
window.addEventListener('performanceViolation', (event) => {
    console.log('Budget violation:', event.detail);
});

// Listen for optimization requests
document.addEventListener('enableVirtualization', (event) => {
    // Handle virtualization request
});
```

## Best Practices

### 1. Cache Strategy

- Use appropriate TTL values based on data volatility
- Tag related cache entries for efficient invalidation
- Set up dependency chains for related data
- Monitor cache hit rates and adjust size accordingly

### 2. Budget Configuration

- Set realistic budgets based on target devices
- Monitor compliance regularly
- Adjust budgets based on user feedback and analytics
- Use automated actions for critical violations

### 3. Fallback Modes

- Test all fallback modes during development
- Ensure essential functionality remains in minimal mode
- Provide user feedback when fallback modes are active
- Monitor fallback frequency to identify performance issues

### 4. Virtualization

- Enable for lists with >100 items
- Use consistent item heights for better performance
- Implement proper cleanup when components unmount
- Monitor virtualization statistics

## Testing

### Unit Tests

```javascript
// Test fallback mode determination
test('should determine minimal mode for critical metrics', () => {
    const metrics = {
        frameRate: { average: 10 },
        renderTime: { average: 40 },
        memoryUsage: { percentage: 90 }
    };
    
    const mode = fallbackManager.determineFallbackMode(metrics);
    expect(mode).toBe('minimal');
});

// Test cache operations
test('should handle cache invalidation by tag', () => {
    cache.set('key1', 'value1', { tags: ['tag1'] });
    cache.set('key2', 'value2', { tags: ['tag1'] });
    
    const invalidated = cache.invalidateByTag('tag1');
    expect(invalidated).toBe(2);
});
```

### Integration Testing

```javascript
// Test complete optimization flow
test('should coordinate optimization systems', () => {
    const poorMetrics = {
        frameRate: { average: 10 },
        renderTime: { average: 50 },
        memory: { used: 150 * 1024 * 1024 }
    };
    
    const result = budgetEnforcer.enforceBudget(poorMetrics);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.fallbackMode).toBe('minimal');
});
```

## Demo

See `PerformanceOptimizationDemo.jsx` for a comprehensive demonstration of all features. The demo includes:

- Interactive controls for testing different scenarios
- Real-time performance monitoring
- Cache operation examples
- Virtualization demonstration
- Fallback mode testing

## API Reference

### usePerformanceOptimization Hook

```typescript
interface UsePerformanceOptimizationOptions {
    enableAutoFallback?: boolean;
    enableBudgetEnforcement?: boolean;
    enableIntelligentCaching?: boolean;
    enableComponentVirtualization?: boolean;
    budgets?: PerformanceBudgets;
    fallbackConfig?: FallbackConfig;
    cacheConfig?: CacheConfig;
    updateInterval?: number;
}

interface OptimizationState {
    isActive: boolean;
    currentMode: 'normal' | 'reduced' | 'minimal';
    activeOptimizations: Optimization[];
    budgetViolations: Violation[];
    cacheStats: CacheStats | null;
    performanceScore: number;
}
```

### Cache Interface

```typescript
interface CacheInterface {
    get(key: string): any;
    set(key: string, data: any, options?: CacheOptions): void;
    invalidate(key: string): boolean;
    invalidateByTag(tag: string): number;
    clear(): void;
}

interface CacheOptions {
    ttl?: number;
    tags?: string[];
    dependencies?: string[];
    priority?: 'low' | 'normal' | 'high' | 'critical';
}
```

This performance optimization system provides a comprehensive solution for maintaining optimal performance in complex trading applications while automatically adapting to varying system conditions.