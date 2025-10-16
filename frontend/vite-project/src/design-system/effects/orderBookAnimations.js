// Order Book Specific Animations
// Advanced animations tailored for order book visualization with enhanced visual effects

import { shouldReduceMotion } from '../index';

/**
 * Enhanced animation configurations with performance optimizations
 */
const ANIMATION_CONFIG = {
    // Performance settings
    performance: {
        useGPUAcceleration: true,
        willChange: 'transform, opacity, background-color',
        backfaceVisibility: 'hidden',
        perspective: 1000
    },

    // Timing configurations
    timing: {
        fast: 0.2,
        normal: 0.4,
        slow: 0.8,
        priceFlash: 0.6,
        orderLifecycle: 1.0,
        depthChange: 0.8,
        spreadUpdate: 0.5
    },

    // Easing functions
    easing: {
        smooth: [0.25, 0.46, 0.45, 0.94],
        bounce: [0.34, 1.56, 0.64, 1],
        elastic: [0.175, 0.885, 0.32, 1.275],
        trading: [0.25, 0.1, 0.25, 1]
    }
};

/**
 * Enhanced price flash animations with advanced visual effects
 */
export const priceFlashAnimations = {
    // Bullish price movement with enhanced effects
    priceUp: {
        animate: {
            backgroundColor: [
                'transparent',
                'rgba(16, 185, 129, 0.4)',
                'rgba(16, 185, 129, 0.2)',
                'transparent'
            ],
            scale: [1, 1.02, 1.01, 1],
            boxShadow: [
                '0 0 0 rgba(16, 185, 129, 0)',
                '0 0 15px rgba(16, 185, 129, 0.6)',
                '0 0 8px rgba(16, 185, 129, 0.3)',
                '0 0 0 rgba(16, 185, 129, 0)'
            ],
            borderColor: [
                'transparent',
                'rgba(16, 185, 129, 0.5)',
                'rgba(16, 185, 129, 0.2)',
                'transparent'
            ]
        },
        transition: {
            duration: ANIMATION_CONFIG.timing.priceFlash,
            ease: ANIMATION_CONFIG.easing.trading,
            times: [0, 0.3, 0.7, 1]
        },
        style: ANIMATION_CONFIG.performance
    },

    // Bearish price movement with enhanced effects
    priceDown: {
        animate: {
            backgroundColor: [
                'transparent',
                'rgba(239, 68, 68, 0.4)',
                'rgba(239, 68, 68, 0.2)',
                'transparent'
            ],
            scale: [1, 1.02, 1.01, 1],
            boxShadow: [
                '0 0 0 rgba(239, 68, 68, 0)',
                '0 0 15px rgba(239, 68, 68, 0.6)',
                '0 0 8px rgba(239, 68, 68, 0.3)',
                '0 0 0 rgba(239, 68, 68, 0)'
            ],
            borderColor: [
                'transparent',
                'rgba(239, 68, 68, 0.5)',
                'rgba(239, 68, 68, 0.2)',
                'transparent'
            ]
        },
        transition: {
            duration: ANIMATION_CONFIG.timing.priceFlash,
            ease: ANIMATION_CONFIG.easing.trading,
            times: [0, 0.3, 0.7, 1]
        },
        style: ANIMATION_CONFIG.performance
    },

    // Significant price movement with dramatic effects
    priceSpike: {
        animate: {
            backgroundColor: [
                'transparent',
                'rgba(139, 92, 246, 0.6)',
                'rgba(139, 92, 246, 0.4)',
                'rgba(139, 92, 246, 0.2)',
                'transparent'
            ],
            scale: [1, 1.08, 1.05, 1.02, 1],
            filter: [
                'brightness(1) saturate(1)',
                'brightness(1.5) saturate(1.3)',
                'brightness(1.3) saturate(1.2)',
                'brightness(1.1) saturate(1.1)',
                'brightness(1) saturate(1)'
            ],
            boxShadow: [
                '0 0 0 rgba(139, 92, 246, 0)',
                '0 0 25px rgba(139, 92, 246, 0.8)',
                '0 0 15px rgba(139, 92, 246, 0.6)',
                '0 0 8px rgba(139, 92, 246, 0.3)',
                '0 0 0 rgba(139, 92, 246, 0)'
            ]
        },
        transition: {
            duration: 1.2,
            ease: ANIMATION_CONFIG.easing.bounce,
            times: [0, 0.2, 0.5, 0.8, 1]
        },
        style: ANIMATION_CONFIG.performance
    },

    // Rapid price changes with flicker effect
    priceFlicker: {
        animate: {
            opacity: [1, 0.6, 1, 0.7, 1, 0.8, 1],
            backgroundColor: [
                'transparent',
                'rgba(245, 158, 11, 0.4)',
                'transparent',
                'rgba(245, 158, 11, 0.3)',
                'transparent',
                'rgba(245, 158, 11, 0.2)',
                'transparent'
            ],
            scale: [1, 1.01, 1, 1.01, 1, 1.005, 1]
        },
        transition: {
            duration: 0.8,
            ease: 'easeInOut',
            times: [0, 0.15, 0.3, 0.5, 0.65, 0.8, 1]
        },
        style: ANIMATION_CONFIG.performance
    },

    // Market volatility effect
    volatilityPulse: {
        animate: {
            backgroundColor: [
                'rgba(245, 158, 11, 0.1)',
                'rgba(245, 158, 11, 0.3)',
                'rgba(245, 158, 11, 0.1)'
            ],
            borderColor: [
                'rgba(245, 158, 11, 0.2)',
                'rgba(245, 158, 11, 0.6)',
                'rgba(245, 158, 11, 0.2)'
            ],
            boxShadow: [
                '0 0 5px rgba(245, 158, 11, 0.2)',
                '0 0 20px rgba(245, 158, 11, 0.5)',
                '0 0 5px rgba(245, 158, 11, 0.2)'
            ]
        },
        transition: {
            duration: 1.5,
            ease: 'easeInOut',
            repeat: Infinity,
            times: [0, 0.5, 1]
        },
        style: ANIMATION_CONFIG.performance
    }
};

