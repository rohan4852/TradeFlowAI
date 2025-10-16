import { WebSocketManager, WS_STATES, MESSAGE_TYPES } from '../websocketManager';

// Mock WebSocket
global.WebSocket = jest.fn();
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));

// Mock performance API
Object.defineProperty(window, 'performance', {
    value: {
        now: jest.fn(() => Date.now())
    }
});

describe('WebSocketManager Enhanced Tests', () => {
    let mockWebSocket;
    let wsManager;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        jest.useFakeTimers();

        // Create mock WebSocket instance
        mockWebSocket = {
            readyState: WebSocket.CONNECTING,
            send: jest.fn(),
            close: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            onopen: null,
            onmessage: null,
            onclose: null,
            onerror: null
        };

        global.WebSocket.mockImplementation(() => mockWebSocket);

        wsManager = new WebSocketManager({
            url: 'wss://test.example.com/ws',
            debug: true,
            reconnectInterval: 1000,
            maxReconnectAttempts: 3,
            heartbeatInterval: 5000,
            enableCompression: true,
            throttleInterval: 16,
            batchSize: 5
        });
    });

    afterEach(() => {
        if (wsManager) {
            wsManager.destroy();
        }
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    describe('Initialization', () => {
        it('should initialize with correct default values', () => {
            const manager = new WebSocketManager();

            expect(manager.url).toBe('wss://api.example.com/ws');
            expect(manager.reconnectInterval).toBe(5000);
            expect(manager.maxReconnectAttempts).toBe(10);
            expect(manager.state).toBe(WS_STATES.DISCONNECTED);
        });

        it('should initialize with custom options', () => {
            const options = {
                url: 'wss://custom.com/ws',
                reconnectInterval: 2000,
                maxReconnectAttempts: 5,
                debug: true
            };

            const manager = new WebSocketManager(options);

            expect(manager.url).toBe(options.url);
            expect(manager.reconnectInterval).toBe(options.reconnectInterval);
            expect(manager.maxReconnectAttempts).toBe(options.maxReconnectAttempts);
            expect(manager.debug).toBe(options.debug);
        });
    });

    describe('Connection Management', () => {
        it('should connect successfully', async () => {
            const connectPromise = wsManager.connect();

            expect(wsManager.state).toBe(WS_STATES.CONNECTING);
            expect(global.WebSocket).toHaveBeenCalledWith('wss://test.example.com/ws', []);

            // Simulate successful connection
            mockWebSocket.readyState = WebSocket.OPEN;
            mockWebSocket.onopen({ type: 'open' });

            await connectPromise;

            expect(wsManager.state).toBe(WS_STATES.CONNECTED);
            expect(wsManager.isConnected()).toBe(true);
        });

        it('should handle connection errors', async () => {
            const connectPromise = wsManager.connect();

            // Simulate connection error
            const error = new Error('Connection failed');
            mockWebSocket.onerror(error);

            await expect(connectPromise).rejects.toThrow('WebSocket connection failed');
            expect(wsManager.state).toBe(WS_STATES.ERROR);
        });

        it('should disconnect cleanly', () => {
            wsManager.ws = mockWebSocket;
            wsManager.state = WS_STATES.CONNECTED;

            wsManager.disconnect();

            expect(mockWebSocket.close).toHaveBeenCalledWith(1000, 'Client disconnect');
            expect(wsManager.state).toBe(WS_STATES.DISCONNECTED);
        });

        it('should not connect if already connected', async () => {
            mockWebSocket.readyState = WebSocket.OPEN;
            wsManager.ws = mockWebSocket;
            wsManager.state = WS_STATES.CONNECTED;

            await wsManager.connect();

            expect(global.WebSocket).not.toHaveBeenCalled();
        });
    });

    describe('Message Handling', () => {
        beforeEach(() => {
            wsManager.ws = mockWebSocket;
            wsManager.state = WS_STATES.CONNECTED;
            mockWebSocket.readyState = WebSocket.OPEN;
        });

        it('should send messages when connected', () => {
            const message = { type: 'test', data: 'hello' };
            const result = wsManager.send(message);

            expect(result).toBe(true);
            expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message));
            expect(wsManager.metrics.messagesSent).toBe(1);
        });

        it('should queue messages when disconnected', () => {
            wsManager.state = WS_STATES.DISCONNECTED;
            mockWebSocket.readyState = WebSocket.CLOSED;

            const message = { type: 'test', data: 'hello' };
            const result = wsManager.send(message);

            expect(result).toBe(false);
            expect(wsManager.messageQueue).toHaveLength(1);
            expect(mockWebSocket.send).not.toHaveBeenCalled();
        });

        it('should handle message size limits', () => {
            const largeMessage = { data: 'x'.repeat(wsManager.maxMessageSize + 1) };

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const result = wsManager.send(largeMessage);

            expect(result).toBe(false);
            expect(mockWebSocket.send).not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should handle batch message sending', () => {
            const messages = [
                { type: 'test1' },
                { type: 'test2' },
                { type: 'test3' }
            ];

            messages.forEach(msg => {
                wsManager.send(msg, { batch: true });
            });

            // Should not send immediately
            expect(mockWebSocket.send).not.toHaveBeenCalled();

            // Trigger batch flush
            wsManager.flushMessageBatch();

            expect(mockWebSocket.send).toHaveBeenCalledWith(
                JSON.stringify({
                    type: 'batch',
                    messages: messages.map(m => JSON.stringify(m)),
                    timestamp: expect.any(Number)
                })
            );
        });

        it('should process incoming messages', () => {
            const mockHandler = jest.fn();
            wsManager.on('priceUpdate', mockHandler);

            const messageData = {
                type: MESSAGE_TYPES.PRICE_UPDATE,
                symbol: 'BTC/USD',
                price: { price: 50000 }
            };

            wsManager.handleMessage({
                data: JSON.stringify(messageData)
            });

            expect(mockHandler).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...messageData,
                    receiveTime: expect.any(Number)
                })
            );
            expect(wsManager.metrics.messagesReceived).toBe(1);
        });

        it('should handle batch message processing', () => {
            const mockHandler = jest.fn();
            wsManager.on('priceUpdate', mockHandler);

            const batchMessage = {
                type: 'batch',
                messages: [
                    JSON.stringify({ type: MESSAGE_TYPES.PRICE_UPDATE, symbol: 'BTC/USD' }),
                    JSON.stringify({ type: MESSAGE_TYPES.PRICE_UPDATE, symbol: 'ETH/USD' })
                ]
            };

            wsManager.handleMessage({
                data: JSON.stringify(batchMessage)
            });

            expect(mockHandler).toHaveBeenCalledTimes(2);
        });

        it('should handle malformed messages gracefully', () => {
            const mockErrorHandler = jest.fn();
            wsManager.on('parseError', mockErrorHandler);

            wsManager.handleMessage({
                data: 'invalid json'
            });

            expect(mockErrorHandler).toHaveBeenCalled();
            expect(wsManager.metrics.errors).toHaveLength(1);
        });
    });

    describe('Subscription Management', () => {
        beforeEach(() => {
            wsManager.ws = mockWebSocket;
            wsManager.state = WS_STATES.CONNECTED;
            mockWebSocket.readyState = WebSocket.OPEN;
        });

        it('should handle subscriptions', () => {
            wsManager.subscribe('price.BTC/USD', { interval: '1s' });

            expect(mockWebSocket.send).toHaveBeenCalledWith(
                JSON.stringify({
                    type: MESSAGE_TYPES.SUBSCRIBE,
                    channel: 'price.BTC/USD',
                    params: { interval: '1s' },
                    timestamp: expect.any(Number)
                })
            );
            expect(wsManager.subscriptions.size).toBe(1);
        });

        it('should handle unsubscriptions', () => {
            // First subscribe
            wsManager.subscribe('price.BTC/USD');
            expect(wsManager.subscriptions.size).toBe(1);

            // Then unsubscribe
            wsManager.unsubscribe('price.BTC/USD');

            expect(mockWebSocket.send).toHaveBeenLastCalledWith(
                JSON.stringify({
                    type: MESSAGE_TYPES.UNSUBSCRIBE,
                    channel: 'price.BTC/USD',
                    timestamp: expect.any(Number)
                })
            );
            expect(wsManager.subscriptions.size).toBe(0);
        });

        it('should resubscribe after reconnection', async () => {
            // Subscribe to channels
            wsManager.subscribe('price.BTC/USD');
            wsManager.subscribe('orderbook.ETH/USD');

            // Clear send calls
            mockWebSocket.send.mockClear();

            // Simulate reconnection
            wsManager.resubscribe();

            expect(mockWebSocket.send).toHaveBeenCalledTimes(2);
        });
    });
}); descri
be('Reconnection Logic', () => {
    it('should attempt reconnection on connection loss', () => {
        wsManager.ws = mockWebSocket;
        wsManager.state = WS_STATES.CONNECTED;
        wsManager.reconnectAttempts = 0;

        // Simulate connection close
        mockWebSocket.onclose({ code: 1006, reason: 'Connection lost' });

        expect(wsManager.state).toBe(WS_STATES.DISCONNECTED);

        // Fast-forward to trigger reconnection
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(wsManager.reconnectAttempts).toBe(1);
        expect(wsManager.state).toBe(WS_STATES.RECONNECTING);
    });

    it('should stop reconnecting after max attempts', () => {
        wsManager.reconnectAttempts = wsManager.maxReconnectAttempts;

        wsManager.attemptReconnect();

        expect(wsManager.state).toBe(WS_STATES.CLOSED);
    });

    it('should use exponential backoff for reconnection', () => {
        wsManager.reconnectAttempts = 2;

        const spy = jest.spyOn(global, 'setTimeout');
        wsManager.attemptReconnect();

        // Should use exponential backoff: 1000 * 1.5^(2-1) = 1500ms
        expect(spy).toHaveBeenCalledWith(expect.any(Function), 1500);

        spy.mockRestore();
    });
});

