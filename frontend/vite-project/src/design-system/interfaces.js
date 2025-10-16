export const ComponentBase = {
    // Standard HTML attributes
    className: '',
    style: {},
    id: '',
    testId: '',

    // Accessibility attributes
    ariaLabel: '',
    ariaDescribedBy: '',
    ariaLabelledBy: '',
    role: '',
    tabIndex: 0,

    // Event handlers
    onClick: () => { },
    onFocus: () => { },
    onBlur: () => { },
    onKeyDown: () => { },
    onMouseEnter: () => { },
    onMouseLeave: () => { },

    // State
    disabled: false,
    loading: false,
    error: null,
};
export const ThemeConfigInterface = {
    mode: 'light', // 'light' | 'dark'
    color: {
        primary: {},
        secondary: {},
        neutral: {},
        semantic: {
            success: '',
            warning: '',
            error: '',
            info: '',
        },
        trading: {
            bull: '',
            bear: '',
            neutral: '',
            volume: '',
            spread: '',
        },
        background: {
            primary: '',
            secondary: '',
            tertiary: '',
            glass: '',
        },
        text: {
            primary: '',
            secondary: '',
            tertiary: '',
            inverse: '',
        },
        border: {
            primary: '',
            secondary: '',
            focus: '',
        },
    },
    typography: {
        fontFamily: {
            primary: '',
            monospace: '',
        },
        fontSize: {},
        fontWeight: {},
        lineHeight: {},
    },
    spacing: {},
    borderRadius: {},
    shadows: {},
    animation: {
        duration: {
            fast: '',
            normal: '',
            slow: '',
        },
        easing: {
            linear: '',
            easeIn: '',
            easeOut: '',
            easeInOut: '',
            spring: '',
        },
    },
    breakpoints: {},
    zIndex: {},
};

/**
 * Button Component Interface
 */
export const ButtonInterface = {
    ...ComponentBase,
    variant: 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size: 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    fullWidth: false,
    leftIcon: null,
    rightIcon: null,
    children: null,
};

/**
 * Input Component Interface
 */
export const InputInterface = {
    ...ComponentBase,
    type: 'text', // 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'
    placeholder: '',
    value: '',
    defaultValue: '',
    onChange: () => { },
    onInput: () => { },
    required: false,
    readOnly: false,
    autoComplete: '',
    autoFocus: false,
    maxLength: null,
    minLength: null,
    pattern: '',
    size: 'md', // 'sm' | 'md' | 'lg'
    variant: 'default', // 'default' | 'filled' | 'outline'
    error: false,
    errorMessage: '',
    helperText: '',
    label: '',
    leftIcon: null,
    rightIcon: null,
};

/**
 * Chart Component Interface
 */
export const ChartInterface = {
    ...ComponentBase,
    data: [], // CandlestickData[]
    indicators: [], // TechnicalIndicator[]
    overlays: [], // ChartOverlay[]
    timeframe: '1D', // '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W' | '1M'
    style: {
        candleStyle: 'candle', // 'candle' | 'bar' | 'line' | 'area'
        colorScheme: 'default', // 'default' | 'classic' | 'modern'
        gridLines: true,
        crosshair: true,
        volume: true,
    },
    performance: {
        virtualScrolling: true,
        canvasRendering: true,
        updateThrottling: 16, // milliseconds
        memoryManagement: true,
    },
    onDataUpdate: () => { },
    onTimeframeChange: () => { },
    onIndicatorAdd: () => { },
    onIndicatorRemove: () => { },
};

/**
 * Order Book Component Interface
 */
export const OrderBookInterface = {
    ...ComponentBase,
    bids: [], // OrderLevel[]
    asks: [], // OrderLevel[]
    spread: {
        absolute: 0,
        percentage: 0,
    },
    depth: 20, // Number of levels to display
    aggregation: 0.01, // Price aggregation level
    animations: {
        priceFlash: true,
        sizeChange: true,
        newOrder: true,
        orderRemoval: true,
    },
    onOrderClick: () => { },
    onDepthChange: () => { },
    onAggregationChange: () => { },
};

/**
 * Widget Component Interface
 */
export const WidgetInterface = {
    ...ComponentBase,
    id: '',
    type: '', // Widget type identifier
    title: '',
    position: {
        x: 0,
        y: 0,
    },
    size: {
        width: 300,
        height: 200,
        minWidth: 200,
        minHeight: 150,
        maxWidth: null,
        maxHeight: null,
    },
    resizable: true,
    draggable: true,
    closable: true,
    collapsible: false,
    collapsed: false,
    config: {}, // Widget-specific configuration
    data: null, // Widget data
    onResize: () => { },
    onMove: () => { },
    onClose: () => { },
    onCollapse: () => { },
    onConfigChange: () => { },
};

/**
 * Dashboard Layout Interface
 */
export const DashboardInterface = {
    ...ComponentBase,
    layout: {
        type: 'grid', // 'grid' | 'flex' | 'absolute'
        columns: 12,
        rows: 'auto',
        gap: 16,
        padding: 16,
    },
    widgets: [], // Widget[]
    persistence: {
        enabled: true,
        storageKey: 'dashboard-layout',
        autoSave: true,
        saveDelay: 1000, // milliseconds
    },
    dragDrop: {
        enabled: true,
        snapToGrid: true,
        gridSize: 8,
        boundaries: true,
    },
    onLayoutChange: () => { },
    onWidgetAdd: () => { },
    onWidgetRemove: () => { },
    onWidgetUpdate: () => { },
};

