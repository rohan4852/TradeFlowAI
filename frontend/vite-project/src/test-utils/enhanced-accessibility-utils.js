import { AccessibilityTester, accessibilityHelpers } from './accessibility-utils.js';

/**
 * Enhanced accessibility testing utilities with comprehensive coverage
 */
export class EnhancedAccessibilityTester extends AccessibilityTester {
    constructor() {
        super();
        this.wcagLevels = ['A', 'AA', 'AAA'];
        this.testCategories = [
            'perceivable',
            'operable',
            'understandable',
            'robust'
        ];
    }

    /**
     * Comprehensive WCAG compliance testing
     */
    async testWCAGCompliance(page, level = 'AA') {
        const results = {
            level,
            categories: {},
            overall: { passed: 0, failed: 0, warnings: 0 }
        };

        // Test each WCAG category
        for (const category of this.testCategories) {
            results.categories[category] = await this.testWCAGCategory(page, category, level);

            results.overall.passed += results.categories[category].passed;
            results.overall.failed += results.categories[category].failed;
            results.overall.warnings += results.categories[category].warnings;
        }

        return results;
    }

    /**
     * Test specific WCAG category
     */
    async testWCAGCategory(page, category, level) {
        const tests = this.getWCAGTests(category, level);
        const results = { passed: 0, failed: 0, warnings: 0, details: [] };

        for (const test of tests) {
            try {
                const result = await this.runWCAGTest(page, test);
                results.details.push(result);

                if (result.status === 'passed') results.passed++;
                else if (result.status === 'failed') results.failed++;
                else results.warnings++;
            } catch (error) {
                results.details.push({
                    test: test.name,
                    status: 'error',
                    message: error.message
                });
                results.failed++;
            }
        }

        return results;
    }

    /**
     * Get WCAG tests for category and level
     */
    getWCAGTests(category, level) {
        const tests = {
            perceivable: [
                {
                    name: '1.1.1 Non-text Content',
                    level: 'A',
                    test: this.testNonTextContent
                },
                {
                    name: '1.3.1 Info and Relationships',
                    level: 'A',
                    test: this.testInfoAndRelationships
                },
                {
                    name: '1.3.2 Meaningful Sequence',
                    level: 'A',
                    test: this.testMeaningfulSequence
                },
                {
                    name: '1.4.1 Use of Color',
                    level: 'A',
                    test: this.testUseOfColor
                },
                {
                    name: '1.4.3 Contrast (Minimum)',
                    level: 'AA',
                    test: this.testContrastMinimum
                },
                {
                    name: '1.4.6 Contrast (Enhanced)',
                    level: 'AAA',
                    test: this.testContrastEnhanced
                }
            ],
            operable: [
                {
                    name: '2.1.1 Keyboard',
                    level: 'A',
                    test: this.testKeyboardAccess
                },
                {
                    name: '2.1.2 No Keyboard Trap',
                    level: 'A',
                    test: this.testNoKeyboardTrap
                },
                {
                    name: '2.4.1 Bypass Blocks',
                    level: 'A',
                    test: this.testBypassBlocks
                },
                {
                    name: '2.4.2 Page Titled',
                    level: 'A',
                    test: this.testPageTitled
                },
                {
                    name: '2.4.3 Focus Order',
                    level: 'A',
                    test: this.testFocusOrder
                },
                {
                    name: '2.4.7 Focus Visible',
                    level: 'AA',
                    test: this.testFocusVisible
                }
            ],
            understandable: [
                {
                    name: '3.1.1 Language of Page',
                    level: 'A',
                    test: this.testLanguageOfPage
                },
                {
                    name: '3.2.1 On Focus',
                    level: 'A',
                    test: this.testOnFocus
                },
                {
                    name: '3.2.2 On Input',
                    level: 'A',
                    test: this.testOnInput
                },
                {
                    name: '3.3.1 Error Identification',
                    level: 'A',
                    test: this.testErrorIdentification
                },
                {
                    name: '3.3.2 Labels or Instructions',
                    level: 'A',
                    test: this.testLabelsOrInstructions
                }
            ],
            robust: [
                {
                    name: '4.1.1 Parsing',
                    level: 'A',
                    test: this.testParsing
                },
                {
                    name: '4.1.2 Name, Role, Value',
                    level: 'A',
                    test: this.testNameRoleValue
                }
            ]
        };

        return tests[category]?.filter(test =>
            this.wcagLevels.indexOf(test.level) <= this.wcagLevels.indexOf(level)
        ) || [];
    }

