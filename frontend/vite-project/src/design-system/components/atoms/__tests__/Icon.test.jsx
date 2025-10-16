import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import Icon, { iconNames } from '../Icon';

// Test wrapper with theme
const TestWrapper = ({ children }) => (
    <ThemeProvider defaultTheme="light">
        {children}
    </ThemeProvider>
);

describe('Icon Component', () => {
    test('renders icon with valid name', () => {
        render(
            <TestWrapper>
                <Icon name="search" testId="search-icon" />
            </TestWrapper>
        );

        expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    test('returns null for invalid icon name', () => {
        // Mock console.warn to avoid test output noise
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

        render(
            <TestWrapper>
                <Icon name="invalid-icon" testId="invalid-icon" />
            </TestWrapper>
        );

        expect(screen.queryByTestId('invalid-icon')).not.toBeInTheDocument();
        expect(consoleSpy).toHaveBeenCalledWith(
            'Icon "invalid-icon" not found. Available icons:',
            expect.any(Array)
        );

        consoleSpy.mockRestore();
    });

    test('supports different sizes', () => {
        const { rerender } = render(
            <TestWrapper>
                <Icon name="search" size="sm" testId="small-icon" />
            </TestWrapper>
        );

        expect(screen.getByTestId('small-icon')).toBeInTheDocument();

        rerender(
            <TestWrapper>
                <Icon name="search" size="lg" testId="large-icon" />
            </TestWrapper>
        );

        expect(screen.getByTestId('large-icon')).toBeInTheDocument();
    });

    test('supports different colors', () => {
        const { rerender } = render(
            <TestWrapper>
                <Icon name="search" color="primary" testId="primary-icon" />
            </TestWrapper>
        );

        expect(screen.getByTestId('primary-icon')).toBeInTheDocument();

        rerender(
            <TestWrapper>
                <Icon name="search" color="success" testId="success-icon" />
            </TestWrapper>
        );

        expect(screen.getByTestId('success-icon')).toBeInTheDocument();
    });

    test('supports interactive mode', () => {
        const handleClick = jest.fn();
        render(
            <TestWrapper>
                <Icon
                    name="settings"
                    interactive
                    onClick={handleClick}
                    testId="interactive-icon"
                />
            </TestWrapper>
        );

        const icon = screen.getByTestId('interactive-icon');
        fireEvent.click(icon);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('supports spin animation', () => {
        render(
            <TestWrapper>
                <Icon name="loading" spin testId="spinning-icon" />
            </TestWrapper>
        );

        expect(screen.getByTestId('spinning-icon')).toBeInTheDocument();
    });

    test('auto-spins loading icon', () => {
        render(
            <TestWrapper>
                <Icon name="loading" testId="auto-spin-icon" />
            </TestWrapper>
        );

        expect(screen.getByTestId('auto-spin-icon')).toBeInTheDocument();
    });

    test('supports custom stroke width', () => {
        render(
            <TestWrapper>
                <Icon name="search" strokeWidth={3} testId="stroke-icon" />
            </TestWrapper>
        );

        expect(screen.getByTestId('stroke-icon')).toBeInTheDocument();
    });

    test('handles mouse events', () => {
        const handleMouseEnter = jest.fn();
        const handleMouseLeave = jest.fn();

        render(
            <TestWrapper>
                <Icon
                    name="search"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    testId="mouse-icon"
                />
            </TestWrapper>
        );

        const icon = screen.getByTestId('mouse-icon');

        fireEvent.mouseEnter(icon);
        expect(handleMouseEnter).toHaveBeenCalledTimes(1);

        fireEvent.mouseLeave(icon);
        expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });

    test('supports accessibility attributes', () => {
        render(
            <TestWrapper>
                <Icon
                    name="search"
                    ariaLabel="Search icon"
                    ariaHidden={false}
                    testId="a11y-icon"
                />
            </TestWrapper>
        );

        const icon = screen.getByTestId('a11y-icon');
        expect(icon).toHaveAttribute('aria-label', 'Search icon');
        expect(icon).toHaveAttribute('aria-hidden', 'false');
    });

    test('defaults to aria-hidden true', () => {
        render(
            <TestWrapper>
                <Icon name="search" testId="hidden-icon" />
            </TestWrapper>
        );

        expect(screen.getByTestId('hidden-icon')).toHaveAttribute('aria-hidden', 'true');
    });

    test('supports custom className', () => {
        render(
            <TestWrapper>
                <Icon name="search" className="custom-class" testId="custom-icon" />
            </TestWrapper>
        );

        expect(screen.getByTestId('custom-icon')).toHaveClass('custom-class');
    });

    test('forwards ref correctly', () => {
        const ref = React.createRef();
        render(
            <TestWrapper>
                <Icon name="search" ref={ref} testId="ref-icon" />
            </TestWrapper>
        );

        expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });

    test('exports available icon names', () => {
        expect(iconNames).toBeInstanceOf(Array);
        expect(iconNames.length).toBeGreaterThan(0);
        expect(iconNames).toContain('search');
        expect(iconNames).toContain('trendUp');
        expect(iconNames).toContain('candlestick');
    });

    test('includes trading-specific icons', () => {
        const tradingIcons = ['trendUp', 'trendDown', 'candlestick', 'volume', 'dollar', 'percent'];

        tradingIcons.forEach(iconName => {
            expect(iconNames).toContain(iconName);
        });
    });

    test('includes common UI icons', () => {
        const uiIcons = ['search', 'settings', 'close', 'menu', 'plus', 'minus', 'check'];

        uiIcons.forEach(iconName => {
            expect(iconNames).toContain(iconName);
        });
    });

    test('renders trading icons correctly', () => {
        const tradingIcons = ['trendUp', 'trendDown', 'candlestick', 'volume'];

        tradingIcons.forEach(iconName => {
            const { unmount } = render(
                <TestWrapper>
                    <Icon name={iconName} testId={`${iconName}-icon`} />
                </TestWrapper>
            );

            expect(screen.getByTestId(`${iconName}-icon`)).toBeInTheDocument();
            unmount();
        });
    });

    test('supports trading color variants', () => {
        const { rerender } = render(
            <TestWrapper>
                <Icon name="trendUp" color="bull" testId="bull-icon" />
            </TestWrapper>
        );

        expect(screen.getByTestId('bull-icon')).toBeInTheDocument();

        rerender(
            <TestWrapper>
                <Icon name="trendDown" color="bear" testId="bear-icon" />
            </TestWrapper>
        );

        expect(screen.getByTestId('bear-icon')).toBeInTheDocument();
    });
});