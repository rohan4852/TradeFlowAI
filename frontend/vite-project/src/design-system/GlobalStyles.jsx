/**
 * Global Styles Component
 * Provides global CSS styles for the application
 */
import React from 'react';

export const GlobalStyles = () => {
    return (
        <style jsx global>{`
            * {
                box-sizing: border-box;
            }

            html, body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                    sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                overflow-x: hidden;
            }

            /* Apply dark theme only to non-auth pages */
            body:not(.auth-page-body) {
                background: #0f0f23;
                color: #ffffff;
            }

            #root {
                min-height: 100vh;
            }

            .app-container:not(.auth-page) {
                min-height: 100vh;
                background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
            }

            /* Trading Dashboard Styles */
            .trading-dashboard {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                background: transparent;
            }

            .dashboard-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1rem 2rem;
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .header-left {
                display: flex;
                align-items: center;
                gap: 2rem;
            }

            .logo-section {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .logo {
                font-size: 1.5rem;
                font-weight: 700;
                background: linear-gradient(45deg, #00d4ff, #ff6b6b);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .version {
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.5);
            }

            .workspace-tabs {
                display: flex;
                gap: 0.5rem;
            }

            .workspace-tab {
                padding: 0.5rem 1rem;
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 0.375rem;
                color: rgba(255, 255, 255, 0.7);
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .workspace-tab:hover {
                background: rgba(255, 255, 255, 0.05);
                color: #ffffff;
            }

            .workspace-tab.active {
                background: rgba(0, 212, 255, 0.2);
                border-color: #00d4ff;
                color: #00d4ff;
            }

            .header-center {
                flex: 1;
                display: flex;
                justify-content: center;
            }

            .ticker-search {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .search-container {
                position: relative;
            }

            .ticker-input {
                padding: 0.5rem 1rem;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 0.375rem;
                color: #ffffff;
                font-size: 1rem;
                min-width: 200px;
            }

            .ticker-input::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }

            .quick-watchlist {
                display: flex;
                gap: 0.5rem;
            }

            .watchlist-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 0.5rem;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 0.375rem;
                color: #ffffff;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 0.875rem;
            }

            .watchlist-item:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .watchlist-item.active {
                background: rgba(0, 212, 255, 0.2);
                border-color: #00d4ff;
            }

            .price-change {
                font-size: 0.75rem;
                color: #22c55e;
            }

            .header-right {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .ai-status, .connection-status {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .ai-indicator {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                padding: 0.25rem 0.5rem;
                background: rgba(0, 212, 255, 0.2);
                border: 1px solid #00d4ff;
                border-radius: 0.25rem;
                font-size: 0.75rem;
                color: #00d4ff;
            }

            .status-indicator {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
            }

            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #22c55e;
            }

            .status-indicator.disconnected .status-dot {
                background: #ef4444;
            }

            .latency {
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.5);
            }

            .header-actions {
                display: flex;
                gap: 0.5rem;
            }

            .btn {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 0.375rem;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s ease;
            }

            .btn-glass {
                background: rgba(255, 255, 255, 0.1);
                color: #ffffff;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .btn-glass:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .btn-ai-primary {
                background: linear-gradient(45deg, #00d4ff, #0ea5e9);
                color: #ffffff;
                font-weight: 600;
            }

            .btn-ai-primary:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
            }

            .btn-ai-primary:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }

            /* Dashboard Content */
            .dashboard-content {
                flex: 1;
                padding: 1rem 2rem;
                display: grid;
                gap: 1rem;
            }

            .workspace-trading .dashboard-content {
                grid-template-columns: 1fr 300px;
                grid-template-rows: 1fr;
            }

            .main-trading-area {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 1rem;
            }

            .chart-section {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 0.5rem;
                padding: 1rem;
            }

            .trading-panels {
                display: grid;
                gap: 1rem;
                grid-template-rows: repeat(auto-fit, minmax(200px, 1fr));
            }

            .side-panels {
                display: grid;
                gap: 1rem;
                grid-template-rows: repeat(auto-fit, minmax(200px, 1fr));
            }

            /* Analysis Workspace */
            .workspace-analysis .dashboard-content {
                grid-template-columns: 1fr;
            }

            .analysis-grid {
                display: grid;
                grid-template-columns: 2fr 1fr;
                grid-template-rows: 2fr 1fr;
                gap: 1rem;
            }

            .chart-analysis {
                grid-row: 1 / 3;
            }

            /* Portfolio Workspace */
            .workspace-portfolio .dashboard-content {
                grid-template-columns: 1fr;
            }

            .portfolio-workspace {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 1rem;
            }

            /* Social Workspace */
            .workspace-social .dashboard-content {
                grid-template-columns: 1fr;
            }

            .social-workspace {
                display: grid;
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            /* Loading Overlay */
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(15, 15, 35, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            .loading-spinner {
                text-align: center;
                color: #ffffff;
            }

            .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(255, 255, 255, 0.1);
                border-top: 3px solid #00d4ff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* System Health Alert */
            .system-health-alert {
                position: fixed;
                top: 1rem;
                right: 1rem;
                background: rgba(251, 191, 36, 0.1);
                border: 1px solid #fbbf24;
                border-radius: 0.5rem;
                padding: 1rem;
                color: #fbbf24;
                z-index: 100;
                max-width: 300px;
            }

            .system-health-alert.critical {
                background: rgba(239, 68, 68, 0.1);
                border-color: #ef4444;
                color: #ef4444;
            }

            .health-indicator {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 0.5rem;
            }

            .btn-sm {
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
            }

            .health-issues {
                font-size: 0.875rem;
            }

            .health-issue {
                margin-bottom: 0.25rem;
            }

            /* Performance Debug */
            .performance-debug {
                position: fixed;
                bottom: 1rem;
                left: 1rem;
                background: rgba(0, 0, 0, 0.8);
                border-radius: 0.5rem;
                padding: 1rem;
                font-family: monospace;
                font-size: 0.75rem;
                color: #ffffff;
                z-index: 100;
                max-width: 400px;
                max-height: 300px;
                overflow: auto;
            }

            .integration-status-debug {
                position: fixed;
                bottom: 1rem;
                right: 1rem;
                background: rgba(0, 0, 0, 0.8);
                border-radius: 0.5rem;
                padding: 1rem;
                font-family: monospace;
                font-size: 0.75rem;
                color: #ffffff;
                z-index: 100;
                max-width: 400px;
                max-height: 300px;
                overflow: auto;
            }

            /* Responsive Design */
            @media (max-width: 1200px) {
                .dashboard-header {
                    padding: 1rem;
                }

                .header-left {
                    gap: 1rem;
                }

                .workspace-tabs {
                    display: none;
                }

                .quick-watchlist {
                    display: none;
                }

                .main-trading-area {
                    grid-template-columns: 1fr;
                }

                .analysis-grid {
                    grid-template-columns: 1fr;
                    grid-template-rows: auto;
                }

                .portfolio-workspace {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 768px) {
                .dashboard-content {
                    padding: 0.5rem;
                    grid-template-columns: 1fr;
                }

                .header-center {
                    display: none;
                }

                .header-actions {
                    gap: 0.25rem;
                }

                .btn {
                    padding: 0.375rem 0.75rem;
                    font-size: 0.75rem;
                }
            }
        `}</style>
    );
};

export default GlobalStyles;