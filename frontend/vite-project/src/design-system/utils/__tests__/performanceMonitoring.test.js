/**
 * Performance Monitoring Utilities Tests
 */

import {
    PerformanceMonitor,
    MemoryLeakDetector,
    PerformanceBudget,
    getGlobalPerformanceMonitor
} from '../performanceMonitoring';

// Mock performance APIs
const mockPerformance = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    memory: {
        usedJSHeapSize: 50 * 1024 * 1024, // 50MB
        totalJSHeapSize: 100 * 1024 * 1024, // 100MB
        usedJSHeapSize: 50 * 1024 * 1024, // 50MB
        totalJSHeapSize: 100 * 1024 * 1024, // 100MB
        jsHeapSizeLimit: 2 * 1024 * 1024 * 1024 // 2GB
    }
};

// Mock PerformanceObserver
const mockPerformanceObserver = jest.fn();
mockPerformanceObserver.prototype.observe = jest.fn();
mockPerformanceObserver.prototype.disconnect = jest.fn();

// Mock requestAnimationFrame
const mockRequestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));

describe('PerformanceMonitor', () => {
    let monitor;

    beforeEach(() => {
        global.performance = mockPerformance;
        global.PerformanceObserver = mockPerformanceObserver;
        global.requestAnimationFrame = mockRequestAnimationFrame;

        monitor = new PerformanceMonitor({
            enableFrameRateTracking: true,
            enableMemoryTracking: true,
            enableRenderTimeTracking: true
        });

        vi.clearAllMocks();
    });

    afterEach(() => {
        if (monitor) {
            monitor.stop();
        }
        vi.restoreAllMocks();
    });

    describe('Initialization', () => {
        it('creates monitor with default configuration', () => {
            const defaultMonitor = new PerformanceMonitor();

            expect(defaultMonitor.config.enableFrameRateTracking).toBe(true);
            expect(defaultMonitor.config.enableMemoryTracking).toBe(true);
            expect(defaultMonitor.config.maxHistorySize).toBe(1000);
        });

        it('creates monitor with custom configuration', () => {
            const customMonitor = new PerformanceMonitor({
                maxHistorySize: 500,
                alertThresholds: {
                    frameRate: { warning: 25, critical: 10 }
                }
            });

            expect(customMonitor.config.maxHistorySize).toBe(500);
            expect(customMonitor.config.alertThresholds.frameRate.warning).toBe(25);
        });
    });

    describe('Monitoring Control', () => {
        it('starts monitoring successfully', () => {
            expect(monitor.isMonitoring).toBe(false);

            monitor.start();

            expect(monitor.isMonitoring).toBe(true);
            expect(monitor.startTime).toBeDefined();
        });

        it('stops monitoring successfully', () => {
            monitor.start();
            expect(monitor.isMonitoring).toBe(true);

            monitor.stop();

            expect(monitor.isMonitoring).toBe(false);
        });

        it('does not start monitoring twice', () => {
            monitor.start();
            const firstStartTime = monitor.startTime;

            monitor.start(); // Second call should be ignored

            expect(monitor.startTime).toBe(firstStartTime);
        });
    });

    describe('Metrics Recording', () => {
        beforeEach(() => {
            monitor.start();
        });

        it('records frame rate metrics', () => {
            monitor.recordMetric('frameRate', {
                timestamp: performance.now(),
                value: 60,
                deltaTime: 16.67
            });

            expect(monitor.metrics.frameRate).toHaveLength(1);
            expect(monitor.metrics.frameRate[0].value).toBe(60);
        });

        it('records memory usage metrics', () => {
            monitor.recordMetric('memoryUsage', {
                timestamp: performance.now(),
                used: 50 * 1024 * 1024,
                percentage: 2.5
            });

            expect(monitor.metrics.memoryUsage).toHaveLength(1);
            expect(monitor.metrics.memoryUsage[0].used).toBe(50 * 1024 * 1024);
        });

        it('maintains history size limit', () => {
            const smallMonitor = new PerformanceMonitor({ maxHistorySize: 3 });
            smallMonitor.start();

            // Add more metrics than the limit
            for (let i = 0; i < 5; i++) {
                smallMonitor.recordMetric('frameRate', {
                    timestamp: performance.now(),
                    value: 60 + i
                });
            }

            expect(smallMonitor.metrics.frameRate).toHaveLength(3);
            expect(smallMonitor.metrics.frameRate[0].value).toBe(62); // First two should be removed
        });
    });

    describe('Alert System', () => {
        beforeEach(() => {
            monitor.start();
        });

        it('generates frame rate alerts', () => {
            // Add low frame rate metrics
            for (let i = 0; i < 3; i++) {
                monitor.recordMetric('frameRate', {
                    timestamp: performance.now() - (i * 1000),
                    value: 20 // Below warning threshold
                });
            }

            monitor.checkAlerts();

            expect(monitor.alerts).toHaveLength(1);
            expect(monitor.alerts[0].id).toBe('low-frame-rate');
            expect(monitor.alerts[0].severity).toBe('warning');
        });

        it('generates critical frame rate alerts', () => {
            // Add critically low frame rate metrics
            for (let i = 0; i < 3; i++) {
                monitor.recordMetric('frameRate', {
                    timestamp: performance.now() - (i * 1000),
                    value: 10 // Below critical threshold
                });
            }

            monitor.checkAlerts();

            expect(monitor.alerts).toHaveLength(1);
            expect(monitor.alerts[0].id).toBe('critical-frame-rate');
            expect(monitor.alerts[0].severity).toBe('critical');
        });

        it('generates memory usage alerts', () => {
            monitor.recordMetric('memoryUsage', {
                timestamp: performance.now(),
                used: 1.8 * 1024 * 1024 * 1024, // 1.8GB
                percentage: 90 // Above critical threshold
            });

            monitor.checkAlerts();

            expect(monitor.alerts).toHaveLength(1);
            expect(monitor.alerts[0].id).toBe('critical-memory');
            expect(monitor.alerts[0].severity).toBe('critical');
        });

        it('detects memory leaks', () => {
            const baseMemory = 50 * 1024 * 1024;
            const leakSize = 15 * 1024 * 1024; // 15MB increase

            // Simulate increasing memory usage over time
            for (let i = 0; i < 6; i++) {
                monitor.recordMetric('memoryUsage', {
                    timestamp: performance.now() - ((5 - i) * 2000),
                    used: baseMemory + (i * leakSize / 5),
                    percentage: 50
                });
            }

            monitor.checkAlerts();

            const memoryLeakAlert = monitor.alerts.find(alert => alert.id === 'memory-leak');
            expect(memoryLeakAlert).toBeDefined();
            expect(memoryLeakAlert.severity).toBe('warning');
        });
    });

    describe('Performance Summary', () => {
        beforeEach(() => {
            monitor.start();
        });

        it('generates performance summary', () => {
            // Add some test metrics
            monitor.recordMetric('frameRate', {
                timestamp: performance.now(),
                value: 60
            });

            monitor.recordMetric('memoryUsage', {
                timestamp: performance.now(),
                used: 50 * 1024 * 1024,
                percentage: 2.5
            });

            const summary = monitor.getPerformanceSummary();

            expect(summary.timestamp).toBeDefined();
            expect(summary.uptime).toBeGreaterThan(0);
            expect(summary.frameRate.current).toBe(60);
            expect(summary.memory.used).toBe(50 * 1024 * 1024);
            expect(summary.performanceScore).toBeGreaterThan(0);
        });

        it('calculates performance score correctly', () => {
            // Add good performance metrics
            monitor.recordMetric('frameRate', { timestamp: performance.now(), value: 60 });
            monitor.recordMetric('memoryUsage', {
                timestamp: performance.now(),
                used: 25 * 1024 * 1024,
                percentage: 25
            });
            monitor.recordMetric('renderTimes', { timestamp: performance.now(), duration: 12 });

            const score = monitor.calculatePerformanceScore();
            expect(score).toBeGreaterThan(90); // Should be high for good performance
        });

        it('penalizes poor performance in score', () => {
            // Add poor performance metrics
            monitor.recordMetric('frameRate', { timestamp: performance.now(), value: 20 });
            monitor.recordMetric('memoryUsage', {
                timestamp: performance.now(),
                used: 1.5 * 1024 * 1024 * 1024,
                percentage: 75
            });
            monitor.recordMetric('renderTimes', { timestamp: performance.now(), duration: 50 });

            const score = monitor.calculatePerformanceScore();
            expect(score).toBeLessThan(50); // Should be low for poor performance
        });
    });

    describe('Data Export and Management', () => {
        beforeEach(() => {
            monitor.start();
        });

        it('exports metrics data', () => {
            monitor.recordMetric('frameRate', {
                timestamp: performance.now(),
                value: 60
            });

            const exportData = monitor.exportMetrics();

            expect(exportData.config).toBeDefined();
            expect(exportData.metrics).toBeDefined();
            expect(exportData.summary).toBeDefined();
            expect(exportData.exportTime).toBeDefined();
        });

        it('clears metrics data', () => {
            monitor.recordMetric('frameRate', {
                timestamp: performance.now(),
                value: 60
            });

            expect(monitor.metrics.frameRate).toHaveLength(1);

            monitor.clearMetrics();

            expect(monitor.metrics.frameRate).toHaveLength(0);
            expect(monitor.alerts).toHaveLength(0);
        });
    });
});

