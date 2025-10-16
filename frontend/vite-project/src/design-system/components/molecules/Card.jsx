import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeProvider';
import { Button, Icon, Label } from '../atoms';
import {
    createGlassmorphism,
    tradingGlassPresets,
    animationPresets,
    hoverEffects,
    feedbackEffects
} from '../../effects';

// Card container
const CardContainer = styled(motion.div)`
  ${props => tradingGlassPresets.card(props.theme)}
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: all ${props => props.theme.animation.duration.normal} ${props => props.theme.animation.easing.easeInOut};

  ${props => props.interactive && css`
    cursor: pointer;
  `}

  ${props => props.variant === 'elevated' && css`
    box-shadow: ${props.theme.shadows.lg};
    
    &:hover {
      box-shadow: ${props.theme.shadows.xl};
      transform: translateY(-2px);
    }
  `}

  ${props => props.variant === 'outlined' && css`
    border: 2px solid ${props.theme.color.border.primary};
    background: ${props.theme.color.background.primary};
  `}

  ${props => props.variant === 'filled' && css`
    background: ${props.theme.color.background.secondary};
    border: 1px solid ${props.theme.color.border.primary};
  `}

  ${props => props.size === 'sm' && css`
    padding: ${props.theme.spacing[3]};
  `}

  ${props => props.size === 'md' && css`
    padding: ${props.theme.spacing[4]};
  `}

  ${props => props.size === 'lg' && css`
    padding: ${props.theme.spacing[6]};
  `}

  ${props => props.status && css`
    border-left: 4px solid ${props.status === 'success' ? props.theme.color.semantic.success :
            props.status === 'warning' ? props.theme.color.semantic.warning :
                props.status === 'error' ? props.theme.color.semantic.error :
                    props.status === 'info' ? props.theme.color.semantic.info :
                        props.theme.color.primary[500]
        };
  `}
`;

// Card header
const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[3]};
  padding-bottom: ${props => props.theme.spacing[3]};
  border-bottom: 1px solid ${props => props.theme.color.border.primary};

  ${props => props.noBorder && css`
    border-bottom: none;
    padding-bottom: 0;
  `}
`;

// Card title
const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.color.text.primary};
`;

// Card subtitle
const CardSubtitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.color.text.secondary};
  margin-top: ${props => props.theme.spacing[1]};
`;

// Card actions
const CardActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  align-items: center;
`;

// Card content
const CardContent = styled.div`
  flex: 1;
  color: ${props => props.theme.color.text.primary};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};

  ${props => props.scrollable && css`
    overflow-y: auto;
    max-height: ${props.maxHeight || '300px'};
  `}
`;

// Card footer
const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${props => props.theme.spacing[4]};
  padding-top: ${props => props.theme.spacing[3]};
  border-top: 1px solid ${props => props.theme.color.border.primary};

  ${props => props.noBorder && css`
    border-top: none;
    padding-top: 0;
  `}
`;

// Metric card specific styles
const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-family: ${props => props.theme.typography.fontFamily.monospace};
  color: ${props =>
        props.trend === 'up' ? props.theme.color.trading.bull :
            props.trend === 'down' ? props.theme.color.trading.bear :
                props.theme.color.text.primary
    };
  line-height: 1;
`;

const MetricChange = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props =>
        props.trend === 'up' ? props.theme.color.trading.bull :
            props.trend === 'down' ? props.theme.color.trading.bear :
                props.theme.color.text.secondary
    };
  margin-top: ${props => props.theme.spacing[1]};
