import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  RealTimeDataProvider,
  useRealTimeData,
  useSymbolData,
  usePriceSubscription,
  useOrderbookSubscription,
  usePerformantRealTimeData
} from '../components/providers';
import { OrderBook, CandlestickChart } from '../components/organisms';
import { Button, Icon, Label } from '../components/atoms';
import { Card } from '../components/molecules';
import { useTheme } from '../ThemeProvider';
import { animationPresets } from '../effects';

// Demo container
const DemoContainer = styled.div`
  padding: ${props => props.theme.spacing[6]};
  background: ${props => props.theme.color.background.primary};
  min-height: 100vh;
`;

// Demo header
const DemoHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing[8]};
  text-align: center;
`;

// Demo title
const DemoTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.color.text.primary};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

// Demo description
const DemoDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.color.text.secondary};
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
`;

// Connection status indicator
const ConnectionStatus = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => {
    switch (props.status) {
      case 'CONNECTED': return `linear-gradient(135deg, ${props.theme.color.trading.bull}20, ${props.theme.color.trading.bull}10)`;
      case 'CONNECTING': return `linear-gradient(135deg, ${props.theme.color.warning[400]}20, ${props.theme.color.warning[400]}10)`;
      case 'RECONNECTING': return `linear-gradient(135deg, ${props.theme.color.warning[500]}20, ${props.theme.color.warning[500]}10)`;
      case 'ERROR': return `linear-gradient(135deg, ${props.theme.color.trading.bear}20, ${props.theme.color.trading.bear}10)`;
      default: return `linear-gradient(135deg, ${props.theme.color.neutral[400]}20, ${props.theme.color.neutral[400]}10)`;
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'CONNECTED': return props.theme.color.trading.bull + '40';
      case 'CONNECTING': return props.theme.color.warning[400] + '40';
      case 'RECONNECTING': return props.theme.color.warning[500] + '40';
      case 'ERROR': return props.theme.color.trading.bear + '40';
      default: return props.theme.color.neutral[400] + '40';
    }
  }};
`;

// Status indicator dot
const StatusDot = styled(motion.div)`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'CONNECTED': return props.theme.color.trading.bull;
      case 'CONNECTING': return props.theme.color.warning[400];
      case 'RECONNECTING': return props.theme.color.warning[500];
      case 'ERROR': return props.theme.color.trading.bear;
      default: return props.theme.color.neutral[400];
    }
  }};
`;

// Metrics grid
const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

// Metric card
const MetricCard = styled(Card)`
  padding: ${props => props.theme.spacing[4]};
  text-align: center;
`;

// Metric value
const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.color.primary[500]};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

// Metric label
const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.color.text.secondary};
`;

// Connection status component
const ConnectionStatusDisplay = () => {
  const { connectionState, isConnected, metrics, errors } = useRealTimeData();
  const { theme } = useTheme();

  const statusAnimation = {
    animate: {
      scale: isConnected ? [1, 1.1, 1] : 1,
      opacity: isConnected ? [1, 0.8, 1] : 1
    },
    transition: {
      duration: 2,
      repeat: isConnected ? Infinity : 0,
      ease: 'easeInOut'
    }
  };

  return (
    <ConnectionStatus status={connectionState} theme={theme} {...animationPresets.slideUp}>
      <StatusDot status={connectionState} theme={theme} {...statusAnimation} />
      <div>
        <div style={{
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.color.text.primary
        }}>
          {connectionState}
        </div>
        {errors.length > 0 && (
          <div style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.color.trading.bear
          }}>
            {errors[errors.length - 1].message}
          </div>
        )}
      </div>
    </ConnectionStatus>
  );
};

