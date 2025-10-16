import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../../../ThemeProvider';
import { RealTimeDataProvider } from '../../../providers/RealTimeDataProvider';
import WatchlistWidget from '../WatchlistWidget';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
        td: ({ children, ...props }) => <td {...props}>{children}</td>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock providers
const mockRealTimeData = {
    isConnected: true,
    getPrice: jest.fn((symbol) => ({
        price: symbol === 'AAPL' ? 155.00 : 2750.00,
        change: symbol === 'AAPL' ? 5.00 : -50.00,
        changePercent: symbol === 'AAPL' ? 3.33 : -1.79,
        volume: symbol === 'AAPL' ? 1000000 : 500000,
        high: symbol === 'AAPL' ? 157.00 : 2800.00,
        low: symbol === 'AAPL' ? 152.00 : 2700.00,
    })),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
};

const MockProviders = ({ children }) => (
    <ThemeProvider>
        <RealTimeDataProvider value={mockRealTimeData}>
            {children}
        </RealTimeDataProvider>
    </ThemeProvider>
);

describe('WatchlistWidget', () => {
    const mockSymbols = ['AAPL', 'GOOGL'];
    const mockAlerts = [
        {
            symbol: 'AAPL',
            type: 'price',
            price: 160.00
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders watchlist widget with symbols', () => {
        render(
            <MockProviders>
                <WatchlistWidget symbols={mockSymbols} />
            </MockProviders>
        );

        expect(screen.getByText('Watchlist')).toBeInTheDocument();
        expect(screen.getByText('AAPL')).toBeInTheDocument();
        expect(screen.getByText('GOOGL')).toBeInTheDocument();
    });

    it('displays real-time price data', () => {
        render(
            <MockProviders>
                <WatchlistWidget symbols={mockSymbols} />
            </MockProviders>
        );

        expect(screen.getByText('$155.00')).toBeInTheDocument(); // AAPL price
        expect(screen.getByText('$2,750.00')).toBeInTheDocument(); // GOOGL price
        expect(screen.getByText('+3.33%')).toBeInTheDocument(); // AAPL change
        expect(screen.getByText('-1.79%')).toBeInTheDocument(); // GOOGL change
    });

    it('displays volume with proper formatting', () => {
        render(
            <MockProviders>
                <WatchlistWidget symbols={mockSymbols} />
            </MockProviders>
        );

        expect(screen.getByText('1.0M')).toBeInTheDocument(); // AAPL volume
        expect(screen.getByText('500.0K')).toBeInTheDocument(); // GOOGL volume
    });

    it('handles search functionality', () => {
        render(
            <MockProviders>
                <WatchlistWidget symbols={mockSymbols} />
            </MockProviders>
        );

        const searchInput = screen.getByPlaceholderText('Search symbols...');
        fireEvent.change(searchInput, { target: { value: 'AAPL' } });

        expect(screen.getByText('AAPL')).toBeInTheDocument();
        expect(screen.queryByText('GOOGL')).not.toBeInTheDocument();
    });

    it('handles sorting by different columns', () => {
        render(
            <MockProviders>
                <WatchlistWidget symbols={mockSymbols} />
            </MockProviders>
        );

        // Click sort by price
        fireEvent.click(screen.getByText(/Price/));

        // Click sort by change
        fireEvent.click(screen.getByText(/Change/));

        // Click sort by volume
        fireEvent.click(screen.getByText(/Volume/));

        // Should not throw errors
        expect(screen.getByText('AAPL')).toBeInTheDocument();
    });

    it('shows add symbol button when onAddSymbol is provided', () => {
        const mockOnAddSymbol = jest.fn();

        render(
            <MockProviders>
                <WatchlistWidget
                    symbols={mockSymbols}
                    onAddSymbol={mockOnAddSymbol}
                />
            </MockProviders>
        );

        const addButton = screen.getByText('Add');
        expect(addButton).toBeInTheDocument();

        fireEvent.click(addButton);
        expect(screen.getByText('Add Symbol')).toBeInTheDocument();
    });

    it('handles add symbol modal', async () => {
        const mockOnAddSymbol = jest.fn();

        render(
            <MockProviders>
                <WatchlistWidget
                    symbols={mockSymbols}
                    onAddSymbol={mockOnAddSymbol}
                />
            </MockProviders>
        );

        // Open modal
        fireEvent.click(screen.getByText('Add'));

        // Enter symbol
        const symbolInput = screen.getByPlaceholderText('Enter symbol (e.g., AAPL)');
        fireEvent.change(symbolInput, { target: { value: 'TSLA' } });

        // Submit
        fireEvent.click(screen.getByText('Add Symbol'));

        expect(mockOnAddSymbol).toHaveBeenCalledWith('TSLA');
    });

    it('calls onSymbolClick when symbol row is clicked', () => {
        const mockOnSymbolClick = jest.fn();

        render(
            <MockProviders>
                <WatchlistWidget
                    symbols={mockSymbols}
                    onSymbolClick={mockOnSymbolClick}
                />
            </MockProviders>
        );

        // Click on AAPL row
        fireEvent.click(screen.getByText('AAPL').closest('tr'));

        expect(mockOnSymbolClick).toHaveBeenCalledWith('AAPL');
    });

    it('shows remove buttons when onRemoveSymbol is provided', () => {
        const mockOnRemoveSymbol = jest.fn();

        render(
            <MockProviders>
                <WatchlistWidget
                    symbols={mockSymbols}
                    onRemoveSymbol={mockOnRemoveSymbol}
                />
            </MockProviders>
        );

        const removeButtons = screen.getAllByLabelText(/Remove/);
        expect(removeButtons).toHaveLength(2);

        fireEvent.click(removeButtons[0]);
        expect(mockOnRemoveSymbol).toHaveBeenCalledWith('AAPL');
    });

    it('displays alerts when showAlerts is enabled', () => {
        render(
            <MockProviders>
                <WatchlistWidget
                    symbols={mockSymbols}
                    alerts={mockAlerts}
                    showAlerts={true}
                />
            </MockProviders>
        );

        expect(screen.getByText('Alerts')).toBeInTheDocument();
        expect(screen.getByText('Alert')).toBeInTheDocument(); // Alert badge
    });

    it('hides alerts column when showAlerts is disabled', () => {
        render(
            <MockProviders>
                <WatchlistWidget
                    symbols={mockSymbols}
                    alerts={mockAlerts}
                    showAlerts={false}
                />
            </MockProviders>
        );

        expect(screen.queryByText('Alerts')).not.toBeInTheDocument();
    });

    it('handles alert creation', () => {
        const mockOnSetAlert = jest.fn();

        render(
            <MockProviders>
                <WatchlistWidget
                    symbols={mockSymbols}
                    onSetAlert={mockOnSetAlert}
                    showAlerts={true}
                />
            </MockProviders>
        );

        // Click alert button for GOOGL (no existing alert)
        const alertButtons = screen.getAllByLabelText(/bell/);
        fireEvent.click(alertButtons[1]); // Second symbol (GOOGL)

        expect(mockOnSetAlert).toHaveBeenCalledWith('GOOGL', 2750.00);
    });

    it('handles alert removal', () => {
        const mockOnRemoveAlert = jest.fn();

        render(
            <MockProviders>
                <WatchlistWidget
                    symbols={mockSymbols}
                    alerts={mockAlerts}
                    onRemoveAlert={mockOnRemoveAlert}
                    showAlerts={true}
                />
            </MockProviders>
        );

        // Find and click remove alert button
        const removeAlertButton = screen.getByLabelText(/x/);
        fireEvent.click(removeAlertButton);

        expect(mockOnRemoveAlert).toHaveBeenCalledWith('AAPL');
    });

    it('shows empty state when no symbols', () => {
        render(
            <MockProviders>
                <WatchlistWidget symbols={[]} />
            </MockProviders>
        );

        expect(screen.getByText('No symbols in watchlist')).toBeInTheDocument();
    });

    it('shows no results when search has no matches', () => {
        render(
            <MockProviders>
                <WatchlistWidget symbols={mockSymbols} />
            </MockProviders>
        );

        const searchInput = screen.getByPlaceholderText('Search symbols...');
        fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } });

        expect(screen.getByText('No symbols found')).toBeInTheDocument();
    });

    it('handles price flash animations', () => {
        const { rerender } = render(
            <MockProviders>
                <WatchlistWidget symbols={mockSymbols} />
            </MockProviders>
        );

        // Mock price change
        mockRealTimeData.getPrice.mockReturnValue({
            price: 160.00, // Changed from 155.00
            change: 10.00,
            changePercent: 6.67,
            volume: 1000000,
            high: 162.00,
            low: 152.00,
        });

        // Re-render to trigger price update
        rerender(
            <MockProviders>
                <WatchlistWidget symbols={mockSymbols} />
            </MockProviders>
        );

        // Should show updated price
        expect(screen.getByText('$160.00')).toBeInTheDocument();
    });
});