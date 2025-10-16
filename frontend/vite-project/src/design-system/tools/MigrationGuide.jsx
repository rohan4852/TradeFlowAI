/**
 * Migration Guide Generator
 * Helps users upgrade between different versions of the design system
 */
import React, { useState, useEffect } from 'react';
import './MigrationGuide.css';

/**
 * Migration data for different version transitions
 */
const MIGRATION_DATA = {
    '1.0.0-to-2.0.0': {
        title: 'Migration from v1.0.0 to v2.0.0',
        description: 'Major update with breaking changes and new features',
        breakingChanges: [
            {
                component: 'Button',
                change: 'Prop `type` renamed to `variant`',
                before: '<Button type="primary">Click me</Button>',
                after: '<Button variant="primary">Click me</Button>',
                impact: 'high',
                automated: true
            },
            {
                component: 'Input',
                change: 'Error prop now accepts string instead of boolean',
                before: '<Input error={true} />',
                after: '<Input error="This field is required" />',
                impact: 'medium',
                automated: false
            },
            {
                component: 'Card',
                change: 'CSS classes updated to BEM methodology',
                before: '.card-primary { }',
                after: '.card--primary { }',
                impact: 'low',
                automated: true
            }
        ],
        newFeatures: [
            {
                name: 'Glassmorphism Effects',
                description: 'New glass variant for cards and modals',
                example: '<Card variant="glass">Content</Card>'
            },
            {
                name: 'Real-time Components',
                description: 'New components for real-time data display',
                example: '<CandlestickChart realTime={true} />'
            },
            {
                name: 'Accessibility Improvements',
                description: 'Enhanced ARIA support and keyboard navigation',
                example: 'Automatic ARIA labels and focus management'
            }
        ],
        deprecations: [
            {
                item: 'LegacyButton component',
                replacement: 'Button component',
                timeline: 'Will be removed in v3.0.0'
            },
            {
                item: 'Old theme format',
                replacement: 'New theme configuration',
                timeline: 'Will be removed in v2.5.0'
            }
        ],
        steps: [
            {
                title: 'Update Dependencies',
                description: 'Update to the latest version',
                code: 'npm install @superior-ui/design-system@2.0.0',
                automated: false
            },
            {
                title: 'Run Migration Script',
                description: 'Automatically update component props and imports',
                code: 'npx superior-ui migrate --from=1.0.0 --to=2.0.0',
                automated: true
            },
            {
                title: 'Update Manual Changes',
                description: 'Review and update changes that require manual intervention',
                code: '// Review migration report and update manually',
                automated: false
            },
            {
                title: 'Test Your Application',
                description: 'Run tests and verify everything works correctly',
                code: 'npm test && npm run build',
                automated: false
            }
        ]
    },
    '2.0.0-to-2.1.0': {
        title: 'Migration from v2.0.0 to v2.1.0',
        description: 'Minor update with new features and improvements',
        breakingChanges: [],
        newFeatures: [
            {
                name: 'Theme Customizer',
                description: 'Interactive theme customization tool',
                example: 'import { ThemeCustomizer } from "@superior-ui/tools"'
            },
            {
                name: 'Component Auditor',
                description: 'Automated component quality checking',
                example: 'import { ComponentAuditor } from "@superior-ui/tools"'
            }
        ],
        deprecations: [],
        steps: [
            {
                title: 'Update Dependencies',
                description: 'Update to the latest version',
                code: 'npm install @superior-ui/design-system@2.1.0',
                automated: false
            },
            {
                title: 'Enjoy New Features',
                description: 'Start using the new tools and components',
                code: '// No migration needed for this version',
                automated: false
            }
        ]
    }
};

/**
 * Migration step component
 */
