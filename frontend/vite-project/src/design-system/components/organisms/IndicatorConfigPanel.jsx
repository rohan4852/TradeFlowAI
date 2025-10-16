import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../ThemeProvider';
import { Button, Icon, Label, Input } from '../atoms';
import { FormGroup, Field, Card } from '../molecules';
import { calculateAllIndicators } from '../../utils/technicalIndicators';
import {
    createGlassmorphism,
    tradingGlassPresets,
    animationPresets,
    hoverEffects,
    staggerAnimations
} from '../../effects';

// Panel container
const PanelContainer = styled(motion.div)`
  ${props => tradingGlassPresets.sidebar(props.theme)}
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[4]};
  width: ${props => props.width || '400px'};
  height: ${props => props.height || '600px'};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

// Panel header
const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[4]};
  padding-bottom: ${props => props.theme.spacing[3]};
  border-bottom: 1px solid ${props => props.theme.color.border.primary};
`;

// Indicator categories
const CategoryTabs = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
  margin-bottom: ${props => props.theme.spacing[4]};
  ${props => createGlassmorphism(props.theme, { intensity: 'light' })}
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.borderRadius.md};
`;

// Category tab
const CategoryTab = styled(motion.button)`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.active ? props.theme.color.primary[500] : 'transparent'};
  color: ${props => props.active ? props.theme.color.text.inverse : props.theme.color.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  white-space: nowrap;

  &:hover {
    background: ${props => props.active ? props.theme.color.primary[600] : props.theme.color.background.secondary};
    color: ${props => props.active ? props.theme.color.text.inverse : props.theme.color.text.primary};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.color.primary[500]}40;
  }
`;

// Indicator list
const IndicatorList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

// Indicator item
const IndicatorItem = styled(motion.div)`
  ${props => tradingGlassPresets.card(props.theme)}
  padding: ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  ${props => props.active && css`
    border-color: ${props.theme.color.primary[500]};
    background: ${props.theme.color.primary[500]}10;
  `}

  ${props => props.configured && css`
    border-color: ${props.theme.color.success[500]};
  `}
`;

// Indicator info
const IndicatorInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing[2]};
`;

// Indicator details
const IndicatorDetails = styled.div`
  flex: 1;
`;

// Indicator name
const IndicatorName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.color.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

// Indicator description
const IndicatorDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.color.text.secondary};
  line-height: 1.4;
`;

// Configuration form
const ConfigurationForm = styled(motion.div)`
  ${props => tradingGlassPresets.card(props.theme)}
  padding: ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-top: ${props => props.theme.spacing[3]};
`;

// Preview container
const PreviewContainer = styled.div`
  ${props => tradingGlassPresets.card(props.theme)}
  padding: ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-top: ${props => props.theme.spacing[3]};
  height: 200px;
  position: relative;
  overflow: hidden;
`;

// Preview chart
const PreviewChart = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

// Action buttons
const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[3]};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing[4]};
  padding-top: ${props => props.theme.spacing[3]};
  border-top: 1px solid ${props => props.theme.color.border.primary};
`;