/**
 * Enhanced order lifecycle animations with advanced visual effects
 */
export const orderLifecycleAnimations = {
    // New order entrance with sophisticated effects
    orderEnter: {
        initial: {
            opacity: 0,
            x: -40,
            scale: 0.85,
            filter: 'blur(3px) brightness(0.8)',
            rotateY: -15
        },
        animate: {
            opacity: 1,
            x: 0,
            scale: 1,
            filter: 'blur(0px) brightness(1)',
            rotateY: 0
        },
        transition: {
            duration: ANIMATION_CONFIG.timing.orderLifecycle,
            ease: ANIMATION_CONFIG.easing.elastic,
            staggerChildren: 0.05
        },
        style: ANIMATION_CONFIG.performance
    },

    // Enhanced order size change with ripple effect
    sizeChange: {
        animate: {
            scale: [1, 1.08, 1.04, 1.01, 1],
            backgroundColor: [
                'transparent',
                'rgba(59, 130, 246, 0.4)',
                'rgba(59, 130, 246, 0.2)',
                'rgba(59, 130, 246, 0.1)',
                'transparent'
            ],
            borderColor: [
                'transparent',
                'rgba(59, 130, 246, 0.6)',
                'rgba(59, 130, 246, 0.4)',
                'rgba(59, 130, 246, 0.2)',
                'transparent'
            ],
            boxShadow: [
                '0 0 0 rgba(59, 130, 246, 0)',
                '0 0 15px rgba(59, 130, 246, 0.5)',
                '0 0 10px rgba(59, 130, 246, 0.3)',
                '0 0 5px rgba(59, 130, 246, 0.2)',
                '0 0 0 rgba(59, 130, 246, 0)'
            ]
        },
        transition: {
            duration: ANIMATION_CONFIG.timing.depthChange,
            ease: ANIMATION_CONFIG.easing.bounce,
            times: [0, 0.2, 0.5, 0.8, 1]
        },
        style: ANIMATION_CONFIG.performance
    },

    // Enhanced order cancellation with fade and slide
    orderExit: {
        exit: {
            opacity: 0,
            x: -50,
            scale: 0.7,
            filter: 'blur(2px)',
            height: 0,
            marginTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
            rotateX: -90
        },
        transition: {
            duration: 0.6,
            ease: ANIMATION_CONFIG.easing.smooth,
            height: { delay: 0.3 },
            margin: { delay: 0.3 },
            padding: { delay: 0.3 }
        },
        style: ANIMATION_CONFIG.performance
    },

    // Enhanced large order highlighting with breathing effect
    largeOrderHighlight: {
        animate: {
            boxShadow: [
                'inset 0 0 0 1px rgba(139, 92, 246, 0.3), 0 0 10px rgba(139, 92, 246, 0.2)',
                'inset 0 0 0 2px rgba(139, 92, 246, 0.6), 0 0 20px rgba(139, 92, 246, 0.4)',
                'inset 0 0 0 1px rgba(139, 92, 246, 0.3), 0 0 10px rgba(139, 92, 246, 0.2)'
            ],
            backgroundColor: [
                'rgba(139, 92, 246, 0.05)',
                'rgba(139, 92, 246, 0.15)',
                'rgba(139, 92, 246, 0.05)'
            ],
            scale: [1, 1.01, 1],
            filter: [
                'brightness(1)',
                'brightness(1.1)',
                'brightness(1)'
            ]
        },
        transition: {
            duration: 2.5,
            ease: 'easeInOut',
            repeat: Infinity,
            times: [0, 0.5, 1]
        },
        style: ANIMATION_CONFIG.performance
    },

    // Enhanced order execution with celebration effect
    orderExecuted: {
        animate: {
            backgroundColor: [
                'transparent',
                'rgba(16, 185, 129, 0.7)',
                'rgba(16, 185, 129, 0.4)',
                'rgba(16, 185, 129, 0.1)',
                'transparent'
            ],
            scale: [1, 1.12, 1.06, 1.02, 1],
            rotate: [0, 3, -2, 1, 0],
            boxShadow: [
                '0 0 0 rgba(16, 185, 129, 0)',
                '0 0 30px rgba(16, 185, 129, 0.9)',
                '0 0 20px rgba(16, 185, 129, 0.6)',
                '0 0 10px rgba(16, 185, 129, 0.3)',
                '0 0 0 rgba(16, 185, 129, 0)'
            ],
            filter: [
                'brightness(1) saturate(1)',
                'brightness(1.3) saturate(1.2)',
                'brightness(1.2) saturate(1.1)',
                'brightness(1.1) saturate(1.05)',
                'brightness(1) saturate(1)'
            ]
        },
        transition: {
            duration: 1.2,
            ease: ANIMATION_CONFIG.easing.bounce,
            times: [0, 0.25, 0.5, 0.75, 1]
        },
        style: ANIMATION_CONFIG.performance
    },

    // Order modification animation
    orderModified: {
        animate: {
            backgroundColor: [
                'transparent',
                'rgba(245, 158, 11, 0.4)',
                'rgba(245, 158, 11, 0.2)',
                'transparent'
            ],
            borderColor: [
                'transparent',
                'rgba(245, 158, 11, 0.6)',
                'rgba(245, 158, 11, 0.3)',
                'transparent'
            ],
            x: [0, 3, -2, 1, 0],
            scale: [1, 1.03, 1.01, 1]
        },
        transition: {
            duration: 0.7,
            ease: ANIMATION_CONFIG.easing.elastic,
            times: [0, 0.3, 0.7, 1]
        },
        style: ANIMATION_CONFIG.performance
    },

    // Priority order animation
    priorityOrder: {
        animate: {
            boxShadow: [
                '0 0 0 rgba(255, 215, 0, 0)',
                '0 0 20px rgba(255, 215, 0, 0.6)',
                '0 0 15px rgba(255, 215, 0, 0.4)',
                '0 0 0 rgba(255, 215, 0, 0)'
            ],
            backgroundColor: [
                'rgba(255, 215, 0, 0.05)',
                'rgba(255, 215, 0, 0.15)',
                'rgba(255, 215, 0, 0.1)',
                'rgba(255, 215, 0, 0.05)'
            ],
            borderColor: [
                'rgba(255, 215, 0, 0.3)',
                'rgba(255, 215, 0, 0.7)',
                'rgba(255, 215, 0, 0.5)',
                'rgba(255, 215, 0, 0.3)'
            ]
        },
        transition: {
            duration: 1.8,
            ease: 'easeInOut',
            repeat: Infinity,
            times: [0, 0.3, 0.7, 1]
        },
        style: ANIMATION_CONFIG.performance
    }
};

