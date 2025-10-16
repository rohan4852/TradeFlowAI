/**
 * Interactive Component Playground
 * Allows testing and experimentation with design system components
 */
import React, { useState, useEffect, useRef } from 'react';
import './ComponentPlayground.css';

/**
 * Mock design system components for playground
 */
const PlaygroundComponents = {
    Button: ({ children, variant = 'primary', size = 'medium', disabled = false, loading = false, ...props }) => (
        <button
            className={`playground-btn btn-${variant} btn-${size} ${disabled ? 'disabled' : ''} ${loading ? 'loading' : ''}`}
            disabled={disabled}
            {...props}
        >
            {loading && <span className="loading-spinner">⟳</span>}
            {children}
        </button>
    ),

    Input: ({ label, error, type = 'text', placeholder, disabled = false, ...props }) => (
        <div className="playground-input-group">
            {label && <label className="playground-label">{label}</label>}
            <input
                type={type}
                placeholder={placeholder}
                className={`playground-input ${error ? 'error' : ''}`}
                disabled={disabled}
                {...props}
            />
            {error && <span className="playground-error">{error}</span>}
        </div>
    ),

    Card: ({ children, variant = 'default', padding = 'medium', ...props }) => (
        <div className={`playground-card card-${variant} padding-${padding}`} {...props}>
            {children}
        </div>
    ),

    Badge: ({ children, variant = 'default', size = 'medium', ...props }) => (
        <span className={`playground-badge badge-${variant} badge-${size}`} {...props}>
            {children}
        </span>
    ),

    CandlestickChart: ({ symbol = 'AAPL', height = '300px', showVolume = true, ...props }) => (
        <div className="playground-chart" style={{ height }} {...props}>
            <div className="chart-header">
                <h3>{symbol} Chart</h3>
                <div className="chart-controls">
                    <button className="chart-btn active">1D</button>
                    <button className="chart-btn">1W</button>
                    <button className="chart-btn">1M</button>
                </div>
            </div>
            <div className="chart-content">
                <div className="candlestick-placeholder">
                    <div className="candle green" style={{ height: '60%' }}></div>
                    <div className="candle red" style={{ height: '80%' }}></div>
                    <div className="candle green" style={{ height: '40%' }}></div>
                    <div className="candle green" style={{ height: '90%' }}></div>
                    <div className="candle red" style={{ height: '70%' }}></div>
                    <div className="candle green" style={{ height: '85%' }}></div>
                </div>
                {showVolume && (
                    <div className="volume-placeholder">
                        <div className="volume-bar" style={{ height: '30%' }}></div>
                        <div className="volume-bar" style={{ height: '60%' }}></div>
                        <div className="volume-bar" style={{ height: '20%' }}></div>
                        <div className="volume-bar" style={{ height: '80%' }}></div>
                        <div className="volume-bar" style={{ height: '40%' }}></div>
                        <div className="volume-bar" style={{ height: '70%' }}></div>
                    </div>
                )}
            </div>
        </div>
    ),

    OrderBook: ({ symbol = 'AAPL', maxDepth = 10, ...props }) => (
        <div className="playground-orderbook" {...props}>
            <div className="orderbook-header">
                <h3>{symbol} Order Book</h3>
                <div className="spread">Spread: $0.02</div>
            </div>
            <div className="orderbook-content">
                <div className="asks">
                    <div className="orderbook-header-row">
                        <span>Price</span>
                        <span>Size</span>
                        <span>Total</span>
                    </div>
                    {Array.from({ length: Math.min(maxDepth, 5) }, (_, i) => (
                        <div key={i} className="order-level ask">
                            <span className="price">${(150.25 + i * 0.01).toFixed(2)}</span>
                            <span className="size">{(100 + i * 50).toLocaleString()}</span>
                            <span className="total">{(100 + i * 50 + (i * 25)).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
                <div className="bids">
                    {Array.from({ length: Math.min(maxDepth, 5) }, (_, i) => (
                        <div key={i} className="order-level bid">
                            <span className="price">${(150.23 - i * 0.01).toFixed(2)}</span>
                            <span className="size">{(120 + i * 30).toLocaleString()}</span>
                            <span className="total">{(120 + i * 30 + (i * 20)).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};

/**
 * Component configurations for the playground
 */
const componentConfigs = {
    Button: {
        props: {
            children: { type: 'text', default: 'Click me', label: 'Text' },
            variant: {
                type: 'select',
                default: 'primary',
                options: ['primary', 'secondary', 'success', 'warning', 'error', 'ghost', 'glass'],
                label: 'Variant'
            },
            size: {
                type: 'select',
                default: 'medium',
                options: ['small', 'medium', 'large'],
                label: 'Size'
            },
            disabled: { type: 'boolean', default: false, label: 'Disabled' },
            loading: { type: 'boolean', default: false, label: 'Loading' }
        }
    },

    Input: {
        props: {
            label: { type: 'text', default: 'Label', label: 'Label' },
            placeholder: { type: 'text', default: 'Enter text...', label: 'Placeholder' },
            type: {
                type: 'select',
                default: 'text',
                options: ['text', 'email', 'password', 'number', 'tel', 'url'],
                label: 'Type'
            },
            error: { type: 'text', default: '', label: 'Error Message' },
            disabled: { type: 'boolean', default: false, label: 'Disabled' }
        }
    },

    Card: {
        props: {
            children: { type: 'text', default: 'Card content goes here...', label: 'Content' },
            variant: {
                type: 'select',
                default: 'default',
                options: ['default', 'glass', 'elevated'],
                label: 'Variant'
            },
            padding: {
                type: 'select',
                default: 'medium',
                options: ['small', 'medium', 'large'],
                label: 'Padding'
            }
        }
    },

    Badge: {
        props: {
            children: { type: 'text', default: 'Badge', label: 'Text' },
            variant: {
                type: 'select',
                default: 'default',
                options: ['default', 'primary', 'success', 'warning', 'error'],
                label: 'Variant'
            },
            size: {
                type: 'select',
                default: 'medium',
                options: ['small', 'medium', 'large'],
                label: 'Size'
            }
        }
    },

    CandlestickChart: {
        props: {
            symbol: { type: 'text', default: 'AAPL', label: 'Symbol' },
            height: { type: 'text', default: '300px', label: 'Height' },
            showVolume: { type: 'boolean', default: true, label: 'Show Volume' }
        }
    },

    OrderBook: {
        props: {
            symbol: { type: 'text', default: 'AAPL', label: 'Symbol' },
            maxDepth: { type: 'number', default: 10, label: 'Max Depth', min: 1, max: 50 }
        }
    }
};

/**
 * Property control component
 */
const PropControl = ({ propName, propConfig, value, onChange }) => {
    const { type, label, options, min, max } = propConfig;

    switch (type) {
        case 'text':
            return (
                <div className="prop-control">
                    <label>{label}</label>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(propName, e.target.value)}
                        className="prop-input"
                    />
                </div>
            );

        case 'number':
            return (
                <div className="prop-control">
                    <label>{label}</label>
                    <input
                        type="number"
                        value={value}
                        min={min}
                        max={max}
                        onChange={(e) => onChange(propName, parseInt(e.target.value) || 0)}
                        className="prop-input"
                    />
                </div>
            );

        case 'boolean':
            return (
                <div className="prop-control">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => onChange(propName, e.target.checked)}
                            className="prop-checkbox"
                        />
                        {label}
                    </label>
                </div>
            );

        case 'select':
            return (
                <div className="prop-control">
                    <label>{label}</label>
                    <select
                        value={value}
                        onChange={(e) => onChange(propName, e.target.value)}
                        className="prop-select"
                    >
                        {options.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            );

        default:
            return null;
    }
};

/**
 * Code generator
 */
const generateCode = (componentName, props) => {
    const Component = PlaygroundComponents[componentName];
    if (!Component) return '';

    const propStrings = Object.entries(props)
        .filter(([key, value]) => {
            const config = componentConfigs[componentName]?.props[key];
            return config && value !== config.default;
        })
        .map(([key, value]) => {
            if (typeof value === 'boolean') {
                return value ? key : `${key}={false}`;
            } else if (typeof value === 'string') {
                return key === 'children' ? null : `${key}="${value}"`;
            } else {
                return `${key}={${value}}`;
            }
        })
        .filter(Boolean);

    const childrenProp = props.children;
    const hasChildren = childrenProp && childrenProp !== componentConfigs[componentName]?.props?.children?.default;

    if (hasChildren) {
        return `<${componentName}${propStrings.length > 0 ? ' ' + propStrings.join(' ') : ''}>
  ${childrenProp}
</${componentName}>`;
    } else {
        return `<${componentName}${propStrings.length > 0 ? ' ' + propStrings.join(' ') : ''} />`;
    }
};

/**
 * Main Component Playground
 */
const ComponentPlayground = () => {
    const [selectedComponent, setSelectedComponent] = useState('Button');
    const [props, setProps] = useState({});
    const [showCode, setShowCode] = useState(true);
    const [theme, setTheme] = useState('dark');
    const [previewBackground, setPreviewBackground] = useState('default');

    const codeRef = useRef(null);

    // Initialize props when component changes
    useEffect(() => {
        const config = componentConfigs[selectedComponent];
        if (config) {
            const initialProps = {};
            Object.entries(config.props).forEach(([key, propConfig]) => {
                initialProps[key] = propConfig.default;
            });
            setProps(initialProps);
        }
    }, [selectedComponent]);

    // Update theme
    useEffect(() => {
        document.body.className = `theme-${theme}`;
    }, [theme]);

    const handlePropChange = (propName, value) => {
        setProps(prev => ({
            ...prev,
            [propName]: value
        }));
    };

    const copyCode = async () => {
        const code = generateCode(selectedComponent, props);
        try {
            await navigator.clipboard.writeText(code);
            // Show success feedback
            if (codeRef.current) {
                const originalText = codeRef.current.textContent;
                codeRef.current.textContent = 'Copied!';
                setTimeout(() => {
                    codeRef.current.textContent = originalText;
                }, 1000);
            }
        } catch (error) {
            console.error('Failed to copy code:', error);
        }
    };

    const resetProps = () => {
        const config = componentConfigs[selectedComponent];
        if (config) {
            const resetProps = {};
            Object.entries(config.props).forEach(([key, propConfig]) => {
                resetProps[key] = propConfig.default;
            });
            setProps(resetProps);
        }
    };

    const Component = PlaygroundComponents[selectedComponent];
    const config = componentConfigs[selectedComponent];

    return (
        <div className={`component-playground theme-${theme}`}>
            {/* Header */}
            <header className="playground-header">
                <div className="header-content">
                    <h1>Component Playground</h1>
                    <p>Test and experiment with design system components</p>

                    <div className="header-controls">
                        <div className="component-selector">
                            <label>Component:</label>
                            <select
                                value={selectedComponent}
                                onChange={(e) => setSelectedComponent(e.target.value)}
                                className="component-select"
                            >
                                {Object.keys(componentConfigs).map(name => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="theme-controls">
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="theme-toggle"
                            >
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="playground-layout">
                {/* Controls Panel */}
                <aside className="controls-panel">
                    <div className="panel-header">
                        <h3>Properties</h3>
                        <button onClick={resetProps} className="reset-btn">
                            Reset
                        </button>
                    </div>

                    <div className="controls-content">
                        {config && Object.entries(config.props).map(([propName, propConfig]) => (
                            <PropControl
                                key={propName}
                                propName={propName}
                                propConfig={propConfig}
                                value={props[propName]}
                                onChange={handlePropChange}
                            />
                        ))}
                    </div>

                    <div className="preview-controls">
                        <h4>Preview Settings</h4>
                        <div className="prop-control">
                            <label>Background</label>
                            <select
                                value={previewBackground}
                                onChange={(e) => setPreviewBackground(e.target.value)}
                                className="prop-select"
                            >
                                <option value="default">Default</option>
                                <option value="dark">Dark</option>
                                <option value="light">Light</option>
                                <option value="glass">Glass</option>
                                <option value="gradient">Gradient</option>
                            </select>
                        </div>
                    </div>
                </aside>

                {/* Preview Area */}
                <main className="preview-area">
                    <div className="preview-header">
                        <h3>Preview</h3>
                        <div className="preview-actions">
                            <button
                                onClick={() => setShowCode(!showCode)}
                                className="toggle-code-btn"
                            >
                                {showCode ? 'Hide Code' : 'Show Code'}
                            </button>
                        </div>
                    </div>

                    <div className={`preview-container background-${previewBackground}`}>
                        <div className="component-preview">
                            {Component && <Component {...props} />}
                        </div>
                    </div>

                    {showCode && (
                        <div className="code-panel">
                            <div className="code-header">
                                <h4>Generated Code</h4>
                                <button onClick={copyCode} className="copy-btn" ref={codeRef}>
                                    📋 Copy
                                </button>
                            </div>
                            <pre className="code-block">
                                <code>{generateCode(selectedComponent, props)}</code>
                            </pre>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ComponentPlayground;