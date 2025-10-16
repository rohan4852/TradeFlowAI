import React, { forwardRef, useState, useCallback, useRef } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../ThemeProvider';
import { Button, Icon, Label } from '../atoms';
import { useDraggable, useDropZone } from '../providers/DragDropProvider';
import {
    createGlassmorphism,
    tradingGlassPresets,
    animationPresets,
    hoverEffects,
    shouldReduceMotion
} from '../../effects';

// Widget container
const WidgetContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  ${props => tradingGlassPresets.widget(props.theme)}
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  background: ${props => props.theme.color.background.primary};
  border: 2px solid transparent;
  transition: all 0.2s ease;

  ${props => props.isDragging && css`
    transform: rotate(2deg) scale(1.02);
    box-shadow: ${props.theme.boxShadow.xl};
    z-index: ${props.theme.zIndex.modal};
  `}

  ${props => props.isDropTarget && css`
    border-color: ${props.theme.color.primary[400]};
    background: ${props.theme.color.primary[50]}20;
  `}

  ${props => props.isResizing && css`
    user-select: none;
    pointer-events: none;
  `}

  &:hover {
    ${props => !props.isDragging && hoverEffects.lift(props.theme)}
  }
`;

// Widget header
const WidgetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.color.border.primary};
  background: ${props => props.theme.color.background.secondary};
  cursor: ${props => props.draggable ? 'grab' : 'default'};

  ${props => props.isDragging && css`
    cursor: grabbing;
  `}
`;

// Widget title
const WidgetTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.color.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

// Widget controls
const WidgetControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  opacity: 0;
  transition: opacity 0.2s ease;

  ${WidgetContainer}:hover & {
    opacity: 1;
  }
`;

// Widget content
const WidgetContent = styled.div`
  padding: ${props => props.theme.spacing[4]};
  height: calc(100% - 60px); /* Subtract header height */
  overflow: auto;
  position: relative;

  ${props => props.noPadding && css`
    padding: 0;
  `}

  ${props => props.scrollable && css`
    overflow-y: auto;
    overflow-x: hidden;
  `}
`;

// Loading overlay
const LoadingOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  ${props => createGlassmorphism(props.theme, { intensity: 'strong' })}
  z-index: ${props => props.theme.zIndex.overlay};
`;

// Error state
const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: ${props => props.theme.color.text.secondary};
  gap: ${props => props.theme.spacing[3]};
`;

// Resize handles
const ResizeHandle = styled.div`
  position: absolute;
  background: ${props => props.theme.color.primary[400]};
  opacity: 0;
  transition: opacity 0.2s ease;

  ${WidgetContainer}:hover & {
    opacity: 1;
  }

  &.resize-handle-se {
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: se-resize;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 4px;
      right: 4px;
      width: 12px;
      height: 12px;
      background: linear-gradient(
        -45deg,
        transparent 30%,
        currentColor 30%,
        currentColor 35%,
        transparent 35%,
        transparent 65%,
        currentColor 65%,
        currentColor 70%,
        transparent 70%
      );
    }
  }

  &.resize-handle-s {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 8px;
    cursor: s-resize;
  }

  &.resize-handle-e {
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 20px;
    cursor: e-resize;
  }
`;

// Configuration panel
const ConfigPanel = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  width: 300px;
  max-height: 400px;
  ${props => tradingGlassPresets.modal(props.theme)}
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[4]};
  z-index: ${props => props.theme.zIndex.popover};
  overflow-y: auto;
`;

/**
 * Widget Component
 * Base widget component with drag, resize, and configuration capabilities
 */
