import React, { createContext, useContext, useRef, useCallback, useEffect } from 'react';

// Chart synchronization context
const ChartSyncContext = createContext(null);

// Chart synchronization manager
class ChartSyncManager {
    constructor() {
        this.charts = new Map();
        this.syncGroups = new Map();
        this.listeners = new Map();
    }

    // Register a chart with the sync manager
    registerChart(chartId, chartRef, syncGroup = 'default') {
        this.charts.set(chartId, {
            ref: chartRef,
            syncGroup,
            lastUpdate: Date.now()
        });

        if (!this.syncGroups.has(syncGroup)) {
            this.syncGroups.set(syncGroup, new Set());
        }
        this.syncGroups.get(syncGroup).add(chartId);

        return () => this.unregisterChart(chartId);
    }

    // Unregister a chart
    unregisterChart(chartId) {
        const chart = this.charts.get(chartId);
        if (chart) {
            this.syncGroups.get(chart.syncGroup)?.delete(chartId);
            this.charts.delete(chartId);
            this.listeners.delete(chartId);
        }
    }

    // Synchronize crosshair position across charts
    syncCrosshair(sourceChartId, position) {
        const sourceChart = this.charts.get(sourceChartId);
        if (!sourceChart) return;

        const syncGroup = sourceChart.syncGroup;
        const chartsInGroup = this.syncGroups.get(syncGroup);

        if (chartsInGroup) {
            chartsInGroup.forEach(chartId => {
                if (chartId !== sourceChartId) {
                    const chart = this.charts.get(chartId);
                    if (chart?.ref?.current?.syncCrosshair) {
                        chart.ref.current.syncCrosshair(position);
                    }
                }
            });
        }
    }

    // Synchronize zoom level across charts
    syncZoom(sourceChartId, zoomLevel, centerPoint) {
        const sourceChart = this.charts.get(sourceChartId);
        if (!sourceChart) return;

        const syncGroup = sourceChart.syncGroup;
        const chartsInGroup = this.syncGroups.get(syncGroup);

        if (chartsInGroup) {
            chartsInGroup.forEach(chartId => {
                if (chartId !== sourceChartId) {
                    const chart = this.charts.get(chartId);
                    if (chart?.ref?.current?.syncZoom) {
                        chart.ref.current.syncZoom(zoomLevel, centerPoint);
                    }
                }
            });
        }
    }

    // Synchronize pan position across charts
    syncPan(sourceChartId, panOffset) {
        const sourceChart = this.charts.get(sourceChartId);
        if (!sourceChart) return;

        const syncGroup = sourceChart.syncGroup;
        const chartsInGroup = this.syncGroups.get(syncGroup);

        if (chartsInGroup) {
            chartsInGroup.forEach(chartId => {
                if (chartId !== sourceChartId) {
                    const chart = this.charts.get(chartId);
                    if (chart?.ref?.current?.syncPan) {
                        chart.ref.current.syncPan(panOffset);
                    }
                }
            });
        }
    }

    // Synchronize time range across charts
    syncTimeRange(sourceChartId, timeRange) {
        const sourceChart = this.charts.get(sourceChartId);
        if (!sourceChart) return;

        const syncGroup = sourceChart.syncGroup;
        const chartsInGroup = this.syncGroups.get(syncGroup);

        if (chartsInGroup) {
            chartsInGroup.forEach(chartId => {
                if (chartId !== sourceChartId) {
                    const chart = this.charts.get(chartId);
                    if (chart?.ref?.current?.syncTimeRange) {
                        chart.ref.current.syncTimeRange(timeRange);
                    }
                }
            });
        }
    }

    // Add event listener for chart events
    addEventListener(chartId, event, callback) {
        if (!this.listeners.has(chartId)) {
            this.listeners.set(chartId, new Map());
        }

        const chartListeners = this.listeners.get(chartId);
        if (!chartListeners.has(event)) {
            chartListeners.set(event, new Set());
        }

        chartListeners.get(event).add(callback);

        return () => {
            chartListeners.get(event)?.delete(callback);
        };
    }

