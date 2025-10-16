// Glassmorphism Effects Tests

import {
    createGlassmorphism,
    tradingGlassPresets,
    createMarketGlass,
    createFrostedGlass,
    createLiquidGlass,
    createHolographicGlass,
} from '../glassmorphism';
import { lightTheme, darkTheme } from '../../tokens';

describe('Glassmorphism Effects', () => {
    describe('createGlassmorphism', () => {
        test('creates basic glassmorphism effect', () => {
            const result = createGlassmorphism(lightTheme);

            expect(result).toHaveProperty('background');
            expect(result).toHaveProperty('backdropFilter');
            expect(result).toHaveProperty('WebkitBackdropFilter');
            expect(result).toHaveProperty('border');
            expect(result).toHaveProperty('boxShadow');
            expect(result).toHaveProperty('borderRadius');
        });

        test('supports different intensity levels', () => {
            const subtle = createGlassmorphism(lightTheme, { intensity: 'subtle' });
            const intense = createGlassmorphism(lightTheme, { intensity: 'intense' });

            expect(subtle.backdropFilter).toContain('blur(8px)');
            expect(intense.backdropFilter).toContain('blur(24px)');
        });

        test('supports custom blur values', () => {
            const result = createGlassmorphism(lightTheme, { blur: 32 });

            expect(result.backdropFilter).toContain('blur(32px)');
            expect(result.WebkitBackdropFilter).toContain('blur(32px)');
        });

        test('supports different border styles', () => {
            const solid = createGlassmorphism(lightTheme, { borderStyle: 'solid' });
            const gradient = createGlassmorphism(lightTheme, { borderStyle: 'gradient' });
            const none = createGlassmorphism(lightTheme, { borderStyle: 'none' });

            expect(solid.border).toContain('solid');
            expect(gradient.border).toBe('1px solid transparent');
            expect(none.border).toBe('none');
        });

        test('supports animation option', () => {
            const animated = createGlassmorphism(lightTheme, { animated: true });
            const static = createGlassmorphism(lightTheme, { animated: false });

            expect(animated).toHaveProperty('transition');
            expect(static).not.toHaveProperty('transition');
        });

        test('supports interactive option', () => {
            const interactive = createGlassmorphism(lightTheme, { interactive: true });
            const nonInteractive = createGlassmorphism(lightTheme, { interactive: false });

            expect(interactive).toHaveProperty('cursor', 'pointer');
            expect(interactive).toHaveProperty('&:hover');
            expect(nonInteractive).not.toHaveProperty('cursor');
        });

        test('supports color tinting', () => {
            const tinted = createGlassmorphism(lightTheme, { colorTint: '#ff0000' });

            expect(tinted.background).toContain('255, 0, 0');
        });

        test('adapts to theme mode', () => {
            const lightGlass = createGlassmorphism(lightTheme);
            const darkGlass = createGlassmorphism(darkTheme);

            // Both should have valid styles but may differ based on theme
            expect(lightGlass.background).toBeDefined();
            expect(darkGlass.background).toBeDefined();
        });
    });

    describe('tradingGlassPresets', () => {
        test('provides all trading presets', () => {
            const presets = [
                'orderBook',
                'chartOverlay',
                'widget',
                'modal',
                'navigation',
                'card',
                'sidebar',
                'tooltip',
            ];

            presets.forEach(preset => {
                expect(tradingGlassPresets).toHaveProperty(preset);
                expect(typeof tradingGlassPresets[preset]).toBe('function');
            });
        });

        test('trading presets return valid glass effects', () => {
            const widget = tradingGlassPresets.widget(lightTheme);
            const orderBook = tradingGlassPresets.orderBook(lightTheme);

            expect(widget).toHaveProperty('background');
            expect(widget).toHaveProperty('backdropFilter');
            expect(orderBook).toHaveProperty('background');
            expect(orderBook).toHaveProperty('backdropFilter');
        });

        test('presets have appropriate configurations', () => {
            const modal = tradingGlassPresets.modal(lightTheme);
            const tooltip = tradingGlassPresets.tooltip(lightTheme);

            // Modal should have stronger effect than tooltip
            expect(modal.backdropFilter).toContain('blur(20px)');
            expect(tooltip.backdropFilter).toContain('blur(');
        });
    });

    describe('createMarketGlass', () => {
        test('creates market-responsive glass', () => {
            const bullish = createMarketGlass(lightTheme, 'bullish');
            const bearish = createMarketGlass(lightTheme, 'bearish');
            const neutral = createMarketGlass(lightTheme, 'neutral');

            expect(bullish).toHaveProperty('background');
            expect(bearish).toHaveProperty('background');
            expect(neutral).toHaveProperty('background');
        });

        test('applies correct colors for market conditions', () => {
            const bullish = createMarketGlass(lightTheme, 'bullish');
            const bearish = createMarketGlass(lightTheme, 'bearish');

            // Should contain trading colors
            expect(bullish.background).toContain('16, 185, 129'); // Bull green
            expect(bearish.background).toContain('239, 68, 68'); // Bear red
        });

        test('supports all market conditions', () => {
            const conditions = ['bullish', 'bearish', 'neutral', 'volatile', 'stable'];

            conditions.forEach(condition => {
                const result = createMarketGlass(lightTheme, condition);
                expect(result).toHaveProperty('background');
                expect(result).toHaveProperty('backdropFilter');
            });
        });
    });

    describe('createFrostedGlass', () => {
        test('creates frosted glass effect', () => {
            const frosted = createFrostedGlass(lightTheme);

            expect(frosted).toHaveProperty('background');
            expect(frosted).toHaveProperty('backdropFilter');
        });

        test('supports noise option', () => {
            const withNoise = createFrostedGlass(lightTheme, { noise: true });
            const withoutNoise = createFrostedGlass(lightTheme, { noise: false });

            expect(withNoise).toHaveProperty('&::before');
            expect(withoutNoise).not.toHaveProperty('&::before');
        });

        test('supports different intensities', () => {
            const light = createFrostedGlass(lightTheme, { intensity: 'light' });
            const strong = createFrostedGlass(lightTheme, { intensity: 'strong' });

            expect(light.backdropFilter).toContain('blur(');
            expect(strong.backdropFilter).toContain('blur(');
        });
    });

    describe('createLiquidGlass', () => {
        test('creates liquid glass effect', () => {
            const liquid = createLiquidGlass(lightTheme);

            expect(liquid).toHaveProperty('background');
            expect(liquid).toHaveProperty('backdropFilter');
            expect(liquid).toHaveProperty('backgroundImage');
            expect(liquid).toHaveProperty('animation');
        });

        test('supports different flow directions', () => {
            const horizontal = createLiquidGlass(lightTheme, { flowDirection: 'horizontal' });
            const vertical = createLiquidGlass(lightTheme, { flowDirection: 'vertical' });
            const diagonal = createLiquidGlass(lightTheme, { flowDirection: 'diagonal' });

            expect(horizontal.animation).toContain('liquidFlow');
            expect(vertical.animation).toContain('liquidFlowVertical');
            expect(diagonal.animation).toContain('liquidFlowDiagonal');
        });

        test('supports different speeds', () => {
            const slow = createLiquidGlass(lightTheme, { speed: 'slow' });
            const fast = createLiquidGlass(lightTheme, { speed: 'fast' });

            expect(slow.animation).toContain('8s');
            expect(fast.animation).toContain('4s');
        });
    });

    describe('createHolographicGlass', () => {
        test('creates holographic glass effect', () => {
            const holo = createHolographicGlass(lightTheme);

            expect(holo).toHaveProperty('background');
            expect(holo).toHaveProperty('backdropFilter');
        });

        test('supports rainbow option', () => {
            const rainbow = createHolographicGlass(lightTheme, { rainbow: true });
            const noRainbow = createHolographicGlass(lightTheme, { rainbow: false });

            expect(rainbow).toHaveProperty('background');
            expect(rainbow.background).toContain('linear-gradient');
            expect(noRainbow.background).not.toContain('linear-gradient');
        });

        test('supports animation option', () => {
            const animated = createHolographicGlass(lightTheme, { animated: true });
            const static = createHolographicGlass(lightTheme, { animated: false });

            expect(animated.animation).toBe('holographicShift 8s ease-in-out infinite');
            expect(static.animation).toBe('none');
        });
    });

    describe('Edge Cases', () => {
        test('handles invalid intensity gracefully', () => {
            const result = createGlassmorphism(lightTheme, { intensity: 'invalid' });

            // Should fallback to medium intensity
            expect(result.backdropFilter).toContain('blur(16px)');
        });

        test('handles missing theme properties', () => {
            const incompleteTheme = {
                mode: 'light',
                color: { neutral: { 200: '#e5e5e5' } },
                borderRadius: { lg: '8px' },
                animation: { duration: { normal: '300ms' }, easing: { easeInOut: 'ease-in-out' } },
            };

            expect(() => {
                createGlassmorphism(incompleteTheme);
            }).not.toThrow();
        });

        test('handles extreme blur values', () => {
            const extremeBlur = createGlassmorphism(lightTheme, { blur: 100 });

            expect(extremeBlur.backdropFilter).toContain('blur(100px)');
        });

        test('handles zero opacity', () => {
            const zeroOpacity = createGlassmorphism(lightTheme, { opacity: 0 });

            expect(zeroOpacity.background).toContain('rgba(255, 255, 255, 0)');
        });
    });

    describe('Performance', () => {
        test('glass effects are performant', () => {
            const start = performance.now();

            // Create multiple glass effects
            for (let i = 0; i < 100; i++) {
                createGlassmorphism(lightTheme, { intensity: 'medium' });
                tradingGlassPresets.widget(lightTheme);
                createMarketGlass(lightTheme, 'bullish');
            }

            const end = performance.now();
            const duration = end - start;

            // Should complete 300 operations in less than 100ms
            expect(duration).toBeLessThan(100);
        });
    });
});