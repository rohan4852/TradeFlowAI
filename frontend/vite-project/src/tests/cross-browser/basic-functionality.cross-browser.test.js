import { test, expect } from '@playwright/test';

test.describe('Basic Functionality Cross-Browser Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should load homepage correctly', async ({ page, browserName }) => {
        // Test basic page load
        await expect(page).toHaveTitle(/AI Trading Platform/);

        // Test main navigation is visible
        const nav = page.locator('nav');
        await expect(nav).toBeVisible();

        // Test main content area
        const main = page.locator('main');
        await expect(main).toBeVisible();

        // Browser-specific checks
        if (browserName === 'webkit') {
            // Safari-specific checks
            await expect(page.locator('[data-testid="safari-compatible"]')).toBeVisible();
        }

        if (browserName === 'firefox') {
            // Firefox-specific checks
            await expect(page.locator('[data-testid="firefox-compatible"]')).toBeVisible();
        }
    });

    test('should handle navigation correctly', async ({ page }) => {
        // Test navigation links
        const dashboardLink = page.locator('a[href="/dashboard"]');
        await dashboardLink.click();
        await page.waitForURL('**/dashboard');
        await expect(page).toHaveURL(/.*dashboard/);

        // Test back navigation
        await page.goBack();
        await expect(page).toHaveURL('/');

        // Test forward navigation
        await page.goForward();
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should render charts correctly', async ({ page, browserName }) => {
        await page.goto('/charts');
        await page.waitForLoadState('networkidle');

        // Wait for chart to load
        const chart = page.locator('[data-testid="trading-chart"]');
        await expect(chart).toBeVisible({ timeout: 10000 });

        // Test chart interactions
        await chart.hover();
        await expect(page.locator('[data-testid="chart-tooltip"]')).toBeVisible();

        // Browser-specific chart rendering checks
        if (browserName === 'webkit') {
            // Safari may have different canvas rendering
            const canvas = page.locator('canvas');
            await expect(canvas).toBeVisible();

            // Check canvas dimensions
            const canvasBox = await canvas.boundingBox();
            expect(canvasBox.width).toBeGreaterThan(0);
            expect(canvasBox.height).toBeGreaterThan(0);
        }
    });

    test('should handle form interactions', async ({ page }) => {
        await page.goto('/settings');

        // Test form inputs
        const nameInput = page.locator('input[name="name"]');
        await nameInput.fill('Test User');
        await expect(nameInput).toHaveValue('Test User');

        // Test select dropdown
        const themeSelect = page.locator('select[name="theme"]');
        await themeSelect.selectOption('dark');
        await expect(themeSelect).toHaveValue('dark');

        // Test checkbox
        const notificationsCheckbox = page.locator('input[name="notifications"]');
        await notificationsCheckbox.check();
        await expect(notificationsCheckbox).toBeChecked();

        // Test form submission
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // Verify success message
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    test('should handle real-time data updates', async ({ page }) => {
        await page.goto('/dashboard');

        // Wait for initial data load
        const priceDisplay = page.locator('[data-testid="current-price"]');
        await expect(priceDisplay).toBeVisible();

        // Get initial price
        const initialPrice = await priceDisplay.textContent();

        // Wait for potential price update (mock or real)
        await page.waitForTimeout(3000);

        // Check if price has updated or at least is still visible
        await expect(priceDisplay).toBeVisible();
        const currentPrice = await priceDisplay.textContent();

        // Price should be a valid number format
        expect(currentPrice).toMatch(/^\$?\d+\.?\d*$/);
    });

    test('should handle error states gracefully', async ({ page }) => {
        // Test network error handling
        await page.route('**/api/**', route => route.abort());

        await page.goto('/dashboard');

        // Should show error message
        const errorMessage = page.locator('[data-testid="error-message"]');
        await expect(errorMessage).toBeVisible({ timeout: 10000 });

        // Should have retry button
        const retryButton = page.locator('[data-testid="retry-button"]');
        await expect(retryButton).toBeVisible();

        // Test retry functionality
        await page.unroute('**/api/**');
        await retryButton.click();

        // Error should disappear
        await expect(errorMessage).not.toBeVisible({ timeout: 10000 });
    });

    test('should maintain state across page refreshes', async ({ page }) => {
        await page.goto('/settings');

        // Set some preferences
        await page.locator('select[name="theme"]').selectOption('dark');
        await page.locator('input[name="notifications"]').check();
        await page.locator('button[type="submit"]').click();

        // Refresh page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Verify preferences are maintained
        await expect(page.locator('select[name="theme"]')).toHaveValue('dark');
        await expect(page.locator('input[name="notifications"]')).toBeChecked();
    });
});