/**
 * Portfolio Panel Component
 * Displays portfolio information and performance
 */
import React from 'react';

const PortfolioPanel = ({
    portfolio,
    realTimeData,
    isLoading,
    compact = false,
    mode = 'trading'
}) => {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value || 0);
    };

    const formatPercentage = (value) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${(value || 0).toFixed(2)}%`;
    };

    const getChangeColor = (value) => {
        if (value > 0) return '#4ade80';
        if (value < 0) return '#f87171';
        return '#9ca3af';
    };

    return (
        <div className={`portfolio-panel ${compact ? 'compact' : ''}`}>
            <div className="panel-header">
                <h4>💼 Portfolio</h4>
                {mode !== 'trading' && <span className="mode-badge">{mode}</span>}
            </div>

            <div className="panel-content">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Loading portfolio...</p>
                    </div>
                ) : portfolio ? (
                    <div className="portfolio-content">
                        <div className="portfolio-summary">
                            <div className="summary-item">
                                <span className="summary-label">Total Value</span>
                                <span className="summary-value">
                                    {formatCurrency(portfolio.total_value || 100000)}
                                </span>
                            </div>

                            <div className="summary-item">
                                <span className="summary-label">Day Change</span>
                                <span
                                    className="summary-value"
                                    style={{ color: getChangeColor(portfolio.day_change || 2.5) }}
                                >
                                    {formatCurrency(portfolio.day_change_amount || 2500)}
                                    <small>({formatPercentage(portfolio.day_change || 2.5)})</small>
                                </span>
                            </div>

                            <div className="summary-item">
                                <span className="summary-label">Available Cash</span>
                                <span className="summary-value">
                                    {formatCurrency(portfolio.cash || 25000)}
                                </span>
                            </div>
                        </div>

                        {!compact && (
                            <div className="portfolio-positions">
                                <h5>Top Holdings</h5>
                                <div className="positions-list">
                                    {(portfolio.positions || [
                                        { symbol: 'AAPL', shares: 100, value: 15000, change: 1.2 },
                                        { symbol: 'GOOGL', shares: 50, value: 12000, change: -0.8 },
                                        { symbol: 'MSFT', shares: 75, value: 18000, change: 2.1 }
                                    ]).map((position, index) => (
                                        <div key={index} className="position-item">
                                            <div className="position-info">
                                                <span className="position-symbol">{position.symbol}</span>
                                                <span className="position-shares">{position.shares} shares</span>
                                            </div>
                                            <div className="position-value">
                                                <span className="position-amount">
                                                    {formatCurrency(position.value)}
                                                </span>
                                                <span
                                                    className="position-change"
                                                    style={{ color: getChangeColor(position.change) }}
                                                >
                                                    {formatPercentage(position.change)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {realTimeData && (
                            <div className="market-status">
                                <span className="status-label">Market Status:</span>
                                <span className="status-value">
                                    {realTimeData.market_open ? '🟢 Open' : '🔴 Closed'}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="no-portfolio">
                        <p>No portfolio data available</p>
                        <button className="connect-broker-btn">
                            Connect Broker
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .portfolio-panel {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 0.5rem;
                    padding: 1rem;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                
                .portfolio-panel.compact {
                    padding: 0.75rem;
                }
                
                .panel-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                
                .panel-header h4 {
                    margin: 0;
                    color: #ffffff;
                    font-size: 1rem;
                }
                
                .mode-badge {
                    padding: 0.25rem 0.5rem;
                    background: rgba(0, 212, 255, 0.2);
                    border: 1px solid #00d4ff;
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                    color: #00d4ff;
                }
                
                .panel-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                
                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    flex: 1;
                    color: rgba(255, 255, 255, 0.7);
                }
                
                .portfolio-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .portfolio-summary {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                
                .summary-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .summary-label {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.875rem;
                }
                
                .summary-value {
                    color: #ffffff;
                    font-weight: 600;
                    font-size: 0.875rem;
                    text-align: right;
                }
                
                .summary-value small {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: normal;
                    margin-top: 0.125rem;
                }
                
                .portfolio-positions {
                    flex: 1;
                }
                
                .portfolio-positions h5 {
                    margin: 0 0 0.75rem 0;
                    color: #ffffff;
                    font-size: 0.875rem;
                }
                
                .positions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                
                .position-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 0.25rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .position-info {
                    display: flex;
                    flex-direction: column;
                }
                
                .position-symbol {
                    color: #ffffff;
                    font-weight: 600;
                    font-size: 0.875rem;
                }
                
                .position-shares {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.75rem;
                }
                
                .position-value {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }
                
                .position-amount {
                    color: #ffffff;
                    font-weight: 600;
                    font-size: 0.875rem;
                }
                
                .position-change {
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                
                .market-status {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 0.25rem;
                    margin-top: auto;
                }
                
                .status-label {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.875rem;
                }
                
                .status-value {
                    color: #ffffff;
                    font-weight: 600;
                    font-size: 0.875rem;
                }
                
                .no-portfolio {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    flex: 1;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.7);
                }
                
                .connect-broker-btn {
                    padding: 0.5rem 1rem;
                    background: #00d4ff;
                    color: #ffffff;
                    border: none;
                    border-radius: 0.25rem;
                    cursor: pointer;
                    margin-top: 1rem;
                    transition: background 0.2s ease;
                }
                
                .connect-broker-btn:hover {
                    background: #0099cc;
                }
            `}</style>
        </div>
    );
};

export default PortfolioPanel;