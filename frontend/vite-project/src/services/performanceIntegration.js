/**
 * Performance Monitoring Integration for Design System Components
 * Provides comprehensive performance tracking and optimization
 */
import React from 'react';

/**
 * Performance metric types
 */
export const METRIC_TYPES = {
    RENDER_TIME: 'render_time',
    UPDATE_FREQUENCY: 'update_frequency',
    MEMORY_USAGE: 'memory_usage',
    NETWORK_LATENCY: 'network_latency',
    WEBSOCKET_LATENCY: 'websocket_latency',
    DATA_PROCESSING: 'data_processing',
    COMPONENT_LIFECYCLE: 'component_lifecycle',
    USER_INTERACTION: 'user_interaction',
    FRAME_RATE: 'frame_rate',
    BUNDLE_SIZE: 'bundle_size'
};

/**
 * Performance thresholds for different metrics
 */
export const PERFORMANCE_THRESHOLDS = {
    RENDER_TIME: {
        excellent: 16, // 60fps
        good: 33,      // 30fps
        poor: 100,     // 10fps
        critical: 500  // 2fps
    },
    MEMORY_USAGE: {
        excellent: 50 * 1024 * 1024,  // 50MB
        good: 100 * 1024 * 1024,      // 100MB
        poor: 200 * 1024 * 1024,      // 200MB
        critical: 500 * 1024 * 1024   // 500MB
    },
    NETWORK_LATENCY: {
        excellent: 50,   // 50ms
        good: 100,       // 100ms
        poor: 500,       // 500ms
        critical: 2000   // 2s
    },
    UPDATE_FREQUENCY: {
        excellent: 60,   // 60 updates/sec
        good: 30,        // 30 updates/sec
        poor: 10,        // 10 updates/sec
        critical: 1      // 1 update/sec
    },
    FRAME_RATE: {
        excellent: 60,   // 60fps
        good: 30,        // 30fps
        poor: 15,        // 15fps
        critical: 5      // 5fps
    }
};

/**
 * Performance monitoring integration for design system components
 */
export class PerformanceIntegration {
    constructor(options = {}) {
        this.options = {
            enableMetrics: true,
            enableAutoOptimization: true,
            enableReporting: true,
            reportingInterval: 5000,
            metricsBufferSize: 1000,
            ...options
        };

        this.metrics = new Map();
        this.observers = new Map();
        this.optimizations = new Map();
        this.reportingInterval = null;
        this.isMonitoring = false;

        this.setupPerformanceObservers();
        this.startReporting();
    }

