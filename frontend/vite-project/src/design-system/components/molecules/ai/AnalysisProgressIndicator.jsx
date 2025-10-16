import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../ThemeProvider';
import { Icon } from '../../atoms';
import { glassmorphism, animations } from '../../../index';

const pulse = keyframes`
  0% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0.6; transform: scale(1); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const ProgressContainer = styled(motion.div)`
  ${({ theme }) => glassmorphism(theme, 'light')};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const ProgressHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const ProgressIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.color.primary[100]};
  color: ${({ theme }) => theme.color.primary[600]};
  animation: ${pulse} 2s ease-in-out infinite;

  &.rotating {
    animation: ${rotate} 1s linear infinite;
  }
`;

const ProgressInfo = styled.div`
  flex: 1;
`;

const ProgressTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const ProgressDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.color.text.secondary};
  margin: 0;
`;

const ProgressValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.color.primary[600]};
`;

const ProgressBarContainer = styled.div`
  position: relative;
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.color.neutral[200]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const ProgressBarFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.color.primary[400]},
    ${({ theme }) => theme.color.primary[600]}
  );
  border-radius: ${({ theme }) => theme.borderRadius.full};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 100%
    );
    animation: ${shimmer} 2s infinite;
  }
`;

const StagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const StageItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ active, completed, theme }) => {
    if (completed) return theme.color.semantic.success + '20';
    if (active) return theme.color.primary[100];
    return 'transparent';
  }};
`;

const StageIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ active, completed, theme }) => {
    if (completed) return theme.color.semantic.success;
    if (active) return theme.color.primary[500];
    return theme.color.neutral[300];
  }};
  color: ${({ theme }) => theme.color.text.inverse};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};

  &.active {
    animation: ${pulse} 1.5s ease-in-out infinite;
  }
`;

const StageText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ active, completed, theme }) => {
    if (completed) return theme.color.semantic.success;
    if (active) return theme.color.text.primary;
    return theme.color.text.secondary;
  }};
  font-weight: ${({ active, theme }) =>
    active ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal
  };
`;

const EstimatedTime = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.color.text.tertiary};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const CancelButton = styled.button`
  background: none;
  border: 1px solid ${({ theme }) => theme.color.border.primary};
  color: ${({ theme }) => theme.color.text.secondary};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.easeInOut};

  &:hover {
    background: ${({ theme }) => theme.color.background.secondary};
    border-color: ${({ theme }) => theme.color.border.secondary};
  }
`;

const DEFAULT_STAGES = [
  { id: 'data', label: 'Collecting market data', icon: 'database' },
  { id: 'analysis', label: 'Analyzing patterns', icon: 'trending-up' },
  { id: 'ml', label: 'Running ML models', icon: 'cpu' },
  { id: 'recommendations', label: 'Generating recommendations', icon: 'lightbulb' },
  { id: 'validation', label: 'Validating results', icon: 'check-circle' }
];

export const AnalysisProgressIndicator = ({
  progress = 0,
  title = 'AI Analysis in Progress',
  description = 'Analyzing market conditions and generating recommendations...',
  stages = DEFAULT_STAGES,
  currentStage = null,
  estimatedTimeRemaining = null,
  onCancel,
  showStages = true,
  showEstimatedTime = true,
  animated = true,
  className,
  ...props
}) => {
  const theme = useTheme();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  // Auto-advance stages based on progress if no currentStage provided
  useEffect(() => {
    if (!currentStage && stages.length > 0) {
      const stageIndex = Math.floor((progress / 100) * stages.length);
      setCurrentStageIndex(Math.min(stageIndex, stages.length - 1));
    }
  }, [progress, currentStage, stages.length]);

  const getCurrentStageIndex = () => {
    if (currentStage) {
      return stages.findIndex(stage => stage.id === currentStage);
    }
    return currentStageIndex;
  };

  const formatEstimatedTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const getStageIcon = (stage, index) => {
    const currentIndex = getCurrentStageIndex();
    const isCompleted = index < currentIndex || (index === currentIndex && progress === 100);
    const isActive = index === currentIndex && progress < 100;

    if (isCompleted) return 'check';
    if (isActive) return stage.icon;
    return stage.icon;
  };

  return (
    <AnimatePresence>
      <ProgressContainer
        className={className}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={animations.slideDown}
        {...props}
      >
        <ProgressHeader>
          <ProgressIcon className={animated && progress < 100 ? 'rotating' : ''}>
            <Icon name={progress === 100 ? 'check' : 'zap'} size="sm" />
          </ProgressIcon>

          <ProgressInfo>
            <ProgressTitle>{title}</ProgressTitle>
            <ProgressDescription>{description}</ProgressDescription>
          </ProgressInfo>

          <ProgressValue>{progress}%</ProgressValue>
        </ProgressHeader>

        <ProgressBarContainer>
          <ProgressBarFill
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: animated ? 0.5 : 0, ease: "easeOut" }}
          />
        </ProgressBarContainer>

        {showStages && stages.length > 0 && (
          <StagesList>
            {stages.map((stage, index) => {
              const currentIndex = getCurrentStageIndex();
              const isCompleted = index < currentIndex || (index === currentIndex && progress === 100);
              const isActive = index === currentIndex && progress < 100;

              return (
                <StageItem
                  key={stage.id}
                  active={isActive}
                  completed={isCompleted}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <StageIcon
                    active={isActive}
                    completed={isCompleted}
                    className={isActive ? 'active' : ''}
                  >
                    <Icon name={getStageIcon(stage, index)} size="xs" />
                  </StageIcon>
                  <StageText active={isActive} completed={isCompleted}>
                    {stage.label}
                  </StageText>
                </StageItem>
              );
            })}
          </StagesList>
        )}

        {(showEstimatedTime || onCancel) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {showEstimatedTime && estimatedTimeRemaining && (
              <EstimatedTime>
                <Icon name="clock" size="xs" />
                <span>Est. {formatEstimatedTime(estimatedTimeRemaining)} remaining</span>
              </EstimatedTime>
            )}

            {onCancel && progress < 100 && (
              <CancelButton onClick={onCancel}>
                Cancel
              </CancelButton>
            )}
          </div>
        )}
      </ProgressContainer>
    </AnimatePresence>
  );
};

export default AnalysisProgressIndicator;