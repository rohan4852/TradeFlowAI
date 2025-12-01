/**
 * Technical Analysis Panel Component
 * Displays technical indicators and analysis
 */
import React from 'react';

const TechnicalAnalysisPanel = ({ ticker, data }) => {
    return (
        <div className="technical-analysis-panel">
            <div className="panel-header">
                <h3>Technical Analysis</h3>
                <span className="ticker-badge">{ticker}</span>
            </div>

            <div className="panel-content">
                <div className="indicators-grid">
                    <div className="indicator-card">
                        <div className="indicator-label">RSI (14)</div>
                        <div className="indicator-value">65.4</div>
                        <div className="indicator-signal neutral">Neutral</div>
                    </div>

                    <div className="indicator-card">
                        <div className="indicator-label">MACD</div>
                        <div className="indicator-value">+0.23</div>
                        <div className="indicator-signal bullish">Bullish</div>
                    </div>

                    <div className="indicator-card">
                        <div className="indicator-label">SMA (20)</div>
                        <div className="indicator-value">$150.45</div>
                        <div className="indicator-signal bullish">Above</div>
                    </div>

                    <div className="indicator-card">
                        <div className="indicator-label">Volume</div>
                        <div className="indicator-value">2.3M</div>
                        <div className="indicator-signal neutral">Average</div>
                    </div>
                </div>

                <div className="analysis-summary">
                    <h4>Summary</h4>
                    <p>Technical indicators suggest a neutral to slightly bullish outlook for {ticker}.</p>
                </div>
            </div>

            <style jsx>{`
                .technical-analysis-panel {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 0.5rem;
                    padding: 1rem;
                    height: 100%;
                }

                .panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                }

                .panel-header h3 {
                    margin: 0;
                    color: #ffffff;
                }

                .ticker-badge {
                    padding: 0.25rem 0.5rem;
                    background: rgba(0, 212, 255, 0.2);
                    border: 1px solid #00d4ff;
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                    color: #00d4ff;
                }

                .indicators-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .indicator-card {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 0.375rem;
                    padding: 1rem;
                    text-align: center;
                }

                .indicator-label {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 0.5rem;
                }

                .indicator-value {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 0.5rem;
                }

                .indicator-signal {
                    font-size: 0.75rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-weight: 500;
                }

                .indicator-signal.bullish {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                }

                .indicator-signal.bearish {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .indicator-signal.neutral {
                    background: rgba(156, 163, 175, 0.2);
                    color: #9ca3af;
                }

                .analysis-summary {
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding-top: 1rem;
                }

                .analysis-summary h4 {
                    margin: 0 0 0.5rem 0;
                    color: #ffffff;
                    font-size: 1rem;
                }

                .analysis-summary p {
                    margin: 0;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.875rem;
                    line-height: 1.5;
                }
            `}</style>
        </div>
    );
};

export default TechnicalAnalysisPanel;