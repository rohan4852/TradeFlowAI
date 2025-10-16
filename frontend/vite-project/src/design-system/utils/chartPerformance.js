/**
 * Chart Performance Optimization Utilities
 * Provides tools for optimizing chart rendering performance
 */

// Performance monitoring
export class ChartPerformanceMonitor {
    constructor() {
        this.metrics = {
            renderTimes: [],
            frameRates: [],
            memoryUsage: [],
            dataProcessingTimes: []
        };
        this.isMonitoring = false;
        this.lastFrameTime = 0;
        this.frameCount = 0;
    }

    startMonitoring() {
        this.isMonitoring = true;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.monitorFrameRate();
    }

    stopMonitoring() {
        this.isMonitoring = false;
    }

    monitorFrameRate() {
        if (!this.isMonitoring) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;

        if (deltaTime >= 1000) { // Calculate FPS every second
            const fps = Math.round((this.frameCount * 1000) / deltaTime);
            this.metrics.frameRates.push({
                timestamp: currentTime,
                fps: fps
            });

            // Keep only last 60 seconds of data
            if (this.metrics.frameRates.length > 60) {
                this.metrics.frameRates.shift();
            }

            this.frameCount = 0;
            this.lastFrameTime = currentTime;
        }

        this.frameCount++;
        requestAnimationFrame(() => this.monitorFrameRate());
    }

    recordRenderTime(renderTime) {
        this.metrics.renderTimes.push({
            timestamp: performance.now(),
            duration: renderTime
        });

        // Keep only last 100 render times
        if (this.metrics.renderTimes.length > 100) {
            this.metrics.renderTimes.shift();
        }
    }

    recordDataProcessingTime(processingTime) {
        this.metrics.dataProcessingTimes.push({
            timestamp: performance.now(),
            duration: processingTime
        });

        // Keep only last 50 processing times
        if (this.metrics.dataProcessingTimes.length > 50) {
            this.metrics.dataProcessingTimes.shift();
        }
    }

    recordMemoryUsage() {
        if (performance.memory) {
            this.metrics.memoryUsage.push({
                timestamp: performance.now(),
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            });

            // Keep only last 100 memory readings
            if (this.metrics.memoryUsage.length > 100) {
                this.metrics.memoryUsage.shift();
            }
        }
    }

    getAverageRenderTime() {
        if (this.metrics.renderTimes.length === 0) return 0;
        const total = this.metrics.renderTimes.reduce((sum, metric) => sum + metric.duration, 0);
        return total / this.metrics.renderTimes.length;
    }

    getAverageFrameRate() {
        if (this.metrics.frameRates.length === 0) return 0;
        const total = this.metrics.frameRates.reduce((sum, metric) => sum + metric.fps, 0);
        return total / this.metrics.frameRates.length;
    }

    getCurrentMemoryUsage() {
        if (this.metrics.memoryUsage.length === 0) return null;
        return this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
    }

    getPerformanceReport() {
        return {
            averageRenderTime: this.getAverageRenderTime(),
            averageFrameRate: this.getAverageFrameRate(),
            currentMemoryUsage: this.getCurrentMemoryUsage(),
            totalRenders: this.metrics.renderTimes.length,
            performanceScore: this.calculatePerformanceScore()
        };
    }

    calculatePerformanceScore() {
        const avgRenderTime = this.getAverageRenderTime();
        const avgFrameRate = this.getAverageFrameRate();

        let score = 100;

        // Penalize slow render times
        if (avgRenderTime > 16) score -= Math.min(50, (avgRenderTime - 16) * 2);

        // Penalize low frame rates
        if (avgFrameRate < 30) score -= Math.min(30, (30 - avgFrameRate) * 2);

        return Math.max(0, Math.round(score));
    }
}

// Data optimization utilities
export class ChartDataOptimizer {
    constructor() {
        this.cache = new Map();
        this.maxCacheSize = 100;
    }

