import React, { forwardRef } from 'react';
import { useTouchGestures } from '../../hooks/useTouchGestures';

/**
 * TouchGestures component provides gesture handling capabilities to its children
 * Supports swipe, pinch, tap, and double-tap gestures
 */
export const TouchGestures = forwardRef(({
    children,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onTap,
    onDoubleTap,
    swipeThreshold = 50,
    pinchThreshold = 0.1,
    tapTimeout = 300,
    disabled = false,
    className,
    style,
    ...props
}, ref) => {
    const { gestureState, touchHandlers } = useTouchGestures({
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown,
        onPinch,
        onTap,
        onDoubleTap,
        swipeThreshold,
        pinchThreshold,
        tapTimeout
    });

    if (disabled) {
        return (
            <div ref={ref} className={className} style={style} {...props}>
                {children}
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className={className}
            style={{
                touchAction: 'none', // Prevent default touch behaviors
                userSelect: 'none',   // Prevent text selection during gestures
                ...style
            }}
            {...touchHandlers}
            {...props}
        >
            {typeof children === 'function' ? children(gestureState) : children}
        </div>
    );
});

TouchGestures.displayName = 'TouchGestures';