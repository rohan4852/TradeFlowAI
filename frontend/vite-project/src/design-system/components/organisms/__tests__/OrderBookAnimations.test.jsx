import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { motion } from 'framer-motion';
import { ThemeProvider } from '../../../ThemeProvider';
import { 
    priceFlashAnimations,
    orderLifecycleAnimations,
    depthBarAnimations,
    spreadAnimations,
    animationUtilities,
    orderBookSequences,
    triggerAnimationSequence,
    animationPerformanceMonitor,
    ANIMATION_CONFIG
} from '../../../effects/orderBookAnimations';

// Mock framer-motion for testing
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>
    },
    AnimatePresence: ({ children }) => children
}));

// Mock performance API
Object.defineProperty(window, 'performance', {
    value: {
        now: jest.fn(() => Date.now())
    }
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));

// Test theme
const testTheme = {
    color: {
        trading: {
            bull: '#10b981',
            bear: '#ef4444',
            volume: '#3b82f6',
            spread: '#f59e0b'
        },
        primary: {
            500: '#3b82f6'
        },
        background: {
            primary: '#ffffff',
            secondary: '#f8fafc'
        },
        text: {
            primary: '#1f2937',
            secondary: '#6b7280'
        }
    },
    spacing: {
        2: '0.5rem',
        4: '1rem'
    },
    typography: {
        fontFamily: {
            monospace: 'Monaco, monospace'
        },
        fontSize: {
            sm: '0.875rem'
        },
        fontWeight: {
            medium: 500
        }
    },
    borderRadius: {
        sm: '0.25rem'
    }
};

// Test wrapper component
const TestWrapper = ({ children }) => (
    <ThemeProvider theme={testTheme}>
        {children}
    </ThemeProvider>
);

// Mock order data
const mockOrder = {
    price: 50000,
    size: 1.5,
    timestamp: Date.now()
};

const mockOrderBookData = {
    asks: [
        { price: 50100, size: 1.2, timestamp: Date.now() },
        { price: 50200, size: 0.8, timestamp: Date.now() }
    ],
    bids: [
        { price: 49900, size: 1.5, timestamp: Date.now() },
        { price: 49800, size: 2.1, timestamp: Date.now() }
    ]
};

