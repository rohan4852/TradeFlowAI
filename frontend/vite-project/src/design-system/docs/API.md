# API Reference

Complete API reference for the Superior UI Design System.

## Table of Contents

- [Core APIs](#core-apis)
- [Component APIs](#component-apis)
- [Hook APIs](#hook-apis)
- [Utility APIs](#utility-apis)
- [Theme APIs](#theme-apis)
- [Real-time APIs](#real-time-apis)

---

## Core APIs

### Design System Entry Point

```javascript
import { 
  // Components
  Button, Input, Icon, Label,
  Card, FormGroup, Navigation,
  CandlestickChart, OrderBook,
  // Providers
  ThemeProvider, RealTimeDataProvider,
  // Hooks
  useTheme, useRealTimeData, useSymbolData,
  // Utilities
  WebSocketManager, calculateTechnicalIndicators,
  // Effects
  createGlassmorphism, animationPresets,
  // Constants
  WS_STATES, MESSAGE_TYPES
} from '@/design-system';
```

---

## Component APIs

### Atomic Components

#### Button API

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  onClick?: (event: MouseEvent) => void;
  children?: ReactNode;
  className?: string;
  testId?: string;
}
```

#### Input API

```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'flushed';
  state?: 'default' | 'error' | 'success' | 'warning';
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  leftIcon?: string;
  rightIcon?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  className?: string;
  testId?: string;
}
```

#### Icon API

```typescript
interface IconProps {
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  color?: string;
  library?: 'feather' | 'heroicons' | 'lucide';
  customSvg?: ReactNode;
  spin?: boolean;
  className?: string;
  testId?: string;
}
```

#### Label API

```typescript
interface LabelProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  truncate?: boolean;
  noWrap?: boolean;
  as?: keyof JSX.IntrinsicElements;
  htmlFor?: string;
  children?: ReactNode;
  className?: string;
  testId?: string;
}
```

### Molecular Components

#### Card API

```typescript
interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: MouseEvent) => void;
  children?: ReactNode;
  className?: string;
  testId?: string;
}
```

#### FormGroup API

```typescript
interface FormGroupProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
  className?: string;
  testId?: string;
}
```

#### Navigation API

```typescript
interface NavigationItem {
  key: string;
  label: string;
  icon?: string;
  href?: string;
  disabled?: boolean;
  badge?: string | number;
}

interface NavigationProps {
  variant?: 'horizontal' | 'vertical' | 'tabs' | 'pills';
  size?: 'sm' | 'md' | 'lg';
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (key: string, item: NavigationItem) => void;
  className?: string;
  testId?: string;
}
```

### Organism Components

#### CandlestickChart API

```typescript
interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TechnicalIndicatorConfig {
  sma?: { period: number; color?: string };
  ema?: { period: number; color?: string };
  rsi?: { period: number; overbought?: number; oversold?: number };
  macd?: { fastPeriod?: number; slowPeriod?: number; signalPeriod?: number };
  bollinger?: { period: number; stdDev?: number };
}

interface CandlestickChartProps {
  data: CandlestickData[];
  symbol?: string;
  realTime?: boolean;
  width?: string | number;
  height?: string | number;
  showControls?: boolean;
  showVolume?: boolean;
  showIndicators?: boolean;
  indicators?: TechnicalIndicatorConfig;
  overlays?: string[];
  timeframe?: string;
  onTimeframeChange?: (timeframe: string) => void;
  onIndicatorChange?: (indicators: TechnicalIndicatorConfig) => void;
  onRealTimeUpdate?: (update: any) => void;
  loading?: boolean;
  className?: string;
  testId?: string;
}
```

#### OrderBook API

```typescript
interface OrderBookEntry {
  price: number;
  size: number;
  timestamp: number;
}

