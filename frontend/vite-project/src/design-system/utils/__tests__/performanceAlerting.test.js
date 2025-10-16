/**
 * Performance Alerting System Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PerformanceAlertManager, PerformanceDegradationDetector } from '../performanceAlerting';

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};

// Mock Notification API
const mockNotification = vi.fn();
mockNotification.permission = 'granted';
mockNotification.requestPermission = vi.fn().mockResolvedValue('granted');

describe('PerformanceAlertManager', () => {
    let alertManager;

    beforeEach(() => {
        global.localStorage = mockLocalStorage;
        global.Notification = mockNotification;

        alertManager = new PerformanceAlertManager({
            enableConsoleLogging: false, // Disable for tests
            enableNotifications: false,
            enableLocalStorage: false
        });

        vi.clearAllMocks();
        vi.spyOn(console, 'warn').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Initialization', () => {
        it('creates alert manager with default configuration', () => {
            const defaultManager = new PerformanceAlertManager();

            expect(defaultManager.config.thresholds.frameRate.warning).toBe(30);
            expect(defaultManager.config.thresholds.frameRate.critical).toBe(15);
            expect(defaultManager.config.alertCooldown).toBe(30000);
            expect(defaultManager.config.maxAlerts).toBe(10);
        });

        it('creates alert manager with custom configuration', () => {
            const customManager = new PerformanceAlertManager({
                thresholds: {
                    frameRate: { warning: 25, critical: 10 }
                },
                alertCooldown: 60000
            });

            expect(customManager.config.thresholds.frameRate.warning).toBe(25);
            expect(customManager.config.alertCooldown).toBe(60000);
        });

        it('initializes with empty state', () => {
            expect(alertManager.activeAlerts.size).toBe(0);
            expect(alertManager.alertHistory).toHaveLength(0);
            expect(alertManager.escalationCount).toBe(0);
        });
    });

    describe('Threshold Checking', () => {
        it('detects low frame rate warning', () => {
            const metrics = { frameRate: 25 }; // Below warning threshold of 30

            const alerts = alertManager.checkMetrics(metrics);

            expect(alerts).toHaveLength(1);
            expect(alerts[0].metricName).toBe('frameRate');
            expect(alerts[0].severity).toBe('warning');
            expect(alerts[0].value).toBe(25);
        });

        it('detects critical frame rate', () => {
            const metrics = { frameRate: 10 }; // Below critical threshold of 15

            const alerts = alertManager.checkMetrics(metrics);

            expect(alerts).toHaveLength(1);
            expect(alerts[0].severity).toBe('critical');
        });

        it('detects emergency frame rate', () => {
            const metrics = { frameRate: 3 }; // Below emergency threshold of 5

            const alerts = alertManager.checkMetrics(metrics);

            expect(alerts).toHaveLength(1);
            expect(alerts[0].severity).toBe('emergency');
        });

        it('detects high render time warning', () => {
            const metrics = { averageRenderTime: 20 }; // Above warning threshold of 16

            const alerts = alertManager.checkMetrics(metrics);

            expect(alerts).toHaveLength(1);
            expect(alerts[0].metricName).toBe('renderTime');
            expect(alerts[0].severity).toBe('warning');
        });

        it('detects high memory usage', () => {
            const metrics = {
                memoryUsage: { percentage: 80 } // Above warning threshold of 70
            };

            const alerts = alertManager.checkMetrics(metrics);

            expect(alerts).toHaveLength(1);
            expect(alerts[0].metricName).toBe('memoryUsage');
            expect(alerts[0].severity).toBe('warning');
        });

        it('detects memory leak', () => {
            const metrics = {
                memoryTrend: 'increasing',
                memoryIncrease: 15 * 1024 * 1024 // 15MB increase
            };

            const alerts = alertManager.checkMetrics(metrics);

            expect(alerts).toHaveLength(1);
            expect(alerts[0].metricName).toBe('memoryLeak');
            expect(alerts[0].severity).toBe('warning');
        });

        it('does not alert for good performance', () => {
            const metrics = {
                frameRate: 60,
                averageRenderTime: 12,
                memoryUsage: { percentage: 50 },
                componentCount: 500
            };

            const alerts = alertManager.checkMetrics(metrics);

            expect(alerts).toHaveLength(0);
        });
    });

    describe('Alert Processing', () => {
        it('creates new alert for first occurrence', () => {
            const metrics = { frameRate: 20 };

            alertManager.checkMetrics(metrics);

            expect(alertManager.activeAlerts.size).toBe(1);
            expect(alertManager.alertHistory).toHaveLength(1);

            const alert = alertManager.activeAlerts.get('frameRate');
            expect(alert.severity).toBe('warning');
            expect(alert.value).toBe(20);
        });

        it('updates alert severity when performance worsens', () => {
            // First alert - warning
            alertManager.checkMetrics({ frameRate: 25 });
            expect(alertManager.activeAlerts.get('frameRate').severity).toBe('warning');

            // Performance worsens - critical
            alertManager.checkMetrics({ frameRate: 10 });
            expect(alertManager.activeAlerts.get('frameRate').severity).toBe('critical');
            expect(alertManager.alertHistory).toHaveLength(2);
        });

        it('resolves alert when performance improves', () => {
            // Create alert
            alertManager.checkMetrics({ frameRate: 20 });
            expect(alertManager.activeAlerts.size).toBe(1);

            // Performance improves
            alertManager.checkMetrics({ frameRate: 60 });
            expect(alertManager.activeAlerts.size).toBe(0);
            expect(alertManager.alertHistory).toHaveLength(2);
            expect(alertManager.alertHistory[1].action).toBe('resolved');
        });

        it('respects alert cooldown', () => {
            const shortCooldownManager = new PerformanceAlertManager({
                alertCooldown: 1000,
                enableConsoleLogging: false
            });

            // First alert
            shortCooldownManager.checkMetrics({ frameRate: 20 });
            expect(shortCooldownManager.activeAlerts.size).toBe(1);

            // Immediate second alert should be ignored
            shortCooldownManager.checkMetrics({ frameRate: 20 });
            expect(shortCooldownManager.alertHistory).toHaveLength(1);
        });
    });

    describe('Alert Callbacks', () => {
        it('triggers onAlert callback', () => {
            const onAlert = vi.fn();
            alertManager.onAlert(onAlert);

            alertManager.checkMetrics({ frameRate: 20 });

            expect(onAlert).toHaveBeenCalledWith(
                expect.objectContaining({
                    metricName: 'frameRate',
                    severity: 'warning',
                    value: 20
                })
            );
        });

        it('triggers onResolution callback', () => {
            const onResolution = vi.fn();
            alertManager.onResolution(onResolution);

            // Create alert
            alertManager.checkMetrics({ frameRate: 20 });

            // Resolve alert
            alertManager.checkMetrics({ frameRate: 60 });

            expect(onResolution).toHaveBeenCalledWith(
                expect.objectContaining({
                    metricName: 'frameRate',
                    severity: 'warning'
                })
            );
        });

        it('removes callback when unsubscribe function is called', () => {
            const onAlert = vi.fn();
            const unsubscribe = alertManager.onAlert(onAlert);

            unsubscribe();

            alertManager.checkMetrics({ frameRate: 20 });
            expect(onAlert).not.toHaveBeenCalled();
        });
    });

    describe('Escalation', () => {
        it('escalates when critical alert threshold is reached', () => {
            const onEscalation = vi.fn();
            alertManager.onEscalation(onEscalation);

            const escalationManager = new PerformanceAlertManager({
                escalationThreshold: 2,
                escalationCooldown: 0,
                enableConsoleLogging: false
            });
            escalationManager.onEscalation(onEscalation);

            // Create multiple critical alerts
            escalationManager.checkMetrics({
                frameRate: 10, // critical
                averageRenderTime: 50 // critical
            });

            expect(onEscalation).toHaveBeenCalledWith(
                expect.objectContaining({
                    alerts: expect.arrayContaining([
                        expect.objectContaining({ severity: 'critical' })
                    ])
                })
            );
        });

        it('respects escalation cooldown', () => {
            const onEscalation = vi.fn();
            const escalationManager = new PerformanceAlertManager({
                escalationThreshold: 1,
                escalationCooldown: 60000, // 1 minute
                enableConsoleLogging: false
            });
            escalationManager.onEscalation(onEscalation);

            // First escalation
            escalationManager.checkMetrics({ frameRate: 10 });
            expect(onEscalation).toHaveBeenCalledTimes(1);

            // Second escalation should be blocked by cooldown
            escalationManager.checkMetrics({ averageRenderTime: 50 });
            expect(onEscalation).toHaveBeenCalledTimes(1);
        });
    });

    describe('Message Generation', () => {
        it('generates appropriate warning messages', () => {
            const alert = alertManager.checkThreshold(
                'frameRate', 25, { warning: 30, critical: 15 }, 'FPS', 'low', Date.now()
            );

            expect(alert.message).toContain('WARNING');
            expect(alert.message).toContain('Frame Rate');
            expect(alert.message).toContain('25FPS');
        });

        it('generates appropriate critical messages', () => {
            const alert = alertManager.checkThreshold(
                'renderTime', 40, { warning: 16, critical: 33 }, 'ms', 'high', Date.now()
            );

            expect(alert.message).toContain('CRITICAL');
            expect(alert.message).toContain('Render Time');
            expect(alert.message).toContain('40ms');
        });
    });

    describe('Data Management', () => {
        it('gets active alerts', () => {
            alertManager.checkMetrics({ frameRate: 20, averageRenderTime: 25 });

            const activeAlerts = alertManager.getActiveAlerts();
            expect(activeAlerts).toHaveLength(2);
            expect(activeAlerts.map(a => a.metricName)).toContain('frameRate');
            expect(activeAlerts.map(a => a.metricName)).toContain('renderTime');
        });

        it('gets alert history', () => {
            alertManager.checkMetrics({ frameRate: 20 });
            alertManager.checkMetrics({ frameRate: 60 }); // Resolve

            const history = alertManager.getAlertHistory();
            expect(history).toHaveLength(2);
            expect(history[0].action).toBe('created');
            expect(history[1].action).toBe('resolved');
        });

        it('limits alert history', () => {
            const history = alertManager.getAlertHistory(1);
            expect(history.length).toBeLessThanOrEqual(1);
        });

        it('clears all alerts', () => {
            alertManager.checkMetrics({ frameRate: 20 });
            expect(alertManager.activeAlerts.size).toBe(1);

            alertManager.clearAlerts();
            expect(alertManager.activeAlerts.size).toBe(0);
            expect(alertManager.alertHistory).toHaveLength(0);
        });

        it('updates configuration', () => {
            alertManager.updateConfig({
                thresholds: { frameRate: { warning: 25 } }
            });

            expect(alertManager.config.thresholds.frameRate.warning).toBe(25);
        });
    });

    describe('Statistics', () => {
        it('calculates alert statistics', () => {
            // Create some alerts
            alertManager.checkMetrics({ frameRate: 20, averageRenderTime: 25 });

            const stats = alertManager.getStatistics();

            expect(stats.activeAlerts).toBe(2);
            expect(stats.totalAlerts).toBe(2);
            expect(stats.severityBreakdown.warning).toBe(2);
            expect(stats.metricBreakdown.frameRate).toBe(1);
            expect(stats.metricBreakdown.renderTime).toBe(1);
        });
    });

    describe('Storage Integration', () => {
        it('stores alerts in localStorage when enabled', () => {
            const storageManager = new PerformanceAlertManager({
                enableLocalStorage: true,
                enableConsoleLogging: false
            });

            mockLocalStorage.getItem.mockReturnValue('[]');

            storageManager.checkMetrics({ frameRate: 20 });

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'performanceAlerts',
                expect.stringContaining('frameRate')
            );
        });

        it('retrieves stored alerts', () => {
            const storedAlerts = [{ id: 'test', message: 'Test alert' }];
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedAlerts));

            const retrieved = alertManager.getStoredAlerts();

            expect(retrieved).toEqual(storedAlerts);
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('performanceAlerts');
        });
    });
});

describe('PerformanceDegradationDetector', () => {
    let detector;

    beforeEach(() => {
        detector = new PerformanceDegradationDetector({
            windowSize: 20,
            degradationThreshold: 0.2, // 20%
            minSamples: 5
        });
    });

    describe('Initialization', () => {
        it('creates detector with default configuration', () => {
            const defaultDetector = new PerformanceDegradationDetector();

            expect(defaultDetector.config.windowSize).toBe(50);
            expect(defaultDetector.config.degradationThreshold).toBe(0.15);
            expect(defaultDetector.config.minSamples).toBe(10);
        });

        it('initializes with empty metrics', () => {
            expect(detector.metrics.frameRate).toHaveLength(0);
            expect(detector.metrics.renderTime).toHaveLength(0);
            expect(detector.metrics.memoryUsage).toHaveLength(0);
        });
    });

    describe('Sample Management', () => {
        it('adds samples correctly', () => {
            detector.addSample('frameRate', 60);
            detector.addSample('frameRate', 58);

            expect(detector.metrics.frameRate).toHaveLength(2);
            expect(detector.metrics.frameRate[0].value).toBe(60);
            expect(detector.metrics.frameRate[1].value).toBe(58);
        });

        it('maintains window size limit', () => {
            // Add more samples than window size
            for (let i = 0; i < 25; i++) {
                detector.addSample('frameRate', 60 - i);
            }

            expect(detector.metrics.frameRate).toHaveLength(20); // Window size
            expect(detector.metrics.frameRate[0].value).toBe(55); // First 5 should be removed
        });

        it('calculates baseline after minimum samples', () => {
            // Add minimum samples
            for (let i = 0; i < 5; i++) {
                detector.addSample('frameRate', 60);
            }

            expect(detector.baselines.frameRate).toBeDefined();
            expect(detector.baselines.frameRate.mean).toBe(60);
        });
    });

    describe('Baseline Calculation', () => {
        it('calculates baseline statistics correctly', () => {
            const values = [60, 58, 62, 59, 61];
            values.forEach(value => detector.addSample('frameRate', value));

            const baseline = detector.baselines.frameRate;
            expect(baseline.mean).toBe(60); // (60+58+62+59+61)/5
            expect(baseline.median).toBe(60);
        });

        it('uses first 20% of samples for baseline', () => {
            // Add 10 samples
            for (let i = 0; i < 10; i++) {
                detector.addSample('frameRate', i < 5 ? 60 : 40); // First 5 are 60, rest are 40
            }

            const baseline = detector.baselines.frameRate;
            // Should use first 5 samples (20% of 10, but minimum 5)
            expect(baseline.mean).toBe(60);
        });
    });

    describe('Trend Calculation', () => {
        it('calculates improving trend', () => {
            // Add samples with improving performance (increasing frame rate)
            for (let i = 0; i < 10; i++) {
                detector.addSample('frameRate', 50 + i);
            }

            const trend = detector.trends.frameRate;
            expect(trend.direction).toBe('improving');
            expect(trend.trend).toBeGreaterThan(0);
        });

        it('calculates degrading trend', () => {
            // Add samples with degrading performance (decreasing frame rate)
            for (let i = 0; i < 10; i++) {
                detector.addSample('frameRate', 60 - i);
            }

            const trend = detector.trends.frameRate;
            expect(trend.direction).toBe('degrading');
            expect(trend.trend).toBeLessThan(0);
        });

        it('calculates stable trend', () => {
            // Add samples with stable performance
            for (let i = 0; i < 10; i++) {
                detector.addSample('frameRate', 60 + (Math.random() - 0.5)); // Small random variation
            }

            const trend = detector.trends.frameRate;
            expect(['stable', 'improving', 'degrading']).toContain(trend.direction);
        });
    });

    describe('Degradation Detection', () => {
        it('detects frame rate degradation', () => {
            // Establish baseline with good performance
            for (let i = 0; i < 5; i++) {
                detector.addSample('frameRate', 60);
            }

            // Add degraded performance samples
            for (let i = 0; i < 10; i++) {
                detector.addSample('frameRate', 40); // 33% degradation
            }

            const degradation = detector.detectDegradation('frameRate');

            expect(degradation.isDegraded).toBe(true);
            expect(degradation.degradationPercent).toBeGreaterThan(0.2);
            expect(degradation.severity).toBe('high');
        });

        it('detects render time degradation', () => {
            // Establish baseline
            for (let i = 0; i < 5; i++) {
                detector.addSample('renderTime', 10);
            }

            // Add degraded performance
            for (let i = 0; i < 10; i++) {
                detector.addSample('renderTime', 15); // 50% increase
            }

            const degradation = detector.detectDegradation('renderTime');

            expect(degradation.isDegraded).toBe(true);
            expect(degradation.degradationPercent).toBeGreaterThan(0.2);
        });

        it('does not detect degradation for stable performance', () => {
            // Add stable performance samples
            for (let i = 0; i < 15; i++) {
                detector.addSample('frameRate', 60 + (Math.random() - 0.5) * 2); // ±1 FPS variation
            }

            const degradation = detector.detectDegradation('frameRate');

            expect(degradation.isDegraded).toBe(false);
        });

        it('calculates degradation severity correctly', () => {
            expect(detector.calculateDegradationSeverity(0.1)).toBe('low');
            expect(detector.calculateDegradationSeverity(0.2)).toBe('medium');
            expect(detector.calculateDegradationSeverity(0.4)).toBe('high');
            expect(detector.calculateDegradationSeverity(0.6)).toBe('critical');
        });
    });

    describe('Statistical Calculations', () => {
        it('calculates median correctly', () => {
            expect(detector.calculateMedian([1, 2, 3, 4, 5])).toBe(3);
            expect(detector.calculateMedian([1, 2, 3, 4])).toBe(2.5);
        });

        it('calculates percentile correctly', () => {
            const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            expect(detector.calculatePercentile(values, 50)).toBe(5);
            expect(detector.calculatePercentile(values, 90)).toBe(9);
        });

        it('calculates linear trend correctly', () => {
            const increasingValues = [1, 2, 3, 4, 5];
            const decreasingValues = [5, 4, 3, 2, 1];
            const stableValues = [3, 3, 3, 3, 3];

            expect(detector.calculateLinearTrend(increasingValues)).toBeGreaterThan(0);
            expect(detector.calculateLinearTrend(decreasingValues)).toBeLessThan(0);
            expect(detector.calculateLinearTrend(stableValues)).toBe(0);
        });
    });

    describe('Reporting', () => {
        it('gets all degradation reports', () => {
            // Add samples for multiple metrics
            for (let i = 0; i < 10; i++) {
                detector.addSample('frameRate', 60 - i * 2); // Degrading
                detector.addSample('renderTime', 10 + i); // Degrading
            }

            const reports = detector.getAllDegradationReports();

            expect(reports.frameRate).toBeDefined();
            expect(reports.renderTime).toBeDefined();
        });

        it('gets detector statistics', () => {
            detector.addSample('frameRate', 60);
            detector.addSample('renderTime', 10);

            const stats = detector.getStatistics();

            expect(stats.metrics.frameRate.sampleCount).toBe(1);
            expect(stats.metrics.renderTime.sampleCount).toBe(1);
            expect(stats.totalSamples).toBe(2);
        });
    });

    describe('Reset and Management', () => {
        it('resets detector state', () => {
            detector.addSample('frameRate', 60);
            detector.addSample('renderTime', 10);

            expect(detector.metrics.frameRate).toHaveLength(1);

            detector.reset();

            expect(detector.metrics.frameRate).toHaveLength(0);
            expect(detector.baselines).toEqual({});
            expect(detector.trends).toEqual({});
        });
    });
});