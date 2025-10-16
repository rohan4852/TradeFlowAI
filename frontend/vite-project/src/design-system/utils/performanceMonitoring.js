/**
 * Performance Monitoring Utilities
 * Comprehensive performance tracking and optimization tools
 */

// Global performance monitor instance
let globalPerformanceMonitor = null;

/**
 * Core Performance Monitor Class
 */
export class PerformanceMonitor {
    constructor(config = {}) {
        this.config = {
            enableFrameRateTracking: true,
            enableMemoryTracking: true,
            enableRenderTimeTracking: true,
            enableNetworkTracking: true,
            enableUserInteractionTracking: true,
            alertThresholds: {
                frameRate: { warning: 30, critical: 15 },
                renderTime: { warning: 16, critical: 33 },
                memoryUsage: { warning: 70, critical: 85 },
                networkLatency: { warning: 1000, critical: 3000 }
            },
            maxHistorySize: 1000,
            ...config
        };

        this.metrics = {
            frameRate: [],
            renderTimes: [],
            memoryUsage: [],
            networkRequests: [],
            userInteractions: [],
            componentMounts: [],
            componentUpdates: []
        };

        this.alerts = [];
        this.isMonitoring = false;
        this.observers = new Map();
        this.intervals = new Map();
        this.startTime = null;
    }

    /**
     * Start monitoring all enabled metrics
     */
    start() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.startTime = performance.now();

        if (this.config.enableFrameRateTracking) {
            this.startFrameRateMonitoring();
        }

        if (this.config.enableMemoryTracking) {
            this.startMemoryMonitoring();
        }

        if (this.config.enableRenderTimeTracking) {
            this.startRenderTimeMonitoring();
        }

        if (this.config.enableNetworkTracking) {
            this.startNetworkMonitoring();
        }

        if (this.config.enableUserInteractionTracking) {
            this.startUserInteractionMonitoring();
        }