interface OrderBookProps {
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
  spread?: number;
  symbol?: string;
  realTime?: boolean;
  precision?: number;
  aggregationOptions?: number[];
  defaultAggregation?: number;
  maxDepth?: number;
  height?: string;
  showDepthBars?: boolean;
  showCumulativeTotal?: boolean;
  onOrderClick?: (order: OrderBookEntry, side: 'ask' | 'bid') => void;
  onRealTimeUpdate?: (update: any) => void;
  loading?: boolean;
  className?: string;
  testId?: string;
}
```

---

## Hook APIs

### Theme Hooks

#### useTheme

```typescript
interface ThemeContextValue {
  theme: Theme;
  mode: 'light' | 'dark';
  toggleTheme: () => void;
  setMode: (mode: 'light' | 'dark') => void;
  setTheme: (theme: Partial<Theme>) => void;
}

function useTheme(): ThemeContextValue;
```

### Real-time Data Hooks

#### useRealTimeData

```typescript
interface RealTimeDataContextValue {
  // Connection state
  connectionState: WS_STATES;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  isLoading: boolean;
  
  // Data
  prices: Map<string, PriceData>;
  orderbooks: Map<string, OrderbookData>;
  trades: Map<string, TradeData[]>;
  tickers: Map<string, TickerData>;
  
  lastUpdated: {
    prices: Map<string, number>;
    orderbooks: Map<string, number>;
    trades: Map<string, number>;
    tickers: Map<string, number>;
  };
  
  // Subscriptions
  subscriptions: Set<string>;
  
  // Metrics and errors
  metrics: ConnectionMetrics;
  errors: ErrorEntry[];
  
  // Methods
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribe: (channel: string, params?: any) => void;
  unsubscribe: (channel: string) => void;
  getPrice: (symbol: string) => PriceData | undefined;
  getOrderbook: (symbol: string) => OrderbookData | undefined;
  getTrades: (symbol: string) => TradeData[];
  getTicker: (symbol: string) => TickerData | undefined;
  clearErrors: () => void;
}

function useRealTimeData(): RealTimeDataContextValue;
```

#### useSymbolData

```typescript
interface SymbolDataResult {
  symbol: string;
  price?: PriceData;
  orderbook?: OrderbookData;
  trades: TradeData[];
  ticker?: TickerData;
  lastUpdated: {
    price?: number;
    orderbook?: number;
    trades?: number;
    ticker?: number;
  };
  isSubscribed: boolean;
}

function useSymbolData(symbol: string): SymbolDataResult;
```

---

## Utility APIs

### WebSocket Manager

```typescript
class WebSocketManager {
  constructor(options: WebSocketOptions);
  
  // Connection management
  connect(): Promise<void>;
  disconnect(): void;
  
  // Message handling
  send(message: any): boolean;
  
  // Subscription management
  subscribe(channel: string, params?: any): void;
  unsubscribe(channel: string): void;
  
  // Event handling
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
  emit(event: string, data?: any): void;
  
  // State and metrics
  getState(): WS_STATES;
  isConnected(): boolean;
  getMetrics(): ConnectionMetrics;
  
  // Cleanup
  destroy(): void;
}

interface WebSocketOptions {
  url?: string;
  protocols?: string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  messageTimeout?: number;
  debug?: boolean;
}

interface ConnectionMetrics {
  messagesReceived: number;
  messagesSent: number;
  reconnectCount: number;
  lastConnected: number | null;
  totalUptime: number;
  errors: ErrorEntry[];
  currentState: WS_STATES;
  reconnectAttempts: number;
  subscriptions: number;
  queuedMessages: number;
  uptime: number;
}
```

### Technical Indicators

```typescript
interface TechnicalIndicatorOptions {
  period?: number;
  source?: 'open' | 'high' | 'low' | 'close' | 'volume';
}

interface IndicatorResult {
  values: number[];
  timestamps: number[];
}

// Simple Moving Average
function calculateSMA(
  data: CandlestickData[], 
  options: TechnicalIndicatorOptions
): IndicatorResult;

// Exponential Moving Average
function calculateEMA(
  data: CandlestickData[], 
  options: TechnicalIndicatorOptions
): IndicatorResult;

