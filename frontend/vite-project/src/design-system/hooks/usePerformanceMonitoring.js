/**
 * usePerformanceMonitoring Hook
 * Provides comprehensive performance monitoring capabilities
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export const usePerformanceMonitoring = ({
    updateInterval = 1000,
    enableMemoryTracking = true,
    enableFrameRateTracking = true,
    enableRenderTimeTracking = true,
    enableComponentTracking = true,
    memoryLeakThreshold = 10 // MB increase over 30 seconds
} = {}) => {
    const [metrics, setMetrics] = useState({
        frameRate: 0,
        averageRenderTime: 0,
        memoryUsage: null,
        componentCount: 0,
        performanceScore: 100,
        memoryTrend: 'stable'
    });

    const [isMonitoring, setIsMonitoring] = useState(false);

    // Refs for tracking data
    const frameCountRef = useRef(0);
    const lastFrameTimeRef = useRef(0);
    const renderTimesRef = useRef([]);
    const memoryHistoryRef = useRef([]);
    const componentCountRef = useRef(0);
    const intervalRef = useRef(null);
    const frameRateIntervalRef = useRef(null);
    const observerRef = useRef(null);

    // Performance observer for render timing
    const performanceObserverRef = useRef(null);

    // Start monitoring
    const startMonitoring = useCallback(() => {
        if (isMonitoring) return;

        setIsMonitoring(true);

        // Start frame rate monitoring
        if (enableFrameRateTracking) {
            startFrameRateMonitoring();
        }

        // Start render time monitoring
        if (enableRenderTimeTracking) {
            startRenderTimeMonitoring();
        }

        // Start component counting
        if (enableComponentTracking) {
            startComponentTracking();
        }

        // Start periodic metrics collection
        intervalRef.current = setInterval(() => {
            collectMetrics();
        }, updateInterval);

    }, [isMonitoring, updateInterval, enableFrameRateTracking, enableRenderTimeTracking, enableComponentTracking]);

    // Stop monitoring
    const stopMonitoring = useCallback(() => {
        setIsMonitoring(false);

        // Clear intervals
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (frameRateIntervalRef.current) {
            clearInterval(frameRateIntervalRef.current);
            frameRateIntervalRef.current = null;
        }

        // Disconnect observers
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        if (performanceObserverRef.current) {
            performanceObserverRef.current.disconnect();
            performanceObserverRef.current = null;
        }

        // Reset frame counting
        frameCountRef.current = 0;
        lastFrameTimeRef.current = 0;
    }, []);

    // Frame rate monitoring
    const startFrameRateMonitoring = useCallback(() => {
        let frameCount = 0;
        let lastTime = performance.now();

        const countFrame = () => {
            frameCount++;
            frameCountRef.current = frameCount;
            requestAnimationFrame(countFrame);
        };

        requestAnimationFrame(countFrame);

        // Calculate FPS every second
        frameRateIntervalRef.current = setInterval(() => {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastTime;
            const fps = Math.round((frameCount * 1000) / deltaTime);

            setMetrics(prev => ({ ...prev, frameRate: fps }));

            frameCount = 0;
            lastTime = currentTime;
        }, 1000);
    }, []);

    // Render time monitoring using Performance Observer
    const startRenderTimeMonitoring = useCallback(() => {
        if (!window.PerformanceObserver) return;

        try {
            performanceObserverRef.current = new PerformanceObserver((list) => {
                const entries = list.getEntries();

                entries.forEach(entry => {
                    if (entry.entryType === 'measure' || entry.entryType === 'navigation') {
                        renderTimesRef.current.push(entry.duration);

                        // Keep only last 50 measurements
                        if (renderTimesRef.current.length > 50) {
                            renderTimesRef.current.shift();
                        }
                    }
                });
            });

            performanceObserverRef.current.observe({
                entryTypes: ['measure', 'navigation', 'paint']
            });
        } catch (error) {
            console.warn('Performance Observer not supported:', error);
        }
    }, []);

    // Component tracking using MutationObserver
    const startComponentTracking = useCallback(() => {
        if (!window.MutationObserver) return;

        observerRef.current = new MutationObserver((mutations) => {
            let componentCount = 0;

            // Count React components (elements with data-reactroot or React-specific attributes)
            const countComponents = (element) => {
                if (element.nodeType === Node.ELEMENT_NODE) {
                    // Check for React-specific attributes or class names
                    if (element.hasAttribute('data-reactroot') ||
                        element.className?.includes('react-') ||
                        element.tagName?.toLowerCase().includes('-')) {
                        componentCount++;
                    }

                    // Recursively count child components
                    Array.from(element.children).forEach(countComponents);
                }
            };

            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    countComponents(node);
                });
            });

            componentCountRef.current += componentCount;
        });

        observerRef.current.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Initial count
        const initialCount = document.querySelectorAll('[data-reactroot], [class*="react-"]').length;
        componentCountRef.current = initialCount;
    }, []);

    // Collect all metrics
    const collectMetrics = useCallback(() => {
        const newMetrics = { ...metrics };

        // Memory usage
        if (enableMemoryTracking && performance.memory) {
            const memoryInfo = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
            };

            newMetrics.memoryUsage = memoryInfo;

            // Track memory trend for leak detection
            memoryHistoryRef.current.push({
                timestamp: Date.now(),
                used: memoryInfo.used
            });

            // Keep only last 30 seconds of data
            const thirtySecondsAgo = Date.now() - 30000;
            memoryHistoryRef.current = memoryHistoryRef.current.filter(
                entry => entry.timestamp > thirtySecondsAgo
            );

            // Detect memory trend
            if (memoryHistoryRef.current.length > 10) {
                const oldest = memoryHistoryRef.current[0];
                const newest = memoryHistoryRef.current[memoryHistoryRef.current.length - 1];
                const increase = (newest.used - oldest.used) / (1024 * 1024); // MB

                if (increase > memoryLeakThreshold) {
                    newMetrics.memoryTrend = 'increasing';
                } else if (increase < -memoryLeakThreshold) {
                    newMetrics.memoryTrend = 'decreasing';
                } else {
                    newMetrics.memoryTrend = 'stable';
                }
            }
        }

        // Average render time
        if (renderTimesRef.current.length > 0) {
            const avgRenderTime = renderTimesRef.current.reduce((sum, time) => sum + time, 0) / renderTimesRef.current.length;
            newMetrics.averageRenderTime = avgRenderTime;
        }

        // Component count
        newMetrics.componentCount = componentCountRef.current;

        // Performance score calculation
        newMetrics.performanceScore = calculatePerformanceScore(newMetrics);

        setMetrics(newMetrics);
    }, [metrics, enableMemoryTracking, memoryLeakThreshold]);

    // Calculate overall performance score
    const calculatePerformanceScore = useCallback((currentMetrics) => {
        let score = 100;

        // Frame rate scoring (30% weight)
        const fps = currentMetrics.frameRate || 0;
        if (fps < 60) {
            score -= (60 - fps) * 0.5; // Lose 0.5 points per FPS below 60
        }

        // Render time scoring (25% weight)
        const renderTime = currentMetrics.averageRenderTime || 0;
        if (renderTime > 16) { // 60fps = 16.67ms per frame
            score -= (renderTime - 16) * 0.3; // Lose 0.3 points per ms over 16
        }

        // Memory usage scoring (25% weight)
        const memoryPercentage = currentMetrics.memoryUsage?.percentage || 0;
        if (memoryPercentage > 70) {
            score -= (memoryPercentage - 70) * 0.4; // Lose 0.4 points per % over 70%
        }

        // Memory trend scoring (10% weight)
        if (currentMetrics.memoryTrend === 'increasing') {
            score -= 10;
        }

        // Component count scoring (10% weight)
        const componentCount = currentMetrics.componentCount || 0;
        if (componentCount > 1000) {
            score -= (componentCount - 1000) * 0.01; // Lose 0.01 points per component over 1000
        }

        return Math.max(0, Math.min(100, Math.round(score)));
    }, []);

    // Clear all metrics
    const clearMetrics = useCallback(() => {
        renderTimesRef.current = [];
        memoryHistoryRef.current = [];
        componentCountRef.current = 0;
        frameCountRef.current = 0;

        setMetrics({
            frameRate: 0,
            averageRenderTime: 0,
            memoryUsage: null,
            componentCount: 0,
            performanceScore: 100,
            memoryTrend: 'stable'
        });
    }, []);

    // Get detailed performance report
    const getPerformanceReport = useCallback(() => {
        return {
            ...metrics,
            renderTimeHistory: [...renderTimesRef.current],
            memoryHistory: [...memoryHistoryRef.current],
            timestamp: Date.now(),
            monitoringDuration: isMonitoring ? Date.now() - (lastFrameTimeRef.current || Date.now()) : 0
        };
    }, [metrics, isMonitoring]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopMonitoring();
        };
    }, [stopMonitoring]);

    return {
        metrics,
        isMonitoring,
        startMonitoring,
        stopMonitoring,
        clearMetrics,
        getPerformanceReport
    };
};

// Performance measurement utilities
export const measureRenderTime = (componentName, renderFunction) => {
    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();

    // Mark the measurement for Performance Observer
    if (performance.mark && performance.measure) {
        performance.mark(`${componentName}-render-start`);
        performance.mark(`${componentName}-render-end`);
        performance.measure(
            `${componentName}-render`,
            `${componentName}-render-start`,
            `${componentName}-render-end`
        );
    }

    return result;
};

// HOC for automatic performance monitoring
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
    return React.forwardRef((props, ref) => {
        const renderStart = performance.now();

        useEffect(() => {
            const renderEnd = performance.now();
            const renderTime = renderEnd - renderStart;

            // Record render time
            if (performance.mark && performance.measure) {
                performance.mark(`${componentName}-mount`);
                performance.measure(`${componentName}-mount-time`, 'navigationStart', `${componentName}-mount`);
            }
        }, []);

        return <WrappedComponent {...props} ref={ref} />;
    });
};

export default usePerformanceMonitoring;