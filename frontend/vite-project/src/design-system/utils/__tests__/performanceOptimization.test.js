/**
 * Performance Optimization Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    PerformanceOptimizer,
    IntelligentCache,
    AutomatedPerformanceBudget,
    ComponentVirtualizer
} from '../performanceOptimization';

describe('PerformanceOptimizer', () => {
    let optimizer;

    beforeEach(() => {
        optimizer = new PerformanceOptimizer();
        // Mock DOM methods
        global.document = {
            body: {
                classList: {
                    add: vi.fn(),
                    remove: vi.fn()
                },
                setAttribute: vi.fn(),
                removeAttribute: vi.fn()
            },
            getElementById: vi.fn(),
            createElement: vi.fn(() => ({
                textContent: '',
                appendChild: vi.fn()
            })),
            head: {
                appendChild: vi.fn()
            },
            querySelectorAll: vi.fn(() => [])
        };
        global.window = {
            gc: vi.fn()
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Initialization', () => {
        it('creates optimizer with default configuration', () => {
            expect(optimizer.config.enableAutoFallback).toBe(true);
            expect(optimizer.config.enableVirtualization).toBe(true);
            expect(optimizer.config.fallbackThresholds.frameRate).toBe(20);
        });

        it('creates optimizer with custom configuration', () => {
            const customOptimizer = new PerformanceOptimizer({
                fallbackThresholds: { frameRate: 15 }
            });

            expect(customOptimizer.config.fallbackThresholds.frameRate).toBe(15);
        });
    });

    describe('Optimization Control', () => {
        it('enables optimization', () => {
            expect(optimizer.isOptimizing).toBe(false);

            optimizer.enable();

            expect(optimizer.isOptimizing).toBe(true);
        });

        it('disables optimization and clears optimizations', () => {
            optimizer.enable();
            optimizer.optimizations.set('test', { type: 'test' });

            optimizer.disable();

            expect(optimizer.isOptimizing).toBe(false);
            expect(optimizer.optimizations.size).toBe(0);
        });
    });

    describe('Performance Optimization', () => {
        beforeEach(() => {
            optimizer.enable();
        });

        it('optimizes frame rate when below threshold', () => {
            const metrics = { frameRate: 15 }; // Below threshold of 20

            const optimizations = optimizer.optimize(metrics);

            expect(optimizations).toHaveLength(1);
            expect(optimizations[0].type).toBe('frameRate');
            expect(optimizations[0].actions).toContain('reduceAnimations');
        });

        it('optimizes memory when above threshold', () => {
            const metrics = {
                memoryUsage: { percentage: 85 } // Above threshold of 80
            };

            const optimizations = optimizer.optimize(metrics);

            expect(optimizations).toHaveLength(1);
            expect(optimizations[0].type).toBe('memory');
            expect(optimizations[0].actions).toContain('clearCaches');
        });

        it('optimizes render time when above threshold', () => {
            const metrics = { averageRenderTime: 60 }; // Above threshold of 50

            const optimizations = optimizer.optimize(metrics);

            expect(optimizations).toHaveLength(1);
            expect(optimizations[0].type).toBe('renderTime');
            expect(optimizations[0].actions).toContain('enableMemoization');
        });

        it('does not optimize when disabled', () => {
            optimizer.disable();
            const metrics = { frameRate: 10 };

            const optimizations = optimizer.optimize(metrics);

            expect(optimizations).toHaveLength(0);
        });
    });

    describe('Optimization Methods', () => {
        it('reduces animations', () => {
            optimizer.reduceAnimations();

            expect(document.body.classList.add).toHaveBeenCalledWith('performance-mode');
        });

        it('enables memoization', () => {
            optimizer.enableMemoization();

            expect(document.body.setAttribute).toHaveBeenCalledWith('data-enable-memoization', 'true');
        });

        it('clears caches', () => {
            optimizer.cache.set('test', 'value');

            optimizer.clearCaches();

            expect(optimizer.cache.size).toBe(0);
        });
    });
});

describe('IntelligentCache', () => {
    let cache;

    beforeEach(() => {
        cache = new IntelligentCache({
            maxSize: 3,
            ttl: 1000
        });
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Basic Operations', () => {
        it('stores and retrieves items', () => {
            cache.set('key1', 'value1');

            expect(cache.get('key1')).toBe('value1');
        });

        it('returns null for non-existent items', () => {
            expect(cache.get('nonexistent')).toBeNull();
        });

        it('handles cache misses', () => {
            cache.get('nonexistent');

            expect(cache.getStats().missCount).toBe(1);
        });

        it('handles cache hits', () => {
            cache.set('key1', 'value1');
            cache.get('key1');

            expect(cache.getStats().hitCount).toBe(1);
        });
    });

    describe('TTL (Time To Live)', () => {
        it('expires items after TTL', () => {
            cache.set('key1', 'value1');

            // Fast-forward time beyond TTL
            vi.advanceTimersByTime(1500);

            expect(cache.get('key1')).toBeNull();
        });

        it('returns valid items within TTL', () => {
            cache.set('key1', 'value1');

            // Fast-forward time within TTL
            vi.advanceTimersByTime(500);

            expect(cache.get('key1')).toBe('value1');
        });
    });

    describe('LRU Eviction', () => {
        it('evicts least recently used items when at capacity', () => {
            // Fill cache to capacity
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.set('key3', 'value3');

            // Access key1 to make it recently used
            cache.get('key1');

            // Add new item, should evict key2 (least recently used)
            cache.set('key4', 'value4');

            expect(cache.get('key1')).toBe('value1'); // Still exists
            expect(cache.get('key2')).toBeNull(); // Evicted
            expect(cache.get('key3')).toBe('value3'); // Still exists
            expect(cache.get('key4')).toBe('value4'); // New item
        });
    });

    describe('Statistics', () => {
        it('calculates hit rate correctly', () => {
            cache.set('key1', 'value1');
            cache.get('key1'); // Hit
            cache.get('key2'); // Miss

            const stats = cache.getStats();
            expect(stats.hitRate).toBe(0.5); // 1 hit out of 2 attempts
        });

        it('tracks cache size', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');

            const stats = cache.getStats();
            expect(stats.size).toBe(2);
        });
    });

    describe('Cleanup', () => {
        it('removes expired items during cleanup', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');

            // Fast-forward time to expire items
            vi.advanceTimersByTime(1500);

            const expiredCount = cache.cleanup();

            expect(expiredCount).toBe(2);
            expect(cache.getStats().size).toBe(0);
        });
    });
});

describe('AutomatedPerformanceBudget', () => {
    let budget;
    let mockOptimizer;

    beforeEach(() => {
        mockOptimizer = {
            optimizeFrameRate: vi.fn(() => ({ type: 'frameRate', actions: ['test'] })),
            optimizeMemoryUsage: vi.fn(() => ({ type: 'memory', actions: ['test'] })),
            optimizeRenderTime: vi.fn(() => ({ type: 'renderTime', actions: ['test'] }))
        };

        budget = new AutomatedPerformanceBudget({
            maxRenderTime: 20,
            minFrameRate: 40
        }, mockOptimizer);
    });

    describe('Budget Checking', () => {
        it('detects render time violations', () => {
            const metrics = {
                renderTime: { average: 25 } // Above budget of 20
            };

            const result = budget.enforceBudget(metrics);

            expect(result.violations).toHaveLength(1);
            expect(result.violations[0].type).toBe('renderTime');
            expect(result.violations[0].severity).toBe('warning');
        });

        it('detects critical violations', () => {
            const metrics = {
                renderTime: { average: 40 } // 2x budget = critical
            };

            const result = budget.enforceBudget(metrics);

            expect(result.violations[0].severity).toBe('critical');
        });

        it('takes automated actions for critical violations', () => {
            const metrics = {
                renderTime: { average: 40 } // Critical violation
            };

            budget.enforceBudget(metrics);

            expect(mockOptimizer.optimizeRenderTime).toHaveBeenCalled();
        });

        it('does not take actions for warning violations', () => {
            const metrics = {
                renderTime: { average: 25 } // Warning violation
            };

            budget.enforceBudget(metrics);

            expect(mockOptimizer.optimizeRenderTime).not.toHaveBeenCalled();
        });
    });

    describe('History Management', () => {
        it('tracks violation history', () => {
            const metrics = {
                renderTime: { average: 25 }
            };

            budget.enforceBudget(metrics);

            expect(budget.getViolations()).toHaveLength(1);
        });

        it('clears history', () => {
            const metrics = {
                renderTime: { average: 25 }
            };

            budget.enforceBudget(metrics);
            budget.clearHistory();

            expect(budget.getViolations()).toHaveLength(0);
            expect(budget.getActions()).toHaveLength(0);
        });
    });
});

describe('ComponentVirtualizer', () => {
    let virtualizer;
    let mockContainer;

    beforeEach(() => {
        virtualizer = new ComponentVirtualizer({
            itemHeight: 50,
            containerHeight: 200,
            threshold: 5 // Lower threshold for testing
        });

        mockContainer = {
            style: {},
            innerHTML: '',
            appendChild: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            firstChild: {
                style: {},
                appendChild: vi.fn(),
                innerHTML: ''
            },
            scrollTop: 0
        };

        global.document = {
            createElement: vi.fn(() => ({
                style: {},
                className: '',
                setAttribute: vi.fn(),
                textContent: '',
                innerHTML: '',
                appendChild: vi.fn(),
                remove: vi.fn()
            }))
        };
    });

    describe('Virtualization Setup', () => {
        it('virtualizes containers with many items', () => {
            const items = Array.from({ length: 10 }, (_, i) => `Item ${i}`);

            virtualizer.virtualize(mockContainer, items);

            expect(virtualizer.virtualizedContainers.has(mockContainer)).toBe(true);
            expect(mockContainer.style.height).toBe('200px');
            expect(mockContainer.style.overflow).toBe('auto');
        });

        it('does not virtualize containers with few items', () => {
            const items = Array.from({ length: 3 }, (_, i) => `Item ${i}`);

            virtualizer.virtualize(mockContainer, items);

            expect(virtualizer.virtualizedContainers.has(mockContainer)).toBe(false);
        });
    });

    describe('Statistics', () => {
        it('provides virtualization statistics', () => {
            const items = Array.from({ length: 10 }, (_, i) => `Item ${i}`);
            virtualizer.virtualize(mockContainer, items);

            const stats = virtualizer.getStats();

            expect(stats.totalContainers).toBe(1);
            expect(stats.containers).toHaveLength(1);
            expect(stats.containers[0].totalItems).toBe(10);
        });
    });

    describe('Cleanup', () => {
        it('destroys virtualization', () => {
            const items = Array.from({ length: 10 }, (_, i) => `Item ${i}`);
            virtualizer.virtualize(mockContainer, items);

            virtualizer.destroy(mockContainer);

            expect(virtualizer.virtualizedContainers.has(mockContainer)).toBe(false);
            expect(mockContainer.style.height).toBe('');
        });
    });
});