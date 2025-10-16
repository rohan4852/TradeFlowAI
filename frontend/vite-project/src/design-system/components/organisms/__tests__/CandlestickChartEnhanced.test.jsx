import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../ThemeProvider';
import { ChartSyncProvider, useChartSync, MultiTimeframeChart } from '../ChartSynchronization';
import {
    ChartPerformanceMonitor,
    ChartDataOptimizer,
    ChartRenderOptimizer,
    ChartAnimationOptimizer
} from '../../../utils/chartPerformance';

// Mock canvas context
const mockCanvasContext = {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    setLineDash: jest.fn(),
    drawImage: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn(() => ({ width: 50 })),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    toDataURL: jest.fn(() => 'data:image/png;base64,mock')
};

// Mock canvas element
const mockCanvas = {
    getContext: jest.fn(() => mockCanvasContext),
    width: 800,
    height: 400,
    style: {},
    getBoundingClientRect: jest.fn(() => ({
        left: 0,
        top: 0,
        width: 800,
        height: 400
    })),
    toDataURL: jest.fn(() => 'data:image/png;base64,mock')
};

// Mock HTML5 Canvas
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCanvasContext);
global.HTMLCanvasElement.prototype.getBoundingClientRect = jest.fn(() => ({
    left: 0,
    top: 0,
    width: 800,
    height: 400
}));

// Mock performance API
global.performance.memory = {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
};

// Test wrapper with providers
const TestWrapper = ({ children }) => (
    <ThemeProvider defaultTheme="light">
        <ChartSyncProvider>
            {children}
        </ChartSyncProvider>
    </ThemeProvider>
);

// Sample chart data
const sampleData = [
    { timestamp: '2024-01-01T10:00:00Z', open: 100, high: 105, low: 98, close: 103, volume: 1000 },
    { timestamp: '2024-01-01T10:01:00Z', open: 103, high: 107, low: 101, close: 105, volume: 1200 },
    { timestamp: '2024-01-01T10:02:00Z', open: 105, high: 108, low: 104, close: 106, volume: 800 },
    { timestamp: '2024-01-01T10:03:00Z', open: 106, high: 109, low: 105, close: 108, volume: 1500 },
    { timestamp: '2024-01-01T10:04:00Z', open: 108, high: 110, low: 106, close: 107, volume: 900 }
];

