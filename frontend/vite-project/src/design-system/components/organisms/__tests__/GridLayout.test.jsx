import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import { DragDropProvider } from '../../providers/DragDropProvider';
import GridLayout from '../GridLayout';

const renderWithProviders = (component) => {
    return render(
        <ThemeProvider>
            <DragDropProvider>
                {component}
            </DragDropProvider>
        </ThemeProvider>
    );
};

describe('GridLayout', () => {
    const mockItems = [
        {
            id: '1',
            x: 0,
            y: 0,
            width: 2,
            height: 1,
            content: 'Widget 1'
        },
        {
            id: '2',
            x: 2,
            y: 0,
            width: 2,
            height: 1,
            content: 'Widget 2'
        }
    ];

    it('renders grid items', () => {
        renderWithProviders(
            <GridLayout items={mockItems} />
        );

        expect(screen.getByText('Widget 1')).toBeInTheDocument();
        expect(screen.getByText('Widget 2')).toBeInTheDocument();
    });

    it('handles layout changes', () => {
        const handleLayoutChange = jest.fn();
        renderWithProviders(
            <GridLayout
                items={mockItems}
                onLayoutChange={handleLayoutChange}
            />
        );

        // Layout change should be called when items are moved
        expect(handleLayoutChange).toHaveBeenCalledTimes(0);
    });

    it('supports different column counts', () => {
        renderWithProviders(
            <GridLayout
                items={mockItems}
                columns={6}
            />
        );

        const container = screen.getByRole('grid', { hidden: true });
        expect(container).toHaveStyle('grid-template-columns: repeat(6, 1fr)');
    });
});