import React, { forwardRef, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../ThemeProvider';
import { Button, Icon, Label } from '../atoms';
import { useOrderbookSubscription } from '../providers';
import {
  createGlassmorphism,
  tradingGlassPresets,
  animationPresets,
  shouldReduceMotion
} from '../../effects';

// OrderBook container
const OrderBookContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: ${props => props.height || '600px'};
  ${props => tradingGlassPresets.widget(props.theme)}
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  background: ${props => props.theme.color.background.primary};
  display: flex;
  flex-direction: column;
`;

// Header section
const OrderBookHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.color.border.primary};
  background: ${props => props.theme.color.background.secondary};
`;

// Title
const OrderBookTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.color.text.primary};
  margin: 0;
`;

// Controls section
const OrderBookControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

// Aggregation selector
const AggregationSelector = styled.select`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.color.border.primary};
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.theme.color.background.primary};
  color: ${props => props.theme.color.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.color.primary[500]};
    box-shadow: 0 0 0 2px ${props => props.theme.color.primary[500]}20;
  }
`;

// Main content area
const OrderBookContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

// Spread indicator with enhanced dynamic color coding
const SpreadIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  background: ${props => {
    const spreadPercent = props.spreadPercent || 0;
    // Dynamic color coding based on spread percentage
    if (spreadPercent > 0.2) return `linear-gradient(90deg, ${props.theme.color.trading.bear}30, ${props.theme.color.trading.bear}20)`;
    if (spreadPercent > 0.1) return `linear-gradient(90deg, ${props.theme.color.warning[400]}30, ${props.theme.color.warning[400]}20)`;
    if (spreadPercent > 0.05) return `linear-gradient(90deg, ${props.theme.color.trading.spread}30, ${props.theme.color.trading.spread}20)`;
    return `linear-gradient(90deg, ${props.theme.color.trading.bull}30, ${props.theme.color.trading.bull}20)`;
  }};
  border-top: 1px solid ${props => props.theme.color.border.primary};
  border-bottom: 1px solid ${props => props.theme.color.border.primary};
  font-family: ${props => props.theme.typography.fontFamily.monospace};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  position: relative;
  overflow: hidden;
  
  // Enhanced spread change animation with color transitions
  ${props => props.isChanging && `
    animation: spreadChangeEnhanced 0.8s ease-out;
  `}
  
  // Pulsing effect for tight spreads
  ${props => props.spreadPercent < 0.02 && `
    animation: tightSpreadPulse 2s ease-in-out infinite;
  `}
  
  // Wide spread warning effect
  ${props => props.spreadPercent > 0.2 && `
    animation: wideSpreadWarning 1.5s ease-in-out infinite;
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s ease-out;
  }
  
  ${props => props.isChanging && `
    &::before {
      left: 100%;
    }
  `}
  
  @keyframes spreadChangeEnhanced {
    0% { 
      transform: scale(1);
      filter: brightness(1);
    }
    25% { 
      transform: scale(1.02);
      filter: brightness(1.2);
      box-shadow: 0 0 15px ${props => props.theme.color.primary[500]}40;
    }
    50% { 
      transform: scale(1.05);
      filter: brightness(1.4);
      box-shadow: 0 0 25px ${props => props.theme.color.primary[500]}60;
    }
    75% { 
      transform: scale(1.02);
      filter: brightness(1.2);
      box-shadow: 0 0 15px ${props => props.theme.color.primary[500]}40;
    }
    100% { 
      transform: scale(1);
      filter: brightness(1);
      box-shadow: none;
    }
  }
  
  @keyframes tightSpreadPulse {
    0%, 100% { 
      box-shadow: 0 0 10px ${props => props.theme.color.trading.bull}30;
      border-color: ${props => props.theme.color.trading.bull}40;
    }
    50% { 
      box-shadow: 0 0 20px ${props => props.theme.color.trading.bull}50;
      border-color: ${props => props.theme.color.trading.bull}60;
    }
  }
  
  @keyframes wideSpreadWarning {
    0%, 100% { 
      box-shadow: 0 0 10px ${props => props.theme.color.trading.bear}30;
      border-color: ${props => props.theme.color.trading.bear}40;
    }
    50% { 
      box-shadow: 0 0 20px ${props => props.theme.color.trading.bear}50;
      border-color: ${props => props.theme.color.trading.bear}60;
    }
  }
`;

// Spread value
const SpreadValue = styled.span`
  color: ${props => props.theme.color.text.primary};
  margin-right: ${props => props.theme.spacing[2]};
`;

// Spread percentage
const SpreadPercentage = styled.span`
  color: ${props => props.theme.color.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
`;

// Order book sides container
const OrderBookSides = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

// Order book side (asks/bids)
const OrderBookSide = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

// Virtual scrolling container
const VirtualScrollContainer = styled.div`
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.color.background.secondary};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.color.border.primary};
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.color.border.secondary};
  }
