import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../ThemeProvider';
import { Button, Icon, Input } from '../../atoms';
import { glassmorphism, animations } from '../../../index';

const FiltersContainer = styled.div`
  ${({ theme }) => glassmorphism(theme, 'light')};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const FiltersHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const FiltersTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.color.text.primary};
  margin: 0;
`;

const ToggleButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing[1]};
`;

const FiltersContent = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const FilterLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const FilterButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
  flex-wrap: wrap;
`;

const FilterButton = styled(Button)`
  ${({ active, theme }) => active && `
    background: ${theme.color.primary[500]};
    color: ${theme.color.text.inverse};
    border-color: ${theme.color.primary[500]};
  `}
`;

const RangeInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const RangeInput = styled(Input)`
  flex: 1;
`;

const RangeSeparator = styled.span`
  color: ${({ theme }) => theme.color.text.tertiary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const SearchInput = styled(Input)`
  width: 100%;
`;

const ActiveFiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[4]};
  padding-top: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.color.border.primary};
`;

const ActiveFilterTag = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.color.primary[100]};
  color: ${({ theme }) => theme.color.primary[700]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const RemoveFilterButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.color.primary[600]};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  
  &:hover {
    background: ${({ theme }) => theme.color.primary[200]};
  }
`;

const ClearAllButton = styled(Button)`
  margin-left: auto;
