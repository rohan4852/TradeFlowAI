// Advanced Animation System
// Professional animations for trading interfaces

import { shouldReduceMotion } from '../index';

/**
 * Advanced animation presets with Framer Motion configurations
 */
export const animationPresets = {
    // Entrance animations
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3, ease: 'easeOut' },
    },

    slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },

    slideDown: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },

    slideLeft: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },

    slideRight: {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },

    scale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },

    scaleUp: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.1 },
        transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
    },

    // Trading-specific animations
    priceFlash: {
        initial: { scale: 1 },
        animate: { scale: [1, 1.05, 1] },
        transition: { duration: 0.6, ease: 'easeInOut' },
    },

    orderUpdate: {
        initial: { opacity: 0, x: -10 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 10 },
        transition: { duration: 0.3, ease: 'easeOut' },
    },

    chartUpdate: {
        initial: { pathLength: 0, opacity: 0 },
        animate: { pathLength: 1, opacity: 1 },
        transition: { duration: 1, ease: 'easeInOut' },
    },

    // Modal and overlay animations
    modalBackdrop: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
    },

    modalContent: {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },

    drawer: {
        initial: { x: '-100%' },
        animate: { x: 0 },
        exit: { x: '-100%' },
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },

    // Loading animations
    pulse: {
        animate: { scale: [1, 1.05, 1] },
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },

    bounce: {
        animate: { y: [0, -10, 0] },
        transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
    },

    spin: {
        animate: { rotate: 360 },
        transition: { duration: 1, repeat: Infinity, ease: 'linear' },
    },

    // Micro-interactions
    buttonHover: {
        whileHover: { scale: 1.02, y: -1 },
        whileTap: { scale: 0.98 },
        transition: { type: 'spring', stiffness: 400, damping: 17 },
    },

    cardHover: {
        whileHover: { y: -2, scale: 1.01 },
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },

    iconHover: {
        whileHover: { scale: 1.1, rotate: 5 },
        whileTap: { scale: 0.95 },
        transition: { type: 'spring', stiffness: 400, damping: 17 },
    },
};

/**
 * Stagger animation configurations
 */
export const staggerAnimations = {
    container: {
        animate: {
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    },

    fastContainer: {
        animate: {
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.05,
            },
        },
    },

    slowContainer: {
        animate: {
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.2,
            },
        },
    },

    item: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
};

/**
 * Trading-specific animation sequences
 */
export const tradingAnimations = {
    // Order book price level animations
    orderBookLevel: {
        layout: true,
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
        transition: { duration: 0.3, ease: 'easeOut' },
    },

    // Price change flash
    priceIncrease: {
        animate: {
            backgroundColor: ['transparent', '#10b98133', 'transparent'],
            scale: [1, 1.02, 1],
        },
        transition: { duration: 0.8, ease: 'easeInOut' },
    },

    priceDecrease: {
        animate: {
            backgroundColor: ['transparent', '#ef444433', 'transparent'],
            scale: [1, 1.02, 1],
        },
        transition: { duration: 0.8, ease: 'easeInOut' },
    },

    // Volume bar animation
    volumeBar: {
        initial: { scaleY: 0, originY: 1 },
        animate: { scaleY: 1 },
        transition: { duration: 0.6, ease: 'easeOut' },
    },

    // Chart line drawing
    chartLine: {
        initial: { pathLength: 0 },
        animate: { pathLength: 1 },
        transition: { duration: 2, ease: 'easeInOut' },
    },

    // Candlestick formation
    candlestick: {
        initial: { scaleY: 0, opacity: 0 },
        animate: { scaleY: 1, opacity: 1 },
        transition: { duration: 0.5, ease: 'easeOut' },
    },

    // Market status indicator
    marketOpen: {
        animate: {
            scale: [1, 1.1, 1],
            backgroundColor: ['#10b981', '#059669', '#10b981'],
        },
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },

    marketClosed: {
        animate: {
            opacity: [0.5, 1, 0.5],
        },
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
};

/**
 * Page transition animations
 */
export const pageTransitions = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3 },
    },

    slide: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },

    scale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.05 },
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
};

/**
 * Create responsive animation based on user preferences
 */
export const createResponsiveAnimation = (animation, fallback = {}) => {
    if (shouldReduceMotion()) {
        return {
            initial: fallback.initial || { opacity: 0 },
            animate: fallback.animate || { opacity: 1 },
            exit: fallback.exit || { opacity: 0 },
            transition: { duration: 0.1 },
        };
    }
    return animation;
};

/**
 * Animation timing functions
 */
export const easingFunctions = {
    // Standard easing
    linear: [0, 0, 1, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],

    // Custom easing for trading interfaces
    smooth: [0.25, 0.46, 0.45, 0.94],
    snappy: [0.68, -0.55, 0.265, 1.55],
    bounce: [0.34, 1.56, 0.64, 1],
    elastic: [0.175, 0.885, 0.32, 1.275],

    // Trading-specific easing
    priceMovement: [0.25, 0.1, 0.25, 1],
    orderExecution: [0.4, 0, 0.2, 1],
    chartUpdate: [0.25, 0.46, 0.45, 0.94],
};

/**
 * Animation duration presets
 */
export const durations = {
    instant: 0.1,
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    slower: 0.8,
    slowest: 1.2,

    // Trading-specific durations
    priceFlash: 0.6,
    orderUpdate: 0.3,
    chartTransition: 1.0,
    modalTransition: 0.3,
};

/**
 * Create animation variants for different states
 */
export const createStateAnimations = (baseAnimation, states = {}) => {
    const variants = {
        initial: baseAnimation.initial,
        animate: baseAnimation.animate,
        exit: baseAnimation.exit,
    };

    // Add custom states
    Object.entries(states).forEach(([stateName, stateAnimation]) => {
        variants[stateName] = stateAnimation;
    });

    return variants;
};

/**
 * Gesture-based animations
 */
export const gestureAnimations = {
    drag: {
        drag: true,
        dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
        dragElastic: 0.1,
        whileDrag: { scale: 1.05, rotate: 2 },
    },

    swipe: {
        whileTap: { scale: 0.95 },
        transition: { type: 'spring', stiffness: 400, damping: 17 },
    },

    pinch: {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
};

/**
 * Performance-optimized animations
 */
export const performanceAnimations = {
    // Use transform instead of changing layout properties
    optimizedSlide: {
        initial: { opacity: 0, transform: 'translateY(20px)' },
        animate: { opacity: 1, transform: 'translateY(0px)' },
        exit: { opacity: 0, transform: 'translateY(-20px)' },
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },

    // Use will-change for better performance
    optimizedScale: {
        initial: { opacity: 0, transform: 'scale(0.95)' },
        animate: { opacity: 1, transform: 'scale(1)' },
        exit: { opacity: 0, transform: 'scale(0.95)' },
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
        style: { willChange: 'transform, opacity' },
    },
};

/**
 * CSS keyframes for complex animations
 */
export const cssKeyframes = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInRight {
    0% { opacity: 0; transform: translateX(20px); }
    100% { opacity: 1; transform: translateX(0); }
  }

  @keyframes scaleIn {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes priceFlash {
    0%, 100% { background-color: transparent; }
    50% { background-color: rgba(16, 185, 129, 0.2); }
  }

  @keyframes priceFlashRed {
    0%, 100% { background-color: transparent; }
    50% { background-color: rgba(239, 68, 68, 0.2); }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
  }
`;

export default {
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
};