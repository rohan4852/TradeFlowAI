const mockCandlestickData = (count = 100) => {
    const data = [];
    let basePrice = 150;
    const startTime = Date.now() - (count * 60000); // 1 minute intervals

    for (let i = 0; i < count; i++) {
        const time = startTime + (i * 60000);
        const open = basePrice + (Math.random() - 0.5) * 2;
        const close = open + (Math.random() - 0.5) * 4;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        const volume = Math.random() * 1000000;

        data.push({
            time: time / 1000, // LightWeight Charts expects seconds
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: Math.floor(volume)
        });

        basePrice = close;
    }

    return data;
};

const mockOrderBookData = () => ({
    bids: [
        { price: 149.95, size: 1000, count: 5 },
        { price: 149.90, size: 2500, count: 12 },
        { price: 149.85, size: 1800, count: 8 },
        { price: 149.80, size: 3200, count: 15 },
        { price: 149.75, size: 900, count: 4 },
        { price: 149.70, size: 2100, count: 9 },
        { price: 149.65, size: 1600, count: 7 },
        { price: 149.60, size: 2800, count: 13 },
        { price: 149.55, size: 1200, count: 6 },
        { price: 149.50, size: 3500, count: 18 }
    ],
    asks: [
        { price: 150.05, size: 800, count: 3 },
        { price: 150.10, size: 1900, count: 8 },
        { price: 150.15, size: 1400, count: 6 },
        { price: 150.20, size: 2600, count: 11 },
        { price: 150.25, size: 1100, count: 5 },
        { price: 150.30, size: 2200, count: 10 },
        { price: 150.35, size: 1700, count: 7 },
        { price: 150.40, size: 2900, count: 14 },
        { price: 150.45, size: 1300, count: 6 },
        { price: 150.50, size: 3100, count: 16 }
    ],
    spread: 0.10,
    lastUpdate: Date.now()
});

const mockTechnicalIndicators = () => ({
    sma: [
        { time: Date.now() - 300000, value: 148.5 },
        { time: Date.now() - 240000, value: 149.2 },
        { time: Date.now() - 180000, value: 149.8 },
        { time: Date.now() - 120000, value: 150.1 },
        { time: Date.now() - 60000, value: 150.3 },
        { time: Date.now(), value: 150.0 }
    ],
    ema: [
        { time: Date.now() - 300000, value: 148.8 },
        { time: Date.now() - 240000, value: 149.4 },
        { time: Date.now() - 180000, value: 149.9 },
        { time: Date.now() - 120000, value: 150.2 },
        { time: Date.now() - 60000, value: 150.1 },
        { time: Date.now(), value: 149.9 }
    ],
    rsi: [
        { time: Date.now() - 300000, value: 45.2 },
        { time: Date.now() - 240000, value: 52.8 },
        { time: Date.now() - 180000, value: 58.4 },
        { time: Date.now() - 120000, value: 62.1 },
        { time: Date.now() - 60000, value: 55.7 },
        { time: Date.now(), value: 48.9 }
    ],
    macd: {
        macd: [
            { time: Date.now() - 300000, value: -0.5 },
            { time: Date.now() - 240000, value: -0.2 },
            { time: Date.now() - 180000, value: 0.1 },
            { time: Date.now() - 120000, value: 0.3 },
            { time: Date.now() - 60000, value: 0.2 },
            { time: Date.now(), value: -0.1 }
        ],
        signal: [
            { time: Date.now() - 300000, value: -0.3 },
            { time: Date.now() - 240000, value: -0.2 },
            { time: Date.now() - 180000, value: -0.1 },
            { time: Date.now() - 120000, value: 0.1 },
            { time: Date.now() - 60000, value: 0.2 },
            { time: Date.now(), value: 0.1 }
        ],
        histogram: [
            { time: Date.now() - 300000, value: -0.2 },
            { time: Date.now() - 240000, value: 0.0 },
            { time: Date.now() - 180000, value: 0.2 },
            { time: Date.now() - 120000, value: 0.2 },
            { time: Date.now() - 60000, value: 0.0 },
            { time: Date.now(), value: -0.2 }
        ]
    }
});

const mockAIPredictions = () => [
    {
        id: 'pred-1',
        symbol: 'AAPL',
        prediction: 'bullish',
        confidence: 0.85,
        timeframe: '1h',
        reasoning: 'Strong momentum indicators and positive sentiment',
        timestamp: Date.now() - 300000,
        accuracy: 0.78
    },
    {
        id: 'pred-2',
        symbol: 'AAPL',
        prediction: 'bearish',
        confidence: 0.72,
        timeframe: '4h',
        reasoning: 'Overbought conditions and resistance level',
        timestamp: Date.now() - 600000,
        accuracy: 0.82
    },
    {
        id: 'pred-3',
        symbol: 'MSFT',
        prediction: 'bullish',
        confidence: 0.91,
        timeframe: '1d',
        reasoning: 'Earnings beat expectations and sector rotation',
        timestamp: Date.now() - 900000,
        accuracy: 0.89
    }
];

