/**
 * PerformanceMonitor Component
 * Real-time performance monitoring system for the design system
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { usePerformanceMonitoring } from '../../hooks/usePerformanceMonitoring';
import { PerformanceAlertManager, PerformanceDegradationDetector } from '../../utils/performanceAlerting';
import { RealTimeMetricsCollector, PerformanceRegressionDetector } from '../../utils/performanceMonitoring';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';

const MonitorContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 320px;
  background: ${({ theme }) => theme.colors.neutral[900]}ee;
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.colors.neutral[700]};
  border-radius: 12px;
  padding: 16px;
  z-index: 10000;
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.neutral[100]};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  transform: ${({ isMinimized }) => isMinimized ? 'translateX(280px)' : 'translateX(0)'};

  ${({ theme }) => theme.breakpoints.mobile} {
    width: 280px;
    top: 10px;
    right: 10px;
    padding: 12px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[700]};
`;

const Title = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary[400]};
`;

const ToggleButton = styled(Button)`
  padding: 4px;
  min-width: auto;
  width: 24px;
  height: 24px;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 0;
`;

const MetricLabel = styled.span`
  color: ${({ theme }) => theme.colors.neutral[300]};
`;

const MetricValue = styled.span`
  font-weight: 600;
  color: ${({ status, theme }) => {
        switch (status) {
            case 'good': return theme.colors.success[400];
            case 'warning': return theme.colors.warning[400];
            case 'critical': return theme.colors.error[400];
            default: return theme.colors.neutral[100];
        }
    }};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.neutral[700]};
  border-radius: 2px;
  overflow: hidden;
  margin: 4px 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ status, theme }) => {
        switch (status) {
            case 'good': return theme.colors.success[400];
            case 'warning': return theme.colors.warning[400];
            case 'critical': return theme.colors.error[400];
            default: return theme.colors.primary[400];
        }
    }};
  width: ${({ value }) => Math.min(100, Math.max(0, value))}%;
  transition: width 0.3s ease;
`;

const AlertsContainer = styled.div`
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid ${({ theme }) => theme.colors.neutral[700]};
`;

const Alert = styled.div`
  padding: 6px 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  font-size: 11px;
  background: ${({ severity, theme }) => {
        switch (severity) {
            case 'warning': return theme.colors.warning[900];
            case 'critical': return theme.colors.error[900];
            case 'emergency': return theme.colors.error[800];
            default: return theme.colors.neutral[800];
        }
    }};
  border-left: 3px solid ${({ severity, theme }) => {
        switch (severity) {
            case 'warning': return theme.colors.warning[400];
            case 'critical': return theme.colors.error[400];
            case 'emergency': return theme.colors.error[300];
            default: return theme.colors.neutral[400];
        }
    }};
`;

const DegradationContainer = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid ${({ theme }) => theme.colors.neutral[700]};
`;

const DegradationItem = styled.div`
  padding: 4px 6px;
  margin-bottom: 3px;
  border-radius: 3px;
  font-size: 10px;
  background: ${({ severity, theme }) => {
        switch (severity) {
            case 'critical': return theme.colors.error[900];
            case 'high': return theme.colors.warning[900];
            case 'medium': return theme.colors.warning[950];
            default: return theme.colors.neutral[800];
        }
    }};
  border-left: 2px solid ${({ severity, theme }) => {
        switch (severity) {
            case 'critical': return theme.colors.error[400];
            case 'high': return theme.colors.warning[400];
            case 'medium': return theme.colors.warning[500];
            default: return theme.colors.neutral[500];
        }
    }};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DegradationMetric = styled.span`
  font-weight: 500;
  text-transform: capitalize;
`;

const DegradationPercent = styled.span`
  color: ${({ severity, theme }) => {
        switch (severity) {
            case 'critical': return theme.colors.error[300];
            case 'high': return theme.colors.warning[300];
            case 'medium': return theme.colors.warning[400];
            default: return theme.colors.neutral[300];
        }
    }};
`;

const ChartContainer = styled.div`
  height: 60px;
  margin: 8px 0;
  position: relative;
  background: ${({ theme }) => theme.colors.neutral[800]};
  border-radius: 4px;
  overflow: hidden;
`;

const MiniChart = styled.canvas`
  width: 100%;
  height: 100%;
`;

export const PerformanceMonitor = ({
    isVisible = true,
    position = 'top-right',
    enableAlerts = true,
    enableDegradationDetection = true,
    updateInterval = 1000,
    onAlert = null,
    onEscalation = null,
    onDegradation = null
}) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [degradationReports, setDegradationReports] = useState({});
    const [regressionReports, setRegressionReports] = useState({});
    const [realTimeMetrics, setRealTimeMetrics] = useState(null);
    const chartRef = useRef(null);
    const chartDataRef = useRef({ fps: [], memory: [], renderTime: [] });
    const alertManagerRef = useRef(null);
    const degradationDetectorRef = useRef(null);
    const metricsCollectorRef = useRef(null);
    const regressionDetectorRef = useRef(null);

    const {
        metrics,
        isMonitoring,
        startMonitoring,
        stopMonitoring,
        getPerformanceReport,
        clearMetrics
    } = usePerformanceMonitoring({ updateInterval });

    // Initialize alert manager and degradation detector
    useEffect(() => {
        if (enableAlerts && !alertManagerRef.current) {
            alertManagerRef.current = new PerformanceAlertManager({
                enableConsoleLogging: true,
                enableNotifications: true,
                enableLocalStorage: true
            });

            // Set up alert callbacks
            const unsubscribeAlert = alertManagerRef.current.onAlert((alert) => {
                if (onAlert) onAlert(alert);
            });

            const unsubscribeEscalation = alertManagerRef.current.onEscalation((escalation) => {
                if (onEscalation) onEscalation(escalation);
            });

            return () => {
                unsubscribeAlert();
                unsubscribeEscalation();
            };
        }
    }, [enableAlerts, onAlert, onEscalation]);

    useEffect(() => {
        if (enableDegradationDetection && !degradationDetectorRef.current) {
            degradationDetectorRef.current = new PerformanceDegradationDetector({
                windowSize: 50,
                degradationThreshold: 0.15,
                minSamples: 10
            });
        }
    }, [enableDegradationDetection]);

    // Initialize real-time metrics collector
    useEffect(() => {
        if (!metricsCollectorRef.current) {
            metricsCollectorRef.current = new RealTimeMetricsCollector({
                sampleRate: 30, // 30 samples per second
                bufferSize: 500,
                enableCPUTracking: true,
                enableNetworkTracking: true,
                enableDOMTracking: true
            });
        }

        if (!regressionDetectorRef.current) {
            regressionDetectorRef.current = new PerformanceRegressionDetector({
                baselineWindow: 50,
                comparisonWindow: 10,
                regressionThreshold: 0.25,
                minSamples: 5
            });
        }
    }, []);

    // Start/stop real-time metrics collection
    useEffect(() => {
        if (isVisible && metricsCollectorRef.current) {
            metricsCollectorRef.current.start();

            // Update real-time metrics periodically
            const interval = setInterval(() => {
                const aggregated = metricsCollectorRef.current.getAggregatedMetrics();
                setRealTimeMetrics(aggregated);
            }, 2000);

            return () => {
                clearInterval(interval);
                metricsCollectorRef.current.stop();
            };
        }
    }, [isVisible]);

    // Initialize monitoring on mount
    useEffect(() => {
        if (isVisible) {
            startMonitoring();
        }
        return () => stopMonitoring();
    }, [isVisible, startMonitoring, stopMonitoring]);

    // Update mini charts
    useEffect(() => {
        if (!chartRef.current || !metrics) return;

        const canvas = chartRef.current;
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas.getBoundingClientRect();

        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        // Update chart data
        const now = Date.now();
        chartDataRef.current.fps.push({ time: now, value: metrics.frameRate });
        chartDataRef.current.memory.push({ time: now, value: metrics.memoryUsage?.percentage || 0 });
        chartDataRef.current.renderTime.push({ time: now, value: metrics.averageRenderTime });

        // Keep only last 60 data points
        Object.keys(chartDataRef.current).forEach(key => {
            if (chartDataRef.current[key].length > 60) {
                chartDataRef.current[key].shift();
            }
        });

        drawMiniChart(ctx, width, height);
    }, [metrics]);

    // Process performance alerts and degradation detection
    useEffect(() => {
        if (!metrics) return;

        // Process alerts
        if (enableAlerts && alertManagerRef.current) {
            const generatedAlerts = alertManagerRef.current.checkMetrics(metrics);
            const activeAlerts = alertManagerRef.current.getActiveAlerts();
            setAlerts(activeAlerts);
        }

        // Process degradation detection
        if (enableDegradationDetection && degradationDetectorRef.current) {
            // Add samples to degradation detector
            if (metrics.frameRate !== undefined) {
                degradationDetectorRef.current.addSample('frameRate', metrics.frameRate);
            }
            if (metrics.averageRenderTime !== undefined) {
                degradationDetectorRef.current.addSample('renderTime', metrics.averageRenderTime);
            }
            if (metrics.memoryUsage?.percentage !== undefined) {
                degradationDetectorRef.current.addSample('memoryUsage', metrics.memoryUsage.percentage);
            }

            // Check for degradation
            const reports = degradationDetectorRef.current.getAllDegradationReports();
            setDegradationReports(reports);

            // Trigger degradation callback
            if (onDegradation) {
                Object.values(reports).forEach(report => {
                    if (report.isDegraded) {
                        onDegradation(report);
                    }
                });
            }
        }

        // Process regression detection
        if (regressionDetectorRef.current) {
            // Add samples to regression detector
            if (metrics.frameRate !== undefined) {
                regressionDetectorRef.current.addSample('frameRate', metrics.frameRate);
            }
            if (metrics.averageRenderTime !== undefined) {
                regressionDetectorRef.current.addSample('renderTime', metrics.averageRenderTime);
            }
            if (metrics.memoryUsage?.percentage !== undefined) {
                regressionDetectorRef.current.addSample('memoryUsage', metrics.memoryUsage.percentage);
            }

            // Check for regressions
            const regressions = regressionDetectorRef.current.getAllRegressions();
            setRegressionReports(regressions);
        }
    }, [metrics, enableAlerts, enableDegradationDetection, onDegradation]);

    const drawMiniChart = useCallback((ctx, width, height) => {
        ctx.clearRect(0, 0, width, height);

        const data = chartDataRef.current.fps;
        if (data.length < 2) return;

        const maxValue = Math.max(...data.map(d => d.value), 60);
        const minValue = Math.min(...data.map(d => d.value), 0);
        const range = maxValue - minValue || 1;

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((point.value - minValue) / range) * height;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw target line (60 FPS)
        const targetY = height - ((60 - minValue) / range) * height;
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(0, targetY);
        ctx.lineTo(width, targetY);
        ctx.stroke();
        ctx.setLineDash([]);
    }, []);

    const getStatusColor = useCallback((value, thresholds) => {
        if (value >= thresholds.critical) return 'critical';
        if (value >= thresholds.warning) return 'warning';
        return 'good';
    }, []);

    const formatBytes = useCallback((bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }, []);

    if (!isVisible) return null;

    return (
        <MonitorContainer isMinimized={isMinimized}>
            <Header>
                <Title>Performance Monitor</Title>
                <ToggleButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    aria-label={isMinimized ? 'Expand monitor' : 'Minimize monitor'}
                >
                    <Icon name={isMinimized ? 'chevron-left' : 'chevron-right'} size={16} />
                </ToggleButton>
            </Header>

            {!isMinimized && (
                <>
                    {/* Frame Rate */}
                    <MetricRow>
                        <MetricLabel>Frame Rate:</MetricLabel>
                        <MetricValue status={getStatusColor(metrics?.frameRate || 0, { warning: 30, critical: 15 })}>
                            {metrics?.frameRate?.toFixed(1) || '0.0'} FPS
                        </MetricValue>
                    </MetricRow>
                    <ProgressBar>
                        <ProgressFill
                            value={(metrics?.frameRate || 0) / 60 * 100}
                            status={getStatusColor(metrics?.frameRate || 0, { warning: 30, critical: 15 })}
                        />
                    </ProgressBar>

                    {/* Render Time */}
                    <MetricRow>
                        <MetricLabel>Render Time:</MetricLabel>
                        <MetricValue status={getStatusColor(metrics?.averageRenderTime || 0, { warning: 16, critical: 33 })}>
                            {metrics?.averageRenderTime?.toFixed(1) || '0.0'} ms
                        </MetricValue>
                    </MetricRow>

                    {/* Memory Usage */}
                    <MetricRow>
                        <MetricLabel>Memory:</MetricLabel>
                        <MetricValue status={getStatusColor(metrics?.memoryUsage?.percentage || 0, { warning: 70, critical: 85 })}>
                            {formatBytes(metrics?.memoryUsage?.used || 0)}
                        </MetricValue>
                    </MetricRow>
                    <ProgressBar>
                        <ProgressFill
                            value={metrics?.memoryUsage?.percentage || 0}
                            status={getStatusColor(metrics?.memoryUsage?.percentage || 0, { warning: 70, critical: 85 })}
                        />
                    </ProgressBar>

                    {/* Component Count */}
                    <MetricRow>
                        <MetricLabel>Components:</MetricLabel>
                        <MetricValue>
                            {metrics?.componentCount || 0}
                        </MetricValue>
                    </MetricRow>

                    {/* Performance Score */}
                    <MetricRow>
                        <MetricLabel>Score:</MetricLabel>
                        <MetricValue status={getStatusColor(100 - (metrics?.performanceScore || 100), { warning: 30, critical: 50 })}>
                            {metrics?.performanceScore || 100}/100
                        </MetricValue>
                    </MetricRow>

                    {/* Mini Chart */}
                    <ChartContainer>
                        <MiniChart ref={chartRef} />
                    </ChartContainer>

                    {/* Alerts */}
                    {alerts.length > 0 && (
                        <AlertsContainer>
                            {alerts.map(alert => (
                                <Alert key={alert.id} severity={alert.severity}>
                                    {alert.message}
                                </Alert>
                            ))}
                        </AlertsContainer>
                    )}

                    {/* Performance Degradation */}
                    {enableDegradationDetection && Object.keys(degradationReports).length > 0 && (
                        <DegradationContainer>
                            <MetricLabel style={{ marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>
                                Performance Degradation:
                            </MetricLabel>
                            {Object.entries(degradationReports).map(([metricName, report]) => (
                                report.isDegraded && (
                                    <DegradationItem key={metricName} severity={report.severity}>
                                        <DegradationMetric>
                                            {metricName.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                        </DegradationMetric>
                                        <DegradationPercent severity={report.severity}>
                                            -{(report.degradationPercent * 100).toFixed(1)}%
                                        </DegradationPercent>
                                    </DegradationItem>
                                )
                            ))}
                        </DegradationContainer>
                    )}

                    {/* Performance Regression */}
                    {Object.keys(regressionReports).length > 0 && (
                        <DegradationContainer>
                            <MetricLabel style={{ marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>
                                Performance Regression:
                            </MetricLabel>
                            {Object.entries(regressionReports).map(([metricName, report]) => (
                                <DegradationItem key={`regression-${metricName}`} severity={report.severity}>
                                    <DegradationMetric>
                                        {metricName.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                    </DegradationMetric>
                                    <DegradationPercent severity={report.severity}>
                                        {(report.regressionPercent * 100).toFixed(1)}% worse
                                    </DegradationPercent>
                                </DegradationItem>
                            ))}
                        </DegradationContainer>
                    )}

                    {/* Real-time System Metrics */}
                    {realTimeMetrics && (
                        <DegradationContainer>
                            <MetricLabel style={{ marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>
                                System Metrics:
                            </MetricLabel>

                            {realTimeMetrics.cpu && (
                                <MetricRow>
                                    <MetricLabel>CPU Usage:</MetricLabel>
                                    <MetricValue status={getStatusColor(realTimeMetrics.cpu.average, { warning: 70, critical: 90 })}>
                                        {realTimeMetrics.cpu.average.toFixed(1)}%
                                    </MetricValue>
                                </MetricRow>
                            )}

                            {realTimeMetrics.network && (
                                <MetricRow>
                                    <MetricLabel>Network:</MetricLabel>
                                    <MetricValue>
                                        {realTimeMetrics.network.requests} req/30s
                                    </MetricValue>
                                </MetricRow>
                            )}

                            {realTimeMetrics.dom && (
                                <MetricRow>
                                    <MetricLabel>DOM Changes:</MetricLabel>
                                    <MetricValue status={getStatusColor(realTimeMetrics.dom.mutations, { warning: 100, critical: 200 })}>
                                        {realTimeMetrics.dom.mutations}/30s
                                    </MetricValue>
                                </MetricRow>
                            )}
                        </DegradationContainer>
                    )}

                    {/* Controls */}
                    <MetricRow>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearMetrics}
                        >
                            Clear
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={isMonitoring ? stopMonitoring : startMonitoring}
                        >
                            {isMonitoring ? 'Stop' : 'Start'}
                        </Button>
                    </MetricRow>
                </>
            )}
        </MonitorContainer>
    );
};

export default PerformanceMonitor;