        this.startAlertMonitoring();
    }

    /**
     * Stop all monitoring
     */
    stop() {
        this.isMonitoring = false;

        // Clear all intervals
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals.clear();

        // Disconnect all observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }

    /**
     * Frame rate monitoring
     */
    startFrameRateMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();

        const countFrame = () => {
            if (!this.isMonitoring) return;
            frameCount++;
            requestAnimationFrame(countFrame);
        };

        requestAnimationFrame(countFrame);

        const interval = setInterval(() => {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastTime;
            const fps = Math.round((frameCount * 1000) / deltaTime);

            this.recordMetric('frameRate', {
                timestamp: currentTime,
                value: fps,
                deltaTime
            });

            frameCount = 0;
            lastTime = currentTime;
        }, 1000);

        this.intervals.set('frameRate', interval);
    }

    /**
     * Memory usage monitoring
     */
    startMemoryMonitoring() {
        if (!performance.memory) return;

        const interval = setInterval(() => {
            const memoryInfo = {
                timestamp: performance.now(),
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
            };

            this.recordMetric('memoryUsage', memoryInfo);
        }, 2000);

        this.intervals.set('memory', interval);
    }

    /**
     * Render time monitoring using Performance Observer
     */
    startRenderTimeMonitoring() {
        if (!window.PerformanceObserver) return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();

                entries.forEach(entry => {
                    if (entry.entryType === 'measure' && entry.name.includes('render')) {
                        this.recordMetric('renderTimes', {
                            timestamp: entry.startTime,
                            duration: entry.duration,
                            name: entry.name
                        });
                    }
                });
            });

            observer.observe({ entryTypes: ['measure'] });
            this.observers.set('renderTime', observer);
        } catch (error) {
            console.warn('Performance Observer not supported:', error);
        }
    }

    /**
     * Network monitoring
     */
    startNetworkMonitoring() {
        if (!window.PerformanceObserver) return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();

                entries.forEach(entry => {
                    if (entry.entryType === 'navigation' || entry.entryType === 'resource') {
                        this.recordMetric('networkRequests', {
                            timestamp: entry.startTime,
                            duration: entry.duration,
                            type: entry.entryType,
                            name: entry.name,
                            size: entry.transferSize || 0,
                            responseStart: entry.responseStart,
                            responseEnd: entry.responseEnd
                        });
                    }
                });
            });

            observer.observe({ entryTypes: ['navigation', 'resource'] });
            this.observers.set('network', observer);
        } catch (error) {
            console.warn('Network monitoring not supported:', error);
        }
    }

    /**
     * User interaction monitoring
     */
    startUserInteractionMonitoring() {
        const interactionTypes = ['click', 'keydown', 'scroll', 'touchstart'];

        interactionTypes.forEach(type => {
            const handler = (event) => {
                this.recordMetric('userInteractions', {
                    timestamp: performance.now(),
                    type,
                    target: event.target.tagName,
                    className: event.target.className
                });
            };

            document.addEventListener(type, handler, { passive: true });
        });
    }

    /**
     * Alert monitoring
     */
    startAlertMonitoring() {
        const interval = setInterval(() => {
            this.checkAlerts();
        }, 5000);

        this.intervals.set('alerts', interval);
    }

    /**
     * Record a metric
     */
    recordMetric(type, data) {
        if (!this.metrics[type]) {
            this.metrics[type] = [];
        }

        this.metrics[type].push(data);

        // Maintain history size limit
        if (this.metrics[type].length > this.config.maxHistorySize) {
            this.metrics[type].shift();
        }
    }

    /**
     * Check for performance alerts
     */
    checkAlerts() {
        const currentTime = performance.now();
        const newAlerts = [];

        // Frame rate alerts
        const recentFrameRates = this.getRecentMetrics('frameRate', 5000);
        if (recentFrameRates.length > 0) {
            const avgFrameRate = recentFrameRates.reduce((sum, m) => sum + m.value, 0) / recentFrameRates.length;

            if (avgFrameRate < this.config.alertThresholds.frameRate.critical) {
                newAlerts.push({
                    id: 'critical-frame-rate',
                    severity: 'critical',
                    message: `Critical frame rate: ${avgFrameRate.toFixed(1)} FPS`,
                    timestamp: currentTime,
                    value: avgFrameRate
                });
            } else if (avgFrameRate < this.config.alertThresholds.frameRate.warning) {
                newAlerts.push({
                    id: 'low-frame-rate',
                    severity: 'warning',
                    message: `Low frame rate: ${avgFrameRate.toFixed(1)} FPS`,
                    timestamp: currentTime,
                    value: avgFrameRate
                });
            }
        }

        // Memory alerts
        const recentMemory = this.getRecentMetrics('memoryUsage', 10000);
        if (recentMemory.length > 0) {
            const latestMemory = recentMemory[recentMemory.length - 1];

            if (latestMemory.percentage > this.config.alertThresholds.memoryUsage.critical) {
                newAlerts.push({
                    id: 'critical-memory',
                    severity: 'critical',
                    message: `Critical memory usage: ${latestMemory.percentage.toFixed(1)}%`,
                    timestamp: currentTime,
                    value: latestMemory.percentage
                });
            } else if (latestMemory.percentage > this.config.alertThresholds.memoryUsage.warning) {
                newAlerts.push({
                    id: 'high-memory',
                    severity: 'warning',
                    message: `High memory usage: ${latestMemory.percentage.toFixed(1)}%`,
                    timestamp: currentTime,
                    value: latestMemory.percentage
                });
            }

            // Memory leak detection
            if (recentMemory.length >= 5) {
                const memoryTrend = this.calculateTrend(recentMemory.map(m => m.used));
                if (memoryTrend > 1024 * 1024 * 10) { // 10MB increase
                    newAlerts.push({
                        id: 'memory-leak',
                        severity: 'warning',
                        message: 'Potential memory leak detected',
                        timestamp: currentTime,
                        value: memoryTrend
                    });
                }
            }
        }

        // Render time alerts
        const recentRenderTimes = this.getRecentMetrics('renderTimes', 10000);
        if (recentRenderTimes.length > 0) {
            const avgRenderTime = recentRenderTimes.reduce((sum, m) => sum + m.duration, 0) / recentRenderTimes.length;

            if (avgRenderTime > this.config.alertThresholds.renderTime.critical) {
                newAlerts.push({
                    id: 'critical-render-time',
                    severity: 'critical',
                    message: `Critical render time: ${avgRenderTime.toFixed(1)}ms`,
                    timestamp: currentTime,
                    value: avgRenderTime
                });
            } else if (avgRenderTime > this.config.alertThresholds.renderTime.warning) {
                newAlerts.push({
                    id: 'slow-render-time',
                    severity: 'warning',
                    message: `Slow render time: ${avgRenderTime.toFixed(1)}ms`,
                    timestamp: currentTime,
                    value: avgRenderTime
                });
            }
        }

        // Update alerts
        this.alerts = newAlerts;
    }

    /**
     * Get recent metrics within a time window
     */
    getRecentMetrics(type, timeWindow) {
        if (!this.metrics[type]) return [];

        const cutoff = performance.now() - timeWindow;
        return this.metrics[type].filter(metric => metric.timestamp > cutoff);
    }

    /**
     * Calculate trend (linear regression slope)
     */
    calculateTrend(values) {
        if (values.length < 2) return 0;

        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
        const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }

    /**
     * Get current performance summary
     */
    getPerformanceSummary() {
        const currentTime = performance.now();
        const recentWindow = 30000; // 30 seconds

        const recentFrameRates = this.getRecentMetrics('frameRate', recentWindow);
        const recentMemory = this.getRecentMetrics('memoryUsage', recentWindow);
        const recentRenderTimes = this.getRecentMetrics('renderTimes', recentWindow);

        return {
            timestamp: currentTime,
            uptime: currentTime - (this.startTime || currentTime),
            frameRate: {
                current: recentFrameRates.length > 0 ? recentFrameRates[recentFrameRates.length - 1].value : 0,
                average: recentFrameRates.length > 0 ?
                    recentFrameRates.reduce((sum, m) => sum + m.value, 0) / recentFrameRates.length : 0,
                min: recentFrameRates.length > 0 ? Math.min(...recentFrameRates.map(m => m.value)) : 0,
                max: recentFrameRates.length > 0 ? Math.max(...recentFrameRates.map(m => m.value)) : 0
            },
            memory: recentMemory.length > 0 ? recentMemory[recentMemory.length - 1] : null,
            renderTime: {
                average: recentRenderTimes.length > 0 ?
                    recentRenderTimes.reduce((sum, m) => sum + m.duration, 0) / recentRenderTimes.length : 0,
                p95: this.calculatePercentile(recentRenderTimes.map(m => m.duration), 95),
                p99: this.calculatePercentile(recentRenderTimes.map(m => m.duration), 99)
            },
            alerts: this.alerts,
            performanceScore: this.calculatePerformanceScore()
        };
    }

    /**
     * Calculate percentile
     */
    calculatePercentile(values, percentile) {
        if (values.length === 0) return 0;

        const sorted = values.slice().sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }

    /**
     * Calculate overall performance score
     */
    calculatePerformanceScore() {
        let score = 100;
        const summary = this.getPerformanceSummary();

        // Frame rate scoring (40% weight)
        const fps = summary.frameRate.average;
        if (fps < 60) {
            score -= (60 - fps) * 0.67; // Lose 0.67 points per FPS below 60
        }

        // Memory usage scoring (30% weight)
        if (summary.memory) {
            const memoryPercentage = summary.memory.percentage;
            if (memoryPercentage > 50) {
                score -= (memoryPercentage - 50) * 0.6; // Lose 0.6 points per % over 50%
            }
        }

        // Render time scoring (30% weight)
        const avgRenderTime = summary.renderTime.average;
        if (avgRenderTime > 16) {
            score -= (avgRenderTime - 16) * 0.5; // Lose 0.5 points per ms over 16
        }

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Export metrics data
     */
    exportMetrics() {
        return {
            config: this.config,
            metrics: this.metrics,
            alerts: this.alerts,
            summary: this.getPerformanceSummary(),
            exportTime: performance.now()
        };
    }

    /**
     * Clear all metrics
     */
    clearMetrics() {
        Object.keys(this.metrics).forEach(key => {
            this.metrics[key] = [];
        });
        this.alerts = [];
    }
}

