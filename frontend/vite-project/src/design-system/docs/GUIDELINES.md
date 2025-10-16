# Design System Guidelines

Comprehensive guidelines for using and contributing to the Superior UI Design System.

## Table of Contents
- [Design Principles](#design-principles)
- [Component Architecture](#component-architecture)
- [Styling Guidelines](#styling-guidelines)
- [Accessibility Standards](#accessibility-standards)
- [Performance Guidelines](#performance-guidelines)
- [Testing Standards](#testing-standards)
- [Contribution Guidelines](#contribution-guidelines)
- [Best Practices](#best-practices)

---

## Design Principles

### 1. Consistency
**Maintain visual and behavioral consistency across all components.**

- Use standardized spacing, typography, and color scales
- Follow established interaction patterns
- Ensure consistent component APIs and naming conventions
- Apply uniform animation and transition timing

```jsx
// ✅ Good - Consistent spacing using theme tokens
<Card style={{ padding: theme.spacing[4], margin: theme.spacing[2] }}>
  <Label size="lg" weight="bold">Title</Label>
  <Label color={theme.color.text.secondary}>Description</Label>
</Card>

// ❌ Bad - Inconsistent hardcoded values
<Card style={{ padding: '15px', margin: '8px' }}>
  <Label style={{ fontSize: '18px', fontWeight: 'bold' }}>Title</Label>
  <Label style={{ color: '#666' }}>Description</Label>
</Card>
```

### 2. Accessibility First
**Design and build with accessibility as a core requirement, not an afterthought.**

- Follow WCAG 2.1 AA standards
- Ensure keyboard navigation for all interactive elements
- Provide proper ARIA labels and descriptions
- Maintain sufficient color contrast ratios
- Support screen readers and assistive technologies

```jsx
// ✅ Good - Accessible button with proper ARIA
<Button
  aria-label="Save document"
  onClick={handleSave}
  disabled={isSaving}
  aria-describedby="save-help"
>
  {isSaving ? 'Saving...' : 'Save'}
</Button>

// ❌ Bad - Missing accessibility features
<button onClick={handleSave}>Save</button>
```

### 3. Performance
**Optimize for speed and efficiency without sacrificing functionality.**

- Minimize bundle size through tree shaking
- Use React.memo and useMemo for expensive operations
- Implement virtual scrolling for large datasets
- Optimize re-renders with proper dependency arrays
- Use CSS-in-JS efficiently to avoid style recalculation

### 4. Modularity
**Build composable components that work well together.**

- Follow atomic design principles (atoms, molecules, organisms)
- Create single-responsibility components
- Use composition over inheritance
- Provide flexible APIs with sensible defaults
- Enable customization through props and themes

### 5. Predictability
**Ensure components behave consistently and intuitively.**

- Use clear and descriptive prop names
- Provide comprehensive TypeScript types
- Follow established patterns and conventions
- Handle edge cases gracefully
- Provide helpful error messages

---

## Component Architecture

### Atomic Design Structure

```
design-system/
├── components/
│   ├── atoms/           # Basic building blocks
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Icon/
│   │   └── Label/
│   ├── molecules/       # Simple combinations
│   │   ├── FormGroup/
│   │   ├── Card/
│   │   └── Navigation/
│   ├── organisms/       # Complex components
│   │   ├── CandlestickChart/
│   │   └── OrderBook/
│   └── providers/       # Context providers
│       ├── ThemeProvider/
│       └── RealTimeDataProvider/
├── hooks/              # Custom hooks
├── utils/              # Utility functions
├── effects/            # Visual effects
├── tokens/             # Design tokens
└── docs/               # Documentation
```

### Component File Structure

Each component should follow this structure:

```
ComponentName/
├── index.js            # Main export
├── ComponentName.jsx   # Component implementation
├── ComponentName.test.jsx  # Unit tests
├── ComponentName.stories.js  # Storybook stories
├── ComponentName.module.css  # Component styles
└── README.md          # Component documentation
```

---

## Styling Guidelines

### CSS-in-JS Best Practices

1. **Use Theme Tokens**: Always reference theme values instead of hardcoded styles
2. **Responsive Design**: Use theme breakpoints for responsive behavior
3. **Performance**: Minimize style recalculations and avoid inline styles
4. **Maintainability**: Keep styles close to components and use meaningful names

```jsx
// ✅ Good - Using theme tokens and responsive design
const useStyles = (theme) => ({
  container: {
    padding: theme.spacing[4],
    backgroundColor: theme.color.background.primary,
    borderRadius: theme.borderRadius.md,
    [theme.breakpoints.md]: {
      padding: theme.spacing[6]
    }
  }
});

// ❌ Bad - Hardcoded values and no responsiveness
const useStyles = () => ({
  container: {
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '8px'
  }
});
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

All components must meet WCAG 2.1 AA standards:

1. **Perceivable**
   - Provide text alternatives for images
   - Ensure sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
   - Make content adaptable to different presentations

2. **Operable**
   - Make all functionality keyboard accessible
   - Give users enough time to read content
   - Don't use content that causes seizures

3. **Understandable**
   - Make text readable and understandable
   - Make content appear and operate predictably

4. **Robust**
   - Maximize compatibility with assistive technologies

### Keyboard Navigation

```jsx
// ✅ Good - Proper keyboard navigation
const NavigationMenu = ({ items, onItemSelect }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onItemSelect(items[focusedIndex]);
        break;
    }
  };

  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li
          key={item.id}
          role="menuitem"
          tabIndex={index === focusedIndex ? 0 : -1}
          aria-selected={index === focusedIndex}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
};
```

---

## Performance Guidelines

### Bundle Optimization

1. **Tree Shaking**: Export components individually
2. **Code Splitting**: Use dynamic imports for large components
3. **Bundle Analysis**: Regularly analyze bundle size

```javascript
// ✅ Good - Tree-shakeable exports
// index.js
export { default as Button } from './components/atoms/Button';
export { default as Input } from './components/atoms/Input';
export { default as CandlestickChart } from './components/organisms/CandlestickChart';

// ❌ Bad - Barrel exports that prevent tree shaking
// index.js
export * from './components';
```

### React Performance

1. **Memoization**: Use React.memo, useMemo, useCallback appropriately
2. **Avoid Inline Objects**: Don't create objects in render
3. **Optimize Context**: Split contexts to minimize re-renders

---

## Testing Standards

### Unit Testing

Use Jest and React Testing Library for unit tests:

```jsx
// ComponentName.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../providers';
import ComponentName from './ComponentName';

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('ComponentName', () => {
  it('renders with default props', () => {
    renderWithTheme(<ComponentName>Test Content</ComponentName>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    renderWithTheme(
      <ComponentName onClick={handleClick}>
        Clickable Content
      </ComponentName>
    );
    
    fireEvent.click(screen.getByText('Clickable Content'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is accessible', () => {
    renderWithTheme(
      <ComponentName aria-label="Test component">
        Content
      </ComponentName>
    );
    
    expect(screen.getByLabelText('Test component')).toBeInTheDocument();
  });
});
```

---

## Contribution Guidelines

### Development Workflow

1. **Fork and Clone**: Fork the repository and clone locally
2. **Branch**: Create a feature branch from `main`
3. **Develop**: Make changes following these guidelines
4. **Test**: Ensure all tests pass and add new tests
5. **Document**: Update documentation and examples
6. **Submit**: Create a pull request with clear description

### Code Review Checklist

- [ ] Follows component architecture patterns
- [ ] Includes comprehensive tests
- [ ] Meets accessibility standards
- [ ] Uses theme tokens consistently
- [ ] Includes proper TypeScript types
- [ ] Has clear documentation
- [ ] Follows naming conventions
- [ ] Handles edge cases gracefully
- [ ] Optimized for performance
- [ ] Includes Storybook stories

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(button): add loading state with spinner
fix(chart): resolve memory leak in real-time updates
docs(readme): update installation instructions
```

---

## Best Practices

### Component Design

1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition**: Prefer composition over complex prop APIs
3. **Flexibility**: Allow customization without breaking core functionality
4. **Consistency**: Follow established patterns and conventions

### API Design

1. **Intuitive Props**: Use clear, descriptive prop names
2. **Sensible Defaults**: Provide good default values
3. **TypeScript**: Use comprehensive TypeScript types
4. **Backwards Compatibility**: Avoid breaking changes when possible

### Documentation

1. **Clear Examples**: Provide practical usage examples
2. **API Reference**: Document all props and methods
3. **Guidelines**: Include usage guidelines and best practices
4. **Migration**: Provide migration guides for breaking changes

### Maintenance

1. **Regular Updates**: Keep dependencies up to date
2. **Performance Monitoring**: Monitor bundle size and performance
3. **User Feedback**: Collect and act on user feedback
4. **Deprecation**: Handle deprecations gracefully with clear migration paths

---

## Common Patterns

### Compound Components

```jsx
// ✅ Good - Flexible compound component pattern
<Card>
  <Card.Header>
    <Card.Title>Trading Dashboard</Card.Title>
    <Card.Actions>
      <Button size="sm">Settings</Button>
    </Card.Actions>
  </Card.Header>
  <Card.Body>
    <p>Dashboard content</p>
  </Card.Body>
  <Card.Footer>
    <Button variant="primary">Save</Button>
  </Card.Footer>
</Card>
```

### Render Props

```jsx
// ✅ Good - Flexible render prop pattern
<DataProvider>
  {({ data, loading, error }) => (
    <div>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      {data && <DataTable data={data} />}
    </div>
  )}
</DataProvider>
```

### Custom Hooks

```jsx
// ✅ Good - Reusable custom hook
const useRealTimePrice = (symbol) => {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const { subscribe, unsubscribe } = useRealTimeData();

  useEffect(() => {
    if (symbol) {
      setLoading(true);
      subscribe(`price.${symbol}`, (data) => {
        setPrice(data);
        setLoading(false);
      });

      return () => unsubscribe(`price.${symbol}`);
    }
  }, [symbol, subscribe, unsubscribe]);

  return { price, loading };
};
```

---

This comprehensive guide ensures consistent, accessible, and performant component development across the Superior UI Design System. Follow these guidelines to create components that work well together and provide an excellent user experience.