/**
 * Enhanced Performance Optimization Tests
 * Tests for automatic fallback modes, intelligent caching, and budget enforcement
 */

import {
    PerformanceOptimizer,
    AutomaticFallbackManager,
    AutomatedPerformanceBudget,
    IntelligentCache,
    ComponentVirtualizer
} from '../performanceOptimization';

// Mock performance API
global.performance = {
    now: jest.fn(() => Date.now()),
    memory: {
        usedJSHeapSize: 50 * 1024 * 1024,
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 200 * 1024 * 1024
    },
    mark: jest.fn(),
    measure: jest.fn()
};

// Mock DOM
global.document = {
    body: {
        classList: {
            add: jest.fn(),
            remove: jest.fn()
        },
        setAttribute: jest.fn(),
        removeAttribute: jest.fn()
    },
    head: {
        appendChild: jest.fn()
    },
    createElement: jest.fn(() => ({
        id: '',
        textContent: '',
        remove: jest.fn()
    })),
    getElementById: jest.fn(),
    querySelectorAll: jest.fn(() => [])
};

global.window = {
    dispatchEvent: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    gc: jest.fn()
};

describe('AutomaticFallbackManager', () => {
    let fallbackManager;

    beforeEach(() => {
        fallbackManager = new AutomaticFallbackManager();
        jest.clearAllMocks();
    });

    describe('Fallback Mode Determination', () => {
        test('should determine normal mode for good metrics', () => {
            const metrics = {
                frameRate: { average: 60 },
                renderTime: { average: 10 },
                memoryUsage: { percentage: 50 },
                networkLatency: { average: 100 }
            };

            const mode = fallbackManager.determineFallbackMode(metrics);
            expect(mode).toBe('normal');
        });

        test('should determine reduced mode for warning metrics', () => {
            const metrics = {
                frameRate: { average: 25 }, // Below warning threshold of 30
                renderTime: { average: 20 }, // Above warning threshold of 16
                memoryUsage: { percentage: 60 },
                networkLatency: { average: 500 }
            };

            const mode = fallbackManager.determineFallbackMode(metrics);
            expect(mode).toBe('reduced');
        });

        test('should determine minimal mode for critical metrics', () => {
            const metrics = {
                frameRate: { average: 10 }, // Below critical threshold of 15
                renderTime: { average: 40 }, // Above critical threshold of 33
                memoryUsage: { percentage: 90 }, // Above critical threshold of 85
                networkLatency: { average: 4000 } // Above critical threshold of 3000
            };

            const mode = fallbackManager.determineFallbackMode(metrics);
            expect(mode).toBe('minimal');
        });
    });

    describe('Fallback Mode Application', () => {
        test('should apply reduced mode optimizations', () => {
            fallbackManager.applyReducedMode();

            expect(document.body.classList.add).toHaveBeenCalledWith('performance-fallback-reduced-animations');
            expect(document.body.classList.add).toHaveBeenCalledWith('performance-fallback-simplified-effects');
            expect(window.dispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'reducePollingFrequency'
                })
            );
        });

        test('should apply minimal mode optimizations', () => {
            fallbackManager.applyMinimalMode();

            expect(document.body.classList.add).toHaveBeenCalledWith('performance-fallback-minimal');
            expect(window.dispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'disableRealTimeUpdates'
                })
            );
        });

        test('should clear fallback optimizations', () => {
            fallbackManager.clearFallbackOptimizations();

            expect(document.body.classList.remove).toHaveBeenCalledWith(
                'performance-fallback-reduced-animations',
                'performance-fallback-simplified-effects',
                'performance-fallback-minimal'
            );
            expect(window.dispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'restoreNormalMode'
                })
            );
        });
    });

    describe('Fallback History', () => {
        test('should record fallback events', () => {
            const metrics = {
                frameRate: { average: 10 },
                renderTime: { average: 40 }
            };

            fallbackManager.evaluateAndApplyFallback(metrics);
            const status = fallbackManager.getStatus();

            expect(status.fallbackHistory).toHaveLength(1);
            expect(status.fallbackHistory[0]).toMatchObject({
                fromMode: 'normal',
                toMode: 'minimal',
                metrics
            });
        });
    });
});