/**
 * Memory leak detector
 */
export class MemoryLeakDetector {
    constructor(config = {}) {
        this.config = {
            checkInterval: 30000, // 30 seconds
            thresholdIncrease: 10 * 1024 * 1024, // 10MB
            samplesForDetection: 5,
            ...config
        };

        this.samples = [];
        this.isMonitoring = false;
        this.interval = null;
    }

    start() {
        if (this.isMonitoring || !performance.memory) return;

        this.isMonitoring = true;
        this.interval = setInterval(() => {
            this.takeSample();
        }, this.config.checkInterval);
    }

    stop() {
        this.isMonitoring = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    takeSample() {
        const sample = {
            timestamp: Date.now(),
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize
        };

        this.samples.push(sample);

        // Keep only recent samples
        if (this.samples.length > this.config.samplesForDetection * 2) {
            this.samples.shift();
        }
    }

    detectLeak() {
        if (this.samples.length < this.config.samplesForDetection) {
            return { hasLeak: false, confidence: 0 };
        }

        const recentSamples = this.samples.slice(-this.config.samplesForDetection);
        const firstSample = recentSamples[0];
        const lastSample = recentSamples[recentSamples.length - 1];

        const memoryIncrease = lastSample.used - firstSample.used;
        const timeSpan = lastSample.timestamp - firstSample.timestamp;

        // Calculate trend
        const trend = this.calculateLinearTrend(recentSamples.map(s => s.used));

        const hasLeak = memoryIncrease > this.config.thresholdIncrease && trend > 0;
        const confidence = Math.min(100, (memoryIncrease / this.config.thresholdIncrease) * 100);

        return {
            hasLeak,
            confidence,
            memoryIncrease,
            timeSpan,
            trend,
            samples: recentSamples
        };
    }

    calculateLinearTrend(values) {
        const n = values.length;
        if (n < 2) return 0;

        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
        const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }
}

/**
 * Performance budget enforcer
 */
export class PerformanceBudget {
    constructor(budgets = {}) {
        this.budgets = {
            maxRenderTime: 16, // ms
            maxMemoryUsage: 100 * 1024 * 1024, // 100MB
            minFrameRate: 30, // fps
            maxBundleSize: 2 * 1024 * 1024, // 2MB
            maxNetworkRequests: 50,
            ...budgets
        };

        this.violations = [];
    }