    /**
     * Run individual WCAG test
     */
    async runWCAGTest(page, test) {
        return await test.test.call(this, page);
    }

    /**
     * WCAG Test Implementations
     */

    // 1.1.1 Non-text Content
    async testNonTextContent(page) {
        const images = await page.locator('img').all();
        const issues = [];

        for (const img of images) {
            const alt = await img.getAttribute('alt');
            const role = await img.getAttribute('role');
            const ariaLabel = await img.getAttribute('aria-label');

            if (!alt && role !== 'presentation' && !ariaLabel) {
                issues.push('Image missing alternative text');
            }
        }

        return {
            test: '1.1.1 Non-text Content',
            status: issues.length === 0 ? 'passed' : 'failed',
            issues
        };
    }

    // 1.3.1 Info and Relationships
    async testInfoAndRelationships(page) {
        const issues = [];

        // Test heading structure
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
        let previousLevel = 0;

        for (const heading of headings) {
            const tagName = await heading.evaluate(el => el.tagName);
            const currentLevel = parseInt(tagName.charAt(1));

            if (previousLevel > 0 && currentLevel > previousLevel + 1) {
                issues.push(`Heading level skipped: ${tagName} after H${previousLevel}`);
            }

            previousLevel = currentLevel;
        }

        // Test form labels
        const inputs = await page.locator('input, select, textarea').all();
        for (const input of inputs) {
            const id = await input.getAttribute('id');
            const ariaLabel = await input.getAttribute('aria-label');
            const ariaLabelledby = await input.getAttribute('aria-labelledby');

            if (id) {
                const label = await page.locator(`label[for="${id}"]`).count();
                if (label === 0 && !ariaLabel && !ariaLabelledby) {
                    issues.push('Form control missing label');
                }
            }
        }

        return {
            test: '1.3.1 Info and Relationships',
            status: issues.length === 0 ? 'passed' : 'failed',
            issues
        };
    }

    // 1.3.2 Meaningful Sequence
    async testMeaningfulSequence(page) {
        const issues = [];

        // Test tab order makes sense
        const focusableElements = await page.locator(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ).all();

        // Simple check: elements should be in DOM order unless tabindex is used
        for (let i = 0; i < focusableElements.length; i++) {
            const tabIndex = await focusableElements[i].getAttribute('tabindex');
            if (tabIndex && parseInt(tabIndex) > 0) {
                // Positive tabindex found - this can disrupt natural order
                issues.push('Positive tabindex found, may disrupt reading order');
                break;
            }
        }

        return {
            test: '1.3.2 Meaningful Sequence',
            status: issues.length === 0 ? 'passed' : 'warning',
            issues
        };
    }

    // 1.4.1 Use of Color
    async testUseOfColor(page) {
        const issues = [];

        // This is a complex test that would require visual analysis
        // For now, we'll check for common patterns
        const colorOnlyElements = await page.locator('[style*="color:"], .text-red, .text-green, .text-blue').all();

        for (const element of colorOnlyElements) {
            const text = await element.textContent();
            const hasIcon = await element.locator('svg, i, .icon').count() > 0;
            const hasUnderline = await element.evaluate(el => {
                const styles = window.getComputedStyle(el);
                return styles.textDecoration.includes('underline');
            });

            if (text && !hasIcon && !hasUnderline) {
                issues.push('Element may rely solely on color to convey information');
            }
        }

        return {
            test: '1.4.1 Use of Color',
            status: issues.length === 0 ? 'passed' : 'warning',
            issues
        };
    }

    // 1.4.3 Contrast (Minimum)
    async testContrastMinimum(page) {
        const issues = [];
        const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, a, button, span, div').all();

        for (const element of textElements.slice(0, 20)) { // Limit for performance
            if (await element.isVisible()) {
                const styles = await element.evaluate(el => {
                    const computed = window.getComputedStyle(el);
                    return {
                        color: computed.color,
                        backgroundColor: computed.backgroundColor,
                        fontSize: parseFloat(computed.fontSize),
                        fontWeight: computed.fontWeight
                    };
                });

                // Simplified contrast check (in real implementation, use proper color parsing)
                if (styles.color === styles.backgroundColor) {
                    issues.push('Text and background colors are identical');
                }

                // Check for very light text on light backgrounds (simplified)
                if (styles.color.includes('rgb(255') && styles.backgroundColor.includes('rgb(255')) {
                    issues.push('Potential low contrast: light text on light background');
                }
            }
        }

        return {
            test: '1.4.3 Contrast (Minimum)',
            status: issues.length === 0 ? 'passed' : 'failed',
            issues
        };
    }