/**
 * Enhanced depth bar animations with advanced visual effects
 */
export const depthBarAnimations = {
    // Enhanced depth change with wave effect
    depthChange: {
        animate: {
            scaleX: [1, 1.15, 1.08, 1.02, 1],
            opacity: [0.6, 1, 0.9, 0.7, 0.6],
            filter: [
                'brightness(1) saturate(1)',
                'brightness(1.4) saturate(1.2)',
                'brightness(1.2) saturate(1.1)',
                'brightness(1.1) saturate(1.05)',
                'brightness(1) saturate(1)'
            ],
            boxShadow: [
                'inset 0 0 0 rgba(59, 130, 246, 0)',
                'inset 0 0 15px rgba(59, 130, 246, 0.5)',
                'inset 0 0 10px rgba(59, 130, 246, 0.3)',
                'inset 0 0 5px rgba(59, 130, 246, 0.2)',
                'inset 0 0 0 rgba(59, 130, 246, 0)'
            ]
        },
        transition: {
            duration: ANIMATION_CONFIG.timing.depthChange,
            ease: ANIMATION_CONFIG.easing.bounce,
            times: [0, 0.2, 0.5, 0.8, 1]
        },
        style: ANIMATION_CONFIG.performance
    },

    // Enhanced depth pulse with breathing effect
    depthPulse: {
        animate: {
            opacity: [0.4, 0.9, 0.7, 0.4],
            scaleX: [1, 1.08, 1.04, 1],
            scaleY: [1, 1.03, 1.01, 1],
            filter: [
                'brightness(1)',
                'brightness(1.3)',
                'brightness(1.15)',
                'brightness(1)'
            ],
            borderRadius: [
                '4px',
                '6px',
                '5px',
                '4px'
            ]
        },
        transition: {
            duration: 1.5,
            ease: ANIMATION_CONFIG.easing.smooth,
            repeat: 2,
            times: [0, 0.3, 0.7, 1]
        },
        style: ANIMATION_CONFIG.performance
    },

    // Enhanced large depth highlighting with aurora effect
    largeDepthGlow: {
        animate: {
            boxShadow: [
                'inset 0 0 10px rgba(59, 130, 246, 0.2), 0 0 5px rgba(59, 130, 246, 0.1)',
                'inset 0 0 25px rgba(59, 130, 246, 0.5), 0 0 15px rgba(59, 130, 246, 0.3)',
                'inset 0 0 20px rgba(59, 130, 246, 0.4), 0 0 12px rgba(59, 130, 246, 0.25)',
                'inset 0 0 10px rgba(59, 130, 246, 0.2), 0 0 5px rgba(59, 130, 246, 0.1)'
            ],
            filter: [
                'brightness(1) hue-rotate(0deg)',
                'brightness(1.3) hue-rotate(5deg)',
                'brightness(1.2) hue-rotate(3deg)',
                'brightness(1) hue-rotate(0deg)'
            ],
            background: [
                'linear-gradient(90deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))',
                'linear-gradient(90deg, rgba(59, 130, 246, 0.4), rgba(59, 130, 246, 0.2))',
                'linear-gradient(90deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.15))',
                'linear-gradient(90deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))'
            ]
        },
        transition: {
            duration: 2.2,
            ease: 'easeInOut',
            repeat: Infinity,
            times: [0, 0.3, 0.7, 1]
        },
        style: ANIMATION_CONFIG.performance
    },

    // Enhanced depth bar hover with ripple effect
    depthHover: {
        whileHover: {
            scaleX: 1.03,
            scaleY: 1.01,
            opacity: 0.95,
            filter: 'brightness(1.25) saturate(1.1)',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 10px rgba(59, 130, 246, 0.3)',
            borderRadius: '6px'
        },
        transition: {
            duration: ANIMATION_CONFIG.timing.fast,
            ease: ANIMATION_CONFIG.easing.smooth
        },
        style: ANIMATION_CONFIG.performance
    },

    // Depth bar loading animation
    depthLoading: {
        animate: {
            background: [
                'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)',
                'linear-gradient(90deg, transparent 25%, rgba(59, 130, 246, 0.3) 75%, transparent 100%)',
                'linear-gradient(90deg, transparent 50%, rgba(59, 130, 246, 0.3) 100%, transparent 100%)'
            ],
            backgroundPosition: ['-100% 0', '0% 0', '100% 0']
        },
        transition: {
            duration: 1.5,
            ease: 'linear',
            repeat: Infinity
        },
        style: {
            ...ANIMATION_CONFIG.performance,
            backgroundSize: '200% 100%'
        }
    },

    // Depth comparison animation
    depthComparison: {
        animate: {
            scaleX: [1, 0.95, 1.05, 1],
            opacity: [0.7, 0.9, 0.8, 0.7],
            borderColor: [
                'rgba(59, 130, 246, 0.3)',
                'rgba(245, 158, 11, 0.6)',
                'rgba(16, 185, 129, 0.5)',
                'rgba(59, 130, 246, 0.3)'
            ]
        },
        transition: {
            duration: 1.0,
            ease: ANIMATION_CONFIG.easing.elastic,
            times: [0, 0.3, 0.7, 1]
        },
        style: ANIMATION_CONFIG.performance
    }
};

