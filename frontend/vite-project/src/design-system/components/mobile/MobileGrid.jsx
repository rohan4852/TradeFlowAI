import React from 'react';
import styled from 'styled-components';
import { useMobileDetection } from '../../hooks/useMobileDetection';

const GridContainer = styled.div`
  display: grid;
  gap: ${props => props.gap || '16px'};
  padding: ${props => props.padding || '16px'};
  
  /* Mobile-first responsive grid */
  grid-template-columns: ${props => {
    const { screenSize } = props;
    if (screenSize === 'mobile') return 'repeat(1, 1fr)';
    if (screenSize === 'tablet') return 'repeat(2, 1fr)';
    return 'repeat(auto-fit, minmax(300px, 1fr))';
  }};
  
  /* Adjust for mobile safe areas */
  padding-top: calc(${props => props.padding || '16px'} + env(safe-area-inset-top));
  padding-bottom: calc(${props => props.padding || '16px'} + env(safe-area-inset-bottom));
  padding-left: calc(${props => props.padding || '16px'} + env(safe-area-inset-left));
  padding-right: calc(${props => props.padding || '16px'} + env(safe-area-inset-right));
`;

const GridItem = styled.div`
  /* Touch-friendly minimum sizes */
  min-height: ${props => props.minHeight || '120px'};
  
  /* Responsive sizing */
  grid-column: ${props => {
    if (props.span && props.screenSize !== 'mobile') {
      return `span ${Math.min(props.span, 2)}`;
    }
    return 'span 1';
  }};
  
  /* Mobile-specific adjustments */
  ${props => props.screenSize === 'mobile' && `
    margin-bottom: 8px;
    &:last-child {
      margin-bottom: 0;
    }
  `}
`;

export const MobileGrid = ({ 
  children, 
  gap = '16px', 
  padding = '16px',
  className,
  ...props 
}) => {
  const { screenSize } = useMobileDetection();

  return (
    <GridContainer 
      gap={gap} 
      padding={padding} 
      screenSize={screenSize}
      className={className}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return (
            <GridItem 
              key={index}
              screenSize={screenSize}
              span={child.props?.span}
              minHeight={child.props?.minHeight}
            >
              {child}
            </GridItem>
          );
        }
        return child;
      })}
    </GridContainer>
  );
};