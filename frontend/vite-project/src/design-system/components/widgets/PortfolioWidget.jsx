import React, { useState, useEffect, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../ThemeProvider';
import { Button, Icon, Label } from '../atoms';
import { Card, MetricCard } from '../molecules';
import { Widget } from '../organisms';
import { useRealTimeData, usePriceSubscription } from '../providers';
import {
    tradingGlassPresets,
    animationPresets,
    hoverEffects
} from '../../effects';

// Portfolio container
const PortfolioContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: ${props => props.theme.spacing[3]};
`;

// Portfolio summary
const PortfolioSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

// Holdings list
const HoldingsList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

// Holding item
const HoldingItem = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr auto auto auto auto;
  align-items: center;
  padding: ${props => props.theme.spacing[3]};
  ${props => tradingGlassPresets.card(props.theme)}
  border-radius: ${props => props.theme.borderRadius.md};
  gap: ${props => props.theme.spacing[3]};
  transition: all 0.2s ease;

  &:hover {
    ${props => hoverEffects.lift(props.theme)}
  }

  ${props => props.isFlashing && css`
    animation: priceFlash 0.6s ease-out;
    
    @keyframes priceFlash {
      0% { background-color: ${props.flashColor}40; }
      50% { background-color: ${props.flashColor}80; }
      100% { background-color: transparent; }
    }
  `}
`;

// Symbol info
const SymbolInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

// Symbol name
const SymbolName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.color.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

// Symbol description
const SymbolDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.color.text.secondary};
`;

// Value display
const ValueDisplay = styled.div`
  text-align: right;
  font-family: ${props => props.theme.typography.fontFamily.monospace};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.color.text.primary};
`;

// P&L display
const PnLDisplay = styled.div`
  text-align: right;
  font-family: ${props => props.theme.typography.fontFamily.monospace};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props =>
        props.value > 0 ? props.theme.color.trading.bull :
            props.value < 0 ? props.theme.color.trading.bear :
                props.theme.color.text.primary
    };
`;

// Performance chart mini
const MiniChart = styled.div`
  width: 60px;
  height: 30px;
  position: relative;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

/**
 * PortfolioWidget Component
 * Real-time portfolio tracking with P&L updates and performance visualization
 */
