import {
    calculateSMA,
    calculateEMA,
    calculateRSI,
    calculateMACD,
    calculateBollingerBands,
    calculateAllIndicators,
} from '../technicalIndicators';

// Sample test data
const sampleData = [
    { timestamp: 1000, open: 100, high: 105, low: 95, close: 102, volume: 1000 },
    { timestamp: 2000, open: 102, high: 108, low: 100, close: 106, volume: 1200 },
    { timestamp: 3000, open: 106, high: 110, low: 104, close: 108, volume: 1100 },
    { timestamp: 4000, open: 108, high: 112, low: 106, close: 110, volume: 1300 },
    { timestamp: 5000, open: 110, high: 115, low: 108, close: 112, volume: 1400 },
    { timestamp: 6000, open: 112, high: 116, low: 110, close: 114, volume: 1250 },
    { timestamp: 7000, open: 114, high: 118, low: 112, close: 116, volume: 1350 },
    { timestamp: 8000, open: 116, high: 120, low: 114, close: 118, volume: 1450 },
    { timestamp: 9000, open: 118, high: 122, low: 116, close: 120, volume: 1500 },
    { timestamp: 10000, open: 120, high: 124, low: 118, close: 122, volume: 1600 },
    { timestamp: 11000, open: 122, high: 126, low: 120, close: 124, volume: 1550 },
    { timestamp: 12000, open: 124, high: 128, low: 122, close: 126, volume: 1650 },
    { timestamp: 13000, open: 126, high: 130, low: 124, close: 128, volume: 1700 },
    { timestamp: 14000, open: 128, high: 132, low: 126, close: 130, volume: 1750 },
    { timestamp: 15000, open: 130, high: 134, low: 128, close: 132, volume: 1800 },
    { timestamp: 16000, open: 132, high: 136, low: 130, close: 134, volume: 1850 },
    { timestamp: 17000, open: 134, high: 138, low: 132, close: 136, volume: 1900 },
    { timestamp: 18000, open: 136, high: 140, low: 134, close: 138, volume: 1950 },
    { timestamp: 19000, open: 138, high: 142, low: 136, close: 140, volume: 2000 },
    { timestamp: 20000, open: 140, high: 144, low: 138, close: 142, volume: 2050 },
];

