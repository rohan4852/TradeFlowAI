import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
    useTheme,
    Button,
    Card,
    Label,
    RealTimeDataProvider,
    useRealTimeData,
    CandlestickChart,
    OrderBook,
    WS_STATES
} from '../index';

// Demo container
const DemoContainer = styled.div`
  padding: ${props => props.theme.spacing[8]};
  max-width: 1600px;
  margin: 0 auto;
  background: ${props => props.theme.color.background.primary};
  min-height: 100vh;
`;

// Section wrapper
const Section = styled.section`
  margin-bottom: ${props => props.theme.spacing[12]};
`;

// Section title
const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.color.text.primary};
  margin-bottom: ${props => props.theme.spacing[6]};
  text-align: center;
`;

// Grid layout
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${props => props.theme.spacing[6]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

// Connection status
const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: ${props => {
        switch (props.status) {
            case WS_STATES.CONNECTED:
                return props.theme.color.success[100];
            case WS_STATES.CONNECTING:
            case WS_STATES.RECONNECTING:
                return props.theme.color.warning[100];
            case WS_STATES.ERROR:
                return props.theme.color.error[100];
            default:
                return props.theme.color.background.secondary;
        }
    }};
  border: 1px solid ${props => {
        switch (props.status) {
            case WS_STATES.CONNECTED:
                return props.theme.color.success[300];
            case WS_STATES.CONNECTING:
            case WS_STATES.RECONNECTING:
                return props.theme.color.warning[300];
            case WS_STATES.ERROR:
                return props.theme.color.error[300];
            default:
                return props.theme.color.border.primary;
        }
    }};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

// Status indicator
const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
        switch (props.status) {
            case WS_STATES.CONNECTED:
                return props.theme.color.success[500];
            case WS_STATES.CONNECTING:
            case WS_STATES.RECONNECTING:
                return props.theme.color.warning[500];
            case WS_STATES.ERROR:
                return props.theme.color.error[500];
            default:
                return props.theme.color.text.secondary;
        }
    }};
  
  ${props => (props.status === WS_STATES.CONNECTING || props.status === WS_STATES.RECONNECTING) && `
    animation: pulse 1.5s ease-in-out infinite;
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `}
`;

// Metrics display
const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const MetricCard = styled.div`
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.color.background.secondary};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.color.border.primary};
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-family: ${props => props.theme.typography.fontFamily.monospace};
  color: ${props => props.color || props.theme.color.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.color.text.secondary};
`;

// Control panel
const ControlPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[3]};
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[6]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.color.background.secondary};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.color.border.primary};
`;

// Theme toggle
const ThemeToggle = styled.div`
  position: fixed;
  top: ${props => props.theme.spacing[4]};
  right: ${props => props.theme.spacing[4]};
  z-index: ${props => props.theme.zIndex.sticky};
