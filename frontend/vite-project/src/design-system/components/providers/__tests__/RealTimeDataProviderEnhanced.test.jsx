import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import {
    RealTimeDataProvider,
    useRealTimeData,
    useSymbolData,
    usePriceSubscription,
    useOrderbookSubscription,
    usePerformantRealTimeData
} from '../RealTimeDataProvider';
import { WebSocketManager, WS_STATES } from '../../../utils/websocketManager';

// Mock WebSocketManager
jest.mock('../../../utils/websocketManager', () => ({
    WebSocketManager: jest.fn(),
    WS_STATES: {
        CONNECTING: 'CONNECTING',
        CONNECTED: 'CONNECTED',
        DISCONNECTED: 'DISCONNECTED',
        RECONNECTING: 'RECONNECTING',
        ERROR: 'ERROR',
        CLOSED: 'CLOSED'
    },
    MESSAGE_TYPES: {
        SUBSCRIBE: 'subscribe',
        UNSUBSCRIBE: 'unsubscribe',
        PRICE_UPDATE: 'price_update',
        ORDERBOOK_UPDATE: 'orderbook_update'
    }
}));

// Mock WebSocket
global.WebSocket = jest.fn(() => ({
    readyState: WebSocket.OPEN,
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
}));

// Mock performance API
Object.defineProperty(window, 'performance', {
    value: {
        now: jest.fn(() => Date.now())
    }
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));

