import React, { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../ThemeProvider';
import { Button, Icon } from '../atoms';
import {
    createGlassmorphism,
    tradingGlassPresets,
    animationPresets,
    shouldReduceMotion
} from '../../effects';

// Grid container with enhanced responsive breakpoints
const GridContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  gap: ${props => props.gap ? `${props.gap}px` : props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.color.background.primary};
  overflow: hidden;

  /* Dynamic grid template based on columns and responsive breakpoints */
  grid-template-columns: ${props => `repeat(${props.columns}, 1fr)`};
  grid-auto-rows: ${props => props.rowHeight || '200px'};

  /* Enhanced responsive breakpoints with smooth transitions */
  @media (max-width: ${props => props.theme.breakpoints.xl}) {
    grid-template-columns: ${props => `repeat(${Math.max(1, Math.floor(props.columns * 0.9))}, 1fr)`};
    gap: ${props => props.gap ? `${Math.max(8, props.gap - 4)}px` : props.theme.spacing[2]};
  }

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: ${props => `repeat(${Math.max(1, Math.floor(props.columns * 0.75))}, 1fr)`};
    gap: ${props => props.gap ? `${Math.max(8, props.gap - 8)}px` : props.theme.spacing[2]};
    padding: ${props => props.theme.spacing[3]};
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: ${props => `repeat(${Math.max(1, Math.floor(props.columns * 0.5))}, 1fr)`};
    gap: ${props => props.theme.spacing[2]};
    padding: ${props => props.theme.spacing[2]};
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing[2]};
    padding: ${props => props.theme.spacing[2]};
  }

  /* Grid lines for visual feedback when enabled */
  ${props => props.showGridLines && `
    background-image: 
      linear-gradient(to right, ${props.theme.color.border.primary}40 1px, transparent 1px),
      linear-gradient(to bottom, ${props.theme.color.border.primary}40 1px, transparent 1px);
    background-size: calc(100% / ${props.columns}) ${props.rowHeight || '200px'};
  `}
`;

// Grid item wrapper
const GridItem = styled(motion.div)`
  position: relative;
  grid-column: ${props => `span ${props.width || 1}`};
  grid-row: ${props => `span ${props.height || 1}`};
  min-height: ${props => props.minHeight || '150px'};
  
  ${props => props.isDragging && css`
    z-index: ${props.theme.zIndex.modal};
    transform: rotate(2deg);
    box-shadow: ${props.theme.boxShadow.xl};
  `}

  ${props => props.isDropTarget && css`
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border: 2px dashed ${props.theme.color.primary[500]};
      border-radius: ${props.theme.borderRadius.lg};
      background: ${props.theme.color.primary[50]}20;
      z-index: -1;
    }
  `}
`;

// Drag handle
const DragHandle = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing[2]};
  right: ${props => props.theme.spacing[2]};
  display: flex;
  gap: ${props => props.theme.spacing[1]};
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: ${props => props.theme.zIndex.tooltip};

  ${GridItem}:hover & {
    opacity: 1;
  }
`;

// Resize handle
const ResizeHandle = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  cursor: se-resize;
  opacity: 0;
  transition: opacity 0.2s ease;

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
      ${props => props.theme.color.text.secondary} 30%,
      ${props => props.theme.color.text.secondary} 35%,
      transparent 35%,
      transparent 65%,
      ${props => props.theme.color.text.secondary} 65%,
      ${props => props.theme.color.text.secondary} 70%,
      transparent 70%
    );
  }

  ${GridItem}:hover & {
    opacity: 1;
  }
`;

// Drop zone indicator
const DropZone = styled(motion.div)`
  position: absolute;
  border: 2px dashed ${props => props.theme.color.primary[400]};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.color.primary[50]}40;
  pointer-events: none;
  z-index: ${props => props.theme.zIndex.overlay};
