import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../ThemeProvider';
import { TechnicalIndicators, PREDEFINED_INDICATORS } from '../TechnicalIndicators';

const renderWithTheme = (component) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
};

describe('TechnicalIndicators', () => {
    const mockIndicators = {
        sma: { enabled: true, period: 20, color: '#ff6b6b' },
        ema: { enabled: false, period: 12, color: '#4ecdc4' },
        rsi: { enabled: true, period: 14, overbought: 70, oversold: 30 }
    };

    it('renders indicator controls', () => {
        renderWithTheme(
            <TechnicalIndicators
                indicators={mockIndicators}
                onIndicatorChange={jest.fn()}
            />
        );

        expect(screen.getByText('Technical Indicators')).toBeInTheDocument();
        expect(screen.getByText('SMA')).toBeInTheDocument();
        expect(screen.getByText('EMA')).toBeInTheDocument();
        expect(screen.getByText('RSI')).toBeInTheDocument();
    });

    it('handles indicator toggle', () => {
        const handleIndicatorChange = jest.fn();
        renderWithTheme(
            <TechnicalIndicators
                indicators={mockIndicators}
                onIndicatorChange={handleIndicatorChange}
            />
        );

        const emaToggle = screen.getByLabelText('Enable EMA');
        fireEvent.click(emaToggle);

        expect(handleIndicatorChange).toHaveBeenCalledWith('ema', {
            ...mockIndicators.ema,
            enabled: true
        });
    });

    it('handles parameter changes', () => {
        const handleIndicatorChange = jest.fn();
        renderWithTheme(
            <TechnicalIndicators
                indicators={mockIndicators}
                onIndicatorChange={handleIndicatorChange}
            />
        );

        const smaPeriodInput = screen.getByDisplayValue('20');
        fireEvent.change(smaPeriodInput, { target: { value: '50' } });

        expect(handleIndicatorChange).toHaveBeenCalledWith('sma', {
            ...mockIndicators.sma,
            period: 50
        });
    });

    it('shows color picker for indicators', () => {
        renderWithTheme(
            <TechnicalIndicators
                indicators={mockIndicators}
                onIndicatorChange={jest.fn()}
            />
        );

        const colorInputs = screen.getAllByDisplayValue(/#[0-9a-f]{6}/i);
        expect(colorInputs.length).toBeGreaterThan(0);
    });

    it('supports preset configurations', () => {
        renderWithTheme(
            <TechnicalIndicators
                indicators={mockIndicators}
                onIndicatorChange={jest.fn()}
                showPresets={true}
            />
        );

        expect(screen.getByText('Presets')).toBeInTheDocument();
    });
});

describe('PREDEFINED_INDICATORS', () => {
    it('contains expected indicator definitions', () => {
        expect(PREDEFINED_INDICATORS).toHaveProperty('sma');
        expect(PREDEFINED_INDICATORS).toHaveProperty('ema');
        expect(PREDEFINED_INDICATORS).toHaveProperty('rsi');
        expect(PREDEFINED_INDICATORS).toHaveProperty('macd');
        expect(PREDEFINED_INDICATORS).toHaveProperty('bollinger');
    });

    it('has proper indicator structure', () => {
        const sma = PREDEFINED_INDICATORS.sma;
        expect(sma).toHaveProperty('name');
        expect(sma).toHaveProperty('description');
        expect(sma).toHaveProperty('parameters');
        expect(sma).toHaveProperty('defaultValues');
    });
});