`;

// Enhanced order book row with advanced animations
const OrderBookRow = styled(motion.div)`
  display: flex;
  align-items: center;
  height: 24px;
  padding: 0 ${props => props.theme.spacing[3]};
  position: relative;
  cursor: pointer;
  font-family: ${props => props.theme.typography.fontFamily.monospace};
  font-size: ${props => props.theme.typography.fontSize.xs};
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeOut};
  overflow: hidden;
  
  &:hover {
    background: ${props => props.theme.color.background.secondary}50;
    transform: translateX(2px);
    box-shadow: inset 3px 0 0 ${props => props.side === 'bid'
    ? props.theme.color.trading.bull
    : props.theme.color.trading.bear}60;
  }
  
  // Enhanced price flash animation with directional colors
  ${props => props.isFlashing && `
    animation: ${props.priceDirection === 'up' ? 'priceFlashUp' : 'priceFlashDown'} 0.8s ease-out;
  `}
  
  // Enhanced new order fade-in with slide effect
  ${props => props.isNew && `
    animation: newOrderFadeInEnhanced 1s ease-out;
  `}
  
  // Enhanced size change animation with scaling and color shift
  ${props => props.sizeChanged && `
    animation: sizeChangeEnhanced 0.6s ease-out;
  `}
  
  // Large order highlighting
  ${props => props.isLargeOrder && `
    animation: largeOrderHighlight 2s ease-in-out infinite;
  `}
  
  // Order removal animation
  ${props => props.isRemoving && `
    animation: orderRemoval 0.5s ease-in forwards;
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      ${props => props.side === 'bid'
    ? props.theme.color.trading.bull + '20'
    : props.theme.color.trading.bear + '20'}, 
      transparent
    );
    transition: left 0.4s ease-out;
    pointer-events: none;
  }
  
  ${props => props.isFlashing && `
    &::before {
      left: 100%;
    }
  `}
  
  @keyframes priceFlashUp {
    0% { 
      background-color: transparent;
      transform: scale(1);
    }
    25% { 
      background-color: ${props => props.theme.color.trading.bull}30;
      transform: scale(1.01);
      box-shadow: 0 0 10px ${props => props.theme.color.trading.bull}40;
    }
    50% { 
      background-color: ${props => props.theme.color.trading.bull}50;
      transform: scale(1.02);
      box-shadow: 0 0 15px ${props => props.theme.color.trading.bull}60;
    }
    75% { 
      background-color: ${props => props.theme.color.trading.bull}20;
      transform: scale(1.01);
      box-shadow: 0 0 8px ${props => props.theme.color.trading.bull}30;
    }
    100% { 
      background-color: transparent;
      transform: scale(1);
      box-shadow: none;
    }
  }
  
  @keyframes priceFlashDown {
    0% { 
      background-color: transparent;
      transform: scale(1);
    }
    25% { 
      background-color: ${props => props.theme.color.trading.bear}30;
      transform: scale(1.01);
      box-shadow: 0 0 10px ${props => props.theme.color.trading.bear}40;
    }
    50% { 
      background-color: ${props => props.theme.color.trading.bear}50;
      transform: scale(1.02);
      box-shadow: 0 0 15px ${props => props.theme.color.trading.bear}60;
    }
    75% { 
      background-color: ${props => props.theme.color.trading.bear}20;
      transform: scale(1.01);
      box-shadow: 0 0 8px ${props => props.theme.color.trading.bear}30;
    }
    100% { 
      background-color: transparent;
      transform: scale(1);
      box-shadow: none;
    }
  }
  
  @keyframes newOrderFadeInEnhanced {
    0% { 
      opacity: 0; 
      transform: translateY(-15px) translateX(-10px) scale(0.9);
      background-color: ${props => props.side === 'bid'
    ? props.theme.color.trading.bull + '60'
    : props.theme.color.trading.bear + '60'
  };
      box-shadow: 0 0 20px ${props => props.side === 'bid'
    ? props.theme.color.trading.bull + '40'
    : props.theme.color.trading.bear + '40'
  };
    }
    30% {
      opacity: 0.7;
      transform: translateY(-5px) translateX(-3px) scale(0.95);
      background-color: ${props => props.side === 'bid'
    ? props.theme.color.trading.bull + '40'
    : props.theme.color.trading.bear + '40'
  };
    }
    60% {
      opacity: 0.9;
      transform: translateY(2px) translateX(1px) scale(1.02);
      background-color: ${props => props.side === 'bid'
    ? props.theme.color.trading.bull + '20'
    : props.theme.color.trading.bear + '20'
  };
    }
    100% { 
      opacity: 1; 
      transform: translateY(0) translateX(0) scale(1);
      background-color: transparent;
      box-shadow: none;
    }
  }
  
  @keyframes sizeChangeEnhanced {
    0% { 
      transform: scale(1);
      background-color: transparent;
    }
    20% { 
      transform: scale(1.03);
      background-color: ${props => props.theme.color.trading.volume}20;
    }
    40% { 
      transform: scale(1.05);
      background-color: ${props => props.theme.color.trading.volume}30;
      box-shadow: inset 0 0 10px ${props => props.theme.color.trading.volume}20;
    }
    60% { 
      transform: scale(1.03);
      background-color: ${props => props.theme.color.trading.volume}20;
    }
    100% { 
      transform: scale(1);
      background-color: transparent;
      box-shadow: none;
    }
  }
  
  @keyframes largeOrderHighlight {
    0%, 100% { 
      box-shadow: inset 0 0 0 1px ${props => props.side === 'bid'
    ? props.theme.color.trading.bull + '30'
    : props.theme.color.trading.bear + '30'
  };
    }
    50% { 
      box-shadow: inset 0 0 0 2px ${props => props.side === 'bid'
    ? props.theme.color.trading.bull + '60'
    : props.theme.color.trading.bear + '60'
  };
    }
  }
  
  @keyframes orderRemoval {
    0% { 
      opacity: 1;
      transform: scale(1) translateX(0);
    }
    50% { 
      opacity: 0.5;
      transform: scale(0.95) translateX(-10px);
      background-color: ${props => props.theme.color.neutral[400]}30;
    }
    100% { 
      opacity: 0;
      transform: scale(0.9) translateX(-20px);
      height: 0;
      padding: 0;
      margin: 0;
    }
  }
`;

// Enhanced depth bar with advanced visual effects
const DepthBar = styled(motion.div)`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  background: ${props => {
    const baseColor = props.side === 'bid'
      ? props.theme.color.trading.bull
      : props.theme.color.trading.bear;

    // Enhanced gradient with multiple stops for better depth visualization
    return `linear-gradient(to left, 
      ${baseColor}40 0%, 
      ${baseColor}30 20%, 
      ${baseColor}20 50%, 
      ${baseColor}10 80%, 
      transparent 100%
    )`;
  }};
  width: ${props => props.width}%;
  transition: all ${props => props.theme.animation.duration.normal} ${props => props.theme.animation.easing.easeOut};
  border-radius: ${props => props.theme.borderRadius.xs};
  overflow: hidden;
  
  // Enhanced pulsing for significant depth changes
  ${props => props.isPulsing && `
    animation: depthPulseEnhanced 1.2s ease-in-out infinite;
  `}
  
  // Large depth highlighting
  ${props => props.isLargeDepth && `
    animation: largeDepthGlow 2s ease-in-out infinite;
  `}
  
  // Depth change animation
  ${props => props.isChanging && `
    animation: depthChange 0.8s ease-out;
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 3px;
    height: 100%;
    background: ${props => {
    const baseColor = props.side === 'bid'
      ? props.theme.color.trading.bull
      : props.theme.color.trading.bear;
    return `linear-gradient(to bottom, ${baseColor}, ${baseColor}80, ${baseColor})`;
  }};
    opacity: 0.7;
    transition: all ${props => props.theme.animation.duration.fast} ease;
    border-radius: 1px;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
    transform: translateX(-100%);
    transition: transform 0.6s ease-out;
  }
  
  &:hover {
    &::before {
      opacity: 1;
      width: 4px;
      box-shadow: 0 0 8px ${props => props.side === 'bid'
    ? props.theme.color.trading.bull + '60'
    : props.theme.color.trading.bear + '60'
  };
    }
    
    &::after {
      transform: translateX(100%);
    }
  }
  
  ${props => props.isChanging && `
    &::after {
      transform: translateX(100%);
    }
  `}
  
  @keyframes depthPulseEnhanced {
    0%, 100% { 
      opacity: 0.4;
      transform: scaleX(1);
    }
    25% { 
      opacity: 0.6;
      transform: scaleX(1.02);
    }
    50% { 
      opacity: 0.8;
      transform: scaleX(1.05);
    }
    75% { 
      opacity: 0.6;
      transform: scaleX(1.02);
    }
  }
  
  @keyframes largeDepthGlow {
    0%, 100% { 
      box-shadow: inset 0 0 10px ${props => props.side === 'bid'
    ? props.theme.color.trading.bull + '20'
    : props.theme.color.trading.bear + '20'
  };
    }
    50% { 
      box-shadow: inset 0 0 20px ${props => props.side === 'bid'
    ? props.theme.color.trading.bull + '40'
    : props.theme.color.trading.bear + '40'
  };
    }
  }
  
  @keyframes depthChange {
    0% { 
      transform: scaleX(1) scaleY(1);
      filter: brightness(1);
    }
    30% { 
      transform: scaleX(1.1) scaleY(1.05);
      filter: brightness(1.3);
    }
    60% { 
      transform: scaleX(1.05) scaleY(1.02);
      filter: brightness(1.2);
    }
    100% { 
      transform: scaleX(1) scaleY(1);
      filter: brightness(1);
    }
  }
