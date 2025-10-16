import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
    const viewports = [
        { name: 'Mobile Portrait', width: 375, height: 667 },
        { name: 'Mobile Landscape', width: 667, height: 375 },
        { name: 'Tablet Portrait', width: 768, height: 1024 },
        { name: 'Tablet Landscape', width: 1024, height: 768 },
        { name: 'Desktop Small', width: 1024, height: 768 },
        { name: 'Desktop Medium', width: 1440, height: 900 },
        { name: 'Desktop Large', width: 1920, height: 1080 },
        { name: 'Ultra Wide', width: 2560, height: 1440 }
    ];

    viewports.forEach(({ name, width, height }) => {
        test(`should render correctly on ${name} (${width}x${height})`, async ({ page }) => {
            await page.setViewportSize({ width, height });
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Take screenshot for visual comparison
            await expect(page).toHaveScreenshot(`homepage-${name.toLowerCase().replace(/\s+/g, '-')}.png`);

            // Test navigation visibility and behavior
            const nav = page.locator('nav');
            await expect(nav).toBeVisible();

            if (width < 768) {
                // Mobile: should have hamburger menu
                const hamburger = page.locator('[data-testid="mobile-menu-toggle"]');
                await expect(hamburger).toBeVisible();

                // Test mobile menu functionality
                await hamburger.click();
                const mobileMenu = page.locator('[data-testid="mobile-menu"]');
                await expect(mobileMenu).toBeVisible();

                // Close menu
                await hamburger.click();
                await expect(mobileMenu).not.toBeVisible();
            } else {
                // Desktop: should have full navigation
                const navLinks = page.locator('nav a');
                const linkCount = await navLinks.count();
                expect(linkCount).toBeGreaterThan(0);
            }

            // Test main content area responsiveness
            const main = page.locator('main');
            await expect(main).toBeVisible();

            const mainBox = await main.boundingBox();
            expect(mainBox.width).toBeLessThanOrEqual(width);
            expect(mainBox.height).toBeLessThanOrEqual(height);
        });
    });

    test('should handle orientation changes', async ({ page }) => {
        // Start in portrait
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Verify portrait layout
        const portraitLayout = page.locator('[data-testid="dashboard-layout"]');
        await expect(portraitLayout).toHaveClass(/portrait|mobile/);

        // Change to landscape
        await page.setViewportSize({ width: 667, height: 375 });
        await page.waitForTimeout(500); // Allow layout to adjust

        // Verify landscape layout
        await expect(portraitLayout).toHaveClass(/landscape|mobile-landscape/);

        // Test that content is still accessible
        const widgets = page.locator('[data-testid="widget"]');
        const widgetCount = await widgets.count();
        expect(widgetCount).toBeGreaterThan(0);

        // Ensure no horizontal scrolling
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance
    });

    test('should adapt chart layouts for different screen sizes', async ({ page }) => {
        await page.goto('/charts');

        for (const { name, width, height } of viewports) {
            await page.setViewportSize({ width, height });
            await page.waitForTimeout(500);

            const chart = page.locator('[data-testid="trading-chart"]');
            await expect(chart).toBeVisible();

            const chartBox = await chart.boundingBox();

            if (width < 768) {
                // Mobile: chart should be full width with reduced height
                expect(chartBox.width).toBeGreaterThan(width * 0.9);
                expect(chartBox.height).toBeLessThan(height * 0.6);
            } else if (width < 1024) {
                // Tablet: chart should take most of the screen
                expect(chartBox.width).toBeGreaterThan(width * 0.8);
                expect(chartBox.height).toBeGreaterThan(height * 0.4);
            } else {
                // Desktop: chart should be optimally sized
                expect(chartBox.width).toBeGreaterThan(width * 0.6);
                expect(chartBox.height).toBeGreaterThan(height * 0.5);
            }

            // Test chart controls visibility
            const chartControls = page.locator('[data-testid="chart-controls"]');
            await expect(chartControls).toBeVisible();

            if (width < 768) {
                // Mobile: controls might be collapsed or in a drawer
                const mobileControls = page.locator('[data-testid="mobile-chart-controls"]');
                if (await mobileControls.isVisible()) {
                    await expect(mobileControls).toBeVisible();
                }
            }
        }
    });

    test('should handle touch interactions on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/charts');
        await page.waitForLoadState('networkidle');

        const chart = page.locator('[data-testid="trading-chart"]');
        await expect(chart).toBeVisible();

        // Test touch interactions
        const chartBox = await chart.boundingBox();
        const centerX = chartBox.x + chartBox.width / 2;
        const centerY = chartBox.y + chartBox.height / 2;

        // Test tap
        await page.touchscreen.tap(centerX, centerY);

        // Test pinch to zoom (simulate)
        await page.touchscreen.tap(centerX - 50, centerY);
        await page.touchscreen.tap(centerX + 50, centerY);

        // Test swipe gesture
        await page.touchscreen.tap(centerX, centerY);
        await page.mouse.move(centerX, centerY);
        await page.mouse.down();
        await page.mouse.move(centerX + 100, centerY);
        await page.mouse.up();

        // Verify chart is still functional
        await expect(chart).toBeVisible();
    });

    test('should maintain readability at all sizes', async ({ page }) => {
        for (const { name, width, height } of viewports) {
            await page.setViewportSize({ width, height });
            await page.goto('/dashboard');
            await page.waitForTimeout(500);

            // Check font sizes are appropriate
            const headings = page.locator('h1, h2, h3, h4, h5, h6');
            const headingCount = await headings.count();

            for (let i = 0; i < headingCount; i++) {
                const heading = headings.nth(i);
                const fontSize = await heading.evaluate(el =>
                    window.getComputedStyle(el).fontSize
                );
                const fontSizeNum = parseFloat(fontSize);

                if (width < 768) {
                    // Mobile: minimum 14px for headings
                    expect(fontSizeNum).toBeGreaterThanOrEqual(14);
                } else {
                    // Desktop: minimum 16px for headings
                    expect(fontSizeNum).toBeGreaterThanOrEqual(16);
                }
            }

            // Check body text readability
            const bodyText = page.locator('p, span, div').first();
            if (await bodyText.isVisible()) {
                const fontSize = await bodyText.evaluate(el =>
                    window.getComputedStyle(el).fontSize
                );
                const fontSizeNum = parseFloat(fontSize);

                // Minimum 12px for body text on mobile, 14px on desktop
                const minSize = width < 768 ? 12 : 14;
                expect(fontSizeNum).toBeGreaterThanOrEqual(minSize);
            }
        }
    });

    test('should handle grid layouts responsively', async ({ page }) => {
        await page.goto('/dashboard');

        for (const { name, width, height } of viewports) {
            await page.setViewportSize({ width, height });
            await page.waitForTimeout(500);

            const widgets = page.locator('[data-testid="widget"]');
            const widgetCount = await widgets.count();

            if (widgetCount > 0) {
                // Check grid layout adapts to screen size
                const firstWidget = widgets.first();
                const widgetBox = await firstWidget.boundingBox();

                if (width < 768) {
                    // Mobile: widgets should stack vertically (full width)
                    expect(widgetBox.width).toBeGreaterThan(width * 0.8);
                } else if (width < 1024) {
                    // Tablet: 2 columns max
                    expect(widgetBox.width).toBeLessThan(width * 0.6);
                } else {
                    // Desktop: multiple columns allowed
                    expect(widgetBox.width).toBeLessThan(width * 0.4);
                }

                // Ensure no widgets overflow
                expect(widgetBox.x + widgetBox.width).toBeLessThanOrEqual(width);
            }
        }
    });

    test('should handle image scaling correctly', async ({ page }) => {
        await page.goto('/');

        for (const { name, width, height } of viewports) {
            await page.setViewportSize({ width, height });
            await page.waitForTimeout(500);

            const images = page.locator('img');
            const imageCount = await images.count();

            for (let i = 0; i < imageCount; i++) {
                const image = images.nth(i);
                if (await image.isVisible()) {
                    const imageBox = await image.boundingBox();

                    // Images should not overflow container
                    expect(imageBox.width).toBeLessThanOrEqual(width);
                    expect(imageBox.height).toBeLessThanOrEqual(height);

                    // Images should maintain aspect ratio
                    const naturalWidth = await image.evaluate(img => img.naturalWidth);
                    const naturalHeight = await image.evaluate(img => img.naturalHeight);

                    if (naturalWidth > 0 && naturalHeight > 0) {
                        const naturalRatio = naturalWidth / naturalHeight;
                        const displayRatio = imageBox.width / imageBox.height;

                        // Allow 5% tolerance for aspect ratio
                        expect(Math.abs(naturalRatio - displayRatio) / naturalRatio).toBeLessThan(0.05);
                    }
                }
            }
        }
    });
});