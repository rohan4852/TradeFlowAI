/**
 * Theme Customization Tool with Real-time Preview
 * Allows users to customize design system themes and see changes instantly
 */
import React, { useState, useEffect, useRef } from 'react';
import './ThemeCustomizer.css';

/**
 * Default theme configuration
 */
const DEFAULT_THEME = {
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
        secondary: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a'
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
            volume: '#26a69a'
        }
    },
    typography: {
        fontFamily: {
            primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            monospace: 'JetBrains Mono, Fira Code, Consolas, monospace'
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
 * Color picker component
 */
const ColorPicker = ({ label, value, onChange, description }) => {
    return (
        <div className="color-picker-group">
            <label className="color-picker-label">
                {label}
                {description && <span className="color-picker-description">{description}</span>}
            </label>
            <div className="color-picker-wrapper">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="color-picker-input"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="color-picker-text"
                    placeholder="#000000"
                />
            </div>
        </div>
    );
};

/**
 * Font family selector
 */
const FontFamilySelector = ({ label, value, onChange, options }) => {
    return (
        <div className="font-family-group">
            <label className="font-family-label">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="font-family-select"
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

/**
 * Spacing/size input component
 */
const SizeInput = ({ label, value, onChange, unit = 'rem', min = 0, max = 10, step = 0.125 }) => {
    const numericValue = parseFloat(value) || 0;

    return (
        <div className="size-input-group">
            <label className="size-input-label">{label}</label>
            <div className="size-input-wrapper">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={numericValue}
                    onChange={(e) => onChange(`${e.target.value}${unit}`)}
                    className="size-input-range"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="size-input-text"
                />
            </div>
        </div>
    );
};

/**
 * Preview components
 */
const PreviewComponents = ({ theme }) => {
    return (
        <div className="preview-components">
            <div className="preview-section">
                <h3>Buttons</h3>
                <div className="preview-buttons">
                    <button className="preview-btn preview-btn--primary">Primary</button>
                    <button className="preview-btn preview-btn--secondary">Secondary</button>
                    <button className="preview-btn preview-btn--success">Success</button>
                    <button className="preview-btn preview-btn--warning">Warning</button>
                    <button className="preview-btn preview-btn--error">Error</button>
                </div>
            </div>

            <div className="preview-section">
                <h3>Form Elements</h3>
                <div className="preview-form">
                    <div className="preview-input-group">
                        <label>Email Address</label>
                        <input type="email" placeholder="Enter your email" className="preview-input" />
                    </div>
                    <div className="preview-input-group">
                        <label>Password</label>
                        <input type="password" placeholder="Enter password" className="preview-input" />
                    </div>
                    <div className="preview-input-group">
                        <label>Message</label>
                        <textarea placeholder="Enter your message" className="preview-textarea"></textarea>
                    </div>
                </div>
            </div>

            <div className="preview-section">
                <h3>Cards</h3>
                <div className="preview-cards">
                    <div className="preview-card">
                        <h4>Default Card</h4>
                        <p>This is a default card with standard styling.</p>
                    </div>
                    <div className="preview-card preview-card--glass">
                        <h4>Glass Card</h4>
                        <p>This card uses glassmorphism effects.</p>
                    </div>
                    <div className="preview-card preview-card--elevated">
                        <h4>Elevated Card</h4>
                        <p>This card has elevated shadow styling.</p>
                    </div>
                </div>
            </div>

            <div className="preview-section">
                <h3>Trading Components</h3>
                <div className="preview-trading">
                    <div className="preview-price-change bullish">+2.34%</div>
                    <div className="preview-price-change bearish">-1.87%</div>
                    <div className="preview-price-change neutral">0.00%</div>
                    <div className="preview-volume">Volume: 1.2M</div>
                </div>
            </div>

            <div className="preview-section">
                <h3>Typography</h3>
                <div className="preview-typography">
                    <h1 className="preview-h1">Heading 1</h1>
                    <h2 className="preview-h2">Heading 2</h2>
                    <h3 className="preview-h3">Heading 3</h3>
                    <p className="preview-paragraph">
                        This is a paragraph with regular text. It demonstrates the typography
                        settings including font family, size, and weight.
                    </p>
                    <code className="preview-code">const example = 'monospace font';</code>
                </div>
            </div>
        </div>
    );
};

/**
 * Main Theme Customizer Component
 */
const ThemeCustomizer = () => {
    const [theme, setTheme] = useState(DEFAULT_THEME);
    const [activeTab, setActiveTab] = useState('colors');
    const [previewMode, setPreviewMode] = useState('light');
    const styleRef = useRef(null);

    // Font family options
    const fontFamilyOptions = [
        { value: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', label: 'Inter (Default)' },
        { value: 'system-ui, -apple-system, sans-serif', label: 'System UI' },
        { value: '"Helvetica Neue", Helvetica, Arial, sans-serif', label: 'Helvetica' },
        { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
        { value: 'Georgia, serif', label: 'Georgia' },
        { value: '"JetBrains Mono", "Fira Code", Consolas, monospace', label: 'JetBrains Mono' },
        { value: '"SF Mono", Monaco, "Cascadia Code", monospace', label: 'SF Mono' }
    ];

    // Apply theme to preview
    useEffect(() => {
        if (!styleRef.current) {
            styleRef.current = document.createElement('style');
            styleRef.current.id = 'theme-customizer-styles';
            document.head.appendChild(styleRef.current);
        }

        const cssVariables = generateCSSVariables(theme);
        styleRef.current.textContent = `:root { ${cssVariables} }`;

        return () => {
            if (styleRef.current) {
                document.head.removeChild(styleRef.current);
                styleRef.current = null;
            }
        };
    }, [theme]);

    const generateCSSVariables = (themeConfig) => {
        const variables = [];

        // Colors
        Object.entries(themeConfig.colors.primary).forEach(([key, value]) => {
            variables.push(`--color-primary-${key}: ${value}`);
        });

        Object.entries(themeConfig.colors.secondary).forEach(([key, value]) => {
            variables.push(`--color-secondary-${key}: ${value}`);
        });

        Object.entries(themeConfig.colors.semantic).forEach(([key, value]) => {
            variables.push(`--color-${key}: ${value}`);
        });

        Object.entries(themeConfig.colors.trading).forEach(([key, value]) => {
            variables.push(`--color-${key}: ${value}`);
        });

        // Typography
        Object.entries(themeConfig.typography.fontFamily).forEach(([key, value]) => {
            variables.push(`--font-family-${key}: ${value}`);
        });

        Object.entries(themeConfig.typography.fontSize).forEach(([key, value]) => {
            variables.push(`--font-size-${key}: ${value}`);
        });

        Object.entries(themeConfig.typography.fontWeight).forEach(([key, value]) => {
            variables.push(`--font-weight-${key}: ${value}`);
        });

        // Spacing
        Object.entries(themeConfig.spacing).forEach(([key, value]) => {
            variables.push(`--spacing-${key}: ${value}`);
        });

        // Border radius
        Object.entries(themeConfig.borderRadius).forEach(([key, value]) => {
            variables.push(`--border-radius-${key}: ${value}`);
        });

        // Shadows
        Object.entries(themeConfig.shadows).forEach(([key, value]) => {
            variables.push(`--shadow-${key}: ${value}`);
        });

        return variables.join('; ');
    };

    const updateTheme = (path, value) => {
        setTheme(prevTheme => {
            const newTheme = { ...prevTheme };
            const keys = path.split('.');
            let current = newTheme;

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            return newTheme;
        });
    };

    const exportTheme = (format = 'js') => {
        let content = '';
        const timestamp = new Date().toISOString();

        if (format === 'js') {
            content = `/**
 * Custom Theme Configuration
 * Generated by Superior UI Design System Theme Customizer
 * Created: ${timestamp}
 */
export const customTheme = ${JSON.stringify(theme, null, 2)};

export default customTheme;`;
        } else if (format === 'css') {
            content = `/**
 * Custom Theme CSS Variables
 * Generated by Superior UI Design System Theme Customizer
 * Created: ${timestamp}
 */
:root {
${generateCSSVariables(theme).split('; ').map(v => `  ${v};`).join('\n')}
}`;
        } else if (format === 'json') {
            content = JSON.stringify(theme, null, 2);
        }

        // Download file
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `custom-theme.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const resetTheme = () => {
        setTheme(DEFAULT_THEME);
    };

    const tabs = [
        { id: 'colors', name: 'Colors', icon: '🎨' },
        { id: 'typography', name: 'Typography', icon: '📝' },
        { id: 'spacing', name: 'Spacing', icon: '📏' },
        { id: 'effects', name: 'Effects', icon: '✨' }
    ];

    return (
        <div className={`theme-customizer theme-customizer--${previewMode}`}>
            <div className="theme-customizer-header">
                <h1>Theme Customizer</h1>
                <p>Customize your design system theme with real-time preview</p>

                <div className="theme-customizer-controls">
                    <div className="preview-mode-toggle">
                        <button
                            className={`mode-btn ${previewMode === 'light' ? 'active' : ''}`}
                            onClick={() => setPreviewMode('light')}
                        >
                            ☀️ Light
                        </button>
                        <button
                            className={`mode-btn ${previewMode === 'dark' ? 'active' : ''}`}
                            onClick={() => setPreviewMode('dark')}
                        >
                            🌙 Dark
                        </button>
                    </div>

                    <div className="theme-actions">
                        <button onClick={resetTheme} className="action-btn reset-btn">
                            🔄 Reset
                        </button>
                        <div className="export-dropdown">
                            <button className="action-btn export-btn">
                                💾 Export
                            </button>
                            <div className="export-menu">
                                <button onClick={() => exportTheme('js')}>JavaScript</button>
                                <button onClick={() => exportTheme('css')}>CSS</button>
                                <button onClick={() => exportTheme('json')}>JSON</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="theme-customizer-layout">
                <aside className="theme-customizer-sidebar">
                    <nav className="theme-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`theme-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="tab-icon">{tab.icon}</span>
                                <span className="tab-name">{tab.name}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="theme-controls">
                        {activeTab === 'colors' && (
                            <div className="colors-panel">
                                <div className="color-section">
                                    <h3>Primary Colors</h3>
                                    <ColorPicker
                                        label="Primary 500"
                                        value={theme.colors.primary[500]}
                                        onChange={(value) => updateTheme('colors.primary.500', value)}
                                        description="Main brand color"
                                    />
                                </div>

                                <div className="color-section">
                                    <h3>Secondary Colors</h3>
                                    <ColorPicker
                                        label="Secondary 500"
                                        value={theme.colors.secondary[500]}
                                        onChange={(value) => updateTheme('colors.secondary.500', value)}
                                        description="Secondary brand color"
                                    />
                                </div>

                                <div className="color-section">
                                    <h3>Semantic Colors</h3>
                                    <ColorPicker
                                        label="Success"
                                        value={theme.colors.semantic.success}
                                        onChange={(value) => updateTheme('colors.semantic.success', value)}
                                    />
                                    <ColorPicker
                                        label="Warning"
                                        value={theme.colors.semantic.warning}
                                        onChange={(value) => updateTheme('colors.semantic.warning', value)}
                                    />
                                    <ColorPicker
                                        label="Error"
                                        value={theme.colors.semantic.error}
                                        onChange={(value) => updateTheme('colors.semantic.error', value)}
                                    />
                                    <ColorPicker
                                        label="Info"
                                        value={theme.colors.semantic.info}
                                        onChange={(value) => updateTheme('colors.semantic.info', value)}
                                    />
                                </div>

                                <div className="color-section">
                                    <h3>Trading Colors</h3>
                                    <ColorPicker
                                        label="Bullish"
                                        value={theme.colors.trading.bullish}
                                        onChange={(value) => updateTheme('colors.trading.bullish', value)}
                                        description="Positive price movement"
                                    />
                                    <ColorPicker
                                        label="Bearish"
                                        value={theme.colors.trading.bearish}
                                        onChange={(value) => updateTheme('colors.trading.bearish', value)}
                                        description="Negative price movement"
                                    />
                                    <ColorPicker
                                        label="Neutral"
                                        value={theme.colors.trading.neutral}
                                        onChange={(value) => updateTheme('colors.trading.neutral', value)}
                                        description="No change"
                                    />
                                    <ColorPicker
                                        label="Volume"
                                        value={theme.colors.trading.volume}
                                        onChange={(value) => updateTheme('colors.trading.volume', value)}
                                        description="Volume indicators"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'typography' && (
                            <div className="typography-panel">
                                <div className="typography-section">
                                    <h3>Font Families</h3>
                                    <FontFamilySelector
                                        label="Primary Font"
                                        value={theme.typography.fontFamily.primary}
                                        onChange={(value) => updateTheme('typography.fontFamily.primary', value)}
                                        options={fontFamilyOptions}
                                    />
                                    <FontFamilySelector
                                        label="Monospace Font"
                                        value={theme.typography.fontFamily.monospace}
                                        onChange={(value) => updateTheme('typography.fontFamily.monospace', value)}
                                        options={fontFamilyOptions.filter(opt => opt.value.includes('mono'))}
                                    />
                                </div>

                                <div className="typography-section">
                                    <h3>Font Sizes</h3>
                                    <SizeInput
                                        label="Base Size"
                                        value={theme.typography.fontSize.base}
                                        onChange={(value) => updateTheme('typography.fontSize.base', value)}
                                        unit="rem"
                                        min={0.5}
                                        max={2}
                                        step={0.125}
                                    />
                                    <SizeInput
                                        label="Large Size"
                                        value={theme.typography.fontSize.lg}
                                        onChange={(value) => updateTheme('typography.fontSize.lg', value)}
                                        unit="rem"
                                        min={0.5}
                                        max={3}
                                        step={0.125}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'spacing' && (
                            <div className="spacing-panel">
                                <div className="spacing-section">
                                    <h3>Base Spacing</h3>
                                    <SizeInput
                                        label="Spacing 1"
                                        value={theme.spacing[1]}
                                        onChange={(value) => updateTheme('spacing.1', value)}
                                        unit="rem"
                                        min={0}
                                        max={2}
                                        step={0.125}
                                    />
                                    <SizeInput
                                        label="Spacing 4"
                                        value={theme.spacing[4]}
                                        onChange={(value) => updateTheme('spacing.4', value)}
                                        unit="rem"
                                        min={0}
                                        max={4}
                                        step={0.125}
                                    />
                                    <SizeInput
                                        label="Spacing 8"
                                        value={theme.spacing[8]}
                                        onChange={(value) => updateTheme('spacing.8', value)}
                                        unit="rem"
                                        min={0}
                                        max={6}
                                        step={0.125}
                                    />
                                </div>

                                <div className="spacing-section">
                                    <h3>Border Radius</h3>
                                    <SizeInput
                                        label="Base Radius"
                                        value={theme.borderRadius.base}
                                        onChange={(value) => updateTheme('borderRadius.base', value)}
                                        unit="rem"
                                        min={0}
                                        max={2}
                                        step={0.125}
                                    />
                                    <SizeInput
                                        label="Large Radius"
                                        value={theme.borderRadius.lg}
                                        onChange={(value) => updateTheme('borderRadius.lg', value)}
                                        unit="rem"
                                        min={0}
                                        max={3}
                                        step={0.125}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'effects' && (
                            <div className="effects-panel">
                                <div className="effects-section">
                                    <h3>Shadows</h3>
                                    <p>Shadow customization coming soon...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                <main className="theme-customizer-preview">
                    <div className="preview-header">
                        <h2>Live Preview</h2>
                        <p>See your theme changes in real-time</p>
                    </div>

                    <div className="preview-content">
                        <PreviewComponents theme={theme} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ThemeCustomizer;