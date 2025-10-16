import {
    calculatePriorityScore,
    sortRecommendationsByPriority,
    filterRecommendations,
    groupRecommendations,
    calculateRecommendationStats,
    cleanupExpiredRecommendations
} from '../recommendationPrioritization';

const mockRecommendations = [
    {
        id: 'rec-1',
        symbol: 'AAPL',
        confidence: 85,
        potentialReturn: 5.2,
        riskLevel: 'low',
        priority: 'high',
        type: 'price_target',
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
    },
    {
        id: 'rec-2',
        symbol: 'TSLA',
        confidence: 72,
        potentialReturn: 8.1,
        riskLevel: 'high',
        priority: 'medium',
        type: 'volatility',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    },
    {
        id: 'rec-3',
        symbol: 'MSFT',
        confidence: 68,
        potentialReturn: 2.8,
        riskLevel: 'medium',
        priority: 'low',
        type: 'trend_analysis',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    },
    {
        id: 'rec-4',
        symbol: 'GOOGL',
        confidence: 90,
        potentialReturn: 4.5,
        riskLevel: 'low',
        priority: 'high',
        type: 'price_target',
        expiresAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() // Expired 1 hour ago
    }
];

describe('recommendationPrioritization', () => {
    describe('calculatePriorityScore', () => {
        it('calculates priority score correctly for high-quality recommendation', () => {
            const recommendation = {
                confidence: 90,
                potentialReturn: 5.0,
                riskLevel: 'low',
                expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
            };

            const score = calculatePriorityScore(recommendation);
            expect(score).toBeGreaterThan(80);
        });

        it('calculates lower score for poor-quality recommendation', () => {
            const recommendation = {
                confidence: 40,
                potentialReturn: 1.0,
                riskLevel: 'high',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
            };

            const score = calculatePriorityScore(recommendation);
            expect(score).toBeLessThan(50);
        });

        it('handles missing fields gracefully', () => {
            const recommendation = { id: 'test' };
            const score = calculatePriorityScore(recommendation);
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
        });

        it('applies market context multipliers', () => {
            const recommendation = {
                confidence: 80,
                potentialReturn: 4.0,
                riskLevel: 'medium'
            };

            const bullishScore = calculatePriorityScore(recommendation, { condition: 'bullish' });
            const bearishScore = calculatePriorityScore(recommendation, { condition: 'bearish' });

            expect(bullishScore).toBeGreaterThan(bearishScore);
        });
    });

    describe('sortRecommendationsByPriority', () => {
        it('sorts by weighted priority score by default', () => {
            const sorted = sortRecommendationsByPriority(mockRecommendations);

            // Should have priority scores calculated
            expect(sorted[0]).toHaveProperty('priorityScore');
            expect(sorted[1]).toHaveProperty('priorityScore');

            // Should be sorted in descending order of priority score
            expect(sorted[0].priorityScore).toBeGreaterThanOrEqual(sorted[1].priorityScore);
        });

        it('sorts by confidence when specified', () => {
            const sorted = sortRecommendationsByPriority(mockRecommendations, { algorithm: 'confidence' });

            expect(sorted[0].confidence).toBe(90); // GOOGL
            expect(sorted[1].confidence).toBe(85); // AAPL
            expect(sorted[2].confidence).toBe(72); // TSLA
            expect(sorted[3].confidence).toBe(68); // MSFT
        });

        it('sorts by potential return when specified', () => {
            const sorted = sortRecommendationsByPriority(mockRecommendations, { algorithm: 'return' });

            expect(sorted[0].potentialReturn).toBe(8.1); // TSLA
            expect(sorted[1].potentialReturn).toBe(5.2); // AAPL
            expect(sorted[2].potentialReturn).toBe(4.5); // GOOGL
            expect(sorted[3].potentialReturn).toBe(2.8); // MSFT
        });

        it('sorts by risk level when specified', () => {
            const sorted = sortRecommendationsByPriority(mockRecommendations, { algorithm: 'risk' });

            // Low risk should come first (higher risk score)
            expect(sorted[0].riskLevel).toBe('low');
            expect(sorted[1].riskLevel).toBe('low');
            expect(sorted[2].riskLevel).toBe('medium');
            expect(sorted[3].riskLevel).toBe('high');
        });
    });

    describe('filterRecommendations', () => {
        it('filters by minimum confidence', () => {
            const filtered = filterRecommendations(mockRecommendations, { minConfidence: 75 });

            expect(filtered).toHaveLength(2);
            expect(filtered.every(rec => rec.confidence >= 75)).toBe(true);
        });

        it('filters by maximum risk level', () => {
            const filtered = filterRecommendations(mockRecommendations, { maxRiskLevel: 'medium' });

            expect(filtered).toHaveLength(3);
            expect(filtered.every(rec => ['low', 'medium'].includes(rec.riskLevel))).toBe(true);
        });

        it('filters by symbols', () => {
            const filtered = filterRecommendations(mockRecommendations, { symbols: ['AAPL', 'TSLA'] });

            expect(filtered).toHaveLength(2);
            expect(filtered.every(rec => ['AAPL', 'TSLA'].includes(rec.symbol))).toBe(true);
        });

        it('filters by types', () => {
            const filtered = filterRecommendations(mockRecommendations, { types: ['price_target'] });

            expect(filtered).toHaveLength(2);
            expect(filtered.every(rec => rec.type === 'price_target')).toBe(true);
        });

        it('excludes expired recommendations by default', () => {
            const filtered = filterRecommendations(mockRecommendations);

            expect(filtered).toHaveLength(3);
            expect(filtered.every(rec => new Date(rec.expiresAt) > new Date())).toBe(true);
        });

        it('includes expired recommendations when specified', () => {
            const filtered = filterRecommendations(mockRecommendations, { excludeExpired: false });

            expect(filtered).toHaveLength(4);
        });

        it('filters by minimum potential return', () => {
            const filtered = filterRecommendations(mockRecommendations, { minPotentialReturn: 4.0 });

            expect(filtered).toHaveLength(3);
            expect(filtered.every(rec => rec.potentialReturn >= 4.0)).toBe(true);
        });
    });

    describe('groupRecommendations', () => {
        it('groups by symbol', () => {
            const grouped = groupRecommendations(mockRecommendations, 'symbol');

            expect(grouped).toHaveProperty('AAPL');
            expect(grouped).toHaveProperty('TSLA');
            expect(grouped).toHaveProperty('MSFT');
            expect(grouped).toHaveProperty('GOOGL');

            expect(grouped.AAPL).toHaveLength(1);
            expect(grouped.TSLA).toHaveLength(1);
        });

        it('groups by type', () => {
            const grouped = groupRecommendations(mockRecommendations, 'type');

            expect(grouped).toHaveProperty('price_target');
            expect(grouped).toHaveProperty('volatility');
            expect(grouped).toHaveProperty('trend_analysis');

            expect(grouped.price_target).toHaveLength(2);
            expect(grouped.volatility).toHaveLength(1);
        });

        it('groups by risk level', () => {
            const grouped = groupRecommendations(mockRecommendations, 'risk');

            expect(grouped).toHaveProperty('low');
            expect(grouped).toHaveProperty('medium');
            expect(grouped).toHaveProperty('high');

            expect(grouped.low).toHaveLength(2);
            expect(grouped.medium).toHaveLength(1);
            expect(grouped.high).toHaveLength(1);
        });

        it('groups by priority level', () => {
            const grouped = groupRecommendations(mockRecommendations, 'priority');

            expect(grouped).toHaveProperty('High Priority');
            expect(grouped).toHaveProperty('Medium Priority');
            expect(grouped).toHaveProperty('Low Priority');
        });
    });

    describe('calculateRecommendationStats', () => {
        it('calculates statistics correctly', () => {
            const stats = calculateRecommendationStats(mockRecommendations);

            expect(stats.total).toBe(4);
            expect(stats.avgConfidence).toBe(79); // (85+72+68+90)/4 = 78.75, rounded to 79
            expect(stats.avgPotentialReturn).toBe(5.15); // (5.2+8.1+2.8+4.5)/4 = 5.15

            expect(stats.riskDistribution.low).toBe(2);
            expect(stats.riskDistribution.medium).toBe(1);
            expect(stats.riskDistribution.high).toBe(1);

            expect(stats.typeDistribution.price_target).toBe(2);
            expect(stats.typeDistribution.volatility).toBe(1);
            expect(stats.typeDistribution.trend_analysis).toBe(1);
        });

        it('handles empty array', () => {
            const stats = calculateRecommendationStats([]);

            expect(stats.total).toBe(0);
            expect(stats.avgConfidence).toBe(0);
            expect(stats.avgPotentialReturn).toBe(0);
            expect(stats.riskDistribution.low).toBe(0);
            expect(stats.expiringWithin24h).toBe(0);
            expect(stats.highPriority).toBe(0);
        });

        it('counts expiring recommendations correctly', () => {
            const stats = calculateRecommendationStats(mockRecommendations);

            // Should count recommendations expiring within 24 hours
            expect(stats.expiringWithin24h).toBeGreaterThanOrEqual(1);
        });
    });

    describe('cleanupExpiredRecommendations', () => {
        it('removes expired recommendations by default', () => {
            const cleaned = cleanupExpiredRecommendations(mockRecommendations);

            expect(cleaned).toHaveLength(3);
            expect(cleaned.every(rec => new Date(rec.expiresAt) > new Date())).toBe(true);
        });

        it('marks expired recommendations when specified', () => {
            const cleaned = cleanupExpiredRecommendations(mockRecommendations, {
                removeExpired: false,
                markAsExpired: true
            });

            expect(cleaned).toHaveLength(4);

            const expiredRec = cleaned.find(rec => rec.id === 'rec-4');
            expect(expiredRec.status).toBe('expired');
        });

        it('respects grace period', () => {
            const recentlyExpired = {
                ...mockRecommendations[0],
                id: 'recent-expired',
                expiresAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
            };

            const testRecommendations = [...mockRecommendations, recentlyExpired];

            // With 1 hour grace period, should keep recently expired
            const cleaned = cleanupExpiredRecommendations(testRecommendations, { gracePeriodhours: 1 });
            expect(cleaned.find(rec => rec.id === 'recent-expired')).toBeDefined();

            // With 0 hour grace period, should remove recently expired
            const cleanedNoGrace = cleanupExpiredRecommendations(testRecommendations, { gracePeriodhours: 0 });
            expect(cleanedNoGrace.find(rec => rec.id === 'recent-expired')).toBeUndefined();
        });

        it('handles recommendations without expiration', () => {
            const noExpirationRec = {
                id: 'no-expiry',
                symbol: 'TEST',
                confidence: 80
            };

            const testRecommendations = [noExpirationRec];
            const cleaned = cleanupExpiredRecommendations(testRecommendations);

            expect(cleaned).toHaveLength(1);
            expect(cleaned[0].id).toBe('no-expiry');
        });
    });
});