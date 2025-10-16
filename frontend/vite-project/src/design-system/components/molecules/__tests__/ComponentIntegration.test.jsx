import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../ThemeProvider';
import FormGroup, { Field, TradingForm } from '../FormGroup';
import { Navigation, Breadcrumb, Tabs } from '../Navigation';
import { Card, MetricCard, TradingCard } from '../Card';
import { Button, Input, Icon } from '../../atoms';

// Test wrapper with theme
const TestWrapper = ({ children }) => (
    <ThemeProvider defaultTheme="light">
        {children}
    </ThemeProvider>
);

describe('Component Integration Tests', () => {
    describe('Form Component Composition', () => {
        test('FormGroup with multiple Fields handles validation flow', async () => {
            const user = userEvent.setup();
            const mockSubmit = jest.fn();
            const [formData, setFormData] = [
                { email: '', password: '', confirmPassword: '' },
                jest.fn()
            ];
            const [errors, setErrors] = [[], jest.fn()];

            const TestForm = () => {
                const [data, setData] = useState({ email: '', password: '', confirmPassword: '' });
                const [formErrors, setFormErrors] = useState([]);

                const handleSubmit = (e) => {
                    e.preventDefault();
                    const newErrors = [];

                    if (!data.email) newErrors.push('Email is required');
                    if (!data.password) newErrors.push('Password is required');
                    if (data.password !== data.confirmPassword) newErrors.push('Passwords do not match');

                    setFormErrors(newErrors);

                    if (newErrors.length === 0) {
                        mockSubmit(data);
                    }
                };

                return (
                    <FormGroup
                        title="Registration Form"
                        description="Create your trading account"
                        errors={formErrors}
                        onSubmit={handleSubmit}
                        testId="registration-form"
                    >
                        <Field label="Email" required error={formErrors.find(e => e.includes('Email'))}>
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                                testId="email-input"
                            />
                        </Field>

                        <Field label="Password" required error={formErrors.find(e => e.includes('Password') && !e.includes('match'))}>
                            <Input
                                type="password"
                                placeholder="Enter password"
                                value={data.password}
                                onChange={(e) => setData({ ...data, password: e.target.value })}
                                testId="password-input"
                            />
                        </Field>

                        <Field label="Confirm Password" required error={formErrors.find(e => e.includes('match'))}>
                            <Input
                                type="password"
                                placeholder="Confirm password"
                                value={data.confirmPassword}
                                onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                                testId="confirm-password-input"
                            />
                        </Field>

                        <Button type="submit" variant="primary" testId="submit-button">
                            Create Account
                        </Button>
                    </FormGroup>
                );
            };

            render(
                <TestWrapper>
                    <TestForm />
                </TestWrapper>
            );

            // Test initial render
            expect(screen.getByText('Registration Form')).toBeInTheDocument();
            expect(screen.getByText('Create your trading account')).toBeInTheDocument();

            // Test validation on empty form submission
            await user.click(screen.getByTestId('submit-button'));

            await waitFor(() => {
                expect(screen.getByText('Email is required')).toBeInTheDocument();
                expect(screen.getByText('Password is required')).toBeInTheDocument();
            });

            // Fill form with mismatched passwords
            await user.type(screen.getByTestId('email-input'), 'test@example.com');
            await user.type(screen.getByTestId('password-input'), 'password123');
            await user.type(screen.getByTestId('confirm-password-input'), 'password456');

            await user.click(screen.getByTestId('submit-button'));

            await waitFor(() => {
                expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
            });

            // Fix password mismatch
            await user.clear(screen.getByTestId('confirm-password-input'));
            await user.type(screen.getByTestId('confirm-password-input'), 'password123');

            await user.click(screen.getByTestId('submit-button'));

            await waitFor(() => {
                expect(mockSubmit).toHaveBeenCalledWith({
                    email: 'test@example.com',
                    password: 'password123',
                    confirmPassword: 'password123'
                });
            });
        });

        test('TradingForm integrates with real-time data updates', async () => {
            const user = userEvent.setup();
            const mockSubmit = jest.fn();
            const mockPriceUpdate = jest.fn();

            const TradingFormWithData = () => {
                const [formData, setFormData] = useState({
                    symbol: 'AAPL',
                    quantity: 100,
                    price: 150.00,
                    orderType: 'market',
                    side: 'buy'
                });
                const [currentPrice, setCurrentPrice] = useState(150.00);
                const [errors, setErrors] = useState([]);

                // Simulate real-time price updates
                React.useEffect(() => {
                    const interval = setInterval(() => {
                        const newPrice = currentPrice + (Math.random() - 0.5) * 2;
                        setCurrentPrice(newPrice);
                        mockPriceUpdate(newPrice);

                        // Update form price if market order
                        if (formData.orderType === 'market') {
                            setFormData(prev => ({ ...prev, price: newPrice }));
                        }
                    }, 100);

                    return () => clearInterval(interval);
                }, [currentPrice, formData.orderType]);

                const handleSubmit = (data) => {
                    const newErrors = [];
                    if (!data.symbol) newErrors.push('Symbol is required');
                    if (!data.quantity || data.quantity <= 0) newErrors.push('Quantity must be positive');
                    if (data.orderType === 'limit' && (!data.price || data.price <= 0)) {
                        newErrors.push('Price must be positive for limit orders');
                    }

                    setErrors(newErrors);

                    if (newErrors.length === 0) {
                        mockSubmit({ ...data, currentPrice });
                    }
                };

                return (
                    <div>
                        <Card title="Current Price" testId="price-display">
                            <MetricCard
                                title={formData.symbol}
                                value={`$${currentPrice.toFixed(2)}`}
                                trend={currentPrice > 150 ? 'up' : 'down'}
                            />
                        </Card>

                        <TradingForm
                            {...formData}
                            errors={errors}
                            onSymbolChange={(symbol) => setFormData(prev => ({ ...prev, symbol }))}
                            onQuantityChange={(quantity) => setFormData(prev => ({ ...prev, quantity }))}
                            onPriceChange={(price) => setFormData(prev => ({ ...prev, price }))}
                            onOrderTypeChange={(orderType) => setFormData(prev => ({ ...prev, orderType }))}
                            onSideChange={(side) => setFormData(prev => ({ ...prev, side }))}
                            onSubmit={handleSubmit}
                        />
                    </div>
                );
            };

            render(
                <TestWrapper>
                    <TradingFormWithData />
                </TestWrapper>
            );

            // Wait for price updates
            await waitFor(() => {
                expect(mockPriceUpdate).toHaveBeenCalled();
            }, { timeout: 200 });

            // Test form submission with current price
            await user.click(screen.getByText('Buy Order'));

            await waitFor(() => {
                expect(mockSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        symbol: 'AAPL',
                        quantity: 100,
                        orderType: 'market',
                        side: 'buy',
                        currentPrice: expect.any(Number)
                    })
                );
            });
        });
    });

    describe('Navigation Component Composition', () => {
        test('Navigation with Breadcrumb and Tabs creates cohesive navigation flow', async () => {
            const user = userEvent.setup();
            const mockNavigate = jest.fn();
            const mockTabChange = jest.fn();
            const mockBreadcrumbClick = jest.fn();

            const NavigationFlow = () => {
                const [currentPage, setCurrentPage] = useState('dashboard');
                const [activeTab, setActiveTab] = useState('overview');
                const [breadcrumbs, setBreadcrumbs] = useState([
                    { key: 'home', label: 'Home', icon: 'home' },
                    { key: 'dashboard', label: 'Dashboard' }
                ]);

                const navItems = [
                    { key: 'dashboard', label: 'Dashboard', icon: 'home' },
                    { key: 'trading', label: 'Trading', icon: 'trending-up' },
                    { key: 'portfolio', label: 'Portfolio', icon: 'briefcase' },
                    { key: 'analytics', label: 'Analytics', icon: 'bar-chart' }
                ];

                const tabItems = [
                    { key: 'overview', label: 'Overview' },
                    { key: 'positions', label: 'Positions' },
                    { key: 'orders', label: 'Orders' },
                    { key: 'history', label: 'History' }
                ];

                const handleNavigation = (item) => {
                    setCurrentPage(item.key);
                    mockNavigate(item.key);

                    // Update breadcrumbs based on navigation
                    const newBreadcrumbs = [
                        { key: 'home', label: 'Home', icon: 'home' },
                        { key: item.key, label: item.label }
                    ];

                    if (item.key === 'trading') {
                        newBreadcrumbs.push({ key: 'btc-usd', label: 'BTC/USD' });
                    }

                    setBreadcrumbs(newBreadcrumbs);
                };

                const handleTabChange = (tab) => {
                    setActiveTab(tab.key);
                    mockTabChange(tab.key);
                };

                const handleBreadcrumbClick = (item) => {
                    mockBreadcrumbClick(item.key);
                    if (item.key === 'home') {
                        setCurrentPage('dashboard');
                        setBreadcrumbs([
                            { key: 'home', label: 'Home', icon: 'home' },
                            { key: 'dashboard', label: 'Dashboard' }
                        ]);
                    }
                };

                return (
                    <div>
                        <Navigation
                            items={navItems}
                            activeItem={currentPage}
                            onItemClick={handleNavigation}
                            testId="main-navigation"
                        />

                        <Breadcrumb
                            items={breadcrumbs}
                            onItemClick={handleBreadcrumbClick}
                            testId="breadcrumb-navigation"
                        />

                        <Tabs
                            items={tabItems}
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            testId="content-tabs"
                        />

                        <div data-testid="page-content">
                            Current Page: {currentPage} | Active Tab: {activeTab}
                        </div>
                    </div>
                );
            };

            render(
                <TestWrapper>
                    <NavigationFlow />
                </TestWrapper>
            );

            // Test initial state
            expect(screen.getByText('Current Page: dashboard | Active Tab: overview')).toBeInTheDocument();

            // Navigate to trading
            await user.click(screen.getByText('Trading'));

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('trading');
                expect(screen.getByText('BTC/USD')).toBeInTheDocument(); // Breadcrumb updated
            });

            // Change tab
            await user.click(screen.getByText('Positions'));

            await waitFor(() => {
                expect(mockTabChange).toHaveBeenCalledWith('positions');
                expect(screen.getByText('Current Page: trading | Active Tab: positions')).toBeInTheDocument();
            });

            // Navigate via breadcrumb
            await user.click(screen.getByText('Home'));

            await waitFor(() => {
                expect(mockBreadcrumbClick).toHaveBeenCalledWith('home');
                expect(screen.getByText('Current Page: dashboard | Active Tab: positions')).toBeInTheDocument();
            });
        });
    });

    describe('Card Component Composition', () => {
        test('Cards with interactive content handle complex data flows', async () => {
            const user = userEvent.setup();
            const mockCardClick = jest.fn();
            const mockActionClick = jest.fn();
            const mockDataUpdate = jest.fn();

            const CardDashboard = () => {
                const [selectedCard, setSelectedCard] = useState(null);
                const [metrics, setMetrics] = useState([
                    { id: 'volume', title: 'Volume', value: '$1,234,567', change: 5.2, trend: 'up' },
                    { id: 'price', title: 'Price', value: '$45,000', change: -2.1, trend: 'down' },
                    { id: 'market-cap', title: 'Market Cap', value: '$850B', change: 1.8, trend: 'up' }
                ]);

                const handleCardClick = (cardId) => {
                    setSelectedCard(cardId);
                    mockCardClick(cardId);
                };

                const handleAction = (action, cardId) => {
                    mockActionClick(action, cardId);

                    if (action === 'refresh') {
                        // Simulate data refresh
                        setMetrics(prev => prev.map(metric =>
                            metric.id === cardId
                                ? { ...metric, value: `$${Math.random() * 1000000}`, change: (Math.random() - 0.5) * 10 }
                                : metric
                        ));
                        mockDataUpdate(cardId);
                    }
                };

                return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {metrics.map(metric => (
                            <MetricCard
                                key={metric.id}
                                title={metric.title}
                                value={metric.value}
                                change={`${metric.change > 0 ? '+' : ''}${metric.change}%`}
                                trend={metric.trend}
                                interactive
                                onClick={() => handleCardClick(metric.id)}
                                actions={
                                    <div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            leftIcon={<Icon name="refresh" />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAction('refresh', metric.id);
                                            }}
                                            testId={`refresh-${metric.id}`}
                                        >
                                            Refresh
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            leftIcon={<Icon name="external-link" />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAction('details', metric.id);
                                            }}
                                            testId={`details-${metric.id}`}
                                        >
                                            Details
                                        </Button>
                                    </div>
                                }
                                testId={`metric-card-${metric.id}`}
                                className={selectedCard === metric.id ? 'selected' : ''}
                            />
                        ))}

                        {selectedCard && (
                            <Card
                                title="Selected Metric Details"
                                testId="details-card"
                                footer={
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedCard(null)}
                                        testId="close-details"
                                    >
                                        Close
                                    </Button>
                                }
                            >
                                <p>Details for: {selectedCard}</p>
                                <p>Last updated: {new Date().toLocaleTimeString()}</p>
                            </Card>
                        )}
                    </div>
                );
            };

            render(
                <TestWrapper>
                    <CardDashboard />
                </TestWrapper>
            );

            // Test card click
            await user.click(screen.getByTestId('metric-card-volume'));

            await waitFor(() => {
                expect(mockCardClick).toHaveBeenCalledWith('volume');
                expect(screen.getByTestId('details-card')).toBeInTheDocument();
                expect(screen.getByText('Details for: volume')).toBeInTheDocument();
            });

            // Test action button click (should not trigger card click)
            await user.click(screen.getByTestId('refresh-price'));

            await waitFor(() => {
                expect(mockActionClick).toHaveBeenCalledWith('refresh', 'price');
                expect(mockDataUpdate).toHaveBeenCalledWith('price');
                // Card should not be selected
                expect(screen.getByText('Details for: volume')).toBeInTheDocument(); // Still showing volume details
            });

            // Test details action
            await user.click(screen.getByTestId('details-market-cap'));

            await waitFor(() => {
                expect(mockActionClick).toHaveBeenCalledWith('details', 'market-cap');
            });

            // Close details
            await user.click(screen.getByTestId('close-details'));

            await waitFor(() => {
                expect(screen.queryByTestId('details-card')).not.toBeInTheDocument();
            });
        });
    });

    describe('Cross-Component Data Flow', () => {
        test('Form submission updates navigation and card states', async () => {
            const user = userEvent.setup();
            const mockSubmit = jest.fn();
            const mockNavigate = jest.fn();

            const IntegratedApp = () => {
                const [currentPage, setCurrentPage] = useState('trading');
                const [orderHistory, setOrderHistory] = useState([]);
                const [formData, setFormData] = useState({
                    symbol: 'AAPL',
                    quantity: 100,
                    price: 150.00,
                    orderType: 'market',
                    side: 'buy'
                });

                const navItems = [
                    { key: 'trading', label: 'Trading', badge: orderHistory.length },
                    { key: 'portfolio', label: 'Portfolio' },
                    { key: 'history', label: 'History', badge: orderHistory.length }
                ];

                const handleOrderSubmit = (orderData) => {
                    const newOrder = {
                        id: Date.now(),
                        ...orderData,
                        timestamp: new Date().toISOString(),
                        status: 'pending'
                    };

                    setOrderHistory(prev => [newOrder, ...prev]);
                    mockSubmit(newOrder);

                    // Auto-navigate to history after order
                    setTimeout(() => {
                        setCurrentPage('history');
                        mockNavigate('history');
                    }, 100);
                };

                const handleNavigation = (item) => {
                    setCurrentPage(item.key);
                    mockNavigate(item.key);
                };

                return (
                    <div>
                        <Navigation
                            items={navItems}
                            activeItem={currentPage}
                            onItemClick={handleNavigation}
                            testId="app-navigation"
                        />

                        {currentPage === 'trading' && (
                            <TradingForm
                                {...formData}
                                onSymbolChange={(symbol) => setFormData(prev => ({ ...prev, symbol }))}
                                onQuantityChange={(quantity) => setFormData(prev => ({ ...prev, quantity }))}
                                onPriceChange={(price) => setFormData(prev => ({ ...prev, price }))}
                                onOrderTypeChange={(orderType) => setFormData(prev => ({ ...prev, orderType }))}
                                onSideChange={(side) => setFormData(prev => ({ ...prev, side }))}
                                onSubmit={handleOrderSubmit}
                                testId="trading-form"
                            />
                        )}

                        {currentPage === 'history' && (
                            <Card title="Order History" testId="history-card">
                                {orderHistory.length === 0 ? (
                                    <p>No orders yet</p>
                                ) : (
                                    <div>
                                        {orderHistory.map(order => (
                                            <div key={order.id} data-testid={`order-${order.id}`}>
                                                {order.side.toUpperCase()} {order.quantity} {order.symbol} @ ${order.price}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        )}

                        <div data-testid="order-count">
                            Total Orders: {orderHistory.length}
                        </div>
                    </div>
                );
            };

            render(
                <TestWrapper>
                    <IntegratedApp />
                </TestWrapper>
            );

            // Initial state
            expect(screen.getByText('Total Orders: 0')).toBeInTheDocument();
            expect(screen.getByTestId('trading-form')).toBeInTheDocument();

            // Submit order
            await user.click(screen.getByText('Buy Order'));

            await waitFor(() => {
                expect(mockSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        symbol: 'AAPL',
                        quantity: 100,
                        side: 'buy',
                        status: 'pending'
                    })
                );
            });

            // Should auto-navigate to history
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('history');
                expect(screen.getByTestId('history-card')).toBeInTheDocument();
                expect(screen.getByText('Total Orders: 1')).toBeInTheDocument();
            }, { timeout: 200 });

            // Check order appears in history
            expect(screen.getByText('BUY 100 AAPL @ $150')).toBeInTheDocument();

            // Navigate back to trading
            await user.click(screen.getByText('Trading'));

            await waitFor(() => {
                expect(screen.getByTestId('trading-form')).toBeInTheDocument();
            });

            // Badge should show order count
            const tradingNavItem = screen.getByText('Trading').closest('div');
            expect(tradingNavItem).toHaveTextContent('1'); // Badge count
        });
    });
});