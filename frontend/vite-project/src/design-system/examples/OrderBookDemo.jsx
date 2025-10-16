import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
    useTheme,
    Button,
    Icon,
    Card,
    OrderBook,
    animationPresets,
    staggerAnimations,
} from '../index';

// Demo container
const DemoContainer = styled.div`
  padding: ${props => props.theme.spacing[8]};
  max-width: 1400px;
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

// Stats display
const StatsDisplay = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const StatCard = styled.div`
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.color.background.secondary};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.color.border.primary};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-family: ${props => props.theme.typography.fontFamily.monospace};
  color: ${props => props.color || props.theme.color.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.color.text.secondary};
`;

// Theme toggle
const ThemeToggle = styled.div`
  position: fixed;
  top: ${props => props.theme.spacing[4]};
  right: ${props => props.theme.spacing[4]};
  z-index: ${props => props.theme.zIndex.sticky};
`;

const OrderBookDemo = () => {
    const { theme, isDark, toggleTheme } = useTheme();
    const orderBookRef = useRef(null);

    // State
    const [symbol, setSymbol] = useState('BTC/USD');
    const [precision, setPrecision] = useState(2);
    const [aggregation, setAggregation] = useState(0.01);
    const [maxDepth, setMaxDepth] = useState(25);
    const [showDepthBars, setShowDepthBars] = useState(true);
    const [showCumulativeTotal, setShowCumulativeTotal] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isRealTime, setIsRealTime] = useState(false);
    const [orderBookData, setOrderBookData] = useState({ asks: [], bids: [] });

    // Generate sample order book data
    const generateOrderBookData = (basePrice = 50000, depth = 50) => {
        const asks = [];
        const bids = [];

        // Generate asks (sell orders) - prices above base price
        for (let i = 0; i < depth; i++) {
            const priceOffset = (i + 1) * (Math.random() * 2 + 0.5);
            const price = basePrice + priceOffset;
            const size = Math.random() * 5 + 0.1;

            asks.push({
                price: parseFloat(price.toFixed(2)),
                size: parseFloat(size.toFixed(4)),
                timestamp: Date.now() - Math.random() * 60000
            });
        }

        // Generate bids (buy orders) - prices below base price
        for (let i = 0; i < depth; i++) {
            const priceOffset = (i + 1) * (Math.random() * 2 + 0.5);
            const price = basePrice - priceOffset;
            const size = Math.random() * 5 + 0.1;

            bids.push({
                price: parseFloat(price.toFixed(2)),
                size: parseFloat(size.toFixed(4)),
                timestamp: Date.now() - Math.random() * 60000
            });
        }

        // Sort asks ascending (lowest first)
        asks.sort((a, b) => a.price - b.price);

        // Sort bids descending (highest first)
        bids.sort((a, b) => b.price - a.price);

        return { asks, bids };
    };

    // Initialize data
    useEffect(() => {
        const initialData = generateOrderBookData();
        setOrderBookData(initialData);
    }, []);

    // Real-time data simulation
    useEffect(() => {
        if (!isRealTime) return;

        const interval = setInterval(() => {
            setOrderBookData(prevData => {
                const newData = { ...prevData };

                // Randomly update some orders
                const updateAsks = Math.random() > 0.5;
                const updateBids = Math.random() > 0.5;

                if (updateAsks && newData.asks.length > 0) {
                    const randomIndex = Math.floor(Math.random() * Math.min(10, newData.asks.length));
                    const order = { ...newData.asks[randomIndex] };
                    order.size = Math.random() * 5 + 0.1;
                    order.timestamp = Date.now();
                    newData.asks[randomIndex] = order;
                }

                if (updateBids && newData.bids.length > 0) {
                    const randomIndex = Math.floor(Math.random() * Math.min(10, newData.bids.length));
                    const order = { ...newData.bids[randomIndex] };
                    order.size = Math.random() * 5 + 0.1;
                    order.timestamp = Date.now();
                    newData.bids[randomIndex] = order;
                }

                // Occasionally add new orders
                if (Math.random() > 0.8) {
                    const basePrice = 50000;
                    const isAsk = Math.random() > 0.5;

                    if (isAsk) {
                        const price = basePrice + Math.random() * 100 + 1;
                        const size = Math.random() * 2 + 0.1;
                        newData.asks.push({
                            price: parseFloat(price.toFixed(2)),
                            size: parseFloat(size.toFixed(4)),
                            timestamp: Date.now()
                        });
                        newData.asks.sort((a, b) => a.price - b.price);
                        newData.asks = newData.asks.slice(0, 50); // Keep max 50
                    } else {
                        const price = basePrice - Math.random() * 100 - 1;
                        const size = Math.random() * 2 + 0.1;
                        newData.bids.push({
                            price: parseFloat(price.toFixed(2)),
                            size: parseFloat(size.toFixed(4)),
                            timestamp: Date.now()
                        });
                        newData.bids.sort((a, b) => b.price - a.price);
                        newData.bids = newData.bids.slice(0, 50); // Keep max 50
                    }
                }

                return newData;
            });
        }, 500); // Update every 500ms

        return () => clearInterval(interval);
    }, [isRealTime]);

    // Calculate stats
    const calculateStats = (data) => {
        if (!data.asks.length || !data.bids.length) return {};

        const bestAsk = data.asks[0]?.price || 0;
        const bestBid = data.bids[0]?.price || 0;
        const spread = bestAsk - bestBid;
        const spreadPercent = (spread / bestBid) * 100;

        const totalAskVolume = data.asks.reduce((sum, order) => sum + order.size, 0);
        const totalBidVolume = data.bids.reduce((sum, order) => sum + order.size, 0);

        const midPrice = (bestAsk + bestBid) / 2;

        return {
            bestAsk,
            bestBid,
            spread,
            spreadPercent,
            totalAskVolume,
            totalBidVolume,
            midPrice
        };
    };

    const stats = calculateStats(orderBookData);

    // Event handlers
    const handleLoadData = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        const newData = generateOrderBookData();
        setOrderBookData(newData);
        setLoading(false);
    };

    const handleStartRealTime = () => {
        setIsRealTime(true);
    };

    const handleStopRealTime = () => {
        setIsRealTime(false);
    };

    const handleOrderClick = (order, side) => {
        console.log(`Clicked ${side} order:`, order);
        // In a real app, this might open an order form or show order details
    };

    const handleSymbolChange = (newSymbol) => {
        setSymbol(newSymbol);
        const newData = generateOrderBookData();
        setOrderBookData(newData);
    };

    return (
        <DemoContainer theme={theme}>
            <ThemeToggle theme={theme}>
                <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Icon name={isDark ? 'eye' : 'eyeOff'} />}
                    onClick={toggleTheme}
                >
                    {isDark ? 'Light' : 'Dark'} Mode
                </Button>
            </ThemeToggle>

            <motion.h1
                style={{
                    fontSize: theme.typography.fontSize['4xl'],
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.color.text.primary,
                    textAlign: 'center',
                    marginBottom: theme.spacing[12],
                }}
                {...animationPresets.fadeIn}
            >
                Order Book Demo
            </motion.h1>

            {/* Main Order Book */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Interactive Order Book</SectionTitle>

                <motion.div {...staggerAnimations.container}>
                    <motion.div {...staggerAnimations.item}>
                        <ControlPanel theme={theme}>
                            <Button
                                variant={symbol === 'BTC/USD' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => handleSymbolChange('BTC/USD')}
                            >
                                BTC/USD
                            </Button>
                            <Button
                                variant={symbol === 'ETH/USD' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => handleSymbolChange('ETH/USD')}
                            >
                                ETH/USD
                            </Button>
                            <Button
                                variant={symbol === 'SOL/USD' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => handleSymbolChange('SOL/USD')}
                            >
                                SOL/USD
                            </Button>

                            <div style={{ width: '1px', height: '24px', background: theme.color.border.primary }} />

                            <Button
                                variant={showDepthBars ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setShowDepthBars(!showDepthBars)}
                                leftIcon={<Icon name="volume" />}
                            >
                                Depth Bars
                            </Button>

                            <Button
                                variant={showCumulativeTotal ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setShowCumulativeTotal(!showCumulativeTotal)}
                                leftIcon={<Icon name="plus" />}
                            >
                                Cumulative
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLoadData}
                                loading={loading}
                                leftIcon={<Icon name="loading" />}
                            >
                                Reload Data
                            </Button>

                            <div style={{ width: '1px', height: '24px', background: theme.color.border.primary }} />

                            {!isRealTime ? (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleStartRealTime}
                                    leftIcon={<Icon name="trendUp" />}
                                >
                                    Start Real-time
                                </Button>
                            ) : (
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={handleStopRealTime}
                                    leftIcon={<Icon name="close" />}
                                >
                                    Stop Real-time
                                </Button>
                            )}
                        </ControlPanel>
                    </motion.div>

                    <motion.div {...staggerAnimations.item}>
                        <StatsDisplay theme={theme}>
                            <StatCard theme={theme}>
                                <StatValue
                                    theme={theme}
                                    color={theme.color.trading.bear}
                                >
                                    ${stats.bestAsk?.toFixed(2) || '--'}
                                </StatValue>
                                <StatLabel theme={theme}>Best Ask</StatLabel>
                            </StatCard>

                            <StatCard theme={theme}>
                                <StatValue
                                    theme={theme}
                                    color={theme.color.trading.bull}
                                >
                                    ${stats.bestBid?.toFixed(2) || '--'}
                                </StatValue>
                                <StatLabel theme={theme}>Best Bid</StatLabel>
                            </StatCard>

                            <StatCard theme={theme}>
                                <StatValue theme={theme}>
                                    ${stats.spread?.toFixed(2) || '--'}
                                </StatValue>
                                <StatLabel theme={theme}>Spread</StatLabel>
                            </StatCard>

                            <StatCard theme={theme}>
                                <StatValue theme={theme}>
                                    {stats.spreadPercent?.toFixed(3) || '--'}%
                                </StatValue>
                                <StatLabel theme={theme}>Spread %</StatLabel>
                            </StatCard>

                            <StatCard theme={theme}>
                                <StatValue theme={theme}>
                                    ${stats.midPrice?.toFixed(2) || '--'}
                                </StatValue>
                                <StatLabel theme={theme}>Mid Price</StatLabel>
                            </StatCard>

                            <StatCard theme={theme}>
                                <StatValue theme={theme}>
                                    {stats.totalBidVolume?.toFixed(2) || '--'}
                                </StatValue>
                                <StatLabel theme={theme}>Total Bid Volume</StatLabel>
                            </StatCard>
                        </StatsDisplay>
                    </motion.div>

                    <motion.div {...staggerAnimations.item}>
                        <Card title={`${symbol} Order Book`} subtitle={isRealTime ? "Live Data" : "Sample Data"}>
                            <OrderBook
                                ref={orderBookRef}
                                asks={orderBookData.asks}
                                bids={orderBookData.bids}
                                symbol={symbol}
                                precision={precision}
                                maxDepth={maxDepth}
                                showDepthBars={showDepthBars}
                                showCumulativeTotal={showCumulativeTotal}
                                onOrderClick={handleOrderClick}
                                loading={loading}
                                height="600px"
                            />
                        </Card>
                    </motion.div>
                </motion.div>
            </Section>

            {/* Order Book Variations */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Order Book Variations</SectionTitle>

                <Grid theme={theme}>
                    <motion.div {...animationPresets.slideUp}>
                        <Card title="Compact View" subtitle="Minimal depth display">
                            <OrderBook
                                asks={orderBookData.asks.slice(0, 10)}
                                bids={orderBookData.bids.slice(0, 10)}
                                symbol="BTC/USD"
                                maxDepth={10}
                                height="400px"
                                showDepthBars={false}
                                showCumulativeTotal={false}
                            />
                        </Card>
                    </motion.div>

                    <motion.div {...animationPresets.slideUp} transition={{ delay: 0.1 }}>
                        <Card title="High Precision" subtitle="4 decimal places">
                            <OrderBook
                                asks={orderBookData.asks.slice(0, 15)}
                                bids={orderBookData.bids.slice(0, 15)}
                                symbol="ETH/USD"
                                precision={4}
                                maxDepth={15}
                                height="400px"
                                aggregationOptions={[0.0001, 0.001, 0.01, 0.1]}
                                defaultAggregation={0.001}
                            />
                        </Card>
                    </motion.div>
                </Grid>
            </Section>

            {/* Features */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Order Book Features</SectionTitle>

                <Grid theme={theme}>
                    <motion.div {...animationPresets.slideUp}>
                        <Card title="Performance Features" subtitle="Optimized for high-frequency data">
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: theme.spacing[3],
                                padding: theme.spacing[4]
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="loading" color="primary" />
                                    <span>Virtual scrolling for large datasets</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="trendUp" color="success" />
                                    <span>Real-time price level updates</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="volume" color="info" />
                                    <span>Depth visualization with gradients</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="settings" color="warning" />
                                    <span>Dynamic order aggregation</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="eye" color="secondary" />
                                    <span>Smooth animations and transitions</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="check" color="success" />
                                    <span>Memory efficient rendering</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div {...animationPresets.slideUp} transition={{ delay: 0.1 }}>
                        <Card title="Interactive Features" subtitle="Professional trading interface">
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: theme.spacing[3],
                                padding: theme.spacing[4]
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="candlestick" color="primary" />
                                    <span>Click orders to place trades</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="plus" color="info" />
                                    <span>Customizable aggregation levels</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="minus" color="warning" />
                                    <span>Adjustable depth display</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="search" color="secondary" />
                                    <span>Precision control for different assets</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="info" color="success" />
                                    <span>Real-time spread calculation</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="volume" color="error" />
                                    <span>Cumulative volume display</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </Grid>
            </Section>
        </DemoContainer>
    );
};

export default OrderBookDemo;