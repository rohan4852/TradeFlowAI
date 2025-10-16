import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../ThemeProvider';
import { Button, Icon, Label } from '../atoms';
import {
    calculateSMA,
    calculateEMA,
    calculateBollingerBands,
    calculateRSI,
    calculateMACD,
    calculateStochastic,
    calculateATR,
    calculatePastem container
const OverlaySystemContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

// Drawing canvas
const DrawingCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: ${props => props.drawingMode ? 'all' : 'none'};
  cursor: ${props => {
        switch (props.activeTool) {
            case 'trendline': return 'crosshair';
            case 'horizontal': return 'ns-resize';
            case 'rectangle': return 'crosshair';
            case 'fibonacci': return 'crosshair';
            case 'text': return 'text';
            default: return 'default';
        }
    }};
  z-index: ${props => props.theme.zIndex.overlay};
`;

// Toolbar
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
  flex-wrap: wrap;
`;

// Tool group
const ToolGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.theme.color.background.secondary}40;
`;

// Tool button
const ToolButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.active ? props.theme.color.primary[500] : 'transparent'};
  color: ${props => props.active ? props.theme.color.text.inverse : props.theme.color.text.secondary};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};

  &:hover {
    background: ${props => props.active ? props.theme.color.primary[600] : props.theme.color.background.secondary};
    color: ${props => props.active ? props.theme.color.text.inverse : props.theme.color.text.primary};
    transform: translateY(-1px);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.color.primary[500]}40;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Properties panel
const PropertiesPanel = styled(motion.div)`
  position: absolute;
  top: ${props => props.theme.spacing[4]};
  right: ${props => props.theme.spacing[4]};
  ${props => tradingGlassPresets.modal(props.theme)}
  padding: ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.borderRadius.md};
  min-width: 250px;
  z-index: ${props => props.theme.zIndex.dropdown};
`;

// Color picker
const ColorPicker = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  flex-wrap: wrap;
  margin-top: ${props => props.theme.spacing[2]};
`;

// Color option
const ColorOption = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? props.theme.color.text.primary : 'transparent'};
  background: ${props => props.color};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};

  &:hover {
    transform: scale(1.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.color.primary[500]}40;
  }