describe('Heartbeat System', () => {
    beforeEach(() => {
        wsManager.ws = mockWebSocket;
        wsManager.state = WS_STATES.CONNECTED;
        mockWebSocket.readyState = WebSocket.OPEN;
    });

    it('should start heartbeat on connection', () => {
        wsManager.startHeartbeat();

        // Fast-forward past heartbeat interval
        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(mockWebSocket.send).toHaveBeenCalledWith(
            JSON.stringify({
                type: MESSAGE_TYPES.HEARTBEAT,
                timestamp: expect.any(Number)
            })
        );
    });

    it('should handle heartbeat response', () => {
        const heartbeatMessage = {
            type: MESSAGE_TYPES.HEARTBEAT,
            timestamp: Date.now()
        };

        wsManager.handleHeartbeat(heartbeatMessage);

        expect(wsManager.lastHeartbeat).toBeDefined();
        expect(mockWebSocket.send).toHaveBeenCalledWith(
            JSON.stringify({
                type: MESSAGE_TYPES.PONG,
                timestamp: expect.any(Number)
            })
        );
    });

    it('should calculate latency from pong messages', () => {
        const sendTime = Date.now();
        wsManager.performanceMonitor.lastMessageTime = sendTime;

        const pongMessage = {
            type: MESSAGE_TYPES.PONG,
            timestamp: sendTime
        };

        // Mock current time to be 50ms later
        jest.spyOn(Date, 'now').mockReturnValue(sendTime + 50);

        wsManager.processMessage(pongMessage, sendTime + 50);

        expect(wsManager.metrics.latency).toBe(50);

        Date.now.mockRestore();
    });
});

