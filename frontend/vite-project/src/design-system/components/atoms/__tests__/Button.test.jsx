import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import Button from '../Button';
import Icon from '../Icon';

// Test wrapper with theme
const TestWrapper = ({ children }) => (
    <ThemeProvider defaultTheme="light">
        {children}
    </ThemeProvider>
);

describe('Button Component', () => {
    test('renders button with text', () => {
        render(
            <TestWrapper>
                <Button>Click me</Button>
            </TestWrapper>
        );

        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    test('handles click events', () => {
        const handleClick = jest.fn();
        render(
            <TestWrapper>
                <Button onClick={handleClick}>Click me</Button>
            </TestWrapper>
        );

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('supports different variants', () => {
        const { rerender } = render(
            <TestWrapper>
                <Button variant="primary" testId="primary-btn">Primary</Button>
            </TestWrapper>
        );

        expect(screen.getByTestId('primary-btn')).toBeInTheDocument();

        rerender(
            <TestWrapper>
                <Button variant="secondary" testId="secondary-btn">Secondary</Button>
            </TestWrapper>
        );

        expect(screen.getByTestId('secondary-btn')).toBeInTheDocument();
    });

    test('supports different sizes', () => {
        const { rerender } = render(
            <TestWrapper>
                <Button size="sm" testId="small-btn">Small</Button>
            </TestWrapper>
        );

        expect(screen.getByTestId('small-btn')).toBeInTheDocument();

        rerender(
            <TestWrapper>
                <Button size="lg" testId="large-btn">Large</Button>
            </TestWrapper>
        );

        expect(screen.getByTestId('large-btn')).toBeInTheDocument();
    });

    test('shows loading state', () => {
        render(
            <TestWrapper>
                <Button loading testId="loading-btn">Loading</Button>
            </TestWrapper>
        );

        const button = screen.getByTestId('loading-btn');
        expect(button).toHaveAttribute('aria-busy', 'true');
    });

    test('handles disabled state', () => {
        const handleClick = jest.fn();
        render(
            <TestWrapper>
                <Button disabled onClick={handleClick} testId="disabled-btn">
                    Disabled
                </Button>
            </TestWrapper>
        );

        const button = screen.getByTestId('disabled-btn');
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute('aria-disabled', 'true');

        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    test('supports full width', () => {
        render(
            <TestWrapper>
                <Button fullWidth testId="full-width-btn">Full Width</Button>
            </TestWrapper>
        );

        expect(screen.getByTestId('full-width-btn')).toBeInTheDocument();
    });

    test('supports left and right icons', () => {
        render(
            <TestWrapper>
                <Button
                    leftIcon={<Icon name="plus" />}
                    rightIcon={<Icon name="chevronRight" />}
                    testId="icon-btn"
                >
                    With Icons
                </Button>
            </TestWrapper>
        );

        expect(screen.getByTestId('icon-btn')).toBeInTheDocument();
    });

    test('supports keyboard interaction', () => {
        const handleClick = jest.fn();
        render(
            <TestWrapper>
                <Button onClick={handleClick} testId="keyboard-btn">
                    Keyboard Test
                </Button>
            </TestWrapper>
        );

        const button = screen.getByTestId('keyboard-btn');

        // Test Enter key
        fireEvent.keyDown(button, { key: 'Enter' });
        expect(handleClick).toHaveBeenCalledTimes(1);

        // Test Space key
        fireEvent.keyDown(button, { key: ' ' });
        expect(handleClick).toHaveBeenCalledTimes(2);
    });

    test('creates ripple effect on click', async () => {
        render(
            <TestWrapper>
                <Button testId="ripple-btn">Ripple Test</Button>
            </TestWrapper>
        );

        const button = screen.getByTestId('ripple-btn');
        fireEvent.click(button);

        // Check if ripple element is created
        await waitFor(() => {
            const ripple = button.querySelector('.ripple');
            expect(ripple).toBeInTheDocument();
        });
    });

    test('supports accessibility attributes', () => {
        render(
            <TestWrapper>
                <Button ariaLabel="Custom aria label" testId="a11y-btn">
                    Accessible Button
                </Button>
            </TestWrapper>
        );

        const button = screen.getByTestId('a11y-btn');
        expect(button).toHaveAttribute('aria-label', 'Custom aria label');
    });

    test('prevents click when loading', () => {
        const handleClick = jest.fn();
        render(
            <TestWrapper>
                <Button loading onClick={handleClick} testId="loading-btn">
                    Loading Button
                </Button>
            </TestWrapper>
        );

        fireEvent.click(screen.getByTestId('loading-btn'));
        expect(handleClick).not.toHaveBeenCalled();
    });

    test('supports custom className', () => {
        render(
            <TestWrapper>
                <Button className="custom-class" testId="custom-btn">
                    Custom Class
                </Button>
            </TestWrapper>
        );

        expect(screen.getByTestId('custom-btn')).toHaveClass('custom-class');
    });

    test('forwards ref correctly', () => {
        const ref = React.createRef();
        render(
            <TestWrapper>
                <Button ref={ref} testId="ref-btn">Ref Test</Button>
            </TestWrapper>
        );

        expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
});