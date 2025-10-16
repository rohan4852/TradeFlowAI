import React, { forwardRef, useState, useId } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeProvider';
import { focusRing, transition } from '../../index';

// Input container
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
  width: 100%;
`;

// Label component
const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.color.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};

  ${props => props.required && css`
    &::after {
      content: ' *';
      color: ${props.theme.color.semantic.error};
    }
  `}
`;

// Input wrapper for icons and styling
const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

// Styled input component
const StyledInput = styled(motion.input)`
  width: 100%;
  border: 1px solid ${props => props.error ? props.theme.color.semantic.error : props.theme.color.border.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  font-family: ${props => props.theme.typography.fontFamily.primary};
  font-size: ${props => getSizeStyles(props.size, props.theme).fontSize};
  color: ${props => props.theme.color.text.primary};
  background-color: ${props => props.theme.color.background.primary};
  transition: ${props => transition(['border-color', 'box-shadow', 'background-color'], 'fast', 'easeInOut', props.theme)};
  outline: none;

  /* Size variants */
  ${props => {
        const styles = getSizeStyles(props.size, props.theme);
        return css`
      padding: ${styles.padding};
      height: ${styles.height};
      font-size: ${styles.fontSize};
    `;
    }}

  /* Icon padding adjustments */
  ${props => props.hasLeftIcon && css`
    padding-left: ${props.theme.spacing[10]};
  `}

  ${props => props.hasRightIcon && css`
    padding-right: ${props.theme.spacing[10]};
  `}

  /* Variant styles */
  ${props => getVariantStyles(props)}

  /* Placeholder styles */
  &::placeholder {
    color: ${props => props.theme.color.text.tertiary};
    opacity: 1;
  }

  /* Focus styles */
  &:focus {
    ${props => focusRing(props.theme, props.error ? 'error' : 'primary')}
    border-color: ${props => props.error ? props.theme.color.semantic.error : props.theme.color.border.focus};
  }

  /* Hover styles */
  &:hover:not(:disabled):not(:focus) {
    border-color: ${props => props.error ? props.theme.color.semantic.error : props.theme.color.border.secondary};
  }

  /* Disabled styles */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: ${props => props.theme.color.background.secondary};
  }

  /* Error styles */
  ${props => props.error && css`
    border-color: ${props.theme.color.semantic.error};
    
    &:focus {
      box-shadow: 0 0 0 3px ${props.theme.color.semantic.error}33;
    }
  `}

  /* Read-only styles */
  &:read-only {
    background-color: ${props => props.theme.color.background.secondary};
    cursor: default;
  }

  /* Number input styles */
  &[type="number"] {
    font-family: ${props => props.theme.typography.fontFamily.monospace};
    
    /* Hide number input spinners */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    
    &[type=number] {
      -moz-appearance: textfield;
    }
  }

  /* Search input styles */
  &[type="search"] {
    &::-webkit-search-decoration,
    &::-webkit-search-cancel-button,
    &::-webkit-search-results-button,
    &::-webkit-search-results-decoration {
      -webkit-appearance: none;
    }
  }
`;

// Icon wrapper
const IconWrapper = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.color.text.tertiary};
  pointer-events: none;
  z-index: 1;

  ${props => props.position === 'left' && css`
    left: ${props.theme.spacing[3]};
  `}

  ${props => props.position === 'right' && css`
    right: ${props.theme.spacing[3]};
  `}

  svg {
    width: 1em;
    height: 1em;
  }
`;

// Helper text component
const HelperText = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.error ? props.theme.color.semantic.error : props.theme.color.text.tertiary};
  margin-top: ${props => props.theme.spacing[1]};
  min-height: 1.25rem;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

// Size styles function
const getSizeStyles = (size, theme) => {
    const sizes = {
        sm: {
            padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
            height: '2rem',
            fontSize: theme.typography.fontSize.sm,
        },
        md: {
            padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
            height: '2.5rem',
            fontSize: theme.typography.fontSize.base,
        },
        lg: {
            padding: `${theme.spacing[4]} ${theme.spacing[5]}`,
            height: '3rem',
            fontSize: theme.typography.fontSize.lg,
        },
    };

    return sizes[size] || sizes.md;
};

// Variant styles function
const getVariantStyles = (props) => {
    const { theme, variant } = props;

    const variants = {
        default: css`
      background-color: ${theme.color.background.primary};
      border: 1px solid ${theme.color.border.primary};
    `,

        filled: css`
      background-color: ${theme.color.background.secondary};
      border: 1px solid transparent;
      
      &:focus {
        background-color: ${theme.color.background.primary};
        border-color: ${theme.color.border.focus};
      }
    `,

        outline: css`
      background-color: transparent;
      border: 2px solid ${theme.color.border.primary};
      
      &:focus {
        border-color: ${theme.color.border.focus};
        background-color: ${theme.color.background.primary};
      }
    `,
    };

    return variants[variant] || variants.default;
};

// Input component
const Input = forwardRef(({
    label,
    type = 'text',
    size = 'md',
    variant = 'default',
    placeholder,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    disabled = false,
    readOnly = false,
    required = false,
    error = false,
    errorMessage,
    helperText,
    leftIcon,
    rightIcon,
    autoComplete,
    autoFocus = false,
    maxLength,
    minLength,
    pattern,
    className,
    testId,
    ariaLabel,
    ariaDescribedBy,
    ...props
}, ref) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const inputId = useId();
    const helperTextId = useId();

    const handleFocus = (event) => {
        setIsFocused(true);
        if (onFocus) onFocus(event);
    };

    const handleBlur = (event) => {
        setIsFocused(false);
        if (onBlur) onBlur(event);
    };

    const hasError = error || errorMessage;
    const displayHelperText = hasError ? errorMessage : helperText;

    return (
        <InputContainer className={className}>
            {label && (
                <Label htmlFor={inputId} required={required}>
                    {label}
                </Label>
            )}

            <InputWrapper>
                {leftIcon && (
                    <IconWrapper position="left" theme={theme}>
                        {leftIcon}
                    </IconWrapper>
                )}

                <StyledInput
                    ref={ref}
                    id={inputId}
                    type={type}
                    size={size}
                    variant={variant}
                    placeholder={placeholder}
                    value={value}
                    defaultValue={defaultValue}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={onKeyDown}
                    disabled={disabled}
                    readOnly={readOnly}
                    required={required}
                    error={hasError}
                    hasLeftIcon={!!leftIcon}
                    hasRightIcon={!!rightIcon}
                    autoComplete={autoComplete}
                    autoFocus={autoFocus}
                    maxLength={maxLength}
                    minLength={minLength}
                    pattern={pattern}
                    theme={theme}
                    data-testid={testId}
                    aria-label={ariaLabel}
                    aria-describedby={displayHelperText ? helperTextId : ariaDescribedBy}
                    aria-invalid={hasError}
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    {...props}
                />

                {rightIcon && (
                    <IconWrapper position="right" theme={theme}>
                        {rightIcon}
                    </IconWrapper>
                )}
            </InputWrapper>

            {displayHelperText && (
                <HelperText id={helperTextId} error={hasError} theme={theme}>
                    {displayHelperText}
                </HelperText>
            )}
        </InputContainer>
    );
});

Input.displayName = 'Input';

export default Input;