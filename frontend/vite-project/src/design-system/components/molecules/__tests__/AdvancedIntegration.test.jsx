import React, { useState, useEffect, useRef } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../ThemeProvider';
import FormGroup, { Field, TradingForm } from '../FormGroup';
import { Navigation, Breadcrumb, Tabs } from '../Navigation';
import { Card, MetricCard, TradingCard, StatsCard } from '../Card';
import { Button, Input, Icon, Label } from '../../atoms';

// Test wrapper with theme
const TestWrapper = ({ children }) => (
    <ThemeProvider defaultTheme="light">
        {children}
    </ThemeProvider>
);

describe('Advanced Component Integration Tests', () => {
    describe('Real-time Data Integration', () => {
        test('Components handle real-time data updates with proper state synchronization', async () => {
            const mockDataStream = jest.fn();
            const mockPriceUpdate = jest.fn();

            const RealTimeDataApp = () => {
                const [symbols, setSymbols] = useState(['AAPL', 'GOOGL', 'MSFT']);
                const [prices, setPrices] = useState({
                    AAPL: { price: 150.00, change: 2.5, volume: 1000000 },
                    GOOGL: { price: 2800.00, change: -1.2, volume: 500000 },
                    MSFT: { price: 380.00, change: 0.8, volume: 750000 }
                });
                const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
                const intervalRef = useRef();

                // Simulate real-time price updates
                useEffect(() => {
                    intervalRef.current = setInterval(() => {
                        setPrices(prev => {
                            const updated = { ...prev };
                            symbols.forEach(symbol => {
                                const currentPrice = updated[symbol];
                                const newPrice = {
                                    ...currentPrice,
                                    price: currentPrice.price + (Math.random() - 0.5) * 2,
                                    change: currentPrice.change + (Math.random() - 0.5) * 0.5,
                                    volume: currentPrice.volume + Math.floor((Math.random() - 0.5) * 10000)
                                };
                                updated[symbol] = newPrice;
                                mockPriceUpdate(symbol, newPrice);
                            });
                            mockDataStream(updated);
                            return updated;
                        });
                    }, 50);

                    return () => clearInterval(intervalRef.current);
                }, [symbols]);

                const handleSymbolSelect = (symbol) => {
                    setSelectedSymbol(symbol);
                };

                return (
                    <div>
                        {/* Navigation with real-time badges */}
                        <Navigation
                            items={symbols.map(symbol => ({
                                key: symbol,
                                label: symbol,
                                badge: prices[symbol]?.volume ? Math.floor(prices[symbol].volume / 1000) + 'K' : '0',
                                badgeVariant: prices[symbol]?.change > 0 ? 'success' : 'error'
                            }))}
                            activeItem={selectedSymbol}
                            onItemClick={(item) => handleSymbolSelect(item.key)}
                            testId="symbol-navigation"
                        />

                        {/* Real-time metric cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {symbols.map(symbol => (
                                <MetricCard
                                    key={symbol}
                                    title={symbol}
                                    value={`$${prices[symbol]?.price.toFixed(2) || '0.00'}`}
                                    change={`${prices[symbol]?.change > 0 ? '+' : ''}${prices[symbol]?.change.toFixed(2) || '0.00'}%`}
                                    trend={prices[symbol]?.change > 0 ? 'up' : prices[symbol]?.change < 0 ? 'down' : 'neutral'}
                                    animated
                                    testId={`metric-${symbol}`}
                                />
                            ))}
                        </div>

                        {/* Selected symbol details */}
                        <TradingCard
                            symbol={selectedSymbol}
                            price={prices[selectedSymbol]?.price}
                            change={prices[selectedSymbol]?.change}
                            changePercent={prices[selectedSymbol]?.change}
                            volume={prices[selectedSymbol]?.volume}
                            testId="selected-trading-card"
                        />

                        <div data-testid="update-count">
                            Updates: {mockDataStream.mock.calls.length}
                        </div>
                    </div>
                );
            };

            render(
                <TestWrapper>
                    <RealTimeDataApp />
                </TestWrapper>
            );

            // Wait for initial render
            expect(screen.getByTestId('symbol-navigation')).toBeInTheDocument();
            expect(screen.getByTestId('metric-AAPL')).toBeInTheDocument();

            // Wait for real-time updates
            await waitFor(() => {
                expect(mockDataStream).toHaveBeenCalled();
                expect(mockPriceUpdate).toHaveBeenCalled();
            }, { timeout: 100 });

            // Test symbol selection updates all related components
            const user = userEvent.setup();
            await user.click(screen.getByText('GOOGL'));

            await waitFor(() => {
                expect(screen.getByTestId('selected-trading-card')).toHaveTextContent('GOOGL');
            });

            // Verify continuous updates
            const initialUpdateCount = mockDataStream.mock.calls.length;
            await waitFor(() => {
                expect(mockDataStream.mock.calls.length).toBeGreaterThan(initialUpdateCount);
            }, { timeout: 100 });
        });

        test('Form validation integrates with real-time price data', async () => {
            const user = userEvent.setup();
            const mockSubmit = jest.fn();
            const mockPriceValidation = jest.fn();

            const PriceValidatedForm = () => {
                const [currentPrice, setCurrentPrice] = useState(150.00);
                const [formData, setFormData] = useState({
                    symbol: 'AAPL',
                    quantity: 100,
                    price: 150.00,
                    orderType: 'limit',
                    side: 'buy'
                });
                const [errors, setErrors] = useState([]);

                // Simulate price updates
                useEffect(() => {
                    const interval = setInterval(() => {
                        setCurrentPrice(prev => {
                            const newPrice = prev + (Math.random() - 0.5) * 2;

                            // Validate price against current market price
                            if (formData.orderType === 'limit') {
                                const priceDiff = Math.abs(newPrice - formData.price);
                                const percentDiff = (priceDiff / newPrice) * 100;

                                if (percentDiff > 5) {
                                    mockPriceValidation('warning', percentDiff);
                                    setErrors(prev => {
                                        const filtered = prev.filter(e => !e.includes('price'));
                                        return [...filtered, `Price is ${percentDiff.toFixed(1)}% away from market price`];
                                    });
                                } else {
                                    setErrors(prev => prev.filter(e => !e.includes('price')));
                                }
                            }

                            return newPrice;
                        });
                    }, 100);

                    return () => clearInterval(interval);
                }, [formData.price, formData.orderType]);

                const handleSubmit = (data) => {
                    const validationErrors = [];

                    if (!data.symbol) validationErrors.push('Symbol is required');
                    if (!data.quantity || data.quantity <= 0) validationErrors.push('Quantity must be positive');

                    if (data.orderType === 'limit') {
                        if (!data.price || data.price <= 0) {
                            validationErrors.push('Price must be positive for limit orders');
                        }

                        const priceDiff = Math.abs(currentPrice - data.price);
                        const percentDiff = (priceDiff / currentPrice) * 100;

                        if (percentDiff > 10) {
                            validationErrors.push('Price is too far from market price (>10%)');
                        }
                    }

                    setErrors(validationErrors);

                    if (validationErrors.length === 0) {
                        mockSubmit({ ...data, marketPrice: currentPrice });
                    }
                };

                return (
                    <div>
                        <Card title="Market Price" testId="market-price-card">
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
                            testId="price-validated-form"
                        />

                        <div data-testid="validation-count">
                            Validations: {mockPriceValidation.mock.calls.length}
                        </div>
                    </div>
                );
            };

            render(
                <TestWrapper>
                    <PriceValidatedForm />
                </TestWrapper>
            );

            // Wait for price updates and validation
            await waitFor(() => {
                expect(mockPriceValidation).toHaveBeenCalled();
            }, { timeout: 200 });

            // Set a price far from market price
            const priceInput = screen.getByDisplayValue('150');
            await user.clear(priceInput);
            await user.type(priceInput, '200');

            // Wait for validation error
            await waitFor(() => {
                expect(screen.getByText(/Price is.*away from market price/)).toBeInTheDocument();
            }, { timeout: 200 });

            // Try to submit with validation error
            await user.click(screen.getByText('Buy Order'));
            expect(mockSubmit).not.toHaveBeenCalled();

            // Fix price to be closer to market
            await user.clear(priceInput);
            await user.type(priceInput, '151');

            // Wait for validation to clear
            await waitFor(() => {
                expect(screen.queryByText(/Price is.*away from market price/)).not.toBeInTheDocument();
            }, { timeout: 200 });

            // Submit should now work
            await user.click(screen.getByText('Buy Order'));

            await waitFor(() => {
                expect(mockSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        symbol: 'AAPL',
                        quantity: 100,
                        price: 151,
                        marketPrice: expect.any(Number)
                    })
                );
            });
        });
    });

    describe('Complex State Management', () => {
        test('Multi-step form with navigation and data persistence', async () => {
            const user = userEvent.setup();
            const mockStepChange = jest.fn();
            const mockDataSave = jest.fn();
            const mockSubmit = jest.fn();

            const MultiStepForm = () => {
                const [currentStep, setCurrentStep] = useState(0);
                const [formData, setFormData] = useState({
                    personal: { name: '', email: '' },
                    trading: { experience: '', riskTolerance: '' },
                    account: { accountType: '', initialDeposit: '' }
                });
                const [errors, setErrors] = useState({});
                const [completedSteps, setCompletedSteps] = useState(new Set());

                const steps = [
                    { key: 'personal', label: 'Personal Info', icon: 'user' },
                    { key: 'trading', label: 'Trading Profile', icon: 'trending-up' },
                    { key: 'account', label: 'Account Setup', icon: 'settings' },
                    { key: 'review', label: 'Review', icon: 'check' }
                ];

                const breadcrumbs = steps.slice(0, currentStep + 1).map((step, index) => ({
                    key: step.key,
                    label: step.label,
                    icon: step.icon,
                    active: index === currentStep
                }));

                const validateStep = (stepIndex) => {
                    const stepErrors = {};

                    switch (stepIndex) {
                        case 0: // Personal
                            if (!formData.personal.name) stepErrors.name = 'Name is required';
                            if (!formData.personal.email) stepErrors.email = 'Email is required';
                            break;
                        case 1: // Trading
                            if (!formData.trading.experience) stepErrors.experience = 'Experience is required';
                            if (!formData.trading.riskTolerance) stepErrors.riskTolerance = 'Risk tolerance is required';
                            break;
                        case 2: // Account
                            if (!formData.account.accountType) stepErrors.accountType = 'Account type is required';
                            if (!formData.account.initialDeposit) stepErrors.initialDeposit = 'Initial deposit is required';
                            break;
                    }

                    setErrors(prev => ({ ...prev, [stepIndex]: stepErrors }));
                    return Object.keys(stepErrors).length === 0;
                };

                const handleNext = () => {
                    if (validateStep(currentStep)) {
                        setCompletedSteps(prev => new Set([...prev, currentStep]));
                        mockDataSave(currentStep, formData);

                        if (currentStep < steps.length - 1) {
                            setCurrentStep(currentStep + 1);
                            mockStepChange(currentStep + 1);
                        }
                    }
                };

                const handlePrevious = () => {
                    if (currentStep > 0) {
                        setCurrentStep(currentStep - 1);
                        mockStepChange(currentStep - 1);
                    }
                };

                const handleStepClick = (stepIndex) => {
                    if (completedSteps.has(stepIndex) || stepIndex <= currentStep) {
                        setCurrentStep(stepIndex);
                        mockStepChange(stepIndex);
                    }
                };

                const handleSubmit = () => {
                    if (completedSteps.size === 3) {
                        mockSubmit(formData);
                    }
                };

                const updateFormData = (section, field, value) => {
                    setFormData(prev => ({
                        ...prev,
                        [section]: {
                            ...prev[section],
                            [field]: value
                        }
                    }));
                };

                return (
                    <div>
                        {/* Step Navigation */}
                        <Navigation
                            items={steps.map((step, index) => ({
                                key: step.key,
                                label: step.label,
                                icon: step.icon,
                                disabled: !completedSteps.has(index) && index > currentStep,
                                badge: completedSteps.has(index) ? '✓' : undefined
                            }))}
                            activeItem={steps[currentStep].key}
                            onItemClick={(item) => {
                                const stepIndex = steps.findIndex(s => s.key === item.key);
                                handleStepClick(stepIndex);
                            }}
                            testId="step-navigation"
                        />

                        {/* Breadcrumb */}
                        <Breadcrumb
                            items={breadcrumbs}
                            testId="step-breadcrumb"
                        />

                        {/* Step Content */}
                        <Card title={steps[currentStep].label} testId={`step-${currentStep}`}>
                            {currentStep === 0 && (
                                <FormGroup errors={Object.values(errors[0] || {})}>
                                    <Field label="Name" required error={errors[0]?.name}>
                                        <Input
                                            value={formData.personal.name}
                                            onChange={(e) => updateFormData('personal', 'name', e.target.value)}
                                            testId="name-input"
                                        />
                                    </Field>
                                    <Field label="Email" required error={errors[0]?.email}>
                                        <Input
                                            type="email"
                                            value={formData.personal.email}
                                            onChange={(e) => updateFormData('personal', 'email', e.target.value)}
                                            testId="email-input"
                                        />
                                    </Field>
                                </FormGroup>
                            )}

                            {currentStep === 1 && (
                                <FormGroup errors={Object.values(errors[1] || {})}>
                                    <Field label="Trading Experience" required error={errors[1]?.experience}>
                                        <select
                                            value={formData.trading.experience}
                                            onChange={(e) => updateFormData('trading', 'experience', e.target.value)}
                                            data-testid="experience-select"
                                        >
                                            <option value="">Select experience</option>
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                    </Field>
                                    <Field label="Risk Tolerance" required error={errors[1]?.riskTolerance}>
                                        <select
                                            value={formData.trading.riskTolerance}
                                            onChange={(e) => updateFormData('trading', 'riskTolerance', e.target.value)}
                                            data-testid="risk-select"
                                        >
                                            <option value="">Select risk tolerance</option>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </Field>
                                </FormGroup>
                            )}

                            {currentStep === 2 && (
                                <FormGroup errors={Object.values(errors[2] || {})}>
                                    <Field label="Account Type" required error={errors[2]?.accountType}>
                                        <select
                                            value={formData.account.accountType}
                                            onChange={(e) => updateFormData('account', 'accountType', e.target.value)}
                                            data-testid="account-type-select"
                                        >
                                            <option value="">Select account type</option>
                                            <option value="individual">Individual</option>
                                            <option value="joint">Joint</option>
                                            <option value="corporate">Corporate</option>
                                        </select>
                                    </Field>
                                    <Field label="Initial Deposit" required error={errors[2]?.initialDeposit}>
                                        <Input
                                            type="number"
                                            value={formData.account.initialDeposit}
                                            onChange={(e) => updateFormData('account', 'initialDeposit', e.target.value)}
                                            testId="deposit-input"
                                        />
                                    </Field>
                                </FormGroup>
                            )}

                            {currentStep === 3 && (
                                <div>
                                    <h3>Review Your Information</h3>
                                    <StatsCard
                                        title="Application Summary"
                                        stats={[
                                            { label: 'Name', value: formData.personal.name },
                                            { label: 'Email', value: formData.personal.email },
                                            { label: 'Experience', value: formData.trading.experience },
                                            { label: 'Risk Tolerance', value: formData.trading.riskTolerance },
                                            { label: 'Account Type', value: formData.account.accountType },
                                            { label: 'Initial Deposit', value: `$${formData.account.initialDeposit}` }
                                        ]}
                                        testId="review-stats"
                                    />
                                </div>
                            )}
                        </Card>

                        {/* Navigation Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={currentStep === 0}
                                testId="previous-button"
                            >
                                Previous
                            </Button>

                            {currentStep < steps.length - 1 ? (
                                <Button
                                    variant="primary"
                                    onClick={handleNext}
                                    testId="next-button"
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={completedSteps.size < 3}
                                    testId="submit-button"
                                >
                                    Submit Application
                                </Button>
                            )}
                        </div>

                        <div data-testid="completed-steps">
                            Completed: {completedSteps.size}/3
                        </div>
                    </div>
                );
            };

            render(
                <TestWrapper>
                    <MultiStepForm />
                </TestWrapper>
            );

            // Test initial state
            expect(screen.getByText('Personal Info')).toBeInTheDocument();
            expect(screen.getByText('Completed: 0/3')).toBeInTheDocument();

            // Fill first step
            await user.type(screen.getByTestId('name-input'), 'John Doe');
            await user.type(screen.getByTestId('email-input'), 'john@example.com');

            await user.click(screen.getByTestId('next-button'));

            await waitFor(() => {
                expect(mockStepChange).toHaveBeenCalledWith(1);
                expect(mockDataSave).toHaveBeenCalledWith(0, expect.objectContaining({
                    personal: { name: 'John Doe', email: 'john@example.com' }
                }));
                expect(screen.getByText('Completed: 1/3')).toBeInTheDocument();
            });

            // Fill second step
            await user.selectOptions(screen.getByTestId('experience-select'), 'intermediate');
            await user.selectOptions(screen.getByTestId('risk-select'), 'medium');

            await user.click(screen.getByTestId('next-button'));

            await waitFor(() => {
                expect(mockStepChange).toHaveBeenCalledWith(2);
                expect(screen.getByText('Completed: 2/3')).toBeInTheDocument();
            });

            // Fill third step
            await user.selectOptions(screen.getByTestId('account-type-select'), 'individual');
            await user.type(screen.getByTestId('deposit-input'), '10000');

            await user.click(screen.getByTestId('next-button'));

            await waitFor(() => {
                expect(mockStepChange).toHaveBeenCalledWith(3);
                expect(screen.getByText('Completed: 3/3')).toBeInTheDocument();
                expect(screen.getByTestId('review-stats')).toBeInTheDocument();
            });

            // Test navigation back to previous step
            await user.click(screen.getByText('Personal Info'));

            await waitFor(() => {
                expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
            });

            // Navigate back to review
            await user.click(screen.getByText('Review'));

            await waitFor(() => {
                expect(screen.getByTestId('review-stats')).toBeInTheDocument();
            });

            // Submit application
            await user.click(screen.getByTestId('submit-button'));

            await waitFor(() => {
                expect(mockSubmit).toHaveBeenCalledWith({
                    personal: { name: 'John Doe', email: 'john@example.com' },
                    trading: { experience: 'intermediate', riskTolerance: 'medium' },
                    account: { accountType: 'individual', initialDeposit: '10000' }
                });
            });
        });
    });
});