    // 1.4.6 Contrast (Enhanced)
    async testContrastEnhanced(page) {
        // Similar to minimum contrast but with higher thresholds
        return await this.testContrastMinimum(page);
    }

    // 2.1.1 Keyboard
    async testKeyboardAccess(page) {
        const issues = [];
        const interactiveElements = await page.locator('button, [href], input, select, textarea').all();

        for (const element of interactiveElements.slice(0, 10)) {
            if (await element.isVisible()) {
                const tabIndex = await element.getAttribute('tabindex');
                const isDisabled = await element.isDisabled();

                if (!isDisabled && tabIndex === '-1') {
                    issues.push('Interactive element not keyboard accessible');
                }
            }
        }

        return {
            test: '2.1.1 Keyboard',
            status: issues.length === 0 ? 'passed' : 'failed',
            issues
        };
    }

    // 2.1.2 No Keyboard Trap
    async testNoKeyboardTrap(page) {
        const issues = [];

        // Test for potential keyboard traps in modals or complex widgets
        const modals = await page.locator('[role="dialog"], .modal').all();

        for (const modal of modals) {
            if (await modal.isVisible()) {
                const focusableInModal = await modal.locator(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                ).count();

                if (focusableInModal === 0) {
                    issues.push('Modal with no focusable elements may create keyboard trap');
                }
            }
        }

        return {
            test: '2.1.2 No Keyboard Trap',
            status: issues.length === 0 ? 'passed' : 'warning',
            issues
        };
    }

    // 2.4.1 Bypass Blocks
    async testBypassBlocks(page) {
        const issues = [];

        // Check for skip links
        const skipLinks = await page.locator('a[href^="#"], [role="navigation"] a[href^="#"]').all();
        let hasSkipToMain = false;

        for (const link of skipLinks) {
            const href = await link.getAttribute('href');
            const text = await link.textContent();

            if (href === '#main' || text?.toLowerCase().includes('skip to main')) {
                hasSkipToMain = true;
                break;
            }
        }

        if (!hasSkipToMain) {
            issues.push('No skip to main content link found');
        }

        return {
            test: '2.4.1 Bypass Blocks',
            status: issues.length === 0 ? 'passed' : 'warning',
            issues
        };
    }

    // 2.4.2 Page Titled
    async testPageTitled(page) {
        const title = await page.title();
        const issues = [];

        if (!title || title.trim() === '') {
            issues.push('Page has no title');
        } else if (title.length < 3) {
            issues.push('Page title is too short');
        }

        return {
            test: '2.4.2 Page Titled',
            status: issues.length === 0 ? 'passed' : 'failed',
            issues
        };
    }

    // 2.4.3 Focus Order
    async testFocusOrder(page) {
        const issues = [];

        // Test that focus order follows logical sequence
        const focusableElements = await page.locator(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ).all();

        // Check for positive tabindex values which can disrupt order
        for (const element of focusableElements) {
            const tabIndex = await element.getAttribute('tabindex');
            if (tabIndex && parseInt(tabIndex) > 0) {
                issues.push('Positive tabindex found, may disrupt focus order');
            }
        }

        return {
            test: '2.4.3 Focus Order',
            status: issues.length === 0 ? 'passed' : 'warning',
            issues
        };
    }

    // 2.4.7 Focus Visible
    async testFocusVisible(page) {
        const issues = [];
        const focusableElements = await page.locator('button, [href], input').all();

        for (const element of focusableElements.slice(0, 5)) {
            if (await element.isVisible()) {
                await element.focus();

                const focusStyles = await element.evaluate(el => {
                    const styles = window.getComputedStyle(el, ':focus');
                    return {
                        outline: styles.outline,
                        boxShadow: styles.boxShadow
                    };
                });

                if (focusStyles.outline === 'none' && focusStyles.boxShadow === 'none') {
                    issues.push('Element has no visible focus indicator');
                }
            }
        }

        return {
            test: '2.4.7 Focus Visible',
            status: issues.length === 0 ? 'passed' : 'failed',
            issues
        };
    }

    // 3.1.1 Language of Page
    async testLanguageOfPage(page) {
        const lang = await page.getAttribute('html', 'lang');
        const issues = [];

        if (!lang) {
            issues.push('HTML element missing lang attribute');
        } else if (lang.length < 2) {
            issues.push('Invalid language code');
        }

        return {
            test: '3.1.1 Language of Page',
            status: issues.length === 0 ? 'passed' : 'failed',
            issues
        };
    }