const PortfolioWidget = ({
    portfolioId = 'default',
    holdings = [],
    totalValue = 0,
    totalPnL = 0,
    totalPnLPercent = 0,
    dayPnL = 0,
    dayPnLPercent = 0,
    onHoldingClick,
    onAddHolding,
    onRemoveHolding,
    refreshInterval = 1000,
    showMiniCharts = true,
    ...widgetProps
}) => {
    const { theme } = useTheme();
    const { isConnected } = useRealTimeData();
    const [flashingHoldings, setFlashingHoldings] = useState(new Set());
    const [previousPrices, setPreviousPrices] = useState(new Map());

    // Subscribe to real-time price updates for all holdings
    const symbols = holdings.map(h => h.symbol);

    // Calculate portfolio metrics
    const portfolioMetrics = useMemo(() => {
        let calculatedValue = 0;
        let calculatedPnL = 0;
        let calculatedDayPnL = 0;

        holdings.forEach(holding => {
            const currentPrice = holding.currentPrice || holding.avgPrice;
            const marketValue = holding.quantity * currentPrice;
            const costBasis = holding.quantity * holding.avgPrice;
            const unrealizedPnL = marketValue - costBasis;
            const dayChange = holding.dayChange || 0;
            const dayPnLValue = holding.quantity * dayChange;

            calculatedValue += marketValue;
            calculatedPnL += unrealizedPnL;
            calculatedDayPnL += dayPnLValue;
        });

        const totalCostBasis = calculatedValue - calculatedPnL;
        const pnlPercent = totalCostBasis > 0 ? (calculatedPnL / totalCostBasis) * 100 : 0;
        const dayPnLPercent = calculatedValue > 0 ? (calculatedDayPnL / calculatedValue) * 100 : 0;

        return {
            totalValue: totalValue || calculatedValue,
            totalPnL: totalPnL || calculatedPnL,
            totalPnLPercent: totalPnLPercent || pnlPercent,
            dayPnL: dayPnL || calculatedDayPnL,
            dayPnLPercent: dayPnLPercent || dayPnLPercent
        };
    }, [holdings, totalValue, totalPnL, totalPnLPercent, dayPnL, dayPnLPercent]);

    // Handle price updates and flash animations
    useEffect(() => {
        const newFlashing = new Set();
        const newPreviousPrices = new Map(previousPrices);

        holdings.forEach(holding => {
            const currentPrice = holding.currentPrice;
            const previousPrice = previousPrices.get(holding.symbol);

            if (previousPrice && currentPrice && currentPrice !== previousPrice) {
                newFlashing.add(holding.symbol);
            }

            if (currentPrice) {
                newPreviousPrices.set(holding.symbol, currentPrice);
            }
        });

        if (newFlashing.size > 0) {
            setFlashingHoldings(newFlashing);
            setTimeout(() => setFlashingHoldings(new Set()), 600);
        }

        setPreviousPrices(newPreviousPrices);
    }, [holdings, previousPrices]);

    // Format currency values
    const formatCurrency = (value, showSign = false) => {
        const sign = showSign && value > 0 ? '+' : '';
        return `${sign}$${Math.abs(value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Format percentage
    const formatPercent = (value, showSign = false) => {
        const sign = showSign && value > 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    };

    // Generate mini chart data
    const generateMiniChart = (holding) => {
        if (!showMiniCharts || !holding.priceHistory) return null;

        const points = holding.priceHistory.slice(-20); // Last 20 data points
        if (points.length < 2) return null;

        const minPrice = Math.min(...points);
        const maxPrice = Math.max(...points);
        const priceRange = maxPrice - minPrice || 1;

        const pathData = points.map((price, index) => {
            const x = (index / (points.length - 1)) * 60;
            const y = 30 - ((price - minPrice) / priceRange) * 30;
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');

        const isPositive = points[points.length - 1] >= points[0];
        const color = isPositive ? theme.color.trading.bull : theme.color.trading.bear;

        return (
            <svg>
                <path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    opacity="0.8"
                />
            </svg>
        );
    };

    // Widget configuration
    const renderConfig = ({ onClose }) => (
        <div>
            <Label size="md" weight="semibold" style={{ marginBottom: theme.spacing[3] }}>
                Portfolio Settings
            </Label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3] }}>
                <label>
                    <Label size="sm">Refresh Interval (ms)</Label>
                    <input
                        type="number"
                        defaultValue={refreshInterval}
                        style={{
                            width: '100%',
                            padding: theme.spacing[2],
                            marginTop: theme.spacing[1],
                            border: `1px solid ${theme.color.border.primary}`,
                            borderRadius: theme.borderRadius.sm
                        }}
                    />
                </label>

                <label>
                    <input type="checkbox" defaultChecked={showMiniCharts} />
                    <Label size="sm" style={{ marginLeft: theme.spacing[2] }}>
                        Show Mini Charts
                    </Label>
                </label>

                <div style={{ display: 'flex', gap: theme.spacing[2], marginTop: theme.spacing[4] }}>
                    <Button size="sm" variant="primary" onClick={onClose}>
                        Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <Widget
            id={`portfolio-${portfolioId}`}
            title="Portfolio"
            icon="briefcase"
            renderConfig={renderConfig}
            {...widgetProps}
        >
            <PortfolioContainer>
                {/* Portfolio Summary */}
                <PortfolioSummary theme={theme}>
                    <MetricCard
                        title="Total Value"
                        value={formatCurrency(portfolioMetrics.totalValue)}
                        size="sm"
                    />
                    <MetricCard
                        title="Total P&L"
                        value={formatCurrency(portfolioMetrics.totalPnL, true)}
                        change={formatPercent(portfolioMetrics.totalPnLPercent, true)}
                        trend={portfolioMetrics.totalPnL > 0 ? 'up' : portfolioMetrics.totalPnL < 0 ? 'down' : 'neutral'}
                        size="sm"
                    />
                    <MetricCard
                        title="Day P&L"
                        value={formatCurrency(portfolioMetrics.dayPnL, true)}
                        change={formatPercent(portfolioMetrics.dayPnLPercent, true)}
                        trend={portfolioMetrics.dayPnL > 0 ? 'up' : portfolioMetrics.dayPnL < 0 ? 'down' : 'neutral'}
                        size="sm"
                    />
                </PortfolioSummary>

                {/* Holdings List */}
                <HoldingsList>
                    <AnimatePresence>
                        {holdings.map((holding) => {
                            const currentPrice = holding.currentPrice || holding.avgPrice;
                            const marketValue = holding.quantity * currentPrice;
                            const costBasis = holding.quantity * holding.avgPrice;
                            const unrealizedPnL = marketValue - costBasis;
                            const pnlPercent = costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0;
                            const isFlashing = flashingHoldings.has(holding.symbol);
                            const flashColor = unrealizedPnL > 0 ? theme.color.trading.bull : theme.color.trading.bear;

                            return (
                                <HoldingItem
                                    key={holding.symbol}
                                    isFlashing={isFlashing}
                                    flashColor={flashColor}
                                    onClick={() => onHoldingClick?.(holding)}
                                    theme={theme}
                                    {...animationPresets.fadeIn}
                                    {...hoverEffects.cardSubtle}
                                >
                                    <SymbolInfo>
                                        <SymbolName>{holding.symbol}</SymbolName>
                                        <SymbolDescription>
                                            {holding.quantity} shares @ {formatCurrency(holding.avgPrice)}
                                        </SymbolDescription>
                                    </SymbolInfo>

                                    <ValueDisplay theme={theme}>
                                        {formatCurrency(currentPrice)}
                                    </ValueDisplay>

                                    <ValueDisplay theme={theme}>
                                        {formatCurrency(marketValue)}
                                    </ValueDisplay>

                                    <PnLDisplay value={unrealizedPnL} theme={theme}>
                                        <div>{formatCurrency(unrealizedPnL, true)}</div>
                                        <div style={{ fontSize: theme.typography.fontSize.xs }}>
                                            {formatPercent(pnlPercent, true)}
                                        </div>
                                    </PnLDisplay>

                                    {showMiniCharts && (
                                        <MiniChart>
                                            {generateMiniChart(holding)}
                                        </MiniChart>
                                    )}
                                </HoldingItem>
                            );
                        })}
                    </AnimatePresence>

                    {holdings.length === 0 && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '200px',
                            color: theme.color.text.secondary,
                            textAlign: 'center'
                        }}>
                            <Icon name="briefcase" size="xl" style={{ marginBottom: theme.spacing[3] }} />
                            <Label size="md">No holdings in portfolio</Label>
                            <Label size="sm" style={{ marginTop: theme.spacing[1] }}>
                                Add some positions to start tracking
                            </Label>
                            {onAddHolding && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onAddHolding}
                                    style={{ marginTop: theme.spacing[3] }}
                                    leftIcon={<Icon name="plus" />}
                                >
                                    Add Position
                                </Button>
                            )}
                        </div>
                    )}
                </HoldingsList>

                {/* Connection Status */}
                {!isConnected && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing[2],
                        padding: theme.spacing[2],
                        background: theme.color.semantic.warning + '20',
                        borderRadius: theme.borderRadius.sm,
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.color.semantic.warning
                    }}>
                        <Icon name="alert" size="sm" />
                        Real-time data disconnected
                    </div>
                )}
            </PortfolioContainer>
        </Widget>
    );
};

export default PortfolioWidget;