// Relative Strength Index
function calculateRSI(
  data: CandlestickData[], 
  options: TechnicalIndicatorOptions & { overbought?: number; oversold?: number }
): IndicatorResult;

// MACD
function calculateMACD(
  data: CandlestickData[], 
  options: { fastPeriod?: number; slowPeriod?: number; signalPeriod?: number }
): {
  macd: IndicatorResult;
  signal: IndicatorResult;
  histogram: IndicatorResult;
};

// Bollinger Bands
function calculateBollingerBands(
  data: CandlestickData[], 
  options: TechnicalIndicatorOptions & { stdDev?: number }
): {
  upper: IndicatorResult;
  middle: IndicatorResult;
  lower: IndicatorResult;
};

// Calculate all indicators
function calculateAllIndicators(
  data: CandlestickData[], 
  config: TechnicalIndicatorConfig
): Record<string, any>;
```

---

## Theme APIs

### Theme Structure

```typescript
interface Theme {
  mode: 'light' | 'dark';
  color: {
    primary: ColorScale;
    secondary: ColorScale;
    success: ColorScale;
    warning: ColorScale;
    error: ColorScale;
    info: ColorScale;
    gray: ColorScale;
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
    };
    border: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    trading: {
      bull: string;
      bear: string;
      neutral: string;
    };
  };
  typography: {
    fontFamily: {
      sans: string;
      serif: string;
      mono: string;
    };
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
    lineHeight: Record<string, number>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  boxShadow: Record<string, string>;
  zIndex: Record<string, number>;
  breakpoints: Record<string, string>;
  animation: {
    duration: Record<string, string>;
    easing: Record<string, string>;
  };
}

interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}
```

### Theme Provider API

```typescript
interface ThemeProviderProps {
  theme?: Partial<Theme>;
  defaultMode?: 'light' | 'dark';
  children: ReactNode;
}

function ThemeProvider(props: ThemeProviderProps): JSX.Element;
```

---

## Real-time APIs

### WebSocket States

```typescript
enum WS_STATES {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR',
  CLOSED = 'CLOSED'
}
```

### Message Types

```typescript
enum MESSAGE_TYPES {
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  HEARTBEAT = 'heartbeat',
  PRICE_UPDATE = 'price_update',
  ORDERBOOK_UPDATE = 'orderbook_update',
  TRADE_UPDATE = 'trade_update',
  TICKER_UPDATE = 'ticker_update',
  ERROR = 'error',
  PONG = 'pong'
}
```

### Data Types

```typescript
interface PriceData {
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

interface OrderbookData {
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
  timestamp: number;
}

interface TradeData {
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

interface TickerData {
  price: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
  timestamp: number;
}

interface ErrorEntry {
  id: number;
  type: 'connection' | 'server' | 'parse';
  message: string;
  timestamp: number;
}
```

---

## Effects APIs

### Glassmorphism

```typescript
interface GlassmorphismOptions {
  blur?: number;
  opacity?: number;
  borderOpacity?: number;
  borderWidth?: number;
  borderRadius?: number;
  background?: string;
  borderColor?: string;
}

function createGlassmorphism(
  options: GlassmorphismOptions, 
  theme: Theme
): string;

// Preset configurations
const tradingGlassPresets: {
  card: GlassmorphismOptions;
  modal: GlassmorphismOptions;
  sidebar: GlassmorphismOptions;
  header: GlassmorphismOptions;
};
```

### Animations

```typescript
interface AnimationPreset {
  duration: string;
  easing: string;
  delay?: string;
}

const animationPresets: {
  fast: AnimationPreset;
  normal: AnimationPreset;
  slow: AnimationPreset;
  bounce: AnimationPreset;
  elastic: AnimationPreset;
};

// Stagger animations for lists
function staggerAnimations(
  count: number, 
  delay?: number
): AnimationPreset[];

// Check for reduced motion preference
function shouldReduceMotion(): boolean;
```

---

This API reference provides comprehensive documentation for all public APIs in the Superior UI Design System. For implementation details and examples, refer to the component documentation and source code.