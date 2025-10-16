import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../../../ThemeProvider';
import { RealTimeDataProvider } from '../../../providers/RealTimeDataProvider';
import PortfolioWidget from '../PortfolioWidget';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock providers
const mockRealTimeData = {
    isConnected: true,
    getPrice: jest.fn(),
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

describe('PortfolioWidget', () => {
    const mockHoldings = [
        {
            symbol: 'AAPL',
            quantity: 100,
            avgCost: 150.00,
            currentPrice: 155.00,
            dayChange: 5.00,
            dayChangePercent: 3.33
        },
        {
            symbol: 'GOOGL',
            quantity: 50,
            avgCost: 2800.00,
            currentPrice: 2750.00,
            dayChange: -50.00,
            dayChangePercent: -1.79
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders portfolio widget with holdings', () => {
        render(
            <MockProviders>
                <PortfolioWidget holdings={mockHoldings} />
            </MockProviders>
        );

        expect(screen.getByText('Portfolio')).toBeInTheDocument();
        expect(screen.getByText('AAPL')).toBeInTheDocument();
        expect(screen.getByText('GOOGL')).toBeInTheDocument();
    });

    it('calculates portfolio metrics correctly', () => {
        render(
            <MockProviders>
                <PortfolioWidget holdings={mockHoldings} />
            </MockProviders>
        );

        // Total value should be (100 * 155) + (50 * 2750) = 15500 + 137500 = 153000
        expect(screen.getByText('$153,000.00')).toBeInTheDocument();
    });

    it('displays holdings with correct formatting', () => {
        render(
            <MockProviders>
                <PortfolioWidget holdings={mockHoldings} />
            </MockProviders>
        );

        // Check AAPL holding details
        expect(screen.getByText('100 shares @ $150.00')).toBeInTheDocument();
        expect(screen.getByText('$155.00')).toBeInTheDocument();
        expect(screen.getByText('+3.33%')).toBeInTheDocument();

        // Check GOOGL holding details
        expect(screen.getByText('50 shares @ $2,800.00')).toBeInTheDocument();
        expect(screen.getByText('$2,750.00')).toBeInTheDocument();
        expect(screen.getByText('-1.79%')).toBeInTheDocument();
    });

    it('handles sorting by different criteria', () => {
        render(
            <MockProviders>
                <PortfolioWidget holdings={mockHoldings} />
            </MockProviders>
        );

        // Click sort by value
        fireEvent.click(screen.getByText(/Value/));

        // Should sort by value (GOOGL should be first as it has higher value)
        const holdings = screen.getAllByText(/shares @/);
        expect(holdings[0]).toHaveTextContent('50 shares @ $2,800.00'); // GOOGL
    });

    it('calls onHoldingClick when holding is clicked', () => {
        const mockOnHoldingClick = jest.fn();

        render(
            <MockProviders>
                <PortfolioWidget
                    holdings={mockHoldings}
                    onHoldingClick={mockOnHoldingClick}
                />
            </MockProviders>
        );

        // Click on AAPL holding
        fireEvent.click(screen.getByText('AAPL').closest('div'));

        expect(mockOnHoldingClick).toHaveBeenCalledWith(mockHoldings[0]);
    });

    it('shows add holding button when onAddHolding is provided', () => {
        const mockOnAddHolding = jest.fn();

        render(
            <MockProviders>
                <PortfolioWidget
                    holdings={mockHoldings}
                    onAddHolding={mockOnAddHolding}
                />
            </MockProviders>
        );

        const addButton = screen.getByText('Add Holding');
        expect(addButton).toBeInTheDocument();

        fireEvent.click(addButton);
        expect(mockOnAddHolding).toHaveBeenCalled();
    });

    it('shows remove buttons when onRemoveHolding is provided', () => {
        const mockOnRemoveHolding = jest.fn();

        render(
            <MockProviders>
                <PortfolioWidget
                    holdings={mockHoldings}
                    onRemoveHolding={mockOnRemoveHolding}
                />
            </MockProviders>
        );

        const removeButtons = screen.getAllByLabelText(/Remove/);
        expect(removeButtons).toHaveLength(2);

        fireEvent.click(removeButtons[0]);
        expect(mockOnRemoveHolding).toHaveBeenCalledWith('AAPL');
    });

    it('displays top gainer and loser correctly', () => {
        render(
            <MockProviders>
                <PortfolioWidget holdings={mockHoldings} />
            </MockProviders>
        );

        // AAPL should be top gainer with +3.33%
        expect(screen.getByText('Top Gainer')).toBeInTheDocument();
        expect(screen.getByText('AAPL')).toBeInTheDocument();
        expect(screen.getByText('+3.33%')).toBeInTheDocument();
    });

    it('handles empty holdings gracefully', () => {
        render(
            <MockProviders>
                <PortfolioWidget holdings={[]} />
            </MockProviders>
        );

        expect(screen.getByText('Portfolio')).toBeInTheDocument();
        expect(screen.getByText('$0.00')).toBeInTheDocument(); // Total value
        expect(screen.getByText('0')).toBeInTheDocument(); // Holdings count
    });

    it('shows performance chart when enabled', () => {
        render(
            <MockProviders>
                <PortfolioWidget holdings={mockHoldings} showChart={true} />
            </MockProviders>
        );

        expect(screen.getByText('Performance')).toBeInTheDocument();
        expect(screen.getByText('Portfolio performance chart will be rendered here')).toBeInTheDocument();
    });

    it('hides performance chart when disabled', () => {
        render(
            <MockProviders>
                <PortfolioWidget holdings={mockHoldings} showChart={false} />
            </MockProviders>
        );

        expect(screen.queryByText('Performance')).not.toBeInTheDocument();
    });

    it('shows holdings list when enabled', () => {
        render(
            <MockProviders>
                <PortfolioWidget holdings={mockHoldings} showHoldings={true} />
            </MockProviders>
        );

        expect(screen.getByText('Holdings')).toBeInTheDocument();
        expect(screen.getByText('AAPL')).toBeInTheDocument();
    });

    it('hides holdings list when disabled', () => {
        render(
            <MockProviders>
                <PortfolioWidget holdings={mockHoldings} showHoldings={false} />
            </MockProviders>
        );

        expect(screen.queryByText('Holdings')).not.toBeInTheDocument();
        expect(screen.queryByText('AAPL')).not.toBeInTheDocument();
    });

    it('handles time range selection for performance chart', () => {
        render(
            <MockProviders>
                <PortfolioWidget holdings={mockHoldings} showChart={true} />
            </MockProviders>
        );

        // Click on different time ranges
        fireEvent.click(screen.getByText('1W'));
        fireEvent.click(screen.getByText('1M'));
        fireEvent.click(screen.getByText('3M'));
        fireEvent.click(screen.getByText('1Y'));

        // Should not throw errors
        expect(screen.getByText('Performance')).toBeInTheDocument();
    });
});