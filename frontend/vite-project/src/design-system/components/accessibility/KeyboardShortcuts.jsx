import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { Button } from '../atoms';
import { createGlassmorphism } from '../../effects';

/**
 * Keyboard shortcuts overlay component
 */
const ShortcutsOverlay = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  ${props => createGlassmorphism(props.theme, { intensity: 'strong' })}
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[6]};
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: ${props => props.theme.zIndex.modal};
  box-shadow: ${props => props.theme.shadows.xl};
  border: 1px solid ${props => props.theme.color.border.primary};
`;

const ShortcutsBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: ${props => props.theme.zIndex.overlay};
`;

const ShortcutsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[4]};
  padding-bottom: ${props => props.theme.spacing[3]};
  border-bottom: 1px solid ${props => props.theme.color.border.primary};
`;

const ShortcutsTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.color.text.primary};
  margin: 0;
`;

const ShortcutsGrid = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing[4]};
`;

const ShortcutSection = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.color.text.primary};
  margin: 0 0 ${props => props.theme.spacing[3]} 0;
`;

const ShortcutItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing[2]} 0;
  border-bottom: 1px solid ${props => props.theme.color.border.secondary};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ShortcutDescription = styled.span`
  color: ${props => props.theme.color.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ShortcutKeys = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
`;

const KeyBadge = styled.span`
  background: ${props => props.theme.color.background.secondary};
  color: ${props => props.theme.color.text.primary};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  font-family: ${props => props.theme.typography.fontFamily.monospace};
  border: 1px solid ${props => props.theme.color.border.primary};
  min-width: 24px;
  text-align: center;
`;

/**
 * Default keyboard shortcuts for trading platform
 */
const defaultShortcuts = {
    'Global Navigation': [
        { keys: ['Alt', '1'], description: 'Focus order book' },
        { keys: ['Alt', '2'], description: 'Focus price chart' },
        { keys: ['Alt', '3'], description: 'Focus portfolio' },
        { keys: ['Alt', '4'], description: 'Focus watchlist' },
        { keys: ['Alt', '5'], description: 'Focus news feed' },
        { keys: ['?'], description: 'Show keyboard shortcuts' },
        { keys: ['Esc'], description: 'Close modals/overlays' }
    ],
    'Order Book': [
        { keys: ['↑', '↓'], description: 'Navigate price levels' },
        { keys: ['Enter'], description: 'Select price level' },
        { keys: ['Space'], description: 'Toggle order details' },
        { keys: ['Home'], description: 'Go to best bid/ask' },
        { keys: ['End'], description: 'Go to last price level' }
    ],
    'Chart Navigation': [
        { keys: ['←', '→'], description: 'Navigate time periods' },
        { keys: ['+', '-'], description: 'Zoom in/out' },
        { keys: ['Home'], description: 'Go to start of data' },
        { keys: ['End'], description: 'Go to end of data' },
        { keys: ['R'], description: 'Reset zoom' },
        { keys: ['F'], description: 'Toggle fullscreen' }
    ],
    'Trading Actions': [
        { keys: ['B'], description: 'Quick buy order' },
        { keys: ['S'], description: 'Quick sell order' },
        { keys: ['Ctrl', 'Enter'], description: 'Submit order' },
        { keys: ['Ctrl', 'Z'], description: 'Cancel last order' },
        { keys: ['M'], description: 'Toggle market/limit order' }
    ],
    'General': [
        { keys: ['Tab'], description: 'Navigate between elements' },
        { keys: ['Shift', 'Tab'], description: 'Navigate backwards' },
        { keys: ['Enter'], description: 'Activate focused element' },
        { keys: ['Space'], description: 'Toggle/select element' },
        { keys: ['Esc'], description: 'Cancel/close' }
    ]
};

/**
 * KeyboardShortcuts component
 * Displays available keyboard shortcuts in an overlay
 */
const KeyboardShortcuts = ({
    shortcuts = defaultShortcuts,
    isOpen = false,
    onClose,
    trigger = '?',
    className,
    ...props
}) => {
    const [isVisible, setIsVisible] = useState(isOpen);

    // Handle keyboard shortcut to show/hide
    useKeyboardNavigation({
        customKeys: {
            [trigger]: () => setIsVisible(!isVisible),
            'escape': () => setIsVisible(false)
        },
        enabled: true
    });

    // Sync with external isOpen prop
    useEffect(() => {
        setIsVisible(isOpen);
    }, [isOpen]);

    // Handle close
    const handleClose = () => {
        setIsVisible(false);
        if (onClose) onClose();
    };

    // Handle backdrop click
    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            handleClose();
        }
    };

    // Render key badges
    const renderKeys = (keys) => (
        <ShortcutKeys>
            {keys.map((key, index) => (
                <KeyBadge key={index}>
                    {key}
                </KeyBadge>
            ))}
        </ShortcutKeys>
    );

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    <ShortcutsBackdrop
                        onClick={handleBackdropClick}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                    <ShortcutsOverlay
                        className={className}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.2 }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="shortcuts-title"
                        {...props}
                    >
                        <ShortcutsHeader>
                            <ShortcutsTitle id="shortcuts-title">
                                Keyboard Shortcuts
                            </ShortcutsTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClose}
                                aria-label="Close keyboard shortcuts"
                            >
                                ✕
                            </Button>
                        </ShortcutsHeader>

                        <ShortcutsGrid>
                            {Object.entries(shortcuts).map(([sectionName, sectionShortcuts]) => (
                                <ShortcutSection key={sectionName}>
                                    <SectionTitle>{sectionName}</SectionTitle>
                                    {sectionShortcuts.map((shortcut, index) => (
                                        <ShortcutItem key={index}>
                                            <ShortcutDescription>
                                                {shortcut.description}
                                            </ShortcutDescription>
                                            {renderKeys(shortcut.keys)}
                                        </ShortcutItem>
                                    ))}
                                </ShortcutSection>
                            ))}
                        </ShortcutsGrid>
                    </ShortcutsOverlay>
                </>
            )}
        </AnimatePresence>
    );
};

/**
 * Hook for managing keyboard shortcuts
 */
export const useKeyboardShortcuts = (shortcuts = {}) => {
    const [isShortcutsVisible, setIsShortcutsVisible] = useState(false);

    useKeyboardNavigation({
        customKeys: {
            '?': () => setIsShortcutsVisible(true),
            ...shortcuts
        },
        enabled: true
    });

    return {
        isShortcutsVisible,
        setIsShortcutsVisible,
        showShortcuts: () => setIsShortcutsVisible(true),
        hideShortcuts: () => setIsShortcutsVisible(false)
    };
};

export default KeyboardShortcuts;