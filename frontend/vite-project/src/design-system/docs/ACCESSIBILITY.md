# Accessibility Guide

## Overview

The Superior UI Design System is built with accessibility as a core principle. All components are designed to meet WCAG 2.1 AA standards and provide an inclusive experience for users with disabilities.

## Accessibility Features

### Built-in Accessibility

- **WCAG 2.1 AA Compliance**: All components meet accessibility standards
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **High Contrast Mode**: Automatic adaptation to system preferences
- **Reduced Motion**: Respects user's motion preferences
- **Focus Management**: Logical focus order and visible focus indicators

## Component Accessibility

### Button Component

```jsx
import { Button } from '@superior-ui/design-system';

// Accessible button with proper ARIA attributes
<Button
  variant="primary"
  disabled={isLoading}
  aria-label="Buy Bitcoin at current market price"
  aria-describedby="price-info"
>
  {isLoading ? 'Processing...' : 'Buy BTC'}
</Button>

<div id="price-info" className="sr-only">
  Current price: $50,000 USD
</div>
```

### Order Book Component

```jsx
import { OrderBook } from '@superior-ui/design-system';

// Accessible order book with screen reader support
<OrderBook
  symbol="BTC/USD"
  aria-label="Bitcoin order book"
  aria-describedby="orderbook-description"
  announceUpdates={true}  // Announce price changes to screen readers
  keyboardNavigation={true}  // Enable keyboard navigation
/>

<div id="orderbook-description" className="sr-only">
  Live order book showing bid and ask prices for Bitcoin trading
</div>
```

### Chart Component

```jsx
import { CandlestickChart } from '@superior-ui/design-system';

// Accessible chart with alternative text representation
<CandlestickChart
  symbol="BTC/USD"
  aria-label="Bitcoin price chart"
  aria-describedby="chart-summary"
  enableKeyboardNavigation={true}
  provideSummary={true}  // Provides text summary of chart data
/>

<div id="chart-summary" className="sr-only">
  Bitcoin price chart showing current price of $50,000, up 2.5% from yesterday
</div>
```

### Form Components

```jsx
import { Input, Label, FormGroup } from '@superior-ui/design-system';

// Accessible form with proper labeling
<FormGroup>
  <Label htmlFor="amount-input" required>
    Amount to Trade
  </Label>
  <Input
    id="amount-input"
    type="number"
    min="0"
    step="0.01"
    aria-describedby="amount-help amount-error"
    aria-invalid={hasError}
    required
  />
  <div id="amount-help" className="help-text">
    Enter the amount in USD
  </div>
  {hasError && (
    <div id="amount-error" className="error-text" role="alert">
      Please enter a valid amount
    </div>
  )}
</FormGroup>
```

## Keyboard Navigation

### Navigation Patterns

```jsx
// Tab order and keyboard shortcuts
const KeyboardShortcuts = {
  // Global shortcuts
  'Alt + 1': 'Focus order book',
  'Alt + 2': 'Focus chart',
  'Alt + 3': 'Focus portfolio',
  
  // Order book navigation
  'Arrow Up/Down': 'Navigate price levels',
  'Enter': 'Select price level',
  'Escape': 'Exit order book',
  
  // Chart navigation
  'Arrow Left/Right': 'Navigate time periods',
  'Plus/Minus': 'Zoom in/out',
  'Home/End': 'Go to start/end of data'
};

// Implementing keyboard navigation
function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Handle global shortcuts
      if (event.altKey && event.key === '1') {
        document.getElementById('order-book')?.focus();
      }
      // ... other shortcuts
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

### Focus Management

```jsx
import { useFocusManagement } from '@superior-ui/design-system';

function TradingModal({ isOpen, onClose }) {
  const { trapFocus, restoreFocus } = useFocusManagement();
  
  useEffect(() => {
    if (isOpen) {
      trapFocus(); // Trap focus within modal
    } else {
      restoreFocus(); // Restore focus to trigger element
    }
  }, [isOpen]);
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <h2 id="modal-title">Place Order</h2>
      <p id="modal-description">Enter your order details</p>
      {/* Modal content */}
    </div>
  );
}
```

## Screen Reader Support

### ARIA Labels and Descriptions

```jsx
// Comprehensive ARIA labeling
<div
  role="region"
  aria-label="Trading dashboard"
  aria-describedby="dashboard-description"
