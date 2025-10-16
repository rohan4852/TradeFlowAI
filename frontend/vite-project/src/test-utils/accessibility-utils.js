import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Accessibility testing utilities
export class AccessibilityTester {
    constructor() {
        this.violations = [];
        this.config = {
            rules: {
                // Enable all WCAG 2.1 AA rules
                'color-contrast': { enabled: true },
                'keyboard-navigation': { enabled: true },
                'focus-management': { enabled: true },
                'aria-labels': { enabled: true },
                'semantic-markup': { enabled: true }
            }
        };
    }

    // Test component for accessibility violations
    async testAccessibility(container, options = {}) {
        const config = { ...this.config, ...options };
        const results = await axe(container, config);

        this.violations.push(...results.violations);
        return results;
    }

    // Test keyboard navigation
    async testKeyboardNavigation(container) {
        const user = userEvent.setup();
        const focusableElements = this.getFocusableElements(container);
        const results = [];

        // Test Tab navigation
        for (let i = 0; i < focusableElements.length; i++) {
            await user.tab();
            const activeElement = document.activeElement;

            results.push({
                index: i,
                element: activeElement,
                isFocusable: focusableElements.includes(activeElement),
                hasVisibleFocus: this.hasVisibleFocus(activeElement)
            });
        }

        // Test Shift+Tab navigation
        for (let i = focusableElements.length - 1; i >= 0; i--) {
            await user.tab({ shift: true });
            const activeElement = document.activeElement;

            results.push({
                index: i,
                element: activeElement,
                isFocusable: focusableElements.includes(activeElement),
                hasVisibleFocus: this.hasVisibleFocus(activeElement),
                reverse: true
            });
        }

        return results;
    }

    // Test screen reader compatibility
    testScreenReaderCompatibility(container) {
        const issues = [];
        const elements = container.querySelectorAll('*');

        elements.forEach(element => {
            // Check for missing alt text on images
            if (element.tagName === 'IMG' && !element.alt && !element.getAttribute('aria-label')) {
                issues.push({
                    element,
                    issue: 'Missing alt text',
                    severity: 'error'
                });
            }

            // Check for missing labels on form controls
            if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
                const hasLabel = element.labels?.length > 0 ||
                    element.getAttribute('aria-label') ||
                    element.getAttribute('aria-labelledby');

                if (!hasLabel) {
                    issues.push({
                        element,
                        issue: 'Missing label',
                        severity: 'error'
                    });
                }
            }

            // Check for proper heading hierarchy
            if (element.tagName.match(/^H[1-6]$/)) {
                const level = parseInt(element.tagName.charAt(1));
                const previousHeading = this.findPreviousHeading(element);

                if (previousHeading && level > parseInt(previousHeading.tagName.charAt(1)) + 1) {
                    issues.push({
                        element,
                        issue: 'Heading level skipped',
                        severity: 'warning'
                    });
                }
            }

            // Check for interactive elements without proper roles
            if (this.isInteractive(element) && !element.getAttribute('role') && !this.hasImplicitRole(element)) {
                issues.push({
                    element,
                    issue: 'Missing role attribute',
                    severity: 'warning'
                });
            }
        });

        return issues;
    }

    // Test color contrast
    testColorContrast(container) {
        const issues = [];
        const textElements = container.querySelectorAll('*');

        textElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const color = computedStyle.color;
            const backgroundColor = computedStyle.backgroundColor;

            if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
                const contrast = this.calculateContrast(color, backgroundColor);
                const fontSize = parseFloat(computedStyle.fontSize);
                const fontWeight = computedStyle.fontWeight;

                const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
                const minContrast = isLargeText ? 3 : 4.5;

                if (contrast < minContrast) {
                    issues.push({
                        element,
                        issue: `Insufficient color contrast: ${contrast.toFixed(2)} (minimum: ${minContrast})`,
                        severity: 'error',
                        contrast,
                        minContrast
                    });
                }
            }
        });

        return issues;
    }

    // Test focus management
    testFocusManagement(container) {
        const issues = [];
        const focusableElements = this.getFocusableElements(container);

        focusableElements.forEach(element => {
            // Check for visible focus indicators
            if (!this.hasVisibleFocus(element)) {
                issues.push({
                    element,
                    issue: 'No visible focus indicator',
                    severity: 'error'
                });
            }

            // Check for proper tab index
            const tabIndex = element.tabIndex;
            if (tabIndex > 0) {
                issues.push({
                    element,
                    issue: 'Positive tab index should be avoided',
                    severity: 'warning'
                });
            }

            // Check for focus traps in modals
            if (element.getAttribute('role') === 'dialog' || element.classList.contains('modal')) {
                const focusableInModal = this.getFocusableElements(element);
                if (focusableInModal.length === 0) {
                    issues.push({
                        element,
                        issue: 'Modal has no focusable elements',
                        severity: 'error'
                    });
                }
            }
        });

        return issues;
    }

    // Helper methods
    getFocusableElements(container) {
        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ];

        return Array.from(container.querySelectorAll(focusableSelectors.join(', ')))
            .filter(element => this.isVisible(element));
    }

    hasVisibleFocus(element) {
        const computedStyle = window.getComputedStyle(element, ':focus');
        return computedStyle.outline !== 'none' ||
            computedStyle.boxShadow !== 'none' ||
            computedStyle.border !== computedStyle.border; // Check if border changes on focus
    }

    isVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            element.offsetWidth > 0 &&
            element.offsetHeight > 0;
    }

    isInteractive(element) {
        const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
        const interactiveRoles = ['button', 'link', 'textbox', 'combobox', 'checkbox', 'radio'];

        return interactiveTags.includes(element.tagName) ||
            interactiveRoles.includes(element.getAttribute('role')) ||
            element.hasAttribute('onclick') ||
            element.tabIndex >= 0;
    }

    hasImplicitRole(element) {
        const implicitRoles = {
            'BUTTON': 'button',
            'A': 'link',
            'INPUT': 'textbox',
            'SELECT': 'combobox',
            'TEXTAREA': 'textbox'
        };

        return implicitRoles.hasOwnProperty(element.tagName);
    }

    findPreviousHeading(element) {
        let current = element.previousElementSibling;

        while (current) {
            if (current.tagName.match(/^H[1-6]$/)) {
                return current;
            }
            current = current.previousElementSibling;
        }

        return null;
    }

    calculateContrast(color1, color2) {
        // Simplified contrast calculation (in real implementation, use proper color parsing)
        const rgb1 = this.parseColor(color1);
        const rgb2 = this.parseColor(color2);

        const l1 = this.getLuminance(rgb1);
        const l2 = this.getLuminance(rgb2);

        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);

        return (lighter + 0.05) / (darker + 0.05);
    }

    parseColor(color) {
        // Simplified color parsing (in real implementation, handle all color formats)
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            return {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3])
            };
        }
        return { r: 0, g: 0, b: 0 };
    }

    getLuminance({ r, g, b }) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    // Get all violations
    getViolations() {
        return this.violations;
    }

    // Clear violations
    clearViolations() {
        this.violations = [];
    }
}

