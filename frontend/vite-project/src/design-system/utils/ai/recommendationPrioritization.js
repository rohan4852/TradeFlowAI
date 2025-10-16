/**
 * AI Recommendation Prioritization System
 * Smart algorithms for sorting and prioritizing trading recommendations
 */

// Priority weights for different factors
const PRIORITY_WEIGHTS = {
    confidence: 0.3,
    potentialReturn: 0.25,
    riskLevel: 0.2,
    timeUrgency: 0.15,
    marketConditions: 0.1
};

// Risk level scoring (lower risk = higher score)
const RISK_SCORES = {
    low: 1.0,
    medium: 0.7,
    high: 0.4
};

// Market condition multipliers
const MARKET_CONDITION_MULTIPLIERS = {
    bullish: 1.2,
    neutral: 1.0,
    bearish: 0.8,
    volatile: 0.9
};

/**
 * Calculate priority score for a recommendation
 * @param {Object} recommendation - The recommendation object
 * @param {Object} marketContext - Current market conditions
 * @returns {number} Priority score (0-100)
 */
export const calculatePriorityScore = (recommendation, marketContext = {}) => {
    const {
        confidence = 50,
        potentialReturn = 0,
        riskLevel = 'medium',
        expiresAt,
        type = 'general'
    } = recommendation;

    const { condition = 'neutral', volatility = 'normal' } = marketContext;

    // Confidence score (0-100)
    const confidenceScore = Math.min(confidence, 100);

    // Potential return score (normalize to 0-100)
    const returnScore = Math.min(Math.max(potentialReturn * 10, 0), 100);

    // Risk score (inverted - lower risk = higher score)
    const riskScore = (RISK_SCORES[riskLevel] || 0.7) * 100;

    // Time urgency score
    const timeScore = calculateTimeUrgencyScore(expiresAt);

    // Market conditions score
    const marketScore = (MARKET_CONDITION_MULTIPLIERS[condition] || 1.0) * 100;

    // Calculate weighted score
    const weightedScore =
        (confidenceScore * PRIORITY_WEIGHTS.confidence) +
        (returnScore * PRIORITY_WEIGHTS.potentialReturn) +
        (riskScore * PRIORITY_WEIGHTS.riskLevel) +
        (timeScore * PRIORITY_WEIGHTS.timeUrgency) +
        (marketScore * PRIORITY_WEIGHTS.marketConditions);

    return Math.round(Math.min(weightedScore, 100));
};

/**
 * Calculate time urgency score based on expiration
 * @param {string|Date} expiresAt - Expiration timestamp
 * @returns {number} Urgency score (0-100)
 */
const calculateTimeUrgencyScore = (expiresAt) => {
    if (!expiresAt) return 50; // Default score for no expiration

    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours <= 0) return 0; // Expired
    if (diffHours <= 1) return 100; // Very urgent (1 hour or less)
    if (diffHours <= 4) return 80; // Urgent (4 hours or less)
    if (diffHours <= 24) return 60; // Moderate urgency (1 day or less)
    if (diffHours <= 168) return 40; // Low urgency (1 week or less)

    return 20; // Very low urgency (more than 1 week)
};

/**
 * Sort recommendations by priority using smart algorithms
 * @param {Array} recommendations - Array of recommendation objects
 * @param {Object} options - Sorting options
 * @returns {Array} Sorted recommendations
 */
export const sortRecommendationsByPriority = (recommendations, options = {}) => {
    const {
        algorithm = 'weighted', // 'weighted', 'confidence', 'return', 'risk', 'time'
        marketContext = {},
        userPreferences = {}
    } = options;

    const sortedRecommendations = [...recommendations].map(rec => ({
        ...rec,
        priorityScore: calculatePriorityScore(rec, marketContext)
    }));

    switch (algorithm) {
        case 'confidence':
            return sortedRecommendations.sort((a, b) => b.confidence - a.confidence);

        case 'return':
            return sortedRecommendations.sort((a, b) =>
                (b.potentialReturn || 0) - (a.potentialReturn || 0)
            );

        case 'risk':
            return sortedRecommendations.sort((a, b) => {
                const aRisk = RISK_SCORES[a.riskLevel] || 0.7;
                const bRisk = RISK_SCORES[b.riskLevel] || 0.7;
                return bRisk - aRisk; // Higher risk score (lower risk) first
            });

        case 'time':
            return sortedRecommendations.sort((a, b) => {
                const aTime = calculateTimeUrgencyScore(a.expiresAt);
                const bTime = calculateTimeUrgencyScore(b.expiresAt);
                return bTime - aTime;
            });

        case 'weighted':
        default:
            return sortedRecommendations.sort((a, b) => b.priorityScore - a.priorityScore);
    }
};

/**
 * Filter recommendations based on user criteria
 * @param {Array} recommendations - Array of recommendation objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered recommendations
 */
