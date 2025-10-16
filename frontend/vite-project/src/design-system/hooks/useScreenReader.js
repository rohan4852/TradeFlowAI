import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Hook for managing screen reader announcements and live regions
 */
export const useScreenReader = () => {
    const liveRegionRef = useRef(null);
    const politeRegionRef = useRef(null);
    const assertiveRegionRef = useRef(null);

    // Create live regions on mount
    useEffect(() => {
        // Create polite live region
        if (!politeRegionRef.current) {
            const politeRegion = document.createElement('div');
            politeRegion.setAttribute('aria-live', 'polite');
            politeRegion.setAttribute('aria-atomic', 'true');
            politeRegion.setAttribute('aria-relevant', 'additions text');
            politeRegion.style.position = 'absolute';
            politeRegion.style.left = '-10000px';
            politeRegion.style.width = '1px';
            politeRegion.style.height = '1px';
            politeRegion.style.overflow = 'hidden';
            document.body.appendChild(politeRegion);
            politeRegionRef.current = politeRegion;
        }

        // Create assertive live region
        if (!assertiveRegionRef.current) {
            const assertiveRegion = document.createElement('div');
            assertiveRegion.setAttribute('aria-live', 'assertive');
            assertiveRegion.setAttribute('aria-atomic', 'true');
            assertiveRegion.setAttribute('aria-relevant', 'additions text');
            assertiveRegion.style.position = 'absolute';
            assertiveRegion.style.left = '-10000px';
            assertiveRegion.style.width = '1px';
            assertiveRegion.style.height = '1px';
            assertiveRegion.style.overflow = 'hidden';
            document.body.appendChild(assertiveRegion);
            assertiveRegionRef.current = assertiveRegion;
        }

        return () => {
            // Cleanup live regions
            if (politeRegionRef.current) {
                document.body.removeChild(politeRegionRef.current);
                politeRegionRef.current = null;
            }
            if (assertiveRegionRef.current) {
                document.body.removeChild(assertiveRegionRef.current);
                assertiveRegionRef.current = null;
            }
        };
    }, []);

    // Announce message to screen readers
    const announce = useCallback((message, priority = 'polite', delay = 100) => {
        if (!message) return;

        const region = priority === 'assertive' ? assertiveRegionRef.current : politeRegionRef.current;
        if (!region) return;

        // Clear previous message
        region.textContent = '';

        // Set new message after a brief delay to ensure it's announced
        setTimeout(() => {
            region.textContent = message;
        }, delay);

        // Clear message after announcement to avoid repetition
        setTimeout(() => {
            region.textContent = '';
        }, delay + 1000);
    }, []);

    // Announce polite message (doesn't interrupt current speech)
    const announcePolite = useCallback((message, delay = 100) => {
        announce(message, 'polite', delay);
    }, [announce]);

    // Announce assertive message (interrupts current speech)
    const announceAssertive = useCallback((message, delay = 100) => {
        announce(message, 'assertive', delay);
    }, [announce]);

    return {
        announce,
        announcePolite,
        announceAssertive
    };
};

/**
 * Hook for managing ARIA attributes and descriptions
 */
export const useAriaAttributes = ({
    label,
    description,
    required = false,
    invalid = false,
    expanded = null,
    selected = null,
    pressed = null,
    checked = null,
    disabled = false,
    readonly = false,
    hidden = false
} = {}) => {
    const elementRef = useRef(null);
    const labelId = `aria-label-${Math.random().toString(36).substr(2, 9)}`;
    const descriptionId = `aria-desc-${Math.random().toString(36).substr(2, 9)}`;

    // Generate ARIA attributes object
    const ariaAttributes = {
        'aria-label': label,
        'aria-labelledby': undefined,
        'aria-describedby': description ? descriptionId : undefined,
        'aria-required': required || undefined,
        'aria-invalid': invalid || undefined,
        'aria-expanded': expanded,
        'aria-selected': selected,
        'aria-pressed': pressed,
        'aria-checked': checked,
        'aria-disabled': disabled || undefined,
        'aria-readonly': readonly || undefined,
        'aria-hidden': hidden || undefined
    };

    // Filter out undefined values
    const cleanAriaAttributes = Object.fromEntries(
        Object.entries(ariaAttributes).filter(([_, value]) => value !== undefined)
    );

    return {
        elementRef,
        labelId,
        descriptionId,
        ariaAttributes: cleanAriaAttributes
    };
};

