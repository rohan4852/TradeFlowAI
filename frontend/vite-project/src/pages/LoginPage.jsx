import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AuthPages.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const navigate = useNavigate();

    // Add auth-page class to body to override global dark theme and enable scrolling
    React.useEffect(() => {
        document.body.classList.add('auth-page-body');
        document.documentElement.style.overflowY = 'auto';
        document.body.style.overflowY = 'auto';
        document.body.style.height = 'auto';

        return () => {
            document.body.classList.remove('auth-page-body');
            document.documentElement.style.overflowY = '';
            document.body.style.overflowY = '';
            document.body.style.height = '';
        };
    }, []);

    // Load Google OAuth script
    useEffect(() => {
        const loadGoogleScript = () => {
            if (window.google) return;

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogleSignIn;
            document.head.appendChild(script);
        };

        const initializeGoogleSignIn = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
                    callback: handleGoogleSignIn,
                    auto_select: false,
                    cancel_on_tap_outside: true
                });
            }
        };

        loadGoogleScript();
    }, []);

    const handleGoogleSignIn = async (response) => {
        setIsGoogleLoading(true);
        setErrors({});

        try {
            const result = await fetch('/api/v1/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: response.credential
                })
            });

            const data = await result.json();

            if (data.success) {
                // Store auth token and user info
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('userPicture', data.user.picture || '');

                // Redirect to dashboard
                navigate('/dashboard');
            } else {
                setErrors({ submit: data.error || 'Google sign-in failed' });
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            setErrors({ submit: 'Google sign-in failed. Please try again.' });
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleGoogleButtonClick = () => {
        if (window.google) {
            window.google.accounts.id.prompt();
        } else {
            setErrors({ submit: 'Google Sign-In not loaded. Please refresh the page.' });
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Store auth token (in real app, this would come from API)
            localStorage.setItem('authToken', 'demo-token-' + Date.now());
            localStorage.setItem('userEmail', formData.email);

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (error) {
            setErrors({ submit: 'Login failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="auth-card"
                >
                    <div className="auth-header">
                        <h1>Welcome Back</h1>
                        <p>Sign in to your trading account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'error' : ''}
                                placeholder="Enter your email"
                                autoComplete="email"
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={errors.password ? 'error' : ''}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>

                        <div className="form-options">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                />
                                <span className="checkmark"></span>
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="forgot-link">
                                Forgot password?
                            </Link>
                        </div>

                        {errors.submit && (
                            <div className="error-message submit-error">{errors.submit}</div>
                        )}

                        <button
                            type="submit"
                            className={`auth-button ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <div className="social-login">
                        <button
                            className={`social-button google ${isGoogleLoading ? 'loading' : ''}`}
                            onClick={handleGoogleButtonClick}
                            disabled={isGoogleLoading}
                        >
                            {isGoogleLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    Signing in with Google...
                                </>
                            ) : (
                                <>
                                    <span className="social-icon">G</span>
                                    Continue with Google
                                </>
                            )}
                        </button>

                    </div>

                    <div className="auth-footer">
                        <p>
                            Don't have an account?{' '}
                            <Link to="/signup" className="auth-link">
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </motion.div>

                <div className="auth-visual">
                    <div className="visual-content">
                        <h2>Start Trading Smarter</h2>
                        <p>Join thousands of traders using AI-powered insights to make better investment decisions.</p>
                        <div className="stats">
                            <div className="stat">
                                <div className="stat-number">10K+</div>
                                <div className="stat-label">Active Traders</div>
                            </div>
                            <div className="stat">
                                <div className="stat-number">$2.5B+</div>
                                <div className="stat-label">Volume Traded</div>
                            </div>
                            <div className="stat">
                                <div className="stat-number">95%</div>
                                <div className="stat-label">Accuracy Rate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;