const mockAIRecommendations = () => [
    {
        id: 'rec-1',
        type: 'buy',
        symbol: 'AAPL',
        price: 150.25,
        quantity: 100,
        confidence: 0.88,
        reasoning: 'Technical breakout with strong volume confirmation',
        priority: 'high',
        expiry: Date.now() + 3600000, // 1 hour
        timestamp: Date.now() - 120000
    },
    {
        id: 'rec-2',
        type: 'sell',
        symbol: 'TSLA',
        price: 245.80,
        quantity: 50,
        confidence: 0.76,
        reasoning: 'Resistance level reached, profit taking recommended',
        priority: 'medium',
        expiry: Date.now() + 1800000, // 30 minutes
        timestamp: Date.now() - 300000
    }
];

const mockPortfolioData = () => ({
    totalValue: 125000.50,
    dayChange: 2150.25,
    dayChangePercent: 1.75,
    positions: [
        {
            symbol: 'AAPL',
            quantity: 100,
            avgPrice: 145.30,
            currentPrice: 150.25,
            marketValue: 15025.00,
            unrealizedPnL: 495.00,
            unrealizedPnLPercent: 3.41
        },
        {
            symbol: 'MSFT',
            quantity: 75,
            avgPrice: 320.50,
            currentPrice: 325.80,
            marketValue: 24435.00,
            unrealizedPnL: 397.50,
            unrealizedPnLPercent: 1.65
        },
        {
            symbol: 'GOOGL',
            quantity: 50,
            avgPrice: 2650.00,
            currentPrice: 2680.25,
            marketValue: 134012.50,
            unrealizedPnL: 1512.50,
            unrealizedPnLPercent: 1.14
        }
    ],
    performance: {
        today: 1.75,
        week: 3.42,
        month: 8.91,
        year: 15.67,
        all: 23.45
    }
});

const mockWatchlistData = () => [
    {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 150.25,
        change: 2.15,
        changePercent: 1.45,
        volume: 45678900,
        marketCap: 2450000000000
    },
    {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        price: 325.80,
        change: -1.25,
        changePercent: -0.38,
        volume: 23456700,
        marketCap: 2380000000000
    },
    {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        price: 2680.25,
        change: 15.50,
        changePercent: 0.58,
        volume: 1234500,
        marketCap: 1650000000000
    }
];

const mockNewsData = () => [
    {
        id: 'news-1',
        headline: 'Apple Reports Strong Q4 Earnings',
        summary: 'Apple exceeded expectations with record iPhone sales and services revenue.',
        sentiment: 'positive',
        relevance: 0.95,
        source: 'Reuters',
        timestamp: Date.now() - 1800000,
        symbols: ['AAPL']
    },
    {
        id: 'news-2',
        headline: 'Fed Signals Potential Rate Cut',
        summary: 'Federal Reserve hints at monetary policy easing in upcoming meeting.',
        sentiment: 'positive',
        relevance: 0.88,
        source: 'Bloomberg',
        timestamp: Date.now() - 3600000,
        symbols: ['SPY', 'QQQ']
    },
    {
        id: 'news-3',
        headline: 'Tech Sector Faces Regulatory Pressure',
        summary: 'New antitrust legislation could impact major technology companies.',
        sentiment: 'negative',
        relevance: 0.72,
        source: 'Wall Street Journal',
        timestamp: Date.now() - 7200000,
        symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN']
    }
];

const mockPerformanceMetrics = () => ({
    renderTime: 16.7,
    frameRate: 60,
    memoryUsage: 45.2,
    cpuUsage: 12.8,
    networkLatency: 25,
    cacheHitRate: 0.89,
    errorRate: 0.001,
    uptime: 0.9995
});

const mockWebSocketMessages = () => [
    {
        type: 'price_update',
        symbol: 'AAPL',
        price: 150.25,
        timestamp: Date.now()
    },
    {
        type: 'order_book_update',
        symbol: 'AAPL',
        bids: [{ price: 150.20, size: 1000 }],
        asks: [{ price: 150.25, size: 800 }],
        timestamp: Date.now()
    },
    {
        type: 'trade',
        symbol: 'AAPL',
        price: 150.22,
        size: 500,
        side: 'buy',
        timestamp: Date.now()
    }
];

const generateTimeSeriesData = (points = 100, baseValue = 100, volatility = 0.02) => {
    const data = [];
    let currentValue = baseValue;
    const startTime = Date.now() - (points * 60000);

    for (let i = 0; i < points; i++) {
        const change = (Math.random() - 0.5) * volatility * currentValue;
        currentValue += change;

        data.push({
            time: startTime + (i * 60000),
            value: parseFloat(currentValue.toFixed(2))
        });
    }

    return data;
};

const generateRandomOrderBook = (levels = 10, basePrice = 150) => {
    const bids = [];
    const asks = [];

    for (let i = 0; i < levels; i++) {
        bids.push({
            price: parseFloat((basePrice - (i + 1) * 0.05).toFixed(2)),
            size: Math.floor(Math.random() * 5000) + 100,
            count: Math.floor(Math.random() * 20) + 1
        });

        asks.push({
            price: parseFloat((basePrice + (i + 1) * 0.05).toFixed(2)),
            size: Math.floor(Math.random() * 5000) + 100,
            count: Math.floor(Math.random() * 20) + 1
        });
    }

    return { bids, asks, spread: 0.05 };
};
