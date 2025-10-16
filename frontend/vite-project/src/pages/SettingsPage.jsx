import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SettingsPage.css';

const SettingsPage = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        theme: 'dark',
        language: 'en',
        currency: 'USD',
        timezone: 'EST',
        notifications: {
            email: true,
            push: true,
            sms: false,
            desktop: true
        },
        trading: {
            confirmOrders: true,
            autoRefresh: true,
            refreshInterval: 5,
            defaultOrderType: 'market',
            riskWarnings: true
        },
        privacy: {
            shareData: false,
            analytics: true,
            marketing: false
        }
    });

    const handleSettingChange = (category, key, value) => {
        if (category) {
            setSettings(prev => ({
                ...prev,
                [category]: {
                    ...prev[category],
                    [key]: value
                }
            }));
        } else {
            setSettings(prev => ({
                ...prev,
                [key]: value
            }));
        }
    };

    const handleSave = () => {
        localStorage.setItem('userSettings', JSON.stringify(settings));
        alert('Settings saved successfully!');
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            // Reset to default settings
            setSettings({
                theme: 'dark',
                language: 'en',
                currency: 'USD',
                timezone: 'EST',
                notifications: {
                    email: true,
                    push: true,
                    sms: false,
                    desktop: true
                },
                trading: {
                    confirmOrders: true,
                    autoRefresh: true,
                    refreshInterval: 5,
                    defaultOrderType: 'market',
                    riskWarnings: true
                },
                privacy: {
                    shareData: false,
                    analytics: true,
                    marketing: false
                }
            });
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>
                <h1>Settings</h1>
            </div>

            <div className="settings-content">
                {/* General Settings */}
                <div className="settings-section">
                    <h2>General</h2>
                    <div className="settings-grid">
                        <div className="setting-item">
                            <label>Theme</label>
                            <select
                                value={settings.theme}
                                onChange={(e) => handleSettingChange(null, 'theme', e.target.value)}
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="auto">Auto</option>
                            </select>
                        </div>

                        <div className="setting-item">
                            <label>Language</label>
                            <select
                                value={settings.language}
                                onChange={(e) => handleSettingChange(null, 'language', e.target.value)}
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                                <option value="zh">Chinese</option>
                            </select>
                        </div>

                        <div className="setting-item">
                            <label>Currency</label>
                            <select
                                value={settings.currency}
                                onChange={(e) => handleSettingChange(null, 'currency', e.target.value)}
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="JPY">JPY - Japanese Yen</option>
                                <option value="CAD">CAD - Canadian Dollar</option>
                            </select>
                        </div>

                        <div className="setting-item">
                            <label>Timezone</label>
                            <select
                                value={settings.timezone}
                                onChange={(e) => handleSettingChange(null, 'timezone', e.target.value)}
                            >
                                <option value="EST">Eastern Time (EST)</option>
                                <option value="PST">Pacific Time (PST)</option>
                                <option value="GMT">Greenwich Mean Time (GMT)</option>
                                <option value="CET">Central European Time (CET)</option>
                                <option value="JST">Japan Standard Time (JST)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="settings-section">
                    <h2>Notifications</h2>
                    <div className="settings-grid">
                        <div className="setting-item checkbox-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.email}
                                    onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                                />
                                Email Notifications
                            </label>
                            <p>Receive trade alerts and market updates via email</p>
                        </div>

                        <div className="setting-item checkbox-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.push}
                                    onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                                />
                                Push Notifications
                            </label>
                            <p>Get instant notifications on your mobile device</p>
                        </div>

                        <div className="setting-item checkbox-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.sms}
                                    onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                                />
                                SMS Notifications
                            </label>
                            <p>Receive critical alerts via text message</p>
                        </div>

                        <div className="setting-item checkbox-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.desktop}
                                    onChange={(e) => handleSettingChange('notifications', 'desktop', e.target.checked)}
                                />
                                Desktop Notifications
                            </label>
                            <p>Show notifications on your desktop browser</p>
                        </div>
                    </div>
                </div>

                {/* Trading Settings */}
                <div className="settings-section">
                    <h2>Trading</h2>
                    <div className="settings-grid">
                        <div className="setting-item checkbox-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={settings.trading.confirmOrders}
                                    onChange={(e) => handleSettingChange('trading', 'confirmOrders', e.target.checked)}
                                />
                                Confirm Orders
                            </label>
                            <p>Require confirmation before placing orders</p>
                        </div>

                        <div className="setting-item checkbox-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={settings.trading.autoRefresh}
                                    onChange={(e) => handleSettingChange('trading', 'autoRefresh', e.target.checked)}
                                />
                                Auto Refresh Data
                            </label>
                            <p>Automatically refresh market data</p>
                        </div>

                        <div className="setting-item">
                            <label>Refresh Interval (seconds)</label>
                            <select
                                value={settings.trading.refreshInterval}
                                onChange={(e) => handleSettingChange('trading', 'refreshInterval', parseInt(e.target.value))}
                                disabled={!settings.trading.autoRefresh}
                            >
                                <option value={1}>1 second</option>
                                <option value={5}>5 seconds</option>
                                <option value={10}>10 seconds</option>
                                <option value={30}>30 seconds</option>
                                <option value={60}>1 minute</option>
                            </select>
                        </div>

                        <div className="setting-item">
                            <label>Default Order Type</label>
                            <select
                                value={settings.trading.defaultOrderType}
                                onChange={(e) => handleSettingChange('trading', 'defaultOrderType', e.target.value)}
                            >
                                <option value="market">Market Order</option>
                                <option value="limit">Limit Order</option>
                                <option value="stop">Stop Order</option>
                                <option value="stop-limit">Stop-Limit Order</option>
                            </select>
                        </div>

                        <div className="setting-item checkbox-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={settings.trading.riskWarnings}
                                    onChange={(e) => handleSettingChange('trading', 'riskWarnings', e.target.checked)}
                                />
                                Risk Warnings
                            </label>
                            <p>Show warnings for high-risk trades</p>
                        </div>
                    </div>
                </div>

                {/* Privacy Settings */}
                <div className="settings-section">
                    <h2>Privacy & Data</h2>
                    <div className="settings-grid">
                        <div className="setting-item checkbox-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={settings.privacy.shareData}
                                    onChange={(e) => handleSettingChange('privacy', 'shareData', e.target.checked)}
                                />
                                Share Anonymous Data
                            </label>
                            <p>Help improve our services by sharing anonymous usage data</p>
                        </div>

                        <div className="setting-item checkbox-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={settings.privacy.analytics}
                                    onChange={(e) => handleSettingChange('privacy', 'analytics', e.target.checked)}
                                />
                                Analytics
                            </label>
                            <p>Allow analytics to improve your experience</p>
                        </div>

                        <div className="setting-item checkbox-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={settings.privacy.marketing}
                                    onChange={(e) => handleSettingChange('privacy', 'marketing', e.target.checked)}
                                />
                                Marketing Communications
                            </label>
                            <p>Receive promotional emails and offers</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="settings-actions">
                    <button onClick={handleSave} className="save-btn">Save Settings</button>
                    <button onClick={handleReset} className="reset-btn">Reset to Default</button>
                    <button onClick={() => navigate('/dashboard')} className="cancel-btn">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;