`;

// Drawing tools configuration
const DRAWING_TOOLS = [
    {
        group: 'selection',
        tools: [
            { key: 'select', icon: 'mouse-pointer', label: 'Select', shortcut: 'V' },
            { key: 'pan', icon: 'move', label: 'Pan', shortcut: 'H' }
        ]
    },
    {
        group: 'lines',
        tools: [
            { key: 'trendline', icon: 'trending-up', label: 'Trend Line', shortcut: 'T' },
            { key: 'horizontal', icon: 'minus', label: 'Horizontal Line', shortcut: 'H' },
            { key: 'vertical', icon: 'divide', label: 'Vertical Line', shortcut: 'V' },
            { key: 'ray', icon: 'arrow-up-right', label: 'Ray', shortcut: 'R' }
        ]
    },
    {
        group: 'shapes',
        tools: [
            { key: 'rectangle', icon: 'square', label: 'Rectangle', shortcut: 'R' },
            { key: 'circle', icon: 'circle', label: 'Circle', shortcut: 'C' },
            { key: 'triangle', icon: 'triangle', label: 'Triangle', shortcut: 'T' }
        ]
    },
    {
        group: 'fibonacci',
        tools: [
            { key: 'fibonacci', icon: 'activity', label: 'Fibonacci Retracement', shortcut: 'F' },
            { key: 'fibonacciExtension', icon: 'bar-chart', label: 'Fibonacci Extension', shortcut: 'E' }
        ]
    },
    {
        group: 'annotation',
        tools: [
            { key: 'text', icon: 'type', label: 'Text', shortcut: 'T' },
            { key: 'arrow', icon: 'arrow-right', label: 'Arrow', shortcut: 'A' },
            { key: 'callout', icon: 'message-circle', label: 'Callout', shortcut: 'N' }
        ]
    }
];

// Default colors
const DEFAULT_COLORS = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
    '#ec4899', // Pink
    '#6b7280'  // Gray
];

// Fibonacci levels
const FIBONACCI_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

/**
 * ChartOverlaySystem Component
 * Advanced overlay system for drawing tools and annotations
 */
const ChartOverlaySystem = ({
    width = 800,
    height = 400,
    data = [],
    overlays = [],
    onOverlayAdd,
    onOverlayUpdate,
    onOverlayRemove,
    drawingMode = false,
    onDrawingModeChange,
    showToolbar = true,
    showProperties = false,
    className,
    testId,
    children,
    ...props
}) => {
    const { theme } = useTheme();
    const canvasRef = useRef(null);
    const [activeTool, setActiveTool] = useState('select');
    const [selectedOverlay, setSelectedOverlay] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentDrawing, setCurrentDrawing] = useState(null);
    const [drawingProperties, setDrawingProperties] = useState({
        color: DEFAULT_COLORS[0],
        lineWidth: 2,
        lineStyle: 'solid',
        fillColor: 'transparent',
        fontSize: 14,
        fontWeight: 'normal'
    });
    const [showPropertiesPanel, setShowPropertiesPanel] = useState(showProperties);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = rect.width * pixelRatio;
        canvas.height = rect.height * pixelRatio;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(pixelRatio, pixelRatio);

        renderOverlays();
    }, [overlays, selectedOverlay, currentDrawing]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!drawingMode) return;

            const { key, ctrlKey, altKey } = event;

            if (ctrlKey || altKey) return;

            // Find tool by shortcut
            const allTools = DRAWING_TOOLS.flatMap(group => group.tools);
            const tool = allTools.find(t => t.shortcut.toLowerCase() === key.toLowerCase());

            if (tool) {
                event.preventDefault();
                setActiveTool(tool.key);
            }

            // Other shortcuts
            switch (key) {
                case 'Escape':
                    event.preventDefault();
                    setActiveTool('select');
                    setSelectedOverlay(null);
                    setCurrentDrawing(null);
                    break;
                case 'Delete':
                case 'Backspace':
                    event.preventDefault();
                    if (selectedOverlay && onOverlayRemove) {
                        onOverlayRemove(selectedOverlay.id);
                        setSelectedOverlay(null);
                    }
                    break;
                default:
                    break;
            }
        };

        if (drawingMode) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [drawingMode, selectedOverlay, onOverlayRemove]);

    // Get mouse position relative to canvas
    const getMousePosition = useCallback((event) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }, []);

    // Convert canvas coordinates to data coordinates
    const canvasToDataCoords = useCallback((canvasX, canvasY) => {
        if (!data.length) return { x: 0, y: 0 };

        // This would need to be integrated with the chart's scale functions
        // For now, return normalized coordinates
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: (canvasX / rect.width) * data.length,
            y: canvasY / rect.height
        };
    }, [data]);

    // Handle mouse down
    const handleMouseDown = useCallback((event) => {
        if (!drawingMode || activeTool === 'select' || activeTool === 'pan') return;

        const position = getMousePosition(event);
        const dataCoords = canvasToDataCoords(position.x, position.y);

        setIsDrawing(true);
        setCurrentDrawing({
            id: `overlay_${Date.now()}`,
            type: activeTool,
            startX: position.x,
            startY: position.y,
            endX: position.x,
            endY: position.y,
            dataStartX: dataCoords.x,
            dataStartY: dataCoords.y,
            dataEndX: dataCoords.x,
            dataEndY: dataCoords.y,
            properties: { ...drawingProperties }
        });
    }, [drawingMode, activeTool, getMousePosition, canvasToDataCoords, drawingProperties]);

    // Handle mouse move
    const handleMouseMove = useCallback((event) => {
        if (!isDrawing || !currentDrawing) return;

        const position = getMousePosition(event);
        const dataCoords = canvasToDataCoords(position.x, position.y);

        setCurrentDrawing(prev => ({
            ...prev,
            endX: position.x,
            endY: position.y,
            dataEndX: dataCoords.x,
            dataEndY: dataCoords.y
        }));
    }, [isDrawing, currentDrawing, getMousePosition, canvasToDataCoords]);

    // Handle mouse up
    const handleMouseUp = useCallback(() => {
        if (!isDrawing || !currentDrawing) return;

        setIsDrawing(false);

        // Check if drawing has meaningful size
        const hasSize = Math.abs(currentDrawing.endX - currentDrawing.startX) > 5 ||
            Math.abs(currentDrawing.endY - currentDrawing.startY) > 5;

        if (hasSize || currentDrawing.type === 'text') {
            if (onOverlayAdd) {
                onOverlayAdd(currentDrawing);
            }
        }

        setCurrentDrawing(null);
    }, [isDrawing, currentDrawing, onOverlayAdd]);

    // Handle tool selection
    const handleToolSelect = useCallback((toolKey) => {
        setActiveTool(toolKey);
        if (toolKey !== 'select') {
            setSelectedOverlay(null);
        }
    }, []);

    // Handle overlay click for selection
    const handleOverlayClick = useCallback((overlay, event) => {
        event.stopPropagation();
        if (activeTool === 'select') {
            setSelectedOverlay(overlay);
            setShowPropertiesPanel(true);
        }
    }, [activeTool]);

    // Render overlays on canvas
    const renderOverlays = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        ctx.clearRect(0, 0, rect.width, rect.height);

        // Render existing overlays
        overlays.forEach(overlay => {
            renderOverlay(ctx, overlay, overlay.id === selectedOverlay?.id);
        });

        // Render current drawing
        if (currentDrawing) {
            renderOverlay(ctx, currentDrawing, false);
        }
    }, [overlays, selectedOverlay, currentDrawing]);

    // Render individual overlay
    const renderOverlay = useCallback((ctx, overlay, isSelected) => {
        ctx.save();

        // Set drawing properties
        ctx.strokeStyle = overlay.properties?.color || drawingProperties.color;
        ctx.lineWidth = (overlay.properties?.lineWidth || drawingProperties.lineWidth) + (isSelected ? 1 : 0);
        ctx.fillStyle = overlay.properties?.fillColor || drawingProperties.fillColor;

        // Set line style
        const lineStyle = overlay.properties?.lineStyle || drawingProperties.lineStyle;
        if (lineStyle === 'dashed') {
            ctx.setLineDash([5, 5]);
        } else if (lineStyle === 'dotted') {
            ctx.setLineDash([2, 2]);
        }

        switch (overlay.type) {
            case 'trendline':
            case 'ray':
                ctx.beginPath();
                ctx.moveTo(overlay.startX, overlay.startY);
                if (overlay.type === 'ray') {
                    // Extend ray to edge of canvas
                    const dx = overlay.endX - overlay.startX;
                    const dy = overlay.endY - overlay.startY;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const extendedX = overlay.startX + (dx / length) * 1000;
                    const extendedY = overlay.startY + (dy / length) * 1000;
                    ctx.lineTo(extendedX, extendedY);
                } else {
                    ctx.lineTo(overlay.endX, overlay.endY);
                }
                ctx.stroke();
                break;

            case 'horizontal':
                ctx.beginPath();
                ctx.moveTo(0, overlay.startY);
                ctx.lineTo(canvasRef.current.width, overlay.startY);
                ctx.stroke();
                break;

            case 'vertical':
                ctx.beginPath();
                ctx.moveTo(overlay.startX, 0);
                ctx.lineTo(overlay.startX, canvasRef.current.height);
                ctx.stroke();
                break;

            case 'rectangle':
                const rectWidth = overlay.endX - overlay.startX;
                const rectHeight = overlay.endY - overlay.startY;

                if (overlay.properties?.fillColor && overlay.properties.fillColor !== 'transparent') {
                    ctx.fillRect(overlay.startX, overlay.startY, rectWidth, rectHeight);
                }
                ctx.strokeRect(overlay.startX, overlay.startY, rectWidth, rectHeight);
                break;

            case 'circle':
                const radius = Math.sqrt(
                    Math.pow(overlay.endX - overlay.startX, 2) +
                    Math.pow(overlay.endY - overlay.startY, 2)
                );
                ctx.beginPath();
                ctx.arc(overlay.startX, overlay.startY, radius, 0, 2 * Math.PI);
                if (overlay.properties?.fillColor && overlay.properties.fillColor !== 'transparent') {
                    ctx.fill();
                }
                ctx.stroke();
                break;

            case 'fibonacci':
                renderFibonacci(ctx, overlay);
                break;

            case 'text':
                ctx.font = `${overlay.properties?.fontWeight || 'normal'} ${overlay.properties?.fontSize || 14}px Arial`;
                ctx.fillStyle = overlay.properties?.color || drawingProperties.color;
                ctx.fillText(overlay.text || 'Text', overlay.startX, overlay.startY);
                break;

            default:
                break;
        }

        // Draw selection handles
        if (isSelected) {
            drawSelectionHandles(ctx, overlay);
        }

        ctx.restore();
    }, [drawingProperties]);

    // Render Fibonacci retracement
    const renderFibonacci = useCallback((ctx, overlay) => {
        const startX = overlay.startX;
        const startY = overlay.startY;
        const endX = overlay.endX;
        const endY = overlay.endY;

        FIBONACCI_LEVELS.forEach(level => {
            const y = startY + (endY - startY) * level;

            ctx.beginPath();
            ctx.moveTo(Math.min(startX, endX), y);
            ctx.lineTo(Math.max(startX, endX), y);
            ctx.stroke();

            // Draw level label
            ctx.fillStyle = overlay.properties?.color || drawingProperties.color;
            ctx.font = '12px Arial';
            ctx.fillText(`${(level * 100).toFixed(1)}%`, Math.max(startX, endX) + 5, y + 4);
        });
    }, [drawingProperties]);

    // Draw selection handles
    const drawSelectionHandles = useCallback((ctx, overlay) => {
        const handleSize = 6;
        ctx.fillStyle = theme.color.primary[500];
        ctx.strokeStyle = theme.color.background.primary;
        ctx.lineWidth = 1;

        const handles = [
            { x: overlay.startX, y: overlay.startY },
            { x: overlay.endX, y: overlay.endY }
        ];

        handles.forEach(handle => {
            ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
        });
    }, [theme]);

    // Handle property change
    const handlePropertyChange = useCallback((property, value) => {
        setDrawingProperties(prev => ({
            ...prev,
            [property]: value
        }));

        if (selectedOverlay && onOverlayUpdate) {
            const updatedOverlay = {
                ...selectedOverlay,
                properties: {
                    ...selectedOverlay.properties,
                    [property]: value
                }
            };
            onOverlayUpdate(updatedOverlay);
        }
    }, [selectedOverlay, onOverlayUpdate]);

    return (
        <OverlaySystemContainer className={className} data-testid={testId} {...props}>
            {children}

            <DrawingCanvas
                ref={canvasRef}
                width={width}
                height={height}
                drawingMode={drawingMode}
                activeTool={activeTool}
                theme={theme}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />

            {showToolbar && drawingMode && (
                <DrawingToolbar theme={theme} {...animationPresets.slideDown}>
                    {DRAWING_TOOLS.map(group => (
                        <ToolGroup key={group.group} theme={theme}>
                            {group.tools.map(tool => (
                                <ToolButton
                                    key={tool.key}
                                    active={activeTool === tool.key}
                                    onClick={() => handleToolSelect(tool.key)}
                                    title={`${tool.label} (${tool.shortcut})`}
                                    theme={theme}
                                    {...hoverEffects.buttonSecondary}
                                >
                                    <Icon name={tool.icon} size="sm" />
                                </ToolButton>
                            ))}
                        </ToolGroup>
                    ))}
                </DrawingToolbar>
            )}

            <AnimatePresence>
                {showPropertiesPanel && (selectedOverlay || activeTool !== 'select') && (
                    <PropertiesPanel theme={theme} {...animationPresets.slideLeft}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing[3] }}>
                            <Label size="md" weight="semibold">
                                {selectedOverlay ? 'Overlay Properties' : 'Drawing Properties'}
                            </Label>
                            <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setShowPropertiesPanel(false)}
                                leftIcon={<Icon name="x" />}
                            />
                        </div>

                        <FormGroup>
                            <Field label="Color">
                                <ColorPicker theme={theme}>
                                    {DEFAULT_COLORS.map(color => (
                                        <ColorOption
                                            key={color}
                                            color={color}
                                            selected={drawingProperties.color === color}
                                            onClick={() => handlePropertyChange('color', color)}
                                        />
                                    ))}
                                </ColorPicker>
                            </Field>

                            <Field label="Line Width">
                                <Input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={drawingProperties.lineWidth}
                                    onChange={(e) => handlePropertyChange('lineWidth', parseInt(e.target.value))}
                                />
                            </Field>

                            <Field label="Line Style">
                                <select
                                    value={drawingProperties.lineStyle}
                                    onChange={(e) => handlePropertyChange('lineStyle', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: theme.spacing[2],
                                        borderRadius: theme.borderRadius.md,
                                        border: `1px solid ${theme.color.border.primary}`,
                                        background: theme.color.background.primary,
                                        color: theme.color.text.primary
                                    }}
                                >
                                    <option value="solid">Solid</option>
                                    <option value="dashed">Dashed</option>
                                    <option value="dotted">Dotted</option>
                                </select>
                            </Field>

                            {(activeTool === 'rectangle' || activeTool === 'circle') && (
                                <Field label="Fill Color">
                                    <ColorPicker theme={theme}>
                                        <ColorOption
                                            color="transparent"
                                            selected={drawingProperties.fillColor === 'transparent'}
                                            onClick={() => handlePropertyChange('fillColor', 'transparent')}
                                            style={{ background: 'transparent', border: `2px solid ${theme.color.border.primary}` }}
                                        />
                                        {DEFAULT_COLORS.map(color => (
                                            <ColorOption
                                                key={color}
                                                color={color + '40'}
                                                selected={drawingProperties.fillColor === color + '40'}
                                                onClick={() => handlePropertyChange('fillColor', color + '40')}
                                            />
                                        ))}
                                    </ColorPicker>
                                </Field>
                            )}

                            {activeTool === 'text' && (
                                <>
                                    <Field label="Font Size">
                                        <Input
                                            type="number"
                                            min="8"
                                            max="48"
                                            value={drawingProperties.fontSize}
                                            onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
                                        />
                                    </Field>
                                    <Field label="Font Weight">
                                        <select
                                            value={drawingProperties.fontWeight}
                                            onChange={(e) => handlePropertyChange('fontWeight', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: theme.spacing[2],
                                                borderRadius: theme.borderRadius.md,
                                                border: `1px solid ${theme.color.border.primary}`,
                                                background: theme.color.background.primary,
                                                color: theme.color.text.primary
                                            }}
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="bold">Bold</option>
                                        </select>
                                    </Field>
                                </>
                            )}
                        </FormGroup>

                        {selectedOverlay && (
                            <div style={{ marginTop: theme.spacing[4], paddingTop: theme.spacing[3], borderTop: `1px solid ${theme.color.border.primary}` }}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (onOverlayRemove) {
                                            onOverlayRemove(selectedOverlay.id);
                                            setSelectedOverlay(null);
                                        }
                                    }}
                                    leftIcon={<Icon name="trash-2" />}
                                    style={{ width: '100%' }}
                                >
                                    Delete Overlay
                                </Button>
                            </div>
                        )}
                    </PropertiesPanel>
                )}
            </AnimatePresence>
        </OverlaySystemContainer>
    );
};

export default ChartOverlaySystem;