describe('AutomatedPerformanceBudget', () => {
    let budgetEnforcer;
    let optimizer;

    beforeEach(() => {
        optimizer = new PerformanceOptimizer();
        budgetEnforcer = new AutomatedPerformanceBudget({}, optimizer);
        jest.clearAllMocks();
    });

    describe('Budget Checking', () => {
        test('should detect render time violations', () => {
            const metrics = {
                renderTime: { average: 50 } // Above budget of 16ms
            };

            const violations = budgetEnforcer.checkBudget(metrics);

            expect(violations).toHaveLength(1);
            expect(violations[0]).toMatchObject({
                type: 'renderTime',
                budget: 16,
                actual: 50,
                severity: 'critical'
            });
        });

        test('should detect memory violations', () => {
            const metrics = {
                memory: { used: 150 * 1024 * 1024 } // Above budget of 100MB
            };

            const violations = budgetEnforcer.checkBudget(metrics);

            expect(violations).toHaveLength(1);
            expect(violations[0]).toMatchObject({
                type: 'memoryUsage',
                budget: 100 * 1024 * 1024,
                actual: 150 * 1024 * 1024,
                severity: 'critical'
            });
        });

        test('should detect frame rate violations', () => {
            const metrics = {
                frameRate: { average: 20 } // Below budget of 30fps
            };

            const violations = budgetEnforcer.checkBudget(metrics);

            expect(violations).toHaveLength(1);
            expect(violations[0]).toMatchObject({
                type: 'frameRate',
                budget: 30,
                actual: 20,
                severity: 'warning'
            });
        });
    });

    describe('Automated Actions', () => {
        test('should take automated actions for violations', () => {
            const metrics = {
                renderTime: { average: 50 },
                memory: { used: 150 * 1024 * 1024 },
                frameRate: { average: 10 }
            };

            const result = budgetEnforcer.enforceBudget(metrics);

            expect(result.violations).toHaveLength(3);
            expect(result.actions.length).toBeGreaterThan(0);
            expect(result.fallbackMode).toBe('minimal');
        });

        test('should enable virtualization for component count violations', () => {
            document.querySelectorAll = jest.fn(() =>
                Array(5).fill().map(() => ({
                    setAttribute: jest.fn(),
                    dispatchEvent: jest.fn(),
                    children: { length: 150 }
                }))
            );

            const result = budgetEnforcer.enableComponentVirtualization();

            expect(result.executed).toBe(true);
            expect(result.virtualizedLists).toBeGreaterThan(0);
        });
    });

    describe('Budget Status and Compliance', () => {
        test('should calculate compliance percentage', () => {
            const metrics = {
                renderTime: { average: 8 }, // Good (50% of budget)
                memory: { used: 50 * 1024 * 1024 }, // Good (50% of budget)
                frameRate: { average: 60 }, // Excellent (200% of budget)
                componentCount: 500, // Good (50% of budget)
                domNodes: 2500 // Good (50% of budget)
            };

            const compliance = budgetEnforcer.calculateCompliance(metrics);
            expect(compliance).toBeGreaterThan(80); // Should be high compliance
        });

        test('should generate performance recommendations', () => {
            const metrics = {
                renderTime: { average: 14 }, // Close to budget
                memory: { percentage: 65 }, // Above 60%
                frameRate: { average: 35 }, // Close to budget
                componentCount: 850 // Close to budget
            };

            const recommendations = budgetEnforcer.generateRecommendations(metrics);

            expect(recommendations.length).toBeGreaterThan(0);
            expect(recommendations.some(r => r.type === 'renderTime')).toBe(true);
            expect(recommendations.some(r => r.type === 'memory')).toBe(true);
        });
    });
});

