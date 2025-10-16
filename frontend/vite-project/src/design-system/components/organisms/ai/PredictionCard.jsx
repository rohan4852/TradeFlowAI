import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTheme } from '../../../ThemeProvider';
import { Button, Icon } from '../../atoms';
import { Card } from '../../molecules';
import { glassmorphism, getTradingColor, formatPercentage, animations } from '../../../index';

const PredictionCardContainer = styled(motion.div)`
  ${({ theme }) => glassmorphism(theme, 'medium')};
  padding: ${({ theme }) => theme.spacing[6]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  position: relative;
  overflow: hidden;
`;

const PredictionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const PredictionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const PredictionSymbol = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.color.text.secondary};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
`;

const ConfidenceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ConfidenceBar = styled.div`
  width: 80px;
  height: 8px;
  background: ${({ theme }) => theme.color.neutral[200]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  position: relative;
`;

const ConfidenceFill = styled(motion.div)`
  height: 100%;
  background: ${({ confidence, theme }) => {
        if (confidence >= 80) return theme.color.semantic.success;
        if (confidence >= 60) return theme.color.semantic.warning;
        return theme.color.semantic.error;
    }};
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const ConfidenceText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ confidence, theme }) => {
        if (confidence >= 80) return theme.color.semantic.success;
        if (confidence >= 60) return theme.color.semantic.warning;
        return theme.color.semantic.error;
    }};
`;

const PredictionContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const PredictionMetric = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const MetricLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.color.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MetricValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ value, theme }) => getTradingColor(value, theme)};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
`;

const PredictionDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.color.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const PredictionFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.color.border.primary};
`;

const TimestampContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.color.text.tertiary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const StatusIndicator = styled(motion.div)`
  position: absolute;
  top: ${({ theme }) => theme.spacing[4]};
  right: ${({ theme }) => theme.spacing[4]};
  width: 12px;
  height: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ status, theme }) => {
        switch (status) {
            case 'active': return theme.color.semantic.success;
            case 'expired': return theme.color.neutral[400];
            case 'processing': return theme.color.semantic.warning;
            default: return theme.color.neutral[400];
        }
    }};
`;

const PulseAnimation = {
    scale: [1, 1.2, 1],
    transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
    }
};

export const PredictionCard = ({
    prediction,
    onAccept,
    onDismiss,
    onViewDetails,
    className,
    ...props
}) => {
    const theme = useTheme();

    const {
        id,
        symbol,
        type = 'price_target',
        title,
        description,
        confidence,
        targetPrice,
        currentPrice,
        expectedReturn,
        timeframe,
        timestamp,
        status = 'active',
        reasoning,
        accuracy
    } = prediction;

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'price_target': return 'target';
            case 'trend_reversal': return 'trending-up';
            case 'volatility': return 'activity';
            case 'support_resistance': return 'bar-chart-2';
            default: return 'zap';
        }
    };

    return (
        <PredictionCardContainer
            className={className}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animations.slideUp}
            layout
            {...props}
        >
            <StatusIndicator
                status={status}
                animate={status === 'processing' ? PulseAnimation : {}}
            />

            <PredictionHeader>
                <div>
                    <PredictionTitle>{title}</PredictionTitle>
                    <PredictionSymbol>{symbol}</PredictionSymbol>
                </div>

                <ConfidenceContainer>
                    <ConfidenceBar>
                        <ConfidenceFill
                            confidence={confidence}
                            initial={{ width: 0 }}
                            animate={{ width: `${confidence}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </ConfidenceBar>
                    <ConfidenceText confidence={confidence}>
                        {confidence}%
                    </ConfidenceText>
                </ConfidenceContainer>
            </PredictionHeader>

            <PredictionContent>
                <PredictionMetric>
                    <MetricLabel>Target Price</MetricLabel>
                    <MetricValue value={targetPrice - currentPrice}>
                        ${targetPrice?.toFixed(2)}
                    </MetricValue>
                </PredictionMetric>

                <PredictionMetric>
                    <MetricLabel>Expected Return</MetricLabel>
                    <MetricValue value={expectedReturn}>
                        {formatPercentage(expectedReturn)}
                    </MetricValue>
                </PredictionMetric>

                <PredictionMetric>
                    <MetricLabel>Timeframe</MetricLabel>
                    <MetricValue value={0}>
                        {timeframe}
                    </MetricValue>
                </PredictionMetric>

                {accuracy && (
                    <PredictionMetric>
                        <MetricLabel>Historical Accuracy</MetricLabel>
                        <MetricValue value={accuracy - 50}>
                            {accuracy}%
                        </MetricValue>
                    </PredictionMetric>
                )}
            </PredictionContent>

            <PredictionDescription>
                {description}
            </PredictionDescription>

            <PredictionFooter>
                <TimestampContainer>
                    <Icon name={getTypeIcon(type)} size="sm" />
                    <span>{formatTimestamp(timestamp)}</span>
                </TimestampContainer>

                <ActionButtons>
                    {onViewDetails && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(prediction)}
                        >
                            Details
                        </Button>
                    )}
                    {onDismiss && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDismiss(id)}
                        >
                            Dismiss
                        </Button>
                    )}
                    {onAccept && status === 'active' && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onAccept(prediction)}
                        >
                            Accept
                        </Button>
                    )}
                </ActionButtons>
            </PredictionFooter>
        </PredictionCardContainer>
    );
};

export default PredictionCard;