import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../ThemeProvider';
import { Button, Icon, Label, Input } from '../atoms';
import { Widget } from '../organisms';
import { useRealTimeData, usePriceSubscription } from '../providers';
import {
    tradingGlassPresets,
    animationPresets,
    hoverEffects
} from '../../effects';

// Watchlist container
const WatchlistContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

// Search and controls
const WatchlistHeader = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
  align-items: center;
`;

// Table container
const TableContainer = styled.div`
  flex: 1;
  overflow: hidden;
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.color.border.primary};
`;

// Table
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

// Table header
const TableHeader = styled.thead`
  background: ${props => props.theme.color.background.secondary};
  border-bottom: 1px solid ${props => props.theme.color.border.primary};
`;

// Table header cell
const TableHeaderCell = styled.th`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[2]};
  text-align: ${props => props.align || 'left'};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.color.text.primary};
  cursor: ${props => props.sortable ? 'pointer' : 'default'};
  user-select: none;
  position: relative;
  white-space: nowrap;

  &:hover {
    ${props => props.sortable && css`
      background: ${props.theme.color.background.tertiary};
    `}
  }

  ${props => props.sorted && css`
    color: ${props.theme.color.primary[500]};
  `}
`;

// Sort indicator
const SortIndicator = styled.span`
  margin-left: ${props => props.theme.spacing[1]};
  opacity: ${props => props.active ? 1 : 0.3};
`;

// Table body
const TableBody = styled.tbody`
  background: ${props => props.theme.color.background.primary};
`;

// Table row
const TableRow = styled(motion.tr)`
  border-bottom: 1px solid ${props => props.theme.color.border.primary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.color.background.secondary};
  }

  &:last-child {
    border-bottom: none;
  }

  ${props => props.isFlashing && css`
    animation: priceFlash 0.6s ease-out;
    
    @keyframes priceFlash {
      0% { background-color: ${props.flashColor}40; }
      50% { background-color: ${props.flashColor}80; }
      100% { background-color: transparent; }
    }
  `}
`;

// Table cell
const TableCell = styled.td`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[2]};
  text-align: ${props => props.align || 'left'};
  color: ${props => props.theme.color.text.primary};
  font-family: ${props => props.mono ? props.theme.typography.fontFamily.monospace : 'inherit'};
  font-weight: ${props => props.weight || 'normal'};
  white-space: nowrap;

  ${props => props.color && css`
    color: ${props.color};
  `}
