/**
 * Accessibility Testing Tool for Design System Components
 * Provides automated accessibility testing and validation
 */
import React, { useState, useEffect, useRef } from 'react';

/**
 * Accessibility test categories
 */
const TEST_CATEGORIES = {
    COLOR_CONTRAST: 'color_contrast',
    KEYBOARD_NAVIGATION: 'keyboard_navigation',
    SCREEN_READER: 'screen_reader',
    FOCUS_MANAGEMENT: 'focus_management',
    ARIA_ATTRIBUTES: 'aria_attributes',
    SEMANTIC_HTML: 'semantic_html'
};

/**
 * WCAG compliance levels
 */
const WCAG_LEVELS = {
    A: 'A',
    AA: 'AA',
    AAA: 'AAA'
};

/**
 * Color contrast checker
 */
const checkColorContrast = (foreground, background) => {
    // Convert hex to RGB
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    // Calculate relative luminance
    const getLuminance = (rgb) => {
        const { r, g, b } = rgb;
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const fgRgb = hexToRgb(foreground);
    const bgRgb = hexToRgb(background);

    if (!fgRgb || !bgRgb) return null;

    const fgLuminance = getLuminance(fgRgb);
    const bgLuminance = getLuminance(bgRgb);

    const contrast = (Math.max(fgLuminance, bgLuminance) + 0.05) /
        (Math.min(fgLuminance, bgLuminance) + 0.05);

    return {
        ratio: Math.round(contrast * 100) / 100,
        passAA: contrast >= 4.5,
        passAAA: contrast >= 7,
        passAALarge: contrast >= 3,
        passAAALarge: contrast >= 4.5
    };
};

/**
 * Keyboard navigation tester
 */
const KeyboardNavigationTester = ({ onResult }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [keySequence, setKeySequence] = useState([]);
    const [focusableElements, setFocusableElements] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        if (isRecording) {
            const handleKeyDown = (e) => {
                const key = e.key;
                const timestamp = Date.now();

                setKeySequence(prev => [...prev, { key, timestamp, target: e.target.tagName }]);

                // Track focus changes
                if (key === 'Tab') {
                    setTimeout(() => {
                        const activeElement = document.activeElement;
                        if (activeElement) {
                            setFocusableElements(prev => {
                                const exists = prev.find(el => el.element === activeElement);
                                if (!exists) {
                                    return [...prev, {
                                        element: activeElement,
                                        tagName: activeElement.tagName,
                                        hasTabIndex: activeElement.hasAttribute('tabindex'),
                                        tabIndex: activeElement.tabIndex,
                                        hasAriaLabel: activeElement.hasAttribute('aria-label'),
                                        role: activeElement.getAttribute('role')
                                    }];
                                }
                                return prev;
                            });
                        }
                    }, 10);
                }
            };

            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isRecording]);

    const startRecording = () => {
        setIsRecording(true);
        setKeySequence([]);
        setFocusableElements([]);
    };

    const stopRecording = () => {
        setIsRecording(false);

        // Analyze results
        const tabCount = keySequence.filter(k => k.key === 'Tab').length;
        const enterCount = keySequence.filter(k => k.key === 'Enter').length;
        const spaceCount = keySequence.filter(k => k.key === ' ').length;
        const escapeCount = keySequence.filter(k => k.key === 'Escape').length;

        const result = {
            category: TEST_CATEGORIES.KEYBOARD_NAVIGATION,
            passed: focusableElements.length > 0 && tabCount > 0,
            score: Math.min(100, (focusableElements.length * 20) + (tabCount * 10)),
            details: {
                totalKeys: keySequence.length,
                tabCount,
                enterCount,
                spaceCount,
                escapeCount,
                focusableElements: focusableElements.length,
                elements: focusableElements
            },
            recommendations: [
                tabCount === 0 ? 'No Tab key usage detected. Ensure components are keyboard navigable.' : null,
                focusableElements.length === 0 ? 'No focusable elements detected.' : null,
                focusableElements.some(el => !el.hasAriaLabel && !el.role) ? 'Some elements lack ARIA labels or roles.' : null
            ].filter(Boolean)
        };

        onResult(result);
    };

    return (
        <div className="keyboard-tester" ref={containerRef}>
            <div className="tester-header">
                <h4>Keyboard Navigation Test</h4>
                <p>Test keyboard navigation by pressing Tab, Enter, Space, and Escape keys.</p>
            </div>

            <div className="tester-controls">
                {!isRecording ? (
                    <button onClick={startRecording} className="test-btn start">
                        🎯 Start Recording
                    </button>
                ) : (
                    <button onClick={stopRecording} className="test-btn stop">
                        ⏹️ Stop Recording
                    </button>
                )}
            </div>

            {isRecording && (
                <div className="recording-indicator">
                    <div className="recording-dot"></div>
                    <span>Recording keyboard interactions...</span>
                </div>
            )}

            {keySequence.length > 0 && (
                <div className="key-sequence">
                    <h5>Key Sequence:</h5>
                    <div className="keys">
                        {keySequence.map((key, index) => (
                            <span key={index} className="key-badge">
                                {key.key}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Color contrast tester
 */
const ColorContrastTester = ({ onResult }) => {
    const [foregroundColor, setForegroundColor] = useState('#000000');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [fontSize, setFontSize] = useState(16);
    const [contrastResult, setContrastResult] = useState(null);

    useEffect(() => {
        const result = checkColorContrast(foregroundColor, backgroundColor);
        setContrastResult(result);

        if (result) {
            const isLargeText = fontSize >= 18 || fontSize >= 14; // 14pt bold or 18pt normal
            const passed = isLargeText ? result.passAALarge : result.passAA;

            onResult({
                category: TEST_CATEGORIES.COLOR_CONTRAST,
                passed,
                score: Math.min(100, (result.ratio / 4.5) * 100),
                details: {
                    ratio: result.ratio,
                    foregroundColor,
                    backgroundColor,
                    fontSize,
                    isLargeText,
                    wcagAA: result.passAA,
                    wcagAAA: result.passAAA,
                    wcagAALarge: result.passAALarge,
                    wcagAAALarge: result.passAAALarge
                },
                recommendations: [
                    !result.passAA ? 'Contrast ratio does not meet WCAG AA standards (4.5:1)' : null,
                    !result.passAAA ? 'Consider improving contrast for AAA compliance (7:1)' : null,
                    result.ratio < 3 ? 'Contrast is critically low and may be unreadable' : null
                ].filter(Boolean)
            });
        }
    }, [foregroundColor, backgroundColor, fontSize, onResult]);

    return (
        <div className="contrast-tester">
            <div className="tester-header">
                <h4>Color Contrast Test</h4>
                <p>Test color combinations for WCAG compliance.</p>
            </div>

            <div className="contrast-controls">
                <div className="color-input-group">
                    <label>Foreground Color:</label>
                    <div className="color-input-wrapper">
                        <input
                            type="color"
                            value={foregroundColor}
                            onChange={(e) => setForegroundColor(e.target.value)}
                            className="color-picker"
                        />
                        <input
                            type="text"
                            value={foregroundColor}
                            onChange={(e) => setForegroundColor(e.target.value)}
                            className="color-text"
                        />
                    </div>
                </div>

                <div className="color-input-group">
                    <label>Background Color:</label>
                    <div className="color-input-wrapper">
                        <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="color-picker"
                        />
                        <input
                            type="text"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="color-text"
                        />
                    </div>
                </div>

                <div className="font-size-input">
                    <label>Font Size (px):</label>
                    <input
                        type="number"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        min="8"
                        max="72"
                        className="size-input"
                    />
                </div>
            </div>

            <div className="contrast-preview">
                <div
                    className="preview-text"
                    style={{
                        color: foregroundColor,
                        backgroundColor: backgroundColor,
                        fontSize: `${fontSize}px`
                    }}
                >
                    Sample text for contrast testing
                </div>
            </div>

            {contrastResult && (
                <div className="contrast-results">
                    <div className="contrast-ratio">
                        <strong>Contrast Ratio: {contrastResult.ratio}:1</strong>
                    </div>

                    <div className="wcag-compliance">
                        <div className={`compliance-item ${contrastResult.passAA ? 'pass' : 'fail'}`}>
                            <span className="compliance-level">WCAG AA</span>
                            <span className="compliance-status">
                                {contrastResult.passAA ? '✅ Pass' : '❌ Fail'}
                            </span>
                        </div>

                        <div className={`compliance-item ${contrastResult.passAAA ? 'pass' : 'fail'}`}>
                            <span className="compliance-level">WCAG AAA</span>
                            <span className="compliance-status">
                                {contrastResult.passAAA ? '✅ Pass' : '❌ Fail'}
                            </span>
                        </div>

                        <div className={`compliance-item ${contrastResult.passAALarge ? 'pass' : 'fail'}`}>
                            <span className="compliance-level">WCAG AA Large</span>
                            <span className="compliance-status">
                                {contrastResult.passAALarge ? '✅ Pass' : '❌ Fail'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * ARIA attributes checker
 */
const AriaAttributesChecker = ({ onResult }) => {
    const [targetSelector, setTargetSelector] = useState('');
    const [scanResults, setScanResults] = useState(null);

    const scanForAria = () => {
        try {
            const elements = targetSelector
                ? document.querySelectorAll(targetSelector)
                : document.querySelectorAll('*');

            const results = Array.from(elements).map(element => {
                const ariaAttributes = {};
                const attributes = element.attributes;

                for (let i = 0; i < attributes.length; i++) {
                    const attr = attributes[i];
                    if (attr.name.startsWith('aria-') || attr.name === 'role') {
                        ariaAttributes[attr.name] = attr.value;
                    }
                }

                return {
                    tagName: element.tagName.toLowerCase(),
                    id: element.id,
                    className: element.className,
                    ariaAttributes,
                    hasAriaLabel: element.hasAttribute('aria-label'),
                    hasAriaLabelledBy: element.hasAttribute('aria-labelledby'),
                    hasAriaDescribedBy: element.hasAttribute('aria-describedby'),
                    hasRole: element.hasAttribute('role'),
                    isInteractive: ['button', 'input', 'select', 'textarea', 'a'].includes(element.tagName.toLowerCase()),
                    tabIndex: element.tabIndex
                };
            });

            const interactiveElements = results.filter(r => r.isInteractive);
            const elementsWithAria = results.filter(r => Object.keys(r.ariaAttributes).length > 0);
            const interactiveWithoutAria = interactiveElements.filter(r =>
                !r.hasAriaLabel && !r.hasAriaLabelledBy && !r.hasRole
            );

            const scanResult = {
                totalElements: results.length,
                interactiveElements: interactiveElements.length,
                elementsWithAria: elementsWithAria.length,
                interactiveWithoutAria: interactiveWithoutAria.length,
                elements: results.slice(0, 20) // Limit for display
            };

            setScanResults(scanResult);

            const passed = interactiveWithoutAria.length === 0;
            const score = interactiveElements.length > 0
                ? Math.round(((interactiveElements.length - interactiveWithoutAria.length) / interactiveElements.length) * 100)
                : 100;

            onResult({
                category: TEST_CATEGORIES.ARIA_ATTRIBUTES,
                passed,
                score,
                details: scanResult,
                recommendations: [
                    interactiveWithoutAria.length > 0 ? `${interactiveWithoutAria.length} interactive elements lack ARIA labels` : null,
                    elementsWithAria.length === 0 ? 'No ARIA attributes found on any elements' : null,
                    'Consider adding aria-label, aria-labelledby, or role attributes to improve accessibility'
                ].filter(Boolean)
            });

        } catch (error) {
            console.error('ARIA scan error:', error);
        }
    };

    return (
        <div className="aria-checker">
            <div className="tester-header">
                <h4>ARIA Attributes Checker</h4>
                <p>Scan elements for proper ARIA attributes and accessibility markup.</p>
            </div>

            <div className="aria-controls">
                <div className="selector-input">
                    <label>Target Selector (optional):</label>
                    <input
                        type="text"
                        value={targetSelector}
                        onChange={(e) => setTargetSelector(e.target.value)}
                        placeholder="e.g., .btn, [role=button], #my-component"
                        className="selector-field"
                    />
                </div>

                <button onClick={scanForAria} className="test-btn scan">
                    🔍 Scan Elements
                </button>
            </div>

            {scanResults && (
                <div className="aria-results">
                    <div className="results-summary">
                        <div className="summary-item">
                            <strong>{scanResults.totalElements}</strong>
                            <span>Total Elements</span>
                        </div>
                        <div className="summary-item">
                            <strong>{scanResults.interactiveElements}</strong>
                            <span>Interactive Elements</span>
                        </div>
                        <div className="summary-item">
                            <strong>{scanResults.elementsWithAria}</strong>
                            <span>With ARIA</span>
                        </div>
                        <div className="summary-item warning">
                            <strong>{scanResults.interactiveWithoutAria}</strong>
                            <span>Missing ARIA</span>
                        </div>
                    </div>

                    <div className="elements-list">
                        <h5>Scanned Elements (showing first 20):</h5>
                        {scanResults.elements.map((element, index) => (
                            <div key={index} className={`element-item ${element.isInteractive ? 'interactive' : ''}`}>
                                <div className="element-info">
                                    <span className="tag-name">{element.tagName}</span>
                                    {element.id && <span className="element-id">#{element.id}</span>}
                                    {element.className && <span className="element-class">.{element.className.split(' ')[0]}</span>}
                                </div>

                                <div className="aria-info">
                                    {Object.keys(element.ariaAttributes).length > 0 ? (
                                        <div className="aria-attributes">
                                            {Object.entries(element.ariaAttributes).map(([attr, value]) => (
                                                <span key={attr} className="aria-attr">
                                                    {attr}="{value}"
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="no-aria">No ARIA attributes</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Main Accessibility Tester Component
 */
const AccessibilityTester = () => {
    const [activeTest, setActiveTest] = useState(TEST_CATEGORIES.COLOR_CONTRAST);
    const [testResults, setTestResults] = useState({});
    const [overallScore, setOverallScore] = useState(0);

    const handleTestResult = (result) => {
        setTestResults(prev => ({
            ...prev,
            [result.category]: result
        }));
    };

    useEffect(() => {
        const results = Object.values(testResults);
        if (results.length > 0) {
            const avgScore = results.reduce((sum, result) => sum + result.score, 0) / results.length;
            setOverallScore(Math.round(avgScore));
        }
    }, [testResults]);

    const testCategories = [
        { id: TEST_CATEGORIES.COLOR_CONTRAST, name: 'Color Contrast', icon: '🎨' },
        { id: TEST_CATEGORIES.KEYBOARD_NAVIGATION, name: 'Keyboard Navigation', icon: '⌨️' },
        { id: TEST_CATEGORIES.ARIA_ATTRIBUTES, name: 'ARIA Attributes', icon: '🏷️' }
    ];

    return (
        <div className="accessibility-tester">
            <div className="tester-header">
                <h2>Accessibility Tester</h2>
                <p>Comprehensive accessibility testing for design system components</p>

                {Object.keys(testResults).length > 0 && (
                    <div className="overall-score">
                        <div className={`score-circle ${overallScore >= 80 ? 'good' : overallScore >= 60 ? 'warning' : 'poor'}`}>
                            <span className="score-number">{overallScore}</span>
                            <span className="score-label">Score</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="tester-layout">
                <nav className="test-nav">
                    <h3>Test Categories</h3>
                    <ul className="test-list">
                        {testCategories.map(category => (
                            <li key={category.id}>
                                <button
                                    className={`test-nav-btn ${activeTest === category.id ? 'active' : ''}`}
                                    onClick={() => setActiveTest(category.id)}
                                >
                                    <span className="test-icon">{category.icon}</span>
                                    <span className="test-name">{category.name}</span>
                                    {testResults[category.id] && (
                                        <span className={`test-status ${testResults[category.id].passed ? 'pass' : 'fail'}`}>
                                            {testResults[category.id].passed ? '✅' : '❌'}
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <main className="test-content">
                    {activeTest === TEST_CATEGORIES.COLOR_CONTRAST && (
                        <ColorContrastTester onResult={handleTestResult} />
                    )}

                    {activeTest === TEST_CATEGORIES.KEYBOARD_NAVIGATION && (
                        <KeyboardNavigationTester onResult={handleTestResult} />
                    )}

                    {activeTest === TEST_CATEGORIES.ARIA_ATTRIBUTES && (
                        <AriaAttributesChecker onResult={handleTestResult} />
                    )}
                </main>
            </div>

            {/* Results Summary */}
            {Object.keys(testResults).length > 0 && (
                <div className="results-summary-panel">
                    <h3>Test Results Summary</h3>
                    <div className="results-grid">
                        {Object.entries(testResults).map(([category, result]) => (
                            <div key={category} className={`result-card ${result.passed ? 'pass' : 'fail'}`}>
                                <div className="result-header">
                                    <h4>{testCategories.find(c => c.id === category)?.name}</h4>
                                    <span className="result-score">{result.score}/100</span>
                                </div>

                                <div className="result-status">
                                    {result.passed ? '✅ Passed' : '❌ Failed'}
                                </div>

                                {result.recommendations.length > 0 && (
                                    <div className="result-recommendations">
                                        <h5>Recommendations:</h5>
                                        <ul>
                                            {result.recommendations.map((rec, index) => (
                                                <li key={index}>{rec}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessibilityTester;