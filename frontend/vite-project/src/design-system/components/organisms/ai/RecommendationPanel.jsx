import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../ThemeProvider';
import { Button, Icon } from '../../atoms';
import { ConfidenceIndicator } from '../../molecules/ai/ConfidenceIndicator';
import { glassmorphism, getTradingColor, formatPercentage, animations } from '../../../index';

const PanelContainer = styled.div`
  ${({ theme }) => glassmorphism(theme, 'medium')};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
`;

const PanelHeader = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.primary};
  background: ${({ theme }) => theme.color.background.secondary};
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const PanelTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0;
`;

const RefreshButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const HeaderStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.color.text.primary};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.color.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const PanelContent = styled.div`
  max-height: 600px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.color.neutral[100]};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.color.neutral[300]};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }
`;

const RecommendationItem = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.primary};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.easeInOut};
  
  &:hover {
    background: ${({ theme }) => theme.color.background.secondary};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const RecommendationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const RecommendationInfo = styled.div`
  flex: 1;
`;

const RecommendationTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const RecommendationSymbol = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.color.text.secondary};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
`;

const RecommendationMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const PriorityBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background: ${({ priority, theme }) => {
    switch (priority) {
      case 'high': return theme.color.semantic.error;
      case 'medium': return theme.color.semantic.warning;
      case 'low': return theme.color.neutral[400];
      default: return theme.color.primary[500];
    }
  }};
  color: ${({ theme }) => theme.color.text.inverse};
`;

const ExpirationTimer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ urgent, theme }) => urgent ? theme.color.semantic.error : theme.color.text.tertiary};
`;

const RecommendationContent = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const RecommendationDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.color.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const RecommendationMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: ${({ theme }) => theme.spacing[3]};
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

const RecommendationActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.color.text.tertiary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const ProgressBar = styled.div`
  width: 60px;
  height: 4px;
  background: ${({ theme }) => theme.color.neutral[200]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${({ theme }) => theme.color.primary[500]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing[12]} ${({ theme }) => theme.spacing[6]};
  text-align: center;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const EmptyStateIcon = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.color.text.tertiary};
`;

const EmptyStateTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const EmptyStateDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.color.text.secondary};
  margin: 0;
`;

export const RecommendationPanel = ({
  recommendations = [],
  isLoading = false,
  onRefresh,
  onAcceptRecommendation,
  onDismissRecommendation,
  onViewDetails,
  analysisProgress,
  className,
  ...props
}) => {
  const theme = useTheme();
  const [sortBy, setSortBy] = useState('priority');

  // Sort recommendations by priority and relevance
  const sortedRecommendations = useMemo(() => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };

    return [...recommendations].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'confidence':
          return b.confidence - a.confidence;
        case 'expiration':
          return new Date(a.expiresAt) - new Date(b.expiresAt);
        case 'potential':
          return (b.potentialReturn || 0) - (a.potentialReturn || 0);
        default:
          return 0;
      }
    });
  }, [recommendations, sortBy]);

  // Calculate panel statistics
  const stats = useMemo(() => {
    const total = recommendations.length;
    const highPriority = recommendations.filter(r => r.priority === 'high').length;
    const avgConfidence = recommendations.reduce((sum, r) => sum + r.confidence, 0) / total || 0;
    const avgPotential = recommendations.reduce((sum, r) => sum + (r.potentialReturn || 0), 0) / total || 0;

    return {
      total,
      highPriority,
      avgConfidence: Math.round(avgConfidence),
      avgPotential
    };
  }, [recommendations]);

  const formatTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry - now;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMs <= 0) return 'Expired';
    if (diffMins < 60) return `${diffMins}m left`;
    if (diffHours < 24) return `${diffHours}h left`;
    return `${Math.floor(diffHours / 24)}d left`;
  };

  const isUrgent = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry - now;
    return diffMs <= 3600000; // 1 hour or less
  };

  return (
    <PanelContainer className={className} {...props}>
      <PanelHeader>
        <HeaderTop>
          <PanelTitle>AI Recommendations</PanelTitle>
          <RefreshButton
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <Icon name={isLoading ? 'loader' : 'refresh-cw'} size="sm" />
            Refresh
          </RefreshButton>
        </HeaderTop>

        <HeaderStats>
          <StatItem>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue style={{ color: theme.color.semantic.error }}>
              {stats.highPriority}
            </StatValue>
            <StatLabel>High Priority</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.avgConfidence}%</StatValue>
            <StatLabel>Avg Confidence</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue style={{ color: getTradingColor(stats.avgPotential, theme) }}>
              {formatPercentage(stats.avgPotential)}
            </StatValue>
            <StatLabel>Avg Potential</StatLabel>
          </StatItem>
        </HeaderStats>
      </PanelHeader>

      <PanelContent>
        {analysisProgress && (
          <RecommendationItem>
            <ProgressIndicator>
              <Icon name="zap" size="sm" />
              <span>AI Analysis in progress...</span>
              <ProgressBar>
                <ProgressFill
                  initial={{ width: 0 }}
                  animate={{ width: `${analysisProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </ProgressBar>
              <span>{analysisProgress}%</span>
            </ProgressIndicator>
          </RecommendationItem>
        )}

        <AnimatePresence>
          {sortedRecommendations.length === 0 && !isLoading && !analysisProgress ? (
            <EmptyState>
              <EmptyStateIcon>
                <Icon name="brain" size="xl" />
              </EmptyStateIcon>
              <EmptyStateTitle>No Recommendations Available</EmptyStateTitle>
              <EmptyStateDescription>
                AI analysis will generate recommendations based on market conditions and your portfolio.
              </EmptyStateDescription>
            </EmptyState>
          ) : (
            sortedRecommendations.map((recommendation, index) => (
              <RecommendationItem
                key={recommendation.id}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={animations.slideUp}
                transition={{ delay: index * 0.05 }}
              >
                <RecommendationHeader>
                  <RecommendationInfo>
                    <RecommendationTitle>{recommendation.title}</RecommendationTitle>
                    <RecommendationSymbol>{recommendation.symbol}</RecommendationSymbol>
                  </RecommendationInfo>

                  <RecommendationMeta>
                    <PriorityBadge priority={recommendation.priority}>
                      <Icon name="alert-triangle" size="xs" />
                      {recommendation.priority}
                    </PriorityBadge>

                    {recommendation.expiresAt && (
                      <ExpirationTimer urgent={isUrgent(recommendation.expiresAt)}>
                        <Icon name="clock" size="xs" />
                        {formatTimeRemaining(recommendation.expiresAt)}
                      </ExpirationTimer>
                    )}
                  </RecommendationMeta>
                </RecommendationHeader>

                <RecommendationContent>
                  <RecommendationDescription>
                    {recommendation.description}
                  </RecommendationDescription>

                  <RecommendationMetrics>
                    <MetricItem>
                      <MetricLabel>Action</MetricLabel>
                      <MetricValue value={recommendation.action === 'buy' ? 1 : -1}>
                        {recommendation.action?.toUpperCase()}
                      </MetricValue>
                    </MetricItem>

                    <MetricItem>
                      <MetricLabel>Target</MetricLabel>
                      <MetricValue value={0}>
                        ${recommendation.targetPrice?.toFixed(2)}
                      </MetricValue>
                    </MetricItem>

                    <MetricItem>
                      <MetricLabel>Potential</MetricLabel>
                      <MetricValue value={recommendation.potentialReturn}>
                        {formatPercentage(recommendation.potentialReturn)}
                      </MetricValue>
                    </MetricItem>

                    <MetricItem>
                      <MetricLabel>Risk Level</MetricLabel>
                      <MetricValue value={recommendation.riskLevel === 'high' ? -1 : recommendation.riskLevel === 'low' ? 1 : 0}>
                        {recommendation.riskLevel}
                      </MetricValue>
                    </MetricItem>
                  </RecommendationMetrics>

                  <ConfidenceIndicator
                    confidence={recommendation.confidence}
                    size="sm"
                    showLabel={false}
                    animated={false}
                  />
                </RecommendationContent>

                <RecommendationActions>
                  <ActionButtons>
                    {onViewDetails && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(recommendation)}
                      >
                        Details
                      </Button>
                    )}
                    {onDismissRecommendation && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDismissRecommendation(recommendation.id)}
                      >
                        Dismiss
                      </Button>
                    )}
                    {onAcceptRecommendation && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onAcceptRecommendation(recommendation)}
                      >
                        Accept
                      </Button>
                    )}
                  </ActionButtons>
                </RecommendationActions>
              </RecommendationItem>
            ))
          )}
        </AnimatePresence>
      </PanelContent>
    </PanelContainer>
  );
};

export default RecommendationPanel;