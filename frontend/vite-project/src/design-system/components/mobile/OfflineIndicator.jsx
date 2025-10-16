import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const IndicatorContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${props => props.online ? props.theme.colors.success[500] : props.theme.colors.warning[500]};
  color: white;
  padding: 8px 16px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  z-index: 1001;
  transform: translateY(${props => props.visible ? '0' : '-100%'});
  transition: transform 0.3s ease;
  
  /* Safe area adjustment */
  padding-top: calc(8px + env(safe-area-inset-top));
`;

const IndicatorContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const StatusIcon = styled.div`
  font-size: 16px;
`;

const StatusText = styled.span`
  font-size: 14px;
`;

export const OfflineIndicator = ({
    showOnlineMessage = true,
    onlineMessageDuration = 3000,
    offlineMessage = 'You are offline. Some features may be limited.',
    onlineMessage = 'You are back online!'
}) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [visible, setVisible] = useState(false);
    const [showOnline, setShowOnline] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            if (showOnlineMessage) {
                setShowOnline(true);
                setVisible(true);

                // Hide online message after duration
                setTimeout(() => {
                    setVisible(false);
                    setTimeout(() => setShowOnline(false), 300);
                }, onlineMessageDuration);
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowOnline(false);
            setVisible(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Show offline indicator if already offline
        if (!navigator.onLine) {
            setVisible(true);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [showOnlineMessage, onlineMessageDuration]);

    // Don't show anything if online and not showing online message
    if (isOnline && !showOnline) {
        return null;
    }

    return (
        <IndicatorContainer
            visible={visible}
            online={isOnline}
        >
            <IndicatorContent>
                <StatusIcon>
                    {isOnline ? '✓' : '⚠️'}
                </StatusIcon>
                <StatusText>
                    {isOnline ? onlineMessage : offlineMessage}
                </StatusText>
            </IndicatorContent>
        </IndicatorContainer>
    );
};