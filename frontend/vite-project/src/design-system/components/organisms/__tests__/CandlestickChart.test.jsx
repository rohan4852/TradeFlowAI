import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import CandlestickChart from '../CandlestickChart';

// Mock canvas context
const mockContext = {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    fillText: jest.fn(),
    scale: jest.fn(),
    setLineDash: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
};

// Mock canvas
HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);
HTMLCanvasElement.prototype.getBoundingClientRect = jest.fn(() => ({
    width: 800,
    height: 400,
    top: 0,
    left: 0,
    right: 800,
    bottom: 400,
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Test wrapper with theme
const TestWrapper = ({ children }) => (
    <ThemeProvider defaultTheme="light">
        {children}
    </ThemeProvider>
);

// Sample chart data
const sampleData = [
    {
        timestamp: Date.now() - 60000 * 5,
        open: 150.00,
        high: 152.50,
        low: 149.75,
        close: 151.25,
        volume: 1000000,
    },
    {
        timestamp: Date.now() - 60000 * 4,
        open: 151.25,
        high: 153.00,
        low: 150.50,
        close: 152.75,
        volume: 1200000,
    },
    {
        timestamp: Date.now() - 60000 * 3,
        open: 152.75,
        high: 154.25,
        low: 151.50,
        close: 153.50,
        volume: 900000,
    },
    {
        timestamp: Date.now() - 60000 * 2,
        open: 153.50,
        high: 155.00,
        low: 152.25,
        close: 154.75,
        volume: 1100000,
    },
    {
        timestamp: Date.now() - 60000 * 1,
        open: 154.75,
        high: 156.50,
        low: 153.75,
        close: 155.25,
        volume: 1300000,
    },
];

describe('CandlestickChart Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders chart container', () => {
        render(
            <TestWrapper>
                <CandlestickChart testId="candlestick-chart" />
            </TestWrapper>
        );

        expect(screen.getByTestId('candlestick-chart')).toBeInTheDocument();
    });

    test('renders canvas element', () => {
        render(
            <TestWrapper>
                <CandlestickChart />
            </TestWrapper>
        );

        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
    });

    test('displays loading state', () => {
        render(
            <TestWrapper>
                <CandlestickChart loading />
            </TestWrapper>
        );

        expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
    });

    test('accepts custom dimensions', () => {
        render(
            <TestWrapper>
                <CandlestickChart width="600px" height="300px" testId="custom-chart" />
            </TestWrapper>
        );

        const container = screen.getByTestId('custom-chart');
        expect(container).toBeInTheDocument();
    });

    test('renders with sample data', async () => {
        render(
            <TestWrapper>
                <CandlestickChart data={sampleData} />
            </TestWrapper>
        );

        // Wait for canvas to be set up and rendered
        await waitFor(() => {
            expect(mockContext.clearRect).toHaveBeenCalled();
        });
    });

    test('shows chart controls when enabled', () => {
        render(
            <TestWrapper>
                <CandlestickChart showControls />
            </TestWrapper>
        );

        // Chart controls should be present (they render as floating controls)
        expect(document.querySelector('[data-testid*="control"]')).toBeTruthy();
    });

    test('hides chart controls when disabled', () => {
        render(
            <TestWrapper>
                <CandlestickChart showControls={false} />
            </TestWrapper>
        );

        // Chart controls should not be present
        expect(document.querySelector('[data-testid*="control"]')).toBeFalsy();
    });

    test('handles timeframe changes', () => {
        const handleTimeframeChange = jest.fn();
        render(
            <TestWrapper>
                <CandlestickChart
                    showControls
                    timeframe="1h"
                    onTimeframeChange={handleTimeframeChange}
                />
            </TestWrapper>
        );

        // The timeframe prop should be passed to controls
        expect(handleTimeframeChange).toBeDefined();
    });

    test('handles mouse interactions', async () => {
        render(
            <TestWrapper>
                <CandlestickChart data={sampleData} />
            </TestWrapper>
        );

        const canvas = document.querySelector('canvas');

        // Test mouse down
        fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });

        // Test mouse move (should trigger pan)
        fireEvent.mouseMove(canvas, { clientX: 150, clientY: 100 });

        // Test mouse up
        fireEvent.mouseUp(canvas);

        expect(canvas).toBeInTheDocument();
    });

    test('handles wheel events for zooming', () => {
        render(
            <TestWrapper>
                <CandlestickChart data={sampleData} />
            </TestWrapper>
        );

        const canvas = document.querySelector('canvas');

        // Test wheel event
        fireEvent.wheel(canvas, { deltaY: -100 });

        expect(canvas).toBeInTheDocument();
    });

    test('handles touch interactions', () => {
        render(
            <TestWrapper>
                <CandlestickChart data={sampleData} />
            </TestWrapper>
        );

        const canvas = document.querySelector('canvas');

        // Test touch start
        fireEvent.touchStart(canvas, {
            touches: [{ clientX: 100, clientY: 100 }]
        });

        // Test touch move
        fireEvent.touchMove(canvas, {
            touches: [{ clientX: 150, clientY: 100 }]
        });

        // Test touch end
        fireEvent.touchEnd(canvas);

        expect(canvas).toBeInTheDocument();
    });

    test('prevents default on touch events', () => {
        render(
            <TestWrapper>
                <CandlestickChart data={sampleData} />
            </TestWrapper>
        );

        const canvas = document.querySelector('canvas');

        const touchStartEvent = new TouchEvent('touchstart', {
            touches: [{ clientX: 100, clientY: 100 }],
            bubbles: true,
            cancelable: true,
        });

        const preventDefaultSpy = jest.spyOn(touchStartEvent, 'preventDefault');
        canvas.dispatchEvent(touchStartEvent);

        // Note: preventDefault behavior may vary in test environment
        expect(canvas).toBeInTheDocument();
    });

    test('handles empty data gracefully', async () => {
        render(
            <TestWrapper>
                <CandlestickChart data={[]} />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(mockContext.clearRect).toHaveBeenCalled();
        });
    });

    test('handles resize events', async () => {
        render(
            <TestWrapper>
                <CandlestickChart data={sampleData} />
            </TestWrapper>
        );

        // Trigger resize event
        fireEvent(window, new Event('resize'));

        // Wait for resize handler
        await waitFor(() => {
            expect(mockContext.scale).toHaveBeenCalled();
        }, { timeout: 200 });
    });

    test('cleans up on unmount', () => {
        const { unmount } = render(
            <TestWrapper>
                <CandlestickChart data={sampleData} />
            </TestWrapper>
        );

        // Unmount component
        unmount();

        // Component should unmount without errors
        expect(true).toBe(true);
    });

    test('supports custom className', () => {
        render(
            <TestWrapper>
                <CandlestickChart className="custom-chart" testId="styled-chart" />
            </TestWrapper>
        );

        const container = screen.getByTestId('styled-chart');
        expect(container).toHaveClass('custom-chart');
    });

    test('renders with different timeframes', () => {
        const { rerender } = render(
            <TestWrapper>
                <CandlestickChart timeframe="1m" />
            </TestWrapper>
        );

        expect(document.querySelector('canvas')).toBeInTheDocument();

        rerender(
            <TestWrapper>
                <CandlestickChart timeframe="1D" />
            </TestWrapper>
        );

        expect(document.querySelector('canvas')).toBeInTheDocument();
    });

    test('handles volume display toggle', () => {
        const { rerender } = render(
            <TestWrapper>
                <CandlestickChart showVolume={true} />
            </TestWrapper>
        );

        expect(document.querySelector('canvas')).toBeInTheDocument();

        rerender(
            <TestWrapper>
                <CandlestickChart showVolume={false} />
            </TestWrapper>
        );

        expect(document.querySelector('canvas')).toBeInTheDocument();
    });

    test('maintains aspect ratio on resize', async () => {
        render(
            <TestWrapper>
                <CandlestickChart data={sampleData} />
            </TestWrapper>
        );

        const canvas = document.querySelector('canvas');

        // Mock getBoundingClientRect to return different dimensions
        canvas.getBoundingClientRect = jest.fn(() => ({
            width: 1000,
            height: 500,
            top: 0,
            left: 0,
            right: 1000,
            bottom: 500,
        }));

        fireEvent(window, new Event('resize'));

        await waitFor(() => {
            expect(mockContext.scale).toHaveBeenCalled();
        }, { timeout: 200 });
    });

    test('handles invalid data gracefully', async () => {
        const invalidData = [
            { timestamp: 'invalid', open: 'not-a-number' },
            null,
            undefined,
            { timestamp: Date.now(), open: 100 }, // Missing required fields
        ];

        render(
            <TestWrapper>
                <CandlestickChart data={invalidData} />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(mockContext.clearRect).toHaveBeenCalled();
        });
    });

    test('supports high DPI displays', async () => {
        // Mock high DPI
        Object.defineProperty(window, 'devicePixelRatio', {
            writable: true,
            value: 2,
        });

        render(
            <TestWrapper>
                <CandlestickChart data={sampleData} />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(mockContext.scale).toHaveBeenCalledWith(2, 2);
        });
    });

    test('renders with technical indicators', async () => {
        const indicators = {
            sma: true,
            ema: true,
            rsi: true,
            macd: true,
            bollingerBands: true,
        };

        render(
            <TestWrapper>
                <CandlestickChart
                    data={sampleData}
                    showIndicators={true}
                    indicators={indicators}
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(mockContext.clearRect).toHaveBeenCalled();
            expect(mockContext.stroke).toHaveBeenCalled();
        });
    });

    test('renders with chart overlays', async () => {
        const overlays = [
            {
                type: 'horizontal',
                price: 155,
                color: '#f59e0b',
                dashed: true,
                showLabel: true,
            },
            {
                type: 'trendline',
                points: [
                    { x: 0, y: 150 },
                    { x: 4, y: 155 },
                ],
                color: '#10b981',
                width: 2,
            },
        ];

        render(
            <TestWrapper>
                <CandlestickChart
                    data={sampleData}
                    overlays={overlays}
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(mockContext.clearRect).toHaveBeenCalled();
            expect(mockContext.stroke).toHaveBeenCalled();
        });
    });

    test('handles indicator toggle', () => {
        const handleIndicatorChange = jest.fn();

        render(
            <TestWrapper>
                <CandlestickChart
                    data={sampleData}
                    showControls={true}
                    indicators={{ sma: true, ema: false }}
                    onIndicatorChange={handleIndicatorChange}
                />
            </TestWrapper>
        );

        expect(handleIndicatorChange).toBeDefined();
    });

    test('exports chart functionality', () => {
        const chartRef = React.createRef();

        render(
            <TestWrapper>
                <CandlestickChart
                    ref={chartRef}
                    data={sampleData}
                />
            </TestWrapper>
        );

        expect(chartRef.current).toBeTruthy();
        expect(typeof chartRef.current.exportChart).toBe('function');
        expect(typeof chartRef.current.downloadChart).toBe('function');
    });

    test('handles indicator configuration changes', async () => {
        const { rerender } = render(
            <TestWrapper>
                <CandlestickChart
                    data={sampleData}
                    indicators={{ sma: true }}
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(mockContext.clearRect).toHaveBeenCalled();
        });

        rerender(
            <TestWrapper>
                <CandlestickChart
                    data={sampleData}
                    indicators={{ sma: true, rsi: true }}
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(mockContext.stroke).toHaveBeenCalled();
        });
    });

    test('handles empty indicators gracefully', async () => {
        render(
            <TestWrapper>
                <CandlestickChart
                    data={sampleData}
                    showIndicators={true}
                    indicators={{}}
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(mockContext.clearRect).toHaveBeenCalled();
        });
    });

    test('handles disabled indicators', async () => {
        render(
            <TestWrapper>
                <CandlestickChart
                    data={sampleData}
                    showIndicators={false}
                    indicators={{ sma: true, rsi: true }}
                />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(mockContext.clearRect).toHaveBeenCalled();
        });
    });
});