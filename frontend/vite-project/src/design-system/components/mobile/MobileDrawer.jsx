import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useTouchGestures } from '../../hooks/useTouchGestures';
import { TouchOptimizedButton } from './TouchOptimizedButton';

const DrawerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: ${props => props.visible ? 1 : 0};
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const DrawerContainer = styled.div`
  position: fixed;
  top: 0;
  ${props => props.side === 'right' ? 'right: 0' : 'left: 0'};
  bottom: 0;
  width: ${props => props.width || '280px'};
  max-width: 85vw;
  background: white;
  z-index: 1001;
  transform: translateX(${props => {
        if (!props.visible) {
            return props.side === 'right' ? '100%' : '-100%';
        }
        return '0';
    }});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Safe area adjustments */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  ${props => props.side === 'left' && 'padding-left: env(safe-area-inset-left);'}
  ${props => props.side === 'right' && 'padding-right: env(safe-area-inset-right);'}
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.neutral[200]};
`;

const DrawerTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.neutral[900]};
`;

const DrawerContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const CloseButton = styled(TouchOptimizedButton)`
  padding: 8px;
  min-height: 40px;
  min-width: 40px;
`;

export const MobileDrawer = ({
    visible,
    onClose,
    children,
    title,
    side = 'left',
    width = '280px'
}) => {
    const { touchHandlers } = useTouchGestures({
        onSwipeLeft: () => {
            if (side === 'left') onClose?.();
        },
        onSwipeRight: () => {
            if (side === 'right') onClose?.();
        }
    });

    useEffect(() => {
        if (visible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [visible]);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose?.();
        }
    };

    return (
        <>
            <DrawerOverlay visible={visible} onClick={handleOverlayClick} />
            <DrawerContainer
                visible={visible}
                side={side}
                width={width}
                {...touchHandlers}
            >
                {title && (
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                        <CloseButton
                            variant="ghost"
                            onClick={onClose}
                            aria-label="Close drawer"
                        >
                            ✕
                        </CloseButton>
                    </DrawerHeader>
                )}
                <DrawerContent>
                    {children}
                </DrawerContent>
            </DrawerContainer>
        </>
    );
};