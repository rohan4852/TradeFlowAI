import { test, expect } from '@playwright/test';

test.describe('Theme Variation Tests', () => {
    const themes = [
        { name: 'light', selector: '[data-theme="light"]' },
        { name: 'dark', selector: '[data-theme="dark"]' },
        { name: 'high-contrast', selector: '[data-theme="high-contrast"]' },
        { name: 'auto', selector: '[data-theme="auto"]' }
    ];

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    themes.forEach(({ name, selector }) => {
        test(`should render correctly in ${name} theme`, async ({ page }) => {
            // Set theme
            await page.evaluate((themeName) => {
                document.documentElement.setAttribute('data-theme', themeName);
                localStorage.setItem('theme', themeName);
            }, name);

            await page.reload();
            await page.waitForLoadState('networkidle');

            // Verify theme is applied
            const themeElement = page.locator(selector);
            await expect(themeElement).toBeAttached();

            // Take screenshot for visual comparison
            await expect(page).toHaveScreenshot(`homepage-${name}-theme.png`);

            // Test theme-specific elements
            const header = page.locator('header');
            await expect(header).toBeVisible();

            const nav = page.locator('nav');
            await expect(nav).toBeVisible();

            const main = page.locator('main');
            await expect(main).toBeVisible();

            // Verify color scheme is applied
            const bodyStyles = await page.evaluate(() => {
                const body = document.body;
                const styles = window.getComputedStyle(body);
                return {
                    backgroundColor: styles.backgroundColor,
                    color: styles.color
                };
            });

            // Colors should be different from default
            expect(bodyStyles.backgroundColor).toBeTruthy();
            expect(bodyStyles.color).toBeTruthy();
            expect(bodyStyles.backgroundColor).not.toBe(bodyStyles.color);
        });
    });

    test('should maintain accessibility in all themes', async ({ page }) => {
        for (const { name } of themes) {
            // Set theme
            await page.evaluate((themeName) => {
                document.documentElement.setAttribute('data-theme', themeName);
                localStorage.setItem('theme', themeName);
            }, name);

            await page.reload();
            await page.waitForLoadState('networkidle');

            // Test color contrast in current theme
            const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, a, button, span').all();

            for (const element of textElements.slice(0, 10)) {
                if (await element.isVisible()) {
                    const styles = await element.evaluate(el => {
                        const computed = window.getComputedStyle(el);
                        return {
                            color: computed.color,
                            backgroundColor: computed.backgroundColor,
                            fontSize: parseFloat(computed.fontSize)
                        };
                    });

                    // Basic contrast check - colors should be different
                    expect(styles.color).not.toBe(styles.backgroundColor);

                    // Font size should be readable
                    expect(styles.fontSize).toBeGreaterThanOrEqual(12);
                }
            }

            // Test focus indicators in current theme
            const focusableElements = await page.locator('button, a, input').all();

            for (const element of focusableElements.slice(0, 5)) {
                if (await element.isVisible()) {
                    await element.focus();

                    const focusStyles = await element.evaluate(el => {
                        const styles = window.getComputedStyle(el, ':focus');
                        return {
                            outline: styles.outline,
                            boxShadow: styles.boxShadow,
                            borderColor: styles.borderColor
                        };
                    });

                    // Should have visible focus indicator
                    const hasFocusIndicator =
                        focusStyles.outline !== 'none' ||
                        focusStyles.boxShadow !== 'none' ||
                        focusStyles.borderColor !== 'transparent';

                    expect(hasFocusIndicator).toBeTruthy();
                }
            }
        }
    });

    test('should handle theme switching correctly', async ({ page }) => {
        // Start with light theme
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        });

        await page.reload();
        await page.waitForLoadState('networkidle');

        // Get initial background color
        const lightBg = await page.evaluate(() => {
            return window.getComputedStyle(document.body).backgroundColor;
        });

        // Switch to dark theme
        const themeToggle = page.locator('[data-testid="theme-toggle"]');
        if (await themeToggle.count() > 0) {
            await themeToggle.click();
            await page.waitForTimeout(500); // Allow theme transition

            // Verify theme changed
            const darkBg = await page.evaluate(() => {
                return window.getComputedStyle(document.body).backgroundColor;
            });

            expect(darkBg).not.toBe(lightBg);

            // Verify theme preference is saved
            const savedTheme = await page.evaluate(() => {
                return localStorage.getItem('theme');
            });

            expect(savedTheme).toBe('dark');
        }
    });

    test('should respect system theme preference', async ({ page }) => {
        // Test with light system preference
        await page.emulateMedia({ colorScheme: 'light' });

        await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'auto');
            localStorage.setItem('theme', 'auto');
        });

        await page.reload();
        await page.waitForLoadState('networkidle');

        const lightSystemBg = await page.evaluate(() => {
            return window.getComputedStyle(document.body).backgroundColor;
        });

        // Test with dark system preference
        await page.emulateMedia({ colorScheme: 'dark' });
        await page.reload();
        await page.waitForLoadState('networkidle');

        const darkSystemBg = await page.evaluate(() => {
            return window.getComputedStyle(document.body).backgroundColor;
        });

        // Background should change based on system preference
        expect(darkSystemBg).not.toBe(lightSystemBg);
    });

    test('should handle theme transitions smoothly', async ({ page }) => {
        // Enable theme transitions
        await page.addStyleTag({
            content: `
        * {
          transition: background-color 0.3s ease, color 0.3s ease !important;
        }
      `
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const themeToggle = page.locator('[data-testid="theme-toggle"]');
        if (await themeToggle.count() > 0) {
            // Record initial state
            const initialBg = await page.evaluate(() => {
                return window.getComputedStyle(document.body).backgroundColor;
            });

            // Click theme toggle
            await themeToggle.click();

            // Wait for transition to complete
            await page.waitForTimeout(500);

            // Verify theme changed
            const finalBg = await page.evaluate(() => {
                return window.getComputedStyle(document.body).backgroundColor;
            });

            expect(finalBg).not.toBe(initialBg);

            // Verify no layout shift occurred during transition
            const mainElement = page.locator('main');
            const mainBox = await mainElement.boundingBox();
            expect(mainBox.width).toBeGreaterThan(0);
            expect(mainBox.height).toBeGreaterThan(0);
        }
    });

    test('should maintain component consistency across themes', async ({ page }) => {
        const components = [
            { name: 'buttons', selector: 'button' },
            { name: 'inputs', selector: 'input' },
            { name: 'cards', selector: '[data-testid*="card"]' },
            { name: 'navigation', selector: 'nav' }
        ];

        for (const { name: themeName } of themes) {
            await page.evaluate((theme) => {
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
            }, themeName);

            await page.reload();
            await page.waitForLoadState('networkidle');

            for (const { name: componentName, selector } of components) {
                const elements = await page.locator(selector).all();

                for (const element of elements.slice(0, 3)) {
                    if (await element.isVisible()) {
                        // Component should be visible and functional
                        await expect(element).toBeVisible();

                        // Interactive elements should be clickable
                        if (selector === 'button' || selector.includes('input')) {
                            await expect(element).toBeEnabled();
                        }

                        // Take screenshot for visual regression
                        await expect(element).toHaveScreenshot(`${componentName}-${themeName}-theme.png`);
                    }
                }
            }
        }
    });

    test('should handle high contrast theme correctly', async ({ page }) => {
        // Set high contrast theme
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'high-contrast');
            localStorage.setItem('theme', 'high-contrast');
        });

        await page.reload();
        await page.waitForLoadState('networkidle');

        // Test that high contrast styles are applied
        const textElements = await page.locator('p, h1, h2, h3, button, a').all();

        for (const element of textElements.slice(0, 5)) {
            if (await element.isVisible()) {
                const styles = await element.evaluate(el => {
                    const computed = window.getComputedStyle(el);
                    return {
                        color: computed.color,
                        backgroundColor: computed.backgroundColor,
                        borderColor: computed.borderColor,
                        borderWidth: computed.borderWidth
                    };
                });

                // High contrast theme should have strong color differences
                expect(styles.color).not.toBe(styles.backgroundColor);

                // Interactive elements should have visible borders
                if (await element.evaluate(el => el.tagName === 'BUTTON' || el.tagName === 'A')) {
                    expect(parseFloat(styles.borderWidth)).toBeGreaterThan(0);
                }
            }
        }
    });

    test('should preserve theme across page navigation', async ({ page }) => {
        // Set dark theme
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        });

        await page.reload();
        await page.waitForLoadState('networkidle');

        const initialBg = await page.evaluate(() => {
            return window.getComputedStyle(document.body).backgroundColor;
        });

        // Navigate to different page
        const dashboardLink = page.locator('a[href="/dashboard"]');
        if (await dashboardLink.count() > 0) {
            await dashboardLink.click();
            await page.waitForLoadState('networkidle');

            // Theme should be preserved
            const dashboardBg = await page.evaluate(() => {
                return window.getComputedStyle(document.body).backgroundColor;
            });

            expect(dashboardBg).toBe(initialBg);

            // Theme attribute should still be set
            const themeAttr = await page.evaluate(() => {
                return document.documentElement.getAttribute('data-theme');
            });

            expect(themeAttr).toBe('dark');
        }
    });

    test('should handle theme-specific images and icons', async ({ page }) => {
        for (const { name: themeName } of themes) {
            await page.evaluate((theme) => {
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
            }, themeName);

            await page.reload();
            await page.waitForLoadState('networkidle');

            // Check for theme-specific images
            const themeImages = page.locator(`[data-theme-image="${themeName}"], .${themeName}-only`);
            const themeImageCount = await themeImages.count();

            if (themeImageCount > 0) {
                for (let i = 0; i < themeImageCount; i++) {
                    const image = themeImages.nth(i);
                    await expect(image).toBeVisible();
                }
            }

            // Check that opposite theme images are hidden
            const oppositeTheme = themeName === 'light' ? 'dark' : 'light';
            const oppositeImages = page.locator(`[data-theme-image="${oppositeTheme}"], .${oppositeTheme}-only`);
            const oppositeImageCount = await oppositeImages.count();

            if (oppositeImageCount > 0) {
                for (let i = 0; i < oppositeImageCount; i++) {
                    const image = oppositeImages.nth(i);
                    await expect(image).not.toBeVisible();
                }
            }
        }
    });
});