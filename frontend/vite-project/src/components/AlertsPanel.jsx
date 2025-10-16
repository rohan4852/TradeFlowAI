/**
 * Alerts Panel Component
 * Displays trading alerts and notifications
 */
import React, { useState } from 'react';

const AlertsPanel = ({
    alerts = [],
    onCreateAlert,
    compact = false
}) => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newAlert, setNewAlert] = useState({
        ticker: '',
        condition: 'price_above',
        value: '',
        notification_method: 'email'
    });

    const alertTypes = [
        { value: 'price_above', label: '📈 Price Above' },
        { value: 'price_below', label: '📉 Price Below' },
        { value: 'volume_spike', label: '📊 Volume Spike' },
        { value: 'news_sentiment', label: '📰 News Sentiment' },
        { value: 'technical_signal', label: '🔍 Technical Signal' }
    ];

    const notificationMethods = [
        { value: 'email', label: '📧 Email' },
        { value: 'push', label: '📱 Push' },
        { value: 'sms', label: '💬 SMS' },
        { value: 'webhook', label: '🔗 Webhook' }
    ];

    const getAlertIcon = (type) => {
        switch (type) {
            case 'price_above': return '📈';
            case 'price_below': return '📉';
            case 'volume_spike': return '📊';
            case 'news_sentiment': return '📰';
            case 'technical_signal': return '🔍';
            default: return '🔔';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return '#4bffb5';
            case 'triggered': return '#ffa726';
            case 'expired': return '#ff4976';
            default: return '#d1d4dc';
        }
    };

    const handleCreateAlert = (e) => {
        e.preventDefault();
        if (onCreateAlert) {
            onCreateAlert(newAlert);
        }
        setNewAlert({
            ticker: '',
            condition: 'price_above',
            value: '',
            notification_method: 'email'
        });
        setShowCreateForm(false);
    };

    const formatAlertValue = (condition, value) => {
        switch (condition) {
            case 'price_above':
            case 'price_below':
                return `$${parseFloat(value).toFixed(2)}`;
            case 'volume_spike':
                return `${value}x average`;
            case 'news_sentiment':
                return value;
            default:
                return value;
        }
    };

    return (
        <div className="alerts-panel">
            <div className="panel-header">
                <h3>🔔 Alerts</h3>
                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    + New Alert
                </button>
            </div>

            {showCreateForm && (
                <div className="create-alert-form">
                    <form onSubmit={handleCreateAlert}>
                        <div className="form-group">
                            <label>Ticker Symbol</label>
                            <input
                                type="text"
                                value={newAlert.ticker}
                                onChange={(e) => setNewAlert({
                                    ...newAlert,
                                    ticker: e.target.value.toUpperCase()
                                })}
                                placeholder="e.g., AAPL"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Condition</label>
                            <select
                                value={newAlert.condition}
                                onChange={(e) => setNewAlert({
                                    ...newAlert,
                                    condition: e.target.value
                                })}
                            >
                                {alertTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Value</label>
                            <input
                                type="text"
                                value={newAlert.value}
                                onChange={(e) => setNewAlert({
                                    ...newAlert,
                                    value: e.target.value
                                })}
                                placeholder={
                                    newAlert.condition.includes('price') ? '150.00' :
                                        newAlert.condition === 'volume_spike' ? '2.0' :
                                            'positive'
                                }
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Notification Method</label>
                            <select
                                value={newAlert.notification_method}
                                onChange={(e) => setNewAlert({
                                    ...newAlert,
                                    notification_method: e.target.value
                                })}
                            >
                                {notificationMethods.map(method => (
                                    <option key={method.value} value={method.value}>
                                        {method.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                Create Alert
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowCreateForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="alerts-list">
                {(!alerts || alerts.length === 0) ? (
                    <div className="empty-alerts">
                        <p>No alerts configured</p>
                        <small>Create your first alert to get notified of market events</small>
                    </div>
                ) : (
                    alerts.map((alert, index) => (
                        <div key={index} className="alert-item">
                            <div className="alert-header">
                                <div className="alert-info">
                                    <span className="alert-icon">
                                        {getAlertIcon(alert.condition)}
                                    </span>
                                    <span className="alert-ticker">{alert.ticker}</span>
                                    <span
                                        className="alert-status"
                                        style={{ color: getStatusColor(alert.status) }}
                                    >
                                        {alert.status?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="alert-actions">
                                    <button className="btn-icon" title="Edit">
                                        ✏️
                                    </button>
                                    <button className="btn-icon" title="Delete">
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            <div className="alert-details">
                                <div className="alert-condition">
                                    <span className="condition-text">
                                        {alertTypes.find(t => t.value === alert.condition)?.label}
                                    </span>
                                    <span className="condition-value">
                                        {formatAlertValue(alert.condition, alert.value)}
                                    </span>
                                </div>

                                <div className="alert-meta">
                                    <span className="notification-method">
                                        {notificationMethods.find(m => m.value === alert.notification_method)?.label}
                                    </span>
                                    <span className="alert-created">
                                        Created: {alert.created_at ?
                                            new Date(alert.created_at).toLocaleDateString() :
                                            'Unknown'
                                        }
                                    </span>
                                </div>

                                {alert.triggered_at && (
                                    <div className="alert-triggered">
                                        <span className="triggered-text">
                                            🔥 Triggered: {new Date(alert.triggered_at).toLocaleString()}
                                        </span>
                                        {alert.triggered_value && (
                                            <span className="triggered-value">
                                                Value: {formatAlertValue(alert.condition, alert.triggered_value)}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="alerts-footer">
                <div className="alert-stats">
                    <span className="stat-item">
                        Active: {alerts?.filter(a => a.status === 'active').length || 0}
                    </span>
                    <span className="stat-item">
                        Triggered: {alerts?.filter(a => a.status === 'triggered').length || 0}
                    </span>
                </div>
                <button className="btn btn-sm btn-secondary">
                    🔄 Refresh Alerts
                </button>
            </div>

            <style jsx>{`
                .alerts-panel {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 0.5rem;
                    padding: 1rem;
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

                .panel-header h3 {
                    margin: 0;
                    color: #ffffff;
                    font-size: 1rem;
                }

                .btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 0.375rem;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.2s ease;
                }

                .btn-sm {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.75rem;
                }

                .btn-primary {
                    background: linear-gradient(45deg, #00d4ff, #0ea5e9);
                    color: #ffffff;
                    font-weight: 600;
                }

                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
                }

                .btn-secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: #ffffff;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .create-alert-form {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 0.375rem;
                    padding: 1rem;
                    margin-bottom: 1rem;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 0.5rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 0.375rem;
                    color: #ffffff;
                    font-size: 0.875rem;
                }

                .form-group input::placeholder {
                    color: rgba(255, 255, 255, 0.5);
                }

                .form-actions {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }

                .alerts-list {
                    flex: 1;
                    overflow-y: auto;
                }

                .empty-alerts {
                    text-align: center;
                    padding: 2rem;
                    color: rgba(255, 255, 255, 0.6);
                }

                .empty-alerts p {
                    margin: 0 0 0.5rem 0;
                    font-size: 1rem;
                }

                .empty-alerts small {
                    font-size: 0.875rem;
                    color: rgba(255, 255, 255, 0.4);
                }

                .alert-item {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 0.375rem;
                    padding: 1rem;
                    margin-bottom: 0.75rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .alert-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                }

                .alert-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .alert-icon {
                    font-size: 1.25rem;
                }

                .alert-ticker {
                    font-weight: 600;
                    color: #ffffff;
                }

                .alert-status {
                    font-size: 0.75rem;
                    font-weight: 500;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    background: rgba(255, 255, 255, 0.1);
                }

                .alert-actions {
                    display: flex;
                    gap: 0.25rem;
                }

                .btn-icon {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 0.25rem;
                    transition: background 0.2s ease;
                }

                .btn-icon:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .alert-details {
                    font-size: 0.875rem;
                }

                .alert-condition {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                }

                .condition-text {
                    color: rgba(255, 255, 255, 0.8);
                }

                .condition-value {
                    color: #00d4ff;
                    font-weight: 600;
                }

                .alert-meta {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.6);
                }

                .alert-triggered {
                    background: rgba(255, 167, 38, 0.1);
                    border: 1px solid rgba(255, 167, 38, 0.3);
                    border-radius: 0.25rem;
                    padding: 0.5rem;
                    font-size: 0.75rem;
                    color: #ffa726;
                }

                .triggered-text {
                    display: block;
                    margin-bottom: 0.25rem;
                }

                .alerts-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .alert-stats {
                    display: flex;
                    gap: 1rem;
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.6);
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                }
            `}</style>
        </div>
    );
};

export default AlertsPanel;