import React, { useState } from 'react';
import styled from 'styled-components';
import { useTouchGestures } from '../../hooks/useTouchGestures';

const StyledTouchButton = styled.button`
  /* Minimum touch target size of 44px as per accessibility guidelines */
  min-height: 44px;
  min-width: 44px;
  padding: ${props => props.size === 'small' ? '8px 16px' : props.size === 'large' ? '16px 32px' : '12px 24px'};
  
  /* Touch-friendly styling */
  border: none;
  border-radius: 8px;
  background: ${props => props.variant === 'primary'
    ? props.theme.colors.primary[500]
    : props.variant === 'secondary'
      ? props.theme.colors.neutral[100]
      : 'transparent'};
  
  color: ${props => props.variant === 'primary'
    ? 'white'
    : props.theme.colors.neutral[900]};
  
  font-size: ${props => props.size === 'small' ? '14px' : props.size === 'large' ? '18px' : '16px'};
  font-weight: 500;
  
  /* Touch feedback */
  transition: all 0.15s ease;
  transform: scale(${props => props.isPressed ? '0.95' : '1'});
  opacity: ${props => props.isPressed ? '0.8' : '1'};
  
  /* Hover states for devices that support it */
  @media (hover: hover) {
    &:hover {
      background: ${props => props.variant === 'primary'
    ? props.theme.colors.primary[600]
    : props.theme.colors.neutral[200]};
    }
  }
  
  /* Focus states for accessibility */
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  /* Ripple effect container */
  position: relative;
  overflow: hidden;
`;

const RippleEffect = styled.div`
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
  
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;

export const TouchOptimizedButton = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  onTouchStart,
  onTouchEnd,
  className,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);

  const createRipple = (event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const { touchHandlers } = useTouchGestures({
    onTap: (gestureData) => {
      if (!disabled && onClick) {
        onClick(gestureData);
      }
    }
  });

  const handleTouchStart = (e) => {
    if (!disabled) {
      setIsPressed(true);
      createRipple(e);
      if (onTouchStart) onTouchStart(e);
    }
    touchHandlers.onTouchStart(e);
  };

  const handleTouchEnd = (e) => {
    setIsPressed(false);
    if (onTouchEnd) onTouchEnd(e);
    touchHandlers.onTouchEnd(e);
  };

  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <StyledTouchButton
      variant={variant}
      size={size}
      disabled={disabled}
      isPressed={isPressed}
      className={className}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={touchHandlers.onTouchMove}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <RippleEffect
          key={ripple.id}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size
          }}
        />
      ))}
    </StyledTouchButton>
  );
};