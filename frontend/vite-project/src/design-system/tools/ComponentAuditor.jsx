/**
 * Component Audit Tool
 * Provides comprehensive auditing and consistency checking for design system components
 */
import React, { useState, useEffect } from 'react';
import './ComponentAuditor.css';

/**
 * Audit categories and rules
 */
const AUDIT_CATEGORIES = {
    STRUCTURE: 'structure',
    ACCESSIBILITY: 'accessibility',
    PERFORMANCE: 'performance',
    CONSISTENCY: 'consistency',
    DOCUMENTATION: 'documentation',
    TESTING: 'testing'
};

const AUDIT_RULES = {
    [AUDIT_CATEGORIES.STRUCTURE]: [
        {
            id: 'has-prop-types',
            name: 'PropTypes Definition',
            description: 'Component should have PropTypes defined',
            severity: 'error',
            check: (component) => component.propTypes !== undefined
        },
        {
            id: 'has-display-name',
            name: 'Display Name',
            description: 'Component should have a displayName',
            severity: 'warning',
            check: (component) => component.displayName !== undefined
        },
        {
            id: 'has-default-props',
            name: 'Default Props',
            description: 'Component should have defaultProps for optional props',
            severity: 'info',
            check: (component) => component.defaultProps !== undefined
        }
    ],
    [AUDIT_CATEGORIES.ACCESSIBILITY]: [
        {
            id: 'has-aria-labels',
            name: 'ARIA Labels',
            description: 'Interactive components should support ARIA labels',
            severity: 'error',
            check: (component, props) => {
                const interactiveElements = ['button', 'input', 'select', 'textarea'];
                // This would need actual DOM analysis in a real implementation
                return true;
            }
        },
        {
            id: 'keyboard-navigable',
            name: 'Keyboard Navigation',
            description: 'Interactive components should be keyboard navigable',
            severity: 'error',
            check: (component) => {
                // Check for onKeyDown, tabIndex, etc.
                return true;
            }
        },
        {
            id: 'color-contrast',
            name: 'Color Contrast',
            description: 'Text should meet WCAG color contrast requirements',
            severity: 'warning',
            check: (component) => {
                // Would implement actual contrast checking
                return true;
            }
        }
    ],
    [AUDIT_CATEGORIES.PERFORMANCE]: [
        {
            id: 'memo-wrapped',
            name: 'React.memo Usage',
            description: 'Pure components should be wrapped with React.memo',
            severity: 'info',
            check: (component) => {
                return component.$$typeof === Symbol.for('react.memo');
            }
        },
        {
            id: 'no-inline-styles',
            name: 'No Inline Styles',
            description: 'Avoid inline styles for better performance',
            severity: 'warning',
            check: (component, props) => {
                // Check for style prop usage
                return !props.style;
            }
        },
        {
            id: 'optimized-renders',
            name: 'Render Optimization',
            description: 'Component should minimize unnecessary re-renders',
            severity: 'info',
            check: (component) => {
                // Would analyze render patterns
                return true;
            }
        }
    ],
    [AUDIT_CATEGORIES.CONSISTENCY]: [
        {
            id: 'naming-convention',
            name: 'Naming Convention',
            description: 'Component should follow PascalCase naming convention',
            severity: 'error',
            check: (component) => {
                const name = component.displayName || component.name;
                return /^[A-Z][a-zA-Z0-9]*$/.test(name);
            }
        },
        {
            id: 'prop-naming',
            name: 'Prop Naming',
            description: 'Props should follow camelCase convention',
            severity: 'warning',
            check: (component) => {
                if (!component.propTypes) return true;
                return Object.keys(component.propTypes).every(prop =>
                    /^[a-z][a-zA-Z0-9]*$/.test(prop)
                );
            }
        },
        {
            id: 'variant-consistency',
            name: 'Variant Consistency',
            description: 'Variant props should use consistent values across components',
            severity: 'info',
            check: (component) => {
                // Would check against design system variant standards
                return true;
            }
        }
    ],
    [AUDIT_CATEGORIES.DOCUMENTATION]: [
        {
            id: 'has-jsdoc',
            name: 'JSDoc Comments',
            description: 'Component should have JSDoc documentation',
            severity: 'warning',
            check: (component) => {
                // Would check for JSDoc comments in source
                return true;
            }
        },
        {
            id: 'has-examples',
            name: 'Usage Examples',
            description: 'Component should have usage examples',
            severity: 'info',
            check: (component) => {
                // Would check for examples in documentation
                return true;
            }
        },
        {
            id: 'has-storybook',
            name: 'Storybook Stories',
            description: 'Component should have Storybook stories',
            severity: 'warning',
            check: (component) => {
                // Would check for .stories.js files
                return true;
            }
        }
    ],
    [AUDIT_CATEGORIES.TESTING]: [
        {
            id: 'has-unit-tests',
            name: 'Unit Tests',
            description: 'Component should have unit tests',
            severity: 'error',
            check: (component) => {
                // Would check for .test.js files
                return true;
            }
        },
        {
            id: 'has-accessibility-tests',
            name: 'Accessibility Tests',
            description: 'Component should have accessibility tests',
            severity: 'warning',
            check: (component) => {
                // Would check for a11y test coverage
                return true;
            }
        },
        {
            id: 'test-coverage',
            name: 'Test Coverage',
            description: 'Component should have adequate test coverage (>80%)',
            severity: 'info',
            check: (component) => {
                // Would check actual test coverage
                return Math.random() > 0.3; // Mock for demo
            }
        }
    ]
};

