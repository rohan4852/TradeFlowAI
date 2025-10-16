// Advanced Glassmorphism Effects
// Professional glass effects inspired by modern trading platforms

import { rgba } from '../index';

/**
 * Advanced glassmorphism effect generator
 * Creates sophisticated glass effects with multiple layers and dynamic properties
 */
export const createGlassmorphism = (theme, options = {}) => {
    const {
        intensity = 'medium',
        blur = 'auto',
        opacity = 'auto',
        borderStyle = 'gradient',
        shadowIntensity = 'medium',
        colorTint = null,
        animated = false,
        interactive = false,
    } = options;

    // Intensity presets
    const intensityPresets = {
        subtle: {
            backgroundOpacity: 0.05,
            borderOpacity: 0.1,
            blur: 8,
            shadowOpacity: 0.1,
        },
        light: {
            backgroundOpacity: 0.08,
            borderOpacity: 0.15,
            blur: 12,
            shadowOpacity: 0.15,
        },
        medium: {
            backgroundOpacity: 0.12,
            borderOpacity: 0.2,
            blur: 16,
            shadowOpacity: 0.2,
        },
        strong: {
            backgroundOpacity: 0.18,
            borderOpacity: 0.25,
            blur: 20,
            shadowOpacity: 0.25,
        },
        intense: {
            backgroundOpacity: 0.25,
            borderOpacity: 0.3,
            blur: 24,
            shadowOpacity: 0.3,
        },
    };

    const preset = intensityPresets[intensity] || intensityPresets.medium;

    // Override with custom values
    const finalBlur = blur === 'auto' ? preset.blur : blur;
    const finalOpacity = opacity === 'auto' ? preset.backgroundOpacity : opacity;

    // Base color for glass effect
    const baseColor = colorTint || (theme.mode === 'dark' ? '#ffffff' : '#ffffff');
    const borderColor = theme.mode === 'dark' ? '#ffffff' : '#000000';

    // Background with tint
    const background = colorTint
        ? rgba(colorTint, finalOpacity)
        : rgba(baseColor, finalOpacity);

    // Border styles
    const borderStyles = {
        solid: `1px solid ${rgba(borderColor, preset.borderOpacity)}`,
        gradient: `1px solid transparent`,
        none: 'none',
    };

    // Gradient border background for gradient style
    const gradientBorder = borderStyle === 'gradient' ? {
        backgroundImage: `linear-gradient(${background}, ${background}), 
                     linear-gradient(135deg, 
                       ${rgba(borderColor, preset.borderOpacity * 1.5)} 0%, 
                       ${rgba(borderColor, preset.borderOpacity * 0.5)} 50%, 
                       ${rgba(borderColor, preset.borderOpacity * 1.2)} 100%)`,
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
    } : {};

    // Shadow configuration
    const shadowIntensities = {
        none: 'none',
        subtle: `0 4px 16px ${rgba('#000000', 0.05)}, 0 1px 4px ${rgba('#000000', 0.1)}`,
        light: `0 8px 24px ${rgba('#000000', 0.08)}, 0 2px 8px ${rgba('#000000', 0.12)}`,
        medium: `0 12px 32px ${rgba('#000000', 0.12)}, 0 4px 12px ${rgba('#000000', 0.15)}`,
        strong: `0 16px 40px ${rgba('#000000', 0.15)}, 0 6px 16px ${rgba('#000000', 0.18)}`,
        intense: `0 24px 48px ${rgba('#000000', 0.2)}, 0 8px 20px ${rgba('#000000', 0.22)}`,
    };

    // Base glass styles
    const baseStyles = {
        background,
        backdropFilter: `blur(${finalBlur}px) saturate(1.2)`,
        WebkitBackdropFilter: `blur(${finalBlur}px) saturate(1.2)`,
        border: borderStyles[borderStyle] || borderStyles.solid,
        boxShadow: shadowIntensities[shadowIntensity] || shadowIntensities.medium,
        borderRadius: theme.borderRadius.lg,
        position: 'relative',
        overflow: 'hidden',
        ...gradientBorder,
    };

    // Animation styles
    const animationStyles = animated ? {
        transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.easeInOut}`,
    } : {};

    // Interactive styles
    const interactiveStyles = interactive ? {
        cursor: 'pointer',
        '&:hover': {
            background: rgba(baseColor, finalOpacity * 1.2),
            backdropFilter: `blur(${finalBlur + 2}px) saturate(1.3)`,
            WebkitBackdropFilter: `blur(${finalBlur + 2}px) saturate(1.3)`,
            transform: 'translateY(-1px)',
            boxShadow: shadowIntensities.strong,
        },
        '&:active': {
            transform: 'translateY(0)',
            background: rgba(baseColor, finalOpacity * 0.9),
        },
    } : {};

    return {
        ...baseStyles,
        ...animationStyles,
        ...interactiveStyles,
    };
};

/**
 * Specialized glassmorphism presets for trading interfaces
 */
export const tradingGlassPresets = {
    // Order book glass effect
    orderBook: (theme) => createGlassmorphism(theme, {
        intensity: 'medium',
        borderStyle: 'gradient',
        shadowIntensity: 'light',
        animated: true,
    }),

    // Chart overlay glass effect
    chartOverlay: (theme) => createGlassmorphism(theme, {
        intensity: 'subtle',
        borderStyle: 'solid',
        shadowIntensity: 'subtle',
        animated: false,
    }),

    // Widget container glass effect
    widget: (theme) => createGlassmorphism(theme, {
        intensity: 'medium',
        borderStyle: 'gradient',
        shadowIntensity: 'medium',
        animated: true,
        interactive: true,
    }),

    // Modal/dialog glass effect
    modal: (theme) => createGlassmorphism(theme, {
        intensity: 'strong',
        borderStyle: 'gradient',
        shadowIntensity: 'intense',
        animated: true,
    }),

    // Navigation glass effect
    navigation: (theme) => createGlassmorphism(theme, {
        intensity: 'light',
        borderStyle: 'solid',
        shadowIntensity: 'light',
        animated: true,
    }),

    // Card glass effect
    card: (theme) => createGlassmorphism(theme, {
        intensity: 'medium',
        borderStyle: 'gradient',
        shadowIntensity: 'medium',
        animated: true,
        interactive: true,
    }),

    // Sidebar glass effect
    sidebar: (theme) => createGlassmorphism(theme, {
        intensity: 'light',
        borderStyle: 'solid',
        shadowIntensity: 'light',
        animated: false,
    }),

    // Tooltip glass effect
    tooltip: (theme) => createGlassmorphism(theme, {
        intensity: 'strong',
        borderStyle: 'solid',
        shadowIntensity: 'medium',
        animated: true,
    }),
};

/**
 * Dynamic glass effect that responds to market conditions
 */
export const createMarketGlass = (theme, marketCondition = 'neutral') => {
    const colorTints = {
        bullish: theme.color.trading.bull,
        bearish: theme.color.trading.bear,
        neutral: null,
        volatile: theme.color.semantic.warning,
        stable: theme.color.semantic.success,
    };

    return createGlassmorphism(theme, {
        intensity: 'medium',
        colorTint: colorTints[marketCondition],
        borderStyle: 'gradient',
        shadowIntensity: 'medium',
        animated: true,
        interactive: true,
    });
};

/**
 * Frosted glass effect for backgrounds
 */
export const createFrostedGlass = (theme, options = {}) => {
    const {
        intensity = 'medium',
        noise = true,
        animated = false,
    } = options;

    const baseGlass = createGlassmorphism(theme, {
        intensity,
        borderStyle: 'none',
        shadowIntensity: 'none',
        animated,
    });

    // Add noise texture for frosted effect
    const noiseStyles = noise ? {
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
            pointerEvents: 'none',
            zIndex: 1,
        },
    } : {};

    return {
        ...baseGlass,
        ...noiseStyles,
    };
};

/**
 * Liquid glass effect with flowing animations
 */
export const createLiquidGlass = (theme, options = {}) => {
    const {
        intensity = 'medium',
        flowDirection = 'horizontal',
        speed = 'normal',
    } = options;

    const baseGlass = createGlassmorphism(theme, {
        intensity,
        borderStyle: 'gradient',
        shadowIntensity: 'medium',
        animated: true,
    });

    const speeds = {
        slow: '8s',
        normal: '6s',
        fast: '4s',
    };

    const flowAnimations = {
        horizontal: {
            backgroundImage: `linear-gradient(90deg, 
        transparent 0%, 
        ${rgba('#ffffff', 0.1)} 50%, 
        transparent 100%)`,
            backgroundSize: '200% 100%',
            animation: `liquidFlow ${speeds[speed]} ease-in-out infinite`,
        },
        vertical: {
            backgroundImage: `linear-gradient(180deg, 
        transparent 0%, 
        ${rgba('#ffffff', 0.1)} 50%, 
        transparent 100%)`,
            backgroundSize: '100% 200%',
            animation: `liquidFlowVertical ${speeds[speed]} ease-in-out infinite`,
        },
        diagonal: {
            backgroundImage: `linear-gradient(135deg, 
        transparent 0%, 
        ${rgba('#ffffff', 0.1)} 50%, 
        transparent 100%)`,
            backgroundSize: '200% 200%',
            animation: `liquidFlowDiagonal ${speeds[speed]} ease-in-out infinite`,
        },
    };

    return {
        ...baseGlass,
        ...flowAnimations[flowDirection],
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            ...flowAnimations[flowDirection],
            pointerEvents: 'none',
            zIndex: 1,
        },
    };
};

/**
 * Holographic glass effect
 */
export const createHolographicGlass = (theme, options = {}) => {
    const {
        intensity = 'medium',
        rainbow = true,
        animated = true,
    } = options;

    const baseGlass = createGlassmorphism(theme, {
        intensity,
        borderStyle: 'gradient',
        shadowIntensity: 'medium',
        animated,
    });

    const holographicStyles = rainbow ? {
        background: `linear-gradient(135deg, 
      ${rgba('#ff0080', 0.1)} 0%,
      ${rgba('#00ff80', 0.1)} 25%,
      ${rgba('#0080ff', 0.1)} 50%,
      ${rgba('#8000ff', 0.1)} 75%,
      ${rgba('#ff8000', 0.1)} 100%)`,
        backgroundSize: '400% 400%',
        animation: animated ? 'holographicShift 8s ease-in-out infinite' : 'none',
    } : {};

    return {
        ...baseGlass,
        ...holographicStyles,
    };
};

// CSS keyframes for animations (to be added to GlobalStyles)
export const glassAnimationKeyframes = `
  @keyframes liquidFlow {
    0%, 100% { background-position: -200% 0; }
    50% { background-position: 200% 0; }
  }

  @keyframes liquidFlowVertical {
    0%, 100% { background-position: 0 -200%; }
    50% { background-position: 0 200%; }
  }

  @keyframes liquidFlowDiagonal {
    0%, 100% { background-position: -200% -200%; }
    50% { background-position: 200% 200%; }
  }

  @keyframes holographicShift {
    0%, 100% { background-position: 0% 50%; }
    25% { background-position: 100% 0%; }
    50% { background-position: 100% 100%; }
    75% { background-position: 0% 100%; }
  }

  @keyframes glassShimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes glassPulse {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
  }
`;

export default {
    createGlassmorphism,
    tradingGlassPresets,
    createMarketGlass,
    createFrostedGlass,
    createLiquidGlass,
    createHolographicGlass,
    glassAnimationKeyframes,
};