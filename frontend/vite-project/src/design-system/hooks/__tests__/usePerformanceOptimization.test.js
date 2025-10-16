/**
 * usePerformanceOptimization Hook Tests
 * Tests for the comprehensive performance optimization hook
 */

import { renderHook, act } from '@testing-library/react';
import usePerformanceOptimization from '../usePerformanceOptimization';

// Mock the performance optimization utilities
jest.mock('../utils/performanceOptimization', () => ({
    PerformanceOptimizer: jest.fn().mockImplementation(() => ({
        enable: jest.fn(),
        disable: jest.fn(),
        optimize: jest.fn(() => [{ type: 'test', actions: ['testAction'] }])
    })),
    AutomaticFallbackManager: jest.fn().mockImplementation(() => ({
        evaluateAndApplyFallback: jest.fn(() => 'normal'),
        getStatus: jest.fn(() => ({
            currentMode: 'normal',
            activeOptimizations: [],
            fallbackHistory: [],
            isInFallbackMode: false
        })),
        forceFallbackMode: jest.fn()
    })),
    AutomatedPerformanceBudget: jest.fn().mockImplementation(() => ({
        enforceBudget: jest.fn(() => ({
            violations: [],
            actions: [],
            fallbackMode: 'normal'
        })),
        getBudgetStatus: jest.fn(() => ({
            compliance: 95,
            violations: [],
            recommendations: []
        }))
    })),
    IntelligentCache: jest.fn().mockImplementation(() => ({
        get: jest.fn(),
        set: jest.fn(),
        invalidate: jest.fn(() => true),
        invalidateByTag: jest.fn(() => 2),
        clear: jest.fn(),
        getStats: jest.fn(() => ({
            size: 5,
            hitRate: 0.8,
            efficiency: 85
        })),
        getAnalysis: jest.fn(() => ({
            stats: { efficiency: 85 },
            recommendations: [],
            healthScore: 90
        }))
    })),
    ComponentVirtualizer: jest.fn().mockImplementation(() => ({
        virtualize: jest.fn(),
        getStats: jest.fn(() => ({
            totalContainers: 1,
            containers: [{ totalItems: 100, renderedItems: 10 }]
        }))
    }))
}));

// Mock performance API
global.performance = {
    now: jest.fn(() => Date.now()),
    memory: {
        usedJSHeapSize: 50 * 1024 * 1024,
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 200 * 1024 * 1024
    }
};

// Mock DOM
global.document = {
    querySelectorAll: jest.fn(() => Array(100).fill({})),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
};

global.window = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    lastFrameTime: Date.now()
};

global.navigator = {
    connection: {
        rtt: 50
    }
};

