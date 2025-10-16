import React, { useEffect, useRef } from 'react';
import { useFocusManagement } from '../../hooks/useFocusManagement';

/**
 * FocusTrap component that traps focus within its children
 * Useful for modals, dropdowns, and other overlay components
 */
const FocusTrap = ({
    children,
    active = true,
    autoFocus = true,
    restoreOnUnmount = true,
    className,
    ...props
}) => {
    const {
        containerRef,
        focusFirst,
        restoreFocus
    } = useFocusManagement({
        trapFocus: active,
        autoFocus,
        restoreOnUnmount
    });

    // Focus first element when trap becomes active
    useEffect(() => {
        if (active && autoFocus) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                focusFirst();
            }, 0);
        }
    }, [active, autoFocus, focusFirst]);

    // Restore focus when trap becomes inactive
    useEffect(() => {
        if (!active && restoreOnUnmount) {
            restoreFocus();
        }
    }, [active, restoreOnUnmount, restoreFocus]);

    return (
        <div
            ref={containerRef}
            className={className}
            {...props}
        >
            {children}
        </div>
    );
};

export default FocusTrap;