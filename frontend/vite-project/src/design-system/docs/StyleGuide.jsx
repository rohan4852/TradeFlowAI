/**
 * Interactive Style Guide for Superior UI Design System
 * Provides comprehensive documentation with live examples
 */
import React, { useState, useEffect } from 'react';
import './StyleGuide.css';

// Import design system components (these would be actual imports in a real implementation)
const designSystemComponents = {
    Button: ({ children, variant = 'primary', size = 'medium', ...props }) => (
        <button className={`btn btn-${variant} btn-${size}`} {...props}>
            {children}
        </button>
    ),
    Input: ({ label, error, ...props }) => (
        <div className="input-group">
            {label && <label className="input-label">{label}</label>}
            <input className={`input ${error ? 'input-error' : ''}`} {...props} />
            {error && <span className="input-error-text">{error}</span>}
        </div>
    ),
    Card: ({ children, variant = 'default', ...props }) => (
        <div className={`card card-${variant}`} {...props}>
            {children}
        </div>
    ),
    Badge: ({ children, variant = 'default', ...props }) => (
        <span className={`badge badge-${variant}`} {...props}>
            {children}
        </span>
    )
};

/**
 * Design tokens documentation
 */
const designTokens = {
    colors: {
        primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e'
        },
        semantic: {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        },
        trading: {
            bullish: '#4bffb5',
            bearish: '#ff4976',
            neutral: '#888888',
            volume: '#26a69a',
            spread: '#ff9800'
        },
        glassmorphism: {
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'rgba(255, 255, 255, 0.2)',
            shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
        }
    },
    typography: {
        fontFamily: {
            primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            monospace: '"JetBrains Mono", "Fira Code", Consolas, monospace'
        },
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem'
        },
        fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
        }
    },
    spacing: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem'
    },
    borderRadius: {
        none: '0',
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px'
    },
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        glassmorphism: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
    }
};

/**
 * Component documentation data
 */
const componentDocs = {
    Button: {
        description: 'Interactive button component with multiple variants and states',
        props: {
            variant: {
                type: 'string',
                default: 'primary',
                options: ['primary', 'secondary', 'success', 'warning', 'error', 'ghost', 'glass'],
                description: 'Visual style variant of the button'
            },
            size: {
                type: 'string',
                default: 'medium',
                options: ['small', 'medium', 'large'],
                description: 'Size of the button'
            },
            disabled: {
                type: 'boolean',
                default: false,
                description: 'Whether the button is disabled'
            },
            loading: {
                type: 'boolean',
                default: false,
                description: 'Whether the button shows loading state'
            }
        },
        examples: [
            {
                title: 'Basic Buttons',
                code: `<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="error">Error</Button>`
            },
            {
                title: 'Button Sizes',
                code: `<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>`
            },
            {
                title: 'Button States',
                code: `<Button disabled>Disabled</Button>
<Button loading>Loading</Button>`
            },
            {
                title: 'Glassmorphism Button',
                code: `<Button variant="glass">Glass Effect</Button>`
            }
        ],
        accessibility: {
            guidelines: [
                'Always provide meaningful button text or aria-label',
                'Use proper semantic HTML button element',
                'Ensure sufficient color contrast (4.5:1 minimum)',
                'Support keyboard navigation with Tab and Enter/Space',
                'Provide focus indicators that meet WCAG guidelines'
            ],
            ariaAttributes: [
                'aria-label: Accessible name when text is not descriptive',
                'aria-disabled: Indicates disabled state to screen readers',
                'aria-pressed: For toggle buttons to indicate pressed state'
            ]
        }
    },
    Input: {
        description: 'Form input component with validation and accessibility features',
        props: {
            type: {
                type: 'string',
                default: 'text',
                options: ['text', 'email', 'password', 'number', 'tel', 'url'],
                description: 'HTML input type'
            },
            label: {
                type: 'string',
                description: 'Label text for the input'
            },
            placeholder: {
                type: 'string',
                description: 'Placeholder text'
            },
            error: {
                type: 'string',
                description: 'Error message to display'
            },
            disabled: {
                type: 'boolean',
                default: false,
                description: 'Whether the input is disabled'
            },
            required: {
                type: 'boolean',
                default: false,
                description: 'Whether the input is required'
            }
        },
        examples: [
            {
                title: 'Basic Input',
                code: `<Input label="Email" type="email" placeholder="Enter your email" />`
            },
            {
                title: 'Input with Error',
                code: `<Input label="Password" type="password" error="Password is required" />`
            },
            {
                title: 'Disabled Input',
                code: `<Input label="Username" value="john_doe" disabled />`
            }
        ],
        accessibility: {
            guidelines: [
                'Always associate labels with inputs using htmlFor/id',
                'Provide clear error messages',
                'Use appropriate input types for better mobile experience',
                'Ensure proper tab order',
                'Support screen reader announcements for errors'
            ],
            ariaAttributes: [
                'aria-describedby: Links to error or help text',
                'aria-invalid: Indicates validation state',
                'aria-required: Indicates required fields'
            ]
        }
    }
};

