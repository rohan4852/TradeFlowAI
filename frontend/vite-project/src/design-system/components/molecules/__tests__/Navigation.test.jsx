import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import { Navigation, NavGroup, Breadcrumb, Tabs } from '../Navigation';

const renderWithTheme = (component) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
};

describe('Navigation', () => {
    const mockItems = [
        { key: 'dashboard', label: 'Dashboard', icon: 'home' },
        { key: 'trading', label: 'Trading', icon: 'trending-up' },
        { key: 'portfolio', label: 'Portfolio', icon: 'briefcase' },
    ];

    it('renders navigation items', () => {
        renderWithTheme(
            <Navigation items={mockItems} />
        );

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Trading')).toBeInTheDocument();
        expect(screen.getByText('Portfolio')).toBeInTheDocument();
    });

    it('handles item clicks', () => {
        const handleItemClick = jest.fn();
        renderWithTheme(
            <Navigation
                items={mockItems}
                onItemClick={handleItemClick}
            />
        );

        fireEvent.click(screen.getByText('Trading'));
        expect(handleItemClick).toHaveBeenCalledWith('trading', mockItems[1]);
    });

    it('shows active item', () => {
        renderWithTheme(
            <Navigation
                items={mockItems}
                activeItem="trading"
            />
        );

        const tradingItem = screen.getByText('Trading').closest('button');
        expect(tradingItem).toHaveAttribute('aria-current', 'page');
    });

    it('supports different variants', () => {
        const { rerender } = renderWithTheme(
            <Navigation items={mockItems} variant="horizontal" />
        );

        expect(screen.getByRole('navigation')).toBeInTheDocument();

        rerender(
            <ThemeProvider>
                <Navigation items={mockItems} variant="vertical" />
            </ThemeProvider>
        );

        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('is accessible', () => {
        renderWithTheme(
            <Navigation
                items={mockItems}
                aria-label="Main navigation"
            />
        );

        expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
    });
});

describe('Breadcrumb', () => {
    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Trading', href: '/trading' },
        { label: 'BTC/USD' }
    ];

    it('renders breadcrumb items', () => {
        renderWithTheme(
            <Breadcrumb items={breadcrumbItems} />
        );

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Trading')).toBeInTheDocument();
        expect(screen.getByText('BTC/USD')).toBeInTheDocument();
    });

    it('shows current page correctly', () => {
        renderWithTheme(
            <Breadcrumb items={breadcrumbItems} />
        );

        const currentPage = screen.getByText('BTC/USD');
        expect(currentPage).toHaveAttribute('aria-current', 'page');
    });
});

describe('Tabs', () => {
    const tabItems = [
        { key: 'chart', label: 'Chart' },
        { key: 'orderbook', label: 'Order Book' },
        { key: 'trades', label: 'Recent Trades' }
    ];

    it('renders tab items', () => {
        renderWithTheme(
            <Tabs items={tabItems} />
        );

        expect(screen.getByText('Chart')).toBeInTheDocument();
        expect(screen.getByText('Order Book')).toBeInTheDocument();
        expect(screen.getByText('Recent Trades')).toBeInTheDocument();
    });

    it('handles tab selection', () => {
        const handleTabChange = jest.fn();
        renderWithTheme(
            <Tabs
                items={tabItems}
                onTabChange={handleTabChange}
            />
        );

        fireEvent.click(screen.getByText('Order Book'));
        expect(handleTabChange).toHaveBeenCalledWith('orderbook');
    });

    it('shows active tab', () => {
        renderWithTheme(
            <Tabs
                items={tabItems}
                activeTab="orderbook"
            />
        );

        const activeTab = screen.getByText('Order Book');
        expect(activeTab).toHaveAttribute('aria-selected', 'true');
    });
});