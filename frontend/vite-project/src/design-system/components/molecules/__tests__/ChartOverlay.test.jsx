import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import ChartOverlay from '../ChartOverlay';

const renderWithTheme = (component) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
};

describe('ChartOverlay', () => {
    const mockDrawings = [
        {
            id: '1',
            type: 'trendline',
            points: [{ x: 100, y: 100 }, { x: 200, y: 150 }],
            style: { color: '#ff6b6b', width: 2 }
        },
        {
            id: '2',
            type: 'rectangle',
            points: [{ x: 50, y: 50 }, { x: 150, y: 100 }],
            style: { color: '#4ecdc4', width: 1, fill: 'transparent' }
        }
    ];

    it('renders overlay container', () => {
        renderWithTheme(
            <ChartOverlay
                drawings={mockDrawings}
                onDrawingComplete={jest.fn()}
            />
        );

        const overlay = screen.getByTestId('chart-overlay');
        expect(overlay).toBeInTheDocument();
    });

    it('handles drawing mode activation', () => {
        const handleDrawingModeChange = jest.fn();
        renderWithTheme(
            <ChartOverlay
                drawings={mockDrawings}
                drawingMode="trendline"
                onDrawingModeChange={handleDrawingModeChange}
                onDrawingComplete={jest.fn()}
            />
        );

        const overlay = screen.getByTestId('chart-overlay');
        expect(overlay).toHaveStyle('cursor: crosshair');
    });

    it('handles mouse events for drawing', () => {
        const handleDrawingComplete = jest.fn();
        renderWithTheme(
            <ChartOverlay
                drawings={[]}
                drawingMode="trendline"
                onDrawingComplete={handleDrawingComplete}
            />
        );

        const overlay = screen.getByTestId('chart-overlay');

        // Start drawing
        fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
        fireEvent.mouseMove(overlay, { clientX: 200, clientY: 150 });
        fireEvent.mouseUp(overlay, { clientX: 200, clientY: 150 });

        expect(handleDrawingComplete).toHaveBeenCalled();
    });

    it('renders existing drawings', () => {
        renderWithTheme(
            <ChartOverlay
                drawings={mockDrawings}
                onDrawingComplete={jest.fn()}
            />
        );

        const svgElements = screen.getAllByTestId(/drawing-/);
        expect(svgElements).toHaveLength(mockDrawings.length);
    });

    it('handles drawing selection', () => {
        const handleDrawingSelect = jest.fn();
        renderWithTheme(
            <ChartOverlay
                drawings={mockDrawings}
                onDrawingSelect={handleDrawingSelect}
                onDrawingComplete={jest.fn()}
            />
        );

        const firstDrawing = screen.getByTestId('drawing-1');
        fireEvent.click(firstDrawing);

        expect(handleDrawingSelect).toHaveBeenCalledWith('1');
    });

    it('handles drawing deletion', () => {
        const handleDrawingDelete = jest.fn();
        renderWithTheme(
            <ChartOverlay
                drawings={mockDrawings}
                selectedDrawing="1"
                onDrawingDelete={handleDrawingDelete}
                onDrawingComplete={jest.fn()}
            />
        );

        // Simulate delete key press
        fireEvent.keyDown(document, { key: 'Delete' });

        expect(handleDrawingDelete).toHaveBeenCalledWith('1');
    });

    it('supports different drawing tools', () => {
        const tools = ['trendline', 'rectangle', 'circle', 'arrow'];

        tools.forEach(tool => {
            const { rerender } = renderWithTheme(
                <ChartOverlay
                    drawings={[]}
                    drawingMode={tool}
                    onDrawingComplete={jest.fn()}
                />
            );

            const overlay = screen.getByTestId('chart-overlay');
            expect(overlay).toBeInTheDocument();

            rerender(
                <ThemeProvider>
                    <ChartOverlay
                        drawings={[]}
                        drawingMode={tool}
                        onDrawingComplete={jest.fn()}
                    />
                </ThemeProvider>
            );
        });
    });

    it('handles touch events for mobile', () => {
        const handleDrawingComplete = jest.fn();
        renderWithTheme(
            <ChartOverlay
                drawings={[]}
                drawingMode="trendline"
                onDrawingComplete={handleDrawingComplete}
            />
        );

        const overlay = screen.getByTestId('chart-overlay');

        // Simulate touch drawing
        fireEvent.touchStart(overlay, {
            touches: [{ clientX: 100, clientY: 100 }]
        });
        fireEvent.touchMove(overlay, {
            touches: [{ clientX: 200, clientY: 150 }]
        });
        fireEvent.touchEnd(overlay);

        expect(handleDrawingComplete).toHaveBeenCalled();
    });
});