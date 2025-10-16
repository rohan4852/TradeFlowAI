import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeProvider';
import { focusRing, transition, sizeVariants } from '../../index';
import { useFocusVisible } from '../accessibility';

// Styled button component with variants
const StyledButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-family: ${props => props.theme.typography.fontFamily.primary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-decoration: none;
  cursor: pointer;
  transition: ${props => transition(['all'], 'fast', 'easeInOut', props.theme)};
  position: relative;
  overflow: hidden;
  user-select: none;
  white-space: nowrap;

  /* Size variants */
  ${props => {
    const size = sizeVariants[props.size] || sizeVariants.md;
    return css`
      padding: ${size.padding};
      font-size: ${size.fontSize};
      height: ${size.height};
    `;
  }}

  /* Full width */
  ${props => props.fullWidth && css`
    width: 100%;
  `}

  /* Variant styles */
  ${props => getVariantStyles(props)}

  /* Disabled state */
  ${props => props.disabled && css`
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  `}

  /* Loading state */
  ${props => props.loading && css`
    cursor: wait;
    pointer-events: none;
  `}

  /* Focus styles */
  &:focus-visible,
  &[data-focus-visible="true"] {
    ${props => focusRing(props.theme, getVariantColor(props.variant))}
    outline: 2px solid ${props => props.theme.color.primary[500]};
    outline-offset: 2px;
  }

  /* Remove focus styles for mouse/touch interactions */
  &:focus:not([data-focus-visible="true"]) {
    outline: none;
    box-shadow: none;
  }

  /* Hover effects */
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  /* Active effects */
  &:active:not(:disabled) {
    transform: translateY(0);
  }

  /* Ripple effect container */
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
  }

  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;

// Icon wrapper
const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 1em;
    height: 1em;
  }
`;

// Loading spinner
const LoadingSpinner = styled.div`
  width: 1em;
  height: 1em;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Variant color mapping
const getVariantColor = (variant) => {
  const colorMap = {
    primary: 'primary',
    secondary: 'secondary',
    outline: 'primary',
    ghost: 'primary',
    danger: 'error',
  };
  return colorMap[variant] || 'primary';
};

// Variant styles function
const getVariantStyles = (props) => {
  const { theme, variant } = props;

  const variants = {
    primary: css`
      background: ${theme.color.primary[500]};
      color: ${theme.color.text.inverse};
      border: 1px solid ${theme.color.primary[500]};

      &:hover:not(:disabled) {
        background: ${theme.color.primary[600]};
        border-color: ${theme.color.primary[600]};
      }

      &:active:not(:disabled) {
        background: ${theme.color.primary[700]};
        border-color: ${theme.color.primary[700]};
      }
    `,

    secondary: css`
      background: ${theme.color.background.secondary};
      color: ${theme.color.text.primary};
      border: 1px solid ${theme.color.border.primary};

      &:hover:not(:disabled) {
        background: ${theme.color.background.tertiary};
        border-color: ${theme.color.border.secondary};
      }

      &:active:not(:disabled) {
        background: ${theme.color.neutral[300]};
      }
    `,

    outline: css`
      background: transparent;
      color: ${theme.color.primary[500]};
      border: 1px solid ${theme.color.primary[500]};

      &:hover:not(:disabled) {
        background: ${theme.color.primary[50]};
        ${theme.mode === 'dark' && css`
          background: ${theme.color.primary[900]};
        `}
      }

      &:active:not(:disabled) {
        background: ${theme.color.primary[100]};
        ${theme.mode === 'dark' && css`
          background: ${theme.color.primary[800]};
        `}
      }
    `,

    ghost: css`
      background: transparent;
      color: ${theme.color.text.primary};
      border: 1px solid transparent;

      &:hover:not(:disabled) {
        background: ${theme.color.background.secondary};
        border-color: ${theme.color.border.primary};
      }

      &:active:not(:disabled) {
        background: ${theme.color.background.tertiary};
      }
    `,

    danger: css`
      background: ${theme.color.semantic.error};
      color: ${theme.color.text.inverse};
      border: 1px solid ${theme.color.semantic.error};

      &:hover:not(:disabled) {
        background: #dc2626;
        border-color: #dc2626;
      }

      &:active:not(:disabled) {
        background: #b91c1c;
        border-color: #b91c1c;
      }
    `,
  };

  return variants[variant] || variants.primary;
};

// Button component
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onClick,
  className,
  testId,
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaPressed,
  ariaHasPopup,
  type = 'button',
  ...props
}, ref) => {
  const { theme } = useTheme();
  const { elementRef: focusRef } = useFocusVisible();

  // Handle click with ripple effect
  const handleClick = (event) => {
    if (disabled || loading) return;

    // Create ripple effect
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    button.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);

    // Call original onClick
    if (onClick) {
      onClick(event);
    }
  };

  // Handle keyboard interaction
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(event);
    }
  };

  // Combine refs
  const combinedRef = (element) => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(element);
      } else {
        ref.current = element;
      }
    }
    if (focusRef) {
      focusRef.current = element;
    }
  };

  return (
    <StyledButton
      ref={combinedRef}
      type={type}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      loading={loading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={className}
      data-testid={testId}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      aria-haspopup={ariaHasPopup}
      aria-disabled={disabled}
      aria-busy={loading}
      theme={theme}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && leftIcon && (
        <IconWrapper>
          {leftIcon}
        </IconWrapper>
      )}
      {children}
      {!loading && rightIcon && (
        <IconWrapper>
          {rightIcon}
        </IconWrapper>
      )}
    </StyledButton>
  );
});

Button.displayName = 'Button';

export default Button;