import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useTheme,
    Button,
    Icon,
    createGlassmorphism,
    tradingGlassPresets,
    createMarketGlass,
    createLiquidGlass,
    createHolographicGlass,
    animationPresets,
    tradingAnimations,
    hoverEffects,
    feedbackEffects,
    tradingMicroInteractions,
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
  padding: ${props => props.theme.spacing[6]};
  ${props => createGlassmorphism(props.theme, { intensity: 'light', animated: true })}
  border-radius: ${props => props.theme.borderRadius.xl};
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing[6]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

// Glass card
const GlassCard = styled(motion.div)`
  padding: ${props => props.theme.spacing[6]};
  border-radius: ${props => props.theme.borderRadius.lg};
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

// Card title
const CardTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.color.text.primary};
  margin-bottom: ${props => props.theme.spacing[3]};
`;

// Card description
const CardDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.color.text.secondary};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

// Interactive demo area
const InteractiveArea = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[4]};
  justify-content: center;
  align-items: center;
  margin-top: ${props => props.theme.spacing[6]};
`;

// Price display for trading demos
const PriceDisplay = styled(motion.div)`
  font-family: ${props => props.theme.typography.fontFamily.monospace};
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.borderRadius.md};
  ${props => createGlassmorphism(props.theme, { intensity: 'medium' })}
  color: ${props => props.color || props.theme.color.text.primary};
`;

// Theme toggle
const ThemeToggle = styled.div`
  position: fixed;
  top: ${props => props.theme.spacing[4]};
  right: ${props => props.theme.spacing[4]};
  z-index: ${props => props.theme.zIndex.sticky};