describe('Performance Monitoring', () => {
    it('should track message metrics', () => {
        wsManager.ws = mockWebSocket;
        wsManager.state = WS_STATES.CONNECTED;
        mockWebSocket.readyState = WebSocket.OPEN;

        // Send messages
        wsManager.send({ type: 'test1' });
        wsManager.send({ type: 'test2' });

        expect(wsManager.metrics.messagesSent).toBe(2);

        // Receive messages
        wsManager.handleMessage({ data: JSON.stringify({ type: 'test' }) });
        wsManager.handleMessage({ data: JSON.stringify({ type: 'test' }) });

        expect(wsManager.metrics.messagesReceived).toBe(2);
    });

    it('should calculate message rate', () => {
        const now = Date.now();
        jest.spyOn(Date, 'now').mockReturnValue(now);

        // Add timestamps
        wsManager.performanceMonitor.messageTimestamps = [
            now - 30000, // 30 seconds ago
            now - 20000, // 20 seconds ago
            now - 10000, // 10 seconds ago
            now         // now
        ];

        wsManager.updatePerformanceMetrics(now);

        // Should be 4 messages in 60 seconds = 4/60 = 0.067 messages/second
        expect(wsManager.metrics.messageRate).toBeCloseTo(0.067, 2);

        Date.now.mockRestore();
    });

    it('should track connection stability', () => {
        const now = Date.now();
        wsManager.metrics.lastConnected = now - 60000; // 1 minute ago
        wsManager.performanceMonitor.errorTimestamps = [
            now - 30000, // 1 error 30 seconds ago
        ];

        wsManager.updatePerformanceMetrics(now);

        // Should calculate stability based on error frequency
        expect(wsManager.metrics.connectionStability).toBeGreaterThan(90);
    });

    it('should provide connection health assessment', () => {
        wsManager.metrics.connectionStability = 95;
        wsManager.metrics.averageLatency = 25;
        wsManager.metrics.errorRate = 0.1;
        wsManager.metrics.memoryUsage = 1024;

        const health = wsManager.getConnectionHealth();

        expect(health.isHealthy).toBe(true);
        expect(health.stability).toBe(95);
        expect(health.latency).toBe(25);
        expect(health.recommendations).toEqual([]);
    });

    it('should provide health recommendations', () => {
        wsManager.metrics.connectionStability = 70; // Low stability
        wsManager.metrics.averageLatency = 1500; // High latency
        wsManager.metrics.errorRate = 10; // High error rate

        const health = wsManager.getConnectionHealth();

        expect(health.recommendations).toContain('Connection unstable - check network conditions');
        expect(health.recommendations).toContain('High latency detected - consider using a closer server');
        expect(health.recommendations).toContain('High error rate - check server status');
    });
});

