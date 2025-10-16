import React from 'react';

/**
 * WebSocket connection states
 */
export const WS_STATES = {
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    DISCONNECTED: 'DISCONNECTED',
    RECONNECTING: 'RECONNECTING',
    ERROR: 'ERROR',
    CLOSED: 'CLOSED'
};

/**
 * Message types for different data streams
 */
export const MESSAGE_TYPES = {
    SUBSCRIBE: 'subscribe',
    UNSUBSCRIBE: 'unsubscribe',
    HEARTBEAT: 'heartbeat',
    PRICE_UPDATE: 'price_update',
    ORDERBOOK_UPDATE: 'orderbook_update',
    TRADE_UPDATE: 'trade_update',
    TICKER_UPDATE: 'ticker_update',
    ERROR: 'error',
    PONG: 'pong'
};

/**
 * Enhanced WebSocket Manager Class
 * Professional-grade connection handling with advanced features
 */
export class WebSocketManager {
    constructor(options = {}) {
        this.url = options.url || 'wss://api.example.com/ws';
        this.protocols = options.protocols || [];
        this.reconnectInterval = options.reconnectInterval || 5000;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
        this.heartbeatInterval = options.heartbeatInterval || 30000;
        this.messageTimeout = options.messageTimeout || 10000;
        this.debug = options.debug || false;

        // Enhanced configuration
        this.enableCompression = options.enableCompression !== false;
        this.maxMessageSize = options.maxMessageSize || 1024 * 1024; // 1MB
        this.throttleInterval = options.throttleInterval || 16; // ~60fps
        this.batchSize = options.batchSize || 10;
        this.enableMetrics = options.enableMetrics !== false;

        // Connection state
        this.ws = null;
        this.state = WS_STATES.DISCONNECTED;
        this.reconnectAttempts = 0;
        this.lastHeartbeat = null;
        this.connectionId = null;

        // Event handlers
        this.eventHandlers = new Map();
        this.subscriptions = new Set();
        this.messageQueue = [];

        // Timers
        this.reconnectTimer = null;
        this.heartbeatTimer = null;
        this.messageTimeoutTimer = null;

        // Enhanced metrics
        this.metrics = {
            messagesReceived: 0,
            messagesSent: 0,
            reconnectCount: 0,
            lastConnected: null,
            totalUptime: 0,
            errors: [],

            // Performance metrics
            latency: 0,
            averageLatency: 0,
            messageRate: 0,
            errorRate: 0,
            connectionStability: 100,

            // Memory metrics
            memoryUsage: 0,
            queueSize: 0,
            subscriptionCount: 0,

            // Bandwidth metrics
            bytesReceived: 0,
            bytesSent: 0,
            compressionRatio: 1
        };

        // Performance monitoring
        this.performanceMonitor = {
            lastMessageTime: null,
            messageTimestamps: [],
            errorTimestamps: [],
            latencyMeasurements: []
        };

        // Message batching and throttling
        this.messageBatch = [];
        this.throttleTimer = null;
        this.lastThrottleTime = 0;

        // Bind methods
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.send = this.send.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
    }