    // Optimize data for rendering based on zoom level and visible range
    optimizeDataForRendering(data, visibleRange, zoomLevel, candleWidth) {
        const cacheKey = `${visibleRange.start}-${visibleRange.end}-${zoomLevel}-${candleWidth}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const visibleData = data.slice(visibleRange.start, visibleRange.end);
        let optimizedData = visibleData;

        // Apply data reduction for high zoom out levels
        if (candleWidth < 3) {
            optimizedData = this.reduceDataPoints(visibleData, Math.floor(candleWidth));
        }

        // Cache the result
        this.cache.set(cacheKey, optimizedData);

        // Manage cache size
        if (this.cache.size > this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        return optimizedData;
    }

    // Reduce data points by combining multiple candles
    reduceDataPoints(data, reductionFactor) {
        if (reductionFactor <= 1) return data;

        const reducedData = [];

        for (let i = 0; i < data.length; i += reductionFactor) {
            const group = data.slice(i, i + reductionFactor);
            if (group.length === 0) continue;

            const reducedCandle = {
                timestamp: group[0].timestamp,
                open: group[0].open,
                close: group[group.length - 1].close,
                high: Math.max(...group.map(c => c.high)),
                low: Math.min(...group.map(c => c.low)),
                volume: group.reduce((sum, c) => sum + c.volume, 0)
            };

            reducedData.push(reducedCandle);
        }

        return reducedData;
    }

    // Pre-calculate indicator values for visible range
    preCalculateIndicators(data, indicators, visibleRange) {
        const cacheKey = `indicators-${visibleRange.start}-${visibleRange.end}-${JSON.stringify(indicators)}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const visibleData = data.slice(visibleRange.start, visibleRange.end);
        const calculatedIndicators = {};

        // Calculate only for visible data to improve performance
        Object.keys(indicators).forEach(indicatorKey => {
            const indicator = indicators[indicatorKey];
            calculatedIndicators[indicatorKey] = this.calculateIndicator(visibleData, indicator);
        });

        this.cache.set(cacheKey, calculatedIndicators);
        return calculatedIndicators;
    }

    calculateIndicator(data, indicator) {
        // This would integrate with the technical indicators utility
        // For now, return a placeholder
        return data.map((candle, index) => ({
            timestamp: candle.timestamp,
            value: candle.close // Placeholder calculation
        }));
    }

    clearCache() {
        this.cache.clear();
    }
}

// Rendering optimization utilities
export class ChartRenderOptimizer {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.offscreenCanvas = null;
        this.offscreenCtx = null;
        this.layerCache = new Map();
        this.dirtyLayers = new Set();
    }

    // Initialize offscreen canvas for double buffering
    initializeOffscreenCanvas() {
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = this.canvas.width;
        this.offscreenCanvas.height = this.canvas.height;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');

        // Copy canvas properties
        this.offscreenCtx.imageSmoothingEnabled = this.ctx.imageSmoothingEnabled;
        this.offscreenCtx.imageSmoothingQuality = this.ctx.imageSmoothingQuality;
    }

    // Create layer for caching static elements
    createLayer(layerId, width, height) {
        const layerCanvas = document.createElement('canvas');
        layerCanvas.width = width;
        layerCanvas.height = height;
        const layerCtx = layerCanvas.getContext('2d');

        this.layerCache.set(layerId, {
            canvas: layerCanvas,
            context: layerCtx,
            isDirty: true
        });

        return { canvas: layerCanvas, context: layerCtx };
    }

    // Mark layer as dirty (needs re-rendering)
    markLayerDirty(layerId) {
        const layer = this.layerCache.get(layerId);
        if (layer) {
            layer.isDirty = true;
            this.dirtyLayers.add(layerId);
        }
    }

    // Render layer if dirty
    renderLayer(layerId, renderFunction) {
        const layer = this.layerCache.get(layerId);
        if (!layer) return null;

        if (layer.isDirty) {
            layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
            renderFunction(layer.context);
            layer.isDirty = false;
            this.dirtyLayers.delete(layerId);
        }

        return layer.canvas;
    }

    // Composite all layers onto main canvas
    compositeLayers(layerOrder) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        layerOrder.forEach(layerId => {
            const layer = this.layerCache.get(layerId);
            if (layer) {
                this.ctx.drawImage(layer.canvas, 0, 0);
            }
        });
    }

    // Batch canvas operations for better performance
    batchOperations(operations) {
        this.ctx.save();

        operations.forEach(operation => {
            try {
                operation(this.ctx);
            } catch (error) {
                console.error('Error in batched canvas operation:', error);
            }
        });

        this.ctx.restore();
    }

    // Optimize path rendering
    optimizePath(points, tolerance = 1) {
        if (points.length <= 2) return points;

        // Douglas-Peucker algorithm for path simplification
        return this.douglasPeucker(points, tolerance);
    }

    douglasPeucker(points, tolerance) {
        if (points.length <= 2) return points;

        let maxDistance = 0;
        let maxIndex = 0;

        for (let i = 1; i < points.length - 1; i++) {
            const distance = this.perpendicularDistance(
                points[i],
                points[0],
                points[points.length - 1]
            );

            if (distance > maxDistance) {
                maxDistance = distance;
                maxIndex = i;
            }
        }

        if (maxDistance > tolerance) {
            const left = this.douglasPeucker(points.slice(0, maxIndex + 1), tolerance);
            const right = this.douglasPeucker(points.slice(maxIndex), tolerance);

            return left.slice(0, -1).concat(right);
        } else {
            return [points[0], points[points.length - 1]];
        }
    }

    perpendicularDistance(point, lineStart, lineEnd) {
        const dx = lineEnd.x - lineStart.x;
        const dy = lineEnd.y - lineStart.y;

        if (dx === 0 && dy === 0) {
            return Math.sqrt(
                Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2)
            );
        }

        const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy);
        const projection = {
            x: lineStart.x + t * dx,
            y: lineStart.y + t * dy
        };

        return Math.sqrt(
            Math.pow(point.x - projection.x, 2) + Math.pow(point.y - projection.y, 2)
        );
    }

    // Clean up resources
    destroy() {
        this.layerCache.clear();
        this.dirtyLayers.clear();
        this.offscreenCanvas = null;
        this.offscreenCtx = null;
    }
}

