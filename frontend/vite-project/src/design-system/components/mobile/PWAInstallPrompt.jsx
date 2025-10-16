import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TouchOptimizedButton } from './TouchOptimizedButton';
import { handlePWAInstall } from '../../utils/mobilePerformance';

const PromptContainer = styled.div`
  position: fixed;
  bottom: 80px;
  left: 16px;
  right: 16px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transform: translateY(${props => props.visible ? '0' : '100px'});
  opacity: ${props => props.visible ? '1' : '0'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: ${props => props.visible ? 'auto' : 'none'};
  
  /* Safe area adjustment */
  bottom: calc(80px + env(safe-area-inset-bottom));
`;

const PromptHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const AppIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${props => props.theme.colors.primary[500]};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
`;

const PromptContent = styled.div`
  flex: 1;
`;

const PromptTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.neutral[900]};
`;

const PromptDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${props => props.theme.colors.neutral[600]};
  line-height: 1.4;
`;

const PromptActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 20px;
  color: ${props => props.theme.colors.neutral[400]};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: ${props => props.theme.colors.neutral[100]};
  }
`;

export const PWAInstallPrompt = ({
    appName = 'Trading App',
    appDescription = 'Install our app for the best trading experience',
    autoShow = true,
    showDelay = 3000
}) => {
    const [visible, setVisible] = useState(false);
    const [installHandler, setInstallHandler] = useState(null);

    useEffect(() => {
        const pwaHandler = handlePWAInstall();
        setInstallHandler(pwaHandler);

        if (autoShow) {
            const timer = setTimeout(() => {
                if (pwaHandler.canInstall()) {
                    setVisible(true);
                }
            }, showDelay);

            return () => clearTimeout(timer);
        }
    }, [autoShow, showDelay]);

    const handleInstall = async () => {
        if (installHandler) {
            const installed = await installHandler.install();
            if (installed) {
                setVisible(false);
            }
        }
    };

    const handleDismiss = () => {
        setVisible(false);
        // Remember user dismissed the prompt
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    // Don't show if user previously dismissed
    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed);
            const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

            // Show again after 7 days
            if (daysSinceDismissed < 7) {
                setVisible(false);
                return;
            }
        }
    }, []);

    if (!installHandler?.canInstall()) {
        return null;
    }

    return (
        <PromptContainer visible={visible}>
            <CloseButton onClick={handleDismiss}>
                ×
            </CloseButton>

            <PromptHeader>
                <AppIcon>
                    📈
                </AppIcon>
                <PromptContent>
                    <PromptTitle>Install {appName}</PromptTitle>
                    <PromptDescription>
                        {appDescription}
                    </PromptDescription>
                </PromptContent>
            </PromptHeader>

            <PromptActions>
                <TouchOptimizedButton
                    variant="primary"
                    size="medium"
                    onClick={handleInstall}
                    style={{ flex: 1 }}
                >
                    Install App
                </TouchOptimizedButton>
                <TouchOptimizedButton
                    variant="secondary"
                    size="medium"
                    onClick={handleDismiss}
                >
                    Not Now
                </TouchOptimizedButton>
            </PromptActions>
        </PromptContainer>
    );
};