// Metrics display component
const MetricsDisplay = () => {
  const { metrics } = useRealTimeData();
  const { theme } = useTheme();

  const formatUptime = (uptime) => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <MetricsGrid theme={theme}>
      <MetricCard theme={theme} {...animationPresets.scale}>
        <MetricValue theme={theme}>{metrics.messagesReceived || 0}</MetricValue>
        <MetricLabel theme={theme}>Messages Received</MetricLabel>
      </MetricCard>

      <MetricCard theme={theme} {...animationPresets.scale}>
        <MetricValue theme={theme}>{metrics.messagesSent || 0}</MetricValue>
        <MetricLabel theme={theme}>Messages Sent</MetricLabel>
      </MetricCard>

      <MetricCard theme={theme} {...animationPresets.scale}>
        <MetricValue theme={theme}>{formatUptime(metrics.uptime || 0)}</MetricValue>
        <MetricLabel theme={theme}>Uptime</MetricLabel>
      </MetricCard>

      <MetricCard theme={theme} {...animationPresets.scale}>
        <MetricValue theme={theme}>{metrics.subscriptions || 0}</MetricValue>
        <MetricLabel theme={theme}>Active Subscriptions</MetricLabel>
      </MetricCard>

      <MetricCard theme={theme} {...animationPresets.scale}>
        <MetricValue theme={theme}>{Math.round(metrics.averageLatency || 0)}ms</MetricValue>
        <MetricLabel theme={theme}>Average Latency</MetricLabel>
      </MetricCard>

      <MetricCard theme={theme} {...animationPresets.scale}>
        <MetricValue theme={theme}>{formatBytes(metrics.bytesReceived || 0)}</MetricValue>
        <MetricLabel theme={theme}>Data Received</MetricLabel>
      </MetricCard>
    </MetricsGrid>
  );
};

