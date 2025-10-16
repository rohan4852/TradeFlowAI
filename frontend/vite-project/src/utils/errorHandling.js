/**
 * Comprehensive Error Handling Utilities
 * Provides error handling, logging, and recovery mechanisms
 */

/**
 * Global error handler for unhandled promise rejections
 */
export const setupGlobalErrorHandlers = () => {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);

        // Prevent the default browser behavior
        event.preventDefault();

        // Log to error reporting service if available
        if (window.errorReporter) {
            window.errorReporter.captureException(event.reason);
        }
    });

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);

        // Log to error reporting service if available
        if (window.errorReporter) {
            window.errorReporter.captureException(event.error);
        }
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
        if (event.target !== window) {
            console.error('Resource loading error:', event.target.src || event.target.href);
        }
    }, true);
};

/**
 * Safe component wrapper that catches errors
 * Note: This should be used in .jsx files, not .js files
 */
export const withErrorBoundary = (Component, fallback = null) => {
    // Return a function that creates the error boundary when used in JSX context
    return (props) => {
        try {
            return Component(props);
        } catch (error) {
            console.error('Component error:', error);
            return fallback || null;
        }
    };
};

/**
 * Safe async function wrapper
 */
export const safeAsync = (asyncFn, fallback = null) => {
    return async (...args) => {
        try {
            return await asyncFn(...args);
        } catch (error) {
            console.error('Async function error:', error);
            return fallback;
        }
    };
};

/**
 * Safe JSON parse
 */
export const safeJsonParse = (jsonString, fallback = null) => {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('JSON parse error:', error);
        return fallback;
    }
};

/**
 * Safe localStorage operations
 */
export const safeLocalStorage = {
    getItem: (key, fallback = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : fallback;
        } catch (error) {
            console.error('localStorage getItem error:', error);
            return fallback;
        }
    },

    setItem: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('localStorage setItem error:', error);
            return false;
        }
    },

    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('localStorage removeItem error:', error);
            return false;
        }
    }
};

/**
 * Network request error handler
 */
export const handleNetworkError = (error) => {
    if (error.response) {
        // Server responded with error status
        console.error('Server error:', error.response.status, error.response.data);
        return {
            type: 'server_error',
            status: error.response.status,
            message: error.response.data?.message || 'Server error occurred'
        };
    } else if (error.request) {
        // Request was made but no response received
        console.error('Network error:', error.request);
        return {
            type: 'network_error',
            message: 'Network connection failed'
        };
    } else {
        // Something else happened
        console.error('Request error:', error.message);
        return {
            type: 'request_error',
            message: error.message
        };
    }
};

/**
 * Component import error handler
 */
export const safeImport = async (importFn, fallback = null) => {
    try {
        return await importFn();
    } catch (error) {
        console.error('Dynamic import error:', error);
        return fallback;
    }
};

/**
 * WebSocket error handler
 */
export const handleWebSocketError = (error, reconnectFn = null) => {
    console.error('WebSocket error:', error);

    // Attempt reconnection if function provided
    if (reconnectFn && typeof reconnectFn === 'function') {
        setTimeout(() => {
            try {
                reconnectFn();
            } catch (reconnectError) {
                console.error('WebSocket reconnection failed:', reconnectError);
            }
        }, 5000);
    }
};

/**
 * Performance monitoring error handler
 */
export const handlePerformanceError = (error, context = '') => {
    console.error(`Performance monitoring error ${context}:`, error);

    // Don't let performance monitoring errors break the app
    return null;
};

/**
 * Data validation error handler
 */
export const validateData = (data, schema, fallback = null) => {
    try {
        // Basic validation - can be extended with a proper schema validator
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format');
        }

        return data;
    } catch (error) {
        console.error('Data validation error:', error);
        return fallback;
    }
};

/**
 * Error recovery strategies
 */
export const errorRecoveryStrategies = {
    // Retry with exponential backoff
    retryWithBackoff: async (fn, maxRetries = 3, baseDelay = 1000) => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === maxRetries - 1) throw error;

                const delay = baseDelay * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    },

    // Fallback to cached data
    fallbackToCache: (key, fetchFn, fallback = null) => {
        return safeAsync(async () => {
            try {
                const data = await fetchFn();
                safeLocalStorage.setItem(`cache_${key}`, data);
                return data;
            } catch (error) {
                console.warn('Falling back to cached data:', error);
                return safeLocalStorage.getItem(`cache_${key}`, fallback);
            }
        })();
    },

    // Graceful degradation
    gracefulDegrade: (primaryFn, fallbackFn) => {
        return safeAsync(async (...args) => {
            try {
                return await primaryFn(...args);
            } catch (error) {
                console.warn('Primary function failed, using fallback:', error);
                return await fallbackFn(...args);
            }
        });
    }
};

/**
 * Initialize error handling system
 */
export const initializeErrorHandling = () => {
    setupGlobalErrorHandlers();

    // Set up performance monitoring for errors
    if (window.performance && window.performance.mark) {
        window.performance.mark('error-handling-initialized');
    }

    console.log('✅ Error handling system initialized');
};

export default {
    setupGlobalErrorHandlers,
    withErrorBoundary,
    safeAsync,
    safeJsonParse,
    safeLocalStorage,
    handleNetworkError,
    safeImport,
    handleWebSocketError,
    handlePerformanceError,
    validateData,
    errorRecoveryStrategies,
    initializeErrorHandling
};