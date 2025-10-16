import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
    useTheme,
    Button,
    Icon,
    Card,
    CandlestickChart,
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

const CandlestickChartDemo = () => {
    const { theme, isDark, toggleTheme } = useTheme();
    const chartRef = useRef(null);

    // Chart state
    const [timeframe, setTimeframe] = useState('1D');
    const [showVolume, setShowVolume] = useState(true);
    const [showIndicators, setShowIndicators] = useState(true);
    const [activeIndicators, setActiveIndicators] = useState({
        sma: true,
        ema: true,
        rsi: false,
        macd: false,
        bollingerBands: false
    });
    const [overlays, setOverlays] = useState([
        {
            type: 'horizontal',
            price: 155,
            color: '#f59e0b',
            dashed: true,
            showLabel: true
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [realTimeData, setRealTimeData] = useState([]);
    const [isRealTime, setIsRealTime] = useState(false);

    // Generate sample data
    const generateSampleData = (count = 100, basePrice = 150) => {
        const data = [];
        let price = basePrice;
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            const timestamp = now - (count - i) * getTimeframeMs(timeframe);
            const volatility = 0.02; // 2% volatility
            const change = (Math.random() - 0.5) * price * volatility;

            const open = price;
            const close = price + change;
            const high = Math.max(open, close) + Math.random() * price * volatility * 0.5;
            const low = Math.min(open, close) - Math.random() * price * volatility * 0.5;
            const volume = Math.floor(Math.random() * 2000000) + 500000;

            data.push({
                timestamp,
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume,
            });

            price = close;
        }

        return data;
    };

    const getTimeframeMs = (tf) => {
        const timeframes = {
            '1m': 60 * 1000,
            '5m': 5 * 60 * 1000,
            '15m': 15 * 60 * 1000,
            '1h': 60 * 60 * 1000,
            '4h': 4 * 60 * 60 * 1000,
            '1D': 24 * 60 * 60 * 1000,
            '1W': 7 * 24 * 60 * 60 * 1000,
        };
        return timeframes[tf] || timeframes['1D'];
    };

    // Sample datasets
    const [sampleData] = useState(() => generateSampleData(100, 150));
    const [bullishData] = useState(() => {
        const data = [];
        let price = 100;
        const now = Date.now();

        for (let i = 0; i < 50; i++) {
            const timestamp = now - (50 - i) * 60000;
            const change = Math.random() * 2 + 0.5; // Mostly positive changes

            const open = price;
            const close = price + change;
            const high = close + Math.random() * 1;
            const low = Math.min(open, close) - Math.random() * 0.5;
            const volume = Math.floor(Math.random() * 1500000) + 800000;

            data.push({
                timestamp,
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume,
            });

            price = close;
        }

        return data;
    });

    const [bearishData] = useState(() => {
        const data = [];
        let price = 200;
        const now = Date.now();

        for (let i = 0; i < 50; i++) {
            const timestamp = now - (50 - i) * 60000;
            const change = -(Math.random() * 2 + 0.5); // Mostly negative changes

            const open = price;
            const close = price + change;
            const high = Math.max(open, close) + Math.random() * 0.5;
            const low = close - Math.random() * 1;
            const volume = Math.floor(Math.random() * 1200000) + 600000;

            data.push({
                timestamp,
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume,
            });

            price = close;
        }

        return data;
    });

    // Real-time data simulation
    useEffect(() => {
        if (!isRealTime) return;

        const interval = setInterval(() => {
            setRealTimeData(prevData => {
                const newData = [...prevData];
                const lastCandle = newData[newData.length - 1];
                const now = Date.now();

                if (!lastCandle || now - lastCandle.timestamp > 60000) {
                    // Create new candle
                    const price = lastCandle ? lastCandle.close : 150;
                    const change = (Math.random() - 0.5) * 4;

                    const newCandle = {
                        timestamp: now,
                        open: price,
                        high: price + Math.random() * 2,
                        low: price - Math.random() * 2,
                        close: price + change,
                        volume: Math.floor(Math.random() * 1000000) + 500000,
                    };

                    newData.push(newCandle);

                    // Keep only last 100 candles
                    if (newData.length > 100) {
                        newData.shift();
                    }
                } else {
                    // Update current candle
                    const change = (Math.random() - 0.5) * 2;
                    const updatedCandle = {
                        ...lastCandle,
                        high: Math.max(lastCandle.high, lastCandle.close + change),
                        low: Math.min(lastCandle.low, lastCandle.close + change),
                        close: lastCandle.close + change,
                        volume: lastCandle.volume + Math.floor(Math.random() * 100000),
                    };

                    newData[newData.length - 1] = updatedCandle;
                }

                return newData;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRealTime]);

    // Initialize real-time data
    useEffect(() => {
        if (isRealTime && realTimeData.length === 0) {
            setRealTimeData(generateSampleData(20, 150));
        }
    }, [isRealTime, realTimeData.length]);

    // Calculate stats
    const calculateStats = (data) => {
        if (!data.length) return {};

        const prices = data.map(d => d.close);
        const volumes = data.map(d => d.volume);

        const currentPrice = prices[prices.length - 1];
        const previousPrice = prices[prices.length - 2] || currentPrice;
        const change = currentPrice - previousPrice;
        const changePercent = (change / previousPrice) * 100;

        const high24h = Math.max(...data.slice(-24).map(d => d.high));
        const low24h = Math.min(...data.slice(-24).map(d => d.low));
        const volume24h = volumes.slice(-24).reduce((sum, v) => sum + v, 0);

        return {
            currentPrice,

            change,
            changePercent,
            high24h,
            low24h,
            volume24h,
        };
    };

    const handleLoadData = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
    };

    const handleStartRealTime = () => {
        setIsRealTime(true);
        setRealTimeData(generateSampleData(20, 150));
    };

    const handleStopRealTime = () => {
        setIsRealTime(false);
    };

    const handleIndicatorToggle = (indicatorKey) => {
        setActiveIndicators(prev => ({
            ...prev,
            [indicatorKey]: !prev[indicatorKey]
        }));
    };

    const handleExportChart = () => {
        if (chartRef.current) {
            chartRef.current.downloadChart('trading-chart', 'png', 1.0);
        }
    };

    // Current data selection
    const currentData = isRealTime ? realTimeData : sampleData;
    const stats = calculateStats(currentData);

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
                Candlestick Chart Demo
            </motion.h1>

            {/* Main Chart */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Interactive Candlestick Chart</SectionTitle>

                <motion.div {...staggerAnimations.container}>
                    <motion.div {...staggerAnimations.item}>
                        <ControlPanel theme={theme}>
                            <Button
                                variant={timeframe === '1m' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setTimeframe('1m')}
                            >
                                1m
                            </Button>
                            <Button
                                variant={timeframe === '5m' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setTimeframe('5m')}
                            >
                                5m
                            </Button>
                            <Button
                                variant={timeframe === '1h' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setTimeframe('1h')}
                            >
                                1h
                            </Button>
                            <Button
                                variant={timeframe === '1D' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setTimeframe('1D')}
                            >
                                1D
                            </Button>

                            <div style={{ width: '1px', height: '24px', background: theme.color.border.primary }} />

                            <Button
                                variant={showVolume ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setShowVolume(!showVolume)}
                                leftIcon={<Icon name="volume" />}
                            >
                                Volume
                            </Button>

                            <Button
                                variant={showIndicators ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setShowIndicators(!showIndicators)}
                                leftIcon={<Icon name="trendUp" />}
                            >
                                Indicators
                            </Button>

                            <div style={{ width: '1px', height: '24px', background: theme.color.border.primary }} />

                            <Button
                                variant={activeIndicators.sma ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => handleIndicatorToggle('sma')}
                            >
                                SMA
                            </Button>

                            <Button
                                variant={activeIndicators.ema ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => handleIndicatorToggle('ema')}
                            >
                                EMA
                            </Button>

                            <Button
                                variant={activeIndicators.rsi ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => handleIndicatorToggle('rsi')}
                            >
                                RSI
                            </Button>

                            <Button
                                variant={activeIndicators.macd ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => handleIndicatorToggle('macd')}
                            >
                                MACD
                            </Button>

                            <Button
                                variant={activeIndicators.bollingerBands ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => handleIndicatorToggle('bollingerBands')}
                            >
                                BB
                            </Button>

                            <div style={{ width: '1px', height: '24px', background: theme.color.border.primary }} />

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportChart}
                                leftIcon={<Icon name="download" />}
                            >
                                Export PNG
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
                                    color={stats.change >= 0 ? theme.color.trading.bull : theme.color.trading.bear}
                                >
                                    ${stats.currentPrice?.toFixed(2) || '--'}
                                </StatValue>
                                <StatLabel theme={theme}>Current Price</StatLabel>
                            </StatCard>

                            <StatCard theme={theme}>
                                <StatValue
                                    theme={theme}
                                    color={stats.change >= 0 ? theme.color.trading.bull : theme.color.trading.bear}
                                >
                                    {stats.change >= 0 ? '+' : ''}${stats.change?.toFixed(2) || '--'}
                                </StatValue>
                                <StatLabel theme={theme}>24h Change</StatLabel>
                            </StatCard>

                            <StatCard theme={theme}>
                                <StatValue
                                    theme={theme}
                                    color={stats.changePercent >= 0 ? theme.color.trading.bull : theme.color.trading.bear}
                                >
                                    {stats.changePercent >= 0 ? '+' : ''}{stats.changePercent?.toFixed(2) || '--'}%
                                </StatValue>
                                <StatLabel theme={theme}>24h Change %</StatLabel>
                            </StatCard>

                            <StatCard theme={theme}>
                                <StatValue theme={theme}>
                                    ${stats.high24h?.toFixed(2) || '--'}
                                </StatValue>
                                <StatLabel theme={theme}>24h High</StatLabel>
                            </StatCard>

                            <StatCard theme={theme}>
                                <StatValue theme={theme}>
                                    ${stats.low24h?.toFixed(2) || '--'}
                                </StatValue>
                                <StatLabel theme={theme}>24h Low</StatLabel>
                            </StatCard>

                            <StatCard theme={theme}>
                                <StatValue theme={theme}>
                                    {stats.volume24h ? (stats.volume24h / 1000000).toFixed(1) + 'M' : '--'}
                                </StatValue>
                                <StatLabel theme={theme}>24h Volume</StatLabel>
                            </StatCard>
                        </StatsDisplay>
                    </motion.div>

                    <motion.div {...staggerAnimations.item}>
                        <Card title="AAPL - Apple Inc." subtitle={isRealTime ? "Live Data" : "Sample Data"}>
                            <CandlestickChart
                                ref={chartRef}
                                data={currentData}
                                height="500px"
                                showControls={true}
                                showVolume={showVolume}
                                showIndicators={showIndicators}
                                indicators={activeIndicators}
                                overlays={overlays}
                                timeframe={timeframe}
                                onTimeframeChange={setTimeframe}
                                onIndicatorChange={handleIndicatorToggle}
                                loading={loading}
                            />
                        </Card>
                    </motion.div>
                </motion.div>
            </Section>

            {/* Technical Indicators */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Technical Indicators</SectionTitle>

                <Grid theme={theme}>
                    <motion.div {...animationPresets.slideUp}>
                        <Card title="Moving Averages" subtitle="SMA & EMA overlays">
                            <CandlestickChart
                                data={sampleData}
                                height="300px"
                                showControls={false}
                                showVolume={false}
                                showIndicators={true}
                                indicators={{ sma: true, ema: true }}
                            />
                        </Card>
                    </motion.div>

                    <motion.div {...animationPresets.slideUp} transition={{ delay: 0.1 }}>
                        <Card title="Bollinger Bands" subtitle="Volatility indicator">
                            <CandlestickChart
                                data={sampleData}
                                height="300px"
                                showControls={false}
                                showVolume={false}
                                showIndicators={true}
                                indicators={{ bollingerBands: true }}
                            />
                        </Card>
                    </motion.div>

                    <motion.div {...animationPresets.slideUp} transition={{ delay: 0.2 }}>
                        <Card title="RSI Oscillator" subtitle="Momentum indicator">
                            <CandlestickChart
                                data={sampleData}
                                height="300px"
                                showControls={false}
                                showVolume={false}
                                showIndicators={true}
                                indicators={{ rsi: true }}
                            />
                        </Card>
                    </motion.div>

                    <motion.div {...animationPresets.slideUp} transition={{ delay: 0.3 }}>
                        <Card title="MACD" subtitle="Trend following indicator">
                            <CandlestickChart
                                data={sampleData}
                                height="300px"
                                showControls={false}
                                showVolume={false}
                                showIndicators={true}
                                indicators={{ macd: true }}
                            />
                        </Card>
                    </motion.div>
                </Grid>
            </Section>

            {/* Chart Variations */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Chart Variations</SectionTitle>

                <Grid theme={theme}>
                    <motion.div {...animationPresets.slideUp}>
                        <Card title="Bullish Trend" subtitle="Strong upward movement with indicators">
                            <CandlestickChart
                                data={bullishData}
                                height="300px"
                                showControls={false}
                                showVolume={true}
                                showIndicators={true}
                                indicators={{ sma: true, rsi: true }}
                                overlays={[
                                    {
                                        type: 'horizontal',
                                        price: bullishData[bullishData.length - 1]?.close * 1.05,
                                        color: '#10b981',
                                        dashed: true,
                                        showLabel: true
                                    }
                                ]}
                            />
                        </Card>
                    </motion.div>

                    <motion.div {...animationPresets.slideUp} transition={{ delay: 0.1 }}>
                        <Card title="Bearish Trend" subtitle="Strong downward movement with indicators">
                            <CandlestickChart
                                data={bearishData}
                                height="300px"
                                showControls={false}
                                showVolume={true}
                                showIndicators={true}
                                indicators={{ ema: true, macd: true }}
                                overlays={[
                                    {
                                        type: 'horizontal',
                                        price: bearishData[bearishData.length - 1]?.close * 0.95,
                                        color: '#ef4444',
                                        dashed: true,
                                        showLabel: true
                                    }
                                ]}
                            />
                        </Card>
                    </motion.div>
                </Grid>
            </Section>

            {/* Chart Features */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Chart Features</SectionTitle>

                <Grid theme={theme}>
                    <motion.div {...animationPresets.slideUp}>
                        <Card title="Interactive Features" subtitle="Pan, zoom, and explore">
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: theme.spacing[3],
                                padding: theme.spacing[4]
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="search" color="primary" />
                                    <span>Mouse wheel to zoom in/out</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="minus" color="primary" />
                                    <span>Click and drag to pan left/right</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="candlestick" color="primary" />
                                    <span>High-performance canvas rendering</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="volume" color="primary" />
                                    <span>Volume bars with transparency</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="trendUp" color="success" />
                                    <span style={{ color: theme.color.trading.bull }}>Green for bullish candles</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="trendDown" color="error" />
                                    <span style={{ color: theme.color.trading.bear }}>Red for bearish candles</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div {...animationPresets.slideUp} transition={{ delay: 0.1 }}>
                        <Card title="Performance Features" subtitle="Optimized for real-time data">
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: theme.spacing[3],
                                padding: theme.spacing[4]
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="loading" color="primary" />
                                    <span>60 FPS smooth animations</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="settings" color="primary" />
                                    <span>Automatic viewport optimization</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="eye" color="primary" />
                                    <span>Visible range calculation</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="plus" color="primary" />
                                    <span>High DPI display support</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="check" color="success" />
                                    <span>Memory efficient rendering</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="info" color="info" />
                                    <span>Touch-friendly mobile support</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div {...animationPresets.slideUp} transition={{ delay: 0.2 }}>
                        <Card title="Technical Indicators" subtitle="Professional trading analysis">
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: theme.spacing[3],
                                padding: theme.spacing[4]
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="trendUp" color="primary" />
                                    <span>Simple Moving Average (SMA)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="trendUp" color="secondary" />
                                    <span>Exponential Moving Average (EMA)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="settings" color="warning" />
                                    <span>Bollinger Bands with fill</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="volume" color="info" />
                                    <span>RSI oscillator (14 period)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="candlestick" color="success" />
                                    <span>MACD with histogram</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="minus" color="error" />
                                    <span>Support/Resistance levels</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div {...animationPresets.slideUp} transition={{ delay: 0.3 }}>
                        <Card title="Chart Overlays" subtitle="Drawing tools and annotations">
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: theme.spacing[3],
                                padding: theme.spacing[4]
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="minus" color="primary" />
                                    <span>Trend lines and channels</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="plus" color="warning" />
                                    <span>Horizontal support/resistance</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="settings" color="info" />
                                    <span>Rectangle zones</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="eye" color="secondary" />
                                    <span>Customizable colors and styles</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="check" color="success" />
                                    <span>Real-time price labels</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                    <Icon name="loading" color="error" />
                                    <span>Dashed line support</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </Grid>
            </Section>
        </DemoContainer>
    );
};

export default CandlestickChartDemo;