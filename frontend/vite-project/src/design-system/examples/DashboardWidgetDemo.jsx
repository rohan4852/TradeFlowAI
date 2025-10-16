import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { ThemeProvider } from '../ThemeProvider';
import { RealTimeDataProvider } from '../components/providers/RealTimeDataProvider';
import { DragDropProvider } from '../components/providers/DragDropProvider';
import { GridLayout } from '../components/organisms';
import {
    PortfolioWidget,
    WatchlistWidget,
    NewsWidget,
    AlertsWidget
} from '../components/organisms/widgets';
import { Button, Icon, Label } from '../components/atoms';
import { saveLayout, loadLayout, getUserPreferences, saveUserPreferences } from '../utils/layoutPersistence';

const DemoContainer = styled.div`
  padding: ${props => props.theme.spacing[4]};
  min-height: 100vh;
  background: ${props => props.theme.color.background.primary};
`;

const DemoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[6]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.color.background.secondary};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.boxShadow.sm};
`;

const DemoTitle = styled.div`
  h1 {
    font-size: ${props => props.theme.typography.fontSize['2xl']};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    color: ${props => props.theme.color.text.primary};
    margin: 0 0 ${props => props.theme.spacing[1]} 0;
  }
  
  p {
    font-size: ${props => props.theme.typography.fontSize.md};
    color: ${props => props.theme.color.text.secondary};
    margin: 0;
  }
`;

const DemoControls = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  align-items: center;
`;

const LayoutControls = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.color.background.secondary};
  border-radius: ${props => props.theme.borderRadius.md};
  align-items: center;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: ${props => props.connected ? props.theme.color.success[50] : props.theme.color.error[50]};
  color: ${props => props.connected ? props.theme.color.success[700] : props.theme.color.error[700]};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

/**
 * DashboardWidgetDemo Component
 * Complete demonstration of the drag-and-drop widget framework
 */
