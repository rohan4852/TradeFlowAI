import React, { forwardRef, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeProvider';
import { ChartControls, ChartOverlay } from '../molecules';
import { calculateAllIndicators } from '../../utils/technicalIndicators';
import { usePriceSubscription } from '../providers';
import {
    createGlassmorphism,
    tradingGlassPresets,
    animationPresets,
    shouldReduceMotion
} from '../../effects';

// Chart container
const ChartContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: ${props => props.height || '400px'};
  ${props => tradingGlassPresets.widget(props.theme)}
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  background: ${props => props.theme.color.background.primary};
`;

// Canvas element
const ChartCanvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
  cursor: ${props => props.dragging ? 'grabbing' : 'grab'};
  touch-action: none;
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

// Chart utilities
class ChartRenderer {
    constructor(canvas, theme) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.theme = theme;
        this.pixelRatio = window.devicePixelRatio || 1;
        this.animationFrame = null;

        // Chart dimensions
        this.padding = { top: 20, right: 60, bottom: 40, left: 60 };
        this.chartWidth = 0;
        this.chartHeight = 0;

        // Data and scales
        this.data = [];
        this.indicators = {};
        this.overlays = [];
        this.xScale = null;
        this.yScale = null;
        this.volumeScale = null;
        this.indicatorScales = {};

        // Interaction state
        this.isDragging = false;
        this.lastMouseX = 0;
        this.zoomLevel = 1;
        this.panOffset = 0;

        // Performance optimization
        this.visibleRange = { start: 0, end: 0 };
        this.candleWidth = 8;
        this.candleSpacing = 2;

        // Indicator configuration
        this.showIndicators = true;
        this.indicatorHeight = 0.15; // 15% of chart height for indicators

        this.setupCanvas();
    }

    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this.pixelRatio;
        this.canvas.height = rect.height * this.pixelRatio;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';

        this.chartWidth = rect.width - this.padding.left - this.padding.right;
        this.chartHeight = rect.height - this.padding.top - this.padding.bottom;
    }

    setData(data) {
        this.data = data || [];
        this.calculateScales();
        this.calculateVisibleRange();
    }

    setIndicators(indicators) {
        this.indicators = indicators || {};
        this.calculateIndicatorScales();
    }

    setOverlays(overlays) {
        this.overlays = overlays || [];
    }

    calculateIndicatorScales() {
        if (!this.indicators || Object.keys(this.indicators).length === 0) return;

        // Calculate scales for oscillator indicators (RSI, Stochastic, etc.)
        if (this.indicators.rsi) {
            this.indicatorScales.rsi = (value) => {
                const indicatorTop = this.chartHeight * 0.85 + this.padding.top;
                const indicatorHeight = this.chartHeight * this.indicatorHeight;
                return indicatorTop + (1 - value / 100) * indicatorHeight;
            };
        }

        if (this.indicators.macd) {
            const macdValues = [
                ...this.indicators.macd.macd.map(m => m.value),
                ...this.indicators.macd.signal.map(s => s.value),
                ...this.indicators.macd.histogram.map(h => h.value)
            ];

            if (macdValues.length > 0) {
                const minMacd = Math.min(...macdValues);
                const maxMacd = Math.max(...macdValues);
                const macdRange = maxMacd - minMacd;

                this.indicatorScales.macd = (value) => {
                    const indicatorTop = this.chartHeight * 0.85 + this.padding.top;
                    const indicatorHeight = this.chartHeight * this.indicatorHeight;
                    const normalizedValue = (value - minMacd) / macdRange;
                    return indicatorTop + (1 - normalizedValue) * indicatorHeight;
                };
            }
        }
    }

    calculateScales() {
        if (!this.data.length) return;

        const visibleData = this.getVisibleData();
        if (!visibleData.length) return;

        // X scale (time)
        const timeRange = visibleData.length;
        this.xScale = (index) => {
            return this.padding.left + (index * (this.candleWidth + this.candleSpacing));
        };

        // Y scale (price)
        const prices = visibleData.flatMap(d => [d.high, d.low]);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice;
        const padding = priceRange * 0.1; // 10% padding

        this.yScale = (price) => {
            const normalizedPrice = (price - (minPrice - padding)) / (priceRange + 2 * padding);
            return this.padding.top + (1 - normalizedPrice) * (this.chartHeight * 0.8); // 80% for price, 20% for volume
        };

        // Volume scale
        const volumes = visibleData.map(d => d.volume);
        const maxVolume = Math.max(...volumes);

        this.volumeScale = (volume) => {
            const normalizedVolume = volume / maxVolume;
            const volumeHeight = this.chartHeight * 0.15; // 15% of chart height
            return this.chartHeight * 0.85 + this.padding.top + (1 - normalizedVolume) * volumeHeight;
        };
    }

    calculateVisibleRange() {
        const maxVisible = Math.floor(this.chartWidth / (this.candleWidth + this.candleSpacing));
        const startIndex = Math.max(0, this.data.length - maxVisible + this.panOffset);
        const endIndex = Math.min(this.data.length, startIndex + maxVisible);

        this.visibleRange = { start: startIndex, end: endIndex };
    }

    getVisibleData() {
        return this.data.slice(this.visibleRange.start, this.visibleRange.end);
    }

    render() {
        if (!this.data.length) {
            this.renderEmptyState();
            return;
        }

        this.clear();
        this.renderGrid();
        this.renderVolume();
        this.renderCandlesticks();
        this.renderIndicators();
        this.renderOverlays();
        this.renderAxes();
        this.renderCrosshair();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width / this.pixelRatio, this.canvas.height / this.pixelRatio);
    }

    renderGrid() {
        this.ctx.strokeStyle = this.theme.color.border.primary;
        this.ctx.lineWidth = 0.5;
        this.ctx.setLineDash([2, 2]);

        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = this.padding.top + (i * this.chartHeight * 0.8) / 5;
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding.left, y);
            this.ctx.lineTo(this.padding.left + this.chartWidth, y);
            this.ctx.stroke();
        }

        // Vertical grid lines
        const visibleData = this.getVisibleData();
        const step = Math.max(1, Math.floor(visibleData.length / 8));
        for (let i = 0; i < visibleData.length; i += step) {
            const x = this.xScale(i);
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.padding.top);
            this.ctx.lineTo(x, this.padding.top + this.chartHeight * 0.8);
            this.ctx.stroke();
        }

        this.ctx.setLineDash([]);
    }

    renderCandlesticks() {
        const visibleData = this.getVisibleData();

        visibleData.forEach((candle, index) => {
            const x = this.xScale(index);
            const openY = this.yScale(candle.open);
            const closeY = this.yScale(candle.close);
            const highY = this.yScale(candle.high);
            const lowY = this.yScale(candle.low);

            const isBullish = candle.close > candle.open;
            const color = isBullish ? this.theme.color.trading.bull : this.theme.color.trading.bear;

            // Draw wick
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x + this.candleWidth / 2, highY);
            this.ctx.lineTo(x + this.candleWidth / 2, lowY);
            this.ctx.stroke();

            // Draw body
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.abs(closeY - openY);

            if (isBullish) {
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x, bodyTop, this.candleWidth, bodyHeight || 1);
            } else {
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x, bodyTop, this.candleWidth, bodyHeight || 1);
            }

            // Draw border for hollow candles
            if (isBullish && bodyHeight > 2) {
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, bodyTop, this.candleWidth, bodyHeight);
            }
        });
    }

    renderVolume() {
        const visibleData = this.getVisibleData();
        const volumeBaseY = this.chartHeight * 0.85 + this.padding.top + this.chartHeight * 0.15;

        visibleData.forEach((candle, index) => {
            const x = this.xScale(index);
            const volumeY = this.volumeScale(candle.volume);
            const volumeHeight = volumeBaseY - volumeY;

            const isBullish = candle.close > candle.open;
            this.ctx.fillStyle = isBullish
                ? this.theme.color.trading.bull + '60'
                : this.theme.color.trading.bear + '60';

            this.ctx.fillRect(x, volumeY, this.candleWidth, volumeHeight);
        });
    }

    renderAxes() {
        this.ctx.fillStyle = this.theme.color.text.secondary;
        this.ctx.font = '11px ' + this.theme.typography.fontFamily.monospace;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';

        // Y-axis (price labels)
        const visibleData = this.getVisibleData();
        if (visibleData.length) {
            const prices = visibleData.flatMap(d => [d.high, d.low]);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            for (let i = 0; i <= 5; i++) {
                const price = minPrice + (maxPrice - minPrice) * (i / 5);
                const y = this.yScale(price);
                this.ctx.fillText(price.toFixed(2), this.padding.left - 10, y);
            }
        }

        // X-axis (time labels)
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        const step = Math.max(1, Math.floor(visibleData.length / 6));

        for (let i = 0; i < visibleData.length; i += step) {
            const candle = visibleData[i];
            if (candle && candle.timestamp) {
                const x = this.xScale(i);
                const date = new Date(candle.timestamp);
                const timeStr = date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                this.ctx.fillText(timeStr, x + this.candleWidth / 2, this.padding.top + this.chartHeight + 10);
            }
        }
    }

    renderIndicators() {
        if (!this.showIndicators || !this.indicators) return;

        const visibleData = this.getVisibleData();
        if (!visibleData.length) return;

        // Render overlay indicators (moving averages, Bollinger Bands)
        this.renderOverlayIndicators(visibleData);

        // Render oscillator indicators (RSI, MACD)
        this.renderOscillatorIndicators(visibleData);
    }

    renderOverlayIndicators(visibleData) {
        // Render Simple Moving Average
        if (this.indicators.sma) {
            this.ctx.strokeStyle = this.theme.color.primary[500];
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();

            let firstPoint = true;
            this.indicators.sma.forEach((point, index) => {
                const dataIndex = visibleData.findIndex(d => d.timestamp === point.timestamp);
                if (dataIndex !== -1) {
                    const x = this.xScale(dataIndex) + this.candleWidth / 2;
                    const y = this.yScale(point.value);

                    if (firstPoint) {
                        this.ctx.moveTo(x, y);
                        firstPoint = false;
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
            });

            this.ctx.stroke();
        }

        // Render Exponential Moving Average
        if (this.indicators.ema) {
            this.ctx.strokeStyle = this.theme.color.secondary[500];
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();

            let firstPoint = true;
            this.indicators.ema.forEach((point, index) => {
                const dataIndex = visibleData.findIndex(d => d.timestamp === point.timestamp);
                if (dataIndex !== -1) {
                    const x = this.xScale(dataIndex) + this.candleWidth / 2;
                    const y = this.yScale(point.value);

                    if (firstPoint) {
                        this.ctx.moveTo(x, y);
                        firstPoint = false;
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
            });

            this.ctx.stroke();
        }

        // Render Bollinger Bands
        if (this.indicators.bollingerBands) {
            const { upper, middle, lower } = this.indicators.bollingerBands;

            // Upper band
            this.ctx.strokeStyle = this.theme.color.warning[400] + '80';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();

            let firstPoint = true;
            upper.forEach((point) => {
                const dataIndex = visibleData.findIndex(d => d.timestamp === point.timestamp);
                if (dataIndex !== -1) {
                    const x = this.xScale(dataIndex) + this.candleWidth / 2;
                    const y = this.yScale(point.value);

                    if (firstPoint) {
                        this.ctx.moveTo(x, y);
                        firstPoint = false;
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
            });
            this.ctx.stroke();

            // Lower band
            this.ctx.beginPath();
            firstPoint = true;
            lower.forEach((point) => {
                const dataIndex = visibleData.findIndex(d => d.timestamp === point.timestamp);
                if (dataIndex !== -1) {
                    const x = this.xScale(dataIndex) + this.candleWidth / 2;
                    const y = this.yScale(point.value);

                    if (firstPoint) {
                        this.ctx.moveTo(x, y);
                        firstPoint = false;
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
            });
            this.ctx.stroke();

            // Fill between bands
            this.ctx.fillStyle = this.theme.color.warning[400] + '20';
            this.ctx.beginPath();

            // Draw upper band path
            firstPoint = true;
            upper.forEach((point) => {
                const dataIndex = visibleData.findIndex(d => d.timestamp === point.timestamp);
                if (dataIndex !== -1) {
                    const x = this.xScale(dataIndex) + this.candleWidth / 2;
                    const y = this.yScale(point.value);

                    if (firstPoint) {
                        this.ctx.moveTo(x, y);
                        firstPoint = false;
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
            });

            // Draw lower band path in reverse
            for (let i = lower.length - 1; i >= 0; i--) {
                const point = lower[i];
                const dataIndex = visibleData.findIndex(d => d.timestamp === point.timestamp);
                if (dataIndex !== -1) {
                    const x = this.xScale(dataIndex) + this.candleWidth / 2;
                    const y = this.yScale(point.value);
                    this.ctx.lineTo(x, y);
                }
            }

            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.setLineDash([]);
        }
    }

    renderOscillatorIndicators(visibleData) {
        // Render RSI
        if (this.indicators.rsi && this.indicatorScales.rsi) {
            const indicatorTop = this.chartHeight * 0.85 + this.padding.top;
            const indicatorHeight = this.chartHeight * this.indicatorHeight;

            // Draw RSI background
            this.ctx.fillStyle = this.theme.color.background.secondary + '40';
            this.ctx.fillRect(this.padding.left, indicatorTop, this.chartWidth, indicatorHeight);

            // Draw RSI reference lines (30, 50, 70)
            this.ctx.strokeStyle = this.theme.color.border.primary;
            this.ctx.lineWidth = 0.5;
            this.ctx.setLineDash([2, 2]);

            [30, 50, 70].forEach(level => {
                const y = this.indicatorScales.rsi(level);
                this.ctx.beginPath();
                this.ctx.moveTo(this.padding.left, y);
                this.ctx.lineTo(this.padding.left + this.chartWidth, y);
                this.ctx.stroke();
            });

            // Draw RSI line
            this.ctx.strokeStyle = this.theme.color.info[500];
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([]);
            this.ctx.beginPath();

            let firstPoint = true;
            this.indicators.rsi.forEach((point) => {
                const dataIndex = visibleData.findIndex(d => d.timestamp === point.timestamp);
                if (dataIndex !== -1) {
                    const x = this.xScale(dataIndex) + this.candleWidth / 2;
                    const y = this.indicatorScales.rsi(point.value);

                    if (firstPoint) {
                        this.ctx.moveTo(x, y);
                        firstPoint = false;
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
            });
            this.ctx.stroke();

            // Draw RSI labels
            this.ctx.fillStyle = this.theme.color.text.secondary;
            this.ctx.font = '10px ' + this.theme.typography.fontFamily.monospace;
            this.ctx.textAlign = 'right';
            this.ctx.textBaseline = 'middle';

            [30, 50, 70].forEach(level => {
                const y = this.indicatorScales.rsi(level);
                this.ctx.fillText(level.toString(), this.padding.left - 5, y);
            });
        }

        // Render MACD
        if (this.indicators.macd && this.indicatorScales.macd) {
            const indicatorTop = this.chartHeight * 0.85 + this.padding.top;
            const indicatorHeight = this.chartHeight * this.indicatorHeight;

            // Draw MACD background
            this.ctx.fillStyle = this.theme.color.background.secondary + '40';
            this.ctx.fillRect(this.padding.left, indicatorTop, this.chartWidth, indicatorHeight);

            // Draw zero line
            this.ctx.strokeStyle = this.theme.color.border.primary;
            this.ctx.lineWidth = 0.5;
            this.ctx.setLineDash([2, 2]);
            const zeroY = this.indicatorScales.macd(0);
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding.left, zeroY);
            this.ctx.lineTo(this.padding.left + this.chartWidth, zeroY);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Draw MACD histogram
            this.indicators.macd.histogram.forEach((point) => {
                const dataIndex = visibleData.findIndex(d => d.timestamp === point.timestamp);
                if (dataIndex !== -1) {
                    const x = this.xScale(dataIndex);
                    const y = this.indicatorScales.macd(point.value);
                    const height = Math.abs(y - zeroY);

                    this.ctx.fillStyle = point.value >= 0
                        ? this.theme.color.trading.bull + '60'
                        : this.theme.color.trading.bear + '60';

                    if (point.value >= 0) {
                        this.ctx.fillRect(x, y, this.candleWidth, height);
                    } else {
                        this.ctx.fillRect(x, zeroY, this.candleWidth, height);
                    }
                }
            });

            // Draw MACD line
            this.ctx.strokeStyle = this.theme.color.primary[500];
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();

            let firstPoint = true;
            this.indicators.macd.macd.forEach((point) => {
                const dataIndex = visibleData.findIndex(d => d.timestamp === point.timestamp);
                if (dataIndex !== -1) {
                    const x = this.xScale(dataIndex) + this.candleWidth / 2;
                    const y = this.indicatorScales.macd(point.value);

                    if (firstPoint) {
                        this.ctx.moveTo(x, y);
                        firstPoint = false;
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
            });
            this.ctx.stroke();

            // Draw Signal line
            this.ctx.strokeStyle = this.theme.color.secondary[500];
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();

            firstPoint = true;
            this.indicators.macd.signal.forEach((point) => {
                const dataIndex = visibleData.findIndex(d => d.timestamp === point.timestamp);
                if (dataIndex !== -1) {
                    const x = this.xScale(dataIndex) + this.candleWidth / 2;
                    const y = this.indicatorScales.macd(point.value);

                    if (firstPoint) {
                        this.ctx.moveTo(x, y);
                        firstPoint = false;
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
            });
            this.ctx.stroke();
        }
    }

    renderOverlays() {
        // Render custom overlays like trend lines, support/resistance levels
        if (!this.overlays || this.overlays.length === 0) return;

        this.overlays.forEach(overlay => {
            switch (overlay.type) {
                case 'trendline':
                    this.renderTrendLine(overlay);
                    break;
                case 'horizontal':
                    this.renderHorizontalLine(overlay);
                    break;
                case 'rectangle':
                    this.renderRectangle(overlay);
                    break;
                default:
                    break;
            }
        });
    }

    renderTrendLine(overlay) {
        if (!overlay.points || overlay.points.length < 2) return;

        this.ctx.strokeStyle = overlay.color || this.theme.color.primary[500];
        this.ctx.lineWidth = overlay.width || 2;
        this.ctx.setLineDash(overlay.dashed ? [5, 5] : []);

        this.ctx.beginPath();
        overlay.points.forEach((point, index) => {
            const x = this.xScale(point.x) + this.candleWidth / 2;
            const y = this.yScale(point.y);

            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });

        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    renderHorizontalLine(overlay) {
        this.ctx.strokeStyle = overlay.color || this.theme.color.warning[500];
        this.ctx.lineWidth = overlay.width || 1;
        this.ctx.setLineDash(overlay.dashed ? [5, 5] : []);

        const y = this.yScale(overlay.price);
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding.left, y);
        this.ctx.lineTo(this.padding.left + this.chartWidth, y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw price label
        if (overlay.showLabel !== false) {
            this.ctx.fillStyle = overlay.color || this.theme.color.warning[500];
            this.ctx.font = '11px ' + this.theme.typography.fontFamily.monospace;
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                overlay.price.toFixed(2),
                this.padding.left + this.chartWidth + 5,
                y
            );
        }
    }

    renderRectangle(overlay) {
        if (!overlay.topLeft || !overlay.bottomRight) return;

        const x1 = this.xScale(overlay.topLeft.x);
        const y1 = this.yScale(overlay.topLeft.y);
        const x2 = this.xScale(overlay.bottomRight.x);
        const y2 = this.yScale(overlay.bottomRight.y);

        const width = x2 - x1;
        const height = y2 - y1;

        // Fill rectangle
        if (overlay.fillColor) {
            this.ctx.fillStyle = overlay.fillColor;
            this.ctx.fillRect(x1, y1, width, height);
        }

        // Draw border
        if (overlay.borderColor) {
            this.ctx.strokeStyle = overlay.borderColor;
            this.ctx.lineWidth = overlay.borderWidth || 1;
            this.ctx.setLineDash(overlay.dashed ? [5, 5] : []);
            this.ctx.strokeRect(x1, y1, width, height);
            this.ctx.setLineDash([]);
        }
    }

    renderCrosshair() {
        // This would be implemented with mouse tracking
        // For now, we'll skip the crosshair implementation
    }

    renderEmptyState() {
        this.clear();
        this.ctx.fillStyle = this.theme.color.text.secondary;
        this.ctx.font = '16px ' + this.theme.typography.fontFamily.primary;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            'No data available',
            this.canvas.width / (2 * this.pixelRatio),
            this.canvas.height / (2 * this.pixelRatio)
        );
    }

    handleResize() {
        this.setupCanvas();
        this.calculateScales();
        this.calculateVisibleRange();
        this.render();
    }

    handleZoom(delta, mouseX) {
        const zoomFactor = delta > 0 ? 1.1 : 0.9;
        this.zoomLevel *= zoomFactor;
        this.zoomLevel = Math.max(0.1, Math.min(5, this.zoomLevel));

        this.candleWidth = Math.max(2, Math.min(20, 8 * this.zoomLevel));
        this.calculateScales();
        this.calculateVisibleRange();
        this.render();
    }

    handlePan(deltaX) {
        const sensitivity = 0.5;
        this.panOffset += deltaX * sensitivity;
        this.panOffset = Math.max(-this.data.length + 10, Math.min(0, this.panOffset));

        this.calculateVisibleRange();
        this.render();
    }

    exportChart(format = 'png', quality = 1.0) {
        if (!this.canvas) return null;

        try {
            if (format === 'png') {
                return this.canvas.toDataURL('image/png');
            } else if (format === 'jpeg') {
                return this.canvas.toDataURL('image/jpeg', quality);
            } else if (format === 'webp') {
                return this.canvas.toDataURL('image/webp', quality);
            }
        } catch (error) {
            console.error('Error exporting chart:', error);
            return null;
        }
    }

    downloadChart(filename = 'chart', format = 'png', quality = 1.0) {
        const dataURL = this.exportChart(format, quality);
        if (!dataURL) return;

        const link = document.createElement('a');
        link.download = `${filename}.${format}`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// Main component
const CandlestickChart = forwardRef(({
    data = [],
    symbol,
    realTime = false,
    width = '100%',
    height = '400px',
    showControls = true,
    showVolume = true,
    showIndicators = true,
    indicators = {},
    overlays = [],
    timeframe = '1D',
    onTimeframeChange,
    onIndicatorChange,
    onRealTimeUpdate,
    loading = false,
    className,
    testId,
    ...props
}, ref) => {
    const { theme } = useTheme();
    const canvasRef = useRef(null);
    const rendererRef = useRef(null);
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // Real-time data subscription (optional)
    const { price: realTimePrice, isSubscribed } = usePriceSubscription(
        symbol,
        realTime && !!symbol
    );

    // Merge real-time data with static data
    const chartData = useMemo(() => {
        if (!realTime || !realTimePrice || !data.length) {
            return data;
        }

        // Update the last candle with real-time price
        const updatedData = [...data];
        const lastCandle = updatedData[updatedData.length - 1];

        if (lastCandle) {
            updatedData[updatedData.length - 1] = {
                ...lastCandle,
                close: realTimePrice.price || lastCandle.close,
                high: Math.max(lastCandle.high, realTimePrice.price || lastCandle.high),
                low: Math.min(lastCandle.low, realTimePrice.price || lastCandle.low),
                timestamp: realTimePrice.timestamp || lastCandle.timestamp
            };
        }

        return updatedData;
    }, [data, realTime, realTimePrice]);

    // Notify parent of real-time updates
    useEffect(() => {
        if (realTime && realTimePrice && onRealTimeUpdate) {
            onRealTimeUpdate(realTimePrice);
        }
    }, [realTime, realTimePrice, onRealTimeUpdate]);

    // Initialize renderer
    useEffect(() => {
        if (canvasRef.current && !rendererRef.current) {
            rendererRef.current = new ChartRenderer(canvasRef.current, theme);
        }

        return () => {
            if (rendererRef.current) {
                rendererRef.current.destroy();
            }
        };
    }, [theme]);

    // Calculate indicators when data changes
    const calculatedIndicators = useMemo(() => {
        if (!data || data.length === 0) return {};

        // Default indicator configuration
        const defaultConfig = {
            sma: { period: 20 },
            ema: { period: 12 },
            rsi: { period: 14 },
            macd: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
            bollingerBands: { period: 20, stdDev: 2 },
            ...indicators
        };

        return calculateAllIndicators(data, defaultConfig);
    }, [data, indicators]);

    // Update data
    useEffect(() => {
        if (rendererRef.current) {
            rendererRef.current.setData(chartData);
            rendererRef.current.render();
        }
    }, [chartData]);

    // Update indicators
    useEffect(() => {
        if (rendererRef.current && showIndicators) {
            rendererRef.current.setIndicators(calculatedIndicators);
            rendererRef.current.render();
        }
    }, [calculatedIndicators, showIndicators]);

    // Update overlays
    useEffect(() => {
        if (rendererRef.current) {
            rendererRef.current.setOverlays(overlays);
            rendererRef.current.render();
        }
    }, [overlays]);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (rendererRef.current) {
                setTimeout(() => {
                    rendererRef.current.handleResize();
                }, 100);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Mouse event handlers
    const handleMouseDown = useCallback((event) => {
        setIsDragging(true);
        setLastMousePos({ x: event.clientX, y: event.clientY });
        event.preventDefault();
    }, []);

    const handleMouseMove = useCallback((event) => {
        if (isDragging && rendererRef.current) {
            const deltaX = event.clientX - lastMousePos.x;
            rendererRef.current.handlePan(deltaX);
            setLastMousePos({ x: event.clientX, y: event.clientY });
        }
    }, [isDragging, lastMousePos]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleWheel = useCallback((event) => {
        if (rendererRef.current) {
            event.preventDefault();
            const rect = canvasRef.current.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            rendererRef.current.handleZoom(event.deltaY, mouseX);
        }
    }, []);

    // Touch event handlers for mobile
    const handleTouchStart = useCallback((event) => {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            setIsDragging(true);
            setLastMousePos({ x: touch.clientX, y: touch.clientY });
        }
        event.preventDefault();
    }, []);

    const handleTouchMove = useCallback((event) => {
        if (isDragging && event.touches.length === 1 && rendererRef.current) {
            const touch = event.touches[0];
            const deltaX = touch.clientX - lastMousePos.x;
            rendererRef.current.handlePan(deltaX);
            setLastMousePos({ x: touch.clientX, y: touch.clientY });
        }
        event.preventDefault();
    }, [isDragging, lastMousePos]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Export functionality
    const exportChart = useCallback((format = 'png', quality = 1.0) => {
        if (rendererRef.current) {
            return rendererRef.current.exportChart(format, quality);
        }
        return null;
    }, []);

    const downloadChart = useCallback((filename = 'chart', format = 'png', quality = 1.0) => {
        if (rendererRef.current) {
            rendererRef.current.downloadChart(filename, format, quality);
        }
    }, []);

    // Sample data generator for demo
    const generateSampleData = useMemo(() => {
        if (data.length > 0) return data;

        const sampleData = [];
        let price = 150;
        const now = Date.now();

        for (let i = 0; i < 100; i++) {
            const timestamp = now - (100 - i) * 60000; // 1 minute intervals
            const change = (Math.random() - 0.5) * 4;
            const open = price;
            const close = price + change;
            const high = Math.max(open, close) + Math.random() * 2;
            const low = Math.min(open, close) - Math.random() * 2;
            const volume = Math.floor(Math.random() * 1000000) + 100000;

            sampleData.push({
                timestamp,
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume,
            });

            price = close;
        }

        return sampleData;
    }, [data]);

    // Expose methods through ref
    React.useImperativeHandle(ref, () => ({
        exportChart,
        downloadChart,
        getRenderer: () => rendererRef.current,
    }), [exportChart, downloadChart]);

    return (
        <ChartContainer
            ref={containerRef}
            height={height}
            className={className}
            theme={theme}
            data-testid={testId}
            {...animationPresets.fadeIn}
            {...props}
        >
            {showControls && (
                <ChartControls
                    floating
                    timeframes={['1m', '5m', '15m', '1h', '4h', '1D', '1W']}
                    activeTimeframe={timeframe}
                    onTimeframeChange={onTimeframeChange}
                    indicators={[
                        { key: 'sma', label: 'Simple Moving Average (20)' },
                        { key: 'ema', label: 'Exponential Moving Average (12)' },
                        { key: 'rsi', label: 'RSI (14)' },
                        { key: 'macd', label: 'MACD (12,26,9)' },
                        { key: 'bollingerBands', label: 'Bollinger Bands (20,2)' }
                    ]}
                    activeIndicators={Object.keys(indicators).filter(key => indicators[key])}
                    onIndicatorToggle={onIndicatorChange}
                    showVolume={showVolume}
                />
            )}

            <ChartCanvas
                ref={canvasRef}
                dragging={isDragging}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            />

            {loading && (
                <LoadingOverlay theme={theme} {...animationPresets.fadeIn}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: theme.spacing[3]
                    }}>
                        <div className="animate-spin" style={{
                            width: '32px',
                            height: '32px',
                            border: `3px solid ${theme.color.primary[200]}`,
                            borderTop: `3px solid ${theme.color.primary[500]}`,
                            borderRadius: '50%'
                        }} />
                        <span style={{ color: theme.color.text.primary }}>Loading chart data...</span>
                    </div>
                </LoadingOverlay>
            )}
        </ChartContainer>
    );
});

CandlestickChart.displayName = 'CandlestickChart';

export default CandlestickChart;