    checkBudget(metrics) {
        const violations = [];
        const timestamp = performance.now();

        // Check render time budget
        if (metrics.renderTime && metrics.renderTime.average > this.budgets.maxRenderTime) {
            violations.push({
                type: 'renderTime',
                budget: this.budgets.maxRenderTime,
                actual: metrics.renderTime.average,
                severity: metrics.renderTime.average > this.budgets.maxRenderTime * 2 ? 'critical' : 'warning',
                timestamp
            });
        }

        // Check memory budget
        if (metrics.memory && metrics.memory.used > this.budgets.maxMemoryUsage) {
            violations.push({
                type: 'memoryUsage',
                budget: this.budgets.maxMemoryUsage,
                actual: metrics.memory.used,
                severity: metrics.memory.used > this.budgets.maxMemoryUsage * 1.5 ? 'critical' : 'warning',
                timestamp
            });
        }

        // Check frame rate budget
        if (metrics.frameRate && metrics.frameRate.average < this.budgets.minFrameRate) {
            violations.push({
                type: 'frameRate',
                budget: this.budgets.minFrameRate,
                actual: metrics.frameRate.average,
                severity: metrics.frameRate.average < this.budgets.minFrameRate * 0.5 ? 'critical' : 'warning',
                timestamp
            });
        }

        this.violations = violations;
        return violations;
    }