    /**
     * Setup performance observers
     */
    setupPerformanceObservers() {
        // Performance Observer for navigation and resource timing
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.recordMetric(entry.entryType, entry.name, {
                            duration: entry.duration,
                            startTime: entry.startTime,
                            timestamp: Date.now()
                        });
                    }
                });

                observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
                this.observers.set('performance', observer);
            } catch (error) {
                console.warn('Performance Observer not supported:', error);
            }
        }

        // Intersection Observer for component visibility
        if ('IntersectionObserver' in window) {
            const intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const componentId = entry.target.dataset.componentId;
                    if (componentId) {
                        this.recordMetric(METRIC_TYPES.COMPONENT_LIFECYCLE, componentId, {
                            visible: entry.isIntersecting,
                            intersectionRatio: entry.intersectionRatio,
                            timestamp: Date.now()
                        });
                    }
                });
            });

            this.observers.set('intersection', intersectionObserver);
        }

        // Mutation Observer for DOM changes
        if ('MutationObserver' in window) {
            const mutationObserver = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        this.recordMetric(METRIC_TYPES.COMPONENT_LIFECYCLE, 'dom_mutation', {
                            addedNodes: mutation.addedNodes.length,
                            removedNodes: mutation.removedNodes.length,
                            timestamp: Date.now()
                        });
                    }
                });
            });

            this.observers.set('mutation', mutationObserver);
        }
    }

    /**
     * Start performance monitoring for a component
     */
    startMonitoring(componentId, element, options = {}) {
        if (!this.options.enableMetrics) return;

        const componentMetrics = {
            id: componentId,
            element,
            startTime: performance.now(),
            renderTimes: [],
            updateCount: 0,
            memoryUsage: [],
            frameRates: [],
            networkRequests: [],
            errors: [],
            options: {
                trackRenderTime: true,
                trackMemoryUsage: true,
                trackFrameRate: true,
                trackNetworkLatency: true,
                ...options
            }
        };

        this.metrics.set(componentId, componentMetrics);

        // Add component to intersection observer
        if (element && this.observers.has('intersection')) {
            element.dataset.componentId = componentId;
            this.observers.get('intersection').observe(element);
        }

        // Start frame rate monitoring if enabled
        if (componentMetrics.options.trackFrameRate) {
            this.startFrameRateMonitoring(componentId);
        }

        // Start memory monitoring if enabled
        if (componentMetrics.options.trackMemoryUsage) {
            this.startMemoryMonitoring(componentId);
        }

        this.isMonitoring = true;
    }

    /**
     * Stop performance monitoring for a component
     */
    stopMonitoring(componentId) {
        const componentMetrics = this.metrics.get(componentId);
        if (!componentMetrics) return;

        // Remove from intersection observer
        if (componentMetrics.element && this.observers.has('intersection')) {
            this.observers.get('intersection').unobserve(componentMetrics.element);
        }

        // Stop frame rate monitoring
        this.stopFrameRateMonitoring(componentId);

        // Stop memory monitoring
        this.stopMemoryMonitoring(componentId);

        // Generate final report
        const finalReport = this.generateComponentReport(componentId);

        this.metrics.delete(componentId);

        return finalReport;
    }

    /**
     * Record a performance metric
     */
    recordMetric(type, componentId, data) {
        if (!this.options.enableMetrics) return;

        const timestamp = Date.now();
        const metricEntry = {
            type,
            componentId,
            timestamp,
            ...data
        };

        // Store in component-specific metrics
        const componentMetrics = this.metrics.get(componentId);
        if (componentMetrics) {
            switch (type) {
                case METRIC_TYPES.RENDER_TIME:
                    componentMetrics.renderTimes.push(data.duration);
                    if (componentMetrics.renderTimes.length > this.options.metricsBufferSize) {
                        componentMetrics.renderTimes.shift();
                    }
                    break;

                case METRIC_TYPES.MEMORY_USAGE:
                    componentMetrics.memoryUsage.push(data);
                    if (componentMetrics.memoryUsage.length > this.options.metricsBufferSize) {
                        componentMetrics.memoryUsage.shift();
                    }
                    break;

                case METRIC_TYPES.FRAME_RATE:
                    componentMetrics.frameRates.push(data.fps);
                    if (componentMetrics.frameRates.length > this.options.metricsBufferSize) {
                        componentMetrics.frameRates.shift();
                    }
                    break;

                case METRIC_TYPES.NETWORK_LATENCY:
                    componentMetrics.networkRequests.push(data);
                    break;

                case METRIC_TYPES.USER_INTERACTION:
                    componentMetrics.updateCount++;
                    break;
            }
        }

        // Check for performance issues and apply optimizations
        if (this.options.enableAutoOptimization) {
            this.checkPerformanceThresholds(type, componentId, data);
        }
    }

    /**
     * Start frame rate monitoring
     */
    startFrameRateMonitoring(componentId) {
        let lastTime = performance.now();
        let frameCount = 0;

        const measureFrameRate = () => {
            const currentTime = performance.now();
            frameCount++;

            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

                this.recordMetric(METRIC_TYPES.FRAME_RATE, componentId, { fps });

                frameCount = 0;
                lastTime = currentTime;
            }

            if (this.metrics.has(componentId)) {
                requestAnimationFrame(measureFrameRate);
            }
        };

        requestAnimationFrame(measureFrameRate);
    }

    /**
     * Stop frame rate monitoring
     */
    stopFrameRateMonitoring(componentId) {
        // Frame rate monitoring stops automatically when component is removed from metrics
    }

    /**
     * Start memory monitoring
     */
    startMemoryMonitoring(componentId) {
        const measureMemory = () => {
            if (performance.memory) {
                const memoryInfo = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                };

                this.recordMetric(METRIC_TYPES.MEMORY_USAGE, componentId, memoryInfo);
            }

            if (this.metrics.has(componentId)) {
                setTimeout(measureMemory, 1000);
            }
        };

        setTimeout(measureMemory, 1000);
    }

    /**
     * Stop memory monitoring
     */
    stopMemoryMonitoring(componentId) {
        // Memory monitoring stops automatically when component is removed from metrics
    }

    /**
     * Check performance thresholds and apply optimizations
     */
    checkPerformanceThresholds(type, componentId, data) {
        const thresholds = PERFORMANCE_THRESHOLDS[type];
        if (!thresholds) return;

        let performanceLevel = 'excellent';
        let value = data.duration || data.fps || data.used || data.latency || 0;

        if (value > thresholds.critical) {
            performanceLevel = 'critical';
        } else if (value > thresholds.poor) {
            performanceLevel = 'poor';
        } else if (value > thresholds.good) {
            performanceLevel = 'good';
        }

        if (performanceLevel === 'critical' || performanceLevel === 'poor') {
            this.applyOptimization(componentId, type, performanceLevel, value);
        }
    }

    /**
     * Apply performance optimizations
     */
    applyOptimization(componentId, metricType, performanceLevel, value) {
        const optimizationKey = `${componentId}_${metricType}`;

        if (this.optimizations.has(optimizationKey)) {
            return; // Already optimized
        }

        let optimization = null;

        switch (metricType) {
            case METRIC_TYPES.RENDER_TIME:
                if (performanceLevel === 'critical') {
                    optimization = {
                        type: 'reduce_animations',
                        description: 'Disable animations to improve render performance',
                        action: () => this.disableAnimations(componentId)
                    };
                } else if (performanceLevel === 'poor') {
                    optimization = {
                        type: 'throttle_updates',
                        description: 'Throttle component updates',
                        action: () => this.throttleUpdates(componentId)
                    };
                }
                break;

            case METRIC_TYPES.MEMORY_USAGE:
                if (performanceLevel === 'critical') {
                    optimization = {
                        type: 'garbage_collection',
                        description: 'Force garbage collection and cleanup',
                        action: () => this.forceGarbageCollection(componentId)
                    };
                }
                break;

            case METRIC_TYPES.FRAME_RATE:
                if (performanceLevel === 'critical') {
                    optimization = {
                        type: 'reduce_complexity',
                        description: 'Reduce visual complexity',
                        action: () => this.reduceVisualComplexity(componentId)
                    };
                }
                break;
        }

        if (optimization) {
            this.optimizations.set(optimizationKey, optimization);

            console.warn(`Performance optimization applied for ${componentId}:`, optimization.description);

            try {
                optimization.action();
            } catch (error) {
                console.error('Optimization failed:', error);
            }
        }
    }

    /**
     * Disable animations for a component
     */
    disableAnimations(componentId) {
        const componentMetrics = this.metrics.get(componentId);
        if (componentMetrics?.element) {
            componentMetrics.element.style.transition = 'none';
            componentMetrics.element.style.animation = 'none';
            componentMetrics.element.classList.add('performance-mode');
        }
    }

    /**
     * Throttle updates for a component
     */
    throttleUpdates(componentId) {
        // This would be implemented by the component itself
        // We just record the optimization request
        this.recordMetric('optimization', componentId, {
            type: 'throttle_updates',
            timestamp: Date.now()
        });
    }

    /**
     * Force garbage collection (if available)
     */
    forceGarbageCollection(componentId) {
        if (window.gc) {
            window.gc();
        }

        // Clear component caches
        const componentMetrics = this.metrics.get(componentId);
        if (componentMetrics) {
            componentMetrics.renderTimes = componentMetrics.renderTimes.slice(-10);
            componentMetrics.memoryUsage = componentMetrics.memoryUsage.slice(-10);
            componentMetrics.frameRates = componentMetrics.frameRates.slice(-10);
        }
    }

    /**
     * Reduce visual complexity
     */
    reduceVisualComplexity(componentId) {
        const componentMetrics = this.metrics.get(componentId);
        if (componentMetrics?.element) {
            componentMetrics.element.classList.add('low-complexity-mode');
        }
    }

    /**
     * Generate performance report for a component
     */
    generateComponentReport(componentId) {
        const componentMetrics = this.metrics.get(componentId);
        if (!componentMetrics) return null;

        const renderTimes = componentMetrics.renderTimes;
        const memoryUsage = componentMetrics.memoryUsage;
        const frameRates = componentMetrics.frameRates;

        return {
            componentId,
            duration: performance.now() - componentMetrics.startTime,
            updateCount: componentMetrics.updateCount,

            renderPerformance: {
                average: renderTimes.length > 0 ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length : 0,
                min: renderTimes.length > 0 ? Math.min(...renderTimes) : 0,
                max: renderTimes.length > 0 ? Math.max(...renderTimes) : 0,
                samples: renderTimes.length
            },

            memoryPerformance: {
                peak: memoryUsage.length > 0 ? Math.max(...memoryUsage.map(m => m.used)) : 0,
                average: memoryUsage.length > 0 ? memoryUsage.reduce((a, b) => a + b.used, 0) / memoryUsage.length : 0,
                samples: memoryUsage.length
            },

            frameRatePerformance: {
                average: frameRates.length > 0 ? frameRates.reduce((a, b) => a + b, 0) / frameRates.length : 0,
                min: frameRates.length > 0 ? Math.min(...frameRates) : 0,
                max: frameRates.length > 0 ? Math.max(...frameRates) : 0,
                samples: frameRates.length
            },

            optimizations: Array.from(this.optimizations.entries())
                .filter(([key]) => key.startsWith(componentId))
                .map(([key, opt]) => opt),

            timestamp: Date.now()
        };
    }

    /**
     * Start performance reporting
     */
    startReporting() {
        if (!this.options.enableReporting) return;

        this.reportingInterval = setInterval(() => {
            const report = this.generateGlobalReport();
            this.sendReport(report);
        }, this.options.reportingInterval);
    }

    /**
     * Stop performance reporting
     */
    stopReporting() {
        if (this.reportingInterval) {
            clearInterval(this.reportingInterval);
            this.reportingInterval = null;
        }
    }

    /**
     * Generate global performance report
     */
    generateGlobalReport() {
        const components = Array.from(this.metrics.keys()).map(componentId =>
            this.generateComponentReport(componentId)
        ).filter(Boolean);

        return {
            timestamp: Date.now(),
            totalComponents: components.length,
            components,
            globalMetrics: {
                totalMemoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0,
                totalOptimizations: this.optimizations.size,
                monitoringDuration: this.isMonitoring ? Date.now() - this.startTime : 0
            }
        };
    }

    /**
     * Send performance report
     */
    sendReport(report) {
        if (process.env.NODE_ENV === 'development') {
            console.group('📊 Performance Report');
            console.table(report.components.map(c => ({
                Component: c.componentId,
                'Avg Render (ms)': c.renderPerformance.average.toFixed(2),
                'Avg FPS': c.frameRatePerformance.average.toFixed(1),
                'Memory (MB)': (c.memoryPerformance.peak / 1024 / 1024).toFixed(1),
                'Updates': c.updateCount,
                'Optimizations': c.optimizations.length
            })));
            console.groupEnd();
        }

        // In production, send to analytics service
        if (process.env.NODE_ENV === 'production' && this.options.analyticsEndpoint) {
            fetch(this.options.analyticsEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report)
            }).catch(error => {
                console.error('Failed to send performance report:', error);
            });
        }
    }

    /**
     * Get current metrics for all components
     */
    getAllMetrics() {
        const metrics = {};
        for (const [componentId, componentMetrics] of this.metrics.entries()) {
            metrics[componentId] = this.generateComponentReport(componentId);
        }
        return metrics;
    }

    /**
     * Clear all metrics and optimizations
     */
    clearMetrics() {
        this.metrics.clear();
        this.optimizations.clear();
    }

    /**
     * Destroy the performance integration
     */
    destroy() {
        this.stopReporting();

        // Disconnect all observers
        for (const observer of this.observers.values()) {
            if (observer.disconnect) {
                observer.disconnect();
            }
        }

        this.observers.clear();
        this.metrics.clear();
        this.optimizations.clear();
        this.isMonitoring = false;
    }
}

