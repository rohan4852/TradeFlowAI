import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTheme } from '../../../ThemeProvider';

const ConfidenceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ConfidenceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ConfidenceLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.color.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ConfidenceValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ confidence, theme }) => {
        if (confidence >= 80) return theme.color.semantic.success;
        if (confidence >= 60) return theme.color.semantic.warning;
        return theme.color.semantic.error;
    }};
`;

const ProgressBarContainer = styled.div`
  position: relative;
  width: 100%;
  height: ${({ size }) => {
        switch (size) {
            case 'sm': return '4px';
            case 'lg': return '12px';
            default: return '8px';
        }
    }};
  background: ${({ theme }) => theme.color.neutral[200]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
`;

const ProgressBarFill = styled(motion.div)`
  height: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ confidence, theme }) => {
        if (confidence >= 80) {
            return `linear-gradient(90deg, ${theme.color.semantic.success}, ${theme.color.primary[400]})`;
        }
        if (confidence >= 60) {
            return `linear-gradient(90deg, ${theme.color.semantic.warning}, ${theme.color.primary[400]})`;
        }
        return `linear-gradient(90deg, ${theme.color.semantic.error}, ${theme.color.neutral[400]})`;
    }};
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
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const ConfidenceSegments = styled.div`
  display: flex;
  gap: 2px;
  width: 100%;
`;

const ConfidenceSegment = styled(motion.div)`
  flex: 1;
  height: ${({ size }) => {
        switch (size) {
            case 'sm': return '4px';
            case 'lg': return '12px';
            default: return '8px';
        }
    }};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ active, level, theme }) => {
        if (!active) return theme.color.neutral[200];

        switch (level) {
            case 'high': return theme.color.semantic.success;
            case 'medium': return theme.color.semantic.warning;
            case 'low': return theme.color.semantic.error;
            default: return theme.color.neutral[400];
        }
    }};
`;

const CircularProgress = styled.div`
  position: relative;
  width: ${({ size }) => {
        switch (size) {
            case 'sm': return '40px';
            case 'lg': return '80px';
            default: return '60px';
        }
    }};
  height: ${({ size }) => {
        switch (size) {
            case 'sm': return '40px';
            case 'lg': return '80px';
            default: return '60px';
        }
    }};
`;

const CircularSvg = styled.svg`
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
`;

const CircularTrack = styled.circle`
  fill: none;
  stroke: ${({ theme }) => theme.color.neutral[200]};
  stroke-width: ${({ size }) => {
        switch (size) {
            case 'sm': return '3';
            case 'lg': return '6';
            default: return '4';
        }
    }};
`;

const CircularFill = styled(motion.circle)`
  fill: none;
  stroke: ${({ confidence, theme }) => {
        if (confidence >= 80) return theme.color.semantic.success;
        if (confidence >= 60) return theme.color.semantic.warning;
        return theme.color.semantic.error;
    }};
  stroke-width: ${({ size }) => {
        switch (size) {
            case 'sm': return '3';
            case 'lg': return '6';
            default: return '4';
        }
    }};
  stroke-linecap: round;
  stroke-dasharray: ${({ circumference }) => circumference};
  stroke-dashoffset: ${({ circumference, confidence }) =>
        circumference - (circumference * confidence) / 100
    };
`;

const CircularText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: ${({ size, theme }) => {
        switch (size) {
            case 'sm': return theme.typography.fontSize.xs;
            case 'lg': return theme.typography.fontSize.lg;
            default: return theme.typography.fontSize.sm;
        }
    }};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ confidence, theme }) => {
        if (confidence >= 80) return theme.color.semantic.success;
        if (confidence >= 60) return theme.color.semantic.warning;
        return theme.color.semantic.error;
    }};
`;

export const ConfidenceIndicator = ({
    confidence,
    label = "Confidence",
    variant = 'bar', // 'bar', 'segments', 'circular'
    size = 'md', // 'sm', 'md', 'lg'
    showValue = true,
    showLabel = true,
    animated = true,
    className,
    ...props
}) => {
    const theme = useTheme();

    const getConfidenceLevel = (confidence) => {
        if (confidence >= 80) return 'high';
        if (confidence >= 60) return 'medium';
        return 'low';
    };

    const renderBarIndicator = () => (
        <ConfidenceContainer className={className} {...props}>
            {showLabel && (
                <ConfidenceHeader>
                    <ConfidenceLabel>{label}</ConfidenceLabel>
                    {showValue && (
                        <ConfidenceValue confidence={confidence}>
                            {confidence}%
                        </ConfidenceValue>
                    )}
                </ConfidenceHeader>
            )}

            <ProgressBarContainer size={size}>
                <ProgressBarFill
                    confidence={confidence}
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence}%` }}
                    transition={{
                        duration: animated ? 1.5 : 0,
                        ease: "easeOut",
                        delay: animated ? 0.2 : 0
                    }}
                />
            </ProgressBarContainer>
        </ConfidenceContainer>
    );

    const renderSegmentIndicator = () => {
        const segments = 10;
        const activeSegments = Math.ceil((confidence / 100) * segments);

        return (
            <ConfidenceContainer className={className} {...props}>
                {showLabel && (
                    <ConfidenceHeader>
                        <ConfidenceLabel>{label}</ConfidenceLabel>
                        {showValue && (
                            <ConfidenceValue confidence={confidence}>
                                {confidence}%
                            </ConfidenceValue>
                        )}
                    </ConfidenceHeader>
                )}

                <ConfidenceSegments>
                    {Array.from({ length: segments }, (_, index) => {
                        const isActive = index < activeSegments;
                        const level = index < 6 ? 'low' : index < 8 ? 'medium' : 'high';

                        return (
                            <ConfidenceSegment
                                key={index}
                                active={isActive}
                                level={level}
                                size={size}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: isActive ? 1 : 0.3,
                                    scale: isActive ? 1 : 0.8
                                }}
                                transition={{
                                    duration: animated ? 0.3 : 0,
                                    delay: animated ? index * 0.05 : 0
                                }}
                            />
                        );
                    })}
                </ConfidenceSegments>
            </ConfidenceContainer>
        );
    };

    const renderCircularIndicator = () => {
        const radius = size === 'sm' ? 16 : size === 'lg' ? 34 : 26;
        const circumference = 2 * Math.PI * radius;

        return (
            <ConfidenceContainer className={className} {...props}>
                {showLabel && (
                    <ConfidenceHeader>
                        <ConfidenceLabel>{label}</ConfidenceLabel>
                    </ConfidenceHeader>
                )}

                <CircularProgress size={size}>
                    <CircularSvg>
                        <CircularTrack
                            cx="50%"
                            cy="50%"
                            r={radius}
                            size={size}
                        />
                        <CircularFill
                            cx="50%"
                            cy="50%"
                            r={radius}
                            confidence={confidence}
                            circumference={circumference}
                            size={size}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{
                                strokeDashoffset: circumference - (circumference * confidence) / 100
                            }}
                            transition={{
                                duration: animated ? 2 : 0,
                                ease: "easeOut",
                                delay: animated ? 0.3 : 0
                            }}
                        />
                    </CircularSvg>

                    {showValue && (
                        <CircularText size={size} confidence={confidence}>
                            {confidence}%
                        </CircularText>
                    )}
                </CircularProgress>
            </ConfidenceContainer>
        );
    };

    switch (variant) {
        case 'segments':
            return renderSegmentIndicator();
        case 'circular':
            return renderCircularIndicator();
        default:
            return renderBarIndicator();
    }
};

export default ConfidenceIndicator;