import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { WebSocketManager, WS_STATES } from '../../utils/websocketManager';

// Real-time data context
const RealTimeDataContext = createContext();

// Action types for data reducer
const DATA_ACTIONS = {
    SET_CONNECTION_STATE: 'SET_CONNECTION_STATE',
    UPDATE_PRICE: 'UPDATE_PRICE',
    UPDATE_ORDERBOOK: 'UPDATE_ORDERBOOK',
    UPDATE_TRADES: 'UPDATE_TRADES',
    UPDATE_TICKER: 'UPDATE_TICKER',
    SET_SUBSCRIPTIONS: 'SET_SUBSCRIPTIONS',
    ADD_SUBSCRIPTION: 'ADD_SUBSCRIPTION',
    REMOVE_SUBSCRIPTION: 'REMOVE_SUBSCRIPTION',
    SET_METRICS: 'SET_METRICS',
    ADD_ERROR: 'ADD_ERROR',
    CLEAR_ERRORS: 'CLEAR_ERRORS',
    SET_LOADING: 'SET_LOADING'
};

// Initial state
const initialState = {
    connectionState: WS_STATES.DISCONNECTED,
    isLoading: false,
    subscriptions: new Set(),
    metrics: {},
    errors: [],

    // Market data
    prices: new Map(), // symbol -> price data
    orderbooks: new Map(), // symbol -> orderbook data
    trades: new Map(), // symbol -> recent trades
    tickers: new Map(), // symbol -> ticker data

    // Data timestamps
    lastUpdated: {
        prices: new Map(),
        orderbooks: new Map(),
        trades: new Map(),
        tickers: new Map()
    }
};

// Data reducer
const dataReducer = (state, action) => {
    switch (action.type) {
        case DATA_ACTIONS.SET_CONNECTION_STATE:
            return {
                ...state,
                connectionState: action.payload
            };

        case DATA_ACTIONS.UPDATE_PRICE:
            const { symbol: priceSymbol, data: priceData } = action.payload;
            const newPrices = new Map(state.prices);
            const newPriceTimestamps = new Map(state.lastUpdated.prices);

            newPrices.set(priceSymbol, {
                ...newPrices.get(priceSymbol),
                ...priceData,
                timestamp: Date.now()
            });
            newPriceTimestamps.set(priceSymbol, Date.now());

            return {
                ...state,
                prices: newPrices,
                lastUpdated: {
                    ...state.lastUpdated,
                    prices: newPriceTimestamps
                }
            };

        case DATA_ACTIONS.UPDATE_ORDERBOOK:
            const { symbol: obSymbol, data: obData } = action.payload;
            const newOrderbooks = new Map(state.orderbooks);
            const newObTimestamps = new Map(state.lastUpdated.orderbooks);

            // Merge or replace orderbook data
            const existingOb = newOrderbooks.get(obSymbol) || { asks: [], bids: [] };
            const updatedOb = {
                ...existingOb,
                ...obData,
                timestamp: Date.now()
            };

            newOrderbooks.set(obSymbol, updatedOb);
            newObTimestamps.set(obSymbol, Date.now());

            return {
                ...state,
                orderbooks: newOrderbooks,
                lastUpdated: {
                    ...state.lastUpdated,
                    orderbooks: newObTimestamps
                }
            };

        case DATA_ACTIONS.UPDATE_TRADES:
            const { symbol: tradeSymbol, data: tradeData } = action.payload;
            const newTrades = new Map(state.trades);
            const newTradeTimestamps = new Map(state.lastUpdated.trades);

            // Keep only recent trades (last 100)
            const existingTrades = newTrades.get(tradeSymbol) || [];
            const updatedTrades = [...tradeData, ...existingTrades].slice(0, 100);

            newTrades.set(tradeSymbol, updatedTrades);
            newTradeTimestamps.set(tradeSymbol, Date.now());

            return {
                ...state,
                trades: newTrades,
                lastUpdated: {
                    ...state.lastUpdated,
                    trades: newTradeTimestamps
                }
            };

        case DATA_ACTIONS.UPDATE_TICKER:
            const { symbol: tickerSymbol, data: tickerData } = action.payload;
            const newTickers = new Map(state.tickers);
            const newTickerTimestamps = new Map(state.lastUpdated.tickers);

            newTickers.set(tickerSymbol, {
                ...newTickers.get(tickerSymbol),
                ...tickerData,
                timestamp: Date.now()
            });
            newTickerTimestamps.set(tickerSymbol, Date.now());

            return {
                ...state,
                tickers: newTickers,
                lastUpdated: {
                    ...state.lastUpdated,
                    tickers: newTickerTimestamps
                }
            };

        case DATA_ACTIONS.SET_SUBSCRIPTIONS:
            return {
                ...state,
                subscriptions: new Set(action.payload)
            };

        case DATA_ACTIONS.ADD_SUBSCRIPTION:
            const newSubs = new Set(state.subscriptions);
            newSubs.add(action.payload);
            return {
                ...state,
                subscriptions: newSubs
            };

        case DATA_ACTIONS.REMOVE_SUBSCRIPTION:
            const filteredSubs = new Set(state.subscriptions);
            filteredSubs.delete(action.payload);
            return {
                ...state,
                subscriptions: filteredSubs
            };

        case DATA_ACTIONS.SET_METRICS:
            return {
                ...state,
                metrics: action.payload
            };

        case DATA_ACTIONS.ADD_ERROR:
            return {
                ...state,
                errors: [...state.errors, {
                    id: Date.now(),
                    timestamp: Date.now(),
                    ...action.payload
                }].slice(-10) // Keep only last 10 errors
            };

        case DATA_ACTIONS.CLEAR_ERRORS:
            return {
                ...state,
                errors: []
            };

        case DATA_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };

        default:
            return state;
    }
};