const Widget = forwardRef(({
    id,
    title,
    icon,
    children,
    loading = false,
    error = null,
    draggable = true,
    resizable = true,
    configurable = true,
    removable = true,
    noPadding = false,
    scrollable = true,
    minWidth = 200,
    minHeight = 150,
    maxWidth,
    maxHeight,
    onRemove,
    onConfigure,
    onResize,
    onMove,
    renderConfig,
    className,
    ...props
}, ref) => {
    const { theme } = useTheme();
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const widgetRef = useRef(null);

    // Drag and drop hooks
    const dragProps = useDraggable(
        { id, title, type: 'widget' },
        {
            preview: (
                <div style={{
                    padding: theme.spacing[2],
                    background: theme.color.background.primary,
                    borderRadius: theme.borderRadius.md,
                    boxShadow: theme.boxShadow.lg
                }}>
                    {title}
                </div>
            )
        }
    );

    const { ref: dropRef, isDropTarget } = useDropZone(id, {
        accepts: ['widget'],
        onDrop: (item) => {
            if (onMove) {
                onMove(item.id, id);
            }
        }
    });

    // Combine refs
    const combinedRef = useCallback((node) => {
        widgetRef.current = node;
        dropRef.current = node;
        if (ref) {
            if (typeof ref === 'function') {
                ref(node);
            } else {
                ref.current = node;
            }
        }
    }, [ref, dropRef]);

    // Handle remove
    const handleRemove = useCallback(() => {
        if (onRemove) {
            onRemove(id);
        }
    }, [id, onRemove]);

    // Handle configure
    const handleConfigure = useCallback(() => {
        setIsConfigOpen(!isConfigOpen);
        if (onConfigure) {
            onConfigure(id, !isConfigOpen);
        }
    }, [id, isConfigOpen, onConfigure]);

    // Handle resize start
    const handleResizeStart = useCallback((direction, event) => {
        if (!resizable) return;

        event.stopPropagation();
        setIsResizing(true);

        const startX = event.clientX;
        const startY = event.clientY;
        const startRect = widgetRef.current.getBoundingClientRect();

        const handleMouseMove = (e) => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            let newWidth = startRect.width;
            let newHeight = startRect.height;

            if (direction.includes('e')) {
                newWidth = Math.max(minWidth, Math.min(maxWidth || Infinity, startRect.width + deltaX));
            }
            if (direction.includes('s')) {
                newHeight = Math.max(minHeight, Math.min(maxHeight || Infinity, startRect.height + deltaY));
            }

            if (onResize) {
                onResize(id, newWidth, newHeight);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [id, resizable, minWidth, minHeight, maxWidth, maxHeight, onResize]);

    // Render content based on state
    const renderContent = () => {
        if (error) {
            return (
                <ErrorState>
                    <Icon name="alert-circle" size="lg" color={theme.color.error[500]} />
                    <Label size="md" color={theme.color.error[600]}>
                        {error.message || 'An error occurred'}
                    </Label>
                    {error.retry && (
                        <Button size="sm" variant="outline" onClick={error.retry}>
                            Try Again
                        </Button>
                    )}
                </ErrorState>
            );
        }

        return (
            <WidgetContent noPadding={noPadding} scrollable={scrollable}>
                {children}
            </WidgetContent>
        );
    };

    return (
        <WidgetContainer
            ref={combinedRef}
            isDragging={dragProps.isDragging}
            isDropTarget={isDropTarget}
            isResizing={isResizing}
            className={className}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={animationPresets.normal}
            {...props}
        >
            {/* Widget Header */}
            <WidgetHeader
                draggable={draggable}
                isDragging={dragProps.isDragging}
                {...(draggable ? dragProps : {})}
            >
                <WidgetTitle>
                    {icon && <Icon name={icon} size="sm" />}
                    {title}
                </WidgetTitle>

                <WidgetControls>
                    {configurable && renderConfig && (
                        <Button
                            size="xs"
                            variant="ghost"
                            icon="settings"
                            onClick={handleConfigure}
                            aria-label="Configure widget"
                        />
                    )}
                    {removable && (
                        <Button
                            size="xs"
                            variant="ghost"
                            icon="x"
                            onClick={handleRemove}
                            aria-label="Remove widget"
                        />
                    )}
                </WidgetControls>
            </WidgetHeader>

            {/* Widget Content */}
            {renderContent()}

            {/* Loading Overlay */}
            <AnimatePresence>
                {loading && (
                    <LoadingOverlay
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Icon name="loader" size="lg" spin />
                    </LoadingOverlay>
                )}
            </AnimatePresence>

            {/* Resize Handles */}
            {resizable && (
                <>
                    <ResizeHandle
                        className="resize-handle-se"
                        onMouseDown={(e) => handleResizeStart('se', e)}
                    />
                    <ResizeHandle
                        className="resize-handle-s"
                        onMouseDown={(e) => handleResizeStart('s', e)}
                    />
                    <ResizeHandle
                        className="resize-handle-e"
                        onMouseDown={(e) => handleResizeStart('e', e)}
                    />
                </>
            )}

            {/* Configuration Panel */}
            <AnimatePresence>
                {isConfigOpen && renderConfig && (
                    <ConfigPanel
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={animationPresets.fast}
                    >
                        {renderConfig({ onClose: () => setIsConfigOpen(false) })}
                    </ConfigPanel>
                )}
            </AnimatePresence>
        </WidgetContainer>
    );
});

Widget.displayName = 'Widget';

export default Widget;