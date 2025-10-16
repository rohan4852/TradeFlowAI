import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './tokens';

// Theme Context
const ThemeContext = createContext({
    theme: lightTheme,
    isDark: false,
    toggleTheme: () => { },
    setTheme: () => { },
});

// Custom hook to use theme
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Theme Provider Component
export const ThemeProvider = ({ children, defaultTheme = 'light' }) => {
    const [isDark, setIsDark] = useState(() => {
        // Check localStorage first, then system preference, then default
        const saved = localStorage.getItem('theme-preference');
        if (saved) {
            return saved === 'dark';
        }

        if (defaultTheme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        return defaultTheme === 'dark';
    });

    const theme = isDark ? darkTheme : lightTheme;

    const toggleTheme = () => {
        setIsDark(prev => !prev);
    };

    const setTheme = (themeName) => {
        if (themeName === 'system') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDark(systemPrefersDark);
            localStorage.removeItem('theme-preference');
        } else {
            setIsDark(themeName === 'dark');
            localStorage.setItem('theme-preference', themeName);
        }
    };

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            // Only update if user hasn't set a manual preference
            if (!localStorage.getItem('theme-preference')) {
                setIsDark(e.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Save theme preference
    useEffect(() => {
        const preference = localStorage.getItem('theme-preference');
        if (preference) {
            localStorage.setItem('theme-preference', isDark ? 'dark' : 'light');
        }
    }, [isDark]);

    // Apply theme to document root for CSS custom properties
    useEffect(() => {
        const root = document.documentElement;

        // Set CSS custom properties for the current theme
        Object.entries(theme.color.background).forEach(([key, value]) => {
            root.style.setProperty(`--color-bg-${key}`, value);
        });

        Object.entries(theme.color.text).forEach(([key, value]) => {
            root.style.setProperty(`--color-text-${key}`, value);
        });

        Object.entries(theme.color.border).forEach(([key, value]) => {
            root.style.setProperty(`--color-border-${key}`, value);
        });

        // Set theme mode class
        root.classList.remove('light', 'dark');
        root.classList.add(theme.mode);

        // Set color scheme for native elements
        root.style.colorScheme = theme.mode;
    }, [theme]);

    const contextValue = {
        theme,
        isDark,
        toggleTheme,
        setTheme,
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            <StyledThemeProvider theme={theme}>
                {children}
            </StyledThemeProvider>
        </ThemeContext.Provider>
    );
};

// Theme utilities
export const getThemeValue = (path, theme) => {
    return path.split('.').reduce((obj, key) => obj?.[key], theme);
};

// Responsive breakpoint utilities
export const breakpoint = {
    up: (size, theme) => `@media (min-width: ${theme.breakpoints[size]})`,
    down: (size, theme) => {
        const breakpoints = Object.keys(theme.breakpoints);
        const index = breakpoints.indexOf(size);
        if (index === 0) return '@media (max-width: 0px)';
        const prevSize = breakpoints[index - 1];
        return `@media (max-width: calc(${theme.breakpoints[prevSize]} - 1px))`;
    },
    between: (min, max, theme) =>
        `@media (min-width: ${theme.breakpoints[min]}) and (max-width: calc(${theme.breakpoints[max]} - 1px))`,
    only: (size, theme) => {
        const breakpoints = Object.keys(theme.breakpoints);
        const index = breakpoints.indexOf(size);
        if (index === breakpoints.length - 1) {
            return `@media (min-width: ${theme.breakpoints[size]})`;
        }
        const nextSize = breakpoints[index + 1];
        return `@media (min-width: ${theme.breakpoints[size]}) and (max-width: calc(${theme.breakpoints[nextSize]} - 1px))`;
    },
};

export default ThemeProvider;