import React from 'react';
import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../design-system/ThemeProvider';
import { DragDropProvider } from '../design-system/components/providers/DragDropProvider';
import { RealTimeDataProvider } from '../design-system/components/providers/RealTimeDataProvider';
import { vi } from 'vitest';

// Default theme for testing
const defaultTheme = 'light';

// Test wrapper with all necessary providers
export const TestWrapper = ({
    children,
    theme = defaultTheme,
    withDragDrop = false,
    withRealTimeData = false,
    mockWebSocket = true
}) => {
    let wrappedChildren = (
        <ThemeProvider defaultTheme={theme}>
            {children}
        </ThemeProvider>
    );

    if (withDragDrop) {
        wrappedChildren = (
            <DragDropProvider>
                {wrappedChildren}
            </DragDropProvider>
        );
    }

    if (withRealTimeData) {
        const mockWebSocketUrl = mockWebSocket ? 'ws://localhost:8080/test' : undefined;
        wrappedChildren = (
            <RealTimeDataProvider websocketUrl={mockWebSocketUrl}>
                {wrappedChildren}
            </RealTimeDataProvider>
        );
    }

    return wrappedChildren;
};

// Enhanced render function with custom options
export const render = (ui, options = {}) => {
    const {
        theme = defaultTheme,
        withDragDrop = false,
        withRealTimeData = false,
        mockWebSocket = true,
        ...renderOptions
    } = options;

    const Wrapper = ({ children }) => (
        <TestWrapper
            theme={theme}
            withDragDrop={withDragDrop}
            withRealTimeData={withRealTimeData}
            mockWebSocket={mockWebSocket}
        >
            {children}
        </TestWrapper>
    );

    return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
};

// Render with theme variations
export const renderWithThemes = (ui, themes = ['light', 'dark']) => {
    return themes.map(theme => ({
        theme,
        result: render(ui, { theme })
    }));
};

// Render with drag and drop context
export const renderWithDragDrop = (ui, options = {}) => {
    return render(ui, { withDragDrop: true, ...options });
};

// Render with real-time data context
export const renderWithRealTimeData = (ui, options = {}) => {
    return render(ui, { withRealTimeData: true, ...options });
};

// Render with all providers
export const renderWithAllProviders = (ui, options = {}) => {
    return render(ui, {
        withDragDrop: true,
        withRealTimeData: true,
        ...options
    });
};

// Wait for component to be ready (useful for async components)
export const waitForComponentReady = async (testId, timeout = 5000) => {
    await waitFor(
        () => {
            const element = screen.getByTestId(testId);
            expect(element).toBeInTheDocument();
            return element;
        },
        { timeout }
    );
};

// Wait for animations to complete
export const waitForAnimations = async (duration = 1000) => {
    await new Promise(resolve => setTimeout(resolve, duration));
};

// Mock user interactions
export const createMockUser = () => userEvent.setup();

// Mock component props
export const createMockProps = (overrides = {}) => ({
    testId: 'test-component',
    ...overrides
});

// Mock event handlers
export const createMockHandlers = () => ({
    onClick: vi.fn(),
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    onFocus: vi.fn(),
    onBlur: vi.fn(),
    onMouseEnter: vi.fn(),
    onMouseLeave: vi.fn(),
    onKeyDown: vi.fn(),
    onKeyUp: vi.fn(),
});

// Mock data generators
export const generateMockData = (type, count = 1) => {
    const generators = {
        candlestick: () => ({
            time: Date.now(),
            open: Math.random() * 100 + 100,
            high: Math.random() * 100 + 150,
            low: Math.random() * 100 + 50,
            close: Math.random() * 100 + 100,
            volume: Math.random() * 1000000
        }),
        orderLevel: () => ({
            price: Math.random() * 100 + 100,
            size: Math.random() * 1000,
            count: Math.floor(Math.random() * 10) + 1
        }),
        trade: () => ({
            id: Math.random().toString(36).substr(2, 9),
            price: Math.random() * 100 + 100,
            size: Math.random() * 1000,
            side: Math.random() > 0.5 ? 'buy' : 'sell',
            timestamp: Date.now()
        }),
        prediction: () => ({
            id: Math.random().toString(36).substr(2, 9),
            symbol: 'AAPL',
            prediction: Math.random() > 0.5 ? 'bullish' : 'bearish',
            confidence: Math.random(),
            timeframe: '1h',
            timestamp: Date.now()
        })
    };

    const generator = generators[type];
    if (!generator) {
        throw new Error(`Unknown data type: ${type}`);
    }

    return Array.from({ length: count }, generator);
};

// Test component lifecycle
export const testComponentLifecycle = async (Component, props = {}) => {
    const { rerender, unmount } = render(<Component {...props} />);

    // Test initial render
    expect(screen.getByTestId(props.testId || 'test-component')).toBeInTheDocument();

    // Test re-render with new props
    const newProps = { ...props, updated: true };
    rerender(<Component {...newProps} />);

    // Test unmount
    unmount();
    expect(screen.queryByTestId(props.testId || 'test-component')).not.toBeInTheDocument();
};

// Custom matchers for design system components
export const customMatchers = {
    toHaveGlassEffect: (received) => {
        const hasBackdropFilter = getComputedStyle(received).backdropFilter !== 'none';
        const hasOpacity = parseFloat(getComputedStyle(received).opacity) < 1;

        return {
            message: () => `expected element to have glass effect`,
            pass: hasBackdropFilter && hasOpacity
        };
    },

    toHaveRippleEffect: (received) => {
        const rippleElement = received.querySelector('.ripple');
        return {
            message: () => `expected element to have ripple effect`,
            pass: rippleElement !== null
        };
    },

    toBeAccessible: async (received) => {
        const hasAriaLabel = received.hasAttribute('aria-label') || received.hasAttribute('aria-labelledby');
        const hasRole = received.hasAttribute('role') || received.tagName.toLowerCase() in ['button', 'input', 'select', 'textarea'];
        const isFocusable = received.tabIndex >= 0 || received.hasAttribute('tabindex');

        return {
            message: () => `expected element to be accessible`,
            pass: hasAriaLabel && hasRole && isFocusable
        };
    }
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { userEvent };