describe('RealTimeDataProvider Enhanced Tests', () => {
    let mockWsManager;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        jest.useFakeTimers();

        // Create mock WebSocket manager
        mockWsManager = {
            connect: jest.fn().mockResolvedValue(),
            disconnect: jest.fn(),
            subscribe: jest.fn(),
            unsubscribe: jest.fn(),
            send: jest.fn(),
            on: jest.fn(),
            off: jest.fn(),
            getMetrics: jest.fn(() => ({
                messagesReceived: 100,
                messagesSent: 50,
                uptime: 60000,
                subscriptions: 2,
                averageLatency: 25,
                bytesReceived: 1024,
                health: {
                    isHealthy: true,
                    stability: 95,
                    messageRate: 10,
                    errorRate: 0.1,
                    recommendations: []
                }
            })),
            getConnectionHealth: jest.fn(() => ({
                isHealthy: true,
                stability: 95,
                uptime: 60000,
                latency: 25,
                messageRate: 10,
                errorRate: 0.1,
                memoryUsage: 1024,
                queueSize: 0,
                recommendations: []
            })),
            updateMemoryUsage: jest.fn(),
            performMemoryCleanup: jest.fn(),
            destroy: jest.fn()
        };

        WebSocketManager.mockImplementation(() => mockWsManager);
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    describe('Provider Initialization', () => {
        it('should initialize with correct default props', () => {
            const TestComponent = () => {
                const { connectionState, isConnected } = useRealTimeData();
                return (
                    <div>
                        <div data-testid="connection-state">{connectionState}</div>
                        <div data-testid="is-connected">{isConnected.toString()}</div>
                    </div>
                );
            };

            render(
                <RealTimeDataProvider>
                    <TestComponent />
                </RealTimeDataProvider>
            );

            expect(screen.getByTestId('connection-state')).toHaveTextContent('DISCONNECTED');
            expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
        });

        it('should auto-connect when autoConnect is true', () => {
            render(
                <RealTimeDataProvider autoConnect={true}>
                    <div>Test</div>
                </RealTimeDataProvider>
            );

            expect(mockWsManager.connect).toHaveBeenCalled();
        });

        it('should not auto-connect when autoConnect is false', () => {
            render(
                <RealTimeDataProvider autoConnect={false}>
                    <div>Test</div>
                </RealTimeDataProvider>
            );

            expect(mockWsManager.connect).not.toHaveBeenCalled();
        });
    });

    describe('Connection Management', () => {
        it('should handle connection state changes', async () => {
            let stateChangeHandler;
            mockWsManager.on.mockImplementation((event, handler) => {
                if (event === 'stateChange') {
                    stateChangeHandler = handler;
                }
            });

            const TestComponent = () => {
                const { connectionState, connect } = useRealTimeData();
                return (
                    <div>
                        <div data-testid="connection-state">{connectionState}</div>
                        <button onClick={connect} data-testid="connect-btn">Connect</button>
                    </div>
                );
            };

            render(
                <RealTimeDataProvider autoConnect={false}>
                    <TestComponent />
                </RealTimeDataProvider>
            );

            // Simulate state change
            act(() => {
                stateChangeHandler({ newState: WS_STATES.CONNECTING });
            });

            expect(screen.getByTestId('connection-state')).toHaveTextContent('CONNECTING');

            // Test manual connection
            fireEvent.click(screen.getByTestId('connect-btn'));
            expect(mockWsManager.connect).toHaveBeenCalled();
        });

        it('should handle connection errors', async () => {
            let errorHandler;
            mockWsManager.on.mockImplementation((event, handler) => {
                if (event === 'error') {
                    errorHandler = handler;
                }
            });

            const TestComponent = () => {
                const { errors } = useRealTimeData();
                return (
                    <div>
                        <div data-testid="error-count">{errors.length}</div>
                        {errors.map(error => (
                            <div key={error.id} data-testid="error-message">
                                {error.message}
                            </div>
                        ))}
                    </div>
                );
            };

            render(
                <RealTimeDataProvider>
                    <TestComponent />
                </RealTimeDataProvider>
            );

            // Simulate error
            act(() => {
                errorHandler({ message: 'Connection failed', type: 'connection' });
            });

            expect(screen.getByTestId('error-count')).toHaveTextContent('1');
            expect(screen.getByTestId('error-message')).toHaveTextContent('Connection failed');
        });
    });
});
describe('Data Updates', () => {
    it('should handle price updates', async () => {
        let priceUpdateHandler;
        mockWsManager.on.mockImplementation((event, handler) => {
            if (event === 'priceUpdate') {
                priceUpdateHandler = handler;
            }
        });

        const TestComponent = () => {
            const { getPrice } = useRealTimeData();
            const price = getPrice('BTC/USD');
            return (
                <div>
                    <div data-testid="price">{price?.price || 'No price'}</div>
                    <div data-testid="change">{price?.change || 'No change'}</div>
                </div>
            );
        };

        render(
            <RealTimeDataProvider>
                <TestComponent />
            </RealTimeDataProvider>
        );

        // Simulate price update
        act(() => {
            priceUpdateHandler({
                symbol: 'BTC/USD',
                price: {
                    price: 50000,
                    change: 250,
                    changePercent: 0.5,
                    volume: 1000
                }
            });
        });

        expect(screen.getByTestId('price')).toHaveTextContent('50000');
        expect(screen.getByTestId('change')).toHaveTextContent('250');
    });

    it('should handle orderbook updates', async () => {
        let orderbookUpdateHandler;
        mockWsManager.on.mockImplementation((event, handler) => {
            if (event === 'orderbookUpdate') {
                orderbookUpdateHandler = handler;
            }
        });

        const TestComponent = () => {
            const { getOrderbook } = useRealTimeData();
            const orderbook = getOrderbook('BTC/USD');
            return (
                <div>
                    <div data-testid="asks-count">{orderbook?.asks?.length || 0}</div>
                    <div data-testid="bids-count">{orderbook?.bids?.length || 0}</div>
                </div>
            );
        };

        render(
            <RealTimeDataProvider>
                <TestComponent />
            </RealTimeDataProvider>
        );

        // Simulate orderbook update
        act(() => {
            orderbookUpdateHandler({
                symbol: 'BTC/USD',
                orderbook: {
                    asks: [
                        { price: 50100, size: 1.5, timestamp: Date.now() },
                        { price: 50150, size: 2.0, timestamp: Date.now() }
                    ],
                    bids: [
                        { price: 49900, size: 2.5, timestamp: Date.now() },
                        { price: 49850, size: 1.8, timestamp: Date.now() }
                    ]
                }
            });
        });

        expect(screen.getByTestId('asks-count')).toHaveTextContent('2');
        expect(screen.getByTestId('bids-count')).toHaveTextContent('2');
    });

    it('should handle trade updates', async () => {
        let tradeUpdateHandler;
        mockWsManager.on.mockImplementation((event, handler) => {
            if (event === 'tradeUpdate') {
                tradeUpdateHandler = handler;
            }
        });

        const TestComponent = () => {
            const { getTrades } = useRealTimeData();
            const trades = getTrades('BTC/USD');
            return (
                <div>
                    <div data-testid="trades-count">{trades.length}</div>
                    {trades.map((trade, index) => (
                        <div key={index} data-testid="trade-price">{trade.price}</div>
                    ))}
                </div>
            );
        };

        render(
            <RealTimeDataProvider>
                <TestComponent />
            </RealTimeDataProvider>
        );

        // Simulate trade update
        act(() => {
            tradeUpdateHandler({
                symbol: 'BTC/USD',
                trades: [
                    { price: 50000, size: 0.5, side: 'buy', timestamp: Date.now() },
                    { price: 49950, size: 1.0, side: 'sell', timestamp: Date.now() }
                ]
            });
        });

        expect(screen.getByTestId('trades-count')).toHaveTextContent('2');
        expect(screen.getAllByTestId('trade-price')).toHaveLength(2);
    });
});

