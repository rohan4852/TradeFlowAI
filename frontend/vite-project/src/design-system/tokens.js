// Design Tokens Configuration
// Professional trading platform color palette inspired by TradingView and Walbi

export const designTokens = {
    color: {
        // Primary brand colors
        primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
        },

        // Secondary colors
        secondary: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
        },

        // Semantic colors
        semantic: {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
        },

        // Trading-specific colors
        trading: {
            bull: '#10b981',    // Green for bullish/buy
            bear: '#ef4444',    // Red for bearish/sell
            neutral: '#64748b', // Gray for neutral
            volume: '#8b5cf6',  // Purple for volume
            spread: '#f59e0b',  // Orange for spread
        },

        // Neutral grays
        neutral: {
            50: '#fafafa',
            100: '#f4f4f5',
            200: '#e4e4e7',
            300: '#d4d4d8',
            400: '#a1a1aa',
            500: '#71717a',
            600: '#52525b',
            700: '#3f3f46',
            800: '#27272a',
            900: '#18181b',
        },

        // Glassmorphism colors
        glass: {
            light: 'rgba(255, 255, 255, 0.1)',
            medium: 'rgba(255, 255, 255, 0.2)',
            dark: 'rgba(0, 0, 0, 0.1)',
            backdrop: 'rgba(255, 255, 255, 0.05)',
        },
    },

    typography: {
        fontFamily: {
            primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            monospace: '"JetBrains Mono", "Fira Code", Consolas, "Liberation Mono", Menlo, Courier, monospace',
        },
        fontSize: {
            xs: '0.75rem',    // 12px
            sm: '0.875rem',   // 14px
            base: '1rem',     // 16px
            lg: '1.125rem',   // 18px
            xl: '1.25rem',    // 20px
            '2xl': '1.5rem',  // 24px
            '3xl': '1.875rem', // 30px
            '4xl': '2.25rem', // 36px
        },
        fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
        lineHeight: {
            tight: 1.25,
            normal: 1.5,
            relaxed: 1.75,
        },
    },

    spacing: {
        0: '0',
        1: '0.25rem',   // 4px
        2: '0.5rem',    // 8px
        3: '0.75rem',   // 12px
        4: '1rem',      // 16px
        5: '1.25rem',   // 20px
        6: '1.5rem',    // 24px
        8: '2rem',      // 32px
        10: '2.5rem',   // 40px
        12: '3rem',     // 48px
        16: '4rem',     // 64px
        20: '5rem',     // 80px
        24: '6rem',     // 96px
        32: '8rem',     // 128px
        40: '10rem',    // 160px
        48: '12rem',    // 192px
        56: '14rem',    // 224px
        64: '16rem',    // 256px
    },

    borderRadius: {
        none: '0',
        sm: '0.125rem',   // 2px
        base: '0.25rem',  // 4px
        md: '0.375rem',   // 6px
        lg: '0.5rem',     // 8px
        xl: '0.75rem',    // 12px
        '2xl': '1rem',    // 16px
        '3xl': '1.5rem',  // 24px
        full: '9999px',
    },

    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    },

    animation: {
        duration: {
            fast: '150ms',
            normal: '300ms',
            slow: '500ms',
        },
        easing: {
            linear: 'linear',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        },
    },

    breakpoints: {
        xs: '475px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
    },

    zIndex: {
        hide: -1,
        auto: 'auto',
        base: 0,
        docked: 10,
        dropdown: 1000,
        sticky: 1100,
        banner: 1200,
        overlay: 1300,
        modal: 1400,
        popover: 1500,
        skipLink: 1600,
        toast: 1700,
        tooltip: 1800,
    },
};

// Theme configurations
export const lightTheme = {
    ...designTokens,
    mode: 'light',
    color: {
        ...designTokens.color,
        background: {
            primary: designTokens.color.neutral[50],
            secondary: designTokens.color.neutral[100],
            tertiary: designTokens.color.neutral[200],
            glass: designTokens.color.glass.light,
        },
        text: {
            primary: designTokens.color.neutral[900],
            secondary: designTokens.color.neutral[700],
            tertiary: designTokens.color.neutral[500],
            inverse: designTokens.color.neutral[50],
        },
        border: {
            primary: designTokens.color.neutral[200],
            secondary: designTokens.color.neutral[300],
            focus: designTokens.color.primary[500],
        },
    },
};

export const darkTheme = {
    ...designTokens,
    mode: 'dark',
    color: {
        ...designTokens.color,
        background: {
            primary: designTokens.color.neutral[900],
            secondary: designTokens.color.neutral[800],
            tertiary: designTokens.color.neutral[700],
            glass: designTokens.color.glass.dark,
        },
        text: {
            primary: designTokens.color.neutral[50],
            secondary: designTokens.color.neutral[300],
            tertiary: designTokens.color.neutral[500],
            inverse: designTokens.color.neutral[900],
        },
        border: {
            primary: designTokens.color.neutral[700],
            secondary: designTokens.color.neutral[600],
            focus: designTokens.color.primary[400],
        },
    },
};