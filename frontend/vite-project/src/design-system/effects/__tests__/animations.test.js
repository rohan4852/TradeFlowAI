// Animation System Tests

import {
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
} from '../animations';

// Mock shouldReduceMotion
jest.mock('../../index', () => ({
    shouldReduceMotion: jest.fn(() => false),
}));

import { shouldReduceMotion } from '../../index';

describe('Animation System', () => {
    describe('animationPresets', () => {
        test('provides all basic animation presets', () => {
            const expectedPresets = [
                'fadeIn',
                'slideUp',
                'slideDown',
                'slideLeft',
                'slideRight',
                'scale',
                'scaleUp',
            ];

            expectedPresets.forEach(preset => {
                expect(animationPresets).toHaveProperty(preset);
                expect(animationPresets[preset]).toHaveProperty('initial');
                expect(animationPresets[preset]).toHaveProperty('animate');
                expect(animationPresets[preset]).toHaveProperty('exit');
                expect(animationPresets[preset]).toHaveProperty('transition');
            });
        });

        test('provides trading-specific animations', () => {
            const tradingPresets = [
                'priceFlash',
                'orderUpdate',
                'chartUpdate',
            ];

            tradingPresets.forEach(preset => {
                expect(animationPresets).toHaveProperty(preset);
            });
        });

        test('provides modal and overlay animations', () => {
            const modalPresets = [
                'modalBackdrop',
                'modalContent',
                'drawer',
            ];

            modalPresets.forEach(preset => {
                expect(animationPresets).toHaveProperty(preset);
            });
        });

        test('provides loading animations', () => {
            const loadingPresets = [
                'pulse',
                'bounce',
                'spin',
            ];

            loadingPresets.forEach(preset => {
                expect(animationPresets).toHaveProperty(preset);
                expect(animationPresets[preset]).toHaveProperty('animate');
                expect(animationPresets[preset]).toHaveProperty('transition');
            });
        });

        test('provides micro-interaction animations', () => {
            const microPresets = [
                'buttonHover',
                'cardHover',
                'iconHover',
            ];

            microPresets.forEach(preset => {
                expect(animationPresets).toHaveProperty(preset);
            });
        });

        test('animations have correct structure', () => {
            const fadeIn = animationPresets.fadeIn;

            expect(fadeIn.initial).toEqual({ opacity: 0 });
            expect(fadeIn.animate).toEqual({ opacity: 1 });
            expect(fadeIn.exit).toEqual({ opacity: 0 });
            expect(fadeIn.transition).toHaveProperty('duration');
            expect(fadeIn.transition).toHaveProperty('ease');
        });

        test('slide animations have correct directions', () => {
            expect(animationPresets.slideUp.initial.y).toBeGreaterThan(0);
            expect(animationPresets.slideUp.animate.y).toBe(0);
            expect(animationPresets.slideUp.exit.y).toBeLessThan(0);

            expect(animationPresets.slideDown.initial.y).toBeLessThan(0);
            expect(animationPresets.slideDown.animate.y).toBe(0);
            expect(animationPresets.slideDown.exit.y).toBeGreaterThan(0);
        });
    });

    describe('staggerAnimations', () => {
        test('provides stagger containers', () => {
            const containers = ['container', 'fastContainer', 'slowContainer'];

            containers.forEach(container => {
                expect(staggerAnimations).toHaveProperty(container);
                expect(staggerAnimations[container]).toHaveProperty('animate');
                expect(staggerAnimations[container].animate).toHaveProperty('transition');
                expect(staggerAnimations[container].animate.transition).toHaveProperty('staggerChildren');
            });
        });

        test('has different stagger timings', () => {
            const fast = staggerAnimations.fastContainer.animate.transition.staggerChildren;
            const normal = staggerAnimations.container.animate.transition.staggerChildren;
            const slow = staggerAnimations.slowContainer.animate.transition.staggerChildren;

            expect(fast).toBeLessThan(normal);
            expect(normal).toBeLessThan(slow);
        });

        test('provides stagger item animation', () => {
            expect(staggerAnimations).toHaveProperty('item');
            expect(staggerAnimations.item).toHaveProperty('initial');
            expect(staggerAnimations.item).toHaveProperty('animate');
            expect(staggerAnimations.item).toHaveProperty('exit');
        });
    });

    describe('tradingAnimations', () => {
        test('provides trading-specific animations', () => {
            const tradingAnims = [
                'orderBookLevel',
                'priceIncrease',
                'priceDecrease',
                'volumeBar',
                'chartLine',
                'candlestick',
                'marketOpen',
                'marketClosed',
            ];

            tradingAnims.forEach(anim => {
                expect(tradingAnimations).toHaveProperty(anim);
            });
        });

        test('price animations have correct colors', () => {
            const priceIncrease = tradingAnimations.priceIncrease;
            const priceDecrease = tradingAnimations.priceDecrease;

            expect(priceIncrease.animate.backgroundColor).toContain('#10b98133'); // Bull green
            expect(priceDecrease.animate.backgroundColor).toContain('#ef444433'); // Bear red
        });

        test('market status animations have infinite repeat', () => {
            expect(tradingAnimations.marketOpen.transition.repeat).toBe(Infinity);
            expect(tradingAnimations.marketClosed.transition.repeat).toBe(Infinity);
        });

        test('chart animations use appropriate durations', () => {
            expect(tradingAnimations.chartLine.transition.duration).toBeGreaterThan(1);
            expect(tradingAnimations.candlestick.transition.duration).toBeLessThan(1);
        });
    });

    describe('pageTransitions', () => {
        test('provides page transition animations', () => {
            const transitions = ['fade', 'slide', 'scale'];

            transitions.forEach(transition => {
                expect(pageTransitions).toHaveProperty(transition);
                expect(pageTransitions[transition]).toHaveProperty('initial');
                expect(pageTransitions[transition]).toHaveProperty('animate');
                expect(pageTransitions[transition]).toHaveProperty('exit');
            });
        });

        test('transitions have appropriate durations', () => {
            Object.values(pageTransitions).forEach(transition => {
                expect(transition.transition.duration).toBeGreaterThan(0);
                expect(transition.transition.duration).toBeLessThan(1);
            });
        });
    });

    describe('createResponsiveAnimation', () => {
        beforeEach(() => {
            shouldReduceMotion.mockClear();
        });

        test('returns original animation when motion is not reduced', () => {
            shouldReduceMotion.mockReturnValue(false);

            const originalAnimation = animationPresets.fadeIn;
            const result = createResponsiveAnimation(originalAnimation);

            expect(result).toEqual(originalAnimation);
        });

        test('returns simplified animation when motion is reduced', () => {
            shouldReduceMotion.mockReturnValue(true);

            const originalAnimation = animationPresets.slideUp;
            const result = createResponsiveAnimation(originalAnimation);

            expect(result.transition.duration).toBe(0.1);
            expect(result.initial).toEqual({ opacity: 0 });
            expect(result.animate).toEqual({ opacity: 1 });
        });

        test('uses custom fallback when provided', () => {
            shouldReduceMotion.mockReturnValue(true);

            const fallback = {
                initial: { scale: 0.9 },
                animate: { scale: 1 },
                exit: { scale: 0.9 },
            };

            const result = createResponsiveAnimation(animationPresets.scale, fallback);

            expect(result.initial).toEqual(fallback.initial);
            expect(result.animate).toEqual(fallback.animate);
            expect(result.exit).toEqual(fallback.exit);
        });
    });

    describe('easingFunctions', () => {
        test('provides standard easing functions', () => {
            const standardEasing = ['linear', 'easeIn', 'easeOut', 'easeInOut'];

            standardEasing.forEach(easing => {
                expect(easingFunctions).toHaveProperty(easing);
                expect(Array.isArray(easingFunctions[easing])).toBe(true);
                expect(easingFunctions[easing]).toHaveLength(4);
            });
        });

        test('provides custom easing functions', () => {
            const customEasing = ['smooth', 'snappy', 'bounce', 'elastic'];

            customEasing.forEach(easing => {
                expect(easingFunctions).toHaveProperty(easing);
                expect(Array.isArray(easingFunctions[easing])).toBe(true);
            });
        });

        test('provides trading-specific easing', () => {
            const tradingEasing = ['priceMovement', 'orderExecution', 'chartUpdate'];

            tradingEasing.forEach(easing => {
                expect(easingFunctions).toHaveProperty(easing);
                expect(Array.isArray(easingFunctions[easing])).toBe(true);
            });
        });

        test('easing values are within valid range', () => {
            Object.values(easingFunctions).forEach(easing => {
                easing.forEach(value => {
                    expect(value).toBeGreaterThanOrEqual(0);
                    expect(value).toBeLessThanOrEqual(1);
                });
            });
        });
    });

    describe('durations', () => {
        test('provides duration presets', () => {
            const durationKeys = [
                'instant',
                'fast',
                'normal',
                'slow',
                'slower',
                'slowest',
            ];

            durationKeys.forEach(key => {
                expect(durations).toHaveProperty(key);
                expect(typeof durations[key]).toBe('number');
                expect(durations[key]).toBeGreaterThan(0);
            });
        });

        test('provides trading-specific durations', () => {
            const tradingDurations = [
                'priceFlash',
                'orderUpdate',
                'chartTransition',
                'modalTransition',
            ];

            tradingDurations.forEach(key => {
                expect(durations).toHaveProperty(key);
                expect(typeof durations[key]).toBe('number');
            });
        });

        test('durations are in ascending order', () => {
            expect(durations.instant).toBeLessThan(durations.fast);
            expect(durations.fast).toBeLessThan(durations.normal);
            expect(durations.normal).toBeLessThan(durations.slow);
            expect(durations.slow).toBeLessThan(durations.slower);
            expect(durations.slower).toBeLessThan(durations.slowest);
        });
    });

    describe('createStateAnimations', () => {
        test('creates animation variants with base animation', () => {
            const baseAnimation = animationPresets.fadeIn;
            const result = createStateAnimations(baseAnimation);

            expect(result).toHaveProperty('initial', baseAnimation.initial);
            expect(result).toHaveProperty('animate', baseAnimation.animate);
            expect(result).toHaveProperty('exit', baseAnimation.exit);
        });

        test('adds custom states', () => {
            const baseAnimation = animationPresets.fadeIn;
            const customStates = {
                loading: { opacity: 0.5, scale: 0.95 },
                error: { opacity: 1, x: [-5, 5, -5, 0] },
            };

            const result = createStateAnimations(baseAnimation, customStates);

            expect(result).toHaveProperty('loading', customStates.loading);
            expect(result).toHaveProperty('error', customStates.error);
        });

        test('preserves base animation properties', () => {
            const baseAnimation = animationPresets.slideUp;
            const customStates = { hover: { scale: 1.05 } };

            const result = createStateAnimations(baseAnimation, customStates);

            expect(result.initial).toEqual(baseAnimation.initial);
            expect(result.animate).toEqual(baseAnimation.animate);
            expect(result.exit).toEqual(baseAnimation.exit);
            expect(result.hover).toEqual(customStates.hover);
        });
    });

    describe('gestureAnimations', () => {
        test('provides gesture-based animations', () => {
            const gestures = ['drag', 'swipe', 'pinch'];

            gestures.forEach(gesture => {
                expect(gestureAnimations).toHaveProperty(gesture);
            });
        });

        test('drag animation has correct properties', () => {
            const drag = gestureAnimations.drag;

            expect(drag).toHaveProperty('drag', true);
            expect(drag).toHaveProperty('dragConstraints');
            expect(drag).toHaveProperty('dragElastic');
            expect(drag).toHaveProperty('whileDrag');
        });

        test('gesture animations have appropriate transitions', () => {
            Object.values(gestureAnimations).forEach(gesture => {
                if (gesture.transition) {
                    expect(gesture.transition).toHaveProperty('type');
                    expect(gesture.transition).toHaveProperty('stiffness');
                    expect(gesture.transition).toHaveProperty('damping');
                }
            });
        });
    });

    describe('performanceAnimations', () => {
        test('provides performance-optimized animations', () => {
            const perfAnims = ['optimizedSlide', 'optimizedScale'];

            perfAnims.forEach(anim => {
                expect(performanceAnimations).toHaveProperty(anim);
            });
        });

        test('uses transform instead of layout properties', () => {
            const optimizedSlide = performanceAnimations.optimizedSlide;

            expect(optimizedSlide.initial.transform).toBeDefined();
            expect(optimizedSlide.animate.transform).toBeDefined();
            expect(optimizedSlide.exit.transform).toBeDefined();
        });

        test('includes will-change for performance', () => {
            const optimizedScale = performanceAnimations.optimizedScale;

            expect(optimizedScale.style).toHaveProperty('willChange');
            expect(optimizedScale.style.willChange).toContain('transform');
        });
    });

    describe('Edge Cases', () => {
        test('handles undefined animation gracefully', () => {
            expect(() => {
                createResponsiveAnimation(undefined);
            }).not.toThrow();
        });

        test('handles empty states object', () => {
            const result = createStateAnimations(animationPresets.fadeIn, {});

            expect(result).toHaveProperty('initial');
            expect(result).toHaveProperty('animate');
            expect(result).toHaveProperty('exit');
        });

        test('handles null base animation', () => {
            expect(() => {
                createStateAnimations(null, { hover: { scale: 1.05 } });
            }).not.toThrow();
        });
    });

    describe('Performance', () => {
        test('animation creation is performant', () => {
            const start = performance.now();

            // Create multiple animations
            for (let i = 0; i < 1000; i++) {
                createResponsiveAnimation(animationPresets.fadeIn);
                createStateAnimations(animationPresets.slideUp, { hover: { scale: 1.05 } });
            }

            const end = performance.now();
            const duration = end - start;

            // Should complete 2000 operations in less than 100ms
            expect(duration).toBeLessThan(100);
        });
    });
});