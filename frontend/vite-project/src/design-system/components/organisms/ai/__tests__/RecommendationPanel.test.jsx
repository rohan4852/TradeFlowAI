import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import { lightTheme } from '../../../tokens';
import { RecommendationPanel } from '../RecommendationPanel';

const mockRecommendations = [
    {
        id: 'rec-1',
        symbol: 'AAPL',
        title: 'Buy AAPL on Dip',
        description: 'Strong support level reached, good entry point',
        confidence: 85,
        priority: 'high',
        action: 'buy',
        targetPrice: 180.50,
        potentialReturn: 5.2,
        riskLevel: 'medium',
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        type: 'price_target'
    },
    {
        id: 'rec-2',
        symbol: 'TSLA',
        title: 'Sell TSLA Before Earnings',
        description: 'High volatility expected, consider taking profits',
        confidence: 72,
        priority: 'medium',
        action: 'sell',
        targetPrice: 220.00,
        potentialReturn: 3.1,
        riskLevel: 'high',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        type: 'volatility'
    },
    {
        id: 'rec-3',
        symbol: 'MSFT',
        title: 'Hold MSFT Position',
        description: 'Stable growth trajectory, maintain current position',
        confidence: 68,
        priority: 'low',
        action: 'hold',
        targetPrice: 350.00,
        potentialReturn: 2.8,
        riskLevel: 'low',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        type: 'trend_analysis'
    }
];

const renderWithTheme = (component) => {
    return render(
        <ThemeProvider theme={lightTheme}>
            {component}
        </ThemeProvider>
    );
};