/**
 * React hook for performance monitoring
 */
export const usePerformanceMonitoring = (componentId, options = {}) => {
    const [metrics, setMetrics] = React.useState(null);
    const [isOptimized, setIsOptimized] = React.useState(false);
    const performanceRef = React.useRef(null);
    const elementRef = React.useRef(null);

    React.useEffect(() => {
        if (!performanceRef.current) {
            performanceRef.current = new PerformanceIntegration(options);
        }

        const performance = performanceRef.current;

        if (elementRef.current) {
            performance.startMonitoring(componentId, elementRef.current, options);
        }

        // Update metrics periodically
        const metricsInterval = setInterval(() => {
            const currentMetrics = performance.generateComponentReport(componentId);
            setMetrics(currentMetrics);

            // Check if optimizations were applied
            const hasOptimizations = currentMetrics?.optimizations?.length > 0;
            setIsOptimized(hasOptimizations);
        }, 1000);

        return () => {
            clearInterval(metricsInterval);
            const finalReport = performance.stopMonitoring(componentId);
            setMetrics(finalReport);
        };
    }, [componentId, JSON.stringify(options)]);

    const recordMetric = React.useCallback((type, data) => {
        performanceRef.current?.recordMetric(type, componentId, data);
    }, [componentId]);

    return {
        elementRef,
        metrics,
        isOptimized,
        recordMetric
    };
};

// Export singleton instance
export const performanceIntegration = new PerformanceIntegration();

export default PerformanceIntegration;