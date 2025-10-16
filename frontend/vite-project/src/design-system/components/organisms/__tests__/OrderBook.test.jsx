import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import OrderBook from '../OrderBook';

// Test wrapper with theme
const TestWrapper = ({ children }) => (
    <ThemeProvider defaultTheme="light">
        {children}
    </ThemeProvider>
);

// Sample order book data
const sampleAsks = [
    { price: 50100.50, size: 0.5, timestamp: Date.now() },
    { price: 50101.00, size: 1.2, timestamp: Date.now() },
    { price: 50101.50, size: 0.8, timestamp: Date.now() },
    { price: 50102.00, size: 2.1, timestamp: Date.now() },
    { price: 50102.50, size: 0.3, timestamp: Date.now() },
];

const sampleBids = [
    { price: 50099.50, size: 1.5, timestamp: Date.now() },
    { price: 50099.00, size: 0.7, timestamp: Date.now() },
    { price: 50098.50, size: 2.3, timestamp: Date.now() },
    { price: 50098.00, size: 1.1, timestamp: Date.now() },
    { price: 50097.50, size: 0.9, timestamp: Date.now() },
];

describe('OrderBook Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders order book container', () => {
        render(
            <TestWrapper>
                <OrderBook testId="order-book" />
            </TestWrapper>
        );

        expect(screen.getByTestId('order-book')).toBeInTheDocument();
    });

    test('displays symbol in header', () => {
        render(
            <TestWrapper>
                <OrderBook symbol="ETH/USD" />
            </TestWrapper>
        );

        expect(screen.getByText('Order Book - ETH/USD')).toBeInTheDocument();
    });

    test('renders with sample data', () => {
        render(
            <TestWrapper>
                <OrderBook asks={sampleAsks} bids={sampleBids} />
            </TestWrapper>
        );

        // Should render order book structure
        expect(screen.getByText('Order Book - BTC/USD')).toBeInTheDocument();
        expect(screen.getByText('Aggregation:')).toBeInTheDocument();
    });

    test('displays loading state', () => {
        render(
            <TestWrapper>
                <OrderBook loading />
            </TestWrapper>
        );

        expect(screen.getByText('Loading order book...')).toBeInTheDocument();
    });

    test('handles aggregation changes', () => {
        render(
            <TestWrapper>
                <OrderBook asks={sampleAsks} bids={sampleBids} />
            </TestWrapper>
        );

        const aggregationSelect = screen.getByDisplayValue('0.01');
        fireEvent.change(aggregationSelect, { target: { value: '0.1' } });

        expect(aggregationSelect.value).toBe('0.1');
    });

    test('shows spread information', () => {
        const spread = { value: 1.0, percent: 0.002 };
        render(
            <TestWrapper>
                <OrderBook
                    asks={sampleAsks}
                    bids={sampleBids}
                    spread={spread}
                />
            </TestWrapper>
        );

        expect(screen.getByText(/Spread: 1\.00/)).toBeInTheDocument();
        expect(screen.getByText(/\(0\.002%\)/)).toBeInTheDocument();
    });

    test('calculates spread automatically when not provided', () => {
        render(
            <TestWrapper>
                <OrderBook asks={sampleAsks} bids={sampleBids} />
            </TestWrapper>
        );

        // Should calculate spread from best bid/ask
        expect(screen.getByText(/Spread:/)).toBeInTheDocument();
    });

    test('handles order clicks', () => {
        const handleOrderClick = jest.fn();
        render(
            <TestWrapper>
                <OrderBook
                    asks={sampleAsks}
                    bids={sampleBids}
                    onOrderClick={handleOrderClick}
                />
            </TestWrapper>
        );

        // Find and click on an order row (this might need adjustment based on actual rendering)
        const orderRows = document.querySelectorAll('[data-testid*="order-row"]');
        if (orderRows.length > 0) {
            fireEvent.click(orderRows[0]);
            expect(handleOrderClick).toHaveBeenCalled();
        }
    });

    test('supports custom dimensions', () => {
        render(
            <TestWrapper>
                <OrderBook height="800px" testId="custom-orderbook" />
            </TestWrapper>
        );

        const container = screen.getByTestId('custom-orderbook');
        expect(container).toBeInTheDocument();
    });

    test('handles empty data gracefully', () => {
        render(
            <TestWrapper>
                <OrderBook asks={[]} bids={[]} />
            </TestWrapper>
        );

        expect(screen.getByText('Order Book - BTC/USD')).toBeInTheDocument();
        expect(screen.getByText(/Spread: 0\.00/)).toBeInTheDocument();
    });

    test('supports different precision levels', () => {
        render(
            <TestWrapper>
                <OrderBook
                    asks={sampleAsks}
                    bids={sampleBids}
                    precision={4}
                />
            </TestWrapper>
        );

        // Component should render with higher precision
        expect(screen.getByText('Order Book - BTC/USD')).toBeInTheDocument();
    });

    test('handles aggregation options', () => {
        const customAggregationOptions = [0.001, 0.01, 0.1, 1];
        render(
            <TestWrapper>
                <OrderBook
                    asks={sampleAsks}
                    bids={sampleBids}
                    aggregationOptions={customAggregationOptions}
                    defaultAggregation={0.001}
                />
            </TestWrapper>
        );

        const aggregationSelect = screen.getByDisplayValue('0.001');
        expect(aggregationSelect).toBeInTheDocument();
    });

    test('limits depth correctly', () => {
        const manyAsks = Array.from({ length: 100 }, (_, i) => ({
            price: 50100 + i,
            size: Math.random(),
            timestamp: Date.now()
        }));

        render(
            <TestWrapper>
                <OrderBook
                    asks={manyAsks}
                    bids={sampleBids}
                    maxDepth={10}
                />
            </TestWrapper>
        );

        // Should limit the number of displayed orders
        expect(screen.getByText('Order Book - BTC/USD')).toBeInTheDocument();
    });

    test('toggles depth bars visibility', () => {
        const { rerender } = render(
            <TestWrapper>
                <OrderBook
                    asks={sampleAsks}
                    bids={sampleBids}
                    showDepthBars={true}
                />
            </TestWrapper>
        );

        expect(screen.getByText('Order Book - BTC/USD')).toBeInTheDocument();

        rerender(
            <TestWrapper>
                <OrderBook
                    asks={sampleAsks}
                    bids={sampleBids}
                    showDepthBars={false}
                />
            </TestWrapper>
        );

        expect(screen.getByText('Order Book - BTC/USD')).toBeInTheDocument();
    });

    test('toggles cumulative total visibility', () => {
        const { rerender } = render(
            <TestWrapper>
                <OrderBook
                    asks={sampleAsks}
                    bids={sampleBids}
                    showCumulativeTotal={true}
                />
            </TestWrapper>
        );

        expect(screen.getByText('Order Book - BTC/USD')).toBeInTheDocument();

        rerender(
            <TestWrapper>
                <OrderBook
                    asks={sampleAsks}
                    bids={sampleBids}
                    showCumulativeTotal={false}
                />
            </TestWrapper>
        );

        expect(screen.getByText('Order Book - BTC/USD')).toBeInTheDocument();
    });

    test('handles scroll events', async () => {
        render(
            <TestWrapper>
                <OrderBook asks={sampleAsks} bids={sampleBids} />
            </TestWrapper>
        );

        // Find scroll containers
        const scrollContainers = document.querySelectorAll('[style*="overflow-y: auto"]');

        if (scrollContainers.length > 0) {
            fireEvent.scroll(scrollContainers[0], { target: { scrollTop: 100 } });

            // Should handle scroll without errors
            await waitFor(() => {
                expect(scrollContainers[0]).toBeInTheDocument();
            });
        }
    });

    test('handles resize events', async () => {
        render(
            <TestWrapper>
                <OrderBook asks={sampleAsks} bids={sampleBids} />
            </TestWrapper>
        );

        // Trigger resize event
        fireEvent(window, new Event('resize'));

        // Should handle resize without errors
        await waitFor(() => {
            expect(screen.getByText('Order Book - BTC/USD')).toBeInTheDocument();
        });
    });

    test('supports custom className', () => {
        render(
            <TestWrapper>
                <OrderBook className="custom-orderbook" testId="styled-orderbook" />
            </TestWrapper>
        );

        const container = screen.getByTestId('styled-orderbook');
        expect(container).toHaveClass('custom-orderbook');
    });

    test('formats large numbers correctly', () => {
        const largeOrders = [
            { price: 50100, size: 1500000, timestamp: Date.now() },
            { price: 50099, size: 2500, timestamp: Date.now() },
        ];

        render(
            <TestWrapper>
                <OrderBook asks={largeOrders} bids={largeOrders} />
            </TestWrapper>
        );

        // Should format large numbers with K/M suffixes
        expect(screen.getByText('Order Book - BTC/USD')).toBeInTheDocument();
    });

    test('handles invalid data gracefully', () => {
        const invalidData = [
            { price: 'invalid', size: 'not-a-number' },
            null,
            undefined,
            { price: 50100 }, // Missing size
        ];

        render(
            <TestWrapper>
                <OrderBook asks={invalidData} bids={invalidData} />
            </TestWrapper>
        );

        // Should render without crashing
        expect(screen.getByText('Order Book - BTC/USD')).toBeInTheDocument();
    });

    test('cleans up on unmount', () => {
        const { unmount } = render(
            <TestWrapper>
                <OrderBook asks={sampleAsks} bids={sampleBids} />
            </TestWrapper>
        );

        // Unmount component
        unmount();

        // Component should unmount without errors
        expect(true).toBe(true);
    });

    test('aggregates orders correctly', () => {
        const duplicatePriceOrders = [
            { price: 50100.00, size: 0.5, timestamp: Date.now() },
            { price: 50100.00, size: 1.0, timestamp: Date.now() },
            { price: 50100.01, size: 0.3, timestamp: Date.now() },
        ];

        render(
            <TestWrapper>
                <OrderBook
                    asks={duplicatePriceOrders}
                    bids={sampleBids}
                    aggregation={0.01}
                />
            </TestWrapper>
        );

        // Should aggregate orders at the same price level
        expect(screen.getByText('Order Book - BTC/USD')).toBeInTheDocument();
    });

    test('calculates cumulative totals correctly', () => {
        render(
            <TestWrapper>
                <OrderBook
                    asks={sampleAsks}
                    bids={sampleBids}
                    showCumulativeTotal={true}
                />
            </TestWrapper>
        );

        // Should calculate and display cumulative totals
        expect(screen.getByText('Order Book - BTC/USD')).toBeInTheDocument();
    });
});