/**
 * Spread indicator animations
 */
export const spreadAnimations = {
    // Spread change animation
    spreadChange: {
        animate: {
            scale: [1, 1.02, 1.01, 1],
            filter: [
                'brightness(1)',
                'brightness(1.3)',
                'brightness(1.1)',
                'brightness(1)'
            ],
            boxShadow: [
                '0 0 0 rgba(59, 130, 246, 0)',
                '0 0 15px rgba(59, 130, 246, 0.4)',
                '0 0 8px rgba(59, 130, 246, 0.2)',
                '0 0 0 rgba(59, 130, 246, 0)'
            ]
        },
        transition: {
            duration: 0.8,
            ease: 'easeOut',
            times: [0, 0.3, 0.7, 1]
        }
    },

    // Tight spread pulse
    tightSpreadPulse: {
        animate: {
            boxShadow: [
                '0 0 10px rgba(16, 185, 129, 0.3)',
                '0 0 20px rgba(16, 185, 129, 0.5)',
                '0 0 15px rgba(16, 185, 129, 0.4)',
                '0 0 10px rgba(16, 185, 129, 0.3)'
            ],
            borderColor: [
                'rgba(16, 185, 129, 0.4)',
                'rgba(16, 185, 129, 0.6)',
                'rgba(16, 185, 129, 0.5)',
                'rgba(16, 185, 129, 0.4)'
            ]
        },
        transition: {
            duration: 2,
            ease: 'easeInOut',
            repeat: Infinity,
            times: [0, 0.3, 0.7, 1]
        }
    },

    // Wide spread warning
    wideSpreadWarning: {
        animate: {
            boxShadow: [
                '0 0 10px rgba(239, 68, 68, 0.3)',
                '0 0 20px rgba(239, 68, 68, 0.5)',
                '0 0 15px rgba(239, 68, 68, 0.4)',
                '0 0 10px rgba(239, 68, 68, 0.3)'
            ],
            borderColor: [
                'rgba(239, 68, 68, 0.4)',
                'rgba(239, 68, 68, 0.6)',
                'rgba(239, 68, 68, 0.5)',
                'rgba(239, 68, 68, 0.4)'
            ],
            backgroundColor: [
                'rgba(239, 68, 68, 0.05)',
                'rgba(239, 68, 68, 0.1)',
                'rgba(239, 68, 68, 0.08)',
                'rgba(239, 68, 68, 0.05)'
            ]
        },
        transition: {
            duration: 1.5,
            ease: 'easeInOut',
            repeat: Infinity,
            times: [0, 0.3, 0.7, 1]
        }
    }
};

