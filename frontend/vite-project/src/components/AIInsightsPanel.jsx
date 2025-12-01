/**
 * Advanced AI Insights Panel - Next-Gen Trading Intelligence
 * Refactored to use the new design system components
 */
import React, { useState, useEffect } from 'react';
import { RecommendationPanel, PredictionCard, ConfidenceIndicator, Button, Icon } from '../design-system';

const AIInsightsPanel = ({ ticker, aiInsights, marketData, isLoading }) => {
    const [selectedInsight, setSelectedInsight] = useState('overview');
    const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
    const [timeHorizon, setTimeHorizon] = useState('1h');

    const insightTypes = [
        { id: 'overview', label: '🎯 Overview', icon: '🎯' },
        { id: 'technical', label: '📈 Technical', icon: '📈' },
        { id: 'sentiment', label: '🧠 Sentiment', icon: '🧠' },
        { id: 'patterns', label: '🔍 Patterns', icon: '🔍' },
        { id: 'risk', label: '⚠️ Risk', icon: '⚠️' },
        { id: 'opportunities', label: '💎 Opportunities', icon: '💎' }
    ];

    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8) return '#00ff88';
        if (confidence >= 0.6) return '#ffaa00';
        if (confidence >= 0.4) return '#ff6600';
        return '#ff4444';
    };

    const getSignalStrength = (strength) => {
        const bars = Math.ceil(strength * 5);
        return '█'.repeat(bars) + '░'.repeat(5 - bars);
    };

    const formatPercentage = (value) => {
        if (!value) return '0.00%';
        return `${(value * 100).toFixed(2)}%`;
    };

    if (isLoading) {
        return (
            <div className="ai-insights-panel loading">
                <div className="panel-header">
                    <h3>🤖 AI Insights</h3>
                </div>
                <div className="loading-content">
                    <div className="ai-loading-animation">
                        <div className="neural-network">
                            <div className="node"></div>
                            <div className="node"></div>
                            <div className="node"></div>
                        </div>
                    </div>
                    <p>AI analyzing market data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="ai-insights-panel">
            <div className="panel-header">
                <h3>🤖 AI Insights - {ticker}</h3>
                <div className="insight-controls">
                    <select
                        value={timeHorizon}
                        onChange={(e) => setTimeHorizon(e.target.value)}
                        className="time-selector"
                    >
                        <option value="5m">5min</option>
                        <option value="15m">15min</option>
                        <option value="1h">1hour</option>
                        <option value="4h">4hour</option>
                        <option value="1d">1day</option>
                    </select>
                </div>
            </div>

            {/* AI Confidence Meter */}
            <div className="ai-confidence-meter">
                <div className="confidence-header">
                    <span>AI Confidence Level</span>
                    <span className="confidence-value">
                        {((aiInsights?.overallConfidence || 0.75) * 100).toFixed(0)}%
                    </span>
                </div>
                <div className="confidence-bar">
                    <div
                        className="confidence-fill"
                        style={{
                            width: `${(aiInsights?.overallConfidence || 0.75) * 100}%`,
                            background: `linear-gradient(90deg, 
                                #ff4444 0%, 
                                #ffaa00 50%, 
                                #00ff88 100%)`
                        }}
                    />
                </div>
                <div className="confidence-labels">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                </div>
            </div>

            {/* Insight Navigation */}
            <div className="insight-navigation">
                {insightTypes.map(type => (
                    <button
                        key={type.id}
                        className={`insight-tab ${selectedInsight === type.id ? 'active' : ''}`}
                        onClick={() => setSelectedInsight(type.id)}
                    >
                        <span className="tab-icon">{type.icon}</span>
                        <span className="tab-label">{type.label.split(' ')[1]}</span>
                    </button>
                ))}
            </div>

            {/* Insight Content */}
            <div className="insight-content">
                {selectedInsight === 'overview' && (
                    <div className="overview-insights">
                        <div className="market-pulse">
                            <h4>🎯 Market Pulse</h4>
                            <div className="pulse-metrics">
                                <div className="pulse-item">
                                    <span className="pulse-label">Trend Strength</span>
                                    <div className="pulse-visual">
                                        <span className="signal-bars">
                                            {getSignalStrength(aiInsights?.trendStrength || 0.7)}
                                        </span>
                                        <span className="signal-value">
                                            {((aiInsights?.trendStrength || 0.7) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="pulse-item">
                                    <span className="pulse-label">Momentum</span>
                                    <div className="pulse-visual">
                                        <span className="signal-bars">
                                            {getSignalStrength(aiInsights?.momentum || 0.6)}
                                        </span>
                                        <span className="signal-value">
                                            {((aiInsights?.momentum || 0.6) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="pulse-item">
                                    <span className="pulse-label">Volatility</span>
                                    <div className="pulse-visual">
                                        <span className="signal-bars">
                                            {getSignalStrength(aiInsights?.volatility || 0.4)}
                                        </span>
                                        <span className="signal-value">
                                            {((aiInsights?.volatility || 0.4) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="ai-recommendation">
                            <h4>🎯 AI Recommendation</h4>
                            <div className="recommendation-card">
                                <div className="rec-header">
                                    <span className={`rec-action ${(aiInsights?.recommendation?.action || 'hold').toLowerCase()}`}>
                                        {(aiInsights?.recommendation?.action || 'HOLD').toUpperCase()}
                                    </span>
                                    <span className="rec-confidence">
                                        {formatPercentage(aiInsights?.recommendation?.confidence || 0.75)}
                                    </span>
                                </div>
                                <div className="rec-details">
                                    <div className="rec-item">
                                        <label>Target Price</label>
                                        <span>${(aiInsights?.recommendation?.targetPrice || 150).toFixed(2)}</span>
                                    </div>
                                    <div className="rec-item">
                                        <label>Stop Loss</label>
                                        <span>${(aiInsights?.recommendation?.stopLoss || 140).toFixed(2)}</span>
                                    </div>
                                    <div className="rec-item">
                                        <label>Time Frame</label>
                                        <span>{aiInsights?.recommendation?.timeFrame || '1-3 days'}</span>
                                    </div>
                                </div>
                                <div className="rec-reasoning">
                                    <p>{aiInsights?.recommendation?.reasoning ||
                                        'Strong technical indicators combined with positive sentiment analysis suggest upward momentum.'
                                    }</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedInsight === 'technical' && (
                    <div className="technical-insights">
                        <h4>📈 Technical Analysis</h4>
                        <div className="technical-indicators">
                            {[
                                { name: 'RSI', value: 65.4, signal: 'Neutral', color: '#ffaa00' },
                                { name: 'MACD', value: 0.85, signal: 'Bullish', color: '#00ff88' },
                                { name: 'Bollinger', value: 0.3, signal: 'Oversold', color: '#00ff88' },
                                { name: 'Stochastic', value: 78.2, signal: 'Overbought', color: '#ff6600' }
                            ].map((indicator, index) => (
                                <div key={index} className="indicator-item">
                                    <div className="indicator-header">
                                        <span className="indicator-name">{indicator.name}</span>
                                        <span
                                            className="indicator-signal"
                                            style={{ color: indicator.color }}
                                        >
                                            {indicator.signal}
                                        </span>
                                    </div>
                                    <div className="indicator-value">
                                        {indicator.value.toFixed(2)}
                                    </div>
                                    <div className="indicator-bar">
                                        <div
                                            className="indicator-fill"
                                            style={{
                                                width: `${Math.min(indicator.value, 100)}%`,
                                                backgroundColor: indicator.color
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="support-resistance">
                            <h5>🎯 Key Levels</h5>
                            <div className="levels-grid">
                                <div className="level-item resistance">
                                    <label>Resistance</label>
                                    <span>$155.20</span>
                                </div>
                                <div className="level-item support">
                                    <label>Support</label>
                                    <span>$148.50</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedInsight === 'sentiment' && (
                    <div className="sentiment-insights">
                        <h4>🧠 Market Sentiment</h4>
                        <div className="sentiment-gauge">
                            <div className="gauge-container">
                                <div className="gauge-arc">
                                    <div
                                        className="gauge-needle"
                                        style={{
                                            transform: `rotate(${((aiInsights?.sentiment?.overall || 0.6) * 180) - 90}deg)`
                                        }}
                                    />
                                </div>
                                <div className="gauge-labels">
                                    <span className="bearish">Bearish</span>
                                    <span className="neutral">Neutral</span>
                                    <span className="bullish">Bullish</span>
                                </div>
                                <div className="gauge-value">
                                    {((aiInsights?.sentiment?.overall || 0.6) * 100).toFixed(0)}% Bullish
                                </div>
                            </div>
                        </div>

                        <div className="sentiment-sources">
                            <div className="source-item">
                                <span className="source-name">📰 News</span>
                                <div className="source-bar">
                                    <div
                                        className="source-fill positive"
                                        style={{ width: '72%' }}
                                    />
                                </div>
                                <span className="source-value">72%</span>
                            </div>
                            <div className="source-item">
                                <span className="source-name">🐦 Social</span>
                                <div className="source-bar">
                                    <div
                                        className="source-fill positive"
                                        style={{ width: '68%' }}
                                    />
                                </div>
                                <span className="source-value">68%</span>
                            </div>
                            <div className="source-item">
                                <span className="source-name">📊 Options</span>
                                <div className="source-bar">
                                    <div
                                        className="source-fill neutral"
                                        style={{ width: '55%' }}
                                    />
                                </div>
                                <span className="source-value">55%</span>
                            </div>
                        </div>
                    </div>
                )}

                {selectedInsight === 'patterns' && (
                    <div className="pattern-insights">
                        <h4>🔍 Pattern Recognition</h4>
                        <div className="detected-patterns">
                            {[
                                {
                                    name: 'Ascending Triangle',
                                    confidence: 0.85,
                                    timeframe: '4h',
                                    implication: 'Bullish Breakout Expected'
                                },
                                {
                                    name: 'Bull Flag',
                                    confidence: 0.72,
                                    timeframe: '1h',
                                    implication: 'Continuation Pattern'
                                },
                                {
                                    name: 'Volume Spike',
                                    confidence: 0.91,
                                    timeframe: '15m',
                                    implication: 'Increased Interest'
                                }
                            ].map((pattern, index) => (
                                <div key={index} className="pattern-item">
                                    <div className="pattern-header">
                                        <span className="pattern-name">{pattern.name}</span>
                                        <span
                                            className="pattern-confidence"
                                            style={{ color: getConfidenceColor(pattern.confidence) }}
                                        >
                                            {(pattern.confidence * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="pattern-details">
                                        <span className="pattern-timeframe">{pattern.timeframe}</span>
                                        <span className="pattern-implication">{pattern.implication}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedInsight === 'risk' && (
                    <div className="risk-insights">
                        <h4>⚠️ Risk Assessment</h4>
                        <div className="risk-meter">
                            <div className="risk-level">
                                <span className="risk-label">Current Risk Level</span>
                                <span className="risk-value moderate">MODERATE</span>
                            </div>
                            <div className="risk-factors">
                                <div className="risk-factor">
                                    <span className="factor-name">Market Volatility</span>
                                    <div className="factor-bar">
                                        <div className="factor-fill" style={{ width: '60%', backgroundColor: '#ffaa00' }} />
                                    </div>
                                </div>
                                <div className="risk-factor">
                                    <span className="factor-name">Liquidity Risk</span>
                                    <div className="factor-bar">
                                        <div className="factor-fill" style={{ width: '30%', backgroundColor: '#00ff88' }} />
                                    </div>
                                </div>
                                <div className="risk-factor">
                                    <span className="factor-name">News Impact</span>
                                    <div className="factor-bar">
                                        <div className="factor-fill" style={{ width: '45%', backgroundColor: '#ffaa00' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedInsight === 'opportunities' && (
                    <div className="opportunity-insights">
                        <h4>💎 Trading Opportunities</h4>
                        <div className="opportunities-list">
                            {[
                                {
                                    type: 'Breakout Trade',
                                    probability: 0.78,
                                    potential: '+5.2%',
                                    timeframe: '2-4 hours',
                                    description: 'Price approaching resistance with high volume'
                                },
                                {
                                    type: 'Mean Reversion',
                                    probability: 0.65,
                                    potential: '+2.8%',
                                    timeframe: '1-2 days',
                                    description: 'Oversold conditions with positive divergence'
                                }
                            ].map((opportunity, index) => (
                                <div key={index} className="opportunity-item">
                                    <div className="opp-header">
                                        <span className="opp-type">{opportunity.type}</span>
                                        <span
                                            className="opp-probability"
                                            style={{ color: getConfidenceColor(opportunity.probability) }}
                                        >
                                            {(opportunity.probability * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="opp-details">
                                        <div className="opp-potential">{opportunity.potential}</div>
                                        <div className="opp-timeframe">{opportunity.timeframe}</div>
                                    </div>
                                    <div className="opp-description">
                                        {opportunity.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* AI Actions */}
            <div className="ai-actions">
                <button className="ai-action-btn primary">
                    Execute AI Strategy
                </button>
                <button className="ai-action-btn secondary">
                    📊 Generate Report
                </button>
            </div>
        </div>
    );
};

export default AIInsightsPanel;