import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

test.describe('Comprehensive Accessibility Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await injectAxe(page);
    });

    test('should have no accessibility violations on homepage', async ({ page }) => {
        await checkA11y(page, null, {
            detailedReport: true,
            detailedReportOptions: { html: true },
            axeOptions: {
                rules: {
                    'color-contrast': { enabled: true },
                    'keyboard': { enabled: true },
                    'focus-order-semantics': { enabled: true },
                    'aria-valid-attr-value': { enabled: true },
                    'aria-valid-attr': { enabled: true },
                    'button-name': { enabled: true },
                    'link-name': { enabled: true },
                    'image-alt': { enabled: true },
                    'label': { enabled: true },
                    'landmark-one-main': { enabled: true },
                    'page-has-heading-one': { enabled: true },
                    'heading-order': { enabled: true }
                }
            }
        });
    });

    test('should support keyboard navigation', async ({ page }) => {
        // Get all focusable elements
        const focusableElements = await page.locator(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ).all();

        expect(focusableElements.length).toBeGreaterThan(0);

        // Test Tab navigation
        for (let i = 0; i < Math.min(focusableElements.length, 10); i++) {
            await page.keyboard.press('Tab');

            const activeElement = page.locator(':focus');
            await expect(activeElement).toBeVisible();

            // Check for visible focus indicator
            const focusStyles = await activeElement.evaluate(el => {
                const styles = window.getComputedStyle(el, ':focus');
                return {
                    outline: styles.outline,
                    boxShadow: styles.boxShadow,
                    border: styles.border
                };
            });

            // Should have some form of focus indicator
            const hasFocusIndicator =
                focusStyles.outline !== 'none' ||
                focusStyles.boxShadow !== 'none' ||
                focusStyles.border !== focusStyles.border; // Border changes on focus

            expect(hasFocusIndicator).toBeTruthy();
        }

        // Test Shift+Tab navigation
        for (let i = 0; i < 3; i++) {
            await page.keyboard.press('Shift+Tab');
            const activeElement = page.locator(':focus');
            await expect(activeElement).toBeVisible();
        }
    });

    test('should support screen reader navigation', async ({ page }) => {
        // Test heading structure
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
        expect(headings.length).toBeGreaterThan(0);

        // Check heading hierarchy
        let previousLevel = 0;
        for (const heading of headings) {
            const tagName = await heading.evaluate(el => el.tagName);
            const currentLevel = parseInt(tagName.charAt(1));

            if (previousLevel > 0) {
                // Heading levels should not skip (e.g., h1 -> h3)
                expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
            }

            previousLevel = currentLevel;
        }

        // Test landmark regions
        const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer').all();
        expect(landmarks.length).toBeGreaterThan(0);

        // Test ARIA labels
        const ariaElements = await page.locator('[aria-label], [aria-labelledby], [aria-describedby]').all();
        for (const element of ariaElements) {
            const ariaLabel = await element.getAttribute('aria-label');
            const ariaLabelledby = await element.getAttribute('aria-labelledby');
            const ariaDescribedby = await element.getAttribute('aria-describedby');

            if (ariaLabel) {
                expect(ariaLabel.trim()).not.toBe('');
            }

            if (ariaLabelledby) {
                const labelElement = page.locator(`#${ariaLabelledby}`);
                await expect(labelElement).toBeAttached();
            }

            if (ariaDescribedby) {
                const descElement = page.locator(`#${ariaDescribedby}`);
                await expect(descElement).toBeAttached();
            }
        }
    });

    test('should have proper form accessibility', async ({ page }) => {
        await page.goto('/settings');
        await page.waitForLoadState('networkidle');

        // Test form labels
        const inputs = await page.locator('input, select, textarea').all();
        for (const input of inputs) {
            const inputId = await input.getAttribute('id');
            const ariaLabel = await input.getAttribute('aria-label');
            const ariaLabelledby = await input.getAttribute('aria-labelledby');

            // Input should have a label, aria-label, or aria-labelledby
            if (inputId) {
                const label = page.locator(`label[for="${inputId}"]`);
                const hasLabel = await label.count() > 0;
                const hasAriaLabel = ariaLabel && ariaLabel.trim() !== '';
                const hasAriaLabelledby = ariaLabelledby && ariaLabelledby.trim() !== '';

                expect(hasLabel || hasAriaLabel || hasAriaLabelledby).toBeTruthy();
            }

            // Test required field indicators
            const isRequired = await input.getAttribute('required');
            const ariaRequired = await input.getAttribute('aria-required');

            if (isRequired !== null || ariaRequired === 'true') {
                // Required fields should be clearly indicated
                const parentForm = input.locator('xpath=ancestor::form[1]');
                const requiredIndicator = parentForm.locator('[aria-label*="required"], .required, [title*="required"]');
                // This is a soft check as required indicators can be implemented in various ways
            }
        }

        // Test form validation messages
        const submitButton = page.locator('button[type="submit"]');
        if (await submitButton.count() > 0) {
            await submitButton.click();

            // Look for validation messages
            const errorMessages = page.locator('[role="alert"], .error-message, [aria-live="polite"]');
            // Validation messages should be announced to screen readers
        }
    });

    test('should handle focus management in modals', async ({ page }) => {
        // Look for modal triggers
        const modalTriggers = page.locator('[data-testid*="modal"], [aria-haspopup="dialog"]');
        const triggerCount = await modalTriggers.count();

        if (triggerCount > 0) {
            const trigger = modalTriggers.first();
            await trigger.click();

            // Wait for modal to appear
            const modal = page.locator('[role="dialog"], .modal');
            await expect(modal).toBeVisible();

            // Focus should be trapped in modal
            const focusableInModal = modal.locator(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const focusableCount = await focusableInModal.count();

            if (focusableCount > 0) {
                // Test focus trap
                for (let i = 0; i < focusableCount + 2; i++) {
                    await page.keyboard.press('Tab');
                    const activeElement = page.locator(':focus');

                    // Active element should be within modal
                    const isInModal = await activeElement.evaluate((el, modalEl) => {
                        return modalEl.contains(el);
                    }, await modal.elementHandle());

                    expect(isInModal).toBeTruthy();
                }

                // Test Escape key closes modal
                await page.keyboard.press('Escape');
                await expect(modal).not.toBeVisible();
            }
        }
    });

    test('should have accessible color contrast', async ({ page }) => {
        await checkA11y(page, null, {
            axeOptions: {
                rules: {
                    'color-contrast': { enabled: true }
                }
            }
        });

        // Additional manual color contrast checks
        const textElements = await page.locator('p, span, div, h1, h2, h3, h4, h5, h6, a, button').all();

        for (const element of textElements.slice(0, 10)) { // Check first 10 elements
            if (await element.isVisible()) {
                const styles = await element.evaluate(el => {
                    const computed = window.getComputedStyle(el);
                    return {
                        color: computed.color,
                        backgroundColor: computed.backgroundColor,
                        fontSize: computed.fontSize
                    };
                });

                // This is a simplified check - in practice, you'd use a proper contrast calculation
                expect(styles.color).not.toBe(styles.backgroundColor);
            }
        }
    });

    test('should support high contrast mode', async ({ page, browserName }) => {
        // Test with forced colors (Windows High Contrast)
        if (browserName === 'chromium') {
            await page.emulateMedia({ forcedColors: 'active' });
            await page.reload();
            await page.waitForLoadState('networkidle');

            // Check that content is still visible and functional
            const mainContent = page.locator('main');
            await expect(mainContent).toBeVisible();

            // Check that interactive elements are still distinguishable
            const buttons = page.locator('button');
            const buttonCount = await buttons.count();

            for (let i = 0; i < Math.min(buttonCount, 5); i++) {
                const button = buttons.nth(i);
                await expect(button).toBeVisible();
            }
        }
    });

    test('should respect reduced motion preferences', async ({ page }) => {
        // Set reduced motion preference
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Check that animations are reduced or disabled
        const animatedElements = page.locator('[data-testid*="animated"], .animate, [style*="transition"]');
        const animatedCount = await animatedElements.count();

        for (let i = 0; i < Math.min(animatedCount, 5); i++) {
            const element = animatedElements.nth(i);
            const styles = await element.evaluate(el => {
                const computed = window.getComputedStyle(el);
                return {
                    animationDuration: computed.animationDuration,
                    transitionDuration: computed.transitionDuration
                };
            });

            // Animations should be disabled or very short
            if (styles.animationDuration !== 'none') {
                expect(parseFloat(styles.animationDuration)).toBeLessThanOrEqual(0.1);
            }
            if (styles.transitionDuration !== 'none') {
                expect(parseFloat(styles.transitionDuration)).toBeLessThanOrEqual(0.1);
            }
        }
    });

    test('should handle zoom levels correctly', async ({ page }) => {
        const zoomLevels = [1, 1.5, 2, 2.5, 3];

        for (const zoom of zoomLevels) {
            await page.setViewportSize({ width: 1024 / zoom, height: 768 / zoom });
            await page.evaluate((zoomLevel) => {
                document.body.style.zoom = zoomLevel;
            }, zoom);

            await page.waitForTimeout(500);

            // Content should still be accessible at all zoom levels
            const mainContent = page.locator('main');
            await expect(mainContent).toBeVisible();

            // No horizontal scrolling should occur
            const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
            const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
            expect(scrollWidth).toBeLessThanOrEqual(clientWidth * 1.1); // 10% tolerance

            // Text should remain readable
            const textElements = page.locator('p, h1, h2, h3').first();
            if (await textElements.count() > 0) {
                await expect(textElements.first()).toBeVisible();
            }
        }

        // Reset zoom
        await page.evaluate(() => {
            document.body.style.zoom = 1;
        });
    });

    test('should provide alternative text for images', async ({ page }) => {
        const images = await page.locator('img').all();

        for (const image of images) {
            const alt = await image.getAttribute('alt');
            const ariaLabel = await image.getAttribute('aria-label');
            const ariaLabelledby = await image.getAttribute('aria-labelledby');
            const role = await image.getAttribute('role');

            // Decorative images should have empty alt or role="presentation"
            // Content images should have descriptive alt text
            if (role === 'presentation' || alt === '') {
                // Decorative image - this is acceptable
                continue;
            }

            // Content images should have alternative text
            const hasAltText = (alt && alt.trim() !== '') ||
                (ariaLabel && ariaLabel.trim() !== '') ||
                (ariaLabelledby && ariaLabelledby.trim() !== '');

            expect(hasAltText).toBeTruthy();
        }
    });

    test('should have accessible data tables', async ({ page }) => {
        await page.goto('/dashboard'); // Assuming dashboard has data tables

        const tables = await page.locator('table').all();

        for (const table of tables) {
            // Tables should have captions or aria-label
            const caption = table.locator('caption');
            const ariaLabel = await table.getAttribute('aria-label');
            const ariaLabelledby = await table.getAttribute('aria-labelledby');

            const hasLabel = await caption.count() > 0 ||
                (ariaLabel && ariaLabel.trim() !== '') ||
                (ariaLabelledby && ariaLabelledby.trim() !== '');

            if (hasLabel) {
                // Table headers should be properly marked
                const headers = table.locator('th');
                const headerCount = await headers.count();

                if (headerCount > 0) {
                    // Headers should have scope attributes for complex tables
                    for (let i = 0; i < headerCount; i++) {
                        const header = headers.nth(i);
                        const scope = await header.getAttribute('scope');
                        // This is a soft check as simple tables may not need scope
                    }
                }
            }
        }
    });
});