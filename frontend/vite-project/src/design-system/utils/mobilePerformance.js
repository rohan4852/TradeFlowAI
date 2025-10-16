/**
 * Mobile performance optimization utilities
 */

// Detect if user prefers reduced motion
export const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Throttle function for performance-critical operations
export const throttle = (func, limit) => {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Debounce function for input handling
export const debounce = (func, wait, immediate) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
    const defaultOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };

    return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

// Memory usage monitoring
export const getMemoryUsage = () => {
    if ('memory' in performance) {
        return {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576),
            total: Math.round(performance.memory.totalJSHeapSize / 1048576),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        };
    }
    return null;
};

// Network information
export const getNetworkInfo = () => {
    if ('connection' in navigator) {
        return {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData
        };
    }
    return null;
};

// Adaptive loading based on network conditions
export const shouldLoadHighQuality = () => {
    const network = getNetworkInfo();
    if (!network) return true;

    // Load high quality on fast connections
    return network.effectiveType === '4g' && !network.saveData;
};

// Frame rate monitoring
export const createFrameRateMonitor = (callback) => {
    let lastTime = performance.now();
    let frameCount = 0;

    const monitor = (currentTime) => {
        frameCount++;

        if (currentTime - lastTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            callback(fps);
            frameCount = 0;
            lastTime = currentTime;
        }

        requestAnimationFrame(monitor);
    };

    requestAnimationFrame(monitor);
};

// Optimize animations based on device capabilities
export const getOptimizedAnimationConfig = () => {
    const isLowEnd = getMemoryUsage()?.used > 100; // > 100MB
    const isSlowNetwork = getNetworkInfo()?.effectiveType === '2g';
    const reducedMotion = prefersReducedMotion();

    if (reducedMotion || isLowEnd || isSlowNetwork) {
        return {
            duration: 0.1,
            easing: 'linear',
            disabled: reducedMotion
        };
    }

    return {
        duration: 0.3,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        disabled: false
    };
};

// Preload critical resources
export const preloadResource = (href, as, type) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
};

// Service Worker registration
export const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('SW registered: ', registration);
            return registration;
        } catch (registrationError) {
            console.log('SW registration failed: ', registrationError);
        }
    }
};

// PWA installation prompt
export const handlePWAInstall = () => {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
    });

    return {
        canInstall: () => !!deferredPrompt,
        install: async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                deferredPrompt = null;
                return outcome === 'accepted';
            }
            return false;
        }
    };
};