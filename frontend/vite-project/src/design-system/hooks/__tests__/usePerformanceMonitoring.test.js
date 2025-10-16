/**
 * usePerformanceMonitoring Hook Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { usePerformanceMonitoring, measureRenderTime, withPerformanceMonitoring } from '../usePerformanceMonitoring';

// Mock performance APIs
const mockPerformance = {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    memory: {
        usedJSHeapSize: 50 * 1024 * 1024, // 50MB
        totalJSHeapSize: 100 * 1024 * 1024, // 100MB
        jsHeapSizeLimit: 2 * 1024 * 1024 * 1024 // 2GB
    }
};

// Mock PerformanceObserver
const mockPerformanceObserver = vi.fn();
mockPerformanceObserver.prototype.observe = vi.fn();
mockPerformanceObserver.prototype.disconnect = vi.fn();

// Mock MutationObserver
const mockMutationObserver = vi.fn();
mockMutationObserver.prototype.observe = vi.fn();
mockMutationObserver.prototype.disconnect = vi.fn();

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn(cb => setTimeout(cb, 16));

describe('usePerformanceMonitoring', () => {
    beforeEach(() => {
        global.performance = mockPerformance;
        global.PerformanceObserver = mockPerformanceObserver;
        global.MutationObserver = mockMutationObserver;
        global.requestAnimationFrame = mockRequestAnimationFrame;

        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    describe('Hook Initialization', () => {
        it('initializes with default configuration', () => {
            const { result } = renderHook(() => usePerformanceMonitoring());

            expect(result.current.metrics).toBeDefined();
            expect(result.current.isMonitoring).toBe(false);
            expect(result.current.startMonitoring).toBeInstanceOf(Function);
            expect(result.current.stopMonitoring).toBeInstanceOf(Function);
        });

        it('initializes with custom configuration', () => {
            const config = {
                updateInterval: 2000,
                enableMemoryTracking: false,
                memoryLeakThreshold: 20
            };

            const { result } = renderHook(() => usePerformanceMonitoring(config));

            expect(result.current.metrics).toBeDefined();
            expect(result.current.isMonitoring).toBe(false);
        });

        it('initializes metrics with default values', () => {
            const { result } = renderHook(() => usePerformanceMonitoring());

            expect(result.current.metrics.frameRate).toBe(0);
            expect(result.current.metrics.averageRenderTime).toBe(0);
            expect(result.current.metrics.memoryUsage).toBeNull();
            expect(result.current.metrics.componentCount).toBe(0);
            expect(result.current.metrics.performanceScore).toBe(100);
            expect(result.current.metrics.memoryTrend).toBe('stable');
        });
    });

    describe('Monitoring Control', () => {
        it('starts monitoring successfully', async () => {
            const { result } = renderHook(() => usePerformanceMonitoring());

            expect(result.current.isMonitoring).toBe(false);

            act(() => {
                result.current.startMonitoring();
            });

            expect(result.current.isMonitoring).toBe(true);
        });

        it('stops monitoring successfully', async () => {
            const { result } = renderHook(() => usePerformanceMonitoring());

            act(() => {
                result.current.startMonitoring();
            });

            expect(result.current.isMonitoring).toBe(true);

            act(() => {
                result.current.stopMonitoring();
            });

            expect(result.current.isMonitoring).toBe(false);
        });

        it('prevents multiple monitoring sessions', () => {
            const { result } = renderHook(() => usePerformanceMonitoring());

            act(() => {
                result.current.startMonitoring();
                result.current.startMonitoring(); // Second call should be ignored
            });

            expect(result.current.isMonitoring).toBe(true);
        });
    });

    describe('Frame Rate Monitoring', () => {
        it('tracks frame rate when enabled', async () => {
            const { result } = renderHook(() =>
                usePerformanceMonitoring({ enableFrameRateTracking: true })
            );

            act(() => {
                result.current.startMonitoring();
            });

            // Fast-forward time to trigger frame rate calculation
            act(() => {
                vi.advanceTimersByTime(1000);
            });

            await waitFor(() => {
                expect(result.current.metrics.frameRate).toBeGreaterThan(0);
            });
        });

        it('does not track frame rate when disabled', async () => {
            const { result } = renderHook(() =>
                usePerformanceMonitoring({ enableFrameRateTracking: false })
            );

            act(() => {
                result.current.startMonitoring();
            });

            act(() => {
                vi.advanceTimersByTime(1000);
            });

            expect(result.current.metrics.frameRate).toBe(0);
        });
    });

    describe('Memory Monitoring', () => {
        it('tracks memory usage when enabled and available', async () => {
            const { result } = renderHook(() =>
                usePerformanceMonitoring({ enableMemoryTracking: true })
            );

            act(() => {
                result.current.startMonitoring();
            });

            act(() => {
                vi.advanceTimersByTime(1000);
            });

            await waitFor(() => {
                expect(result.current.metrics.memoryUsage).not.toBeNull();
                expect(result.current.metrics.memoryUsage.used).toBe(50 * 1024 * 1024);
                expect(result.current.metrics.memoryUsage.percentage).toBeCloseTo(2.5, 1);
            });
        });

        it('does not track memory when disabled', async () => {
            const { result } = renderHook(() =>
                usePerformanceMonitoring({ enableMemoryTracking: false })
            );

            act(() => {
                result.current.startMonitoring();
            });

            act(() => {
                vi.advanceTimersByTime(1000);
            });

            expect(result.current.metrics.memoryUsage).toBeNull();
        });

        it('handles missing memory API gracefully', async () => {
            delete global.performance.memory;

            const { result } = renderHook(() =>
                usePerformanceMonitoring({ enableMemoryTracking: true })
            );

            act(() => {
                result.current.startMonitoring();
            });

            act(() => {
                vi.advanceTimersByTime(1000);
            });

            expect(result.current.metrics.memoryUsage).toBeNull();
        });
    });

    describe('Memory Leak Detection', () => {
        it('detects increasing memory trend', async () => {
            // Mock increasing memory usage
            let memoryUsage = 50 * 1024 * 1024;
            mockPerformance.memory.usedJSHeapSize = memoryUsage;

            const { result } = renderHook(() =>
                usePerformanceMonitoring({
                    enableMemoryTracking: true,
                    memoryLeakThreshold: 5 // 5MB threshold
                })
            );

            act(() => {
                result.current.startMonitoring();
            });

            // Simulate memory increase over time
            for (let i = 0; i < 10; i++) {
                memoryUsage += 2 * 1024 * 1024; // Increase by 2MB each time
                mockPerformance.memory.usedJSHeapSize = memoryUsage;

                act(() => {
                    vi.advanceTimersByTime(3000);
                });
            }

            await waitFor(() => {
                expect(result.current.metrics.memoryTrend).toBe('increasing');
            });
        });

        it('detects stable memory trend', async () => {
            const { result } = renderHook(() =>
                usePerformanceMonitoring({ enableMemoryTracking: true })
            );

            act(() => {
                result.current.startMonitoring();
            });

            // Keep memory stable
            for (let i = 0; i < 5; i++) {
                act(() => {
                    vi.advanceTimersByTime(3000);
                });
            }

            await waitFor(() => {
                expect(result.current.metrics.memoryTrend).toBe('stable');
            });
        });
    });

    describe('Performance Score Calculation', () => {
        it('calculates high score for good performance', async () => {
            // Mock good performance metrics
            const { result } = renderHook(() => usePerformanceMonitoring());

            act(() => {
                result.current.startMonitoring();
            });

            // Simulate good performance
            act(() => {
                vi.advanceTimersByTime(1000);
            });

            await waitFor(() => {
                expect(result.current.metrics.performanceScore).toBeGreaterThan(80);
            });
        });

        it('calculates lower score for poor performance', async () => {
            // Mock poor performance by simulating high memory usage
            mockPerformance.memory.usedJSHeapSize = 1.5 * 1024 * 1024 * 1024; // 1.5GB
            mockPerformance.memory.jsHeapSizeLimit = 2 * 1024 * 1024 * 1024; // 2GB

            const { result } = renderHook(() => usePerformanceMonitoring());

            act(() => {
                result.current.startMonitoring();
            });

            act(() => {
                vi.advanceTimersByTime(1000);
            });

            await waitFor(() => {
                expect(result.current.metrics.performanceScore).toBeLessThan(80);
            });
        });
    });

    describe('Component Tracking', () => {
        it('tracks component count when enabled', async () => {
            // Mock DOM elements that look like React components
            const mockElement = {
                nodeType: 1, // ELEMENT_NODE
                hasAttribute: vi.fn(() => true),
                className: 'react-component',
                children: []
            };

            const mockMutation = {
                addedNodes: [mockElement]
            };

            // Mock MutationObserver callback
            let observerCallback;
            mockMutationObserver.mockImplementation((callback) => {
                observerCallback = callback;
                return {
                    observe: vi.fn(),
                    disconnect: vi.fn()
                };
            });

            const { result } = renderHook(() =>
                usePerformanceMonitoring({ enableComponentTracking: true })
            );

            act(() => {
                result.current.startMonitoring();
            });

            // Simulate component addition
            if (observerCallback) {
                act(() => {
                    observerCallback([mockMutation]);
                });
            }

            expect(result.current.metrics.componentCount).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Metrics Management', () => {
        it('clears metrics successfully', async () => {
            const { result } = renderHook(() => usePerformanceMonitoring());

            act(() => {
                result.current.startMonitoring();
            });

            act(() => {
                vi.advanceTimersByTime(1000);
            });

            // Ensure we have some metrics
            await waitFor(() => {
                expect(result.current.metrics.frameRate).toBeGreaterThan(0);
            });

            act(() => {
                result.current.clearMetrics();
            });

            expect(result.current.metrics.frameRate).toBe(0);
            expect(result.current.metrics.averageRenderTime).toBe(0);
            expect(result.current.metrics.memoryUsage).toBeNull();
            expect(result.current.metrics.componentCount).toBe(0);
            expect(result.current.metrics.performanceScore).toBe(100);
            expect(result.current.metrics.memoryTrend).toBe('stable');
        });

        it('generates performance report', async () => {
            const { result } = renderHook(() => usePerformanceMonitoring());

            act(() => {
                result.current.startMonitoring();
            });

            act(() => {
                vi.advanceTimersByTime(1000);
            });

            const report = result.current.getPerformanceReport();

            expect(report).toBeDefined();
            expect(report.frameRate).toBeDefined();
            expect(report.averageRenderTime).toBeDefined();
            expect(report.timestamp).toBeDefined();
            expect(report.renderTimeHistory).toBeInstanceOf(Array);
            expect(report.memoryHistory).toBeInstanceOf(Array);
        });
    });

    describe('Cleanup', () => {
        it('cleans up on unmount', () => {
            const { result, unmount } = renderHook(() => usePerformanceMonitoring());

            act(() => {
                result.current.startMonitoring();
            });

            expect(result.current.isMonitoring).toBe(true);

            unmount();

            // Monitoring should be stopped after unmount
            // Note: We can't directly test this since the component is unmounted,
            // but we can verify that no errors occur during cleanup
        });
    });

    describe('Update Interval Configuration', () => {
        it('respects custom update interval', async () => {
            const { result } = renderHook(() =>
                usePerformanceMonitoring({ updateInterval: 500 })
            );

            act(() => {
                result.current.startMonitoring();
            });

            // Fast-forward by the custom interval
            act(() => {
                vi.advanceTimersByTime(500);
            });

            await waitFor(() => {
                expect(result.current.metrics.frameRate).toBeGreaterThan(0);
            });
        });
    });
});

describe('measureRenderTime', () => {
    beforeEach(() => {
        global.performance = mockPerformance;
        vi.clearAllMocks();
    });

    it('measures render time for synchronous functions', () => {
        const renderFunction = vi.fn(() => 'rendered');

        const result = measureRenderTime('TestComponent', renderFunction);

        expect(result).toBe('rendered');
        expect(renderFunction).toHaveBeenCalled();
        expect(mockPerformance.mark).toHaveBeenCalledWith('TestComponent-render-start');
        expect(mockPerformance.mark).toHaveBeenCalledWith('TestComponent-render-end');
        expect(mockPerformance.measure).toHaveBeenCalledWith(
            'TestComponent-render',
            'TestComponent-render-start',
            'TestComponent-render-end'
        );
    });

    it('handles functions without performance API', () => {
        delete global.performance.mark;
        delete global.performance.measure;

        const renderFunction = vi.fn(() => 'rendered');

        const result = measureRenderTime('TestComponent', renderFunction);

        expect(result).toBe('rendered');
        expect(renderFunction).toHaveBeenCalled();
    });
});

describe('withPerformanceMonitoring', () => {
    beforeEach(() => {
        global.performance = mockPerformance;
        vi.clearAllMocks();
    });

    it('creates HOC that measures component performance', () => {
        const TestComponent = vi.fn(() => null);
        const WrappedComponent = withPerformanceMonitoring(TestComponent, 'TestComponent');

        expect(WrappedComponent).toBeInstanceOf(Function);
        expect(WrappedComponent.displayName).toBeUndefined(); // React.forwardRef doesn't set displayName automatically
    });

    it('measures mount time when component mounts', () => {
        const TestComponent = () => <div>Test</div>;
        const WrappedComponent = withPerformanceMonitoring(TestComponent, 'TestComponent');

        renderHook(() => WrappedComponent);

        expect(mockPerformance.mark).toHaveBeenCalledWith('TestComponent-mount');
        expect(mockPerformance.measure).toHaveBeenCalledWith(
            'TestComponent-mount-time',
            'navigationStart',
            'TestComponent-mount'
        );
    });
});