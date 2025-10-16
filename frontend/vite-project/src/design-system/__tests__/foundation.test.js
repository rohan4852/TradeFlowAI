// Design System Foundation Tests
// Tests for design tokens, theme provider, and core utilities

import { designTokens, lightTheme, darkTheme } from '../tokens';
import {
    rgba,
    glassmorphism,
    focusRing,
    transition,
    getTradingColor,
    formatPrice,
    formatVolume,
    formatPercentage,
    getOptimalUpdateFrequency,
    shouldReduceMotion
} from '../index';

describe('Design Tokens', () => {
    test('should have all required color scales', () => {
        expect(designTokens.color.primary).toBeDefined();
        expect(designTokens.color.secondary).toBeDefined();
        expect(designTokens.color.neutral).toBeDefined();
        expect(designTokens.color.semantic).toBeDefined();
        expect(designTokens.color.trading).toBeDefined();
    });

    test('should have complete color scales with all steps', () => {
        const colorSteps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

        colorSteps.forEach(step => {
            expect(designTokens.color.primary[step]).toBeDefined();
            expect(designTokens.color.secondary[step]).toBeDefined();
            expect(designTokens.color.neutral[step]).toBeDefined();
        });
    });

    test('should have trading-specific colors', () => {
        expect(designTokens.color.trading.bull).toBeDefined();
        expect(designTokens.color.trading.bear).toBeDefined();
        expect(designTokens.color.trading.neutral).toBeDefined();
        expect(designTokens.color.trading.volume).toBeDefined();
        expect(designTokens.color.trading.spread).toBeDefined();
    });

    test('should have typography scales', () => {
        expect(designTokens.typography.fontFamily.primary).toBeDefined();
        expect(designTokens.typography.fontFamily.monospace).toBeDefined();
        expect(designTokens.typography.fontSize.xs).toBeDefined();
        expect(designTokens.typography.fontSize['4xl']).toBeDefined();
        expect(designTokens.typography.fontWeight.light).toBeDefined();
        expect(designTokens.typography.fontWeight.bold).toBeDefined();
    });

    test('should have spacing scale', () => {
        expect(designTokens.spacing[0]).toBe('0');
        expect(designTokens.spacing[4]).toBe('1rem');
        expect(designTokens.spacing[64]).toBe('16rem');
    });

    test('should have animation configurations', () => {
        expect(designTokens.animation.duration.fast).toBeDefined();
        expect(designTokens.animation.duration.normal).toBeDefined();
        expect(designTokens.animation.duration.slow).toBeDefined();
        expect(designTokens.animation.easing.easeInOut).toBeDefined();
    });
});

describe('Theme Configurations', () => {
    test('light theme should have correct mode', () => {
        expect(lightTheme.mode).toBe('light');
    });

    test('dark theme should have correct mode', () => {
        expect(darkTheme.mode).toBe('dark');
    });

    test('themes should have background colors', () => {
        expect(lightTheme.color.background.primary).toBeDefined();
        expect(darkTheme.color.background.primary).toBeDefined();
        expect(lightTheme.color.background.primary).not.toBe(darkTheme.color.background.primary);
    });

    test('themes should have text colors', () => {
        expect(lightTheme.color.text.primary).toBeDefined();
        expect(darkTheme.color.text.primary).toBeDefined();
        expect(lightTheme.color.text.primary).not.toBe(darkTheme.color.text.primary);
    });

    test('themes should have border colors', () => {
        expect(lightTheme.color.border.primary).toBeDefined();
        expect(darkTheme.color.border.primary).toBeDefined();
        expect(lightTheme.color.border.focus).toBeDefined();
        expect(darkTheme.color.border.focus).toBeDefined();
    });
});

describe('Utility Functions', () => {
    const mockTheme = lightTheme;

    test('rgba should convert hex to rgba', () => {
        const result = rgba('#ff0000', 0.5);
        expect(result).toBe('rgba(255, 0, 0, 0.5)');
    });

    test('glassmorphism should return correct styles', () => {
        const result = glassmorphism(mockTheme, 'medium');
        expect(result).toHaveProperty('background');
        expect(result).toHaveProperty('backdropFilter');
        expect(result).toHaveProperty('border');
        expect(result).toHaveProperty('boxShadow');
        expect(result).toHaveProperty('borderRadius');
    });

    test('focusRing should return focus styles', () => {
        const result = focusRing(mockTheme, 'primary');
        expect(result).toHaveProperty('outline', 'none');
        expect(result).toHaveProperty('boxShadow');
        expect(result).toHaveProperty('borderColor');
    });

    test('transition should create CSS transition', () => {
        const result = transition('all', 'normal', 'easeInOut', mockTheme);
        expect(result).toContain('all');
        expect(result).toContain(mockTheme.animation.duration.normal);
        expect(result).toContain(mockTheme.animation.easing.easeInOut);
    });

    test('getTradingColor should return correct colors', () => {
        expect(getTradingColor(1, mockTheme)).toBe(mockTheme.color.trading.bull);
        expect(getTradingColor(-1, mockTheme)).toBe(mockTheme.color.trading.bear);
        expect(getTradingColor(0, mockTheme)).toBe(mockTheme.color.trading.neutral);
    });
});

