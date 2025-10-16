import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook for managing keyboard navigation within components
 * Provides utilities for handling arrow keys, tab navigation, and custom shortcuts
 */
export const useKeyboardNavigation = ({
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onEnter,
    onEscape,
    onTab,
    onShiftTab,
    customKeys = {},
    enabled = true,
    trapFocus = false,
    autoFocus = false
} = {}) => {
    const containerRef = useRef(null);
    const focusableElementsRef = useRef([]);

    // Get all focusable elements within container
    const getFocusableElements = useCallback(() => {
        if (!containerRef.current) return [];

        const focusableSelectors = [
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
        ].join(', ');

        return Array.from(containerRef.current.querySelectorAll(focusableSelectors))
            .filter(el => {
                // Additional checks for visibility and interactivity
                const style = window.getComputedStyle(el);
                return style.display !== 'none' &&
                    style.visibility !== 'hidden' &&
                    !el.hasAttribute('aria-hidden');
            });
    }, []);

    // Update focusable elements list
    const updateFocusableElements = useCallback(() => {
        focusableElementsRef.current = getFocusableElements();
    }, [getFocusableElements]);

    // Get current focused element index
    const getCurrentFocusIndex = useCallback(() => {
        const activeElement = document.activeElement;
        return focusableElementsRef.current.indexOf(activeElement);
    }, []);

    // Focus element by index
    const focusElementByIndex = useCallback((index) => {
        const elements = focusableElementsRef.current;
        if (elements.length === 0) return;

        let targetIndex = index;
        if (trapFocus) {
            // Wrap around if trapping focus
            if (targetIndex < 0) targetIndex = elements.length - 1;
            if (targetIndex >= elements.length) targetIndex = 0;
        } else {
            // Clamp to bounds if not trapping
            targetIndex = Math.max(0, Math.min(elements.length - 1, targetIndex));
        }

        const targetElement = elements[targetIndex];
        if (targetElement) {
            targetElement.focus();
            return true;
        }
        return false;
    }, [trapFocus]);

    // Focus first element
    const focusFirst = useCallback(() => {
        return focusElementByIndex(0);
    }, [focusElementByIndex]);

    // Focus last element
    const focusLast = useCallback(() => {
        return focusElementByIndex(focusableElementsRef.current.length - 1);
    }, [focusElementByIndex]);

    // Focus next element
    const focusNext = useCallback(() => {
        const currentIndex = getCurrentFocusIndex();
        return focusElementByIndex(currentIndex + 1);
    }, [getCurrentFocusIndex, focusElementByIndex]);

    // Focus previous element
    const focusPrevious = useCallback(() => {
        const currentIndex = getCurrentFocusIndex();
        return focusElementByIndex(currentIndex - 1);
    }, [getCurrentFocusIndex, focusElementByIndex]);

    // Handle keyboard events
    const handleKeyDown = useCallback((event) => {
        if (!enabled) return;

        const { key, shiftKey, ctrlKey, altKey, metaKey } = event;

        // Create key combination string for custom keys
        const keyCombo = [
            ctrlKey && 'ctrl',
            altKey && 'alt',
            metaKey && 'meta',
            shiftKey && 'shift',
            key.toLowerCase()
        ].filter(Boolean).join('+');

        // Handle custom key combinations first
        if (customKeys[keyCombo]) {
            event.preventDefault();
            customKeys[keyCombo](event);
            return;
        }

        // Handle standard navigation keys
        switch (key) {
            case 'ArrowUp':
                if (onArrowUp) {
                    event.preventDefault();
                    onArrowUp(event);
                }
                break;

            case 'ArrowDown':
                if (onArrowDown) {
                    event.preventDefault();
                    onArrowDown(event);
                }
                break;

            case 'ArrowLeft':
                if (onArrowLeft) {
                    event.preventDefault();
                    onArrowLeft(event);
                }
                break;

            case 'ArrowRight':
                if (onArrowRight) {
                    event.preventDefault();
                    onArrowRight(event);
                }
                break;

            case 'Enter':
                if (onEnter) {
                    event.preventDefault();
                    onEnter(event);
                }
                break;

            case 'Escape':
                if (onEscape) {
                    event.preventDefault();
                    onEscape(event);
                }
                break;

            case 'Tab':
                if (trapFocus) {
                    event.preventDefault();
                    if (shiftKey) {
                        focusPrevious();
                    } else {
                        focusNext();
                    }
                } else if (onTab || onShiftTab) {
                    if (shiftKey && onShiftTab) {
                        onShiftTab(event);
                    } else if (!shiftKey && onTab) {
                        onTab(event);
                    }
                }
                break;

            case 'Home':
                if (ctrlKey || altKey) {
                    event.preventDefault();
                    focusFirst();
                }
                break;

            case 'End':
                if (ctrlKey || altKey) {
                    event.preventDefault();
                    focusLast();
                }
                break;
        }
    }, [
        enabled, onArrowUp, onArrowDown, onArrowLeft, onArrowRight,
        onEnter, onEscape, onTab, onShiftTab, customKeys, trapFocus,
        focusNext, focusPrevious, focusFirst, focusLast
    ]);

    // Set up event listeners
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !enabled) return;

        updateFocusableElements();
        container.addEventListener('keydown', handleKeyDown);

        // Auto focus first element if requested
        if (autoFocus) {
            setTimeout(() => focusFirst(), 0);
        }

        // Update focusable elements when DOM changes
        const observer = new MutationObserver(updateFocusableElements);
        observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['disabled', 'tabindex', 'aria-hidden']
        });

        return () => {
            container.removeEventListener('keydown', handleKeyDown);
            observer.disconnect();
        };
    }, [enabled, handleKeyDown, updateFocusableElements, autoFocus, focusFirst]);

    return {
        containerRef,
        focusFirst,
        focusLast,
        focusNext,
        focusPrevious,
        focusElementByIndex,
        getCurrentFocusIndex,
        updateFocusableElements,
        focusableElements: focusableElementsRef.current
    };
};