/**
 * Color palette component
 */
const ColorPalette = ({ colors, title }) => (
    <div className="color-palette">
        <h3>{title}</h3>
        <div className="color-grid">
            {Object.entries(colors).map(([name, value]) => {
                const colorValue = typeof value === 'object' ? value[500] || Object.values(value)[0] : value;
                return (
                    <div key={name} className="color-swatch">
                        <div
                            className="color-preview"
                            style={{ backgroundColor: colorValue }}
                            title={`${name}: ${colorValue}`}
                        />
                        <div className="color-info">
                            <div className="color-name">{name}</div>
                            <div className="color-value">{colorValue}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

/**
 * Typography showcase component
 */
const TypographyShowcase = ({ typography }) => (
    <div className="typography-showcase">
        <h3>Typography</h3>

        <div className="typography-section">
            <h4>Font Sizes</h4>
            <div className="font-sizes">
                {Object.entries(typography.fontSize).map(([name, size]) => (
                    <div key={name} className="font-size-example">
                        <span style={{ fontSize: size }}>
                            The quick brown fox jumps over the lazy dog
                        </span>
                        <div className="font-size-info">
                            <strong>{name}</strong>: {size}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="typography-section">
            <h4>Font Weights</h4>
            <div className="font-weights">
                {Object.entries(typography.fontWeight).map(([name, weight]) => (
                    <div key={name} className="font-weight-example">
                        <span style={{ fontWeight: weight }}>
                            Font Weight {name}
                        </span>
                        <div className="font-weight-info">
                            <strong>{name}</strong>: {weight}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/**
 * Component example renderer
 */
const ComponentExample = ({ component, example }) => {
    const [showCode, setShowCode] = useState(false);

    const renderExample = () => {
        try {
            // This is a simplified example renderer
            // In a real implementation, you'd use a proper code parser/renderer
            const Component = designSystemComponents[component];
            if (!Component) return <div>Component not found</div>;

            return (
                <div className="example-preview">
                    <Component>Example</Component>
                </div>
            );
        } catch (error) {
            return <div className="example-error">Error rendering example</div>;
        }
    };

    return (
        <div className="component-example">
            <div className="example-header">
                <h4>{example.title}</h4>
                <button
                    className="code-toggle"
                    onClick={() => setShowCode(!showCode)}
                >
                    {showCode ? 'Hide Code' : 'Show Code'}
                </button>
            </div>

            <div className="example-content">
                {renderExample()}
            </div>

            {showCode && (
                <div className="example-code">
                    <pre><code>{example.code}</code></pre>
                </div>
            )}
        </div>
    );
};

/**
 * Component documentation section
 */
const ComponentDoc = ({ componentName, doc }) => {
    const [activeTab, setActiveTab] = useState('examples');

    return (
        <div className="component-doc">
            <div className="component-header">
                <h2>{componentName}</h2>
                <p className="component-description">{doc.description}</p>
            </div>

            <div className="component-tabs">
                <button
                    className={`tab ${activeTab === 'examples' ? 'active' : ''}`}
                    onClick={() => setActiveTab('examples')}
                >
                    Examples
                </button>
                <button
                    className={`tab ${activeTab === 'props' ? 'active' : ''}`}
                    onClick={() => setActiveTab('props')}
                >
                    Props
                </button>
                <button
                    className={`tab ${activeTab === 'accessibility' ? 'active' : ''}`}
                    onClick={() => setActiveTab('accessibility')}
                >
                    Accessibility
                </button>
            </div>

            <div className="component-content">
                {activeTab === 'examples' && (
                    <div className="examples-section">
                        {doc.examples.map((example, index) => (
                            <ComponentExample
                                key={index}
                                component={componentName}
                                example={example}
                            />
                        ))}
                    </div>
                )}

                {activeTab === 'props' && (
                    <div className="props-section">
                        <table className="props-table">
                            <thead>
                                <tr>
                                    <th>Prop</th>
                                    <th>Type</th>
                                    <th>Default</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(doc.props).map(([propName, propInfo]) => (
                                    <tr key={propName}>
                                        <td><code>{propName}</code></td>
                                        <td>{propInfo.type}</td>
                                        <td>{propInfo.default ? <code>{String(propInfo.default)}</code> : '-'}</td>
                                        <td>{propInfo.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'accessibility' && (
                    <div className="accessibility-section">
                        <div className="accessibility-guidelines">
                            <h4>Accessibility Guidelines</h4>
                            <ul>
                                {doc.accessibility.guidelines.map((guideline, index) => (
                                    <li key={index}>{guideline}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="aria-attributes">
                            <h4>ARIA Attributes</h4>
                            <ul>
                                {doc.accessibility.ariaAttributes.map((attribute, index) => (
                                    <li key={index}><code>{attribute}</code></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Main Style Guide Component
 */
const StyleGuide = () => {
    const [activeSection, setActiveSection] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        document.body.className = `theme-${theme}`;
    }, [theme]);

    const filteredComponents = Object.entries(componentDocs).filter(([name]) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`style-guide theme-${theme}`}>
            {/* Header */}
            <header className="style-guide-header">
                <div className="header-content">
                    <h1>Superior UI Design System</h1>
                    <p>Professional-grade trading interface components</p>

                    <div className="header-controls">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search components..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="theme-toggle">
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="theme-button"
                            >
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="style-guide-layout">
                {/* Sidebar Navigation */}
                <nav className="style-guide-nav">
                    <div className="nav-section">
                        <h3>Foundation</h3>
                        <ul>
                            <li>
                                <button
                                    className={activeSection === 'overview' ? 'active' : ''}
                                    onClick={() => setActiveSection('overview')}
                                >
                                    Overview
                                </button>
                            </li>
                            <li>
                                <button
                                    className={activeSection === 'colors' ? 'active' : ''}
                                    onClick={() => setActiveSection('colors')}
                                >
                                    Colors
                                </button>
                            </li>
                            <li>
                                <button
                                    className={activeSection === 'typography' ? 'active' : ''}
                                    onClick={() => setActiveSection('typography')}
                                >
                                    Typography
                                </button>
                            </li>
                            <li>
                                <button
                                    className={activeSection === 'spacing' ? 'active' : ''}
                                    onClick={() => setActiveSection('spacing')}
                                >
                                    Spacing
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="nav-section">
                        <h3>Components</h3>
                        <ul>
                            {Object.keys(componentDocs).map(componentName => (
                                <li key={componentName}>
                                    <button
                                        className={activeSection === componentName ? 'active' : ''}
                                        onClick={() => setActiveSection(componentName)}
                                    >
                                        {componentName}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="style-guide-content">
                    {activeSection === 'overview' && (
                        <div className="overview-section">
                            <h2>Design System Overview</h2>
                            <p>
                                The Superior UI Design System provides a comprehensive set of components
                                and design tokens for building professional trading interfaces that rival
                                industry leaders like TradingView and Walbi.
                            </p>

                            <div className="overview-features">
                                <div className="feature-card">
                                    <h3>🎨 Modern Design</h3>
                                    <p>Glassmorphism effects, smooth animations, and professional aesthetics</p>
                                </div>
                                <div className="feature-card">
                                    <h3>⚡ High Performance</h3>
                                    <p>Optimized for real-time data updates and smooth 60fps interactions</p>
                                </div>
                                <div className="feature-card">
                                    <h3>♿ Accessible</h3>
                                    <p>WCAG 2.1 AA compliant with full keyboard and screen reader support</p>
                                </div>
                                <div className="feature-card">
                                    <h3>📱 Responsive</h3>
                                    <p>Mobile-first design that works seamlessly across all devices</p>
                                </div>
                            </div>

                            <div className="getting-started">
                                <h3>Getting Started</h3>
                                <pre><code>{`import { Button, Input, Card } from '@/design-system';

function MyComponent() {
  return (
    <Card variant="glass">
      <Input label="Symbol" placeholder="AAPL" />
      <Button variant="primary">Add to Watchlist</Button>
    </Card>
  );
}`}</code></pre>
                            </div>
                        </div>
                    )}

                    {activeSection === 'colors' && (
                        <div className="colors-section">
                            <h2>Color System</h2>
                            <p>Our color system is designed for professional trading interfaces with support for both light and dark themes.</p>

                            <ColorPalette colors={designTokens.colors.primary} title="Primary Colors" />
                            <ColorPalette colors={designTokens.colors.semantic} title="Semantic Colors" />
                            <ColorPalette colors={designTokens.colors.trading} title="Trading Colors" />

                            <div className="color-usage">
                                <h3>Usage Guidelines</h3>
                                <ul>
                                    <li><strong>Bullish (Green):</strong> Use for positive price movements, gains, buy signals</li>
                                    <li><strong>Bearish (Red):</strong> Use for negative price movements, losses, sell signals</li>
                                    <li><strong>Neutral (Gray):</strong> Use for unchanged values, disabled states</li>
                                    <li><strong>Volume (Teal):</strong> Use for volume indicators and secondary metrics</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeSection === 'typography' && (
                        <TypographyShowcase typography={designTokens.typography} />
                    )}

                    {activeSection === 'spacing' && (
                        <div className="spacing-section">
                            <h2>Spacing System</h2>
                            <p>Consistent spacing creates visual hierarchy and improves readability.</p>

                            <div className="spacing-scale">
                                {Object.entries(designTokens.spacing).map(([name, value]) => (
                                    <div key={name} className="spacing-example">
                                        <div className="spacing-visual" style={{ width: value, height: '20px' }} />
                                        <div className="spacing-info">
                                            <strong>{name}</strong>: {value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Component Documentation */}
                    {componentDocs[activeSection] && (
                        <ComponentDoc
                            componentName={activeSection}
                            doc={componentDocs[activeSection]}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default StyleGuide;