/**
 * Shimmer and glow effects
 */
export const shimmerEffects = {
    // Price level shimmer
    priceShimmer: {
        animate: {
            backgroundPosition: ['200% 0', '-200% 0']
        },
        transition: {
            duration: 1.5,
            ease: 'linear',
            repeat: 1
        },
        style: {
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            backgroundSize: '200% 100%'
        }
    },

    // Order row glow
    orderGlow: {
        animate: {
            boxShadow: [
                '0 0 0 rgba(59, 130, 246, 0)',
                '0 0 15px rgba(59, 130, 246, 0.6)',
                '0 0 8px rgba(59, 130, 246, 0.3)',
                '0 0 0 rgba(59, 130, 246, 0)'
            ]
        },
        transition: {
            duration: 1,
            ease: 'easeInOut',
            times: [0, 0.3, 0.7, 1]
        }
    },

    // Depth bar shimmer
    depthShimmer: {
        animate: {
            backgroundImage: [
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
            ]
        },
        transition: {
            duration: 0.8,
            ease: 'easeInOut',
            times: [0, 0.5, 1]
        }
    }
};

/**
 * Performance-optimized animations using transform
 */
export const performanceOptimizedAnimations = {
    // Optimized price flash
    optimizedPriceFlash: {
        animate: {
            transform: [
                'scale(1) translateZ(0)',
                'scale(1.02) translateZ(0)',
                'scale(1.01) translateZ(0)',
                'scale(1) translateZ(0)'
            ],
            opacity: [1, 0.9, 0.95, 1]
        },
        transition: {
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
            times: [0, 0.3, 0.7, 1]
        },
        style: {
            willChange: 'transform, opacity'
        }
    },

    // Optimized order entrance
    optimizedOrderEnter: {
        initial: {
            transform: 'translateX(-20px) scale(0.95) translateZ(0)',
            opacity: 0
        },
        animate: {
            transform: 'translateX(0px) scale(1) translateZ(0)',
            opacity: 1
        },
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
        },
        style: {
            willChange: 'transform, opacity'
        }
    },

    // Optimized depth change
    optimizedDepthChange: {
        animate: {
            transform: [
                'scaleX(1) translateZ(0)',
                'scaleX(1.05) translateZ(0)',
                'scaleX(1.02) translateZ(0)',
                'scaleX(1) translateZ(0)'
            ]
        },
        transition: {
            duration: 0.6,
            ease: 'easeOut',
            times: [0, 0.3, 0.7, 1]
        },
        style: {
            willChange: 'transform'
        }
    }
};

