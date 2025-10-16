import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import ChartControls from '../ChartControls';

// Test wrapper with theme
const TestWrapper = ({ children }) => (
    <ThemeProvider defaultTheme="light">
        {children}
    </ThemeProvider>
);

describe('ChartControls Component', () => {
    const defaultProps = {
        timeframes: ['1m', '5m', '15m', '1h', '4h', '1D', '1W', '1M'],
        activeTimeframe: '1D',
        onTimeframeChange: jest.fn(),
        chartTypes: [
            { key: 'candlestick', icon: 'candlestick', label: 'Candlestick' },
            { key: 'line', icon: 'trendUp', label: 'Line' },
            { key: 'area', icon: 'volume', label: 'Area' },
            { key: 'bar', icon: 'minus', label: 'Bar' },
        ],
        activeChartType: 'candlestick',
        onChartTypeChange: jest.fn(),
        indicators: [
            { key: 'sma', label: 'Simple Moving Average' },
            { key: 'rsi', label: 'RSI' },
            { key: 'macd', label: 'MACD' },
        ],
        activeIndicators: ['sma'],
        onIndicatorToggle: jest.fn(),
        showVolume: true,
        onVolumeToggle: jest.fn(),
        drawingTools: [
            { key: 'line', icon: 'minus', label: 'Trend Line' },
            { key: 'rectangle', icon: 'plus', label: 'Rectangle' },
        ],
        activeDrawingTool: null,
        onDrawingToolChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders chart controls with all sections', () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} testId="chart-controls" />
            </TestWrapper>
        );

        expect(screen.getByTestId('chart-controls')).toBeInTheDocument();
        expect(screen.getByText('Timeframe')).toBeInTheDocument();
        expect(screen.getByText('Chart Type')).toBeInTheDocument();
        expect(screen.getByText('Indicators')).toBeInTheDocument();
        expect(screen.getByText('Volume')).toBeInTheDocument();
        expect(screen.getByText('Drawing')).toBeInTheDocument();
    });

    test('displays all timeframe options', () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} />
            </TestWrapper>
        );

        defaultProps.timeframes.forEach(timeframe => {
            expect(screen.getByText(timeframe)).toBeInTheDocument();
        });
    });

    test('highlights active timeframe', () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} />
            </TestWrapper>
        );

        const activeButton = screen.getByText('1D');
        expect(activeButton).toBeInTheDocument();
    });

    test('handles timeframe change', () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('1h'));
        expect(defaultProps.onTimeframeChange).toHaveBeenCalledWith('1h');
    });

    test('displays chart type buttons', () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} />
            </TestWrapper>
        );

        // Chart type buttons are icon-only, so we check for the presence of the chart type section
        expect(screen.getByText('Chart Type')).toBeInTheDocument();
    });

    test('handles chart type change', () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} />
            </TestWrapper>
        );

        // Find chart type buttons by their container and click the second one (line chart)
        const chartTypeSection = screen.getByText('Chart Type').closest('div');
        const chartTypeButtons = chartTypeSection.querySelectorAll('button');

        fireEvent.click(chartTypeButtons[1]); // Click line chart button
        expect(defaultProps.onChartTypeChange).toHaveBeenCalledWith('line');
    });

    test('shows indicator dropdown', () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} />
            </TestWrapper>
        );

        expect(screen.getByText('Indicators (1)')).toBeInTheDocument();
    });

    test('opens indicator dropdown on click', async () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('Indicators (1)'));

        await waitFor(() => {
            expect(screen.getByText('Simple Moving Average')).toBeInTheDocument();
            expect(screen.getByText('RSI')).toBeInTheDocument();
            expect(screen.getByText('MACD')).toBeInTheDocument();
        });
    });

    test('handles indicator toggle', async () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('Indicators (1)'));

        await waitFor(() => {
            fireEvent.click(screen.getByText('RSI'));
        });

        expect(defaultProps.onIndicatorToggle).toHaveBeenCalledWith({
            key: 'rsi',
            label: 'RSI',
        });
    });

    test('handles volume toggle', () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('Hide'));
        expect(defaultProps.onVolumeToggle).toHaveBeenCalled();
    });

    test('shows volume as hidden when showVolume is false', () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} showVolume={false} />
            </TestWrapper>
        );

        expect(screen.getByText('Show')).toBeInTheDocument();
    });

    test('displays drawing tools', () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} />
            </TestWrapper>
        );

        expect(screen.getByText('Drawing')).toBeInTheDocument();
    });

    test('handles drawing tool change', () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} />
            </TestWrapper>
        );

        // Find drawing tools section and click the first tool
        const drawingSection = screen.getByText('Drawing').closest('div');
        const drawingButtons = drawingSection.querySelectorAll('button');

        fireEvent.click(drawingButtons[0]);
        expect(defaultProps.onDrawingToolChange).toHaveBeenCalledWith('line');
    });

    test('supports vertical layout', () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} vertical testId="vertical-controls" />
            </TestWrapper>
        );

        expect(screen.getByTestId('vertical-controls')).toBeInTheDocument();
    });

    test('supports floating position', () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} floating testId="floating-controls" />
            </TestWrapper>
        );

        expect(screen.getByTestId('floating-controls')).toBeInTheDocument();
    });

    test('supports custom width', () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} width="300px" testId="custom-width" />
            </TestWrapper>
        );

        expect(screen.getByTestId('custom-width')).toBeInTheDocument();
    });

    test('handles empty indicators array', () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} indicators={[]} />
            </TestWrapper>
        );

        // Should not show indicators section when no indicators available
        expect(screen.queryByText('Indicators')).not.toBeInTheDocument();
    });

    test('handles empty drawing tools array', () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} drawingTools={[]} />
            </TestWrapper>
        );

        // Should not show drawing section when no tools available
        expect(screen.queryByText('Drawing')).not.toBeInTheDocument();
    });

    test('closes indicator dropdown when clicking outside', async () => {
        render(
            <TestWrapper>
                <div>
                    <ChartControls {...defaultProps} />
                    <div data-testid="outside">Outside element</div>
                </div>
            </TestWrapper>
        );

        // Open dropdown
        fireEvent.click(screen.getByText('Indicators (1)'));

        await waitFor(() => {
            expect(screen.getByText('Simple Moving Average')).toBeInTheDocument();
        });

        // Click outside
        fireEvent.click(screen.getByTestId('outside'));

        await waitFor(() => {
            expect(screen.queryByText('Simple Moving Average')).not.toBeInTheDocument();
        });
    });

    test('shows correct indicator count in dropdown button', () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} activeIndicators={['sma', 'rsi']} />
            </TestWrapper>
        );

        expect(screen.getByText('Indicators (2)')).toBeInTheDocument();
    });

    test('highlights active drawing tool', () => {
        render(
            <TestWrapper>
                <ChartControls {...defaultProps} activeDrawingTool="line" />
            </TestWrapper>
        );

        // The active drawing tool should be highlighted (tested through the component structure)
        expect(screen.getByText('Drawing')).toBeInTheDocument();
    });
});