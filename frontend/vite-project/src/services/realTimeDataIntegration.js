/**
 * Real-time Data Integration Service for Design System Components
 * Connects new components to existing WebSocket data streams with enhanced error handling
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { wsManager } from './api';
import {
    transformWebSocketMessage,
    validateTransformedData
} from './dataTransformationLayer';
import { useErrorReporting } from './enhancedErrorBoundary';
import { performanceIntegration, METRIC_TYPES } from './performanceIntegration';

/**
 * Data stream types supported by the integration
 */
export const DATA_STREAM_TYPES = {
    MARKET_DATA: 'market_data',
    ORDER_BOOK: 'order_book',
    PREDICTIONS: 'predictions',
    NEWS: 'news',
    PORTFOLIO: 'portfolio',
    ALERTS: 'alerts',
    MARKET_OVERVIEW: 'market_overview',
    SOCIAL_SENTIMENT: 'social_sentiment'
};

/**
 * Connection states
 */
export const CONNECTION_STATES = {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    RECONNECTING: 'reconnecting',
    ERROR: 'error'
};

/**
 * Real-time Data Integration Manager
 */
export class RealTimeDataIntegration {
    constructor(options = {}) {
        this.options = {
            enableAutoReconnect: true,
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
            dataBufferSize: 1000,
            enableDataValidation: true,
            enablePerformanceTracking: true,
            enableErrorRecovery: true,
            throttleUpdates: true,
            updateThrottleMs: 16, // 60fps
            ...options
        };

        this.subscribers = new Map();
        this.dataStreams = new Map();
        this.connectionState = CONNECTION_STATES.DISCONNECTED;
        this.reconnectAttempts = 0;
        this.lastConnectionTime = null;
        this.dataBuffer = new Map();
        this.updateThrottles = new Map();
        this.errorCounts = new Map();

        this.setupWebSocketIntegration();
    }

    /**
     * Setup WebSocket integration with existing wsManager
     */
    setupWebSocketIntegration() {
        // Subscribe to connection events with error handling
        try {
            wsManager.subscribe('connected', () => {
                try {
                    this.connectionState = CONNECTION_STATES.CONNECTED;
                    this.lastConnectionTime = Date.now();
                    this.reconnectAttempts = 0;
                    this.notifySubscribers('connection_state', { state: this.connectionState });

                    if (this.options.enablePerformanceTracking && performanceIntegration) {
                        performanceIntegration.recordMetric(METRIC_TYPES.WEBSOCKET_LATENCY, 'connection', {
                            latency: 0,
                            timestamp: Date.now()
                        });
                    }
                } catch (error) {
                    console.error('Error in connected event handler:', error);
                }
            });
        } catch (error) {
            console.error('Error setting up connected event handler:', error);
        }

        try {
            wsManager.subscribe('disconnected', () => {
                try {
                    this.connectionState = CONNECTION_STATES.DISCONNECTED;
                    this.notifySubscribers('connection_state', { state: this.connectionState });

                    if (this.options.enableAutoReconnect) {
                        this.attemptReconnection();
                    }
                } catch (error) {
                    console.error('Error in disconnected event handler:', error);
                }
            });
        } catch (error) {
            console.error('Error setting up disconnected event handler:', error);
        }

        try {
            wsManager.subscribe('error', (error) => {
                try {
                    this.connectionState = CONNECTION_STATES.ERROR;
                    this.handleConnectionError(error);
                } catch (handlerError) {
                    console.error('Error in error event handler:', handlerError);
                }
            });
        } catch (error) {
            console.error('Error setting up error event handler:', error);
        }

        // Subscribe to all data stream types
        Object.values(DATA_STREAM_TYPES).forEach(streamType => {
            this.setupDataStreamHandler(streamType);
        });
    }