// Predefined indicator configurations
const INDICATOR_DEFINITIONS = {
    trend: [
        {
            key: 'sma',
            name: 'Simple Moving Average',
            description: 'Average price over a specified period',
            defaultParams: { period: 20 },
            paramConfig: [
                { key: 'period', label: 'Period', type: 'number', min: 1, max: 200, default: 20 }
            ]
        },
        {
            key: 'ema',
            name: 'Exponential Moving Average',
            description: 'Weighted average giving more importance to recent prices',
            defaultParams: { period: 12 },
            paramConfig: [
                { key: 'period', label: 'Period', type: 'number', min: 1, max: 200, default: 12 }
            ]
        }
    ],
    momentum: [
        {
            key: 'rsi',
            name: 'Relative Strength Index',
            description: 'Momentum oscillator measuring speed and change of price movements',
            defaultParams: { period: 14 },
            paramConfig: [
                { key: 'period', label: 'Period', type: 'number', min: 2, max: 50, default: 14 }
            ]
        },
        {
            key: 'macd',
            name: 'MACD',
            description: 'Moving Average Convergence Divergence',
            defaultParams: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
            paramConfig: [
                { key: 'fastPeriod', label: 'Fast Period', type: 'number', min: 1, max: 50, default: 12 },
                { key: 'slowPeriod', label: 'Slow Period', type: 'number', min: 1, max: 100, default: 26 },
                { key: 'signalPeriod', label: 'Signal Period', type: 'number', min: 1, max: 50, default: 9 }
            ]
        },
        {
            key: 'stochastic',
            name: 'Stochastic Oscillator',
            description: 'Momentum indicator comparing closing price to price range',
            defaultParams: { kPeriod: 14, dPeriod: 3, smooth: 3 },
            paramConfig: [
                { key: 'kPeriod', label: '%K Period', type: 'number', min: 1, max: 50, default: 14 },
                { key: 'dPeriod', label: '%D Period', type: 'number', min: 1, max: 20, default: 3 },
                { key: 'smooth', label: 'Smooth', type: 'number', min: 1, max: 10, default: 3 }
            ]
        },
        {
            key: 'williamsR',
            name: 'Williams %R',
            description: 'Momentum indicator measuring overbought/oversold levels',
            defaultParams: { period: 14 },
            paramConfig: [
                { key: 'period', label: 'Period', type: 'number', min: 1, max: 50, default: 14 }
            ]
        },
        {
            key: 'cci',
            name: 'Commodity Channel Index',
            description: 'Momentum-based oscillator used to identify trend changes',
            defaultParams: { period: 20 },
            paramConfig: [
                { key: 'period', label: 'Period', type: 'number', min: 1, max: 50, default: 20 }
            ]
        },
        {
            key: 'mfi',
            name: 'Money Flow Index',
            description: 'Volume-weighted RSI measuring buying and selling pressure',
            defaultParams: { period: 14 },
            paramConfig: [
                { key: 'period', label: 'Period', type: 'number', min: 1, max: 50, default: 14 }
            ]
        }
    ],
    volatility: [
        {
            key: 'bollingerBands',
            name: 'Bollinger Bands',
            description: 'Volatility bands placed above and below a moving average',
            defaultParams: { period: 20, stdDev: 2 },
            paramConfig: [
                { key: 'period', label: 'Period', type: 'number', min: 2, max: 100, default: 20 },
                { key: 'stdDev', label: 'Standard Deviations', type: 'number', min: 0.1, max: 5, step: 0.1, default: 2 }
            ]
        },
        {
            key: 'atr',
            name: 'Average True Range',
            description: 'Volatility indicator measuring degree of price movement',
            defaultParams: { period: 14 },
            paramConfig: [
                { key: 'period', label: 'Period', type: 'number', min: 1, max: 50, default: 14 }
            ]
        }
    ],
    volume: [
        {
            key: 'obv',
            name: 'On-Balance Volume',
            description: 'Volume-based indicator showing buying and selling pressure',
            defaultParams: {},
            paramConfig: []
        }
    ]
};

/**
 * IndicatorConfigPanel Component
 * Configuration panel for technical indicators with real-time preview
 */
