import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTouchGestures } from '../../hooks/useTouchGestures';

const Overlay = styled.div`
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

const SheetContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 16px 16px 0 0;
  z-index: 1001;
  transform: translateY(${props => props.visible ? '0' : '100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 90vh;
  
  /* Safe area for devices with home indicator */
  padding-bottom: env(safe-area-inset-bottom);
`;

const DragHandle = styled.div`
  width: 40px;
  height: 4px;
  background: ${props => props.theme.colors.neutral[300]};
  border-radius: 2px;
  margin: 12px auto 8px;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

const SheetContent = styled.div`
  padding: 0 16px 16px;
  overflow-y: auto;
  max-height: calc(90vh - 40px);
`;

export const BottomSheet = ({
    visible,
    onClose,
    children,
    snapPoints = [0.3, 0.6, 0.9],
    initialSnap = 0.6
}) => {
    const [currentSnap, setCurrentSnap] = useState(initialSnap);
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);

    const { touchHandlers } = useTouchGestures({
        onSwipeDown: ({ velocity }) => {
            if (velocity > 0.5) {
                onClose?.();
            } else {
                // Snap to next lower point
                const currentIndex = snapPoints.indexOf(currentSnap);
                if (currentIndex > 0) {
                    setCurrentSnap(snapPoints[currentIndex - 1]);
                } else {
                    onClose?.();
                }
            }
        },
        onSwipeUp: () => {
            // Snap to next higher point
            const currentIndex = snapPoints.indexOf(currentSnap);
            if (currentIndex < snapPoints.length - 1) {
                setCurrentSnap(snapPoints[currentIndex + 1]);
            }
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
            <Overlay visible={visible} onClick={handleOverlayClick} />
            <SheetContainer
                visible={visible}
                style={{
                    height: `${currentSnap * 100}vh`,
                    transform: `translateY(${visible ? '0' : '100%'})`
                }}
            >
                <DragHandle {...touchHandlers} />
                <SheetContent>
                    {children}
                </SheetContent>
            </SheetContainer>
        </>
    );
};