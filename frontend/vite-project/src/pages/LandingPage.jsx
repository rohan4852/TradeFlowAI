import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <motion.h1
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="hero-title"
                    >
                        AI-Powered Trading Platform
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="hero-subtitle"
                    >
                        Make smarter trading decisions with advanced AI insights, real-time analytics, and professional-grade tools.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="hero-buttons"
                    >
                        <Link to="/signup" className="btn btn-primary">Get Started Free</Link>
                        <Link to="/login" className="btn btn-secondary">Sign In</Link>
                    </motion.div>
                </div>
                <div className="hero-visual">
                    <div className="trading-preview">
                        <div className="chart-mockup"></div>
                        <div className="ai-insights-mockup"></div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <h2>Why Choose Our Platform?</h2>
                    <div className="features-grid">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="feature-card"
                        >
                            <div className="feature-icon">📊</div>
                            <h3>Advanced Charting</h3>
                            <p>Professional TradingView-style charts with 100+ technical indicators and drawing tools.</p>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="feature-card"
                        >
                            <div className="feature-icon">🤖</div>
                            <h3>AI Predictions</h3>
                            <p>Machine learning algorithms analyze market patterns to provide intelligent trading insights.</p>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="feature-card"
                        >
                            <div className="feature-icon">📱</div>
                            <h3>Mobile Ready</h3>
                            <p>Trade anywhere with our responsive design optimized for all devices.</p>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="feature-card"
                        >
                            <div className="feature-icon">🔒</div>
                            <h3>Bank-Level Security</h3>
                            <p>Multi-factor authentication and enterprise-grade encryption protect your data.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="pricing">
                <div className="container">
                    <h2>Choose Your Plan</h2>
                    <div className="pricing-grid">
                        <div className="pricing-card">
                            <h3>Starter</h3>
                            <div className="price">Free</div>
                            <ul>
                                <li>Basic charting tools</li>
                                <li>5 AI predictions/day</li>
                                <li>Mobile app access</li>
                                <li>Community support</li>
                            </ul>
                            <Link to="/signup" className="btn btn-outline">Get Started</Link>
                        </div>
                        <div className="pricing-card featured">
                            <h3>Pro</h3>
                            <div className="price">$29<span>/month</span></div>
                            <ul>
                                <li>Advanced charting & indicators</li>
                                <li>Unlimited AI predictions</li>
                                <li>Portfolio analytics</li>
                                <li>Priority support</li>
                                <li>API access</li>
                            </ul>
                            <Link to="/signup" className="btn btn-primary">Start Free Trial</Link>
                        </div>
                        <div className="pricing-card">
                            <h3>Enterprise</h3>
                            <div className="price">Custom</div>
                            <ul>
                                <li>Everything in Pro</li>
                                <li>Custom integrations</li>
                                <li>Dedicated support</li>
                                <li>White-label options</li>
                            </ul>
                            <Link to="/contact" className="btn btn-outline">Contact Sales</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <h2>Ready to Transform Your Trading?</h2>
                    <p>Join thousands of traders who trust our AI-powered platform</p>
                    <Link to="/signup" className="btn btn-primary btn-large">Start Trading Now</Link>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;