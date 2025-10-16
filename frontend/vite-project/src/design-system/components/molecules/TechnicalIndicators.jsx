import React, { forwardRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../ThemeProvider';
import { Button, Icon, Label, Input } from '../atoms';
import { FormGroup, Field } from './FormGroup';
import {
    createGlassmorphism,
    tradingGlassPresets,
    animationPresets,
    hoverEffects,
    staggerAnimations
} from '../../effects';

// Indicator container
const IndicatorContainer = styled(motion.div)`
  ${props => tradingGlassPresets.widget(props.theme)}
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[4]};
  position: relative;
`;

// Indicator header
const IndicatorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
  padding-bottom: ${props => props.theme.spacing[3]};
  border-bottom: 1px solid ${props => props.theme.color.border.primary};
`;

// Indicator list
const IndicatorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3]};
`;

// Indicator item
const IndicatorItem = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.color.background.secondary}50;
  border: 1px solid ${props => props.theme.color.border.primary};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};

  &:hover {
    background: ${props => props.theme.color.background.secondary};
    border-color: ${props => props.theme.color.border.secondary};
  }

  ${props => props.active && css`
    border-color: ${props.theme.color.primary[500]};
    background: ${props.theme.color.primary[500]}10;
  `}
`;

// Indicator info
const IndicatorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  flex: 1;
`;

// Indicator details
const IndicatorDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

// Indicator name
const IndicatorName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.color.text.primary};
`;

// Indicator description
const IndicatorDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.color.text.secondary};
`;

// Indicator value
const IndicatorValue = styled.div`
  font-family: ${props => props.theme.typography.fontFamily.monospace};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props =>
        props.trend === 'bullish' ? props.theme.color.trading.bull :
            props.trend === 'bearish' ? props.theme.color.trading.bear :
                props.theme.color.text.primary
    };
`;

// Indicator actions
const IndicatorActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

// Settings modal
const SettingsModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${props => props.theme.zIndex.modal};
  backdrop-filter: blur(4px);
`;

// Settings content
const SettingsContent = styled(motion.div)`
  ${props => tradingGlassPresets.modal(props.theme)}
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[6]};
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

// Predefined indicators
const PREDEFINED_INDICATORS = [
    {
        key: 'sma',
        name: 'Simple Moving Average',
        description: 'Average price over a specified period',
        category: 'trend',
        defaultParams: { period: 20 },
        paramConfig: [
            { key: 'period', label: 'Period', type: 'number', min: 1, max: 200, default: 20 }
        ]
    },
    {
        key: 'ema',
        name: 'Exponential Moving Average',
        description: 'Weighted average giving more importance to recent prices',
        category: 'trend',
        defaultParams: { period: 12 },
        paramConfig: [
            { key: 'period', label: 'Period', type: 'number', min: 1, max: 200, default: 12 }
        ]
    },
    {
        key: 'rsi',
        name: 'Relative Strength Index',
        description: 'Momentum oscillator measuring speed and change of price movements',
        category: 'momentum',
        defaultParams: { period: 14, overbought: 70, oversold: 30 },
        paramConfig: [
            { key: 'period', label: 'Period', type: 'number', min: 2, max: 50, default: 14 },
            { key: 'overbought', label: 'Overbought Level', type: 'number', min: 50, max: 100, default: 70 },
            { key: 'oversold', label: 'Oversold Level', type: 'number', min: 0, max: 50, default: 30 }
        ]
    },
    {
        key: 'macd',
        name: 'MACD',
        description: 'Moving Average Convergence Divergence',
        category: 'momentum',
        defaultParams: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
        paramConfig: [
            { key: 'fastPeriod', label: 'Fast Period', type: 'number', min: 1, max: 50, default: 12 },
            { key: 'slowPeriod', label: 'Slow Period', type: 'number', min: 1, max: 100, default: 26 },
            { key: 'signalPeriod', label: 'Signal Period', type: 'number', min: 1, max: 50, default: 9 }
        ]
    },
    {
        key: 'bb',
        name: 'Bollinger Bands',
        description: 'Volatility bands placed above and below a moving average',
        category: 'volatility',
        defaultParams: { period: 20, stdDev: 2 },
        paramConfig: [
            { key: 'period', label: 'Period', type: 'number', min: 2, max: 100, default: 20 },
            { key: 'stdDev', label: 'Standard Deviations', type: 'number', min: 0.1, max: 5, step: 0.1, default: 2 }
        ]
    },
    {
        key: 'stoch',
        name: 'Stochastic Oscillator',
        description: 'Momentum indicator comparing closing price to price range',
        category: 'momentum',
        defaultParams: { kPeriod: 14, dPeriod: 3, smooth: 3 },
        paramConfig: [
            { key: 'kPeriod', label: '%K Period', type: 'number', min: 1, max: 50, default: 14 },
            { key: 'dPeriod', label: '%D Period', type: 'number', min: 1, max: 20, default: 3 },
            { key: 'smooth', label: 'Smooth', type: 'number', min: 1, max: 10, default: 3 }
        ]
    },
    {
        key: 'atr',
        name: 'Average True Range',
        description: 'Volatility indicator measuring degree of price movement',
        category: 'volatility',
        defaultParams: { period: 14 },
        paramConfig: [
            { key: 'period', label: 'Period', type: 'number', min: 1, max: 50, default: 14 }
        ]
    },
    {
        key: 'volume',
        name: 'Volume',
        description: 'Number of shares traded',
        category: 'volume',
        defaultParams: {},
        paramConfig: []
    }
];