describe('Enhanced Candlestick Chart Tests', () => {
    describe('Chart Synchronization', () => {
        test('useChartSync hook registers and unregisters charts correctly', () => {
            const TestComponent = ({ chartId, syncGroup }) => {
                const { chartRef, syncCrosshair, syncZoom } = useChartSync(chartId, syncGroup);

                return (
                    <div>
                        <div ref={chartRef} data-testid={`chart-${chartId}`}>
                            Chart {chartId}
                        </div>
                        <button onClick={() => syncCrosshair({ x: 100, y: 200 })}>
                            Sync Crosshair
                        </button>
                        <button onClick={() => syncZoom(1.5, { x: 400, y: 200 })}>
                            Sync Zoom
                        </button>
                    </div>
                );
            };

            render(
                <TestWrapper>
                    <TestComponent chartId="chart1" syncGroup="test-group" />
                    <TestComponent chartId="chart2" syncGroup="test-group" />
                </TestWrapper>
            );

            expect(screen.getByTestId('chart-chart1')).toBeInTheDocument();
            expect(screen.getByTestId('chart-chart2')).toBeInTheDocument();
        });

        test('charts in same sync group synchronize crosshair movements', async () => {
            const user = userEvent.setup();
            const mockSyncCrosshair1 = jest.fn();
            const mockSyncCrosshair2 = jest.fn();

            const TestComponent = ({ chartId, onSyncCrosshair }) => {
                const { chartRef, syncCrosshair } = useChartSync(chartId, 'test-group');

                React.useEffect(() => {
                    if (chartRef.current) {
                        chartRef.current.syncCrosshair = onSyncCrosshair;
                    }
                }, [chartRef, onSyncCrosshair]);

                return (
                    <div>
                        <div ref={chartRef} data-testid={`chart-${chartId}`}>
                            Chart {chartId}
                        </div>
                        <button
                            onClick={() => syncCrosshair({ x: 100, y: 200 })}
                            data-testid={`sync-button-${chartId}`}
                        >
                            Sync Crosshair
                        </button>
                    </div>
                );
            };

            render(
                <TestWrapper>
                    <TestComponent chartId="chart1" onSyncCrosshair={mockSyncCrosshair1} />
                    <TestComponent chartId="chart2" onSyncCrosshair={mockSyncCrosshair2} />
                </TestWrapper>
            );

            // Trigger crosshair sync from chart1
            await user.click(screen.getByTestId('sync-button-chart1'));

            // Wait for synchronization
            await waitFor(() => {
                expect(mockSyncCrosshair2).toHaveBeenCalledWith({ x: 100, y: 200 });
            });

            // Chart1 should not sync to itself
            expect(mockSyncCrosshair1).not.toHaveBeenCalled();
        });

        test('MultiTimeframeChart renders multiple synchronized charts', () => {
            render(
                <TestWrapper>
                    <MultiTimeframeChart
                        symbol="BTCUSD"
                        timeframes={['1m', '5m', '15m']}
                        data={sampleData}
                    />
                </TestWrapper>
            );

            expect(screen.getByText('Multi-Timeframe Analysis - BTCUSD')).toBeInTheDocument();
            expect(screen.getByText('Grid Layout')).toBeInTheDocument();

            // Check timeframe toggle buttons
            expect(screen.getByText('1m')).toBeInTheDocument();
            expect(screen.getByText('5m')).toBeInTheDocument();
            expect(screen.getByText('15m')).toBeInTheDocument();
        });

        test('MultiTimeframeChart switches between grid and tabs layout', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <MultiTimeframeChart
                        symbol="BTCUSD"
                        timeframes={['1m', '5m']}
                        data={sampleData}
                    />
                </TestWrapper>
            );

            // Switch to tabs layout
            const layoutSelect = screen.getByDisplayValue('Grid Layout');
            await user.selectOptions(layoutSelect, 'tabs');

            expect(screen.getByDisplayValue('Tabs Layout')).toBeInTheDocument();
        });
    });

    describe('Performance Monitoring', () => {
        test('ChartPerformanceMonitor tracks render times correctly', () => {
            const monitor = new ChartPerformanceMonitor();

            monitor.recordRenderTime(16.7); // 60 FPS
            monitor.recordRenderTime(33.3); // 30 FPS
            monitor.recordRenderTime(8.3);  // 120 FPS

            const avgRenderTime = monitor.getAverageRenderTime();
            expect(avgRenderTime).toBeCloseTo(19.43, 1);
        });

        test('ChartPerformanceMonitor calculates performance score', () => {
            const monitor = new ChartPerformanceMonitor();

            // Good performance metrics
            monitor.recordRenderTime(10); // Fast render
            monitor.metrics.frameRates.push({ timestamp: Date.now(), fps: 60 });

            const report = monitor.getPerformanceReport();
            expect(report.performanceScore).toBeGreaterThan(90);
        });

        test('ChartPerformanceMonitor monitors frame rate', (done) => {
            const monitor = new ChartPerformanceMonitor();
            monitor.startMonitoring();

            setTimeout(() => {
                monitor.stopMonitoring();
                expect(monitor.metrics.frameRates.length).toBeGreaterThan(0);
                done();
            }, 100);
        });

        test('ChartPerformanceMonitor records memory usage', () => {
            const monitor = new ChartPerformanceMonitor();
            monitor.recordMemoryUsage();

            const memoryUsage = monitor.getCurrentMemoryUsage();
            expect(memoryUsage).toBeDefined();
            expect(memoryUsage.used).toBe(1000000);
            expect(memoryUsage.total).toBe(2000000);
        });
    });

    describe('Data Optimization', () => {
        test('ChartDataOptimizer caches optimized data', () => {
            const optimizer = new ChartDataOptimizer();
            const visibleRange = { start: 0, end: 5 };
            const zoomLevel = 1;
            const candleWidth = 8;

            const result1 = optimizer.optimizeDataForRendering(sampleData, visibleRange, zoomLevel, candleWidth);
            const result2 = optimizer.optimizeDataForRendering(sampleData, visibleRange, zoomLevel, candleWidth);

            // Should return cached result
            expect(result1).toBe(result2);
            expect(result1).toHaveLength(5);
        });

        test('ChartDataOptimizer reduces data points for small candle widths', () => {
            const optimizer = new ChartDataOptimizer();
            const visibleRange = { start: 0, end: 5 };
            const zoomLevel = 0.1;
            const candleWidth = 2; // Small width triggers data reduction

            const result = optimizer.optimizeDataForRendering(sampleData, visibleRange, zoomLevel, candleWidth);

            // Should reduce data points
            expect(result.length).toBeLessThan(sampleData.length);
        });

        test('ChartDataOptimizer reduces data points correctly', () => {
            const optimizer = new ChartDataOptimizer();
            const testData = [
                { timestamp: '1', open: 100, high: 105, low: 98, close: 103, volume: 1000 },
                { timestamp: '2', open: 103, high: 107, low: 101, close: 105, volume: 1200 },
                { timestamp: '3', open: 105, high: 108, low: 104, close: 106, volume: 800 },
                { timestamp: '4', open: 106, high: 109, low: 105, close: 108, volume: 1500 }
            ];

            const reduced = optimizer.reduceDataPoints(testData, 2);

            expect(reduced).toHaveLength(2);
            expect(reduced[0].open).toBe(100); // First candle's open
            expect(reduced[0].close).toBe(105); // Second candle's close
            expect(reduced[0].high).toBe(107); // Max high of first two
            expect(reduced[0].low).toBe(98); // Min low of first two
            expect(reduced[0].volume).toBe(2200); // Sum of volumes
        });

        test('ChartDataOptimizer manages cache size', () => {
            const optimizer = new ChartDataOptimizer();
            optimizer.maxCacheSize = 2;

            // Fill cache beyond limit
            for (let i = 0; i < 5; i++) {
                const visibleRange = { start: i, end: i + 1 };
                optimizer.optimizeDataForRendering(sampleData, visibleRange, 1, 8);
            }

            expect(optimizer.cache.size).toBe(2);
        });

        test('ChartDataOptimizer clears cache', () => {
            const optimizer = new ChartDataOptimizer();
            const visibleRange = { start: 0, end: 5 };

            optimizer.optimizeDataForRendering(sampleData, visibleRange, 1, 8);
            expect(optimizer.cache.size).toBe(1);

            optimizer.clearCache();
            expect(optimizer.cache.size).toBe(0);
        });
    });

    describe('Render Optimization', () => {
        test('ChartRenderOptimizer creates and manages layers', () => {
            const optimizer = new ChartRenderOptimizer(mockCanvas, mockCanvasContext);

            const layer = optimizer.createLayer('test-layer', 800, 400);
            expect(layer.canvas).toBeDefined();
            expect(layer.context).toBeDefined();

            optimizer.markLayerDirty('test-layer');
            expect(optimizer.dirtyLayers.has('test-layer')).toBe(true);
        });

        test('ChartRenderOptimizer renders dirty layers', () => {
            const optimizer = new ChartRenderOptimizer(mockCanvas, mockCanvasContext);
            const mockRenderFunction = jest.fn();

            optimizer.createLayer('test-layer', 800, 400);
            optimizer.markLayerDirty('test-layer');

            const layerCanvas = optimizer.renderLayer('test-layer', mockRenderFunction);

            expect(mockRenderFunction).toHaveBeenCalled();
            expect(layerCanvas).toBeDefined();
            expect(optimizer.dirtyLayers.has('test-layer')).toBe(false);
        });

        test('ChartRenderOptimizer skips clean layers', () => {
            const optimizer = new ChartRenderOptimizer(mockCanvas, mockCanvasContext);
            const mockRenderFunction = jest.fn();

            optimizer.createLayer('test-layer', 800, 400);
            // Don't mark as dirty

            optimizer.renderLayer('test-layer', mockRenderFunction);
            optimizer.renderLayer('test-layer', mockRenderFunction); // Second call

            expect(mockRenderFunction).toHaveBeenCalledTimes(1); // Only called once
        });

        test('ChartRenderOptimizer composites layers correctly', () => {
            const optimizer = new ChartRenderOptimizer(mockCanvas, mockCanvasContext);

            optimizer.createLayer('background', 800, 400);
            optimizer.createLayer('foreground', 800, 400);

            optimizer.compositeLayers(['background', 'foreground']);

            expect(mockCanvasContext.clearRect).toHaveBeenCalled();
            expect(mockCanvasContext.drawImage).toHaveBeenCalledTimes(2);
        });

        test('ChartRenderOptimizer optimizes paths using Douglas-Peucker', () => {
            const optimizer = new ChartRenderOptimizer(mockCanvas, mockCanvasContext);

            const points = [
                { x: 0, y: 0 },
                { x: 1, y: 0.1 },
                { x: 2, y: 0 },
                { x: 3, y: 0.1 },
                { x: 4, y: 0 }
            ];

            const optimized = optimizer.optimizePath(points, 0.2);

            // Should reduce points while maintaining shape
            expect(optimized.length).toBeLessThanOrEqual(points.length);
            expect(optimized[0]).toEqual(points[0]); // First point preserved
            expect(optimized[optimized.length - 1]).toEqual(points[points.length - 1]); // Last point preserved
        });

        test('ChartRenderOptimizer batches operations correctly', () => {
            const optimizer = new ChartRenderOptimizer(mockCanvas, mockCanvasContext);
            const operations = [
                (ctx) => ctx.fillRect(0, 0, 10, 10),
                (ctx) => ctx.strokeRect(10, 10, 20, 20)
            ];

            optimizer.batchOperations(operations);

            expect(mockCanvasContext.save).toHaveBeenCalled();
            expect(mockCanvasContext.fillRect).toHaveBeenCalledWith(0, 0, 10, 10);
            expect(mockCanvasContext.strokeRect).toHaveBeenCalledWith(10, 10, 20, 20);
            expect(mockCanvasContext.restore).toHaveBeenCalled();
        });
    });

    describe('Animation Optimization', () => {
        test('ChartAnimationOptimizer creates and manages animations', (done) => {
            const optimizer = new ChartAnimationOptimizer();
            const mockUpdate = jest.fn();
            const mockComplete = jest.fn();

            const animation = optimizer.createAnimation('test-anim', {
                duration: 100,
                from: { x: 0, y: 0 },
                to: { x: 100, y: 100 },
                onUpdate: mockUpdate,
                onComplete: mockComplete
            });

            expect(animation.id).toBe('test-anim');
            expect(optimizer.activeAnimations.has('test-anim')).toBe(true);

            setTimeout(() => {
                expect(mockUpdate).toHaveBeenCalled();
                expect(mockComplete).toHaveBeenCalled();
                expect(optimizer.activeAnimations.has('test-anim')).toBe(false);
                done();
            }, 150);
        });

        test('ChartAnimationOptimizer stops animations correctly', () => {
            const optimizer = new ChartAnimationOptimizer();

            optimizer.createAnimation('test-anim', {
                duration: 1000,
                from: { x: 0 },
                to: { x: 100 }
            });

            expect(optimizer.activeAnimations.has('test-anim')).toBe(true);

            optimizer.stopAnimation('test-anim');
            expect(optimizer.activeAnimations.has('test-anim')).toBe(false);
        });

        test('ChartAnimationOptimizer stops all animations', () => {
            const optimizer = new ChartAnimationOptimizer();

            optimizer.createAnimation('anim1', { duration: 1000, from: { x: 0 }, to: { x: 100 } });
            optimizer.createAnimation('anim2', { duration: 1000, from: { y: 0 }, to: { y: 100 } });

            expect(optimizer.activeAnimations.size).toBe(2);

            optimizer.stopAllAnimations();
            expect(optimizer.activeAnimations.size).toBe(0);
            expect(optimizer.isAnimating).toBe(false);
        });

        test('ChartAnimationOptimizer respects reduced motion preference', () => {
            const optimizer = new ChartAnimationOptimizer();
            const mockUpdate = jest.fn();
            const mockComplete = jest.fn();

            // Mock reduced motion preference
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: jest.fn().mockImplementation(query => ({
                    matches: query === '(prefers-reduced-motion: reduce)',
                    media: query,
                    onchange: null,
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn(),
                })),
            });

            const animation = optimizer.createReducedMotionAnimation('test-anim', {
                duration: 100,
                from: { x: 0 },
                to: { x: 100 },
                onUpdate: mockUpdate,
                onComplete: mockComplete
            });

            expect(animation).toBeNull(); // Animation should be skipped
            expect(mockUpdate).toHaveBeenCalledWith({ x: 100 }, 1); // Called with end state
            expect(mockComplete).toHaveBeenCalled();
        });

        test('ChartAnimationOptimizer easing functions work correctly', () => {
            const optimizer = new ChartAnimationOptimizer();

            expect(optimizer.easeInOutCubic(0)).toBe(0);
            expect(optimizer.easeInOutCubic(1)).toBe(1);
            expect(optimizer.easeInOutCubic(0.5)).toBeCloseTo(0.5, 1);

            expect(optimizer.easeOutQuart(0)).toBe(0);
            expect(optimizer.easeOutQuart(1)).toBe(1);
        });
    });

    describe('Integration Tests', () => {
        test('performance monitoring integrates with chart rendering', () => {
            const monitor = new ChartPerformanceMonitor();
            const optimizer = new ChartDataOptimizer();

            // Simulate chart rendering cycle
            const startTime = performance.now();

            // Optimize data
            const optimizedData = optimizer.optimizeDataForRendering(
                sampleData,
                { start: 0, end: 5 },
                1,
                8
            );

            // Record performance
            const endTime = performance.now();
            monitor.recordRenderTime(endTime - startTime);
            monitor.recordMemoryUsage();

            const report = monitor.getPerformanceReport();
            expect(report.totalRenders).toBe(1);
            expect(report.averageRenderTime).toBeGreaterThan(0);
            expect(optimizedData).toHaveLength(5);
        });

        test('render optimization works with animation optimization', (done) => {
            const renderOptimizer = new ChartRenderOptimizer(mockCanvas, mockCanvasContext);
            const animationOptimizer = new ChartAnimationOptimizer();

            renderOptimizer.createLayer('animated-layer', 800, 400);

            animationOptimizer.createAnimation('layer-fade', {
                duration: 100,
                from: { opacity: 0 },
                to: { opacity: 1 },
                onUpdate: (values) => {
                    renderOptimizer.markLayerDirty('animated-layer');
                },
                onComplete: () => {
                    expect(renderOptimizer.dirtyLayers.has('animated-layer')).toBe(true);
                    done();
                }
            });
        });
    });
});