/**
 * Create responsive order book animation
 */
export const createResponsiveOrderBookAnimation = (animation, fallback = {}) => {
    if (shouldReduceMotion()) {
        return {
            initial: fallback.initial || { opacity: 0.8 },
            animate: fallback.animate || { opacity: 1 },
            exit: fallback.exit || { opacity: 0.8 },
            transition: { duration: 0.1 }
        };
    }
    return animation;
};

/**
 * Advanced animation utilities for order book interactions
 */
export const animationUtilities = {
    // Create staggered animations for multiple orders
    createStaggeredAnimation: (baseAnimation, itemCount, staggerDelay = 0.05) => ({
        ...baseAnimation,
        transition: {
            ...baseAnimation.transition,
            staggerChildren: staggerDelay,
            delayChildren: staggerDelay * 0.5
        }
    }),

    // Create responsive animation based on performance
    createPerformanceAwareAnimation: (fullAnimation, reducedAnimation) => {
        const prefersReducedMotion = shouldReduceMotion();
        const isLowPerformance = window.navigator?.hardwareConcurrency < 4;

        if (prefersReducedMotion || isLowPerformance) {
            return reducedAnimation || {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                transition: { duration: 0.1 }
            };
        }

        return fullAnimation;
    },

    // Create conditional animation based on order size
    createSizeBasedAnimation: (order, animations) => {
        const { small, medium, large } = animations;
        const size = order?.size || 0;

        if (size > 10) return large;
        if (size > 1) return medium;
        return small;
    },

    // Create time-based animation intensity
    createTimeBasedAnimation: (baseAnimation, timeElapsed) => {
        const intensity = Math.max(0.3, 1 - (timeElapsed / 5000)); // Fade over 5 seconds

        return {
            ...baseAnimation,
            animate: {
                ...baseAnimation.animate,
                opacity: baseAnimation.animate.opacity?.map?.(val => val * intensity) || intensity
            }
        };
    }
};