    getViolations() {
        return this.violations;
    }

    setBudget(type, value) {
        this.budgets[type] = value;
    }

    getBudgets() {
        return { ...this.budgets };
    }
}

/**
 * Global performance monitor instance
 */
export const getGlobalPerformanceMonitor = () => {
    if (!globalPerformanceMonitor) {
        globalPerformanceMonitor = new PerformanceMonitor();
    }
    return globalPerformanceMonitor;
};

/**
 * Performance measurement decorators
 */
export const measurePerformance = (name) => {
    return (target, propertyName, descriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args) {
            const startTime = performance.now();

            // Mark start
            if (performance.mark) {
                performance.mark(`${name}-start`);
            }

            const result = originalMethod.apply(this, args);

            // Handle both sync and async functions
            if (result && typeof result.then === 'function') {
                return result.finally(() => {
                    const endTime = performance.now();
                    if (performance.mark && performance.measure) {
                        performance.mark(`${name}-end`);
                        performance.measure(`${name}-render`, `${name}-start`, `${name}-end`);
                    }
                });
            } else {
                const endTime = performance.now();
                if (performance.mark && performance.measure) {
                    performance.mark(`${name}-end`);
                    performance.measure(`${name}-render`, `${name}-start`, `${name}-end`);
                }
                return result;
            }
        };

        return descriptor;
    };
};

/**
 * Component performance tracker
 */
export const trackComponentPerformance = (componentName) => {
    return (WrappedComponent) => {
        return React.forwardRef((props, ref) => {
            const mountTime = useRef(performance.now());
            const renderCount = useRef(0);

            useEffect(() => {
                const monitor = getGlobalPerformanceMonitor();
                monitor.recordMetric('componentMounts', {
                    timestamp: mountTime.current,
                    name: componentName,
                    mountTime: performance.now() - mountTime.current
                });

                return () => {
                    monitor.recordMetric('componentUnmounts', {
                        timestamp: performance.now(),
                        name: componentName,
                        lifetime: performance.now() - mountTime.current,
                        renderCount: renderCount.current
                    });
                };
            }, []);

            useEffect(() => {
                renderCount.current++;
                const monitor = getGlobalPerformanceMonitor();
                monitor.recordMetric('componentUpdates', {
                    timestamp: performance.now(),
                    name: componentName,
                    renderCount: renderCount.current
                });
            });

            return <WrappedComponent {...props} ref={ref} />;
        });
    };
};

/**
 * Real-time performance metrics collector
 */
export class RealTimeMetricsCollector {
    constructor(config = {}) {
        this.config = {
            sampleRate: 60, // Samples per second
            bufferSize: 1000,
            enableCPUTracking: true,
            enableNetworkTracking: true,
            enableDOMTracking: true,
            ...config
        };

        this.metrics = {
            cpu: [],
            network: [],
            dom: [],
            interactions: []
        };

        this.isCollecting = false;
        this.collectors = new Map();
    }

    start() {
        if (this.isCollecting) return;
        this.isCollecting = true;

        if (this.config.enableCPUTracking) {
            this.startCPUTracking();
        }

        if (this.config.enableNetworkTracking) {
            this.startNetworkTracking();
        }

        if (this.config.enableDOMTracking) {
            this.startDOMTracking();
        }
    }

    stop() {
        this.isCollecting = false;
        this.collectors.forEach(collector => {
            if (collector.disconnect) collector.disconnect();
            if (collector.clearInterval) clearInterval(collector);
        });
        this.collectors.clear();
    }

    startCPUTracking() {
        // Use performance.now() to estimate CPU usage
        let lastTime = performance.now();
        let lastCPUTime = 0;

        const interval = setInterval(() => {
            if (!this.isCollecting) return;

            const currentTime = performance.now();
            const deltaTime = currentTime - lastTime;

            // Estimate CPU usage based on frame timing
            const estimatedCPU = Math.min(100, Math.max(0, (deltaTime - 16.67) / 16.67 * 100));

            this.recordMetric('cpu', {
                timestamp: currentTime,
                usage: estimatedCPU,
                deltaTime
            });

            lastTime = currentTime;
        }, 1000 / this.config.sampleRate);

        this.collectors.set('cpu', interval);
    }