`;

export const PredictionFilters = ({
    filters,
    onFiltersChange,
    predictions = [],
    collapsed = false,
    onToggleCollapsed,
    className,
    ...props
}) => {
    const theme = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(collapsed);

    const {
        status = 'all',
        confidence = { min: 0, max: 100 },
        accuracy = { min: 0, max: 100 },
        timeframe = 'all',
        symbol = '',
        type = 'all',
        dateRange = 'all'
    } = filters;

    const handleFilterChange = (key, value) => {
        onFiltersChange({
            ...filters,
            [key]: value
        });
    };

    const handleRangeChange = (key, field, value) => {
        handleFilterChange(key, {
            ...filters[key],
            [field]: parseInt(value) || 0
        });
    };

    const getActiveFilters = () => {
        const active = [];

        if (status !== 'all') {
            active.push({ key: 'status', label: `Status: ${status}`, value: status });
        }

        if (confidence.min > 0 || confidence.max < 100) {
            active.push({
                key: 'confidence',
                label: `Confidence: ${confidence.min}%-${confidence.max}%`,
                value: confidence
            });
        }

        if (accuracy.min > 0 || accuracy.max < 100) {
            active.push({
                key: 'accuracy',
                label: `Accuracy: ${accuracy.min}%-${accuracy.max}%`,
                value: accuracy
            });
        }

        if (timeframe !== 'all') {
            active.push({ key: 'timeframe', label: `Timeframe: ${timeframe}`, value: timeframe });
        }

        if (symbol) {
            active.push({ key: 'symbol', label: `Symbol: ${symbol}`, value: symbol });
        }

        if (type !== 'all') {
            active.push({ key: 'type', label: `Type: ${type}`, value: type });
        }

        if (dateRange !== 'all') {
            active.push({ key: 'dateRange', label: `Date: ${dateRange}`, value: dateRange });
        }

        return active;
    };

    const removeFilter = (key) => {
        switch (key) {
            case 'status':
            case 'timeframe':
            case 'type':
            case 'dateRange':
                handleFilterChange(key, 'all');
                break;
            case 'symbol':
                handleFilterChange(key, '');
                break;
            case 'confidence':
            case 'accuracy':
                handleFilterChange(key, { min: 0, max: 100 });
                break;
        }
    };

    const clearAllFilters = () => {
        onFiltersChange({
            status: 'all',
            confidence: { min: 0, max: 100 },
            accuracy: { min: 0, max: 100 },
            timeframe: 'all',
            symbol: '',
            type: 'all',
            dateRange: 'all'
        });
    };

    const activeFilters = getActiveFilters();

    const toggleCollapsed = () => {
        const newCollapsed = !isCollapsed;
        setIsCollapsed(newCollapsed);
        onToggleCollapsed?.(newCollapsed);
    };

    return (
        <FiltersContainer className={className} {...props}>
            <FiltersHeader>
                <FiltersTitle>Filters</FiltersTitle>
                <ToggleButton
                    variant="ghost"
                    size="sm"
                    onClick={toggleCollapsed}
                >
                    <Icon name={isCollapsed ? 'chevron-down' : 'chevron-up'} size="sm" />
                </ToggleButton>
            </FiltersHeader>

            <AnimatePresence>
                {!isCollapsed && (
                    <FiltersContent
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={animations.slideDown}
                    >
                        <FilterGroup>
                            <FilterLabel>Status</FilterLabel>
                            <FilterButtonGroup>
                                {['all', 'active', 'correct', 'incorrect', 'pending', 'expired'].map(option => (
                                    <FilterButton
                                        key={option}
                                        variant="outline"
                                        size="sm"
                                        active={status === option}
                                        onClick={() => handleFilterChange('status', option)}
                                    >
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </FilterButton>
                                ))}
                            </FilterButtonGroup>
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Confidence Range</FilterLabel>
                            <RangeInputGroup>
                                <RangeInput
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={confidence.min}
                                    onChange={(e) => handleRangeChange('confidence', 'min', e.target.value)}
                                    placeholder="Min"
                                />
                                <RangeSeparator>to</RangeSeparator>
                                <RangeInput
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={confidence.max}
                                    onChange={(e) => handleRangeChange('confidence', 'max', e.target.value)}
                                    placeholder="Max"
                                />
                            </RangeInputGroup>
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Accuracy Range</FilterLabel>
                            <RangeInputGroup>
                                <RangeInput
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={accuracy.min}
                                    onChange={(e) => handleRangeChange('accuracy', 'min', e.target.value)}
                                    placeholder="Min"
                                />
                                <RangeSeparator>to</RangeSeparator>
                                <RangeInput
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={accuracy.max}
                                    onChange={(e) => handleRangeChange('accuracy', 'max', e.target.value)}
                                    placeholder="Max"
                                />
                            </RangeInputGroup>
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Timeframe</FilterLabel>
                            <FilterButtonGroup>
                                {['all', '1h', '4h', '1d', '1w', '1m'].map(option => (
                                    <FilterButton
                                        key={option}
                                        variant="outline"
                                        size="sm"
                                        active={timeframe === option}
                                        onClick={() => handleFilterChange('timeframe', option)}
                                    >
                                        {option === 'all' ? 'All' : option}
                                    </FilterButton>
                                ))}
                            </FilterButtonGroup>
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Symbol</FilterLabel>
                            <SearchInput
                                placeholder="Search symbols..."
                                value={symbol}
                                onChange={(e) => handleFilterChange('symbol', e.target.value)}
                            />
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Prediction Type</FilterLabel>
                            <FilterButtonGroup>
                                {['all', 'price_target', 'trend_reversal', 'volatility', 'support_resistance'].map(option => (
                                    <FilterButton
                                        key={option}
                                        variant="outline"
                                        size="sm"
                                        active={type === option}
                                        onClick={() => handleFilterChange('type', option)}
                                    >
                                        {option === 'all' ? 'All' : option.replace('_', ' ')}
                                    </FilterButton>
                                ))}
                            </FilterButtonGroup>
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Date Range</FilterLabel>
                            <FilterButtonGroup>
                                {['all', 'today', 'week', 'month', 'quarter'].map(option => (
                                    <FilterButton
                                        key={option}
                                        variant="outline"
                                        size="sm"
                                        active={dateRange === option}
                                        onClick={() => handleFilterChange('dateRange', option)}
                                    >
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </FilterButton>
                                ))}
                            </FilterButtonGroup>
                        </FilterGroup>
                    </FiltersContent>
                )}
            </AnimatePresence>

            {activeFilters.length > 0 && (
                <ActiveFiltersContainer>
                    <AnimatePresence>
                        {activeFilters.map(filter => (
                            <ActiveFilterTag
                                key={filter.key}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                variants={animations.scale}
                            >
                                <span>{filter.label}</span>
                                <RemoveFilterButton onClick={() => removeFilter(filter.key)}>
                                    <Icon name="x" size="xs" />
                                </RemoveFilterButton>
                            </ActiveFilterTag>
                        ))}
                    </AnimatePresence>

                    <ClearAllButton
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                    >
                        Clear All
                    </ClearAllButton>
                </ActiveFiltersContainer>
            )}
        </FiltersContainer>
    );
};

export default PredictionFilters;