describe('Subscription Management', () => {
    it('should handle subscriptions and unsubscriptions', () => {
        const TestComponent = () => {
            const { subscribe, unsubscribe, subscriptions } = useRealTimeData();
            return (
                <div>
                    <div data-testid="subscription-count">{subscriptions.size}</div>
                    <button
                        onClick={() => subscribe('price.BTC/USD')}
                        data-testid="subscribe-btn"
                    >
                        Subscribe
                    </button>
                    <button
                        onClick={() => unsubscribe('price.BTC/USD')}
                        data-testid="unsubscribe-btn"
                    >
                        Unsubscribe
                    </button>
                </div>
            );
        };

        render(
            <RealTimeDataProvider>
                <TestComponent />
            </RealTimeDataProvider>
        );

        // Test subscription
        fireEvent.click(screen.getByTestId('subscribe-btn'));
        expect(mockWsManager.subscribe).toHaveBeenCalledWith('price.BTC/USD', undefined);

        // Test unsubscription
        fireEvent.click(screen.getByTestId('unsubscribe-btn'));
        expect(mockWsManager.unsubscribe).toHaveBeenCalledWith('price.BTC/USD');
    });
});

describe('Performance Monitoring', () => {
    it('should collect and display metrics', async () => {
        const TestComponent = () => {
            const { metrics } = useRealTimeData();
            return (
                <div>
                    <div data-testid="messages-received">{metrics.messagesReceived || 0}</div>
                    <div data-testid="uptime">{metrics.uptime || 0}</div>
                    <div data-testid="health-status">{metrics.health?.isHealthy?.toString() || 'unknown'}</div>
                </div>
            );
        };

        render(
            <RealTimeDataProvider performanceMonitoring={true}>
                <TestComponent />
            </RealTimeDataProvider>
        );

        // Fast-forward to trigger metrics update
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        await waitFor(() => {
            expect(screen.getByTestId('messages-received')).toHaveTextContent('100');
            expect(screen.getByTestId('uptime')).toHaveTextContent('60000');
            expect(screen.getByTestId('health-status')).toHaveTextContent('true');
        });
    });

    it('should perform memory cleanup', () => {
        render(
            <RealTimeDataProvider memoryCleanupInterval={1000}>
                <div>Test</div>
            </RealTimeDataProvider>
        );

        // Fast-forward to trigger memory cleanup
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(mockWsManager.performMemoryCleanup).toHaveBeenCalled();
    });
});

