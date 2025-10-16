/**
 * Performance Optimization Utilities
 * Tools for automatic performance optimization and fallback modes
 */

/**
 * Automatic Performance Optimizer
 * Monitors performance and applies optimizations automatically
 */
export class PerformanceOptimizer {
    constructor(config = {}) {
        this.config = {
            enableAutoFallback: true,
            enableVirtualization: true,
            enableCaching: true,
            enableBudgetEnforcement: true,
            fallbackThresholds: {
                frameRate: 20,
                memoryUsage: 80,
                renderTime: 50
            },
            ...config
        };

        this.isOptimizing = false;
        this.optimizations = new Map();
        this.cache = new Map();
        this.virtualizedComponents = new Set();
    }

    /**
     * Enable automatic performance optimizations
     */
    enable() {
        this.isOptimizing = true;
    }

    /**
     * Disable automatic performance optimizations
     */
    disable() {
        this.isOptimizing = false;
        this.clearOptimizations();
    }

    /**
     * Apply optimizations based on current performance metrics
     */
    optimize(metrics) {
        if (!this.isOptimizing) return [];

        const optimizations = [];

        // Check for frame rate issues
        if (metrics.frameRate < this.config.fallbackThresholds.frameRate) {
            optimizations.push(this.optimizeFrameRate());
        }

        // Check for memory issues
        if (metrics.memoryUsage?.percentage > this.config.fallbackThresholds.memoryUsage) {
            optimizations.push(this.optimizeMemoryUsage());
        }

        // Check for render time issues
        if (metrics.averageRenderTime > this.config.fallbackThresholds.renderTime) {
            optimizations.push(this.optimizeRenderTime());
        }

        return optimizations.filter(Boolean);
    }

    /**
     * Optimize frame rate by reducing visual complexity
     */
    optimizeFrameRate() {
        const optimization = {
            type: 'frameRate',
            actions: [],
            timestamp: performance.now()
        };

        // Reduce animation complexity
        if (this.config.enableAutoFallback) {
            optimization.actions.push('reduceAnimations');
            this.reduceAnimations();
        }

        // Enable virtualization for large lists
        if (this.config.enableVirtualization) {
            optimization.actions.push('enableVirtualization');
            this.enableVirtualization();
        }

        this.optimizations.set('frameRate', optimization);
        return optimization;
    }

    /**
     * Optimize memory usage
     */
    optimizeMemoryUsage() {
        const optimization = {
            type: 'memory',
            actions: [],
            timestamp: performance.now()
        };

        // Clear caches
        if (this.config.enableCaching) {
            optimization.actions.push('clearCaches');
            this.clearCaches();
        }

        // Force garbage collection if available
        if (window.gc) {
            optimization.actions.push('forceGC');
            window.gc();
        }

        // Reduce component complexity
        optimization.actions.push('reduceComplexity');
        this.reduceComponentComplexity();

        this.optimizations.set('memory', optimization);
        return optimization;
    }

    /**
     * Optimize render time
     */
    optimizeRenderTime() {
        const optimization = {
            type: 'renderTime',
            actions: [],
            timestamp: performance.now()
        };

        // Enable component memoization
        optimization.actions.push('enableMemoization');
        this.enableMemoization();

        // Reduce DOM complexity
        optimization.actions.push('reduceDOMComplexity');
        this.reduceDOMComplexity();

        this.optimizations.set('renderTime', optimization);
        return optimization;
    }

