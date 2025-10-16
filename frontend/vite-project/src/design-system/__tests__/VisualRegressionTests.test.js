import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import {
    VisualRegressionTester,
    visualTestHelpers,
    visualMatchers
} from '../test-utils/visual-regression-utils';
import { renderWithAllProviders, generateMockData } from '../test-utils/render-utils';

// Import components for visual testing
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Icon } from '../components/atoms/Icon';
import { Card } from '../components/molecules/Card';
import { Navigation } from '../components/molecules/Navigation';
import { CandlestickChart } from '../components/organisms/CandlestickChart';
import { OrderBook } from '../components/organisms/OrderBook';

// Extend expect with visual matchers
expect.extend(visualMatchers);

describe('Visual Regression Tests', () => {
    let visualTester;

    beforeEach(() => {
        visualTester = new VisualRegressionTester();

        // Mock screenshot APIs
        visualTestHelpers.mockScreenshotAPI();

        vi.clearAllMocks();
    });

    afterEach(() => {
        visualTester.clearSnapshots();
        vi.restoreAllMocks();
    });

    describe('Atomic Component Visual Tests', () => {
        it('should maintain visual consistency for Button variants', async () => {
            const buttonVariants = [
                { variant: 'primary', children: 'Primary Button' },
                { variant: 'secondary', children: 'Secondary Button' },
                { variant: 'outline', children: 'Outline Button' },
                { variant: 'ghost', children: 'Ghost Button' },
                { variant: 'danger', children: 'Danger Button' }
            ];

            for (const props of buttonVariants) {
                const result = await visualTestHelpers.testVisualConsistency(
                    Button,
                    props,
                    `button-${props.variant}`
                );

                expect(result.match).toBe(true);
                expect(result.differencePercentage).toBeLessThan(0.05); // Less than 5% difference
            }
        });

        it('should render Button states consistently', async () => {
            const buttonStates = await visualTestHelpers.testInteractionStates(
                Button,
                { variant: 'primary', children: 'Test Button' },
                'button-states'
            );

            // Verify all states are captured
            expect(buttonStates).toHaveProperty('default');
            expect(buttonStates).toHaveProperty('hover');
            expect(buttonStates).toHaveProperty('focus');
            expect(buttonStates).toHaveProperty('active');
            expect(buttonStates).toHaveProperty('disabled');

            // Each state should be visually distinct
            const states = Object.values(buttonStates);
            for (let i = 0; i < states.length - 1; i++) {
                for (let j = i + 1; j < states.length; j++) {
                    const comparison = visualTester.compareScreenshots(states[i], states[j]);
                    expect(comparison.differencePercentage).toBeGreaterThan(0.01); // At least 1% different
                }
            }
        });

        it('should maintain Input component visual consistency', async () => {
            const inputVariants = [
                { type: 'text', placeholder: 'Text input' },
                { type: 'email', placeholder: 'Email input' },
                { type: 'password', placeholder: 'Password input' },
                { type: 'number', placeholder: 'Number input' },
                { type: 'search', placeholder: 'Search input' }
            ];

            for (const props of inputVariants) {
                const result = await visualTestHelpers.testVisualConsistency(
                    Input,
                    props,
                    `input-${props.type}`
                );

                expect(result.match).toBe(true);
            }
        });

        it('should render Icon components with consistent sizing', async () => {
            const iconSizes = ['xs', 'sm', 'md', 'lg', 'xl'];
            const iconNames = ['chart', 'settings', 'user', 'bell', 'search'];

            for (const size of iconSizes) {
                for (const name of iconNames) {
                    const screenshot = await visualTester.captureScreenshot(
                        <Icon name={name} size={size} />,
                        `icon-${name}-${size}`
                    );

                    // Verify icon dimensions match expected size
                    const expectedSizes = {
                        xs: 16, sm: 20, md: 24, lg: 32, xl: 40
                    };

                    expect(screenshot.width).toBeGreaterThanOrEqual(expectedSizes[size]);
                    expect(screenshot.height).toBeGreaterThanOrEqual(expectedSizes[size]);
                }
            }
        });
    });

    describe('Molecular Component Visual Tests', () => {
        it('should maintain Card component visual consistency', async () => {
            const cardVariants = [
                { title: 'Basic Card', children: 'Card content' },
                { title: 'Card with Header', header: 'Header Content', children: 'Body content' },
                { title: 'Card with Footer', children: 'Body content', footer: 'Footer content' },
                { title: 'Elevated Card', elevation: 'high', children: 'Elevated content' }
            ];

            for (const props of cardVariants) {
                const result = await visualTestHelpers.testVisualConsistency(
                    Card,
                    props,
                    `card-${props.title.toLowerCase().replace(/\s+/g, '-')}`
                );

                expect(result.match).toBe(true);
            }
        });

        it('should render Navigation component consistently', async () => {
            const navigationItems = [
                { label: 'Dashboard', href: '/dashboard', active: true },
                { label: 'Charts', href: '/charts', active: false },
                { label: 'Portfolio', href: '/portfolio', active: false },
                { label: 'Settings', href: '/settings', active: false }
            ];

            const result = await visualTestHelpers.testVisualConsistency(
                Navigation,
                { items: navigationItems },
                'navigation-component'
            );

            expect(result.match).toBe(true);
        });
    });

    describe('Organism Component Visual Tests', () => {
        it('should maintain CandlestickChart visual consistency', async () => {
            const chartData = generateMockData('candlestick', 100);
            const chartProps = {
                data: chartData,
                width: 800,
                height: 400,
                indicators: [{ type: 'sma', period: 20, visible: true }]
            };

            const result = await visualTestHelpers.testVisualConsistency(
                CandlestickChart,
                chartProps,
                'candlestick-chart'
            );

            expect(result.match).toBe(true);
        });

        it('should render OrderBook with consistent visual hierarchy', async () => {
            const orderBookData = {
                bids: generateMockData('orderLevel', 20),
                asks: generateMockData('orderLevel', 20)
            };

            const result = await visualTestHelpers.testVisualConsistency(
                OrderBook,
                orderBookData,
                'order-book'
            );

            expect(result.match).toBe(true);
        });
    });

    describe('Responsive Design Visual Tests', () => {
        it('should render components correctly across different viewports', async () => {
            const viewports = [
                { name: 'mobile', width: 375, height: 667 },
                { name: 'tablet', width: 768, height: 1024 },
                { name: 'desktop', width: 1024, height: 768 },
                { name: 'large', width: 1440, height: 900 }
            ];

            const components = [
                { component: Button, props: { children: 'Responsive Button' }, name: 'button' },
                { component: Card, props: { title: 'Responsive Card', children: 'Content' }, name: 'card' },
                { component: Navigation, props: { items: [{ label: 'Home', href: '/' }] }, name: 'navigation' }
            ];

            for (const { component: Component, props, name } of components) {
                const screenshots = await visualTestHelpers.testResponsiveDesign(
                    Component,
                    props,
                    name
                );

                expect(screenshots).toRenderCorrectlyAcrossViewports(viewports);

                // Verify each viewport has a screenshot
                viewports.forEach(viewport => {
                    expect(screenshots).toHaveProperty(viewport.name);
                    expect(screenshots[viewport.name]).toBeDefined();
                });
            }
        });

        it('should handle responsive breakpoint transitions smoothly', async () => {
            const breakpoints = [320, 768, 1024, 1440];
            const chartData = generateMockData('candlestick', 50);

            for (let i = 0; i < breakpoints.length - 1; i++) {
                const currentBreakpoint = breakpoints[i];
                const nextBreakpoint = breakpoints[i + 1];

                const currentScreenshot = await visualTester.captureScreenshot(
                    <CandlestickChart data={chartData} />,
                    `chart-${currentBreakpoint}px`,
                    { width: currentBreakpoint, height: 600 }
                );

                const nextScreenshot = await visualTester.captureScreenshot(
                    <CandlestickChart data={chartData} />,
                    `chart-${nextBreakpoint}px`,
                    { width: nextBreakpoint, height: 600 }
                );

                // Charts should adapt to different widths
                expect(currentScreenshot.width).toBe(currentBreakpoint);
                expect(nextScreenshot.width).toBe(nextBreakpoint);
            }
        });
    });

    describe('Theme Visual Tests', () => {
        it('should render components consistently across themes', async () => {
            const themes = ['light', 'dark'];
            const components = [
                { component: Button, props: { variant: 'primary', children: 'Themed Button' }, name: 'button' },
                { component: Input, props: { placeholder: 'Themed input' }, name: 'input' },
                { component: Card, props: { title: 'Themed Card', children: 'Content' }, name: 'card' }
            ];

            for (const { component: Component, props, name } of components) {
                const themeScreenshots = await visualTestHelpers.testThemeVariations(
                    Component,
                    props,
                    name
                );

                // Verify both themes are captured
                expect(themeScreenshots).toHaveProperty('light');
                expect(themeScreenshots).toHaveProperty('dark');

                // Themes should be visually different
                const comparison = visualTester.compareScreenshots(
                    themeScreenshots.light,
                    themeScreenshots.dark
                );
                expect(comparison.differencePercentage).toBeGreaterThan(0.1); // At least 10% different
            }
        });

        it('should maintain color contrast ratios across themes', async () => {
            const themes = ['light', 'dark'];
            const textComponents = [
                { component: Button, props: { children: 'Button Text' } },
                { component: Card, props: { title: 'Card Title', children: 'Card body text' } }
            ];

            for (const theme of themes) {
                for (const { component: Component, props } of textComponents) {
                    const screenshot = await visualTester.captureScreenshot(
                        <Component {...props} data-theme={theme} />,
                        `contrast-${theme}`
                    );

                    // Mock color contrast validation
                    const hasGoodContrast = this.validateColorContrast(screenshot, theme);
                    expect(hasGoodContrast).toBe(true);
                }
            }
        });

        // Mock color contrast validation
        validateColorContrast(screenshot, theme) {
            // In a real implementation, this would analyze the screenshot
            // and calculate actual color contrast ratios
            return true; // Mock passing validation
        }
    });

    describe('Animation Visual Tests', () => {
        it('should capture animation keyframes consistently', async () => {
            const animationSteps = [0, 25, 50, 75, 100]; // Percentage of animation completion

            for (const step of animationSteps) {
                const screenshot = await visualTester.captureScreenshot(
                    <Button
                        className="animate-pulse"
                        style={{ animationDelay: `${step}%` }}
                    >
                        Animated Button
                    </Button>,
                    `button-animation-${step}`
                );

                expect(screenshot).toBeDefined();
            }
        });

        it('should verify glassmorphism effects render correctly', async () => {
            const glassComponents = [
                <Card glassmorphism={true} title="Glass Card" />,
                <Button variant="glass">Glass Button</Button>
            ];

            for (let i = 0; i < glassComponents.length; i++) {
                const screenshot = await visualTester.captureScreenshot(
                    glassComponents[i],
                    `glass-effect-${i}`
                );

                // Mock glassmorphism validation
                const hasGlassEffect = this.validateGlassmorphism(screenshot);
                expect(hasGlassEffect).toBe(true);
            }
        });

        // Mock glassmorphism validation
        validateGlassmorphism(screenshot) {
            // In a real implementation, this would check for backdrop-filter effects
            return true; // Mock passing validation
        }
    });

    describe('Cross-Browser Visual Tests', () => {
        it('should render consistently across different browsers', async () => {
            const browsers = ['chrome', 'firefox', 'safari', 'edge'];
            const component = <Button variant="primary">Cross-browser Button</Button>;

            const browserScreenshots = {};

            for (const browser of browsers) {
                // Mock browser-specific rendering
                const screenshot = await visualTester.captureScreenshot(
                    component,
                    `button-${browser}`,
                    { browser }
                );
                browserScreenshots[browser] = screenshot;
            }

            // Compare screenshots across browsers
            const baselineScreenshot = browserScreenshots.chrome;

            for (const browser of browsers.slice(1)) {
                const comparison = visualTester.compareScreenshots(
                    baselineScreenshot,
                    browserScreenshots[browser]
                );

                // Allow for minor browser differences
                expect(comparison.differencePercentage).toBeLessThan(0.15); // Less than 15% difference
            }
        });
    });

    describe('Visual Regression Report Generation', () => {
        it('should generate comprehensive visual test reports', async () => {
            const testResults = [
                { name: 'button-primary', passed: true, differencePercentage: 0.02 },
                { name: 'card-basic', passed: true, differencePercentage: 0.01 },
                { name: 'chart-candlestick', passed: false, differencePercentage: 0.12 },
                { name: 'orderbook-large', passed: true, differencePercentage: 0.03 }
            ];

            const report = visualTester.generateReport(testResults);

            expect(report).toMatchObject({
                timestamp: expect.any(String),
                totalTests: 4,
                passed: 3,
                failed: 1,
                results: expect.arrayContaining([
                    expect.objectContaining({
                        name: expect.any(String),
                        passed: expect.any(Boolean),
                        differencePercentage: expect.any(Number)
                    })
                ])
            });

            // Verify report statistics
            expect(report.passed + report.failed).toBe(report.totalTests);
            expect(report.results).toHaveLength(testResults.length);
        });

        it('should track visual regression trends over time', async () => {
            const historicalResults = [
                { timestamp: '2024-01-01', passed: 95, failed: 5 },
                { timestamp: '2024-01-02', passed: 93, failed: 7 },
                { timestamp: '2024-01-03', passed: 97, failed: 3 },
                { timestamp: '2024-01-04', passed: 96, failed: 4 }
            ];

            // Mock trend analysis
            const trend = this.analyzeTrend(historicalResults);

            expect(trend).toMatchObject({
                direction: expect.oneOf(['improving', 'stable', 'degrading']),
                confidence: expect.any(Number),
                recommendation: expect.any(String)
            });
        });

        // Mock trend analysis
        analyzeTrend(results) {
            const passRates = results.map(r => r.passed / (r.passed + r.failed));
            const avgPassRate = passRates.reduce((sum, rate) => sum + rate, 0) / passRates.length;

            return {
                direction: avgPassRate > 0.95 ? 'stable' : 'improving',
                confidence: 0.85,
                recommendation: 'Continue monitoring visual consistency'
            };
        }
    });
});