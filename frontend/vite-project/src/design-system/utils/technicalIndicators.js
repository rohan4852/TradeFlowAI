/**
 * Technical Indicators Utility
 * Provides calculations for common trading indicators
 */

// Simple Moving Average
export const calculateSMA = (data, period) => {
    if (!data || data.length < period) return [];

    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
        sma.push(sum / period);
    }
    return sma;
};

// Exponential Moving Average
export const calculateEMA = (data, period) => {
    if (!data || data.length < period) return [];

    const multiplier = 2 / (period + 1);
    const ema = [data[0]];

    for (let i = 1; i < data.length; i++) {
        ema.push((data[i] * multiplier) + (ema[i - 1] * (1 - multiplier)));
    }

    return ema;
};

// Weighted Moving Average
export const calculateWMA = (data, period) => {
    if (!data || data.length < period) return [];

    const wma = [];
    const weightSum = (period * (period + 1)) / 2;

    for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j] * (period - j);
        }
        wma.push(sum / weightSum);
    }

    return wma;
};

// Relative Strength Index
export const calculateRSI = (data, period = 14) => {
    if (!data || data.length < period + 1) return [];

    const changes = [];
    for (let i = 1; i < data.length; i++) {
        changes.push(data[i] - data[i - 1]);
    }

    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);

    const avgGain = calculateSMA(gains, period);
    const avgLoss = calculateSMA(losses, period);

    const rsi = [];
    for (let i = 0; i < avgGain.length; i++) {
        if (avgLoss[i] === 0) {
            rsi.push(100);
        } else {
            const rs = avgGain[i] / avgLoss[i];
            rsi.push(100 - (100 / (1 + rs)));
        }
    }

    return rsi;
};

// MACD (Moving Average Convergence Divergence)
export const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
    if (!data || data.length < slowPeriod) return { macd: [], signal: [], histogram: [] };

    const fastEMA = calculateEMA(data, fastPeriod);
    const slowEMA = calculateEMA(data, slowPeriod);

    const macd = [];
    const startIndex = slowPeriod - fastPeriod;

    for (let i = startIndex; i < fastEMA.length; i++) {
        macd.push(fastEMA[i] - slowEMA[i - startIndex]);
    }

    const signal = calculateEMA(macd, signalPeriod);
    const histogram = [];

    const signalStartIndex = macd.length - signal.length;
    for (let i = signalStartIndex; i < macd.length; i++) {
        histogram.push(macd[i] - signal[i - signalStartIndex]);
    }

    return { macd, signal, histogram };
};

// Bollinger Bands
export const calculateBollingerBands = (data, period = 20, stdDev = 2) => {
    if (!data || data.length < period) return { upper: [], middle: [], lower: [] };

    const middle = calculateSMA(data, period);
    const upper = [];
    const lower = [];

    for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        const mean = slice.reduce((acc, val) => acc + val, 0) / period;
        const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
        const standardDeviation = Math.sqrt(variance);

        const middleIndex = i - period + 1;
        upper.push(middle[middleIndex] + (standardDeviation * stdDev));
        lower.push(middle[middleIndex] - (standardDeviation * stdDev));
    }

    return { upper, middle, lower };
};

// Stochastic Oscillator
export const calculateStochastic = (high, low, close, kPeriod = 14, dPeriod = 3) => {
    if (!high || !low || !close || high.length < kPeriod) return { k: [], d: [] };

    const k = [];

    for (let i = kPeriod - 1; i < close.length; i++) {
        const highestHigh = Math.max(...high.slice(i - kPeriod + 1, i + 1));
        const lowestLow = Math.min(...low.slice(i - kPeriod + 1, i + 1));

        if (highestHigh === lowestLow) {
            k.push(50);
        } else {
            k.push(((close[i] - lowestLow) / (highestHigh - lowestLow)) * 100);
        }
    }

    const d = calculateSMA(k, dPeriod);

    return { k, d };
};

// Average True Range
export const calculateATR = (high, low, close, period = 14) => {
    if (!high || !low || !close || high.length < 2) return [];

    const trueRanges = [];

    for (let i = 1; i < close.length; i++) {
        const tr1 = high[i] - low[i];
        const tr2 = Math.abs(high[i] - close[i - 1]);
        const tr3 = Math.abs(low[i] - close[i - 1]);
        trueRanges.push(Math.max(tr1, tr2, tr3));
    }

    return calculateSMA(trueRanges, period);
};

// Williams %R
export const calculateWilliamsR = (high, low, close, period = 14) => {
    if (!high || !low || !close || high.length < period) return [];

    const williamsR = [];

    for (let i = period - 1; i < close.length; i++) {
        const highestHigh = Math.max(...high.slice(i - period + 1, i + 1));
        const lowestLow = Math.min(...low.slice(i - period + 1, i + 1));

        if (highestHigh === lowestLow) {
            williamsR.push(-50);
        } else {
            williamsR.push(((highestHigh - close[i]) / (highestHigh - lowestLow)) * -100);
        }
    }

    return williamsR;
};

