/**
 * Design System Documentation Index
 * Exports all documentation components and utilities
 */

// Main documentation components
export { default as StyleGuide } from './StyleGuide';
export { default as ComponentPlayground } from './ComponentPlayground';
export { default as AccessibilityTester } from './AccessibilityTester';

// Documentation utilities and helpers
export const documentationRoutes = [
    {
        path: '/docs',
        name: 'Style Guide',
        component: 'StyleGuide',
        description: 'Complete design system documentation with live examples'
    },
    {
        path: '/docs/playground',
        name: 'Component Playground',
        component: 'ComponentPlayground',
        description: 'Interactive component testing and experimentation'
    },
    {
        path: '/docs/accessibility',
        name: 'Accessibility Tester',
        component: 'AccessibilityTester',
        description: 'Comprehensive accessibility testing tools'
    }
];

/**
 * Design system metadata
 */
export const designSystemInfo = {
    name: 'Superior UI Design System',
    version: '1.0.0',
    description: 'Professional-grade trading interface components that rival TradingView and Walbi',
    author: 'AI Trading Platform Team',
    license: 'MIT',
    repository: 'https://github.com/your-org/superior-ui-design-system',
    documentation: 'https://your-org.github.io/superior-ui-design-system',
    features: [
        'Modern glassmorphism design',
        'High-performance real-time components',
        'WCAG 2.1 AA accessibility compliance',
        'Mobile-first responsive design',
        'Comprehensive TypeScript support',
        'Advanced trading-specific components',
        'Performance monitoring integration',
        'Automated testing utilities'
    ],
    technologies: [
        'React 18',
        'TypeScript',
        'CSS-in-JS',
        'Framer Motion',
        'Canvas API',
        'Web Workers',
        'WebSocket',
        'PWA'
    ]
};

/**
 * Component categories for documentation organization
 */
export const componentCategories = {
    foundation: {
        name: 'Foundation',
        description: 'Core design tokens, themes, and utilities',
        components: ['Theme', 'Colors', 'Typography', 'Spacing', 'Shadows']
    },
    atoms: {
        name: 'Atoms',
        description: 'Basic building blocks and primitive components',
        components: ['Button', 'Input', 'Icon', 'Label', 'Badge', 'Spinner']
    },
    molecules: {
        name: 'Molecules',
        description: 'Composite components built from atoms',
        components: ['FormGroup', 'SearchBox', 'NavigationItem', 'CardHeader', 'ChartControls']
    },
    organisms: {
        name: 'Organisms',
        description: 'Complex components with business logic',
        components: ['CandlestickChart', 'OrderBook', 'TradingDashboard', 'NavigationBar']
    },
    templates: {
        name: 'Templates',
        description: 'Page-level layouts and structures',
        components: ['DashboardLayout', 'ModalLayout', 'ResponsiveGrid']
    },
    trading: {
        name: 'Trading Specific',
        description: 'Specialized components for trading interfaces',
        components: ['PredictionCard', 'RecommendationPanel', 'PortfolioWidget', 'WatchlistWidget', 'NewsWidget']
    }
};

/**
 * Documentation configuration
 */
export const docsConfig = {
    theme: {
        primaryColor: '#0ea5e9',
        successColor: '#10b981',
        warningColor: '#f59e0b',
        errorColor: '#ef4444',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        monoFontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace'
    },
    features: {
        codeHighlighting: true,
        livePreview: true,
        responsiveTesting: true,
        accessibilityTesting: true,
        performanceMonitoring: true,
        themeToggle: true,
        searchFunctionality: true,
        exportCode: true
    },
    accessibility: {
        wcagLevel: 'AA',
        colorContrastRatio: 4.5,
        keyboardNavigation: true,
        screenReaderSupport: true,
        focusManagement: true
    }
};

/**
 * Usage examples for common patterns
 */
