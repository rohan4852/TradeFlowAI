import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeProvider';

// Common trading and UI icons as SVG components
const IconSVGs = {
    // Trading icons
    trendUp: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    ),

    trendDown: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
        </svg>
    ),

    candlestick: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <rect x="8" y="6" width="8" height="12" />
        </svg>
    ),

    volume: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="4" height="10" />
            <rect x="10" y="7" width="4" height="14" />
            <rect x="17" y="3" width="4" height="18" />
        </svg>
    ),

    // UI icons
    search: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
        </svg>
    ),

    settings: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a4 4 0 01-8 0 4 4 0 018 0zM7 16a4 4 0 01-8 0 4 4 0 018 0z" />
        </svg>
    ),

    close: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),

    menu: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    ),

    chevronUp: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="18 15 12 9 6 15" />
        </svg>
    ),

    chevronDown: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    ),

    chevronLeft: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    ),

    chevronRight: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    ),

    plus: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),

    minus: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),

    check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),

    alert: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),

    info: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    ),

    eye: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),

    eyeOff: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ),

    // Financial icons
    dollar: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    ),

    percent: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="5" x2="5" y2="19" />
            <circle cx="6.5" cy="6.5" r="2.5" />
            <circle cx="17.5" cy="17.5" r="2.5" />
        </svg>
    ),

    // Status icons
    loading: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
    ),
};

// Styled icon wrapper
const StyledIcon = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  user-select: none;
  
  /* Size variants */
  ${props => {
        const sizes = {
            xs: '0.75rem',
            sm: '1rem',
            md: '1.25rem',
            lg: '1.5rem',
            xl: '2rem',
            '2xl': '2.5rem',
        };

        const size = sizes[props.size] || sizes.md;
        return css`
      width: ${size};
      height: ${size};
    `;
    }}

  /* Color variants */
  ${props => getColorStyles(props)}

  /* Interactive styles */
  ${props => props.interactive && css`
    cursor: pointer;
    border-radius: ${props.theme.borderRadius.sm};
    transition: all ${props.theme.animation.duration.fast} ${props.theme.animation.easing.easeInOut};
    
    &:hover {
      background-color: ${props.theme.color.background.secondary};
      transform: scale(1.1);
    }
    
    &:active {
      transform: scale(0.95);
    }
  `}

  /* Spinning animation for loading icons */
  ${props => props.spin && css`
    animation: spin 1s linear infinite;
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `}

  svg {
    width: 100%;
    height: 100%;
    stroke-width: ${props => props.strokeWidth || 2};
  }
`;

// Color styles function
const getColorStyles = (props) => {
    const { theme, color } = props;

    if (!color) {
        return css`
      color: currentColor;
    `;
    }

    const colors = {
        primary: theme.color.primary[500],
        secondary: theme.color.secondary[500],
        success: theme.color.semantic.success,
        warning: theme.color.semantic.warning,
        error: theme.color.semantic.error,
        info: theme.color.semantic.info,
        bull: theme.color.trading.bull,
        bear: theme.color.trading.bear,
        neutral: theme.color.trading.neutral,
        muted: theme.color.text.tertiary,
        current: 'currentColor',
    };

    return css`
    color: ${colors[color] || colors.current};
  `;
};

// Icon component
const Icon = forwardRef(({
    name,
    size = 'md',
    color,
    interactive = false,
    spin = false,
    strokeWidth,
    className,
    onClick,
    onMouseEnter,
    onMouseLeave,
    testId,
    ariaLabel,
    ariaHidden = true,
    ...props
}, ref) => {
    const { theme } = useTheme();

    // Get the SVG for the icon name
    const iconSVG = IconSVGs[name];

    if (!iconSVG) {
        console.warn(`Icon "${name}" not found. Available icons:`, Object.keys(IconSVGs));
        return null;
    }

    // Auto-spin loading icons
    const shouldSpin = spin || name === 'loading';

    return (
        <StyledIcon
            ref={ref}
            size={size}
            color={color}
            interactive={interactive}
            spin={shouldSpin}
            strokeWidth={strokeWidth}
            className={className}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            theme={theme}
            data-testid={testId}
            aria-label={ariaLabel}
            aria-hidden={ariaHidden}
            whileHover={interactive ? { scale: 1.1 } : undefined}
            whileTap={interactive ? { scale: 0.95 } : undefined}
            {...props}
        >
            {iconSVG}
        </StyledIcon>
    );
});

Icon.displayName = 'Icon';

// Export available icon names for reference
export const iconNames = Object.keys(IconSVGs);

export default Icon;