// Technical indicators component
const TechnicalIndicators = forwardRef(({
    activeIndicators = [],
    indicatorValues = {},
    onIndicatorAdd,
    onIndicatorRemove,
    onIndicatorUpdate,
    availableIndicators = PREDEFINED_INDICATORS,
    className,
    testId,
    ...props
}, ref) => {
    const { theme } = useTheme();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [selectedIndicator, setSelectedIndicator] = useState(null);
    const [indicatorParams, setIndicatorParams] = useState({});

    const handleAddIndicator = (indicator) => {
        setSelectedIndicator(indicator);
        setIndicatorParams(indicator.defaultParams || {});
        setSettingsOpen(true);
    };

    const handleSaveIndicator = () => {
        if (selectedIndicator && onIndicatorAdd) {
            onIndicatorAdd({
                ...selectedIndicator,
                params: indicatorParams,
                id: `${selectedIndicator.key}_${Date.now()}`
            });
        }
        setSettingsOpen(false);
        setSelectedIndicator(null);
        setIndicatorParams({});
    };

    const handleRemoveIndicator = (indicatorId) => {
        if (onIndicatorRemove) {
            onIndicatorRemove(indicatorId);
        }
    };

    const handleEditIndicator = (indicator) => {
        setSelectedIndicator(indicator);
        setIndicatorParams(indicator.params || {});
        setSettingsOpen(true);
    };

    const getIndicatorTrend = (indicator, value) => {
        if (!value) return 'neutral';

        switch (indicator.key) {
            case 'rsi':
                if (value > 70) return 'bearish';
                if (value < 30) return 'bullish';
                return 'neutral';
            case 'macd':
                return value > 0 ? 'bullish' : 'bearish';
            case 'stoch':
                if (value > 80) return 'bearish';
                if (value < 20) return 'bullish';
                return 'neutral';
            default:
                return 'neutral';
        }
    };

    const formatIndicatorValue = (indicator, value) => {
        if (value === undefined || value === null) return '--';

        switch (indicator.key) {
            case 'rsi':
            case 'stoch':
                return `${value.toFixed(2)}`;
            case 'macd':
                return `${value.toFixed(4)}`;
            case 'atr':
                return `${value.toFixed(3)}`;
            case 'volume':
                return value.toLocaleString();
            default:
                return `${value.toFixed(2)}`;
        }
    };

    const availableToAdd = availableIndicators.filter(
        indicator => !activeIndicators.some(active => active.key === indicator.key)
    );

    // Keyboard navigation handler
    const handleKeyDown = (event) => {
        const { key, ctrlKey, altKey } = event;

        if (ctrlKey || altKey) {
            switch (key) {
                case 'a':
                    event.preventDefault();
                    if (availableToAdd.length > 0) {
                        handleAddIndicator(availableToAdd[0]);
                    }
                    break;
                case 'Escape':
                    event.preventDefault();
                    setSettingsOpen(false);
                    break;
                default:
                    break;
            }
        }
    };

    // Add keyboard event listener
    React.useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [availableToAdd, settingsOpen]);

    return (
        <IndicatorContainer
            ref={ref}
            className={className}
            theme={theme}
            data-testid={testId}
            {...animationPresets.fadeIn}
            {...props}
        >
            <IndicatorHeader theme={theme}>
                <Label size="lg" weight="semibold" color="primary">
                    Technical Indicators
                </Label>
                <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Icon name="plus" />}
                    onClick={() => {
                        if (availableToAdd.length > 0) {
                            handleAddIndicator(availableToAdd[0]);
                        }
                    }}
                    disabled={availableToAdd.length === 0}
                >
                    Add Indicator
                </Button>
            </IndicatorHeader>

            <IndicatorList theme={theme}>
                <AnimatePresence>
                    {activeIndicators.map((indicator, index) => {
                        const value = indicatorValues[indicator.id];
                        const trend = getIndicatorTrend(indicator, value);

                        return (
                            <IndicatorItem
                                key={indicator.id}
                                active={true}
                                theme={theme}
                                {...staggerAnimations.item}
                                transition={{ delay: index * 0.1 }}
                                {...hoverEffects.cardSubtle}
                            >
                                <IndicatorInfo theme={theme}>
                                    <Icon
                                        name={
                                            indicator.category === 'trend' ? 'trendUp' :
                                                indicator.category === 'momentum' ? 'volume' :
                                                    indicator.category === 'volatility' ? 'alert' :
                                                        'candlestick'
                                        }
                                        size="sm"
                                        color="primary"
                                    />
                                    <IndicatorDetails>
                                        <IndicatorName theme={theme}>
                                            {indicator.name}
                                        </IndicatorName>
                                        <IndicatorDescription theme={theme}>
                                            {indicator.description}
                                        </IndicatorDescription>
                                    </IndicatorDetails>
                                </IndicatorInfo>

                                <IndicatorValue theme={theme} trend={trend}>
                                    {formatIndicatorValue(indicator, value)}
                                </IndicatorValue>

                                <IndicatorActions theme={theme}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditIndicator(indicator)}
                                        leftIcon={<Icon name="settings" />}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveIndicator(indicator.id)}
                                        leftIcon={<Icon name="close" />}
                                    />
                                </IndicatorActions>
                            </IndicatorItem>
                        );
                    })}
                </AnimatePresence>

                {activeIndicators.length === 0 && (
                    <motion.div
                        style={{
                            textAlign: 'center',
                            padding: theme.spacing[8],
                            color: theme.color.text.secondary,
                        }}
                        {...animationPresets.fadeIn}
                    >
                        <Icon name="candlestick" size="xl" color="secondary" />
                        <Label size="sm" color="secondary" style={{ marginTop: theme.spacing[2] }}>
                            No indicators added yet. Click "Add Indicator" to get started.
                        </Label>
                    </motion.div>
                )}
            </IndicatorList>

            {/* Settings Modal */}
            <AnimatePresence>
                {settingsOpen && selectedIndicator && (
                    <SettingsModal
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setSettingsOpen(false);
                            }
                        }}
                        {...animationPresets.modalBackdrop}
                    >
                        <SettingsContent
                            theme={theme}
                            {...animationPresets.modalContent}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <FormGroup
                                title={`Configure ${selectedIndicator.name}`}
                                description={selectedIndicator.description}
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSaveIndicator();
                                }}
                            >
                                {selectedIndicator.paramConfig.map((param) => (
                                    <Field
                                        key={param.key}
                                        label={param.label}
                                        required
                                    >
                                        <Input
                                            type={param.type}
                                            value={indicatorParams[param.key] || param.default}
                                            onChange={(e) => {
                                                const value = param.type === 'number'
                                                    ? parseFloat(e.target.value) || param.default
                                                    : e.target.value;
                                                setIndicatorParams(prev => ({
                                                    ...prev,
                                                    [param.key]: value
                                                }));
                                            }}
                                            min={param.min}
                                            max={param.max}
                                            step={param.step}
                                        />
                                    </Field>
                                ))}

                                <div style={{
                                    display: 'flex',
                                    gap: theme.spacing[3],
                                    justifyContent: 'flex-end',
                                    marginTop: theme.spacing[6]
                                }}>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setSettingsOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                    >
                                        Add Indicator
                                    </Button>
                                </div>
                            </FormGroup>
                        </SettingsContent>
                    </SettingsModal>
                )}
            </AnimatePresence>
        </IndicatorContainer>
    );
});

TechnicalIndicators.displayName = 'TechnicalIndicators';

// Export predefined indicators for use in other components
export { PREDEFINED_INDICATORS };

export default TechnicalIndicators;