const MigrationStep = ({ step, index, isCompleted, onToggleComplete }) => {
    return (
        <div className={`migration-step ${isCompleted ? 'completed' : ''}`}>
            <div className="step-header">
                <div className="step-number">{index + 1}</div>
                <div className="step-info">
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-description">{step.description}</p>
                </div>
                <div className="step-controls">
                    {step.automated && (
                        <span className="automated-badge">Automated</span>
                    )}
                    <button
                        className={`complete-btn ${isCompleted ? 'completed' : ''}`}
                        onClick={() => onToggleComplete(index)}
                    >
                        {isCompleted ? '✅' : '⭕'}
                    </button>
                </div>
            </div>

            {step.code && (
                <div className="step-code">
                    <pre><code>{step.code}</code></pre>
                    <button
                        className="copy-code-btn"
                        onClick={() => navigator.clipboard.writeText(step.code)}
                    >
                        📋 Copy
                    </button>
                </div>
            )}
        </div>
    );
};

/**
 * Breaking change component
 */
const BreakingChange = ({ change }) => {
    const getImpactColor = (impact) => {
        switch (impact) {
            case 'high': return 'impact-high';
            case 'medium': return 'impact-medium';
            case 'low': return 'impact-low';
            default: return 'impact-medium';
        }
    };

    return (
        <div className="breaking-change">
            <div className="change-header">
                <h4 className="change-component">{change.component}</h4>
                <div className="change-badges">
                    <span className={`impact-badge ${getImpactColor(change.impact)}`}>
                        {change.impact} impact
                    </span>
                    {change.automated && (
                        <span className="automated-badge">Auto-fixable</span>
                    )}
                </div>
            </div>

            <p className="change-description">{change.change}</p>

            <div className="change-examples">
                <div className="example-section">
                    <h5>Before:</h5>
                    <pre><code>{change.before}</code></pre>
                </div>
                <div className="example-section">
                    <h5>After:</h5>
                    <pre><code>{change.after}</code></pre>
                </div>
            </div>
        </div>
    );
};

/**
 * New feature component
 */
const NewFeature = ({ feature }) => {
    return (
        <div className="new-feature">
            <h4 className="feature-name">{feature.name}</h4>
            <p className="feature-description">{feature.description}</p>
            {feature.example && (
                <div className="feature-example">
                    <h5>Example:</h5>
                    <pre><code>{feature.example}</code></pre>
                </div>
            )}
        </div>
    );
};

/**
 * Main Migration Guide Component
 */