    /**
     * Setup handler for a specific data stream type
     */
    setupDataStreamHandler(streamType) {
        const eventMap = {
            [DATA_STREAM_TYPES.MARKET_DATA]: 'ticker_update',
            [DATA_STREAM_TYPES.ORDER_BOOK]: 'orderbook_update',
            [DATA_STREAM_TYPES.PREDICTIONS]: 'prediction_update',
            [DATA_STREAM_TYPES.NEWS]: 'news_update',
            [DATA_STREAM_TYPES.PORTFOLIO]: 'portfolio_update',
            [DATA_STREAM_TYPES.ALERTS]: 'alert_update',
            [DATA_STREAM_TYPES.MARKET_OVERVIEW]: 'market_overview',
            [DATA_STREAM_TYPES.SOCIAL_SENTIMENT]: 'social_sentiment'
        };

        const eventName = eventMap[streamType];
        if (!eventName) return;

        wsManager.subscribe(eventName, (data) => {
            this.handleDataStreamUpdate(streamType, data);
        });
    }

    /**
     * Handle data stream updates with transformation and validation
     */
    handleDataStreamUpdate(streamType, rawData) {
        try {
            const startTime = performance.now();

            // Transform the data
            const transformedMessage = transformWebSocketMessage({
                type: streamType,
                ...rawData,
                timestamp: rawData.timestamp || Date.now()
            });

            if (!transformedMessage) {
                throw new Error(`Failed to transform ${streamType} data`);
            }

            // Validate transformed data if enabled
            if (this.options.enableDataValidation) {
                const isValid = this.validateStreamData(streamType, transformedMessage.data);
                if (!isValid) {
                    throw new Error(`Invalid ${streamType} data structure`);
                }
            }

            // Buffer the data
            this.bufferData(streamType, transformedMessage);

            // Throttle updates if enabled
            if (this.options.throttleUpdates) {
                this.throttleDataUpdate(streamType, transformedMessage);
            } else {
                this.distributeData(streamType, transformedMessage);
            }

            // Track performance
            if (this.options.enablePerformanceTracking) {
                const processingTime = performance.now() - startTime;
                performanceIntegration.recordMetric(METRIC_TYPES.DATA_PROCESSING, streamType, {
                    processingTime,
                    dataSize: JSON.stringify(rawData).length,
                    latency: transformedMessage.latency || 0,
                    timestamp: Date.now()
                });
            }

            // Reset error count on successful processing
            this.errorCounts.set(streamType, 0);

        } catch (error) {
            this.handleDataStreamError(streamType, error, rawData);
        }
    }

    /**
     * Validate stream data structure
     */
    validateStreamData(streamType, data) {
        switch (streamType) {
            case DATA_STREAM_TYPES.MARKET_DATA:
                return validateTransformedData(data, 'chart');
            case DATA_STREAM_TYPES.ORDER_BOOK:
                return validateTransformedData(data, 'orderbook');
            case DATA_STREAM_TYPES.PREDICTIONS:
                return validateTransformedData(data, 'predictions');
            case DATA_STREAM_TYPES.PORTFOLIO:
                return validateTransformedData(data, 'portfolio');
            default:
                return true; // Skip validation for unknown types
        }
    }

    /**
     * Buffer data for performance optimization
     */
    bufferData(streamType, data) {
        if (!this.dataBuffer.has(streamType)) {
            this.dataBuffer.set(streamType, []);
        }

        const buffer = this.dataBuffer.get(streamType);
        buffer.push(data);

        // Maintain buffer size
        if (buffer.length > this.options.dataBufferSize) {
            buffer.shift();
        }
    }

    /**
     * Throttle data updates to prevent overwhelming components
     */
    throttleDataUpdate(streamType, data) {
        const throttleKey = streamType;

        if (this.updateThrottles.has(throttleKey)) {
            // Update is already scheduled
            return;
        }

        this.updateThrottles.set(throttleKey, setTimeout(() => {
            this.distributeData(streamType, data);
            this.updateThrottles.delete(throttleKey);
        }, this.options.updateThrottleMs));
    }