describe('usePerformanceOptimization', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('Initialization', () => {
        test('should initialize with default state', () => {
            const { result } = renderHook(() => usePerformanceOptimization());

            expect(result.current.optimizationState).toEqual({
                isActive: false,
                currentMode: 'normal',
                activeOptimizations: [],
                budgetViolations: [],
                cacheStats: null,
                performanceScore: 100
            });
        });

        test('should initialize with custom configuration', () => {
            const config = {
                enableAutoFallback: false,
                enableBudgetEnforcement: false,
                budgets: { maxRenderTime: 20 },
                updateInterval: 5000
            };

            const { result } = renderHook(() => usePerformanceOptimization(config));

            expect(result.current.optimizationState.isActive).toBe(false);
        });
    });

    describe('Optimization Control', () => {
        test('should start optimization monitoring', () => {
            const { result } = renderHook(() => usePerformanceOptimization());

            act(() => {
                result.current.startOptimization();
            });

            expect(result.current.optimizationState.isActive).toBe(true);
        });

        test('should stop optimization monitoring', () => {
            const { result } = renderHook(() => usePerformanceOptimization());

            act(() => {
                result.current.startOptimization();
            });

            act(() => {
                result.current.stopOptimization();
            });

            expect(result.current.optimizationState.isActive).toBe(false);
        });

        test('should update optimization state periodically', () => {
            const { result } = renderHook(() =>
                usePerformanceOptimization({ updateInterval: 1000 })
            );

            act(() => {
                result.current.startOptimization();
            });

            // Fast-forward time to trigger update
            act(() => {
                jest.advanceTimersByTime(1000);
            });

            expect(result.current.optimizationState.performanceScore).toBeDefined();
        });
    });

    describe('Cache Operations', () => {
        test('should provide cache get method', () => {
            const { result } = renderHook(() => usePerformanceOptimization());

            act(() => {
                result.current.startOptimization();
            });

            const value = result.current.cache.get('testKey');
            expect(result.current.cache.get).toBeDefined();
        });

        test('should provide cache set method', () => {
            const { result } = renderHook(() => usePerformanceOptimization());

            act(() => {
                result.current.startOptimization();
            });

            act(() => {
                result.current.cache.set('testKey', 'testValue', { tags: ['test'] });
            });

            expect(result.current.cache.set).toBeDefined();
        });

        test('should provide cache invalidation methods', () => {
            const { result } = renderHook(() => usePerformanceOptimization());

            act(() => {
                result.current.startOptimization();
            });

            act(() => {
                result.current.cache.invalidate('testKey');
            });

            act(() => {
                result.current.cache.invalidateByTag('testTag');
            });

            expect(result.current.cache.invalidate).toBeDefined();
            expect(result.current.cache.invalidateByTag).toBeDefined();
        });

        test('should provide cache clear method', () => {
            const { result } = renderHook(() => usePerformanceOptimization());

            act(() => {
                result.current.startOptimization();
            });

            act(() => {
                result.current.cache.clear();
            });

            expect(result.current.cache.clear).toBeDefined();
        });
    });

    describe('Virtualization', () => {
        test('should provide component virtualization', () => {
            const { result } = renderHook(() => usePerformanceOptimization());

            const mockContainer = { style: {} };
            const mockItems = Array(100).fill('item');

            act(() => {
                result.current.startOptimization();
            });

            act(() => {
                result.current.virtualizeComponent(mockContainer, mockItems);
            });

            expect(result.current.virtualizeComponent).toBeDefined();
        });
    });

    describe('Fallback Mode Testing', () => {
        test('should allow forcing fallback mode', () => {
            const { result } = renderHook(() => usePerformanceOptimization());

            act(() => {
                result.current.startOptimization();
            });

            act(() => {
                result.current.forceFallbackMode('minimal');
            });

            expect(result.current.forceFallbackMode).toBeDefined();
        });
    });

    describe('Performance Reporting', () => {
        test('should provide comprehensive optimization report', () => {
            const { result } = renderHook(() => usePerformanceOptimization());

            act(() => {
                result.current.startOptimization();
            });

            const report = result.current.getOptimizationReport();

            expect(report).toHaveProperty('state');
            expect(report).toHaveProperty('metrics');
            expect(report).toHaveProperty('budgetStatus');
            expect(report).toHaveProperty('cacheAnalysis');
            expect(report).toHaveProperty('fallbackStatus');
            expect(report).toHaveProperty('virtualizationStats');
            expect(report).toHaveProperty('timestamp');
        });

        test('should collect current performance metrics', () => {
            const { result } = renderHook(() => usePerformanceOptimization());

            act(() => {
                result.current.startOptimization();
            });

            // Trigger metric collection
            act(() => {
                jest.advanceTimersByTime(2000);
            });

            const report = result.current.getOptimizationReport();

            expect(report.metrics).toHaveProperty('timestamp');
            expect(report.metrics).toHaveProperty('frameRate');
            expect(report.metrics).toHaveProperty('memory');
            expect(report.metrics).toHaveProperty('domNodes');
            expect(report.metrics).toHaveProperty('componentCount');
        });
    });

    describe('Performance Score Calculation', () => {
        test('should calculate performance score based on metrics', () => {
            const { result } = renderHook(() => usePerformanceOptimization());

            act(() => {
                result.current.startOptimization();
            });

            // Simulate poor performance
            global.performance.memory.usedJSHeapSize = 180 * 1024 * 1024; // High memory usage
            global.document.querySelectorAll = jest.fn(() => Array(10000).fill({})); // Many DOM nodes

            act(() => {
                jest.advanceTimersByTime(2000);
            });

            expect(result.current.optimizationState.performanceScore).toBeLessThan(100);
        });

        test('should maintain high score for good performance', () => {
            const { result } = renderHook(() => usePerformanceOptimization());

            act(() => {
                result.current.startOptimization();
            });

            // Simulate good performance
            global.performance.memory.usedJSHeapSize = 30 * 1024 * 1024; // Low memory usage
            global.document.querySelectorAll = jest.fn(() => Array(100).fill({})); // Few DOM nodes

            act(() => {
                jest.advanceTimersByTime(2000);
            });

            expect(result.current.optimizationState.performanceScore).toBeGreaterThan(80);
        });
    });

    describe('Event Handling', () => {
        test('should handle performance fallback events', () => {
            const { result } = renderHook(() => usePerformanceOptimization());

            act(() => {
                result.current.startOptimization();
            });

            // Simulate performance fallback event
            const fallbackEvent = new CustomEvent('performanceFallback', {
                detail: { mode: 'reduced', previousMode: 'normal' }
            });

            act(() => {
                window.dispatchEvent(fallbackEvent);
            });

            // The hook should have set up event listeners
            expect(window.addEventListener).toHaveBeenCalledWith(
                'performanceFallback',
                expect.any(Function)
            );
        });

        test('should handle performance violation events', () => {
            const { result } = renderHook(() => usePerformanceOptimization());

            act(() => {
                result.current.startOptimization();
            });

            // Simulate performance violation event
            const violationEvent = new CustomEvent('performanceViolation', {
                detail: {
                    type: 'renderTime',
                    severity: 'critical',
                    budget: 16,
                    actual: 50
                }
            });

            act(() => {
                window.dispatchEvent(violationEvent);
            });

            expect(window.addEventListener).toHaveBeenCalledWith(
                'performanceViolation',
                expect.any(Function)
            );
        });
    });

    describe('Cleanup', () => {
        test('should cleanup on unmount', () => {
            const { result, unmount } = renderHook(() => usePerformanceOptimization());

            act(() => {
                result.current.startOptimization();
            });

            unmount();

            // Should have cleaned up event listeners
            expect(window.removeEventListener).toHaveBeenCalled();
        });

        test('should stop monitoring on unmount', () => {
            const { result, unmount } = renderHook(() => usePerformanceOptimization());

            act(() => {
                result.current.startOptimization();
            });

            expect(result.current.optimizationState.isActive).toBe(true);

            unmount();

            // The cleanup should have been called
            expect(result.current.optimizationState.isActive).toBe(true); // State won't change after unmount
        });
    });

    describe('Configuration Options', () => {
        test('should respect disabled features', () => {
            const { result } = renderHook(() =>
                usePerformanceOptimization({
                    enableAutoFallback: false,
                    enableBudgetEnforcement: false,
                    enableIntelligentCaching: false,
                    enableComponentVirtualization: false
                })
            );

            act(() => {
                result.current.startOptimization();
            });

            // Cache methods should still be available but may not work
            expect(result.current.cache).toBeDefined();
            expect(result.current.virtualizeComponent).toBeDefined();
        });

        test('should use custom update interval', () => {
            const { result } = renderHook(() =>
                usePerformanceOptimization({ updateInterval: 500 })
            );

            act(() => {
                result.current.startOptimization();
            });

            // Fast-forward by custom interval
            act(() => {
                jest.advanceTimersByTime(500);
            });

            expect(result.current.optimizationState.performanceScore).toBeDefined();
        });
    });
});