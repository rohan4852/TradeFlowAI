import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../../../ThemeProvider';
import { RealTimeDataProvider } from '../../../providers/RealTimeDataProvider';
import AlertsWidget from '../AlertsWidget';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock providers
const mockRealTimeData = {
    isConnected: true,
    getPrice: jest.fn((symbol) => ({
        price: symbol === 'AAPL' ? 155.00 : 2750.00,
        change: symbol === 'AAPL' ? 5.00 : -50.00,
        changePercent: symbol === 'AAPL' ? 3.33 : -1.79,
        volume: symbol === 'AAPL' ? 1000000 : 500000,
    })),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
};

const MockProviders = ({ children }) => (
    <ThemeProvider>
        <RealTimeDataProvider value={mockRealTimeData}>
            {children}
        </RealTimeDataProvider>
    </ThemeProvider>
);

describe('AlertsWidget', () => {
    const mockAlerts = [
        {
            id: '1',
            symbol: 'AAPL',
            type: 'price',
            condition: 'above',
            value: 160.00,
            message: 'AAPL price alert',
            enabled: true,
            createdAt: '2024-01-15T10:00:00Z'
        },
        {
            id: '2',
            symbol: 'GOOGL',
            type: 'volume',
            condition: 'below',
            value: 400000,
            message: '',
            enabled: false,
            createdAt: '2024-01-15T09:00:00Z'
        }
    ];

    const mockSymbols = ['AAPL', 'GOOGL', 'MSFT'];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders alerts widget with alerts', () => {
        render(
            <MockProviders>
                <AlertsWidget alerts={mockAlerts} symbols={mockSymbols} />
            </MockProviders>
        );

        expect(screen.getByText('Trading Alerts')).toBeInTheDocument();
        expect(screen.getByText('AAPL')).toBeInTheDocument();
        expect(screen.getByText('GOOGL')).toBeInTheDocument();
        expect(screen.getByText('2 alerts')).toBeInTheDocument();
    });

    it('displays alert details correctly', () => {
        render(
            <MockProviders>
                <AlertsWidget alerts={mockAlerts} symbols={mockSymbols} />
            </MockProviders>
        );

        // Check AAPL alert
        expect(screen.getByText('Alert when price goes above $160.00')).toBeInTheDocument();
        expect(screen.getByText('Message: AAPL price alert')).toBeInTheDocument();

        // Check GOOGL alert
        expect(screen.getByText('Alert when volume goes below 400,000')).toBeInTheDocument();
    });

    it('shows create alert form when requested', () => {
        render(
            <MockProviders>
                <AlertsWidget
                    alerts={mockAlerts}
                    symbols={mockSymbols}
                    showCreateForm={true}
                />
            </MockProviders>
        );

        expect(screen.getByText('Create New Alert')).toBeInTheDocument();
        expect(screen.getByText('Symbol')).toBeInTheDocument();
        expect(screen.getByText('Alert Type')).toBeInTheDocument();
    });

    it('handles new alert button click', () => {
        const mockOnCreateAlert = jest.fn();

        render(
            <MockProviders>
                <AlertsWidget
                    alerts={mockAlerts}
                    symbols={mockSymbols}
                    onCreateAlert={mockOnCreateAlert}
                />
            </MockProviders>
        );

        fireEvent.click(screen.getByText('New Alert'));
        expect(screen.getByText('Create New Alert')).toBeInTheDocument();
    });

    it('handles alert form submission', () => {
        const mockOnCreateAlert = jest.fn();

        render(
            <MockProviders>
                <AlertsWidget
                    alerts={[]}
                    symbols={mockSymbols}
                    onCreateAlert={mockOnCreateAlert}
                    showCreateForm={true}
                />
            </MockProviders>
        );

        // Fill form
        const symbolSelect = screen.getByDisplayValue('');
        fireEvent.change(symbolSelect, { target: { value: 'AAPL' } });

        const valueInput = screen.getByPlaceholderText('Enter value');
        fireEvent.change(valueInput, { target: { value: '150' } });

        const messageInput = screen.getByPlaceholderText('Custom alert message');
        fireEvent.change(messageInput, { target: { value: 'Test alert' } });

        // Submit form
        fireEvent.click(screen.getByText('Create Alert'));

        expect(mockOnCreateAlert).toHaveBeenCalledWith(
            expect.objectContaining({
                symbol: 'AAPL',
                type: 'price',
                condition: 'above',
                value: 150,
                message: 'Test alert',
                enabled: true
            })
        );
    });

    it('handles alert form cancellation', () => {
        render(
            <MockProviders>
                <AlertsWidget
                    alerts={[]}
                    symbols={mockSymbols}
                    showCreateForm={true}
                />
            </MockProviders>
        );

        fireEvent.click(screen.getByText('Cancel'));
        expect(screen.queryByText('Create New Alert')).not.toBeInTheDocument();
    });

    it('calls onToggleAlert when alert is toggled', () => {
        const mockOnToggleAlert = jest.fn();

        render(
            <MockProviders>
                <AlertsWidget
                    alerts={mockAlerts}
                    symbols={mockSymbols}
                    onToggleAlert={mockOnToggleAlert}
                />
            </MockProviders>
        );

        const toggleButtons = screen.getAllByLabelText(/Disable alert|Enable alert/);
        fireEvent.click(toggleButtons[0]);

        expect(mockOnToggleAlert).toHaveBeenCalledWith('1');
    });

    it('calls onDeleteAlert when alert is deleted', () => {
        const mockOnDeleteAlert = jest.fn();

        render(
            <MockProviders>
                <AlertsWidget
                    alerts={mockAlerts}
                    symbols={mockSymbols}
                    onDeleteAlert={mockOnDeleteAlert}
                />
            </MockProviders>
        );

        const deleteButtons = screen.getAllByLabelText('Delete alert');
        fireEvent.click(deleteButtons[0]);

        expect(mockOnDeleteAlert).toHaveBeenCalledWith('1');
    });

    it('calls onUpdateAlert when alert is edited', () => {
        const mockOnUpdateAlert = jest.fn();

        render(
            <MockProviders>
                <AlertsWidget
                    alerts={mockAlerts}
                    symbols={mockSymbols}
                    onUpdateAlert={mockOnUpdateAlert}
                />
            </MockProviders>
        );

        const editButtons = screen.getAllByLabelText('Edit alert');
        fireEvent.click(editButtons[0]);

        expect(mockOnUpdateAlert).toHaveBeenCalledWith(mockAlerts[0]);
    });

    it('triggers alerts based on real-time data', async () => {
        const mockOnAlertTriggered = jest.fn();

        // Mock price that triggers the alert
        mockRealTimeData.getPrice.mockReturnValue({
            price: 165.00, // Above the 160.00 threshold
            volume: 1000000,
            changePercent: 3.33
        });

        render(
            <MockProviders>
                <AlertsWidget
                    alerts={mockAlerts}
                    symbols={mockSymbols}
                    onAlertTriggered={mockOnAlertTriggered}
                    realTime={true}
                />
            </MockProviders>
        );

        await waitFor(() => {
            expect(mockOnAlertTriggered).toHaveBeenCalledWith(
                mockAlerts[0],
                expect.objectContaining({ price: 165.00 })
            );
        });
    });

    it('shows triggered alert indicator', async () => {
        // Mock price that triggers the alert
        mockRealTimeData.getPrice.mockReturnValue({
            price: 165.00,
            volume: 1000000,
            changePercent: 3.33
        });

        render(
            <MockProviders>
                <AlertsWidget
                    alerts={mockAlerts}
                    symbols={mockSymbols}
                    realTime={true}
                />
            </MockProviders>
        );

        await waitFor(() => {
            expect(screen.getByText('(1 triggered)')).toBeInTheDocument();
        });
    });

    it('handles dismissing triggered alerts', async () => {
        // Mock price that triggers the alert
        mockRealTimeData.getPrice.mockReturnValue({
            price: 165.00,
            volume: 1000000,
            changePercent: 3.33
        });

        render(
            <MockProviders>
                <AlertsWidget
                    alerts={mockAlerts}
                    symbols={mockSymbols}
                    realTime={true}
                />
            </MockProviders>
        );

        await waitFor(() => {
            expect(screen.getByText('(1 triggered)')).toBeInTheDocument();
        });

        // Dismiss alert
        const dismissButton = screen.getByLabelText('Dismiss alert');
        fireEvent.click(dismissButton);

        expect(screen.queryByText('(1 triggered)')).not.toBeInTheDocument();
    });

    it('formats alert values correctly', () => {
        const alertsWithDifferentTypes = [
            { ...mockAlerts[0], type: 'price', value: 150.50 },
            { ...mockAlerts[1], type: 'volume', value: 1000000 },
            {
                id: '3',
                symbol: 'MSFT',
                type: 'change',
                condition: 'above',
                value: 5.5,
                enabled: true,
                createdAt: '2024-01-15T08:00:00Z'
            }
        ];

        render(
            <MockProviders>
                <AlertsWidget alerts={alertsWithDifferentTypes} symbols={mockSymbols} />
            </MockProviders>
        );

        expect(screen.getByText('Alert when price goes above $150.50')).toBeInTheDocument();
        expect(screen.getByText('Alert when volume goes below 1,000,000')).toBeInTheDocument();
        expect(screen.getByText('Alert when change goes above 5.5%')).toBeInTheDocument();
    });

    it('shows empty state when no alerts', () => {
        const mockOnCreateAlert = jest.fn();

        render(
            <MockProviders>
                <AlertsWidget
                    alerts={[]}
                    symbols={mockSymbols}
                    onCreateAlert={mockOnCreateAlert}
                />
            </MockProviders>
        );

        expect(screen.getByText('No alerts configured')).toBeInTheDocument();
        expect(screen.getByText('Create Your First Alert')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Create Your First Alert'));
        expect(screen.getByText('Create New Alert')).toBeInTheDocument();
    });

    it('handles different alert types in form', () => {
        render(
            <MockProviders>
                <AlertsWidget
                    alerts={[]}
                    symbols={mockSymbols}
                    showCreateForm={true}
                />
            </MockProviders>
        );

        const typeSelect = screen.getByDisplayValue('Price');

        // Change to volume
        fireEvent.change(typeSelect, { target: { value: 'volume' } });
        expect(screen.getByDisplayValue('Volume')).toBeInTheDocument();

        // Change to change
        fireEvent.change(typeSelect, { target: { value: 'change' } });
        expect(screen.getByDisplayValue('% Change')).toBeInTheDocument();
    });

    it('handles different alert conditions in form', () => {
        render(
            <MockProviders>
                <AlertsWidget
                    alerts={[]}
                    symbols={mockSymbols}
                    showCreateForm={true}
                />
            </MockProviders>
        );

        const conditionSelect = screen.getByDisplayValue('Above');

        // Change to below
        fireEvent.change(conditionSelect, { target: { value: 'below' } });
        expect(screen.getByDisplayValue('Below')).toBeInTheDocument();
    });

    it('validates form before submission', () => {
        const mockOnCreateAlert = jest.fn();

        render(
            <MockProviders>
                <AlertsWidget
                    alerts={[]}
                    symbols={mockSymbols}
                    onCreateAlert={mockOnCreateAlert}
                    showCreateForm={true}
                />
            </MockProviders>
        );

        // Try to submit without required fields
        fireEvent.click(screen.getByText('Create Alert'));

        // Should not call onCreateAlert
        expect(mockOnCreateAlert).not.toHaveBeenCalled();
    });

    it('does not trigger alerts when realTime is disabled', () => {
        const mockOnAlertTriggered = jest.fn();

        // Mock price that would trigger the alert
        mockRealTimeData.getPrice.mockReturnValue({
            price: 165.00,
            volume: 1000000,
            changePercent: 3.33
        });

        render(
            <MockProviders>
                <AlertsWidget
                    alerts={mockAlerts}
                    symbols={mockSymbols}
                    onAlertTriggered={mockOnAlertTriggered}
                    realTime={false}
                />
            </MockProviders>
        );

        // Should not trigger alerts
        expect(mockOnAlertTriggered).not.toHaveBeenCalled();
    });
});