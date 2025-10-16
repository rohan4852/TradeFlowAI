import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../ThemeProvider';
import Input from '../Input';
import Icon from '../Icon';

// Test wrapper with theme
const TestWrapper = ({ children }) => (
    <ThemeProvider defaultTheme="light">
        {children}
    </ThemeProvider>
);

describe('Input Component', () => {
    test('renders input with label', () => {
        render(
            <TestWrapper>
                <Input label="Test Label" testId="test-input" />
            </TestWrapper>
        );

        expect(screen.getByLabelText(/test label/i)).toBeInTheDocument();
        expect(screen.getByTestId('test-input')).toBeInTheDocument();
    });

    test('handles value changes', async () => {
        const user = userEvent.setup();
        const handleChange = jest.fn();

        render(
            <TestWrapper>
                <Input onChange={handleChange} testId="change-input" />
            </TestWrapper>
        );

        const input = screen.getByTestId('change-input');
        await user.type(input, 'test value');

        expect(handleChange).toHaveBeenCalled();
        expect(input).toHaveValue('test value');
    });

    test('supports different input types', () => {
        const { rerender } = render(
            <TestWrapper>
                <Input type="email" testId="email-input" />
            </TestWrapper>
        );

        expect(screen.getByTestId('email-input')).toHaveAttribute('type', 'email');

        rerender(
            <TestWrapper>
                <Input type="password" testId="password-input" />
            </TestWrapper>
        );

        expect(screen.getByTestId('password-input')).toHaveAttribute('type', 'password');
    });

    test('supports different sizes', () => {
        const { rerender } = render(
            <TestWrapper>
                <Input size="sm" testId="small-input" />
            </TestWrapper>
        );

        expect(screen.getByTestId('small-input')).toBeInTheDocument();

        rerender(
            <TestWrapper>
                <Input size="lg" testId="large-input" />
            </TestWrapper>
        );

        expect(screen.getByTestId('large-input')).toBeInTheDocument();
    });

    test('supports different variants', () => {
        const { rerender } = render(
            <TestWrapper>
                <Input variant="filled" testId="filled-input" />
            </TestWrapper>
        );

        expect(screen.getByTestId('filled-input')).toBeInTheDocument();

        rerender(
            <TestWrapper>
                <Input variant="outline" testId="outline-input" />
            </TestWrapper>
        );

        expect(screen.getByTestId('outline-input')).toBeInTheDocument();
    });

    test('shows error state', () => {
        render(
            <TestWrapper>
                <Input error errorMessage="This field is required" testId="error-input" />
            </TestWrapper>
        );

        const input = screen.getByTestId('error-input');
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    test('shows helper text', () => {
        render(
            <TestWrapper>
                <Input helperText="Enter your email address" testId="helper-input" />
            </TestWrapper>
        );

        expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });

    test('handles disabled state', () => {
        render(
            <TestWrapper>
                <Input disabled testId="disabled-input" />
            </TestWrapper>
        );

        expect(screen.getByTestId('disabled-input')).toBeDisabled();
    });

    test('handles readonly state', () => {
        render(
            <TestWrapper>
                <Input readOnly value="readonly value" testId="readonly-input" />
            </TestWrapper>
        );

        const input = screen.getByTestId('readonly-input');
        expect(input).toHaveAttribute('readonly');
        expect(input).toHaveValue('readonly value');
    });

    test('supports required field', () => {
        render(
            <TestWrapper>
                <Input required label="Required Field" testId="required-input" />
            </TestWrapper>
        );

        const input = screen.getByTestId('required-input');
        expect(input).toBeRequired();
        expect(screen.getByText(/required field/i)).toBeInTheDocument();
    });

    test('supports left and right icons', () => {
        render(
            <TestWrapper>
                <Input
                    leftIcon={<Icon name="search" />}
                    rightIcon={<Icon name="eye" />}
                    testId="icon-input"
                />
            </TestWrapper>
        );

        expect(screen.getByTestId('icon-input')).toBeInTheDocument();
    });

    test('handles focus and blur events', () => {
        const handleFocus = jest.fn();
        const handleBlur = jest.fn();

        render(
            <TestWrapper>
                <Input
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    testId="focus-input"
                />
            </TestWrapper>
        );

        const input = screen.getByTestId('focus-input');

        fireEvent.focus(input);
        expect(handleFocus).toHaveBeenCalledTimes(1);

        fireEvent.blur(input);
        expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    test('supports placeholder text', () => {
        render(
            <TestWrapper>
                <Input placeholder="Enter text here" testId="placeholder-input" />
            </TestWrapper>
        );

        expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument();
    });

    test('supports autoComplete', () => {
        render(
            <TestWrapper>
                <Input autoComplete="email" testId="autocomplete-input" />
            </TestWrapper>
        );

        expect(screen.getByTestId('autocomplete-input')).toHaveAttribute('autocomplete', 'email');
    });

    test('supports maxLength and minLength', () => {
        render(
            <TestWrapper>
                <Input maxLength={10} minLength={3} testId="length-input" />
            </TestWrapper>
        );

        const input = screen.getByTestId('length-input');
        expect(input).toHaveAttribute('maxlength', '10');
        expect(input).toHaveAttribute('minlength', '3');
    });

    test('supports pattern validation', () => {
        render(
            <TestWrapper>
                <Input pattern="[0-9]*" testId="pattern-input" />
            </TestWrapper>
        );

        expect(screen.getByTestId('pattern-input')).toHaveAttribute('pattern', '[0-9]*');
    });

    test('supports accessibility attributes', () => {
        render(
            <TestWrapper>
                <Input
                    ariaLabel="Custom aria label"
                    ariaDescribedBy="custom-description"
                    testId="a11y-input"
                />
            </TestWrapper>
        );

        const input = screen.getByTestId('a11y-input');
        expect(input).toHaveAttribute('aria-label', 'Custom aria label');
        expect(input).toHaveAttribute('aria-describedby', 'custom-description');
    });

    test('forwards ref correctly', () => {
        const ref = React.createRef();
        render(
            <TestWrapper>
                <Input ref={ref} testId="ref-input" />
            </TestWrapper>
        );

        expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    test('handles keyboard events', () => {
        const handleKeyDown = jest.fn();

        render(
            <TestWrapper>
                <Input onKeyDown={handleKeyDown} testId="keyboard-input" />
            </TestWrapper>
        );

        const input = screen.getByTestId('keyboard-input');
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    test('prioritizes error message over helper text', () => {
        render(
            <TestWrapper>
                <Input
                    helperText="Helper text"
                    errorMessage="Error message"
                    error
                    testId="priority-input"
                />
            </TestWrapper>
        );

        expect(screen.getByText('Error message')).toBeInTheDocument();
        expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });
});