`;

/**
 * Enhanced GridLayout Component
 * Responsive grid layout with advanced drag-and-drop, snap-to-grid, and persistence
 */
const GridLayout = forwardRef(({
    children,
    columns = 12,
    rowHeight = '200px',
    gap = 16,
    items = [],
    layoutId = 'default',
    onLayoutChange,
    onItemMove,
    onItemResize,
    onItemRemove,
    onItemAdd,
    enableDrag = true,
    enableResize = true,
    enableRemove = true,
    snapToGrid = true,
    responsive = true,
    showGridLines = false,
    autoSave = true,
    persistLayout = true,
    breakpoints = {
        xl: 1200,
        lg: 992,
        md: 768,
        sm: 576
    },
    className,
    ...props
}, ref) => {
    const { theme } = useTheme();
    const containerRef = useRef(null);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dropZone, setDropZone] = useState(null);
    const [resizingItem, setResizingItem] = useState(null);
    const [layout, setLayout] = useState(items);
    const [currentBreakpoint, setCurrentBreakpoint] = useState('xl');
    const [gridDimensions, setGridDimensions] = useState({ width: 0, height: 0 });
    const [isDraggingOverGrid, setIsDraggingOverGrid] = useState(false);
    const autoSaveRef = useRef(null);

    // Import layout persistence utilities
    const { saveLayout, loadLayout, createAutoSave } = React.useMemo(() => {
        if (typeof window !== 'undefined') {
            return require('../../utils/layoutPersistence');
        }
        return { saveLayout: () => { }, loadLayout: () => null, createAutoSave: () => () => { } };
    }, []);

    // Create auto-save function
    React.useEffect(() => {
        if (autoSave && persistLayout) {
            autoSaveRef.current = createAutoSave(layoutId, 1000);
        }
    }, [autoSave, persistLayout, layoutId, createAutoSave]);

    // Detect current breakpoint
    const detectBreakpoint = useCallback(() => {
        const width = window.innerWidth;
        if (width >= breakpoints.xl) return 'xl';
        if (width >= breakpoints.lg) return 'lg';
        if (width >= breakpoints.md) return 'md';
        if (width >= breakpoints.sm) return 'sm';
        return 'xs';
    }, [breakpoints]);

    // Update grid dimensions and breakpoint
    const updateGridDimensions = useCallback(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setGridDimensions({ width: rect.width, height: rect.height });
        }
        setCurrentBreakpoint(detectBreakpoint());
    }, [detectBreakpoint]);

    // Responsive columns based on breakpoint
    const responsiveColumns = React.useMemo(() => {
        if (!responsive) return columns;

        switch (currentBreakpoint) {
            case 'xl': return columns;
            case 'lg': return Math.max(1, Math.floor(columns * 0.75));
            case 'md': return Math.max(1, Math.floor(columns * 0.5));
            case 'sm': return Math.max(1, Math.floor(columns * 0.33));
            case 'xs': return 1;
            default: return columns;
        }
    }, [columns, currentBreakpoint, responsive]);

    // Calculate cell dimensions
    const cellDimensions = React.useMemo(() => {
        const cellWidth = gridDimensions.width / responsiveColumns;
        const cellHeight = parseInt(rowHeight);
        return { width: cellWidth, height: cellHeight };
    }, [gridDimensions.width, responsiveColumns, rowHeight]);

    // Enhanced drag start with better feedback
    const handleDragStart = useCallback((item, event) => {
        if (!enableDrag) return;

        setDraggedItem(item);
        setIsDraggingOverGrid(true);

        // Set drag data
        if (event.dataTransfer) {
            event.dataTransfer.setData('text/plain', JSON.stringify(item));
            event.dataTransfer.effectAllowed = 'move';

            // Create custom drag image
            const dragImage = event.currentTarget.cloneNode(true);
            dragImage.style.transform = 'rotate(2deg)';
            dragImage.style.opacity = '0.8';
            event.dataTransfer.setDragImage(dragImage, 0, 0);
        }

        // Add visual feedback
        event.currentTarget.style.opacity = '0.5';
    }, [enableDrag]);

    // Enhanced drag over with collision detection
    const handleDragOver = useCallback((event) => {
        event.preventDefault();

        if (!draggedItem) return;

        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = event.clientX - rect.left - parseInt(theme.spacing[4]);
        const y = event.clientY - rect.top - parseInt(theme.spacing[4]);

        // Calculate grid position with responsive columns
        const cellWidth = cellDimensions.width;
        const cellHeight = cellDimensions.height;

        let gridX = Math.floor(x / cellWidth);
        let gridY = Math.floor(y / cellHeight);

        // Ensure within bounds
        gridX = Math.max(0, Math.min(responsiveColumns - draggedItem.width, gridX));
        gridY = Math.max(0, gridY);

        // Check for collisions with other items
        const wouldCollide = layout.some(item => {
            if (item.id === draggedItem.id) return false;

            return !(
                gridX >= item.x + item.width ||
                gridX + draggedItem.width <= item.x ||
                gridY >= item.y + item.height ||
                gridY + draggedItem.height <= item.y
            );
        });

        if (snapToGrid && !wouldCollide) {
            setDropZone({
                x: gridX * cellWidth,
                y: gridY * cellHeight,
                width: draggedItem.width * cellWidth,
                height: draggedItem.height * cellHeight,
                gridX,
                gridY,
                isValid: true
            });
        } else if (snapToGrid && wouldCollide) {
            // Find nearest valid position
            const validPosition = findNearestValidPosition(gridX, gridY, draggedItem, layout);
            if (validPosition) {
                setDropZone({
                    x: validPosition.x * cellWidth,
                    y: validPosition.y * cellHeight,
                    width: draggedItem.width * cellWidth,
                    height: draggedItem.height * cellHeight,
                    gridX: validPosition.x,
                    gridY: validPosition.y,
                    isValid: true
                });
            } else {
                setDropZone({
                    x: gridX * cellWidth,
                    y: gridY * cellHeight,
                    width: draggedItem.width * cellWidth,
                    height: draggedItem.height * cellHeight,
                    gridX,
                    gridY,
                    isValid: false
                });
            }
        }
    }, [draggedItem, cellDimensions, responsiveColumns, snapToGrid, layout, theme.spacing]);

    // Find nearest valid position for item placement
    const findNearestValidPosition = useCallback((startX, startY, item, currentLayout) => {
        const maxDistance = 10; // Maximum search distance

        for (let distance = 0; distance <= maxDistance; distance++) {
            for (let dx = -distance; dx <= distance; dx++) {
                for (let dy = -distance; dy <= distance; dy++) {
                    if (Math.abs(dx) !== distance && Math.abs(dy) !== distance) continue;

                    const testX = startX + dx;
                    const testY = startY + dy;

                    // Check bounds
                    if (testX < 0 || testX + item.width > responsiveColumns || testY < 0) continue;

                    // Check collisions
                    const hasCollision = currentLayout.some(layoutItem => {
                        if (layoutItem.id === item.id) return false;

                        return !(
                            testX >= layoutItem.x + layoutItem.width ||
                            testX + item.width <= layoutItem.x ||
                            testY >= layoutItem.y + layoutItem.height ||
                            testY + item.height <= layoutItem.y
                        );
                    });

                    if (!hasCollision) {
                        return { x: testX, y: testY };
                    }
                }
            }
        }

        return null;
    }, [responsiveColumns]);

    // Enhanced drop with validation and persistence
    const handleDrop = useCallback((event) => {
        event.preventDefault();

        if (!draggedItem || !dropZone || !dropZone.isValid) {
            // Reset drag state
            setDraggedItem(null);
            setDropZone(null);
            setIsDraggingOverGrid(false);
            return;
        }

        const newLayout = layout.map(item =>
            item.id === draggedItem.id
                ? { ...item, x: dropZone.gridX, y: dropZone.gridY }
                : item
        );

        // Compact layout to remove gaps
        const compactedLayout = compactLayout(newLayout);

        setLayout(compactedLayout);
        setDraggedItem(null);
        setDropZone(null);
        setIsDraggingOverGrid(false);

        // Auto-save if enabled
        if (autoSaveRef.current) {
            autoSaveRef.current(compactedLayout, {
                columns: responsiveColumns,
                rowHeight,
                gap,
                responsive,
                snapToGrid
            });
        }

        if (onLayoutChange) {
            onLayoutChange(compactedLayout);
        }

        if (onItemMove) {
            onItemMove(draggedItem.id, dropZone.gridX, dropZone.gridY);
        }
    }, [draggedItem, dropZone, layout, responsiveColumns, rowHeight, gap, responsive, snapToGrid, onLayoutChange, onItemMove]);

    // Compact layout to remove unnecessary gaps
    const compactLayout = useCallback((layoutItems) => {
        const sorted = [...layoutItems].sort((a, b) => a.y - b.y || a.x - b.x);
        const compacted = [];

        sorted.forEach(item => {
            let newY = 0;

            // Find the lowest possible Y position
            while (true) {
                const hasCollision = compacted.some(placedItem => {
                    return !(
                        item.x >= placedItem.x + placedItem.width ||
                        item.x + item.width <= placedItem.x ||
                        newY >= placedItem.y + placedItem.height ||
                        newY + item.height <= placedItem.y
                    );
                });

                if (!hasCollision) break;
                newY++;
            }

            compacted.push({ ...item, y: newY });
        });

        return compacted;
    }, []);

    // Handle resize start
    const handleResizeStart = useCallback((item, event) => {
        if (!enableResize) return;

        event.stopPropagation();
        setResizingItem({ ...item, startX: event.clientX, startY: event.clientY });
    }, [enableResize]);

    // Handle resize
    const handleResize = useCallback((event) => {
        if (!resizingItem) return;

        const deltaX = event.clientX - resizingItem.startX;
        const deltaY = event.clientY - resizingItem.startY;

        const container = containerRef.current;
        if (!container) return;

        const cellWidth = container.getBoundingClientRect().width / columns;
        const cellHeight = parseInt(rowHeight);

        const newWidth = Math.max(1, resizingItem.width + Math.round(deltaX / cellWidth));
        const newHeight = Math.max(1, resizingItem.height + Math.round(deltaY / cellHeight));

        const newLayout = layout.map(item =>
            item.id === resizingItem.id
                ? { ...item, width: newWidth, height: newHeight }
                : item
        );

        setLayout(newLayout);

        if (onItemResize) {
            onItemResize(resizingItem.id, newWidth, newHeight);
        }
    }, [resizingItem, layout, columns, rowHeight, onItemResize]);

    // Handle resize end
    const handleResizeEnd = useCallback(() => {
        if (resizingItem && onLayoutChange) {
            onLayoutChange(layout);
        }
        setResizingItem(null);
    }, [resizingItem, layout, onLayoutChange]);

    // Handle item remove
    const handleRemove = useCallback((itemId) => {
        if (!enableRemove) return;

        const newLayout = layout.filter(item => item.id !== itemId);
        setLayout(newLayout);

        if (onLayoutChange) {
            onLayoutChange(newLayout);
        }

        if (onItemRemove) {
            onItemRemove(itemId);
        }
    }, [layout, enableRemove, onLayoutChange, onItemRemove]);

    // Window resize handler for responsive behavior
    useEffect(() => {
        updateGridDimensions();

        const handleResize = () => {
            updateGridDimensions();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [updateGridDimensions]);

    // Load persisted layout on mount
    useEffect(() => {
        if (persistLayout && layoutId) {
            const savedLayout = loadLayout(layoutId);
            if (savedLayout && savedLayout.items) {
                setLayout(savedLayout.items);
                if (onLayoutChange) {
                    onLayoutChange(savedLayout.items);
                }
            }
        }
    }, [layoutId, persistLayout, loadLayout, onLayoutChange]);

    // Update layout when items prop changes
    useEffect(() => {
        if (items && items.length > 0) {
            setLayout(items);
        }
    }, [items]);

    // Mouse event handlers for resize
    useEffect(() => {
        if (resizingItem) {
            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', handleResizeEnd);

            return () => {
                document.removeEventListener('mousemove', handleResize);
                document.removeEventListener('mouseup', handleResizeEnd);
            };
        }
    }, [resizingItem, handleResize, handleResizeEnd]);

    // Drag end cleanup
    useEffect(() => {
        const handleDragEnd = () => {
            setDraggedItem(null);
            setDropZone(null);
            setIsDraggingOverGrid(false);
        };

        document.addEventListener('dragend', handleDragEnd);
        return () => document.removeEventListener('dragend', handleDragEnd);
    }, []);

    // Render grid items
    const renderGridItems = () => {
        return layout.map((item) => {
            const ItemComponent = item.component || 'div';

            return (
                <GridItem
                    key={item.id}
                    width={item.width}
                    height={item.height}
                    isDragging={draggedItem?.id === item.id}
                    draggable={enableDrag}
                    onDragStart={(e) => handleDragStart(item, e)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={animationPresets.normal}
                >
                    <ItemComponent {...item.props}>
                        {item.content}
                    </ItemComponent>

                    {/* Drag and control handles */}
                    <DragHandle>
                        {enableRemove && (
                            <Button
                                size="xs"
                                variant="ghost"
                                icon="x"
                                onClick={() => handleRemove(item.id)}
                                aria-label={`Remove ${item.title || 'widget'}`}
                            />
                        )}
                        {enableDrag && (
                            <Icon
                                name="move"
                                size="sm"
                                style={{ cursor: 'grab' }}
                                aria-label="Drag to move"
                            />
                        )}
                    </DragHandle>

                    {/* Resize handle */}
                    {enableResize && (
                        <ResizeHandle
                            onMouseDown={(e) => handleResizeStart(item, e)}
                            aria-label="Resize widget"
                        />
                    )}
                </GridItem>
            );
        });
    };

    return (
        <GridContainer
            ref={containerRef}
            columns={responsiveColumns}
            rowHeight={rowHeight}
            gap={gap}
            showGridLines={showGridLines && isDraggingOverGrid}
            className={className}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={() => setIsDraggingOverGrid(true)}
            onDragLeave={(e) => {
                // Only hide grid lines if leaving the container entirely
                if (!containerRef.current?.contains(e.relatedTarget)) {
                    setIsDraggingOverGrid(false);
                }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={animationPresets.normal}
            {...props}
        >
            <AnimatePresence mode="popLayout">
                {renderGridItems()}
            </AnimatePresence>

            {/* Enhanced drop zone indicator */}
            <AnimatePresence>
                {dropZone && (
                    <DropZone
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                            opacity: dropZone.isValid ? 1 : 0.5,
                            scale: 1,
                            borderColor: dropZone.isValid
                                ? theme.color.primary[400]
                                : theme.color.error[400]
                        }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            left: dropZone.x,
                            top: dropZone.y,
                            width: dropZone.width,
                            height: dropZone.height,
                            borderStyle: dropZone.isValid ? 'dashed' : 'solid'
                        }}
                        transition={animationPresets.fast}
                    />
                )}
            </AnimatePresence>

            {/* Responsive breakpoint indicator (development only) */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{
                    position: 'absolute',
                    top: theme.spacing[2],
                    left: theme.spacing[2],
                    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                    background: theme.color.background.secondary,
                    borderRadius: theme.borderRadius.sm,
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.color.text.secondary,
                    zIndex: theme.zIndex.tooltip
                }}>
                    {currentBreakpoint} ({responsiveColumns} cols)
                </div>
            )}
        </GridContainer>
    );
});

GridLayout.displayName = 'GridLayout';

export default GridLayout;