// Real-time price display component
const RealTimePriceDisplay = ({ symbol }) => {
  const { price, isSubscribed, subscribe, unsubscribe } = usePriceSubscription(symbol, true);
  const { theme } = useTheme();

  const priceChangeColor = price?.change >= 0
    ? theme.color.trading.bull
    : theme.color.trading.bear;

  return (
    <Card theme={theme} {...animationPresets.slideLeft}>
      <div style={{ padding: theme.spacing[4] }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing[3]
        }}>
          <h3 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.color.text.primary
          }}>
            {symbol}
          </h3>
          <div style={{
            padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
            borderRadius: theme.borderRadius.sm,
            backgroundColor: isSubscribed
              ? theme.color.trading.bull + '20'
              : theme.color.neutral[400] + '20',
            color: isSubscribed
              ? theme.color.trading.bull
              : theme.color.neutral[400],
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.medium
          }}>
            {isSubscribed ? 'LIVE' : 'OFFLINE'}
          </div>
        </div>

        {price ? (
          <div>
            <div style={{
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.color.text.primary,
              marginBottom: theme.spacing[2]
            }}>
              ${price.price?.toFixed(2) || '0.00'}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing[2],
              marginBottom: theme.spacing[3]
            }}>
              <span style={{
                color: priceChangeColor,
                fontWeight: theme.typography.fontWeight.medium
              }}>
                {price.change >= 0 ? '+' : ''}{price.change?.toFixed(2) || '0.00'}
              </span>
              <span style={{
                color: priceChangeColor,
                fontSize: theme.typography.fontSize.sm
              }}>
                ({price.changePercent >= 0 ? '+' : ''}{price.changePercent?.toFixed(2) || '0.00'}%)
              </span>
            </div>

            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.color.text.secondary
            }}>
              Volume: {price.volume?.toLocaleString() || '0'}
            </div>
          </div>
        ) : (
          <div style={{
            color: theme.color.text.secondary,
            fontStyle: 'italic'
          }}>
            No price data available
          </div>
        )}

        <div style={{
          marginTop: theme.spacing[4],
          display: 'flex',
          gap: theme.spacing[2]
        }}>
          <Button
            size="sm"
            variant={isSubscribed ? 'outline' : 'primary'}
            onClick={isSubscribed ? unsubscribe : subscribe}
            leftIcon={<Icon name={isSubscribed ? 'pause' : 'play'} />}
          >
            {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Real-time order book display component
const RealTimeOrderBookDisplay = ({ symbol }) => {
  const { orderbook, isSubscribed, subscribe, unsubscribe } = useOrderbookSubscription(
    symbol,
    true,
    { throttleMs: 16, maxDepth: 20, enableAnimations: true }
  );
  const { theme } = useTheme();

  const spread = useMemo(() => {
    if (!orderbook?.asks?.length || !orderbook?.bids?.length) {
      return { value: 0, percent: 0 };
    }

    const bestAsk = Math.min(...orderbook.asks.map(o => o.price));
    const bestBid = Math.max(...orderbook.bids.map(o => o.price));
    const spreadValue = bestAsk - bestBid;
    const spreadPercent = (spreadValue / bestBid) * 100;

    return { value: spreadValue, percent: spreadPercent };
  }, [orderbook]);

  return (
    <Card theme={theme} {...animationPresets.slideRight}>
      <div style={{ padding: theme.spacing[4] }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing[4]
        }}>
          <h3 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.color.text.primary
          }}>
            Order Book - {symbol}
          </h3>
          <div style={{
            padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
            borderRadius: theme.borderRadius.sm,
            backgroundColor: isSubscribed
              ? theme.color.trading.bull + '20'
              : theme.color.neutral[400] + '20',
            color: isSubscribed
              ? theme.color.trading.bull
              : theme.color.neutral[400],
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.medium
          }}>
            {isSubscribed ? 'STREAMING' : 'PAUSED'}
          </div>
        </div>

        {orderbook ? (
          <OrderBook
            asks={orderbook.asks || []}
            bids={orderbook.bids || []}
            spread={spread}
            symbol={symbol}
            realTime={isSubscribed}
            precision={2}
            maxDepth={10}
            height="300px"
            showDepthBars={true}
            showCumulativeTotal={true}
          />
        ) : (
          <div style={{
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.color.text.secondary,
            fontStyle: 'italic'
          }}>
            No order book data available
          </div>
        )}

        <div style={{
          marginTop: theme.spacing[4],
          display: 'flex',
          gap: theme.spacing[2]
        }}>
          <Button
            size="sm"
            variant={isSubscribed ? 'outline' : 'primary'}
            onClick={isSubscribed ? unsubscribe : subscribe}
            leftIcon={<Icon name={isSubscribed ? 'pause' : 'play'} />}
          >
            {isSubscribed ? 'Stop Stream' : 'Start Stream'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Performance monitoring component
const PerformanceMonitor = () => {
  const { metrics } = useRealTimeData();
  const { theme } = useTheme();

  const health = metrics.health || {};
  const isHealthy = health.isHealthy !== false;

  const getHealthColor = (value, thresholds) => {
    if (value >= thresholds.good) return theme.color.trading.bull;
    if (value >= thresholds.warning) return theme.color.warning[500];
    return theme.color.trading.bear;
  };

  return (
    <Card theme={theme} {...animationPresets.fadeIn}>
      <div style={{ padding: theme.spacing[4] }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing[2],
          marginBottom: theme.spacing[4]
        }}>
          <h3 style={{
            margin: 0,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.color.text.primary
          }}>
            Performance Monitor
          </h3>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: isHealthy ? theme.color.trading.bull : theme.color.trading.bear
          }} />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: theme.spacing[3],
          marginBottom: theme.spacing[4]
        }}>
          <div>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.color.text.secondary,
              marginBottom: theme.spacing[1]
            }}>
              Connection Stability
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: getHealthColor(health.stability || 0, { good: 90, warning: 70 })
            }}>
              {Math.round(health.stability || 0)}%
            </div>
          </div>

          <div>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.color.text.secondary,
              marginBottom: theme.spacing[1]
            }}>
              Message Rate
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.color.text.primary
            }}>
              {Math.round(metrics.messageRate || 0)}/s
            </div>
          </div>

          <div>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.color.text.secondary,
              marginBottom: theme.spacing[1]
            }}>
              Error Rate
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: getHealthColor(100 - (metrics.errorRate || 0), { good: 95, warning: 90 })
            }}>
              {Math.round(metrics.errorRate || 0)}/min
            </div>
          </div>

          <div>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.color.text.secondary,
              marginBottom: theme.spacing[1]
            }}>
              Memory Usage
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.color.text.primary
            }}>
              {Math.round((metrics.memoryUsage || 0) / 1024)}KB
            </div>
          </div>
        </div>

        {health.recommendations && health.recommendations.length > 0 && (
          <div>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.color.text.primary,
              marginBottom: theme.spacing[2]
            }}>
              Recommendations:
            </div>
            <ul style={{
              margin: 0,
              paddingLeft: theme.spacing[4],
              fontSize: theme.typography.fontSize.sm,
              color: theme.color.text.secondary
            }}>
              {health.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

// Main demo component
const RealTimeStreamingDemo = () => {
  const { theme } = useTheme();
  const [selectedSymbols, setSelectedSymbols] = useState(['BTC/USD', 'ETH/USD']);
  const [wsUrl, setWsUrl] = useState('wss://api.example.com/ws');
  const [autoConnect, setAutoConnect] = useState(true);

  const availableSymbols = [
    'BTC/USD', 'ETH/USD', 'ADA/USD', 'DOT/USD',
    'LINK/USD', 'UNI/USD', 'AAVE/USD', 'SOL/USD'
  ];

  const toggleSymbol = (symbol) => {
    setSelectedSymbols(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  return (
    <RealTimeDataProvider
      wsUrl={wsUrl}
      autoConnect={autoConnect}
      reconnectInterval={5000}
      maxReconnectAttempts={10}
      debug={true}
      enableCompression={true}
      throttleInterval={16}
      batchSize={10}
      performanceMonitoring={true}
    >
      <DemoContainer theme={theme}>
        <DemoHeader>
          <DemoTitle theme={theme}>
            Real-Time Data Streaming
          </DemoTitle>
          <DemoDescription theme={theme}>
            Professional-grade WebSocket connection management with automatic reconnection,
            performance monitoring, error handling, and optimized data streaming for trading applications.
          </DemoDescription>
        </DemoHeader>

        {/* Connection Status */}
        <ConnectionStatusDisplay />

        {/* Performance Metrics */}
        <MetricsDisplay />

        {/* Controls */}
        <Card theme={theme} style={{ marginBottom: theme.spacing[6] }}>
          <div style={{ padding: theme.spacing[4] }}>
            <h3 style={{
              margin: `0 0 ${theme.spacing[4]} 0`,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.color.text.primary
            }}>
              Stream Controls
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: theme.spacing[4],
              marginBottom: theme.spacing[4]
            }}>
              <div>
                <Label size="sm" weight="medium">WebSocket URL</Label>
                <input
                  type="text"
                  value={wsUrl}
                  onChange={(e) => setWsUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: theme.spacing[2],
                    border: `1px solid ${theme.color.border.primary}`,
                    borderRadius: theme.borderRadius.sm,
                    fontSize: theme.typography.fontSize.sm,
                    marginTop: theme.spacing[1]
                  }}
                />
              </div>

              <div>
                <Label size="sm" weight="medium">Auto Connect</Label>
                <div style={{ marginTop: theme.spacing[2] }}>
                  <Button
                    size="sm"
                    variant={autoConnect ? 'primary' : 'outline'}
                    onClick={() => setAutoConnect(!autoConnect)}
                  >
                    {autoConnect ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label size="sm" weight="medium">Active Symbols</Label>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: theme.spacing[2],
                marginTop: theme.spacing[2]
              }}>
                {availableSymbols.map(symbol => (
                  <Button
                    key={symbol}
                    size="sm"
                    variant={selectedSymbols.includes(symbol) ? 'primary' : 'outline'}
                    onClick={() => toggleSymbol(symbol)}
                  >
                    {symbol}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Real-time Data Displays */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: theme.spacing[6],
          marginBottom: theme.spacing[6]
        }}>
          {selectedSymbols.slice(0, 4).map(symbol => (
            <RealTimePriceDisplay key={symbol} symbol={symbol} />
          ))}
        </div>

        {/* Order Book Display */}
        {selectedSymbols.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: theme.spacing[6],
            marginBottom: theme.spacing[6]
          }}>
            <RealTimeOrderBookDisplay symbol={selectedSymbols[0]} />
            {selectedSymbols.length > 1 && (
              <RealTimeOrderBookDisplay symbol={selectedSymbols[1]} />
            )}
          </div>
        )}

        {/* Performance Monitor */}
        <PerformanceMonitor />
      </DemoContainer>
    </RealTimeDataProvider>
  );
};

export default RealTimeStreamingDemo;