describe('Hooks', () => {
    describe('useSymbolData', () => {
        it('should return symbol-specific data', () => {
            let priceUpdateHandler;
            mockWsManager.on.mockImplementation((event, handler) => {
                if (event === 'priceUpdate') {
                    priceUpdateHandler = handler;
                }
            });

            const TestComponent = () => {
                const symbolData = useSymbolData('BTC/USD');
                return (
                    <div>
                        <div data-testid="symbol">{symbolData.symbol}</div>
                        <div data-testid="price">{symbolData.price?.price || 'No price'}</div>
                    </div>
                );
            };

            render(
                <RealTimeDataProvider>
                    <TestComponent />
                </RealTimeDataProvider>
            );

            expect(screen.getByTestId('symbol')).toHaveTextContent('BTC/USD');

            // Simulate price update
            act(() => {
                priceUpdateHandler({
                    symbol: 'BTC/USD',
                    price: { price: 50000 }
                });
            });

            expect(screen.getByTestId('price')).toHaveTextContent('50000');
        });
    });

    describe('usePriceSubscription', () => {
        it('should auto-subscribe when enabled', () => {
            const TestComponent = () => {
                const { price, isSubscribed } = usePriceSubscription('BTC/USD', true);
                return (
                    <div>
                        <div data-testid="subscribed">{isSubscribed.toString()}</div>
                        <div data-testid="price">{price?.price || 'No price'}</div>
                    </div>
                );
            };

            // Mock connected state
            let stateChangeHandler;
            mockWsManager.on.mockImplementation((event, handler) => {
                if (event === 'stateChange') {
                    stateChangeHandler = handler;
                }
            });

            render(
                <RealTimeDataProvider>
                    <TestComponent />
                </RealTimeDataProvider>
            );

            // Simulate connection
            act(() => {
                stateChangeHandler({ newState: WS_STATES.CONNECTED });
            });

            expect(mockWsManager.subscribe).toHaveBeenCalledWith('price.BTC/USD');
        });
    });

    describe('useOrderbookSubscription', () => {
        it('should handle throttled orderbook updates', () => {
            let orderbookUpdateHandler;
            mockWsManager.on.mockImplementation((event, handler) => {
                if (event === 'orderbookUpdate') {
                    orderbookUpdateHandler = handler;
                }
            });

            const TestComponent = () => {
                const { orderbook, isSubscribed } = useOrderbookSubscription(
                    'BTC/USD',
                    true,
                    { throttleMs: 100 }
                );
                return (
                    <div>
                        <div data-testid="subscribed">{isSubscribed.toString()}</div>
                        <div data-testid="asks-count">{orderbook?.asks?.length || 0}</div>
                    </div>
                );
            };

            render(
                <RealTimeDataProvider>
                    <TestComponent />
                </RealTimeDataProvider>
            );

            // Simulate orderbook update
            act(() => {
                orderbookUpdateHandler({
                    symbol: 'BTC/USD',
                    orderbook: {
                        asks: [{ price: 50100, size: 1.5 }],
                        bids: []
                    }
                });
            });

            // Should be throttled initially
            expect(screen.getByTestId('asks-count')).toHaveTextContent('0');

            // Fast-forward past throttle time
            act(() => {
                jest.advanceTimersByTime(100);
            });

            expect(screen.getByTestId('asks-count')).toHaveTextContent('1');
        });
    });

    describe('usePerformantRealTimeData', () => {
        it('should handle multiple symbols with batching', () => {
            const symbols = ['BTC/USD', 'ETH/USD'];

            const TestComponent = () => {
                const { data, isConnected } = usePerformantRealTimeData(symbols, {
                    throttleMs: 50,
                    batchUpdates: true
                });

                return (
                    <div>
                        <div data-testid="connected">{isConnected.toString()}</div>
                        <div data-testid="data-count">{data.size}</div>
                    </div>
                );
            };

            render(
                <RealTimeDataProvider>
                    <TestComponent />
                </RealTimeDataProvider>
            );

            expect(mockWsManager.subscribe).toHaveBeenCalledWith('price.BTC/USD', expect.any(Object));
            expect(mockWsManager.subscribe).toHaveBeenCalledWith('price.ETH/USD', expect.any(Object));
        });
    });
});

describe('Error Handling', () => {
    it('should handle WebSocket manager errors gracefully', () => {
        mockWsManager.connect.mockRejectedValue(new Error('Connection failed'));

        const TestComponent = () => {
            const { connect, errors } = useRealTimeData();
            return (
                <div>
                    <button onClick={connect} data-testid="connect-btn">Connect</button>
                    <div data-testid="error-count">{errors.length}</div>
                </div>
            );
        };

        render(
            <RealTimeDataProvider autoConnect={false}>
                <TestComponent />
            </RealTimeDataProvider>
        );

        fireEvent.click(screen.getByTestId('connect-btn'));

        // Should handle the error gracefully
        expect(screen.getByTestId('error-count')).toHaveTextContent('1');
    });

    it('should clear errors when requested', () => {
        let errorHandler;
        mockWsManager.on.mockImplementation((event, handler) => {
            if (event === 'error') {
                errorHandler = handler;
            }
        });

        const TestComponent = () => {
            const { errors, clearErrors } = useRealTimeData();
            return (
                <div>
                    <div data-testid="error-count">{errors.length}</div>
                    <button onClick={clearErrors} data-testid="clear-btn">Clear</button>
                </div>
            );
        };

        render(
            <RealTimeDataProvider>
                <TestComponent />
            </RealTimeDataProvider>
        );

        // Add error
        act(() => {
            errorHandler({ message: 'Test error' });
        });

        expect(screen.getByTestId('error-count')).toHaveTextContent('1');

        // Clear errors
        fireEvent.click(screen.getByTestId('clear-btn'));
        expect(screen.getByTestId('error-count')).toHaveTextContent('0');
    });
});

describe('Cleanup', () => {
    it('should cleanup resources on unmount', () => {
        const { unmount } = render(
            <RealTimeDataProvider>
                <div>Test</div>
            </RealTimeDataProvider>
        );

        unmount();

        expect(mockWsManager.destroy).toHaveBeenCalled();
    });
});
});