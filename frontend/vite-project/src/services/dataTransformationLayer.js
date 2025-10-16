/**
 * Data Transformation Layer for Real-time Trading Data
 * Handles transformation and validation of WebSocket data streams
 */

/**
 * Transform WebSocket message to standardized format
 */
export const transformWebSocketMessage = (message) => {
    try {
        if (!message || typeof message !== 'object') {
            return null;
        }

        const baseTransform = {
            type: message.type || 'unknown',
            timestamp: message.timestamp || Date.now(),
            symbol: message.symbol || null,
            latency: message.latency || 0,
            data: null
        };

        switch (message.type) {
            case 'market_data':
                baseTransform.data = transformMarketDataForChart(message);
                break;
            case 'order_book':
                baseTransform.data = transformOrderBookData(message);
                break;
            case 'predictions':
                baseTransform.data = transformAIPredictionsData(message);
                break;
            default:
                baseTransform.data = message.data || message;
        }

        return baseTransform;
    } catch (error) {
        console.error('Error transforming WebSocket message:', error);
        return null;
    }
};

/**
 * Transform market data for chart consumption
 */
export const transformMarketDataForChart = (data) => {
    return {
        timestamp: data.timestamp || Date.now(),
        open: parseFloat(data.open || data.o || 0),
        high: parseFloat(data.high || data.h || 0),
        low: parseFloat(data.low || data.l || 0),
        close: parseFloat(data.close || data.c || 0),
        volume: parseFloat(data.volume || data.v || 0),
        symbol: data.symbol || data.s || null
    };
};

/**
 * Transform order book data
 */
export const transformOrderBookData = (data) => {
    const transformOrders = (orders) => {
        if (!Array.isArray(orders)) return [];
        return orders.map(order => ({
            price: parseFloat(order.price || order[0] || 0),
            quantity: parseFloat(order.quantity || order[1] || 0),
            total: parseFloat(order.total || (order[0] * order[1]) || 0)
        }));
    };

    return {
        asks: transformOrders(data.asks || data.a || []),
        bids: transformOrders(data.bids || data.b || []),
        spread: data.spread || null,
        timestamp: data.timestamp || Date.now(),
        symbol: data.symbol || data.s || null
    };
};

/**
 * Transform AI predictions data
 */
export const transformAIPredictionsData = (data) => {
    return {
        prediction: data.prediction || data.p || null,
        confidence: parseFloat(data.confidence || data.c || 0),
        timeHorizon: data.timeHorizon || data.th || '1h',
        factors: data.factors || data.f || [],
        timestamp: data.timestamp || Date.now(),
        symbol: data.symbol || data.s || null,
        targetPrice: parseFloat(data.targetPrice || data.tp || 0),
        action: data.action || data.a || 'hold'
    };
};

/**
 * Batch transform multiple data points
 */
export const batchTransformData = (dataArray, transformFunction) => {
    if (!Array.isArray(dataArray)) return [];

    return dataArray.map(item => {
        try {
            return transformFunction(item);
        } catch (error) {
            console.error('Error in batch transform:', error);
            return null;
        }
    }).filter(Boolean);
};

/**
 * Validate transformed data structure
 */
export const validateTransformedData = (data, type) => {
    if (!data || typeof data !== 'object') return false;

    switch (type) {
        case 'chart':
            return typeof data.timestamp === 'number' &&
                typeof data.open === 'number' &&
                typeof data.high === 'number' &&
                typeof data.low === 'number' &&
                typeof data.close === 'number' &&
                typeof data.volume === 'number';

        case 'orderbook':
            return Array.isArray(data.asks) &&
                Array.isArray(data.bids) &&
                typeof data.timestamp === 'number';

        case 'predictions':
            return typeof data.confidence === 'number' &&
                typeof data.timestamp === 'number' &&
                data.confidence >= 0 && data.confidence <= 1;

        case 'portfolio':
            return typeof data.timestamp === 'number';

        default:
            return true;
    }
};

/**
 * Data sanitization utilities
 */
export const sanitizeData = {
    number: (value, fallback = 0) => {
        const num = parseFloat(value);
        return isNaN(num) ? fallback : num;
    },

    string: (value, fallback = '') => {
        return typeof value === 'string' ? value : fallback;
    },

    array: (value, fallback = []) => {
        return Array.isArray(value) ? value : fallback;
    },

    timestamp: (value) => {
        const timestamp = parseInt(value);
        return isNaN(timestamp) ? Date.now() : timestamp;
    }
};

export default {
    transformWebSocketMessage,
    transformMarketDataForChart,
    transformOrderBookData,
    transformAIPredictionsData,
    batchTransformData,
    validateTransformedData,
    sanitizeData
};