// Accessibility test helpers
export const accessibilityHelpers = {
    // Test component accessibility
    testComponentAccessibility: async (Component, props = {}) => {
        const { container } = render(<Component {...props} />);
        const tester = new AccessibilityTester();

        const results = await tester.testAccessibility(container);
        const keyboardResults = await tester.testKeyboardNavigation(container);
        const screenReaderIssues = tester.testScreenReaderCompatibility(container);
        const contrastIssues = tester.testColorContrast(container);
        const focusIssues = tester.testFocusManagement(container);

        return {
            axeResults: results,
            keyboardNavigation: keyboardResults,
            screenReaderIssues,
            contrastIssues,
            focusIssues,
            hasViolations: results.violations.length > 0 ||
                screenReaderIssues.length > 0 ||
                contrastIssues.length > 0 ||
                focusIssues.length > 0
        };
    },

    // Test keyboard navigation specifically
    testKeyboardOnly: async (Component, props = {}) => {
        const user = userEvent.setup();
        const { container } = render(<Component {...props} />);

        // Simulate keyboard-only navigation
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const results = [];

        for (const element of focusableElements) {
            element.focus();

            // Test Enter key
            await user.keyboard('{Enter}');
            results.push({
                element,
                key: 'Enter',
                response: document.activeElement !== element ? 'activated' : 'no-response'
            });

            // Test Space key for buttons
            if (element.tagName === 'BUTTON') {
                element.focus();
                await user.keyboard(' ');
                results.push({
                    element,
                    key: 'Space',
                    response: document.activeElement !== element ? 'activated' : 'no-response'
                });
            }
        }

        return results;
    },

    // Test with screen reader simulation
    testScreenReaderAnnouncements: (Component, props = {}) => {
        const announcements = [];

        // Mock screen reader announcements
        const mockAnnounce = vi.fn((text) => {
            announcements.push({
                text,
                timestamp: Date.now()
            });
        });

        // Mock aria-live regions
        const originalCreateElement = document.createElement;
        document.createElement = vi.fn((tagName) => {
            const element = originalCreateElement.call(document, tagName);

            if (element.setAttribute) {
                const originalSetAttribute = element.setAttribute;
                element.setAttribute = vi.fn((name, value) => {
                    if (name === 'aria-live' && value !== 'off') {
                        // Mock live region announcements
                        const observer = new MutationObserver((mutations) => {
                            mutations.forEach((mutation) => {
                                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                                    mockAnnounce(element.textContent);
                                }
                            });
                        });

                        observer.observe(element, {
                            childList: true,
                            subtree: true,
                            characterData: true
                        });
                    }

                    return originalSetAttribute.call(element, name, value);
                });
            }

            return element;
        });

        render(<Component {...props} />);

        // Restore original createElement
        document.createElement = originalCreateElement;

        return {
            announcements,
            mockAnnounce
        };
    }
};

// Accessibility matchers
export const accessibilityMatchers = {
    toBeAccessible: async (received) => {
        const results = await axe(received);
        const pass = results.violations.length === 0;

        return {
            message: () => {
                if (pass) {
                    return 'Expected element to have accessibility violations';
                } else {
                    const violations = results.violations.map(v =>
                        `${v.id}: ${v.description} (${v.nodes.length} instances)`
                    ).join('\n');
                    return `Expected element to be accessible but found violations:\n${violations}`;
                }
            },
            pass
        };
    },

    toHaveKeyboardSupport: async (received) => {
        const tester = new AccessibilityTester();
        const results = await tester.testKeyboardNavigation(received);
        const pass = results.every(result => result.isFocusable && result.hasVisibleFocus);

        return {
            message: () => `Expected element to have full keyboard support`,
            pass
        };
    },

    toMeetContrastRequirements: (received) => {
        const tester = new AccessibilityTester();
        const issues = tester.testColorContrast(received);
        const pass = issues.length === 0;

        return {
            message: () => {
                if (pass) {
                    return 'Expected element to have contrast issues';
                } else {
                    const issueList = issues.map(issue => issue.issue).join('\n');
                    return `Expected element to meet contrast requirements but found issues:\n${issueList}`;
                }
            },
            pass
        };
    }
};

export default AccessibilityTester;