/**
 * Enhanced animation sequences for complex order book interactions
 */
export const orderBookSequences = {
    // Enhanced market order execution sequence
    marketOrderExecution: {
        stages: [
            {
                name: 'orderReceived',
                animation: orderLifecycleAnimations.orderEnter,
                duration: 0.6,
                priority: 'high'
            },
            {
                name: 'priceMatching',
                animation: priceFlashAnimations.priceSpike,
                duration: 0.8,
                delay: 0.3,
                priority: 'high'
            },
            {
                name: 'orderExecuted',
                animation: orderLifecycleAnimations.orderExecuted,
                duration: 1.2,
                delay: 0.8,
                priority: 'high'
            },
            {
                name: 'depthUpdate',
                animation: depthBarAnimations.depthChange,
                duration: 0.6,
                delay: 1.4,
                priority: 'medium'
            },
            {
                name: 'spreadAdjustment',
                animation: spreadAnimations.spreadChange,
                duration: 0.5,
                delay: 1.8,
                priority: 'low'
            }
        ]
    },

    // Enhanced large order impact sequence
    largeOrderImpact: {
        stages: [
            {
                name: 'orderHighlight',
                animation: orderLifecycleAnimations.largeOrderHighlight,
                duration: 2.5,
                repeat: true,
                priority: 'high'
            },
            {
                name: 'depthGlow',
                animation: depthBarAnimations.largeDepthGlow,
                duration: 2.2,
                delay: 0.2,
                repeat: true,
                priority: 'medium'
            },
            {
                name: 'spreadImpact',
                animation: spreadAnimations.spreadChange,
                duration: 0.8,
                delay: 0.5,
                priority: 'medium'
            },
            {
                name: 'marketAlert',
                animation: priceFlashAnimations.volatilityPulse,
                duration: 1.5,
                delay: 1.0,
                repeat: true,
                priority: 'low'
            }
        ]
    },

    // Enhanced market volatility sequence
    marketVolatility: {
        stages: [
            {
                name: 'rapidPriceChanges',
                animation: priceFlashAnimations.priceFlicker,
                duration: 0.8,
                repeat: 5,
                priority: 'high'
            },
            {
                name: 'spreadWidening',
                animation: spreadAnimations.wideSpreadWarning,
                duration: 1.5,
                delay: 0.3,
                repeat: true,
                priority: 'high'
            },
            {
                name: 'depthFluctuation',
                animation: depthBarAnimations.depthPulse,
                duration: 1.5,
                delay: 0.5,
                repeat: 3,
                priority: 'medium'
            },
            {
                name: 'volatilityIndicator',
                animation: priceFlashAnimations.volatilityPulse,
                duration: 1.5,
                delay: 1.0,
                repeat: true,
                priority: 'low'
            }
        ]
    },

    // Order book synchronization sequence
    orderBookSync: {
        stages: [
            {
                name: 'syncStart',
                animation: depthBarAnimations.depthLoading,
                duration: 1.5,
                priority: 'high'
            },
            {
                name: 'dataUpdate',
                animation: orderLifecycleAnimations.orderEnter,
                duration: 0.6,
                delay: 0.5,
                stagger: 0.05,
                priority: 'high'
            },
            {
                name: 'syncComplete',
                animation: {
                    animate: {
                        backgroundColor: ['transparent', 'rgba(16, 185, 129, 0.2)', 'transparent'],
                        borderColor: ['transparent', 'rgba(16, 185, 129, 0.5)', 'transparent']
                    },
                    transition: { duration: 0.8, ease: 'easeOut' }
                },
                duration: 0.8,
                delay: 1.5,
                priority: 'medium'
            }
        ]
    },

    // High-frequency trading sequence
    highFrequencyTrading: {
        stages: [
            {
                name: 'rapidUpdates',
                animation: {
                    animate: {
                        opacity: [1, 0.7, 1],
                        scale: [1, 1.01, 1]
                    },
                    transition: { duration: 0.2, ease: 'linear' }
                },
                duration: 0.2,
                repeat: 10,
                priority: 'high'
            },
            {
                name: 'priceFlash',
                animation: priceFlashAnimations.priceFlicker,
                duration: 0.4,
                delay: 0.1,
                repeat: 5,
                priority: 'high'
            },
            {
                name: 'depthAdjustment',
                animation: depthBarAnimations.depthChange,
                duration: 0.3,
                delay: 0.2,
                stagger: 0.02,
                priority: 'medium'
            }
        ]
    }
};

