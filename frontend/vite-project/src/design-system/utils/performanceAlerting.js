export class PerformanceAlertManager {
    constructor(config = {}) {
        this.config = {
            // Alert thresholds
            thresholds: {
                frameRate: {
                    warning: 30,
                    critical: 15,
                    emergency: 5
                },
                renderTime: {
                    warning: 16,
                    critical: 33,
                    emergency: 100
                },
                memoryUsage: {
                    warning: 70, // percentage
                    critical: 85,
                    emergency: 95
                },
                memoryLeak: {
                    warning: 10 * 1024 * 1024, // 10MB increase
                    critical: 50 * 1024 * 1024, // 50MB increase
                    emergency: 100 * 1024 * 1024 // 100MB increase
                },
                componentCount: {
                    warning: 1000,
                    critical: 2000,
                    emergency: 5000
                }
            },

            // Alert configuration
            alertCooldown: 30000, // 30 seconds between same alerts
            maxAlerts: 10, // Maximum active alerts
            enableNotifications: true,
            enableConsoleLogging: true,
            enableLocalStorage: true,

            // Escalation settings
            escalationEnabled: true,
            escalationThreshold: 3, // Number of critical alerts before escalation
            escalationCooldown: 300000, // 5 minutes between escalations

            ...config
        };

        this.activeAlerts = new Map();
        this.alertHistory = [];
        this.lastAlertTimes = new Map();
        this.escalationCount = 0;
        this.lastEscalation = 0;

        this.callbacks = {
            onAlert: [],
            onEscalation: [],
            onResolution: []
        };
    }

    /**
     * Check metrics and generate alerts
     */
    checkMetrics(metrics) {
        const alerts = [];
        const timestamp = Date.now();

        // Check frame rate
        if (metrics.frameRate !== undefined) {
            const alert = this.checkThreshold(
                'frameRate',
                metrics.frameRate,
                this.config.thresholds.frameRate,
                'FPS',
                'low',
                timestamp
            );
            if (alert) alerts.push(alert);
        }

        // Check render time
        if (metrics.averageRenderTime !== undefined) {
            const alert = this.checkThreshold(
                'renderTime',
                metrics.averageRenderTime,
                this.config.thresholds.renderTime,
                'ms',
                'high',
                timestamp
            );
            if (alert) alerts.push(alert);
        }

        // Check memory usage
        if (metrics.memoryUsage?.percentage !== undefined) {
            const alert = this.checkThreshold(
                'memoryUsage',
                metrics.memoryUsage.percentage,
                this.config.thresholds.memoryUsage,
                '%',
                'high',
                timestamp
            );
            if (alert) alerts.push(alert);
        }

        // Check component count
        if (metrics.componentCount !== undefined) {
            const alert = this.checkThreshold(
                'componentCount',
                metrics.componentCount,
                this.config.thresholds.componentCount,
                'components',
                'high',
                timestamp
            );
            if (alert) alerts.push(alert);
        }

        // Check memory leak
        if (metrics.memoryTrend === 'increasing' && metrics.memoryIncrease) {
            const alert = this.checkThreshold(
                'memoryLeak',
                metrics.memoryIncrease,
                this.config.thresholds.memoryLeak,
                'bytes',
                'high',
                timestamp
            );
            if (alert) alerts.push(alert);
        }

        // Process alerts
        alerts.forEach(alert => this.processAlert(alert));

        // Check for escalation
        this.checkEscalation();

        return alerts;
    }

    /**
     * Check if a metric exceeds thresholds
     */
    checkThreshold(metricName, value, thresholds, unit, direction, timestamp) {
        let severity = null;
        let exceeded = false;

        if (direction === 'low') {
            if (value <= thresholds.emergency) {
                severity = 'emergency';
                exceeded = true;
            } else if (value <= thresholds.critical) {
                severity = 'critical';
                exceeded = true;
            } else if (value <= thresholds.warning) {
                severity = 'warning';
                exceeded = true;
            }
        } else { // direction === 'high'
            if (value >= thresholds.emergency) {
                severity = 'emergency';
                exceeded = true;
            } else if (value >= thresholds.critical) {
                severity = 'critical';
                exceeded = true;
            } else if (value >= thresholds.warning) {
                severity = 'warning';
                exceeded = true;
            }
        }

        if (!exceeded) {
            // Check if we need to resolve an existing alert
            this.resolveAlert(metricName);
            return null;
        }

        return {
            id: `${metricName}-${severity}`,
            metricName,
            severity,
            value,
            threshold: thresholds[severity],
            unit,
            direction,
            timestamp,
            message: this.generateAlertMessage(metricName, severity, value, unit, direction)
        };
    }

    /**
     * Process a new alert
     */
    processAlert(alert) {
        const alertKey = alert.id;
        const lastAlertTime = this.lastAlertTimes.get(alertKey) || 0;
        const now = Date.now();

        // Check cooldown
        if (now - lastAlertTime < this.config.alertCooldown) {
            return;
        }

        // Update or create alert
        const existingAlert = this.activeAlerts.get(alert.metricName);

        if (!existingAlert || existingAlert.severity !== alert.severity) {
            this.activeAlerts.set(alert.metricName, alert);
            this.alertHistory.push({ ...alert, action: 'created' });
            this.lastAlertTimes.set(alertKey, now);

            // Trigger callbacks
            this.callbacks.onAlert.forEach(callback => {
                try {
                    callback(alert);
                } catch (error) {
                    console.error('Alert callback error:', error);
                }
            });

            // Log alert
            if (this.config.enableConsoleLogging) {
                this.logAlert(alert);
            }

            // Show notification
            if (this.config.enableNotifications) {
                this.showNotification(alert);
            }

            // Store in localStorage
            if (this.config.enableLocalStorage) {
                this.storeAlert(alert);
            }
        }
    }

    /**
     * Resolve an alert
     */
    resolveAlert(metricName) {
        const alert = this.activeAlerts.get(metricName);
        if (alert) {
            this.activeAlerts.delete(metricName);
            this.alertHistory.push({ ...alert, action: 'resolved', resolvedAt: Date.now() });

            // Trigger resolution callbacks
            this.callbacks.onResolution.forEach(callback => {
                try {
                    callback(alert);
                } catch (error) {
                    console.error('Resolution callback error:', error);
                }
            });

            if (this.config.enableConsoleLogging) {
                console.log(`🟢 Performance alert resolved: ${alert.message}`);
            }
        }
    }

    /**
     * Check for escalation conditions
     */
    checkEscalation() {
        if (!this.config.escalationEnabled) return;

        const now = Date.now();
        const criticalAlerts = Array.from(this.activeAlerts.values())
            .filter(alert => alert.severity === 'critical' || alert.severity === 'emergency');

        if (criticalAlerts.length >= this.config.escalationThreshold &&
            now - this.lastEscalation > this.config.escalationCooldown) {

            this.escalate(criticalAlerts);
        }
    }

    /**
     * Escalate critical performance issues
     */
    escalate(alerts) {
        this.escalationCount++;
        this.lastEscalation = Date.now();

        const escalation = {
            id: `escalation-${this.escalationCount}`,
            timestamp: this.lastEscalation,
            alerts: alerts.map(alert => ({ ...alert })),
            count: this.escalationCount
        };

        // Trigger escalation callbacks
        this.callbacks.onEscalation.forEach(callback => {
            try {
                callback(escalation);
            } catch (error) {
                console.error('Escalation callback error:', error);
            }
        });

        if (this.config.enableConsoleLogging) {
            console.error('🚨 PERFORMANCE ESCALATION:', escalation);
        }

        // Store escalation
        if (this.config.enableLocalStorage) {
            this.storeEscalation(escalation);
        }
    }

    /**
     * Generate alert message
     */
    generateAlertMessage(metricName, severity, value, unit, direction) {
        const severityEmoji = {
            warning: '⚠️',
            critical: '🔴',
            emergency: '🚨'
        };

        const metricDisplayNames = {
            frameRate: 'Frame Rate',
            renderTime: 'Render Time',
            memoryUsage: 'Memory Usage',
            memoryLeak: 'Memory Leak',
            componentCount: 'Component Count'
        };

        const displayName = metricDisplayNames[metricName] || metricName;
        const emoji = severityEmoji[severity] || '⚠️';
        const directionText = direction === 'low' ? 'low' : 'high';

        return `${emoji} ${severity.toUpperCase()}: ${displayName} is ${directionText} (${value}${unit})`;
    }

    /**
     * Log alert to console
     */
    logAlert(alert) {
        const logMethod = {
            warning: 'warn',
            critical: 'error',
            emergency: 'error'
        }[alert.severity] || 'log';

        console[logMethod](`Performance Alert: ${alert.message}`, {
            metric: alert.metricName,
            value: alert.value,
            threshold: alert.threshold,
            timestamp: new Date(alert.timestamp).toISOString()
        });
    }

    /**
     * Show browser notification
     */
    showNotification(alert) {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            new Notification('Performance Alert', {
                body: alert.message,
                icon: '/favicon.ico',
                tag: alert.id,
                requireInteraction: alert.severity === 'emergency'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showNotification(alert);
                }
            });
        }
    }

    /**
     * Store alert in localStorage
     */
    storeAlert(alert) {
        try {
            const stored = JSON.parse(localStorage.getItem('performanceAlerts') || '[]');
            stored.push(alert);

            // Keep only last 100 alerts
            if (stored.length > 100) {
                stored.splice(0, stored.length - 100);
            }

            localStorage.setItem('performanceAlerts', JSON.stringify(stored));
        } catch (error) {
            console.warn('Failed to store alert:', error);
        }
    }

    /**
     * Store escalation in localStorage
     */
    storeEscalation(escalation) {
        try {
            const stored = JSON.parse(localStorage.getItem('performanceEscalations') || '[]');
            stored.push(escalation);

            // Keep only last 20 escalations
            if (stored.length > 20) {
                stored.splice(0, stored.length - 20);
            }

            localStorage.setItem('performanceEscalations', JSON.stringify(stored));
        } catch (error) {
            console.warn('Failed to store escalation:', error);
        }
    }

    /**
     * Register callback for alerts
     */
    onAlert(callback) {
        this.callbacks.onAlert.push(callback);
        return () => {
            const index = this.callbacks.onAlert.indexOf(callback);
            if (index > -1) {
                this.callbacks.onAlert.splice(index, 1);
            }
        };
    }

    /**
     * Register callback for escalations
     */
    onEscalation(callback) {
        this.callbacks.onEscalation.push(callback);
        return () => {
            const index = this.callbacks.onEscalation.indexOf(callback);
            if (index > -1) {
                this.callbacks.onEscalation.splice(index, 1);
            }
        };
    }

    /**
     * Register callback for resolutions
     */
    onResolution(callback) {
        this.callbacks.onResolution.push(callback);
        return () => {
            const index = this.callbacks.onResolution.indexOf(callback);
            if (index > -1) {
                this.callbacks.onResolution.splice(index, 1);
            }
        };
    }

    /**
     * Get active alerts
     */
    getActiveAlerts() {
        return Array.from(this.activeAlerts.values());
    }

    /**
     * Get alert history
     */
    getAlertHistory(limit = 50) {
        return this.alertHistory.slice(-limit);
    }

    /**
     * Get stored alerts from localStorage
     */
    getStoredAlerts() {
        try {
            return JSON.parse(localStorage.getItem('performanceAlerts') || '[]');
        } catch (error) {
            console.warn('Failed to retrieve stored alerts:', error);
            return [];
        }
    }

    /**
     * Get stored escalations from localStorage
     */
    getStoredEscalations() {
        try {
            return JSON.parse(localStorage.getItem('performanceEscalations') || '[]');
        } catch (error) {
            console.warn('Failed to retrieve stored escalations:', error);
            return [];
        }
    }

    /**
     * Clear all alerts
     */
    clearAlerts() {
        this.activeAlerts.clear();
        this.alertHistory = [];
        this.lastAlertTimes.clear();
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Get alert statistics
     */
    getStatistics() {
        const now = Date.now();
        const last24Hours = now - (24 * 60 * 60 * 1000);
        const lastHour = now - (60 * 60 * 1000);

        const recentAlerts = this.alertHistory.filter(alert => alert.timestamp > last24Hours);
        const hourlyAlerts = this.alertHistory.filter(alert => alert.timestamp > lastHour);

        const severityCounts = recentAlerts.reduce((counts, alert) => {
            counts[alert.severity] = (counts[alert.severity] || 0) + 1;
            return counts;
        }, {});

        const metricCounts = recentAlerts.reduce((counts, alert) => {
            counts[alert.metricName] = (counts[alert.metricName] || 0) + 1;
            return counts;
        }, {});

        return {
            activeAlerts: this.activeAlerts.size,
            totalAlerts: this.alertHistory.length,
            alerts24h: recentAlerts.length,
            alertsLastHour: hourlyAlerts.length,
            escalationCount: this.escalationCount,
            severityBreakdown: severityCounts,
            metricBreakdown: metricCounts,
            lastEscalation: this.lastEscalation
        };
    }
}

