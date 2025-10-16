// Effects System Entry Point
// Advanced visual effects and animations for the design system

// Glassmorphism effects
export {
    createGlassmorphism,
    tradingGlassPresets,
    createMarketGlass,
    createFrostedGlass,
    createLiquidGlass,
    createHolographicGlass,
    glassAnimationKeyframes,
} from './glassmorphism';

// Animation system
export {
    animationPresets,
    staggerAnimations,
    tradingAnimations,
    pageTransitions,
    createResponsiveAnimation,
    easingFunctions,
    durations,
    createStateAnimations,
    gestureAnimations,
    performanceAnimations,
    cssKeyframes,
} from './animations';

// Micro-interactions
export {
    hoverEffects,
    tapEffects,
    focusEffects,
    loadingEffects,
    feedbackEffects,
    tradingMicroInteractions,
    gestureInteractions,
    createResponsiveMicroInteraction,
    combineMicroInteractions,
    createContextualInteraction,
    optimizedInteractions,
} from './microInteractions';

// Order book specific animations
export {
    priceFlashAnimations,
    orderLifecycleAnimations,
    depthBarAnimations,
    spreadAnimations,
    shimmerEffects,
    performanceOptimizedAnimations,
    createResponsiveOrderBookAnimation,
    orderBookSequences,
    triggerAnimationSequence,
} from './orderBookAnimations';

// Convenience exports
export { default as glassmorphism } from './glassmorphism';
export { default as animations } from './animations';
export { default as microInteractions } from './microInteractions';
export {
    default as orderBookAnimations,
    animationUtilities,
    animationPerformanceMonitor
} from './orderBookAnimations';

// Utility functions
export const shouldReduceMotion = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Trading color utilities
export const getTradingColor = (theme, value, type = 'change') => {
    if (type === 'change') {
        return value >= 0 ? theme.color.trading?.bull || theme.color.success[500] : theme.color.trading?.bear || theme.color.error[500];
    }
    return theme.color.primary[500];
};

// Format percentage utility
export const formatPercentage = (value, decimals = 2) => {
    if (typeof value !== 'number') return '0.00%';
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};