describe('Technical Indicators', () => {
    describe('calculateSMA', () => {
        it('should calculate Simple Moving Average correctly', () => {
            const result = calculateSMA(sampleData, 5);

            expect(result).toHaveLength(16); // 20 - 5 + 1
            expect(result[0].value).toBeCloseTo(105.6, 1); // Average of first 5 closes
            expect(result[0].timestamp).toBe(5000);
            expect(result[0].index).toBe(4);
        });

        it('should return empty array for insufficient data', () => {
            const result = calculateSMA(sampleData.slice(0, 3), 5);
            expect(result).toHaveLength(0);
        });

        it('should handle empty data', () => {
            const result = calculateSMA([], 5);
            expect(result).toHaveLength(0);
        });

        it('should handle null data', () => {
            const result = calculateSMA(null, 5);
            expect(result).toHaveLength(0);
        });
    });

    describe('calculateEMA', () => {
        it('should calculate Exponential Moving Average correctly', () => {
            const result = calculateEMA(sampleData, 5);

            expect(result).toHaveLength(16); // 20 - 5 + 1
            expect(result[0].value).toBeCloseTo(105.6, 1); // First value should be SMA
            expect(result[0].timestamp).toBe(5000);
            expect(result[1].value).toBeGreaterThan(result[0].value); // Should trend upward
        });

        it('should return empty array for insufficient data', () => {
            const result = calculateEMA(sampleData.slice(0, 3), 5);
            expect(result).toHaveLength(0);
        });
    });

    describe('calculateRSI', () => {
        it('should calculate RSI correctly', () => {
            const result = calculateRSI(sampleData, 14);

            expect(result).toHaveLength(6); // 20 - 14
            expect(result[0].value).toBeGreaterThan(0);
            expect(result[0].value).toBeLessThan(100);
            expect(result[0].timestamp).toBe(15000);
        });

        it('should return empty array for insufficient data', () => {
            const result = calculateRSI(sampleData.slice(0, 10), 14);
            expect(result).toHaveLength(0);
        });
    });

    describe('calculateMACD', () => {
        it('should calculate MACD correctly', () => {
            const result = calculateMACD(sampleData, 5, 10, 3);

            expect(result).toHaveProperty('macd');
            expect(result).toHaveProperty('signal');
            expect(result).toHaveProperty('histogram');

            expect(result.macd.length).toBeGreaterThan(0);
            expect(result.signal.length).toBeGreaterThan(0);
            expect(result.histogram.length).toBeGreaterThan(0);
        });

        it('should return empty arrays for insufficient data', () => {
            const result = calculateMACD(sampleData.slice(0, 5), 12, 26, 9);

            expect(result.macd).toHaveLength(0);
            expect(result.signal).toHaveLength(0);
            expect(result.histogram).toHaveLength(0);
        });
    });

    describe('calculateBollingerBands', () => {
        it('should calculate Bollinger Bands correctly', () => {
            const result = calculateBollingerBands(sampleData, 10, 2);

            expect(result).toHaveProperty('upper');
            expect(result).toHaveProperty('middle');
            expect(result).toHaveProperty('lower');

            expect(result.upper).toHaveLength(11); // 20 - 10 + 1
            expect(result.middle).toHaveLength(11);
            expect(result.lower).toHaveLength(11);

            // Upper band should be higher than middle, middle higher than lower
            expect(result.upper[0].value).toBeGreaterThan(result.middle[0].value);
            expect(result.middle[0].value).toBeGreaterThan(result.lower[0].value);
        });

        it('should return empty arrays for insufficient data', () => {
            const result = calculateBollingerBands(sampleData.slice(0, 5), 10, 2);

            expect(result.upper).toHaveLength(0);
            expect(result.middle).toHaveLength(0);
            expect(result.lower).toHaveLength(0);
        });
    });

    describe('calculateAllIndicators', () => {
        it('should calculate all indicators when configured', () => {
            const config = {
                sma: { period: 5 },
                ema: { period: 5 },
                rsi: { period: 14 },
                macd: { fastPeriod: 5, slowPeriod: 10, signalPeriod: 3 },
                bollingerBands: { period: 10, stdDev: 2 },
            };

            const result = calculateAllIndicators(sampleData, config);

            expect(result).toHaveProperty('sma');
            expect(result).toHaveProperty('ema');
            expect(result).toHaveProperty('rsi');
            expect(result).toHaveProperty('macd');
            expect(result).toHaveProperty('bollingerBands');

            expect(result.sma.length).toBeGreaterThan(0);
            expect(result.ema.length).toBeGreaterThan(0);
            expect(result.rsi.length).toBeGreaterThan(0);
            expect(result.macd.macd.length).toBeGreaterThan(0);
            expect(result.bollingerBands.upper.length).toBeGreaterThan(0);
        });

        it('should return empty object for empty data', () => {
            const result = calculateAllIndicators([]);
            expect(result).toEqual({});
        });

        it('should handle errors gracefully', () => {
            const result = calculateAllIndicators(null);
            expect(result).toEqual({});
        });

        it('should only calculate configured indicators', () => {
            const config = {
                sma: { period: 5 },
                // Only SMA configured
            };

            const result = calculateAllIndicators(sampleData, config);

            expect(result).toHaveProperty('sma');
            expect(result).not.toHaveProperty('ema');
            expect(result).not.toHaveProperty('rsi');
            expect(result).not.toHaveProperty('macd');
            expect(result).not.toHaveProperty('bollingerBands');
        });
    });

    describe('Edge Cases', () => {
        it('should handle single data point', () => {
            const singlePoint = [sampleData[0]];

            expect(calculateSMA(singlePoint, 5)).toHaveLength(0);
            expect(calculateEMA(singlePoint, 5)).toHaveLength(0);
            expect(calculateRSI(singlePoint, 14)).toHaveLength(0);
        });

        it('should handle data with same values', () => {
            const flatData = Array(20).fill(null).map((_, i) => ({
                timestamp: i * 1000,
                open: 100,
                high: 100,
                low: 100,
                close: 100,
                volume: 1000,
            }));

            const sma = calculateSMA(flatData, 5);
            expect(sma[0].value).toBe(100);

            const rsi = calculateRSI(flatData, 14);
            // RSI should be 50 when there's no price movement
            expect(rsi[0].value).toBeCloseTo(50, 0);
        });

        it('should handle very small periods', () => {
            const sma = calculateSMA(sampleData, 1);
            expect(sma).toHaveLength(20);
            expect(sma[0].value).toBe(sampleData[0].close);
        });
    });
});