/**
 * Performance Degradation Detector
 * Detects gradual performance degradation over time
 */
export class PerformanceDegradationDetector {
    constructor(config = {}) {
        this.config = {
            windowSize: 50, // Number of samples to analyze
            degradationThreshold: 0.15, // 15% degradation threshold
            minSamples: 10, // Minimum samples before detection
            smoothingFactor: 0.3, // Exponential smoothing factor
            ...config
        };

        this.metrics = {
            frameRate: [],
            renderTime: [],
            memoryUsage: []
        };

        this.baselines = {};
        this.trends = {};
    }

    /**
     * Add metric sample
     */
    addSample(metricName, value, timestamp = Date.now()) {
        if (!this.metrics[metricName]) {
            this.metrics[metricName] = [];
        }

        this.metrics[metricName].push({ value, timestamp });

        // Maintain window size
        if (this.metrics[metricName].length > this.config.windowSize) {
            this.metrics[metricName].shift();
        }

        // Update baseline if not set
        if (!this.baselines[metricName] && this.metrics[metricName].length >= this.config.minSamples) {
            this.baselines[metricName] = this.calculateBaseline(metricName);
        }

        // Update trend
        this.updateTrend(metricName);
    }

    /**
     * Calculate baseline performance
     */
    calculateBaseline(metricName) {
        const samples = this.metrics[metricName];
        if (samples.length < this.config.minSamples) return null;

        // Use first 20% of samples as baseline
        const baselineSamples = samples.slice(0, Math.max(this.config.minSamples, Math.floor(samples.length * 0.2)));
        const values = baselineSamples.map(sample => sample.value);

        return {
            mean: values.reduce((sum, val) => sum + val, 0) / values.length,
            median: this.calculateMedian(values),
            p95: this.calculatePercentile(values, 95),
            timestamp: Date.now()
        };
    }