    // Emit event to all listeners
    emitEvent(chartId, event, data) {
        const chartListeners = this.listeners.get(chartId);
        if (chartListeners?.has(event)) {
            chartListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in chart event listener:', error);
                }
            });
        }
    }

    // Get all charts in a sync group
    getChartsInGroup(syncGroup) {
        const chartIds = this.syncGroups.get(syncGroup);
        if (!chartIds) return [];

        return Array.from(chartIds).map(chartId => ({
            id: chartId,
            ...this.charts.get(chartId)
        }));
    }

    // Check if charts are synchronized
    areChartsSynced(chartId1, chartId2) {
        const chart1 = this.charts.get(chartId1);
        const chart2 = this.charts.get(chartId2);

        return chart1 && chart2 && chart1.syncGroup === chart2.syncGroup;
    }

    // Update chart data and notify sync group
    updateChartData(chartId, data, timeframe) {
        const chart = this.charts.get(chartId);
        if (!chart) return;

        chart.lastUpdate = Date.now();

        // Emit data update event to sync group
        this.emitEvent(chartId, 'dataUpdate', { data, timeframe, chartId });

        const syncGroup = chart.syncGroup;
        const chartsInGroup = this.syncGroups.get(syncGroup);

        if (chartsInGroup) {
            chartsInGroup.forEach(otherChartId => {
                if (otherChartId !== chartId) {
                    this.emitEvent(otherChartId, 'syncDataUpdate', {
                        sourceChartId: chartId,
                        data,
                        timeframe
                    });
                }
            });
        }
    }

    // Destroy the sync manager
    destroy() {
        this.charts.clear();
        this.syncGroups.clear();
        this.listeners.clear();
    }
}

// Create global sync manager instance
const globalSyncManager = new ChartSyncManager();

// Chart synchronization provider
export const ChartSyncProvider = ({ children }) => {
    const syncManagerRef = useRef(globalSyncManager);

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            syncManagerRef.current.destroy();
        };
    }, []);

    return (
        <ChartSyncContext.Provider value={syncManagerRef.current}>
            {children}
        </ChartSyncContext.Provider>
    );
};

// Hook to use chart synchronization
export const useChartSync = (chartId, syncGroup = 'default') => {
    const syncManager = useContext(ChartSyncContext);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!syncManager || !chartId) return;

        const unregister = syncManager.registerChart(chartId, chartRef, syncGroup);
        return unregister;
    }, [syncManager, chartId, syncGroup]);

    const syncCrosshair = useCallback((position) => {
        if (syncManager) {
            syncManager.syncCrosshair(chartId, position);
        }
    }, [syncManager, chartId]);

    const syncZoom = useCallback((zoomLevel, centerPoint) => {
        if (syncManager) {
            syncManager.syncZoom(chartId, zoomLevel, centerPoint);
        }
    }, [syncManager, chartId]);

    const syncPan = useCallback((panOffset) => {
        if (syncManager) {
            syncManager.syncPan(chartId, panOffset);
        }
    }, [syncManager, chartId]);

    const syncTimeRange = useCallback((timeRange) => {
        if (syncManager) {
            syncManager.syncTimeRange(chartId, timeRange);
        }
    }, [syncManager, chartId]);

    const updateData = useCallback((data, timeframe) => {
        if (syncManager) {
            syncManager.updateChartData(chartId, data, timeframe);
        }
    }, [syncManager, chartId]);

    const addEventListener = useCallback((event, callback) => {
        if (syncManager) {
            return syncManager.addEventListener(chartId, event, callback);
        }
        return () => { };
    }, [syncManager, chartId]);

    const getChartsInGroup = useCallback(() => {
        if (syncManager) {
            return syncManager.getChartsInGroup(syncGroup);
        }
        return [];
    }, [syncManager, syncGroup]);

    return {
        chartRef,
        syncCrosshair,
        syncZoom,
        syncPan,
        syncTimeRange,
        updateData,
        addEventListener,
        getChartsInGroup,
        syncManager
    };
};