describe('OrderBookAnimations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    describe('ANIMATION_CONFIG', () => {
        it('should have correct performance settings', () => {
            expect(ANIMATION_CONFIG.performance).toEqual({
                useGPUAcceleration: true,
                willChange: 'transform, opacity, background-color',
                backfaceVisibility: 'hidden',
                perspective: 1000
            });
        });

        it('should have correct timing configurations', () => {
            expect(ANIMATION_CONFIG.timing).toHaveProperty('fast', 0.2);
            expect(ANIMATION_CONFIG.timing).toHaveProperty('normal', 0.4);
            expect(ANIMATION_CONFIG.timing).toHaveProperty('priceFlash', 0.6);
        });

        it('should have correct easing functions', () => {
            expect(ANIMATION_CONFIG.easing.smooth).toEqual([0.25, 0.46, 0.45, 0.94]);
            expect(ANIMATION_CONFIG.easing.trading).toEqual([0.25, 0.1, 0.25, 1]);
        });
    });

    describe('priceFlashAnimations', () => {
        it('should have priceUp animation with correct properties', () => {
            const animation = priceFlashAnimations.priceUp;
            
            expect(animation.animate).toHaveProperty('backgroundColor');
            expect(animation.animate).toHaveProperty('scale');
            expect(animation.animate).toHaveProperty('boxShadow');
            expect(animation.animate).toHaveProperty('borderColor');
            expect(animation.transition.duration).toBe(ANIMATION_CONFIG.timing.priceFlash);
        });

        it('should have priceDown animation with correct properties', () => {
            const animation = priceFlashAnimations.priceDown;
            
            expect(animation.animate).toHaveProperty('backgroundColor');
            expect(animation.animate).toHaveProperty('scale');
            expect(animation.animate).toHaveProperty('boxShadow');
            expect(animation.transition.duration).toBe(ANIMATION_CONFIG.timing.priceFlash);
        });

        it('should have priceSpike animation with enhanced effects', () => {
            const animation = priceFlashAnimations.priceSpike;
            
            expect(animation.animate).toHaveProperty('filter');
            expect(animation.animate).toHaveProperty('boxShadow');
            expect(animation.animate.scale).toHaveLength(5);
            expect(animation.transition.ease).toBe(ANIMATION_CONFIG.easing.bounce);
        });

        it('should have volatilityPulse animation with infinite repeat', () => {
            const animation = priceFlashAnimations.volatilityPulse;
            
            expect(animation.transition.repeat).toBe(Infinity);
            expect(animation.animate).toHaveProperty('backgroundColor');
            expect(animation.animate).toHaveProperty('borderColor');
            expect(animation.animate).toHaveProperty('boxShadow');
        });
    });

    describe('orderLifecycleAnimations', () => {
        it('should have orderEnter animation with 3D effects', () => {
            const animation = orderLifecycleAnimations.orderEnter;
            
            expect(animation.initial).toHaveProperty('rotateY', -15);
            expect(animation.initial).toHaveProperty('filter');
            expect(animation.animate).toHaveProperty('rotateY', 0);
            expect(animation.transition.ease).toBe(ANIMATION_CONFIG.easing.elastic);
        });

        it('should have enhanced sizeChange animation', () => {
            const animation = orderLifecycleAnimations.sizeChange;
            
            expect(animation.animate.scale).toHaveLength(5);
            expect(animation.animate).toHaveProperty('boxShadow');
            expect(animation.transition.ease).toBe(ANIMATION_CONFIG.easing.bounce);
        });

        it('should have orderExit animation with 3D rotation', () => {
            const animation = orderLifecycleAnimations.orderExit;
            
            expect(animation.exit).toHaveProperty('rotateX', -90);
            expect(animation.exit).toHaveProperty('filter');
            expect(animation.transition.ease).toBe(ANIMATION_CONFIG.easing.smooth);
        });

        it('should have orderExecuted animation with celebration effects', () => {
            const animation = orderLifecycleAnimations.orderExecuted;
            
            expect(animation.animate).toHaveProperty('filter');
            expect(animation.animate.scale).toHaveLength(5);
            expect(animation.animate.rotate).toHaveLength(5);
            expect(animation.transition.duration).toBe(1.2);
        });

        it('should have priorityOrder animation for special orders', () => {
            const animation = orderLifecycleAnimations.priorityOrder;
            
            expect(animation.animate).toHaveProperty('boxShadow');
            expect(animation.animate).toHaveProperty('borderColor');
            expect(animation.transition.repeat).toBe(Infinity);
        });
    });

    describe('depthBarAnimations', () => {
        it('should have enhanced depthChange animation', () => {
            const animation = depthBarAnimations.depthChange;
            
            expect(animation.animate.scaleX).toHaveLength(5);
            expect(animation.animate).toHaveProperty('filter');
            expect(animation.animate).toHaveProperty('boxShadow');
            expect(animation.transition.duration).toBe(ANIMATION_CONFIG.timing.depthChange);
        });

        it('should have depthPulse animation with breathing effect', () => {
            const animation = depthBarAnimations.depthPulse;
            
            expect(animation.animate).toHaveProperty('borderRadius');
            expect(animation.animate).toHaveProperty('filter');
            expect(animation.transition.repeat).toBe(2);
        });

        it('should have largeDepthGlow animation with aurora effect', () => {
            const animation = depthBarAnimations.largeDepthGlow;
            
            expect(animation.animate).toHaveProperty('background');
            expect(animation.animate).toHaveProperty('filter');
            expect(animation.transition.repeat).toBe(Infinity);
        });

        it('should have depthLoading animation', () => {
            const animation = depthBarAnimations.depthLoading;
            
            expect(animation.animate).toHaveProperty('background');
            expect(animation.animate).toHaveProperty('backgroundPosition');
            expect(animation.transition.ease).toBe('linear');
            expect(animation.style).toHaveProperty('backgroundSize', '200% 100%');
        });
    });

    describe('animationUtilities', () => {
        it('should create staggered animation correctly', () => {
            const baseAnimation = { animate: { opacity: 1 }, transition: { duration: 0.5 } };
            const staggered = animationUtilities.createStaggeredAnimation(baseAnimation, 5, 0.1);
            
            expect(staggered.transition.staggerChildren).toBe(0.1);
            expect(staggered.transition.delayChildren).toBe(0.05);
        });

        it('should create performance-aware animation', () => {
            const fullAnimation = { animate: { scale: [1, 1.2, 1] }, transition: { duration: 0.8 } };
            const reducedAnimation = { animate: { opacity: 1 }, transition: { duration: 0.1 } };
            
            const result = animationUtilities.createPerformanceAwareAnimation(fullAnimation, reducedAnimation);
            
            // Should return full animation in test environment
            expect(result).toEqual(fullAnimation);
        });

        it('should create size-based animation correctly', () => {
            const animations = {
                small: { animate: { scale: 1.01 } },
                medium: { animate: { scale: 1.05 } },
                large: { animate: { scale: 1.1 } }
            };
            
            const smallOrder = { size: 0.5 };
            const mediumOrder = { size: 5 };
            const largeOrder = { size: 15 };
            
            expect(animationUtilities.createSizeBasedAnimation(smallOrder, animations)).toBe(animations.small);
            expect(animationUtilities.createSizeBasedAnimation(mediumOrder, animations)).toBe(animations.medium);
            expect(animationUtilities.createSizeBasedAnimation(largeOrder, animations)).toBe(animations.large);
        });

        it('should create time-based animation with intensity', () => {
            const baseAnimation = { animate: { opacity: [0, 1, 0] } };
            const timeElapsed = 2500; // 2.5 seconds
            
            const result = animationUtilities.createTimeBasedAnimation(baseAnimation, timeElapsed);
            
            expect(result.animate.opacity).toBeDefined();
            // Intensity should be 0.5 after 2.5 seconds (1 - 2500/5000)
        });
    });

    describe('orderBookSequences', () => {
        it('should have marketOrderExecution sequence with correct stages', () => {
            const sequence = orderBookSequences.marketOrderExecution;
            
            expect(sequence.stages).toHaveLength(5);
            expect(sequence.stages[0].name).toBe('orderReceived');
            expect(sequence.stages[1].name).toBe('priceMatching');
            expect(sequence.stages[2].name).toBe('orderExecuted');
            expect(sequence.stages[3].name).toBe('depthUpdate');
            expect(sequence.stages[4].name).toBe('spreadAdjustment');
        });

        it('should have largeOrderImpact sequence with priority levels', () => {
            const sequence = orderBookSequences.largeOrderImpact;
            
            expect(sequence.stages.every(stage => stage.priority)).toBe(true);
            expect(sequence.stages[0].priority).toBe('high');
            expect(sequence.stages[3].priority).toBe('low');
        });

        it('should have highFrequencyTrading sequence with rapid updates', () => {
            const sequence = orderBookSequences.highFrequencyTrading;
            
            const rapidUpdates = sequence.stages.find(stage => stage.name === 'rapidUpdates');
            expect(rapidUpdates.repeat).toBe(10);
            expect(rapidUpdates.duration).toBe(0.2);
        });
    });

    describe('triggerAnimationSequence', () => {
        it('should execute sequence stages in order', async () => {
            const mockOnStageComplete = jest.fn();
            const mockOnSequenceComplete = jest.fn();
            
            const testSequence = {
                name: 'test',
                stages: [
                    { name: 'stage1', animation: {}, duration: 0.1, priority: 'high' },
                    { name: 'stage2', animation: {}, duration: 0.1, priority: 'medium' }
                ]
            };
            
            const controller = triggerAnimationSequence(testSequence, {
                onStageComplete: mockOnStageComplete,
                onSequenceComplete: mockOnSequenceComplete
            });
            
            expect(controller).toHaveProperty('stop');
            expect(controller).toHaveProperty('getActiveAnimations');
            expect(controller).toHaveProperty('isActive');
            
            // Fast-forward timers
            act(() => {
                jest.advanceTimersByTime(300);
            });
            
            await waitFor(() => {
                expect(mockOnStageComplete).toHaveBeenCalled();
            });
        });

        it('should filter stages by priority', () => {
            const mockOnStageComplete = jest.fn();
            
            const testSequence = {
                stages: [
                    { name: 'high', animation: {}, duration: 0.1, priority: 'high' },
                    { name: 'low', animation: {}, duration: 0.1, priority: 'low' }
                ]
            };
            
            triggerAnimationSequence(testSequence, {
                onStageComplete: mockOnStageComplete,
                priorityFilter: 'high'
            });
            
            act(() => {
                jest.advanceTimersByTime(200);
            });
            
            // Should only execute high priority stage
            expect(mockOnStageComplete).toHaveBeenCalledTimes(1);
        });

        it('should handle stagger delays correctly', () => {
            const mockOnStageComplete = jest.fn();
            
            const testSequence = {
                stages: [
                    { name: 'staggered', animation: {}, duration: 0.1, stagger: 0.05 }
                ]
            };
            
            triggerAnimationSequence(testSequence, {
                onStageComplete: mockOnStageComplete
            });
            
            act(() => {
                jest.advanceTimersByTime(100);
            });
            
            expect(mockOnStageComplete).toHaveBeenCalled();
        });
    });

    describe('animationPerformanceMonitor', () => {
        it('should initialize with correct default metrics', () => {
            expect(animationPerformanceMonitor.metrics.frameRate).toBe(60);
            expect(animationPerformanceMonitor.metrics.animationCount).toBe(0);
            expect(animationPerformanceMonitor.metrics.droppedFrames).toBe(0);
        });

        it('should determine performance level correctly', () => {
            // High performance
            animationPerformanceMonitor.metrics.frameRate = 55;
            expect(animationPerformanceMonitor.getPerformanceLevel()).toBe('high');
            
            // Medium performance
            animationPerformanceMonitor.metrics.frameRate = 40;
            expect(animationPerformanceMonitor.getPerformanceLevel()).toBe('medium');
            
            // Low performance
            animationPerformanceMonitor.metrics.frameRate = 25;
            expect(animationPerformanceMonitor.getPerformanceLevel()).toBe('low');
        });

        it('should recommend reducing animations when performance is poor', () => {
            animationPerformanceMonitor.metrics.frameRate = 25;
            animationPerformanceMonitor.metrics.droppedFrames = 15;
            
            expect(animationPerformanceMonitor.shouldReduceAnimations()).toBe(true);
        });

        it('should start monitoring correctly', () => {
            const spy = jest.spyOn(global, 'requestAnimationFrame');
            
            animationPerformanceMonitor.startMonitoring();
            
            expect(spy).toHaveBeenCalled();
            
            spy.mockRestore();
        });
    });

    describe('Integration Tests', () => {
        it('should work with React components', () => {
            const TestComponent = () => {
                const [isAnimating, setIsAnimating] = React.useState(false);
                
                const handleAnimate = () => {
                    setIsAnimating(true);
                    setTimeout(() => setIsAnimating(false), 1000);
                };
                
                return (
                    <TestWrapper>
                        <motion.div
                            data-testid="animated-element"
                            {...(isAnimating ? priceFlashAnimations.priceUp : {})}
                        >
                            Test Element
                        </motion.div>
                        <button onClick={handleAnimate} data-testid="animate-button">
                            Animate
                        </button>
                    </TestWrapper>
                );
            };
            
            render(<TestComponent />);
            
            const element = screen.getByTestId('animated-element');
            const button = screen.getByTestId('animate-button');
            
            expect(element).toBeInTheDocument();
            
            fireEvent.click(button);
            
            // Animation should be applied
            expect(element).toBeInTheDocument();
        });

        it('should handle multiple simultaneous animations', () => {
            const mockCallback = jest.fn();
            
            const sequence1 = orderBookSequences.marketOrderExecution;
            const sequence2 = orderBookSequences.largeOrderImpact;
            
            const controller1 = triggerAnimationSequence(sequence1, {
                onStageComplete: mockCallback
            });
            
            const controller2 = triggerAnimationSequence(sequence2, {
                onStageComplete: mockCallback
            });
            
            expect(controller1.isActive()).toBe(true);
            expect(controller2.isActive()).toBe(true);
            
            act(() => {
                jest.advanceTimersByTime(500);
            });
            
            expect(mockCallback).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should handle missing animation properties gracefully', () => {
            const incompleteAnimation = {
                animate: { opacity: 1 }
                // Missing transition
            };
            
            expect(() => {
                animationUtilities.createStaggeredAnimation(incompleteAnimation, 3);
            }).not.toThrow();
        });

        it('should handle invalid sequence data', () => {
            const invalidSequence = {
                stages: null
            };
            
            expect(() => {
                triggerAnimationSequence(invalidSequence, {});
            }).not.toThrow();
        });

        it('should handle missing order data in size-based animations', () => {
            const animations = {
                small: { animate: { scale: 1.01 } },
                medium: { animate: { scale: 1.05 } },
                large: { animate: { scale: 1.1 } }
            };
            
            const result = animationUtilities.createSizeBasedAnimation(null, animations);
            expect(result).toBe(animations.small);
        });
    });
});