// Enhanced real-time data provider component
export const RealTimeDataProvider = ({
    children,
    wsUrl = 'wss://api.example.com/ws',
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    debug = false,
    enableCompression = true,
    throttleInterval = 16,
    batchSize = 10,
    maxMessageSize = 1024 * 1024,
    memoryCleanupInterval = 300000, // 5 minutes
    performanceMonitoring = true
}) => {
    const [state, dispatch] = useReducer(dataReducer, initialState);
    const wsManagerRef = useRef(null);
    const metricsIntervalRef = useRef(null);
    const memoryCleanupIntervalRef = useRef(null);
    const performanceIntervalRef = useRef(null);

    // Initialize enhanced WebSocket manager
    useEffect(() => {
        wsManagerRef.current = new WebSocketManager({
            url: wsUrl,
            reconnectInterval,
            maxReconnectAttempts,
            debug,
            enableCompression,
            throttleInterval,
            batchSize,
            maxMessageSize,
            enableMetrics: performanceMonitoring
        });

        const wsManager = wsManagerRef.current;

        // Set up event listeners
        wsManager.on('stateChange', ({ newState }) => {
            dispatch({ type: DATA_ACTIONS.SET_CONNECTION_STATE, payload: newState });
        });

        wsManager.on('priceUpdate', (data) => {
            dispatch({
                type: DATA_ACTIONS.UPDATE_PRICE,
                payload: { symbol: data.symbol, data: data.price }
            });
        });

        wsManager.on('orderbookUpdate', (data) => {
            dispatch({
                type: DATA_ACTIONS.UPDATE_ORDERBOOK,
                payload: { symbol: data.symbol, data: data.orderbook }
            });
        });

        wsManager.on('tradeUpdate', (data) => {
            dispatch({
                type: DATA_ACTIONS.UPDATE_TRADES,
                payload: { symbol: data.symbol, data: data.trades }
            });
        });

        wsManager.on('tickerUpdate', (data) => {
            dispatch({
                type: DATA_ACTIONS.UPDATE_TICKER,
                payload: { symbol: data.symbol, data: data.ticker }
            });
        });

        wsManager.on('error', (error) => {
            dispatch({
                type: DATA_ACTIONS.ADD_ERROR,
                payload: { type: 'connection', message: error.message || 'Connection error' }
            });
        });

        wsManager.on('serverError', (error) => {
            dispatch({
                type: DATA_ACTIONS.ADD_ERROR,
                payload: { type: 'server', message: error.message || 'Server error' }
            });
        });

        // Start enhanced metrics collection
        if (performanceMonitoring) {
            metricsIntervalRef.current = setInterval(() => {
                const metrics = wsManager.getMetrics();
                const health = wsManager.getConnectionHealth();
                dispatch({
                    type: DATA_ACTIONS.SET_METRICS,
                    payload: { ...metrics, health }
                });
            }, 1000);

            // Start performance monitoring
            performanceIntervalRef.current = setInterval(() => {
                wsManager.updateMemoryUsage();
            }, 5000);
        }

        // Start memory cleanup
        memoryCleanupIntervalRef.current = setInterval(() => {
            wsManager.performMemoryCleanup();
        }, memoryCleanupInterval);

        // Auto-connect if enabled
        if (autoConnect) {
            wsManager.connect().catch(error => {
                console.error('Auto-connect failed:', error);
            });
        }

        // Enhanced cleanup on unmount
        return () => {
            if (metricsIntervalRef.current) {
                clearInterval(metricsIntervalRef.current);
            }
            if (memoryCleanupIntervalRef.current) {
                clearInterval(memoryCleanupIntervalRef.current);
            }
            if (performanceIntervalRef.current) {
                clearInterval(performanceIntervalRef.current);
            }
            wsManager.destroy();
        };
    }, [wsUrl, autoConnect, reconnectInterval, maxReconnectAttempts, debug]);

    // Connection methods
    const connect = useCallback(async () => {
        if (wsManagerRef.current) {
            dispatch({ type: DATA_ACTIONS.SET_LOADING, payload: true });
            try {
                await wsManagerRef.current.connect();
            } catch (error) {
                dispatch({
                    type: DATA_ACTIONS.ADD_ERROR,
                    payload: { type: 'connection', message: error.message }
                });
            } finally {
                dispatch({ type: DATA_ACTIONS.SET_LOADING, payload: false });
            }
        }
    }, []);

    const disconnect = useCallback(() => {
        if (wsManagerRef.current) {
            wsManagerRef.current.disconnect();
        }
    }, []);

    // Subscription methods
    const subscribe = useCallback((channel, params = {}) => {
        if (wsManagerRef.current) {
            wsManagerRef.current.subscribe(channel, params);
            dispatch({ type: DATA_ACTIONS.ADD_SUBSCRIPTION, payload: channel });
        }
    }, []);

    const unsubscribe = useCallback((channel) => {
        if (wsManagerRef.current) {
            wsManagerRef.current.unsubscribe(channel);
            dispatch({ type: DATA_ACTIONS.REMOVE_SUBSCRIPTION, payload: channel });
        }
    }, []);

    // Data access methods
    const getPrice = useCallback((symbol) => {
        return state.prices.get(symbol);
    }, [state.prices]);

    const getOrderbook = useCallback((symbol) => {
        return state.orderbooks.get(symbol);
    }, [state.orderbooks]);

    const getTrades = useCallback((symbol) => {
        return state.trades.get(symbol) || [];
    }, [state.trades]);

    const getTicker = useCallback((symbol) => {
        return state.tickers.get(symbol);
    }, [state.tickers]);

    // Utility methods
    const clearErrors = useCallback(() => {
        dispatch({ type: DATA_ACTIONS.CLEAR_ERRORS });
    }, []);

    const isConnected = state.connectionState === WS_STATES.CONNECTED;
    const isConnecting = state.connectionState === WS_STATES.CONNECTING;
    const isReconnecting = state.connectionState === WS_STATES.RECONNECTING;

    // Context value
    const contextValue = {
        // Connection state
        connectionState: state.connectionState,
        isConnected,
        isConnecting,
        isReconnecting,
        isLoading: state.isLoading,

        // Data
        prices: state.prices,
        orderbooks: state.orderbooks,
        trades: state.trades,
        tickers: state.tickers,
        lastUpdated: state.lastUpdated,

        // Subscriptions
        subscriptions: state.subscriptions,

        // Metrics and errors
        metrics: state.metrics,
        errors: state.errors,

        // Methods
        connect,
        disconnect,
        subscribe,
        unsubscribe,
        getPrice,
        getOrderbook,
        getTrades,
        getTicker,
        clearErrors
    };

    return (
        <RealTimeDataContext.Provider value={contextValue}>
            {children}
        </RealTimeDataContext.Provider>
    );
};