/**
 * Enhanced utility function to trigger animation sequences with priority management
 */
export const triggerAnimationSequence = (sequence, options = {}) => {
    const {
        onStageComplete,
        onSequenceComplete,
        priorityFilter = 'all',
        performanceMode = 'auto'
    } = options;

    const { stages } = sequence;
    let currentStage = 0;
    let activeAnimations = new Set();

    // Filter stages by priority if specified
    const filteredStages = priorityFilter === 'all'
        ? stages
        : stages.filter(stage => stage.priority === priorityFilter);

    const executeStage = (stage, index) => {
        const {
            animation,
            duration,
            delay = 0,
            repeat = false,
            stagger = 0,
            priority = 'medium'
        } = stage;

        // Performance-aware execution
        if (performanceMode === 'reduced' && priority === 'low') {
            return; // Skip low priority animations in reduced mode
        }

        const stageId = `${sequence.name || 'sequence'}-${stage.name}-${index}`;
        activeAnimations.add(stageId);

        setTimeout(() => {
            // Apply stagger if specified
            if (stagger > 0) {
                setTimeout(() => {
                    if (onStageComplete) {
                        onStageComplete(stage, animation, stageId);
                    }
                }, stagger * 1000);
            } else {
                if (onStageComplete) {
                    onStageComplete(stage, animation, stageId);
                }
            }

            // Handle stage completion
            setTimeout(() => {
                activeAnimations.delete(stageId);

                // Move to next stage if not repeating
                if (!repeat && currentStage < filteredStages.length - 1) {
                    currentStage++;
                    executeStage(filteredStages[currentStage], currentStage);
                } else if (activeAnimations.size === 0 && onSequenceComplete) {
                    onSequenceComplete(sequence);
                }
            }, duration * 1000);

        }, delay * 1000);
    };

    // Start sequence
    if (filteredStages.length > 0) {
        executeStage(filteredStages[0], 0);
    }

    // Return control object
    return {
        stop: () => {
            activeAnimations.clear();
        },
        getActiveAnimations: () => Array.from(activeAnimations),
        isActive: () => activeAnimations.size > 0
    };
};

/**
 * Animation performance monitor
 */
export const animationPerformanceMonitor = {
    metrics: {
        frameRate: 60,
        animationCount: 0,
        droppedFrames: 0,
        lastFrameTime: performance.now()
    },

    startMonitoring() {
        const monitor = () => {
            const now = performance.now();
            const deltaTime = now - this.metrics.lastFrameTime;
            const currentFPS = 1000 / deltaTime;

            this.metrics.frameRate = (this.metrics.frameRate * 0.9) + (currentFPS * 0.1);
            this.metrics.lastFrameTime = now;

            if (currentFPS < 30) {
                this.metrics.droppedFrames++;
            }

            requestAnimationFrame(monitor);
        };

        requestAnimationFrame(monitor);
    },

    getPerformanceLevel() {
        if (this.metrics.frameRate > 50) return 'high';
        if (this.metrics.frameRate > 30) return 'medium';
        return 'low';
    },

    shouldReduceAnimations() {
        return this.metrics.frameRate < 30 || this.metrics.droppedFrames > 10;
    }
};

export default {
    ANIMATION_CONFIG,
    priceFlashAnimations,
    orderLifecycleAnimations,
    depthBarAnimations,
    spreadAnimations,
    shimmerEffects,
    performanceOptimizedAnimations,
    animationUtilities,
    createResponsiveOrderBookAnimation,
    orderBookSequences,
    triggerAnimationSequence,
    animationPerformanceMonitor
};