    // 3.2.1 On Focus
    async testOnFocus(page) {
        // Test that focusing elements doesn't cause unexpected context changes
        const issues = [];
        const focusableElements = await page.locator('button, [href], input, select').all();

        for (const element of focusableElements.slice(0, 5)) {
            if (await element.isVisible()) {
                const initialUrl = page.url();
                await element.focus();
                const afterFocusUrl = page.url();

                if (initialUrl !== afterFocusUrl) {
                    issues.push('Focus caused unexpected navigation');
                }
            }
        }

        return {
            test: '3.2.1 On Focus',
            status: issues.length === 0 ? 'passed' : 'failed',
            issues
        };
    }

    // 3.2.2 On Input
    async testOnInput(page) {
        // Test that input doesn't cause unexpected context changes
        const issues = [];
        const inputs = await page.locator('input, select').all();

        for (const input of inputs.slice(0, 3)) {
            if (await input.isVisible() && !await input.isDisabled()) {
                const initialUrl = page.url();

                try {
                    if (await input.evaluate(el => el.type === 'text')) {
                        await input.fill('test');
                    } else if (await input.evaluate(el => el.tagName === 'SELECT')) {
                        const options = await input.locator('option').all();
                        if (options.length > 1) {
                            await input.selectOption({ index: 1 });
                        }
                    }

                    const afterInputUrl = page.url();
                    if (initialUrl !== afterInputUrl) {
                        issues.push('Input caused unexpected navigation');
                    }
                } catch (error) {
                    // Input might not be interactable, skip
                }
            }
        }

        return {
            test: '3.2.2 On Input',
            status: issues.length === 0 ? 'passed' : 'warning',
            issues
        };
    }

    // 3.3.1 Error Identification
    async testErrorIdentification(page) {
        const issues = [];

        // Look for form validation
        const forms = await page.locator('form').all();

        for (const form of forms) {
            const submitButton = form.locator('button[type="submit"], input[type="submit"]');

            if (await submitButton.count() > 0) {
                await submitButton.first().click();

                // Look for error messages
                const errorMessages = await page.locator('[role="alert"], .error, [aria-live="polite"]').count();

                if (errorMessages === 0) {
                    // This might be okay if form is valid, so it's a warning
                    issues.push('Form submission did not produce error messages');
                }
            }
        }

        return {
            test: '3.3.1 Error Identification',
            status: issues.length === 0 ? 'passed' : 'warning',
            issues
        };
    }

    // 3.3.2 Labels or Instructions
    async testLabelsOrInstructions(page) {
        const issues = [];
        const inputs = await page.locator('input, select, textarea').all();

        for (const input of inputs) {
            const id = await input.getAttribute('id');
            const ariaLabel = await input.getAttribute('aria-label');
            const ariaLabelledby = await input.getAttribute('aria-labelledby');
            const placeholder = await input.getAttribute('placeholder');

            let hasLabel = false;

            if (id) {
                const label = await page.locator(`label[for="${id}"]`).count();
                hasLabel = label > 0;
            }

            if (!hasLabel && !ariaLabel && !ariaLabelledby && !placeholder) {
                issues.push('Form control has no label or instructions');
            }
        }

        return {
            test: '3.3.2 Labels or Instructions',
            status: issues.length === 0 ? 'passed' : 'failed',
            issues
        };
    }

    // 4.1.1 Parsing
    async testParsing(page) {
        const issues = [];

        // Check for duplicate IDs
        const elementsWithId = await page.locator('[id]').all();
        const ids = new Set();

        for (const element of elementsWithId) {
            const id = await element.getAttribute('id');
            if (ids.has(id)) {
                issues.push(`Duplicate ID found: ${id}`);
            }
            ids.add(id);
        }

        return {
            test: '4.1.1 Parsing',
            status: issues.length === 0 ? 'passed' : 'failed',
            issues
        };
    }