// Hook to use real-time data context
export const useRealTimeData = () => {
    const context = useContext(RealTimeDataContext);
    if (!context) {
        throw new Error('useRealTimeData must be used within a RealTimeDataProvider');
    }
    return context;
};

// Hook for specific symbol data
export const useSymbolData = (symbol) => {
    const context = useRealTimeData();

    const price = context.getPrice(symbol);
    const orderbook = context.getOrderbook(symbol);
    const trades = context.getTrades(symbol);
    const ticker = context.getTicker(symbol);

    const lastUpdated = {
        price: context.lastUpdated.prices.get(symbol),
        orderbook: context.lastUpdated.orderbooks.get(symbol),
        trades: context.lastUpdated.trades.get(symbol),
        ticker: context.lastUpdated.tickers.get(symbol)
    };

    return {
        symbol,
        price,
        orderbook,
        trades,
        ticker,
        lastUpdated,
        isSubscribed: context.subscriptions.has(symbol)
    };
};

// Hook for price subscription
export const usePriceSubscription = (symbol, autoSubscribe = true) => {
    const { subscribe, unsubscribe, getPrice, isConnected } = useRealTimeData();
    const [isSubscribed, setIsSubscribed] = useState(false);

    const subscribeToPrice = useCallback(() => {
        if (isConnected && symbol) {
            subscribe(`price.${symbol}`);
            setIsSubscribed(true);
        }
    }, [subscribe, symbol, isConnected]);

    const unsubscribeFromPrice = useCallback(() => {
        if (symbol) {
            unsubscribe(`price.${symbol}`);
            setIsSubscribed(false);
        }
    }, [unsubscribe, symbol]);

    useEffect(() => {
        if (autoSubscribe && isConnected && symbol && !isSubscribed) {
            subscribeToPrice();
        }

        return () => {
            if (isSubscribed) {
                unsubscribeFromPrice();
            }
        };
    }, [autoSubscribe, isConnected, symbol, isSubscribed, subscribeToPrice, unsubscribeFromPrice]);

    return {
        price: getPrice(symbol),
        isSubscribed,
        subscribe: subscribeToPrice,
        unsubscribe: unsubscribeFromPrice
    };
};

