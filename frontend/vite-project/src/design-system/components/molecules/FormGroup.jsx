import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeProvider';
import { Input, Label, Button, Icon } from '../atoms';
import { createGlassmorphism, animationPresets, hoverEffects } from '../../effects';

// Form group container
const FormGroupContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  width: 100%;
  position: relative;

  ${props => props.inline && css`
    flex-direction: row;
    align-items: flex-end;
    gap: ${props.theme.spacing[3]};
  `}

  ${props => props.glass && css`
    ${createGlassmorphism(props.theme, { intensity: 'light', animated: true })}
    padding: ${props.theme.spacing[4]};
    border-radius: ${props.theme.borderRadius.lg};
  `}
`;

// Field wrapper for individual form fields
const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
  flex: ${props => props.flex || 1};
  min-width: 0;

  ${props => props.width && css`
    width: ${props.width};
    flex: none;
  `}
`;

// Action buttons container
const ActionsContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[3]};
  margin-top: ${props => props.theme.spacing[4]};
  justify-content: ${props => props.justify || 'flex-start'};
  flex-wrap: wrap;

  ${props => props.inline && css`
    margin-top: 0;
    align-items: center;
  `}
`;

// Error summary container
const ErrorSummary = styled(motion.div)`
  padding: ${props => props.theme.spacing[3]};
  background-color: ${props => props.theme.color.semantic.error}15;
  border: 1px solid ${props => props.theme.color.semantic.error}40;
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

// Error list
const ErrorList = styled.ul`
  margin: 0;
  padding-left: ${props => props.theme.spacing[4]};
  color: ${props => props.theme.color.semantic.error};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

// Success message
const SuccessMessage = styled(motion.div)`
  padding: ${props => props.theme.spacing[3]};
  background-color: ${props => props.theme.color.semantic.success}15;
  border: 1px solid ${props => props.theme.color.semantic.success}40;
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.color.semantic.success};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-bottom: ${props => props.theme.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

// Form section divider
const SectionDivider = styled.div`
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    ${props => props.theme.color.border.primary} 50%,
    transparent 100%
  );
  margin: ${props => props.theme.spacing[6]} 0;
  position: relative;

  &::after {
    content: '${props => props.title || ''}';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${props => props.theme.color.background.primary};
    padding: 0 ${props => props.theme.spacing[3]};
    font-size: ${props => props.theme.typography.fontSize.sm};
    color: ${props => props.theme.color.text.secondary};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
  }
`;

// FormGroup component
const FormGroup = forwardRef(({
    children,
    title,
    description,
    inline = false,
    glass = false,
    errors = [],
    successMessage,
    actions,
    actionsJustify = 'flex-start',
    onSubmit,
    className,
    testId,
    ...props
}, ref) => {
    const { theme } = useTheme();

    const handleSubmit = (event) => {
        event.preventDefault();
        if (onSubmit) {
            onSubmit(event);
        }
    };

    const hasErrors = errors.length > 0;

    return (
        <FormGroupContainer
            ref={ref}
            as={onSubmit ? 'form' : 'div'}
            inline={inline}
            glass={glass}
            className={className}
            onSubmit={handleSubmit}
            theme={theme}
            data-testid={testId}
            {...animationPresets.fadeIn}
            {...props}
        >
            {title && (
                <Label size="lg" weight="semibold" color="primary">
                    {title}
                </Label>
            )}

            {description && (
                <Label size="sm" color="secondary" style={{ marginBottom: theme.spacing[2] }}>
                    {description}
                </Label>
            )}

            {hasErrors && (
                <ErrorSummary
                    theme={theme}
                    {...animationPresets.slideDown}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[2] }}>
                        <Icon name="alert" color="error" size="sm" />
                        <Label size="sm" color="error" weight="medium">
                            Please correct the following errors:
                        </Label>
                    </div>
                    <ErrorList theme={theme}>
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ErrorList>
                </ErrorSummary>
            )}

            {successMessage && (
                <SuccessMessage
                    theme={theme}
                    {...animationPresets.slideDown}
                >
                    <Icon name="check" color="success" size="sm" />
                    {successMessage}
                </SuccessMessage>
            )}

            {children}

            {actions && (
                <ActionsContainer
                    theme={theme}
                    justify={actionsJustify}
                    inline={inline}
                >
                    {actions}
                </ActionsContainer>
            )}
        </FormGroupContainer>
    );
});

FormGroup.displayName = 'FormGroup';

// Export FormGroup as named export as well
export { FormGroup };

