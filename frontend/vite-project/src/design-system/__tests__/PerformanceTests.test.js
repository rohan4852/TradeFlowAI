import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { PerformanceTester, performanceHelpers, performanceMatchers } from '../test-utils/performance-utils';
import { renderWithAllProviders, generateMockData } from '../test-utils/render-utils';

// Import components for performance testing
import { CandlestickChart } from '../components/organisms/CandlestickChart';
import { OrderBook } from '../components/organisms/OrderBook';
import { GridLayout } from '../components/organisms/GridLayout';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';

// Extend expect with performance matchers
expect.extend(performanceMatchers);

describe('Design System Performance Tests', () => {
    let performanceTester;

    beforeEach(() => {
        performanceTester = new PerformanceTester();
        vi.clearAllMocks();

        // Mock performance.now for consistent testing
        performanceHelpers.mockPerformanceNow();
    });

    afterEach(() => {
        performanceTester.clear();
        vi.restoreAllMocks();
    });

    describe('Component Rendering Performance', () => {
        it('should render atomic components within performance budget', async () => {
            const buttonProps = { children: 'Test Button', variant: 'primary' };
            const inputProps = { placeholder: 'Test Input', type: 'text' };

            // Test Button rendering performance
            const buttonPerf = await performanceHelpers.testRenderPerformance(
                (props) => render(<Button {...props} />),
                buttonProps,
                100
            );

            expect(buttonPerf.average).toRenderWithinTime(5); // 5ms budget for atomic components
            expect(buttonPerf.p95).toBeLessThan(10); // 95th percentile under 10ms

            // Test Input rendering performance
            const inputPerf = await performanceHelpers.testRenderPerformance(
                (props) => render(<Input {...props} />),
                inputProps,
                100
            );

            expect(inputPerf.average).toRenderWithinTime(5);
            expect(inputPerf.p95).toBeLessThan(10);
        });

        it('should render complex organisms within performance budget', async () => {
            const chartData = generateMockData('candlestick', 1000);
            const chartProps = {
                data: chartData,
                width: 800,
                height: 400,
                indicators: [{ type: 'sma', period: 20 }]
            };

            const chartPerf = await performanceHelpers.testRenderPerformance(
                (props) => renderWithAllProviders(<CandlestickChart {...props} />),
                chartProps,
                10
            );

            expect(chartPerf.average).toRenderWithinTime(50); // 50ms budget for complex components
            expect(chartPerf.p95).toBeLessThan(100); // 95th percentile under 100ms
        });

        it('should handle large datasets efficiently', async () => {
            const largeDataset = generateMockData('candlestick', 10000);

            const { renderTime } = performanceHelpers.testLargeDatasetPerformance(
                (props) => renderWithAllProviders(<CandlestickChart {...props} />),
                largeDataset.length
            );

            expect(renderTime).toRenderWithinTime(200); // 200ms budget for large datasets
        });
    });

    describe('Memory Usage Performance', () => {
        it('should not leak memory during component lifecycle', async () => {
            const testComponent = () => {
                const { unmount } = renderWithAllProviders(
                    <CandlestickChart data={generateMockData('candlestick', 100)} />
                );
                unmount();
            };

            const memoryTest = await performanceTester.testMemoryLeaks(testComponent, 20);
            expect(memoryTest).toNotLeakMemory();
        });

        it('should manage memory efficiently with large datasets', async () => {
            const largeOrderBook = {
                bids: generateMockData('orderLevel', 5000),
                asks: generateMockData('orderLevel', 5000)
            };

            const { memoryDelta } = performanceTester.measureMemoryUsage('large-orderbook', () => {
                return renderWithAllProviders(
                    <OrderBook bids={largeOrderBook.bids} asks={largeOrderBook.asks} />
                );
            });

            // Should not use more than 20MB for large order book
            expect(memoryDelta).toBeLessThan(20000000);
        });

        it('should clean up resources on component unmount', async () => {
            const initialMemory = performanceTester.getMemoryUsage();

            const { unmount } = renderWithAllProviders(
                <div>
                    <CandlestickChart data={generateMockData('candlestick', 1000)} />
                    <OrderBook
                        bids={generateMockData('orderLevel', 100)}
                        asks={generateMockData('orderLevel', 100)}
                    />
                </div>
            );

            const mountedMemory = performanceTester.getMemoryUsage();
            unmount();

            // Allow time for cleanup
            await new Promise(resolve => setTimeout(resolve, 100));

            const unmountedMemory = performanceTester.getMemoryUsage();
            const memoryReclaimed = mountedMemory - unmountedMemory;

            // Should reclaim at least 80% of allocated memory
            const memoryAllocated = mountedMemory - initialMemory;
            expect(memoryReclaimed).toBeGreaterThan(memoryAllocated * 0.8);
        });
    });

    describe('Animation Performance', () => {
        it('should maintain 60fps during smooth animations', async () => {
            const animationTest = async () => {
                const { container } = renderWithAllProviders(
                    <Button variant="primary" className="animate-pulse">
                        Animated Button
                    </Button>
                );

                // Trigger animation
                const button = container.querySelector('button');
                button.style.animation = 'pulse 1s ease-in-out infinite';

                return container;
            };

            const { fps } = await performanceHelpers.testAnimationPerformance(animationTest, 1000);
            expect(fps).toMaintainFrameRate(30); // Minimum 30fps, ideally 60fps
        });

        it('should handle multiple simultaneous animations', async () => {
            const multiAnimationTest = async () => {
                const orderLevels = generateMockData('orderLevel', 50);

                renderWithAllProviders(
                    <OrderBook
                        bids={orderLevels}
                        asks={orderLevels}
                        animations={{
                            priceFlash: { duration: 200 },
                            sizeChange: { duration: 300 },
                            newOrder: { duration: 400 }
                        }}
                    />
                );

                // Simulate multiple price updates to trigger animations
                for (let i = 0; i < 10; i++) {
                    setTimeout(() => {
                        // Trigger animation by updating props
                    }, i * 50);
                }
            };

            const { fps } = await performanceHelpers.testAnimationPerformance(multiAnimationTest, 2000);
            expect(fps).toMaintainFrameRate(24); // Lower threshold for complex animations
        });
    });

    describe('Real-time Update Performance', () => {
        it('should handle high-frequency data updates efficiently', async () => {
            const initialData = generateMockData('candlestick', 100);

            const { rerender } = renderWithAllProviders(
                <CandlestickChart data={initialData} realTimeUpdates={true} />
            );

            const updates = Array.from({ length: 100 }, (_, i) => ({
                data: [...initialData, ...generateMockData('candlestick', i + 1)]
            }));

            const updatePerf = performanceTester.measureUpdatePerformance({ rerender }, updates);

            expect(updatePerf.average).toRenderWithinTime(16); // 60fps = 16.67ms per frame
            expect(updatePerf.max).toBeLessThan(33); // No frame should take longer than 2 frames
        });

        it('should throttle updates to maintain performance', async () => {
            let updateCount = 0;
            const onUpdate = vi.fn(() => updateCount++);

            renderWithAllProviders(
                <CandlestickChart
                    data={generateMockData('candlestick', 100)}
                    onDataUpdate={onUpdate}
                    updateThrottle={16} // 60fps throttling
                />
            );

            // Simulate rapid updates
            for (let i = 0; i < 100; i++) {
                setTimeout(() => onUpdate(), i);
            }

            await new Promise(resolve => setTimeout(resolve, 2000));

            // Should throttle to approximately 60fps (120 updates in 2 seconds)
            expect(updateCount).toBeLessThan(130);
            expect(updateCount).toBeGreaterThan(110);
        });
    });

    describe('Virtualization Performance', () => {
        it('should virtualize large lists efficiently', async () => {
            const largeDataset = generateMockData('orderLevel', 10000);

            const { renderTime } = performanceTester.measureRenderTime('virtualized-list', () => {
                return renderWithAllProviders(
                    <OrderBook
                        bids={largeDataset}
                        asks={largeDataset}
                        virtualization={true}
                        visibleRows={50}
                    />
                );
            });

            // Virtualized rendering should be fast regardless of dataset size
            expect(renderTime).toRenderWithinTime(50);
        });

        it('should maintain performance during virtual scrolling', async () => {
            const largeDataset = generateMockData('orderLevel', 10000);

            const { container } = renderWithAllProviders(
                <OrderBook
                    bids={largeDataset}
                    asks={largeDataset}
                    virtualization={true}
                    visibleRows={50}
                />
            );

            const scrollContainer = container.querySelector('[data-testid="orderbook-scroll-container"]');

            // Measure scroll performance
            const scrollPerf = await performanceHelpers.testAnimationPerformance(() => {
                // Simulate rapid scrolling
                for (let i = 0; i < 100; i++) {
                    scrollContainer.scrollTop = i * 20;
                }
            }, 1000);

            expect(scrollPerf.fps).toMaintainFrameRate(30);
        });
    });

    describe('Canvas Rendering Performance', () => {
        it('should render canvas-based charts efficiently', async () => {
            const chartData = generateMockData('candlestick', 5000);

            const { renderTime } = performanceTester.measureRenderTime('canvas-chart', () => {
                return renderWithAllProviders(
                    <CandlestickChart
                        data={chartData}
                        renderMode="canvas"
                        width={1200}
                        height={600}
                    />
                );
            });

            // Canvas rendering should be fast even with large datasets
            expect(renderTime).toRenderWithinTime(100);
        });

        it('should handle canvas redraws efficiently', async () => {
            const chartData = generateMockData('candlestick', 1000);

            const { container, rerender } = renderWithAllProviders(
                <CandlestickChart
                    data={chartData}
                    renderMode="canvas"
                    zoom={1}
                />
            );

            const canvas = container.querySelector('canvas');
            expect(canvas).toBeInTheDocument();

            // Test zoom performance (triggers canvas redraw)
            const zoomLevels = [1.5, 2, 2.5, 3, 2, 1];
            const redrawTimes = [];

            for (const zoom of zoomLevels) {
                const startTime = performance.now();
                rerender(
                    <CandlestickChart
                        data={chartData}
                        renderMode="canvas"
                        zoom={zoom}
                    />
                );
                const endTime = performance.now();
                redrawTimes.push(endTime - startTime);
            }

            const averageRedrawTime = redrawTimes.reduce((sum, time) => sum + time, 0) / redrawTimes.length;
            expect(averageRedrawTime).toRenderWithinTime(16); // 60fps
        });
    });

    describe('Performance Budgets', () => {
        it('should meet performance budgets for critical user interactions', async () => {
            const performanceBudgets = {
                buttonClick: 5,      // 5ms for button interactions
                inputChange: 10,     // 10ms for input changes
                chartZoom: 16,       // 16ms for chart zoom (60fps)
                orderBookUpdate: 8,  // 8ms for order book updates
                widgetDrag: 16       // 16ms for widget dragging
            };

            // Test button click performance
            const buttonClickTime = performanceTester.measureRenderTime('button-click', () => {
                const { container } = render(<Button onClick={() => { }}>Click me</Button>);
                const button = container.querySelector('button');
                button.click();
            });

            expect(buttonClickTime.renderTime).toRenderWithinTime(performanceBudgets.buttonClick);

            // Test input change performance
            const inputChangeTime = performanceTester.measureRenderTime('input-change', () => {
                const { container } = render(<Input onChange={() => { }} />);
                const input = container.querySelector('input');
                input.value = 'test';
                input.dispatchEvent(new Event('change'));
            });

            expect(inputChangeTime.renderTime).toRenderWithinTime(performanceBudgets.inputChange);
        });

        it('should degrade gracefully under performance pressure', async () => {
            // Simulate high CPU load
            const heavyComputation = () => {
                let result = 0;
                for (let i = 0; i < 1000000; i++) {
                    result += Math.random();
                }
                return result;
            };

            // Start heavy computation
            const computationInterval = setInterval(heavyComputation, 1);

            try {
                const chartData = generateMockData('candlestick', 1000);
                const { renderTime } = performanceTester.measureRenderTime('under-pressure', () => {
                    return renderWithAllProviders(
                        <CandlestickChart
                            data={chartData}
                            performanceMode="optimized" // Should enable performance optimizations
                        />
                    );
                });

                // Should still render within reasonable time even under pressure
                expect(renderTime).toRenderWithinTime(100);
            } finally {
                clearInterval(computationInterval);
            }
        });
    });

    describe('Performance Monitoring Integration', () => {
        it('should report performance metrics accurately', async () => {
            const performanceReports = [];
            const onPerformanceReport = vi.fn((report) => performanceReports.push(report));

            renderWithAllProviders(
                <div>
                    <CandlestickChart
                        data={generateMockData('candlestick', 1000)}
                        onPerformanceReport={onPerformanceReport}
                    />
                </div>
            );

            await new Promise(resolve => setTimeout(resolve, 1000));

            expect(onPerformanceReport).toHaveBeenCalled();
            expect(performanceReports).toHaveLength(expect.any(Number));

            const lastReport = performanceReports[performanceReports.length - 1];
            expect(lastReport).toMatchObject({
                component: expect.any(String),
                renderTime: expect.any(Number),
                memoryUsage: expect.any(Number),
                frameRate: expect.any(Number)
            });
        });
    });
});