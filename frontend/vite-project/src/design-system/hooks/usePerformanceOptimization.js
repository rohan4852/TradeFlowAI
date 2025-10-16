/**
 * usePerformanceOptimization Hook
 * Comprehensive performance optimization with automatic fallbacks and budget enforcement
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    PerformanceOptimizer,
    AutomaticFallbackManager,
    AutomatedPerformanceBudget,
    IntelligentCache,
    ComponentVirtualizer
} from '../utils/performanceOptimization';

export const usePerformanceOptimization = ({
    enableAutoFallback = true,
    enableBudgetEnforcement = true,
    enableIntelligentCaching = true,
    enableComponentVirtualization = true,
    budgets = {},
    fallbackConfig = {},
    cacheConfig = {},
    updateInterval = 2000
} = {}) => {
    // State
    const [optimizationState, setOptimizationState] = useState({
        isActive: false,
        currentMode: 'normal',
        activeOptimizations: [],
        budgetViolations: [],
        cacheStats: null,
        performanceScore: 100
    });

    // Refs for optimization instances
    const optimizerRef = useRef(null);
    const fallbackManagerRef = useRef(null);
    const budgetEnforcerRef = useRef(null);
    const cacheRef = useRef(null);
    const virtualizerRef = useRef(null);
    const intervalRef = useRef(null);

    // Initialize optimization systems
    const initializeOptimization = useCallback(() => {
        // Initialize performance optimizer
        optimizerRef.current = new PerformanceOptimizer({
            enableAutoFallback,
            ...fallbackConfig
        });

        // Initialize fallback manager
        if (enableAutoFallback) {
            fallbackManagerRef.current = new AutomaticFallbackManager(fallbackConfig);
        }

        // Initialize budget enforcer
        if (enableBudgetEnforcement) {
            budgetEnforcerRef.current = new AutomatedPerformanceBudget(
                budgets,
                optimizerRef.current
            );
        }

        // Initialize intelligent cache
        if (enableIntelligentCaching) {
            cacheRef.current = new IntelligentCache(cacheConfig);
        }

        // Initialize component virtualizer
        if (enableComponentVirtualization) {
            virtualizerRef.current = new ComponentVirtualizer();
        }

        // Set up event listeners
        setupEventListeners();

    }, [enableAutoFallback, enableBudgetEnforcement, enableIntelligentCaching, enableComponentVirtualization]);

    // Setup event listeners for performance events
    const setupEventListeners = useCallback(() => {
        // Listen for performance fallback events
        const handlePerformanceFallback = (event) => {
            setOptimizationState(prev => ({
                ...prev,
                currentMode: event.detail.mode,
                activeOptimizations: fallbackManagerRef.current?.getStatus().activeOptimizations || []
            }));
        };

        // Listen for performance violations
        const handlePerformanceViolation = (event) => {
            setOptimizationState(prev => ({
                ...prev,
                budgetViolations: [...prev.budgetViolations, event.detail].slice(-10) // Keep last 10
            }));
        };

        // Listen for virtualization requests
        const handleVirtualizationRequest = (event) => {
            if (virtualizerRef.current && event.target) {
                const items = Array.from(event.target.children);
                virtualizerRef.current.virtualize(event.target, items);
            }
        };

        window.addEventListener('performanceFallback', handlePerformanceFallback);
        window.addEventListener('performanceViolation', handlePerformanceViolation);
        document.addEventListener('enableVirtualization', handleVirtualizationRequest);

        // Cleanup function
        return () => {
            window.removeEventListener('performanceFallback', handlePerformanceFallback);
            window.removeEventListener('performanceViolation', handlePerformanceViolation);
            document.removeEventListener('enableVirtualization', handleVirtualizationRequest);
        };
    }, []);

    // Start optimization monitoring
    const startOptimization = useCallback(() => {
        if (optimizationState.isActive) return;

        // Initialize if not already done
        if (!optimizerRef.current) {
            initializeOptimization();
        }

        // Enable optimizer
        optimizerRef.current?.enable();

        // Start monitoring interval
        intervalRef.current = setInterval(() => {
            updateOptimizationState();
        }, updateInterval);

        setOptimizationState(prev => ({ ...prev, isActive: true }));
    }, [optimizationState.isActive, initializeOptimization, updateInterval]);

    // Stop optimization monitoring
    const stopOptimization = useCallback(() => {
        if (!optimizationState.isActive) return;

        // Disable optimizer
        optimizerRef.current?.disable();

        // Clear interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        setOptimizationState(prev => ({ ...prev, isActive: false }));
    }, [optimizationState.isActive]);

    // Update optimization state with current metrics
    const updateOptimizationState = useCallback(() => {
        const metrics = collectCurrentMetrics();

        // Apply optimizations based on metrics
        const optimizations = optimizerRef.current?.optimize(metrics) || [];

        // Enforce budget if enabled
        let budgetResult = null;
        if (budgetEnforcerRef.current) {
            budgetResult = budgetEnforcerRef.current.enforceBudget(metrics);
        }

        // Get cache stats if enabled
        let cacheStats = null;
        if (cacheRef.current) {
            cacheStats = cacheRef.current.getStats();
        }

        // Calculate performance score
        const performanceScore = calculatePerformanceScore(metrics, budgetResult);

        setOptimizationState(prev => ({
            ...prev,
            activeOptimizations: optimizations,
            budgetViolations: budgetResult?.violations || [],
            cacheStats,
            performanceScore
        }));
    }, []);

    // Collect current performance metrics
    const collectCurrentMetrics = useCallback(() => {
        const metrics = {
            timestamp: performance.now()
        };

        // Frame rate metrics
        if (window.performance && performance.now) {
            // Simple frame rate estimation
            const now = performance.now();
            const frameRate = 1000 / (now - (window.lastFrameTime || now));
            window.lastFrameTime = now;

            metrics.frameRate = {
                current: Math.min(60, Math.max(0, frameRate)),
                average: frameRate
            };
        }

        // Memory metrics
        if (performance.memory) {
            metrics.memory = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
            };
        }

        // DOM metrics
        metrics.domNodes = document.querySelectorAll('*').length;
        metrics.componentCount = document.querySelectorAll('[data-react-component]').length;

        // Network metrics (simplified)
        if (navigator.connection) {
            metrics.networkLatency = {
                average: navigator.connection.rtt || 0
            };
        }

        return metrics;
    }, []);

    // Calculate overall performance score
    const calculatePerformanceScore = useCallback((metrics, budgetResult) => {
        let score = 100;

        // Frame rate scoring (30%)
        if (metrics.frameRate) {
            const fps = metrics.frameRate.average;
            if (fps < 60) {
                score -= (60 - fps) * 0.5;
            }
        }

        // Memory scoring (25%)
        if (metrics.memory) {
            const memoryPercentage = metrics.memory.percentage;
            if (memoryPercentage > 70) {
                score -= (memoryPercentage - 70) * 0.4;
            }
        }

        // Budget violations scoring (25%)
        if (budgetResult?.violations) {
            const criticalViolations = budgetResult.violations.filter(v => v.severity === 'critical').length;
            const warningViolations = budgetResult.violations.filter(v => v.severity === 'warning').length;
            score -= (criticalViolations * 15) + (warningViolations * 5);
        }

        // DOM complexity scoring (20%)
        if (metrics.domNodes > 5000) {
            score -= (metrics.domNodes - 5000) * 0.001;
        }

        return Math.max(0, Math.min(100, Math.round(score)));
    }, []);

    // Cache management methods
    const cacheGet = useCallback((key) => {
        return cacheRef.current?.get(key) || null;
    }, []);

    const cacheSet = useCallback((key, data, options) => {
        cacheRef.current?.set(key, data, options);
    }, []);

    const cacheInvalidate = useCallback((key) => {
        return cacheRef.current?.invalidate(key) || false;
    }, []);

    const cacheInvalidateByTag = useCallback((tag) => {
        return cacheRef.current?.invalidateByTag(tag) || 0;
    }, []);

    const cacheClear = useCallback(() => {
        cacheRef.current?.clear();
    }, []);

    // Virtualization methods
    const virtualizeComponent = useCallback((container, items) => {
        if (virtualizerRef.current) {
            virtualizerRef.current.virtualize(container, items);
        }
    }, []);

    // Force fallback mode (for testing)
    const forceFallbackMode = useCallback((mode) => {
        fallbackManagerRef.current?.forceFallbackMode(mode);
    }, []);

    // Get comprehensive optimization report
    const getOptimizationReport = useCallback(() => {
        return {
            state: optimizationState,
            metrics: collectCurrentMetrics(),
            budgetStatus: budgetEnforcerRef.current?.getBudgetStatus(collectCurrentMetrics()),
            cacheAnalysis: cacheRef.current?.getAnalysis(),
            fallbackStatus: fallbackManagerRef.current?.getStatus(),
            virtualizationStats: virtualizerRef.current?.getStats(),
            timestamp: performance.now()
        };
    }, [optimizationState, collectCurrentMetrics]);

    // Initialize on mount
    useEffect(() => {
        initializeOptimization();

        return () => {
            stopOptimization();
        };
    }, [initializeOptimization, stopOptimization]);

    return {
        // State
        optimizationState,

        // Control methods
        startOptimization,
        stopOptimization,

        // Cache methods
        cache: {
            get: cacheGet,
            set: cacheSet,
            invalidate: cacheInvalidate,
            invalidateByTag: cacheInvalidateByTag,
            clear: cacheClear
        },

        // Virtualization methods
        virtualizeComponent,

        // Testing methods
        forceFallbackMode,

        // Reporting
        getOptimizationReport
    };
};

export default usePerformanceOptimization;