describe('RecommendationPanel', () => {
    it('renders panel with recommendations correctly', () => {
        renderWithTheme(
            <RecommendationPanel recommendations={mockRecommendations} />
        );

        expect(screen.getByText('AI Recommendations')).toBeInTheDocument();
        expect(screen.getByText('Buy AAPL on Dip')).toBeInTheDocument();
        expect(screen.getByText('Sell TSLA Before Earnings')).toBeInTheDocument();
        expect(screen.getByText('Hold MSFT Position')).toBeInTheDocument();
    });

    it('displays correct statistics in header', () => {
        renderWithTheme(
            <RecommendationPanel recommendations={mockRecommendations} />
        );

        // Total recommendations
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('Total')).toBeInTheDocument();

        // High priority count
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('High Priority')).toBeInTheDocument();

        // Average confidence should be around 75% ((85+72+68)/3)
        expect(screen.getByText('75%')).toBeInTheDocument();
        expect(screen.getByText('Avg Confidence')).toBeInTheDocument();
    });

    it('shows priority badges with correct colors', () => {
        renderWithTheme(
            <RecommendationPanel recommendations={mockRecommendations} />
        );

        const highPriorityBadge = screen.getByText('high');
        const mediumPriorityBadge = screen.getByText('medium');
        const lowPriorityBadge = screen.getByText('low');

        expect(highPriorityBadge).toBeInTheDocument();
        expect(mediumPriorityBadge).toBeInTheDocument();
        expect(lowPriorityBadge).toBeInTheDocument();
    });

    it('displays expiration timers correctly', () => {
        renderWithTheme(
            <RecommendationPanel recommendations={mockRecommendations} />
        );

        // Should show time remaining for each recommendation
        expect(screen.getByText(/left/)).toBeInTheDocument();
    });

    it('calls action handlers when buttons are clicked', () => {
        const mockOnAccept = jest.fn();
        const mockOnDismiss = jest.fn();
        const mockOnViewDetails = jest.fn();

        renderWithTheme(
            <RecommendationPanel
                recommendations={mockRecommendations}
                onAcceptRecommendation={mockOnAccept}
                onDismissRecommendation={mockOnDismiss}
                onViewDetails={mockOnViewDetails}
            />
        );

        // Click Accept on first recommendation
        const acceptButtons = screen.getAllByText('Accept');
        fireEvent.click(acceptButtons[0]);
        expect(mockOnAccept).toHaveBeenCalledWith(mockRecommendations[0]);

        // Click Dismiss on first recommendation
        const dismissButtons = screen.getAllByText('Dismiss');
        fireEvent.click(dismissButtons[0]);
        expect(mockOnDismiss).toHaveBeenCalledWith(mockRecommendations[0].id);

        // Click Details on first recommendation
        const detailsButtons = screen.getAllByText('Details');
        fireEvent.click(detailsButtons[0]);
        expect(mockOnViewDetails).toHaveBeenCalledWith(mockRecommendations[0]);
    });

    it('calls refresh handler when refresh button is clicked', () => {
        const mockOnRefresh = jest.fn();

        renderWithTheme(
            <RecommendationPanel
                recommendations={mockRecommendations}
                onRefresh={mockOnRefresh}
            />
        );

        const refreshButton = screen.getByText('Refresh');
        fireEvent.click(refreshButton);
        expect(mockOnRefresh).toHaveBeenCalled();
    });

    it('shows loading state correctly', () => {
        renderWithTheme(
            <RecommendationPanel
                recommendations={mockRecommendations}
                isLoading={true}
            />
        );

        const refreshButton = screen.getByText('Refresh');
        expect(refreshButton).toBeDisabled();
    });

    it('displays analysis progress when provided', () => {
        renderWithTheme(
            <RecommendationPanel
                recommendations={[]}
                analysisProgress={65}
            />
        );

        expect(screen.getByText('AI Analysis in progress...')).toBeInTheDocument();
        expect(screen.getByText('65%')).toBeInTheDocument();
    });

    it('shows empty state when no recommendations', () => {
        renderWithTheme(
            <RecommendationPanel recommendations={[]} />
        );

        expect(screen.getByText('No Recommendations Available')).toBeInTheDocument();
        expect(screen.getByText(/AI analysis will generate recommendations/)).toBeInTheDocument();
    });

    it('displays trading colors correctly for different actions', () => {
        renderWithTheme(
            <RecommendationPanel recommendations={mockRecommendations} />
        );

        // Buy action should be green
        const buyAction = screen.getByText('BUY');
        expect(buyAction).toHaveStyle({ color: expect.stringContaining('10b981') }); // bull color

        // Sell action should be red  
        const sellAction = screen.getByText('SELL');
        expect(sellAction).toHaveStyle({ color: expect.stringContaining('ef4444') }); // bear color
    });

    it('formats potential returns correctly', () => {
        renderWithTheme(
            <RecommendationPanel recommendations={mockRecommendations} />
        );

        expect(screen.getByText('+5.20%')).toBeInTheDocument();
        expect(screen.getByText('+3.10%')).toBeInTheDocument();
        expect(screen.getByText('+2.80%')).toBeInTheDocument();
    });

    it('shows confidence indicators for each recommendation', () => {
        renderWithTheme(
            <RecommendationPanel recommendations={mockRecommendations} />
        );

        // Should show confidence percentages
        expect(screen.getByText('85%')).toBeInTheDocument();
        expect(screen.getByText('72%')).toBeInTheDocument();
        expect(screen.getByText('68%')).toBeInTheDocument();
    });

    it('handles urgent expiration times correctly', () => {
        const urgentRecommendation = {
            ...mockRecommendations[0],
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
        };

        renderWithTheme(
            <RecommendationPanel recommendations={[urgentRecommendation]} />
        );

        // Should show urgent styling for recommendations expiring soon
        const expirationTimer = screen.getByText(/left/);
        expect(expirationTimer).toBeInTheDocument();
    });

    it('sorts recommendations by priority correctly', () => {
        renderWithTheme(
            <RecommendationPanel recommendations={mockRecommendations} />
        );

        const recommendationTitles = screen.getAllByRole('heading', { level: 4 });

        // High priority should come first
        expect(recommendationTitles[0]).toHaveTextContent('Buy AAPL on Dip');
        // Medium priority should come second
        expect(recommendationTitles[1]).toHaveTextContent('Sell TSLA Before Earnings');
        // Low priority should come last
        expect(recommendationTitles[2]).toHaveTextContent('Hold MSFT Position');
    });

    it('applies custom className and props', () => {
        renderWithTheme(
            <RecommendationPanel
                recommendations={mockRecommendations}
                className="custom-panel"
                data-testid="recommendation-panel"
            />
        );

        const panel = screen.getByTestId('recommendation-panel');
        expect(panel).toHaveClass('custom-panel');
    });
});