describe('IntelligentCache', () => {
    let cache;

    beforeEach(() => {
        cache = new IntelligentCache({
            maxSize: 5,
            ttl: 1000,
            enableLRU: true,
            enableCompression: false,
            enableTagging: true,
            enableDependencyTracking: true
        });
    });

    describe('Basic Cache Operations', () => {
        test('should store and retrieve items', () => {
            cache.set('key1', 'value1');
            expect(cache.get('key1')).toBe('value1');
        });

        test('should return null for non-existent keys', () => {
            expect(cache.get('nonexistent')).toBeNull();
        });

        test('should handle TTL expiration', (done) => {
            cache.set('key1', 'value1', { ttl: 50 });

            setTimeout(() => {
                expect(cache.get('key1')).toBeNull();
                done();
            }, 100);
        });
    });

    describe('Advanced Cache Features', () => {
        test('should handle tags', () => {
            cache.set('key1', 'value1', { tags: ['tag1', 'tag2'] });
            cache.set('key2', 'value2', { tags: ['tag1'] });
            cache.set('key3', 'value3', { tags: ['tag2'] });

            const invalidated = cache.invalidateByTag('tag1');
            expect(invalidated).toBe(2);
            expect(cache.get('key1')).toBeNull();
            expect(cache.get('key2')).toBeNull();
            expect(cache.get('key3')).toBe('value3');
        });

        test('should handle dependencies', () => {
            cache.set('dep1', 'dependency1');
            cache.set('key1', 'value1', { dependencies: ['dep1'] });
            cache.set('key2', 'value2', { dependencies: ['dep1'] });

            cache.invalidate('dep1');

            expect(cache.get('dep1')).toBeNull();
            expect(cache.get('key1')).toBeNull();
            expect(cache.get('key2')).toBeNull();
        });

        test('should handle pattern invalidation', () => {
            cache.set('user:1', 'user1');
            cache.set('user:2', 'user2');
            cache.set('post:1', 'post1');

            const invalidated = cache.invalidateByPattern('^user:');
            expect(invalidated).toBe(2);
            expect(cache.get('user:1')).toBeNull();
            expect(cache.get('user:2')).toBeNull();
            expect(cache.get('post:1')).toBe('post1');
        });
    });

    describe('Smart Cleanup', () => {
        test('should perform smart cleanup under memory pressure', () => {
            // Fill cache
            for (let i = 0; i < 10; i++) {
                cache.set(`key${i}`, `value${i}`, {
                    priority: i % 2 === 0 ? 'low' : 'high'
                });
            }

            const removed = cache.smartCleanup('high');
            expect(removed).toBeGreaterThan(0);
            expect(cache.cache.size).toBeLessThan(10);
        });

        test('should prioritize removal based on access patterns', () => {
            cache.set('frequent', 'value1', { priority: 'high' });
            cache.set('infrequent', 'value2', { priority: 'low' });

            // Access frequent item multiple times
            for (let i = 0; i < 5; i++) {
                cache.get('frequent');
            }

            // Fill cache to trigger eviction
            for (let i = 0; i < 10; i++) {
                cache.set(`filler${i}`, `value${i}`);
            }

            // Frequent, high-priority item should still be there
            expect(cache.get('frequent')).toBe('value1');
        });
    });

    describe('Cache Analytics', () => {
        test('should provide comprehensive statistics', () => {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.get('key1');
            cache.get('nonexistent');

            const stats = cache.getStats();

            expect(stats.size).toBe(2);
            expect(stats.hitCount).toBe(1);
            expect(stats.missCount).toBe(1);
            expect(stats.hitRate).toBe(0.5);
        });

        test('should calculate efficiency score', () => {
            // Set up cache with good conditions
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');

            // Generate some hits
            cache.get('key1');
            cache.get('key2');

            const stats = cache.getStats();
            expect(stats.efficiency).toBeGreaterThan(50);
        });

        test('should provide analysis and recommendations', () => {
            // Create conditions that should trigger recommendations
            cache.config.maxSize = 2;
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.set('key3', 'value3'); // This should trigger eviction

            const analysis = cache.getAnalysis();

            expect(analysis.recommendations.length).toBeGreaterThan(0);
            expect(analysis.healthScore).toBeDefined();
            expect(analysis.efficiency).toBeDefined();
        });
    });
});

