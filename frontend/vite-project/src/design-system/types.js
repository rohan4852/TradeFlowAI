// TypeScript-style interfaces for JavaScript (using JSDoc)

/**
 * @typedef {Object} ColorScale
 * @property {string} 50
 * @property {string} 100
 * @property {string} 200
 * @property {string} 300
 * @property {string} 400
 * @property {string} 500
 * @property {string} 600
 * @property {string} 700
 * @property {string} 800
 * @property {string} 900
 */

/**
 * @typedef {Object} TradingColors
 * @property {string} bullish
 * @property {string} bearish
 * @property {string} neutral
 * @property {string} volume
 * @property {string} spread
 */

/**
 * @typedef {Object} ColorPalette
 * @property {ColorScale} primary
 * @property {ColorScale} secondary
 * @property {ColorScale} neutral
 * @property {Object} semantic
 * @property {string} semantic.success
 * @property {string} semantic.warning
 * @property {string} semantic.error
 * @property {string} semantic.info
 * @property {TradingColors} trading
 * @property {Object} background
 * @property {string} background.primary
 * @property {string} background.secondary
 * @property {string} background.tertiary
 * @property {string} background.glass
 * @property {Object} text
 * @property {string} text.primary
 * @property {string} text.secondary
 * @property {string} text.tertiary
 * @property {string} text.inverse
 * @property {Object} border
 * @property {string} border.primary
 * @property {string} border.secondary
 * @property {string} border.focus
 */

/**
 * @typedef {Object} TypographyScale
 * @property {Object} fontFamily
 * @property {string} fontFamily.primary
 * @property {string} fontFamily.monospace
 * @property {Object} fontSize
 * @property {string} fontSize.xs
 * @property {string} fontSize.sm
 * @property {string} fontSize.base
 * @property {string} fontSize.lg
 * @property {string} fontSize.xl
 * @property {string} fontSize.2xl
 * @property {string} fontSize.3xl
 * @property {string} fontSize.4xl
 * @property {Object} fontWeight
 * @property {number} fontWeight.light
 * @property {number} fontWeight.normal
 * @property {number} fontWeight.medium
 * @property {number} fontWeight.semibold
 * @property {number} fontWeight.bold
 * @property {Object} lineHeight
 * @property {number} lineHeight.tight
 * @property {number} lineHeight.normal
 * @property {number} lineHeight.relaxed
 */

/**
 * @typedef {Object} SpacingScale
 * @property {string} 0
 * @property {string} 1
 * @property {string} 2
 * @property {string} 3
 * @property {string} 4
 * @property {string} 5
 * @property {string} 6
 * @property {string} 8
 * @property {string} 10
 * @property {string} 12
 * @property {string} 16
 * @property {string} 20
 * @property {string} 24
 * @property {string} 32
 * @property {string} 40
 * @property {string} 48
 * @property {string} 56
 * @property {string} 64
 */

/**
 * @typedef {Object} AnimationConfig
 * @property {Object} duration
 * @property {string} duration.fast
 * @property {string} duration.normal
 * @property {string} duration.slow
 * @property {Object} easing
 * @property {string} easing.linear
 * @property {string} easing.easeIn
 * @property {string} easing.easeOut
 * @property {string} easing.easeInOut
 * @property {string} easing.spring
 */

/**
 * @typedef {Object} BreakpointConfig
 * @property {string} xs
 * @property {string} sm
 * @property {string} md
 * @property {string} lg
 * @property {string} xl
 * @property {string} 2xl
 */

/**
 * @typedef {Object} ThemeConfig
 * @property {string} mode - 'light' or 'dark'
 * @property {ColorPalette} color
 * @property {TypographyScale} typography
 * @property {SpacingScale} spacing
 * @property {Object} borderRadius
 * @property {Object} shadows
 * @property {AnimationConfig} animation
 * @property {BreakpointConfig} breakpoints
 * @property {Object} zIndex
 */

/**
 * @typedef {Object} InteractionState
 * @property {boolean} hover
 * @property {boolean} focus
 * @property {boolean} active
 * @property {boolean} disabled
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @property {number} renderTime
 * @property {number} updateFrequency
 * @property {number} memoryUsage
 * @property {number} frameRate
 */

/**
 * @typedef {Object} ComponentState
 * @property {boolean} loading
 * @property {Error|null} error
 * @property {any} data
 * @property {InteractionState} interactions
 * @property {PerformanceMetrics} performance
 */

/**
 * @typedef {Object} ComponentProps
 * @property {string} [className]
 * @property {React.CSSProperties} [style]
 * @property {string} [testId]
 * @property {boolean} [disabled]
 * @property {React.ReactNode} [children]
 */

/**
 * @typedef {Object} AccessibilityProps
 * @property {string} [ariaLabel]
 * @property {string} [ariaDescribedBy]
 * @property {string} [ariaLabelledBy]
 * @property {string} [role]
 * @property {number} [tabIndex]
 */

// Component-specific types

/**
 * @typedef {Object} ButtonVariant
 * @property {'primary'|'secondary'|'outline'|'ghost'|'danger'} variant
 * @property {'xs'|'sm'|'md'|'lg'|'xl'} size
 * @property {boolean} [loading]
 * @property {boolean} [disabled]
 * @property {React.ReactNode} [leftIcon]
 * @property {React.ReactNode} [rightIcon]
 */

/**
 * @typedef {Object} InputProps
 * @property {'text'|'email'|'password'|'number'|'search'} type
 * @property {string} [placeholder]
 * @property {string} [value]
 * @property {function} [onChange]
 * @property {boolean} [error]
 * @property {string} [errorMessage]
 * @property {boolean} [disabled]
 * @property {boolean} [required]
 */

/**
 * @typedef {Object} ChartData
 * @property {number} timestamp
 * @property {number} open
 * @property {number} high
 * @property {number} low
 * @property {number} close
 * @property {number} volume
 */

/**
 * @typedef {Object} OrderLevel
 * @property {number} price
 * @property {number} size
 * @property {number} total
 * @property {number} count
 */

/**
 * @typedef {Object} WidgetConfig
 * @property {string} id
 * @property {string} type
 * @property {string} title
 * @property {Object} position
 * @property {number} position.x
 * @property {number} position.y
 * @property {Object} size
 * @property {number} size.width
 * @property {number} size.height
 * @property {boolean} resizable
 * @property {boolean} draggable
 */

export { }; // Make this a module