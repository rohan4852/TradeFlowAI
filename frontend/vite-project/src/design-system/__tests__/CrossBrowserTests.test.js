import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAllProviders, generateMockData } from '../test-utils/render-utils';

// Import components for cross-browser testing
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Icon } from '../components/atoms/Icon';
import { Card } from '../components/molecules/Card';
import { FormGroup } from '../components/molecules/FormGroup';
import { CandlestickChart } from '../components/organisms/CandlestickChart';
import { OrderBook } from '../components/organisms/OrderBook';
import { GridLayout } from '../components/organisms/GridLayout';

describe('Cross-Browser Compatibility Tests', () => {
    let user;
    let mockUserAgent;

    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();

        // Store original userAgent
        mockUserAgent = vi.spyOn(navigator, 'userAgent', 'get');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // Mock different browser environments
    const mockBrowserEnvironment = (browser) => {
        const userAgents = {
            chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
            safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
        };

        mockUserAgent.mockReturnValue(userAgents[browser]);

        // Mock browser-specific features
        switch (browser) {
            case 'firefox':
                // Firefox-specific mocks
                global.CSS = { supports: vi.fn(() => true) };
                break;
            case 'safari':
                // Safari-specific mocks
                global.webkitRequestAnimationFrame = global.requestAnimationFrame;
                break;
            case 'edge':
                // Edge-specific mocks
                global.MSInputMethodContext = {};
                break;
        }
    };

    describe('CSS Feature Support Tests', () => {
        const browsers = ['chrome', 'firefox', 'safari', 'edge'];

        browsers.forEach(browser => {
            describe(`${browser.toUpperCase()} compatibility`, () => {
                beforeEach(() => {
                    mockBrowserEnvironment(browser);
                });

                it('should support CSS Grid layout', () => {
                    const { container } = renderWithAllProviders(
                        <GridLayout
                            widgets={[
                                { id: 'widget-1', type: 'chart', position: { x: 0, y: 0 }, size: { w: 6, h: 4 } }
                            ]}
                            testId="grid-layout"
                        />
                    );

                    const gridElement = container.querySelector('[data-testid="grid-layout"]');
                    expect(gridElement).toBeInTheDocument();

                    // Check if CSS Grid is applied (mock check)
                    const computedStyle = getComputedStyle(gridElement);
                    expect(computedStyle.display).toBe('grid');
                });

                it('should support Flexbox layout', () => {
                    const { container } = renderWithAllProviders(
                        <Card title="Flex Card" testId="flex-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Button>Left</Button>
                                <Button>Right</Button>
                            </div>
                        </Card>
                    );

                    const flexContainer = container.querySelector('[style*="display: flex"]');
                    expect(flexContainer).toBeInTheDocument();
                });

                it('should support CSS Custom Properties (CSS Variables)', () => {
                    const { container } = renderWithAllProviders(
                        <Button
                            variant="primary"
                            style={{ '--custom-color': '#007bff' }}
                            testId="css-vars-button"
                        >
                            CSS Variables Test
                        </Button>
                    );

                    const button = screen.getByTestId('css-vars-button');
                    expect(button).toBeInTheDocument();
                    expect(button.style.getPropertyValue('--custom-color')).toBe('#007bff');
                });

                it('should support backdrop-filter for glassmorphism', () => {
                    const { container } = renderWithAllProviders(
                        <Card
                            glassmorphism={true}
                            testId="glass-card"
                        >
                            Glassmorphism Card
                        </Card>
                    );

                    const glassCard = screen.getByTestId('glass-card');
                    expect(glassCard).toBeInTheDocument();

                    // Mock backdrop-filter support check
                    const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)');
                    if (!supportsBackdropFilter && browser === 'firefox') {
                        // Firefox fallback should be applied
                        expect(glassCard).toHaveClass('glass-fallback');
                    }
                });
            });
        });
    });

    describe('JavaScript API Compatibility Tests', () => {
        const browsers = ['chrome', 'firefox', 'safari', 'edge'];

        browsers.forEach(browser => {
            describe(`${browser.toUpperCase()} JavaScript APIs`, () => {
                beforeEach(() => {
                    mockBrowserEnvironment(browser);
                });

                it('should support Canvas API for chart rendering', () => {
                    const chartData = generateMockData('candlestick', 100);

                    const { container } = renderWithAllProviders(
                        <CandlestickChart
                            data={chartData}
                            renderMode="canvas"
                            testId="canvas-chart"
                        />
                    );

                    const canvas = container.querySelector('canvas');
                    expect(canvas).toBeInTheDocument();

                    const context = canvas.getContext('2d');
                    expect(context).toBeTruthy();
                    expect(typeof context.fillRect).toBe('function');
                });

                it('should support Web Workers for background processing', async () => {
                    // Mock Web Worker support
                    global.Worker = vi.fn().mockImplementation(() => ({
                        postMessage: vi.fn(),
                        terminate: vi.fn(),
                        addEventListener: vi.fn(),
                        removeEventListener: vi.fn()
                    }));

                    const chartData = generateMockData('candlestick', 5000);

                    renderWithAllProviders(
                        <CandlestickChart
                            data={chartData}
                            useWebWorker={true}
                            testId="worker-chart"
                        />
                    );

                    // Verify Web Worker is created for heavy computations
                    expect(global.Worker).toHaveBeenCalled();
                });

                it('should support Intersection Observer for virtualization', () => {
                    const largeDataset = generateMockData('orderLevel', 10000);

                    renderWithAllProviders(
                        <OrderBook
                            bids={largeDataset}
                            asks={largeDataset}
                            virtualization={true}
                            testId="virtualized-orderbook"
                        />
                    );

                    // Verify Intersection Observer is used
                    expect(global.IntersectionObserver).toHaveBeenCalled();
                });

                it('should support ResizeObserver for responsive components', () => {
                    renderWithAllProviders(
                        <CandlestickChart
                            data={generateMockData('candlestick', 100)}
                            responsive={true}
                            testId="responsive-chart"
                        />
                    );

                    // Verify ResizeObserver is used
                    expect(global.ResizeObserver).toHaveBeenCalled();
                });
            });
        });
    });

    describe('Event Handling Compatibility Tests', () => {
        const browsers = ['chrome', 'firefox', 'safari', 'edge'];

        browsers.forEach(browser => {
            describe(`${browser.toUpperCase()} event handling`, () => {
                beforeEach(() => {
                    mockBrowserEnvironment(browser);
                });

                it('should handle mouse events consistently', async () => {
                    const onMouseEvents = {
                        onMouseEnter: vi.fn(),
                        onMouseLeave: vi.fn(),
                        onMouseDown: vi.fn(),
                        onMouseUp: vi.fn(),
                        onClick: vi.fn()
                    };

                    renderWithAllProviders(
                        <Button {...onMouseEvents} testId="mouse-button">
                            Mouse Events Test
                        </Button>
                    );

                    const button = screen.getByTestId('mouse-button');

                    // Test mouse events
                    await user.hover(button);
                    expect(onMouseEvents.onMouseEnter).toHaveBeenCalled();

                    await user.unhover(button);
                    expect(onMouseEvents.onMouseLeave).toHaveBeenCalled();

                    await user.click(button);
                    expect(onMouseEvents.onClick).toHaveBeenCalled();
                });

                it('should handle keyboard events consistently', async () => {
                    const onKeyboardEvents = {
                        onKeyDown: vi.fn(),
                        onKeyUp: vi.fn(),
                        onKeyPress: vi.fn()
                    };

                    renderWithAllProviders(
                        <Input {...onKeyboardEvents} testId="keyboard-input" />
                    );

                    const input = screen.getByTestId('keyboard-input');

                    // Test keyboard events
                    await user.type(input, 'test');
                    expect(onKeyboardEvents.onKeyDown).toHaveBeenCalled();
                    expect(onKeyboardEvents.onKeyUp).toHaveBeenCalled();
                });

                it('should handle touch events on mobile browsers', async () => {
                    // Mock touch events
                    const touchEvents = {
                        onTouchStart: vi.fn(),
                        onTouchMove: vi.fn(),
                        onTouchEnd: vi.fn()
                    };

                    renderWithAllProviders(
                        <Button {...touchEvents} testId="touch-button">
                            Touch Events Test
                        </Button>
                    );

                    const button = screen.getByTestId('touch-button');

                    // Simulate touch events
                    fireEvent.touchStart(button, {
                        touches: [{ clientX: 100, clientY: 100 }]
                    });
                    expect(touchEvents.onTouchStart).toHaveBeenCalled();

                    fireEvent.touchEnd(button);
                    expect(touchEvents.onTouchEnd).toHaveBeenCalled();
                });

                it('should handle wheel events for chart zooming', async () => {
                    const onWheel = vi.fn();
                    const chartData = generateMockData('candlestick', 100);

                    renderWithAllProviders(
                        <CandlestickChart
                            data={chartData}
                            onWheel={onWheel}
                            testId="wheel-chart"
                        />
                    );

                    const chart = screen.getByTestId('wheel-chart');

                    // Test wheel event
                    fireEvent.wheel(chart, { deltaY: 100 });
                    expect(onWheel).toHaveBeenCalled();
                });
            });
        });
    });

    describe('Form Handling Compatibility Tests', () => {
        const browsers = ['chrome', 'firefox', 'safari', 'edge'];

        browsers.forEach(browser => {
            describe(`${browser.toUpperCase()} form handling`, () => {
                beforeEach(() => {
                    mockBrowserEnvironment(browser);
                });

                it('should handle form validation consistently', async () => {
                    const onSubmit = vi.fn();
                    const onInvalid = vi.fn();

                    renderWithAllProviders(
                        <FormGroup onSubmit={onSubmit} testId="validation-form">
                            <Input
                                type="email"
                                required
                                onInvalid={onInvalid}
                                testId="email-input"
                            />
                            <Button type="submit">Submit</Button>
                        </FormGroup>
                    );

                    const input = screen.getByTestId('email-input');
                    const submitButton = screen.getByRole('button', { name: 'Submit' });

                    // Test invalid input
                    await user.type(input, 'invalid-email');
                    await user.click(submitButton);

                    // Should trigger validation
                    expect(input.validity.valid).toBe(false);
                });

                it('should handle input types consistently', async () => {
                    const inputTypes = ['text', 'email', 'password', 'number', 'tel', 'url'];

                    for (const type of inputTypes) {
                        const { unmount } = renderWithAllProviders(
                            <Input type={type} testId={`${type}-input`} />
                        );

                        const input = screen.getByTestId(`${type}-input`);
                        expect(input).toHaveAttribute('type', type);

                        unmount();
                    }
                });
            });
        });
    });

    describe('Animation Compatibility Tests', () => {
        const browsers = ['chrome', 'firefox', 'safari', 'edge'];

        browsers.forEach(browser => {
            describe(`${browser.toUpperCase()} animations`, () => {
                beforeEach(() => {
                    mockBrowserEnvironment(browser);
                });

                it('should support CSS transitions', async () => {
                    const { container } = renderWithAllProviders(
                        <Button
                            variant="primary"
                            className="transition-all duration-300"
                            testId="transition-button"
                        >
                            Transition Test
                        </Button>
                    );

                    const button = screen.getByTestId('transition-button');

                    // Trigger hover state
                    await user.hover(button);

                    // Check if transition is applied
                    const computedStyle = getComputedStyle(button);
                    expect(computedStyle.transition).toContain('all');
                });

                it('should support CSS animations', () => {
                    const { container } = renderWithAllProviders(
                        <div
                            className="animate-pulse"
                            testId="animated-element"
                        >
                            Animated Content
                        </div>
                    );

                    const element = screen.getByTestId('animated-element');
                    const computedStyle = getComputedStyle(element);

                    // Check if animation is applied
                    expect(computedStyle.animation).toBeTruthy();
                });

                it('should support requestAnimationFrame', () => {
                    let animationFrameId;
                    const animationCallback = vi.fn(() => {
                        animationFrameId = requestAnimationFrame(animationCallback);
                    });

                    animationFrameId = requestAnimationFrame(animationCallback);

                    expect(typeof animationFrameId).toBe('number');
                    expect(global.requestAnimationFrame).toHaveBeenCalled();

                    // Clean up
                    cancelAnimationFrame(animationFrameId);
                });
            });
        });
    });

    describe('Storage API Compatibility Tests', () => {
        const browsers = ['chrome', 'firefox', 'safari', 'edge'];

        browsers.forEach(browser => {
            describe(`${browser.toUpperCase()} storage APIs`, () => {
                beforeEach(() => {
                    mockBrowserEnvironment(browser);
                });

                it('should support localStorage for layout persistence', () => {
                    const mockWidgets = [
                        { id: 'widget-1', type: 'chart', position: { x: 0, y: 0 }, size: { w: 6, h: 4 } }
                    ];

                    renderWithAllProviders(
                        <GridLayout
                            widgets={mockWidgets}
                            persistLayout={true}
                            layoutKey="test-layout"
                            testId="persistent-grid"
                        />
                    );

                    // Verify localStorage is used
                    expect(window.localStorage.setItem).toHaveBeenCalled();
                });

                it('should support sessionStorage for temporary data', () => {
                    // Mock sessionStorage
                    const mockSessionStorage = {
                        getItem: vi.fn(),
                        setItem: vi.fn(),
                        removeItem: vi.fn(),
                        clear: vi.fn()
                    };

                    Object.defineProperty(window, 'sessionStorage', {
                        value: mockSessionStorage
                    });

                    // Test component that uses sessionStorage
                    renderWithAllProviders(
                        <CandlestickChart
                            data={generateMockData('candlestick', 100)}
                            saveViewState={true}
                            testId="stateful-chart"
                        />
                    );

                    expect(mockSessionStorage.setItem).toHaveBeenCalled();
                });
            });
        });
    });

    describe('Performance API Compatibility Tests', () => {
        const browsers = ['chrome', 'firefox', 'safari', 'edge'];

        browsers.forEach(browser => {
            describe(`${browser.toUpperCase()} performance APIs`, () => {
                beforeEach(() => {
                    mockBrowserEnvironment(browser);
                });

                it('should support Performance Observer', () => {
                    const mockPerformanceObserver = vi.fn().mockImplementation(() => ({
                        observe: vi.fn(),
                        disconnect: vi.fn()
                    }));

                    global.PerformanceObserver = mockPerformanceObserver;

                    renderWithAllProviders(
                        <CandlestickChart
                            data={generateMockData('candlestick', 100)}
                            enablePerformanceMonitoring={true}
                            testId="monitored-chart"
                        />
                    );

                    expect(mockPerformanceObserver).toHaveBeenCalled();
                });

                it('should support performance.now() for timing', () => {
                    expect(typeof performance.now).toBe('function');

                    const startTime = performance.now();
                    const endTime = performance.now();

                    expect(endTime).toBeGreaterThanOrEqual(startTime);
                });
            });
        });
    });

    describe('Fallback and Polyfill Tests', () => {
        it('should provide fallbacks for unsupported features', () => {
            // Mock unsupported feature
            delete global.IntersectionObserver;

            const largeDataset = generateMockData('orderLevel', 1000);

            renderWithAllProviders(
                <OrderBook
                    bids={largeDataset}
                    asks={largeDataset}
                    virtualization={true}
                    testId="fallback-orderbook"
                />
            );

            // Should still render without IntersectionObserver
            expect(screen.getByTestId('fallback-orderbook')).toBeInTheDocument();
        });

        it('should detect and handle browser-specific quirks', () => {
            // Test Safari-specific handling
            mockBrowserEnvironment('safari');

            const { container } = renderWithAllProviders(
                <Button variant="primary" testId="safari-button">
                    Safari Button
                </Button>
            );

            const button = screen.getByTestId('safari-button');

            // Safari-specific styles should be applied
            expect(button).toHaveClass('safari-optimized');
        });

        it('should provide graceful degradation for older browsers', () => {
            // Mock older browser without modern features
            delete global.CSS.supports;
            delete global.ResizeObserver;

            renderWithAllProviders(
                <CandlestickChart
                    data={generateMockData('candlestick', 100)}
                    testId="legacy-chart"
                />
            );

            // Should still render with basic functionality
            expect(screen.getByTestId('legacy-chart')).toBeInTheDocument();
        });
    });

    describe('Browser-Specific Bug Workarounds', () => {
        it('should handle Firefox flexbox bugs', () => {
            mockBrowserEnvironment('firefox');

            const { container } = renderWithAllProviders(
                <div style={{ display: 'flex', minHeight: 0 }}>
                    <Card title="Flex Card" style={{ flex: 1 }}>
                        Content
                    </Card>
                </div>
            );

            // Firefox-specific flexbox fixes should be applied
            const flexContainer = container.firstChild;
            expect(flexContainer).toHaveStyle({ minHeight: '0' });
        });

        it('should handle Safari date input issues', () => {
            mockBrowserEnvironment('safari');

            renderWithAllProviders(
                <Input type="date" testId="safari-date-input" />
            );

            const input = screen.getByTestId('safari-date-input');

            // Safari-specific date input handling
            expect(input).toHaveAttribute('type', 'date');
        });

        it('should handle Edge scrollbar styling', () => {
            mockBrowserEnvironment('edge');

            const { container } = renderWithAllProviders(
                <div
                    style={{ overflow: 'auto', height: '200px' }}
                    testId="scrollable-container"
                >
                    <div style={{ height: '400px' }}>Scrollable content</div>
                </div>
            );

            const scrollContainer = screen.getByTestId('scrollable-container');

            // Edge-specific scrollbar styles should be applied
            expect(scrollContainer).toHaveClass('edge-scrollbar');
        });
    });
});