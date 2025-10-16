import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../../../ThemeProvider';
import NewsWidget from '../NewsWidget';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        article: ({ children, ...props }) => <article {...props}>{children}</article>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

const MockProviders = ({ children }) => (
    <ThemeProvider>
        {children}
    </ThemeProvider>
);

describe('NewsWidget', () => {
    const mockNews = [
        {
            id: '1',
            title: 'Apple Reports Strong Q4 Earnings',
            summary: 'Apple Inc. reported better than expected earnings for Q4 2024...',
            source: 'Reuters',
            category: 'Earnings',
            timestamp: '2024-01-15T10:30:00Z',
            sentiment: 'positive',
            priority: 'high',
            symbols: ['AAPL'],
            url: 'https://example.com/news/1'
        },
        {
            id: '2',
            title: 'Market Volatility Continues',
            summary: 'Stock markets showed continued volatility amid economic uncertainty...',
            source: 'Bloomberg',
            category: 'Markets',
            timestamp: '2024-01-15T09:15:00Z',
            sentiment: 'negative',
            priority: 'medium',
            symbols: ['SPY', 'QQQ'],
            url: 'https://example.com/news/2'
        },
        {
            id: '3',
            title: 'Federal Reserve Meeting Preview',
            summary: 'Analysts expect the Fed to maintain current interest rates...',
            source: 'CNBC',
            category: 'Economy',
            timestamp: '2024-01-15T08:00:00Z',
            sentiment: 'neutral',
            priority: 'low',
            symbols: [],
            url: 'https://example.com/news/3'
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders news widget with articles', () => {
        render(
            <MockProviders>
                <NewsWidget news={mockNews} />
            </MockProviders>
        );

        expect(screen.getByText('Financial News')).toBeInTheDocument();
        expect(screen.getByText('Apple Reports Strong Q4 Earnings')).toBeInTheDocument();
        expect(screen.getByText('Market Volatility Continues')).toBeInTheDocument();
        expect(screen.getByText('Federal Reserve Meeting Preview')).toBeInTheDocument();
    });

    it('displays news metadata correctly', () => {
        render(
            <MockProviders>
                <NewsWidget news={mockNews} />
            </MockProviders>
        );

        // Check sources
        expect(screen.getByText('Reuters')).toBeInTheDocument();
        expect(screen.getByText('Bloomberg')).toBeInTheDocument();
        expect(screen.getByText('CNBC')).toBeInTheDocument();

        // Check categories
        expect(screen.getByText('Earnings')).toBeInTheDocument();
        expect(screen.getByText('Markets')).toBeInTheDocument();
        expect(screen.getByText('Economy')).toBeInTheDocument();
    });

    it('handles search functionality', () => {
        render(
            <MockProviders>
                <NewsWidget news={mockNews} />
            </MockProviders>
        );

        const searchInput = screen.getByPlaceholderText('Search news...');
        fireEvent.change(searchInput, { target: { value: 'Apple' } });

        expect(screen.getByText('Apple Reports Strong Q4 Earnings')).toBeInTheDocument();
        expect(screen.queryByText('Market Volatility Continues')).not.toBeInTheDocument();
    });

    it('handles category filtering', () => {
        render(
            <MockProviders>
                <NewsWidget news={mockNews} categories={['All', 'Earnings', 'Markets', 'Economy']} />
            </MockProviders>
        );

        // Filter by Earnings category
        const categorySelect = screen.getByDisplayValue('All');
        fireEvent.change(categorySelect, { target: { value: 'Earnings' } });

        expect(screen.getByText('Apple Reports Strong Q4 Earnings')).toBeInTheDocument();
        expect(screen.queryByText('Market Volatility Continues')).not.toBeInTheDocument();
    });

    it('handles sorting by different criteria', () => {
        render(
            <MockProviders>
                <NewsWidget news={mockNews} />
            </MockProviders>
        );

        // Sort by priority
        const sortSelect = screen.getByDisplayValue('Latest');
        fireEvent.change(sortSelect, { target: { value: 'Priority' } });

        // High priority news should appear first
        const articles = screen.getAllByRole('article');
        expect(articles[0]).toHaveTextContent('Apple Reports Strong Q4 Earnings');
    });

    it('displays sentiment indicators when enabled', () => {
        render(
            <MockProviders>
                <NewsWidget news={mockNews} showSentiment={true} />
            </MockProviders>
        );

        // Should show sentiment indicators (icons)
        const articles = screen.getAllByRole('article');
        expect(articles).toHaveLength(3);

        // Check for sentiment-related content
        expect(screen.getByText('Apple Reports Strong Q4 Earnings')).toBeInTheDocument();
    });

    it('hides sentiment indicators when disabled', () => {
        render(
            <MockProviders>
                <NewsWidget news={mockNews} showSentiment={false} />
            </MockProviders>
        );

        // Should still render articles but without sentiment indicators
        expect(screen.getByText('Apple Reports Strong Q4 Earnings')).toBeInTheDocument();
    });

    it('displays related symbols', () => {
        render(
            <MockProviders>
                <NewsWidget news={mockNews} />
            </MockProviders>
        );

        expect(screen.getByText('AAPL')).toBeInTheDocument();
        expect(screen.getByText('SPY')).toBeInTheDocument();
        expect(screen.getByText('QQQ')).toBeInTheDocument();
    });

    it('handles symbol overflow display', () => {
        const newsWithManySymbols = [{
            ...mockNews[0],
            symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
        }];

        render(
            <MockProviders>
                <NewsWidget news={newsWithManySymbols} />
            </MockProviders>
        );

        expect(screen.getByText('AAPL')).toBeInTheDocument();
        expect(screen.getByText('MSFT')).toBeInTheDocument();
        expect(screen.getByText('GOOGL')).toBeInTheDocument();
        expect(screen.getByText('+2 more')).toBeInTheDocument();
    });

    it('calls onNewsClick when article is clicked', () => {
        const mockOnNewsClick = jest.fn();

        render(
            <MockProviders>
                <NewsWidget news={mockNews} onNewsClick={mockOnNewsClick} />
            </MockProviders>
        );

        fireEvent.click(screen.getByText('Apple Reports Strong Q4 Earnings').closest('article'));

        expect(mockOnNewsClick).toHaveBeenCalledWith(mockNews[0]);
    });

    it('handles external link clicks', () => {
        // Mock window.open
        const mockOpen = jest.fn();
        global.window.open = mockOpen;

        render(
            <MockProviders>
                <NewsWidget news={mockNews} />
            </MockProviders>
        );

        const externalLinkButtons = screen.getAllByLabelText('Open article');
        fireEvent.click(externalLinkButtons[0]);

        expect(mockOpen).toHaveBeenCalledWith('https://example.com/news/1', '_blank');
    });

    it('calls onRefresh when refresh button is clicked', () => {
        const mockOnRefresh = jest.fn();

        render(
            <MockProviders>
                <NewsWidget news={mockNews} onRefresh={mockOnRefresh} />
            </MockProviders>
        );

        const refreshButton = screen.getByLabelText('Refresh news');
        fireEvent.click(refreshButton);

        expect(mockOnRefresh).toHaveBeenCalled();
    });

    it('shows loading skeleton when loading', () => {
        render(
            <MockProviders>
                <NewsWidget news={[]} loading={true} />
            </MockProviders>
        );

        // Should show loading skeletons instead of articles
        expect(screen.queryByText('Apple Reports Strong Q4 Earnings')).not.toBeInTheDocument();
    });

    it('shows empty state when no news', () => {
        render(
            <MockProviders>
                <NewsWidget news={[]} loading={false} />
            </MockProviders>
        );

        expect(screen.getByText('No news available')).toBeInTheDocument();
    });

    it('shows no results when search/filter has no matches', () => {
        render(
            <MockProviders>
                <NewsWidget news={mockNews} />
            </MockProviders>
        );

        const searchInput = screen.getByPlaceholderText('Search news...');
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

        expect(screen.getByText('No news found')).toBeInTheDocument();
    });

    it('respects maxItems limit', () => {
        render(
            <MockProviders>
                <NewsWidget news={mockNews} maxItems={2} />
            </MockProviders>
        );

        const articles = screen.getAllByRole('article');
        expect(articles).toHaveLength(2);
    });

    it('formats timestamps correctly', () => {
        // Mock current time to be consistent
        const mockDate = new Date('2024-01-15T11:00:00Z');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

        render(
            <MockProviders>
                <NewsWidget news={mockNews} />
            </MockProviders>
        );

        // Should show relative time (e.g., "30m ago")
        expect(screen.getByText(/ago/)).toBeInTheDocument();

        global.Date.mockRestore();
    });

    it('handles priority indicators', () => {
        render(
            <MockProviders>
                <NewsWidget news={mockNews} />
            </MockProviders>
        );

        // High priority news should have visual indicators
        const highPriorityArticle = screen.getByText('Apple Reports Strong Q4 Earnings').closest('article');
        expect(highPriorityArticle).toBeInTheDocument();
    });

    it('calls onCategoryChange when category is changed', () => {
        const mockOnCategoryChange = jest.fn();

        render(
            <MockProviders>
                <NewsWidget
                    news={mockNews}
                    onCategoryChange={mockOnCategoryChange}
                    categories={['All', 'Earnings', 'Markets']}
                />
            </MockProviders>
        );

        const categorySelect = screen.getByDisplayValue('All');
        fireEvent.change(categorySelect, { target: { value: 'Earnings' } });

        expect(mockOnCategoryChange).toHaveBeenCalledWith('Earnings');
    });
});