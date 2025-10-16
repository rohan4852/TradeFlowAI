/**
 * Fallback Components
 * Provides fallback implementations for missing or failed components
 */
import React from 'react';

// Generic fallback component
export const FallbackComponent = ({
    componentName = 'Component',
    error = null,
    children = null,
    className = '',
    style = {}
}) => {
    return (
        <div
            className={`fallback-component ${className}`}
            style={{
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
                ...style
            }}
        >
            <div style={{ marginBottom: '0.5rem' }}>⚠️</div>
            <div style={{ fontSize: '0.875rem' }}>
                {error ? `Error loading ${componentName}` : `${componentName} not available`}
            </div>
            {process.env.NODE_ENV === 'development' && error && (
                <div style={{
                    fontSize: '0.75rem',
                    marginTop: '0.5rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontFamily: 'monospace'
                }}>
                    {error.message}
                </div>
            )}
            {children}
        </div>
    );
};

// Specific fallback components
export const CandlestickChartFallback = (props) => (
    <FallbackComponent
        componentName="CandlestickChart"
        {...props}
        style={{ height: '400px', ...props.style }}
    >
        <div style={{ marginTop: '1rem' }}>
            📈 Chart component will be available soon
        </div>
    </FallbackComponent>
);

export const OrderBookFallback = (props) => (
    <FallbackComponent
        componentName="OrderBook"
        {...props}
        style={{ height: '300px', ...props.style }}
    >
        <div style={{ marginTop: '1rem' }}>
            📊 Order book component will be available soon
        </div>
    </FallbackComponent>
);

export const WidgetFallback = (props) => (
    <FallbackComponent
        componentName="Widget"
        {...props}
    >
        <div style={{ marginTop: '1rem' }}>
            🔧 Widget component will be available soon
        </div>
    </FallbackComponent>
);

export const GridLayoutFallback = ({ children, ...props }) => (
    <div
        style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            ...props.style
        }}
        {...props}
    >
        {children}
    </div>
);

// HOC for safe component loading
export const withFallback = (Component, FallbackComponent = FallbackComponent) => {
    return React.forwardRef((props, ref) => {
        try {
            if (!Component) {
                return <FallbackComponent componentName="Unknown" {...props} />;
            }
            return <Component ref={ref} {...props} />;
        } catch (error) {
            console.error('Component render error:', error);
            return <FallbackComponent error={error} {...props} />;
        }
    });
};

// Safe component loader
export const safeComponent = (componentLoader, fallback = null) => {
    return React.lazy(async () => {
        try {
            const component = await componentLoader();
            return component;
        } catch (error) {
            console.error('Component loading error:', error);
            return {
                default: fallback || (() => <FallbackComponent error={error} />)
            };
        }
    });
};

export default {
    FallbackComponent,
    CandlestickChartFallback,
    OrderBookFallback,
    WidgetFallback,
    GridLayoutFallback,
    withFallback,
    safeComponent
};