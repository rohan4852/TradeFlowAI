import React from 'react';
import Chart from './Chart';

const ChartComponent = ({
    ticker,
    data,
    realTimeData,
    isLoading,
    enhanced = false,
    mode = 'trading'
}) => {
    return (
        <div className="chart-component">
            <div className="chart-header">
                <h3>{ticker} Chart</h3>
                {enhanced && <span className="enhanced-badge">AI Enhanced</span>}
                {mode !== 'trading' && <span className="mode-badge">{mode}</span>}
            </div>

            <div className="chart-container">
                {isLoading ? (
                    <div className="chart-loading">
                        <div className="spinner" />
                        <p>Loading chart data...</p>
                    </div>
                ) : (
                    <div className="chart-placeholder">
                        <div className="chart-info">
                            <p>📈 Chart for {ticker}</p>
                            {data ? (
                                <p>Historical data points: {Array.isArray(data) ? data.length : 'N/A'}</p>
                            ) : (
                                <p className="no-live-data">Historical data not available</p>
                            )}
                            {realTimeData ? (
                                <p>Real-time: Connected</p>
                            ) : (
                                <p className="no-live-data">Live streaming not available</p>
                            )}
                        </div>
                        <Chart symbol={ticker} data={data} realTime={realTimeData} />
                    </div>
                )}
            </div>

            <style jsx>{`
                .chart-component {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                
                .chart-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                
                .chart-header h3 {
                    margin: 0;
                    color: #ffffff;
                }
                
                .enhanced-badge, .mode-badge {
                    padding: 0.25rem 0.5rem;
                    background: rgba(0, 212, 255, 0.2);
                    border: 1px solid #00d4ff;
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                    color: #00d4ff;
                }
                
                .chart-container {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .chart-loading {
                    text-align: center;
                    color: rgba(255, 255, 255, 0.7);
                }
                
                .chart-placeholder {
                    width: 100%;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.7);
                }
                
                .chart-info {
                    margin-bottom: 1rem;
                }
                
                .chart-info p {
                    margin: 0.5rem 0;
                }
                
                .chart-mock {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 0.5rem;
                    padding: 1rem;
                }
            `}</style>
        </div>
    );
};

export default ChartComponent;