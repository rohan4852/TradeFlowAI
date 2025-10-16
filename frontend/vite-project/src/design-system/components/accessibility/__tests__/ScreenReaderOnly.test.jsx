import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import ScreenReaderOnly from '../ScreenReaderOnly';

const renderWithTheme = (component) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
};

describe('ScreenReaderOnly', () => {
    it('renders content that is visually hidden', () => {
        const { container } = renderWithTheme(
            <ScreenReaderOnly>Hidden content</ScreenReaderOnly>
        );

        const element = container.firstChild;
        const styles = window.getComputedStyle(element);

        expect(element).toHaveTextContent('Hidden content');
        expect(styles.position).toBe('absolute');
        expect(styles.width).toBe('1px');
        expect(styles.height).toBe('1px');
        expect(styles.overflow).toBe('hidden');
    });

    it('can render as different HTML elements', () => {
        const { container } = renderWithTheme(
            <ScreenReaderOnly as="div">Content</ScreenReaderOnly>
        );

        expect(container.firstChild.tagName).toBe('DIV');
    });

    it('passes through additional props', () => {
        const { container } = renderWithTheme(
            <ScreenReaderOnly data-testid="sr-only" className="custom-class">
                Content
            </ScreenReaderOnly>
        );

        const element = container.firstChild;
        expect(element).toHaveAttribute('data-testid', 'sr-only');
        expect(element).toHaveClass('custom-class');
    });

    it('is accessible to screen readers', () => {
        const { getByText } = renderWithTheme(
            <ScreenReaderOnly>Screen reader content</ScreenReaderOnly>
        );

        // Content should be in the DOM and accessible to screen readers
        expect(getByText('Screen reader content')).toBeInTheDocument();
    });
});