// Commodity Channel Index
export const calculateCCI = (high, low, close, period = 20) => {
    if (!high || !low || !close || high.length < period) return [];

    const typicalPrices = [];
    for (let i = 0; i < close.length; i++) {
        typicalPrices.push((high[i] + low[i] + close[i]) / 3);
    }

    const smaTP = calculateSMA(typicalPrices, period);
    const cci = [];

    for (let i = period - 1; i < typicalPrices.length; i++) {
        const slice = typicalPrices.slice(i - period + 1, i + 1);
        const sma = smaTP[i - period + 1];
        const meanDeviation = slice.reduce((acc, val) => acc + Math.abs(val - sma), 0) / period;

        if (meanDeviation === 0) {
            cci.push(0);
        } else {
            cci.push((typicalPrices[i] - sma) / (0.015 * meanDeviation));
        }
    }

    return cci;
};

// Money Flow Index
export const calculateMFI = (high, low, close, volume, period = 14) => {
    if (!high || !low || !close || !volume || high.length < period + 1) return [];

    const typicalPrices = [];
    const rawMoneyFlows = [];

    for (let i = 0; i < close.length; i++) {
        const tp = (high[i] + low[i] + close[i]) / 3;
        typicalPrices.push(tp);
        rawMoneyFlows.push(tp * volume[i]);
    }

    const mfi = [];

    for (let i = period; i < typicalPrices.length; i++) {
        let positiveFlow = 0;
        let negativeFlow = 0;

        for (let j = i - period + 1; j <= i; j++) {
            if (typicalPrices[j] > typicalPrices[j - 1]) {
                positiveFlow += rawMoneyFlows[j];
            } else if (typicalPrices[j] < typicalPrices[j - 1]) {
                negativeFlow += rawMoneyFlows[j];
            }
        }

        if (negativeFlow === 0) {
            mfi.push(100);
        } else {
            const moneyRatio = positiveFlow / negativeFlow;
            mfi.push(100 - (100 / (1 + moneyRatio)));
        }
    }

    return mfi;
};

// Parabolic SAR
export const calculateParabolicSAR = (high, low, close, step = 0.02, max = 0.2) => {
    if (!high || !low || !close || high.length < 2) return [];

    const sar = [close[0]];
    let trend = 1; // 1 for uptrend, -1 for downtrend
    let af = step;
    let ep = high[0]; // Extreme point

    for (let i = 1; i < close.length; i++) {
        let newSar;

        if (trend === 1) {
            newSar = sar[i - 1] + af * (ep - sar[i - 1]);

            if (high[i] > ep) {
                ep = high[i];
                af = Math.min(af + step, max);
            }

            if (newSar > low[i]) {
                trend = -1;
                newSar = ep;
                ep = low[i];
                af = step;
            }
        } else {
            newSar = sar[i - 1] + af * (ep - sar[i - 1]);

            if (low[i] < ep) {
                ep = low[i];
                af = Math.min(af + step, max);
            }

            if (newSar < high[i]) {
                trend = 1;
                newSar = ep;
                ep = high[i];
                af = step;
            }
        }

        sar.push(newSar);
    }

    return sar;
};

// Ichimoku Cloud
export const calculateIchimoku = (high, low, close, tenkanPeriod = 9, kijunPeriod = 26, senkouBPeriod = 52) => {
    if (!high || !low || !close || high.length < senkouBPeriod) {
        return { tenkanSen: [], kijunSen: [], senkouSpanA: [], senkouSpanB: [], chikouSpan: [] };
    }

    const tenkanSen = [];
    const kijunSen = [];
    const senkouSpanA = [];
    const senkouSpanB = [];
    const chikouSpan = [];

    // Calculate Tenkan-sen (Conversion Line)
    for (let i = tenkanPeriod - 1; i < high.length; i++) {
        const highestHigh = Math.max(...high.slice(i - tenkanPeriod + 1, i + 1));
        const lowestLow = Math.min(...low.slice(i - tenkanPeriod + 1, i + 1));
        tenkanSen.push((highestHigh + lowestLow) / 2);
    }

    // Calculate Kijun-sen (Base Line)
    for (let i = kijunPeriod - 1; i < high.length; i++) {
        const highestHigh = Math.max(...high.slice(i - kijunPeriod + 1, i + 1));
        const lowestLow = Math.min(...low.slice(i - kijunPeriod + 1, i + 1));
        kijunSen.push((highestHigh + lowestLow) / 2);
    }

    // Calculate Senkou Span A (Leading Span A)
    const startIndex = Math.max(tenkanPeriod, kijunPeriod) - 1;
    for (let i = startIndex; i < high.length; i++) {
        const tenkanIndex = i - (kijunPeriod - tenkanPeriod);
        const kijunIndex = i - startIndex;
        if (tenkanIndex >= 0 && kijunIndex >= 0) {
            senkouSpanA.push((tenkanSen[tenkanIndex] + kijunSen[kijunIndex]) / 2);
        }
    }

    // Calculate Senkou Span B (Leading Span B)
    for (let i = senkouBPeriod - 1; i < high.length; i++) {
        const highestHigh = Math.max(...high.slice(i - senkouBPeriod + 1, i + 1));
        const lowestLow = Math.min(...low.slice(i - senkouBPeriod + 1, i + 1));
        senkouSpanB.push((highestHigh + lowestLow) / 2);
    }

    // Calculate Chikou Span (Lagging Span)
    for (let i = kijunPeriod; i < close.length; i++) {
        chikouSpan.push(close[i - kijunPeriod]);
    }

    return { tenkanSen, kijunSen, senkouSpanA, senkouSpanB, chikouSpan };
};

