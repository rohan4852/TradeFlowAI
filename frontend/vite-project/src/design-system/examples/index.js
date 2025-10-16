// Design System Examples Export
// Comprehensive demo components showcasing design system capabilities

export { default as AtomicComponentsDemo } from './AtomicComponentsDemo';
export { default as MolecularComponentsDemo } from './MolecularComponentsDemo';
export { default as ChartComponentsDemo } from './ChartComponentsDemo';
export { default as CandlestickChartDemo } from './CandlestickChartDemo';
export { default as OrderBookDemo } from './OrderBookDemo';
export { default as EffectsDemo } from './EffectsDemo';
export { default as RealTimeDemo } from './RealTimeDemo';
export { default as RealTimeStreamingDemo } from './RealTimeStreamingDemo';
export { default as TradingWidgetsDemo } from './TradingWidgetsDemo';
export { default as DashboardWidgetDemo } from './DashboardWidgetDemo';
export { default as AIInsightsDemo } from './AIInsightsDemo';
export { default as AccessibilityDemo } from './AccessibilityDemo';
export { default as PerformanceOptimizationDemo } from './PerformanceOptimizationDemo';

// Demo categories for navigation
export const demoCategories = {
    foundation: {
        title: 'Foundation',
        description: 'Core design system components and utilities',
        demos: [
            {
                name: 'AtomicComponentsDemo',
                title: 'Atomic Components',
                description: 'Basic building blocks: buttons, inputs, icons, labels'
            },
            {
                name: 'MolecularComponentsDemo',
                title: 'Molecular Components',
                description: 'Composed components: forms, navigation, cards'
            },
            {
                name: 'EffectsDemo',
                title: 'Visual Effects',
                description: 'Glassmorphism, animations, and micro-interactions'
            }
        ]
    },
    trading: {
        title: 'Trading Components',
        description: 'Specialized components for trading interfaces',
        demos: [
            {
                name: 'ChartComponentsDemo',
                title: 'Chart Components',
                description: 'Technical analysis and charting components'
            },
            {
                name: 'CandlestickChartDemo',
                title: 'Candlestick Chart',
                description: 'High-performance candlestick chart with indicators'
            },
            {
                name: 'OrderBookDemo',
                title: 'Order Book',
                description: 'Real-time order book visualization'
            },
            {
                name: 'TradingWidgetsDemo',
                title: 'Trading Widgets',
                description: 'Specialized trading widgets: portfolio, watchlist, news, alerts'
            },
            {
                name: 'DashboardWidgetDemo',
                title: 'Dashboard Widget System',
                description: 'Complete drag-and-drop dashboard with customizable widgets'
            },
            {
                name: 'AIInsightsDemo',
                title: 'AI Insights & Recommendations',
                description: 'AI-powered predictions, recommendations, and analysis progress indicators'
            }
        ]
    },
    accessibility: {
        title: 'Accessibility Features',
        description: 'WCAG 2.1 AA compliant accessibility features',
        demos: [
            {
                name: 'AccessibilityDemo',
                title: 'Accessibility Features',
                description: 'Keyboard navigation, screen reader support, focus management, and testing tools'
            }
        ]
    },
    performance: {
        title: 'Performance Optimization',
        description: 'Advanced performance optimization features',
        demos: [
            {
                name: 'PerformanceOptimizationDemo',
                title: 'Performance Optimization',
                description: 'Automatic fallback modes, intelligent caching, budget enforcement, and virtualization'
            }
        ]
    },
    realtime: {
        title: 'Real-Time Features',
        description: 'Live data streaming and real-time updates',
        demos: [
            {
                name: 'RealTimeDemo',
                title: 'Real-Time Data Streaming',
                description: 'WebSocket connections, live updates, and streaming data'
            }
        ]
    }
};

// Get all demos as flat array
export const getAllDemos = () => {
    return Object.values(demoCategories).flatMap(category =>
        category.demos.map(demo => ({
            ...demo,
            category: category.title
        }))
    );
};

// Get demo by name
export const getDemoByName = (name) => {
    return getAllDemos().find(demo => demo.name === name);
};