import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for managing focus within components and modals
 * Provides focus trapping, restoration, and visible focus indicators
 */
export const useFocusManagement = ({
    trapFocus = false,
    restoreOnUnmount = true,
    autoFocus = false,
    focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
        '[role="button"]:not([disabled])',
        '[role="link"]:not([disabled])',
        '[role="menuitem"]:not([disabled])',
        '[role="tab"]:not([disabled])',
        '[role="option"]:not([disabled])'
    ]
} = {}) => {
    const containerRef = useRef(null);
    const previouslyFocusedElementRef = useRef(null);
    const focusableElementsRef = useRef([]);

    // Store the currently focused element when component mounts
    useEffect(() => {
        previouslyFocusedElementRef.current = document.activeElement;
    }, []);

    // Get all focusable elements within the container
    const getFocusableElements = useCallback(() => {
        if (!containerRef.current) return [];

        const selector = focusableSelectors.join(', ');
        return Array.from(containerRef.current.querySelectorAll(selector))
            .filter(element => {
                const style = window.getComputedStyle(element);
                return (
                    style.display !== 'none' &&
                    style.visibility !== 'hidden' &&
                    !element.hasAttribute('aria-hidden') &&
                    element.offsetParent !== null
                );
            });
    }, [focusableSelectors]);

    // Update focusable elements list
    const updateFocusableElements = useCallback(() => {
        focusableElementsRef.current = getFocusableElements();
    }, [getFocusableElements]);

    // Focus the first focusable element
    const focusFirst = useCallback(() => {
        updateFocusableElements();
        const firstElement = focusableElementsRef.current[0];
        if (firstElement) {
            firstElement.focus();
            return true;
        }
        return false;
    }, [updateFocusableElements]);

    // Focus the last focusable element
    const focusLast = useCallback(() => {
        updateFocusableElements();
        const elements = focusableElementsRef.current;
        const lastElement = elements[elements.length - 1];
        if (lastElement) {
            lastElement.focus();
            return true;
        }
        return false;
    }, [updateFocusableElements]);

    // Restore focus to previously focused element
    const restoreFocus = useCallback(() => {
        const elementToFocus = previouslyFocusedElementRef.current;
        if (elementToFocus && typeof elementToFocus.focus === 'function') {
            try {
                elementToFocus.focus();
                return true;
            } catch (error) {
                console.warn('Failed to restore focus:', error);
            }
        }
        return false;
    }, []);

    // Handle focus trap
    const handleFocusTrap = useCallback((event) => {
        if (!trapFocus || !containerRef.current) return;

        updateFocusableElements();
        const elements = focusableElementsRef.current;

        if (elements.length === 0) {
            event.preventDefault();
            return;
        }

        const firstElement = elements[0];
        const lastElement = elements[elements.length - 1];
        const isTabPressed = event.key === 'Tab';

        if (!isTabPressed) return;

        if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }, [trapFocus, updateFocusableElements]);

    // Set up focus management
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Auto focus first element if requested
        if (autoFocus) {
            setTimeout(() => focusFirst(), 0);
        }

        // Set up focus trap
        if (trapFocus) {
            document.addEventListener('keydown', handleFocusTrap);
        }

        // Update focusable elements when DOM changes
        const observer = new MutationObserver(updateFocusableElements);
        observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['disabled', 'tabindex', 'aria-hidden', 'hidden']
        });

        return () => {
            if (trapFocus) {
                document.removeEventListener('keydown', handleFocusTrap);
            }
            observer.disconnect();
        };
    }, [trapFocus, autoFocus, handleFocusTrap, focusFirst, updateFocusableElements]);

    // Restore focus on unmount
    useEffect(() => {
        return () => {
            if (restoreOnUnmount) {
                restoreFocus();
            }
        };
    }, [restoreOnUnmount, restoreFocus]);

    return {
        containerRef,
        focusFirst,
        focusLast,
        restoreFocus,
        updateFocusableElements,
        focusableElements: focusableElementsRef.current
    };
};

/**
 * Hook for managing visible focus indicators
 * Tracks whether focus was set via keyboard or mouse
 */
export const useFocusVisible = () => {
    const elementRef = useRef(null);
    const hadKeyboardEventRef = useRef(false);
    const keyboardThrottleTimeoutRef = useRef(null);

    // Track keyboard usage
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.metaKey || event.altKey || event.ctrlKey) return;
            hadKeyboardEventRef.current = true;

            // Clear any existing timeout
            if (keyboardThrottleTimeoutRef.current) {
                clearTimeout(keyboardThrottleTimeoutRef.current);
            }

            // Reset keyboard flag after a delay
            keyboardThrottleTimeoutRef.current = setTimeout(() => {
                hadKeyboardEventRef.current = false;
            }, 100);
        };

        const handlePointerDown = () => {
            hadKeyboardEventRef.current = false;
        };

        document.addEventListener('keydown', handleKeyDown, true);
        document.addEventListener('mousedown', handlePointerDown, true);
        document.addEventListener('pointerdown', handlePointerDown, true);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
            document.removeEventListener('mousedown', handlePointerDown, true);
            document.removeEventListener('pointerdown', handlePointerDown, true);

            if (keyboardThrottleTimeoutRef.current) {
                clearTimeout(keyboardThrottleTimeoutRef.current);
            }
        };
    }, []);

    // Handle focus events on the element
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const handleFocus = () => {
            if (hadKeyboardEventRef.current) {
                element.setAttribute('data-focus-visible', 'true');
            }
        };

        const handleBlur = () => {
            element.removeAttribute('data-focus-visible');
        };

        element.addEventListener('focus', handleFocus);
        element.addEventListener('blur', handleBlur);

        return () => {
            element.removeEventListener('focus', handleFocus);
            element.removeEventListener('blur', handleBlur);
        };
    }, []);

    return {
        elementRef,
        isFocusVisible: hadKeyboardEventRef.current
    };
};

/**
 * Hook for managing focus within a specific region
 * Useful for complex components like data tables or dashboards
 */
export const useFocusRegion = ({
    label,
    description,
    role = 'region',
    live = false,
    atomic = false
} = {}) => {
    const regionRef = useRef(null);
    const labelId = `focus-region-label-${Math.random().toString(36).substr(2, 9)}`;
    const descriptionId = `focus-region-desc-${Math.random().toString(36).substr(2, 9)}`;

    // Set up region attributes
    useEffect(() => {
        const region = regionRef.current;
        if (!region) return;

        // Set basic attributes
        region.setAttribute('role', role);

        if (label) {
            region.setAttribute('aria-labelledby', labelId);
        }

        if (description) {
            region.setAttribute('aria-describedby', descriptionId);
        }

        // Set live region attributes
        if (live) {
            region.setAttribute('aria-live', typeof live === 'string' ? live : 'polite');
            region.setAttribute('aria-atomic', atomic.toString());
        }

        // Make region focusable if it doesn't contain focusable elements
        const focusableElements = region.querySelectorAll(
            'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) {
            region.setAttribute('tabindex', '0');
        }
    }, [role, label, description, live, atomic, labelId, descriptionId]);

    return {
        regionRef,
        labelId,
        descriptionId,
        regionProps: {
            role,
            'aria-labelledby': label ? labelId : undefined,
            'aria-describedby': description ? descriptionId : undefined,
            'aria-live': live ? (typeof live === 'string' ? live : 'polite') : undefined,
            'aria-atomic': live ? atomic : undefined
        }
    };
};

export default useFocusManagement;