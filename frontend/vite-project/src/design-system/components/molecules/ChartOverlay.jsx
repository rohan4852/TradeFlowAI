import React, { forwardRef, useState, useRef, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../ThemeProvider';
import { Button, Icon, Label, Input } from '../atoms';
import {
    createGlassmorphism,
    tradingGlassPresets,
    animationPresets,
    hoverEffects
} from '../../effects';

// Overlay container
const OverlayContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: ${props => props.drawingMode ? 'crosshair' : 'default'};
`;

// SVG overlay for drawings
const DrawingOverlay = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: ${props => props.drawingMode ? 'all' : 'none'};
  z-index: ${props => props.theme.zIndex.overlay};
`;

// Drawing toolbar
const DrawingToolbar = styled(motion.div)`
  position: absolute;
  top: ${props => props.theme.spacing[4]};
  left: ${props => props.theme.spacing[4]};
  ${props => tradingGlassPresets.chartOverlay(props.theme)}
  padding: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  z-index: ${props => props.theme.zIndex.dropdown};
`;

// Tool button
const ToolButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.active ? props.theme.color.primary[500] : 'transparent'};
  color: ${props => props.active ? props.theme.color.text.inverse : props.theme.color.text.secondary};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};

  &:hover {
    background: ${props => props.active ? props.theme.color.primary[600] : props.theme.color.background.secondary};
    color: ${props => props.active ? props.theme.color.text.inverse : props.theme.color.text.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Annotation popup
const AnnotationPopup = styled(motion.div)`
  position: absolute;
  ${props => tradingGlassPresets.tooltip(props.theme)}
  padding: ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.borderRadius.md};
  min-width: 200px;
  z-index: ${props => props.theme.zIndex.tooltip};
  box-shadow: ${props => props.theme.shadows.lg};
`;

// Drawing styles
const DRAWING_STYLES = {
    trendline: {
        stroke: '#3b82f6',
        strokeWidth: 2,
        strokeDasharray: 'none',
    },
    support: {
        stroke: '#10b981',
        strokeWidth: 2,
        strokeDasharray: '5,5',
    },
    resistance: {
        stroke: '#ef4444',
        strokeWidth: 2,
        strokeDasharray: '5,5',
    },
    rectangle: {
        stroke: '#8b5cf6',
        strokeWidth: 2,
        fill: 'rgba(139, 92, 246, 0.1)',
    },
    text: {
        fill: '#374151',
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
    },
};

// Chart overlay component
const ChartOverlay = forwardRef(({
    width = 800,
    height = 400,
    drawings = [],
    onDrawingAdd,
    onDrawingUpdate,
    onDrawingRemove,
    drawingMode = false,
    activeTool = null,
    onToolChange,
    showToolbar = true,
    className,
    testId,
    children,
    ...props
}, ref) => {
    const { theme } = useTheme();
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentDrawing, setCurrentDrawing] = useState(null);
    const [selectedDrawing, setSelectedDrawing] = useState(null);
    const [annotationPopup, setAnnotationPopup] = useState(null);
    const [textInput, setTextInput] = useState('');
    const overlayRef = useRef(null);

    // Drawing tools
    const tools = [
        { key: 'select', icon: 'search', label: 'Select' },
        { key: 'trendline', icon: 'minus', label: 'Trend Line' },
        { key: 'support', icon: 'trendUp', label: 'Support Line' },
        { key: 'resistance', icon: 'trendDown', label: 'Resistance Line' },
        { key: 'rectangle', icon: 'plus', label: 'Rectangle' },
        { key: 'text', icon: 'info', label: 'Text Annotation' },
    ];

    // Get mouse position relative to overlay
    const getMousePosition = useCallback((event) => {
        if (!overlayRef.current) return { x: 0, y: 0 };

        const rect = overlayRef.current.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }, []);

    // Handle mouse down
    const handleMouseDown = useCallback((event) => {
        if (!drawingMode || !activeTool || activeTool === 'select') return;

        const position = getMousePosition(event);
        setIsDrawing(true);

        const newDrawing = {
            id: `drawing_${Date.now()}`,
            type: activeTool,
            startX: position.x,
            startY: position.y,
            endX: position.x,
            endY: position.y,
            style: DRAWING_STYLES[activeTool],
            text: activeTool === 'text' ? 'New Annotation' : undefined,
        };

        setCurrentDrawing(newDrawing);
    }, [drawingMode, activeTool, getMousePosition]);

    // Handle mouse move
    const handleMouseMove = useCallback((event) => {
        if (!isDrawing || !currentDrawing) return;

        const position = getMousePosition(event);
        setCurrentDrawing(prev => ({
            ...prev,
            endX: position.x,
            endY: position.y,
        }));
    }, [isDrawing, currentDrawing, getMousePosition]);

    // Handle mouse up
    const handleMouseUp = useCallback(() => {
        if (!isDrawing || !currentDrawing) return;

        setIsDrawing(false);

        // Add the drawing if it has meaningful dimensions or is a text annotation
        const hasSize = Math.abs(currentDrawing.endX - currentDrawing.startX) > 5 ||
            Math.abs(currentDrawing.endY - currentDrawing.startY) > 5;

        if (hasSize || currentDrawing.type === 'text') {
            if (currentDrawing.type === 'text') {
                // Show text input popup
                setAnnotationPopup({
                    x: currentDrawing.startX,
                    y: currentDrawing.startY,
                    drawing: currentDrawing,
                });
                setTextInput(currentDrawing.text || '');
            } else {
                // Add the drawing immediately
                if (onDrawingAdd) {
                    onDrawingAdd(currentDrawing);
                }
            }
        }

        setCurrentDrawing(null);
    }, [isDrawing, currentDrawing, onDrawingAdd]);

    // Handle tool selection
    const handleToolSelect = (tool) => {
        if (onToolChange) {
            onToolChange(tool);
        }
        setSelectedDrawing(null);
    };

    // Handle drawing click for selection
    const handleDrawingClick = (drawing, event) => {
        event.stopPropagation();
        if (activeTool === 'select') {
            setSelectedDrawing(drawing.id === selectedDrawing ? null : drawing.id);
        }
    };

    // Handle text annotation save
    const handleTextSave = () => {
        if (annotationPopup && textInput.trim()) {
            const drawing = {
                ...annotationPopup.drawing,
                text: textInput.trim(),
            };

            if (onDrawingAdd) {
                onDrawingAdd(drawing);
            }
        }

        setAnnotationPopup(null);
        setTextInput('');
    };

    // Handle drawing deletion
    const handleDeleteDrawing = (drawingId) => {
        if (onDrawingRemove) {
            onDrawingRemove(drawingId);
        }
        setSelectedDrawing(null);
    };

    // Keyboard navigation handler
    const handleKeyDown = useCallback((event) => {
        const { key, ctrlKey } = event;

        if (ctrlKey) {
            switch (key) {
                case 'z':
                    event.preventDefault();
                    // Undo last drawing (if implemented)
                    break;
                case 'a':
                    event.preventDefault();
                    // Select all drawings (if implemented)
                    break;
                default:
                    break;
            }
            return;
        }

        switch (key) {
            case 'Escape':
                event.preventDefault();
                setSelectedDrawing(null);
                setAnnotationPopup(null);
                if (onToolChange) {
                    onToolChange('select');
                }
                break;
            case 'Delete':
            case 'Backspace':
                event.preventDefault();
                if (selectedDrawing) {
                    handleDeleteDrawing(selectedDrawing);
                }
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
                event.preventDefault();
                const toolIndex = parseInt(key) - 1;
                const tools = [
                    'select', 'trendline', 'support', 'resistance', 'rectangle', 'text'
                ];
                if (tools[toolIndex] && onToolChange) {
                    onToolChange(tools[toolIndex]);
                }
                break;
            default:
                break;
        }
    }, [selectedDrawing, onToolChange]);

    // Add keyboard event listener
    React.useEffect(() => {
        if (drawingMode) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [drawingMode, handleKeyDown]);

    // Render drawing element
    const renderDrawing = (drawing) => {
        const isSelected = selectedDrawing === drawing.id;
        const style = {
            ...drawing.style,
            stroke: isSelected ? theme.color.primary[500] : drawing.style.stroke,
            strokeWidth: isSelected ? (drawing.style.strokeWidth || 2) + 1 : drawing.style.strokeWidth,
        };

        switch (drawing.type) {
            case 'trendline':
            case 'support':
            case 'resistance':
                return (
                    <line
                        key={drawing.id}
                        x1={drawing.startX}
                        y1={drawing.startY}
                        x2={drawing.endX}
                        y2={drawing.endY}
                        style={style}
                        onClick={(e) => handleDrawingClick(drawing, e)}
                        className="drawing-element"
                    />
                );

            case 'rectangle':
                const rectX = Math.min(drawing.startX, drawing.endX);
                const rectY = Math.min(drawing.startY, drawing.endY);
                const rectWidth = Math.abs(drawing.endX - drawing.startX);
                const rectHeight = Math.abs(drawing.endY - drawing.startY);

                return (
                    <rect
                        key={drawing.id}
                        x={rectX}
                        y={rectY}
                        width={rectWidth}
                        height={rectHeight}
                        style={style}
                        onClick={(e) => handleDrawingClick(drawing, e)}
                        className="drawing-element"
                    />
                );

            case 'text':
                return (
                    <text
                        key={drawing.id}
                        x={drawing.startX}
                        y={drawing.startY}
                        style={style}
                        onClick={(e) => handleDrawingClick(drawing, e)}
                        className="drawing-element"
                    >
                        {drawing.text}
                    </text>
                );

            default:
                return null;
        }
    };

    return (
        <OverlayContainer
            ref={ref}
            drawingMode={drawingMode}
            className={className}
            data-testid={testId}
            {...props}
        >
            {children}

            {/* Drawing Toolbar */}
            {showToolbar && (
                <DrawingToolbar theme={theme} {...animationPresets.slideDown}>
                    {tools.map((tool) => (
                        <ToolButton
                            key={tool.key}
                            active={activeTool === tool.key}
                            onClick={() => handleToolSelect(tool.key)}
                            title={tool.label}
                            theme={theme}
                            {...hoverEffects.buttonSecondary}
                        >
                            <Icon name={tool.icon} size="sm" />
                        </ToolButton>
                    ))}

                    {selectedDrawing && (
                        <ToolButton
                            onClick={() => handleDeleteDrawing(selectedDrawing)}
                            title="Delete Selected"
                            theme={theme}
                            {...hoverEffects.buttonSecondary}
                        >
                            <Icon name="close" size="sm" color="error" />
                        </ToolButton>
                    )}
                </DrawingToolbar>
            )}

            {/* SVG Drawing Overlay */}
            <DrawingOverlay
                ref={overlayRef}
                width={width}
                height={height}
                drawingMode={drawingMode}
                theme={theme}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Existing drawings */}
                {drawings.map(renderDrawing)}

                {/* Current drawing being created */}
                {currentDrawing && renderDrawing(currentDrawing)}
            </DrawingOverlay>

            {/* Text Annotation Popup */}
            <AnimatePresence>
                {annotationPopup && (
                    <AnnotationPopup
                        style={{
                            left: annotationPopup.x,
                            top: annotationPopup.y - 60,
                        }}
                        theme={theme}
                        {...animationPresets.scale}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
                            <Label size="sm" weight="medium">
                                Add Text Annotation
                            </Label>
                            <Input
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Enter annotation text"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleTextSave();
                                    } else if (e.key === 'Escape') {
                                        setAnnotationPopup(null);
                                        setTextInput('');
                                    }
                                }}
                            />
                            <div style={{ display: 'flex', gap: theme.spacing[2], justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setAnnotationPopup(null);
                                        setTextInput('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleTextSave}
                                    disabled={!textInput.trim()}
                                >
                                    Add
                                </Button>
                            </div>
                        </div>
                    </AnnotationPopup>
                )}
            </AnimatePresence>
        </OverlayContainer>
    );
});

ChartOverlay.displayName = 'ChartOverlay';

export default ChartOverlay;