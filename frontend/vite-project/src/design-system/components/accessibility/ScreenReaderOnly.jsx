import React from 'react';
import styled from 'styled-components';

/**
 * Component for content that should only be visible to screen readers
 * Follows the "visually hidden" pattern for accessibility
 */
const ScreenReaderOnlyWrapper = styled.span`
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
`;

/**
 * ScreenReaderOnly component
 * Use this to provide additional context or information that should only be available to screen readers
 */
const ScreenReaderOnly = ({ children, as = 'span', ...props }) => {
    return (
        <ScreenReaderOnlyWrapper as={as} {...props}>
            {children}
        </ScreenReaderOnlyWrapper>
    );
};

export default ScreenReaderOnly;