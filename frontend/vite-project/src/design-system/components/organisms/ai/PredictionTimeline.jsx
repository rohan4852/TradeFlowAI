import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../ThemeProvider';
import { Button, Icon } from '../../atoms';
import { ConfidenceIndicator } from '../../molecules/ai/ConfidenceIndicator';
import { glassmorphism, getTradingColor, formatPercentage, animations } from '../../../index';

const TimelineContainer = styled.div`
  ${({ theme }) => glassmorphism(theme, 'light')};
  padding: ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const TimelineTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0;
`;

const TimelineFilters = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: center;
`;

const FilterButton = styled(Button)`
  ${({ active, theme }) => active && `
    background: ${theme.color.primary[500]};
    color: ${theme.color.text.inverse};
  `}
`;

const TimelineTrack = styled.div`
  position: relative;
  padding: ${({ theme }) => theme.spacing[4]} 0;
`;

const TimelineLine = styled.div`
  position: absolute;
  left: 24px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: ${({ theme }) => theme.color.border.primary};
`;

const TimelineItem = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TimelineMarker = styled(motion.div)`
  position: relative;
  z-index: 1;
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ status, theme }) => {
        switch (status) {
            case 'correct': return theme.color.semantic.success;
            case 'incorrect': return theme.color.semantic.error;
            case 'pending': return theme.color.semantic.warning;
            case 'expired': return theme.color.neutral[400];
            default: return theme.color.primary[500];
        }
    }};
  color: ${({ theme }) => theme.color.text.inverse};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const TimelineContent = styled.div`
  flex: 1;
  ${({ theme }) => glassmorphism(theme, 'light')};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const PredictionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const PredictionInfo = styled.div`
  flex: 1;
`;

const PredictionTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
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

const PredictionMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const MetricLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.color.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MetricValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ value, theme }) => getTradingColor(value, theme)};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
`;

const AccuracyBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background: ${({ status, theme }) => {
        switch (status) {
            case 'correct': return theme.color.semantic.success;
            case 'incorrect': return theme.color.semantic.error;
            case 'pending': return theme.color.semantic.warning;
            default: return theme.color.neutral[400];
        }
    }};
  color: ${({ theme }) => theme.color.text.inverse};