`;

// Card component
const Card = forwardRef(({
    children,
    title,
    subtitle,
    icon,
    actions,
    footer,
    variant = 'glass',
    size = 'md',
    status,
    interactive = false,
    scrollable = false,
    maxHeight,
    onClick,
    className,
    testId,
    ...props
}, ref) => {
    const { theme } = useTheme();

    const cardProps = {
        ref,
        variant,
        size,
        status,
        interactive,
        onClick,
        className,
        theme,
        'data-testid': testId,
        ...animationPresets.fadeIn,
        ...(interactive ? hoverEffects.cardPronounced : {}),
        ...props,
    };

    return (
        <CardContainer {...cardProps}>
            {(title || subtitle || icon || actions) && (
                <CardHeader theme={theme} noBorder={!title && !subtitle}>
                    <div>
                        {title && (
                            <CardTitle theme={theme}>
                                {icon && <Icon name={icon} size="sm" color="primary" />}
                                {title}
                            </CardTitle>
                        )}
                        {subtitle && (
                            <CardSubtitle theme={theme}>
                                {subtitle}
                            </CardSubtitle>
                        )}
                    </div>
                    {actions && (
                        <CardActions theme={theme}>
                            {actions}
                        </CardActions>
                    )}
                </CardHeader>
            )}

            <CardContent
                theme={theme}
                scrollable={scrollable}
                maxHeight={maxHeight}
            >
                {children}
            </CardContent>

            {footer && (
                <CardFooter theme={theme}>
                    {footer}
                </CardFooter>
            )}
        </CardContainer>
    );
});

Card.displayName = 'Card';

// Metric Card component for trading metrics
export const MetricCard = forwardRef(({
    title,
    value,
    change,
    changePercent,
    trend,
    icon,
    subtitle,
    actions,
    loading = false,
    animated = true,
    className,
    testId,
    ...props
}, ref) => {
    const { theme } = useTheme();

    const getTrendIcon = () => {
        if (trend === 'up') return 'trendUp';
        if (trend === 'down') return 'trendDown';
        return 'minus';
    };

    const animationProps = animated ? {
        ...(trend === 'up' ? feedbackEffects.success :
            trend === 'down' ? feedbackEffects.error : {})
    } : {};

    return (
        <Card
            ref={ref}
            title={title}
            subtitle={subtitle}
            icon={icon}
            actions={actions}
            interactive
            className={className}
            testId={testId}
            {...props}
        >
            <motion.div {...animationProps}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                        <Icon name="loading" size="lg" />
                        <Label color="secondary">Loading...</Label>
                    </div>
                ) : (
                    <>
                        <MetricValue theme={theme} trend={trend}>
                            {value}
                        </MetricValue>
                        {(change !== undefined || changePercent !== undefined) && (
                            <MetricChange theme={theme} trend={trend}>
                                <Icon name={getTrendIcon()} size="xs" />
                                {change && <span>{change > 0 ? '+' : ''}{change}</span>}
                                {changePercent && <span>({changePercent > 0 ? '+' : ''}{changePercent}%)</span>}
                            </MetricChange>
                        )}
                    </>
                )}
            </motion.div>
        </Card>
    );
});

MetricCard.displayName = 'MetricCard';

// Info Card component
export const InfoCard = forwardRef(({
    type = 'info',
    title,
    message,
    actions,
    dismissible = false,
    onDismiss,
    className,
    testId,
    ...props
}, ref) => {
    const { theme } = useTheme();

    const getTypeConfig = () => {
        const configs = {
            info: {
                icon: 'info',
                color: 'info',
                status: 'info',
            },
            success: {
                icon: 'check',
                color: 'success',
                status: 'success',
            },
            warning: {
                icon: 'alert',
                color: 'warning',
                status: 'warning',
            },
            error: {
                icon: 'close',
                color: 'error',
                status: 'error',
            },
        };
        return configs[type] || configs.info;
    };

    const config = getTypeConfig();

    const cardActions = (
        <CardActions theme={theme}>
            {actions}
            {dismissible && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDismiss}
                    leftIcon={<Icon name="close" />}
                />
            )}
        </CardActions>
    );

    return (
        <Card
            ref={ref}
            title={title}
            icon={config.icon}
            actions={cardActions}
            status={config.status}
            variant="outlined"
            className={className}
            testId={testId}
            {...props}
        >
            <Label color={config.color}>
                {message}
            </Label>
        </Card>
    );
});

InfoCard.displayName = 'InfoCard';

// Trading Card component
export const TradingCard = forwardRef(({
    symbol,
    price,
    change,
    changePercent,
    volume,
    high,
    low,
    marketCap,
    onClick,
    loading = false,
    className,
    testId,
    ...props
}, ref) => {
    const { theme } = useTheme();
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

    const formatValue = (value, prefix = '', suffix = '') => {
        if (value === undefined || value === null) return '--';
        return `${prefix}${typeof value === 'number' ? value.toLocaleString() : value}${suffix}`;
    };

    return (
        <Card
            ref={ref}
            interactive
            onClick={onClick}
            className={className}
            testId={testId}
            {...hoverEffects.cardPronounced}
            {...props}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing[4] }}>
                <div>
                    <Label size="lg" weight="bold" color="primary">
                        {symbol}
                    </Label>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2], marginTop: theme.spacing[1] }}>
                            <Icon name="loading" size="sm" />
                            <Label size="sm" color="secondary">Loading...</Label>
                        </div>
                    ) : (
                        <MetricValue theme={theme} trend={trend} style={{ fontSize: theme.typography.fontSize.xl }}>
                            ${formatValue(price)}
                        </MetricValue>
                    )}
                </div>
                <Icon name="candlestick" color="primary" size="lg" />
            </div>

            {!loading && (
                <>
                    <MetricChange theme={theme} trend={trend}>
                        <Icon name={trend === 'up' ? 'trendUp' : trend === 'down' ? 'trendDown' : 'minus'} size="xs" />
                        <span>{formatValue(change, change > 0 ? '+$' : '$')}</span>
                        <span>({formatValue(changePercent, change > 0 ? '+' : '', '%')})</span>
                    </MetricChange>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: theme.spacing[3],
                        marginTop: theme.spacing[4],
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.color.text.secondary,
                    }}>
                        <div>
                            <Label size="xs" color="tertiary">Volume</Label>
                            <Label size="sm" weight="medium">{formatValue(volume)}</Label>
                        </div>
                        <div>
                            <Label size="xs" color="tertiary">Market Cap</Label>
                            <Label size="sm" weight="medium">{formatValue(marketCap, '$')}</Label>
                        </div>
                        <div>
                            <Label size="xs" color="tertiary">High</Label>
                            <Label size="sm" weight="medium">{formatValue(high, '$')}</Label>
                        </div>
                        <div>
                            <Label size="xs" color="tertiary">Low</Label>
                            <Label size="sm" weight="medium">{formatValue(low, '$')}</Label>
                        </div>
                    </div>
                </>
            )}
        </Card>
    );
});

TradingCard.displayName = 'TradingCard';

// Stats Card component
export const StatsCard = forwardRef(({
    stats = [],
    title,
    icon,
    actions,
    className,
    testId,
    ...props
}, ref) => {
    const { theme } = useTheme();

    return (
        <Card
            ref={ref}
            title={title}
            icon={icon}
            actions={actions}
            className={className}
            testId={testId}
            {...props}
        >
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, 1fr)`,
                gap: theme.spacing[4]
            }}>
                {stats.map((stat, index) => (
                    <div key={index} style={{ textAlign: 'center' }}>
                        <MetricValue
                            theme={theme}
                            trend={stat.trend}
                            style={{ fontSize: theme.typography.fontSize.xl }}
                        >
                            {stat.value}
                        </MetricValue>
                        <Label size="sm" color="secondary" style={{ marginTop: theme.spacing[1] }}>
                            {stat.label}
                        </Label>
                        {stat.change && (
                            <MetricChange theme={theme} trend={stat.trend} style={{ justifyContent: 'center' }}>
                                <Icon name={stat.trend === 'up' ? 'trendUp' : stat.trend === 'down' ? 'trendDown' : 'minus'} size="xs" />
                                <span>{stat.change > 0 ? '+' : ''}{stat.change}%</span>
                            </MetricChange>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
});

StatsCard.displayName = 'StatsCard';

export default Card;