`;

// Alert indicator
const AlertIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.theme.color.semantic.warning};
  margin-right: ${props => props.theme.spacing[2]};
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
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

/**
 * WatchlistWidget Component
 * Real-time watchlist with sortable columns and price alerts
 */
const WatchlistWidget = ({
    watchlistId = 'default',
    symbols = [],
    alerts = [],
    onSymbolClick,
    onAddSymbol,
    onRemoveSymbol,
    onSetAlert,
    onRemoveAlert,
    showAlerts = true,
    showVolume = true,
    showMarketCap = false,
    refreshInterval = 1000,
    ...widgetProps
}) => {
    const { theme } = useTheme();
    const { isConnected } = useRealTimeData();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'symbol', direction: 'asc' });
    const [flashingSymbols, setFlashingSymbols] = useState(new Set());
    const [previousPrices, setPreviousPrices] = useState(new Map());

    // Mock price data - in real app this would come from real-time data
    const [priceData, setPriceData] = useState(new Map());

    // Simulate real-time price updates
    useEffect(() => {
        if (!isConnected) return;

        const interval = setInterval(() => {
            const newPriceData = new Map(priceData);
            const newFlashing = new Set();

            symbols.forEach(symbol => {
                const currentPrice = priceData.get(symbol)?.price || Math.random() * 1000 + 100;
                const change = (Math.random() - 0.5) * 10;
                const newPrice = Math.max(0.01, currentPrice + change);
                const changePercent = ((newPrice - currentPrice) / currentPrice) * 100;

                // Check if price changed significantly for flash effect
                const previousPrice = previousPrices.get(symbol);
                if (previousPrice && Math.abs(newPrice - previousPrice) > 0.01) {
                    newFlashing.add(symbol);
                }

                newPriceData.set(symbol, {
                    price: newPrice,
                    change: newPrice - (priceData.get(symbol)?.openPrice || newPrice),
                    changePercent,
                    volume: Math.floor(Math.random() * 10000000),
                    marketCap: newPrice * Math.floor(Math.random() * 1000000000),
                    high: Math.max(newPrice, priceData.get(symbol)?.high || newPrice),
                    low: Math.min(newPrice, priceData.get(symbol)?.low || newPrice),
                    openPrice: priceData.get(symbol)?.openPrice || newPrice
                });
            });

            setPriceData(newPriceData);
            setPreviousPrices(new Map([...priceData].map(([k, v]) => [k, v.price])));

            if (newFlashing.size > 0) {
                setFlashingSymbols(newFlashing);
                setTimeout(() => setFlashingSymbols(new Set()), 600);
            }
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [symbols, priceData, previousPrices, refreshInterval, isConnected]);

    // Filter and sort symbols
    const filteredAndSortedSymbols = useMemo(() => {
        let filtered = symbols.filter(symbol =>
            symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'symbol':
                        aValue = a;
                        bValue = b;
                        break;
                    case 'price':
                        aValue = priceData.get(a)?.price || 0;
                        bValue = priceData.get(b)?.price || 0;
                        break;
                    case 'change':
                        aValue = priceData.get(a)?.change || 0;
                        bValue = priceData.get(b)?.change || 0;
                        break;
                    case 'changePercent':
                        aValue = priceData.get(a)?.changePercent || 0;
                        bValue = priceData.get(b)?.changePercent || 0;
                        break;
                    case 'volume':
                        aValue = priceData.get(a)?.volume || 0;
                        bValue = priceData.get(b)?.volume || 0;
                        break;
                    default:
                        return 0;
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [symbols, searchTerm, sortConfig, priceData]);

    // Handle sort
    const handleSort = useCallback((key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    }, []);

    // Format currency
    const formatCurrency = (value, showSign = false) => {
        if (value === undefined || value === null) return '--';
        const sign = showSign && value > 0 ? '+' : '';
        return `${sign}$${Math.abs(value).toFixed(2)}`;
    };

    // Format percentage
    const formatPercent = (value, showSign = false) => {
        if (value === undefined || value === null) return '--';
        const sign = showSign && value > 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    };

    // Format volume
    const formatVolume = (value) => {
        if (!value) return '--';
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return value.toLocaleString();
    };

    // Check if symbol has active alerts
    const hasAlert = (symbol) => {
        return alerts.some(alert => alert.symbol === symbol && alert.active);
    };

    // Get price color
    const getPriceColor = (change) => {
        if (change > 0) return theme.color.trading.bull;
        if (change < 0) return theme.color.trading.bear;
        return theme.color.text.primary;
    };

    // Widget configuration
    const renderConfig = ({ onClose }) => (
        <div>
            <Label size="md" weight="semibold" style={{ marginBottom: theme.spacing[3] }}>
                Watchlist Settings
            </Label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3] }}>
                <label>
                    <input type="checkbox" defaultChecked={showAlerts} />
                    <Label size="sm" style={{ marginLeft: theme.spacing[2] }}>
                        Show Price Alerts
                    </Label>
                </label>

                <label>
                    <input type="checkbox" defaultChecked={showVolume} />
                    <Label size="sm" style={{ marginLeft: theme.spacing[2] }}>
                        Show Volume
                    </Label>
                </label>

                <label>
                    <input type="checkbox" defaultChecked={showMarketCap} />
                    <Label size="sm" style={{ marginLeft: theme.spacing[2] }}>
                        Show Market Cap
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
            id={`watchlist-${watchlistId}`}
            title="Watchlist"
            icon="eye"
            renderConfig={renderConfig}
            {...widgetProps}
        >
            <WatchlistContainer>
                {/* Header with search and controls */}
                <WatchlistHeader theme={theme}>
                    <Input
                        placeholder="Search symbols..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftIcon={<Icon name="search" />}
                        size="sm"
                        style={{ flex: 1 }}
                    />
                    {onAddSymbol && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onAddSymbol}
                            leftIcon={<Icon name="plus" />}
                        >
                            Add
                        </Button>
                    )}
                </WatchlistHeader>

                {/* Watchlist table */}
                {filteredAndSortedSymbols.length > 0 ? (
                    <TableContainer theme={theme}>
                        <Table>
                            <TableHeader theme={theme}>
                                <tr>
                                    <TableHeaderCell
                                        sortable
                                        sorted={sortConfig.key === 'symbol'}
                                        onClick={() => handleSort('symbol')}
                                        theme={theme}
                                    >
                                        Symbol
                                        <SortIndicator active={sortConfig.key === 'symbol'}>
                                            <Icon
                                                name={sortConfig.direction === 'asc' ? 'chevron-up' : 'chevron-down'}
                                                size="xs"
                                            />
                                        </SortIndicator>
                                    </TableHeaderCell>

                                    <TableHeaderCell
                                        align="right"
                                        sortable
                                        sorted={sortConfig.key === 'price'}
                                        onClick={() => handleSort('price')}
                                        theme={theme}
                                    >
                                        Price
                                        <SortIndicator active={sortConfig.key === 'price'}>
                                            <Icon
                                                name={sortConfig.direction === 'asc' ? 'chevron-up' : 'chevron-down'}
                                                size="xs"
                                            />
                                        </SortIndicator>
                                    </TableHeaderCell>

                                    <TableHeaderCell
                                        align="right"
                                        sortable
                                        sorted={sortConfig.key === 'change'}
                                        onClick={() => handleSort('change')}
                                        theme={theme}
                                    >
                                        Change
                                        <SortIndicator active={sortConfig.key === 'change'}>
                                            <Icon
                                                name={sortConfig.direction === 'asc' ? 'chevron-up' : 'chevron-down'}
                                                size="xs"
                                            />
                                        </SortIndicator>
                                    </TableHeaderCell>

                                    <TableHeaderCell
                                        align="right"
                                        sortable
                                        sorted={sortConfig.key === 'changePercent'}
                                        onClick={() => handleSort('changePercent')}
                                        theme={theme}
                                    >
                                        Change %
                                        <SortIndicator active={sortConfig.key === 'changePercent'}>
                                            <Icon
                                                name={sortConfig.direction === 'asc' ? 'chevron-up' : 'chevron-down'}
                                                size="xs"
                                            />
                                        </SortIndicator>
                                    </TableHeaderCell>

                                    {showVolume && (
                                        <TableHeaderCell
                                            align="right"
                                            sortable
                                            sorted={sortConfig.key === 'volume'}
                                            onClick={() => handleSort('volume')}
                                            theme={theme}
                                        >
                                            Volume
                                            <SortIndicator active={sortConfig.key === 'volume'}>
                                                <Icon
                                                    name={sortConfig.direction === 'asc' ? 'chevron-up' : 'chevron-down'}
                                                    size="xs"
                                                />
                                            </SortIndicator>
                                        </TableHeaderCell>
                                    )}

                                    <TableHeaderCell align="center" theme={theme}>
                                        Actions
                                    </TableHeaderCell>
                                </tr>
                            </TableHeader>

                            <TableBody theme={theme}>
                                <AnimatePresence>
                                    {filteredAndSortedSymbols.map((symbol) => {
                                        const data = priceData.get(symbol) || {};
                                        const isFlashing = flashingSymbols.has(symbol);
                                        const flashColor = data.change > 0 ? theme.color.trading.bull : theme.color.trading.bear;
                                        const hasActiveAlert = hasAlert(symbol);

                                        return (
                                            <TableRow
                                                key={symbol}
                                                isFlashing={isFlashing}
                                                flashColor={flashColor}
                                                onClick={() => onSymbolClick?.(symbol)}
                                                theme={theme}
                                                {...animationPresets.fadeIn}
                                            >
                                                <TableCell theme={theme}>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        {hasActiveAlert && showAlerts && <AlertIndicator theme={theme} />}
                                                        <span style={{ fontWeight: theme.typography.fontWeight.semibold }}>
                                                            {symbol}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell align="right" mono theme={theme}>
                                                    {formatCurrency(data.price)}
                                                </TableCell>

                                                <TableCell
                                                    align="right"
                                                    mono
                                                    color={getPriceColor(data.change)}
                                                    theme={theme}
                                                >
                                                    {formatCurrency(data.change, true)}
                                                </TableCell>

                                                <TableCell
                                                    align="right"
                                                    mono
                                                    color={getPriceColor(data.change)}
                                                    theme={theme}
                                                >
                                                    {formatPercent(data.changePercent, true)}
                                                </TableCell>

                                                {showVolume && (
                                                    <TableCell align="right" mono theme={theme}>
                                                        {formatVolume(data.volume)}
                                                    </TableCell>
                                                )}

                                                <TableCell align="center" theme={theme}>
                                                    <div style={{ display: 'flex', gap: theme.spacing[1], justifyContent: 'center' }}>
                                                        {onSetAlert && (
                                                            <Button
                                                                size="xs"
                                                                variant="ghost"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onSetAlert(symbol);
                                                                }}
                                                                leftIcon={<Icon name="bell" />}
                                                            />
                                                        )}
                                                        {onRemoveSymbol && (
                                                            <Button
                                                                size="xs"
                                                                variant="ghost"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onRemoveSymbol(symbol);
                                                                }}
                                                                leftIcon={<Icon name="x" />}
                                                            />
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <EmptyState theme={theme}>
                        <Icon name="eye" size="xl" style={{ marginBottom: theme.spacing[3] }} />
                        <Label size="md">
                            {searchTerm ? 'No symbols match your search' : 'No symbols in watchlist'}
                        </Label>
                        <Label size="sm" style={{ marginTop: theme.spacing[1] }}>
                            {searchTerm ? 'Try a different search term' : 'Add some symbols to start tracking'}
                        </Label>
                        {onAddSymbol && !searchTerm && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onAddSymbol}
                                style={{ marginTop: theme.spacing[3] }}
                                leftIcon={<Icon name="plus" />}
                            >
                                Add Symbol
                            </Button>
                        )}
                    </EmptyState>
                )}

                {/* Connection Status */}
                {!isConnected && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing[2],
                        padding: theme.spacing[2],
                        background: theme.color.semantic.warning + '20',
                        borderRadius: theme.borderRadius.sm,
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.color.semantic.warning,
                        marginTop: theme.spacing[2]
                    }}>
                        <Icon name="alert" size="sm" />
                        Real-time data disconnected
                    </div>
                )}
            </WatchlistContainer>
        </Widget>
    );
};

export default WatchlistWidget;