/**
 * Main Documentation Application
 * Provides a complete documentation site for the Superior UI Design System
 */
import React, { useState, useEffect } from 'react';
import StyleGuide from './StyleGuide';
import ComponentPlayground from './ComponentPlayground';
import AccessibilityTester from './AccessibilityTester';
import { documentationRoutes, designSystemInfo } from './index';
import './DocumentationApp.css';

/**
 * Navigation component
 */
const DocumentationNav = ({ activeRoute, onRouteChange }) => {
    return (
        <nav className="docs-nav">
            <div className="docs-nav-header">
                <h2>{designSystemInfo.name}</h2>
                <span className="version">v{designSystemInfo.version}</span>
            </div>

            <div className="docs-nav-links">
                {documentationRoutes.map(route => (
                    <button
                        key={route.path}
                        className={`docs-nav-link ${activeRoute === route.path ? 'active' : ''}`}
                        onClick={() => onRouteChange(route.path)}
                    >
                        <span className="nav-icon">
                            {route.path === '/docs' && '📚'}
                            {route.path === '/docs/playground' && '🎮'}
                            {route.path === '/docs/accessibility' && '♿'}
                        </span>
                        <span className="nav-text">{route.name}</span>
                    </button>
                ))}
            </div>

            <div className="docs-nav-footer">
                <div className="system-info">
                    <p>{designSystemInfo.description}</p>
                    <div className="tech-stack">
                        {designSystemInfo.technologies.slice(0, 4).map(tech => (
                            <span key={tech} className="tech-badge">{tech}</span>
                        ))}
                    </div>
                </div>

                <div className="external-links">
                    <a href={designSystemInfo.repository} target="_blank" rel="noopener noreferrer">
                        📦 Repository
                    </a>
                    <a href={designSystemInfo.documentation} target="_blank" rel="noopener noreferrer">
                        📖 Live Docs
                    </a>
                </div>
            </div>
        </nav>
    );
};

/**
 * Route content renderer
 */
const RouteContent = ({ route }) => {
    switch (route) {
        case '/docs':
            return <StyleGuide />;
        case '/docs/playground':
            return <ComponentPlayground />;
        case '/docs/accessibility':
            return <AccessibilityTester />;
        default:
            return <StyleGuide />;
    }
};

/**
 * Main Documentation Application
 */
const DocumentationApp = () => {
    const [activeRoute, setActiveRoute] = useState('/docs');
    const [theme, setTheme] = useState('dark');
    const [isNavCollapsed, setIsNavCollapsed] = useState(false);

    // Initialize theme
    useEffect(() => {
        document.body.className = `docs-theme-${theme}`;
    }, [theme]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl/Cmd + K to toggle nav
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsNavCollapsed(!isNavCollapsed);
            }

            // Ctrl/Cmd + T to toggle theme
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                setTheme(theme === 'dark' ? 'light' : 'dark');
            }

            // Number keys for quick navigation
            if (e.altKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        setActiveRoute('/docs');
                        break;
                    case '2':
                        e.preventDefault();
                        setActiveRoute('/docs/playground');
                        break;
                    case '3':
                        e.preventDefault();
                        setActiveRoute('/docs/accessibility');
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isNavCollapsed, theme]);

    const currentRoute = documentationRoutes.find(route => route.path === activeRoute);

    return (
        <div className={`documentation-app theme-${theme} ${isNavCollapsed ? 'nav-collapsed' : ''}`}>
            {/* Header */}
            <header className="docs-header">
                <div className="docs-header-left">
                    <button
                        className="nav-toggle"
                        onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                        title="Toggle Navigation (Ctrl+K)"
                    >
                        {isNavCollapsed ? '☰' : '✕'}
                    </button>

                    <div className="breadcrumb">
                        <span className="breadcrumb-home">Documentation</span>
                        <span className="breadcrumb-separator">/</span>
                        <span className="breadcrumb-current">{currentRoute?.name}</span>
                    </div>
                </div>

                <div className="docs-header-right">
                    <div className="keyboard-shortcuts">
                        <button className="shortcuts-btn" title="Keyboard Shortcuts">
                            ⌨️
                        </button>
                        <div className="shortcuts-tooltip">
                            <div className="shortcut">
                                <kbd>Ctrl</kbd> + <kbd>K</kbd> Toggle Navigation
                            </div>
                            <div className="shortcut">
                                <kbd>Ctrl</kbd> + <kbd>T</kbd> Toggle Theme
                            </div>
                            <div className="shortcut">
                                <kbd>Alt</kbd> + <kbd>1-3</kbd> Quick Navigation
                            </div>
                        </div>
                    </div>

                    <button
                        className="theme-toggle"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        title="Toggle Theme (Ctrl+T)"
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
            </header>

            <div className="docs-layout">
                {/* Navigation */}
                <aside className={`docs-sidebar ${isNavCollapsed ? 'collapsed' : ''}`}>
                    <DocumentationNav
                        activeRoute={activeRoute}
                        onRouteChange={setActiveRoute}
                    />
                </aside>

                {/* Main Content */}
                <main className="docs-main">
                    <div className="docs-content">
                        <RouteContent route={activeRoute} />
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="docs-footer">
                <div className="footer-content">
                    <div className="footer-left">
                        <span>© 2024 {designSystemInfo.author}</span>
                        <span className="footer-separator">•</span>
                        <span>Licensed under {designSystemInfo.license}</span>
                    </div>

                    <div className="footer-right">
                        <span>Built with ❤️ for professional trading interfaces</span>
                    </div>
                </div>
            </footer>

            {/* Loading indicator for route changes */}
            <div className="route-loading-indicator" />
        </div>
    );
};

export default DocumentationApp;