describe('ComponentVirtualizer', () => {
    let virtualizer;
    let mockContainer;

    beforeEach(() => {
        virtualizer = new ComponentVirtualizer({
            itemHeight: 50,
            containerHeight: 400,
            threshold: 10
        });

        mockContainer = {
            style: {},
            innerHTML: '',
            appendChild: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            scrollTop: 0,
            firstChild: {
                style: {},
                appendChild: jest.fn(),
                innerHTML: ''
            }
        };
    });

    describe('Virtualization Decision', () => {
        test('should not virtualize small lists', () => {
            const items = Array(5).fill('item');
            virtualizer.virtualize(mockContainer, items);

            expect(virtualizer.virtualizedContainers.size).toBe(0);
        });

        test('should virtualize large lists', () => {
            const items = Array(200).fill('item');
            virtualizer.virtualize(mockContainer, items);

            expect(virtualizer.virtualizedContainers.size).toBe(1);
            expect(mockContainer.style.height).toBe('400px');
            expect(mockContainer.style.overflow).toBe('auto');
        });
    });

    describe('Virtual Scrolling', () => {
        test('should update visible items on scroll', () => {
            const items = Array(200).fill().map((_, i) => `item${i}`);
            virtualizer.virtualize(mockContainer, items);

            const virtualContainer = virtualizer.virtualizedContainers.get(mockContainer);
            virtualContainer.scrollTop = 1000; // Scroll down

            virtualizer.updateVisibleItems(virtualContainer);

            expect(virtualContainer.visibleStart).toBeGreaterThan(0);
            expect(virtualContainer.visibleEnd).toBeGreaterThan(virtualContainer.visibleStart);
        });

        test('should provide virtualization statistics', () => {
            const items = Array(200).fill('item');
            virtualizer.virtualize(mockContainer, items);

            const stats = virtualizer.getStats();

            expect(stats.totalContainers).toBe(1);
            expect(stats.containers).toHaveLength(1);
            expect(stats.containers[0].totalItems).toBe(200);
        });
    });

    describe('Item Management', () => {
        test('should update items in virtualized container', () => {
            const items = Array(200).fill('item');
            virtualizer.virtualize(mockContainer, items);

            const newItems = Array(300).fill('newItem');
            virtualizer.updateItems(mockContainer, newItems);

            const virtualContainer = virtualizer.virtualizedContainers.get(mockContainer);
            expect(virtualContainer.items).toHaveLength(300);
        });

        test('should destroy virtualization', () => {
            const items = Array(200).fill('item');
            virtualizer.virtualize(mockContainer, items);

            virtualizer.destroy(mockContainer);

            expect(virtualizer.virtualizedContainers.has(mockContainer)).toBe(false);
            expect(mockContainer.style.height).toBe('');
        });
    });
});

describe('Integration Tests', () => {
    test('should work together in performance optimization scenario', () => {
        const optimizer = new PerformanceOptimizer();
        const fallbackManager = new AutomaticFallbackManager();
        const budgetEnforcer = new AutomatedPerformanceBudget({}, optimizer);
        const cache = new IntelligentCache();

        // Simulate poor performance metrics
        const poorMetrics = {
            frameRate: { average: 10 },
            renderTime: { average: 50 },
            memory: { used: 150 * 1024 * 1024, percentage: 85 },
            componentCount: 2000,
            domNodes: 8000
        };

        // Apply optimizations
        const optimizations = optimizer.optimize(poorMetrics);
        const fallbackMode = fallbackManager.evaluateAndApplyFallback(poorMetrics);
        const budgetResult = budgetEnforcer.enforceBudget(poorMetrics);

        // Verify coordinated response
        expect(optimizations.length).toBeGreaterThan(0);
        expect(fallbackMode).toBe('minimal');
        expect(budgetResult.violations.length).toBeGreaterThan(0);
        expect(budgetResult.actions.length).toBeGreaterThan(0);

        // Cache should be available for optimization data
        cache.set('optimizationState', {
            mode: fallbackMode,
            violations: budgetResult.violations,
            timestamp: performance.now()
        }, { tags: ['performance'], ttl: 60000 });

        expect(cache.get('optimizationState')).toBeDefined();
    });
});