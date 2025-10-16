/**
 * Risk Management Panel Component
 * Displays risk metrics and management tools
 */
import React from 'react';

const RiskManagementPanel = ({ portfolio, predictions }) => {
    const riskMetrics = {
        portfolioValue: 125000,
        dailyPnL: 2350,
        dailyPnLPercent: 1.88,
        maxDrawdown: -5.2,
        sharpeRatio: 1.45,
        beta: 0.85,
        var95: -3200,
        exposureByAsset: [
            { symbol: 'AAPL', exposure: 25, risk: 'Medium' },
            { symbol: 'GOOGL', exposure: 20, risk: 'Low' },
            { symbol: 'TSLA', exposure: 15, risk: 'High' },
            { symbol: 'MSFT', exposure: 18, risk: 'Low' },
            { symbol: 'NVDA', exposure: 22, risk: 'Medium' }
        ]
    };

    return (
        <div className="risk-management-panel">
            <div className="panel-header">
                <h3>Risk Management</h3>
                <div className="risk-status">
                    <span className="status-indicator moderate">Moderate Risk</span>
                </div>
            </div>

            <div className="panel-content">
                <div className="risk-metrics-grid">
                    <div className="metric-card">
                        <div className="metric-label">Portfolio Value</div>
                        <div className="metric-value">${riskMetrics.portfolioValue.toLocaleString()}</div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-label">Daily P&L</div>
                        <div className={`metric-value ${riskMetrics.dailyPnL >= 0 ? 'positive' : 'negative'}`}>
                            ${riskMetrics.dailyPnL.toLocaleString()} ({riskMetrics.dailyPnLPercent > 0 ? '+' : ''}{riskMetrics.dailyPnLPercent}%)
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-label">Max Drawdown</div>
                        <div className="metric-value negative">{riskMetrics.maxDrawdown}%</div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-label">Sharpe Ratio</div>
                        <div className="metric-value">{riskMetrics.sharpeRatio}</div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-label">Beta</div>
                        <div className="metric-value">{riskMetrics.beta}</div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-label">VaR (95%)</div>
                        <div className="metric-value negative">${riskMetrics.var95.toLocaleString()}</div>
                    </div>
                </div>

                <div className="exposure-section">
                    <h4>Asset Exposure</h4>
                    <div className="exposure-list">
                        {riskMetrics.exposureByAsset.map((asset, index) => (
                            <div key={index} className="exposure-item">
                                <div className="asset-info">
                                    <span className="asset-symbol">{asset.symbol}</span>
                                    <span className="asset-exposure">{asset.exposure}%</span>
                                </div>
                                <div className="exposure-bar">
                                    <div
                                        className="exposure-fill"
                                        style={{ width: `${asset.exposure}%` }}
                                    />
                                </div>
                                <span className={`risk-level ${asset.risk.toLowerCase()}`}>
                                    {asset.risk}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="risk-controls">
                    <h4>Risk Controls</h4>
                    <div className="controls-grid">
                        <button className="control-btn">Set Stop Loss</button>
                        <button className="control-btn">Position Sizing</button>
                        <button className="control-btn">Hedge Portfolio</button>
                        <button className="control-btn">Risk Alerts</button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .risk-management-panel {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 0.5rem;
                    padding: 1rem;
                    height: 100%;
                    overflow-y: auto;
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

                .status-indicator {
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .status-indicator.moderate {
                    background: rgba(251, 191, 36, 0.2);
                    color: #fbbf24;
                }

                .risk-metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .metric-card {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 0.375rem;
                    padding: 1rem;
                }

                .metric-label {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 0.5rem;
                }

                .metric-value {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #ffffff;
                }

                .metric-value.positive {
                    color: #22c55e;
                }

                .metric-value.negative {
                    color: #ef4444;
                }

                .exposure-section, .risk-controls {
                    margin-bottom: 1.5rem;
                }

                .exposure-section h4, .risk-controls h4 {
                    margin: 0 0 1rem 0;
                    color: #ffffff;
                    font-size: 1rem;
                }

                .exposure-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 0.75rem;
                }

                .asset-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    min-width: 80px;
                }

                .asset-symbol {
                    font-weight: 600;
                    color: #ffffff;
                }

                .asset-exposure {
                    font-size: 0.875rem;
                    color: rgba(255, 255, 255, 0.7);
                }

                .exposure-bar {
                    flex: 1;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    overflow: hidden;
                }

                .exposure-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #00d4ff, #0ea5e9);
                    border-radius: 3px;
                }

                .risk-level {
                    font-size: 0.75rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-weight: 500;
                    min-width: 60px;
                    text-align: center;
                }

                .risk-level.low {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                }

                .risk-level.medium {
                    background: rgba(251, 191, 36, 0.2);
                    color: #fbbf24;
                }

                .risk-level.high {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .controls-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 0.75rem;
                }

                .control-btn {
                    padding: 0.5rem 1rem;
                    background: rgba(0, 212, 255, 0.1);
                    border: 1px solid rgba(0, 212, 255, 0.3);
                    border-radius: 0.375rem;
                    color: #00d4ff;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .control-btn:hover {
                    background: rgba(0, 212, 255, 0.2);
                    border-color: #00d4ff;
                }
            `}</style>
        </div>
    );
};

export default RiskManagementPanel;