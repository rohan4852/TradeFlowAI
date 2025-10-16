import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { OrderBook } from '../components/organisms';
import { Button, Icon, Label } from '../components/atoms';
import { Card } from '../components/molecules';
import { useTheme } from '../ThemeProvider';
import {
  animationPresets,
  tradingMicroInteractions,
  priceFlashAnimations,
  orderLifecycleAnimations,
  depthBarAnimations,
  spreadAnimations,
  orderBookSequences,
  triggerAnimationSequence,
  animationPerformanceMonitor
} from '../effects';

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

// Controls section
const ControlsSection = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.color.background.secondary};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.color.border.primary};
`;

// Control group
const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

// Demo grid
const DemoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing[6]};
  margin-bottom: ${props => props.theme.spacing[8]};

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

// Animation showcase
const AnimationShowcase = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

// Animation demo card
const AnimationDemoCard = styled(Card)`
  padding: ${props => props.theme.spacing[4]};
`;

// Animation preview
const AnimationPreview = styled(motion.div)`
  height: 60px;
  background: ${props => props.theme.color.background.tertiary};
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing[3]};
  position: relative;
  overflow: hidden;
`;

// Mock order row for animation preview
const MockOrderRow = styled(motion.div)`
  display: flex;
  align-items: center;
  width: 100%;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  font-family: ${props => props.theme.typography.fontFamily.monospace};
  font-size: ${props => props.theme.typography.fontSize.sm};
  background: ${props => props.side === 'bid'
    ? `linear-gradient(to right, ${props.theme.color.trading.bull}20, transparent)`
    : `linear-gradient(to right, ${props.theme.color.trading.bear}20, transparent)`
  };
  border-radius: ${props => props.theme.borderRadius.sm};
`;

// Price column in mock row
const MockPriceColumn = styled.div`
  flex: 1;
  color: ${props => props.side === 'bid'
    ? props.theme.color.trading.bull
    : props.theme.color.trading.bear
  };
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

// Size column in mock row
const MockSizeColumn = styled.div`
  flex: 1;
  text-align: right;
  color: ${props => props.theme.color.text.primary};
`;

