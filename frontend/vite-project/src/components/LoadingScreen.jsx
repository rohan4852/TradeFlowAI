/**
 * Loading Screen Component
 * Displays loading progress and status
 */
import React from 'react';

const LoadingScreen = ({ isLoading, progress = 0, message = 'Loading...' }) => {
    if (!isLoading) return null;

    return (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="loading-logo">
                    <h1>TradeFlowAI</h1>
                </div>

                <div className="loading-progress">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="progress-text">
                        {progress}% - {message}
                    </div>
                </div>

                <div className="loading-spinner">
                    <div className="spinner" />
                </div>
            </div>

            <style jsx>{`
                .loading-screen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                }
                
                .loading-content {
                    text-align: center;
                    color: white;
                    max-width: 400px;
                    padding: 2rem;
                }
                
                .loading-logo {
                    margin-bottom: 3rem;
                }
                
                .logo-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    animation: pulse 2s infinite;
                }
                
                .loading-logo h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 0;
                    background: linear-gradient(45deg, #00d4ff, #ff6b6b);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .loading-progress {
                    margin-bottom: 2rem;
                }
                
                .progress-bar {
                    width: 100%;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                    overflow: hidden;
                    margin-bottom: 1rem;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #00d4ff, #ff6b6b);
                    border-radius: 2px;
                    transition: width 0.3s ease;
                }
                
                .progress-text {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }
                
                .loading-spinner {
                    display: flex;
                    justify-content: center;
                }
                
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-top: 3px solid #00d4ff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;