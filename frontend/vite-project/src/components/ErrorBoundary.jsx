/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to console and potentially to an error reporting service
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // You can also log the error to an error reporting service here
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div className="error-boundary">
                    <div className="error-content">
                        <div className="error-icon">⚠️</div>
                        <h1>Something went wrong</h1>
                        <p>We're sorry, but something unexpected happened.</p>

                        {process.env.NODE_ENV === 'development' && (
                            <details className="error-details">
                                <summary>Error Details (Development)</summary>
                                <pre className="error-stack">
                                    {this.state.error && this.state.error.toString()}
                                    <br />
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="error-actions">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-primary"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                                className="btn btn-secondary"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>

                    <style jsx>{`
                        .error-boundary {
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
                            color: #ffffff;
                            padding: 2rem;
                        }

                        .error-content {
                            text-align: center;
                            max-width: 600px;
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 1rem;
                            padding: 3rem;
                            backdrop-filter: blur(10px);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                        }

                        .error-icon {
                            font-size: 4rem;
                            margin-bottom: 1rem;
                        }

                        .error-content h1 {
                            font-size: 2rem;
                            margin-bottom: 1rem;
                            color: #ef4444;
                        }

                        .error-content p {
                            font-size: 1.125rem;
                            margin-bottom: 2rem;
                            color: rgba(255, 255, 255, 0.8);
                        }

                        .error-details {
                            text-align: left;
                            margin-bottom: 2rem;
                            background: rgba(0, 0, 0, 0.3);
                            border-radius: 0.5rem;
                            padding: 1rem;
                        }

                        .error-details summary {
                            cursor: pointer;
                            font-weight: 600;
                            margin-bottom: 1rem;
                            color: #fbbf24;
                        }

                        .error-stack {
                            font-family: 'Courier New', monospace;
                            font-size: 0.875rem;
                            white-space: pre-wrap;
                            color: rgba(255, 255, 255, 0.9);
                            overflow-x: auto;
                        }

                        .error-actions {
                            display: flex;
                            gap: 1rem;
                            justify-content: center;
                        }

                        .btn {
                            padding: 0.75rem 1.5rem;
                            border: none;
                            border-radius: 0.5rem;
                            font-size: 1rem;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s ease;
                        }

                        .btn-primary {
                            background: linear-gradient(45deg, #00d4ff, #0ea5e9);
                            color: #ffffff;
                        }

                        .btn-primary:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
                        }

                        .btn-secondary {
                            background: rgba(255, 255, 255, 0.1);
                            color: #ffffff;
                            border: 1px solid rgba(255, 255, 255, 0.2);
                        }

                        .btn-secondary:hover {
                            background: rgba(255, 255, 255, 0.2);
                        }
                    `}</style>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;