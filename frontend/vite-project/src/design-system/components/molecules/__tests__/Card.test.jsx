import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import { Card, MetricCard, InfoCard, TradingCard, StatsCard } from '../Card';

const renderWithTheme = (component) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
};

describe('Card', () => {
    it('renders children content', () => {
        renderWithTheme(
            <Card>
                <div>Card Content</div>
            </Card>
        );

        expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('handles click events when interactive', () => {
        const handleClick = jest.fn();
        renderWithTheme(
            <Card interactive onClick={handleClick}>
                <div>Clickable Card</div>
            </Card>
        );

        fireEvent.click(screen.getByText('Clickable Card'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports different variants', () => {
        const { rerender } = renderWithTheme(
            <Card variant="elevated">
                <div>Elevated Card</div>
            </Card>
        );

        expect(screen.getByText('Elevated Card')).toBeInTheDocument();

        rerender(
            <ThemeProvider>
                <Card variant="outlined">
                    <div>Outlined Card</div>
                </Card>
            </ThemeProvider>
        );

        expect(screen.getByText('Outlined Card')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        renderWithTheme(
            <Card className="custom-card">
                <div>Custom Card</div>
            </Card>
        );

        const cardElement = screen.getByText('Custom Card').closest('div');
        expect(cardElement).toHaveClass('custom-card');
    });
});

describe('MetricCard', () => {
    const mockMetric = {
        title: 'Total Volume',
        value: '$1,234,567',
        change: '+5.2%',
        trend: 'up'
    };

    it('renders metric information', () => {
        renderWithTheme(
            <MetricCard {...mockMetric} />
        );

        expect(screen.getByText('Total Volume')).toBeInTheDocument();
        expect(screen.getByText('$1,234,567')).toBeInTheDocument();
        expect(screen.getByText('+5.2%')).toBeInTheDocument();
    });

    it('shows trend indicators', () => {
        renderWithTheme(
            <MetricCard {...mockMetric} />
        );

        // Should show up trend icon
        expect(screen.getByTestId('trend-icon')).toBeInTheDocument();
    });
});

describe('TradingCard', () => {
    const mockTradingData = {
        symbol: 'BTC/USD',
        price: 45000,
        change: 1250,
        changePercent: 2.85,
        volume: 1234567
    };

    it('renders trading information', () => {
        renderWithTheme(
            <TradingCard {...mockTradingData} />
        );

        expect(screen.getByText('BTC/USD')).toBeInTheDocument();
        expect(screen.getByText('$45,000')).toBeInTheDocument();
        expect(screen.getByText('+2.85%')).toBeInTheDocument();
    });

    it('handles real-time updates', () => {
        const { rerender } = renderWithTheme(
            <TradingCard {...mockTradingData} />
        );

        const updatedData = { ...mockTradingData, price: 46000 };
        rerender(
            <ThemeProvider>
                <TradingCard {...updatedData} />
            </ThemeProvider>
        );

        expect(screen.getByText('$46,000')).toBeInTheDocument();
    });
});

describe('StatsCard', () => {
    const mockStats = {
        title: 'Portfolio Performance',
        stats: [
            { label: 'Total Value', value: '$125,000' },
            { label: 'Today P&L', value: '+$2,500', positive: true },
            { label: 'Win Rate', value: '68%' }
        ]
    };

    it('renders statistics', () => {
        renderWithTheme(
            <StatsCard {...mockStats} />
        );

        expect(screen.getByText('Portfolio Performance')).toBeInTheDocument();
        expect(screen.getByText('Total Value')).toBeInTheDocument();
        expect(screen.getByText('$125,000')).toBeInTheDocument();
        expect(screen.getByText('Today P&L')).toBeInTheDocument();
        expect(screen.getByText('+$2,500')).toBeInTheDocument();
    });

    it('shows positive/negative indicators', () => {
        renderWithTheme(
            <StatsCard {...mockStats} />
        );

        // Should show positive indicator for Today P&L
        const positiveValue = screen.getByText('+$2,500');
        expect(positiveValue).toHaveStyle('color: rgb(34, 197, 94)'); // green color
    });
});