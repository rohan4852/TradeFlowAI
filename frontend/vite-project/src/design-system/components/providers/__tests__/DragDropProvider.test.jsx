import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import { DragDropProvider, useDragDrop, useDraggable, useDropZone } from '../DragDropProvider';

// Test components
const DraggableItem = ({ item }) => {
    const dragProps = useDraggable(item);
    return (
        <div {...dragProps} data-testid={`draggable-${item.id}`}>
            {item.name}
        </div>
    );
};

const DropZone = ({ id, children }) => {
    const { ref, isDropTarget } = useDropZone(id);
    return (
        <div
            ref={ref}
            data-testid={`dropzone-${id}`}
            style={{ backgroundColor: isDropTarget ? 'lightblue' : 'white' }}
        >
            {children}
        </div>
    );
};

const TestApp = () => {
    const { isDragging } = useDragDrop();

    return (
        <div>
            <div data-testid="drag-status">
                {isDragging ? 'Dragging' : 'Not dragging'}
            </div>
            <DraggableItem item={{ id: '1', name: 'Item 1' }} />
            <DropZone id="zone1">Drop Zone 1</DropZone>
        </div>
    );
};

const renderWithProviders = (component) => {
    return render(
        <ThemeProvider>
            <DragDropProvider>
                {component}
            </DragDropProvider>
        </ThemeProvider>
    );
};

describe('DragDropProvider', () => {
    it('provides drag and drop context', () => {
        renderWithProviders(<TestApp />);

        expect(screen.getByTestId('drag-status')).toHaveTextContent('Not dragging');
        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Drop Zone 1')).toBeInTheDocument();
    });

    it('handles drag start', () => {
        renderWithProviders(<TestApp />);

        const draggableItem = screen.getByTestId('draggable-1');
        fireEvent.mouseDown(draggableItem);

        expect(screen.getByTestId('drag-status')).toHaveTextContent('Dragging');
    });

    it('handles drag end', () => {
        renderWithProviders(<TestApp />);

        const draggableItem = screen.getByTestId('draggable-1');
        fireEvent.mouseDown(draggableItem);
        fireEvent.mouseUp(document);

        expect(screen.getByTestId('drag-status')).toHaveTextContent('Not dragging');
    });
});