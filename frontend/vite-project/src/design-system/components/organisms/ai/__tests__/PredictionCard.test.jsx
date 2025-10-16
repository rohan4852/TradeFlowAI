import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import { lightTheme } from '../../../tokens';
import { PredictionCard } from '../PredictionCard';

const mockPrediction = {
    id: 'pred-1',
    symbol: 'AAPL',
    type: 'price_target',
    title: 'AAPL Price Target',
    description: 'Strong bullish momentum expected based on technical analysis',
    confidence: 85,
    targetPrice: 180.50,
    currentPrice: 175.25,
    expectedReturn: 3.0,
    timeframe: '1 week',
    timestamp: new Date('2024-01-15T10:30:00Z').toISOString(),
    status: 'active',
    accuracy: 78
};

const renderWithTheme = (component) => {
    return render(
        <ThemeProvider theme={lightTheme}>
            {component}
        </ThemeProvider>
    );
};

describe('PredictionCard', () => {
    it('renders prediction information correctly', () => {
        renderWithTheme(<PredictionCard prediction={mockPrediction} />);

        expect(screen.getByText('AAPL Price Target')).toBeInTheDocument();
        expect(screen.getByText('AAPL')).toBeInTheDocument();
        expect(screen.getByText('$180.50')).toBeInTheDocument();
        expect(screen.getByText('+3.00%')).toBeInTheDocument();
        expect(screen.getByText('1 week')).toBeInTheDocument();
        expect(screen.getByText('85%')).toBeInTheDocument();
        expect(screen.getByText('78%')).toBeInTheDocument();
    });

    it('displays confidence indicator with correct color coding', () => {
        const { rerender } = renderWithTheme(<PredictionCard prediction={mockPrediction} />);

        // High confidence (85%) should show success color
        let confidenceText = screen.getByText('85%');
        expect(confidenceText).toHaveStyle({ color: expect.stringContaining('10b981') }); // success color

        // Medium confidence
        const mediumConfidencePrediction = { ...mockPrediction, confidence: 65 };
        rerender(
            <ThemeProvider theme={lightTheme}>
                <PredictionCard prediction={mediumConfidencePrediction} />
            </ThemeProvider>
        );

        confidenceText = screen.getByText('65%');
        expect(confidenceText).toHaveStyle({ color: expect.stringContaining('f59e0b') }); // warning color

        // Low confidence
        const lowConfidencePrediction = { ...mockPrediction, confidence: 45 };
        rerender(
            <ThemeProvider theme={lightTheme}>
                <PredictionCard prediction={lowConfidencePrediction} />
            </ThemeProvider>
        );

        confidenceText = screen.getByText('45%');
        expect(confidenceText).toHaveStyle({ color: expect.stringContaining('ef4444') }); // error color
    });

    it('shows correct status indicator', () => {
        const { rerender } = renderWithTheme(<PredictionCard prediction={mockPrediction} />);

        // Active status
        expect(screen.getByTestId('status-indicator')).toHaveStyle({
            background: expect.stringContaining('10b981') // success color for active
        });

        // Expired status
        const expiredPrediction = { ...mockPrediction, status: 'expired' };
        rerender(
            <ThemeProvider theme={lightTheme}>
                <PredictionCard prediction={expiredPrediction} />
            </ThemeProvider>
        );

        expect(screen.getByTestId('status-indicator')).toHaveStyle({
            background: expect.stringContaining('a1a1aa') // neutral color for expired
        });
    });

    it('calls action handlers when buttons are clicked', () => {
        const mockOnAccept = jest.fn();
        const mockOnDismiss = jest.fn();
        const mockOnViewDetails = jest.fn();

        renderWithTheme(
            <PredictionCard
                prediction={mockPrediction}
                onAccept={mockOnAccept}
                onDismiss={mockOnDismiss}
                onViewDetails={mockOnViewDetails}
            />
        );

        fireEvent.click(screen.getByText('Accept'));
        expect(mockOnAccept).toHaveBeenCalledWith(mockPrediction);

        fireEvent.click(screen.getByText('Dismiss'));
        expect(mockOnDismiss).toHaveBeenCalledWith(mockPrediction.id);

        fireEvent.click(screen.getByText('Details'));
        expect(mockOnViewDetails).toHaveBeenCalledWith(mockPrediction);
    });

    it('does not show Accept button for non-active predictions', () => {
        const expiredPrediction = { ...mockPrediction, status: 'expired' };

        renderWithTheme(
            <PredictionCard
                prediction={expiredPrediction}
                onAccept={jest.fn()}
            />
        );

        expect(screen.queryByText('Accept')).not.toBeInTheDocument();
    });

    it('formats timestamp correctly', () => {
        renderWithTheme(<PredictionCard prediction={mockPrediction} />);

        // Should show relative time format
        expect(screen.getByText(/ago$/)).toBeInTheDocument();
    });

    it('displays correct trading colors for positive and negative returns', () => {
        const { rerender } = renderWithTheme(<PredictionCard prediction={mockPrediction} />);

        // Positive return should be green
        let returnElement = screen.getByText('+3.00%');
        expect(returnElement).toHaveStyle({ color: expect.stringContaining('10b981') }); // bull color

        // Negative return should be red
        const negativeReturnPrediction = { ...mockPrediction, expectedReturn: -2.5 };
        rerender(
            <ThemeProvider theme={lightTheme}>
                <PredictionCard prediction={negativeReturnPrediction} />
            </ThemeProvider>
        );

        returnElement = screen.getByText('-2.50%');
        expect(returnElement).toHaveStyle({ color: expect.stringContaining('ef4444') }); // bear color
    });

    it('shows processing animation for processing status', async () => {
        const processingPrediction = { ...mockPrediction, status: 'processing' };

        renderWithTheme(<PredictionCard prediction={processingPrediction} />);

        const statusIndicator = screen.getByTestId('status-indicator');
        expect(statusIndicator).toBeInTheDocument();

        // Should have pulsing animation for processing status
        await waitFor(() => {
            expect(statusIndicator).toHaveStyle({
                background: expect.stringContaining('f59e0b') // warning color for processing
            });
        });
    });

    it('renders with custom className and props', () => {
        renderWithTheme(
            <PredictionCard
                prediction={mockPrediction}
                className="custom-class"
                data-testid="custom-prediction-card"
            />
        );

        const card = screen.getByTestId('custom-prediction-card');
        expect(card).toHaveClass('custom-class');
    });

    it('handles missing optional fields gracefully', () => {
        const minimalPrediction = {
            id: 'pred-2',
            symbol: 'TSLA',
            title: 'TSLA Prediction',
            confidence: 70,
            timestamp: new Date().toISOString()
        };

        renderWithTheme(<PredictionCard prediction={minimalPrediction} />);

        expect(screen.getByText('TSLA Prediction')).toBeInTheDocument();
        expect(screen.getByText('TSLA')).toBeInTheDocument();
        expect(screen.getByText('70%')).toBeInTheDocument();
    });
});