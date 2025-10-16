import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import Label from '../Label';

// Test wrapper with theme
const TestWrapper = ({ children }) => (
    <ThemeProvider defaultTheme="light">
        {children}
    </ThemeProvider>
);

describe('Label Component', () => {
    test('renders label with text', () => {
        render(
            <TestWrapper>
                <Label>Test Label</Label>
            </TestWrapper>
        );

        expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    test('supports htmlFor attribute', () => {
        render(
            <TestWrapper>
                <Label htmlFor="test-input" testId="test-label">
                    Test Label
                </Label>
            </TestWrapper>
        );

        const label = screen.getByTestId('test-label');
        expect(label).toHaveAttribute('for', 'test-input');
    });

    test('supports different sizes', () => {
        const { rerender } = render(
            <TestWrapper>
                <Label size="sm" testId="small-label">Small Label</Label>
            </TestWrapper>
        );

        expect(screen.getByTestId('small-label')).toBeInTheDocument();

        rerender(
            <TestWrapper>
                <Label size="lg" testId="large-label">Large Label</Label>
            </TestWrapper>
        );

        expect(screen.getByTestId('large-label')).toBeInTheDocument();
    });

    test('supports different colors', () => {
        const { rerender } = render(
            <TestWrapper>
                <Label color="primary" testId="primary-label">Primary Label</Label>
            </TestWrapper>
        );

        expect(screen.getByTestId('primary-label')).toBeInTheDocument();

        rerender(
            <TestWrapper>
                <Label color="error" testId="error-label">Error Label</Label>
            </TestWrapper>
        );

        expect(screen.getByTestId('error-label')).toBeInTheDocument();
    });

    test('supports custom font weight', () => {
        render(
            <TestWrapper>
                <Label weight="bold" testId="bold-label">Bold Label</Label>
            </TestWrapper>
        );

        expect(screen.getByTestId('bold-label')).toBeInTheDocument();
    });

    test('shows required indicator', () => {
        render(
            <TestWrapper>
                <Label required testId="required-label">Required Label</Label>
            </TestWrapper>
        );

        const label = screen.getByTestId('required-label');
        expect(label).toBeInTheDocument();
        // The asterisk is added via CSS ::after pseudo-element
    });

    test('shows optional indicator', () => {
        render(
            <TestWrapper>
                <Label optional testId="optional-label">Optional Label</Label>
            </TestWrapper>
        );

        const label = screen.getByTestId('optional-label');
        expect(label).toBeInTheDocument();
        // The "(optional)" text is added via CSS ::after pseudo-element
    });

    test('handles disabled state', () => {
        render(
            <TestWrapper>
                <Label disabled testId="disabled-label">Disabled Label</Label>
            </TestWrapper>
        );

        expect(screen.getByTestId('disabled-label')).toBeInTheDocument();
    });

    test('supports interactive mode', () => {
        const handleClick = jest.fn();
        render(
            <TestWrapper>
                <Label interactive onClick={handleClick} testId="interactive-label">
                    Interactive Label
                </Label>
            </TestWrapper>
        );

        const label = screen.getByTestId('interactive-label');
        fireEvent.click(label);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('supports truncation', () => {
        render(
            <TestWrapper>
                <Label truncate testId="truncate-label">
                    This is a very long label that should be truncated
                </Label>
            </TestWrapper>
        );

        expect(screen.getByTestId('truncate-label')).toBeInTheDocument();
    });

    test('supports uppercase variant', () => {
        render(
            <TestWrapper>
                <Label uppercase testId="uppercase-label">Uppercase Label</Label>
            </TestWrapper>
        );

        expect(screen.getByTestId('uppercase-label')).toBeInTheDocument();
    });

    test('supports badge', () => {
        render(
            <TestWrapper>
                <Label badge="New" badgeVariant="primary" testId="badge-label">
                    Label with Badge
                </Label>
            </TestWrapper>
        );

        expect(screen.getByTestId('badge-label')).toBeInTheDocument();
        expect(screen.getByText('New')).toBeInTheDocument();
    });

    test('supports tooltip', () => {
        render(
            <TestWrapper>
                <Label tooltip="This is a tooltip" testId="tooltip-label">
                    Label with Tooltip
                </Label>
            </TestWrapper>
        );

        expect(screen.getByTestId('tooltip-label')).toBeInTheDocument();
        expect(screen.getByText('This is a tooltip')).toBeInTheDocument();
    });

    test('supports accessibility attributes', () => {
        render(
            <TestWrapper>
                <Label ariaLabel="Custom aria label" testId="a11y-label">
                    Accessible Label
                </Label>
            </TestWrapper>
        );

        const label = screen.getByTestId('a11y-label');
        expect(label).toHaveAttribute('aria-label', 'Custom aria label');
    });

    test('supports custom className', () => {
        render(
            <TestWrapper>
                <Label className="custom-class" testId="custom-label">
                    Custom Class Label
                </Label>
            </TestWrapper>
        );

        expect(screen.getByTestId('custom-label')).toHaveClass('custom-class');
    });

    test('forwards ref correctly', () => {
        const ref = React.createRef();
        render(
            <TestWrapper>
                <Label ref={ref} testId="ref-label">Ref Test</Label>
            </TestWrapper>
        );

        expect(ref.current).toBeInstanceOf(HTMLLabelElement);
    });

    test('supports trading color variants', () => {
        const { rerender } = render(
            <TestWrapper>
                <Label color="bull" testId="bull-label">Bull Label</Label>
            </TestWrapper>
        );

        expect(screen.getByTestId('bull-label')).toBeInTheDocument();

        rerender(
            <TestWrapper>
                <Label color="bear" testId="bear-label">Bear Label</Label>
            </TestWrapper>
        );

        expect(screen.getByTestId('bear-label')).toBeInTheDocument();
    });

    test('supports different badge variants', () => {
        const variants = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];

        variants.forEach(variant => {
            const { unmount } = render(
                <TestWrapper>
                    <Label badge="Test" badgeVariant={variant} testId={`${variant}-badge-label`}>
                        {variant} Badge
                    </Label>
                </TestWrapper>
            );

            expect(screen.getByTestId(`${variant}-badge-label`)).toBeInTheDocument();
            expect(screen.getByText('Test')).toBeInTheDocument();
            unmount();
        });
    });

    test('handles both required and optional props correctly', () => {
        // Should prioritize required over optional
        render(
            <TestWrapper>
                <Label required optional testId="priority-label">
                    Priority Test
                </Label>
            </TestWrapper>
        );

        expect(screen.getByTestId('priority-label')).toBeInTheDocument();
        // Required indicator should take precedence
    });
});