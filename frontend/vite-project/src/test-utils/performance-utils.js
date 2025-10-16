import { vi } from 'vitest';

// Performance testing utilities
export class PerformanceTester {
    constructor() {
        this.measurements = new Map();
        this.observers = new Map();
    }

    // Measure render performance
    measureRenderTime(componentName, renderFn) {
        const startTime = performance.now();
        const result = renderFn();
        const endTime = performance.now();

        const renderTime = endTime - startTime;
        this.measurements.set(`${componentName}_render`, renderTime);

        return { result, renderTime };
    }

    // Measure memory usage
    measureMemoryUsage(testName, testFn) {
        const initialMemory = this.getMemoryUsage();
        const result = testFn();
        const finalMemory = this.getMemoryUsage();

        const memoryDelta = finalMemory - initialMemory;
        this.measurements.set(`${testName}_memory`, memoryDelta);

        return { result, memoryDelta };
    }

    // Get current memory usage (mock for testing)
    getMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize;
        }
        // Mock memory usage for testing
        return Math.random() * 50000000; // 50MB max
    }

    // Measure frame rate during animations
    measureFrameRate(duration = 1000) {
        return new Promise((resolve) => {
            let frameCount = 0;
            const startTime = performance.now();

            const countFrame = () => {
                frameCount++;
                const currentTime = performance.now();

                if (currentTime - startTime < duration) {
                    requestAnimationFrame(countFrame);
                } else {
                    const fps = (frameCount * 1000) / (currentTime - startTime);
                    resolve(fps);
                }
            };

            requestAnimationFrame(countFrame);
        });
    }

    // Measure component update performance
    measureUpdatePerformance(component, updates) {
        const times = [];

        updates.forEach((update, index) => {
            const startTime = performance.now();
            component.rerender(update);
            const endTime = performance.now();

            times.push(endTime - startTime);
        });

        return {
            average: times.reduce((sum, time) => sum + time, 0) / times.length,
            min: Math.min(...times),
            max: Math.max(...times),
            times
        };
    }

    // Test for memory leaks
    async testMemoryLeaks(testFn, iterations = 10) {
        const memoryReadings = [];

        for (let i = 0; i < iterations; i++) {
            const initialMemory = this.getMemoryUsage();
            await testFn();

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }

            const finalMemory = this.getMemoryUsage();
            memoryReadings.push(finalMemory - initialMemory);
        }

        // Check if memory usage is consistently increasing
        const trend = this.calculateTrend(memoryReadings);
        const hasLeak = trend > 0.1; // Threshold for memory leak detection

        return {
            hasLeak,
            trend,
            readings: memoryReadings,
            averageIncrease: memoryReadings.reduce((sum, reading) => sum + reading, 0) / memoryReadings.length
        };
    }

    // Calculate trend in memory usage
    calculateTrend(values) {
        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
        const sumXX = values.reduce((sum, val, index) => sum + (index * index), 0);

        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }

    // Performance assertions
    assertRenderTime(componentName, maxTime = 16) {
        const renderTime = this.measurements.get(`${componentName}_render`);
        if (renderTime > maxTime) {
            throw new Error(`Render time ${renderTime}ms exceeds maximum ${maxTime}ms for ${componentName}`);
        }
    }

    assertMemoryUsage(testName, maxMemory = 10000000) { // 10MB
        const memoryUsage = this.measurements.get(`${testName}_memory`);
        if (memoryUsage > maxMemory) {
            throw new Error(`Memory usage ${memoryUsage} bytes exceeds maximum ${maxMemory} bytes for ${testName}`);
        }
    }

    assertFrameRate(fps, minFps = 30) {
        if (fps < minFps) {
            throw new Error(`Frame rate ${fps} FPS is below minimum ${minFps} FPS`);
        }
    }

    // Get all measurements
    getMeasurements() {
        return Object.fromEntries(this.measurements);
    }

    // Clear measurements
    clear() {
        this.measurements.clear();
    }
}

// Mock performance observer for testing
export class MockPerformanceObserver {
    constructor(callback) {
        this.callback = callback;
        this.entries = [];
    }

    observe(options) {
        // Mock observation
        setTimeout(() => {
            const mockEntries = this.generateMockEntries(options.entryTypes);
            this.callback({ getEntries: () => mockEntries });
        }, 100);
    }

    disconnect() {
        // Mock disconnect
    }

    generateMockEntries(entryTypes) {
        const entries = [];

        entryTypes.forEach(type => {
            switch (type) {
                case 'measure':
                    entries.push({
                        name: 'test-measure',
                        entryType: 'measure',
                        startTime: 0,
                        duration: Math.random() * 100
                    });
                    break;
                case 'navigation':
                    entries.push({
                        name: 'navigation',
                        entryType: 'navigation',
                        startTime: 0,
                        duration: Math.random() * 1000,
                        loadEventEnd: Math.random() * 2000
                    });
                    break;
                case 'paint':
                    entries.push({
                        name: 'first-paint',
                        entryType: 'paint',
                        startTime: Math.random() * 500
                    });
                    break;
            }
        });

        return entries;
    }
}

// Performance test helpers
export const performanceHelpers = {
    // Test component rendering performance
    testRenderPerformance: async (Component, props, iterations = 100) => {
        const tester = new PerformanceTester();
        const times = [];

        for (let i = 0; i < iterations; i++) {
            const { renderTime } = tester.measureRenderTime(`test-${i}`, () => {
                return Component(props);
            });
            times.push(renderTime);
        }

        return {
            average: times.reduce((sum, time) => sum + time, 0) / times.length,
            min: Math.min(...times),
            max: Math.max(...times),
            p95: times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)]
        };
    },

    // Test large dataset rendering
    testLargeDatasetPerformance: (Component, dataSize = 10000) => {
        const tester = new PerformanceTester();
        const largeDataset = Array.from({ length: dataSize }, (_, i) => ({
            id: i,
            value: Math.random() * 100,
            label: `Item ${i}`
        }));

        return tester.measureRenderTime('large-dataset', () => {
            return Component({ data: largeDataset });
        });
    },

    // Test animation performance
    testAnimationPerformance: async (animationFn, duration = 1000) => {
        const tester = new PerformanceTester();

        animationFn(); // Start animation
        const fps = await tester.measureFrameRate(duration);

        return { fps };
    },

    // Mock performance.now for consistent testing
    mockPerformanceNow: () => {
        let mockTime = 0;
        vi.spyOn(performance, 'now').mockImplementation(() => {
            mockTime += 16.67; // 60 FPS
            return mockTime;
        });
        return () => mockTime;
    }
};

// Performance test matchers
export const performanceMatchers = {
    toRenderWithinTime: (received, maxTime) => {
        const pass = received <= maxTime;
        return {
            message: () => `expected render time ${received}ms to be within ${maxTime}ms`,
            pass
        };
    },

    toMaintainFrameRate: (received, minFps) => {
        const pass = received >= minFps;
        return {
            message: () => `expected frame rate ${received} FPS to be at least ${minFps} FPS`,
            pass
        };
    },

    toNotLeakMemory: (received) => {
        const pass = !received.hasLeak;
        return {
            message: () => `expected component to not leak memory (trend: ${received.trend})`,
            pass
        };
    }
};

export default PerformanceTester;