// Multi-timeframe chart component
export const MultiTimeframeChart = ({
    symbol,
    timeframes = ['1m', '5m', '15m', '1h', '4h', '1D'],
    syncGroup = 'multi-timeframe',
    onTimeframeChange,
    className,
    ...props
}) => {
    const [activeTimeframes, setActiveTimeframes] = React.useState(timeframes.slice(0, 4));
    const [layoutMode, setLayoutMode] = React.useState('grid'); // 'grid', 'tabs', 'overlay'

    const handleTimeframeToggle = (timeframe) => {
        setActiveTimeframes(prev => {
            if (prev.includes(timeframe)) {
                return prev.filter(tf => tf !== timeframe);
            } else {
                return [...prev, timeframe];
            }
        });
    };

    const renderGridLayout = () => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '16px',
            height: '100%'
        }}>
            {activeTimeframes.map(timeframe => (
                <SynchronizedChart
                    key={timeframe}
                    chartId={`${symbol}-${timeframe}`}
                    symbol={symbol}
                    timeframe={timeframe}
                    syncGroup={syncGroup}
                    title={`${symbol} - ${timeframe}`}
                    height="300px"
                    {...props}
                />
            ))}
        </div>
    );

    const renderTabsLayout = () => {
        const [activeTab, setActiveTab] = React.useState(activeTimeframes[0]);

        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid #e5e7eb',
                    marginBottom: '16px'
                }}>
                    {activeTimeframes.map(timeframe => (
                        <button
                            key={timeframe}
                            onClick={() => setActiveTab(timeframe)}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                background: activeTab === timeframe ? '#3b82f6' : 'transparent',
                                color: activeTab === timeframe ? 'white' : '#374151',
                                cursor: 'pointer',
                                borderRadius: '4px 4px 0 0'
                            }}
                        >
                            {timeframe}
                        </button>
                    ))}
                </div>
                <div style={{ flex: 1 }}>
                    <SynchronizedChart
                        chartId={`${symbol}-${activeTab}`}
                        symbol={symbol}
                        timeframe={activeTab}
                        syncGroup={syncGroup}
                        title={`${symbol} - ${activeTab}`}
                        height="100%"
                        {...props}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className={className} style={{ height: '600px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
            }}>
                <h3>Multi-Timeframe Analysis - {symbol}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                        value={layoutMode}
                        onChange={(e) => setLayoutMode(e.target.value)}
                        style={{ padding: '4px 8px' }}
                    >
                        <option value="grid">Grid Layout</option>
                        <option value="tabs">Tabs Layout</option>
                    </select>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {timeframes.map(timeframe => (
                            <button
                                key={timeframe}
                                onClick={() => handleTimeframeToggle(timeframe)}
                                style={{
                                    padding: '4px 8px',
                                    border: '1px solid #d1d5db',
                                    background: activeTimeframes.includes(timeframe) ? '#3b82f6' : 'white',
                                    color: activeTimeframes.includes(timeframe) ? 'white' : '#374151',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                }}
                            >
                                {timeframe}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {layoutMode === 'grid' ? renderGridLayout() : renderTabsLayout()}
        </div>
    );
};

// Synchronized chart wrapper
const SynchronizedChart = React.forwardRef(({
    chartId,
    syncGroup,
    onCrosshairMove,
    onZoomChange,
    onPanChange,
    onTimeRangeChange,
    ...props
}, ref) => {
    const {
        chartRef,
        syncCrosshair,
        syncZoom,
        syncPan,
        syncTimeRange,
        addEventListener
    } = useChartSync(chartId, syncGroup);

    // Combine refs
    const combinedRef = useCallback((node) => {
        chartRef.current = node;
        if (ref) {
            if (typeof ref === 'function') ref(node);
            else ref.current = node;
        }
    }, [chartRef, ref]);

    // Set up event listeners for synchronization
    useEffect(() => {
        const unsubscribers = [];

        // Listen for sync events from other charts
        unsubscribers.push(
            addEventListener('syncCrosshair', (position) => {
                if (chartRef.current?.setCrosshairPosition) {
                    chartRef.current.setCrosshairPosition(position);
                }
            })
        );

        unsubscribers.push(
            addEventListener('syncZoom', ({ zoomLevel, centerPoint }) => {
                if (chartRef.current?.setZoomLevel) {
                    chartRef.current.setZoomLevel(zoomLevel, centerPoint);
                }
            })
        );

        unsubscribers.push(
            addEventListener('syncPan', (panOffset) => {
                if (chartRef.current?.setPanOffset) {
                    chartRef.current.setPanOffset(panOffset);
                }
            })
        );

        unsubscribers.push(
            addEventListener('syncTimeRange', (timeRange) => {
                if (chartRef.current?.setTimeRange) {
                    chartRef.current.setTimeRange(timeRange);
                }
            })
        );

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [addEventListener, chartRef]);

    // Enhanced event handlers that trigger synchronization
    const handleCrosshairMove = useCallback((position) => {
        syncCrosshair(position);
        onCrosshairMove?.(position);
    }, [syncCrosshair, onCrosshairMove]);

    const handleZoomChange = useCallback((zoomLevel, centerPoint) => {
        syncZoom(zoomLevel, centerPoint);
        onZoomChange?.(zoomLevel, centerPoint);
    }, [syncZoom, onZoomChange]);

    const handlePanChange = useCallback((panOffset) => {
        syncPan(panOffset);
        onPanChange?.(panOffset);
    }, [syncPan, onPanChange]);

    const handleTimeRangeChange = useCallback((timeRange) => {
        syncTimeRange(timeRange);
        onTimeRangeChange?.(timeRange);
    }, [syncTimeRange, onTimeRangeChange]);

    // Import the CandlestickChart component
    const CandlestickChart = React.lazy(() => import('./CandlestickChart'));

    return (
        <React.Suspense fallback={<div>Loading chart...</div>}>
            <CandlestickChart
                ref={combinedRef}
                onCrosshairMove={handleCrosshairMove}
                onZoomChange={handleZoomChange}
                onPanChange={handlePanChange}
                onTimeRangeChange={handleTimeRangeChange}
                {...props}
            />
        </React.Suspense>
    );
});

SynchronizedChart.displayName = 'SynchronizedChart';

export default ChartSyncProvider;