const IndicatorConfigPanel = ({
    data = [],
    activeIndicators = {},
    onIndicatorAdd,
    onIndicatorUpdate,
    onIndicatorRemove,
    onClose,
    width,
    height,
    className,
    testId,
    ...props
}) => {
    const { theme } = useTheme();
    const [activeCategory, setActiveCategory] = useState('trend');
    const [selectedIndicator, setSelectedIndicator] = useState(null);
    const [indicatorParams, setIndicatorParams] = useState({});
    const [previewData, setPreviewData] = useState(null);
    const previewCanvasRef = React.useRef(null);

    const categories = [
        { key: 'trend', label: 'Trend', icon: 'trending-up' },
        { key: 'momentum', label: 'Momentum', icon: 'activity' },
        { key: 'volatility', label: 'Volatility', icon: 'bar-chart-2' },
        { key: 'volume', label: 'Volume', icon: 'volume-2' }
    ];

    // Get indicators for active category
    const categoryIndicators = useMemo(() => {
        return INDICATOR_DEFINITIONS[activeCategory] || [];
    }, [activeCategory]);

    // Calculate preview data when parameters change
    useEffect(() => {
        if (selectedIndicator && data.length > 0) {
            const config = {
                [selectedIndicator.key]: indicatorParams
            };

            try {
                const calculatedIndicators = calculateAllIndicators(data, config);
                setPreviewData(calculatedIndicators[selectedIndicator.key]);
            } catch (error) {
                console.error('Error calculating preview:', error);
                setPreviewData(null);
            }
        }
    }, [selectedIndicator, indicatorParams, data]);

    // Draw preview chart
    useEffect(() => {
        if (previewCanvasRef.current && previewData && data.length > 0) {
            drawPreviewChart();
        }
    }, [previewData, data]);

    const drawPreviewChart = useCallback(() => {
        const canvas = previewCanvasRef.current;
        if (!canvas || !previewData || !data.length) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = rect.width * pixelRatio;
        canvas.height = rect.height * pixelRatio;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(pixelRatio, pixelRatio);

        const width = rect.width;
        const height = rect.height;
        const padding = { top: 10, right: 10, bottom: 20, left: 10 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw background
        ctx.fillStyle = theme.color.background.secondary + '40';
        ctx.fillRect(0, 0, width, height);

        if (Array.isArray(previewData) && previewData.length > 0) {
            // Single line indicator (RSI, ATR, etc.)
            const values = previewData.map(d => d.value);
            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            const valueRange = maxValue - minValue;

            if (valueRange > 0) {
                ctx.strokeStyle = theme.color.primary[500];
                ctx.lineWidth = 2;
                ctx.beginPath();

                previewData.forEach((point, index) => {
                    const x = padding.left + (index / (previewData.length - 1)) * chartWidth;
                    const y = padding.top + (1 - (point.value - minValue) / valueRange) * chartHeight;

                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });

                ctx.stroke();
            }
        } else if (previewData && typeof previewData === 'object') {
            // Multi-line indicator (MACD, Bollinger Bands, etc.)
            if (previewData.macd && previewData.signal) {
                // MACD
                drawLine(ctx, previewData.macd, theme.color.primary[500], padding, chartWidth, chartHeight);
                drawLine(ctx, previewData.signal, theme.color.secondary[500], padding, chartWidth, chartHeight);

                if (previewData.histogram) {
                    drawHistogram(ctx, previewData.histogram, padding, chartWidth, chartHeight);
                }
            } else if (previewData.upper && previewData.lower) {
                // Bollinger Bands
                drawLine(ctx, previewData.upper, theme.color.warning[500], padding, chartWidth, chartHeight);
                drawLine(ctx, previewData.middle, theme.color.primary[500], padding, chartWidth, chartHeight);
                drawLine(ctx, previewData.lower, theme.color.warning[500], padding, chartWidth, chartHeight);
            } else if (previewData.k && previewData.d) {
                // Stochastic
                drawLine(ctx, previewData.k, theme.color.primary[500], padding, chartWidth, chartHeight);
                drawLine(ctx, previewData.d, theme.color.secondary[500], padding, chartWidth, chartHeight);
            }
        }

        // Draw reference lines for oscillators
        if (selectedIndicator?.key === 'rsi') {
            drawReferenceLine(ctx, 70, padding, chartWidth, chartHeight, theme.color.error[500]);
            drawReferenceLine(ctx, 30, padding, chartWidth, chartHeight, theme.color.success[500]);
        } else if (selectedIndicator?.key === 'stochastic') {
            drawReferenceLine(ctx, 80, padding, chartWidth, chartHeight, theme.color.error[500]);
            drawReferenceLine(ctx, 20, padding, chartWidth, chartHeight, theme.color.success[500]);
        }
    }, [previewData, data, theme, selectedIndicator]);

    const drawLine = (ctx, lineData, color, padding, chartWidth, chartHeight) => {
        if (!lineData || lineData.length === 0) return;

        const values = lineData.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const valueRange = maxValue - minValue;

        if (valueRange === 0) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        lineData.forEach((point, index) => {
            const x = padding.left + (index / (lineData.length - 1)) * chartWidth;
            const y = padding.top + (1 - (point.value - minValue) / valueRange) * chartHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    };

    const drawHistogram = (ctx, histogramData, padding, chartWidth, chartHeight) => {
        if (!histogramData || histogramData.length === 0) return;

        const values = histogramData.map(d => d.value);
        const minValue = Math.min(...values, 0);
        const maxValue = Math.max(...values, 0);
        const valueRange = maxValue - minValue;

        if (valueRange === 0) return;

        const barWidth = chartWidth / histogramData.length;
        const zeroY = padding.top + (maxValue / valueRange) * chartHeight;

        histogramData.forEach((point, index) => {
            const x = padding.left + index * barWidth;
            const barHeight = Math.abs(point.value) / valueRange * chartHeight;
            const y = point.value >= 0 ? zeroY - barHeight : zeroY;

            ctx.fillStyle = point.value >= 0 ? theme.color.success[500] + '80' : theme.color.error[500] + '80';
            ctx.fillRect(x, y, barWidth * 0.8, barHeight);
        });
    };

    const drawReferenceLine = (ctx, value, padding, chartWidth, chartHeight, color) => {
        const y = padding.top + (1 - value / 100) * chartHeight;

        ctx.strokeStyle = color + '60';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
        ctx.setLineDash([]);
    };

    const handleIndicatorSelect = useCallback((indicator) => {
        setSelectedIndicator(indicator);
        setIndicatorParams(indicator.defaultParams || {});
    }, []);

    const handleParamChange = useCallback((paramKey, value) => {
        setIndicatorParams(prev => ({
            ...prev,
            [paramKey]: value
        }));
    }, []);

    const handleAddIndicator = useCallback(() => {
        if (selectedIndicator && onIndicatorAdd) {
            const indicatorConfig = {
                key: selectedIndicator.key,
                name: selectedIndicator.name,
                params: indicatorParams,
                id: `${selectedIndicator.key}_${Date.now()}`
            };
            onIndicatorAdd(indicatorConfig);
        }
    }, [selectedIndicator, indicatorParams, onIndicatorAdd]);

    const handleUpdateIndicator = useCallback(() => {
        if (selectedIndicator && onIndicatorUpdate) {
            const indicatorConfig = {
                key: selectedIndicator.key,
                name: selectedIndicator.name,
                params: indicatorParams,
                id: activeIndicators[selectedIndicator.key]?.id
            };
            onIndicatorUpdate(indicatorConfig);
        }
    }, [selectedIndicator, indicatorParams, activeIndicators, onIndicatorUpdate]);

    const isIndicatorActive = useCallback((indicatorKey) => {
        return activeIndicators.hasOwnProperty(indicatorKey);
    }, [activeIndicators]);

    return (
        <PanelContainer
            width={width}
            height={height}
            className={className}
            theme={theme}
            data-testid={testId}
            {...animationPresets.slideLeft}
            {...props}
        >
            <PanelHeader theme={theme}>
                <Label size="lg" weight="bold" color="primary">
                    Technical Indicators
                </Label>
                {onClose && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        leftIcon={<Icon name="x" />}
                    />
                )}
            </PanelHeader>

            <CategoryTabs theme={theme}>
                {categories.map((category, index) => (
                    <CategoryTab
                        key={category.key}
                        active={activeCategory === category.key}
                        onClick={() => setActiveCategory(category.key)}
                        theme={theme}
                        {...staggerAnimations.item}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Icon name={category.icon} size="xs" style={{ marginRight: theme.spacing[1] }} />
                        {category.label}
                    </CategoryTab>
                ))}
            </CategoryTabs>

            <IndicatorList theme={theme}>
                <AnimatePresence>
                    {categoryIndicators.map((indicator, index) => (
                        <IndicatorItem
                            key={indicator.key}
                            active={selectedIndicator?.key === indicator.key}
                            configured={isIndicatorActive(indicator.key)}
                            onClick={() => handleIndicatorSelect(indicator)}
                            theme={theme}
                            {...staggerAnimations.item}
                            transition={{ delay: index * 0.05 }}
                            {...hoverEffects.cardSubtle}
                        >
                            <IndicatorInfo theme={theme}>
                                <IndicatorDetails>
                                    <IndicatorName theme={theme}>
                                        {indicator.name}
                                        {isIndicatorActive(indicator.key) && (
                                            <Icon
                                                name="check-circle"
                                                size="xs"
                                                color="success"
                                                style={{ marginLeft: theme.spacing[2] }}
                                            />
                                        )}
                                    </IndicatorName>
                                    <IndicatorDescription theme={theme}>
                                        {indicator.description}
                                    </IndicatorDescription>
                                </IndicatorDetails>
                                <Icon
                                    name="chevron-right"
                                    size="sm"
                                    color={selectedIndicator?.key === indicator.key ? 'primary' : 'secondary'}
                                />
                            </IndicatorInfo>
                        </IndicatorItem>
                    ))}
                </AnimatePresence>
            </IndicatorList>

            {selectedIndicator && (
                <ConfigurationForm
                    theme={theme}
                    {...animationPresets.slideUp}
                >
                    <Label size="md" weight="semibold" style={{ marginBottom: theme.spacing[3] }}>
                        Configure {selectedIndicator.name}
                    </Label>

                    {selectedIndicator.paramConfig.map((param) => (
                        <Field
                            key={param.key}
                            label={param.label}
                            style={{ marginBottom: theme.spacing[3] }}
                        >
                            <Input
                                type={param.type}
                                value={indicatorParams[param.key] || param.default}
                                onChange={(e) => {
                                    const value = param.type === 'number'
                                        ? parseFloat(e.target.value) || param.default
                                        : e.target.value;
                                    handleParamChange(param.key, value);
                                }}
                                min={param.min}
                                max={param.max}
                                step={param.step}
                                size="sm"
                            />
                        </Field>
                    ))}

                    {previewData && (
                        <PreviewContainer theme={theme}>
                            <Label size="sm" weight="medium" style={{ marginBottom: theme.spacing[2] }}>
                                Preview
                            </Label>
                            <PreviewChart ref={previewCanvasRef} />
                        </PreviewContainer>
                    )}

                    <ActionButtons theme={theme}>
                        {isIndicatorActive(selectedIndicator.key) ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onIndicatorRemove?.(selectedIndicator.key)}
                                    leftIcon={<Icon name="trash-2" />}
                                >
                                    Remove
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleUpdateIndicator}
                                    leftIcon={<Icon name="refresh-cw" />}
                                >
                                    Update
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleAddIndicator}
                                leftIcon={<Icon name="plus" />}
                            >
                                Add Indicator
                            </Button>
                        )}
                    </ActionButtons>
                </ConfigurationForm>
            )}
        </PanelContainer>
    );
};

export default IndicatorConfigPanel;