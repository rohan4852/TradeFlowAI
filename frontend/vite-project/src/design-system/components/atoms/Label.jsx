import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeProvider';

// Styled label component
const StyledLabel = styled(motion.label)`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  font-family: ${props => props.theme.typography.fontFamily.primary};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  cursor: ${props => props.interactive ? 'pointer' : 'default'};
  user-select: none;
  
  /* Size variants */
  ${props => {
        const sizes = {
            xs: {
                fontSize: props.theme.typography.fontSize.xs,
                fontWeight: props.theme.typography.fontWeight.normal,
            },
            sm: {
                fontSize: props.theme.typography.fontSize.sm,
                fontWeight: props.theme.typography.fontWeight.normal,
            },
            md: {
                fontSize: props.theme.typography.fontSize.base,
                fontWeight: props.theme.typography.fontWeight.medium,
            },
            lg: {
                fontSize: props.theme.typography.fontSize.lg,
                fontWeight: props.theme.typography.fontWeight.medium,
            },
            xl: {
                fontSize: props.theme.typography.fontSize.xl,
                fontWeight: props.theme.typography.fontWeight.semibold,
            },
        };

        const size = sizes[props.size] || sizes.md;
        return css`
      font-size: ${size.fontSize};
      font-weight: ${size.fontWeight};
    `;
    }}

  /* Color variants */
  ${props => getColorStyles(props)}

  /* Weight variants */
  ${props => props.weight && css`
    font-weight: ${props.theme.typography.fontWeight[props.weight] || props.weight};
  `}

  /* Required indicator */
  ${props => props.required && css`
    &::after {
      content: ' *';
      color: ${props.theme.color.semantic.error};
      font-weight: ${props.theme.typography.fontWeight.bold};
    }
  `}

  /* Optional indicator */
  ${props => props.optional && css`
    &::after {
      content: ' (optional)';
      color: ${props.theme.color.text.tertiary};
      font-weight: ${props.theme.typography.fontWeight.normal};
      font-size: 0.875em;
    }
  `}

  /* Disabled state */
  ${props => props.disabled && css`
    opacity: 0.6;
    cursor: not-allowed;
  `}

  /* Truncation */
  ${props => props.truncate && css`
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `}

  /* Uppercase variant */
  ${props => props.uppercase && css`
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `}

  /* Interactive hover effects */
  ${props => props.interactive && css`
    transition: color ${props.theme.animation.duration.fast} ${props.theme.animation.easing.easeInOut};
    
    &:hover:not(:disabled) {
      color: ${props.theme.color.primary[600]};
    }
  `}
`;

// Badge component for additional info
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  border-radius: ${props => props.theme.borderRadius.full};
  background-color: ${props => getBadgeColor(props.variant, props.theme)};
  color: ${props => getBadgeTextColor(props.variant, props.theme)};
  margin-left: ${props => props.theme.spacing[2]};
`;

// Tooltip wrapper for additional context
const TooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  
  &:hover .tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateY(-8px);
  }
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-4px);
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background-color: ${props => props.theme.color.neutral[800]};
  color: ${props => props.theme.color.text.inverse};
  font-size: ${props => props.theme.typography.fontSize.xs};
  border-radius: ${props => props.theme.borderRadius.md};
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  z-index: ${props => props.theme.zIndex.tooltip};
  pointer-events: none;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: ${props => props.theme.color.neutral[800]};
  }
`;

// Color styles function
const getColorStyles = (props) => {
    const { theme, color } = props;

    const colors = {
        primary: theme.color.text.primary,
        secondary: theme.color.text.secondary,
        tertiary: theme.color.text.tertiary,
        success: theme.color.semantic.success,
        warning: theme.color.semantic.warning,
        error: theme.color.semantic.error,
        info: theme.color.semantic.info,
        bull: theme.color.trading.bull,
        bear: theme.color.trading.bear,
        neutral: theme.color.trading.neutral,
        muted: theme.color.text.tertiary,
    };

    return css`
    color: ${colors[color] || colors.primary};
  `;
};

// Badge color functions
const getBadgeColor = (variant, theme) => {
    const colors = {
        primary: theme.color.primary[100],
        secondary: theme.color.secondary[100],
        success: theme.color.semantic.success + '20',
        warning: theme.color.semantic.warning + '20',
        error: theme.color.semantic.error + '20',
        info: theme.color.semantic.info + '20',
        neutral: theme.color.neutral[200],
    };

    return colors[variant] || colors.neutral;
};

const getBadgeTextColor = (variant, theme) => {
    const colors = {
        primary: theme.color.primary[700],
        secondary: theme.color.secondary[700],
        success: theme.color.semantic.success,
        warning: theme.color.semantic.warning,
        error: theme.color.semantic.error,
        info: theme.color.semantic.info,
        neutral: theme.color.text.secondary,
    };

    return colors[variant] || colors.neutral;
};

// Label component
const Label = forwardRef(({
    children,
    htmlFor,
    size = 'md',
    color = 'primary',
    weight,
    required = false,
    optional = false,
    disabled = false,
    interactive = false,
    truncate = false,
    uppercase = false,
    badge,
    badgeVariant = 'neutral',
    tooltip,
    className,
    onClick,
    testId,
    ariaLabel,
    ...props
}, ref) => {
    const { theme } = useTheme();

    const labelContent = (
        <StyledLabel
            ref={ref}
            htmlFor={htmlFor}
            size={size}
            color={color}
            weight={weight}
            required={required}
            optional={optional}
            disabled={disabled}
            interactive={interactive}
            truncate={truncate}
            uppercase={uppercase}
            className={className}
            onClick={onClick}
            theme={theme}
            data-testid={testId}
            aria-label={ariaLabel}
            whileHover={interactive ? { scale: 1.02 } : undefined}
            whileTap={interactive ? { scale: 0.98 } : undefined}
            {...props}
        >
            {children}
            {badge && (
                <Badge variant={badgeVariant} theme={theme}>
                    {badge}
                </Badge>
            )}
        </StyledLabel>
    );

    // Wrap with tooltip if provided
    if (tooltip) {
        return (
            <TooltipWrapper>
                {labelContent}
                <Tooltip className="tooltip" theme={theme}>
                    {tooltip}
                </Tooltip>
            </TooltipWrapper>
        );
    }

    return labelContent;
});

Label.displayName = 'Label';

export default Label;