    startNetworkTracking() {
        if (!window.PerformanceObserver) return;

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'resource') {
                        this.recordMetric('network', {
                            timestamp: entry.startTime,
                            name: entry.name,
                            duration: entry.duration,
                            size: entry.transferSize || 0,
                            type: entry.initiatorType
                        });
                    }
                });
            });

            observer.observe({ entryTypes: ['resource'] });
            this.collectors.set('network', observer);
        } catch (error) {
            console.warn('Network tracking not supported:', error);
        }
    }

    startDOMTracking() {
        if (!window.MutationObserver) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                this.recordMetric('dom', {
                    timestamp: performance.now(),
                    type: mutation.type,
                    addedNodes: mutation.addedNodes.length,
                    removedNodes: mutation.removedNodes.length,
                    target: mutation.target.tagName
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true
        });

        this.collectors.set('dom', observer);
    }

    recordMetric(type, data) {
        if (!this.metrics[type]) {
            this.metrics[type] = [];
        }

        this.metrics[type].push(data);

        // Maintain buffer size
        if (this.metrics[type].length > this.config.bufferSize) {
            this.metrics[type].shift();
        }
    }

    getMetrics(type, timeWindow = 30000) {
        if (!this.metrics[type]) return [];

        const cutoff = performance.now() - timeWindow;
        return this.metrics[type].filter(metric => metric.timestamp > cutoff);
    }

    getAggregatedMetrics(timeWindow = 30000) {
        const currentTime = performance.now();

        return {
            timestamp: currentTime,
            cpu: this.aggregateCPUMetrics(timeWindow),
            network: this.aggregateNetworkMetrics(timeWindow),
            dom: this.aggregateDOMMetrics(timeWindow),
            interactions: this.aggregateInteractionMetrics(timeWindow)
        };
    }

    aggregateCPUMetrics(timeWindow) {
        const cpuMetrics = this.getMetrics('cpu', timeWindow);
        if (cpuMetrics.length === 0) return null;

        const usage = cpuMetrics.map(m => m.usage);
        return {
            average: usage.reduce((sum, val) => sum + val, 0) / usage.length,
            max: Math.max(...usage),
            min: Math.min(...usage),
            samples: cpuMetrics.length
        };
    }

    aggregateNetworkMetrics(timeWindow) {
        const networkMetrics = this.getMetrics('network', timeWindow);
        if (networkMetrics.length === 0) return null;

        const totalSize = networkMetrics.reduce((sum, m) => sum + m.size, 0);
        const totalDuration = networkMetrics.reduce((sum, m) => sum + m.duration, 0);

        return {
            requests: networkMetrics.length,
            totalSize,
            averageDuration: totalDuration / networkMetrics.length,
            bandwidth: totalSize / (timeWindow / 1000) // bytes per second
        };
    }

    aggregateDOMMetrics(timeWindow) {
        const domMetrics = this.getMetrics('dom', timeWindow);
        if (domMetrics.length === 0) return null;

        const mutations = domMetrics.length;
        const addedNodes = domMetrics.reduce((sum, m) => sum + m.addedNodes, 0);
        const removedNodes = domMetrics.reduce((sum, m) => sum + m.removedNodes, 0);

        return {
            mutations,
            addedNodes,
            removedNodes,
            netNodes: addedNodes - removedNodes
        };
    }

    aggregateInteractionMetrics(timeWindow) {
        const interactionMetrics = this.getMetrics('interactions', timeWindow);
        if (interactionMetrics.length === 0) return null;

        const byType = interactionMetrics.reduce((acc, m) => {
            acc[m.type] = (acc[m.type] || 0) + 1;
            return acc;
        }, {});

        return {
            total: interactionMetrics.length,
            byType,
            frequency: interactionMetrics.length / (timeWindow / 1000) // interactions per second
        };
    }
}

