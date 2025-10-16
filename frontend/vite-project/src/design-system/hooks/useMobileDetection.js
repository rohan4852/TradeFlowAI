import { useState, useEffect } from 'react';

/**
 * Hook to detect mobile devices and screen sizes
 * Provides responsive breakpoint detection and device capabilities
 */
export const useMobileDetection = () => {
    const [deviceInfo, setDeviceInfo] = useState({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenSize: 'desktop',
        hasTouch: false,
        orientation: 'landscape'
    });

    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            // Breakpoints based on design system
            const isMobile = width < 768;
            const isTablet = width >= 768 && width < 1024;
            const isDesktop = width >= 1024;

            let screenSize = 'desktop';
            if (isMobile) screenSize = 'mobile';
            else if (isTablet) screenSize = 'tablet';

            const orientation = width > height ? 'landscape' : 'portrait';

            setDeviceInfo({
                isMobile,
                isTablet,
                isDesktop,
                screenSize,
                hasTouch,
                orientation,
                width,
                height
            });
        };

        // Initial check
        checkDevice();

        // Listen for resize and orientation changes
        window.addEventListener('resize', checkDevice);
        window.addEventListener('orientationchange', checkDevice);

        return () => {
            window.removeEventListener('resize', checkDevice);
            window.removeEventListener('orientationchange', checkDevice);
        };
    }, []);

    return deviceInfo;
};

/**
 * Hook for responsive breakpoint matching
 */
export const useBreakpoint = (breakpoint) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const breakpoints = {
            xs: '(max-width: 479px)',
            sm: '(min-width: 480px) and (max-width: 767px)',
            md: '(min-width: 768px) and (max-width: 1023px)',
            lg: '(min-width: 1024px) and (max-width: 1279px)',
            xl: '(min-width: 1280px)'
        };

        const mediaQuery = window.matchMedia(breakpoints[breakpoint]);
        setMatches(mediaQuery.matches);

        const handler = (e) => setMatches(e.matches);
        mediaQuery.addEventListener('change', handler);

        return () => mediaQuery.removeEventListener('change', handler);
    }, [breakpoint]);

    return matches;
};
/**
 *
 Hook for mobile performance optimization
 */
export const useMobilePerformance = () => {
    const [performanceMetrics, setPerformanceMetrics] = useState({
        fps: 60,
        memoryUsage: 0,
        networkType: '4g',
        batteryLevel: 1,
        isLowPowerMode: false
    });

    useEffect(() => {
        // Monitor frame rate
        let frameCount = 0;
        let lastTime = performance.now();

        const measureFPS = (currentTime) => {
            frameCount++;

            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                setPerformanceMetrics(prev => ({ ...prev, fps }));
                frameCount = 0;
                lastTime = currentTime;
            }

            requestAnimationFrame(measureFPS);
        };

        requestAnimationFrame(measureFPS);

        // Monitor memory usage
        const updateMemoryUsage = () => {
            if ('memory' in performance) {
                const memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576);
                setPerformanceMetrics(prev => ({ ...prev, memoryUsage }));
            }
        };

        // Monitor network
        const updateNetworkInfo = () => {
            if ('connection' in navigator) {
                setPerformanceMetrics(prev => ({
                    ...prev,
                    networkType: navigator.connection.effectiveType
                }));
            }
        };

        // Monitor battery
        const updateBatteryInfo = async () => {
            if ('getBattery' in navigator) {
                try {
                    const battery = await navigator.getBattery();
                    setPerformanceMetrics(prev => ({
                        ...prev,
                        batteryLevel: battery.level,
                        isLowPowerMode: battery.level < 0.2
                    }));
                } catch (error) {
                    console.log('Battery API not available');
                }
            }
        };

        const interval = setInterval(() => {
            updateMemoryUsage();
            updateNetworkInfo();
            updateBatteryInfo();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const shouldReduceAnimations = () => {
        return performanceMetrics.fps < 30 ||
            performanceMetrics.memoryUsage > 100 ||
            performanceMetrics.isLowPowerMode ||
            performanceMetrics.networkType === '2g';
    };

    const getOptimizationLevel = () => {
        if (performanceMetrics.isLowPowerMode || performanceMetrics.networkType === '2g') {
            return 'aggressive';
        }
        if (performanceMetrics.fps < 45 || performanceMetrics.memoryUsage > 80) {
            return 'moderate';
        }
        return 'none';
    };

    return {
        ...performanceMetrics,
        shouldReduceAnimations,
        getOptimizationLevel
    };
};