describe('MemoryLeakDetector', () => {
    let detector;

    beforeEach(() => {
        global.performance = mockPerformance;
        detector = new MemoryLeakDetector({
            checkInterval: 1000,
            thresholdIncrease: 5 * 1024 * 1024 // 5MB
        });
        vi.clearAllMocks();
    });

    afterEach(() => {
        if (detector) {
            detector.stop();
        }
    });

    describe('Initialization', () => {
        it('creates detector with default configuration', () => {
            const defaultDetector = new MemoryLeakDetector();

            expect(defaultDetector.config.checkInterval).toBe(30000);
            expect(defaultDetector.config.thresholdIncrease).toBe(10 * 1024 * 1024);
        });
    });

    describe('Monitoring Control', () => {
        it('starts monitoring when memory API is available', () => {
            expect(detector.isMonitoring).toBe(false);

            detector.start();

            expect(detector.isMonitoring).toBe(true);
        });

        it('does not start monitoring without memory API', () => {
            delete global.performance.memory;

            detector.start();

            expect(detector.isMonitoring).toBe(false);
        });

        it('stops monitoring successfully', () => {
            detector.start();
            expect(detector.isMonitoring).toBe(true);

            detector.stop();

            expect(detector.isMonitoring).toBe(false);
        });
    });

    describe('Leak Detection', () => {
        it('detects memory leaks', () => {
            const baseMemory = 50 * 1024 * 1024;
            const leakSize = 10 * 1024 * 1024;

            // Simulate memory samples with increasing usage
            for (let i = 0; i < 5; i++) {
                detector.samples.push({
                    timestamp: Date.now() - ((4 - i) * 10000),
                    used: baseMemory + (i * leakSize / 4),
                    total: 100 * 1024 * 1024
                });
            }

            const result = detector.detectLeak();

            expect(result.hasLeak).toBe(true);
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.memoryIncrease).toBeGreaterThan(detector.config.thresholdIncrease);
        });

        it('does not detect leaks with stable memory', () => {
            const stableMemory = 50 * 1024 * 1024;

            // Simulate stable memory samples
            for (let i = 0; i < 5; i++) {
                detector.samples.push({
                    timestamp: Date.now() - ((4 - i) * 10000),
                    used: stableMemory + (Math.random() * 1024 * 1024), // Small random variation
                    total: 100 * 1024 * 1024
                });
            }

            const result = detector.detectLeak();

            expect(result.hasLeak).toBe(false);
        });

        it('calculates linear trend correctly', () => {
            const values = [10, 20, 30, 40, 50];
            const trend = detector.calculateLinearTrend(values);

            expect(trend).toBeGreaterThan(0); // Should be positive for increasing values
        });
    });
});