`;

const EffectsDemo = () => {
    const { theme, isDark, toggleTheme } = useTheme();
    const [selectedEffect, setSelectedEffect] = useState('basic');
    const [marketCondition, setMarketCondition] = useState('neutral');
    const [showFeedback, setShowFeedback] = useState(false);
    const [priceValue, setPriceValue] = useState(150.25);
    const [priceChange, setPriceChange] = useState(0);

    // Simulate price change
    const simulatePriceChange = (direction) => {
        const change = direction === 'up' ? Math.random() * 2 + 0.5 : -(Math.random() * 2 + 0.5);
        setPriceChange(change);
        setPriceValue(prev => Math.max(0, prev + change));

        setTimeout(() => setPriceChange(0), 1000);
    };

    // Trigger feedback effect
    const triggerFeedback = (type) => {
        setShowFeedback(type);
        setTimeout(() => setShowFeedback(false), 1000);
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
                Effects & Animations Demo
            </motion.h1>

            {/* Glassmorphism Effects */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Glassmorphism Effects</SectionTitle>

                <Grid theme={theme}>
                    <GlassCard
                        style={createGlassmorphism(theme, { intensity: 'subtle' })}
                        {...animationPresets.slideUp}
                        {...hoverEffects.cardSubtle}
                    >
                        <CardTitle theme={theme}>Subtle Glass</CardTitle>
                        <CardDescription theme={theme}>
                            Light glassmorphism effect with minimal blur and transparency
                        </CardDescription>
                        <Icon name="eye" size="xl" color="primary" />
                    </GlassCard>

                    <GlassCard
                        style={createGlassmorphism(theme, { intensity: 'medium' })}
                        {...animationPresets.slideUp}
                        {...hoverEffects.cardPronounced}
                        transition={{ delay: 0.1 }}
                    >
                        <CardTitle theme={theme}>Medium Glass</CardTitle>
                        <CardDescription theme={theme}>
                            Balanced glassmorphism with moderate blur and border effects
                        </CardDescription>
                        <Icon name="settings" size="xl" color="secondary" />
                    </GlassCard>

                    <GlassCard
                        style={createGlassmorphism(theme, { intensity: 'strong' })}
                        {...animationPresets.slideUp}
                        {...hoverEffects.cardPronounced}
                        transition={{ delay: 0.2 }}
                    >
                        <CardTitle theme={theme}>Strong Glass</CardTitle>
                        <CardDescription theme={theme}>
                            Pronounced glassmorphism with heavy blur and shadow effects
                        </CardDescription>
                        <Icon name="candlestick" size="xl" color="bull" />
                    </GlassCard>
                </Grid>

                <Grid theme={theme}>
                    <GlassCard
                        style={tradingGlassPresets.widget(theme)}
                        {...animationPresets.scale}
                        {...hoverEffects.cardPronounced}
                    >
                        <CardTitle theme={theme}>Trading Widget</CardTitle>
                        <CardDescription theme={theme}>
                            Specialized glass effect for trading widgets with interactive hover
                        </CardDescription>
                        <Icon name="trendUp" size="xl" color="bull" />
                    </GlassCard>

                    <GlassCard
                        style={createLiquidGlass(theme, { flowDirection: 'horizontal' })}
                        {...animationPresets.scale}
                        transition={{ delay: 0.1 }}
                    >
                        <CardTitle theme={theme}>Liquid Glass</CardTitle>
                        <CardDescription theme={theme}>
                            Animated liquid glass effect with flowing highlights
                        </CardDescription>
                        <Icon name="volume" size="xl" color="info" />
                    </GlassCard>

                    <GlassCard
                        style={createHolographicGlass(theme, { rainbow: true })}
                        {...animationPresets.scale}
                        transition={{ delay: 0.2 }}
                    >
                        <CardTitle theme={theme}>Holographic Glass</CardTitle>
                        <CardDescription theme={theme}>
                            Futuristic holographic effect with rainbow color shifts
                        </CardDescription>
                        <Icon name="loading" size="xl" color="primary" />
                    </GlassCard>
                </Grid>
            </Section>

            {/* Market-Responsive Glass */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Market-Responsive Glass</SectionTitle>

                <InteractiveArea theme={theme}>
                    <Button
                        variant={marketCondition === 'bullish' ? 'primary' : 'outline'}
                        onClick={() => setMarketCondition('bullish')}
                        leftIcon={<Icon name="trendUp" />}
                    >
                        Bullish
                    </Button>
                    <Button
                        variant={marketCondition === 'bearish' ? 'danger' : 'outline'}
                        onClick={() => setMarketCondition('bearish')}
                        leftIcon={<Icon name="trendDown" />}
                    >
                        Bearish
                    </Button>
                    <Button
                        variant={marketCondition === 'neutral' ? 'secondary' : 'outline'}
                        onClick={() => setMarketCondition('neutral')}
                        leftIcon={<Icon name="minus" />}
                    >
                        Neutral
                    </Button>
                    <Button
                        variant={marketCondition === 'volatile' ? 'primary' : 'outline'}
                        onClick={() => setMarketCondition('volatile')}
                        leftIcon={<Icon name="alert" />}
                    >
                        Volatile
                    </Button>
                </InteractiveArea>

                <Grid theme={theme}>
                    <GlassCard
                        style={createMarketGlass(theme, marketCondition)}
                        {...animationPresets.fadeIn}
                        key={marketCondition}
                    >
                        <CardTitle theme={theme}>Market Glass</CardTitle>
                        <CardDescription theme={theme}>
                            Glass effect that adapts to market conditions with color tinting
                        </CardDescription>
                        <Icon
                            name={marketCondition === 'bullish' ? 'trendUp' : marketCondition === 'bearish' ? 'trendDown' : 'candlestick'}
                            size="xl"
                            color={marketCondition === 'bullish' ? 'bull' : marketCondition === 'bearish' ? 'bear' : 'neutral'}
                        />
                    </GlassCard>
                </Grid>
            </Section>

            {/* Trading Animations */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Trading Animations</SectionTitle>

                <InteractiveArea theme={theme}>
                    <Button
                        variant="primary"
                        onClick={() => simulatePriceChange('up')}
                        leftIcon={<Icon name="trendUp" />}
                        {...hoverEffects.buttonPrimary}
                    >
                        Price Up
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => simulatePriceChange('down')}
                        leftIcon={<Icon name="trendDown" />}
                        {...hoverEffects.buttonPrimary}
                    >
                        Price Down
                    </Button>
                </InteractiveArea>

                <Grid theme={theme}>
                    <GlassCard style={tradingGlassPresets.orderBook(theme)}>
                        <CardTitle theme={theme}>Live Price Display</CardTitle>
                        <PriceDisplay
                            theme={theme}
                            color={priceChange > 0 ? theme.color.trading.bull : priceChange < 0 ? theme.color.trading.bear : theme.color.text.primary}
                            {...(priceChange > 0 ? tradingMicroInteractions.priceIncrease : priceChange < 0 ? tradingMicroInteractions.priceDecrease : {})}
                            key={priceValue}
                        >
                            ${priceValue.toFixed(2)}
                            {priceChange !== 0 && (
                                <span style={{ fontSize: '0.8em', marginLeft: theme.spacing[2] }}>
                                    {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}
                                </span>
                            )}
                        </PriceDisplay>
                    </GlassCard>
                </Grid>
            </Section>

            {/* Micro-interactions */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Micro-interactions</SectionTitle>

                <InteractiveArea theme={theme}>
                    <Button
                        variant="primary"
                        onClick={() => triggerFeedback('success')}
                        {...hoverEffects.buttonPrimary}
                    >
                        Success Feedback
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => triggerFeedback('error')}
                        {...hoverEffects.buttonPrimary}
                    >
                        Error Feedback
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => triggerFeedback('warning')}
                        {...hoverEffects.buttonPrimary}
                    >
                        Warning Feedback
                    </Button>
                </InteractiveArea>

                <Grid theme={theme}>
                    <GlassCard style={tradingGlassPresets.card(theme)}>
                        <CardTitle theme={theme}>Hover Effects</CardTitle>
                        <CardDescription theme={theme}>
                            Hover over this card to see subtle lift and scale effects
                        </CardDescription>
                        <motion.div {...hoverEffects.iconHover}>
                            <Icon name="settings" size="xl" color="primary" interactive />
                        </motion.div>
                    </GlassCard>

                    <AnimatePresence>
                        {showFeedback && (
                            <GlassCard
                                style={tradingGlassPresets.card(theme)}
                                {...animationPresets.scale}
                                {...(showFeedback === 'success' ? feedbackEffects.success :
                                    showFeedback === 'error' ? feedbackEffects.error :
                                        feedbackEffects.warning)}
                                exit={animationPresets.fadeIn.exit}
                            >
                                <CardTitle theme={theme}>Feedback Animation</CardTitle>
                                <CardDescription theme={theme}>
                                    {showFeedback === 'success' ? 'Success feedback with scale and color flash' :
                                        showFeedback === 'error' ? 'Error feedback with shake and color flash' :
                                            'Warning feedback with pulse and color flash'}
                                </CardDescription>
                                <Icon
                                    name={showFeedback === 'success' ? 'check' : showFeedback === 'error' ? 'close' : 'alert'}
                                    size="xl"
                                    color={showFeedback === 'success' ? 'success' : showFeedback === 'error' ? 'error' : 'warning'}
                                />
                            </GlassCard>
                        )}
                    </AnimatePresence>
                </Grid>
            </Section>

            {/* Animation Presets */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Animation Presets</SectionTitle>

                <Grid theme={theme}>
                    <motion.div {...animationPresets.slideUp}>
                        <GlassCard style={tradingGlassPresets.card(theme)}>
                            <CardTitle theme={theme}>Slide Up</CardTitle>
                            <CardDescription theme={theme}>
                                Smooth slide up animation with opacity fade
                            </CardDescription>
                            <Icon name="chevronUp" size="xl" color="primary" />
                        </GlassCard>
                    </motion.div>

                    <motion.div {...animationPresets.slideLeft} transition={{ delay: 0.1 }}>
                        <GlassCard style={tradingGlassPresets.card(theme)}>
                            <CardTitle theme={theme}>Slide Left</CardTitle>
                            <CardDescription theme={theme}>
                                Horizontal slide animation with staggered timing
                            </CardDescription>
                            <Icon name="chevronLeft" size="xl" color="secondary" />
                        </GlassCard>
                    </motion.div>

                    <motion.div {...animationPresets.scale} transition={{ delay: 0.2 }}>
                        <GlassCard style={tradingGlassPresets.card(theme)}>
                            <CardTitle theme={theme}>Scale</CardTitle>
                            <CardDescription theme={theme}>
                                Scale animation with spring physics
                            </CardDescription>
                            <Icon name="plus" size="xl" color="success" />
                        </GlassCard>
                    </motion.div>
                </Grid>
            </Section>

            {/* Performance Note */}
            <Section theme={theme}>
                <div style={{ textAlign: 'center' }}>
                    <CardTitle theme={theme}>Performance Optimized</CardTitle>
                    <CardDescription theme={theme}>
                        All effects use GPU-accelerated transforms and respect user motion preferences.
                        Animations automatically reduce or disable based on system settings.
                    </CardDescription>
                </div>
            </Section>
        </DemoContainer>
    );
};

export default EffectsDemo;