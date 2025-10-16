import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

/**
 * Live region wrapper for screen reader announcements
 */
const LiveRegionWrapper = styled.div`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  
  ${props => props.visible && `
    position: static;
    left: auto;
    width: auto;
    height: auto;
    overflow: visible;
  `}
`;

/**
 * LiveRegion component for dynamic content announcements
 * 
 * @param {string} politeness - 'polite' or 'assertive'
 * @param {boolean} atomic - Whether to read entire region or just changes
 * @param {string} relevant - What changes should be announced
 * @param {boolean} busy - Whether the region is currently being updated
 * @param {boolean} visible - Whether the region should be visually visible
 * @param {React.ReactNode} children - Content to announce
 */
const LiveRegion = ({
    children,
    politeness = 'polite',
    atomic = true,
    relevant = 'additions text',
    busy = false,
    visible = false,
    className,
    ...props
}) => {
    const regionRef = useRef(null);

    // Set up ARIA attributes
    useEffect(() => {
        const region = regionRef.current;
        if (!region) return;

        region.setAttribute('aria-live', politeness);
        region.setAttribute('aria-atomic', atomic.toString());
        region.setAttribute('aria-relevant', relevant);
        region.setAttribute('aria-busy', busy.toString());
    }, [politeness, atomic, relevant, busy]);

    return (
        <LiveRegionWrapper
            ref={regionRef}
            visible={visible}
            className={className}
            {...props}
        >
            {children}
        </LiveRegionWrapper>
    );
};

export default LiveRegion;