// Enhanced OrderBook Animations Demo Component
const EnhancedOrderBookAnimationsDemo = () => {
  const { theme } = useTheme();

  // Demo state
  const [isRealTime, setIsRealTime] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showDepthBars, setShowDepthBars] = useState(true);
  const [selectedAnimation, setSelectedAnimation] = useState('priceFlashUp');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [performanceMode, setPerformanceMode] = useState('auto');
  const [showSequences, setShowSequences] = useState(false);
  const [activeSequence, setActiveSequence] = useState(null);

  // Mock order book data with realistic trading data
  const [orderBookData, setOrderBookData] = useState({
    asks: [
      { price: 50125.50, size: 0.5234, timestamp: Date.now() },
      { price: 50124.25, size: 1.2456, timestamp: Date.now() },
      { price: 50123.75, size: 0.8901, timestamp: Date.now() },
      { price: 50123.00, size: 2.1234, timestamp: Date.now() },
      { price: 50122.50, size: 0.6789, timestamp: Date.now() },
      { price: 50122.00, size: 1.5678, timestamp: Date.now() },
      { price: 50121.75, size: 0.9876, timestamp: Date.now() },
      { price: 50121.25, size: 3.2345, timestamp: Date.now() },
      { price: 50121.00, size: 0.4567, timestamp: Date.now() },
      { price: 50120.50, size: 1.8901, timestamp: Date.now() },
    ],
    bids: [
      { price: 50119.75, size: 0.7890, timestamp: Date.now() },
      { price: 50119.25, size: 1.4567, timestamp: Date.now() },
      { price: 50118.50, size: 0.9123, timestamp: Date.now() },
      { price: 50118.00, size: 2.3456, timestamp: Date.now() },
      { price: 50117.75, size: 0.6789, timestamp: Date.now() },
      { price: 50117.25, size: 1.7890, timestamp: Date.now() },
      { price: 50117.00, size: 0.8901, timestamp: Date.now() },
      { price: 50116.50, size: 2.5678, timestamp: Date.now() },
      { price: 50116.00, size: 0.3456, timestamp: Date.now() },
      { price: 50115.75, size: 1.6789, timestamp: Date.now() },
    ]
  });

  // Enhanced animation definitions for showcase
  const animationDefinitions = {
    priceFlashUp: {
      name: 'Bullish Price Flash',
      description: 'Enhanced price increase animation with 3D effects and glow',
      animation: priceFlashAnimations.priceUp,
      category: 'price'
    },
    priceFlashDown: {
      name: 'Bearish Price Flash',
      description: 'Enhanced price decrease animation with 3D effects and glow',
      animation: priceFlashAnimations.priceDown,
      category: 'price'
    },
    priceSpike: {
      name: 'Price Spike Animation',
      description: 'Dramatic animation for significant price movements',
      animation: priceFlashAnimations.priceSpike,
      category: 'price'
    },
    volatilityPulse: {
      name: 'Market Volatility Pulse',
      description: 'Continuous pulsing effect during high volatility',
      animation: priceFlashAnimations.volatilityPulse,
      category: 'price'
    },
    newOrderEnter: {
      name: 'Enhanced Order Entry',
      description: '3D entrance animation with elastic easing and blur effects',
      animation: orderLifecycleAnimations.orderEnter,
      category: 'order'
    },
    sizeChangeEnhanced: {
      name: 'Enhanced Size Change',
      description: 'Multi-stage size change with ripple effects and shadows',
      animation: orderLifecycleAnimations.sizeChange,
      category: 'order'
    },
    orderExecution: {
      name: 'Order Execution Celebration',
      description: 'Celebration animation with rotation and enhanced effects',
      animation: orderLifecycleAnimations.orderExecuted,
      category: 'order'
    },
    largeOrderHighlight: {
      name: 'Large Order Breathing',
      description: 'Breathing effect for large orders with enhanced glow',
      animation: orderLifecycleAnimations.largeOrderHighlight,
      category: 'order'
    },
    priorityOrder: {
      name: 'Priority Order Glow',
      description: 'Golden glow effect for priority orders',
      animation: orderLifecycleAnimations.priorityOrder,
      category: 'order'
    },
    depthChangeEnhanced: {
      name: 'Enhanced Depth Change',
      description: 'Wave effect with multi-stage scaling and color transitions',
      animation: depthBarAnimations.depthChange,
      category: 'depth'
    },
    depthPulseBreathing: {
      name: 'Depth Breathing Effect',
      description: 'Breathing animation with border radius changes',
      animation: depthBarAnimations.depthPulse,
      category: 'depth'
    },
    largeDepthAurora: {
      name: 'Large Depth Aurora',
      description: 'Aurora-like effect for significant depth levels',
      animation: depthBarAnimations.largeDepthGlow,
      category: 'depth'
    },
    depthLoading: {
      name: 'Depth Loading Shimmer',
      description: 'Shimmer effect during depth data loading',
      animation: depthBarAnimations.depthLoading,
      category: 'depth'
    },
    spreadChangeEnhanced: {
      name: 'Enhanced Spread Change',
      description: 'Dynamic spread animation with color coding',
      animation: spreadAnimations.spreadChange,
      category: 'spread'
    },
    tightSpreadPulse: {
      name: 'Tight Spread Pulse',
      description: 'Pulsing effect for tight spreads',
      animation: spreadAnimations.tightSpreadPulse,
      category: 'spread'
    }
  };

  // Simulate real-time order book updates
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      setOrderBookData(prevData => {
        const newData = { ...prevData };

        // Randomly update some orders
        const updateAsks = Math.random() > 0.5;
        const updateBids = Math.random() > 0.5;

        if (updateAsks && newData.asks.length > 0) {
          const randomIndex = Math.floor(Math.random() * newData.asks.length);
          const randomOrder = { ...newData.asks[randomIndex] };

          // Randomly change price or size
          if (Math.random() > 0.5) {
            randomOrder.price += (Math.random() - 0.5) * 2;
          } else {
            randomOrder.size += (Math.random() - 0.5) * 0.5;
            randomOrder.size = Math.max(0.01, randomOrder.size);
          }

          randomOrder.timestamp = Date.now();
          newData.asks[randomIndex] = randomOrder;
        }

        if (updateBids && newData.bids.length > 0) {
          const randomIndex = Math.floor(Math.random() * newData.bids.length);
          const randomOrder = { ...newData.bids[randomIndex] };

          // Randomly change price or size
          if (Math.random() > 0.5) {
            randomOrder.price += (Math.random() - 0.5) * 2;
          } else {
            randomOrder.size += (Math.random() - 0.5) * 0.5;
            randomOrder.size = Math.max(0.01, randomOrder.size);
          }

          randomOrder.timestamp = Date.now();
          newData.bids[randomIndex] = randomOrder;
        }

        // Occasionally add new orders
        if (Math.random() > 0.8) {
          const isAsk = Math.random() > 0.5;
          const basePrice = isAsk ? 50126 : 50115;
          const newOrder = {
            price: basePrice + (Math.random() - 0.5) * 10,
            size: Math.random() * 2 + 0.1,
            timestamp: Date.now()
          };

          if (isAsk) {
            newData.asks.unshift(newOrder);
            newData.asks = newData.asks.slice(0, 10);
          } else {
            newData.bids.unshift(newOrder);
            newData.bids = newData.bids.slice(0, 10);
          }
        }

        return newData;
      });
    }, 2000 / animationSpeed);

    return () => clearInterval(interval);
  }, [isRealTime, animationSpeed]);

  // Performance monitoring
  useEffect(() => {
    animationPerformanceMonitor.startMonitoring();
  }, []);

  // Play animation preview
  const playAnimation = useCallback((animationKey) => {
    setSelectedAnimation(animationKey);
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2000);
  }, []);

  // Play animation sequence
  const playSequence = useCallback((sequenceKey) => {
    const sequence = orderBookSequences[sequenceKey];
    if (!sequence) return;

    setActiveSequence(sequenceKey);

    const controller = triggerAnimationSequence(sequence, {
      onStageComplete: (stage, animation, stageId) => {
        console.log(`Stage completed: ${stage.name}`, stageId);
      },
      onSequenceComplete: (completedSequence) => {
        console.log('Sequence completed:', completedSequence);
        setActiveSequence(null);
      },
      performanceMode
    });

    // Auto-stop after 10 seconds
    setTimeout(() => {
      controller.stop();
      setActiveSequence(null);
    }, 10000);
  }, [performanceMode]);

  // Filter animations by category
  const filteredAnimations = useMemo(() => {
    if (selectedCategory === 'all') {
      return animationDefinitions;
    }

    return Object.fromEntries(
      Object.entries(animationDefinitions).filter(
        ([key, def]) => def.category === selectedCategory
      )
    );
  }, [selectedCategory]);

  // Calculate spread
  const spread = useMemo(() => {
    if (orderBookData.asks.length === 0 || orderBookData.bids.length === 0) {
      return { value: 0, percent: 0 };
    }

    const bestAsk = Math.min(...orderBookData.asks.map(o => o.price));
    const bestBid = Math.max(...orderBookData.bids.map(o => o.price));
    const spreadValue = bestAsk - bestBid;
    const spreadPercent = (spreadValue / bestBid) * 100;

    return { value: spreadValue, percent: spreadPercent };
  }, [orderBookData]);

  return (
    <DemoContainer theme={theme}>
      <DemoHeader>
        <DemoTitle theme={theme}>
          Enhanced Order Book Animations
        </DemoTitle>
        <DemoDescription theme={theme}>
          Experience professional-grade order book animations with real-time price flashing,
          smooth order transitions, dynamic depth visualization, and advanced visual effects
          that enhance trading decision-making.
        </DemoDescription>
      </DemoHeader>

      {/* Controls */}
      <ControlsSection
        theme={theme}
        {...animationPresets.slideUp}
      >
        <ControlGroup>
          <Label size="sm" weight="medium">Real-time Updates</Label>
          <Button
            variant={isRealTime ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setIsRealTime(!isRealTime)}
            leftIcon={<Icon name={isRealTime ? 'pause' : 'play'} />}
          >
            {isRealTime ? 'Pause' : 'Start'} Updates
          </Button>
        </ControlGroup>

        <ControlGroup>
          <Label size="sm" weight="medium">Animation Speed</Label>
          <div style={{ display: 'flex', gap: theme.spacing[2] }}>
            <Button
              variant={animationSpeed === 0.5 ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setAnimationSpeed(0.5)}
            >
              0.5x
            </Button>
            <Button
              variant={animationSpeed === 1 ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setAnimationSpeed(1)}
            >
              1x
            </Button>
            <Button
              variant={animationSpeed === 2 ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setAnimationSpeed(2)}
            >
              2x
            </Button>
          </div>
        </ControlGroup>

        <ControlGroup>
          <Label size="sm" weight="medium">Visual Effects</Label>
          <Button
            variant={showDepthBars ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowDepthBars(!showDepthBars)}
            leftIcon={<Icon name={showDepthBars ? 'eye' : 'eye-off'} />}
          >
            Depth Bars
          </Button>
        </ControlGroup>

        <ControlGroup>
          <Label size="sm" weight="medium">Animation Category</Label>
          <div style={{ display: 'flex', gap: theme.spacing[2], flexWrap: 'wrap' }}>
            {['all', 'price', 'order', 'depth', 'spread'].map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </ControlGroup>

        <ControlGroup>
          <Label size="sm" weight="medium">Performance Mode</Label>
          <div style={{ display: 'flex', gap: theme.spacing[2] }}>
            {['auto', 'high', 'reduced'].map(mode => (
              <Button
                key={mode}
                variant={performanceMode === mode ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPerformanceMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
        </ControlGroup>

        <ControlGroup>
          <Label size="sm" weight="medium">Animation Sequences</Label>
          <Button
            variant={showSequences ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowSequences(!showSequences)}
            leftIcon={<Icon name={showSequences ? 'layers' : 'layers'} />}
          >
            {showSequences ? 'Hide' : 'Show'} Sequences
          </Button>
        </ControlGroup>
      </ControlsSection>

      {/* Main Demo Grid */}
      <DemoGrid>
        {/* Live Order Book */}
        <motion.div {...animationPresets.slideLeft}>
          <Card>
            <OrderBook
              asks={orderBookData.asks}
              bids={orderBookData.bids}
              spread={spread}
              symbol="BTC/USD"
              realTime={isRealTime}
              precision={2}
              maxDepth={10}
              height="600px"
              showDepthBars={showDepthBars}
              showCumulativeTotal={true}
              onOrderClick={(order, side) => {
                console.log(`Clicked ${side} order:`, order);
              }}
              onRealTimeUpdate={(data) => {
                console.log('Real-time update:', data);
              }}
            />
          </Card>
        </motion.div>

        {/* Animation Showcase */}
        <motion.div {...animationPresets.slideRight}>
          <AnimationShowcase>
            <Card>
              <div style={{ padding: theme.spacing[4] }}>
                <h3 style={{
                  margin: `0 0 ${theme.spacing[4]} 0`,
                  color: theme.color.text.primary,
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.semibold
                }}>
                  Animation Showcase
                </h3>

                {Object.entries(filteredAnimations).map(([key, def]) => (
                  <AnimationDemoCard key={key} theme={theme}>
                    <div style={{ marginBottom: theme.spacing[3] }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[1] }}>
                        <h4 style={{
                          margin: 0,
                          color: theme.color.text.primary,
                          fontSize: theme.typography.fontSize.lg,
                          fontWeight: theme.typography.fontWeight.medium
                        }}>
                          {def.name}
                        </h4>
                        <span style={{
                          padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                          backgroundColor: theme.color.primary[500] + '20',
                          color: theme.color.primary[500],
                          fontSize: theme.typography.fontSize.xs,
                          borderRadius: theme.borderRadius.sm,
                          textTransform: 'uppercase',
                          fontWeight: theme.typography.fontWeight.medium
                        }}>
                          {def.category}
                        </span>
                      </div>
                      <p style={{
                        margin: 0,
                        color: theme.color.text.secondary,
                        fontSize: theme.typography.fontSize.sm,
                        lineHeight: 1.4
                      }}>
                        {def.description}
                      </p>
                    </div>

                    <AnimationPreview theme={theme}>
                      <MockOrderRow
                        side={key.includes('Down') || key.includes('bear') ? 'ask' : 'bid'}
                        theme={theme}
                        {...(isPlaying && selectedAnimation === key ? def.animation : {})}
                      >
                        <MockPriceColumn
                          side={key.includes('Down') || key.includes('bear') ? 'ask' : 'bid'}
                          theme={theme}
                        >
                          $50,123.45
                        </MockPriceColumn>
                        <MockSizeColumn theme={theme}>
                          1.2345
                        </MockSizeColumn>
                      </MockOrderRow>
                    </AnimationPreview>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => playAnimation(key)}
                      disabled={isPlaying && selectedAnimation === key}
                      leftIcon={<Icon name="play" />}
                      style={{ width: '100%' }}
                    >
                      {isPlaying && selectedAnimation === key ? 'Playing...' : 'Preview Animation'}
                    </Button>
                  </AnimationDemoCard>
                ))}

                {/* Animation Sequences Section */}
                {showSequences && (
                  <div style={{
                    gridColumn: '1 / -1',
                    marginTop: theme.spacing[6],
                    padding: theme.spacing[4],
                    backgroundColor: theme.color.background.secondary,
                    borderRadius: theme.borderRadius.lg,
                    border: `1px solid ${theme.color.border.primary}`
                  }}>
                    <h4 style={{
                      margin: `0 0 ${theme.spacing[4]} 0`,
                      color: theme.color.text.primary,
                      fontSize: theme.typography.fontSize.xl,
                      fontWeight: theme.typography.fontWeight.semibold
                    }}>
                      Animation Sequences
                    </h4>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: theme.spacing[4]
                    }}>
                      {Object.entries(orderBookSequences).map(([sequenceKey, sequence]) => (
                        <div key={sequenceKey} style={{
                          padding: theme.spacing[4],
                          backgroundColor: theme.color.background.primary,
                          borderRadius: theme.borderRadius.md,
                          border: `1px solid ${theme.color.border.primary}`
                        }}>
                          <h5 style={{
                            margin: `0 0 ${theme.spacing[2]} 0`,
                            color: theme.color.text.primary,
                            fontSize: theme.typography.fontSize.lg,
                            fontWeight: theme.typography.fontWeight.medium,
                            textTransform: 'capitalize'
                          }}>
                            {sequenceKey.replace(/([A-Z])/g, ' $1').trim()}
                          </h5>

                          <div style={{ marginBottom: theme.spacing[3] }}>
                            <p style={{
                              margin: `0 0 ${theme.spacing[2]} 0`,
                              color: theme.color.text.secondary,
                              fontSize: theme.typography.fontSize.sm
                            }}>
                              Stages: {sequence.stages.length}
                            </p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing[1] }}>
                              {sequence.stages.map((stage, index) => (
                                <span key={index} style={{
                                  padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                                  backgroundColor: stage.priority === 'high'
                                    ? theme.color.trading.bull + '20'
                                    : stage.priority === 'medium'
                                      ? theme.color.trading.volume + '20'
                                      : theme.color.trading.spread + '20',
                                  color: stage.priority === 'high'
                                    ? theme.color.trading.bull
                                    : stage.priority === 'medium'
                                      ? theme.color.trading.volume
                                      : theme.color.trading.spread,
                                  fontSize: theme.typography.fontSize.xs,
                                  borderRadius: theme.borderRadius.sm,
                                  fontWeight: theme.typography.fontWeight.medium
                                }}>
                                  {stage.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          <Button
                            variant={activeSequence === sequenceKey ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => playSequence(sequenceKey)}
                            disabled={activeSequence === sequenceKey}
                            leftIcon={<Icon name={activeSequence === sequenceKey ? 'pause' : 'play'} />}
                            style={{ width: '100%' }}
                          >
                            {activeSequence === sequenceKey ? 'Playing Sequence...' : 'Play Sequence'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </AnimationShowcase>
        </motion.div>
      </DemoGrid>

      {/* Animation Details */}
      <motion.div {...animationPresets.fadeIn}>
        <Card>
          <div style={{ padding: theme.spacing[6] }}>
            <h3 style={{
              margin: `0 0 ${theme.spacing[4]} 0`,
              color: theme.color.text.primary,
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              textAlign: 'center'
            }}>
              Animation Features
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: theme.spacing[6],
              marginTop: theme.spacing[6]
            }}>
              <div>
                <h4 style={{
                  color: theme.color.primary[500],
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  marginBottom: theme.spacing[3]
                }}>
                  Price Flash Effects
                </h4>
                <ul style={{
                  color: theme.color.text.secondary,
                  lineHeight: 1.6,
                  paddingLeft: theme.spacing[4]
                }}>
                  <li>Directional color coding (green for up, red for down)</li>
                  <li>Smooth scaling and brightness transitions</li>
                  <li>Shimmer effects for significant changes</li>
                  <li>Customizable flash duration and intensity</li>
                </ul>
              </div>

              <div>
                <h4 style={{
                  color: theme.color.primary[500],
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  marginBottom: theme.spacing[3]
                }}>
                  Order Lifecycle Animations
                </h4>
                <ul style={{
                  color: theme.color.text.secondary,
                  lineHeight: 1.6,
                  paddingLeft: theme.spacing[4]
                }}>
                  <li>Smooth fade-in for new orders</li>
                  <li>Size change animations with visual feedback</li>
                  <li>Graceful exit animations for cancelled orders</li>
                  <li>Large order highlighting and pulsing effects</li>
                </ul>
              </div>

              <div>
                <h4 style={{
                  color: theme.color.primary[500],
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  marginBottom: theme.spacing[3]
                }}>
                  Depth Visualization
                </h4>
                <ul style={{
                  color: theme.color.text.secondary,
                  lineHeight: 1.6,
                  paddingLeft: theme.spacing[4]
                }}>
                  <li>Dynamic depth bars with gradient effects</li>
                  <li>Hover interactions with glow effects</li>
                  <li>Pulsing animations for depth changes</li>
                  <li>Performance-optimized rendering</li>
                </ul>
              </div>

              <div>
                <h4 style={{
                  color: theme.color.primary[500],
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  marginBottom: theme.spacing[3]
                }}>
                  Spread Indicator
                </h4>
                <ul style={{
                  color: theme.color.text.secondary,
                  lineHeight: 1.6,
                  paddingLeft: theme.spacing[4]
                }}>
                  <li>Dynamic color coding based on spread percentage</li>
                  <li>Pulsing effects for tight spreads</li>
                  <li>Warning animations for wide spreads</li>
                  <li>Smooth transitions with shimmer effects</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </DemoContainer>
  );
};

export default EnhancedOrderBookAnimationsDemo;
