// Design System Entry Point
// Exports all design system components, tokens, and utilities

// Core theme and tokens
import { designTokens as _designTokens, lightTheme as _lightTheme, darkTheme as _darkTheme } from './tokens';
import { ThemeProvider as _ThemeProvider, useTheme as _useTheme, breakpoint as _breakpoint, getThemeValue as _getThemeValue } from './ThemeProvider';

export { designTokens, lightTheme, darkTheme } from './tokens';
export { ThemeProvider, useTheme, breakpoint, getThemeValue } from './ThemeProvider';

// Atomic components
export { Button, Input, Icon, Label, iconNames } from './components/atoms';

// Molecular components
export {
    FormGroup, Field, Section, InlineForm, TradingForm,
    Navigation, NavGroup, Breadcrumb, Tabs, MobileNavigation,
    Card, MetricCard, InfoCard, TradingCard, StatsCard,
    ChartControls, TechnicalIndicators, ChartOverlay, PREDEFINED_INDICATORS
} from './components/molecules';

// Organism components with fallbacks
let CandlestickChart, OrderBook, Widget, GridLayout;

try {
    const organisms = require('./components/organisms');
    CandlestickChart = organisms.CandlestickChart;
    OrderBook = organisms.OrderBook;
    Widget = organisms.Widget;
    GridLayout = organisms.GridLayout;
} catch (error) {
    console.warn('Failed to load organism components, using fallbacks:', error);
    // Create simple fallback components without JSX
    CandlestickChart = () => null;
    OrderBook = () => null;
    Widget = () => null;
    GridLayout = ({ children }) => children;
}

export {
    CandlestickChart,
    OrderBook,
    Widget,
    GridLayout
};

// Trading widgets
export {
    PortfolioWidget,
    WatchlistWidget,
    NewsWidget,
    AlertsWidget
} from './components/organisms/widgets';

// AI components
export {
    PredictionCard,
    PredictionTimeline,
    RecommendationPanel,
    ConfidenceIndicator,
    PredictionFilters,
    AnalysisProgressIndicator
} from './components/organisms/ai';

// Accessibility components and hooks
export {
    ScreenReaderOnly,
    LiveRegion,
    FocusTrap,
    SkipLink,
    SkipLinks,
    KeyboardShortcuts,
    useKeyboardShortcuts,
    useKeyboardNavigation,
    useRovingTabIndex,
    useFocusManagement,
    useFocusVisible,
    useFocusRegion,
    useScreenReader,
    useAriaAttributes,
    useLiveRegion,
    useTradingAnnouncements,
    useScreenReaderDetection,
    accessibilityUtils
} from './components/accessibility';

// Accessibility testing utilities (commented out due to optional dependencies)
// export { default as AccessibilityTester, useAccessibilityTester } from './components/accessibility/AccessibilityTester';
// export * from './utils/accessibilityTesting';
// export * from './utils/testUtils/accessibilityTestUtils';

// Effects system
export * from './effects';

// Utilities
export * from './utils/technicalIndicators';
export { default as WebSocketManager, useWebSocket, WS_STATES, MESSAGE_TYPES } from './utils/websocketManager';
export * from './utils/ai';

// Providers
export {
    RealTimeDataProvider,
    useRealTimeData,
    useSymbolData,
    usePriceSubscription,
    useOrderbookSubscription,
    usePerformantRealTimeData,
    DragDropProvider,
    useDragDrop,
    useDraggable,
    useDropZone
} from './components/providers';

// Examples
export * from './examples';

// Types (for JSDoc documentation)
export * from './types';

// Utility functions
export const spacing = (multiplier, theme) => {
    const baseSpacing = parseFloat(theme.spacing[4]); // 1rem = 16px
    return `${baseSpacing * multiplier}rem`;
};

export const rgba = (color, alpha) => {
    // Convert hex to rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const glassmorphism = (theme, intensity = 'medium') => {
    const intensityMap = {
        light: {
            background: theme.color.glass.light,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${rgba(theme.color.neutral[200], 0.2)}`,
        },
        medium: {
            background: theme.color.glass.medium,
            backdropFilter: 'blur(16px)',
            border: `1px solid ${rgba(theme.color.neutral[200], 0.3)}`,
        },
        strong: {
            background: rgba(theme.color.neutral[100], 0.3),
            backdropFilter: 'blur(24px)',
            border: `1px solid ${rgba(theme.color.neutral[200], 0.4)}`,
        },
    };

    return {
        ...intensityMap[intensity],
        boxShadow: theme.shadows.glass,
        borderRadius: theme.borderRadius.lg,
    };
};

export const focusRing = (theme, color = 'primary') => ({
    outline: 'none',
    boxShadow: `0 0 0 3px ${rgba(theme.color[color][500], 0.3)}`,
    borderColor: theme.color[color][500],
});

export const transition = (properties = 'all', duration = 'normal', easing = 'easeInOut', theme) => {
    const props = Array.isArray(properties) ? properties.join(', ') : properties;
    return `${props} ${theme.animation.duration[duration]} ${theme.animation.easing[easing]}`;
};

// Animation presets
export const animations = {
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },
    slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    },
    slideDown: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
    },
    scale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
    },
    spring: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
    },
};

// Trading-specific utilities
export const getTradingColor = (value, theme, neutral = 0) => {
    if (value > neutral) return theme.color.trading.bull;
    if (value < neutral) return theme.color.trading.bear;
    return theme.color.trading.neutral;
};

export const formatPrice = (price, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(price);
};

export const formatVolume = (volume) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toString();
};

export const formatPercentage = (value, decimals = 2) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
};

// Accessibility utilities
export const visuallyHidden = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
};

export const screenReaderOnly = visuallyHidden;

// Performance utilities
export const shouldReduceMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const getOptimalUpdateFrequency = (dataSize) => {
    // Reduce update frequency for large datasets to maintain performance
    if (dataSize > 10000) return 100; // 10 FPS
    if (dataSize > 1000) return 33;   // 30 FPS
    return 16; // 60 FPS
};

// Component size variants
export const sizeVariants = {
    xs: {
        padding: '0.25rem 0.5rem',
        fontSize: '0.75rem',
        height: '1.5rem',
    },
    sm: {
        padding: '0.375rem 0.75rem',
        fontSize: '0.875rem',
        height: '2rem',
    },
    md: {
        padding: '0.5rem 1rem',
        fontSize: '1rem',
        height: '2.5rem',
    },
    lg: {
        padding: '0.75rem 1.5rem',
        fontSize: '1.125rem',
        height: '3rem',
    },
    xl: {
        padding: '1rem 2rem',
        fontSize: '1.25rem',
        height: '3.5rem',
    },
};

export default {
    designTokens: _designTokens,
    lightTheme: _lightTheme,
    darkTheme: _darkTheme,
    ThemeProvider: _ThemeProvider,
    useTheme: _useTheme,
    breakpoint: _breakpoint,
    getThemeValue: _getThemeValue,
    spacing,
    rgba,
    glassmorphism,
    focusRing,
    transition,
    animations,
    getTradingColor,
    formatPrice,
    formatVolume,
    formatPercentage,
    visuallyHidden,
    screenReaderOnly,
    shouldReduceMotion,
    getOptimalUpdateFrequency,
    sizeVariants,
};