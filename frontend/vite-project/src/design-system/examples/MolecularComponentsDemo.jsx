import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
    useTheme,
    Button,
    Input,
    Icon,
    FormGroup,
    Field,
    Section,
    InlineForm,
    TradingForm,
    Navigation,
    NavGroup,
    Breadcrumb,
    Tabs,
    MobileNavigation,
    Card,
    MetricCard,
    InfoCard,
    TradingCard,
    StatsCard,
    animationPresets,
    staggerAnimations,
} from '../index';

// Demo container
const DemoContainer = styled.div`
  padding: ${props => props.theme.spacing[8]};
  max-width: 1400px;
  margin: 0 auto;
  background: ${props => props.theme.color.background.primary};
  min-height: 100vh;
`;

// Section wrapper
const DemoSection = styled.section`
  margin-bottom: ${props => props.theme.spacing[12]};
`;

// Section title
const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.color.text.primary};
  margin-bottom: ${props => props.theme.spacing[6]};
  text-align: center;
`;

// Grid layout
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing[6]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

// Theme toggle
const ThemeToggle = styled.div`
  position: fixed;
  top: ${props => props.theme.spacing[4]};
  right: ${props => props.theme.spacing[4]};
  z-index: ${props => props.theme.zIndex.sticky};
`;

const MolecularComponentsDemo = () => {
    const { theme, isDark, toggleTheme } = useTheme();

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [formErrors, setFormErrors] = useState([]);
    const [formSuccess, setFormSuccess] = useState('');

    // Trading form states
    const [tradingData, setTradingData] = useState({
        symbol: 'AAPL',
        quantity: 100,
        price: 150.25,
        orderType: 'market',
        side: 'buy',
    });

    // Navigation states
    const [activeNavItem, setActiveNavItem] = useState(0);
    const [activeTab, setActiveTab] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Sample data
    const navItems = [
        { key: 'dashboard', label: 'Dashboard', icon: 'candlestick' },
        { key: 'portfolio', label: 'Portfolio', icon: 'trendUp', badge: '3' },
        { key: 'orders', label: 'Orders', icon: 'volume' },
        { key: 'analytics', label: 'Analytics', icon: 'settings' },
        { key: 'settings', label: 'Settings', icon: 'settings', disabled: true },
    ];

    const breadcrumbItems = [
        { key: 'home', label: 'Home', icon: 'candlestick' },
        { key: 'trading', label: 'Trading' },
        { key: 'orders', label: 'Orders' },
        { key: 'current', label: 'Order Details' },
    ];

    const tabItems = [
        { key: 'overview', label: 'Overview', icon: 'candlestick' },
        { key: 'charts', label: 'Charts', icon: 'trendUp', badge: 'New' },
        { key: 'orders', label: 'Orders', icon: 'volume' },
        { key: 'history', label: 'History', icon: 'settings' },
    ];

    const tradingCards = [
        {
            symbol: 'AAPL',
            price: 175.43,
            change: 2.15,
            changePercent: 1.24,
            volume: 45234567,
            high: 176.12,
            low: 173.28,
            marketCap: '2.8T',
        },
        {
            symbol: 'MSFT',
            price: 338.11,
            change: -1.87,
            changePercent: -0.55,
            volume: 23456789,
            high: 340.25,
            low: 337.45,
            marketCap: '2.5T',
        },
        {
            symbol: 'GOOGL',
            price: 138.21,
            change: 0.45,
            changePercent: 0.33,
            volume: 18765432,
            high: 139.12,
            low: 137.89,
            marketCap: '1.7T',
        },
    ];

    const statsData = [
        { label: 'Total Value', value: '$125,430', trend: 'up', change: 2.4 },
        { label: 'Day Change', value: '+$2,340', trend: 'up', change: 1.9 },
        { label: 'Win Rate', value: '68%', trend: 'up', change: 0.5 },
    ];

    // Handlers
    const handleFormSubmit = (event) => {
        event.preventDefault();
        const errors = [];

        if (!formData.name) errors.push('Name is required');
        if (!formData.email) errors.push('Email is required');
        if (!formData.message) errors.push('Message is required');

        if (errors.length > 0) {
            setFormErrors(errors);
            setFormSuccess('');
        } else {
            setFormErrors([]);
            setFormSuccess('Form submitted successfully!');
            setTimeout(() => setFormSuccess(''), 3000);
        }
    };

    const handleTradingSubmit = (data) => {
        console.log('Trading order:', data);
    };

    return (
        <DemoContainer theme={theme}>
            <ThemeToggle theme={theme}>
                <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Icon name={isDark ? 'eye' : 'eyeOff'} />}
                    onClick={toggleTheme}
                >
                    {isDark ? 'Light' : 'Dark'} Mode
                </Button>
            </ThemeToggle>

            <motion.h1
                style={{
                    fontSize: theme.typography.fontSize['4xl'],
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.color.text.primary,
                    textAlign: 'center',
                    marginBottom: theme.spacing[12],
                }}
                {...animationPresets.fadeIn}
            >
                Molecular Components Demo
            </motion.h1>

            {/* Form Components */}
            <DemoSection theme={theme}>
                <SectionTitle theme={theme}>Form Components</SectionTitle>

                <Grid theme={theme}>
                    <motion.div {...animationPresets.slideUp}>
                        <FormGroup
                            title="Contact Form"
                            description="Fill out this form to get in touch"
                            errors={formErrors}
                            successMessage={formSuccess}
                            onSubmit={handleFormSubmit}
                            glass
                        >
                            <Field label="Full Name" required>
                                <Input
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    leftIcon={<Icon name="search" />}
                                />
                            </Field>

                            <Field label="Email Address" required>
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    leftIcon={<Icon name="info" />}
                                />
                            </Field>

                            <Field label="Message" required>
                                <Input
                                    placeholder="Enter your message"
                                    value={formData.message}
                                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                />
                            </Field>

                            <div style={{ display: 'flex', gap: theme.spacing[3], marginTop: theme.spacing[4] }}>
                                <Button type="submit" variant="primary">
                                    Send Message
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setFormData({ name: '', email: '', message: '' });
                                        setFormErrors([]);
                                        setFormSuccess('');
                                    }}
                                >
                                    Clear
                                </Button>
                            </div>
                        </FormGroup>
                    </motion.div>

                    <motion.div {...animationPresets.slideUp} transition={{ delay: 0.1 }}>
                        <InlineForm
                            onSubmit={(e) => {
                                e.preventDefault();
                                console.log('Search submitted');
                            }}
                            submitLabel="Search"
                            submitIcon={<Icon name="search" />}
                        >
                            <Input
                                placeholder="Search stocks..."
                                leftIcon={<Icon name="search" />}
                            />
                        </InlineForm>

                        <div style={{ marginTop: theme.spacing[6] }}>
                            <TradingForm
                                {...tradingData}
                                onSymbolChange={(symbol) => setTradingData(prev => ({ ...prev, symbol }))}
                                onQuantityChange={(quantity) => setTradingData(prev => ({ ...prev, quantity }))}
                                onPriceChange={(price) => setTradingData(prev => ({ ...prev, price }))}
                                onOrderTypeChange={(orderType) => setTradingData(prev => ({ ...prev, orderType }))}
                                onSideChange={(side) => setTradingData(prev => ({ ...prev, side }))}
                                onSubmit={handleTradingSubmit}
                            />
                        </div>
                    </motion.div>
                </Grid>
            </DemoSection>

            {/* Navigation Components */}
            <DemoSection theme={theme}>
                <SectionTitle theme={theme}>Navigation Components</SectionTitle>

                <motion.div {...staggerAnimations.container}>
                    <motion.div {...staggerAnimations.item}>
                        <Navigation
                            items={navItems}
                            activeItem={activeNavItem}
                            onItemClick={(item, index) => setActiveNavItem(index)}
                        />
                    </motion.div>

                    <motion.div {...staggerAnimations.item} style={{ marginTop: theme.spacing[6] }}>
                        <Breadcrumb
                            items={breadcrumbItems}
                            onItemClick={(item, index) => console.log('Breadcrumb clicked:', item, index)}
                        />
                    </motion.div>

                    <motion.div {...staggerAnimations.item} style={{ marginTop: theme.spacing[6] }}>
                        <Tabs
                            items={tabItems}
                            activeTab={activeTab}
                            onTabChange={(item, index) => setActiveTab(index)}
                        />
                    </motion.div>

                    <motion.div {...staggerAnimations.item} style={{ marginTop: theme.spacing[6] }}>
                        <div style={{ display: 'flex', gap: theme.spacing[4], alignItems: 'center' }}>
                            <Button
                                variant="outline"
                                onClick={() => setMobileMenuOpen(true)}
                                leftIcon={<Icon name="menu" />}
                            >
                                Open Mobile Menu
                            </Button>

                            <MobileNavigation
                                items={navItems}
                                isOpen={mobileMenuOpen}
                                onClose={() => setMobileMenuOpen(false)}
                                onItemClick={(item, index) => {
                                    console.log('Mobile nav clicked:', item, index);
                                    setActiveNavItem(index);
                                }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </DemoSection>

            {/* Card Components */}
            <DemoSection theme={theme}>
                <SectionTitle theme={theme}>Card Components</SectionTitle>

                <Grid theme={theme}>
                    <motion.div {...animationPresets.slideUp}>
                        <Card
                            title="Basic Card"
                            subtitle="This is a subtitle"
                            icon="candlestick"
                            actions={
                                <Button variant="outline" size="sm">
                                    Action
                                </Button>
                            }
                            footer={
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <span>Footer left</span>
                                    <span>Footer right</span>
                                </div>
                            }
                        >
                            This is the card content. It can contain any React elements and will be displayed in the main content area of the card.
                        </Card>
                    </motion.div>

                    <motion.div {...animationPresets.slideUp} transition={{ delay: 0.1 }}>
                        <MetricCard
                            title="Portfolio Value"
                            value="$125,430"
                            change={2340}
                            changePercent={1.9}
                            trend="up"
                            icon="trendUp"
                            animated
                        />
                    </motion.div>

                    <motion.div {...animationPresets.slideUp} transition={{ delay: 0.2 }}>
                        <InfoCard
                            type="success"
                            title="Order Executed"
                            message="Your buy order for 100 shares of AAPL has been successfully executed at $175.43."
                            dismissible
                            onDismiss={() => console.log('Info card dismissed')}
                        />
                    </motion.div>
                </Grid>

                <Grid theme={theme}>
                    {tradingCards.map((stock, index) => (
                        <motion.div
                            key={stock.symbol}
                            {...animationPresets.slideUp}
                            transition={{ delay: index * 0.1 }}
                        >
                            <TradingCard
                                {...stock}
                                onClick={() => console.log('Trading card clicked:', stock.symbol)}
                            />
                        </motion.div>
                    ))}
                </Grid>

                <motion.div {...animationPresets.slideUp} transition={{ delay: 0.3 }}>
                    <StatsCard
                        title="Trading Statistics"
                        icon="volume"
                        stats={statsData}
                        actions={
                            <Button variant="outline" size="sm">
                                View Details
                            </Button>
                        }
                    />
                </motion.div>
            </DemoSection>

            {/* Interactive Examples */}
            <DemoSection theme={theme}>
                <SectionTitle theme={theme}>Interactive Examples</SectionTitle>

                <Grid theme={theme}>
                    <motion.div {...animationPresets.slideUp}>
                        <Card
                            title="Card Interactions"
                            subtitle="Hover and click effects"
                            interactive
                            onClick={() => console.log('Interactive card clicked')}
                        >
                            This card has hover and click effects. Try interacting with it to see the animations and feedback.
                        </Card>
                    </motion.div>

                    <motion.div {...animationPresets.slideUp} transition={{ delay: 0.1 }}>
                        <InfoCard
                            type="warning"
                            title="Market Alert"
                            message="High volatility detected in your portfolio. Consider reviewing your positions."
                            actions={
                                <div style={{ display: 'flex', gap: theme.spacing[2] }}>
                                    <Button variant="primary" size="sm">
                                        Review
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        Dismiss
                                    </Button>
                                </div>
                            }
                        />
                    </motion.div>

                    <motion.div {...animationPresets.slideUp} transition={{ delay: 0.2 }}>
                        <Card
                            title="Loading State"
                            variant="outlined"
                        >
                            <MetricCard
                                title="Loading Data"
                                loading
                            />
                        </Card>
                    </motion.div>
                </Grid>
            </DemoSection>
        </DemoContainer>
    );
};

export default MolecularComponentsDemo;