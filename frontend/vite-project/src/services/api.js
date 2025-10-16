/**
 * Enhanced API service for AI Trading Platform
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Market Data API
export const marketDataAPI = {
    getOHLCV: (ticker, period = '1y', interval = '1d') =>
        api.get(`/market/ohlcv/${ticker}`, { params: { period, interval } }),

    getNews: (ticker, limit = 10) =>
        api.get(`/market/news/${ticker}`, { params: { limit } }),

    getSentiment: (ticker, hoursBack = 24) =>
        api.get(`/market/sentiment/${ticker}`, { params: { hours_back: hoursBack } }),

    getMarketOverview: () =>
        api.get('/market/market-overview'),

    getESGScore: (ticker) =>
        api.get(`/market/esg/${ticker}`),
};

// Predictions API
export const predictionsAPI = {
    getPrediction: (ticker, timeHorizon = '1w', includeNews = true, includeSocial = true) =>
        api.post(`/predictions/predict/${ticker}`, null, {
            params: { time_horizon: timeHorizon, include_news: includeNews, include_social: includeSocial }
        }),

    explainPrediction: (ticker, predictionId = null) =>
        api.get(`/predictions/explain/${ticker}`, { params: { prediction_id: predictionId } }),

    getScenarios: (ticker, timeHorizon = '1w') =>
        api.get(`/predictions/scenarios/${ticker}`, { params: { time_horizon: timeHorizon } }),

    getModelPerformance: () =>
        api.get('/predictions/model-performance'),

    runBacktest: (strategyConfig, startDate, endDate, initialCapital = 10000) =>
        api.post('/predictions/backtest', strategyConfig, {
            params: { start_date: startDate, end_date: endDate, initial_capital: initialCapital }
        }),
};

// Social Trading API
export const socialAPI = {
    getStrategies: (category = null, minRating = 0, limit = 20) =>
        api.get('/social/strategies', { params: { category, min_rating: minRating, limit } }),

    getLeaderboard: (metric = 'total_return', timeframe = '1m', limit = 10) =>
        api.get('/social/leaderboard', { params: { metric, timeframe, limit } }),

    getCommunityFeed: (ticker = null, sentiment = null, limit = 20) =>
        api.get('/social/feed', { params: { ticker, sentiment, limit } }),

    getSentimentOverview: () =>
        api.get('/social/sentiment-overview'),

    followTrader: (username) =>
        api.post(`/social/follow-trader/${username}`),

    copyStrategy: (strategyId, allocationPercent = 10) =>
        api.post(`/social/copy-strategy/${strategyId}`, null, {
            params: { allocation_percent: allocationPercent }
        }),

    getCompetitions: () =>
        api.get('/social/competitions'),
};

// Trading Tools API
export const toolsAPI = {
    getAlerts: (status = null, ticker = null) =>
        api.get('/tools/alerts', { params: { status, ticker } }),

    createAlert: (ticker, condition, targetValue, notificationMethod = 'email') =>
        api.post('/tools/alerts', null, {
            params: { ticker, condition, target_value: targetValue, notification_method: notificationMethod }
        }),

    getPaperPortfolios: () =>
        api.get('/tools/paper-trading/portfolios'),

    executePaperTrade: (ticker, action, quantity, portfolioId = 'portfolio_001') =>
        api.post('/tools/paper-trading/trade', null, {
            params: { ticker, action, quantity, portfolio_id: portfolioId }
        }),

    getEducationalContent: (category = null, difficulty = null, limit = 20) =>
        api.get('/tools/education/content', { params: { category, difficulty, limit } }),

    getAPIKeys: () =>
        api.get('/tools/api-access/keys'),

    createAPIKey: (name, permissions) =>
        api.post('/tools/api-access/keys', null, { params: { name, permissions } }),

    runScreener: (minMarketCap = null, maxPERatio = null, minVolume = null, sector = null, limit = 50) =>
        api.get('/tools/screener', {
            params: { min_market_cap: minMarketCap, max_pe_ratio: maxPERatio, min_volume: minVolume, sector, limit }
        }),
};

// Streaming API
export const streamingAPI = {
    getStreamingStatus: () =>
        api.get('/streaming/status'),

    startLivePredictions: (tickers, updateInterval = 300) =>
        api.post('/streaming/live-predictions/start', { tickers }, { params: { update_interval: updateInterval } }),

    stopLivePredictions: (tickers) =>
        api.post('/streaming/live-predictions/stop', { tickers }),

    startRiskMonitoring: (portfolioId, checkInterval = 60) =>
        api.post('/streaming/risk-monitoring/start', null, {
            params: { portfolio_id: portfolioId, check_interval: checkInterval }
        }),
};

// Computer Vision API
export const computerVisionAPI = {
    analyzeChart: (imageFile, ticker = null) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        if (ticker) formData.append('ticker', ticker);

        return api.post('/computer-vision/analyze-chart', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    multimodalAnalysis: (chartImage = null, newsText = null, earningsTranscript = null, socialPosts = null, ticker = null) => {
        const formData = new FormData();
        if (chartImage) formData.append('chart_image', chartImage);
        if (newsText) formData.append('news_text', newsText);
        if (earningsTranscript) formData.append('earnings_transcript', earningsTranscript);
        if (socialPosts) formData.append('social_posts', socialPosts);
        if (ticker) formData.append('ticker', ticker);

        return api.post('/computer-vision/multimodal-analysis', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    getPatternTemplates: () =>
        api.get('/computer-vision/pattern-templates'),

    detectPatterns: (imageFile, patternTypes, confidenceThreshold = 0.7) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('pattern_types', patternTypes);
        formData.append('confidence_threshold', confidenceThreshold);

        return api.post('/computer-vision/detect-patterns', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    analyzeSupportResistance: (imageFile, sensitivity = 0.02) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('sensitivity', sensitivity);

        return api.post('/computer-vision/support-resistance', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
};

// Broker Integration API
export const brokerAPI = {
    connectBroker: (brokerName, credentials) =>
        api.post('/broker/connect', { broker_name: brokerName, ...credentials }),

    getAccountInfo: () =>
        api.get('/broker/account'),

    getPositions: () =>
        api.get('/broker/positions'),

    executeAIRecommendation: (symbol, recommendation, positionSize = 0.05) =>
        api.post('/broker/execute-ai-recommendation', { symbol, recommendation, position_size: positionSize }),

    placeManualOrder: (symbol, side, quantity, orderType = 'market', price = null, stopPrice = null) =>
        api.post('/broker/place-order', null, {
            params: { symbol, side, quantity, order_type: orderType, price, stop_price: stopPrice }
        }),

    cancelOrder: (orderId) =>
        api.delete(`/broker/cancel-order/${orderId}`),

    getOrderStatus: (orderId) =>
        api.get(`/broker/order-status/${orderId}`),

    syncPortfolio: () =>
        api.post('/broker/sync-portfolio'),

    getPerformance: () =>
        api.get('/broker/performance'),

    updateRiskLimits: (riskLimits) =>
        api.post('/broker/risk-limits', riskLimits),

    getMarketData: (symbol) =>
        api.get(`/broker/market-data/${symbol}`),

    getSupportedBrokers: () =>
        api.get('/broker/supported-brokers'),
};

// Security API
export const securityAPI = {
    login: (username, password, mfaToken = null) =>
        api.post('/security/login', { username, password, mfa_token: mfaToken }),

    logout: () =>
        api.post('/security/logout'),

    validateSession: (sessionId) =>
        api.post('/security/validate-session', { session_id: sessionId }),

    validatePassword: (password) =>
        api.post('/security/validate-password', { password }),

    getSecurityMetrics: () =>
        api.get('/security/security-metrics'),

    encryptData: (data) =>
        api.post('/security/encrypt-data', { data }),

    decryptData: (encryptedData) =>
        api.post('/security/decrypt-data', { encrypted_data: encryptedData }),

    getAuditLog: (limit = 100, eventType = null, userId = null) =>
        api.get('/security/audit-log', { params: { limit, event_type: eventType, user_id: userId } }),

    updateSecuritySettings: (settings) =>
        api.post('/security/security-settings', settings),

    getBlockedIPs: () =>
        api.get('/security/blocked-ips'),

    unblockIP: (ipAddress) =>
        api.post('/security/unblock-ip', { ip_address: ipAddress }),
};

// WebSocket connection for real-time data
export class WebSocketManager {
    constructor() {
        this.ws = null;
        this.subscriptions = new Set();
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect(clientId, subscriptions = []) {
        const wsUrl = `ws://localhost:8000/api/v1/streaming/ws/${clientId}?subscriptions=${subscriptions.join(',')}`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            subscriptions.forEach(sub => this.subscriptions.add(sub));
            this.handleMessage({ type: 'connected' });
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('WebSocket message parse error:', error);
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.handleMessage({ type: 'disconnected' });
            this.attemptReconnect(clientId, Array.from(this.subscriptions));
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.handleMessage({ type: 'error', error });
        };
    }

    handleMessage(data) {
        const { type } = data;
        const listeners = this.listeners.get(type) || [];
        listeners.forEach(callback => callback(data));
    }

    subscribe(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType).push(callback);
    }

    unsubscribe(eventType, callback) {
        const listeners = this.listeners.get(eventType) || [];
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    addSubscription(subscription) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'subscribe',
                subscriptions: [subscription]
            }));
            this.subscriptions.add(subscription);
        }
    }

    removeSubscription(subscription) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'unsubscribe',
                subscriptions: [subscription]
            }));
            this.subscriptions.delete(subscription);
        }
    }

    attemptReconnect(clientId, subscriptions) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff

            setTimeout(() => {
                console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.connect(clientId, subscriptions);
            }, delay);
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.subscriptions.clear();
        this.listeners.clear();
    }
}

// Export singleton WebSocket manager
export const wsManager = new WebSocketManager();

export default api;