    /**
     * Distribute data to all subscribers
     */
    distributeData(streamType, data) {
        const subscribers = this.subscribers.get(streamType) || new Set();

        subscribers.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in subscriber callback for ${streamType}:`, error);
            }
        });

        // Update data streams cache
        this.dataStreams.set(streamType, data);
    }

    /**
     * Handle data stream errors
     */
    handleDataStreamError(streamType, error, rawData) {
        const errorCount = (this.errorCounts.get(streamType) || 0) + 1;
        this.errorCounts.set(streamType, errorCount);

        console.error(`Data stream error for ${streamType} (count: ${errorCount}):`, error);

        // Apply error recovery strategies
        if (this.options.enableErrorRecovery && errorCount < 5) {
            this.applyErrorRecovery(streamType, error, rawData);
        } else if (errorCount >= 5) {
            console.warn(`Too many errors for ${streamType}, disabling stream`);
            this.disableDataStream(streamType);
        }

        // Notify subscribers of error
        this.notifySubscribers('error', {
            streamType,
            error: error.message,
            errorCount,
            timestamp: Date.now()
        });
    }

    /**
     * Apply error recovery strategies
     */
    applyErrorRecovery(streamType, error, rawData) {
        // Strategy 1: Try with fallback transformation
        try {
            const fallbackData = this.createFallbackData(streamType, rawData);
            if (fallbackData) {
                this.distributeData(streamType, fallbackData);
                return;
            }
        } catch (fallbackError) {
            console.error('Fallback transformation failed:', fallbackError);
        }

        // Strategy 2: Use cached data if available
        const cachedData = this.getLastValidData(streamType);
        if (cachedData) {
            console.warn(`Using cached data for ${streamType} due to error`);
            this.distributeData(streamType, {
                ...cachedData,
                isStale: true,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Create fallback data for error recovery
     */
    createFallbackData(streamType, rawData) {
        switch (streamType) {
            case DATA_STREAM_TYPES.MARKET_DATA:
                return {
                    type: streamType,
                    data: {
                        timestamp: Date.now(),
                        close: rawData.price || rawData.close || 0,
                        volume: rawData.volume || 0,
                        isStale: true
                    }
                };

            case DATA_STREAM_TYPES.ORDER_BOOK:
                return {
                    type: streamType,
                    data: {
                        asks: [],
                        bids: [],
                        spread: null,
                        timestamp: Date.now(),
                        isStale: true
                    }
                };

            default:
                return null;
        }
    }

    /**
     * Get last valid data from buffer
     */
    getLastValidData(streamType) {
        const buffer = this.dataBuffer.get(streamType);
        if (!buffer || buffer.length === 0) return null;

        // Find the most recent valid data
        for (let i = buffer.length - 1; i >= 0; i--) {
            const data = buffer[i];
            if (data && !data.isStale) {
                return data;
            }
        }

        return null;
    }

    /**
     * Disable a data stream due to persistent errors
     */
    disableDataStream(streamType) {
        this.subscribers.delete(streamType);
        this.dataStreams.delete(streamType);
        this.dataBuffer.delete(streamType);
        this.errorCounts.delete(streamType);
    }

    /**
     * Attempt reconnection with exponential backoff
     */
    attemptReconnection() {
        if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.connectionState = CONNECTION_STATES.RECONNECTING;
        this.reconnectAttempts++;

        const delay = Math.min(
            this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
            30000 // Max 30 seconds
        );

        console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.options.maxReconnectAttempts} in ${delay}ms`);

