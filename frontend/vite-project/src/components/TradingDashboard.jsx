/**
 * Next-Generation AI Trading Dashboard
 * Superior to TradingView + Walbi with advanced AI features
 * Refactored to use the new design system components
 */
import React, { useState, useEffect, useRef } from 'react';
import {
    marketDataAPI,
    predictionsAPI,
    streamingAPI,
    wsManager,
    computerVisionAPI,
    brokerAPI
} from '../services/api';
import {
    ThemeProvider,
    GridLayout,
    Widget,
    CandlestickChart,
    OrderBook,
    RecommendationPanel,
    PredictionCard,
    Button,
    Input,
    Icon,
    RealTimeDataProvider,
    useRealTimeData,
    WebSocketManager,
    PortfolioWidget,
    WatchlistWidget,
    NewsWidget,
    AlertsWidget
} from '../design-system';
import { useDesignSystemIntegration } from '../services/designSystemIntegration';
import { useRealTimeData as useIntegratedRealTimeData } from '../services/realTimeDataIntegration';
import { usePerformanceMonitoring } from '../services/performanceIntegration';
import { IntegratedErrorBoundary } from '../services/errorBoundaryIntegration';
import ChartComponent from './ChartComponent';
import RealTimeChart from './RealTimeChart';
import AssetSelector from './AssetSelector';
import PredictionPanel from './PredictionPanel';
import NewsPanel from './NewsPanel';
import PortfolioPanel from './PortfolioPanel';
import AlertsPanel from './AlertsPanel';
import OrderBookPanel from './OrderBookPanel';
import AIInsightsPanel from './AIInsightsPanel';
import MarketMicrostructure from './MarketMicrostructure';
import TechnicalAnalysisPanel from './TechnicalAnalysisPanel';
import RiskManagementPanel from './RiskManagementPanel';

