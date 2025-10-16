/**
 * Advanced Order Book Panel - Real-time Level 2 Data
 * Refactored to use the new design system components
 */
import React, { useState, useEffect } from 'react';
import { OrderBook } from '../design-system';
import { usePerformanceMonitoring } from '../services/performanceIntegration';
import { useRealTimeData } from '../services/realTimeDataIntegration';
import { IntegratedErrorBoundary } from '../services/errorBoundaryIntegration';

const OrderBookPanel = ({ ticker, orderBookData, isLoading }) => {
    // Performance monitoring
    const { elementRef: orderBookRef, metrics, recordMetric } = usePerformanceMonitoring(`orderbook-${ticker}`);

    // Real-time data integration
    const { data: realTimeOrderBook } = useRealTimeData(`orderbook-${ticker}`, ['order_book']);

    // Use real-time data if available, otherwise fall back to props
    const currentOrderBookData = realTimeOrderBook[ticker] || orderBookData;

    // Transform data to match design system format
    const transformedData = {
        asks: currentOrderBookData?.asks?.map(ask => ({
            price: ask.price,
            size: ask.size,
            total: ask.total || ask.size,
            timestamp: Date.now()
        })) || [],
        bids: currentOrderBookData?.bids?.map(bid => ({
            price: bid.price,
            size: bid.size,
            total: bid.total || bid.size,
            timestamp: Date.now()
        })) || []
    };

    // Calculate spread information
    const spread = currentOrderBookData?.asks?.[0] && currentOrderBookData?.bids?.[0]
        ? {
            value: currentOrderBookData.asks[0].price - currentOrderBookData.bids[0].price,
            percentage: ((currentOrderBookData.asks[0].price - currentOrderBookData.bids[0].price) / currentOrderBookData.bids[0].price) * 100
        }
        : null;

    return (
        <IntegratedErrorBoundary componentId={`orderbook-${ticker}`}>
            <div ref={orderBookRef} data-component-id={`orderbook-${ticker}`}>
                <OrderBook
                    asks={transformedData.asks}
                    bids={transformedData.bids}
                    spread={spread}
                    symbol={ticker}
                    realTime={true}
                    precision={2}
                    maxDepth={25}
                    height="600px"
                    showDepthBars={true}
                    showCumulativeTotal={true}
                    loading={isLoading}
                    onOrderClick={(order) => {
                        recordMetric('user_interaction', { action: 'order_click', order });
                        console.log('Order clicked:', order);
                    }}
                    onRealTimeUpdate={(data) => {
                        recordMetric('data_processing', {
                            type: 'orderbook_update',
                            latency: Date.now() - data.timestamp
                        });
                        console.log('Real-time update:', data);
                    }}
                />
            </div>
        </IntegratedErrorBoundary>
    );
};

export default OrderBookPanel;