export const filterRecommendations = (recommendations, filters = {}) => {
    const {
        minConfidence = 0,
        maxRiskLevel = 'high',
        symbols = [],
        types = [],
        minPotentialReturn = null,
        maxTimeToExpiry = null,
        excludeExpired = true
    } = filters;

    const riskLevelOrder = { low: 1, medium: 2, high: 3 };
    const maxRiskValue = riskLevelOrder[maxRiskLevel] || 3;

    return recommendations.filter(rec => {
        // Confidence filter
        if (rec.confidence < minConfidence) return false;

        // Risk level filter
        const recRiskValue = riskLevelOrder[rec.riskLevel] || 2;
        if (recRiskValue > maxRiskValue) return false;

        // Symbol filter
        if (symbols.length > 0 && !symbols.includes(rec.symbol)) return false;

        // Type filter
        if (types.length > 0 && !types.includes(rec.type)) return false;

        // Potential return filter
        if (minPotentialReturn !== null && (rec.potentialReturn || 0) < minPotentialReturn) {
            return false;
        }

        // Time to expiry filter
        if (maxTimeToExpiry !== null && rec.expiresAt) {
            const now = new Date();
            const expiry = new Date(rec.expiresAt);
            const diffHours = (expiry - now) / (1000 * 60 * 60);
            if (diffHours > maxTimeToExpiry) return false;
        }

        // Exclude expired filter
        if (excludeExpired && rec.expiresAt) {
            const now = new Date();
            const expiry = new Date(rec.expiresAt);
            if (expiry <= now) return false;
        }

        return true;
    });
};

/**
 * Group recommendations by various criteria
 * @param {Array} recommendations - Array of recommendation objects
 * @param {string} groupBy - Grouping criteria ('symbol', 'type', 'risk', 'priority')
 * @returns {Object} Grouped recommendations
 */
export const groupRecommendations = (recommendations, groupBy = 'symbol') => {
    const groups = {};

    recommendations.forEach(rec => {
        let groupKey;

        switch (groupBy) {
            case 'symbol':
                groupKey = rec.symbol || 'Unknown';
                break;
            case 'type':
                groupKey = rec.type || 'General';
                break;
            case 'risk':
                groupKey = rec.riskLevel || 'Medium';
                break;
            case 'priority':
                const score = calculatePriorityScore(rec);
                if (score >= 80) groupKey = 'High Priority';
                else if (score >= 60) groupKey = 'Medium Priority';
                else groupKey = 'Low Priority';
                break;
            default:
                groupKey = 'All';
        }

        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(rec);
    });

    return groups;
};

/**
 * Calculate recommendation statistics
 * @param {Array} recommendations - Array of recommendation objects
 * @returns {Object} Statistics object
 */
export const calculateRecommendationStats = (recommendations) => {
    if (recommendations.length === 0) {
        return {
            total: 0,
            avgConfidence: 0,
            avgPotentialReturn: 0,
            riskDistribution: { low: 0, medium: 0, high: 0 },
            typeDistribution: {},
            expiringWithin24h: 0,
            highPriority: 0
        };
    }

    const total = recommendations.length;
    const avgConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / total;
    const avgPotentialReturn = recommendations.reduce((sum, rec) => sum + (rec.potentialReturn || 0), 0) / total;

    const riskDistribution = recommendations.reduce((dist, rec) => {
        const risk = rec.riskLevel || 'medium';
        dist[risk] = (dist[risk] || 0) + 1;
        return dist;
    }, { low: 0, medium: 0, high: 0 });

    const typeDistribution = recommendations.reduce((dist, rec) => {
        const type = rec.type || 'general';
        dist[type] = (dist[type] || 0) + 1;
        return dist;
    }, {});

    const now = new Date();
    const expiringWithin24h = recommendations.filter(rec => {
        if (!rec.expiresAt) return false;
        const expiry = new Date(rec.expiresAt);
        const diffHours = (expiry - now) / (1000 * 60 * 60);
        return diffHours > 0 && diffHours <= 24;
    }).length;

    const highPriority = recommendations.filter(rec => {
        const score = calculatePriorityScore(rec);
        return score >= 80;
    }).length;

    return {
        total,
        avgConfidence: Math.round(avgConfidence),
        avgPotentialReturn: Math.round(avgPotentialReturn * 100) / 100,
        riskDistribution,
        typeDistribution,
        expiringWithin24h,
        highPriority
    };
};

/**
 * Auto-cleanup expired recommendations
 * @param {Array} recommendations - Array of recommendation objects
 * @param {Object} options - Cleanup options
 * @returns {Array} Cleaned recommendations
 */
export const cleanupExpiredRecommendations = (recommendations, options = {}) => {
    const {
        removeExpired = true,
        gracePeriodhours = 1,
        markAsExpired = false
    } = options;

    const now = new Date();
    const gracePeriodMs = gracePeriodhours * 60 * 60 * 1000;

    return recommendations.filter(rec => {
        if (!rec.expiresAt) return true;

        const expiry = new Date(rec.expiresAt);
        const isExpired = (now - expiry) > gracePeriodMs;

        if (isExpired) {
            if (markAsExpired) {
                rec.status = 'expired';
                return true;
            }
            return !removeExpired;
        }

        return true;
    });
};

export default {
    calculatePriorityScore,
    sortRecommendationsByPriority,
    filterRecommendations,
    groupRecommendations,
    calculateRecommendationStats,
    cleanupExpiredRecommendations
};