        setTimeout(() => {
            try {
                // Use the existing connect method with current subscriptions
                const subscriptions = Array.from(wsManager.subscriptions || []);
                wsManager.connect('default-client', subscriptions);
            } catch (error) {
                console.error('Reconnection failed:', error);
                this.attemptReconnection();
            }
        }, delay);
    }

    /**
     * Handle connection errors
     */
    handleConnectionError(error) {
        console.error('WebSocket connection error:', error);

        this.notifySubscribers('error', {
            type: 'connection',
            error: error.message,
            timestamp: Date.now()
        });

        if (this.options.enableAutoReconnect) {
            this.attemptReconnection();
        }
    }

    /**
     * Subscribe to a data stream
     */
    subscribe(streamType, callback) {
        if (!this.subscribers.has(streamType)) {
            this.subscribers.set(streamType, new Set());
        }

        this.subscribers.get(streamType).add(callback);

        // Send current data if available
        const currentData = this.dataStreams.get(streamType);
        if (currentData) {
            try {
                callback(currentData);
            } catch (error) {
                console.error('Error in initial callback:', error);
            }
        }

        // Return unsubscribe function
        return () => {
            const subscribers = this.subscribers.get(streamType);
            if (subscribers) {
                subscribers.delete(callback);
                if (subscribers.size === 0) {
                    this.subscribers.delete(streamType);
                }
            }
        };
    }

    /**
     * Notify all subscribers of system events
     */
    notifySubscribers(eventType, data) {
        const systemSubscribers = this.subscribers.get('system') || new Set();
        systemSubscribers.forEach(callback => {
            try {
                callback({ type: eventType, ...data });
            } catch (error) {
                console.error('Error in system event callback:', error);
            }
        });
    }

    /**
     * Get current connection state
     */
    getConnectionState() {
        return {
            state: this.connectionState,
            lastConnectionTime: this.lastConnectionTime,
            reconnectAttempts: this.reconnectAttempts,
            isConnected: this.connectionState === CONNECTION_STATES.CONNECTED
        };
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        const metrics = {};

        this.dataStreams.forEach((data, streamType) => {
            const buffer = this.dataBuffer.get(streamType) || [];
            const errorCount = this.errorCounts.get(streamType) || 0;

            metrics[streamType] = {
                lastUpdate: data.timestamp,
                bufferSize: buffer.length,
                errorCount,
                latency: data.latency || 0,
                isActive: this.subscribers.has(streamType) && this.subscribers.get(streamType).size > 0
            };
        });

        return {
            streams: metrics,
            connection: this.getConnectionState(),
            totalSubscribers: Array.from(this.subscribers.values()).reduce((sum, set) => sum + set.size, 0)
        };
    }

    /**
     * Clear all data and reset state
     */
    reset() {
        this.subscribers.clear();
        this.dataStreams.clear();
        this.dataBuffer.clear();
        this.errorCounts.clear();
        this.updateThrottles.forEach(timeout => clearTimeout(timeout));
        this.updateThrottles.clear();
        this.reconnectAttempts = 0;
    }

    /**
     * Destroy the integration
     */
    destroy() {
        this.reset();
        // Note: We don't destroy wsManager as it's shared
    }
}

/**
 * React hook for real-time data integration
 */
export const useRealTimeData = (componentId, streamTypes = [], options = {}) => {
    const [data, setData] = useState({});
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [metrics, setMetrics] = useState(null);

    const integrationRef = useRef(null);
    const { reportError } = useErrorReporting();

    // Initialize integration
    useEffect(() => {
        if (!integrationRef.current) {
            integrationRef.current = new RealTimeDataIntegration({
                ...options,
                componentId
            });
        }

        return () => {
            if (integrationRef.current) {
                integrationRef.current.destroy();
                integrationRef.current = null;
            }
        };
    }, [componentId, JSON.stringify(options)]);

    // Subscribe to data streams
    useEffect(() => {
        if (!integrationRef.current || streamTypes.length === 0) return;

        const integration = integrationRef.current;
        const unsubscribeFunctions = [];

        // Subscribe to each stream type
        streamTypes.forEach(streamType => {
            const unsubscribe = integration.subscribe(streamType, (streamData) => {
                setData(prevData => ({
                    ...prevData,
                    [streamData.symbol || streamType]: streamData.data
                }));
            });
            unsubscribeFunctions.push(unsubscribe);
        });

        // Subscribe to system events
        const unsubscribeSystem = integration.subscribe('system', (systemEvent) => {
            switch (systemEvent.type) {
                case 'connection_state':
                    setIsConnected(systemEvent.state === CONNECTION_STATES.CONNECTED);
                    break;
                case 'error':
                    setError(systemEvent);
                    reportError(new Error(systemEvent.error), {
                        streamType: systemEvent.streamType,
                        componentId
                    });
                    break;
            }
        });
        unsubscribeFunctions.push(unsubscribeSystem);

        // Update metrics periodically
        const metricsInterval = setInterval(() => {
            const currentMetrics = integration.getPerformanceMetrics();
            setMetrics(currentMetrics);
        }, 5000);

        return () => {
            unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
            clearInterval(metricsInterval);
        };
    }, [streamTypes, componentId, reportError]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const reconnect = useCallback(() => {
        if (integrationRef.current) {
            integrationRef.current.attemptReconnection();
        }
    }, []);

    return {
        data,
        error,
        isConnected,
        metrics,
        clearError,
        reconnect
    };
};

// Export singleton instance
export const realTimeDataIntegration = new RealTimeDataIntegration();

export default RealTimeDataIntegration;