describe('Formatting Functions', () => {
    test('formatPrice should format prices correctly', () => {
        expect(formatPrice(1234.56)).toBe('1,234.56');
        expect(formatPrice(1234.567, 3)).toBe('1,234.567');
        expect(formatPrice(0.001, 4)).toBe('0.0010');
    });

    test('formatVolume should format volumes correctly', () => {
        expect(formatVolume(1234)).toBe('1234');
        expect(formatVolume(1234567)).toBe('1.2M');
        expect(formatVolume(1234567890)).toBe('1.2B');
        expect(formatVolume(12345)).toBe('12.3K');
    });

    test('formatPercentage should format percentages correctly', () => {
        expect(formatPercentage(5.67)).toBe('+5.67%');
        expect(formatPercentage(-3.45)).toBe('-3.45%');
        expect(formatPercentage(0)).toBe('+0.00%');
        expect(formatPercentage(12.345, 1)).toBe('+12.3%');
    });
});

describe('Performance Utilities', () => {
    test('getOptimalUpdateFrequency should return correct frequencies', () => {
        expect(getOptimalUpdateFrequency(100)).toBe(16); // 60 FPS
        expect(getOptimalUpdateFrequency(5000)).toBe(33); // 30 FPS
        expect(getOptimalUpdateFrequency(15000)).toBe(100); // 10 FPS
    });

    test('shouldReduceMotion should check media query', () => {
        // Mock matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(query => ({
                matches: query === '(prefers-reduced-motion: reduce)',
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });

        const result = shouldReduceMotion();
        expect(typeof result).toBe('boolean');
    });
});

describe('Accessibility', () => {
    test('should have screen reader utilities', () => {
        const { visuallyHidden, screenReaderOnly } = require('../index');

        expect(visuallyHidden).toBeDefined();
        expect(screenReaderOnly).toBeDefined();
        expect(visuallyHidden).toEqual(screenReaderOnly);

        expect(visuallyHidden.position).toBe('absolute');
        expect(visuallyHidden.width).toBe('1px');
        expect(visuallyHidden.height).toBe('1px');
    });
});

describe('Size Variants', () => {
    test('should have all size variants', () => {
        const { sizeVariants } = require('../index');

        expect(sizeVariants.xs).toBeDefined();
        expect(sizeVariants.sm).toBeDefined();
        expect(sizeVariants.md).toBeDefined();
        expect(sizeVariants.lg).toBeDefined();
        expect(sizeVariants.xl).toBeDefined();

        // Check that each variant has required properties
        Object.values(sizeVariants).forEach(variant => {
            expect(variant).toHaveProperty('padding');
            expect(variant).toHaveProperty('fontSize');
            expect(variant).toHaveProperty('height');
        });
    });
});

describe('Animation Presets', () => {
    test('should have animation presets', () => {
        const { animations } = require('../index');

        expect(animations.fadeIn).toBeDefined();
        expect(animations.slideUp).toBeDefined();
        expect(animations.slideDown).toBeDefined();
        expect(animations.scale).toBeDefined();
        expect(animations.spring).toBeDefined();

        // Check animation structure
        expect(animations.fadeIn).toHaveProperty('initial');
        expect(animations.fadeIn).toHaveProperty('animate');
        expect(animations.fadeIn).toHaveProperty('exit');
    });
});

// Integration tests
describe('Design System Integration', () => {
    test('should work together seamlessly', () => {
        const theme = lightTheme;

        // Test that utilities work with theme
        const glassEffect = glassmorphism(theme, 'medium');
        const focus = focusRing(theme, 'primary');
        const trans = transition(['opacity', 'transform'], 'fast', 'easeOut', theme);

        expect(glassEffect).toBeDefined();
        expect(focus).toBeDefined();
        expect(trans).toBeDefined();

        // Test that colors are consistent
        expect(theme.color.trading.bull).toBe(designTokens.color.trading.bull);
        expect(theme.color.primary[500]).toBe(designTokens.color.primary[500]);
    });

    test('should maintain consistency between light and dark themes', () => {
        // Both themes should have the same structure
        const lightKeys = Object.keys(lightTheme.color);
        const darkKeys = Object.keys(darkTheme.color);

        expect(lightKeys.sort()).toEqual(darkKeys.sort());

        // Trading colors should be the same in both themes
        expect(lightTheme.color.trading).toEqual(darkTheme.color.trading);

        // Primary colors should be the same in both themes
        expect(lightTheme.color.primary).toEqual(darkTheme.color.primary);
    });
});

// Performance tests
describe('Performance', () => {
    test('utility functions should be performant', () => {
        const iterations = 10000;
        const theme = lightTheme;

        const start = performance.now();

        for (let i = 0; i < iterations; i++) {
            rgba('#ff0000', 0.5);
            getTradingColor(Math.random() - 0.5, theme);
            formatPrice(Math.random() * 1000);
            formatVolume(Math.random() * 1000000);
        }

        const end = performance.now();
        const duration = end - start;

        // Should complete 10k iterations in less than 100ms
        expect(duration).toBeLessThan(100);
    });
});