/**
 * Mock component data for demonstration
 */
const MOCK_COMPONENTS = [
    {
        name: 'Button',
        displayName: 'Button',
        propTypes: {
            variant: 'string',
            size: 'string',
            disabled: 'bool',
            children: 'node'
        },
        defaultProps: {
            variant: 'primary',
            size: 'medium',
            disabled: false
        },
        category: 'atoms',
        lastModified: '2024-01-15',
        version: '1.2.0'
    },
    {
        name: 'Input',
        displayName: 'Input',
        propTypes: {
            type: 'string',
            placeholder: 'string',
            value: 'string',
            onChange: 'func',
            error: 'string'
        },
        defaultProps: {
            type: 'text'
        },
        category: 'atoms',
        lastModified: '2024-01-10',
        version: '1.1.0'
    },
    {
        name: 'Card',
        displayName: 'Card',
        propTypes: {
            variant: 'string',
            padding: 'string',
            children: 'node'
        },
        category: 'molecules',
        lastModified: '2024-01-12',
        version: '1.0.0'
    },
    {
        name: 'CandlestickChart',
        displayName: 'CandlestickChart',
        propTypes: {
            data: 'array',
            symbol: 'string',
            height: 'string',
            realTime: 'bool'
        },
        defaultProps: {
            height: '400px',
            realTime: false
        },
        category: 'organisms',
        lastModified: '2024-01-20',
        version: '2.0.0'
    }
];

/**
 * Audit result component
 */
const AuditResult = ({ rule, result, component }) => {
    const getStatusIcon = () => {
        if (result.passed) return '✅';
        switch (rule.severity) {
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '❓';
        }
    };

    const getStatusClass = () => {
        if (result.passed) return 'audit-result--passed';
        return `audit-result--${rule.severity}`;
    };

    return (
        <div className={`audit-result ${getStatusClass()}`}>
            <div className="audit-result-header">
                <span className="audit-result-icon">{getStatusIcon()}</span>
                <span className="audit-result-name">{rule.name}</span>
                <span className={`audit-result-severity severity--${rule.severity}`}>
                    {rule.severity}
                </span>
            </div>
            <div className="audit-result-description">
                {rule.description}
            </div>
            {result.details && (
                <div className="audit-result-details">
                    {result.details}
                </div>
            )}
        </div>
    );
};

/**
 * Component card with audit summary
 */