// Field component for individual form fields
export const Field = forwardRef(({
    label,
    children,
    error,
    helperText,
    required = false,
    optional = false,
    width,
    flex,
    className,
    ...props
}, ref) => {
    const { theme } = useTheme();

    return (
        <FieldWrapper
            ref={ref}
            width={width}
            flex={flex}
            className={className}
            theme={theme}
            {...props}
        >
            {label && (
                <Label
                    required={required}
                    optional={optional}
                    color={error ? 'error' : 'primary'}
                >
                    {label}
                </Label>
            )}
            {children}
            {(error || helperText) && (
                <Label
                    size="xs"
                    color={error ? 'error' : 'secondary'}
                    style={{ marginTop: theme.spacing[1] }}
                >
                    {error || helperText}
                </Label>
            )}
        </FieldWrapper>
    );
});

Field.displayName = 'Field';

// Section component for form sections
export const Section = ({ title, children, ...props }) => {
    return (
        <>
            {title && <SectionDivider title={title} />}
            <div {...props}>
                {children}
            </div>
        </>
    );
};

// Inline form component for compact forms
export const InlineForm = forwardRef(({
    children,
    onSubmit,
    submitLabel = 'Submit',
    submitVariant = 'primary',
    submitIcon,
    gap = 3,
    className,
    ...props
}, ref) => {
    const { theme } = useTheme();

    return (
        <FormGroupContainer
            ref={ref}
            as="form"
            onSubmit={onSubmit}
            className={className}
            theme={theme}
            style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: theme.spacing[gap],
                flexWrap: 'wrap',
            }}
            {...props}
        >
            {children}
            <Button
                type="submit"
                variant={submitVariant}
                leftIcon={submitIcon}
                {...hoverEffects.buttonPrimary}
            >
                {submitLabel}
            </Button>
        </FormGroupContainer>
    );
});

InlineForm.displayName = 'InlineForm';

// Trading-specific form components
export const TradingForm = forwardRef(({
    symbol,
    onSymbolChange,
    quantity,
    onQuantityChange,
    price,
    onPriceChange,
    orderType = 'market',
    onOrderTypeChange,
    side = 'buy',
    onSideChange,
    onSubmit,
    loading = false,
    errors = [],
    className,
    ...props
}, ref) => {
    const { theme } = useTheme();

    const handleSubmit = (event) => {
        event.preventDefault();
        if (onSubmit) {
            onSubmit({
                symbol,
                quantity,
                price,
                orderType,
                side,
            });
        }
    };

    return (
        <FormGroup
            ref={ref}
            title="Place Order"
            glass
            errors={errors}
            onSubmit={handleSubmit}
            className={className}
            {...props}
        >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing[4] }}>
                <Field label="Symbol" required>
                    <Input
                        placeholder="AAPL"
                        value={symbol}
                        onChange={(e) => onSymbolChange?.(e.target.value)}
                        leftIcon={<Icon name="search" />}
                        uppercase
                    />
                </Field>

                <Field label="Quantity" required>
                    <Input
                        type="number"
                        placeholder="100"
                        value={quantity}
                        onChange={(e) => onQuantityChange?.(Number(e.target.value))}
                        leftIcon={<Icon name="volume" />}
                        min="1"
                    />
                </Field>

                {orderType === 'limit' && (
                    <Field label="Price" required>
                        <Input
                            type="number"
                            placeholder="150.00"
                            value={price}
                            onChange={(e) => onPriceChange?.(Number(e.target.value))}
                            leftIcon={<Icon name="dollar" />}
                            step="0.01"
                        />
                    </Field>
                )}
            </div>

            <div style={{ display: 'flex', gap: theme.spacing[4], marginTop: theme.spacing[4] }}>
                <Field label="Order Type">
                    <div style={{ display: 'flex', gap: theme.spacing[2] }}>
                        <Button
                            variant={orderType === 'market' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => onOrderTypeChange?.('market')}
                        >
                            Market
                        </Button>
                        <Button
                            variant={orderType === 'limit' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => onOrderTypeChange?.('limit')}
                        >
                            Limit
                        </Button>
                    </div>
                </Field>
            </div>

            <ActionsContainer theme={theme} justify="space-between">
                <div style={{ display: 'flex', gap: theme.spacing[3] }}>
                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        leftIcon={<Icon name="trendUp" />}
                        onClick={() => onSideChange?.('buy')}
                        disabled={!symbol || !quantity}
                    >
                        Buy Order
                    </Button>
                    <Button
                        type="submit"
                        variant="danger"
                        loading={loading}
                        leftIcon={<Icon name="trendDown" />}
                        onClick={() => onSideChange?.('sell')}
                        disabled={!symbol || !quantity}
                    >
                        Sell Order
                    </Button>
                </div>
            </ActionsContainer>
        </FormGroup>
    );
});

TradingForm.displayName = 'TradingForm';

export default FormGroup;