    /**
     * Reduce animation complexity
     */
    reduceAnimations() {
        // Add CSS class to reduce animations
        document.body.classList.add('performance-mode');

        // Inject CSS for reduced animations
        if (!document.getElementById('performance-optimizations')) {
            const style = document.createElement('style');
            style.id = 'performance-optimizations';
            style.textContent = `
                .performance-mode * {
                    animation-duration: 0.1s !important;
                    transition-duration: 0.1s !important;
                }
                .performance-mode .complex-animation {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Enable virtualization for large datasets
     */
    enableVirtualization() {
        // Find large lists and enable virtualization
        const largeLists = document.querySelectorAll('[data-large-list]');
        largeLists.forEach(list => {
            if (!this.virtualizedComponents.has(list)) {
                this.virtualizeComponent(list);
                this.virtualizedComponents.add(list);
            }
        });
    }

    /**
     * Virtualize a component
     */
    virtualizeComponent(element) {
        // Simple virtualization implementation
        const children = Array.from(element.children);
        if (children.length > 50) {
            // Hide elements that are not in viewport
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.display = '';
                    } else {
                        entry.target.style.display = 'none';
                    }
                });
            }, { rootMargin: '100px' });

            children.forEach(child => observer.observe(child));
        }
    }

    /**
     * Clear caches to free memory
     */
    clearCaches() {
        this.cache.clear();

        // Clear browser caches if possible
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    if (name.includes('performance-cache')) {
                        caches.delete(name);
                    }
                });
            });
        }
    }

    /**
     * Reduce component complexity
     */
    reduceComponentComplexity() {
        // Hide non-essential elements
        const nonEssential = document.querySelectorAll('[data-non-essential]');
        nonEssential.forEach(element => {
            element.style.display = 'none';
        });

        // Reduce image quality
        const images = document.querySelectorAll('img[data-high-quality]');
        images.forEach(img => {
            const lowQualitySrc = img.dataset.lowQuality;
            if (lowQualitySrc) {
                img.src = lowQualitySrc;
            }
        });
    }

    /**
     * Enable component memoization
     */
    enableMemoization() {
        // This would typically be handled at the React component level
        // Here we can add markers for components to enable memoization
        document.body.setAttribute('data-enable-memoization', 'true');
    }

    /**
     * Reduce DOM complexity
     */
    reduceDOMComplexity() {
        // Remove complex CSS effects
        const complexElements = document.querySelectorAll('.glassmorphism, .complex-shadow');
        complexElements.forEach(element => {
            element.classList.add('simplified');
        });

        // Inject simplified styles
        if (!document.getElementById('simplified-styles')) {
            const style = document.createElement('style');
            style.id = 'simplified-styles';
            style.textContent = `
                .simplified {
                    backdrop-filter: none !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
                    border-radius: 4px !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Clear all optimizations
     */
    clearOptimizations() {
        // Remove performance mode
        document.body.classList.remove('performance-mode');
        document.body.removeAttribute('data-enable-memoization');

        // Remove injected styles
        const performanceStyles = document.getElementById('performance-optimizations');
        if (performanceStyles) {
            performanceStyles.remove();
        }

        const simplifiedStyles = document.getElementById('simplified-styles');
        if (simplifiedStyles) {
            simplifiedStyles.remove();
        }

        // Restore hidden elements
        const hiddenElements = document.querySelectorAll('[style*="display: none"]');
        hiddenElements.forEach(element => {
            if (element.dataset.nonEssential) {
                element.style.display = '';
            }
        });

        // Restore complex elements
        const simplifiedElements = document.querySelectorAll('.simplified');
        simplifiedElements.forEach(element => {
            element.classList.remove('simplified');
        });

        // Clear virtualization
        this.virtualizedComponents.clear();
        this.optimizations.clear();
    }

    /**
     * Get current optimizations
     */
    getOptimizations() {
        return Array.from(this.optimizations.values());
    }

    /**
     * Check if specific optimization is active
     */
    isOptimizationActive(type) {
        return this.optimizations.has(type);
    }
}

/**
 * Intelligent caching system with advanced invalidation strategies
 */
export class IntelligentCache {
    constructor(config = {}) {
        this.config = {
            maxSize: 100,
            ttl: 300000, // 5 minutes
            enableLRU: true,
            enableCompression: false,
            enableTagging: true,
            enableDependencyTracking: true,
            invalidationStrategies: ['ttl', 'lru', 'dependency', 'manual'],
            ...config
        };

        this.cache = new Map();
        this.accessTimes = new Map();
        this.tags = new Map(); // key -> Set of tags
        this.taggedKeys = new Map(); // tag -> Set of keys
        this.dependencies = new Map(); // key -> Set of dependency keys
        this.dependents = new Map(); // key -> Set of dependent keys
        this.hitCount = 0;
        this.missCount = 0;
        this.invalidationCount = 0;
        this.compressionRatio = 0;
    }

    /**
     * Get item from cache with enhanced tracking
     */
    get(key) {
        const item = this.cache.get(key);

        if (!item) {
            this.missCount++;
            return null;
        }

        // Check TTL
        const age = Date.now() - item.timestamp;
        if (age > item.ttl) {
            this.invalidate(key, 'ttl');
            this.missCount++;
            return null;
        }

        // Update access tracking
        item.accessCount++;
        if (this.config.enableLRU) {
            this.accessTimes.set(key, Date.now());
        }

        this.hitCount++;

        // Decompress if needed
        const data = this.config.enableCompression ? this.decompress(item.data) : item.data;
        return data;
    }

    /**
     * Set item in cache with advanced options
     */
    set(key, data, options = {}) {
        const {
            ttl = this.config.ttl,
            tags = [],
            dependencies = [],
            priority = 'normal'
        } = options;

        // Check if we need to evict items
        if (this.cache.size >= this.config.maxSize) {
            this.evictLRU();
        }

        const originalSize = JSON.stringify(data).length;
        const compressedData = this.config.enableCompression ? this.compress(data) : data;
        const compressedSize = typeof compressedData === 'string' ? compressedData.length : originalSize;

        const item = {
            data: compressedData,
            timestamp: Date.now(),
            ttl,
            priority,
            accessCount: 0,
            originalSize,
            compressedSize
        };

        this.cache.set(key, item);
        this.accessTimes.set(key, Date.now());

        // Handle tags
        if (this.config.enableTagging && tags.length > 0) {
            this.tags.set(key, new Set(tags));
            tags.forEach(tag => {
                if (!this.taggedKeys.has(tag)) {
                    this.taggedKeys.set(tag, new Set());
                }
                this.taggedKeys.get(tag).add(key);
            });
        }

        // Handle dependencies
        if (this.config.enableDependencyTracking && dependencies.length > 0) {
            this.dependencies.set(key, new Set(dependencies));
            dependencies.forEach(dep => {
                if (!this.dependents.has(dep)) {
                    this.dependents.set(dep, new Set());
                }
                this.dependents.get(dep).add(key);
            });
        }

        // Update compression ratio
        if (this.config.enableCompression) {
            this.compressionRatio = compressedSize / originalSize;
        }
    }

    /**
     * Evict least recently used item
     */
    evictLRU() {
        if (!this.config.enableLRU || this.accessTimes.size === 0) {
            // Simple FIFO if LRU is disabled
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
            return;
        }

        let oldestKey = null;
        let oldestTime = Date.now();

        for (const [key, time] of this.accessTimes) {
            if (time < oldestTime) {
                oldestTime = time;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.accessTimes.delete(oldestKey);
        }
    }

    /**
     * Simple compression (placeholder)
     */
    compress(data) {
        // In a real implementation, you might use a compression library
        return JSON.stringify(data);
    }

    /**
     * Simple decompression (placeholder)
     */
    decompress(data) {
        try {
            return JSON.parse(data);
        } catch {
            return data;
        }
    }

    /**
     * Clear cache
     */
    clear() {
        this.cache.clear();
        this.accessTimes.clear();
        this.hitCount = 0;
        this.missCount = 0;
    }

    /**
     * Get comprehensive cache statistics
     */
    getStats() {
        const total = this.hitCount + this.missCount;
        const memoryUsage = this.calculateMemoryUsage();

        return {
            // Basic stats
            size: this.cache.size,
            maxSize: this.config.maxSize,
            utilization: this.cache.size / this.config.maxSize,

            // Hit/miss stats
            hitRate: total > 0 ? this.hitCount / total : 0,
            hitCount: this.hitCount,
            missCount: this.missCount,
            invalidationCount: this.invalidationCount,

            // Memory stats
            memoryUsage,
            compressionRatio: this.compressionRatio,

            // Advanced stats
            averageAge: this.calculateAverageAge(),
            tagCount: this.taggedKeys.size,
            dependencyCount: this.dependencies.size,

            // Performance indicators
            efficiency: this.calculateEfficiency(),
            healthScore: this.calculateHealthScore()
        };
    }

    /**
     * Calculate memory usage of cache
     */
    calculateMemoryUsage() {
        let totalOriginalSize = 0;
        let totalCompressedSize = 0;

        for (const item of this.cache.values()) {
            totalOriginalSize += item.originalSize || 0;
            totalCompressedSize += item.compressedSize || item.originalSize || 0;
        }

        return {
            originalSize: totalOriginalSize,
            compressedSize: totalCompressedSize,
            savedBytes: totalOriginalSize - totalCompressedSize,
            compressionRatio: totalOriginalSize > 0 ? totalCompressedSize / totalOriginalSize : 1
        };
    }

    /**
     * Calculate average age of cache items
     */
    calculateAverageAge() {
        if (this.cache.size === 0) return 0;

        const now = Date.now();
        let totalAge = 0;

        for (const item of this.cache.values()) {
            totalAge += now - item.timestamp;
        }

        return totalAge / this.cache.size;
    }

    /**
     * Calculate cache efficiency
     */
    calculateEfficiency() {
        const stats = this.getStats();

        // Efficiency based on hit rate, utilization, and memory savings
        let efficiency = 0;

        // Hit rate component (40%)
        efficiency += stats.hitRate * 40;

        // Utilization component (30%) - optimal around 80%
        const utilizationScore = stats.utilization <= 0.8 ?
            stats.utilization * 100 :
            100 - ((stats.utilization - 0.8) * 100);
        efficiency += utilizationScore * 0.3;

        // Compression component (20%)
        const compressionScore = this.config.enableCompression ?
            (1 - stats.compressionRatio) * 100 :
            0;
        efficiency += compressionScore * 0.2;

        // Age component (10%) - fresher cache is better
        const avgAgeHours = stats.averageAge / (1000 * 60 * 60);
        const ageScore = Math.max(0, 100 - (avgAgeHours * 10));
        efficiency += ageScore * 0.1;

        return Math.min(100, Math.max(0, efficiency));
    }

    /**
     * Calculate overall cache health score
     */
    calculateHealthScore() {
        const stats = this.getStats();
        let health = 100;

        // Deduct for low hit rate
        if (stats.hitRate < 0.5) {
            health -= (0.5 - stats.hitRate) * 100;
        }

        // Deduct for high memory usage
        if (stats.utilization > 0.9) {
            health -= (stats.utilization - 0.9) * 200;
        }

        // Deduct for high invalidation rate
        const invalidationRate = stats.invalidationCount / Math.max(1, stats.hitCount + stats.missCount);
        if (invalidationRate > 0.1) {
            health -= (invalidationRate - 0.1) * 100;
        }

        return Math.min(100, Math.max(0, health));
    }

    /**
     * Get cache analysis and recommendations
     */
    getAnalysis() {
        const stats = this.getStats();
        const recommendations = [];

        // Hit rate analysis
        if (stats.hitRate < 0.6) {
            recommendations.push({
                type: 'hitRate',
                severity: 'high',
                message: 'Low cache hit rate detected. Consider increasing cache size or TTL.',
                action: 'increaseCacheSize'
            });
        }

        // Memory usage analysis
        if (stats.utilization > 0.9) {
            recommendations.push({
                type: 'memory',
                severity: 'medium',
                message: 'Cache is near capacity. Consider enabling compression or increasing size.',
                action: 'enableCompression'
            });
        }

        // Compression analysis
        if (!this.config.enableCompression && stats.memoryUsage.originalSize > 1024 * 1024) {
            recommendations.push({
                type: 'compression',
                severity: 'low',
                message: 'Large cache detected. Enabling compression could save memory.',
                action: 'enableCompression'
            });
        }

        return {
            stats,
            recommendations,
            healthScore: stats.healthScore,
            efficiency: stats.efficiency
        };
    }

    /**
     * Invalidate cache entry and handle dependencies
     */
    invalidate(key, reason = 'manual') {
        if (!this.cache.has(key)) return false;

        // Remove from cache
        this.cache.delete(key);
        this.accessTimes.delete(key);
        this.invalidationCount++;

        // Handle tags
        if (this.tags.has(key)) {
            const keyTags = this.tags.get(key);
            keyTags.forEach(tag => {
                const taggedKeys = this.taggedKeys.get(tag);
                if (taggedKeys) {
                    taggedKeys.delete(key);
                    if (taggedKeys.size === 0) {
                        this.taggedKeys.delete(tag);
                    }
                }
            });
            this.tags.delete(key);
        }

        // Handle dependencies - invalidate dependents
        if (this.dependents.has(key)) {
            const dependentKeys = Array.from(this.dependents.get(key));
            dependentKeys.forEach(depKey => {
                this.invalidate(depKey, 'dependency');
            });
            this.dependents.delete(key);
        }

        // Clean up dependency references
        if (this.dependencies.has(key)) {
            const deps = this.dependencies.get(key);
            deps.forEach(dep => {
                const depDependents = this.dependents.get(dep);
                if (depDependents) {
                    depDependents.delete(key);
                    if (depDependents.size === 0) {
                        this.dependents.delete(dep);
                    }
                }
            });
            this.dependencies.delete(key);
        }

        return true;
    }

    /**
     * Invalidate by tag
     */
    invalidateByTag(tag) {
        if (!this.taggedKeys.has(tag)) return 0;

        const keysToInvalidate = Array.from(this.taggedKeys.get(tag));
        let invalidatedCount = 0;

        keysToInvalidate.forEach(key => {
            if (this.invalidate(key, 'tag')) {
                invalidatedCount++;
            }
        });

        return invalidatedCount;
    }

    /**
     * Invalidate by pattern
     */
    invalidateByPattern(pattern) {
        const regex = new RegExp(pattern);
        const keysToInvalidate = [];

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                keysToInvalidate.push(key);
            }
        }

        let invalidatedCount = 0;
        keysToInvalidate.forEach(key => {
            if (this.invalidate(key, 'pattern')) {
                invalidatedCount++;
            }
        });

        return invalidatedCount;
    }

    /**
     * Invalidate expired items with enhanced cleanup
     */
    cleanup() {
        const now = Date.now();
        const expiredKeys = [];

        for (const [key, item] of this.cache) {
            const age = now - item.timestamp;
            if (age > item.ttl) {
                expiredKeys.push(key);
            }
        }

        let cleanedCount = 0;
        expiredKeys.forEach(key => {
            if (this.invalidate(key, 'ttl')) {
                cleanedCount++;
            }
        });

        return cleanedCount;
    }

    /**
     * Smart cleanup based on memory pressure
     */
    smartCleanup(memoryPressure = 'normal') {
        let targetReduction = 0;

        switch (memoryPressure) {
            case 'high':
                targetReduction = 0.5; // Remove 50% of cache
                break;
            case 'medium':
                targetReduction = 0.3; // Remove 30% of cache
                break;
            case 'low':
                targetReduction = 0.1; // Remove 10% of cache
                break;
            default:
                return this.cleanup(); // Just remove expired items
        }

        const targetSize = Math.floor(this.cache.size * (1 - targetReduction));
        const itemsToRemove = this.cache.size - targetSize;

        if (itemsToRemove <= 0) return 0;

        // Create priority list for removal
        const removalCandidates = [];

        for (const [key, item] of this.cache) {
            const age = Date.now() - item.timestamp;
            const accessFrequency = item.accessCount / Math.max(1, age / 60000); // accesses per minute
            const priority = this.calculateRemovalPriority(item, age, accessFrequency);

            removalCandidates.push({ key, priority, age, accessFrequency });
        }

        // Sort by removal priority (higher priority = more likely to be removed)
        removalCandidates.sort((a, b) => b.priority - a.priority);

        let removedCount = 0;
        for (let i = 0; i < Math.min(itemsToRemove, removalCandidates.length); i++) {
            if (this.invalidate(removalCandidates[i].key, 'memory-pressure')) {
                removedCount++;
            }
        }

        return removedCount;
    }

    /**
     * Calculate removal priority for smart cleanup
     */
    calculateRemovalPriority(item, age, accessFrequency) {
        let priority = 0;

        // Age factor (older items have higher removal priority)
        priority += age / item.ttl * 40;

        // Access frequency factor (less accessed items have higher removal priority)
        priority += (1 / Math.max(0.1, accessFrequency)) * 30;

        // Size factor (larger items have higher removal priority)
        priority += (item.compressedSize || item.originalSize || 0) / 1024 * 20; // KB

        // Priority factor (lower priority items have higher removal priority)
        const priorityMultiplier = {
            'low': 1.5,
            'normal': 1.0,
            'high': 0.5,
            'critical': 0.1
        };
        priority *= priorityMultiplier[item.priority] || 1.0;

        return priority;
    }
}

/**
 * Automatic fallback mode manager
 */
export class AutomaticFallbackManager {
    constructor(config = {}) {
        this.config = {
            enableAutoFallback: true,
            fallbackThresholds: {
                frameRate: { warning: 30, critical: 15 },
                renderTime: { warning: 16, critical: 33 },
                memoryUsage: { warning: 70, critical: 85 },
                networkLatency: { warning: 1000, critical: 3000 }
            },
            fallbackModes: {
                reduced: {
                    disableAnimations: true,
                    simplifyEffects: true,
                    reducePolling: true
                },
                minimal: {
                    disableAnimations: true,
                    simplifyEffects: true,
                    reducePolling: true,
                    hideNonEssential: true,
                    disableRealTime: true
                }
            },
            ...config
        };

        this.currentMode = 'normal';
        this.fallbackHistory = [];
        this.activeOptimizations = new Set();
    }

    /**
     * Evaluate performance and apply appropriate fallback mode
     */
    evaluateAndApplyFallback(metrics) {
        if (!this.config.enableAutoFallback) return this.currentMode;

        const newMode = this.determineFallbackMode(metrics);

        if (newMode !== this.currentMode) {
            this.applyFallbackMode(newMode, metrics);
        }

        return this.currentMode;
    }

    /**
     * Determine appropriate fallback mode based on metrics
     */
    determineFallbackMode(metrics) {
        const { frameRate, renderTime, memoryUsage, networkLatency } = metrics;
        const thresholds = this.config.fallbackThresholds;

        // Check for critical conditions requiring minimal mode
        if (
            (frameRate && frameRate.average < thresholds.frameRate.critical) ||
            (renderTime && renderTime.average > thresholds.renderTime.critical) ||
            (memoryUsage && memoryUsage.percentage > thresholds.memoryUsage.critical) ||
            (networkLatency && networkLatency.average > thresholds.networkLatency.critical)
        ) {
            return 'minimal';
        }

        // Check for warning conditions requiring reduced mode
        if (
            (frameRate && frameRate.average < thresholds.frameRate.warning) ||
            (renderTime && renderTime.average > thresholds.renderTime.warning) ||
            (memoryUsage && memoryUsage.percentage > thresholds.memoryUsage.warning) ||
            (networkLatency && networkLatency.average > thresholds.networkLatency.warning)
        ) {
            return 'reduced';
        }

        return 'normal';
    }

    /**
     * Apply fallback mode optimizations
     */
    applyFallbackMode(mode, metrics) {
        // Clear previous optimizations
        this.clearFallbackOptimizations();

        const previousMode = this.currentMode;
        this.currentMode = mode;

        // Record fallback event
        this.fallbackHistory.push({
            timestamp: performance.now(),
            fromMode: previousMode,
            toMode: mode,
            metrics: { ...metrics },
            reason: this.getFallbackReason(metrics)
        });

        // Apply mode-specific optimizations
        switch (mode) {
            case 'reduced':
                this.applyReducedMode();
                break;
            case 'minimal':
                this.applyMinimalMode();
                break;
            case 'normal':
                this.applyNormalMode();
                break;
        }

        // Dispatch custom event for components to react
        window.dispatchEvent(new CustomEvent('performanceFallback', {
            detail: { mode, previousMode, metrics }
        }));
    }

    /**
     * Apply reduced performance mode
     */
    applyReducedMode() {
        const optimizations = this.config.fallbackModes.reduced;

        if (optimizations.disableAnimations) {
            this.disableAnimations();
            this.activeOptimizations.add('disableAnimations');
        }

        if (optimizations.simplifyEffects) {
            this.simplifyVisualEffects();
            this.activeOptimizations.add('simplifyEffects');
        }

        if (optimizations.reducePolling) {
            this.reducePollingFrequency();
            this.activeOptimizations.add('reducePolling');
        }
    }

    /**
     * Apply minimal performance mode
     */
    applyMinimalMode() {
        // Apply all reduced mode optimizations
        this.applyReducedMode();

        const optimizations = this.config.fallbackModes.minimal;

        if (optimizations.hideNonEssential) {
            this.hideNonEssentialElements();
            this.activeOptimizations.add('hideNonEssential');
        }

        if (optimizations.disableRealTime) {
            this.disableRealTimeUpdates();
            this.activeOptimizations.add('disableRealTime');
        }
    }

    /**
     * Apply normal performance mode
     */
    applyNormalMode() {
        this.clearFallbackOptimizations();
    }

    /**
     * Disable animations for performance
     */
    disableAnimations() {
        document.body.classList.add('performance-fallback-reduced-animations');

        if (!document.getElementById('fallback-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'fallback-animation-styles';
            style.textContent = `
                .performance-fallback-reduced-animations * {
                    animation-duration: 0.1s !important;
                    transition-duration: 0.1s !important;
                }
                .performance-fallback-reduced-animations .complex-animation {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Simplify visual effects
     */
    simplifyVisualEffects() {
        document.body.classList.add('performance-fallback-simplified-effects');

        if (!document.getElementById('fallback-effects-styles')) {
            const style = document.createElement('style');
            style.id = 'fallback-effects-styles';
            style.textContent = `
                .performance-fallback-simplified-effects .glassmorphism {
                    backdrop-filter: none !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                .performance-fallback-simplified-effects .complex-shadow {
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
                }
                .performance-fallback-simplified-effects .gradient-background {
                    background: #f5f5f5 !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Reduce polling frequency for real-time data
     */
    reducePollingFrequency() {
        window.dispatchEvent(new CustomEvent('reducePollingFrequency', {
            detail: { factor: 0.5 } // Reduce by 50%
        }));
    }

    /**
     * Hide non-essential UI elements
     */
    hideNonEssentialElements() {
        document.body.classList.add('performance-fallback-minimal');

        if (!document.getElementById('fallback-minimal-styles')) {
            const style = document.createElement('style');
            style.id = 'fallback-minimal-styles';
            style.textContent = `
                .performance-fallback-minimal [data-non-essential="true"] {
                    display: none !important;
                }
                .performance-fallback-minimal .decorative-element {
                    display: none !important;
                }
                .performance-fallback-minimal .secondary-info {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Disable real-time updates
     */
    disableRealTimeUpdates() {
        window.dispatchEvent(new CustomEvent('disableRealTimeUpdates'));
    }

    /**
     * Clear all fallback optimizations
     */
    clearFallbackOptimizations() {
        // Remove CSS classes
        document.body.classList.remove(
            'performance-fallback-reduced-animations',
            'performance-fallback-simplified-effects',
            'performance-fallback-minimal'
        );

        // Remove injected styles
        const stylesToRemove = [
            'fallback-animation-styles',
            'fallback-effects-styles',
            'fallback-minimal-styles'
        ];

        stylesToRemove.forEach(id => {
            const style = document.getElementById(id);
            if (style) style.remove();
        });

        // Restore normal operations
        window.dispatchEvent(new CustomEvent('restoreNormalMode'));

        this.activeOptimizations.clear();
    }

    /**
     * Get reason for fallback mode change
     */
    getFallbackReason(metrics) {
        const reasons = [];
        const thresholds = this.config.fallbackThresholds;

        if (metrics.frameRate && metrics.frameRate.average < thresholds.frameRate.warning) {
            reasons.push(`Low frame rate: ${metrics.frameRate.average.toFixed(1)} FPS`);
        }

        if (metrics.renderTime && metrics.renderTime.average > thresholds.renderTime.warning) {
            reasons.push(`High render time: ${metrics.renderTime.average.toFixed(1)}ms`);
        }

        if (metrics.memoryUsage && metrics.memoryUsage.percentage > thresholds.memoryUsage.warning) {
            reasons.push(`High memory usage: ${metrics.memoryUsage.percentage.toFixed(1)}%`);
        }

        return reasons.join(', ');
    }

    /**
     * Get current fallback status
     */
    getStatus() {
        return {
            currentMode: this.currentMode,
            activeOptimizations: Array.from(this.activeOptimizations),
            fallbackHistory: this.fallbackHistory.slice(-10), // Last 10 events
            isInFallbackMode: this.currentMode !== 'normal'
        };
    }

    /**
     * Force fallback mode (for testing)
     */
    forceFallbackMode(mode) {
        this.applyFallbackMode(mode, { forced: true });
    }

    /**
     * Reset to normal mode
     */
    resetToNormal() {
        this.applyFallbackMode('normal', { reset: true });
    }
}

/**
 * Performance budget enforcer with automated actions
 */
export class AutomatedPerformanceBudget {
    constructor(budgets = {}, optimizer = null) {
        this.budgets = {
            maxRenderTime: 16,
            maxMemoryUsage: 100 * 1024 * 1024,
            minFrameRate: 30,
            maxBundleSize: 2 * 1024 * 1024,
            maxNetworkRequests: 50,
            maxComponentCount: 1000,
            maxDOMNodes: 5000,
            ...budgets
        };

        this.optimizer = optimizer || new PerformanceOptimizer();
        this.fallbackManager = new AutomaticFallbackManager();
        this.violations = [];
        this.actions = [];
        this.enforcementHistory = [];
    }

    /**
     * Check budget and take automated actions
     */
    enforceBudget(metrics) {
        const violations = this.checkBudget(metrics);
        const enforcementResult = {
            timestamp: performance.now(),
            violations,
            actions: [],
            fallbackMode: null
        };

        if (violations.length > 0) {
            // Take automated optimization actions
            const optimizationActions = this.takeAutomatedActions(violations, metrics);
            enforcementResult.actions.push(...optimizationActions);

            // Apply fallback mode if needed
            const fallbackMode = this.fallbackManager.evaluateAndApplyFallback(metrics);
            enforcementResult.fallbackMode = fallbackMode;

            // Record enforcement event
            this.enforcementHistory.push(enforcementResult);

            // Trigger performance alerts
            this.triggerPerformanceAlerts(violations);
        }

        this.actions.push(...enforcementResult.actions);
        return enforcementResult;
    }

    /**
     * Trigger performance alerts for violations
     */
    triggerPerformanceAlerts(violations) {
        violations.forEach(violation => {
            const alertEvent = new CustomEvent('performanceViolation', {
                detail: {
                    type: violation.type,
                    severity: violation.severity,
                    budget: violation.budget,
                    actual: violation.actual,
                    timestamp: violation.timestamp
                }
            });
            window.dispatchEvent(alertEvent);
        });
    }

    /**
     * Check performance budget with comprehensive metrics
     */
    checkBudget(metrics) {
        const violations = [];
        const timestamp = performance.now();

        // Check render time budget
        if (metrics.renderTime && metrics.renderTime.average > this.budgets.maxRenderTime) {
            violations.push({
                type: 'renderTime',
                budget: this.budgets.maxRenderTime,
                actual: metrics.renderTime.average,
                severity: metrics.renderTime.average > this.budgets.maxRenderTime * 2 ? 'critical' : 'warning',
                timestamp,
                impact: 'User experience degradation',
                recommendation: 'Enable component memoization and reduce DOM complexity'
            });
        }

        // Check memory budget
        if (metrics.memory && metrics.memory.used > this.budgets.maxMemoryUsage) {
            violations.push({
                type: 'memoryUsage',
                budget: this.budgets.maxMemoryUsage,
                actual: metrics.memory.used,
                severity: metrics.memory.used > this.budgets.maxMemoryUsage * 1.5 ? 'critical' : 'warning',
                timestamp,
                impact: 'Potential memory leaks and browser crashes',
                recommendation: 'Clear caches and reduce component complexity'
            });
        }

        // Check frame rate budget
        if (metrics.frameRate && metrics.frameRate.average < this.budgets.minFrameRate) {
            violations.push({
                type: 'frameRate',
                budget: this.budgets.minFrameRate,
                actual: metrics.frameRate.average,
                severity: metrics.frameRate.average < this.budgets.minFrameRate * 0.5 ? 'critical' : 'warning',
                timestamp,
                impact: 'Choppy animations and poor responsiveness',
                recommendation: 'Reduce animation complexity and enable virtualization'
            });
        }

        // Check component count budget
        if (metrics.componentCount && metrics.componentCount > this.budgets.maxComponentCount) {
            violations.push({
                type: 'componentCount',
                budget: this.budgets.maxComponentCount,
                actual: metrics.componentCount,
                severity: metrics.componentCount > this.budgets.maxComponentCount * 2 ? 'critical' : 'warning',
                timestamp,
                impact: 'Increased memory usage and slower rendering',
                recommendation: 'Implement component virtualization for large lists'
            });
        }

        // Check DOM node count budget
        if (metrics.domNodes && metrics.domNodes > this.budgets.maxDOMNodes) {
            violations.push({
                type: 'domNodes',
                budget: this.budgets.maxDOMNodes,
                actual: metrics.domNodes,
                severity: metrics.domNodes > this.budgets.maxDOMNodes * 2 ? 'critical' : 'warning',
                timestamp,
                impact: 'Slower DOM operations and layout thrashing',
                recommendation: 'Reduce DOM complexity and use virtual scrolling'
            });
        }

        // Check network request budget
        if (metrics.networkRequests && metrics.networkRequests.count > this.budgets.maxNetworkRequests) {
            violations.push({
                type: 'networkRequests',
                budget: this.budgets.maxNetworkRequests,
                actual: metrics.networkRequests.count,
                severity: metrics.networkRequests.count > this.budgets.maxNetworkRequests * 2 ? 'critical' : 'warning',
                timestamp,
                impact: 'Network congestion and slower data loading',
                recommendation: 'Implement request batching and caching'
            });
        }

        // Check bundle size budget (if available)
        if (metrics.bundleSize && metrics.bundleSize > this.budgets.maxBundleSize) {
            violations.push({
                type: 'bundleSize',
                budget: this.budgets.maxBundleSize,
                actual: metrics.bundleSize,
                severity: metrics.bundleSize > this.budgets.maxBundleSize * 1.5 ? 'critical' : 'warning',
                timestamp,
                impact: 'Slower initial page load',
                recommendation: 'Implement code splitting and lazy loading'
            });
        }

        this.violations = violations;
        return violations;
    }

    /**
     * Take automated actions based on violations
     */
    takeAutomatedActions(violations, metrics) {
        const actions = [];

        violations.forEach(violation => {
            const actionConfig = {
                type: violation.type,
                severity: violation.severity,
                timestamp: performance.now(),
                automatic: true
            };

            switch (violation.type) {
                case 'renderTime':
                    if (violation.severity === 'critical') {
                        actions.push({
                            ...actionConfig,
                            action: 'optimizeRenderTime',
                            result: this.optimizer.optimizeRenderTime()
                        });
                    }
                    break;

                case 'memoryUsage':
                    if (violation.severity === 'critical') {
                        actions.push({
                            ...actionConfig,
                            action: 'optimizeMemoryUsage',
                            result: this.optimizer.optimizeMemoryUsage()
                        });

                        // Force garbage collection if available
                        if (window.gc) {
                            actions.push({
                                ...actionConfig,
                                action: 'forceGarbageCollection',
                                result: { type: 'gc', executed: true }
                            });
                            window.gc();
                        }
                    }
                    break;

                case 'frameRate':
                    if (violation.severity === 'critical') {
                        actions.push({
                            ...actionConfig,
                            action: 'optimizeFrameRate',
                            result: this.optimizer.optimizeFrameRate()
                        });
                    }
                    break;

                case 'componentCount':
                    if (violation.severity === 'warning' || violation.severity === 'critical') {
                        actions.push({
                            ...actionConfig,
                            action: 'enableVirtualization',
                            result: this.enableComponentVirtualization()
                        });
                    }
                    break;

                case 'domNodes':
                    if (violation.severity === 'critical') {
                        actions.push({
                            ...actionConfig,
                            action: 'reduceDOMComplexity',
                            result: this.optimizer.reduceDOMComplexity()
                        });
                    }
                    break;

                case 'networkRequests':
                    if (violation.severity === 'warning' || violation.severity === 'critical') {
                        actions.push({
                            ...actionConfig,
                            action: 'enableRequestBatching',
                            result: this.enableRequestBatching()
                        });
                    }
                    break;

                case 'bundleSize':
                    // Bundle size violations require build-time actions
                    actions.push({
                        ...actionConfig,
                        action: 'recommendCodeSplitting',
                        result: { type: 'recommendation', message: 'Consider implementing code splitting' }
                    });
                    break;
            }
        });

        return actions.filter(action => action.result);
    }

    /**
     * Enable component virtualization for large lists
     */
    enableComponentVirtualization() {
        const largeLists = document.querySelectorAll('[data-large-list="true"]');
        let virtualizedCount = 0;

        largeLists.forEach(list => {
            const itemCount = list.children.length;
            if (itemCount > 100) {
                // Add virtualization marker
                list.setAttribute('data-virtualized', 'true');
                virtualizedCount++;

                // Dispatch event for React components to handle
                list.dispatchEvent(new CustomEvent('enableVirtualization', {
                    detail: { itemCount }
                }));
            }
        });

        return {
            type: 'virtualization',
            virtualizedLists: virtualizedCount,
            executed: virtualizedCount > 0
        };
    }

    /**
     * Enable request batching to reduce network overhead
     */
    enableRequestBatching() {
        // Dispatch global event to enable request batching
        window.dispatchEvent(new CustomEvent('enableRequestBatching', {
            detail: {
                batchSize: 10,
                batchDelay: 100 // ms
            }
        }));

        return {
            type: 'requestBatching',
            enabled: true,
            executed: true
        };
    }

    /**
     * Get violation history
     */
    getViolations() {
        return this.violations;
    }

    /**
     * Get action history
     */
    getActions() {
        return this.actions;
    }

    /**
     * Get enforcement history
     */
    getEnforcementHistory() {
        return this.enforcementHistory.slice(-50); // Last 50 enforcement events
    }

    /**
     * Get comprehensive budget status
     */
    getBudgetStatus(metrics) {
        const status = {
            timestamp: performance.now(),
            budgets: { ...this.budgets },
            currentMetrics: metrics,
            violations: this.violations,
            fallbackMode: this.fallbackManager.getStatus(),
            compliance: this.calculateCompliance(metrics),
            recommendations: this.generateRecommendations(metrics)
        };

        return status;
    }

    /**
     * Calculate budget compliance percentage
     */
    calculateCompliance(metrics) {
        const budgetChecks = [
            { key: 'renderTime', metric: metrics.renderTime?.average, budget: this.budgets.maxRenderTime, invert: true },
            { key: 'memoryUsage', metric: metrics.memory?.used, budget: this.budgets.maxMemoryUsage, invert: true },
            { key: 'frameRate', metric: metrics.frameRate?.average, budget: this.budgets.minFrameRate, invert: false },
            { key: 'componentCount', metric: metrics.componentCount, budget: this.budgets.maxComponentCount, invert: true },
            { key: 'domNodes', metric: metrics.domNodes, budget: this.budgets.maxDOMNodes, invert: true }
        ];

        let totalScore = 0;
        let validChecks = 0;

        budgetChecks.forEach(check => {
            if (check.metric !== undefined && check.metric !== null) {
                validChecks++;

                if (check.invert) {
                    // Lower is better (render time, memory usage, etc.)
                    const score = Math.max(0, Math.min(100, (1 - (check.metric / check.budget)) * 100));
                    totalScore += score;
                } else {
                    // Higher is better (frame rate)
                    const score = Math.max(0, Math.min(100, (check.metric / check.budget) * 100));
                    totalScore += score;
                }
            }
        });

        return validChecks > 0 ? Math.round(totalScore / validChecks) : 100;
    }

    /**
     * Generate performance recommendations
     */
    generateRecommendations(metrics) {
        const recommendations = [];

        // Render time recommendations
        if (metrics.renderTime?.average > this.budgets.maxRenderTime * 0.8) {
            recommendations.push({
                type: 'renderTime',
                priority: 'high',
                message: 'Consider implementing React.memo for expensive components',
                action: 'enableMemoization'
            });
        }

        // Memory recommendations
        if (metrics.memory?.percentage > 60) {
            recommendations.push({
                type: 'memory',
                priority: 'medium',
                message: 'Monitor for memory leaks and implement cleanup in useEffect',
                action: 'memoryOptimization'
            });
        }

        // Frame rate recommendations
        if (metrics.frameRate?.average < this.budgets.minFrameRate * 1.2) {
            recommendations.push({
                type: 'frameRate',
                priority: 'high',
                message: 'Reduce animation complexity or enable performance mode',
                action: 'optimizeAnimations'
            });
        }

        // Component count recommendations
        if (metrics.componentCount > this.budgets.maxComponentCount * 0.8) {
            recommendations.push({
                type: 'componentCount',
                priority: 'medium',
                message: 'Implement virtualization for large lists and tables',
                action: 'enableVirtualization'
            });
        }

        return recommendations;
    }

    /**
     * Update budget values
     */
    updateBudgets(newBudgets) {
        this.budgets = { ...this.budgets, ...newBudgets };

        // Log budget update
        this.enforcementHistory.push({
            timestamp: performance.now(),
            type: 'budgetUpdate',
            oldBudgets: { ...this.budgets },
            newBudgets: { ...newBudgets }
        });
    }

    /**
     * Clear history
     */
    clearHistory() {
        this.violations = [];
        this.actions = [];
        this.enforcementHistory = [];
    }

    /**
     * Export budget configuration and history
     */
    exportBudgetData() {
        return {
            budgets: this.budgets,
            violations: this.violations,
            actions: this.actions,
            enforcementHistory: this.enforcementHistory,
            fallbackStatus: this.fallbackManager.getStatus(),
            exportTimestamp: performance.now()
        };
    }
}

/**
 * Component virtualization utility
 */
export class ComponentVirtualizer {
    constructor(config = {}) {
        this.config = {
            itemHeight: 50,
            containerHeight: 400,
            overscan: 5,
            threshold: 100, // Minimum items before virtualization
            ...config
        };

        this.virtualizedContainers = new Map();
    }

    /**
     * Virtualize a container with many items
     */
    virtualize(container, items) {
        if (items.length < this.config.threshold) {
            return; // Not worth virtualizing
        }

        const virtualContainer = {
            container,
            items,
            scrollTop: 0,
            visibleStart: 0,
            visibleEnd: 0,
            renderedItems: new Map()
        };

        this.setupVirtualization(virtualContainer);
        this.virtualizedContainers.set(container, virtualContainer);
    }

    /**
     * Setup virtualization for a container
     */
    setupVirtualization(virtualContainer) {
        const { container, items } = virtualContainer;

        // Set container styles
        container.style.height = `${this.config.containerHeight}px`;
        container.style.overflow = 'auto';
        container.style.position = 'relative';

        // Create virtual content
        const virtualContent = document.createElement('div');
        virtualContent.style.height = `${items.length * this.config.itemHeight}px`;
        virtualContent.style.position = 'relative';

        // Clear existing content
        container.innerHTML = '';
        container.appendChild(virtualContent);

        // Setup scroll handler
        container.addEventListener('scroll', () => {
            this.handleScroll(virtualContainer);
        });

        // Initial render
        this.updateVisibleItems(virtualContainer);
    }

    /**
     * Handle scroll events
     */
    handleScroll(virtualContainer) {
        const { container } = virtualContainer;
        virtualContainer.scrollTop = container.scrollTop;
        this.updateVisibleItems(virtualContainer);
    }

    /**
     * Update visible items based on scroll position
     */
    updateVisibleItems(virtualContainer) {
        const { container, items } = virtualContainer;
        const scrollTop = virtualContainer.scrollTop;

        // Calculate visible range
        const visibleStart = Math.max(0, Math.floor(scrollTop / this.config.itemHeight) - this.config.overscan);
        const visibleEnd = Math.min(
            items.length - 1,
            Math.ceil((scrollTop + this.config.containerHeight) / this.config.itemHeight) + this.config.overscan
        );

        virtualContainer.visibleStart = visibleStart;
        virtualContainer.visibleEnd = visibleEnd;

        // Remove items that are no longer visible
        for (const [index, element] of virtualContainer.renderedItems) {
            if (index < visibleStart || index > visibleEnd) {
                element.remove();
                virtualContainer.renderedItems.delete(index);
            }
        }

        // Add newly visible items
        for (let i = visibleStart; i <= visibleEnd; i++) {
            if (!virtualContainer.renderedItems.has(i)) {
                const element = this.createItemElement(items[i], i);
                element.style.position = 'absolute';
                element.style.top = `${i * this.config.itemHeight}px`;
                element.style.height = `${this.config.itemHeight}px`;
                element.style.width = '100%';

                container.firstChild.appendChild(element);
                virtualContainer.renderedItems.set(i, element);
            }
        }
    }

    /**
     * Create element for an item
     */
    createItemElement(item, index) {
        const element = document.createElement('div');
        element.className = 'virtual-item';
        element.setAttribute('data-index', index);

        if (typeof item === 'string') {
            element.textContent = item;
        } else if (item.innerHTML) {
            element.innerHTML = item.innerHTML;
        } else {
            element.textContent = JSON.stringify(item);
        }

        return element;
    }

    /**
     * Update items in a virtualized container
     */
    updateItems(container, newItems) {
        const virtualContainer = this.virtualizedContainers.get(container);
        if (!virtualContainer) return;

        virtualContainer.items = newItems;

        // Update virtual content height
        const virtualContent = container.firstChild;
        virtualContent.style.height = `${newItems.length * this.config.itemHeight}px`;

        // Clear rendered items
        virtualContainer.renderedItems.clear();
        virtualContent.innerHTML = '';

        // Re-render visible items
        this.updateVisibleItems(virtualContainer);
    }

    /**
     * Destroy virtualization for a container
     */
    destroy(container) {
        const virtualContainer = this.virtualizedContainers.get(container);
        if (!virtualContainer) return;

        // Remove event listeners
        container.removeEventListener('scroll', this.handleScroll);

        // Restore original content if possible
        container.style.height = '';
        container.style.overflow = '';
        container.style.position = '';

        this.virtualizedContainers.delete(container);
    }

    /**
     * Get virtualization statistics
     */
    getStats() {
        const stats = {
            totalContainers: this.virtualizedContainers.size,
            containers: []
        };

        for (const [container, virtualContainer] of this.virtualizedContainers) {
            stats.containers.push({
                totalItems: virtualContainer.items.length,
                renderedItems: virtualContainer.renderedItems.size,
                visibleRange: [virtualContainer.visibleStart, virtualContainer.visibleEnd],
                scrollTop: virtualContainer.scrollTop
            });
        }

        return stats;
    }
}

export default PerformanceOptimizer;