const MigrationGuide = () => {
    const [selectedMigration, setSelectedMigration] = useState('1.0.0-to-2.0.0');
    const [completedSteps, setCompletedSteps] = useState(new Set());
    const [activeTab, setActiveTab] = useState('overview');

    const migrationData = MIGRATION_DATA[selectedMigration];

    const toggleStepComplete = (stepIndex) => {
        const newCompleted = new Set(completedSteps);
        if (newCompleted.has(stepIndex)) {
            newCompleted.delete(stepIndex);
        } else {
            newCompleted.add(stepIndex);
        }
        setCompletedSteps(newCompleted);
    };

    const getProgressPercentage = () => {
        if (!migrationData.steps.length) return 0;
        return Math.round((completedSteps.size / migrationData.steps.length) * 100);
    };

    const exportMigrationReport = () => {
        const report = {
            migration: selectedMigration,
            title: migrationData.title,
            timestamp: new Date().toISOString(),
            progress: {
                completed: completedSteps.size,
                total: migrationData.steps.length,
                percentage: getProgressPercentage()
            },
            breakingChanges: migrationData.breakingChanges,
            newFeatures: migrationData.newFeatures,
            steps: migrationData.steps.map((step, index) => ({
                ...step,
                completed: completedSteps.has(index)
            }))
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `migration-report-${selectedMigration}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const tabs = [
        { id: 'overview', name: 'Overview', icon: '📋' },
        { id: 'breaking', name: 'Breaking Changes', icon: '⚠️' },
        { id: 'features', name: 'New Features', icon: '✨' },
        { id: 'steps', name: 'Migration Steps', icon: '📝' }
    ];

    return (
        <div className="migration-guide">
            <div className="migration-header">
                <h1>Migration Guide</h1>
                <p>Step-by-step guide for upgrading your design system</p>

                <div className="migration-controls">
                    <div className="version-selector">
                        <label>Migration Path:</label>
                        <select
                            value={selectedMigration}
                            onChange={(e) => {
                                setSelectedMigration(e.target.value);
                                setCompletedSteps(new Set());
                            }}
                            className="migration-select"
                        >
                            {Object.entries(MIGRATION_DATA).map(([key, data]) => (
                                <option key={key} value={key}>
                                    {data.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="progress-indicator">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${getProgressPercentage()}%` }}
                            />
                        </div>
                        <span className="progress-text">
                            {getProgressPercentage()}% Complete
                        </span>
                    </div>

                    <button
                        onClick={exportMigrationReport}
                        className="export-btn"
                    >
                        📊 Export Report
                    </button>
                </div>
            </div>

            <div className="migration-content">
                <nav className="migration-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`migration-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span className="tab-name">{tab.name}</span>
                            {tab.id === 'breaking' && migrationData.breakingChanges.length > 0 && (
                                <span className="tab-badge">{migrationData.breakingChanges.length}</span>
                            )}
                            {tab.id === 'features' && migrationData.newFeatures.length > 0 && (
                                <span className="tab-badge">{migrationData.newFeatures.length}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <main className="migration-main">
                    {activeTab === 'overview' && (
                        <div className="overview-section">
                            <h2>{migrationData.title}</h2>
                            <p className="migration-description">{migrationData.description}</p>

                            <div className="overview-stats">
                                <div className="stat-card">
                                    <div className="stat-value">{migrationData.breakingChanges.length}</div>
                                    <div className="stat-label">Breaking Changes</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{migrationData.newFeatures.length}</div>
                                    <div className="stat-label">New Features</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{migrationData.steps.length}</div>
                                    <div className="stat-label">Migration Steps</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{migrationData.deprecations.length}</div>
                                    <div className="stat-label">Deprecations</div>
                                </div>
                            </div>

                            {migrationData.deprecations.length > 0 && (
                                <div className="deprecations-section">
                                    <h3>Deprecations</h3>
                                    <div className="deprecations-list">
                                        {migrationData.deprecations.map((dep, index) => (
                                            <div key={index} className="deprecation-item">
                                                <h4>{dep.item}</h4>
                                                <p>Replace with: <strong>{dep.replacement}</strong></p>
                                                <p className="timeline">{dep.timeline}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'breaking' && (
                        <div className="breaking-changes-section">
                            <h2>Breaking Changes</h2>
                            {migrationData.breakingChanges.length === 0 ? (
                                <div className="no-changes">
                                    <h3>🎉 No Breaking Changes</h3>
                                    <p>This migration doesn't include any breaking changes.</p>
                                </div>
                            ) : (
                                <div className="breaking-changes-list">
                                    {migrationData.breakingChanges.map((change, index) => (
                                        <BreakingChange key={index} change={change} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'features' && (
                        <div className="new-features-section">
                            <h2>New Features</h2>
                            {migrationData.newFeatures.length === 0 ? (
                                <div className="no-features">
                                    <h3>No New Features</h3>
                                    <p>This migration focuses on bug fixes and improvements.</p>
                                </div>
                            ) : (
                                <div className="new-features-list">
                                    {migrationData.newFeatures.map((feature, index) => (
                                        <NewFeature key={index} feature={feature} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'steps' && (
                        <div className="migration-steps-section">
                            <h2>Migration Steps</h2>
                            <p>Follow these steps in order to complete your migration:</p>

                            <div className="migration-steps-list">
                                {migrationData.steps.map((step, index) => (
                                    <MigrationStep
                                        key={index}
                                        step={step}
                                        index={index}
                                        isCompleted={completedSteps.has(index)}
                                        onToggleComplete={toggleStepComplete}
                                    />
                                ))}
                            </div>

                            {completedSteps.size === migrationData.steps.length && (
                                <div className="migration-complete">
                                    <h3>🎉 Migration Complete!</h3>
                                    <p>You've successfully completed all migration steps.</p>
                                    <button
                                        onClick={exportMigrationReport}
                                        className="completion-btn"
                                    >
                                        📊 Download Completion Report
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MigrationGuide;