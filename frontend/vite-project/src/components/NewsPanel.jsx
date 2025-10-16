/**
 * News Panel Component
 * Displays market news and sentiment analysis
 */
import React from 'react';

const NewsPanel = ({
    ticker,
    news = [],
    isLoading,
    mode = 'trading'
}) => {
    const formatTimeAgo = (timestamp) => {
        const now = Date.now();
        const diff = now - new Date(timestamp).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const getSentimentColor = (sentiment) => {
        switch (sentiment?.toLowerCase()) {
            case 'positive': return '#4ade80';
            case 'negative': return '#f87171';
            default: return '#9ca3af';
        }
    };

    return (
        <div className="news-panel">
            <div className="panel-header">
                <h4>📰 Market News</h4>
                {mode !== 'trading' && <span className="mode-badge">{mode}</span>}
                <span className="news-count">{news.length} articles</span>
            </div>

            <div className="panel-content">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Loading news for {ticker}...</p>
                    </div>
                ) : news.length > 0 ? (
                    <div className="news-list">
                        {news.map((article, index) => (
                            <div key={index} className="news-item">
                                <div className="news-header">
                                    <h5 className="news-title">{article.title || 'News Article'}</h5>
                                    <div className="news-meta">
                                        <span className="news-time">
                                            {formatTimeAgo(article.published_at || Date.now())}
                                        </span>
                                        {article.sentiment && (
                                            <span
                                                className="news-sentiment"
                                                style={{ color: getSentimentColor(article.sentiment) }}
                                            >
                                                {article.sentiment}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {article.summary && (
                                    <p className="news-summary">{article.summary}</p>
                                )}

                                <div className="news-footer">
                                    <span className="news-source">{article.source || 'Unknown'}</span>
                                    {article.url && (
                                        <a
                                            href={article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="news-link"
                                        >
                                            Read more →
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-news">
                        <p>No news available for {ticker}</p>
                        <button className="refresh-news-btn">
                            Refresh News
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .news-panel {
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
                
                .news-count {
                    margin-left: auto;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.875rem;
                }
                
                .panel-content {
                    flex: 1;
                    overflow: hidden;
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
                
                .news-list {
                    flex: 1;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .news-item {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 0.5rem;
                    padding: 0.75rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: background 0.2s ease;
                }
                
                .news-item:hover {
                    background: rgba(255, 255, 255, 0.08);
                }
                
                .news-header {
                    margin-bottom: 0.5rem;
                }
                
                .news-title {
                    margin: 0 0 0.25rem 0;
                    color: #ffffff;
                    font-size: 0.875rem;
                    font-weight: 600;
                    line-height: 1.3;
                }
                
                .news-meta {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .news-time {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.75rem;
                }
                
                .news-sentiment {
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                
                .news-summary {
                    margin: 0.5rem 0;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.8rem;
                    line-height: 1.4;
                }
                
                .news-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 0.5rem;
                }
                
                .news-source {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.75rem;
                }
                
                .news-link {
                    color: #00d4ff;
                    text-decoration: none;
                    font-size: 0.75rem;
                    transition: color 0.2s ease;
                }
                
                .news-link:hover {
                    color: #0099cc;
                }
                
                .no-news {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    flex: 1;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.7);
                }
                
                .refresh-news-btn {
                    padding: 0.5rem 1rem;
                    background: #00d4ff;
                    color: #ffffff;
                    border: none;
                    border-radius: 0.25rem;
                    cursor: pointer;
                    margin-top: 1rem;
                    transition: background 0.2s ease;
                }
                
                .refresh-news-btn:hover {
                    background: #0099cc;
                }
                
                /* Scrollbar styling */
                .news-list::-webkit-scrollbar {
                    width: 4px;
                }
                
                .news-list::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                }
                
                .news-list::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 2px;
                }
                
                .news-list::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.5);
                }
            `}</style>
        </div>
    );
};

export default NewsPanel;