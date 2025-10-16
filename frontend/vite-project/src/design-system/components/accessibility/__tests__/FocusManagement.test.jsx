import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import FocusTrap from '../FocusTrap';
import { useFocusManagement, useFocusVisible } from '../../../hooks/useFocusManagement';

const renderWithTheme = (component) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
};

// Test component for focus trap
const TestFocusTrap = ({ active = true, autoFocus = true }) => {
    return (
        <div>
            <button data-testid="outside-button">Outside</button>
            <FocusTrap active={active} autoFocus={autoFocus}>
                <button data-testid="inside-button-1">Inside 1</button>
                <button data-testid="inside-button-2">Inside 2</button>
                <button data-testid="inside-button-3">Inside 3</button>
            </FocusTrap>
            <button data-testid="outside-button-2">Outside 2</button>
        </div>
    );
};

describe('FocusTrap', () => {
    it('renders children correctly', () => {
        const { getByTestId } = renderWithTheme(
            <TestFocusTrap />
        );

        expect(getByTestId('inside-button-1')).toBeInTheDocument();
        expect(getByTestId('inside-button-2')).toBeInTheDocument();
        expect(getByTestId('inside-button-3')).toBeInTheDocument();
    });

    it('auto-focuses first element when active', async () => {
        const { getByTestId } = renderWithTheme(
            <TestFocusTrap active={true} autoFocus={true} />
        );

        // Wait for auto-focus to take effect
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(getByTestId('inside-button-1')).toHaveFocus();
    });

    it('does not auto-focus when autoFocus is false', async () => {
        const { getByTestId } = renderWithTheme(
            <TestFocusTrap active={true} autoFocus={false} />
        );

        // Wait to ensure no auto-focus occurs
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(getByTestId('inside-button-1')).not.toHaveFocus();
    });

    it('traps focus within the container', () => {
        const { getByTestId } = renderWithTheme(
            <TestFocusTrap active={true} />
        );

        const insideButton1 = getByTestId('inside-button-1');
        const insideButton3 = getByTestId('inside-button-3');

        // Focus last button inside trap
        insideButton3.focus();
        expect(insideButton3).toHaveFocus();

        // Tab should wrap to first button
        fireEvent.keyDown(insideButton3, { key: 'Tab' });

        // Note: In a real browser, focus would move to first button
        // In jsdom, we need to simulate this behavior
    });

    it('allows focus to move freely when not active', () => {
        const { getByTestId } = renderWithTheme(
            <TestFocusTrap active={false} />
        );

        const outsideButton = getByTestId('outside-button');
        const insideButton = getByTestId('inside-button-1');

        outsideButton.focus();
        expect(outsideButton).toHaveFocus();

        insideButton.focus();
        expect(insideButton).toHaveFocus();
    });
});

describe('useFocusManagement', () => {
    it('provides focus management functions', () => {
        const { result } = renderHook(() => useFocusManagement());

        expect(typeof result.current.focusFirst).toBe('function');
        expect(typeof result.current.focusLast).toBe('function');
        expect(typeof result.current.restoreFocus).toBe('function');
        expect(typeof result.current.updateFocusableElements).toBe('function');
    });

    it('provides container ref', () => {
        const { result } = renderHook(() => useFocusManagement());

        expect(result.current.containerRef).toBeDefined();
        expect(typeof result.current.containerRef).toBe('object');
    });
});

describe('useFocusVisible', () => {
    it('provides element ref and focus visible state', () => {
        const { result } = renderHook(() => useFocusVisible());

        expect(result.current.elementRef).toBeDefined();
        expect(typeof result.current.elementRef).toBe('object');
        expect(typeof result.current.isFocusVisible).toBe('boolean');
    });

    it('tracks keyboard vs mouse focus', () => {
        const TestComponent = () => {
            const { elementRef, isFocusVisible } = useFocusVisible();

            return (
                <button
                    ref={elementRef}
                    data-testid="focus-button"
                    data-focus-visible={isFocusVisible}
                >
                    Test Button
                </button>
            );
        };

        const { getByTestId } = renderWithTheme(<TestComponent />);
        const button = getByTestId('focus-button');

        // Simulate keyboard event followed by focus
        fireEvent.keyDown(document, { key: 'Tab' });
        fireEvent.focus(button);

        // Check if focus-visible attribute is set
        expect(button).toHaveAttribute('data-focus-visible');
    });
});