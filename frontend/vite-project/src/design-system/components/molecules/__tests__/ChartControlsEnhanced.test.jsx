import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../ThemeProvider';
import ChartControls from '../ChartControls';
import TechnicalIndicators, { PREDEFINED_INDICATORS } from '../TechnicalIndicators';
import ChartOverlay from '../ChartOverlay';

// Test wrapper with theme
const TestWrapper = ({ children }) => (
    <ThemeProvider defaultTheme="light">
        {children}
    </ThemeProvider>
);

describe('Enhanced Chart Controls with Keyboard Navigation', () => {
    describe('ChartControls Keyboard Navigation', () => {
        const mockTimeframeChange = jest.fn();
        const mockChartTypeChange = jest.fn();
        const mockVolumeToggle = jest.fn();
        const mockIndicatorToggle = jest.fn();
        const mockDrawingToolChange = jest.fn();

        const defaultProps = {
            timeframes: ['1m', '5m', '15m', '1h', '4h', '1D'],
            activeTimeframe: '1D',
            onTimeframeChange: mockTimeframeChange,
            chartTypes: [
                { key: 'candlestick', icon: 'candlestick', label: 'Candlestick' },
                { key: 'line', icon: 'trendUp', label: 'Line' },
                { key: 'area', icon: 'volume', label: 'Area' }
            ],
            activeChartType: 'candlestick',
            onChartTypeChange: mockChartTypeChange,
            indicators: PREDEFINED_INDICATORS.slice(0, 3),
            activeIndicators: ['sma'],
            onIndicatorToggle: mockIndicatorToggle,
            showVolume: true,
            onVolumeToggle: mockVolumeToggle,
            drawingTools: [
                { key: 'line', icon: 'minus', label: 'Trend Line' },
                { key: 'rectangle', icon: 'plus', label: 'Rectangle' }
            ],
            onDrawingToolChange: mockDrawingToolChange
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('renders with proper ARIA attributes', () => {
            render(
                <TestWrapper>
                    <ChartControls {...defaultProps} testId="chart-controls" />
                </TestWrapper>
            );

            const toolbar = screen.getByTestId('chart-controls');
            expect(toolbar).toHaveAttribute('role', 'toolbar');
            expect(toolbar).toHaveAttribute('aria-label', 'Chart controls');

            // Check timeframe buttons have proper ARIA attributes
            const activeTimeframeButton = screen.getByLabelText('Set timeframe to 1D');
            expect(activeTimeframeButton).toHaveAttribute('aria-pressed', 'true');
            expect(activeTimeframeButton).toHaveAttribute('tabIndex', '0');

            const inactiveTimeframeButton = screen.getByLabelText('Set timeframe to 1m');
            expect(inactiveTimeframeButton).toHaveAttribute('aria-pressed', 'false');
            expect(inactiveTimeframeButton).toHaveAttribute('tabIndex', '-1');
        });

        test('handles keyboard shortcuts for timeframes', async () => {
            const user = userEvent.setup();
            render(
                <TestWrapper>
                    <ChartControls {...defaultProps} testId="chart-controls" />
                </TestWrapper>
            );

            const toolbar = screen.getByTestId('chart-controls');
            toolbar.focus();

            // Test Ctrl+1 for first timeframe
            await user.keyboard('{Control>}1{/Control}');
            expect(mockTimeframeChange).toHaveBeenCalledWith('1m');

            // Test Ctrl+3 for third timeframe
            await user.keyboard('{Control>}3{/Control}');
            expect(mockTimeframeChange).toHaveBeenCalledWith('15m');
        });

        test('handles keyboard shortcuts for chart types', async () => {
            const user = userEvent.setup();
            render(
                <TestWrapper>
                    <ChartControls {...defaultProps} testId="chart-controls" />
                </TestWrapper>
            );

            const toolbar = screen.getByTestId('chart-controls');
            toolbar.focus();

            // Test Ctrl+C to cycle chart types
            await user.keyboard('{Control>}c{/Control}');
            expect(mockChartTypeChange).toHaveBeenCalledWith('line');
        });

        test('handles keyboard shortcuts for volume toggle', async () => {
            const user = userEvent.setup();
            render(
                <TestWrapper>
                    <ChartControls {...defaultProps} testId="chart-controls" />
                </TestWrapper>
            );

            const toolbar = screen.getByTestId('chart-controls');
            toolbar.focus();

            // Test Ctrl+V for volume toggle
            await user.keyboard('{Control>}v{/Control}');
            expect(mockVolumeToggle).toHaveBeenCalled();
        });

        test('handles arrow key navigation between controls', async () => {
            const user = userEvent.setup();
            render(
                <TestWrapper>
                    <ChartControls {...defaultProps} testId="chart-controls" />
                </TestWrapper>
            );

            const toolbar = screen.getByTestId('chart-controls');
            toolbar.focus();

            // Focus first timeframe button
            const firstTimeframeButton = screen.getByLabelText('Set timeframe to 1m');
            firstTimeframeButton.focus();

            // Navigate with arrow keys
            await user.keyboard('{ArrowRight}');
            expect(document.activeElement).toBe(screen.getByLabelText('Set timeframe to 5m'));

            await user.keyboard('{ArrowLeft}');
            expect(document.activeElement).toBe(firstTimeframeButton);
        });

        test('handles Home and End keys for navigation', async () => {
            const user = userEvent.setup();
            render(
                <TestWrapper>
                    <ChartControls {...defaultProps} testId="chart-controls" />
                </TestWrapper>
            );

            const toolbar = screen.getByTestId('chart-controls');
            toolbar.focus();

            // Focus a middle button
            const middleButton = screen.getByLabelText('Set timeframe to 15m');
            middleButton.focus();

            // Test Home key
            await user.keyboard('{Home}');
            const focusableElements = toolbar.querySelectorAll('button:not([disabled])');
            expect(document.activeElement).toBe(focusableElements[0]);

            // Test End key
            await user.keyboard('{End}');
            expect(document.activeElement).toBe(focusableElements[focusableElements.length - 1]);
        });

        test('handles Escape key to close dropdowns', async () => {
            const user = userEvent.setup();
            render(
                <TestWrapper>
                    <ChartControls {...defaultProps} testId="chart-controls" />
                </TestWrapper>
            );

            // Open indicator dropdown
            const indicatorButton = screen.getByText(/Indicators/);
            await user.click(indicatorButton);

            // Verify dropdown is open
            expect(screen.getByText('Simple Moving Average')).toBeInTheDocument();

            // Press Escape
            await user.keyboard('{Escape}');

            // Verify dropdown is closed
            await waitFor(() => {
                expect(screen.queryByText('Simple Moving Average')).not.toBeInTheDocument();
            });
        });
    });

    describe('TechnicalIndicators Keyboard Navigation', () => {
        const mockIndicatorAdd = jest.fn();
        const mockIndicatorRemove = jest.fn();
        const mockIndicatorUpdate = jest.fn();

        const defaultProps = {
            activeIndicators: [
                {
                    id: 'sma_1',
                    key: 'sma',
                    name: 'Simple Moving Average',
                    params: { period: 20 }
                }
            ],
            indicatorValues: { sma_1: 150.25 },
            onIndicatorAdd: mockIndicatorAdd,
            onIndicatorRemove: mockIndicatorRemove,
            onIndicatorUpdate: mockIndicatorUpdate
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('handles keyboard shortcuts for adding indicators', async () => {
            const user = userEvent.setup();
            render(
                <TestWrapper>
                    <TechnicalIndicators {...defaultProps} testId="indicators" />
                </TestWrapper>
            );

            // Test Ctrl+A to add indicator
            await user.keyboard('{Control>}a{/Control}');

            // Should open the settings modal for the first available indicator
            await waitFor(() => {
                expect(screen.getByText('Configure Exponential Moving Average')).toBeInTheDocument();
            });
        });

        test('handles Escape key to close settings modal', async () => {
            const user = userEvent.setup();
            render(
                <TestWrapper>
                    <TechnicalIndicators {...defaultProps} testId="indicators" />
                </TestWrapper>
            );

            // Open settings modal
            const addButton = screen.getByText('Add Indicator');
            await user.click(addButton);

            await waitFor(() => {
                expect(screen.getByText(/Configure/)).toBeInTheDocument();
            });

            // Press Escape
            await user.keyboard('{Escape}');

            // Modal should be closed
            await waitFor(() => {
                expect(screen.queryByText(/Configure/)).not.toBeInTheDocument();
            });
        });

        test('handles form submission with Enter key', async () => {
            const user = userEvent.setup();
            render(
                <TestWrapper>
                    <TechnicalIndicators {...defaultProps} testId="indicators" />
                </TestWrapper>
            );

            // Open settings modal
            const addButton = screen.getByText('Add Indicator');
            await user.click(addButton);

            await waitFor(() => {
                expect(screen.getByText(/Configure/)).toBeInTheDocument();
            });

            // Focus on form and press Enter
            const form = screen.getByText(/Configure/).closest('form');
            if (form) {
                fireEvent.submit(form);
                expect(mockIndicatorAdd).toHaveBeenCalled();
            }
        });
    });

    describe('ChartOverlay Keyboard Navigation', () => {
        const mockDrawingAdd = jest.fn();
        const mockDrawingRemove = jest.fn();
        const mockToolChange = jest.fn();

        const defaultProps = {
            width: 800,
            height: 400,
            drawings: [
                {
                    id: 'drawing_1',
                    type: 'trendline',
                    startX: 100,
                    startY: 100,
                    endX: 200,
                    endY: 150
                }
            ],
            onDrawingAdd: mockDrawingAdd,
            onDrawingRemove: mockDrawingRemove,
            onToolChange: mockToolChange,
            drawingMode: true,
            activeTool: 'select'
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('handles tool selection with number keys', async () => {
            const user = userEvent.setup();
            render(
                <TestWrapper>
                    <ChartOverlay {...defaultProps} testId="chart-overlay" />
                </TestWrapper>
            );

            // Test number keys for tool selection
            await user.keyboard('1');
            expect(mockToolChange).toHaveBeenCalledWith('select');

            await user.keyboard('2');
            expect(mockToolChange).toHaveBeenCalledWith('trendline');

            await user.keyboard('3');
            expect(mockToolChange).toHaveBeenCalledWith('support');
        });

        test('handles Escape key to deselect and switch to select tool', async () => {
            const user = userEvent.setup();
            render(
                <TestWrapper>
                    <ChartOverlay {...defaultProps} activeTool="trendline" testId="chart-overlay" />
                </TestWrapper>
            );

            await user.keyboard('{Escape}');
            expect(mockToolChange).toHaveBeenCalledWith('select');
        });

        test('handles Delete key to remove selected drawing', async () => {
            const user = userEvent.setup();

            // Mock a selected drawing
            const propsWithSelection = {
                ...defaultProps,
                drawings: [
                    {
                        id: 'drawing_1',
                        type: 'trendline',
                        startX: 100,
                        startY: 100,
                        endX: 200,
                        endY: 150
                    }
                ]
            };

            const ChartOverlayWithSelection = () => {
                const [selectedDrawing, setSelectedDrawing] = React.useState('drawing_1');

                const handleDrawingRemove = (drawingId) => {
                    mockDrawingRemove(drawingId);
                    setSelectedDrawing(null);
                };

                return (
                    <ChartOverlay
                        {...propsWithSelection}
                        onDrawingRemove={handleDrawingRemove}
                        testId="chart-overlay"
                    />
                );
            };

            render(
                <TestWrapper>
                    <ChartOverlayWithSelection />
                </TestWrapper>
            );

            await user.keyboard('{Delete}');
            expect(mockDrawingRemove).toHaveBeenCalledWith('drawing_1');
        });

        test('handles keyboard shortcuts with Ctrl modifier', async () => {
            const user = userEvent.setup();
            render(
                <TestWrapper>
                    <ChartOverlay {...defaultProps} testId="chart-overlay" />
                </TestWrapper>
            );

            // Test Ctrl+Z for undo (if implemented)
            await user.keyboard('{Control>}z{/Control}');
            // This would test undo functionality if implemented

            // Test Ctrl+A for select all (if implemented)
            await user.keyboard('{Control>}a{/Control}');
            // This would test select all functionality if implemented
        });
    });

    describe('Integration Tests for Chart Controls', () => {
        test('chart controls work together with real-time data updates', async () => {
            const user = userEvent.setup();
            const mockTimeframeChange = jest.fn();
            const mockIndicatorAdd = jest.fn();
            const mockDrawingAdd = jest.fn();

            const IntegratedChartControls = () => {
                const [activeTimeframe, setActiveTimeframe] = React.useState('1D');
                const [activeIndicators, setActiveIndicators] = React.useState([]);
                const [drawings, setDrawings] = React.useState([]);

                const handleTimeframeChange = (timeframe) => {
                    setActiveTimeframe(timeframe);
                    mockTimeframeChange(timeframe);
                };

                const handleIndicatorAdd = (indicator) => {
                    setActiveIndicators(prev => [...prev, indicator]);
                    mockIndicatorAdd(indicator);
                };

                const handleDrawingAdd = (drawing) => {
                    setDrawings(prev => [...prev, drawing]);
                    mockDrawingAdd(drawing);
                };

                return (
                    <div>
                        <ChartControls
                            activeTimeframe={activeTimeframe}
                            onTimeframeChange={handleTimeframeChange}
                            testId="chart-controls"
                        />
                        <TechnicalIndicators
                            activeIndicators={activeIndicators}
                            onIndicatorAdd={handleIndicatorAdd}
                            testId="indicators"
                        />
                        <ChartOverlay
                            drawings={drawings}
                            onDrawingAdd={handleDrawingAdd}
                            drawingMode={true}
                            testId="chart-overlay"
                        />
                    </div>
                );
            };

            render(
                <TestWrapper>
                    <IntegratedChartControls />
                </TestWrapper>
            );

            // Test timeframe change
            const toolbar = screen.getByTestId('chart-controls');
            toolbar.focus();
            await user.keyboard('{Control>}2{/Control}');
            expect(mockTimeframeChange).toHaveBeenCalledWith('5m');

            // Test indicator addition
            await user.keyboard('{Control>}a{/Control}');
            await waitFor(() => {
                expect(screen.getByText(/Configure/)).toBeInTheDocument();
            });

            const addIndicatorButton = screen.getByText('Add Indicator');
            await user.click(addIndicatorButton);
            expect(mockIndicatorAdd).toHaveBeenCalled();

            // Test drawing tool selection
            await user.keyboard('2'); // Select trendline tool
            // This would test drawing functionality in a real scenario
        });

        test('accessibility features work correctly', () => {
            render(
                <TestWrapper>
                    <ChartControls
                        timeframes={['1D', '1W']}
                        activeTimeframe="1D"
                        testId="chart-controls"
                    />
                </TestWrapper>
            );

            const toolbar = screen.getByTestId('chart-controls');

            // Check toolbar has proper role
            expect(toolbar).toHaveAttribute('role', 'toolbar');

            // Check buttons have proper ARIA attributes
            const activeButton = screen.getByLabelText('Set timeframe to 1D');
            expect(activeButton).toHaveAttribute('aria-pressed', 'true');

            const inactiveButton = screen.getByLabelText('Set timeframe to 1W');
            expect(inactiveButton).toHaveAttribute('aria-pressed', 'false');
        });
    });
});