const DashboardWidgetDemo = () => {
    // Layout state
    const [layout, setLayout] = useState([]);
    const [layoutId, setLayoutId] = useState('dashboard-demo');
    const [isGridLinesVisible, setIsGridLinesVisible] = useState(false);
    const [snapToGrid, setSnapToGrid] = useState(true);
    const [autoSave, setAutoSave] = useState(true);

    // Sample data
    const [portfolioHoldings] = useState([
        {
            symbol: 'AAPL',
            quantity: 100,
            avgPrice: 150.00,
            currentPrice: 155.00,
            dayChange: 5.00,
            priceHistory: Array.from({ length: 20 }, (_, i) => 150 + Math.sin(i * 0.3) * 10)
        },
        {
            symbol: 'GOOGL',
            quantity: 50,
            avgPrice: 2800.00,
            currentPrice: 2750.00,
            dayChange: -50.00,
            priceHistory: Array.from({ length: 20 }, (_, i) => 2800 + Math.cos(i * 0.2) * 100)
        },
        {
            symbol: 'MSFT',
            quantity: 75,
            avgPrice: 380.00,
            currentPrice: 385.00,
            dayChange: 5.00,
            priceHistory: Array.from({ length: 20 }, (_, i) => 380 + Math.sin(i * 0.4) * 15)
        },
        {
            symbol: 'TSLA',
            quantity: 25,
            avgPrice: 220.00,
            currentPrice: 210.00,
            dayChange: -10.00,
            priceHistory: Array.from({ length: 20 }, (_, i) => 220 + Math.cos(i * 0.5) * 25)
        }
    ]);

    const [watchlistSymbols] = useState([
        'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'NFLX'
    ]);

    const [alerts, setAlerts] = useState([
        {
            id: '1',
            symbol: 'AAPL',
            type: 'price',
            condition: 'above',
            value: 160.00,
            message: 'AAPL breakout alert',
            enabled: true,
            createdAt: '2024-01-15T10:00:00Z'
        },
        {
            id: '2',
            symbol: 'TSLA',
            type: 'price',
            condition: 'below',
            value: 200.00,
            message: 'TSLA support level',
            enabled: true,
            createdAt: '2024-01-15T09:30:00Z'
        }
    ]);

    const [news] = useState([
        {
            id: '1',
            title: 'Apple Reports Record Q4 Earnings, Beats Expectations',
            summary: 'Apple Inc. reported better than expected earnings for Q4 2024, driven by strong iPhone sales and services revenue growth.',
            source: 'Reuters',
            category: 'Earnings',
            timestamp: '2024-01-15T10:30:00Z',
            sentiment: 'positive',
            priority: 'high',
            symbols: ['AAPL'],
            url: 'https://example.com/news/1'
        },
        {
            id: '2',
            title: 'Federal Reserve Signals Potential Rate Cuts in 2024',
            summary: 'Federal Reserve officials indicated they may consider interest rate cuts later this year if inflation continues to moderate.',
            source: 'Bloomberg',
            category: 'Economy',
            timestamp: '2024-01-15T09:45:00Z',
            sentiment: 'neutral',
            priority: 'high',
            symbols: ['SPY', 'QQQ'],
            url: 'https://example.com/news/2'
        },
        {
            id: '3',
            title: 'Tesla Deliveries Miss Analyst Estimates for Q4',
            summary: 'Tesla reported Q4 vehicle deliveries that fell short of Wall Street expectations, citing production challenges.',
            source: 'CNBC',
            category: 'Earnings',
            timestamp: '2024-01-15T09:15:00Z',
            sentiment: 'negative',
            priority: 'medium',
            symbols: ['TSLA'],
            url: 'https://example.com/news/3'
        }
    ]);

    // Default layout configuration
    const defaultLayout = [
        { id: 'portfolio', x: 0, y: 0, width: 6, height: 4, type: 'portfolio' },
        { id: 'watchlist', x: 6, y: 0, width: 6, height: 4, type: 'watchlist' },
        { id: 'news', x: 0, y: 4, width: 8, height: 5, type: 'news' },
        { id: 'alerts', x: 8, y: 4, width: 4, height: 5, type: 'alerts' }
    ];

    // Load saved layout on mount
    useEffect(() => {
        const savedLayout = loadLayout(layoutId);
        if (savedLayout && savedLayout.items) {
            setLayout(savedLayout.items);
        } else {
            setLayout(defaultLayout);
        }

        const preferences = getUserPreferences();
        setSnapToGrid(preferences.snapToGrid !== false);
        setAutoSave(preferences.autoSave !== false);
        setIsGridLinesVisible(preferences.showGridLines === true);
    }, [layoutId]);

    // Handle layout change
    const handleLayoutChange = useCallback((newLayout) => {
        setLayout(newLayout);

        if (autoSave) {
            saveLayout(layoutId, newLayout, {
                snapToGrid,
                showGridLines: isGridLinesVisible,
                responsive: true
            });
        }
    }, [layoutId, autoSave, snapToGrid, isGridLinesVisible]);

    // Handle widget actions
    const handleHoldingClick = useCallback((holding) => {
        console.log('Holding clicked:', holding);
    }, []);

    const handleSymbolClick = useCallback((symbol) => {
        console.log('Symbol clicked:', symbol);
    }, []);

    const handleNewsClick = useCallback((article) => {
        console.log('News clicked:', article);
        window.open(article.url, '_blank');
    }, []);

    const handleCreateAlert = useCallback((alert) => {
        setAlerts(prev => [...prev, alert]);
    }, []);

    const handleDeleteAlert = useCallback((alertId) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
    }, []);

    const handleToggleAlert = useCallback((alertId) => {
        setAlerts(prev => prev.map(a =>
            a.id === alertId ? { ...a, enabled: !a.enabled } : a
        ));
    }, []);

    // Layout presets
    const handleLoadPreset = useCallback((preset) => {
        let presetLayout;
        switch (preset) {
            case 'trading':
                presetLayout = [
                    { id: 'watchlist', x: 0, y: 0, width: 8, height: 6, type: 'watchlist' },
                    { id: 'alerts', x: 8, y: 0, width: 4, height: 6, type: 'alerts' },
                    { id: 'portfolio', x: 0, y: 6, width: 6, height: 4, type: 'portfolio' },
                    { id: 'news', x: 6, y: 6, width: 6, height: 4, type: 'news' }
                ];
                break;
            case 'analysis':
                presetLayout = [
                    { id: 'news', x: 0, y: 0, width: 12, height: 5, type: 'news' },
                    { id: 'portfolio', x: 0, y: 5, width: 4, height: 5, type: 'portfolio' },
                    { id: 'watchlist', x: 4, y: 5, width: 4, height: 5, type: 'watchlist' },
                    { id: 'alerts', x: 8, y: 5, width: 4, height: 5, type: 'alerts' }
                ];
                break;
            case 'monitoring':
                presetLayout = [
                    { id: 'alerts', x: 0, y: 0, width: 6, height: 5, type: 'alerts' },
                    { id: 'watchlist', x: 6, y: 0, width: 6, height: 5, type: 'watchlist' },
                    { id: 'portfolio', x: 0, y: 5, width: 6, height: 5, type: 'portfolio' },
                    { id: 'news', x: 6, y: 5, width: 6, height: 5, type: 'news' }
                ];
                break;
            default:
                presetLayout = defaultLayout;
        }
        setLayout(presetLayout);
        handleLayoutChange(presetLayout);
    }, [handleLayoutChange]);

    // Save current layout
    const handleSaveLayout = useCallback(() => {
        const success = saveLayout(layoutId, layout, {
            snapToGrid,
            showGridLines: isGridLinesVisible,
            responsive: true
        });

        if (success) {
            console.log('Layout saved successfully');
        }
    }, [layoutId, layout, snapToGrid, isGridLinesVisible]);

    // Reset to default layout
    const handleResetLayout = useCallback(() => {
        setLayout(defaultLayout);
        handleLayoutChange(defaultLayout);
    }, [handleLayoutChange]);

    // Update preferences
    const handlePreferenceChange = useCallback((key, value) => {
        const preferences = getUserPreferences();
        const updated = { ...preferences, [key]: value };
        saveUserPreferences(updated);

        switch (key) {
            case 'snapToGrid':
                setSnapToGrid(value);
                break;
            case 'showGridLines':
                setIsGridLinesVisible(value);
                break;
            case 'autoSave':
                setAutoSave(value);
                break;
        }
    }, []);

    // Render widget based on type
    const renderWidget = useCallback((item) => {
        const commonProps = {
            key: item.id,
            id: item.id,
            draggable: true,
            resizable: true,
            removable: true
        };

        switch (item.type) {
            case 'portfolio':
                return (
                    <PortfolioWidget
                        {...commonProps}
                        title="Portfolio Overview"
                        holdings={portfolioHoldings}
                        showMiniCharts={true}
                        onHoldingClick={handleHoldingClick}
                    />
                );
            case 'watchlist':
                return (
                    <WatchlistWidget
                        {...commonProps}
                        title="Market Watchlist"
                        symbols={watchlistSymbols}
                        alerts={alerts}
                        showAlerts={true}
                        showVolume={true}
                        onSymbolClick={handleSymbolClick}
                    />
                );
            case 'news':
                return (
                    <NewsWidget
                        {...commonProps}
                        title="Financial News"
                        news={news}
                        showSentiment={true}
                        showCategories={true}
                        maxItems={10}
                        onNewsClick={handleNewsClick}
                    />
                );
            case 'alerts':
                return (
                    <AlertsWidget
                        {...commonProps}
                        title="Trading Alerts"
                        alerts={alerts}
                        symbols={watchlistSymbols}
                        onCreateAlert={handleCreateAlert}
                        onDeleteAlert={handleDeleteAlert}
                        onToggleAlert={handleToggleAlert}
                    />
                );
            default:
                return null;
        }
    }, [portfolioHoldings, watchlistSymbols, alerts, news, handleHoldingClick, handleSymbolClick, handleNewsClick, handleCreateAlert, handleDeleteAlert, handleToggleAlert]);

    return (
        <ThemeProvider>
            <RealTimeDataProvider>
                <DragDropProvider>
                    <DemoContainer>
                        {/* Demo Header */}
                        <DemoHeader>
                            <DemoTitle>
                                <h1>Dashboard Widget System</h1>
                                <p>Drag, resize, and customize your trading dashboard</p>
                            </DemoTitle>
                            <DemoControls>
                                <StatusIndicator connected={true}>
                                    <Icon name="wifi" size="sm" />
                                    Connected
                                </StatusIndicator>
                            </DemoControls>
                        </DemoHeader>

                        {/* Layout Controls */}
                        <LayoutControls>
                            <Label size="sm" weight="semibold">Layout:</Label>

                            <Button size="sm" variant="outline" onClick={() => handleLoadPreset('default')}>
                                Default
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleLoadPreset('trading')}>
                                Trading Focus
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleLoadPreset('analysis')}>
                                Analysis
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleLoadPreset('monitoring')}>
                                Monitoring
                            </Button>

                            <div style={{ width: '1px', height: '20px', background: '#ccc', margin: '0 8px' }} />

                            <Button size="sm" variant="primary" onClick={handleSaveLayout}>
                                <Icon name="save" size="xs" />
                                Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleResetLayout}>
                                <Icon name="refresh-cw" size="xs" />
                                Reset
                            </Button>

                            <div style={{ width: '1px', height: '20px', background: '#ccc', margin: '0 8px' }} />

                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                    type="checkbox"
                                    checked={snapToGrid}
                                    onChange={(e) => handlePreferenceChange('snapToGrid', e.target.checked)}
                                />
                                <Label size="xs">Snap to Grid</Label>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                    type="checkbox"
                                    checked={isGridLinesVisible}
                                    onChange={(e) => handlePreferenceChange('showGridLines', e.target.checked)}
                                />
                                <Label size="xs">Grid Lines</Label>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                    type="checkbox"
                                    checked={autoSave}
                                    onChange={(e) => handlePreferenceChange('autoSave', e.target.checked)}
                                />
                                <Label size="xs">Auto Save</Label>
                            </label>
                        </LayoutControls>

                        {/* Grid Layout with Widgets */}
                        <GridLayout
                            items={layout}
                            columns={12}
                            rowHeight="80px"
                            gap={16}
                            layoutId={layoutId}
                            onLayoutChange={handleLayoutChange}
                            enableDrag={true}
                            enableResize={true}
                            enableRemove={true}
                            snapToGrid={snapToGrid}
                            showGridLines={isGridLinesVisible}
                            autoSave={autoSave}
                            persistLayout={true}
                        >
                            {layout.map(item => renderWidget(item))}
                        </GridLayout>

                        {/* Instructions */}
                        <div style={{
                            marginTop: '32px',
                            padding: '16px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: '#374151'
                        }}>
                            <strong>Instructions:</strong>
                            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                <li>Drag widgets by their title bars to reposition them</li>
                                <li>Resize widgets using the handles in the bottom-right corners</li>
                                <li>Remove widgets using the X button in the top-right corner</li>
                                <li>Configure widgets using the settings button</li>
                                <li>Try different layout presets and save your favorites</li>
                            </ul>
                        </div>
                    </DemoContainer>
                </DragDropProvider>
            </RealTimeDataProvider>
        </ThemeProvider>
    );
};

export default DashboardWidgetDemo;