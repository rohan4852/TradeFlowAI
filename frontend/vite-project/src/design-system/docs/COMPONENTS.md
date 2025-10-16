# Component Documentation

Comprehensive documentation for all design system components, organized by atomic design principles.

## Table of Contents

- [Atomic Components](#atomic-components)
  - [Button](#button)
  - [Input](#input)
  - [Icon](#icon)
  - [Label](#label)
- [Molecular Components](#molecular-components)
  - [Card](#card)
  - [FormGroup](#formgroup)
  - [Navigation](#navigation)
  - [ChartControls](#chartcontrols)
  - [ChartOverlay](#chartoverlay)
  - [TechnicalIndicators](#technicalindicators)
- [Organism Components](#organism-components)
  - [CandlestickChart](#candlestick-chart)
  - [OrderBook](#order-book)
- [Provider Components](#provider-components)
  - [RealTimeDataProvider](#real-time-data-provider)
- [Utility Components](#utility-components)
  - [ThemeProvider](#theme-provider)

---

## Atomic Components

### Button

A versatile button component with multiple variants, sizes, and states.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Button style variant |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Button size |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `loading` | `boolean` | `false` | Whether to show loading state |
| `fullWidth` | `boolean` | `false` | Whether button takes full width |
| `icon` | `string` | - | Icon name to display |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon position relative to text |
| `onClick` | `function` | - | Click event handler |
| `children` | `ReactNode` | - | Button content |

#### Usage

```jsx
import { Button } from '@/design-system';

// Basic usage
<Button onClick={() => console.log('clicked')}>
  Click me
</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// With sizes
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// With states
<Button disabled>Disabled</Button>
<Button loading>Loading</Button>

// With icons
<Button icon="plus">Add Item</Button>
<Button icon="download" iconPosition="right">Download</Button>

// Full width
<Button fullWidth>Full Width Button</Button>
```

#### Accessibility

- Supports keyboard navigation (Enter and Space keys)
- Proper ARIA attributes for screen readers
- Focus management and visual indicators
- Loading state announcements

---

### Input

A flexible input component supporting various types and validation states.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'search' \| 'tel' \| 'url'` | `'text'` | Input type |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Input size |
| `variant` | `'default' \| 'filled' \| 'flushed'` | `'default'` | Input style variant |
| `state` | `'default' \| 'error' \| 'success' \| 'warning'` | `'default'` | Validation state |
| `disabled` | `boolean` | `false` | Whether input is disabled |
| `readOnly` | `boolean` | `false` | Whether input is read-only |
| `required` | `boolean` | `false` | Whether input is required |
| `placeholder` | `string` | - | Placeholder text |
| `value` | `string` | - | Input value (controlled) |
| `defaultValue` | `string` | - | Default value (uncontrolled) |
| `onChange` | `function` | - | Change event handler |
| `onFocus` | `function` | - | Focus event handler |
| `onBlur` | `function` | - | Blur event handler |
| `leftIcon` | `string` | - | Icon on the left side |
| `rightIcon` | `string` | - | Icon on the right side |
| `leftElement` | `ReactNode` | - | Custom element on the left |
| `rightElement` | `ReactNode` | - | Custom element on the right |

#### Usage

```jsx
import { Input } from '@/design-system';

// Basic usage
<Input placeholder="Enter your name" />

// Controlled input
const [value, setValue] = useState('');
<Input 
  value={value} 
  onChange={(e) => setValue(e.target.value)} 
  placeholder="Controlled input"
/>

// With validation states
<Input state="error" placeholder="Error state" />
<Input state="success" placeholder="Success state" />
<Input state="warning" placeholder="Warning state" />

// With icons
<Input leftIcon="search" placeholder="Search..." />
<Input rightIcon="eye" type="password" placeholder="Password" />

// Different sizes
<Input size="sm" placeholder="Small input" />
<Input size="md" placeholder="Medium input" />
<Input size="lg" placeholder="Large input" />

// Different variants
<Input variant="default" placeholder="Default variant" />
<Input variant="filled" placeholder="Filled variant" />
<Input variant="flushed" placeholder="Flushed variant" />
```

---

### Icon

A comprehensive icon component supporting multiple icon libraries and custom SVGs.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | Icon name from the icon library |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| number` | `'md'` | Icon size |
| `color` | `string` | - | Icon color (CSS color value) |
| `library` | `'feather' \| 'heroicons' \| 'lucide'` | `'feather'` | Icon library to use |
| `customSvg` | `ReactNode` | - | Custom SVG element |
| `spin` | `boolean` | `false` | Whether icon should spin |
| `className` | `string` | - | Additional CSS classes |

#### Usage

```jsx
import { Icon } from '@/design-system';

// Basic usage
<Icon name="heart" />

// Different sizes
<Icon name="star" size="xs" />
<Icon name="star" size="sm" />
<Icon name="star" size="md" />
<Icon name="star" size="lg" />
<Icon name="star" size="xl" />
<Icon name="star" size={32} /> // Custom size in pixels

// With colors
<Icon name="heart" color="red" />
<Icon name="star" color="#FFD700" />

// Different libraries
<Icon name="heart" library="feather" />
<Icon name="heart" library="heroicons" />
<Icon name="heart" library="lucide" />

// Spinning icon
<Icon name="loader" spin />

// Custom SVG
<Icon customSvg={
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
  </svg>
} />
```

---

### Label

A text component for labels, captions, and descriptive text with various styling options.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Text size |
| `weight` | `'light' \| 'normal' \| 'medium' \| 'semibold' \| 'bold'` | `'normal'` | Font weight |
| `color` | `string` | - | Text color (CSS color value) |
| `align` | `'left' \| 'center' \| 'right' \| 'justify'` | `'left'` | Text alignment |
| `transform` | `'none' \| 'uppercase' \| 'lowercase' \| 'capitalize'` | `'none'` | Text transform |
| `truncate` | `boolean` | `false` | Whether to truncate long text |
| `noWrap` | `boolean` | `false` | Whether to prevent text wrapping |
| `as` | `string` | `'span'` | HTML element to render as |
| `htmlFor` | `string` | - | Associated form element ID |
| `children` | `ReactNode` | - | Label content |

#### Usage

```jsx
import { Label } from '@/design-system';

// Basic usage
<Label>Basic label</Label>

// Different sizes
<Label size="xs">Extra small text</Label>
<Label size="sm">Small text</Label>
<Label size="md">Medium text</Label>
<Label size="lg">Large text</Label>
<Label size="xl">Extra large text</Label>

// Different weights
<Label weight="light">Light text</Label>
<Label weight="normal">Normal text</Label>
<Label weight="medium">Medium text</Label>
<Label weight="semibold">Semibold text</Label>
<Label weight="bold">Bold text</Label>

// With colors
<Label color="red">Red text</Label>
<Label color="#007bff">Blue text</Label>

// Text alignment
<Label align="left">Left aligned</Label>
<Label align="center">Center aligned</Label>
<Label align="right">Right aligned</Label>

// Text transform
<Label transform="uppercase">Uppercase text</Label>
<Label transform="lowercase">Lowercase text</Label>
<Label transform="capitalize">Capitalized text</Label>

// Truncation
<Label truncate>This is a very long text that will be truncated...</Label>

// As form label
<Label htmlFor="email" weight="medium">Email Address</Label>

// Different HTML elements
<Label as="h1" size="xl" weight="bold">Heading</Label>
<Label as="p">Paragraph text</Label>
```

---

## Molecular Components

### Card

A flexible container component for grouping related content with various styling options.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'outlined' \| 'elevated' \| 'filled'` | `'default'` | Card style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Card size/padding |
| `interactive` | `boolean` | `false` | Whether card is clickable/hoverable |
| `disabled` | `boolean` | `false` | Whether card is disabled |
| `loading` | `boolean` | `false` | Whether to show loading state |
| `onClick` | `function` | - | Click event handler |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Card content |

#### Usage

```jsx
import { Card, Label, Button } from '@/design-system';

// Basic usage
<Card>
  <Label>Card content goes here</Label>
</Card>

// Different variants
<Card variant="default">Default card</Card>
<Card variant="outlined">Outlined card</Card>
<Card variant="elevated">Elevated card</Card>
<Card variant="filled">Filled card</Card>

// Interactive card
<Card interactive onClick={() => console.log('Card clicked')}>
  <Label>Clickable card</Label>
</Card>

// Different sizes
<Card size="sm">Small card</Card>
<Card size="md">Medium card</Card>
<Card size="lg">Large card</Card>

// With complex content
<Card variant="outlined" size="lg">
  <div style={{ padding: '1rem' }}>
    <Label size="lg" weight="bold">Card Title</Label>
    <Label color="gray" style={{ marginTop: '0.5rem' }}>
      Card description goes here
    </Label>
    <div style={{ marginTop: '1rem' }}>
      <Button size="sm">Action</Button>
    </div>
  </div>
</Card>
```

---

## Organism Components

### CandlestickChart

A high-performance candlestick chart component for financial data visualization with technical indicators and real-time updates.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `CandlestickData[]` | `[]` | Chart data array |
| `symbol` | `string` | - | Trading symbol for real-time data |
| `realTime` | `boolean` | `false` | Enable real-time data updates |
| `width` | `string \| number` | `'100%'` | Chart width |
| `height` | `string \| number` | `'400px'` | Chart height |
| `showControls` | `boolean` | `true` | Show chart controls |
| `showVolume` | `boolean` | `true` | Show volume bars |
| `showIndicators` | `boolean` | `true` | Show technical indicators |
| `indicators` | `object` | `{}` | Technical indicator configuration |
| `overlays` | `string[]` | `[]` | Chart overlays to display |
| `timeframe` | `string` | `'1D'` | Chart timeframe |
| `onTimeframeChange` | `function` | - | Timeframe change handler |
| `onIndicatorChange` | `function` | - | Indicator change handler |
| `onRealTimeUpdate` | `function` | - | Real-time update handler |
| `loading` | `boolean` | `false` | Loading state |

#### Usage

```jsx
import { CandlestickChart } from '@/design-system';

const chartData = [
  {
    timestamp: 1640995200000,
    open: 50000,
    high: 51000,
    low: 49500,
    close: 50500,
    volume: 1000
  },
  // ... more data
];

// Basic usage
<CandlestickChart data={chartData} />

// With real-time updates
<CandlestickChart 
  data={chartData}
  symbol="BTC/USD"
  realTime={true}
  onRealTimeUpdate={(update) => console.log('Price update:', update)}
/>

// With technical indicators
<CandlestickChart 
  data={chartData}
  showIndicators={true}
  indicators={{
    sma: { period: 20, color: '#ff6b6b' },
    ema: { period: 12, color: '#4ecdc4' },
    rsi: { period: 14, overbought: 70, oversold: 30 }
  }}
/>

// Custom size and timeframe
<CandlestickChart 
  data={chartData}
  width="800px"
  height="500px"
  timeframe="4H"
  onTimeframeChange={(tf) => console.log('Timeframe:', tf)}
/>
```

---

### OrderBook

A real-time order book component displaying bid/ask orders with depth visualization and live updates.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asks` | `OrderBookEntry[]` | `[]` | Ask orders (sell orders) |
| `bids` | `OrderBookEntry[]` | `[]` | Bid orders (buy orders) |
| `spread` | `number` | - | Current bid-ask spread |
| `symbol` | `string` | `'BTC/USD'` | Trading symbol |
| `realTime` | `boolean` | `false` | Enable real-time updates |
| `precision` | `number` | `2` | Price precision (decimal places) |
| `aggregationOptions` | `number[]` | `[0.01, 0.1, 1, 10]` | Price aggregation options |
| `defaultAggregation` | `number` | `0.01` | Default price aggregation |
| `maxDepth` | `number` | `25` | Maximum orders to display |
| `height` | `string` | `'600px'` | Component height |
| `showDepthBars` | `boolean` | `true` | Show depth visualization bars |
| `showCumulativeTotal` | `boolean` | `true` | Show cumulative totals |
| `onOrderClick` | `function` | - | Order click handler |
| `onRealTimeUpdate` | `function` | - | Real-time update handler |
| `loading` | `boolean` | `false` | Loading state |

#### Usage

```jsx
import { OrderBook } from '@/design-system';

const asks = [
  { price: 50100, size: 1.5, timestamp: Date.now() },
  { price: 50150, size: 2.0, timestamp: Date.now() },
  // ... more asks
];

const bids = [
  { price: 49900, size: 2.5, timestamp: Date.now() },
  { price: 49850, size: 1.8, timestamp: Date.now() },
  // ... more bids
];

// Basic usage
<OrderBook asks={asks} bids={bids} />

// With real-time updates
<OrderBook 
  asks={asks}
  bids={bids}
  symbol="BTC/USD"
  realTime={true}
  onRealTimeUpdate={(update) => console.log('Orderbook update:', update)}
/>

// Custom configuration
<OrderBook 
  asks={asks}
  bids={bids}
  precision={4}
  maxDepth={50}
  aggregationOptions={[0.001, 0.01, 0.1, 1]}
  defaultAggregation={0.01}
  onOrderClick={(order) => console.log('Order clicked:', order)}
/>
```

---

## Provider Components

### RealTimeDataProvider

A React context provider for managing real-time data streams with WebSocket connections, automatic reconnection, and data distribution.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `wsUrl` | `string` | `'wss://api.example.com/ws'` | WebSocket server URL |
| `autoConnect` | `boolean` | `true` | Connect automatically on mount |
| `reconnectInterval` | `number` | `5000` | Reconnection delay (ms) |
| `maxReconnectAttempts` | `number` | `10` | Maximum reconnection attempts |
| `debug` | `boolean` | `false` | Enable debug logging |
| `children` | `ReactNode` | - | Child components |

#### Usage

```jsx
import { RealTimeDataProvider, useRealTimeData } from '@/design-system';

// Wrap your app with the provider
function App() {
  return (
    <RealTimeDataProvider
      wsUrl="wss://api.example.com/ws"
      autoConnect={true}
      reconnectInterval={5000}
      maxReconnectAttempts={10}
      debug={false}
    >
      <TradingDashboard />
    </RealTimeDataProvider>
  );
}

// Use the data in components
function TradingDashboard() {
  const {
    connectionState,
    isConnected,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    getPrice,
    getOrderbook,
    metrics,
    errors
  } = useRealTimeData();

  useEffect(() => {
    if (isConnected) {
      subscribe('price.BTC/USD');
      subscribe('orderbook.BTC/USD');
    }
  }, [isConnected, subscribe]);

  return (
    <div>
      <div>Status: {connectionState}</div>
      <div>Messages: {metrics.messagesReceived}</div>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

---

## Best Practices

### Component Usage

1. **Import Components**: Always import from the main design system entry point
   ```jsx
   import { Button, Input, Card } from '@/design-system';
   ```

2. **Use TypeScript**: Leverage TypeScript for better development experience
   ```tsx
   interface Props {
     title: string;
     onSubmit: (data: FormData) => void;
   }
   ```

3. **Follow Atomic Design**: Compose complex interfaces from atomic components
   ```jsx
   <Card>
     <FormGroup label="Email">
       <Input type="email" />
     </FormGroup>
     <Button type="submit">Submit</Button>
   </Card>
   ```

### Accessibility

1. **Use Semantic HTML**: Components render semantic HTML elements
2. **Provide Labels**: Always label form inputs
3. **Keyboard Navigation**: All interactive components support keyboard navigation
4. **Screen Readers**: Components include proper ARIA attributes
5. **Color Contrast**: Use theme colors for WCAG compliance

### Performance

1. **Tree Shaking**: Import only needed components
2. **Memoization**: Use React.memo for expensive components
3. **Lazy Loading**: Load components on demand when possible
4. **Real-time Data**: Use subscription hooks efficiently

### Theming

1. **Use Theme Tokens**: Always use theme values instead of hardcoded styles
2. **Responsive Design**: Leverage theme breakpoints
3. **Dark Mode**: Test components in both light and dark modes
4. **Custom Themes**: Extend the default theme for brand customization

---

*This documentation is automatically generated and kept up-to-date with the latest component changes.*