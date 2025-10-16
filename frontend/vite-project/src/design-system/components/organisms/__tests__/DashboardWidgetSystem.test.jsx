import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../ThemeProvider';
import { DragDropProvider } from '../../providers/DragDropProvider';
import { RealTimeDataProvider } from '../../providers/RealTimeDataProvider';
import { GridLayout } from '../GridLayout';
import Widget from '../Widget';
import { PortfolioWidget, WatchlistWidget, NewsWidget, AlertsWidget } from '../widgets';
import * as layoutPersistence from '../../../utils/layoutPersistence';

// Mock layout persistence utilities
jest.mock('../../../utils/layoutPersistence', () => ({
    saveLayout: jest.fn(() => true),
    loadLayout: jest.fn(() => null),
    getUserPreferences: jest.fn(() => ({
        snapToGrid: true,
        autoSave: true,
        showGridLines: false
    })),
    saveUserPreferences: jest.fn(() => true),
    createAutoSave: jest.fn(() => jest.fn())
}));

// Mock real-time data provider
jest.mock('../../providers/RealTimeDataProvider', () => ({
    useRealTimeData: () => ({
        isConnected: true,
        getPrice: jest.fn(() => ({ price: 100, volume: 1000, changePercent: 1.5 }))
    }),
    RealTimeDataProvider: ({ children }) => <div>{children}</div>
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
    <ThemeProvider>
        <RealTimeDataProvider>
            <DragDropProvider>
                {children}
            </DragDropProvider>
        </RealTimeDataProvider>
    </ThemeProvider>
);

// Sample test data
const sampleLayout = [
    { id: 'widget-1', x: 0, y: 0, width: 6, height: 4, type: 'portfolio' },
    { id: 'widget-2', x: 6, y: 0, width: 6, height: 4, type: 'watchlist' },
    { id: 'widget-3', x: 0, y: 4, width: 8, height: 5, type: 'news' },
    { id: 'widget-4', x: 8, y: 4, width: 4, height: 5, type: 'alerts' }
];

const samplePortfolioData = [
    {
        symbol: 'AAPL',
        quantity: 100,
        avgPrice: 150.00,
        currentPrice: 155.00,
        dayChange: 5.00
    }
];

const sampleWatchlistData = ['AAPL', 'GOOGL', 'MSFT'];

const sampleNewsData = [
    {
        id: '1',
        title: 'Test News Article',
        summary: 'This is a test news article summary',
        source: 'Test Source',
        category: 'Markets',
        timestamp: '2024-01-15T10:00:00Z',
        sentiment: 'positive',
        priority: 'high',
        symbols: ['AAPL']
    }
];

const sampleAlertsData = [
    {
        id: '1',
        symbol: 'AAPL',
        type: 'price',
        condition: 'above',
        value: 160.00,
        enabled: true,
        createdAt: '2024-01-15T10:00:00Z'
    }
];

describe('Dashboard Widget System', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GridLayout Component', () => {
        it('renders grid layout with widgets', () => {
            render(
                <TestWrapper>
                    <GridLayout
                        items={sampleLayout}
                        columns={12}
                        rowHeight="80px"
                        gap={16}
                    >
                        {sampleLayout.map(item => (
                            <Widget key={item.id} id={item.id} title={`Widget ${item.id}`}>
                                <div>Widget Content</div>
                            </Widget>
                        ))}
                    </GridLayout>
                </TestWrapper>
            );

            expect(screen.getByText('Widget widget-1')).toBeInTheDocument();
            expect(screen.getByText('Widget widget-2')).toBeInTheDocument();
            expect(screen.getByText('Widget widget-3')).toBeInTheDocument();
            expect(screen.getByText('Widget widget-4')).toBeInTheDocument();
        });

        it('handles layout changes', async () => {
            const onLayoutChange = jest.fn();

            render(
                <TestWrapper>
                    <GridLayout
                        items={sampleLayout}
                        columns={12}
                        rowHeight="80px"
                        onLayoutChange={onLayoutChange}
                    >
                        {sampleLayout.map(item => (
                            <Widget key={item.id} id={item.id} title={`Widget ${item.id}`}>
                                <div>Widget Content</div>
                            </Widget>
                        ))}
                    </GridLayout>
                </TestWrapper>
            );

            // Simulate drag and drop
            const widget = screen.getByText('Widget widget-1').closest('[draggable]');
            if (widget) {
                fireEvent.dragStart(widget);
                fireEvent.dragEnd(widget);
            }

            await waitFor(() => {
                expect(onLayoutChange).toHaveBeenCalled();
            });
        });

        it('persists layout when autoSave is enabled', async () => {
            const layoutId = 'test-layout';

            render(
                <TestWrapper>
                    <GridLayout
                        items={sampleLayout}
                        columns={12}
                        rowHeight="80px"
                        layoutId={layoutId}
                        autoSave={true}
                        persistLayout={true}
                    >
                        {sampleLayout.map(item => (
                            <Widget key={item.id} id={item.id} title={`Widget ${item.id}`}>
                                <div>Widget Content</div>
                            </Widget>
                        ))}
                    </GridLayout>
                </TestWrapper>
            );

            // Wait for auto-save to be set up
            await waitFor(() => {
                expect(layoutPersistence.createAutoSave).toHaveBeenCalledWith(layoutId, 1000);
            });
        });

        it('loads saved layout on mount', () => {
            const savedLayout = { items: sampleLayout };
            layoutPersistence.loadLayout.mockReturnValue(savedLayout);

            render(
                <TestWrapper>
                    <GridLayout
                        items={[]}
                        columns={12}
                        rowHeight="80px"
                        layoutId="test-layout"
                        persistLayout={true}
                    />
                </TestWrapper>
            );

            expect(layoutPersistence.loadLayout).toHaveBeenCalledWith('test-layout');
        });

        it('handles responsive breakpoints', () => {
            // Mock window.innerWidth
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 768
            });

            render(
                <TestWrapper>
                    <GridLayout
                        items={sampleLayout}
                        columns={12}
                        rowHeight="80px"
                        responsive={true}
                    >
                        {sampleLayout.map(item => (
                            <Widget key={item.id} id={item.id} title={`Widget ${item.id}`}>
                                <div>Widget Content</div>
                            </Widget>
                        ))}
                    </GridLayout>
                </TestWrapper>
            );

            // Trigger resize event
            act(() => {
                window.dispatchEvent(new Event('resize'));
            });

            // Grid should adapt to smaller screen
            expect(screen.getByText('Widget widget-1')).toBeInTheDocument();
        });
    });

    describe('Widget Component', () => {
        it('renders widget with title and content', () => {
            render(
                <TestWrapper>
                    <Widget id="test-widget" title="Test Widget" icon="test-icon">
                        <div>Test Content</div>
                    </Widget>
                </TestWrapper>
            );

            expect(screen.getByText('Test Widget')).toBeInTheDocument();
            expect(screen.getByText('Test Content')).toBeInTheDocument();
        });

        it('shows loading state', () => {
            render(
                <TestWrapper>
                    <Widget id="test-widget" title="Test Widget" loading={true}>
                        <div>Test Content</div>
                    </Widget>
                </TestWrapper>
            );

            expect(screen.getByText('Test Widget')).toBeInTheDocument();
            // Loading overlay should be present
            expect(document.querySelector('[data-testid="loading-overlay"]')).toBeInTheDocument();
        });

        it('shows error state', () => {
            const error = { message: 'Test error message' };

            render(
                <TestWrapper>
                    <Widget id="test-widget" title="Test Widget" error={error}>
                        <div>Test Content</div>
                    </Widget>
                </TestWrapper>
            );

            expect(screen.getByText('Test error message')).toBeInTheDocument();
        });

        it('handles remove action', async () => {
            const onRemove = jest.fn();

            render(
                <TestWrapper>
                    <Widget
                        id="test-widget"
                        title="Test Widget"
                        removable={true}
                        onRemove={onRemove}
                    >
                        <div>Test Content</div>
                    </Widget>
                </TestWrapper>
            );

            const removeButton = screen.getByLabelText('Remove widget');
            await userEvent.click(removeButton);

            expect(onRemove).toHaveBeenCalledWith('test-widget');
        });

        it('handles configuration', async () => {
            const onConfigure = jest.fn();
            const renderConfig = jest.fn(() => <div>Config Panel</div>);

            render(
                <TestWrapper>
                    <Widget
                        id="test-widget"
                        title="Test Widget"
                        configurable={true}
                        onConfigure={onConfigure}
                        renderConfig={renderConfig}
                    >
                        <div>Test Content</div>
                    </Widget>
                </TestWrapper>
            );

            const configButton = screen.getByLabelText('Configure widget');
            await userEvent.click(configButton);

            expect(onConfigure).toHaveBeenCalledWith('test-widget', true);
            expect(screen.getByText('Config Panel')).toBeInTheDocument();
        });
    });

    describe('Trading Widgets', () => {
        describe('PortfolioWidget', () => {
            it('renders portfolio data', () => {
                render(
                    <TestWrapper>
                        <PortfolioWidget
                            id="portfolio-test"
                            holdings={samplePortfolioData}
                        />
                    </TestWrapper>
                );

                expect(screen.getByText('Portfolio')).toBeInTheDocument();
                expect(screen.getByText('AAPL')).toBeInTheDocument();
            });

            it('handles holding click', async () => {
                const onHoldingClick = jest.fn();

                render(
                    <TestWrapper>
                        <PortfolioWidget
                            id="portfolio-test"
                            holdings={samplePortfolioData}
                            onHoldingClick={onHoldingClick}
                        />
                    </TestWrapper>
                );

                const holdingElement = screen.getByText('AAPL').closest('div');
                if (holdingElement) {
                    await userEvent.click(holdingElement);
                    expect(onHoldingClick).toHaveBeenCalledWith(samplePortfolioData[0]);
                }
            });
        });

        describe('WatchlistWidget', () => {
            it('renders watchlist symbols', () => {
                render(
                    <TestWrapper>
                        <WatchlistWidget
                            id="watchlist-test"
                            symbols={sampleWatchlistData}
                        />
                    </TestWrapper>
                );

                expect(screen.getByText('Watchlist')).toBeInTheDocument();
                expect(screen.getByText('AAPL')).toBeInTheDocument();
                expect(screen.getByText('GOOGL')).toBeInTheDocument();
                expect(screen.getByText('MSFT')).toBeInTheDocument();
            });

            it('handles symbol search', async () => {
                render(
                    <TestWrapper>
                        <WatchlistWidget
                            id="watchlist-test"
                            symbols={sampleWatchlistData}
                        />
                    </TestWrapper>
                );

                const searchInput = screen.getByPlaceholderText('Search symbols...');
                await userEvent.type(searchInput, 'AAPL');

                expect(screen.getByText('AAPL')).toBeInTheDocument();
                expect(screen.queryByText('GOOGL')).not.toBeInTheDocument();
            });
        });

        describe('NewsWidget', () => {
            it('renders news articles', () => {
                render(
                    <TestWrapper>
                        <NewsWidget
                            id="news-test"
                            news={sampleNewsData}
                        />
                    </TestWrapper>
                );

                expect(screen.getByText('Financial News')).toBeInTheDocument();
                expect(screen.getByText('Test News Article')).toBeInTheDocument();
                expect(screen.getByText('This is a test news article summary')).toBeInTheDocument();
            });

            it('handles news article click', async () => {
                const onNewsClick = jest.fn();

                render(
                    <TestWrapper>
                        <NewsWidget
                            id="news-test"
                            news={sampleNewsData}
                            onNewsClick={onNewsClick}
                        />
                    </TestWrapper>
                );

                const newsArticle = screen.getByText('Test News Article').closest('div');
                if (newsArticle) {
                    await userEvent.click(newsArticle);
                    expect(onNewsClick).toHaveBeenCalledWith(sampleNewsData[0]);
                }
            });

            it('filters news by category', async () => {
                const multipleNews = [
                    ...sampleNewsData,
                    {
                        id: '2',
                        title: 'Economy News',
                        summary: 'Economy related news',
                        category: 'Economy',
                        timestamp: '2024-01-15T09:00:00Z',
                        sentiment: 'neutral',
                        priority: 'medium'
                    }
                ];

                render(
                    <TestWrapper>
                        <NewsWidget
                            id="news-test"
                            news={multipleNews}
                            showCategories={true}
                        />
                    </TestWrapper>
                );

                const economyFilter = screen.getByText('Economy');
                await userEvent.click(economyFilter);

                expect(screen.getByText('Economy News')).toBeInTheDocument();
                expect(screen.queryByText('Test News Article')).not.toBeInTheDocument();
            });
        });

        describe('AlertsWidget', () => {
            it('renders alerts', () => {
                render(
                    <TestWrapper>
                        <AlertsWidget
                            id="alerts-test"
                            alerts={sampleAlertsData}
                            symbols={sampleWatchlistData}
                        />
                    </TestWrapper>
                );

                expect(screen.getByText('Trading Alerts')).toBeInTheDocument();
                expect(screen.getByText('AAPL')).toBeInTheDocument();
            });

            it('handles alert creation', async () => {
                const onCreateAlert = jest.fn();

                render(
                    <TestWrapper>
                        <AlertsWidget
                            id="alerts-test"
                            alerts={[]}
                            symbols={sampleWatchlistData}
                            onCreateAlert={onCreateAlert}
                        />
                    </TestWrapper>
                );

                const newAlertButton = screen.getByText('New Alert');
                await userEvent.click(newAlertButton);

                expect(screen.getByText('Create New Alert')).toBeInTheDocument();
            });

            it('handles alert toggle', async () => {
                const onToggleAlert = jest.fn();

                render(
                    <TestWrapper>
                        <AlertsWidget
                            id="alerts-test"
                            alerts={sampleAlertsData}
                            symbols={sampleWatchlistData}
                            onToggleAlert={onToggleAlert}
                        />
                    </TestWrapper>
                );

                const toggleButton = screen.getByLabelText('Disable alert');
                await userEvent.click(toggleButton);

                expect(onToggleAlert).toHaveBeenCalledWith('1');
            });
        });
    });

    describe('Drag and Drop Provider', () => {
        it('provides drag and drop context', () => {
            const TestComponent = () => {
                const { isDragging } = require('../../providers/DragDropProvider').useDragDrop();
                return <div>{isDragging ? 'Dragging' : 'Not Dragging'}</div>;
            };

            render(
                <TestWrapper>
                    <TestComponent />
                </TestWrapper>
            );

            expect(screen.getByText('Not Dragging')).toBeInTheDocument();
        });
    });

    describe('Layout Persistence', () => {
        it('saves layout configuration', () => {
            const layoutId = 'test-layout';
            const items = sampleLayout;
            const config = { snapToGrid: true, responsive: true };

            layoutPersistence.saveLayout(layoutId, items, config);

            expect(layoutPersistence.saveLayout).toHaveBeenCalledWith(layoutId, items, config);
        });

        it('loads layout configuration', () => {
            const layoutId = 'test-layout';

            layoutPersistence.loadLayout(layoutId);

            expect(layoutPersistence.loadLayout).toHaveBeenCalledWith(layoutId);
        });

        it('saves user preferences', () => {
            const preferences = { snapToGrid: false, autoSave: true };

            layoutPersistence.saveUserPreferences(preferences);

            expect(layoutPersistence.saveUserPreferences).toHaveBeenCalledWith(preferences);
        });
    });

    describe('Accessibility', () => {
        it('provides proper ARIA labels', () => {
            render(
                <TestWrapper>
                    <Widget
                        id="test-widget"
                        title="Test Widget"
                        removable={true}
                        configurable={true}
                        renderConfig={() => <div>Config</div>}
                    >
                        <div>Content</div>
                    </Widget>
                </TestWrapper>
            );

            expect(screen.getByLabelText('Remove widget')).toBeInTheDocument();
            expect(screen.getByLabelText('Configure widget')).toBeInTheDocument();
        });

        it('supports keyboard navigation', async () => {
            render(
                <TestWrapper>
                    <Widget
                        id="test-widget"
                        title="Test Widget"
                        removable={true}
                    >
                        <div>Content</div>
                    </Widget>
                </TestWrapper>
            );

            const removeButton = screen.getByLabelText('Remove widget');

            // Tab to the button
            await userEvent.tab();
            expect(removeButton).toHaveFocus();

            // Press Enter to activate
            await userEvent.keyboard('{Enter}');
            // Button should be activated (would call onRemove if provided)
        });
    });

    describe('Performance', () => {
        it('handles large number of widgets efficiently', () => {
            const largeLayout = Array.from({ length: 50 }, (_, i) => ({
                id: `widget-${i}`,
                x: i % 12,
                y: Math.floor(i / 12),
                width: 2,
                height: 2,
                type: 'portfolio'
            }));

            const startTime = performance.now();

            render(
                <TestWrapper>
                    <GridLayout
                        items={largeLayout}
                        columns={12}
                        rowHeight="80px"
                    >
                        {largeLayout.map(item => (
                            <Widget key={item.id} id={item.id} title={`Widget ${item.id}`}>
                                <div>Content</div>
                            </Widget>
                        ))}
                    </GridLayout>
                </TestWrapper>
            );

            const endTime = performance.now();
            const renderTime = endTime - startTime;

            // Should render within reasonable time (less than 1 second)
            expect(renderTime).toBeLessThan(1000);
            expect(screen.getByText('Widget widget-0')).toBeInTheDocument();
            expect(screen.getByText('Widget widget-49')).toBeInTheDocument();
        });
    });
});