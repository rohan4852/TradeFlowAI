import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../ThemeProvider';
import { useRealTimeData } from '../../providers/RealTimeDataProvider';
import Widget from '../Widget';
import { Button, Icon, Label, Input } from '../../atoms';
import { FormGroup } from '../../molecules';
import {
    createGlassmorphism,
    tradingGlassPresets,
    animationPresets,
    hoverEffects
} from '../../../effects';

// News container
const NewsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

// News header with filters
const NewsHeader = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
  align-items: center;
  flex-wrap: wrap;
`;

// Category filters
const CategoryFilters = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
  flex-wrap: wrap;
`;

// Category filter button
const CategoryFilter = styled(Button)`
  ${props => props.active && css`
    background: ${props.theme.color.primary[500]};
    color: ${props.theme.color.primary[50]};
  `}
`;

// News list
const NewsList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

// News item
const NewsItem = styled(motion.div)`
  ${props => tradingGlassPresets.card(props.theme)}
  padding: ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.borderRadius.md};
  border-left: 4px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.priority === 'high' && css`
    border-left-color: ${props.theme.color.error[500]};
  `}
  ${props => props.priority === 'medium' && css`
    border-left-color: ${props.theme.color.warning[500]};
  `}
  ${props => props.priority === 'low' && css`
    border-left-color: ${props.theme.color.info[500]};
  `}

  &:hover {
    ${props => hoverEffects.lift(props.theme)}
  }
`;

// News header
const NewsItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing[2]};
  gap: ${props => props.theme.spacing[2]};
`;

// News title
const NewsTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.color.text.primary};
  margin: 0;
  line-height: 1.4;
  flex: 1;
`;

// News meta
const NewsMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  flex-shrink: 0;
`;

// Sentiment badge
const SentimentBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  
  ${props => props.sentiment === 'positive' && css`
    background: ${props.theme.color.success[100]};
    color: ${props.theme.color.success[700]};
  `}
  ${props => props.sentiment === 'negative' && css`
    background: ${props.theme.color.error[100]};
    color: ${props.theme.color.error[700]};
  `}
  ${props => props.sentiment === 'neutral' && css`
    background: ${props.theme.color.neutral[100]};
    color: ${props.theme.color.neutral[700]};
  `}
`;

// Category badge
const CategoryBadge = styled.span`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  background: ${props => props.theme.color.background.secondary};
  color: ${props => props.theme.color.text.secondary};
`;

// News summary
const NewsSummary = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.color.text.secondary};
  margin: 0 0 ${props => props.theme.spacing[2]} 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

// News footer
const NewsFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.color.text.tertiary};
`;

// Related symbols
const RelatedSymbols = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
  flex-wrap: wrap;
`;

// Symbol tag
const SymbolTag = styled.span`
  padding: ${props => props.theme.spacing[0.5]} ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  background: ${props => props.theme.color.primary[100]};
  color: ${props => props.theme.color.primary[700]};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.color.primary[200]};
  }
`;

// Empty state
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${props => props.theme.color.text.secondary};
  text-align: center;
`;

// Loading state
const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${props => props.theme.color.text.secondary};
`;

/**
 * NewsWidget Component
 * Financial news feed with sentiment analysis and relevance scoring
 */
