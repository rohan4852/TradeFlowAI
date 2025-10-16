/**
 * Drag and Drop Provider
 * Provides drag and drop functionality for components
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

const DragDropContext = createContext();

export const DragDropProvider = ({ children }) => {
    const [dragState, setDragState] = useState({
        isDragging: false,
        draggedItem: null,
        dropZones: new Map()
    });

    const startDrag = useCallback((item, options = {}) => {
        setDragState(prev => ({
            ...prev,
            isDragging: true,
            draggedItem: { ...item, ...options }
        }));
    }, []);

    const endDrag = useCallback(() => {
        setDragState(prev => ({
            ...prev,
            isDragging: false,
            draggedItem: null
        }));
    }, []);

    const registerDropZone = useCallback((id, config) => {
        setDragState(prev => ({
            ...prev,
            dropZones: new Map(prev.dropZones).set(id, config)
        }));
    }, []);

    const unregisterDropZone = useCallback((id) => {
        setDragState(prev => {
            const newDropZones = new Map(prev.dropZones);
            newDropZones.delete(id);
            return {
                ...prev,
                dropZones: newDropZones
            };
        });
    }, []);

    const contextValue = {
        ...dragState,
        startDrag,
        endDrag,
        registerDropZone,
        unregisterDropZone
    };

    return (
        <DragDropContext.Provider value={contextValue}>
            {children}
        </DragDropContext.Provider>
    );
};

export const useDragDrop = () => {
    const context = useContext(DragDropContext);
    if (!context) {
        throw new Error('useDragDrop must be used within a DragDropProvider');
    }
    return context;
};

export const useDraggable = (item, options = {}) => {
    const { startDrag, endDrag } = useDragDrop();

    const dragProps = {
        draggable: true,
        onDragStart: (e) => {
            startDrag(item, options);
            if (options.onDragStart) {
                options.onDragStart(e);
            }
        },
        onDragEnd: (e) => {
            endDrag();
            if (options.onDragEnd) {
                options.onDragEnd(e);
            }
        }
    };

    return { dragProps };
};

export const useDropZone = (id, config = {}) => {
    const { registerDropZone, unregisterDropZone, draggedItem } = useDragDrop();

    React.useEffect(() => {
        registerDropZone(id, config);
        return () => unregisterDropZone(id);
    }, [id, registerDropZone, unregisterDropZone]);

    const dropProps = {
        onDragOver: (e) => {
            e.preventDefault();
            if (config.onDragOver) {
                config.onDragOver(e, draggedItem);
            }
        },
        onDrop: (e) => {
            e.preventDefault();
            if (config.onDrop && draggedItem) {
                config.onDrop(e, draggedItem);
            }
        }
    };

    return { dropProps, draggedItem };
};

export default DragDropProvider;