/**
 * Hook for managing dynamic content announcements
 * Useful for live data updates like price changes, order updates, etc.
 */
export const useLiveRegion = ({
    politeness = 'polite',
    atomic = true,
    relevant = 'additions text',
    busy = false
} = {}) => {
    const regionRef = useRef(null);
    const [content, setContent] = useState('');
    const { announce } = useScreenReader();

    // Update live region content
    const updateContent = useCallback((newContent, priority = politeness) => {
        setContent(newContent);
        announce(newContent, priority);
    }, [announce, politeness]);

    // Set up live region attributes
    useEffect(() => {
        const region = regionRef.current;
        if (!region) return;

        region.setAttribute('aria-live', politeness);
        region.setAttribute('aria-atomic', atomic.toString());
        region.setAttribute('aria-relevant', relevant);
        region.setAttribute('aria-busy', busy.toString());
    }, [politeness, atomic, relevant, busy]);

    return {
        regionRef,
        content,
        updateContent,
        setContent: updateContent
    };
};

/**
 * Hook for managing trading-specific screen reader announcements
 */
export const useTradingAnnouncements = () => {
    const { announce, announcePolite, announceAssertive } = useScreenReader();
    const lastAnnouncementRef = useRef('');
    const announcementThrottleRef = useRef(null);

    // Announce price changes
    const announcePriceChange = useCallback((symbol, price, change, changePercent) => {
        const direction = change >= 0 ? 'increased' : 'decreased';
        const message = `${symbol} price ${direction} to ${price}, ${Math.abs(changePercent)}% change`;

        // Throttle price announcements to avoid spam
        if (announcementThrottleRef.current) {
            clearTimeout(announcementThrottleRef.current);
        }

        announcementThrottleRef.current = setTimeout(() => {
            if (message !== lastAnnouncementRef.current) {
                announcePolite(message);
                lastAnnouncementRef.current = message;
            }
        }, 1000);
    }, [announcePolite]);

    // Announce order book updates
    const announceOrderUpdate = useCallback((type, price, size, side) => {
        const message = `${type} order: ${size} at ${price} on ${side} side`;
        announcePolite(message);
    }, [announcePolite]);

    // Announce trade execution
    const announceTradeExecution = useCallback((symbol, side, quantity, price) => {
        const message = `Trade executed: ${side} ${quantity} ${symbol} at ${price}`;
        announceAssertive(message);
    }, [announceAssertive]);

    // Announce connection status
    const announceConnectionStatus = useCallback((status) => {
        const message = status === 'connected'
            ? 'Market data connection established'
            : 'Market data connection lost';
        announceAssertive(message);
    }, [announceAssertive]);

    // Announce alert or notification
    const announceAlert = useCallback((message, priority = 'assertive') => {
        announce(`Alert: ${message}`, priority);
    }, [announce]);

    // Announce AI prediction
    const announceAIPrediction = useCallback((symbol, prediction, confidence) => {
        const message = `AI prediction for ${symbol}: ${prediction} with ${confidence}% confidence`;
        announcePolite(message);
    }, [announcePolite]);

    return {
        announcePriceChange,
        announceOrderUpdate,
        announceTradeExecution,
        announceConnectionStatus,
        announceAlert,
        announceAIPrediction
    };
};

/**
 * Hook for detecting screen reader usage
 */
export const useScreenReaderDetection = () => {
    const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);

    useEffect(() => {
        // Check for common screen reader indicators
        const checkScreenReader = () => {
            // Check for NVDA, JAWS, or other screen readers
            const hasScreenReader =
                window.navigator.userAgent.includes('NVDA') ||
                window.navigator.userAgent.includes('JAWS') ||
                window.speechSynthesis?.getVoices().length > 0 ||
                'speechSynthesis' in window;

            // Check for reduced motion preference (often used by screen reader users)
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            // Check for high contrast mode
            const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

            setIsScreenReaderActive(hasScreenReader || prefersReducedMotion || prefersHighContrast);
        };

        checkScreenReader();

        // Listen for changes in media queries
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

        reducedMotionQuery.addEventListener('change', checkScreenReader);
        highContrastQuery.addEventListener('change', checkScreenReader);

        return () => {
            reducedMotionQuery.removeEventListener('change', checkScreenReader);
            highContrastQuery.removeEventListener('change', checkScreenReader);
        };
    }, []);

    return isScreenReaderActive;
};

export default useScreenReader;