const NewsWidget = ({
    id = 'news-widget',
    title = 'Financial News',
    news = [],
    loading = false,
    categories = ['All', 'Markets', 'Earnings', 'Economy', 'Crypto'],
    realTime = true,
    showSentiment = true,
    showCategories = true,
    maxItems = 20,
    refreshInterval = 30000,
    onNewsClick,
    onRefresh,
    onSymbolClick,
    onCategoryFilter,
    ...props
}) => {
    const { theme } = useTheme();
    const { isConnected } = useRealTimeData();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('timestamp');
    const [lastRefresh, setLastRefresh] = useState(Date.now());

    // Auto-refresh news
    useEffect(() => {
        if (!realTime || !onRefresh) return;

        const interval = setInterval(() => {
            onRefresh();
            setLastRefresh(Date.now());
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [realTime, onRefresh, refreshInterval]);

    // Filter and sort news
    const filteredAndSortedNews = useMemo(() => {
        let filtered = news;

        // Filter by category
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(item =>
                item.category === selectedCategory
            );
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(term) ||
                item.summary.toLowerCase().includes(term) ||
                item.symbols?.some(symbol => symbol.toLowerCase().includes(term))
            );
        }

        // Sort news
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'timestamp':
                    return new Date(b.timestamp) - new Date(a.timestamp);
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'sentiment':
                    const sentimentOrder = { positive: 3, neutral: 2, negative: 1 };
                    return sentimentOrder[b.sentiment] - sentimentOrder[a.sentiment];
                default:
                    return 0;
            }
        });

        // Limit items
        return filtered.slice(0, maxItems);
    }, [news, selectedCategory, searchTerm, sortBy, maxItems]);

    // Handle category filter
    const handleCategoryFilter = useCallback((category) => {
        setSelectedCategory(category);
        onCategoryFilter?.(category);
    }, [onCategoryFilter]);

    // Handle news click
    const handleNewsClick = useCallback((article) => {
        onNewsClick?.(article);
    }, [onNewsClick]);

    // Handle symbol click
    const handleSymbolClick = useCallback((symbol, event) => {
        event.stopPropagation();
        onSymbolClick?.(symbol);
    }, [onSymbolClick]);

    // Format timestamp
    const formatTimestamp = useCallback((timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }, []);

    // Get sentiment icon
    const getSentimentIcon = useCallback((sentiment) => {
        switch (sentiment) {
            case 'positive': return 'trending-up';
            case 'negative': return 'trending-down';
            case 'neutral': return 'minus';
            default: return 'help-circle';
        }
    }, []);

    // Widget configuration
    const renderConfig = ({ onClose }) => (
        <div>
            <Label size="md" weight="semibold" style={{ marginBottom: theme.spacing[3] }}>
                News Settings
            </Label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3] }}>
                <FormGroup label="Max Items">
                    <Input
                        type="number"
                        min="5"
                        max="100"
                        defaultValue={maxItems}
                        size="sm"
                    />
                </FormGroup>

                <FormGroup label="Refresh Interval (seconds)">
                    <Input
                        type="number"
                        min="10"
                        max="300"
                        defaultValue={refreshInterval / 1000}
                        size="sm"
                    />
                </FormGroup>

                <label>
                    <input type="checkbox" defaultChecked={realTime} />
                    <Label size="sm" style={{ marginLeft: theme.spacing[2] }}>
                        Auto-refresh News
                    </Label>
                </label>

                <label>
                    <input type="checkbox" defaultChecked={showSentiment} />
                    <Label size="sm" style={{ marginLeft: theme.spacing[2] }}>
                        Show Sentiment Analysis
                    </Label>
                </label>

                <label>
                    <input type="checkbox" defaultChecked={showCategories} />
                    <Label size="sm" style={{ marginLeft: theme.spacing[2] }}>
                        Show Category Filters
                    </Label>
                </label>

                <div style={{ display: 'flex', gap: theme.spacing[2], marginTop: theme.spacing[4] }}>
                    <Button size="sm" variant="primary" onClick={onClose}>
                        Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <Widget
            id={id}
            title={title}
            icon="newspaper"
            renderConfig={renderConfig}
            {...props}
        >
            <NewsContainer>
                {/* News Header */}
                <NewsHeader theme={theme}>
                    <Input
                        placeholder="Search news..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftIcon={<Icon name="search" />}
                        size="sm"
                        style={{ flex: 1, minWidth: '150px' }}
                    />

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                            borderRadius: theme.borderRadius.sm,
                            border: `1px solid ${theme.color.border.primary}`,
                            background: theme.color.background.primary,
                            color: theme.color.text.primary,
                            fontSize: theme.typography.fontSize.sm
                        }}
                    >
                        <option value="timestamp">Latest</option>
                        <option value="priority">Priority</option>
                        <option value="sentiment">Sentiment</option>
                    </select>

                    {onRefresh && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                onRefresh();
                                setLastRefresh(Date.now());
                            }}
                            leftIcon={<Icon name="refresh-cw" />}
                            disabled={loading}
                        />
                    )}
                </NewsHeader>

                {/* Category Filters */}
                {showCategories && (
                    <CategoryFilters theme={theme}>
                        {categories.map(category => (
                            <CategoryFilter
                                key={category}
                                size="xs"
                                variant="ghost"
                                active={selectedCategory === category}
                                onClick={() => handleCategoryFilter(category)}
                                theme={theme}
                            >
                                {category}
                            </CategoryFilter>
                        ))}
                    </CategoryFilters>
                )}

                {/* News List */}
                <NewsList>
                    {loading ? (
                        <LoadingState theme={theme}>
                            <Icon name="loader" size="lg" spin />
                            <Label size="sm" style={{ marginLeft: theme.spacing[2] }}>
                                Loading news...
                            </Label>
                        </LoadingState>
                    ) : filteredAndSortedNews.length > 0 ? (
                        <AnimatePresence>
                            {filteredAndSortedNews.map((article, index) => (
                                <NewsItem
                                    key={article.id}
                                    priority={article.priority}
                                    onClick={() => handleNewsClick(article)}
                                    theme={theme}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ ...animationPresets.normal, delay: index * 0.05 }}
                                >
                                    <NewsItemHeader theme={theme}>
                                        <NewsTitle theme={theme}>{article.title}</NewsTitle>
                                        <NewsMeta theme={theme}>
                                            {showSentiment && (
                                                <SentimentBadge sentiment={article.sentiment} theme={theme}>
                                                    <Icon name={getSentimentIcon(article.sentiment)} size="xs" />
                                                    {article.sentiment}
                                                </SentimentBadge>
                                            )}
                                            <CategoryBadge theme={theme}>
                                                {article.category}
                                            </CategoryBadge>
                                        </NewsMeta>
                                    </NewsItemHeader>

                                    <NewsSummary theme={theme}>
                                        {article.summary}
                                    </NewsSummary>

                                    <NewsFooter theme={theme}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                                            <span>{article.source}</span>
                                            <span>•</span>
                                            <span>{formatTimestamp(article.timestamp)}</span>
                                        </div>

                                        {article.symbols && article.symbols.length > 0 && (
                                            <RelatedSymbols theme={theme}>
                                                {article.symbols.slice(0, 3).map(symbol => (
                                                    <SymbolTag
                                                        key={symbol}
                                                        onClick={(e) => handleSymbolClick(symbol, e)}
                                                        theme={theme}
                                                    >
                                                        {symbol}
                                                    </SymbolTag>
                                                ))}
                                                {article.symbols.length > 3 && (
                                                    <span style={{ color: theme.color.text.tertiary }}>
                                                        +{article.symbols.length - 3} more
                                                    </span>
                                                )}
                                            </RelatedSymbols>
                                        )}
                                    </NewsFooter>
                                </NewsItem>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <EmptyState theme={theme}>
                            <Icon name="newspaper" size="xl" style={{ marginBottom: theme.spacing[3] }} />
                            <Label size="md">
                                {searchTerm || selectedCategory !== 'All'
                                    ? 'No news matches your filters'
                                    : 'No news available'
                                }
                            </Label>
                            <Label size="sm" style={{ marginTop: theme.spacing[1] }}>
                                {searchTerm || selectedCategory !== 'All'
                                    ? 'Try adjusting your search or filters'
                                    : 'News will appear here when available'
                                }
                            </Label>
                            {onRefresh && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onRefresh}
                                    style={{ marginTop: theme.spacing[3] }}
                                    leftIcon={<Icon name="refresh-cw" />}
                                >
                                    Refresh News
                                </Button>
                            )}
                        </EmptyState>
                    )}
                </NewsList>

                {/* Connection Status */}
                {realTime && !isConnected && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing[2],
                        padding: theme.spacing[2],
                        background: theme.color.warning[50],
                        borderRadius: theme.borderRadius.sm,
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.color.warning[700],
                        marginTop: theme.spacing[2]
                    }}>
                        <Icon name="wifi-off" size="sm" />
                        Real-time news updates disconnected
                    </div>
                )}

                {/* Last refresh indicator */}
                {realTime && (
                    <div style={{
                        textAlign: 'center',
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.color.text.tertiary,
                        marginTop: theme.spacing[2]
                    }}>
                        Last updated: {formatTimestamp(lastRefresh)}
                    </div>
                )}
            </NewsContainer>
        </Widget>
    );
};

export default NewsWidget;