    /**
     * Connect to WebSocket server
     */
    connect() {
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
            this.log('Already connected or connecting');
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            try {
                this.setState(WS_STATES.CONNECTING);
                this.ws = new WebSocket(this.url, this.protocols);

                this.ws.onopen = (event) => {
                    this.log('WebSocket connected');
                    this.setState(WS_STATES.CONNECTED);
                    this.reconnectAttempts = 0;
                    this.metrics.lastConnected = Date.now();
                    this.connectionId = this.generateConnectionId();

                    // Start heartbeat
                    this.startHeartbeat();

                    // Send queued messages
                    this.flushMessageQueue();

                    // Re-subscribe to channels
                    this.resubscribe();

                    this.emit('connected', { connectionId: this.connectionId });
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    this.handleMessage(event);
                };

                this.ws.onclose = (event) => {
                    this.handleClose(event);
                };

                this.ws.onerror = (event) => {
                    this.handleError(event);
                    reject(new Error('WebSocket connection failed'));
                };

            } catch (error) {
                this.log('Connection error:', error);
                this.setState(WS_STATES.ERROR);
                reject(error);
            }
        });
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        this.log('Disconnecting WebSocket');

        // Clear timers
        this.clearTimers();

        // Close connection
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }

        this.setState(WS_STATES.DISCONNECTED);
        this.emit('disconnected');
    }

    /**
     * Enhanced message sending with batching and throttling
     */
    send(message, options = {}) {
        const { priority = 'normal', batch = false, timestamp = Date.now() } = options;

        if (!this.isConnected()) {
            this.log('Not connected, queuing message:', message);
            this.messageQueue.push({ message, options, timestamp });
            this.metrics.queueSize = this.messageQueue.length;
            return false;
        }

        try {
            const messageStr = typeof message === 'string' ? message : JSON.stringify(message);

            // Check message size
            if (messageStr.length > this.maxMessageSize) {
                throw new Error(`Message size exceeds limit: ${messageStr.length} > ${this.maxMessageSize}`);
            }

            // Handle batching for non-priority messages
            if (batch && priority !== 'high') {
                this.messageBatch.push({ message: messageStr, timestamp });

                if (this.messageBatch.length >= this.batchSize) {
                    this.flushMessageBatch();
                } else {
                    this.scheduleMessageBatch();
                }

                return true;
            }

            // Send immediately for high priority or non-batched messages
            this.ws.send(messageStr);
            this.metrics.messagesSent++;
            this.metrics.bytesSent += messageStr.length;

            // Track latency for heartbeat messages
            if (message.type === MESSAGE_TYPES.HEARTBEAT) {
                this.performanceMonitor.lastMessageTime = timestamp;
            }

            this.log('Message sent:', message);
            return true;
        } catch (error) {
            this.log('Send error:', error);
            this.handleError(error);
            return false;
        }
    }

    /**
     * Flush batched messages
     */
    flushMessageBatch() {
        if (this.messageBatch.length === 0) return;

        try {
            const batchMessage = {
                type: 'batch',
                messages: this.messageBatch.map(item => item.message),
                timestamp: Date.now()
            };

            const messageStr = JSON.stringify(batchMessage);
            this.ws.send(messageStr);

            this.metrics.messagesSent += this.messageBatch.length;
            this.metrics.bytesSent += messageStr.length;

            this.log(`Sent batch of ${this.messageBatch.length} messages`);
            this.messageBatch = [];

        } catch (error) {
            this.log('Batch send error:', error);
            this.handleError(error);
        }
    }

    /**
     * Schedule message batch flush
     */
    scheduleMessageBatch() {
        if (this.throttleTimer) return;

        this.throttleTimer = setTimeout(() => {
            this.flushMessageBatch();
            this.throttleTimer = null;
        }, this.throttleInterval);
    }

    /**
     * Subscribe to data channel
     */
    subscribe(channel, params = {}) {
        const subscription = {
            type: MESSAGE_TYPES.SUBSCRIBE,
            channel,
            params,
            timestamp: Date.now()
        };

        this.subscriptions.add(JSON.stringify(subscription));
        this.send(subscription);
        this.log('Subscribed to channel:', channel);
    }

    /**
     * Unsubscribe from data channel
     */
    unsubscribe(channel) {
        const subscription = {
            type: MESSAGE_TYPES.UNSUBSCRIBE,
            channel,
            timestamp: Date.now()
        };

        // Remove from subscriptions
        for (const sub of this.subscriptions) {
            const parsed = JSON.parse(sub);
            if (parsed.channel === channel) {
                this.subscriptions.delete(sub);
                break;
            }
        }

        this.send(subscription);
        this.log('Unsubscribed from channel:', channel);
    }

    /**
     * Add event listener
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event).add(handler);
    }

    /**
     * Remove event listener
     */
    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).delete(handler);
        }
    }

    /**
     * Emit event to listeners
     */
    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    this.log('Event handler error:', error);
                }
            });
        }
    }

    /**
     * Enhanced message handling with performance monitoring
     */
    handleMessage(event) {
        const receiveTime = Date.now();

        try {
            const messageSize = event.data.length;
            const data = JSON.parse(event.data);

            // Update metrics
            this.metrics.messagesReceived++;
            this.metrics.bytesReceived += messageSize;
            this.updatePerformanceMetrics(receiveTime);

            // Handle batch messages
            if (data.type === 'batch' && Array.isArray(data.messages)) {
                data.messages.forEach(message => {
                    try {
                        const parsedMessage = typeof message === 'string' ? JSON.parse(message) : message;
                        this.processMessage(parsedMessage, receiveTime);
                    } catch (error) {
                        this.log('Batch message parse error:', error);
                    }
                });
                return;
            }

            this.processMessage(data, receiveTime);

        } catch (error) {
            this.log('Message parse error:', error);
            this.metrics.errors.push({
                type: 'parse',
                error: error.message,
                timestamp: receiveTime,
                rawData: event.data.substring(0, 100) // Truncate for logging
            });
            this.emit('parseError', { error, rawData: event.data });
        }
    }

    /**
     * Process individual message
     */
    processMessage(data, receiveTime) {
        this.log('Message received:', data);

        // Calculate latency for pong messages
        if (data.type === MESSAGE_TYPES.PONG && this.performanceMonitor.lastMessageTime) {
            const latency = receiveTime - this.performanceMonitor.lastMessageTime;
            this.updateLatencyMetrics(latency);
        }

        // Handle different message types
        switch (data.type) {
            case MESSAGE_TYPES.HEARTBEAT:
                this.handleHeartbeat(data);
                break;

            case MESSAGE_TYPES.PRICE_UPDATE:
                this.emit('priceUpdate', { ...data, receiveTime });
                break;

            case MESSAGE_TYPES.ORDERBOOK_UPDATE:
                this.emit('orderbookUpdate', { ...data, receiveTime });
                break;

            case MESSAGE_TYPES.TRADE_UPDATE:
                this.emit('tradeUpdate', { ...data, receiveTime });
                break;

            case MESSAGE_TYPES.TICKER_UPDATE:
                this.emit('tickerUpdate', { ...data, receiveTime });
                break;

            case MESSAGE_TYPES.ERROR:
                this.handleServerError(data);
                break;

            case MESSAGE_TYPES.PONG:
                // Latency already calculated above
                break;

            default:
                this.emit('message', { ...data, receiveTime });
                break;
        }
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(timestamp) {
        // Update message rate
        this.performanceMonitor.messageTimestamps.push(timestamp);

        // Keep only last 60 seconds of timestamps
        const cutoff = timestamp - 60000;
        this.performanceMonitor.messageTimestamps = this.performanceMonitor.messageTimestamps
            .filter(t => t > cutoff);

        this.metrics.messageRate = this.performanceMonitor.messageTimestamps.length / 60;

        // Update error rate
        this.performanceMonitor.errorTimestamps = this.performanceMonitor.errorTimestamps
            .filter(t => t > cutoff);

        this.metrics.errorRate = this.performanceMonitor.errorTimestamps.length / 60;

        // Calculate connection stability
        const totalTime = Math.max(timestamp - (this.metrics.lastConnected || timestamp), 1);
        const errorTime = this.performanceMonitor.errorTimestamps.length * 1000; // Assume 1s per error
        this.metrics.connectionStability = Math.max(0, 100 - (errorTime / totalTime) * 100);
    }

    /**
     * Update latency metrics
     */
    updateLatencyMetrics(latency) {
        this.metrics.latency = latency;
        this.performanceMonitor.latencyMeasurements.push(latency);

        // Keep only last 100 measurements
        if (this.performanceMonitor.latencyMeasurements.length > 100) {
            this.performanceMonitor.latencyMeasurements.shift();
        }

        // Calculate average latency
        const sum = this.performanceMonitor.latencyMeasurements.reduce((a, b) => a + b, 0);
        this.metrics.averageLatency = sum / this.performanceMonitor.latencyMeasurements.length;
    }

    /**
     * Handle connection close
     */
    handleClose(event) {
        this.log('WebSocket closed:', event.code, event.reason);

        // Update metrics
        if (this.metrics.lastConnected) {
            this.metrics.totalUptime += Date.now() - this.metrics.lastConnected;
        }

        this.clearTimers();
        this.setState(WS_STATES.DISCONNECTED);

        // Attempt reconnection if not intentional close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
        } else {
            this.setState(WS_STATES.CLOSED);
            this.emit('closed', event);
        }
    }

    /**
     * Enhanced error handling with categorization and recovery
     */
    handleError(error) {
        const timestamp = Date.now();
        const errorInfo = {
            error: error.message || error.toString(),
            timestamp,
            type: this.categorizeError(error),
            connectionId: this.connectionId,
            state: this.state
        };

        this.log('WebSocket error:', errorInfo);

        // Update metrics
        this.metrics.errors.push(errorInfo);
        this.performanceMonitor.errorTimestamps.push(timestamp);

        // Keep only last 50 errors
        if (this.metrics.errors.length > 50) {
            this.metrics.errors.shift();
        }

        this.setState(WS_STATES.ERROR);
        this.emit('error', errorInfo);

        // Attempt recovery based on error type
        this.attemptErrorRecovery(errorInfo);
    }

    /**
     * Categorize error types for better handling
     */
    categorizeError(error) {
        const message = error.message || error.toString().toLowerCase();

        if (message.includes('network') || message.includes('connection')) {
            return 'network';
        } else if (message.includes('timeout')) {
            return 'timeout';
        } else if (message.includes('auth') || message.includes('unauthorized')) {
            return 'authentication';
        } else if (message.includes('rate') || message.includes('limit')) {
            return 'rate_limit';
        } else if (message.includes('parse') || message.includes('json')) {
            return 'parse';
        } else {
            return 'unknown';
        }
    }

    /**
     * Attempt error recovery based on error type
     */
    attemptErrorRecovery(errorInfo) {
        switch (errorInfo.type) {
            case 'network':
            case 'timeout':
                // Network errors - attempt reconnection
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.log('Network error detected, will attempt reconnection');
                }
                break;

            case 'rate_limit':
                // Rate limit - increase reconnect interval
                this.reconnectInterval = Math.min(this.reconnectInterval * 2, 60000);
                this.log(`Rate limit detected, increasing reconnect interval to ${this.reconnectInterval}ms`);
                break;

            case 'authentication':
                // Auth errors - emit special event for re-authentication
                this.emit('authenticationRequired', errorInfo);
                break;

            case 'parse':
                // Parse errors - don't reconnect, just log
                this.log('Parse error, continuing with current connection');
                return;

            default:
                this.log('Unknown error type, using default recovery');
                break;
        }
    }

    /**
     * Handle server error messages
     */
    handleServerError(data) {
        this.log('Server error:', data);
        this.emit('serverError', data);
    }

    /**
     * Handle heartbeat messages
     */
    handleHeartbeat(data) {
        this.lastHeartbeat = Date.now();

        // Send pong response
        this.send({
            type: MESSAGE_TYPES.PONG,
            timestamp: Date.now()
        });
    }

    /**
     * Attempt reconnection
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.log('Max reconnect attempts reached');
            this.setState(WS_STATES.CLOSED);
            return;
        }

        this.reconnectAttempts++;
        this.metrics.reconnectCount++;
        this.setState(WS_STATES.RECONNECTING);

        this.log(`Reconnecting... attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

        this.reconnectTimer = setTimeout(() => {
            this.connect().catch(error => {
                this.log('Reconnect failed:', error);
                this.attemptReconnect();
            });
        }, this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1)); // Exponential backoff
    }

    /**
     * Start heartbeat timer
     */
    startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            if (this.isConnected()) {
                this.send({
                    type: MESSAGE_TYPES.HEARTBEAT,
                    timestamp: Date.now()
                });
            }
        }, this.heartbeatInterval);
    }

    /**
     * Clear all timers
     */
    clearTimers() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }

        if (this.messageTimeoutTimer) {
            clearTimeout(this.messageTimeoutTimer);
            this.messageTimeoutTimer = null;
        }
    }

    /**
     * Flush queued messages
     */
    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }

    /**
     * Re-subscribe to all channels
     */
    resubscribe() {
        this.subscriptions.forEach(subscription => {
            const parsed = JSON.parse(subscription);
            this.send(parsed);
        });
    }

    /**
     * Set connection state
     */
    setState(newState) {
        const oldState = this.state;
        this.state = newState;
        this.emit('stateChange', { oldState, newState });
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * Get connection state
     */
    getState() {
        return this.state;
    }

    /**
     * Get connection metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            currentState: this.state,
            reconnectAttempts: this.reconnectAttempts,
            subscriptions: this.subscriptions.size,
            queuedMessages: this.messageQueue.length,
            uptime: this.metrics.lastConnected ? Date.now() - this.metrics.lastConnected : 0
        };
    }

    /**
     * Generate unique connection ID
     */
    generateConnectionId() {
        return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Log debug messages
     */
    log(...args) {
        if (this.debug) {
            console.log('[WebSocketManager]', ...args);
        }
    }

    /**
     * Enhanced memory management and cleanup
     */
    performMemoryCleanup() {
        const now = Date.now();
        const maxAge = 300000; // 5 minutes

        // Clean old error records
        this.metrics.errors = this.metrics.errors.filter(error =>
            now - error.timestamp < maxAge
        );

        // Clean old performance data
        this.performanceMonitor.messageTimestamps = this.performanceMonitor.messageTimestamps
            .filter(timestamp => now - timestamp < 60000); // Keep 1 minute

        this.performanceMonitor.errorTimestamps = this.performanceMonitor.errorTimestamps
            .filter(timestamp => now - timestamp < 60000);

        // Limit latency measurements
        if (this.performanceMonitor.latencyMeasurements.length > 100) {
            this.performanceMonitor.latencyMeasurements = this.performanceMonitor.latencyMeasurements.slice(-100);
        }

        // Clean old queued messages
        this.messageQueue = this.messageQueue.filter(item =>
            now - item.timestamp < maxAge
        );

        // Update memory usage estimate
        this.updateMemoryUsage();

        this.log('Memory cleanup completed');
    }

    /**
     * Estimate memory usage
     */
    updateMemoryUsage() {
        let usage = 0;

        // Estimate size of various data structures
        usage += this.metrics.errors.length * 200; // ~200 bytes per error
        usage += this.performanceMonitor.messageTimestamps.length * 8; // 8 bytes per timestamp
        usage += this.performanceMonitor.latencyMeasurements.length * 8;
        usage += this.messageQueue.length * 500; // ~500 bytes per queued message
        usage += this.subscriptions.size * 100; // ~100 bytes per subscription
        usage += this.eventHandlers.size * 1000; // ~1KB per event handler set

        this.metrics.memoryUsage = usage;
        this.metrics.queueSize = this.messageQueue.length;
        this.metrics.subscriptionCount = this.subscriptions.size;
    }

    /**
     * Get detailed connection health
     */
    getConnectionHealth() {
        const now = Date.now();
        const uptime = this.metrics.lastConnected ? now - this.metrics.lastConnected : 0;

        return {
            isHealthy: this.isConnected() && this.metrics.connectionStability > 80,
            stability: this.metrics.connectionStability,
            uptime,
            latency: this.metrics.averageLatency,
            messageRate: this.metrics.messageRate,
            errorRate: this.metrics.errorRate,
            memoryUsage: this.metrics.memoryUsage,
            queueSize: this.metrics.queueSize,
            lastError: this.metrics.errors[this.metrics.errors.length - 1],
            recommendations: this.getHealthRecommendations()
        };
    }

    /**
     * Get health recommendations
     */
    getHealthRecommendations() {
        const recommendations = [];

        if (this.metrics.connectionStability < 80) {
            recommendations.push('Connection unstable - check network conditions');
        }

        if (this.metrics.averageLatency > 1000) {
            recommendations.push('High latency detected - consider using a closer server');
        }

        if (this.metrics.errorRate > 5) {
            recommendations.push('High error rate - check server status');
        }

        if (this.metrics.memoryUsage > 10 * 1024 * 1024) { // 10MB
            recommendations.push('High memory usage - consider reducing data retention');
        }

        if (this.metrics.queueSize > 100) {
            recommendations.push('Large message queue - connection may be slow');
        }

        return recommendations;
    }

    /**
     * Enhanced cleanup with memory management
     */
    destroy() {
        this.log('Destroying WebSocket manager');

        // Clear all timers
        this.clearTimers();

        // Flush any pending batched messages
        if (this.messageBatch.length > 0) {
            this.flushMessageBatch();
        }

        // Disconnect cleanly
        this.disconnect();

        // Clear all data structures
        this.eventHandlers.clear();
        this.subscriptions.clear();
        this.messageQueue.length = 0;
        this.messageBatch.length = 0;

        // Clear performance monitoring data
        this.performanceMonitor.messageTimestamps.length = 0;
        this.performanceMonitor.errorTimestamps.length = 0;
        this.performanceMonitor.latencyMeasurements.length = 0;

        // Reset metrics
        this.metrics = {
            messagesReceived: 0,
            messagesSent: 0,
            reconnectCount: 0,
            lastConnected: null,
            totalUptime: 0,
            errors: [],
            latency: 0,
            averageLatency: 0,
            messageRate: 0,
            errorRate: 0,
            connectionStability: 100,
            memoryUsage: 0,
            queueSize: 0,
            subscriptionCount: 0,
            bytesReceived: 0,
            bytesSent: 0,
            compressionRatio: 1
        };

        this.log('WebSocket manager destroyed');
    }
}

/**
 * React Hook for WebSocket connection
 */
export const useWebSocket = (url, options = {}) => {
    const [wsManager] = React.useState(() => new WebSocketManager({ url, ...options }));
    const [state, setState] = React.useState(WS_STATES.DISCONNECTED);
    const [metrics, setMetrics] = React.useState({});

    React.useEffect(() => {
        const handleStateChange = ({ newState }) => {
            setState(newState);
        };

        wsManager.on('stateChange', handleStateChange);

        // Update metrics periodically
        const metricsInterval = setInterval(() => {
            setMetrics(wsManager.getMetrics());
        }, 1000);

        return () => {
            wsManager.off('stateChange', handleStateChange);
            clearInterval(metricsInterval);
            wsManager.destroy();
        };
    }, [wsManager]);

    const connect = React.useCallback(() => {
        return wsManager.connect();
    }, [wsManager]);

    const disconnect = React.useCallback(() => {
        wsManager.disconnect();
    }, [wsManager]);

    const subscribe = React.useCallback((channel, params) => {
        wsManager.subscribe(channel, params);
    }, [wsManager]);

    const unsubscribe = React.useCallback((channel) => {
        wsManager.unsubscribe(channel);
    }, [wsManager]);

    const send = React.useCallback((message) => {
        return wsManager.send(message);
    }, [wsManager]);

    return {
        wsManager,
        state,
        metrics,
        connect,
        disconnect,
        subscribe,
        unsubscribe,
        send,
        isConnected: state === WS_STATES.CONNECTED
    };
};

export default WebSocketManager;