// Volume indicators
export const calculateOBV = (close, volume) => {
    if (!close || !volume || close.length < 2) return [];

    const obv = [volume[0]];

    for (let i = 1; i < close.length; i++) {
        if (close[i] > close[i - 1]) {
            obv.push(obv[i - 1] + volume[i]);
        } else if (close[i] < close[i - 1]) {
            obv.push(obv[i - 1] - volume[i]);
        } else {
            obv.push(obv[i - 1]);
        }
    }

    return obv;
};

// Volume Weighted Average Price
export const calculateVWAP = (high, low, close, volume) => {
    if (!high || !low || !close || !volume) return [];

    const vwap = [];
    let cumulativeTPV = 0;
    let cumulativeVolume = 0;

    for (let i = 0; i < close.length; i++) {
        const typicalPrice = (high[i] + low[i] + close[i]) / 3;
        const tpv = typicalPrice * volume[i];

        cumulativeTPV += tpv;
        cumulativeVolume += volume[i];

        vwap.push(cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : typicalPrice);
    }

    return vwap;
};

// Calculate all indicators for a given dataset
export const calculateAllIndicators = (data, options = {}) => {
    const {
        sma = [20, 50],
        ema = [12, 26],
        rsi = 14,
        macd = { fast: 12, slow: 26, signal: 9 },
        bollinger = { period: 20, stdDev: 2 },
        stochastic = { k: 14, d: 3 },
        atr = 14,
        williamsR = 14,
        cci = 20,
        mfi = 14,
        parabolicSAR = { step: 0.02, max: 0.2 },
        ichimoku = { tenkan: 9, kijun: 26, senkouB: 52 },
        vwap = true,
        obv = true
    } = options;

    if (!data || !data.length) return {};

    const { high, low, close, volume } = data[0];
    const prices = data.map(d => d.close);
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const closes = data.map(d => d.close);
    const volumes = data.map(d => d.volume);

    const indicators = {};

    // Moving averages
    if (sma) {
        indicators.sma = {};
        sma.forEach(period => {
            indicators.sma[period] = calculateSMA(prices, period);
        });
    }

    if (ema) {
        indicators.ema = {};
        ema.forEach(period => {
            indicators.ema[period] = calculateEMA(prices, period);
        });
    }

    // Oscillators
    if (rsi) {
        indicators.rsi = calculateRSI(prices, rsi);
    }

    if (macd) {
        indicators.macd = calculateMACD(prices, macd.fast, macd.slow, macd.signal);
    }

    if (stochastic) {
        indicators.stochastic = calculateStochastic(highs, lows, closes, stochastic.k, stochastic.d);
    }

    if (williamsR) {
        indicators.williamsR = calculateWilliamsR(highs, lows, closes, williamsR);
    }

    if (cci) {
        indicators.cci = calculateCCI(highs, lows, closes, cci);
    }

    if (mfi && volumes) {
        indicators.mfi = calculateMFI(highs, lows, closes, volumes, mfi);
    }

    // Bands and channels
    if (bollinger) {
        indicators.bollingerBands = calculateBollingerBands(prices, bollinger.period, bollinger.stdDev);
    }

    // Trend indicators
    if (atr) {
        indicators.atr = calculateATR(highs, lows, closes, atr);
    }

    if (parabolicSAR) {
        indicators.parabolicSAR = calculateParabolicSAR(highs, lows, closes, parabolicSAR.step, parabolicSAR.max);
    }

    if (ichimoku) {
        indicators.ichimoku = calculateIchimoku(highs, lows, closes, ichimoku.tenkan, ichimoku.kijun, ichimoku.senkouB);
    }

    // Volume indicators
    if (vwap && volumes) {
        indicators.vwap = calculateVWAP(highs, lows, closes, volumes);
    }

    if (obv && volumes) {
        indicators.obv = calculateOBV(closes, volumes);
    }

    return indicators;
};