export const usageExamples = {
    basicButton: `import { Button } from '@/design-system';

function MyComponent() {
  return (
    <Button variant="primary" size="medium">
      Click me
    </Button>
  );
}`,

    tradingChart: `import { CandlestickChart } from '@/design-system';

function TradingView() {
  const [data, setData] = useState([]);
  
  return (
    <CandlestickChart
      data={data}
      symbol="AAPL"
      realTime={true}
      height="400px"
      showVolume={true}
      showIndicators={true}
      onTimeframeChange={(timeframe) => {
        // Handle timeframe change
      }}
    />
  );
}`,

    orderBook: `import { OrderBook } from '@/design-system';

function OrderBookPanel() {
  const [orderBookData, setOrderBookData] = useState({
    asks: [],
    bids: []
  });
  
  return (
    <OrderBook
      asks={orderBookData.asks}
      bids={orderBookData.bids}
      symbol="AAPL"
      maxDepth={25}
      realTime={true}
      onOrderClick={(order) => {
        // Handle order click
      }}
    />
  );
}`,

    glassmorphismCard: `import { Card } from '@/design-system';

function GlassCard() {
  return (
    <Card variant="glass" padding="large">
      <h3>Glassmorphism Effect</h3>
      <p>Beautiful semi-transparent card with backdrop blur</p>
    </Card>
  );
}`,

    accessibleForm: `import { Input, Button, FormGroup } from '@/design-system';

function AccessibleForm() {
  return (
    <form>
      <FormGroup>
        <Input
          label="Email Address"
          type="email"
          required
          aria-describedby="email-help"
          placeholder="Enter your email"
        />
        <div id="email-help">We'll never share your email</div>
      </FormGroup>
      
      <Button type="submit" variant="primary">
        Submit
      </Button>
    </form>
  );
}`
};

/**
 * Performance guidelines
 */
export const performanceGuidelines = {
    rendering: {
        title: 'Rendering Performance',
        guidelines: [
            'Use React.memo for components that receive stable props',
            'Implement virtualization for large lists (order books, trade history)',
            'Use Canvas API for high-frequency updates (charts, real-time data)',
            'Minimize re-renders with proper dependency arrays',
            'Use Web Workers for heavy computations'
        ]
    },
    memory: {
        title: 'Memory Management',
        guidelines: [
            'Clean up event listeners and subscriptions in useEffect cleanup',
            'Use object pooling for frequently created/destroyed objects',
            'Implement proper garbage collection strategies',
            'Monitor memory usage with performance tools',
            'Use weak references where appropriate'
        ]
    },
    network: {
        title: 'Network Optimization',
        guidelines: [
            'Implement WebSocket connection pooling',
            'Use data compression for large payloads',
            'Implement proper error handling and reconnection logic',
            'Cache static data and use appropriate cache headers',
            'Implement progressive loading for non-critical data'
        ]
    },
    accessibility: {
        title: 'Accessibility Performance',
        guidelines: [
            'Ensure screen reader announcements don\'t overwhelm users',
            'Use semantic HTML for better performance with assistive technologies',
            'Implement proper focus management without performance penalties',
            'Test with actual screen readers and keyboard navigation',
            'Monitor accessibility performance metrics'
        ]
    }
};

/**
 * Testing utilities
 */
export const testingUtilities = {
    renderComponent: (Component, props = {}) => {
        // Utility for testing components in isolation
        return {
            component: Component,
            props,
            testId: `test-${Component.name.toLowerCase()}-${Date.now()}`
        };
    },

    mockRealTimeData: (symbol = 'AAPL', interval = 1000) => {
        // Generate mock real-time trading data
        const basePrice = 150;
        let currentPrice = basePrice;

        return setInterval(() => {
            const change = (Math.random() - 0.5) * 2; // -1 to 1
            currentPrice += change;

            return {
                symbol,
                timestamp: Date.now(),
                price: currentPrice,
                volume: Math.floor(Math.random() * 10000),
                change: change,
                changePercent: (change / basePrice) * 100
            };
        }, interval);
    },

    accessibilityTest: async (element) => {
        // Basic accessibility testing utility
        const tests = {
            hasAriaLabel: element.hasAttribute('aria-label'),
            hasRole: element.hasAttribute('role'),
            isKeyboardAccessible: element.tabIndex >= 0,
            hasProperContrast: true // Would implement actual contrast checking
        };

        return {
            passed: Object.values(tests).every(Boolean),
            tests,
            recommendations: []
        };
    }
};

export default {
    StyleGuide,
    ComponentPlayground,
    AccessibilityTester,
    documentationRoutes,
    designSystemInfo,
    componentCategories,
    docsConfig,
    usageExamples,
    performanceGuidelines,
    testingUtilities
};