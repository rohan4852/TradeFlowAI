/**
 * Enhanced Error Boundary with Reporting
 * Provides error reporting capabilities for the application
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

// Error reporting context
const ErrorReportingContext = createContext();

/**
 * Error reporting provider
 */
export const ErrorReportingProvider = ({ children, onError }) => {
    const [errors, setErrors] = useState([]);

    const reportError = useCallback((error, context = {}) => {
        const errorReport = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            context,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        setErrors(prev => [...prev.slice(-9), errorReport]); // Keep last 10 errors

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error reported:', errorReport);
        }

        // Call external error handler
        if (onError) {
            onError(errorReport);
        }

        return errorReport.id;
    }, [onError]);

    const clearErrors = useCallback(() => {
        setErrors([]);
    }, []);

    const getErrors = useCallback(() => {
        return errors;
    }, [errors]);

    const contextValue = {
        reportError,
        clearErrors,
        getErrors,
        errors
    };

    return (
        <ErrorReportingContext.Provider value={contextValue}>
            {children}
        </ErrorReportingContext.Provider>
    );
};

/**
 * Hook to use error reporting
 */
export const useErrorReporting = () => {
    const context = useContext(ErrorReportingContext);

    if (!context) {
        // Provide fallback error reporting if not wrapped in provider
        return {
            reportError: (error, context) => {
                console.error('Error (no provider):', error, context);
                return Date.now();
            },
            clearErrors: () => { },
            getErrors: () => [],
            errors: []
        };
    }

    return context;
};

/**
 * Enhanced Error Boundary Component
 */
export class EnhancedErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // Report error if reportError function is available
        if (this.props.reportError) {
            const errorId = this.props.reportError(error, {
                componentStack: errorInfo.componentStack,
                componentId: this.props.componentId,
                ...this.props.context
            });
            this.setState({ errorId });
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.state.errorInfo);
            }

            return (
                <div className="enhanced-error-boundary">
                    <div className="error-content">
                        <h3>⚠️ Component Error</h3>
                        <p>An error occurred in the {this.props.componentId || 'component'}.</p>

                        {this.state.errorId && (
                            <p className="error-id">Error ID: {this.state.errorId}</p>
                        )}

                        {process.env.NODE_ENV === 'development' && (
                            <details className="error-details">
                                <summary>Technical Details</summary>
                                <pre>{this.state.error?.toString()}</pre>
                                <pre>{this.state.errorInfo?.componentStack}</pre>
                            </details>
                        )}

                        <button
                            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                            className="retry-button"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default {
    ErrorReportingProvider,
    useErrorReporting,
    EnhancedErrorBoundary
};