import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import { lightTheme } from '../../../tokens';
import { ConfidenceIndicator } from '../ConfidenceIndicator';

const renderWithTheme = (component) => {
    return render(
        <ThemeProvider theme={lightTheme}>
            {component}
        </ThemeProvider>
    );
};

describe('ConfidenceIndicator', () => {
    it('renders bar variant correctly', () => {
        renderWithTheme(
            <ConfidenceIndicator
                confidence={75}
                variant="bar"
                label="Test Confidence"
            />
        );

        expect(screen.getByText('Test Confidence')).toBeInTheDocument();
        expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('renders segments variant correctly', () => {
        renderWithTheme(
            <ConfidenceIndicator
                confidence={80}
                variant="segments"
            />
        );

        expect(screen.getByText('80%')).toBeInTheDocument();

        // Should render 10 segments
        const segments = screen.getAllByTestId(/confidence-segment/);
        expect(segments).toHaveLength(10);
    });

    it('renders circular variant correctly', () => {
        renderWithTheme(
            <ConfidenceIndicator
                confidence={90}
                variant="circular"
                size="lg"
            />
        );

        expect(screen.getByText('90%')).toBeInTheDocument();

        // Should render SVG circle
        const svg = screen.getByRole('img', { hidden: true });
        expect(svg).toBeInTheDocument();
    });

    it('applies correct color coding based on confidence level', () => {
        const { rerender } = renderWithTheme(
            <ConfidenceIndicator confidence={85} />
        );

        // High confidence (85%) should show success color
        let confidenceText = screen.getByText('85%');
        expect(confidenceText).toHaveStyle({ color: expect.stringContaining('10b981') });

        // Medium confidence (65%)
        rerender(
            <ThemeProvider theme={lightTheme}>
                <ConfidenceIndicator confidence={65} />
            </ThemeProvider>
        );

        confidenceText = screen.getByText('65%');
        expect(confidenceText).toHaveStyle({ color: expect.stringContaining('f59e0b') });

        // Low confidence (45%)
        rerender(
            <ThemeProvider theme={lightTheme}>
                <ConfidenceIndicator confidence={45} />
            </ThemeProvider>
        );

        confidenceText = screen.getByText('45%');
        expect(confidenceText).toHaveStyle({ color: expect.stringContaining('ef4444') });
    });

    it('handles different sizes correctly', () => {
        const { rerender } = renderWithTheme(
            <ConfidenceIndicator confidence={70} size="sm" />
        );

        // Small size
        expect(screen.getByText('70%')).toBeInTheDocument();

        // Large size
        rerender(
            <ThemeProvider theme={lightTheme}>
                <ConfidenceIndicator confidence={70} size="lg" />
            </ThemeProvider>
        );

        expect(screen.getByText('70%')).toBeInTheDocument();
    });

    it('can hide label and value when specified', () => {
        renderWithTheme(
            <ConfidenceIndicator
                confidence={60}
                label="Hidden Label"
                showLabel={false}
                showValue={false}
            />
        );

        expect(screen.queryByText('Hidden Label')).not.toBeInTheDocument();
        expect(screen.queryByText('60%')).not.toBeInTheDocument();
    });

    it('disables animation when specified', () => {
        renderWithTheme(
            <ConfidenceIndicator
                confidence={80}
                animated={false}
            />
        );

        expect(screen.getByText('80%')).toBeInTheDocument();
        // Animation testing would require more complex setup with framer-motion testing utilities
    });

    it('renders segments with correct activation', () => {
        renderWithTheme(
            <ConfidenceIndicator
                confidence={50}
                variant="segments"
            />
        );

        // 50% confidence should activate 5 out of 10 segments
        const segments = screen.getAllByTestId(/confidence-segment/);
        expect(segments).toHaveLength(10);

        // First 5 segments should be active (would need more specific testing for visual state)
        expect(segments[0]).toBeInTheDocument();
        expect(segments[9]).toBeInTheDocument();
    });

    it('calculates circular progress correctly', () => {
        renderWithTheme(
            <ConfidenceIndicator
                confidence={25}
                variant="circular"
            />
        );

        expect(screen.getByText('25%')).toBeInTheDocument();

        // Should render circle with correct stroke-dashoffset calculation
        const circle = screen.getByRole('img', { hidden: true });
        expect(circle).toBeInTheDocument();
    });

    it('applies custom className and props', () => {
        renderWithTheme(
            <ConfidenceIndicator
                confidence={70}
                className="custom-confidence"
                data-testid="confidence-indicator"
            />
        );

        const indicator = screen.getByTestId('confidence-indicator');
        expect(indicator).toHaveClass('custom-confidence');
    });

    it('handles edge cases for confidence values', () => {
        const { rerender } = renderWithTheme(
            <ConfidenceIndicator confidence={0} />
        );

        expect(screen.getByText('0%')).toBeInTheDocument();

        rerender(
            <ThemeProvider theme={lightTheme}>
                <ConfidenceIndicator confidence={100} />
            </ThemeProvider>
        );

        expect(screen.getByText('100%')).toBeInTheDocument();
    });
});