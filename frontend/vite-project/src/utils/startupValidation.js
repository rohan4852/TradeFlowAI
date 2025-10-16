/**
 * Startup Validation Utilities
 * Validates the application environment and dependencies on startup
 */

/**
 * Check if required browser APIs are available
 */
export const validateBrowserAPIs = () => {
    const requiredAPIs = [
        'WebSocket',
        'localStorage',
        'sessionStorage',
        'fetch',
        'Promise',
        'Map',
        'Set'
    ];

    const missingAPIs = requiredAPIs.filter(api => !(api in window));

    if (missingAPIs.length > 0) {
        console.error('Missing required browser APIs:', missingAPIs);
        return false;
    }

    return true;
};

/**
 * Check if required React features are available
 */
export const validateReactFeatures = () => {
    try {
        // Check if React is available globally
        if (typeof window !== 'undefined' && window.React) {
            const React = window.React;
            // Check for React hooks
            if (!React.useState || !React.useEffect || !React.useRef) {
                console.error('React hooks not available');
                return false;
            }

            // Check for React context
            if (!React.createContext || !React.useContext) {
                console.error('React context not available');
                return false;
            }
        } else {
            // Try to import React dynamically
            try {
                const ReactModule = require('react');
                if (!ReactModule.useState || !ReactModule.useEffect || !ReactModule.useRef) {
                    console.error('React hooks not available');
                    return false;
                }
            } catch (importError) {
                console.warn('React not available for validation');
                return true; // Don't fail validation if React can't be imported
            }
        }

        return true;
    } catch (error) {
        console.error('React validation error:', error);
        return false;
    }
};

/**
 * Validate environment variables
 */
export const validateEnvironment = () => {
    const warnings = [];

    // Check for development vs production
    if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Running in development mode');
    } else {
        console.log('✓ Running in production mode');
    }

    // Check for API URLs
    if (!import.meta.env.VITE_API_BASE_URL) {
        warnings.push('VITE_API_BASE_URL not set, using default');
    }

    if (warnings.length > 0) {
        console.warn('Environment warnings:', warnings);
    }

    return true;
};

/**
 * Check localStorage availability and quota
 */
export const validateStorage = () => {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        console.error('localStorage not available:', error);
        return false;
    }
};

/**
 * Validate network connectivity
 */
export const validateNetworkConnectivity = async () => {
    try {
        // Check if online
        if (!navigator.onLine) {
            console.warn('Device appears to be offline');
            return false;
        }

        // Try to fetch a small resource
        const response = await fetch('/favicon.ico', {
            method: 'HEAD',
            cache: 'no-cache'
        });

        return response.ok;
    } catch (error) {
        console.warn('Network connectivity check failed:', error);
        return false;
    }
};

/**
 * Validate WebSocket support
 */
export const validateWebSocketSupport = () => {
    if (!window.WebSocket) {
        console.error('WebSocket not supported');
        return false;
    }

    try {
        // Test WebSocket creation (don't connect)
        const testWs = new WebSocket('ws://localhost:1234');
        testWs.close();
        return true;
    } catch (error) {
        console.error('WebSocket creation failed:', error);
        return false;
    }
};

/**
 * Validate performance APIs
 */
export const validatePerformanceAPIs = () => {
    const performanceFeatures = {
        performance: !!window.performance,
        performanceObserver: !!window.PerformanceObserver,
        intersectionObserver: !!window.IntersectionObserver,
        mutationObserver: !!window.MutationObserver,
        requestAnimationFrame: !!window.requestAnimationFrame
    };

    const missingFeatures = Object.entries(performanceFeatures)
        .filter(([, available]) => !available)
        .map(([feature]) => feature);

    if (missingFeatures.length > 0) {
        console.warn('Missing performance APIs:', missingFeatures);
    }

    return performanceFeatures;
};

/**
 * Run comprehensive startup validation
 */
export const runStartupValidation = async () => {
    console.log('🔍 Running startup validation...');

    const results = {
        browserAPIs: validateBrowserAPIs(),
        reactFeatures: validateReactFeatures(),
        environment: validateEnvironment(),
        storage: validateStorage(),
        webSocket: validateWebSocketSupport(),
        performanceAPIs: validatePerformanceAPIs(),
        networkConnectivity: await validateNetworkConnectivity()
    };

    const criticalFailures = [];
    const warnings = [];

    // Check for critical failures
    if (!results.browserAPIs) criticalFailures.push('Browser APIs');
    if (!results.reactFeatures) criticalFailures.push('React Features');
    if (!results.storage) criticalFailures.push('Local Storage');

    // Check for warnings
    if (!results.webSocket) warnings.push('WebSocket Support');
    if (!results.networkConnectivity) warnings.push('Network Connectivity');

    // Log results
    if (criticalFailures.length > 0) {
        console.error('✗ Critical validation failures:', criticalFailures);
        return { success: false, failures: criticalFailures, warnings };
    }

    if (warnings.length > 0) {
        console.warn('⚠️ Validation warnings:', warnings);
    }

    console.log('✅ Startup validation completed successfully');
    return { success: true, failures: [], warnings, results };
};

/**
 * Display validation results to user if needed
 */
export const displayValidationResults = (results) => {
    if (!results.success) {
        const message = `Application startup failed due to missing requirements:\n${results.failures.join(', ')}\n\nPlease update your browser or check your environment.`;

        // Show user-friendly error
        if (document.body) {
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: #1a1a2e;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    font-family: Arial, sans-serif;
                ">
                    <div style="text-align: center; max-width: 500px; padding: 2rem;">
                        <h1 style="color: #ef4444; margin-bottom: 1rem;">⚠️ Startup Failed</h1>
                        <p style="margin-bottom: 2rem; line-height: 1.5;">${message}</p>
                        <button onclick="window.location.reload()" style="
                            background: #00d4ff;
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 0.5rem;
                            cursor: pointer;
                            font-size: 1rem;
                        ">Retry</button>
                    </div>
                </div>
            `;
            document.body.appendChild(errorDiv);
        } else {
            alert(message);
        }
    }
};

export default {
    validateBrowserAPIs,
    validateReactFeatures,
    validateEnvironment,
    validateStorage,
    validateNetworkConnectivity,
    validateWebSocketSupport,
    validatePerformanceAPIs,
    runStartupValidation,
    displayValidationResults
};