/**
 * Low-Latency Performance Monitor - Real-time System Metrics
 * Shows VVP Core Components performance in real-time
 */
import React, { useState, useEffect } from 'react';

const PerformanceMonitor = ({ isVisible, onToggle, metrics = null, onRefresh = null }) => {
    // metrics can be passed in from a parent or a real-time provider; avoid generating fake data
    const [internalMetrics] = useState({
        orderProcessingLatency: 0,
        throughput: 0,
        memoryUsage: 0,
        cacheHitRate: 0,
        networkLatency: 0,
        cpuUsage: 0,
        activeConnections: 0,
        queueDepth: 0
    });

    const effectiveMetrics = metrics || internalMetrics;

    const getLatencyColor = (latency) => {
        if (latency < 10) return '#00ff88';
        if (latency < 25) return '#ffaa00';
        return '#ff4444';
    };

    const getThroughputColor = (throughput) => {
        if (throughput > 100000) return '#00ff88';
        if (throughput > 50000) return '#ffaa00';
        return '#ff4444';
    };

    if (!isVisible) {
        return (
            <div className="performance-toggle">
                <button
                    className="toggle-btn"
                    onClick={onToggle}
                    title="Show Performance Monitor"
                >
                    ⚡ {metrics.orderProcessingLatency.toFixed(1)}μs
                </button>
            </div>
        );
    }

    return (
        <div className="performance-monitor">
            <div className="monitor-header">
                <h3>⚡ Low-Latency Performance Monitor</h3>
                <button className="close-btn" onClick={onToggle}>×</button>
            </div>

            <div className="metrics-grid">
                {/* Core Latency Metrics */}
                <div className="metric-card critical">
                    <div className="metric-header">
                        <span className="metric-icon">⚡</span>
                        <span className="metric-label">Order Latency</span>
                    </div>
                    <div className="metric-value" style={{ color: getLatencyColor(metrics.orderProcessingLatency) }}>
                        {metrics.orderProcessingLatency.toFixed(1)}μs
                    </div>
                    <div className="metric-status">
                        {metrics.orderProcessingLatency < 10 ? '🟢 Excellent' :
                            metrics.orderProcessingLatency < 25 ? '🟡 Good' : '🔴 High'}
                    </div>
                </div>

                <div className="metric-card critical">
                    <div className="metric-header">
                        <span className="metric-icon">⚡</span>
                        <span className="metric-label">Throughput</span>
                    </div>
                    <div className="metric-value" style={{ color: getThroughputColor(metrics.throughput) }}>
                        {(metrics.throughput / 1000).toFixed(0)}K/s
                    </div>
                    <div className="metric-status">
                        {metrics.throughput > 100000 ? '🟢 High' :
                            metrics.throughput > 50000 ? '🟡 Medium' : '🔴 Low'}
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-icon">🧠</span>
                        <span className="metric-label">Memory Usage</span>
                    </div>
                    <div className="metric-value">
                        {metrics.memoryUsage.toFixed(1)}%
                    </div>
                    <div className="metric-progress">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${metrics.memoryUsage}%`,
                                backgroundColor: metrics.memoryUsage > 80 ? '#ff4444' : '#4bffb5'
                            }}
                        />
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-icon">💾</span>
                        <span className="metric-label">Cache Hit Rate</span>
                    </div>
                    <div className="metric-value" style={{ color: '#4bffb5' }}>
                        {metrics.cacheHitRate.toFixed(1)}%
                    </div>
                    <div className="metric-progress">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${metrics.cacheHitRate}%`,
                                backgroundColor: '#4bffb5'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* VVP Core Status */}
            <div className="vvp-status">
                <h4>🏗️ VVP Core Components Status</h4>
                <div className="component-status-grid">
                    <div className="component-item">
                        <span className="component-name">Lock-Free Queue</span>
                        <span className="status-indicator active">🟢 Active</span>
                    </div>
                    <div className="component-item">
                        <span className="component-name">Memory Manager</span>
                        <span className="status-indicator active">🟢 Optimized</span>
                    </div>
                    <div className="component-item">
                        <span className="component-name">Order Book Engine</span>
                        <span className="status-indicator active">🟢 Running</span>
                    </div>
                    <div className="component-item">
                        <span className="component-name">Object Pool</span>
                        <span className="status-indicator active">🟢 {metrics.cacheHitRate.toFixed(0)}% Hit Rate</span>
                    </div>
                </div>
            </div>

            {/* Performance Alerts */}
            <div className="performance-alerts">
                <h4>🚨 Performance Alerts</h4>
                <div className="alerts-list">
                    {metrics.orderProcessingLatency > 30 && (
                        <div className="alert warning">
                            ⚠️ High order processing latency detected: {metrics.orderProcessingLatency.toFixed(1)}μs
                        </div>
                    )}
                    {metrics.memoryUsage > 85 && (
                        <div className="alert error">
                            🔴 High memory usage: {metrics.memoryUsage.toFixed(1)}%
                        </div>
                    )}
                    {metrics.cacheHitRate < 85 && (
                        <div className="alert warning">
                            ⚠️ Low cache hit rate: {metrics.cacheHitRate.toFixed(1)}%
                        </div>
                    )}
                    {metrics.orderProcessingLatency < 10 && metrics.throughput > 100000 && (
                        <div className="alert success">
                            ✅ Optimal performance: {metrics.orderProcessingLatency.toFixed(1)}μs latency, {(metrics.throughput / 1000).toFixed(0)}K/s throughput
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PerformanceMonitor;