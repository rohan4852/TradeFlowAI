import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import { DragDropProvider } from '../../providers/DragDropProvider';
import Widget from '../Widget';

const renderWithProviders = (component) => {
    return render(
        <ThemeProvider>
            <DragDropProvider>
                {component}
            </DragDropProvider>
        </ThemeProvider>
    );
};

describe('Widget', () => {
    it('renders widget with title and content', () => {
        renderWithProviders(
            <Widget id="test-widget" title="Test Widget">
                <div>Widget Content</div>
            </Widget>
        );

        expect(screen.getByText('Test Widget')).toBeInTheDocument();
        expect(screen.getByText('Widget Content')).toBeInTheDocument();
    });

    it('shows loading state', () => {
        renderWithProviders(
            <Widget id="test-widget" title="Test Widget" loading>
                <div>Widget Content</div>
            </Widget>
        );

        expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('handles remove action', () => {
        const handleRemove = jest.fn();
        renderWithProviders(
            <Widget
                id="test-widget"
                title="Test Widget"
                onRemove={handleRemove}
                removable
            >
                <div>Widget Content</div>
            </Widget>
        );

        const removeButton = screen.getByLabelText('Remove widget');
        fireEvent.click(removeButton);

        expect(handleRemove).toHaveBeenCalledWith('test-widget');
    });

    it('shows error state', () => {
        const error = { message: 'Something went wrong' };
        renderWithProviders(
            <Widget
                id="test-widget"
                title="Test Widget"
                error={error}
            >
                <div>Widget Content</div>
            </Widget>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.queryByText('Widget Content')).not.toBeInTheDocument();
    });
});