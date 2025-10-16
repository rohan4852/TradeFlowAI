/**
 * Accessibility utility functions for the design system
 */

/**
 * Generate a unique ID for accessibility attributes
 */
export const generateId = (prefix = 'id') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if an element is focusable
 */
export const isFocusable = (element) => {
    if (!element || element.disabled || element.hidden) return false;

    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') return false;

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
    ];

    return focusableSelectors.some(selector => element.matches(selector));
};

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container) => {
    if (!container) return [];

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

    return Array.from(container.querySelectorAll(focusableSelectors))
        .filter(element => {
            const style = window.getComputedStyle(element);
            return (
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                !element.hasAttribute('aria-hidden') &&
                element.offsetParent !== null
            );
        });
};

/**
 * Calculate color contrast ratio between two colors
 */
export const getContrastRatio = (color1, color2) => {
    const getLuminance = (color) => {
        // Convert hex to RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;

        // Calculate relative luminance
        const sRGB = [r, g, b].map(c => {
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Check if color combination meets WCAG contrast requirements
 */
export const meetsContrastRequirement = (foreground, background, level = 'AA', size = 'normal') => {
    const ratio = getContrastRatio(foreground, background);

    if (level === 'AAA') {
        return size === 'large' ? ratio >= 4.5 : ratio >= 7;
    } else {
        return size === 'large' ? ratio >= 3 : ratio >= 4.5;
    }
};

/**
 * Generate accessible color palette with proper contrast ratios
 */
export const generateAccessiblePalette = (baseColor, backgroundColor = '#ffffff') => {
    const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    const palette = {};

    shades.forEach(shade => {
        // This is a simplified version - in practice, you'd use a proper color manipulation library
        const factor = shade / 500;
        const adjustedColor = adjustColorBrightness(baseColor, factor);

        palette[shade] = {
            color: adjustedColor,
            contrastRatio: getContrastRatio(adjustedColor, backgroundColor),
            accessible: meetsContrastRequirement(adjustedColor, backgroundColor)
        };
    });

    return palette;
};

/**
 * Adjust color brightness (simplified implementation)
 */
const adjustColorBrightness = (color, factor) => {
    const hex = color.replace('#', '');
    const r = Math.min(255, Math.max(0, parseInt(hex.substr(0, 2), 16) * factor));
    const g = Math.min(255, Math.max(0, parseInt(hex.substr(2, 2), 16) * factor));
    const b = Math.min(255, Math.max(0, parseInt(hex.substr(4, 2), 16) * factor));

    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
};

/**
 * Create screen reader only text
 */
export const createScreenReaderText = (text) => ({
    position: 'absolute',
    left: '-10000px',
    top: 'auto',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    fontSize: '1px',
    content: text
});

/**
 * ARIA attribute helpers
 */
export const ariaHelpers = {
    // Generate describedby attribute from multiple IDs
    describedBy: (...ids) => ids.filter(Boolean).join(' ') || undefined,

    // Generate labelledby attribute from multiple IDs
    labelledBy: (...ids) => ids.filter(Boolean).join(' ') || undefined,

    // Create expanded state for collapsible elements
    expanded: (isExpanded) => isExpanded ? 'true' : 'false',

    // Create selected state for selectable elements
    selected: (isSelected) => isSelected ? 'true' : 'false',

    // Create pressed state for toggle buttons
    pressed: (isPressed) => isPressed ? 'true' : 'false',

    // Create checked state for checkboxes/radios
    checked: (isChecked) => isChecked ? 'true' : 'false',

    // Create disabled state
    disabled: (isDisabled) => isDisabled ? 'true' : undefined,

    // Create hidden state
    hidden: (isHidden) => isHidden ? 'true' : undefined,

    // Create invalid state
    invalid: (isInvalid) => isInvalid ? 'true' : 'false',

    // Create required state
    required: (isRequired) => isRequired ? 'true' : undefined,

    // Create readonly state
    readonly: (isReadonly) => isReadonly ? 'true' : undefined,

    // Create busy state for loading elements
    busy: (isBusy) => isBusy ? 'true' : 'false'
};

/**
 * Keyboard event helpers
 */
export const keyboardHelpers = {
    // Check if key is an arrow key
    isArrowKey: (key) => ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key),

    // Check if key is a navigation key
    isNavigationKey: (key) => [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Home', 'End', 'PageUp', 'PageDown', 'Tab'
    ].includes(key),

    // Check if key is an action key
    isActionKey: (key) => ['Enter', ' ', 'Escape'].includes(key),

    // Create key combination string
    getKeyCombo: (event) => {
        const { key, ctrlKey, altKey, metaKey, shiftKey } = event;
        return [
            ctrlKey && 'ctrl',
            altKey && 'alt',
            metaKey && 'meta',
            shiftKey && 'shift',
            key.toLowerCase()
        ].filter(Boolean).join('+');
    }
};

/**
 * Focus management helpers
 */
export const focusHelpers = {
    // Trap focus within an element
    trapFocus: (container, event) => {
        const focusableElements = getFocusableElements(container);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.key === 'Tab') {
            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        }
    },

    // Move focus to next/previous element
    moveFocus: (container, direction = 'next') => {
        const focusableElements = getFocusableElements(container);
        const currentIndex = focusableElements.indexOf(document.activeElement);

        let nextIndex;
        if (direction === 'next') {
            nextIndex = currentIndex + 1;
            if (nextIndex >= focusableElements.length) nextIndex = 0;
        } else {
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) nextIndex = focusableElements.length - 1;
        }

        focusableElements[nextIndex]?.focus();
    },

    // Focus first element in container
    focusFirst: (container) => {
        const focusableElements = getFocusableElements(container);
        focusableElements[0]?.focus();
    },

    // Focus last element in container
    focusLast: (container) => {
        const focusableElements = getFocusableElements(container);
        const lastElement = focusableElements[focusableElements.length - 1];
        lastElement?.focus();
    }
};

/**
 * Live region helpers for dynamic content announcements
 */
export const liveRegionHelpers = {
    // Create a live region element
    createLiveRegion: (politeness = 'polite', atomic = true) => {
        const region = document.createElement('div');
        region.setAttribute('aria-live', politeness);
        region.setAttribute('aria-atomic', atomic.toString());
        region.setAttribute('aria-relevant', 'additions text');
        region.style.position = 'absolute';
        region.style.left = '-10000px';
        region.style.width = '1px';
        region.style.height = '1px';
        region.style.overflow = 'hidden';
        return region;
    },

    // Announce message via live region
    announce: (message, politeness = 'polite') => {
        const region = liveRegionHelpers.createLiveRegion(politeness);
        document.body.appendChild(region);

        setTimeout(() => {
            region.textContent = message;
        }, 100);

        setTimeout(() => {
            document.body.removeChild(region);
        }, 1000);
    }
};

/**
 * Trading-specific accessibility helpers
 */
export const tradingA11yHelpers = {
    // Format price for screen readers
    formatPriceForScreenReader: (price, currency = 'USD') => {
        return `${price} ${currency}`;
    },

    // Format percentage change for screen readers
    formatChangeForScreenReader: (change, isPercentage = true) => {
        const direction = change >= 0 ? 'up' : 'down';
        const value = Math.abs(change);
        const unit = isPercentage ? 'percent' : '';
        return `${direction} ${value} ${unit}`;
    },

    // Create order book row description
    formatOrderBookRow: (price, size, total, side) => {
        return `${side} order: ${size} at ${price}, total ${total}`;
    },

    // Create chart data point description
    formatChartDataPoint: (timestamp, open, high, low, close, volume) => {
        return `${timestamp}: opened at ${open}, high ${high}, low ${low}, closed at ${close}, volume ${volume}`;
    },

    // Create AI prediction description
    formatAIPrediction: (symbol, prediction, confidence, timeframe) => {
        return `AI prediction for ${symbol}: ${prediction} with ${confidence}% confidence over ${timeframe}`;
    }
};

export default {
    generateId,
    isFocusable,
    getFocusableElements,
    getContrastRatio,
    meetsContrastRequirement,
    generateAccessiblePalette,
    createScreenReaderText,
    ariaHelpers,
    keyboardHelpers,
    focusHelpers,
    liveRegionHelpers,
    tradingA11yHelpers
};