const TradingDashboard = () => {
    // Core State
    const [selectedTicker, setSelectedTicker] = useState('AAPL');
    const [selectedAssetType, setSelectedAssetType] = useState('stock');
    const [marketData, setMarketData] = useState(null);
    const [predictions, setPredictions] = useState(null);

    // Design System Integration
    const {
        elementRef: dashboardRef,
        integration,
        isRegistered,
        systemHealth,
        optimizeSystem,
        getStatus
    } = useDesignSystemIntegration('trading-dashboard', 'dashboard', {
        enablePerformanceMonitoring: true,
        dataTypes: ['market_data', 'predictions', 'order_book', 'portfolio'],
        onDataUpdate: (data, metadata) => {
            // Handle real-time data updates
            switch (metadata.symbol) {
                case selectedTicker:
                    if (data.type === 'market_data') {
                        setRealTimeData(prev => ({
                            ...prev,
                            [selectedTicker]: data
                        }));
                    }
                    break;
            }
        }
    });

    // Performance Monitoring
    const { metrics: performanceMetrics, recordMetric } = usePerformanceMonitoring('trading-dashboard');

    // Real-time Data Integration
    const {
        data: integratedRealTimeData,
        error: dataError,
        isConnected: isDataConnected
    } = useIntegratedRealTimeData('trading-dashboard', ['market_data', 'predictions', 'order_book']);

    // Low-Latency Performance States
    const [performanceMonitorVisible, setPerformanceMonitorVisible] = useState(false);
    const [latencyMetrics, setLatencyMetrics] = useState({
        orderLatency: 0,
        dataLatency: 0,
        executionLatency: 0
    });
    const [news, setNews] = useState([]);
    const [portfolio, setPortfolio] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [realTimeData, setRealTimeData] = useState({});
    const [isConnected, setIsConnected] = useState(false);

    // Enhanced UI State
    const [layoutMode, setLayoutMode] = useState('professional'); // professional, compact, mobile
    const [theme, setTheme] = useState('dark'); // dark, light, auto
    const [activeWorkspace, setActiveWorkspace] = useState('trading');
    const [panelVisibility, setPanelVisibility] = useState({
        chart: true,
        predictions: true,
        news: true,
        portfolio: true,
        alerts: true,
        orderbook: true,
        aiInsights: true,
        microstructure: true,
        technicalAnalysis: true,
        riskManagement: true
    });
    const [watchlist, setWatchlist] = useState(['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA']);
    const [aiMode, setAiMode] = useState('enhanced'); // basic, enhanced, autonomous

    const fileInputRef = useRef(null);

    useEffect(() => {
        initializeDashboard();
        setupWebSocket();

        return () => {
            wsManager.disconnect();
        };
    }, []);

    useEffect(() => {
        if (selectedTicker) {
            loadTickerData(selectedTicker);
        }
    }, [selectedTicker]);

    const initializeDashboard = async () => {
        try {
            // Load initial portfolio data
            const portfolioResponse = await brokerAPI.getAccountInfo();
            if (portfolioResponse.data.success) {
                setPortfolio(portfolioResponse.data.account);
            }
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
        }
    };

    const setupWebSocket = () => {
        const clientId = `dashboard_${Date.now()}`;
        const subscriptions = [
            'market_overview',
            'social_sentiment',
            `ticker:${selectedTicker}`,
            `predictions:${selectedTicker}`
        ];

        wsManager.connect(clientId, subscriptions);

        // Subscribe to real-time updates
        wsManager.subscribe('ticker_update', (data) => {
            if (data.ticker === selectedTicker) {
                setRealTimeData(prev => ({
                    ...prev,
                    [data.ticker]: data.data
                }));
            }
        });

        wsManager.subscribe('prediction_update', (data) => {
            if (data.ticker === selectedTicker) {
                setPredictions(prev => ({
                    ...prev,
                    ...data.data
                }));
            }
        });

        wsManager.subscribe('market_overview', (data) => {
            setRealTimeData(prev => ({
                ...prev,
                market_overview: data.data
            }));
        });

        // Connection status
        // derive connection state from integration when possible
        setIsConnected(isDataConnected ?? false);
    };

    const loadTickerData = async (ticker) => {
        setIsLoading(true);
        try {
            // Load market data
            const [ohlcvResponse, newsResponse, predictionResponse] = await Promise.all([
                marketDataAPI.getOHLCV(ticker, '1y', '1d'),
                marketDataAPI.getNews(ticker, 10),
                predictionsAPI.getPrediction(ticker, '1w', true, true)
            ]);

            setMarketData(ohlcvResponse.data);
            setNews(newsResponse.data);
            setPredictions(predictionResponse.data);

            // Update WebSocket subscription
            wsManager.addSubscription(`ticker:${ticker}`);
            wsManager.addSubscription(`predictions:${ticker}`);

        } catch (error) {
            console.error('Failed to load ticker data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTickerChange = (ticker) => {
        // Remove old subscriptions
        wsManager.removeSubscription(`ticker:${selectedTicker}`);
        wsManager.removeSubscription(`predictions:${selectedTicker}`);

        setSelectedTicker(ticker);
    };

    const handleChartUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setIsLoading(true);
            const response = await computerVisionAPI.analyzeChart(file, selectedTicker);

            if (response.data.success) {
                // Display chart analysis results
                const analysis = response.data.analysis;
                alert(`Chart Analysis Results:\n${analysis.insights?.join('\n') || 'Analysis completed'}`);
            }
        } catch (error) {
            console.error('Chart analysis failed:', error);
            alert('Chart analysis failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const executeAIRecommendation = async () => {
        if (!predictions) return;

        try {
            const response = await brokerAPI.executeAIRecommendation(
                selectedTicker,
                {
                    action: predictions.final_action,
                    confidence: predictions.final_confidence,
                    target_price: predictions.final_target_price
                },
                0.05 // 5% position size
            );

            if (response.data.success) {
                alert(`Trade executed: ${response.data.order.side} ${response.data.order.quantity} shares of ${selectedTicker}`);
                // Refresh portfolio
                const portfolioResponse = await brokerAPI.getAccountInfo();
                if (portfolioResponse.data.success) {
                    setPortfolio(portfolioResponse.data.account);
                }
            } else {
                alert(`Trade blocked: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Failed to execute trade:', error);
            alert('Failed to execute trade. Please try again.');
        }
    };

    return (
        <IntegratedErrorBoundary componentId="trading-dashboard">
            <div
                ref={dashboardRef}
                className={`trading-dashboard theme-${theme} layout-${layoutMode}`}
                data-component-id="trading-dashboard"
            >
                {/* Enhanced Header with Modern Navigation */}
                <div className="dashboard-header">
                    <div className="header-left">
                        <div className="logo-section">
                            <div className="logo">TradeFlowAI</div>
                            <div className="version">v2.0</div>
                        </div>

                        <div className="workspace-tabs">
                            {['trading', 'analysis', 'portfolio', 'social'].map(workspace => (
                                <button
                                    key={workspace}
                                    className={`workspace-tab ${activeWorkspace === workspace ? 'active' : ''}`}
                                    onClick={() => setActiveWorkspace(workspace)}
                                >
                                    {workspace.charAt(0).toUpperCase() + workspace.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="header-center">
                        <div className="ticker-search">
                            <AssetSelector
                                onAssetSelect={(symbol, assetType) => {
                                    setSelectedTicker(symbol);
                                    setSelectedAssetType(assetType);
                                }}
                                currentSymbol={selectedTicker}
                                currentAssetType={selectedAssetType}
                            />

                            <div className="quick-watchlist">
                                {watchlist.map(symbol => {
                                    const live = realTimeData?.[symbol];
                                    const change = live?.price_change_percent ?? (live?.price && marketData ? (((live.price - (marketData?.[0]?.close || live.price)) / (marketData?.[0]?.close || live.price)) * 100).toFixed(2) : null);
                                    return (
                                        <button
                                            key={symbol}
                                            className={`watchlist-item ${selectedTicker === symbol ? 'active' : ''}`}
                                            onClick={() => handleTickerChange(symbol)}
                                        >
                                            {symbol}
                                            <span className="price-change">{change != null ? `${change}%` : '—'}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="header-right">
                        <div className="ai-status">
                            <div className={`ai-indicator ${aiMode}`}>
                                <span className="ai-icon">🤖</span>
                                <span className="ai-text">AI {aiMode.toUpperCase()}</span>
                            </div>
                        </div>

                        <div className="connection-status">
                            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                                <span className="status-dot"></span>
                                <span className="status-text">
                                    {isConnected ? 'Live Market' : 'Offline'}
                                </span>
                                <span className="latency">{performanceMetrics?.latency != null ? `${Math.round(performanceMetrics.latency)}ms` : '—'}</span>
                            </div>
                        </div>

                        <div className="header-actions">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="btn btn-glass"
                                disabled={isLoading}
                                title="AI Chart Analysis"
                            >
                                📊
                            </button>

                            <button
                                onClick={executeAIRecommendation}
                                className="btn btn-ai-primary"
                                disabled={!predictions || isLoading}
                                title="Execute AI Recommendation"
                            >
                                AI Trade
                            </button>

                            <div className="settings-menu">
                                <button className="btn btn-glass">⚙️</button>
                            </div>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleChartUpload}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                {/* Enhanced Main Content with Adaptive Layout */}
                <div className={`dashboard-content workspace-${activeWorkspace}`}>
                    {activeWorkspace === 'trading' && (
                        <>
                            {/* Primary Trading View */}
                            <div className="main-trading-area">
                                <div className="chart-section">
                                    {panelVisibility.chart && (
                                        <RealTimeChart
                                            symbol={selectedTicker}
                                            assetType={selectedAssetType}
                                            interval="1m"
                                            period="1d"
                                            height={400}
                                            onDataUpdate={(data) => {
                                                // Handle real-time data updates
                                                setRealTimeData(prev => ({
                                                    ...prev,
                                                    [selectedTicker]: data
                                                }));
                                            }}
                                        />
                                    )}
                                </div>

                                <div className="trading-panels">
                                    {panelVisibility.orderbook && (
                                        <OrderBookPanel
                                            ticker={selectedTicker}
                                            orderBookData={realTimeData[selectedTicker]?.orderBook}
                                            isLoading={isLoading}
                                        />
                                    )}

                                    {panelVisibility.predictions && (
                                        <PredictionPanel
                                            ticker={selectedTicker}
                                            predictions={predictions}
                                            isLoading={isLoading}
                                            enhanced={true}
                                        />
                                    )}

                                    {panelVisibility.aiInsights && (
                                        <AIInsightsPanel
                                            ticker={selectedTicker}
                                            aiInsights={predictions}
                                            marketData={marketData}
                                            isLoading={isLoading}
                                        />
                                    )}

                                    {panelVisibility.microstructure && (
                                        <MarketMicrostructure
                                            ticker={selectedTicker}
                                            orderFlowData={realTimeData[selectedTicker]?.orderFlow}
                                            isLoading={isLoading}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Side Panels */}
                            <div className="side-panels">
                                {panelVisibility.portfolio && (
                                    <PortfolioPanel
                                        portfolio={portfolio}
                                        realTimeData={realTimeData.market_overview}
                                        isLoading={isLoading}
                                        compact={true}
                                    />
                                )}

                                {panelVisibility.alerts && (
                                    <AlertsPanel
                                        alerts={alerts}
                                        onCreateAlert={(alert) => console.log('Create alert:', alert)}
                                        compact={true}
                                    />
                                )}
                            </div>
                        </>
                    )}

                    {activeWorkspace === 'analysis' && (
                        <>
                            {/* Analysis Workspace */}
                            <div className="analysis-grid">
                                <div className="chart-analysis">
                                    <ChartComponent
                                        ticker={selectedTicker}
                                        data={marketData}
                                        realTimeData={realTimeData[selectedTicker]}
                                        isLoading={isLoading}
                                        mode="analysis"
                                    />
                                </div>

                                <div className="technical-panel">
                                    <TechnicalAnalysisPanel
                                        ticker={selectedTicker}
                                        data={marketData}
                                    />
                                </div>

                                <div className="ai-insights">
                                    <AIInsightsPanel
                                        ticker={selectedTicker}
                                        predictions={predictions}
                                        marketData={marketData}
                                    />
                                </div>

                                <div className="news-sentiment">
                                    <NewsPanel
                                        ticker={selectedTicker}
                                        news={news}
                                        isLoading={isLoading}
                                        mode="analysis"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {activeWorkspace === 'portfolio' && (
                        <>
                            {/* Portfolio Management Workspace */}
                            <div className="portfolio-workspace">
                                <div className="portfolio-overview">
                                    <PortfolioPanel
                                        portfolio={portfolio}
                                        realTimeData={realTimeData.market_overview}
                                        isLoading={isLoading}
                                        mode="detailed"
                                    />
                                </div>

                                <div className="risk-management">
                                    <RiskManagementPanel
                                        portfolio={portfolio}
                                        predictions={predictions}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {activeWorkspace === 'social' && (
                        <>
                            {/* Social Trading Workspace */}
                            <div className="social-workspace">
                                <NewsPanel
                                    ticker={selectedTicker}
                                    news={news}
                                    isLoading={isLoading}
                                    mode="social"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>Loading...</p>
                        </div>
                    </div>
                )}

                {/* Low-Latency Performance Monitor - Temporarily disabled */}
                {performanceMonitorVisible && (
                    <div className="performance-monitor-placeholder">
                        <button onClick={() => setPerformanceMonitorVisible(false)}>
                            ⚡ Performance Monitor (Click to close)
                        </button>
                    </div>
                )}

                {/* System Health Monitor */}
                {systemHealth && systemHealth.status !== 'healthy' && (
                    <div className={`system-health-alert ${systemHealth.status}`}>
                        <div className="health-indicator">
                            <span className="health-score">Health: {systemHealth.score}%</span>
                            <button onClick={optimizeSystem} className="btn btn-sm">
                                🔧 Optimize
                            </button>
                        </div>
                        {systemHealth.issues.length > 0 && (
                            <div className="health-issues">
                                {systemHealth.issues.map((issue, index) => (
                                    <div key={index} className="health-issue">
                                        ⚠️ {issue}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Performance Metrics (Development) */}
                {process.env.NODE_ENV === 'development' && performanceMetrics && (
                    <div className="performance-debug">
                        <details>
                            <summary>Performance Metrics</summary>
                            <pre>{JSON.stringify(performanceMetrics, null, 2)}</pre>
                        </details>
                    </div>
                )}
            </div>
        </IntegratedErrorBoundary>
    );
};
export default TradingDashboard;