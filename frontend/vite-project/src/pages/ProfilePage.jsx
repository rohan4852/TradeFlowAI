import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('personal');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [profileData, setProfileData] = useState({
        display_name: '',
        bio: '',
        trading_experience: 'beginner',
        risk_tolerance: 'moderate',
        investment_goals: [],
        preferred_assets: [],
        notifications_enabled: true,
        theme_preference: 'dark',
        timezone: 'UTC',
        language: 'en'
    });

    // Load user data on component mount
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('authToken');

            if (!token) {
                navigate('/login');
                return;
            }

            // Load user info and profile
            const [userResponse, profileResponse] = await Promise.all([
                fetch('/api/v1/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }),
                fetch('/api/v1/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            ]);

            if (userResponse.ok) {
                const userData = await userResponse.json();
                setUserInfo(userData);
            }

            if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                setProfileData(profileData);
            }

        } catch (error) {
            console.error('Error loading user data:', error);
            setError('Failed to load profile data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleArrayChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(item => item !== value)
                : [...prev[field], value]
        }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const token = localStorage.getItem('authToken');

            const response = await fetch('/api/v1/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                alert('Profile updated successfully!');
            } else {
                throw new Error('Failed to update profile');
            }

        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userPicture');
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="profile-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page">
                <div className="error-container">
                    <p>Error: {error}</p>
                    <button onClick={loadUserData}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>
                <h1>Profile Settings</h1>
                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </div>

            <div className="profile-content">
                <div className="profile-sidebar">
                    <div className="profile-avatar">
                        {userInfo?.picture ? (
                            <img src={userInfo.picture} alt="Profile" className="avatar-image" />
                        ) : (
                            <div className="avatar-circle">
                                {userInfo?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                        <h3>{userInfo?.name || 'User'}</h3>
                        <p>{userInfo?.email}</p>
                        <span className="auth-provider">
                            Signed in with {userInfo?.auth_provider || 'email'}
                        </span>
                    </div>

                    <nav className="profile-nav">
                        <button
                            className={activeTab === 'personal' ? 'active' : ''}
                            onClick={() => setActiveTab('personal')}
                        >
                            Personal Info
                        </button>
                        <button
                            className={activeTab === 'trading' ? 'active' : ''}
                            onClick={() => setActiveTab('trading')}
                        >
                            Trading Preferences
                        </button>
                        <button
                            className={activeTab === 'settings' ? 'active' : ''}
                            onClick={() => setActiveTab('settings')}
                        >
                            Settings
                        </button>
                    </nav>
                </div>

                <div className="profile-main">
                    {activeTab === 'personal' && (
                        <div className="tab-content">
                            <h2>Personal Information</h2>

                            <div className="form-group">
                                <label>Display Name</label>
                                <input
                                    type="text"
                                    name="display_name"
                                    value={profileData.display_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your display name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    name="bio"
                                    value={profileData.bio}
                                    onChange={handleInputChange}
                                    placeholder="Tell us about yourself..."
                                    rows="4"
                                />
                            </div>

                            <div className="form-group">
                                <label>Timezone</label>
                                <select
                                    name="timezone"
                                    value={profileData.timezone}
                                    onChange={handleInputChange}
                                >
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">Eastern Time</option>
                                    <option value="America/Chicago">Central Time</option>
                                    <option value="America/Denver">Mountain Time</option>
                                    <option value="America/Los_Angeles">Pacific Time</option>
                                    <option value="Europe/London">London</option>
                                    <option value="Europe/Paris">Paris</option>
                                    <option value="Asia/Tokyo">Tokyo</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Language</label>
                                <select
                                    name="language"
                                    value={profileData.language}
                                    onChange={handleInputChange}
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="ja">Japanese</option>
                                    <option value="zh">Chinese</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'trading' && (
                        <div className="tab-content">
                            <h2>Trading Preferences</h2>

                            <div className="form-group">
                                <label>Trading Experience</label>
                                <select
                                    name="trading_experience"
                                    value={profileData.trading_experience}
                                    onChange={handleInputChange}
                                >
                                    <option value="beginner">Beginner (0-1 years)</option>
                                    <option value="intermediate">Intermediate (1-3 years)</option>
                                    <option value="advanced">Advanced (3-5 years)</option>
                                    <option value="expert">Expert (5+ years)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Risk Tolerance</label>
                                <select
                                    name="risk_tolerance"
                                    value={profileData.risk_tolerance}
                                    onChange={handleInputChange}
                                >
                                    <option value="conservative">Conservative</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="aggressive">Aggressive</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Investment Goals</label>
                                <div className="checkbox-group">
                                    {['long_term_growth', 'income_generation', 'capital_preservation', 'speculation'].map(goal => (
                                        <label key={goal} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={profileData.investment_goals.includes(goal)}
                                                onChange={() => handleArrayChange('investment_goals', goal)}
                                            />
                                            <span className="checkmark"></span>
                                            {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Preferred Assets</label>
                                <div className="checkbox-group">
                                    {['stocks', 'forex', 'crypto', 'commodities', 'indices', 'bonds'].map(asset => (
                                        <label key={asset} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={profileData.preferred_assets.includes(asset)}
                                                onChange={() => handleArrayChange('preferred_assets', asset)}
                                            />
                                            <span className="checkmark"></span>
                                            {asset.charAt(0).toUpperCase() + asset.slice(1)}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="tab-content">
                            <h2>Application Settings</h2>

                            <div className="form-group">
                                <label>Theme Preference</label>
                                <select
                                    name="theme_preference"
                                    value={profileData.theme_preference}
                                    onChange={handleInputChange}
                                >
                                    <option value="dark">Dark</option>
                                    <option value="light">Light</option>
                                    <option value="auto">Auto</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="notifications_enabled"
                                        checked={profileData.notifications_enabled}
                                        onChange={handleInputChange}
                                    />
                                    <span className="checkmark"></span>
                                    Enable Notifications
                                </label>
                            </div>

                            <div className="account-info">
                                <h3>Account Information</h3>
                                <p><strong>Email:</strong> {userInfo?.email}</p>
                                <p><strong>Account Created:</strong> {userInfo?.created_at ? new Date(userInfo.created_at).toLocaleDateString() : 'N/A'}</p>
                                <p><strong>Last Login:</strong> {userInfo?.last_login ? new Date(userInfo.last_login).toLocaleDateString() : 'N/A'}</p>
                                <p><strong>Email Verified:</strong> {userInfo?.email_verified ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            onClick={handleSave}
                            className={`save-btn ${isSaving ? 'loading' : ''}`}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;