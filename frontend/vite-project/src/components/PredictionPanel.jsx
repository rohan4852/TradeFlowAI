/**
 * Prediction Panel Component
 * Displays AI predictions and analysis
 */
import React from 'react';

const PredictionPanel = ({
    ticker,
    predictions,
    isLoading,
    enhanced = false
}) => {
    return (
        <div className="prediction-panel">
            <div className="panel-header">
                <h4>🤖 AI Predictions</h4>
                {enhanced && <span className="enhanced-badge">Enhanced</span>}
            </div>

            <div className="panel-content">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Analyzing {ticker}...</p>
                    </div>
                ) : predictions ? (
                    <div className="predictions-content">
                        <div className="prediction-summary">
                            <div className="prediction-action">
                                <span className="action-label">Recommendation:</span>
                                <span className={`action-value ${predictions.final_action}`}>
                                    {predictions.final_action?.toUpperCase() || 'HOLD'}
                                </span>
                            </div>

                            <div className="prediction-confidence">
                                <span className="confidence-label">Confidence:</span>
                                <div className="confidence-bar">
                                    <div
                                        className="confidence-fill"
                                        style={{ width: `${(predictions.final_confidence || 0) * 100}%` }}
                                    />
                                </div>
                                <span className="confidence-value">
                                    {((predictions.final_confidence || 0) * 100).toFixed(1)}%
                                </span>
                            </div>

                            {predictions.final_target_price && (
                                <div className="target-price">
                                    <span className="target-label">Target Price:</span>
                                    <span className="target-value">
                                        ${predictions.final_target_price.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {predictions.reasoning && (
                            <div className="prediction-reasoning">
                                <h5>Analysis:</h5>
                                <p>{predictions.reasoning}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="no-predictions">
                        <p>No predictions available for {ticker}</p>
                        <button className="generate-prediction-btn">
                            Generate Prediction
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .prediction-panel {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 0.5rem;
                    padding: 1rem;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                
                .panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                }
                
                .panel-header h4 {
                    margin: 0;
                    color: #ffffff;
                    font-size: 1rem;
                }
                
                .enhanced-badge {
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
                
                .predictions-content {
                    flex: 1;
                }
                
                .prediction-summary {
                    margin-bottom: 1rem;
                }
                
                .prediction-action {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                }
                
                .action-label, .confidence-label, .target-label {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.875rem;
                }
                
                .action-value {
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-weight: 600;
                    font-size: 0.875rem;
                }
                
                .action-value.buy {
                    background: rgba(74, 222, 128, 0.2);
                    color: #4ade80;
                }
                
                .action-value.sell {
                    background: rgba(248, 113, 113, 0.2);
                    color: #f87171;
                }
                
                .action-value.hold {
                    background: rgba(156, 163, 175, 0.2);
                    color: #9ca3af;
                }
                
                .prediction-confidence {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                }
                
                .confidence-bar {
                    flex: 1;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    overflow: hidden;
                }
                
                .confidence-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #f87171, #fbbf24, #4ade80);
                    transition: width 0.3s ease;
                }
                
                .confidence-value {
                    color: #ffffff;
                    font-weight: 600;
                    font-size: 0.875rem;
                    min-width: 45px;
                }
                
                .target-price {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .target-value {
                    color: #00d4ff;
                    font-weight: 600;
                }
                
                .prediction-reasoning {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 0.5rem;
                    padding: 0.75rem;
                    margin-top: 1rem;
                }
                
                .prediction-reasoning h5 {
                    margin: 0 0 0.5rem 0;
                    color: #ffffff;
                    font-size: 0.875rem;
                }
                
                .prediction-reasoning p {
                    margin: 0;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.875rem;
                    line-height: 1.4;
                }
                
                .no-predictions {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    flex: 1;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.7);
                }
                
                .generate-prediction-btn {
                    padding: 0.5rem 1rem;
                    background: #00d4ff;
                    color: #ffffff;
                    border: none;
                    border-radius: 0.25rem;
                    cursor: pointer;
                    margin-top: 1rem;
                    transition: background 0.2s ease;
                }
                
                .generate-prediction-btn:hover {
                    background: #0099cc;
                }
            `}</style>
        </div>
    );
};

export default PredictionPanel;