describe('Error Handling', () => {
    it('should categorize different error types', () => {
        expect(wsManager.categorizeError(new Error('network error'))).toBe('network');
        expect(wsManager.categorizeError(new Error('timeout occurred'))).toBe('timeout');
        expect(wsManager.categorizeError(new Error('unauthorized access'))).toBe('authentication');
        expect(wsManager.categorizeError(new Error('rate limit exceeded'))).toBe('rate_limit');
        expect(wsManager.categorizeError(new Error('json parse error'))).toBe('parse');
        expect(wsManager.categorizeError(new Error('unknown error'))).toBe('unknown');
    });

    it('should attempt error recovery based on error type', () => {
        const networkError = { type: 'network', error: 'Connection lost' };
        const rateLimitError = { type: 'rate_limit', error: 'Rate limit exceeded' };

        const originalInterval = wsManager.reconnectInterval;

        wsManager.attemptErrorRecovery(networkError);
        // Network errors should not change reconnect interval
        expect(wsManager.reconnectInterval).toBe(originalInterval);

        wsManager.attemptErrorRecovery(rateLimitError);
        // Rate limit errors should increase reconnect interval
        expect(wsManager.reconnectInterval).toBeGreaterThan(originalInterval);
    });

    it('should emit authentication required event for auth errors', () => {
        const mockHandler = jest.fn();
        wsManager.on('authenticationRequired', mockHandler);

        const authError = { type: 'authentication', error: 'Unauthorized' };
        wsManager.attemptErrorRecovery(authError);

        expect(mockHandler).toHaveBeenCalledWith(authError);
    });
});

