import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import TradingDashboard from './components/TradingDashboard'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import HelpPage from './pages/HelpPage'
import LoadingScreen from './components/LoadingScreen'
import ErrorBoundary from './components/ErrorBoundary'
import { ThemeProvider } from './design-system/ThemeProvider'
import { GlobalStyles } from './design-system/GlobalStyles'
import { ErrorBoundaryProvider } from './services/errorBoundaryIntegration'
import { RealTimeDataProvider } from './design-system/components/providers/RealTimeDataProvider'
import { initializeCompleteDataIntegration } from './services/completeDataIntegration'
import { initializeErrorHandling } from './utils/errorHandling'
import { runStartupValidation, displayValidationResults } from './utils/startupValidation'
import './styles/dashboard.css'

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [integrationStatus, setIntegrationStatus] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token is still valid
      fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('userPicture');
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          // Network error, assume offline but keep token
          setIsAuthenticated(true);
        });
    }

    // Initialize complete data integration
    const initializeApp = async () => {
      try {
        // Run startup validation first
        const validationResults = await runStartupValidation();
        if (!validationResults.success) {
          displayValidationResults(validationResults);
          // keep loading state so the user can see validation messages
          return;
        }

        // Initialize error handling system
        initializeErrorHandling();

        // Initialize data integration services and await if it returns a Promise
        // initializeCompleteDataIntegration may be sync (returns an object) or async (returns a Promise)
        const initResult = initializeCompleteDataIntegration();

        // Use a timeout fallback so the UI doesn't hang indefinitely
        const timeoutMs = 5000;
        const status = await Promise.race([
          Promise.resolve(initResult),
          new Promise(resolve => setTimeout(() => resolve({ initialized: false, timeout: true }), timeoutMs))
        ]);

        setIntegrationStatus(status);

        // Update loading state based on initialization result
        setLoadingProgress(status.initialized ? 100 : 0);
        setIsLoading(false);

        console.log('Initialization result:', status);
      } catch (error) {
        console.error('✗ Failed to initialize application:', error);
        // Still allow app to load with degraded functionality
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    // Set document title dynamically
    document.title = 'TradeFlowAI - AI Trading Platform';

    // Remove any existing favicon
    const existingFavicon = document.querySelector("link[rel*='icon']");
    if (existingFavicon) {
      existingFavicon.remove();
    }

    // Set meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.getElementsByTagName('head')[0].appendChild(metaDescription);
    }
    metaDescription.content = 'Advanced AI-Powered Trading Platform with Low-Latency Order Matching - Superior to TradingView and Walbi';

    // Set meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.getElementsByTagName('head')[0].appendChild(metaKeywords);
    }
    metaKeywords.content = 'AI Trading, Low Latency, Order Matching, Trading Platform, Market Analysis, Real-time Data';

    // Prevent context menu and text selection for trading app feel
    const handleContextMenu = (e) => e.preventDefault();
    const handleSelectStart = (e) => e.preventDefault();

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Top-level application error:', error, errorInfo);
      }}
    >
      <ThemeProvider defaultTheme="dark">
        <GlobalStyles />
        <ErrorBoundaryProvider
          globalErrorHandler={(error) => {
            console.error('Global application error:', error);
            // Could send to error reporting service here
          }}
        >
          <div className="app-container">
            <LoadingScreen
              isLoading={isLoading}
              progress={loadingProgress}
            />
            {!isLoading && (
              <Router>
                <RealTimeDataProvider
                  wsUrl="ws://localhost:8000/api/v1/streaming/ws"
                  autoConnect={true}
                  debug={process.env.NODE_ENV === 'development'}
                >
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />

                    {/* Protected Routes */}
                    <Route
                      path="/dashboard"
                      element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
                    />
                    <Route
                      path="/profile"
                      element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
                    />
                    <Route
                      path="/settings"
                      element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />}
                    />
                    <Route
                      path="/help"
                      element={isAuthenticated ? <HelpPage /> : <Navigate to="/login" />}
                    />

                    {/* Legacy trading dashboard route */}
                    <Route
                      path="/trading"
                      element={isAuthenticated ? <TradingDashboard /> : <Navigate to="/login" />}
                    />

                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </RealTimeDataProvider>
              </Router>
            )}


          </div>
        </ErrorBoundaryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}