/**
 * Performance regression detector
 */
export class PerformanceRegressionDetector {
    constructor(config = {}) {
        this.config = {
            baselineWindow: 100, // Number of samples for baseline
            comparisonWindow: 20, // Number of recent samples to compare
            regressionThreshold: 0.2, // 20% degradation threshold
            minSamples: 10,
            ...config
        };

        this.baselines = new Map();
        this.samples = new Map();
    }

    addSample(metricName, value, timestamp = performance.now()) {
        if (!this.samples.has(metricName)) {
            this.samples.set(metricName, []);
        }

        const samples = this.samples.get(metricName);
        samples.push({ value, timestamp });

        // Maintain window size
        const totalWindow = this.config.baselineWindow + this.config.comparisonWindow;
        if (samples.length > totalWindow) {
            samples.shift();
        }

        // Update baseline if we have enough samples
        if (samples.length >= this.config.baselineWindow && !this.baselines.has(metricName)) {
            this.updateBaseline(metricName);
        }
    }

    updateBaseline(metricName) {
        const samples = this.samples.get(metricName);
        if (!samples || samples.length < this.config.baselineWindow) return;

        const baselineSamples = samples.slice(0, this.config.baselineWindow);
        const values = baselineSamples.map(s => s.value);

        const baseline = {
            mean: values.reduce((sum, val) => sum + val, 0) / values.length,
            median: this.calculateMedian(values),
            stdDev: this.calculateStandardDeviation(values),
            p95: this.calculatePercentile(values, 95),
            timestamp: performance.now()
        };

        this.baselines.set(metricName, baseline);
    }

    detectRegression(metricName) {
        const baseline = this.baselines.get(metricName);
        const samples = this.samples.get(metricName);

        if (!baseline || !samples || samples.length < this.config.baselineWindow + this.config.minSamples) {
            return null;
        }

        const recentSamples = samples.slice(-this.config.comparisonWindow);
        const recentValues = recentSamples.map(s => s.value);
        const recentMean = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;

        // Calculate regression percentage (depends on metric type)
        let regressionPercent;
        if (metricName === 'frameRate') {
            // For frame rate, lower is worse
            regressionPercent = (baseline.mean - recentMean) / baseline.mean;
        } else {
            // For render time, memory, etc., higher is worse
            regressionPercent = (recentMean - baseline.mean) / baseline.mean;
        }

        const hasRegression = regressionPercent > this.config.regressionThreshold;

        return {
            metricName,
            hasRegression,
            regressionPercent,
            baseline: baseline.mean,
            current: recentMean,
            confidence: this.calculateConfidence(baseline, recentValues),
            severity: this.calculateSeverity(regressionPercent),
            timestamp: performance.now()
        };
    }

    calculateConfidence(baseline, recentValues) {
        // Statistical confidence based on standard deviation and sample size
        const recentMean = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
        const recentStdDev = this.calculateStandardDeviation(recentValues);

        // Simple confidence calculation based on separation of means relative to standard deviations
        const separation = Math.abs(baseline.mean - recentMean);
        const pooledStdDev = (baseline.stdDev + recentStdDev) / 2;

        return Math.min(1, separation / (pooledStdDev || 1));
    }

    calculateSeverity(regressionPercent) {
        if (regressionPercent > 0.5) return 'critical';
        if (regressionPercent > 0.3) return 'high';
        if (regressionPercent > 0.15) return 'medium';
        return 'low';
    }

    calculateMedian(values) {
        const sorted = values.slice().sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    calculatePercentile(values, percentile) {
        const sorted = values.slice().sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }

    calculateStandardDeviation(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }

    getAllRegressions() {
        const regressions = {};
        for (const metricName of this.samples.keys()) {
            const regression = this.detectRegression(metricName);
            if (regression && regression.hasRegression) {
                regressions[metricName] = regression;
            }
        }
        return regressions;
    }

    reset() {
        this.baselines.clear();
        this.samples.clear();
    }
}

export default PerformanceMonitor;