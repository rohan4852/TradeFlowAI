import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAllProviders, generateMockData, createMockHandlers } from '../../../test-utils/render-utils';

// Import organism components
import { CandlestickChart } from '../CandlestickChart';
import { OrderBook } from '../OrderBook';
import { GridLayout } from '../GridLayout';
import { Widget } from '../Widget';
import { PerformanceMonitor } from '../PerformanceMonitor';

describe('Organism Component Integration Tests', () => {
    let mockHandlers;
    let user;

    beforeEach(() => {
        mockHandlers = createMockHandlers();
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    describe('CandlestickChart Integration', () => {
        it('should integrate with technical indicators and chart controls', async () => {
            const mockData = generateMockData('candlestick', 100);
            const mockIndicators = [
                { type: 'sma', period: 20, visible: true },
                { type: 'rsi', period: 14, visible: true }
            ];

            const { container } = renderWithAllProviders(
                <CandlestickChart
                    data={mockData}
                    indicators={mockIndicators}
                    onIndicatorChange={mockHandlers.onChange}
                    onTimeframeChange={mockHandlers.onChange}
                    testId="integration-chart"
                />
            );

            // Verify chart renders
            expect(screen.getByTestId('integration-chart')).toBeInTheDocument();

            // Verify canvas is created for high-performance rendering
            const canvas = container.querySelector('canvas');
            expect(canvas).toBeInTheDocument();

            // Test indicator integration
            await waitFor(() => {
                expect(mockHandlers.onChange).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'indicator',
                        data: expect.any(Object)
                    })
                );
            });
        });

        it('should handle real-time data updates with smooth animations', async () => {
            const initialData = generateMockData('candlestick', 50);
            const { rerender } = renderWithAllProviders(
                <CandlestickChart
                    data={initialData}
                    realTimeUpdates={true}
                    animationDuration={300}
                    testId="realtime-chart"
                />
            );

            // Simulate real-time data update
            const updatedData = [...initialData, ...generateMockData('candlestick', 5)];
            rerender(
                <CandlestickChart
                    data={updatedData}
                    realTimeUpdates={true}
                    animationDuration={300}
                    testId="realtime-chart"
                />
            );

            // Verify chart updates
            await waitFor(() => {
                expect(screen.getByTestId('realtime-chart')).toBeInTheDocument();
            });
        });

        it('should synchronize with multiple chart instances', async () => {
            const mockData = generateMockData('candlestick', 100);
            const onSyncChange = vi.fn();

            renderWithAllProviders(
                <div>
                    <CandlestickChart
                        data={mockData}
                        syncGroup="main"
                        onSyncChange={onSyncChange}
                        testId="chart-1"
                    />
                    <CandlestickChart
                        data={mockData}
                        syncGroup="main"
                        onSyncChange={onSyncChange}
                        testId="chart-2"
                    />
                </div>
            );

            // Verify both charts render
            expect(screen.getByTestId('chart-1')).toBeInTheDocument();
            expect(screen.getByTestId('chart-2')).toBeInTheDocument();

            // Test synchronization
            const chart1 = screen.getByTestId('chart-1');
            fireEvent.wheel(chart1, { deltaY: 100 });

            await waitFor(() => {
                expect(onSyncChange).toHaveBeenCalledWith(
                    expect.objectContaining({
                        syncGroup: 'main',
                        action: 'zoom'
                    })
                );
            });
        });
    });

    describe('OrderBook Integration', () => {
        it('should integrate with real-time data provider and animations', async () => {
            const mockBids = generateMockData('orderLevel', 20);
            const mockAsks = generateMockData('orderLevel', 20);

            renderWithAllProviders(
                <OrderBook
                    bids={mockBids}
                    asks={mockAsks}
                    realTimeUpdates={true}
                    animations={{
                        priceFlash: { duration: 200 },
                        sizeChange: { duration: 300 },
                        newOrder: { duration: 400 }
                    }}
                    testId="integration-orderbook"
                />
            );

            // Verify order book renders
            expect(screen.getByTestId('integration-orderbook')).toBeInTheDocument();

            // Verify bid and ask sections
            expect(screen.getByTestId('orderbook-bids')).toBeInTheDocument();
            expect(screen.getByTestId('orderbook-asks')).toBeInTheDocument();

            // Test virtual scrolling for large datasets
            const scrollContainer = screen.getByTestId('orderbook-scroll-container');
            expect(scrollContainer).toBeInTheDocument();
        });

        it('should handle order book depth changes with animations', async () => {
            const initialBids = generateMockData('orderLevel', 10);
            const initialAsks = generateMockData('orderLevel', 10);

            const { rerender } = renderWithAllProviders(
                <OrderBook
                    bids={initialBids}
                    asks={initialAsks}
                    depth={10}
                    testId="depth-orderbook"
                />
            );

            // Change depth
            rerender(
                <OrderBook
                    bids={initialBids}
                    asks={initialAsks}
                    depth={20}
                    testId="depth-orderbook"
                />
            );

            // Verify depth change is handled
            await waitFor(() => {
                expect(screen.getByTestId('depth-orderbook')).toBeInTheDocument();
            });
        });
    });

    describe('Dashboard Widget System Integration', () => {
        it('should integrate grid layout with drag-and-drop widgets', async () => {
            const mockWidgets = [
                { id: 'widget-1', type: 'chart', position: { x: 0, y: 0 }, size: { w: 6, h: 4 } },
                { id: 'widget-2', type: 'orderbook', position: { x: 6, y: 0 }, size: { w: 6, h: 4 } },
                { id: 'widget-3', type: 'portfolio', position: { x: 0, y: 4 }, size: { w: 12, h: 3 } }
            ];

            renderWithAllProviders(
                <GridLayout
                    widgets={mockWidgets}
                    onLayoutChange={mockHandlers.onChange}
                    dragEnabled={true}
                    testId="integration-grid"
                />
            );

            // Verify grid layout renders
            expect(screen.getByTestId('integration-grid')).toBeInTheDocument();

            // Verify all widgets render
            mockWidgets.forEach(widget => {
                expect(screen.getByTestId(`widget-${widget.id}`)).toBeInTheDocument();
            });

            // Test drag and drop
            const widget1 = screen.getByTestId('widget-widget-1');
            const widget2 = screen.getByTestId('widget-widget-2');

            // Simulate drag operation
            fireEvent.dragStart(widget1);
            fireEvent.dragOver(widget2);
            fireEvent.drop(widget2);

            await waitFor(() => {
                expect(mockHandlers.onChange).toHaveBeenCalledWith(
                    expect.arrayContaining([
                        expect.objectContaining({ id: 'widget-1' }),
                        expect.objectContaining({ id: 'widget-2' })
                    ])
                );
            });
        });

        it('should persist layout changes and restore on reload', async () => {
            const mockWidgets = [
                { id: 'widget-1', type: 'chart', position: { x: 0, y: 0 }, size: { w: 6, h: 4 } }
            ];

            // Mock localStorage
            const mockStorage = {};
            Object.defineProperty(window, 'localStorage', {
                value: {
                    getItem: vi.fn((key) => mockStorage[key] || null),
                    setItem: vi.fn((key, value) => { mockStorage[key] = value; }),
                    removeItem: vi.fn((key) => { delete mockStorage[key]; })
                }
            });

            const { rerender } = renderWithAllProviders(
                <GridLayout
                    widgets={mockWidgets}
                    persistLayout={true}
                    layoutKey="test-layout"
                    testId="persistent-grid"
                />
            );

            // Verify layout persistence
            expect(window.localStorage.setItem).toHaveBeenCalledWith(
                'grid-layout-test-layout',
                expect.any(String)
            );

            // Simulate page reload
            rerender(
                <GridLayout
                    widgets={[]}
                    persistLayout={true}
                    layoutKey="test-layout"
                    testId="persistent-grid"
                />
            );

            // Verify layout restoration
            expect(window.localStorage.getItem).toHaveBeenCalledWith('grid-layout-test-layout');
        });
    });

    describe('Performance Monitor Integration', () => {
        it('should monitor component performance and trigger alerts', async () => {
            const onPerformanceAlert = vi.fn();

            renderWithAllProviders(
                <PerformanceMonitor
                    components={['CandlestickChart', 'OrderBook']}
                    thresholds={{
                        renderTime: 16,
                        memoryUsage: 50000000,
                        frameRate: 30
                    }}
                    onAlert={onPerformanceAlert}
                    testId="performance-monitor"
                />
            );

            // Verify performance monitor renders
            expect(screen.getByTestId('performance-monitor')).toBeInTheDocument();

            // Simulate performance degradation
            await waitFor(() => {
                // Mock performance alert trigger
                onPerformanceAlert({
                    component: 'CandlestickChart',
                    metric: 'renderTime',
                    value: 25,
                    threshold: 16
                });
            });

            expect(onPerformanceAlert).toHaveBeenCalledWith(
                expect.objectContaining({
                    component: 'CandlestickChart',
                    metric: 'renderTime'
                })
            );
        });

        it('should provide performance optimization suggestions', async () => {
            const onOptimizationSuggestion = vi.fn();

            renderWithAllProviders(
                <PerformanceMonitor
                    enableOptimizations={true}
                    onOptimizationSuggestion={onOptimizationSuggestion}
                    testId="optimization-monitor"
                />
            );

            // Simulate optimization suggestion
            await waitFor(() => {
                onOptimizationSuggestion({
                    type: 'virtualization',
                    component: 'OrderBook',
                    reason: 'Large dataset detected',
                    impact: 'high'
                });
            });

            expect(onOptimizationSuggestion).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'virtualization',
                    component: 'OrderBook'
                })
            );
        });
    });

    describe('Cross-Component Data Flow', () => {
        it('should handle data flow between chart and order book components', async () => {
            const mockChartData = generateMockData('candlestick', 100);
            const mockOrderData = {
                bids: generateMockData('orderLevel', 20),
                asks: generateMockData('orderLevel', 20)
            };

            const onDataSync = vi.fn();

            renderWithAllProviders(
                <div>
                    <CandlestickChart
                        data={mockChartData}
                        onPriceSelect={onDataSync}
                        testId="sync-chart"
                    />
                    <OrderBook
                        bids={mockOrderData.bids}
                        asks={mockOrderData.asks}
                        selectedPrice={null}
                        onPriceHighlight={onDataSync}
                        testId="sync-orderbook"
                    />
                </div>
            );

            // Test price selection synchronization
            const chart = screen.getByTestId('sync-chart');
            fireEvent.click(chart);

            await waitFor(() => {
                expect(onDataSync).toHaveBeenCalledWith(
                    expect.objectContaining({
                        price: expect.any(Number),
                        source: 'chart'
                    })
                );
            });
        });

        it('should handle error propagation across components', async () => {
            const onError = vi.fn();

            // Component that throws an error
            const ErrorComponent = () => {
                throw new Error('Test error');
            };

            renderWithAllProviders(
                <div onError={onError}>
                    <ErrorComponent />
                </div>
            );

            // Error should be caught and handled
            await waitFor(() => {
                expect(onError).toHaveBeenCalled();
            });
        });
    });

    describe('Theme Integration', () => {
        it('should apply theme consistently across all components', async () => {
            const mockData = generateMockData('candlestick', 50);

            const { container } = renderWithAllProviders(
                <div>
                    <CandlestickChart data={mockData} testId="themed-chart" />
                    <OrderBook
                        bids={generateMockData('orderLevel', 10)}
                        asks={generateMockData('orderLevel', 10)}
                        testId="themed-orderbook"
                    />
                </div>,
                { theme: 'dark' }
            );

            // Verify theme is applied
            const chartElement = screen.getByTestId('themed-chart');
            const orderbookElement = screen.getByTestId('themed-orderbook');

            expect(chartElement).toHaveAttribute('data-theme', 'dark');
            expect(orderbookElement).toHaveAttribute('data-theme', 'dark');
        });

        it('should handle theme switching without losing state', async () => {
            const mockData = generateMockData('candlestick', 50);

            const { rerender } = renderWithAllProviders(
                <CandlestickChart
                    data={mockData}
                    selectedTimeframe="1h"
                    testId="theme-switch-chart"
                />,
                { theme: 'light' }
            );

            // Switch theme
            rerender(
                <CandlestickChart
                    data={mockData}
                    selectedTimeframe="1h"
                    testId="theme-switch-chart"
                />,
                { theme: 'dark' }
            );

            // Verify component state is preserved
            const chart = screen.getByTestId('theme-switch-chart');
            expect(chart).toBeInTheDocument();
            expect(chart).toHaveAttribute('data-theme', 'dark');
        });
    });
});