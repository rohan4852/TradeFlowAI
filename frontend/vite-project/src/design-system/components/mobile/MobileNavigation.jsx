import React, { useState } from 'react';
import styled from 'styled-components';
import { TouchOptimizedButton } from './TouchOptimizedButton';
import { useMobileDetection } from '../../hooks/useMobileDetection';

const MobileNavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.neutral[50]};
  border-top: 1px solid ${props => props.theme.colors.neutral[200]};
  padding: 8px 16px;
  z-index: 1000;
  
  /* Glassmorphism effect */
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
  
  /* Safe area for devices with home indicator */
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
`;

const NavItems = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
`;

const NavItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  max-width: 80px;
`;

const NavIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.active ? props.theme.colors.primary[500] : props.theme.colors.neutral[600]};
`;

const NavLabel = styled.span`
  font-size: 12px;
  color: ${props => props.active ? props.theme.colors.primary[500] : props.theme.colors.neutral[600]};
  font-weight: ${props => props.active ? '600' : '400'};
`;

export const MobileNavigation = ({ items = [], activeItem, onItemSelect }) => {
    const { isMobile } = useMobileDetection();

    if (!isMobile) return null;

    return (
        <MobileNavContainer>
            <NavItems>
                {items.map((item) => (
                    <NavItem key={item.id}>
                        <TouchOptimizedButton
                            variant="ghost"
                            size="small"
                            onClick={() => onItemSelect?.(item)}
                            style={{
                                padding: '8px',
                                minHeight: '40px',
                                minWidth: '40px',
                                background: 'transparent'
                            }}
                        >
                            <NavIcon active={activeItem === item.id}>
                                {item.icon}
                            </NavIcon>
                        </TouchOptimizedButton>
                        <NavLabel active={activeItem === item.id}>
                            {item.label}
                        </NavLabel>
                    </NavItem>
                ))}
            </NavItems>
        </MobileNavContainer>
    );
};