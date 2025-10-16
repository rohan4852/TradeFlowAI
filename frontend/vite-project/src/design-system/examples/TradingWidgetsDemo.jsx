import React, { useState, useEffect } from 'react';
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

const DemoContainer = styled.div`
  padding: ${props => props.theme.spacing[4]};
  min-height: 100vh;
  background: ${props => props.theme.color.background.primary};
`;

const DemoHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]};
  text-align: center;
`;

const DemoTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.color.text.primary};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const DemoDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.color.text.secondary};
  max-width: 600px;
  margin: 0 auto;
`;

/**
 * TradingWidgetsDemo Component
 * Demonstrates all specialized trading widgets in a grid layout
 */
const TradingWidgetsDemo = () => {
    // Sample data
    const [portfolioHoldings, setPortfolioHoldings] = useState([
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
        },
        {
            symbol: 'MSFT',
            quantity: 75,
            avgCost: 380.00,
            currentPrice: 385.00,
            dayChange: 5.00,
            dayChangePercent: 1.32
        },
        {
            symbol: 'TSLA',
            quantity: 25,
            avgCost: 220.00,
            currentPrice: 210.00,
            dayChange: -10.00,
            dayChangePercent: -4.55
        }
    ]);

    const [watchlistSymbols, setWatchlistSymbols] = useState([
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
        },
        {
            id: '3',
            symbol: 'NVDA',
            type: 'volume',
            condition: 'above',
            value: 50000000,
            message: 'High volume alert',
            enabled: false,
            createdAt: '2024-01-15T09:00:00Z'
        }
    ]);

    const [news, setNews] = useState([
        {
            id: '1',
            title: 'Apple Reports Record Q4 Earnings, Beats Expectations',
            summary: 'Apple Inc. reported better than expected earnings for Q4 2024, driven by strong iPhone sales and services revenue growth. The company also announced a new share buyback program.',
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
            summary: 'Federal Reserve officials indicated they may consider interest rate cuts later this year if inflation continues to moderate and economic growth slows.',
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
            summary: 'Tesla reported Q4 vehicle deliveries that fell short of Wall Street expectations, citing production challenges and supply chain issues.',
            source: 'CNBC',
            category: 'Earnings',
            timestamp: '2024-01-15T09:15:00Z',
            sentiment: 'negative',
            priority: 'medium',
            symbols: ['TSLA'],
            url: 'https://example.com/news/3'
        },
        {
            id: '4',
            title: 'Microsoft Azure Revenue Growth Accelerates',
            summary: 'Microsoft reported accelerating growth in its Azure cloud computing division, with revenue up 30% year-over-year in the latest quarter.',
            source: 'Wall Street Journal',
            category: 'Earnings',
            timestamp: '2024-01-15T08:30:00Z',
            sentiment: 'positive',
            priority: 'medium',
            symbols: ['MSFT'],
            url: 'https://example.com/news/4'
        },
        {
            id: '5',
            title: 'Cryptocurrency Market Shows Signs of Recovery',
            summary: 'Major cryptocurrencies including Bitcoin and Ethereum have gained momentum this week, with institutional investors showing renewed interest.',
            source: 'CoinDesk',
            category: 'Crypto',
            timestamp: '2024-01-15T08:00:00Z',
            sentiment: 'positive',
            priority: 'low',
            symbols: ['BTC', 'ETH'],
            url: 'https://example.com/news/5'
        }
    ]);

    // Widget event handlers
    const handleHoldingClick = (holding) => {
        console.log('Holding clicked:', holding);
    };

    const handleAddHolding = () => {
        console.log('Add holding requested');
    };

    const handleRemoveHolding = (symbol) => {
        setPortfolioHoldings(prev => prev.filter(h => h.symbol !== symbol));
    };

    const handleSymbolClick = (symbol) => {
        console.log('Symbol clicked:', symbol);
    };

    const handleAddSymbol = (symbol) => {
        if (!watchlistSymbols.includes(symbol)) {
            setWatchlistSymbols(prev => [...prev, symbol]);
        }
    };

    const handleRemoveSymbol = (symbol) => {
        setWatchlistSymbols(prev => prev.filter(s => s !== symbol));
    };

    const handleSetAlert = (symbol, price) => {
        const newAlert = {
            id: Date.now().toString(),
            symbol,
            type: 'price',
            condition: 'above',
            value: price,
            message: `Price alert for ${symbol}`,
            enabled: true,
            createdAt: new Date().toISOString()
        };
        setAlerts(prev => [...prev, newAlert]);
    };

    const handleRemoveAlert = (symbol) => {
        setAlerts(prev => prev.filter(a => a.symbol !== symbol));
    };

    const handleNewsClick = (article) => {
        console.log('News clicked:', article);
        window.open(article.url, '_blank');
    };

    const handleRefreshNews = () => {
        console.log('Refresh news requested');
    };

    const handleCreateAlert = (alert) => {
        setAlerts(prev => [...prev, alert]);
    };

    const handleUpdateAlert = (alert) => {
        console.log('Update alert:', alert);
    };

    const handleDeleteAlert = (alertId) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
    };

    const handleToggleAlert = (alertId) => {
        setAlerts(prev => prev.map(a =>
            a.id === alertId ? { ...a, enabled: !a.enabled } : a
        ));
    };

    const handleAlertTriggered = (alert, priceData) => {
        console.log('Alert triggered:', alert, priceData);
        // In a real app, you might show a notification here
    };

    // Grid layout configuration
    const defaultLayout = [
        { i: 'portfolio', x: 0, y: 0, w: 6, h: 8 },
        { i: 'watchlist', x: 6, y: 0, w: 6, h: 8 },
        { i: 'news', x: 0, y: 8, w: 8, h: 10 },
        { i: 'alerts', x: 8, y: 8, w: 4, h: 10 }
    ];

    return (
        <ThemeProvider>
            <RealTimeDataProvider>
                <DragDropProvider>
                    <DemoContainer>
                        <DemoHeader>
                            <DemoTitle>Trading Widgets Demo</DemoTitle>
                            <DemoDescription>
                                Interactive demonstration of specialized trading widgets including portfolio management,
                                watchlist monitoring, financial news, and customizable alerts. All widgets support
                                real-time data updates and are fully customizable.
                            </DemoDescription>
                        </DemoHeader>

                        <GridLayout
                            layout={defaultLayout}
                            cols={12}
                            rowHeight={60}
                            margin={[16, 16]}
                            containerPadding={[0, 0]}
                            isDraggable={true}
                            isResizable={true}
                        >
                            <div key="portfolio">
                                <PortfolioWidget
                                    id="portfolio-demo"
                                    title="Portfolio Overview"
                                    holdings={portfolioHoldings}
                                    realTime={true}
                                    showChart={true}
                                    showHoldings={true}
                                    onHoldingClick={handleHoldingClick}
                                    onAddHolding={handleAddHolding}
                                    onRemoveHolding={handleRemoveHolding}
                                />
                            </div>

                            <div key="watchlist">
                                <WatchlistWidget
                                    id="watchlist-demo"
                                    title="Market Watchlist"
                                    symbols={watchlistSymbols}
                                    alerts={alerts}
                                    realTime={true}
                                    showAlerts={true}
                                    onSymbolClick={handleSymbolClick}
                                    onAddSymbol={handleAddSymbol}
                                    onRemoveSymbol={handleRemoveSymbol}
                                    onSetAlert={handleSetAlert}
                                    onRemoveAlert={handleRemoveAlert}
                                />
                            </div>

                            <div key="news">
                                <NewsWidget
                                    id="news-demo"
                                    title="Financial News Feed"
                                    news={news}
                                    loading={false}
                                    categories={['All', 'Markets', 'Earnings', 'Economy', 'Crypto', 'Politics']}
                                    realTime={true}
                                    showSentiment={true}
                                    showCategories={true}
                                    maxItems={20}
                                    onNewsClick={handleNewsClick}
                                    onRefresh={handleRefreshNews}
                                />
                            </div>

                            <div key="alerts">
                                <AlertsWidget
                                    id="alerts-demo"
                                    title="Price Alerts"
                                    alerts={alerts}
                                    symbols={watchlistSymbols}
                                    realTime={true}
                                    onCreateAlert={handleCreateAlert}
                                    onUpdateAlert={handleUpdateAlert}
                                    onDeleteAlert={handleDeleteAlert}
                                    onToggleAlert={handleToggleAlert}
                                    onAlertTriggered={handleAlertTriggered}
                                />
                            </div>
                        </GridLayout>
                    </DemoContainer>
                </DragDropProvider>
            </RealTimeDataProvider>
        </ThemeProvider>
    );
};

export default TradingWidgetsDemo;