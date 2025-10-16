/**
 * Design System Integration Service
 * Provides integration between components and the design system
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { performanceIntegration } from './performanceIntegration';

/**
 * Hook for design system integration
 */
export const useDesignSystemIntegration = (componentId, componentType = 'component', options = {}) => {
    const [isRegistered, setIsRegistered] = useState(false);
    const [systemHealth, setSystemHealth] = useState(null);
    const elementRef = useRef(null);
    const integrationRef = useRef(null);

    const defaultOptions = {
        enablePerformanceMonitoring: true,
        enableErrorBoundary: true,
        dataTypes: [],
        onDataUpdate: null,
        ...options
    };

    // Initialize integration
    useEffect(() => {
        if (!integrationRef.current) {
            integrationRef.current = {
                id: componentId,
                type: componentType,
                options: defaultOptions,
                registered: Date.now(),
                element: elementRef.current
            };

            // Start performance monitoring if enabled
            if (defaultOptions.enablePerformanceMonitoring && performanceIntegration) {
                performanceIntegration.startMonitoring(componentId, elementRef.current, {
                    trackRenderTime: true,
                    trackMemoryUsage: true,
                    trackFrameRate: componentType === 'chart' || componentType === 'dashboard'
                });
            }

            setIsRegistered(true);
        }

        return () => {
            if (integrationRef.current && performanceIntegration) {
                performanceIntegration.stopMonitoring(componentId);
            }
        };
    }, [componentId, componentType]);

    // Monitor system health
    useEffect(() => {
        const healthInterval = setInterval(() => {
            if (performanceIntegration) {
                const metrics = performanceIntegration.getAllMetrics();
                const componentMetrics = metrics[componentId];

                if (componentMetrics) {
                    const health = {
                        status: 'healthy',
                        score: 100,
                        issues: []
                    };

                    // Check render performance
                    if (componentMetrics.renderPerformance?.average > 100) {
                        health.status = 'warning';
                        health.score -= 20;
                        health.issues.push('Slow render performance detected');
                    }

                    // Check memory usage
                    if (componentMetrics.memoryPerformance?.peak > 100 * 1024 * 1024) {
                        health.status = 'warning';
                        health.score -= 15;
                        health.issues.push('High memory usage detected');
                    }

                    // Check frame rate
                    if (componentMetrics.frameRatePerformance?.average < 30) {
                        health.status = 'critical';
                        health.score -= 30;
                        health.issues.push('Low frame rate detected');
                    }

                    setSystemHealth(health);
                }
            }
        }, 5000);

        return () => clearInterval(healthInterval);
    }, [componentId]);

    const optimizeSystem = useCallback(() => {
        if (performanceIntegration) {
            // Force optimization
            performanceIntegration.applyOptimization(componentId, 'render_time', 'poor', 100);
        }
    }, [componentId]);

    const getStatus = useCallback(() => {
        return {
            isRegistered,
            componentId,
            componentType,
            health: systemHealth,
            integration: integrationRef.current
        };
    }, [isRegistered, componentId, componentType, systemHealth]);

    return {
        elementRef,
        integration: integrationRef.current,
        isRegistered,
        systemHealth,
        optimizeSystem,
        getStatus
    };
};

export default {
    useDesignSystemIntegration
};