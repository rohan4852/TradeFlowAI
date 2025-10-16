import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChartComponent from '../components/ChartComponent';
import PortfolioPanel from '../components/PortfolioPanel';
import NewsPanel from '../components/NewsPanel';
import PredictionPanel from '../components/PredictionPanel';
import AlertsPanel from '../components/AlertsPanel';
import './DashboardPage.css';

const DashboardPage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-sidebar">
                <div className="sidebar-header">
                    <h2>TradeFlow AI</h2>
                </div>
                <nav className="sidebar-nav">
                    <button
                        className={activeTab === 'overview' ? 'active' : ''}
                        onClick={() => setActiveTab('overview')}
                    >
                        📊 Overview
                    </button>
                    <button
                        className={activeTab === 'trading' ? 'active' : ''}
                        onClick={() => setActiveTab('trading')}
                    >
                        📈 Trading
                    </button>
                    <button
                        className={activeTab === 'portfolio' ? 'active' : ''}
                        onClick={() => setActiveTab('portfolio')}
                    >
                        💼 Portfolio
                    </button>
                    <button
                        className={activeTab === 'markets' ? 'active' : ''}
                        onClick={() => setActiveTab('markets')}
                    >
                        🌍 Markets
                    </button>
                    <button
                        className={activeTab === 'ai-insights' ? 'active' : ''}
                        onClick={() => setActiveTab('ai-insights')}
                    >
                        🤖 AI Insights
                    </button>
                    <button onClick={() => navigate('/profile')}>
                        👤 Profile
                    </button>
                    <button onClick={() => navigate('/settings')}>
                        ⚙️ Settings
                    </button>
                    <button onClick={handleLogout} className="logout-btn">
                        🚪 Logout
                    </button>
                </nav>
            </div>

            <div className="dashboard-content">
                {activeTab === 'overview' && (
                    <div className="overview-tab">
                        <h1>Portfolio Overview</h1>
                        <div className="overview-grid">
                            <div className="overview-card">
                                <h3>Total Balance</h3>
                                {(() => {
                                    // try to read cached portfolio values from localStorage as best-effort
                                    const cached = (() => {
                                        try {
                                            return JSON.parse(localStorage.getItem('portfolio_summary')) || {};
                                        } catch (e) { return {}; }
                                    })();
                                    const total = cached.totalBalance ?? null;
                                    const change = cached.changePercent ?? null;
                                    return (
                                        <>
                                            <p className="balance">{total != null ? `$${Number(total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}</p>
                                            <span className={`change ${change != null && change >= 0 ? 'positive' : 'negative'}`}>{change != null ? `${change > 0 ? '+' : ''}${Number(change).toFixed(2)}% today` : '—'}</span>
                                        </>
                                    );
                                })()}
                            </div>
                            <div className="overview-card">
                                <h3>Active Positions</h3>
                                <p className="positions">{(() => { try { const cached = JSON.parse(localStorage.getItem('portfolio_summary')) || {}; return cached.positions ?? '—'; } catch (e) { return '—'; } })()}</p>
                            </div>
                            <div className="overview-card">
                                <h3>P&L Today</h3>
                                {(() => {
                                    try {
                                        const cached = JSON.parse(localStorage.getItem('portfolio_summary')) || {};
                                        const pnl = cached.pnlToday ?? null;
                                        return <p className={`pnl ${pnl != null && pnl >= 0 ? 'positive' : 'negative'}`}>{pnl != null ? `${pnl >= 0 ? '+' : ''}$${Number(pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}</p>;
                                    } catch (e) {
                                        return <p className="pnl">—</p>;
                                    }
                                })()}
                            </div>
                        </div>
                        <PortfolioPanel />
                    </div>
                )}

                {activeTab === 'trading' && (
                    <div className="trading-tab">
                        <h1>Trading Interface</h1>
                        <div className="trading-layout">
                            <div className="chart-section">
                                <ChartComponent />
                            </div>
                            <div className="trading-panels">
                                <PredictionPanel />
                                <AlertsPanel />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'portfolio' && (
                    <div className="portfolio-tab">
                        <h1>Portfolio Management</h1>
                        <PortfolioPanel />
                    </div>
                )}

                {activeTab === 'markets' && (
                    <div className="markets-tab">
                        <h1>Market Analysis</h1>
                        <NewsPanel />
                    </div>
                )}

                {activeTab === 'ai-insights' && (
                    <div className="ai-insights-tab">
                        <h1>AI Insights & Predictions</h1>
                        <PredictionPanel />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;