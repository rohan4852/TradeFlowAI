import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import { useKeyboardNavigation, useRovingTabIndex } from '../../../hooks/useKeyboardNavigation';

const renderWithTheme = (component) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
};

// Test component for keyboard navigation
const TestKeyboardComponent = ({ onArrowUp, onArrowDown, onEnter, onEscape }) => {
    const { containerRef } = useKeyboardNavigation({
        onArrowUp,
        onArrowDown,
        onEnter,
        onEscape,
        enabled: true
    });

    return (
        <div ref={containerRef} data-testid="keyboard-container">
            <button>Button 1</button>
            <button>Button 2</button>
            <button>Button 3</button>
        </div>
    );
};

// Test component for roving tabindex
const TestRovingTabIndex = () => {
    const { containerRef } = useRovingTabIndex({
        enabled: true,
        orientation: 'horizontal'
    });

    return (
        <div ref={containerRef} data-testid="roving-container">
            <button>Item 1</button>
            <button>Item 2</button>
            <button>Item 3</button>
        </div>
    );
};

describe('useKeyboardNavigation', () => {
    it('calls onArrowUp when arrow up is pressed', () => {
        const onArrowUp = jest.fn();
        const { getByTestId } = renderWithTheme(
            <TestKeyboardComponent onArrowUp={onArrowUp} />
        );

        const container = getByTestId('keyboard-container');
        fireEvent.keyDown(container, { key: 'ArrowUp' });

        expect(onArrowUp).toHaveBeenCalled();
    });

    it('calls onArrowDown when arrow down is pressed', () => {
        const onArrowDown = jest.fn();
        const { getByTestId } = renderWithTheme(
            <TestKeyboardComponent onArrowDown={onArrowDown} />
        );

        const container = getByTestId('keyboard-container');
        fireEvent.keyDown(container, { key: 'ArrowDown' });

        expect(onArrowDown).toHaveBeenCalled();
    });

    it('calls onEnter when enter is pressed', () => {
        const onEnter = jest.fn();
        const { getByTestId } = renderWithTheme(
            <TestKeyboardComponent onEnter={onEnter} />
        );

        const container = getByTestId('keyboard-container');
        fireEvent.keyDown(container, { key: 'Enter' });

        expect(onEnter).toHaveBeenCalled();
    });

    it('calls onEscape when escape is pressed', () => {
        const onEscape = jest.fn();
        const { getByTestId } = renderWithTheme(
            <TestKeyboardComponent onEscape={onEscape} />
        );

        const container = getByTestId('keyboard-container');
        fireEvent.keyDown(container, { key: 'Escape' });

        expect(onEscape).toHaveBeenCalled();
    });

    it('provides focus management functions', () => {
        const { result } = renderHook(() => useKeyboardNavigation());

        expect(typeof result.current.focusFirst).toBe('function');
        expect(typeof result.current.focusLast).toBe('function');
        expect(typeof result.current.focusNext).toBe('function');
        expect(typeof result.current.focusPrevious).toBe('function');
    });
});

describe('useRovingTabIndex', () => {
    it('sets up roving tabindex on container children', () => {
        const { getByTestId } = renderWithTheme(<TestRovingTabIndex />);
        const container = getByTestId('roving-container');
        const buttons = container.querySelectorAll('button');

        // First button should have tabindex="0", others should have tabindex="-1"
        expect(buttons[0]).toHaveAttribute('tabindex', '0');
        expect(buttons[1]).toHaveAttribute('tabindex', '-1');
        expect(buttons[2]).toHaveAttribute('tabindex', '-1');
    });

    it('moves focus with arrow keys', () => {
        const { getByTestId } = renderWithTheme(<TestRovingTabIndex />);
        const container = getByTestId('roving-container');
        const buttons = container.querySelectorAll('button');

        // Focus first button
        buttons[0].focus();

        // Press right arrow
        fireEvent.keyDown(container, { key: 'ArrowRight' });

        // Second button should now have tabindex="0"
        expect(buttons[1]).toHaveAttribute('tabindex', '0');
        expect(buttons[0]).toHaveAttribute('tabindex', '-1');
    });

    it('wraps around when reaching the end', () => {
        const { getByTestId } = renderWithTheme(<TestRovingTabIndex />);
        const container = getByTestId('roving-container');
        const buttons = container.querySelectorAll('button');

        // Focus last button
        buttons[2].focus();

        // Manually set tabindex to simulate being at the end
        buttons[2].setAttribute('tabindex', '0');
        buttons[0].setAttribute('tabindex', '-1');
        buttons[1].setAttribute('tabindex', '-1');

        // Press right arrow (should wrap to first)
        fireEvent.keyDown(container, { key: 'ArrowRight' });

        // First button should now have tabindex="0"
        expect(buttons[0]).toHaveAttribute('tabindex', '0');
        expect(buttons[2]).toHaveAttribute('tabindex', '-1');
    });
});