// Enhanced hook for orderbook subscription with throttling
export const useOrderbookSubscription = (symbol, autoSubscribe = true, options = {}) => {
    const {
        throttleMs = 16, // ~60fps
        maxDepth = 50,
        aggregationLevel = 0.01,
        enableAnimations = true
    } = options;

    const { subscribe, unsubscribe, getOrderbook, isConnected } = useRealTimeData();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [throttledOrderbook, setThrottledOrderbook] = useState(null);
    const throttleRef = useRef(null);
    const lastUpdateRef = useRef(0);

    const subscribeToOrderbook = useCallback(() => {
        if (isConnected && symbol) {
            subscribe(`orderbook.${symbol}`, {
                maxDepth,
                aggregationLevel,
                throttle: throttleMs
            });
            setIsSubscribed(true);
        }
    }, [subscribe, symbol, isConnected, maxDepth, aggregationLevel, throttleMs]);

    const unsubscribeFromOrderbook = useCallback(() => {
        if (symbol) {
            unsubscribe(`orderbook.${symbol}`);
            setIsSubscribed(false);
        }
    }, [unsubscribe, symbol]);

    // Throttled orderbook updates
    const rawOrderbook = getOrderbook(symbol);

    useEffect(() => {
        if (!rawOrderbook) return;

        const now = Date.now();
        if (now - lastUpdateRef.current < throttleMs) {
            // Schedule throttled update
            if (throttleRef.current) {
                clearTimeout(throttleRef.current);
            }

            throttleRef.current = setTimeout(() => {
                setThrottledOrderbook(rawOrderbook);
                lastUpdateRef.current = Date.now();
            }, throttleMs - (now - lastUpdateRef.current));
        } else {
            // Update immediately
            setThrottledOrderbook(rawOrderbook);
            lastUpdateRef.current = now;
        }

        return () => {
            if (throttleRef.current) {
                clearTimeout(throttleRef.current);
            }
        };
    }, [rawOrderbook, throttleMs]);

    useEffect(() => {
        if (autoSubscribe && isConnected && symbol && !isSubscribed) {
            subscribeToOrderbook();
        }

        return () => {
            if (isSubscribed) {
                unsubscribeFromOrderbook();
            }
        };
    }, [autoSubscribe, isConnected, symbol, isSubscribed, subscribeToOrderbook, unsubscribeFromOrderbook]);

    return {
        orderbook: throttledOrderbook,
        rawOrderbook,
        isSubscribed,
        subscribe: subscribeToOrderbook,
        unsubscribe: unsubscribeFromOrderbook,
        options: {
            throttleMs,
            maxDepth,
            aggregationLevel,
            enableAnimations
        }
    };
};

