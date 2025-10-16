import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ThemeProvider } from '../ThemeProvider';
import { RealTimeDataProvider } from '../components/providers/RealTimeDataProvider';
import EnhancedOrderBook from '../components/organisms/EnhancedOrderBook';
import { Button, Label } from '../components/atoms';

const DemoContainer = styled.div`
  padding: ${props => props.theme.spacing[4]};
  min-height: 100vh;
  background: ${props => props.theme.color.background.primary};
`;

const DemoHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]};
  text-align: center;
`;

const DemoTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.color.text.primary};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const DemoDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.color.text.secondary};
  max-width: 800px;
  margin: 0 auto;
`;

const DemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const ConfigPanel = styled.div`
  background: ${props => props.theme.color.background.secondary};
  padding: ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const ConfigRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[3]};
  &:last-child {
    margin-bottom: 0;
  }
`;

/**
 * Enhanced Order Book Demo Component
 */
const EnhancedOrderBookDemo = () => {
    // Demo state
    const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD');
    const [isSimulating, setIsSimulating] = useState(true);
    const [updateFrequency, setUpdateFrequency] = useState(500);
    const [volatility, setVolatility] = useState(0.5);
    const [showDepthChart, setShowDepthChart] = useState(true);
    const [showOrderFlow, setShowOrderFlow] = useState(true);
    const [showMetrics, setShowMetrics] = useState(true);
    const [precision, setPrecision] = useState(2);
    const [maxLevels, setMaxLevels] = useState(20);

    // Simulated order book data
    const [orderBookData, setOrderBookData] = useState({
        bids: [],
        asks: []
    });
    const [tradeData, setTradeData] = useState(null);

    // Symbol configurations
    const symbols = {
        'BTCUSD': { basePrice: 50000, minPrice: 45000, maxPrice: 55000, precision: 2 },
        'ETHUSD': { basePrice: 3000, minPrice: 2500, maxPrice: 3500, precision: 2 },
        'ADAUSD': { basePrice: 0.5, minPrice: 0.3, maxPrice: 0.7, precision: 4 },
        'DOTUSD': { basePrice: 25, minPrice: 20, maxPrice: 30, precision: 3 }
    };

    // Generate realistic order book data
    const generateOrderBookData = (symbol) => {
        const config = symbols[symbol];
        if (!config) return { bids: [], asks: [] };

        const { basePrice } = config;
        const currentPrice = basePrice + (Math.random() - 0.5) * volatility * basePrice * 0.01;
        const spread = Math.abs(currentPrice * 0.001); // 0.1% spread
        const levels = 25;

        const bids = [];
        const asks = [];

        // Generate bid levels (below current price)
        for (let i = 0; i < levels; i++) {
            const price = currentPrice - spread - (i * spread * 0.1);
            const size = Math.random() * 5 + 0.1;
            bids.push([price, size]);
        }

        // Generate ask levels (above current price)
        for (let i = 0; i < levels; i++) {
            const price = currentPrice + spread + (i * spread * 0.1);
            const size = Math.random() * 5 + 0.1;
            asks.push([price, size]);
        }

        return { bids, asks };
    };

    // Generate trade data
    const generateTradeData = (symbol) => {
        const config = symbols[symbol];
        if (!config) return null;

        const { basePrice } = config;
        const currentPrice = basePrice + (Math.random() - 0.5) * volatility * basePrice * 0.01;

        return {
            price: currentPrice,
            size: Math.random() * 2 + 0.1,
            side: Math.random() > 0.5 ? 'buy' : 'sell',
            timestamp: Date.now()
        };
    };

    // Simulate real-time data updates
    useEffect(() => {
        if (!isSimulating) return;

        const interval = setInterval(() => {
            // Update order book
            const newOrderBook = generateOrderBookData(selectedSymbol);
            setOrderBookData(newOrderBook);

            // Generate trade
            const newTrade = generateTradeData(selectedSymbol);
            setTradeData(newTrade);
        }, updateFrequency);

        return () => clearInterval(interval);
    }, [selectedSymbol, isSimulating, updateFrequency, volatility]);

    // Mock real-time data provider
    const mockRealTimeData = {
        subscribe: (channel, callback) => {
            if (channel.includes('orderbook')) {
                const interval = setInterval(() => {
                    callback(orderBookData);
                }, updateFrequency);
                return () => clearInterval(interval);
            } else if (channel.includes('trades')) {
                const interval = setInterval(() => {
                    if (tradeData) {
                        callback(tradeData);
                    }
                }, updateFrequency * 2);
                return () => clearInterval(interval);
            }
            return () => { };
        },
        unsubscribe: () => { },
        isConnected: isSimulating
    };

    // Handle order click
    const handleOrderClick = (order) => {
        console.log('Order clicked:', order);
    };

    // Handle price click
    const handlePriceClick = (price) => {
        console.log('Price clicked:', price);
    };

    return (
        <ThemeProvider defaultTheme="dark">
            <RealTimeDataProvider value={mockRealTimeData}>
                <DemoContainer>
                    <DemoHeader>
                        <DemoTitle>Enhanced Order Book Demo</DemoTitle>
                        <DemoDescription>
                            Advanced order book visualization with real-time depth chart, order flow indicators,
                            and market microstructure analysis.
                        </DemoDescription>
                    </DemoHeader>

                    {/* Configuration Panel */}
                    <ConfigPanel>
                        <Label size="lg" weight="semibold" style={{ marginBottom: '16px' }}>
                            Configuration
                        </Label>

                        <ConfigRow>
                            <Label>Symbol:</Label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {Object.keys(symbols).map(symbol => (
                                    <Button
                                        key={symbol}
                                        size="sm"
                                        variant={selectedSymbol === symbol ? 'primary' : 'ghost'}
                                        onClick={() => setSelectedSymbol(symbol)}
                                    >
                                        {symbol}
                                    </Button>
                                ))}
                            </div>
                        </ConfigRow>

                        <ConfigRow>
                            <Label>Features:</Label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <Button
                                    size="sm"
                                    variant={showDepthChart ? 'success' : 'ghost'}
                                    onClick={() => setShowDepthChart(!showDepthChart)}
                                >
                                    Depth Chart
                                </Button>
                                <Button
                                    size="sm"
                                    variant={showOrderFlow ? 'success' : 'ghost'}
                                    onClick={() => setShowOrderFlow(!showOrderFlow)}
                                >
                                    Order Flow
                                </Button>
                                <Button
                                    size="sm"
                                    variant={showMetrics ? 'success' : 'ghost'}
                                    onClick={() => setShowMetrics(!showMetrics)}
                                >
                                    Metrics
                                </Button>
                            </div>
                        </ConfigRow>
                    </ConfigPanel>

                    {/* Demo Grid */}
                    <DemoGrid>
                        <EnhancedOrderBook
                            symbol={selectedSymbol}
                            precision={precision}
                            maxLevels={maxLevels}
                            showDepthChart={showDepthChart}
                            showOrderFlow={showOrderFlow}
                            showMetrics={showMetrics}
                            aggregationLevels={[0.01, 0.1, 1, 10]}
                            height="700px"
                            onOrderClick={handleOrderClick}
                            onPriceClick={handlePriceClick}
                        />
                    </DemoGrid>
                </DemoContainer>
            </RealTimeDataProvider>
        </ThemeProvider>
    );
};

export default EnhancedOrderBookDemo;