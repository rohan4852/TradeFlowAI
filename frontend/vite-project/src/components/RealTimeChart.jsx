/**
 * Real-Time Chart Component
 * Supports all asset classes with live data updates
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

const AssetType = {
    STOCK: 'stock',
    FOREX: 'forex',
    CRYPTO: 'crypto',
    COMMODITY: 'commodity',
    INDEX: 'index',
    IPO: 'ipo'
};

const RealTimeChart = ({
    symbol,
    assetType = AssetType.STOCK,
    interval = '1m',
    period = '1d',
    height = 400,
    onDataUpdate = null
}) => {
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const candlestickSeriesRef = useRef();
    const volumeSeriesRef = useRef();
    const wsRef = useRef();

    const [isLoading, setIsLoading] = useState(true);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [priceChange, setPriceChange] = useState(null);
    const [volume, setVolume] = useState(null);
    const [error, setError] = useState(null);

    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#ffffff',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
            },
            crosshair: {
                mode: 1,
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.2)',
                timeVisible: true,
                secondsVisible: interval.includes('s') || interval.includes('m'),
            },
            width: chartContainerRef.current.clientWidth,
            height: height,
        });

        // Add candlestick series
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#4ade80',
            downColor: '#f87171',
            borderDownColor: '#f87171',
            borderUpColor: '#4ade80',
            wickDownColor: '#f87171',
            wickUpColor: '#4ade80',
        });

        // Add volume series
        const volumeSeries = chart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });

        chartRef.current = chart;
        candlestickSeriesRef.current = candlestickSeries;
        volumeSeriesRef.current = volumeSeries;

        // Handle resize
        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [height, interval]);

    // Fetch historical data
    const fetchHistoricalData = useCallback(async () => {
        if (!symbol) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/v1/market/realtime/historical/${symbol}?asset_type=${assetType}&period=${period}&interval=${interval}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.data && data.data.length > 0) {
                // Convert data to chart format
                const chartData = data.data.map(item => ({
                    time: new Date(item.timestamp).getTime() / 1000,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close,
                }));

                const volumeData = data.data.map(item => ({
                    time: new Date(item.timestamp).getTime() / 1000,
                    value: item.volume,
                    color: item.close >= item.open ? '#4ade8080' : '#f8717180',
                }));

                // Update chart
                if (candlestickSeriesRef.current && volumeSeriesRef.current) {
                    candlestickSeriesRef.current.setData(chartData);
                    volumeSeriesRef.current.setData(volumeData);

                    // Set current price info
                    const lastCandle = chartData[chartData.length - 1];
                    if (lastCandle) {
                        setCurrentPrice(lastCandle.close);
                        const prevCandle = chartData[chartData.length - 2];
                        if (prevCandle) {
                            const change = lastCandle.close - prevCandle.close;
                            setPriceChange({
                                absolute: change,
                                percentage: (change / prevCandle.close) * 100
                            });
                        }
                        setVolume(volumeData[volumeData.length - 1]?.value || 0);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching historical data:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [symbol, assetType, period, interval]);

    // Setup real-time updates using professional WebSocket
    const setupRealTimeUpdates = useCallback(() => {
        if (!symbol) return;

        // Close existing WebSocket
        if (wsRef.current) {
            wsRef.current.close();
        }

        // Setup new WebSocket connection to free endpoint (no API keys required)
        const wsUrl = `ws://localhost:8000/api/v1/streaming/market-data`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('Free WebSocket connected for', symbol, '(no API keys required)');
            // Subscribe to symbol updates using free protocol
            ws.send(JSON.stringify({
                action: 'subscribe',
                symbol: symbol.upper ? symbol.upper() : symbol.toUpperCase()
            }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('WebSocket message:', data);

                if (data.type === 'quote_update' && data.symbol === symbol.toUpperCase()) {
                    const quote = data.data;

                    // Update current price display
                    if (quote.price != null) {
                        setCurrentPrice(quote.price);
                    }

                    if (quote.change != null || quote.change_percent != null) {
                        setPriceChange({
                            absolute: quote.change ?? 0,
                            percentage: quote.change_percent ?? 0
                        });
                    }

                    if (quote.volume != null) {
                        setVolume(quote.volume);
                    }

                    // Create OHLCV data for chart update
                    if (quote.price && candlestickSeriesRef.current) {
                        const now = new Date().getTime() / 1000;
                        const newCandle = {
                            time: now,
                            open: quote.open || quote.price,
                            high: quote.high || quote.price,
                            low: quote.low || quote.price,
                            close: quote.price,
                        };

                        try {
                            candlestickSeriesRef.current.update(newCandle);
                        } catch (e) {
                            console.debug('Chart update error (normal):', e);
                        }

                        if (volumeSeriesRef.current && quote.volume) {
                            try {
                                volumeSeriesRef.current.update({
                                    time: now,
                                    value: quote.volume,
                                    color: quote.price >= (quote.open || quote.price) ? '#4ade8080' : '#f8717180',
                                });
                            } catch (e) {
                                console.debug('Volume update error (normal):', e);
                            }
                        }
                    }

                    // Notify parent component
                    if (onDataUpdate) {
                        onDataUpdate(data);
                    }
                }
                else if (data.type === 'subscription_response') {
                    console.log('Subscription response:', data);
                }
                else if (data.type === 'connection_established') {
                    console.log('Connection established:', data.connection_id);
                }
                else if (data.type === 'error') {
                    console.error('WebSocket error:', data.message);
                    setError(data.message);
                }
            } catch (err) {
                console.error('Error processing WebSocket message:', err);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setError('Real-time connection error');
        };

        ws.onclose = (event) => {
            console.log('WebSocket disconnected for', symbol, 'Code:', event.code);
            // Attempt to reconnect after 3 seconds
            setTimeout(() => {
                if (symbol) {
                    setupRealTimeUpdates();
                }
            }, 3000);
        };

        wsRef.current = ws;
    }, [symbol, assetType, onDataUpdate]);

    // Load data when symbol changes
    useEffect(() => {
        fetchHistoricalData();
        setupRealTimeUpdates();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [fetchHistoricalData, setupRealTimeUpdates]);

    // Format price based on asset type
    const formatPrice = (price) => {
        if (!price) return '--';

        switch (assetType) {
            case AssetType.FOREX:
                return price.toFixed(5);
            case AssetType.CRYPTO:
                return price < 1 ? price.toFixed(6) : price.toFixed(2);
            case AssetType.COMMODITY:
                return price.toFixed(3);
            default:
                return price.toFixed(2);
        }
    };

    // Format volume
    const formatVolume = (vol) => {
        if (!vol) return '--';
        if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
        if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
        if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
        return vol.toString();
    };

    // Get asset type display name
    const getAssetTypeDisplay = () => {
        switch (assetType) {
            case AssetType.STOCK: return '📈 Stock';
            case AssetType.FOREX: return '💱 Forex';
            case AssetType.CRYPTO: return '₿ Crypto';
            case AssetType.COMMODITY: return '🥇 Commodity';
            case AssetType.INDEX: return '📊 Index';
            case AssetType.IPO: return '🚀 IPO';
            default: return '📈 Asset';
        }
    };

    return (
        <div className="realtime-chart">
            <div className="chart-header">
                <div className="symbol-info">
                    <h3>{symbol}</h3>
                    <span className="asset-type">{getAssetTypeDisplay()}</span>
                </div>

                <div className="price-info">
                    {currentPrice && (
                        <>
                            <div className="current-price">
                                ${formatPrice(currentPrice)}
                            </div>
                            {priceChange && (
                                <div className={`price-change ${priceChange.absolute >= 0 ? 'positive' : 'negative'}`}>
                                    {priceChange.absolute >= 0 ? '+' : ''}
                                    {formatPrice(priceChange.absolute)}
                                    ({priceChange.percentage.toFixed(2)}%)
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="chart-controls">
                    <div className="volume-info">
                        Vol: {formatVolume(volume)}
                    </div>
                    <div className="status-indicators">
                        <div className={`connection-status ${wsRef.current?.readyState === 1 ? 'connected' : 'disconnected'}`}>
                            {wsRef.current?.readyState === 1 ? '🟢 Live' : '🔴 Offline'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="chart-container" ref={chartContainerRef}>
                {isLoading && (
                    <div className="chart-loading">
                        <div className="spinner"></div>
                        <p>Loading {symbol} data...</p>
                    </div>
                )}

                {error && (
                    <div className="chart-error">
                        <p>Error: {error}</p>
                        <button onClick={fetchHistoricalData}>Retry</button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .realtime-chart {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 0.5rem;
                    overflow: hidden;
                }

                .chart-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .symbol-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .symbol-info h3 {
                    margin: 0;
                    color: #ffffff;
                    font-size: 1.2rem;
                }

                .asset-type {
                    padding: 0.25rem 0.5rem;
                    background: rgba(0, 212, 255, 0.2);
                    border: 1px solid #00d4ff;
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                    color: #00d4ff;
                }

                .price-info {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.25rem;
                }

                .current-price {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #ffffff;
                }

                .price-change {
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .price-change.positive {
                    color: #4ade80;
                }

                .price-change.negative {
                    color: #f87171;
                }

                .chart-controls {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 0.5rem;
                }

                .volume-info {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.7);
                }

                .connection-status {
                    font-size: 0.75rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                }

                .connection-status.connected {
                    background: rgba(74, 222, 128, 0.2);
                    color: #4ade80;
                }

                .connection-status.disconnected {
                    background: rgba(248, 113, 113, 0.2);
                    color: #f87171;
                }

                .chart-container {
                    flex: 1;
                    position: relative;
                }

                .chart-loading, .chart-error {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    color: rgba(255, 255, 255, 0.7);
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-top: 3px solid #00d4ff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .chart-error button {
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background: #00d4ff;
                    color: white;
                    border: none;
                    border-radius: 0.25rem;
                    cursor: pointer;
                }

                .chart-error button:hover {
                    background: #0099cc;
                }
            `}</style>
        </div>
    );
};

export default RealTimeChart;