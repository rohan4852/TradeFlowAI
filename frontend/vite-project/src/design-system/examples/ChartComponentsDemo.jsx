import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
    useTheme,
    Button,
    Icon,
    Card,
    ChartControls,
    TechnicalIndicators,
    ChartOverlay,
    OrderBook,
    PREDEFINED_INDICATORS,
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

// Chart container
const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  background: ${props => props.theme.color.background.secondary};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.color.border.primary};
  overflow: hidden;
`;

// Mock chart background
const MockChart = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    ${props => props.theme.color.primary[500]}20 0%,
    ${props => props.theme.color.secondary[500]}20 50%,
    ${props => props.theme.color.trading.bull}20 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.color.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

// Theme toggle
const ThemeToggle = styled.div`
  position: fixed;
  top: ${props => props.theme.spacing[4]};
  right: ${props => props.theme.spacing[4]};
  z-index: ${props => props.theme.zIndex.sticky};
`;

const ChartComponentsDemo = () => {
    const { theme, isDark, toggleTheme } = useTheme();

    // Chart controls state
    const [activeTimeframe, setActiveTimeframe] = useState('1D');
    const [activeChartType, setActiveChartType] = useState('candlestick');
    const [showVolume, setShowVolume] = useState(true);
    const [activeDrawingTool, setActiveDrawingTool] = useState(null);
    const [chartIndicators, setChartIndicators] = useState(['sma']);

    // Technical indicators state
    const [activeIndicators, setActiveIndicators] = useState([
        {
            id: 'sma_20',
            key: 'sma',
            name: 'Simple Moving Average',
            description: 'Average price over a specified period',
            category: 'trend',
            params: { period: 20 }
        },
        {
            id: 'rsi_14',
            key: 'rsi',
            name: 'Relative Strength Index',
            description: 'Momentum oscillator measuring speed and change of price movements',
            category: 'momentum',
            params: { period: 14, overbought: 70, oversold: 30 }
        }
    ]);

    const [indicatorValues, setIndicatorValues] = useState({
        'sma_20': 175.43,
        'rsi_14': 68.5,
    });

    // Chart overlay state
    const [drawings, setDrawings] = useState([
        {
            id: 'trend_1',
            type: 'trendline',
            startX: 100,
            startY: 200,
            endX: 300,
            endY: 150,
            style: { stroke: '#3b82f6', strokeWidth: 2 }
        },
        {
            id: 'support_1',
            type: 'support',
            startX: 50,
            startY: 300,
            endX: 400,
            endY: 280,
            style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' }
        },
        {
            id: 'text_1',
            type: 'text',
            startX: 200,
            startY: 100,
            text: 'Resistance Level',
            style: { fill: '#374151', fontSize: '12px' }
        }
    ]);
    const [drawingMode, setDrawingMode] = useState(false);

    // Sample data
    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1D', '1W', '1M'];
    const chartTypes = [
        { key: 'candlestick', icon: 'candlestick', label: 'Candlestick' },
        { key: 'line', icon: 'trendUp', label: 'Line' },
        { key: 'area', icon: 'volume', label: 'Area' },
        { key: 'bar', icon: 'minus', label: 'Bar' },
    ];

    const drawingTools = [
        { key: 'line', icon: 'minus', label: 'Trend Line' },
        { key: 'rectangle', icon: 'plus', label: 'Rectangle' },
        { key: 'text', icon: 'info', label: 'Text' },
    ];

    // Handlers
    const handleIndicatorAdd = (indicator) => {
        const newIndicator = {
            ...indicator,
            id: `${indicator.key}_${Date.now()}`
        };
        setActiveIndicators(prev => [...prev, newIndicator]);

        // Simulate indicator value
        const mockValue = Math.random() * 100;
        setIndicatorValues(prev => ({
            ...prev,
            [newIndicator.id]: mockValue
        }));
    };

    const handleIndicatorRemove = (indicatorId) => {
        setActiveIndicators(prev => prev.filter(ind => ind.id !== indicatorId));
        setIndicatorValues(prev => {
            const newValues = { ...prev };
            delete newValues[indicatorId];
            return newValues;
        });
    };

    const handleDrawingAdd = (drawing) => {
        setDrawings(prev => [...prev, drawing]);
    };

    const handleDrawingRemove = (drawingId) => {
        setDrawings(prev => prev.filter(d => d.id !== drawingId));
    };

    const handleDrawingToolChange = (tool) => {
        setActiveDrawingTool(tool);
        setDrawingMode(tool !== 'select' && tool !== null);
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
                Chart Components Demo
            </motion.h1>

            {/* Chart Controls */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Chart Controls</SectionTitle>

                <motion.div {...staggerAnimations.container}>
                    <motion.div {...staggerAnimations.item}>
                        <Card title="Horizontal Chart Controls" subtitle="Standard layout for desktop">
                            <ChartControls
                                timeframes={timeframes}
                                activeTimeframe={activeTimeframe}
                                onTimeframeChange={setActiveTimeframe}
                                chartTypes={chartTypes}
                                activeChartType={activeChartType}
                                onChartTypeChange={setActiveChartType}
                                indicators={PREDEFINED_INDICATORS}
                                activeIndicators={chartIndicators}
                                onIndicatorToggle={(indicator) => {
                                    setChartIndicators(prev =>
                                        prev.includes(indicator.key)
                                            ? prev.filter(i => i !== indicator.key)
                                            : [...prev, indicator.key]
                                    );
                                }}
                                showVolume={showVolume}
                                onVolumeToggle={() => setShowVolume(!showVolume)}
                                drawingTools={drawingTools}
                                activeDrawingTool={activeDrawingTool}
                                onDrawingToolChange={handleDrawingToolChange}
                            />
                        </Card>
                    </motion.div>

                    <motion.div {...staggerAnimations.item} style={{ marginTop: theme.spacing[6] }}>
                        <Grid theme={theme}>
                            <Card title="Vertical Chart Controls" subtitle="Compact layout for sidebars">
                                <ChartControls
                                    timeframes={timeframes.slice(0, 4)}
                                    activeTimeframe={activeTimeframe}
                                    onTimeframeChange={setActiveTimeframe}
                                    chartTypes={chartTypes}
                                    activeChartType={activeChartType}
                                    onChartTypeChange={setActiveChartType}
                                    indicators={PREDEFINED_INDICATORS.slice(0, 3)}
                                    activeIndicators={chartIndicators}
                                    onIndicatorToggle={(indicator) => {
                                        setChartIndicators(prev =>
                                            prev.includes(indicator.key)
                                                ? prev.filter(i => i !== indicator.key)
                                                : [...prev, indicator.key]
                                        );
                                    }}
                                    showVolume={showVolume}
                                    onVolumeToggle={() => setShowVolume(!showVolume)}
                                    vertical
                                    width="250px"
                                />
                            </Card>

                            <Card title="Floating Chart Controls" subtitle="Overlay controls for charts">
                                <div style={{ position: 'relative', height: '300px' }}>
                                    <MockChart theme={theme}>
                                        Chart Area with Floating Controls
                                    </MockChart>
                                    <ChartControls
                                        timeframes={timeframes.slice(0, 6)}
                                        activeTimeframe={activeTimeframe}
                                        onTimeframeChange={setActiveTimeframe}
                                        chartTypes={chartTypes}
                                        activeChartType={activeChartType}
                                        onChartTypeChange={setActiveChartType}
                                        floating
                                    />
                                </div>
                            </Card>
                        </Grid>
                    </motion.div>
                </motion.div>
            </Section>

            {/* Technical Indicators */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Technical Indicators</SectionTitle>

                <Grid theme={theme}>
                    <motion.div {...animationPresets.slideUp}>
                        <TechnicalIndicators
                            activeIndicators={activeIndicators}
                            indicatorValues={indicatorValues}
                            onIndicatorAdd={handleIndicatorAdd}
                            onIndicatorRemove={handleIndicatorRemove}
                            availableIndicators={PREDEFINED_INDICATORS}
                        />
                    </motion.div>

                    <motion.div {...animationPresets.slideUp} transition={{ delay: 0.1 }}>
                        <Card title="Indicator Values" subtitle="Real-time indicator calculations">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3] }}>
                                {activeIndicators.map(indicator => {
                                    const value = indicatorValues[indicator.id];
                                    const trend = indicator.key === 'rsi' && value > 70 ? 'bearish' :
                                        indicator.key === 'rsi' && value < 30 ? 'bullish' : 'neutral';

                                    return (
                                        <div
                                            key={indicator.id}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: theme.spacing[3],
                                                background: theme.color.background.secondary,
                                                borderRadius: theme.borderRadius.md,
                                            }}
                                        >
                                            <div>
                                                <div style={{
                                                    fontWeight: theme.typography.fontWeight.semibold,
                                                    color: theme.color.text.primary
                                                }}>
                                                    {indicator.name}
                                                </div>
                                                <div style={{
                                                    fontSize: theme.typography.fontSize.xs,
                                                    color: theme.color.text.secondary
                                                }}>
                                                    Period: {indicator.params?.period || 'N/A'}
                                                </div>
                                            </div>
                                            <div style={{
                                                fontFamily: theme.typography.fontFamily.monospace,
                                                fontWeight: theme.typography.fontWeight.bold,
                                                color: trend === 'bullish' ? theme.color.trading.bull :
                                                    trend === 'bearish' ? theme.color.trading.bear :
                                                        theme.color.text.primary
                                            }}>
                                                {value?.toFixed(2) || '--'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </motion.div>
                </Grid>
            </Section>

            {/* Chart Overlay */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Chart Overlay & Drawing Tools</SectionTitle>

                <motion.div {...animationPresets.slideUp}>
                    <Card title="Interactive Chart with Drawing Tools" subtitle="Click and drag to draw on the chart">
                        <ChartContainer theme={theme}>
                            <ChartOverlay
                                width={800}
                                height={400}
                                drawings={drawings}
                                onDrawingAdd={handleDrawingAdd}
                                onDrawingRemove={handleDrawingRemove}
                                drawingMode={drawingMode}
                                activeTool={activeDrawingTool}
                                onToolChange={handleDrawingToolChange}
                                showToolbar={true}
                            >
                                <MockChart theme={theme}>
                                    {drawingMode ?
                                        `Drawing Mode: ${activeDrawingTool || 'None'}` :
                                        'Chart Area - Enable drawing tools above'
                                    }
                                </MockChart>
                            </ChartOverlay>
                        </ChartContainer>
                    </Card>
                </motion.div>

                <motion.div {...animationPresets.slideUp} transition={{ delay: 0.1 }} style={{ marginTop: theme.spacing[6] }}>
                    <Grid theme={theme}>
                        <Card title="Drawing Controls" subtitle="Toggle drawing mode and tools">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3] }}>
                                <div style={{ display: 'flex', gap: theme.spacing[3], alignItems: 'center' }}>
                                    <Button
                                        variant={drawingMode ? 'primary' : 'outline'}
                                        onClick={() => {
                                            setDrawingMode(!drawingMode);
                                            if (!drawingMode) {
                                                setActiveDrawingTool('line');
                                            } else {
                                                setActiveDrawingTool(null);
                                            }
                                        }}
                                        leftIcon={<Icon name={drawingMode ? 'check' : 'plus'} />}
                                    >
                                        {drawingMode ? 'Exit Drawing' : 'Enable Drawing'}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => setDrawings([])}
                                        leftIcon={<Icon name="close" />}
                                        disabled={drawings.length === 0}
                                    >
                                        Clear All ({drawings.length})
                                    </Button>
                                </div>

                                <div>
                                    <div style={{
                                        fontSize: theme.typography.fontSize.sm,
                                        color: theme.color.text.secondary,
                                        marginBottom: theme.spacing[2]
                                    }}>
                                        Active Tool: {activeDrawingTool || 'None'}
                                    </div>
                                    <div style={{
                                        fontSize: theme.typography.fontSize.sm,
                                        color: theme.color.text.secondary
                                    }}>
                                        Drawings: {drawings.length}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title="Drawing List" subtitle="Manage your chart annotations">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
                                {drawings.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        color: theme.color.text.secondary,
                                        padding: theme.spacing[4]
                                    }}>
                                        No drawings yet. Enable drawing mode to get started.
                                    </div>
                                ) : (
                                    drawings.map(drawing => (
                                        <div
                                            key={drawing.id}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: theme.spacing[2],
                                                background: theme.color.background.secondary,
                                                borderRadius: theme.borderRadius.sm,
                                            }}
                                        >
                                            <div>
                                                <div style={{
                                                    fontWeight: theme.typography.fontWeight.medium,
                                                    color: theme.color.text.primary,
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {drawing.type.replace(/([A-Z])/g, ' $1')}
                                                </div>
                                                {drawing.text && (
                                                    <div style={{
                                                        fontSize: theme.typography.fontSize.xs,
                                                        color: theme.color.text.secondary
                                                    }}>
                                                        "{drawing.text}"
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDrawingRemove(drawing.id)}
                                                leftIcon={<Icon name="close" />}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </Grid>
                </motion.div>
            </Section>

            {/* Order Book */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Order Book Component</SectionTitle>

                <Grid theme={theme}>
                    <motion.div {...animationPresets.slideUp}>
                        <Card title="Live Order Book" subtitle="Real-time market depth">
                            <OrderBook
                                asks={[
                                    { price: 50100.50, size: 0.5, timestamp: Date.now() },
                                    { price: 50101.00, size: 1.2, timestamp: Date.now() },
                                    { price: 50101.50, size: 0.8, timestamp: Date.now() },
                                    { price: 50102.00, size: 2.1, timestamp: Date.now() },
                                    { price: 50102.50, size: 0.3, timestamp: Date.now() },
                                ]}
                                bids={[
                                    { price: 50099.50, size: 1.5, timestamp: Date.now() },
                                    { price: 50099.00, size: 0.7, timestamp: Date.now() },
                                    { price: 50098.50, size: 2.3, timestamp: Date.now() },
                                    { price: 50098.00, size: 1.1, timestamp: Date.now() },
                                    { price: 50097.50, size: 0.9, timestamp: Date.now() },
                                ]}
                                symbol="BTC/USD"
                                height="400px"
                                maxDepth={15}
                                onOrderClick={(order, side) => {
                                    console.log(`Clicked ${side} order:`, order);
                                }}
                            />
                        </Card>
                    </motion.div>

                    <motion.div {...animationPresets.slideUp} transition={{ delay: 0.1 }}>
                        <Card title="Compact Order Book" subtitle="Minimal depth view">
                            <OrderBook
                                asks={[
                                    { price: 3200.50, size: 5.5, timestamp: Date.now() },
                                    { price: 3201.00, size: 3.2, timestamp: Date.now() },
                                    { price: 3201.50, size: 2.8, timestamp: Date.now() },
                                ]}
                                bids={[
                                    { price: 3199.50, size: 4.5, timestamp: Date.now() },
                                    { price: 3199.00, size: 6.7, timestamp: Date.now() },
                                    { price: 3198.50, size: 1.3, timestamp: Date.now() },
                                ]}
                                symbol="ETH/USD"
                                height="300px"
                                maxDepth={8}
                                showDepthBars={false}
                                showCumulativeTotal={false}
                                precision={2}
                            />
                        </Card>
                    </motion.div>
                </Grid>
            </Section>

            {/* Integration Example */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Complete Chart Interface</SectionTitle>

                <motion.div {...animationPresets.slideUp}>
                    <Card title="Full Trading Chart" subtitle="Complete chart interface with all components">
                        <div style={{ display: 'flex', gap: theme.spacing[4] }}>
                            <div style={{ flex: 1 }}>
                                <ChartContainer theme={theme}>
                                    <ChartOverlay
                                        width={600}
                                        height={400}
                                        drawings={drawings}
                                        onDrawingAdd={handleDrawingAdd}
                                        onDrawingRemove={handleDrawingRemove}
                                        drawingMode={drawingMode}
                                        activeTool={activeDrawingTool}
                                        onToolChange={handleDrawingToolChange}
                                    >
                                        <MockChart theme={theme}>
                                            Complete Trading Chart
                                            <br />
                                            <small>
                                                {activeTimeframe} • {activeChartType} • Volume: {showVolume ? 'On' : 'Off'}
                                            </small>
                                        </MockChart>
                                    </ChartOverlay>
                                </ChartContainer>

                                <div style={{ marginTop: theme.spacing[4] }}>
                                    <ChartControls
                                        timeframes={timeframes}
                                        activeTimeframe={activeTimeframe}
                                        onTimeframeChange={setActiveTimeframe}
                                        chartTypes={chartTypes}
                                        activeChartType={activeChartType}
                                        onChartTypeChange={setActiveChartType}
                                        indicators={PREDEFINED_INDICATORS}
                                        activeIndicators={chartIndicators}
                                        onIndicatorToggle={(indicator) => {
                                            setChartIndicators(prev =>
                                                prev.includes(indicator.key)
                                                    ? prev.filter(i => i !== indicator.key)
                                                    : [...prev, indicator.key]
                                            );
                                        }}
                                        showVolume={showVolume}
                                        onVolumeToggle={() => setShowVolume(!showVolume)}
                                        drawingTools={drawingTools}
                                        activeDrawingTool={activeDrawingTool}
                                        onDrawingToolChange={handleDrawingToolChange}
                                    />
                                </div>
                            </div>

                            <div style={{ width: '300px' }}>
                                <TechnicalIndicators
                                    activeIndicators={activeIndicators.slice(0, 3)}
                                    indicatorValues={indicatorValues}
                                    onIndicatorAdd={handleIndicatorAdd}
                                    onIndicatorRemove={handleIndicatorRemove}
                                    availableIndicators={PREDEFINED_INDICATORS}
                                />
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </Section>
        </DemoContainer>
    );
};

export default ChartComponentsDemo;