describe('PerformanceBudget', () => {
    let budget;

    beforeEach(() => {
        budget = new PerformanceBudget({
            maxRenderTime: 20,
            maxMemoryUsage: 50 * 1024 * 1024,
            minFrameRate: 40
        });
    });

    describe('Initialization', () => {
        it('creates budget with default values', () => {
            const defaultBudget = new PerformanceBudget();

            expect(defaultBudget.budgets.maxRenderTime).toBe(16);
            expect(defaultBudget.budgets.minFrameRate).toBe(30);
        });

        it('creates budget with custom values', () => {
            expect(budget.budgets.maxRenderTime).toBe(20);
            expect(budget.budgets.minFrameRate).toBe(40);
        });
    });

    describe('Budget Checking', () => {
        it('detects render time violations', () => {
            const metrics = {
                renderTime: { average: 25 } // Above budget of 20
            };

            const violations = budget.checkBudget(metrics);

            expect(violations).toHaveLength(1);
            expect(violations[0].type).toBe('renderTime');
            expect(violations[0].severity).toBe('warning');
        });

        it('detects memory usage violations', () => {
            const metrics = {
                memory: { used: 60 * 1024 * 1024 } // Above budget of 50MB
            };

            const violations = budget.checkBudget(metrics);

            expect(violations).toHaveLength(1);
            expect(violations[0].type).toBe('memoryUsage');
            expect(violations[0].severity).toBe('warning');
        });

        it('detects frame rate violations', () => {
            const metrics = {
                frameRate: { average: 35 } // Below budget of 40
            };

            const violations = budget.checkBudget(metrics);

            expect(violations).toHaveLength(1);
            expect(violations[0].type).toBe('frameRate');
            expect(violations[0].severity).toBe('warning');
        });

        it('detects critical violations', () => {
            const metrics = {
                renderTime: { average: 40 }, // 2x budget = critical
                memory: { used: 75 * 1024 * 1024 }, // 1.5x budget = critical
                frameRate: { average: 20 } // 0.5x budget = critical
            };

            const violations = budget.checkBudget(metrics);

            expect(violations).toHaveLength(3);
            expect(violations.every(v => v.severity === 'critical')).toBe(true);
        });

        it('returns no violations for good performance', () => {
            const metrics = {
                renderTime: { average: 15 },
                memory: { used: 40 * 1024 * 1024 },
                frameRate: { average: 50 }
            };

            const violations = budget.checkBudget(metrics);

            expect(violations).toHaveLength(0);
        });
    });

    describe('Budget Management', () => {
        it('sets individual budget values', () => {
            budget.setBudget('maxRenderTime', 25);

            expect(budget.budgets.maxRenderTime).toBe(25);
        });

        it('gets all budget values', () => {
            const budgets = budget.getBudgets();

            expect(budgets.maxRenderTime).toBe(20);
            expect(budgets.minFrameRate).toBe(40);
        });

        it('gets current violations', () => {
            const metrics = {
                renderTime: { average: 25 }
            };

            budget.checkBudget(metrics);
            const violations = budget.getViolations();

            expect(violations).toHaveLength(1);
        });
    });
});

describe('Global Performance Monitor', () => {
    it('returns singleton instance', () => {
        const monitor1 = getGlobalPerformanceMonitor();
        const monitor2 = getGlobalPerformanceMonitor();

        expect(monitor1).toBe(monitor2);
    });

    it('creates new instance on first call', () => {
        const monitor = getGlobalPerformanceMonitor();

        expect(monitor).toBeInstanceOf(PerformanceMonitor);
    });
});

describe('Performance Measurement Decorator', () => {
    it('measures function performance', () => {
        const testFunction = vi.fn(() => 'result');

        // Apply decorator
        const descriptor = { value: testFunction };
        measurePerformance('test-function')(null, 'testMethod', descriptor);

        const decoratedFunction = descriptor.value;
        const result = decoratedFunction();

        expect(result).toBe('result');
        expect(testFunction).toHaveBeenCalled();
    });

    it('handles async functions', async () => {
        const asyncFunction = vi.fn(async () => 'async-result');

        const descriptor = { value: asyncFunction };
        measurePerformance('async-test')(null, 'asyncMethod', descriptor);

        const decoratedFunction = descriptor.value;
        const result = await decoratedFunction();

        expect(result).toBe('async-result');
        expect(asyncFunction).toHaveBeenCalled();
    });
});