/**
 * AI Insights Component Interface
 */
export const AIInsightsInterface = {
    ...ComponentBase,
    predictions: [], // AIPrediction[]
    recommendations: [], // AIRecommendation[]
    confidence: {
        overall: 0, // 0-100
        threshold: 70, // Minimum confidence to display
    },
    filters: {
        timeframe: '1h', // Filter by timeframe
        asset: null, // Filter by specific asset
        type: null, // Filter by prediction type
        minConfidence: 0, // Minimum confidence filter
    },
    display: {
        maxItems: 10,
        sortBy: 'confidence', // 'confidence' | 'timestamp' | 'relevance'
        sortOrder: 'desc', // 'asc' | 'desc'
        groupBy: null, // 'asset' | 'type' | null
    },
    onPredictionClick: () => { },
    onRecommendationClick: () => { },
    onFilterChange: () => { },
};

/**
 * Performance Monitor Interface
 */
export const PerformanceMonitorInterface = {
    ...ComponentBase,
    metrics: {
        renderTime: 0,
        updateFrequency: 0,
        memoryUsage: 0,
        frameRate: 0,
        networkLatency: 0,
    },
    thresholds: {
        renderTime: 16, // milliseconds
        memoryUsage: 100, // MB
        frameRate: 60, // FPS
        networkLatency: 100, // milliseconds
    },
    alerts: {
        enabled: true,
        threshold: 'warning', // 'info' | 'warning' | 'error'
        autoResolve: true,
    },
    display: {
        realTime: true,
        history: true,
        historyLength: 100, // Number of data points
        refreshRate: 1000, // milliseconds
    },
    onThresholdExceeded: () => { },
    onMetricUpdate: () => { },
};

/**
 * Data Models
 */

export const CandlestickData = {
    timestamp: 0,
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    volume: 0,
};

export const OrderLevel = {
    price: 0,
    size: 0,
    total: 0,
    count: 0,
    timestamp: 0,
};

export const AIPrediction = {
    id: '',
    timestamp: 0,
    asset: '',
    type: '', // 'price' | 'trend' | 'volatility' | 'volume'
    prediction: {
        value: 0,
        direction: '', // 'up' | 'down' | 'sideways'
        timeframe: '',
        confidence: 0, // 0-100
    },
    reasoning: '',
    accuracy: null, // Historical accuracy if available
    status: 'active', // 'active' | 'expired' | 'fulfilled'
};

export const AIRecommendation = {
    id: '',
    timestamp: 0,
    asset: '',
    action: '', // 'buy' | 'sell' | 'hold' | 'watch'
    priority: '', // 'low' | 'medium' | 'high' | 'urgent'
    confidence: 0, // 0-100
    reasoning: '',
    targets: {
        entry: 0,
        stopLoss: 0,
        takeProfit: 0,
    },
    timeframe: '',
    riskLevel: '', // 'low' | 'medium' | 'high'
    status: 'active', // 'active' | 'expired' | 'executed'
};

export const TechnicalIndicator = {
    id: '',
    name: '',
    type: '', // 'overlay' | 'oscillator' | 'volume'
    parameters: {},
    visible: true,
    style: {
        color: '',
        lineWidth: 1,
        lineStyle: 'solid', // 'solid' | 'dashed' | 'dotted'
    },
};

export const ChartOverlay = {
    id: '',
    type: '', // 'trendline' | 'rectangle' | 'text' | 'arrow'
    points: [], // Array of {x, y} coordinates
    style: {
        color: '',
        lineWidth: 1,
        fillColor: '',
        opacity: 1,
    },
    properties: {}, // Overlay-specific properties
};

// Validation utilities
export const validateInterface = (obj, interfaceDefinition) => {
    const errors = [];

    for (const [key, expectedType] of Object.entries(interfaceDefinition)) {
        if (!(key in obj)) {
            errors.push(`Missing required property: ${key}`);
            continue;
        }

        const actualValue = obj[key];
        const expectedValue = expectedType;

        if (typeof expectedValue === 'string' && typeof actualValue !== typeof expectedValue) {
            errors.push(`Property ${key} should be ${typeof expectedValue}, got ${typeof actualValue}`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

export const createComponent = (interfaceDefinition, implementation) => {
    return (props) => {
        const validation = validateInterface(props, interfaceDefinition);

        if (!validation.isValid && process.env.NODE_ENV === 'development') {
            console.warn('Component validation errors:', validation.errors);
        }

        return implementation({ ...interfaceDefinition, ...props });
    };
};

export default {
    ComponentBase,
    ThemeConfigInterface,
    ButtonInterface,
    InputInterface,
    ChartInterface,
    OrderBookInterface,
    WidgetInterface,
    DashboardInterface,
    AIInsightsInterface,
    PerformanceMonitorInterface,
    CandlestickData,
    OrderLevel,
    AIPrediction,
    AIRecommendation,
    TechnicalIndicator,
    ChartOverlay,
    validateInterface,
    createComponent,
};