`;

const TimelineTimestamp = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  color: ${({ theme }) => theme.color.text.tertiary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const AccuracyStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.color.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.color.text.primary};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.color.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const PredictionTimeline = ({
    predictions = [],
    showAccuracyStats = true,
    onPredictionClick,
    className,
    ...props
}) => {
    const theme = useTheme();
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');

    const filteredPredictions = useMemo(() => {
        let filtered = [...predictions];

        // Apply filter
        if (filter !== 'all') {
            filtered = filtered.filter(p => p.status === filter);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.timestamp) - new Date(a.timestamp);
                case 'accuracy':
                    return (b.accuracy || 0) - (a.accuracy || 0);
                case 'confidence':
                    return b.confidence - a.confidence;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [predictions, filter, sortBy]);

    const accuracyStats = useMemo(() => {
        const total = predictions.length;
        const correct = predictions.filter(p => p.status === 'correct').length;
        const incorrect = predictions.filter(p => p.status === 'incorrect').length;
        const pending = predictions.filter(p => p.status === 'pending').length;
        const avgAccuracy = predictions.reduce((sum, p) => sum + (p.accuracy || 0), 0) / total;

        return {
            total,
            correct,
            incorrect,
            pending,
            accuracy: total > 0 ? (correct / (correct + incorrect)) * 100 : 0,
            avgAccuracy: avgAccuracy || 0
        };
    }, [predictions]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'correct': return 'check';
            case 'incorrect': return 'x';
            case 'pending': return 'clock';
            case 'expired': return 'alert-circle';
            default: return 'zap';
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <TimelineContainer className={className} {...props}>
            <TimelineHeader>
                <TimelineTitle>Prediction History</TimelineTitle>

                <TimelineFilters>
                    <FilterButton
                        variant="ghost"
                        size="sm"
                        active={filter === 'all'}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </FilterButton>
                    <FilterButton
                        variant="ghost"
                        size="sm"
                        active={filter === 'correct'}
                        onClick={() => setFilter('correct')}
                    >
                        Correct
                    </FilterButton>
                    <FilterButton
                        variant="ghost"
                        size="sm"
                        active={filter === 'incorrect'}
                        onClick={() => setFilter('incorrect')}
                    >
                        Incorrect
                    </FilterButton>
                    <FilterButton
                        variant="ghost"
                        size="sm"
                        active={filter === 'pending'}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </FilterButton>
                </TimelineFilters>
            </TimelineHeader>

            {showAccuracyStats && (
                <AccuracyStats>
                    <StatItem>
                        <StatValue>{accuracyStats.total}</StatValue>
                        <StatLabel>Total</StatLabel>
                    </StatItem>
                    <StatItem>
                        <StatValue style={{ color: theme.color.semantic.success }}>
                            {accuracyStats.correct}
                        </StatValue>
                        <StatLabel>Correct</StatLabel>
                    </StatItem>
                    <StatItem>
                        <StatValue style={{ color: theme.color.semantic.error }}>
                            {accuracyStats.incorrect}
                        </StatValue>
                        <StatLabel>Incorrect</StatLabel>
                    </StatItem>
                    <StatItem>
                        <StatValue style={{ color: theme.color.semantic.warning }}>
                            {accuracyStats.pending}
                        </StatValue>
                        <StatLabel>Pending</StatLabel>
                    </StatItem>
                    <StatItem>
                        <StatValue style={{ color: theme.color.primary[500] }}>
                            {accuracyStats.accuracy.toFixed(1)}%
                        </StatValue>
                        <StatLabel>Accuracy</StatLabel>
                    </StatItem>
                </AccuracyStats>
            )}

            <TimelineTrack>
                <TimelineLine />

                <AnimatePresence>
                    {filteredPredictions.map((prediction, index) => (
                        <TimelineItem
                            key={prediction.id}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={animations.slideUp}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onPredictionClick?.(prediction)}
                            style={{ cursor: onPredictionClick ? 'pointer' : 'default' }}
                        >
                            <TimelineMarker
                                status={prediction.status}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Icon name={getStatusIcon(prediction.status)} size="sm" />
                            </TimelineMarker>

                            <TimelineContent>
                                <PredictionHeader>
                                    <PredictionInfo>
                                        <PredictionTitle>{prediction.title}</PredictionTitle>
                                        <PredictionSymbol>{prediction.symbol}</PredictionSymbol>
                                    </PredictionInfo>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: theme.spacing[2] }}>
                                        <ConfidenceIndicator
                                            confidence={prediction.confidence}
                                            variant="circular"
                                            size="sm"
                                            showLabel={false}
                                            animated={false}
                                        />
                                        <AccuracyBadge status={prediction.status}>
                                            {prediction.status === 'correct' && 'Correct'}
                                            {prediction.status === 'incorrect' && 'Incorrect'}
                                            {prediction.status === 'pending' && 'Pending'}
                                            {prediction.status === 'expired' && 'Expired'}
                                        </AccuracyBadge>
                                    </div>
                                </PredictionHeader>

                                <PredictionMetrics>
                                    <MetricItem>
                                        <MetricLabel>Target</MetricLabel>
                                        <MetricValue value={0}>
                                            ${prediction.targetPrice?.toFixed(2)}
                                        </MetricValue>
                                    </MetricItem>

                                    <MetricItem>
                                        <MetricLabel>Expected Return</MetricLabel>
                                        <MetricValue value={prediction.expectedReturn}>
                                            {formatPercentage(prediction.expectedReturn)}
                                        </MetricValue>
                                    </MetricItem>

                                    {prediction.actualReturn !== undefined && (
                                        <MetricItem>
                                            <MetricLabel>Actual Return</MetricLabel>
                                            <MetricValue value={prediction.actualReturn}>
                                                {formatPercentage(prediction.actualReturn)}
                                            </MetricValue>
                                        </MetricItem>
                                    )}

                                    <MetricItem>
                                        <MetricLabel>Timeframe</MetricLabel>
                                        <MetricValue value={0}>
                                            {prediction.timeframe}
                                        </MetricValue>
                                    </MetricItem>
                                </PredictionMetrics>

                                <TimelineTimestamp>
                                    <Icon name="calendar" size="xs" />
                                    <span>{formatTimestamp(prediction.timestamp)}</span>
                                </TimelineTimestamp>
                            </TimelineContent>
                        </TimelineItem>
                    ))}
                </AnimatePresence>
            </TimelineTrack>
        </TimelineContainer>
    );
};

export default PredictionTimeline;