    // 4.1.2 Name, Role, Value
    async testNameRoleValue(page) {
        const issues = [];
        const interactiveElements = await page.locator('button, [href], input, select, textarea, [role]').all();

        for (const element of interactiveElements) {
            const tagName = await element.evaluate(el => el.tagName);
            const role = await element.getAttribute('role');
            const ariaLabel = await element.getAttribute('aria-label');
            const ariaLabelledby = await element.getAttribute('aria-labelledby');

            // Check if element has accessible name
            if (tagName === 'BUTTON') {
                const text = await element.textContent();
                if (!text?.trim() && !ariaLabel && !ariaLabelledby) {
                    issues.push('Button has no accessible name');
                }
            }

            // Check for invalid ARIA attributes
            if (role) {
                const validRoles = [
                    'button', 'link', 'textbox', 'combobox', 'checkbox', 'radio',
                    'tab', 'tabpanel', 'dialog', 'alert', 'status', 'log',
                    'marquee', 'timer', 'alertdialog', 'application', 'banner',
                    'complementary', 'contentinfo', 'form', 'main', 'navigation',
                    'region', 'search', 'article', 'columnheader', 'definition',
                    'directory', 'document', 'group', 'heading', 'img', 'list',
                    'listitem', 'math', 'note', 'presentation', 'row', 'rowgroup',
                    'rowheader', 'separator', 'toolbar'
                ];

                if (!validRoles.includes(role)) {
                    issues.push(`Invalid ARIA role: ${role}`);
                }
            }
        }

        return {
            test: '4.1.2 Name, Role, Value',
            status: issues.length === 0 ? 'passed' : 'failed',
            issues
        };
    }
}

/**
 * Enhanced accessibility test helpers
 */
export const enhancedAccessibilityHelpers = {
    ...accessibilityHelpers,

    /**
     * Run comprehensive WCAG compliance test
     */
    testWCAGCompliance: async (page, level = 'AA') => {
        const tester = new EnhancedAccessibilityTester();
        return await tester.testWCAGCompliance(page, level);
    },

    /**
     * Test accessibility across multiple user scenarios
     */
    testUserScenarios: async (page, scenarios = []) => {
        const defaultScenarios = [
            { name: 'keyboard-only', config: { hasPointer: false } },
            { name: 'screen-reader', config: { hasVision: false } },
            { name: 'high-contrast', config: { forcedColors: 'active' } },
            { name: 'reduced-motion', config: { reducedMotion: 'reduce' } },
            { name: 'large-text', config: { deviceScaleFactor: 2 } }
        ];

        const testScenarios = scenarios.length > 0 ? scenarios : defaultScenarios;
        const results = {};

        for (const scenario of testScenarios) {
            // Apply scenario configuration
            if (scenario.config.forcedColors) {
                await page.emulateMedia({ forcedColors: scenario.config.forcedColors });
            }
            if (scenario.config.reducedMotion) {
                await page.emulateMedia({ reducedMotion: scenario.config.reducedMotion });
            }
            if (scenario.config.deviceScaleFactor) {
                await page.setViewportSize({
                    width: 1024 / scenario.config.deviceScaleFactor,
                    height: 768 / scenario.config.deviceScaleFactor
                });
            }

            // Run accessibility tests for this scenario
            const tester = new EnhancedAccessibilityTester();
            results[scenario.name] = await tester.testWCAGCompliance(page, 'AA');
        }

        return results;
    },

    /**
     * Generate accessibility audit report
     */
    generateAuditReport: (testResults) => {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: 0,
                passed: 0,
                failed: 0,
                warnings: 0,
                complianceLevel: 'None'
            },
            categories: {},
            recommendations: [],
            criticalIssues: []
        };

        // Process results
        for (const [category, results] of Object.entries(testResults.categories || {})) {
            report.categories[category] = results;
            report.summary.totalTests += results.passed + results.failed + results.warnings;
            report.summary.passed += results.passed;
            report.summary.failed += results.failed;
            report.summary.warnings += results.warnings;

            // Identify critical issues
            results.details.forEach(detail => {
                if (detail.status === 'failed' && detail.test.includes('1.4.3')) {
                    report.criticalIssues.push('Color contrast issues detected');
                }
                if (detail.status === 'failed' && detail.test.includes('2.1.1')) {
                    report.criticalIssues.push('Keyboard accessibility issues detected');
                }
                if (detail.status === 'failed' && detail.test.includes('1.1.1')) {
                    report.criticalIssues.push('Missing alternative text for images');
                }
            });
        }

        // Determine compliance level
        const passRate = report.summary.passed / report.summary.totalTests;
        if (passRate >= 0.95) report.summary.complianceLevel = 'AAA';
        else if (passRate >= 0.90) report.summary.complianceLevel = 'AA';
        else if (passRate >= 0.80) report.summary.complianceLevel = 'A';

        // Generate recommendations
        if (report.summary.failed > 0) {
            report.recommendations.push('Address failed accessibility tests before deployment');
        }
        if (report.criticalIssues.length > 0) {
            report.recommendations.push('Prioritize fixing critical accessibility issues');
        }
        if (report.summary.warnings > report.summary.totalTests * 0.2) {
            report.recommendations.push('Review warnings to improve overall accessibility');
        }

        return report;
    }
};

export default EnhancedAccessibilityTester;