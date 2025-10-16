import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../ThemeProvider';
import { useRealTimeData } from '../../providers/RealTimeDataProvider';
import Widget from '../Widget';
import { Button, Icon, Label, Input } from '../../atoms';
import { FormGroup } from '../../molecules';
import {
    createGlassmorphism,
    tradingGlassPresets,
    animationPresets,
    getTradingColor
} from '../../../effects';

// Alerts container
const AlertsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

// Alert list
const AlertsList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
`;

// Alert item
const AlertItem = styled(motion.div)`
  ${props => tradingGlassPresets.card(props.theme)}
  padding: ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.borderRadius.md};
  border-left: 4px solid transparent;
  transition: all 0.2s ease;
  ${props => props.triggered && css`
    border-left-color: ${props.theme.color.warning[500]};
    background: ${props.theme.color.warning[50]};
    animation: pulse 2s infinite;
  `}
  ${props => props.type === 'price' && css`
    border-left-color: ${props.theme.color.primary[500]};
  `}
  ${props => props.type === 'volume' && css`
    border-left-color: ${props.theme.color.info[500]};
  `}
  ${props => props.type === 'change' && css`
    border-left-color: ${props.theme.color.success[500]};
  `}
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.boxShadow.sm};
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
`;

// Alert header
const AlertHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing[2]};
`;

// Alert content
const AlertContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

// Alert actions
const AlertActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
  margin-top: ${props => props.theme.spacing[2]};
`;

// Create alert form
const CreateAlertForm = styled(motion.div)`
  ${props => tradingGlassPresets.card(props.theme)}
  padding: ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing[3]};
`;

// Form row
const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[3]};
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Alert type badge
const AlertTypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  ${props => props.type === 'price' && css`
    background: ${props.theme.color.primary[100]};
    color: ${props.theme.color.primary[700]};
  `}
  ${props => props.type === 'volume' && css`
    background: ${props.theme.color.info[100]};
    color: ${props.theme.color.info[700]};
  `}
  ${props => props.type === 'change' && css`
    background: ${props.theme.color.success[100]};
    color: ${props.theme.color.success[700]};
  `}
`;

/**
 * AlertsWidget Component
 * Displays and manages customizable trading alerts
 */