// Animation optimization utilities
export class ChartAnimationOptimizer {
    constructor() {
        this.activeAnimations = new Map();
        this.animationQueue = [];
        this.isAnimating = false;
        this.frameId = null;
    }

    // Create optimized animation
    createAnimation(id, config) {
        const animation = {
            id,
            startTime: null,
            duration: config.duration || 300,
            easing: config.easing || this.easeInOutCubic,
            from: config.from,
            to: config.to,
            onUpdate: config.onUpdate,
            onComplete: config.onComplete,
            isActive: true
        };

        this.activeAnimations.set(id, animation);

        if (!this.isAnimating) {
            this.startAnimationLoop();
        }

        return animation;
    }

    // Start animation loop
    startAnimationLoop() {
        this.isAnimating = true;
        this.frameId = requestAnimationFrame((timestamp) => this.animationLoop(timestamp));
    }

    // Animation loop
    animationLoop(timestamp) {
        let hasActiveAnimations = false;

        this.activeAnimations.forEach((animation) => {
            if (!animation.isActive) return;

            if (animation.startTime === null) {
                animation.startTime = timestamp;
            }

            const elapsed = timestamp - animation.startTime;
            const progress = Math.min(elapsed / animation.duration, 1);
            const easedProgress = animation.easing(progress);

            // Calculate current values
            const currentValues = {};
            Object.keys(animation.from).forEach(key => {
                const from = animation.from[key];
                const to = animation.to[key];
                currentValues[key] = from + (to - from) * easedProgress;
            });

            // Update animation
            if (animation.onUpdate) {
                animation.onUpdate(currentValues, progress);
            }

            // Check if animation is complete
            if (progress >= 1) {
                animation.isActive = false;
                if (animation.onComplete) {
                    animation.onComplete();
                }
                this.activeAnimations.delete(animation.id);
            } else {
                hasActiveAnimations = true;
            }
        });

        if (hasActiveAnimations) {
            this.frameId = requestAnimationFrame((timestamp) => this.animationLoop(timestamp));
        } else {
            this.isAnimating = false;
            this.frameId = null;
        }
    }

    // Stop animation
    stopAnimation(id) {
        const animation = this.activeAnimations.get(id);
        if (animation) {
            animation.isActive = false;
            this.activeAnimations.delete(id);
        }
    }

    // Stop all animations
    stopAllAnimations() {
        this.activeAnimations.clear();
        this.isAnimating = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }

    // Easing functions
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    easeInOutQuart(t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    }

    // Check if reduced motion is preferred
    shouldReduceMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Create reduced motion animation
    createReducedMotionAnimation(id, config) {
        if (this.shouldReduceMotion()) {
            // Skip animation, go directly to end state
            if (config.onUpdate) {
                config.onUpdate(config.to, 1);
            }
            if (config.onComplete) {
                config.onComplete();
            }
            return null;
        }

        return this.createAnimation(id, config);
    }
}

// Export performance utilities
export const createPerformanceMonitor = () => new ChartPerformanceMonitor();
export const createDataOptimizer = () => new ChartDataOptimizer();
export const createRenderOptimizer = (canvas, context) => new ChartRenderOptimizer(canvas, context);
export const createAnimationOptimizer = () => new ChartAnimationOptimizer();

// Performance measurement decorator
export const measurePerformance = (target, propertyName, descriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args) {
        const startTime = performance.now();
        const result = originalMethod.apply(this, args);
        const endTime = performance.now();

        if (this.performanceMonitor) {
            this.performanceMonitor.recordRenderTime(endTime - startTime);
        }

        return result;
    };

    return descriptor;
};

// Throttle function for performance optimization
export const throttle = (func, limit) => {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Debounce function for performance optimization
export const debounce = (func, delay) => {
    let timeoutId;
    return function () {
        const args = arguments;
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), delay);
    };
};