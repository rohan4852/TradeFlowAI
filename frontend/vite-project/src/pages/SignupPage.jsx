import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AuthPages.css';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
        subscribeNewsletter: true
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

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Store auth token (in real app, this would come from API)
            localStorage.setItem('authToken', 'demo-token-' + Date.now());
            localStorage.setItem('userEmail', formData.email);
            localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (error) {
            setErrors({ submit: 'Registration failed. Please try again.' });
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
                        <h1>Create Account</h1>
                        <p>Start your trading journey today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={errors.firstName ? 'error' : ''}
                                    placeholder="John"
                                    autoComplete="given-name"
                                />
                                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={errors.lastName ? 'error' : ''}
                                    placeholder="Doe"
                                    autoComplete="family-name"
                                />
                                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'error' : ''}
                                placeholder="john@example.com"
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
                                placeholder="Create a strong password"
                                autoComplete="new-password"
                            />
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={errors.confirmPassword ? 'error' : ''}
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                            />
                            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                        </div>

                        <div className="form-checkboxes">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleChange}
                                />
                                <span className="checkmark"></span>
                                I agree to the{' '}
                                <Link to="/terms" className="link">Terms of Service</Link>
                                {' '}and{' '}
                                <Link to="/privacy" className="link">Privacy Policy</Link>
                            </label>
                            {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}

                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="subscribeNewsletter"
                                    checked={formData.subscribeNewsletter}
                                    onChange={handleChange}
                                />
                                <span className="checkmark"></span>
                                Subscribe to trading insights and market updates
                            </label>
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
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
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
                                    Signing up with Google...
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
                            Already have an account?{' '}
                            <Link to="/login" className="auth-link">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </motion.div>

                <div className="auth-visual">
                    <div className="visual-content">
                        <h2>Join the Future of Trading</h2>
                        <p>Get access to professional trading tools, AI-powered insights, and a community of successful traders.</p>
                        <div className="features-list">
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                Advanced charting tools
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                AI-powered predictions
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                Real-time market data
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">✓</span>
                                Portfolio analytics
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;