    /**
     * Update performance trend
     */
    updateTrend(metricName) {
        const samples = this.metrics[metricName];
        if (samples.length < this.config.minSamples) return;

        const recentSamples = samples.slice(-Math.min(20, samples.length));
        const values = recentSamples.map(sample => sample.value);

        // Calculate exponentially weighted moving average
        let ewma = values[0];
        for (let i = 1; i < values.length; i++) {
            ewma = this.config.smoothingFactor * values[i] + (1 - this.config.smoothingFactor) * ewma;
        }

        // Calculate linear trend
        const trend = this.calculateLinearTrend(values);

        this.trends[metricName] = {
            ewma,
            trend,
            direction: trend > 0 ? 'improving' : trend < 0 ? 'degrading' : 'stable',
            confidence: this.calculateTrendConfidence(values),
            timestamp: Date.now()
        };
    }

    /**
     * Detect performance degradation
     */
    detectDegradation(metricName) {
        const baseline = this.baselines[metricName];
        const trend = this.trends[metricName];
        const samples = this.metrics[metricName];

        if (!baseline || !trend || samples.length < this.config.minSamples) {
            return null;
        }

        const recentValues = samples.slice(-10).map(sample => sample.value);
        const recentMean = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;

        // Calculate degradation percentage
        let degradationPercent;
        if (metricName === 'frameRate') {
            // For frame rate, lower is worse
            degradationPercent = (baseline.mean - recentMean) / baseline.mean;
        } else {
            // For render time and memory, higher is worse
            degradationPercent = (recentMean - baseline.mean) / baseline.mean;
        }

        const isDegraded = degradationPercent > this.config.degradationThreshold;

        return {
            metricName,
            isDegraded,
            degradationPercent,
            baseline: baseline.mean,
            current: recentMean,
            trend: trend.direction,
            confidence: trend.confidence,
            severity: this.calculateDegradationSeverity(degradationPercent),
            timestamp: Date.now()
        };
    }