`;

// Price column
const PriceColumn = styled.div`
  flex: 1;
  text-align: left;
  color: ${props => props.side === 'bid'
    ? props.theme.color.trading.bull
    : props.theme.color.trading.bear
  };
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

// Size column
const SizeColumn = styled.div`
  flex: 1;
  text-align: right;
  color: ${props => props.theme.color.text.primary};
`;

// Total column
const TotalColumn = styled.div`
  flex: 1;
  text-align: right;
  color: ${props => props.theme.color.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
`;

// Loading overlay
const LoadingOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  ${props => createGlassmorphism(props.theme, { intensity: 'strong' })}
  z-index: ${props => props.theme.zIndex.overlay};
`;

// Enhanced virtual scrolling hook with performance optimizations
const useVirtualScrolling = (items, containerHeight, itemHeight = 24, overscan = 5) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  // Validate inputs
  const safeItems = Array.isArray(items) ? items : [];
  const safeContainerHeight = Math.max(0, containerHeight || 0);
  const safeItemHeight = Math.max(1, itemHeight);

  const visibleCount = Math.ceil(safeContainerHeight / safeItemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / safeItemHeight) - overscan);
  const endIndex = Math.min(startIndex + visibleCount + (overscan * 2), safeItems.length);

  const visibleItems = useMemo(() => {
    if (safeItems.length === 0) return [];
    return safeItems.slice(startIndex, endIndex);
  }, [safeItems, startIndex, endIndex]);

  const totalHeight = safeItems.length * safeItemHeight;
  const offsetY = startIndex * safeItemHeight;

  // Optimized scroll handler with debouncing
  const handleScroll = useCallback((scrollTop) => {
    setScrollTop(scrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling to false after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop: handleScroll,
    startIndex,
    endIndex,
    isScrolling
  };
};

// Enhanced order aggregation utility with dynamic grouping
const aggregateOrders = (orders, tickSize, groupingMode = 'price') => {
  if (!Array.isArray(orders) || orders.length === 0) return [];
  if (typeof tickSize !== 'number' || tickSize <= 0) return orders;

  const aggregated = new Map();

  orders.forEach(order => {
    // Validate order data
    if (!order ||
      typeof order.price !== 'number' ||
      typeof order.size !== 'number' ||
      isNaN(order.price) ||
      isNaN(order.size) ||
      order.price <= 0 ||
      order.size <= 0) {
      return;
    }

    let aggregatedPrice;
    let key;

    switch (groupingMode) {
      case 'price':
        aggregatedPrice = Math.floor(order.price / tickSize) * tickSize;
        key = aggregatedPrice.toFixed(8);
        break;
      case 'size':
        // Group by size ranges for better visualization
        const sizeRange = Math.floor(order.size / tickSize) * tickSize;
        aggregatedPrice = order.price;
        key = `${aggregatedPrice.toFixed(8)}-${sizeRange}`;
        break;
      case 'time':
        // Group by time windows (useful for high-frequency data)
        const timeWindow = Math.floor((order.timestamp || Date.now()) / (tickSize * 1000)) * (tickSize * 1000);
        aggregatedPrice = order.price;
        key = `${aggregatedPrice.toFixed(8)}-${timeWindow}`;
        break;
      default:
        aggregatedPrice = Math.floor(order.price / tickSize) * tickSize;
        key = aggregatedPrice.toFixed(8);
    }

    if (aggregated.has(key)) {
      const existing = aggregated.get(key);
      existing.size += order.size;
      existing.total += order.size * order.price;
      existing.count += 1;
      existing.avgPrice = existing.total / existing.size;
      // Keep the most recent timestamp
      existing.timestamp = Math.max(existing.timestamp, order.timestamp || Date.now());
    } else {
      aggregated.set(key, {
        price: aggregatedPrice,
        size: order.size,
        total: order.size * order.price,
        avgPrice: order.price,
        count: 1,
        timestamp: order.timestamp || Date.now(),
        originalOrders: groupingMode !== 'price' ? [order] : undefined
      });
    }
  });

  return Array.from(aggregated.values()).sort((a, b) => b.price - a.price);
};

// Calculate cumulative totals
const calculateCumulativeTotals = (orders) => {
  let cumulativeTotal = 0;
  return orders.map(order => {
    cumulativeTotal += order.size;
    return {
      ...order,
      cumulativeTotal
    };
  });
};

// OrderBook component
const OrderBook = forwardRef(({
  asks = [],
  bids = [],
  spread,
  symbol = 'BTC/USD',
  realTime = false,
  precision = 2,
  aggregationOptions = [0.01, 0.1, 1, 10],
  defaultAggregation = 0.01,
  maxDepth = 25,
  height = '600px',
  showDepthBars = true,
  showCumulativeTotal = true,
  onOrderClick,
  onRealTimeUpdate,
  loading = false,
  className,
  testId,
  ...props
}, forwardedRef) => {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const asksRef = useRef(null);
  const bidsRef = useRef(null);

  // Real-time orderbook subscription (optional)
  const { orderbook: realTimeOrderbook } = useOrderbookSubscription(
    symbol,
    realTime && !!symbol
  );

  // Merge real-time data with static data
  const currentAsks = realTime && realTimeOrderbook ? realTimeOrderbook.asks || asks : asks;
  const currentBids = realTime && realTimeOrderbook ? realTimeOrderbook.bids || bids : bids;

  // Track previous data for animation triggers
  const prevAsksRef = useRef(currentAsks);
  const prevBidsRef = useRef(currentBids);
  const prevSpreadRef = useRef(null);
  const [flashingOrders, setFlashingOrders] = useState(new Set());
  const [newOrders, setNewOrders] = useState(new Set());
  const [sizeChangedOrders, setSizeChangedOrders] = useState(new Set());
  const [priceDirections, setPriceDirections] = useState(new Map());
  const [largeOrders, setLargeOrders] = useState(new Set());
  const [removingOrders, setRemovingOrders] = useState(new Set());
  const [spreadChanging, setSpreadChanging] = useState(false);

  // Notify parent of real-time updates
  useEffect(() => {
    if (realTime && realTimeOrderbook && onRealTimeUpdate) {
      onRealTimeUpdate(realTimeOrderbook);
    }
  }, [realTime, realTimeOrderbook, onRealTimeUpdate]);

  // Enhanced change detection with advanced animations
  useEffect(() => {
    if (!realTime || shouldReduceMotion()) return;

    const detectChanges = (current, previous, type) => {
      const changedOrders = new Set();
      const newOrdersSet = new Set();
      const sizeChangedSet = new Set();
      const directionsMap = new Map();
      const largeOrdersSet = new Set();
      const removedOrdersSet = new Set();

      // Early return if no data
      if (!Array.isArray(current) || !Array.isArray(previous)) {
        return {
          changedOrders,
          newOrdersSet,
          sizeChangedSet,
          directionsMap,
          largeOrdersSet,
          removedOrdersSet
        };
      }

      // Create maps for quick lookup
      const prevMap = new Map(previous.map(order => [`${order.price}`, order]));
      const currentMap = new Map(current.map(order => [`${order.price}`, order]));

      // Check for removed orders
      previous.forEach(prevOrder => {
        if (!prevOrder || typeof prevOrder.price !== 'number') return;
        const key = `${prevOrder.price}`;
        if (!currentMap.has(key)) {
          removedOrdersSet.add(`${type}-${key}`);
        }
      });

      // Check for price/size changes and new orders
      current.forEach(order => {
        if (!order || typeof order.price !== 'number') return;

        const key = `${order.price}`;
        const orderKey = `${type}-${key}`;
        const prevOrder = prevMap.get(key);

        if (!prevOrder) {
          // New order
          newOrdersSet.add(orderKey);

          // Check if it's a large order (top 20% by size)
          const avgSize = current.reduce((sum, o) => sum + o.size, 0) / current.length;
          if (order.size > avgSize * 2) {
            largeOrdersSet.add(orderKey);
          }
        } else {
          const sizeDiff = order.size - prevOrder.size;
          const priceDiff = order.price - prevOrder.price;

          if (Math.abs(sizeDiff) > 0.0001) {
            // Size changed
            sizeChangedSet.add(orderKey);
            changedOrders.add(orderKey);

            // Determine if this is a significant size change
            if (Math.abs(sizeDiff) > prevOrder.size * 0.1) {
              largeOrdersSet.add(orderKey);
            }
          }

          if (Math.abs(priceDiff) > 0.0001) {
            // Price changed - determine direction
            directionsMap.set(orderKey, priceDiff > 0 ? 'up' : 'down');
            changedOrders.add(orderKey);
          }
        }
      });

      return {
        changedOrders,
        newOrdersSet,
        sizeChangedSet,
        directionsMap,
        largeOrdersSet,
        removedOrdersSet
      };
    };

    // Throttle change detection to avoid excessive updates
    const throttleTimeout = setTimeout(() => {
      // Detect changes in asks and bids
      const asksChanges = detectChanges(currentAsks, prevAsksRef.current, 'ask');
      const bidsChanges = detectChanges(currentBids, prevBidsRef.current, 'bid');

      // Combine all changes
      const allFlashing = new Set([...asksChanges.changedOrders, ...bidsChanges.changedOrders]);
      const allNew = new Set([...asksChanges.newOrdersSet, ...bidsChanges.newOrdersSet]);
      const allSizeChanged = new Set([...asksChanges.sizeChangedSet, ...bidsChanges.sizeChangedSet]);
      const allLargeOrders = new Set([...asksChanges.largeOrdersSet, ...bidsChanges.largeOrdersSet]);
      const allRemoving = new Set([...asksChanges.removedOrdersSet, ...bidsChanges.removedOrdersSet]);

      // Combine price directions
      const combinedDirections = new Map([
        ...asksChanges.directionsMap,
        ...bidsChanges.directionsMap
      ]);

      // Check for spread changes
      const currentSpreadValue = calculatedSpread.value;
      const prevSpreadValue = prevSpreadRef.current;

      if (prevSpreadValue !== null && Math.abs(currentSpreadValue - prevSpreadValue) > 0.0001) {
        setSpreadChanging(true);
        setTimeout(() => setSpreadChanging(false), 800);
      }

      // Update state if there are changes
      if (allFlashing.size > 0) {
        setFlashingOrders(allFlashing);
        setTimeout(() => setFlashingOrders(new Set()), 800);
      }

      if (allNew.size > 0) {
        setNewOrders(allNew);
        setTimeout(() => setNewOrders(new Set()), 1000);
      }

      if (allSizeChanged.size > 0) {
        setSizeChangedOrders(allSizeChanged);
        setTimeout(() => setSizeChangedOrders(new Set()), 600);
      }

      if (combinedDirections.size > 0) {
        setPriceDirections(combinedDirections);
        setTimeout(() => setPriceDirections(new Map()), 800);
      }

      if (allLargeOrders.size > 0) {
        setLargeOrders(allLargeOrders);
        setTimeout(() => setLargeOrders(new Set()), 2000);
      }

      if (allRemoving.size > 0) {
        setRemovingOrders(allRemoving);
        setTimeout(() => setRemovingOrders(new Set()), 500);
      }

      // Update previous data refs
      prevAsksRef.current = [...currentAsks];
      prevBidsRef.current = [...currentBids];
      prevSpreadRef.current = currentSpreadValue;
    }, 50); // Throttle to 20fps for change detection

    return () => clearTimeout(throttleTimeout);
  }, [currentAsks, currentBids, realTime, calculatedSpread.value]);

  // State
  const [aggregation, setAggregation] = useState(defaultAggregation);
  const [containerHeight, setContainerHeight] = useState(300);

  // Process and aggregate orders with error handling
  const processedAsks = useMemo(() => {
    try {
      if (!Array.isArray(currentAsks)) return [];
      const aggregated = aggregateOrders(currentAsks, aggregation);
      const limited = aggregated.slice(0, maxDepth);
      return calculateCumulativeTotals(limited);
    } catch (error) {
      console.warn('Error processing asks:', error);
      return [];
    }
  }, [currentAsks, aggregation, maxDepth]);

  const processedBids = useMemo(() => {
    try {
      if (!Array.isArray(currentBids)) return [];
      const aggregated = aggregateOrders(currentBids, aggregation);
      const limited = aggregated.slice(0, maxDepth);
      return calculateCumulativeTotals(limited);
    } catch (error) {
      console.warn('Error processing bids:', error);
      return [];
    }
  }, [currentBids, aggregation, maxDepth]);

  // Calculate max depth for visualization
  const maxCumulativeTotal = useMemo(() => {
    const maxAsks = processedAsks.length > 0 ? Math.max(...processedAsks.map(o => o.cumulativeTotal)) : 0;
    const maxBids = processedBids.length > 0 ? Math.max(...processedBids.map(o => o.cumulativeTotal)) : 0;
    return Math.max(maxAsks, maxBids);
  }, [processedAsks, processedBids]);

  // Virtual scrolling for asks and bids
  const asksVirtual = useVirtualScrolling(processedAsks, containerHeight / 2);
  const bidsVirtual = useVirtualScrolling(processedBids, containerHeight / 2);

  // Handle container resize with debouncing
  useEffect(() => {
    let resizeTimeout;

    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerHeight(rect.height - 168); // Account for header, spread, and column headers
      }
    };

    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateHeight, 100);
    };

    updateHeight();
    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Handle scroll events
  const handleAsksScroll = useCallback((event) => {
    asksVirtual.setScrollTop(event.target.scrollTop);
  }, [asksVirtual]);

  const handleBidsScroll = useCallback((event) => {
    bidsVirtual.setScrollTop(event.target.scrollTop);
  }, [bidsVirtual]);

  // Handle order click
  const handleOrderClick = useCallback((order, side) => {
    if (onOrderClick) {
      onOrderClick(order, side);
    }
  }, [onOrderClick]);

  // Format price
  const formatPrice = useCallback((price) => {
    return price.toFixed(precision);
  }, [precision]);

  // Format size
  const formatSize = useCallback((size) => {
    if (size >= 1000000) return `${(size / 1000000).toFixed(2)}M`;
    if (size >= 1000) return `${(size / 1000).toFixed(2)}K`;
    return size.toFixed(4);
  }, []);

  // Calculate spread
  const calculatedSpread = useMemo(() => {
    if (spread !== undefined) return spread;

    const bestAsk = processedAsks.length > 0 ? processedAsks[processedAsks.length - 1].price : 0;
    const bestBid = processedBids.length > 0 ? processedBids[0].price : 0;

    if (bestAsk > 0 && bestBid > 0) {
      const spreadValue = bestAsk - bestBid;
      const spreadPercent = (spreadValue / bestBid) * 100;
      return { value: spreadValue, percent: spreadPercent };
    }

    return { value: 0, percent: 0 };
  }, [spread, processedAsks, processedBids]);

  return (
    <OrderBookContainer
      ref={forwardedRef || containerRef}
      height={height}
      className={className}
      theme={theme}
      data-testid={testId}
      role="table"
      aria-label={`Order book for ${symbol}`}
      {...(!shouldReduceMotion() ? animationPresets.fadeIn : {})}
      {...props}
    >
      {/* Header */}
      <OrderBookHeader theme={theme}>
        <OrderBookTitle theme={theme}>
          Order Book - {symbol}
        </OrderBookTitle>

        <OrderBookControls theme={theme}>
          <Label size="xs" color="secondary">
            Aggregation:
          </Label>
          <AggregationSelector
            value={aggregation}
            onChange={(e) => setAggregation(parseFloat(e.target.value))}
            theme={theme}
            aria-label="Select price aggregation level"
          >
            {aggregationOptions.map(option => (
              <option key={option} value={option}>
                {option >= 1 ? option.toFixed(0) : option.toFixed(2)}
              </option>
            ))}
          </AggregationSelector>

          <Button
            variant="outline"
            size="xs"
            leftIcon={<Icon name="settings" />}
          >
            Settings
          </Button>
        </OrderBookControls>
      </OrderBookHeader>

      {/* Main Content */}
      <OrderBookContent>
        {/* Asks Section */}
        <OrderBookSide>
          {/* Column Headers for Asks */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            height: '24px',
            padding: `0 ${theme.spacing[3]}`,
            background: theme.color.background.secondary,
            borderBottom: `1px solid ${theme.color.border.primary}`,
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.color.text.secondary,
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}>
            <div style={{ flex: 1, textAlign: 'left' }}>Price (Ask)</div>
            <div style={{ flex: 1, textAlign: 'right' }}>Size</div>
            {showCumulativeTotal && (
              <div style={{ flex: 1, textAlign: 'right' }}>Total</div>
            )}
          </div>

          <VirtualScrollContainer
            ref={asksRef}
            onScroll={handleAsksScroll}
            theme={theme}
            role="rowgroup"
            aria-label="Ask orders"
          >
            <div style={{ height: asksVirtual.totalHeight, position: 'relative' }}>
              <div style={{ transform: `translateY(${asksVirtual.offsetY}px)` }}>
                <AnimatePresence>
                  {asksVirtual.visibleItems.map((order, index) => {
                    const orderKey = `ask-${order.price}`;
                    const isFlashing = flashingOrders.has(orderKey);
                    const isNew = newOrders.has(orderKey);
                    const sizeChanged = sizeChangedOrders.has(orderKey);
                    const priceDirection = priceDirections.get(orderKey);
                    const isLargeOrder = largeOrders.has(orderKey);
                    const isRemoving = removingOrders.has(orderKey);

                    return (
                      <OrderBookRow
                        key={`ask-${asksVirtual.startIndex + index}`}
                        onClick={() => handleOrderClick(order, 'ask')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOrderClick(order, 'ask');
                          }
                        }}
                        theme={theme}
                        isFlashing={isFlashing}
                        isNew={isNew}
                        sizeChanged={sizeChanged}
                        priceDirection={priceDirection}
                        isLargeOrder={isLargeOrder}
                        isRemoving={isRemoving}
                        flashColor={theme.color.trading.bear}
                        side="ask"
                        role="row"
                        tabIndex={0}
                        aria-label={`Ask order: ${formatPrice(order.price)} at ${formatSize(order.size)}`}
                        data-testid="order-row-ask"
                        {...(!shouldReduceMotion() ? animationPresets.fadeIn : {})}
                        transition={{ delay: shouldReduceMotion() ? 0 : index * 0.01 }}
                      >
                        {showDepthBars && maxCumulativeTotal > 0 && (
                          <DepthBar
                            side="ask"
                            width={Math.min(100, Math.max(0, (order.cumulativeTotal / maxCumulativeTotal) * 100))}
                            theme={theme}
                            isPulsing={sizeChanged}
                            isLargeDepth={isLargeOrder}
                            isChanging={isFlashing || sizeChanged}
                            aria-hidden="true"
                          />
                        )}

                        <PriceColumn side="ask" theme={theme} role="cell">
                          {formatPrice(order.price)}
                        </PriceColumn>

                        <SizeColumn theme={theme} role="cell">
                          {formatSize(order.size)}
                        </SizeColumn>

                        {showCumulativeTotal && (
                          <TotalColumn theme={theme} role="cell">
                            {formatSize(order.cumulativeTotal)}
                          </TotalColumn>
                        )}
                      </OrderBookRow>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </VirtualScrollContainer>
        </OrderBookSide>

        {/* Enhanced Spread Indicator */}
        <SpreadIndicator
          theme={theme}
          spreadPercent={calculatedSpread.percent}
          isChanging={spreadChanging}
          role="status"
          aria-live="polite"
          aria-label={`Current spread: ${formatPrice(calculatedSpread.value)} (${calculatedSpread.percent.toFixed(3)}%)`}
        >
          <SpreadValue theme={theme}>
            Spread: {formatPrice(calculatedSpread.value)}
          </SpreadValue>
          <SpreadPercentage theme={theme}>
            ({calculatedSpread.percent.toFixed(3)}%)
          </SpreadPercentage>
        </SpreadIndicator>

        {/* Bids Section */}
        <OrderBookSide>
          {/* Column Headers for Bids */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            height: '24px',
            padding: `0 ${theme.spacing[3]}`,
            background: theme.color.background.secondary,
            borderBottom: `1px solid ${theme.color.border.primary}`,
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.color.text.secondary,
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}>
            <div style={{ flex: 1, textAlign: 'left' }}>Price (Bid)</div>
            <div style={{ flex: 1, textAlign: 'right' }}>Size</div>
            {showCumulativeTotal && (
              <div style={{ flex: 1, textAlign: 'right' }}>Total</div>
            )}
          </div>

          <VirtualScrollContainer
            ref={bidsRef}
            onScroll={handleBidsScroll}
            theme={theme}
            role="rowgroup"
            aria-label="Bid orders"
          >
            <div style={{ height: bidsVirtual.totalHeight, position: 'relative' }}>
              <div style={{ transform: `translateY(${bidsVirtual.offsetY}px)` }}>
                <AnimatePresence>
                  {bidsVirtual.visibleItems.map((order, index) => {
                    const orderKey = `bid-${order.price}`;
                    const isFlashing = flashingOrders.has(orderKey);
                    const isNew = newOrders.has(orderKey);
                    const sizeChanged = sizeChangedOrders.has(orderKey);
                    const priceDirection = priceDirections.get(orderKey);
                    const isLargeOrder = largeOrders.has(orderKey);
                    const isRemoving = removingOrders.has(orderKey);

                    return (
                      <OrderBookRow
                        key={`bid-${bidsVirtual.startIndex + index}`}
                        onClick={() => handleOrderClick(order, 'bid')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOrderClick(order, 'bid');
                          }
                        }}
                        theme={theme}
                        isFlashing={isFlashing}
                        isNew={isNew}
                        sizeChanged={sizeChanged}
                        priceDirection={priceDirection}
                        isLargeOrder={isLargeOrder}
                        isRemoving={isRemoving}
                        flashColor={theme.color.trading.bull}
                        side="bid"
                        role="row"
                        tabIndex={0}
                        aria-label={`Bid order: ${formatPrice(order.price)} at ${formatSize(order.size)}`}
                        data-testid="order-row-bid"
                        {...(!shouldReduceMotion() ? animationPresets.fadeIn : {})}
                        transition={{ delay: shouldReduceMotion() ? 0 : index * 0.01 }}
                      >
                        {showDepthBars && maxCumulativeTotal > 0 && (
                          <DepthBar
                            side="bid"
                            width={Math.min(100, Math.max(0, (order.cumulativeTotal / maxCumulativeTotal) * 100))}
                            theme={theme}
                            isPulsing={sizeChanged}
                            isLargeDepth={isLargeOrder}
                            isChanging={isFlashing || sizeChanged}
                            aria-hidden="true"
                          />
                        )}

                        <PriceColumn side="bid" theme={theme} role="cell">
                          {formatPrice(order.price)}
                        </PriceColumn>

                        <SizeColumn theme={theme} role="cell">
                          {formatSize(order.size)}
                        </SizeColumn>

                        {showCumulativeTotal && (
                          <TotalColumn theme={theme} role="cell">
                            {formatSize(order.cumulativeTotal)}
                          </TotalColumn>
                        )}
                      </OrderBookRow>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </VirtualScrollContainer>
        </OrderBookSide>
      </OrderBookContent>

      {/* Loading Overlay */}
      {loading && (
        <LoadingOverlay
          theme={theme}
          role="status"
          aria-live="polite"
          aria-label="Loading order book data"
          {...(!shouldReduceMotion() ? animationPresets.fadeIn : {})}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: theme.spacing[3]
          }}>
            <div
              className={shouldReduceMotion() ? '' : 'animate-spin'}
              style={{
                width: '32px',
                height: '32px',
                border: `3px solid ${theme.color.primary[200]}`,
                borderTop: `3px solid ${theme.color.primary[500]}`,
                borderRadius: '50%'
              }}
              aria-hidden="true"
            />
            <span style={{ color: theme.color.text.primary }}>Loading order book...</span>
          </div>
        </LoadingOverlay>
      )}
    </OrderBookContainer>
  );
});

OrderBook.displayName = 'OrderBook';

export default OrderBook;