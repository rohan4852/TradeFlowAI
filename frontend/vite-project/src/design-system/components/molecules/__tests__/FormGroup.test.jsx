import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../ThemeProvider';
import FormGroup, { Field, Section, InlineForm, TradingForm } from '../FormGroup';
import { Icon } from '../../atoms';

// Test wrapper with theme
const TestWrapper = ({ children }) => (
    <ThemeProvider defaultTheme="light">
        {children}
    </ThemeProvider>
);

describe('FormGroup Component', () => {
    test('renders form group with title and description', () => {
        render(
            <TestWrapper>
                <FormGroup
                    title="Test Form"
                    description="This is a test form"
                    testId="test-form"
                >
                    <div>Form content</div>
                </FormGroup>
            </TestWrapper>
        );

        expect(screen.getByText('Test Form')).toBeInTheDocument();
        expect(screen.getByText('This is a test form')).toBeInTheDocument();
        expect(screen.getByTestId('test-form')).toBeInTheDocument();
    });

    test('handles form submission', () => {
        const handleSubmit = jest.fn();
        render(
            <TestWrapper>
                <FormGroup onSubmit={handleSubmit} testId="submit-form">
                    <button type="submit">Submit</button>
                </FormGroup>
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('Submit'));
        expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    test('displays error messages', () => {
        const errors = ['Field is required', 'Invalid format'];
        render(
            <TestWrapper>
                <FormGroup errors={errors}>
                    <div>Form content</div>
                </FormGroup>
            </TestWrapper>
        );

        expect(screen.getByText('Please correct the following errors:')).toBeInTheDocument();
        expect(screen.getByText('Field is required')).toBeInTheDocument();
        expect(screen.getByText('Invalid format')).toBeInTheDocument();
    });

    test('displays success message', () => {
        render(
            <TestWrapper>
                <FormGroup successMessage="Form submitted successfully!">
                    <div>Form content</div>
                </FormGroup>
            </TestWrapper>
        );

        expect(screen.getByText('Form submitted successfully!')).toBeInTheDocument();
    });

    test('supports inline layout', () => {
        render(
            <TestWrapper>
                <FormGroup inline testId="inline-form">
                    <div>Form content</div>
                </FormGroup>
            </TestWrapper>
        );

        expect(screen.getByTestId('inline-form')).toBeInTheDocument();
    });

    test('supports glass effect', () => {
        render(
            <TestWrapper>
                <FormGroup glass testId="glass-form">
                    <div>Form content</div>
                </FormGroup>
            </TestWrapper>
        );

        expect(screen.getByTestId('glass-form')).toBeInTheDocument();
    });

    test('renders actions', () => {
        const actions = (
            <button type="button">Cancel</button>
        );

        render(
            <TestWrapper>
                <FormGroup actions={actions}>
                    <div>Form content</div>
                </FormGroup>
            </TestWrapper>
        );

        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
});

describe('Field Component', () => {
    test('renders field with label', () => {
        render(
            <TestWrapper>
                <Field label="Test Field">
                    <input type="text" />
                </Field>
            </TestWrapper>
        );

        expect(screen.getByText('Test Field')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    test('shows required indicator', () => {
        render(
            <TestWrapper>
                <Field label="Required Field" required>
                    <input type="text" />
                </Field>
            </TestWrapper>
        );

        expect(screen.getByText('Required Field')).toBeInTheDocument();
    });

    test('shows optional indicator', () => {
        render(
            <TestWrapper>
                <Field label="Optional Field" optional>
                    <input type="text" />
                </Field>
            </TestWrapper>
        );

        expect(screen.getByText('Optional Field')).toBeInTheDocument();
    });

    test('displays error message', () => {
        render(
            <TestWrapper>
                <Field label="Field with Error" error="This field is invalid">
                    <input type="text" />
                </Field>
            </TestWrapper>
        );

        expect(screen.getByText('This field is invalid')).toBeInTheDocument();
    });

    test('displays helper text', () => {
        render(
            <TestWrapper>
                <Field label="Field with Help" helperText="This is helpful information">
                    <input type="text" />
                </Field>
            </TestWrapper>
        );

        expect(screen.getByText('This is helpful information')).toBeInTheDocument();
    });

    test('supports custom width', () => {
        render(
            <TestWrapper>
                <Field label="Custom Width Field" width="200px">
                    <input type="text" />
                </Field>
            </TestWrapper>
        );

        expect(screen.getByText('Custom Width Field')).toBeInTheDocument();
    });
});

describe('Section Component', () => {
    test('renders section with title', () => {
        render(
            <TestWrapper>
                <Section title="Form Section">
                    <div>Section content</div>
                </Section>
            </TestWrapper>
        );

        expect(screen.getByText('Section content')).toBeInTheDocument();
    });

    test('renders section without title', () => {
        render(
            <TestWrapper>
                <Section>
                    <div>Section content</div>
                </Section>
            </TestWrapper>
        );

        expect(screen.getByText('Section content')).toBeInTheDocument();
    });
});

describe('InlineForm Component', () => {
    test('renders inline form with submit button', () => {
        const handleSubmit = jest.fn();
        render(
            <TestWrapper>
                <InlineForm onSubmit={handleSubmit} submitLabel="Search">
                    <input type="text" placeholder="Search..." />
                </InlineForm>
            </TestWrapper>
        );

        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
        expect(screen.getByText('Search')).toBeInTheDocument();
    });

    test('handles form submission', () => {
        const handleSubmit = jest.fn();
        render(
            <TestWrapper>
                <InlineForm onSubmit={handleSubmit}>
                    <input type="text" />
                </InlineForm>
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('Submit'));
        expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    test('supports custom submit button variant', () => {
        render(
            <TestWrapper>
                <InlineForm submitVariant="secondary" submitLabel="Go">
                    <input type="text" />
                </InlineForm>
            </TestWrapper>
        );

        expect(screen.getByText('Go')).toBeInTheDocument();
    });

    test('supports submit button icon', () => {
        render(
            <TestWrapper>
                <InlineForm submitIcon={<Icon name="search" />}>
                    <input type="text" />
                </InlineForm>
            </TestWrapper>
        );

        expect(screen.getByText('Submit')).toBeInTheDocument();
    });
});

describe('TradingForm Component', () => {
    const defaultProps = {
        symbol: 'AAPL',
        onSymbolChange: jest.fn(),
        quantity: 100,
        onQuantityChange: jest.fn(),
        price: 150.00,
        onPriceChange: jest.fn(),
        orderType: 'market',
        onOrderTypeChange: jest.fn(),
        side: 'buy',
        onSideChange: jest.fn(),
        onSubmit: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders trading form with all fields', () => {
        render(
            <TestWrapper>
                <TradingForm {...defaultProps} />
            </TestWrapper>
        );

        expect(screen.getByText('Place Order')).toBeInTheDocument();
        expect(screen.getByDisplayValue('AAPL')).toBeInTheDocument();
        expect(screen.getByDisplayValue('100')).toBeInTheDocument();
        expect(screen.getByText('Buy Order')).toBeInTheDocument();
        expect(screen.getByText('Sell Order')).toBeInTheDocument();
    });

    test('shows price field for limit orders', () => {
        render(
            <TestWrapper>
                <TradingForm {...defaultProps} orderType="limit" />
            </TestWrapper>
        );

        expect(screen.getByDisplayValue('150')).toBeInTheDocument();
    });

    test('hides price field for market orders', () => {
        render(
            <TestWrapper>
                <TradingForm {...defaultProps} orderType="market" />
            </TestWrapper>
        );

        expect(screen.queryByDisplayValue('150')).not.toBeInTheDocument();
    });

    test('handles symbol change', async () => {
        const user = userEvent.setup();
        render(
            <TestWrapper>
                <TradingForm {...defaultProps} />
            </TestWrapper>
        );

        const symbolInput = screen.getByDisplayValue('AAPL');
        await user.clear(symbolInput);
        await user.type(symbolInput, 'MSFT');

        expect(defaultProps.onSymbolChange).toHaveBeenCalledWith('MSFT');
    });

    test('handles quantity change', async () => {
        const user = userEvent.setup();
        render(
            <TestWrapper>
                <TradingForm {...defaultProps} />
            </TestWrapper>
        );

        const quantityInput = screen.getByDisplayValue('100');
        await user.clear(quantityInput);
        await user.type(quantityInput, '200');

        expect(defaultProps.onQuantityChange).toHaveBeenCalledWith(200);
    });

    test('handles order type change', () => {
        render(
            <TestWrapper>
                <TradingForm {...defaultProps} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('Limit'));
        expect(defaultProps.onOrderTypeChange).toHaveBeenCalledWith('limit');
    });

    test('handles buy order submission', () => {
        render(
            <TestWrapper>
                <TradingForm {...defaultProps} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('Buy Order'));
        expect(defaultProps.onSideChange).toHaveBeenCalledWith('buy');
    });

    test('handles sell order submission', () => {
        render(
            <TestWrapper>
                <TradingForm {...defaultProps} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('Sell Order'));
        expect(defaultProps.onSideChange).toHaveBeenCalledWith('sell');
    });

    test('disables submit when required fields are missing', () => {
        render(
            <TestWrapper>
                <TradingForm {...defaultProps} symbol="" />
            </TestWrapper>
        );

        expect(screen.getByText('Buy Order')).toBeDisabled();
        expect(screen.getByText('Sell Order')).toBeDisabled();
    });

    test('shows loading state', () => {
        render(
            <TestWrapper>
                <TradingForm {...defaultProps} loading />
            </TestWrapper>
        );

        expect(screen.getByText('Buy Order')).toBeInTheDocument();
        expect(screen.getByText('Sell Order')).toBeInTheDocument();
    });

    test('displays errors', () => {
        const errors = ['Invalid symbol', 'Quantity must be positive'];
        render(
            <TestWrapper>
                <TradingForm {...defaultProps} errors={errors} />
            </TestWrapper>
        );

        expect(screen.getByText('Invalid symbol')).toBeInTheDocument();
        expect(screen.getByText('Quantity must be positive')).toBeInTheDocument();
    });

    test('calls onSubmit with form data', () => {
        render(
            <TestWrapper>
                <TradingForm {...defaultProps} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('Buy Order'));

        expect(defaultProps.onSubmit).toHaveBeenCalledWith({
            symbol: 'AAPL',
            quantity: 100,
            price: 150.00,
            orderType: 'market',
            side: 'buy',
        });
    });
});