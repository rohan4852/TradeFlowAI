import React, { forwardRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../ThemeProvider';
import { Button, Icon, Label } from '../atoms';
import {
    createGlassmorphism,
    tradingGlassPresets,
    animationPresets,
    hoverEffects,
    staggerAnimations
} from '../../effects';

// Chart controls container
const ChartControlsContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  ${props => tradingGlassPresets.chartOverlay(props.theme)}
  padding: ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.borderRadius.lg};
  flex-wrap: wrap;
  position: relative;

  ${props => props.vertical && css`
    flex-direction: column;
    align-items: stretch;
    width: ${props.width || '200px'};
  `}

  ${props => props.floating && css`
    position: absolute;
    top: ${props.theme.spacing[4]};
    right: ${props.theme.spacing[4]};
    z-index: ${props.theme.zIndex.dropdown};
  `}
`;

// Control group
const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.color.background.secondary}50;

  ${props => props.vertical && css`
    flex-direction: column;
    align-items: stretch;
  `}
`;

// Timeframe selector
const TimeframeSelector = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
  ${props => createGlassmorphism(props.theme, { intensity: 'light' })}
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.borderRadius.md};
`;

// Timeframe button
const TimeframeButton = styled(motion.button)`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[3]};
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.active ? props.theme.color.primary[500] : 'transparent'};
  color: ${props => props.active ? props.theme.color.text.inverse : props.theme.color.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
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
    background: ${props => props.active ? props.theme.color.primary[600] : props.theme.color.background.secondary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Chart type selector
const ChartTypeSelector = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
`;

// Chart type button
const ChartTypeButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.active ? props.theme.color.primary[500] : props.theme.color.background.secondary};
  color: ${props => props.active ? props.theme.color.text.inverse : props.theme.color.text.secondary};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};

  &:hover {
    background: ${props => props.active ? props.theme.color.primary[600] : props.theme.color.background.tertiary};
    color: ${props => props.active ? props.theme.color.text.inverse : props.theme.color.text.primary};
    transform: translateY(-1px);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.color.primary[500]}40;
    background: ${props => props.active ? props.theme.color.primary[600] : props.theme.color.background.tertiary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Indicator dropdown
const IndicatorDropdown = styled(motion.div)`
  position: relative;
  display: inline-block;
`;

// Dropdown content
const DropdownContent = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  ${props => tradingGlassPresets.modal(props.theme)}
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing[2]};
  z-index: ${props => props.theme.zIndex.dropdown};
  box-shadow: ${props => props.theme.shadows.lg};
`;

// Dropdown item
const DropdownItem = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  width: 100%;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: transparent;
  color: ${props => props.theme.color.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  text-align: left;

  &:hover {
    background: ${props => props.theme.color.background.secondary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Volume controls
const VolumeControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

// Drawing tools
const DrawingTools = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
`;

// Chart controls component
const ChartControls = forwardRef(({
    timeframes = ['1m', '5m', '15m', '1h', '4h', '1D', '1W', '1M'],
    activeTimeframe = '1D',
    onTimeframeChange,
    chartTypes = [
        { key: 'candlestick', icon: 'candlestick', label: 'Candlestick' },
        { key: 'line', icon: 'trendUp', label: 'Line' },
        { key: 'area', icon: 'volume', label: 'Area' },
        { key: 'bar', icon: 'minus', label: 'Bar' },
    ],
    activeChartType = 'candlestick',
    onChartTypeChange,
    indicators = [],
    activeIndicators = [],
    onIndicatorToggle,
    showVolume = true,
    onVolumeToggle,
    drawingTools = [
        { key: 'line', icon: 'minus', label: 'Trend Line' },
        { key: 'rectangle', icon: 'plus', label: 'Rectangle' },
        { key: 'text', icon: 'info', label: 'Text' },
    ],
    activeDrawingTool,
    onDrawingToolChange,
    vertical = false,
    floating = false,
    width,
    className,
    testId,
    ...props
}, ref) => {
    const { theme } = useTheme();
    const [indicatorDropdownOpen, setIndicatorDropdownOpen] = useState(false);
    const containerRef = React.useRef(null);

    const handleTimeframeClick = (timeframe) => {
        if (onTimeframeChange) {
            onTimeframeChange(timeframe);
        }
    };

    const handleChartTypeClick = (chartType) => {
        if (onChartTypeChange) {
            onChartTypeChange(chartType);
        }
    };

    const handleIndicatorClick = (indicator) => {
        if (onIndicatorToggle) {
            onIndicatorToggle(indicator);
        }
        setIndicatorDropdownOpen(false);
    };

    const handleDrawingToolClick = (tool) => {
        if (onDrawingToolChange) {
            onDrawingToolChange(tool);
        }
    };

    // Keyboard navigation handlers
    const handleKeyDown = (event) => {
        const { key, ctrlKey, altKey } = event;

        // Handle keyboard shortcuts
        if (ctrlKey || altKey) {
            switch (key) {
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                    event.preventDefault();
                    const timeframeIndex = parseInt(key) - 1;
                    if (timeframes[timeframeIndex]) {
                        handleTimeframeClick(timeframes[timeframeIndex]);
                    }
                    break;
                case 'c':
                    event.preventDefault();
                    const currentChartIndex = chartTypes.findIndex(ct => ct.key === activeChartType);
                    const nextChartIndex = (currentChartIndex + 1) % chartTypes.length;
                    handleChartTypeClick(chartTypes[nextChartIndex].key);
                    break;
                case 'v':
                    event.preventDefault();
                    if (onVolumeToggle) onVolumeToggle();
                    break;
                case 'i':
                    event.preventDefault();
                    setIndicatorDropdownOpen(!indicatorDropdownOpen);
                    break;
                default:
                    break;
            }
            return;
        }

        // Handle arrow key navigation within groups
        const focusedElement = document.activeElement;
        const container = containerRef.current;
        if (!container || !container.contains(focusedElement)) return;

        const focusableElements = container.querySelectorAll(
            'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const currentIndex = Array.from(focusableElements).indexOf(focusedElement);

        switch (key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
                focusableElements[prevIndex]?.focus();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                event.preventDefault();
                const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
                focusableElements[nextIndex]?.focus();
                break;
            case 'Home':
                event.preventDefault();
                focusableElements[0]?.focus();
                break;
            case 'End':
                event.preventDefault();
                focusableElements[focusableElements.length - 1]?.focus();
                break;
            case 'Escape':
                event.preventDefault();
                setIndicatorDropdownOpen(false);
                focusedElement.blur();
                break;
            default:
                break;
        }
    };

    // Add keyboard event listener
    React.useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('keydown', handleKeyDown);
            return () => container.removeEventListener('keydown', handleKeyDown);
        }
    }, [activeTimeframe, activeChartType, indicatorDropdownOpen, timeframes, chartTypes]);

    return (
        <ChartControlsContainer
            ref={(node) => {
                containerRef.current = node;
                if (ref) {
                    if (typeof ref === 'function') ref(node);
                    else ref.current = node;
                }
            }}
            vertical={vertical}
            floating={floating}
            width={width}
            className={className}
            theme={theme}
            data-testid={testId}
            role="toolbar"
            aria-label="Chart controls"
            tabIndex={0}
            {...animationPresets.fadeIn}
            {...props}
        >
            {/* Timeframe Selector */}
            <ControlGroup theme={theme} vertical={vertical}>
                <Label size="xs" color="secondary" weight="medium">
                    Timeframe
                </Label>
                <TimeframeSelector theme={theme}>
                    {timeframes.map((timeframe, index) => (
                        <TimeframeButton
                            key={timeframe}
                            active={activeTimeframe === timeframe}
                            onClick={() => handleTimeframeClick(timeframe)}
                            theme={theme}
                            role="button"
                            aria-pressed={activeTimeframe === timeframe}
                            aria-label={`Set timeframe to ${timeframe}`}
                            tabIndex={activeTimeframe === timeframe ? 0 : -1}
                            {...hoverEffects.buttonSecondary}
                            {...staggerAnimations.item}
                            transition={{ delay: index * 0.05 }}
                        >
                            {timeframe}
                        </TimeframeButton>
                    ))}
                </TimeframeSelector>
            </ControlGroup>

            {/* Chart Type Selector */}
            <ControlGroup theme={theme} vertical={vertical}>
                <Label size="xs" color="secondary" weight="medium">
                    Chart Type
                </Label>
                <ChartTypeSelector theme={theme}>
                    {chartTypes.map((chartType, index) => (
                        <ChartTypeButton
                            key={chartType.key}
                            active={activeChartType === chartType.key}
                            onClick={() => handleChartTypeClick(chartType.key)}
                            title={chartType.label}
                            theme={theme}
                            role="button"
                            aria-pressed={activeChartType === chartType.key}
                            aria-label={`Set chart type to ${chartType.label}`}
                            tabIndex={activeChartType === chartType.key ? 0 : -1}
                            {...hoverEffects.buttonSecondary}
                            {...staggerAnimations.item}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Icon name={chartType.icon} size="sm" />
                        </ChartTypeButton>
                    ))}
                </ChartTypeSelector>
            </ControlGroup>

            {/* Indicators */}
            {indicators.length > 0 && (
                <ControlGroup theme={theme} vertical={vertical}>
                    <Label size="xs" color="secondary" weight="medium">
                        Indicators
                    </Label>
                    <IndicatorDropdown>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIndicatorDropdownOpen(!indicatorDropdownOpen)}
                            rightIcon={<Icon name={indicatorDropdownOpen ? 'chevronUp' : 'chevronDown'} />}
                        >
                            Indicators ({activeIndicators.length})
                        </Button>

                        <AnimatePresence>
                            {indicatorDropdownOpen && (
                                <DropdownContent
                                    theme={theme}
                                    {...animationPresets.slideDown}
                                    onMouseLeave={() => setIndicatorDropdownOpen(false)}
                                >
                                    {indicators.map((indicator, index) => (
                                        <DropdownItem
                                            key={indicator.key}
                                            onClick={() => handleIndicatorClick(indicator)}
                                            theme={theme}
                                            {...staggerAnimations.item}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Icon
                                                name={activeIndicators.includes(indicator.key) ? 'check' : 'plus'}
                                                size="xs"
                                                color={activeIndicators.includes(indicator.key) ? 'success' : 'secondary'}
                                            />
                                            {indicator.label}
                                        </DropdownItem>
                                    ))}
                                </DropdownContent>
                            )}
                        </AnimatePresence>
                    </IndicatorDropdown>
                </ControlGroup>
            )}

            {/* Volume Controls */}
            <ControlGroup theme={theme} vertical={vertical}>
                <Label size="xs" color="secondary" weight="medium">
                    Volume
                </Label>
                <VolumeControls theme={theme}>
                    <Button
                        variant={showVolume ? 'primary' : 'outline'}
                        size="sm"
                        onClick={onVolumeToggle}
                        leftIcon={<Icon name="volume" />}
                    >
                        {showVolume ? 'Hide' : 'Show'}
                    </Button>
                </VolumeControls>
            </ControlGroup>

            {/* Drawing Tools */}
            {drawingTools.length > 0 && (
                <ControlGroup theme={theme} vertical={vertical}>
                    <Label size="xs" color="secondary" weight="medium">
                        Drawing
                    </Label>
                    <DrawingTools theme={theme}>
                        {drawingTools.map((tool, index) => (
                            <ChartTypeButton
                                key={tool.key}
                                active={activeDrawingTool === tool.key}
                                onClick={() => handleDrawingToolClick(tool.key)}
                                title={tool.label}
                                theme={theme}
                                {...hoverEffects.buttonSecondary}
                                {...staggerAnimations.item}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Icon name={tool.icon} size="sm" />
                            </ChartTypeButton>
                        ))}
                    </DrawingTools>
                </ControlGroup>
            )}
        </ChartControlsContainer>
    );
});

ChartControls.displayName = 'ChartControls';

export default ChartControls;