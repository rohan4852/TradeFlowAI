// Micro-interactions System
// Subtle animations and feedback for enhanced user experience

import { shouldReduceMotion } from '../index';

/**
 * Hover effect configurations
 */
export const hoverEffects = {
    // Basic hover effects
    lift: {
        whileHover: { y: -2, scale: 1.01 },
        transition: { type: 'spring', stiffness: 400, damping: 17 },
    },

    scale: {
        whileHover: { scale: 1.05 },
        transition: { type: 'spring', stiffness: 400, damping: 17 },
    },

    glow: {
        whileHover: {
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
            scale: 1.02,
        },
        transition: { duration: 0.2 },
    },

    // Trading-specific hover effects
    priceHover: {
        whileHover: {
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            scale: 1.01,
        },
        transition: { duration: 0.15 },
    },

    orderHover: {
        whileHover: {
            x: 2,
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
        },
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },

    chartHover: {
        whileHover: {
            scale: 1.02,
            filter: 'brightness(1.1)',
        },
        transition: { duration: 0.2 },
    },

    // Button hover effects
    buttonPrimary: {
        whileHover: {
            y: -1,
            scale: 1.02,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        whileTap: { scale: 0.98, y: 0 },
        transition: { type: 'spring', stiffness: 400, damping: 17 },
    },

    buttonSecondary: {
        whileHover: {
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 0.5)',
        },
        transition: { duration: 0.2 },
    },

    // Card hover effects
    cardSubtle: {
        whileHover: {
            y: -1,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },

    cardPronounced: {
        whileHover: {
            y: -4,
            scale: 1.02,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        },
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
};

/**
 * Click/tap feedback effects
 */
export const tapEffects = {
    // Basic tap effects
    scale: {
        whileTap: { scale: 0.95 },
        transition: { duration: 0.1 },
    },

    press: {
        whileTap: { scale: 0.98, y: 1 },
        transition: { duration: 0.1 },
    },

    ripple: {
        whileTap: { scale: 0.95 },
        transition: { duration: 0.1 },
        // Ripple effect handled by component
    },

    // Trading-specific tap effects
    orderTap: {
        whileTap: {
            scale: 0.98,
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
        },
        transition: { duration: 0.1 },
    },

    priceTap: {
        whileTap: {
            scale: 0.99,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
        },
        transition: { duration: 0.1 },
    },

    // Button tap effects
    buttonTap: {
        whileTap: { scale: 0.95 },
        transition: { type: 'spring', stiffness: 400, damping: 17 },
    },

    iconTap: {
        whileTap: { scale: 0.9, rotate: 5 },
        transition: { type: 'spring', stiffness: 400, damping: 17 },
    },
};

/**
 * Focus effects for accessibility
 */
export const focusEffects = {
    // Basic focus effects
    ring: {
        whileFocus: {
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
            borderColor: 'rgba(59, 130, 246, 1)',
        },
        transition: { duration: 0.15 },
    },

    glow: {
        whileFocus: {
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5), 0 0 10px rgba(59, 130, 246, 0.3)',
        },
        transition: { duration: 0.15 },
    },

    // Trading-specific focus effects
    orderFocus: {
        whileFocus: {
            boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.5)',
            borderColor: 'rgba(16, 185, 129, 1)',
        },
        transition: { duration: 0.15 },
    },

    priceFocus: {
        whileFocus: {
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
        },
        transition: { duration: 0.15 },
    },
};

/**
 * Loading state micro-interactions
 */