const AlertsWidget = ({
    id = 'alerts-widget',
    title = 'Trading Alerts',
    alerts = [],
    symbols = [],
    realTime = true,
    showCreateForm = false,
    onCreateAlert,
    onUpdateAlert,
    onDeleteAlert,
    onToggleAlert,
    onAlertTriggered,
    ...props
}) => {
    const { theme } = useTheme();
    const { getPrice } = useRealTimeData();
    const [showForm, setShowForm] = useState(showCreateForm);
    const [formData, setFormData] = useState({
        symbol: '',
        type: 'price',
        condition: 'above',
        value: '',
        message: '',
        enabled: true
    });
    const [triggeredAlerts, setTriggeredAlerts] = useState(new Set());

    // Check alerts against current prices
    useEffect(() => {
        if (!realTime) return;

        alerts.forEach(alert => {
            if (!alert.enabled || triggeredAlerts.has(alert.id)) return;

            const currentPrice = getPrice(alert.symbol);
            if (!currentPrice) return;

            let triggered = false;
            const value = parseFloat(alert.value);

            switch (alert.type) {
                case 'price':
                    if (alert.condition === 'above' && currentPrice.price >= value) triggered = true;
                    if (alert.condition === 'below' && currentPrice.price <= value) triggered = true;
                    break;
                case 'volume':
                    if (alert.condition === 'above' && currentPrice.volume >= value) triggered = true;
                    if (alert.condition === 'below' && currentPrice.volume <= value) triggered = true;
                    break;
                case 'change':
                    if (alert.condition === 'above' && currentPrice.changePercent >= value) triggered = true;
                    if (alert.condition === 'below' && currentPrice.changePercent <= value) triggered = true;
                    break;
            }

            if (triggered) {
                setTriggeredAlerts(prev => new Set([...prev, alert.id]));
                onAlertTriggered?.(alert, currentPrice);
            }
        });
    }, [alerts, getPrice, realTime, triggeredAlerts, onAlertTriggered]);

    // Handle form submission
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (!formData.symbol || !formData.value) return;

        const newAlert = {
            id: Date.now().toString(),
            ...formData,
            value: parseFloat(formData.value),
            createdAt: new Date().toISOString()
        };

        onCreateAlert?.(newAlert);
        setFormData({
            symbol: '',
            type: 'price',
            condition: 'above',
            value: '',
            message: '',
            enabled: true
        });
        setShowForm(false);
    }, [formData, onCreateAlert]);

    // Handle form change
    const handleFormChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Format alert value
    const formatAlertValue = useCallback((alert) => {
        switch (alert.type) {
            case 'price':
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(alert.value);
            case 'volume':
                return alert.value.toLocaleString();
            case 'change':
                return `${alert.value}%`;
            default:
                return alert.value.toString();
        }
    }, []);

    // Get alert icon
    const getAlertIcon = useCallback((type) => {
        switch (type) {
            case 'price': return 'dollar-sign';
            case 'volume': return 'bar-chart-2';
            case 'change': return 'trending-up';
            default: return 'bell';
        }
    }, []);

    // Render create alert form
    const renderCreateForm = () => (
        <CreateAlertForm
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
        >
            <form onSubmit={handleSubmit}>
                <Label size="md" weight="semibold" style={{ marginBottom: theme.spacing[3] }}>
                    Create New Alert
                </Label>

                <FormRow>
                    <FormGroup label="Symbol">
                        <select
                            value={formData.symbol}
                            onChange={(e) => handleFormChange('symbol', e.target.value)}
                            style={{
                                width: '100%',
                                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                                borderRadius: theme.borderRadius.md,
                                border: `1px solid ${theme.color.border.primary}`,
                                background: theme.color.background.primary,
                                color: theme.color.text.primary
                            }}
                            required
                        >
                            <option value="">Select Symbol</option>
                            {symbols.map(symbol => (
                                <option key={symbol} value={symbol}>{symbol}</option>
                            ))}
                        </select>
                    </FormGroup>

                    <FormGroup label="Alert Type">
                        <select
                            value={formData.type}
                            onChange={(e) => handleFormChange('type', e.target.value)}
                            style={{
                                width: '100%',
                                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                                borderRadius: theme.borderRadius.md,
                                border: `1px solid ${theme.color.border.primary}`,
                                background: theme.color.background.primary,
                                color: theme.color.text.primary
                            }}
                        >
                            <option value="price">Price</option>
                            <option value="volume">Volume</option>
                            <option value="change">% Change</option>
                        </select>
                    </FormGroup>
                </FormRow>

                <FormRow>
                    <FormGroup label="Condition">
                        <select
                            value={formData.condition}
                            onChange={(e) => handleFormChange('condition', e.target.value)}
                            style={{
                                width: '100%',
                                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                                borderRadius: theme.borderRadius.md,
                                border: `1px solid ${theme.color.border.primary}`,
                                background: theme.color.background.primary,
                                color: theme.color.text.primary
                            }}
                        >
                            <option value="above">Above</option>
                            <option value="below">Below</option>
                        </select>
                    </FormGroup>

                    <FormGroup label="Value">
                        <Input
                            type="number"
                            step="0.01"
                            value={formData.value}
                            onChange={(e) => handleFormChange('value', e.target.value)}
                            placeholder="Enter value"
                            required
                        />
                    </FormGroup>
                </FormRow>

                <FormGroup label="Message (Optional)">
                    <Input
                        value={formData.message}
                        onChange={(e) => handleFormChange('message', e.target.value)}
                        placeholder="Custom alert message"
                    />
                </FormGroup>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                        <input
                            type="checkbox"
                            checked={formData.enabled}
                            onChange={(e) => handleFormChange('enabled', e.target.checked)}
                        />
                        <Label size="sm">Enable alert</Label>
                    </label>

                    <div style={{ display: 'flex', gap: theme.spacing[2] }}>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            Create Alert
                        </Button>
                    </div>
                </div>
            </form>
        </CreateAlertForm>
    );

    // Render alert item
    const renderAlertItem = (alert, index) => {
        const isTriggered = triggeredAlerts.has(alert.id);

        return (
            <AlertItem
                key={alert.id}
                type={alert.type}
                triggered={isTriggered}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ ...animationPresets.normal, delay: index * 0.05 }}
            >
                <AlertHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                        <Icon name={getAlertIcon(alert.type)} size="sm" />
                        <div>
                            <Label size="md" weight="semibold">{alert.symbol}</Label>
                            <AlertTypeBadge type={alert.type}>
                                {alert.type}
                            </AlertTypeBadge>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[1] }}>
                        {isTriggered && (
                            <Icon name="alert-circle" size="sm" color={theme.color.warning[500]} />
                        )}
                        <Button
                            size="xs"
                            variant="ghost"
                            icon={alert.enabled ? 'eye' : 'eye-off'}
                            onClick={() => onToggleAlert?.(alert.id)}
                            aria-label={alert.enabled ? 'Disable alert' : 'Enable alert'}
                        />
                    </div>
                </AlertHeader>

                <AlertContent>
                    <Label size="sm" color={theme.color.text.secondary}>
                        Alert when {alert.type} goes {alert.condition} {formatAlertValue(alert)}
                    </Label>
                    {alert.message && (
                        <Label size="sm" color={theme.color.text.secondary}>
                            Message: {alert.message}
                        </Label>
                    )}
                    <Label size="xs" color={theme.color.text.tertiary}>
                        Created: {new Date(alert.createdAt).toLocaleDateString()}
                    </Label>
                </AlertContent>

                <AlertActions>
                    <Button
                        size="xs"
                        variant="ghost"
                        icon="edit-2"
                        onClick={() => onUpdateAlert?.(alert)}
                        aria-label="Edit alert"
                    />
                    <Button
                        size="xs"
                        variant="ghost"
                        icon="trash-2"
                        onClick={() => onDeleteAlert?.(alert.id)}
                        aria-label="Delete alert"
                    />
                    {isTriggered && (
                        <Button
                            size="xs"
                            variant="ghost"
                            icon="x"
                            onClick={() => setTriggeredAlerts(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(alert.id);
                                return newSet;
                            })}
                            aria-label="Dismiss alert"
                        />
                    )}
                </AlertActions>
            </AlertItem>
        );
    };

    // Widget configuration
    const renderConfig = ({ onClose }) => (
        <div>
            <Label size="md" weight="semibold" style={{ marginBottom: theme.spacing[3] }}>
                Alerts Settings
            </Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3] }}>
                <label>
                    <input
                        type="checkbox"
                        checked={realTime}
                        onChange={(e) => setRealTime(e.target.checked)}
                    />
                    <Label size="sm" style={{ marginLeft: theme.spacing[2] }}>
                        Real-time Alert Monitoring
                    </Label>
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={showCreateForm}
                        onChange={(e) => setShowForm(e.target.checked)}
                    />
                    <Label size="sm" style={{ marginLeft: theme.spacing[2] }}>
                        Show Create Form
                    </Label>
                </label>
            </div>
            <div style={{ marginTop: theme.spacing[4], textAlign: 'right' }}>
                <Button size="sm" onClick={onClose}>
                    Close
                </Button>
            </div>
        </div>
    );

    return (
        <Widget
            id={id}
            title={title}
            icon="bell"
            renderConfig={renderConfig}
            {...props}
        >
            <AlertsContainer>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing[3] }}>
                    <Label size="sm" color={theme.color.text.secondary}>
                        {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
                        {triggeredAlerts.size > 0 && ` (${triggeredAlerts.size} triggered)`}
                    </Label>
                    {onCreateAlert && (
                        <Button
                            size="sm"
                            variant="primary"
                            icon="plus"
                            onClick={() => setShowForm(!showForm)}
                        >
                            New Alert
                        </Button>
                    )}
                </div>

                <AnimatePresence>
                    {showForm && renderCreateForm()}
                </AnimatePresence>

                <AlertsList>
                    <AnimatePresence>
                        {alerts.length > 0 ? (
                            alerts.map((alert, index) => renderAlertItem(alert, index))
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: theme.spacing[6],
                                color: theme.color.text.secondary
                            }}>
                                <Icon name="bell" size="lg" />
                                <Label size="sm" style={{ marginTop: theme.spacing[2] }}>
                                    No alerts configured
                                </Label>
                                {onCreateAlert && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowForm(true)}
                                        style={{ marginTop: theme.spacing[2] }}
                                    >
                                        Create Your First Alert
                                    </Button>
                                )}
                            </div>
                        )}
                    </AnimatePresence>
                </AlertsList>
            </AlertsContainer>
        </Widget>
    );
};

export default AlertsWidget;