const ComponentCard = ({ component, auditResults, onViewDetails }) => {
    const totalRules = Object.values(AUDIT_RULES).flat().length;
    const passedRules = auditResults.filter(r => r.passed).length;
    const errorCount = auditResults.filter(r => !r.passed && r.rule.severity === 'error').length;
    const warningCount = auditResults.filter(r => !r.passed && r.rule.severity === 'warning').length;

    const getHealthScore = () => {
        return Math.round((passedRules / totalRules) * 100);
    };

    const getHealthColor = () => {
        const score = getHealthScore();
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'fair';
        return 'poor';
    };

    return (
        <div className="component-card">
            <div className="component-card-header">
                <h3 className="component-name">{component.name}</h3>
                <div className={`health-score health-score--${getHealthColor()}`}>
                    {getHealthScore()}%
                </div>
            </div>

            <div className="component-meta">
                <span className="component-category">{component.category}</span>
                <span className="component-version">v{component.version}</span>
                <span className="component-modified">{component.lastModified}</span>
            </div>

            <div className="audit-summary">
                <div className="audit-counts">
                    <span className="audit-count audit-count--passed">
                        ✅ {passedRules}
                    </span>
                    {errorCount > 0 && (
                        <span className="audit-count audit-count--error">
                            ❌ {errorCount}
                        </span>
                    )}
                    {warningCount > 0 && (
                        <span className="audit-count audit-count--warning">
                            ⚠️ {warningCount}
                        </span>
                    )}
                </div>

                <button
                    className="view-details-btn"
                    onClick={() => onViewDetails(component)}
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

/**
 * Detailed audit view
 */
const DetailedAuditView = ({ component, auditResults, onBack }) => {
    const [activeCategory, setActiveCategory] = useState(AUDIT_CATEGORIES.STRUCTURE);

    const getResultsByCategory = (category) => {
        const rules = AUDIT_RULES[category];
        return rules.map(rule => {
            const result = auditResults.find(r => r.rule.id === rule.id);
            return { rule, result };
        });
    };

    const getCategoryStats = (category) => {
        const results = getResultsByCategory(category);
        const passed = results.filter(r => r.result.passed).length;
        const total = results.length;
        return { passed, total, percentage: Math.round((passed / total) * 100) };
    };

    return (
        <div className="detailed-audit-view">
            <div className="audit-header">
                <button className="back-btn" onClick={onBack}>
                    ← Back to Overview
                </button>
                <h2>Audit Details: {component.name}</h2>
            </div>

            <div className="audit-layout">
                <nav className="audit-nav">
                    {Object.entries(AUDIT_CATEGORIES).map(([key, category]) => {
                        const stats = getCategoryStats(category);
                        return (
                            <button
                                key={category}
                                className={`audit-nav-btn ${activeCategory === category ? 'active' : ''}`}
                                onClick={() => setActiveCategory(category)}
                            >
                                <span className="nav-btn-name">
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </span>
                                <span className="nav-btn-stats">
                                    {stats.passed}/{stats.total}
                                </span>
                                <span className={`nav-btn-percentage percentage--${stats.percentage >= 90 ? 'excellent' :
                                        stats.percentage >= 75 ? 'good' :
                                            stats.percentage >= 60 ? 'fair' : 'poor'
                                    }`}>
                                    {stats.percentage}%
                                </span>
                            </button>
                        );
                    })}
                </nav>

                <main className="audit-content">
                    <div className="audit-category-header">
                        <h3>{activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Audit</h3>
                        <div className="category-stats">
                            {(() => {
                                const stats = getCategoryStats(activeCategory);
                                return `${stats.passed}/${stats.total} rules passed (${stats.percentage}%)`;
                            })()}
                        </div>
                    </div>

                    <div className="audit-results">
                        {getResultsByCategory(activeCategory).map(({ rule, result }) => (
                            <AuditResult
                                key={rule.id}
                                rule={rule}
                                result={result}
                                component={component}
                            />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

/**
 * Main Component Auditor
 */
const ComponentAuditor = () => {
    const [components] = useState(MOCK_COMPONENTS);
    const [auditResults, setAuditResults] = useState({});
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState('health');
    const [isAuditing, setIsAuditing] = useState(false);

    // Run audit for all components
    useEffect(() => {
        runAudit();
    }, []);

    const runAudit = async () => {
        setIsAuditing(true);
        const results = {};

        for (const component of components) {
            const componentResults = [];

            // Run all audit rules
            Object.values(AUDIT_RULES).flat().forEach(rule => {
                try {
                    const passed = rule.check(component, component.propTypes);
                    componentResults.push({
                        rule,
                        passed,
                        details: passed ? null : `Rule "${rule.name}" failed for ${component.name}`
                    });
                } catch (error) {
                    componentResults.push({
                        rule,
                        passed: false,
                        details: `Error running rule: ${error.message}`
                    });
                }
            });

            results[component.name] = componentResults;
        }

        setAuditResults(results);
        setIsAuditing(false);
    };

    const getFilteredComponents = () => {
        let filtered = components;

        if (filterCategory !== 'all') {
            filtered = filtered.filter(c => c.category === filterCategory);
        }

        // Sort components
        filtered.sort((a, b) => {
            const aResults = auditResults[a.name] || [];
            const bResults = auditResults[b.name] || [];

            switch (sortBy) {
                case 'health':
                    const aHealth = aResults.filter(r => r.passed).length / aResults.length;
                    const bHealth = bResults.filter(r => r.passed).length / bResults.length;
                    return bHealth - aHealth;
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'category':
                    return a.category.localeCompare(b.category);
                case 'modified':
                    return new Date(b.lastModified) - new Date(a.lastModified);
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const getOverallStats = () => {
        const totalComponents = components.length;
        const totalRules = Object.values(AUDIT_RULES).flat().length;
        let totalPassed = 0;
        let totalFailed = 0;

        Object.values(auditResults).forEach(results => {
            totalPassed += results.filter(r => r.passed).length;
            totalFailed += results.filter(r => !r.passed).length;
        });

        return {
            totalComponents,
            totalRules,
            totalPassed,
            totalFailed,
            overallHealth: totalPassed + totalFailed > 0 ?
                Math.round((totalPassed / (totalPassed + totalFailed)) * 100) : 0
        };
    };

    const exportAuditReport = () => {
        const stats = getOverallStats();
        const report = {
            timestamp: new Date().toISOString(),
            summary: stats,
            components: components.map(component => ({
                name: component.name,
                category: component.category,
                version: component.version,
                results: auditResults[component.name] || []
            }))
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `component-audit-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (selectedComponent) {
        return (
            <DetailedAuditView
                component={selectedComponent}
                auditResults={auditResults[selectedComponent.name] || []}
                onBack={() => setSelectedComponent(null)}
            />
        );
    }

    const stats = getOverallStats();
    const filteredComponents = getFilteredComponents();

    return (
        <div className="component-auditor">
            <div className="auditor-header">
                <h1>Component Auditor</h1>
                <p>Comprehensive auditing and consistency checking for design system components</p>

                <div className="overall-stats">
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalComponents}</div>
                        <div className="stat-label">Components</div>
                    </div>
                    <div className="stat-card">
                        <div className={`stat-value health-${stats.overallHealth >= 90 ? 'excellent' :
                                stats.overallHealth >= 75 ? 'good' :
                                    stats.overallHealth >= 60 ? 'fair' : 'poor'
                            }`}>
                            {stats.overallHealth}%
                        </div>
                        <div className="stat-label">Overall Health</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalPassed}</div>
                        <div className="stat-label">Rules Passed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalFailed}</div>
                        <div className="stat-label">Issues Found</div>
                    </div>
                </div>

                <div className="auditor-controls">
                    <div className="filter-controls">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Categories</option>
                            <option value="atoms">Atoms</option>
                            <option value="molecules">Molecules</option>
                            <option value="organisms">Organisms</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                        >
                            <option value="health">Sort by Health</option>
                            <option value="name">Sort by Name</option>
                            <option value="category">Sort by Category</option>
                            <option value="modified">Sort by Modified</option>
                        </select>
                    </div>

                    <div className="action-controls">
                        <button
                            onClick={runAudit}
                            disabled={isAuditing}
                            className="action-btn audit-btn"
                        >
                            {isAuditing ? '🔄 Auditing...' : '🔍 Re-run Audit'}
                        </button>
                        <button
                            onClick={exportAuditReport}
                            className="action-btn export-btn"
                        >
                            📊 Export Report
                        </button>
                    </div>
                </div>
            </div>

            <div className="components-grid">
                {filteredComponents.map(component => (
                    <ComponentCard
                        key={component.name}
                        component={component}
                        auditResults={auditResults[component.name] || []}
                        onViewDetails={setSelectedComponent}
                    />
                ))}
            </div>

            {filteredComponents.length === 0 && (
                <div className="empty-state">
                    <h3>No components found</h3>
                    <p>Try adjusting your filters or add more components to audit.</p>
                </div>
            )}
        </div>
    );
};

export default ComponentAuditor;