>
  <div id="dashboard-description" className="sr-only">
    Real-time trading interface with order book, price chart, and portfolio information
  </div>
  
  <section
    aria-label="Order book"
    aria-live="polite"  // Announce updates
    aria-atomic="false" // Only announce changes
  >
    <h2>Order Book</h2>
    <table
      role="table"
      aria-label="Bid and ask orders"
      aria-describedby="orderbook-help"
    >
      <caption className="sr-only">
        Current bid and ask orders for Bitcoin
      </caption>
      <thead>
        <tr>
          <th scope="col">Price (USD)</th>
          <th scope="col">Size (BTC)</th>
          <th scope="col">Total (USD)</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id}>
            <td aria-label={`Price ${order.price} dollars`}>
              {formatPrice(order.price)}
            </td>
            <td aria-label={`Size ${order.size} bitcoin`}>
              {formatSize(order.size)}
            </td>
            <td aria-label={`Total ${order.total} dollars`}>
              {formatPrice(order.total)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
</div>
```

### Live Regions for Updates

```jsx
import { useLiveRegion } from '@superior-ui/design-system';

function PriceDisplay({ symbol, price, change }) {
  const { announce } = useLiveRegion();
  
  useEffect(() => {
    // Announce significant price changes
    if (Math.abs(change) > 0.05) { // 5% change
      const direction = change > 0 ? 'increased' : 'decreased';
      announce(
        `${symbol} price ${direction} to ${formatPrice(price)}, ${formatPercentage(change)} change`,
        'polite'
      );
    }
  }, [price, change]);
  
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${symbol} current price`}
    >
      <span className="price">{formatPrice(price)}</span>
      <span 
        className={`change ${change >= 0 ? 'positive' : 'negative'}`}
        aria-label={`${change >= 0 ? 'up' : 'down'} ${formatPercentage(Math.abs(change))}`}
      >
        {formatPercentage(change)}
      </span>
    </div>
  );
}
```

## Color and Contrast

### High Contrast Support

```jsx
import { useTheme, useHighContrast } from '@superior-ui/design-system';

function AccessibleComponent() {
  const { theme } = useTheme();
  const { isHighContrast, contrastRatio } = useHighContrast();
  
  // Automatically adjust colors for high contrast
  const textColor = isHighContrast 
    ? theme.color.text.highContrast 
    : theme.color.text.primary;
    
  const backgroundColor = isHighContrast
    ? theme.color.background.highContrast
    : theme.color.background.primary;
  
  return (
    <div style={{
      color: textColor,
      backgroundColor: backgroundColor,
      border: isHighContrast ? '2px solid' : '1px solid'
    }}>
      Content with proper contrast ratio: {contrastRatio}
    </div>
  );
}
```

### Color-Blind Friendly Design

```jsx
// Using patterns and shapes in addition to color
function TradingIndicator({ type, value }) {
  const getIndicatorProps = (type) => {
    switch (type) {
      case 'bullish':
        return {
          color: '#10b981',
          icon: '▲',
          label: 'Bullish trend'
        };
      case 'bearish':
        return {
          color: '#ef4444',
          icon: '▼',
          label: 'Bearish trend'
        };
      default:
        return {
          color: '#6b7280',
          icon: '●',
          label: 'Neutral trend'
        };
    }
  };
  
  const { color, icon, label } = getIndicatorProps(type);
  
  return (
    <span
      style={{ color }}
      aria-label={label}
      title={label}
    >
      <span aria-hidden="true">{icon}</span>
      {value}
    </span>
  );
}
```

## Motion and Animation

### Reduced Motion Support

```jsx
import { useReducedMotion } from '@superior-ui/design-system';

function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();
  
  const animationProps = prefersReducedMotion
    ? {
        // No animations for users who prefer reduced motion
        transition: 'none',
        animation: 'none'
      }
    : {
        // Full animations for other users
        transition: 'all 0.3s ease',
        animation: 'fadeIn 0.5s ease-in-out'
      };
  
  return (
    <div style={animationProps}>
      Content with respectful animations
    </div>
  );
}
```

### Animation Controls

```jsx
function AccessibleAnimations() {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const prefersReducedMotion = useReducedMotion();
  
  // Respect system preference but allow user override
  const shouldAnimate = animationsEnabled && !prefersReducedMotion;
  
  return (
    <div>
      <button
        onClick={() => setAnimationsEnabled(!animationsEnabled)}
        aria-label={`${animationsEnabled ? 'Disable' : 'Enable'} animations`}
      >
        {animationsEnabled ? 'Disable' : 'Enable'} Animations
      </button>
      
      <div className={shouldAnimate ? 'animated' : 'static'}>
        Content with controllable animations
      </div>
    </div>
  );
}
```

## Testing Accessibility

### Automated Testing

```jsx
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <ThemeProvider>
        <OrderBook symbol="BTC/USD" />
      </ThemeProvider>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should have proper ARIA labels', () => {
    const { getByLabelText } = render(
      <Button aria-label="Buy Bitcoin">Buy BTC</Button>
    );
    
    expect(getByLabelText('Buy Bitcoin')).toBeInTheDocument();
  });
  
  it('should support keyboard navigation', () => {
    const { getByRole } = render(<OrderBook symbol="BTC/USD" />);
    const orderbook = getByRole('table');
    
    // Test keyboard navigation
    fireEvent.keyDown(orderbook, { key: 'ArrowDown' });
    // Assert focus moved correctly
  });
});