    /**
     * Calculate degradation severity
     */
    calculateDegradationSeverity(degradationPercent) {
        if (degradationPercent > 0.5) return 'critical';
        if (degradationPercent > 0.3) return 'high';
        if (degradationPercent > 0.15) return 'medium';
        return 'low';
    }

    /**
     * Calculate linear trend
     */
    calculateLinearTrend(values) {
        const n = values.length;
        if (n < 2) return 0;

        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
        const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }

    /**
     * Calculate trend confidence
     */
    calculateTrendConfidence(values) {
        if (values.length < 5) return 0;

        const trend = this.calculateLinearTrend(values);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        // Confidence based on trend strength relative to variance
        const trendStrength = Math.abs(trend);
        const relativeStrength = trendStrength / (stdDev || 1);

        return Math.min(1, relativeStrength / 2);
    }

    /**
     * Calculate median
     */
    calculateMedian(values) {
        const sorted = values.slice().sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    /**
     * Calculate percentile
     */
    calculatePercentile(values, percentile) {
        const sorted = values.slice().sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }

    /**
     * Get all degradation reports
     */
    getAllDegradationReports() {
        const reports = {};
        Object.keys(this.metrics).forEach(metricName => {
            const report = this.detectDegradation(metricName);
            if (report) {
                reports[metricName] = report;
            }
        });
        return reports;
    }

    /**
     * Reset detector
     */
    reset() {
        this.metrics = {
            frameRate: [],
            renderTime: [],
            memoryUsage: []
        };
        this.baselines = {};
        this.trends = {};
    }

    /**
     * Get detector statistics
     */
    getStatistics() {
        return {
            metrics: Object.keys(this.metrics).reduce((stats, metricName) => {
                stats[metricName] = {
                    sampleCount: this.metrics[metricName].length,
                    hasBaseline: !!this.baselines[metricName],
                    trend: this.trends[metricName]?.direction || 'unknown'
                };
                return stats;
            }, {}),
            totalSamples: Object.values(this.metrics).reduce((total, samples) => total + samples.length, 0)
        };
    }
}

export default PerformanceAlertManager;