// Hook for performance-optimized real-time data streaming
export const usePerformantRealTimeData = (symbols = [], options = {}) => {
    const {
        throttleMs = 16,
        batchUpdates = true,
        enableCompression = true,
        maxCacheSize = 1000
    } = options;

    const context = useRealTimeData();
    const [optimizedData, setOptimizedData] = useState(new Map());
    const batchRef = useRef(new Map());
    const batchTimeoutRef = useRef(null);

    // Batch and throttle updates for better performance
    const processBatchedUpdates = useCallback(() => {
        if (batchRef.current.size === 0) return;

        const updates = new Map(batchRef.current);
        batchRef.current.clear();

        setOptimizedData(prev => {
            const newData = new Map(prev);
            updates.forEach((data, symbol) => {
                newData.set(symbol, data);
            });

            // Limit cache size
            if (newData.size > maxCacheSize) {
                const entries = Array.from(newData.entries());
                const limitedEntries = entries.slice(-maxCacheSize);
                return new Map(limitedEntries);
            }

            return newData;
        });
    }, [maxCacheSize]);

    // Subscribe to symbols
    useEffect(() => {
        symbols.forEach(symbol => {
            if (context.isConnected) {
                context.subscribe(`price.${symbol}`, {
                    throttle: throttleMs,
                    compression: enableCompression
                });
                context.subscribe(`orderbook.${symbol}`, {
                    throttle: throttleMs,
                    compression: enableCompression
                });
            }
        });

        return () => {
            symbols.forEach(symbol => {
                context.unsubscribe(`price.${symbol}`);
                context.unsubscribe(`orderbook.${symbol}`);
            });
        };
    }, [symbols, context, throttleMs, enableCompression]);

    // Handle data updates with batching
    useEffect(() => {
        symbols.forEach(symbol => {
            const price = context.getPrice(symbol);
            const orderbook = context.getOrderbook(symbol);

            if (price || orderbook) {
                batchRef.current.set(symbol, { price, orderbook, timestamp: Date.now() });

                if (batchUpdates) {
                    if (batchTimeoutRef.current) {
                        clearTimeout(batchTimeoutRef.current);
                    }

                    batchTimeoutRef.current = setTimeout(processBatchedUpdates, throttleMs);
                } else {
                    processBatchedUpdates();
                }
            }
        });

        return () => {
            if (batchTimeoutRef.current) {
                clearTimeout(batchTimeoutRef.current);
            }
        };
    }, [symbols, context.prices, context.orderbooks, batchUpdates, throttleMs, processBatchedUpdates]);

    return {
        data: optimizedData,
        isConnected: context.isConnected,
        metrics: context.metrics,
        health: context.metrics?.health,
        subscribe: context.subscribe,
        unsubscribe: context.unsubscribe
    };
};

export default RealTimeDataProvider;