export const loadingEffects = {
    // Skeleton loading
    skeleton: {
        animate: {
            opacity: [0.5, 1, 0.5],
        },
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },

    // Shimmer effect
    shimmer: {
        animate: {
            backgroundPosition: ['200% 0', '-200% 0'],
        },
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
        },
        style: {
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            backgroundSize: '200% 100%',
        },
    },

    // Pulse effect
    pulse: {
        animate: {
            scale: [1, 1.05, 1],
            opacity: [0.7, 1, 0.7],
        },
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },

    // Spinner
    spin: {
        animate: { rotate: 360 },
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
        },
    },

    // Dots loading
    dots: {
        animate: {
            y: [0, -10, 0],
        },
        transition: {
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

/**
 * Success/error feedback effects
 */
export const feedbackEffects = {
    // Success feedback
    success: {
        animate: {
            scale: [1, 1.1, 1],
            backgroundColor: ['transparent', 'rgba(16, 185, 129, 0.2)', 'transparent'],
        },
        transition: {
            duration: 0.6,
            ease: 'easeInOut',
        },
    },

    // Error feedback
    error: {
        animate: {
            x: [0, -5, 5, -5, 5, 0],
            backgroundColor: ['transparent', 'rgba(239, 68, 68, 0.2)', 'transparent'],
        },
        transition: {
            duration: 0.6,
            ease: 'easeInOut',
        },
    },

    // Warning feedback
    warning: {
        animate: {
            scale: [1, 1.02, 1],
            backgroundColor: ['transparent', 'rgba(245, 158, 11, 0.2)', 'transparent'],
        },
        transition: {
            duration: 0.8,
            ease: 'easeInOut',
        },
    },

    // Info feedback
    info: {
        animate: {
            opacity: [1, 0.7, 1],
            backgroundColor: ['transparent', 'rgba(59, 130, 246, 0.2)', 'transparent'],
        },
        transition: {
            duration: 1,
            ease: 'easeInOut',
        },
    },
};

/**
 * Trading-specific micro-interactions
 */
export const tradingMicroInteractions = {
    // Price change flash
    priceIncrease: {
        animate: {
            backgroundColor: ['transparent', 'rgba(16, 185, 129, 0.3)', 'transparent'],
            scale: [1, 1.02, 1],
        },
        transition: {
            duration: 0.8,
            ease: 'easeInOut',
        },
    },

    priceDecrease: {
        animate: {
            backgroundColor: ['transparent', 'rgba(239, 68, 68, 0.3)', 'transparent'],
            scale: [1, 1.02, 1],
        },
        transition: {
            duration: 0.8,
            ease: 'easeInOut',
        },
    },

    // Order execution feedback
    orderExecuted: {
        animate: {
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
            backgroundColor: ['transparent', 'rgba(16, 185, 129, 0.4)', 'transparent'],
        },
        transition: {
            duration: 1,
            ease: 'easeInOut',
        },
    },

    // Volume spike
    volumeSpike: {
        animate: {
            scaleY: [1, 1.2, 1],
            backgroundColor: ['rgba(139, 92, 246, 0.5)', 'rgba(139, 92, 246, 0.8)', 'rgba(139, 92, 246, 0.5)'],
        },
        transition: {
            duration: 0.6,
            ease: 'easeInOut',
        },
    },

    // Market status change
    marketOpen: {
        animate: {
            scale: [1, 1.05, 1],
            boxShadow: [
                '0 0 0 rgba(16, 185, 129, 0)',
                '0 0 10px rgba(16, 185, 129, 0.5)',
                '0 0 0 rgba(16, 185, 129, 0)',
            ],
        },
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },

    marketClosed: {
        animate: {
            opacity: [0.5, 1, 0.5],
        },
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

/**
 * Gesture-based micro-interactions
 */
export const gestureInteractions = {
    // Drag interactions
    dragHandle: {
        whileHover: { scale: 1.1 },
        whileDrag: { scale: 1.2, rotate: 5 },
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },

    // Swipe interactions
    swipeCard: {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
        transition: { type: 'spring', stiffness: 400, damping: 17 },
    },

    // Pinch/zoom interactions
    zoomable: {
        whileHover: { scale: 1.01 },
        transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
};

/**
 * Create responsive micro-interaction
 */
export const createResponsiveMicroInteraction = (interaction, fallback = {}) => {
    if (shouldReduceMotion()) {
        return {
            whileHover: fallback.whileHover || {},
            whileTap: fallback.whileTap || { opacity: 0.8 },
            whileFocus: fallback.whileFocus || {},
            transition: { duration: 0.1 },
        };
    }
    return interaction;
};

/**
 * Combine multiple micro-interactions
 */
export const combineMicroInteractions = (...interactions) => {
    return interactions.reduce((combined, interaction) => {
        return {
            ...combined,
            ...interaction,
            // Merge transition properties
            transition: {
                ...combined.transition,
                ...interaction.transition,
            },
        };
    }, {});
};

/**
 * Create contextual micro-interactions based on state
 */
export const createContextualInteraction = (baseInteraction, context = {}) => {
    const { state, variant, size } = context;

    let contextualInteraction = { ...baseInteraction };

    // Modify based on state
    if (state === 'disabled') {
        contextualInteraction = {
            whileHover: {},
            whileTap: {},
            transition: { duration: 0 },
        };
    } else if (state === 'loading') {
        contextualInteraction = {
            ...contextualInteraction,
            animate: loadingEffects.pulse.animate,
        };
    }

    // Modify based on variant
    if (variant === 'danger') {
        contextualInteraction.whileHover = {
            ...contextualInteraction.whileHover,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
        };
    } else if (variant === 'success') {
        contextualInteraction.whileHover = {
            ...contextualInteraction.whileHover,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
        };
    }

    // Modify based on size
    if (size === 'sm') {
        contextualInteraction.whileHover = {
            ...contextualInteraction.whileHover,
            scale: 1.05,
        };
    } else if (size === 'lg') {
        contextualInteraction.whileHover = {
            ...contextualInteraction.whileHover,
            scale: 1.01,
        };
    }

    return contextualInteraction;
};

/**
 * Performance-optimized micro-interactions
 */
export const optimizedInteractions = {
    // Use transform instead of changing layout properties
    optimizedHover: {
        whileHover: { transform: 'translateY(-2px) scale(1.01)' },
        transition: { type: 'spring', stiffness: 400, damping: 17 },
        style: { willChange: 'transform' },
    },

    optimizedTap: {
        whileTap: { transform: 'scale(0.95)' },
        transition: { duration: 0.1 },
        style: { willChange: 'transform' },
    },

    optimizedFocus: {
        whileFocus: {
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
            transform: 'scale(1.01)',
        },
        transition: { duration: 0.15 },
        style: { willChange: 'box-shadow, transform' },
    },
};

export default {
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
};