/**
 * Hook for managing roving tabindex pattern
 * Useful for components like toolbars, menus, and grids
 */
export const useRovingTabIndex = ({
    enabled = true,
    orientation = 'horizontal', // 'horizontal', 'vertical', or 'both'
    wrap = true,
    autoFocus = false
} = {}) => {
    const containerRef = useRef(null);
    const activeIndexRef = useRef(0);

    const updateTabIndexes = useCallback((activeIndex) => {
        const container = containerRef.current;
        if (!container) return;

        const items = Array.from(container.children).filter(child =>
            !child.hasAttribute('disabled') &&
            !child.hasAttribute('aria-hidden')
        );

        items.forEach((item, index) => {
            if (index === activeIndex) {
                item.setAttribute('tabindex', '0');
                item.setAttribute('aria-selected', 'true');
            } else {
                item.setAttribute('tabindex', '-1');
                item.setAttribute('aria-selected', 'false');
            }
        });

        activeIndexRef.current = activeIndex;
    }, []);

    const moveToIndex = useCallback((index) => {
        const container = containerRef.current;
        if (!container) return;

        const items = Array.from(container.children).filter(child =>
            !child.hasAttribute('disabled') &&
            !child.hasAttribute('aria-hidden')
        );

        if (items.length === 0) return;

        let targetIndex = index;
        if (wrap) {
            if (targetIndex < 0) targetIndex = items.length - 1;
            if (targetIndex >= items.length) targetIndex = 0;
        } else {
            targetIndex = Math.max(0, Math.min(items.length - 1, targetIndex));
        }

        updateTabIndexes(targetIndex);
        items[targetIndex]?.focus();
    }, [wrap, updateTabIndexes]);

    const keyboardNavigation = useKeyboardNavigation({
        onArrowLeft: orientation === 'horizontal' || orientation === 'both'
            ? () => moveToIndex(activeIndexRef.current - 1)
            : undefined,
        onArrowRight: orientation === 'horizontal' || orientation === 'both'
            ? () => moveToIndex(activeIndexRef.current + 1)
            : undefined,
        onArrowUp: orientation === 'vertical' || orientation === 'both'
            ? () => moveToIndex(activeIndexRef.current - 1)
            : undefined,
        onArrowDown: orientation === 'vertical' || orientation === 'both'
            ? () => moveToIndex(activeIndexRef.current + 1)
            : undefined,
        onHome: () => moveToIndex(0),
        onEnd: () => {
            const container = containerRef.current;
            if (!container) return;
            const items = Array.from(container.children).filter(child =>
                !child.hasAttribute('disabled') &&
                !child.hasAttribute('aria-hidden')
            );
            moveToIndex(items.length - 1);
        },
        enabled,
        autoFocus
    });

    // Initialize roving tabindex
    useEffect(() => {
        if (!enabled) return;
        updateTabIndexes(0);
    }, [enabled, updateTabIndexes]);

    return {
        containerRef: keyboardNavigation.containerRef,
        moveToIndex,
        activeIndex: activeIndexRef.current,
        updateTabIndexes
    };
};

export default useKeyboardNavigation;