`;

// Real-time demo content component
const RealTimeDemoContent = () => {
    const { theme } = useTheme();
    const {
        connectionState,
        isConnected,
        isConnecting,
        isReconnecting,
        metrics,
        errors,
        subscriptions,
        connect,
        disconnect,
        subscribe,
        unsubscribe,
        clearErrors
    } = useRealTimeData();

    // State
    const [selectedSymbol, setSelectedSymbol] = useState('BTC/USD');
    const [showMetrics, setShowMetrics] = useState(true);
    const [chartData, setChartData] = useState([]);
    const [orderbookData, setOrderbookData] = useState({ asks: [], bids: [] });

    // Generate sample data
    useEffect(() => {
        const generateSampleData = () => {
            const data = [];
            const basePrice = 50000;
            const now = Date.now();

            for (let i = 0; i < 100; i++) {
                const timestamp = now - (100 - i) * 60000; // 1 minute intervals
                const open = basePrice + (Math.random() - 0.5) * 1000;
                const close = open + (Math.random() - 0.5) * 200;
                const high = Math.max(open, close) + Math.random() * 100;
                const low = Math.min(open, close) - Math.random() * 100;
                const volume = Math.random() * 1000 + 100;

                data.push({ timestamp, open, high, low, close, volume });
            }

            return data;
        };

        const generateOrderbookData = () => {
            const basePrice = 50000;
            const asks = [];
            const bids = [];

            // Generate asks (sell orders)
            for (let i = 0; i < 20; i++) {
                asks.push({
                    price: basePrice + (i + 1) * 0.5,
                    size: Math.random() * 5 + 0.1,
                    timestamp: Date.now()
                });
            }

            // Generate bids (buy orders)
            for (let i = 0; i < 20; i++) {
                bids.push({
                    price: basePrice - (i + 1) * 0.5,
                    size: Math.random() * 5 + 0.1,
                    timestamp: Date.now()
                });
            }

            return { asks, bids };
        };

        setChartData(generateSampleData());
        setOrderbookData(generateOrderbookData());
    }, []);

    // Simulate real-time updates
    useEffect(() => {
        if (!isConnected) return;

        const interval = setInterval(() => {
            // Simulate price updates
            const newPrice = 50000 + (Math.random() - 0.5) * 1000;

            // Update chart data
            setChartData(prev => {
                const updated = [...prev];
                if (updated.length > 0) {
                    const lastCandle = updated[updated.length - 1];
                    updated[updated.length - 1] = {
                        ...lastCandle,
                        close: newPrice,
                        high: Math.max(lastCandle.high, newPrice),
                        low: Math.min(lastCandle.low, newPrice),
                        timestamp: Date.now()
                    };
                }
                return updated;
            });

            // Simulate orderbook updates
            setOrderbookData(prev => ({
                asks: prev.asks.map(ask => ({
                    ...ask,
                    size: Math.max(0.1, ask.size + (Math.random() - 0.5) * 0.5),
                    timestamp: Date.now()
                })),
                bids: prev.bids.map(bid => ({
                    ...bid,
                    size: Math.max(0.1, bid.size + (Math.random() - 0.5) * 0.5),
                    timestamp: Date.now()
                }))
            }));

        }, 1000); // Update every second

        return () => clearInterval(interval);
    }, [isConnected, selectedSymbol]);

    // Connection status text
    const getStatusText = (status) => {
        switch (status) {
            case WS_STATES.CONNECTED:
                return 'Connected';
            case WS_STATES.CONNECTING:
                return 'Connecting...';
            case WS_STATES.RECONNECTING:
                return 'Reconnecting...';
            case WS_STATES.ERROR:
                return 'Connection Error';
            case WS_STATES.DISCONNECTED:
                return 'Disconnected';
            default:
                return 'Unknown';
        }
    };

    // Format number with commas
    const formatNumber = (num) => {
        if (typeof num !== 'number') return '0';
        return num.toLocaleString();
    };

    // Format uptime
    const formatUptime = (ms) => {
        if (!ms) return '0s';
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };

    return (
        <DemoContainer>
            <SectionTitle>Real-Time Data Streaming Demo</SectionTitle>

            {/* Connection Status */}
            <ConnectionStatus status={connectionState}>
                <StatusIndicator status={connectionState} />
                <Label size="sm" weight="medium">
                    {getStatusText(connectionState)}
                </Label>
                {isConnected && (
                    <Label size="xs" color={theme.color.text.secondary}>
                        • {formatUptime(metrics.uptime)} uptime
                    </Label>
                )}
            </ConnectionStatus>

            {/* Control Panel */}
            <ControlPanel>
                <Button
                    variant={isConnected ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={isConnected ? disconnect : connect}
                    disabled={isConnecting || isReconnecting}
                >
                    {isConnected ? 'Disconnect' : 'Connect'}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => subscribe(`price.${selectedSymbol}`)}
                    disabled={!isConnected}
                >
                    Subscribe to {selectedSymbol}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unsubscribe(`price.${selectedSymbol}`)}
                    disabled={!isConnected}
                >
                    Unsubscribe
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMetrics(!showMetrics)}
                >
                    {showMetrics ? 'Hide' : 'Show'} Metrics
                </Button>

                {errors.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearErrors}
                    >
                        Clear Errors ({errors.length})
                    </Button>
                )}
            </ControlPanel>

            {/* Metrics Display */}
            {showMetrics && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <MetricsGrid>
                        <MetricCard>
                            <MetricValue color={theme.color.success[500]}>
                                {formatNumber(metrics.messagesReceived || 0)}
                            </MetricValue>
                            <MetricLabel>Messages Received</MetricLabel>
                        </MetricCard>

                        <MetricCard>
                            <MetricValue color={theme.color.primary[500]}>
                                {formatNumber(metrics.messagesSent || 0)}
                            </MetricValue>
                            <MetricLabel>Messages Sent</MetricLabel>
                        </MetricCard>

                        <MetricCard>
                            <MetricValue color={theme.color.warning[500]}>
                                {formatNumber(metrics.reconnectCount || 0)}
                            </MetricValue>
                            <MetricLabel>Reconnections</MetricLabel>
                        </MetricCard>

                        <MetricCard>
                            <MetricValue>
                                {formatUptime(metrics.uptime)}
                            </MetricValue>
                            <MetricLabel>Uptime</MetricLabel>
                        </MetricCard>

                        <MetricCard>
                            <MetricValue color={theme.color.info[500]}>
                                {formatNumber(subscriptions.size || 0)}
                            </MetricValue>
                            <MetricLabel>Active Subscriptions</MetricLabel>
                        </MetricCard>

                        <MetricCard>
                            <MetricValue color={theme.color.error[500]}>
                                {formatNumber(errors.length)}
                            </MetricValue>
                            <MetricLabel>Errors</MetricLabel>
                        </MetricCard>
                    </MetricsGrid>
                </motion.div>
            )}

            {/* Error Display */}
            {errors.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card variant="error">
                        <div style={{ padding: '1rem' }}>
                            <Label size="sm" weight="bold" color={theme.color.error[700]}>
                                Recent Errors:
                            </Label>
                            {errors.slice(-3).map(error => (
                                <div key={error.id} style={{ marginTop: '0.5rem' }}>
                                    <Label size="xs" color={theme.color.error[600]}>
                                        [{error.type}] {error.message}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Real-Time Components */}
            <Section>
                <Grid>
                    {/* Real-Time Chart */}
                    <Card>
                        <div style={{ padding: '1.5rem' }}>
                            <Label size="lg" weight="bold" style={{ marginBottom: '1rem', display: 'block' }}>
                                Real-Time Price Chart - {selectedSymbol}
                            </Label>
                            <CandlestickChart
                                data={chartData}
                                symbol={selectedSymbol}
                                realTime={isConnected}
                                height="400px"
                                showControls={true}
                                showVolume={true}
                                onRealTimeUpdate={(update) => {
                                    console.log('Real-time price update:', update);
                                }}
                            />
                        </div>
                    </Card>

                    {/* Real-Time Order Book */}
                    <Card>
                        <div style={{ padding: '1.5rem' }}>
                            <Label size="lg" weight="bold" style={{ marginBottom: '1rem', display: 'block' }}>
                                Real-Time Order Book - {selectedSymbol}
                            </Label>
                            <OrderBook
                                asks={orderbookData.asks}
                                bids={orderbookData.bids}
                                symbol={selectedSymbol}
                                realTime={isConnected}
                                height="400px"
                                showDepthBars={true}
                                onRealTimeUpdate={(update) => {
                                    console.log('Real-time orderbook update:', update);
                                }}
                            />
                        </div>
                    </Card>
                </Grid>
            </Section>

            {/* Subscription Management */}
            <Section>
                <Card>
                    <div style={{ padding: '1.5rem' }}>
                        <Label size="lg" weight="bold" style={{ marginBottom: '1rem', display: 'block' }}>
                            Active Subscriptions
                        </Label>

                        {Array.from(subscriptions).length === 0 ? (
                            <Label color={theme.color.text.secondary}>
                                No active subscriptions
                            </Label>
                        ) : (
                            <div>
                                {Array.from(subscriptions).map(subscription => (
                                    <div
                                        key={subscription}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.75rem',
                                            backgroundColor: theme.color.background.secondary,
                                            borderRadius: theme.borderRadius.md,
                                            marginBottom: '0.5rem'
                                        }}
                                    >
                                        <Label size="sm" weight="medium">
                                            {subscription}
                                        </Label>
                                        <Button
                                            variant="ghost"
                                            size="xs"
                                            onClick={() => unsubscribe(subscription)}
                                        >
                                            Unsubscribe
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </Section>

            {/* Performance Indicators */}
            <Section>
                <Card>
                    <div style={{ padding: '1.5rem' }}>
                        <Label size="lg" weight="bold" style={{ marginBottom: '1rem', display: 'block' }}>
                            Performance Indicators
                        </Label>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.color.success[500] }}>
                                    {isConnected ? '●' : '○'}
                                </div>
                                <Label size="xs">Connection</Label>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.color.primary[500] }}>
                                    {Math.round((metrics.messagesReceived || 0) / Math.max((metrics.uptime || 1) / 1000, 1))}
                                </div>
                                <Label size="xs">Msg/sec</Label>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.color.warning[500] }}>
                                    {metrics.queuedMessages || 0}
                                </div>
                                <Label size="xs">Queued</Label>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.color.info[500] }}>
                                    {Math.round(Math.random() * 100)}ms
                                </div>
                                <Label size="xs">Latency</Label>
                            </div>
                        </div>
                    </div>
                </Card>
            </Section>
        </DemoContainer>
    );
};

// Main demo component with provider
const RealTimeDemo = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <>
            <ThemeToggle>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    {theme.mode === 'dark' ? '☀️' : '🌙'}
                </Button>
            </ThemeToggle>

            <RealTimeDataProvider
                wsUrl="wss://demo.websocket.org/ws"
                autoConnect={false}
                reconnectInterval={3000}
                maxReconnectAttempts={5}
                debug={true}
            >
                <RealTimeDemoContent />
            </RealTimeDataProvider>
        </>
    );
};

export default RealTimeDemo;