describe('Memory Management', () => {
    it('should perform memory cleanup', () => {
        const oldTimestamp = Date.now() - 400000; // 6+ minutes ago
        const recentTimestamp = Date.now() - 60000; // 1 minute ago

        // Add old data that should be cleaned up
        wsManager.metrics.errors = [
            { timestamp: oldTimestamp, error: 'old error' },
            { timestamp: recentTimestamp, error: 'recent error' }
        ];

        wsManager.performanceMonitor.messageTimestamps = [
            oldTimestamp,
            recentTimestamp
        ];

        wsManager.messageQueue = [
            { timestamp: oldTimestamp, message: 'old message' },
            { timestamp: recentTimestamp, message: 'recent message' }
        ];

        wsManager.performMemoryCleanup();

        // Old data should be removed
        expect(wsManager.metrics.errors).toHaveLength(1);
        expect(wsManager.metrics.errors[0].error).toBe('recent error');

        expect(wsManager.performanceMonitor.messageTimestamps).toHaveLength(1);
        expect(wsManager.messageQueue).toHaveLength(1);
    });

    it('should estimate memory usage', () => {
        wsManager.metrics.errors = [{ error: 'test' }];
        wsManager.performanceMonitor.messageTimestamps = [Date.now()];
        wsManager.messageQueue = [{ message: 'test' }];
        wsManager.subscriptions.add('test');
        wsManager.eventHandlers.set('test', new Set());

        wsManager.updateMemoryUsage();

        expect(wsManager.metrics.memoryUsage).toBeGreaterThan(0);
        expect(wsManager.metrics.queueSize).toBe(1);
        expect(wsManager.metrics.subscriptionCount).toBe(1);
    });
});

describe('Event System', () => {
    it('should add and remove event listeners', () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();

        wsManager.on('test', handler1);
        wsManager.on('test', handler2);

        wsManager.emit('test', { data: 'test' });

        expect(handler1).toHaveBeenCalledWith({ data: 'test' });
        expect(handler2).toHaveBeenCalledWith({ data: 'test' });

        wsManager.off('test', handler1);
        wsManager.emit('test', { data: 'test2' });

        expect(handler1).toHaveBeenCalledTimes(1); // Not called again
        expect(handler2).toHaveBeenCalledTimes(2); // Called again
    });

    it('should handle event handler errors gracefully', () => {
        const errorHandler = jest.fn(() => {
            throw new Error('Handler error');
        });
        const goodHandler = jest.fn();

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        wsManager.on('test', errorHandler);
        wsManager.on('test', goodHandler);

        wsManager.emit('test', { data: 'test' });

        expect(goodHandler).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});

describe('Cleanup and Destruction', () => {
    it('should clean up all resources on destroy', () => {
        wsManager.ws = mockWebSocket;
        wsManager.state = WS_STATES.CONNECTED;

        // Add some data
        wsManager.eventHandlers.set('test', new Set());
        wsManager.subscriptions.add('test');
        wsManager.messageQueue.push({ message: 'test' });
        wsManager.messageBatch.push({ message: 'test' });

        wsManager.destroy();

        expect(mockWebSocket.close).toHaveBeenCalled();
        expect(wsManager.eventHandlers.size).toBe(0);
        expect(wsManager.subscriptions.size).toBe(0);
        expect(wsManager.messageQueue).toHaveLength(0);
        expect(wsManager.messageBatch).toHaveLength(0);
        expect(wsManager.metrics.messagesReceived).toBe(0);
    });
});
});