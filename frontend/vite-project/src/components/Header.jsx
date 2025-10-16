import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Header.css';

const Header = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const name = localStorage.getItem('userName');
        const email = localStorage.getItem('userEmail');

        setIsAuthenticated(!!token);
        setUserName(name || email?.split('@')[0] || 'User');
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        setIsAuthenticated(false);
        navigate('/');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    const isLandingPage = location.pathname === '/';

    return (
        <header className={`header ${isLandingPage ? 'landing-header' : 'app-header'}`}>
            <div className="header-container">
                {/* Logo */}
                <Link to="/" className="logo">
                    <div className="logo-icon">📈</div>
                    <span className="logo-text">TradeFlow AI</span>
                </Link>

                {/* Navigation */}
                <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
                    {isAuthenticated ? (
                        // Authenticated Navigation
                        <>
                            <Link
                                to="/dashboard"
                                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/portfolio"
                                className={`nav-link ${location.pathname === '/portfolio' ? 'active' : ''}`}
                            >
                                Portfolio
                            </Link>
                            <Link
                                to="/markets"
                                className={`nav-link ${location.pathname === '/markets' ? 'active' : ''}`}
                            >
                                Markets
                            </Link>
                            <Link
                                to="/analysis"
                                className={`nav-link ${location.pathname === '/analysis' ? 'active' : ''}`}
                            >
                                Analysis
                            </Link>
                            <Link
                                to="/news"
                                className={`nav-link ${location.pathname === '/news' ? 'active' : ''}`}
                            >
                                News
                            </Link>
                        </>
                    ) : (
                        // Public Navigation
                        <>
                            <Link to="/features" className="nav-link">Features</Link>
                            <Link to="/pricing" className="nav-link">Pricing</Link>
                            <Link to="/about" className="nav-link">About</Link>
                            <Link to="/contact" className="nav-link">Contact</Link>
                        </>
                    )}
                </nav>

                {/* Right Side Actions */}
                <div className="header-actions">
                    {isAuthenticated ? (
                        // User Profile Dropdown
                        <div className="profile-dropdown">
                            <button
                                className="profile-button"
                                onClick={toggleProfile}
                            >
                                <div className="profile-avatar">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                                <span className="profile-name">{userName}</span>
                                <svg
                                    className={`dropdown-arrow ${isProfileOpen ? 'open' : ''}`}
                                    width="12"
                                    height="12"
                                    viewBox="0 0 12 12"
                                >
                                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
                                </svg>
                            </button>

                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="profile-menu"
                                >
                                    <Link to="/profile" className="profile-menu-item">
                                        <span className="menu-icon">👤</span>
                                        Profile
                                    </Link>
                                    <Link to="/settings" className="profile-menu-item">
                                        <span className="menu-icon">⚙️</span>
                                        Settings
                                    </Link>
                                    <Link to="/help" className="profile-menu-item">
                                        <span className="menu-icon">❓</span>
                                        Help
                                    </Link>
                                    <div className="menu-divider"></div>
                                    <button onClick={handleLogout} className="profile-menu-item logout">
                                        <span className="menu-icon">🚪</span>
                                        Sign Out
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        // Auth Buttons
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-ghost">Sign In</Link>
                            <Link to="/signup" className="btn btn-primary">Get Started</Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mobile-menu-overlay"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="mobile-menu"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mobile-menu-header">
                            <div className="mobile-logo">
                                <div className="logo-icon">📈</div>
                                <span>TradeFlow AI</span>
                            </div>
                            <button
                                className="close-button"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mobile-menu-content">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/dashboard" className="mobile-nav-link">Dashboard</Link>
                                    <Link to="/portfolio" className="mobile-nav-link">Portfolio</Link>
                                    <Link to="/markets" className="mobile-nav-link">Markets</Link>
                                    <Link to="/analysis" className="mobile-nav-link">Analysis</Link>
                                    <Link to="/news" className="mobile-nav-link">News</Link>
                                    <div className="mobile-menu-divider"></div>
                                    <Link to="/profile" className="mobile-nav-link">Profile</Link>
                                    <Link to="/settings" className="mobile-nav-link">Settings</Link>
                                    <Link to="/help" className="mobile-nav-link">Help</Link>
                                    <button onClick={handleLogout} className="mobile-nav-link logout">
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/features" className="mobile-nav-link">Features</Link>
                                    <Link to="/pricing" className="mobile-nav-link">Pricing</Link>
                                    <Link to="/about" className="mobile-nav-link">About</Link>
                                    <Link to="/contact" className="mobile-nav-link">Contact</Link>
                                    <div className="mobile-menu-divider"></div>
                                    <Link to="/login" className="mobile-nav-link">Sign In</Link>
                                    <Link to="/signup" className="mobile-nav-link primary">Get Started</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </header>
    );
};

export default Header;