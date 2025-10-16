import React, { useState } from 'react';
import styled from 'styled-components';
import { useTouchGestures } from '../../hooks/useTouchGestures';

const CardContainer = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  transform: translateX(${props => props.translateX}px);
`;

const CardContent = styled.div`
  padding: 16px;
  min-height: 80px;
  display: flex;
  align-items: center;
`;

const SwipeActions = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  ${props => props.side === 'left' ? 'left: 0' : 'right: 0'};
  width: ${props => Math.abs(props.translateX)}px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color || props.theme.colors.primary[500]};
  color: white;
  font-weight: 600;
  opacity: ${props => Math.min(Math.abs(props.translateX) / 100, 1)};
`;

const ActionIcon = styled.div`
  font-size: 20px;
  margin-bottom: 4px;
`;

const ActionText = styled.div`
  font-size: 12px;
  text-align: center;
`;

export const SwipeableCard = ({
    children,
    leftAction,
    rightAction,
    swipeThreshold = 80,
    onSwipeLeft,
    onSwipeRight,
    className,
    ...props
}) => {
    const [translateX, setTranslateX] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const { touchHandlers } = useTouchGestures({
        onSwipeLeft: ({ deltaX, velocity }) => {
            if (Math.abs(deltaX) > swipeThreshold || velocity > 0.5) {
                if (onSwipeLeft) {
                    onSwipeLeft();
                    animateReset();
                }
            } else {
                animateReset();
            }
        },
        onSwipeRight: ({ deltaX, velocity }) => {
            if (Math.abs(deltaX) > swipeThreshold || velocity > 0.5) {
                if (onSwipeRight) {
                    onSwipeRight();
                    animateReset();
                }
            } else {
                animateReset();
            }
        }
    });

    const animateReset = () => {
        setIsAnimating(true);
        setTranslateX(0);
        setTimeout(() => setIsAnimating(false), 300);
    };

    const handleTouchMove = (e) => {
        if (isAnimating) return;

        const touch = e.touches[0];
        const startX = e.target.getBoundingClientRect().left;
        const currentX = touch.clientX;
        const deltaX = currentX - startX;

        // Limit swipe distance
        const maxSwipe = 120;
        const limitedDeltaX = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));

        setTranslateX(limitedDeltaX);
        touchHandlers.onTouchMove(e);
    };

    const handleTouchEnd = (e) => {
        if (Math.abs(translateX) < swipeThreshold) {
            animateReset();
        }
        touchHandlers.onTouchEnd(e);
    };

    return (
        <CardContainer
            translateX={translateX}
            className={className}
            onTouchStart={touchHandlers.onTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            {...props}
        >
            {/* Left swipe action */}
            {leftAction && translateX > 0 && (
                <SwipeActions
                    side="left"
                    translateX={translateX}
                    color={leftAction.color}
                >
                    <div>
                        <ActionIcon>{leftAction.icon}</ActionIcon>
                        <ActionText>{leftAction.text}</ActionText>
                    </div>
                </SwipeActions>
            )}

            {/* Right swipe action */}
            {rightAction && translateX < 0 && (
                <SwipeActions
                    side="right"
                    translateX={translateX}
                    color={rightAction.color}
                >
                    <div>
                        <ActionIcon>{rightAction.icon}</ActionIcon>
                        <ActionText>{rightAction.text}</ActionText>
                    </div>
                </SwipeActions>
            )}

            <CardContent>
                {children}
            </CardContent>
        </CardContainer>
    );
};