import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
    Button,
    Input,
    Label
} from '../components/atoms';
import {
    ScreenReaderOnly,
    LiveRegion,
    FocusTrap,
    SkipLink,
    SkipLinks,
    KeyboardShortcuts,
    useKeyboardShortcuts
} from '../components/accessibility';
import {
    useKeyboardNavigation,
    useFocusManagement,
    useScreenReader,
    useTradingAnnouncements
} from '../components/accessibility';
import AccessibilityTester from '../components/accessibility/AccessibilityTester';
import { ThemeProvider } from '../ThemeProvider';

const DemoContainer = styled.div`
  padding: ${props => props.theme.spacing[6]};
  max-width: 1200px;
  margin: 0 auto;
`;

const DemoSection = styled.section`
  margin-bottom: ${props => props.theme.spacing[8]};
  padding: ${props => props.theme.spacing[6]};
  border: 1px solid ${props => props.theme.color.border.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.color.background.primary};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.color.text.primary};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const DemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const DemoCard = styled(motion.div)`
  padding: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.color.border.secondary};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.color.background.secondary};
`;

const CodeBlock = styled.pre`
  background: ${props => props.theme.color.background.tertiary};
  padding: ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-family: ${props => props.theme.typography.fontFamily.monospace};
  font-size: ${props => props.theme.typography.fontSize.sm};
  overflow-x: auto;
  margin: ${props => props.theme.spacing[2]} 0;
`;

const TradingSimulator = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[4]};
  align-items: center;
  padding: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.color.border.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.color.background.secondary};
`;

const PriceDisplay = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.price > props.previousPrice
        ? props.theme.color.semantic.success
        : props.price < props.previousPrice
            ? props.theme.color.semantic.error
            : props.theme.color.text.primary};
`;

// Keyboard Navigation Demo
const KeyboardNavigationDemo = () => {
    const { containerRef } = useKeyboardNavigation({
        onArrowUp: () => console.log('Arrow up pressed'),
        onArrowDown: () => console.log('Arrow down pressed'),
        onEnter: () => console.log('Enter pressed'),
        onEscape: () => console.log('Escape pressed'),
        enabled: true
    });

    return (
        <DemoCard
            ref={containerRef}
            tabIndex={0}
            role="region"
            aria-label="Keyboard navigation demo"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <h3>Keyboard Navigation</h3>
            <p>Focus this area and use arrow keys, Enter, or Escape to test keyboard navigation.</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <Button size="sm">Button 1</Button>
                <Button size="sm">Button 2</Button>
                <Button size="sm">Button 3</Button>
            </div>
            <ScreenReaderOnly>
                Use arrow keys to navigate, Enter to activate, Escape to exit
            </ScreenReaderOnly>
        </DemoCard>
    );
};

// Focus Management Demo
const FocusManagementDemo = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <DemoCard>
            <h3>Focus Management</h3>
            <p>Demonstrates focus trapping in modals and proper focus restoration.</p>

            <Button onClick={() => setIsModalOpen(true)}>
                Open Modal
            </Button>

            {isModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                >
                    <FocusTrap active={true} autoFocus={true}>
                        <div
                            style={{
                                background: 'white',
                                padding: '24px',
                                borderRadius: '8px',
                                minWidth: '300px'
                            }}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-title"
                        >
                            <h4 id="modal-title">Focus Trapped Modal</h4>
                            <p>Focus is trapped within this modal. Try tabbing through the elements.</p>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                <Input placeholder="First input" />
                                <Input placeholder="Second input" />
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                                    Close
                                </Button>
                                <Button variant="secondary">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </FocusTrap>
                </div>
            )}
        </DemoCard>
    );
};

// Screen Reader Demo
const ScreenReaderDemo = () => {
    const [announcements, setAnnouncements] = useState([]);
    const { announcePolite, announceAssertive } = useScreenReader();
    const { announcePriceChange, announceTradeExecution } = useTradingAnnouncements();

    const addAnnouncement = (message, type) => {
        setAnnouncements(prev => [...prev, { message, type, timestamp: Date.now() }]);

        if (type === 'polite') {
            announcePolite(message);
        } else {
            announceAssertive(message);
        }
    };

    const simulatePriceChange = () => {
        const price = (Math.random() * 1000 + 50000).toFixed(2);
        const change = (Math.random() * 10 - 5).toFixed(2);
        announcePriceChange('BTC/USD', `$${price}`, change, Math.abs(change));
        addAnnouncement(`Bitcoin price changed to $${price}`, 'polite');
    };

    const simulateTradeExecution = () => {
        const quantity = (Math.random() * 2).toFixed(4);
        const price = (Math.random() * 1000 + 50000).toFixed(2);
        announceTradeExecution('BTC/USD', 'buy', quantity, `$${price}`);
        addAnnouncement(`Trade executed: Buy ${quantity} BTC at $${price}`, 'assertive');
    };

    return (
        <DemoCard>
            <h3>Screen Reader Announcements</h3>
            <p>Test live announcements for screen readers.</p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <Button
                    size="sm"
                    onClick={() => addAnnouncement('This is a polite announcement', 'polite')}
                >
                    Polite Announcement
                </Button>
                <Button
                    size="sm"
                    onClick={() => addAnnouncement('This is an assertive announcement!', 'assertive')}
                >
                    Assertive Announcement
                </Button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <Button size="sm" onClick={simulatePriceChange}>
                    Simulate Price Change
                </Button>
                <Button size="sm" onClick={simulateTradeExecution}>
                    Simulate Trade
                </Button>
            </div>

            <LiveRegion visible={true}>
                <h4>Announcement Log:</h4>
                <ul style={{ maxHeight: '150px', overflow: 'auto' }}>
                    {announcements.slice(-5).map((announcement, index) => (
                        <li key={announcement.timestamp}>
                            <strong>[{announcement.type}]</strong> {announcement.message}
                        </li>
                    ))}
                </ul>
            </LiveRegion>

            <ScreenReaderOnly>
                This section demonstrates screen reader announcements for trading activities
            </ScreenReaderOnly>
        </DemoCard>
    );
};

// Trading Price Simulator
const TradingPriceSimulator = () => {
    const [price, setPrice] = useState(50000);
    const [previousPrice, setPreviousPrice] = useState(50000);
    const { announcePriceChange } = useTradingAnnouncements();

    const updatePrice = () => {
        setPreviousPrice(price);
        const newPrice = price + (Math.random() * 1000 - 500);
        const change = ((newPrice - price) / price) * 100;
        setPrice(newPrice);

        announcePriceChange('BTC/USD', `$${newPrice.toFixed(2)}`, newPrice - price, change);
    };

    return (
        <TradingSimulator>
            <div>
                <Label>Bitcoin Price:</Label>
                <PriceDisplay price={price} previousPrice={previousPrice}>
                    ${price.toFixed(2)}
                </PriceDisplay>
            </div>

            <Button onClick={updatePrice}>
                Update Price
            </Button>

            <ScreenReaderOnly>
                Current Bitcoin price is ${price.toFixed(2)} USD
            </ScreenReaderOnly>
        </TradingSimulator>
    );
};

// Main Demo Component
const AccessibilityDemo = () => {
    const [showTester, setShowTester] = useState(false);
    const { isShortcutsVisible, showShortcuts, hideShortcuts } = useKeyboardShortcuts({
        'ctrl+shift+a': () => setShowTester(!showTester),
        'ctrl+shift+h': () => showShortcuts()
    });

    const skipLinks = [
        { href: '#keyboard-nav', text: 'Skip to keyboard navigation demo' },
        { href: '#focus-management', text: 'Skip to focus management demo' },
        { href: '#screen-reader', text: 'Skip to screen reader demo' },
        { href: '#trading-sim', text: 'Skip to trading simulator' }
    ];

    return (
        <ThemeProvider>
            <DemoContainer>
                <SkipLinks links={skipLinks} />

                <header>
                    <h1>Accessibility Features Demo</h1>
                    <p>
                        This demo showcases the comprehensive accessibility features built into the
                        Superior UI Design System. All components are WCAG 2.1 AA compliant and
                        include keyboard navigation, screen reader support, and focus management.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', margin: '24px 0' }}>
                        <Button onClick={() => setShowTester(true)}>
                            Open Accessibility Tester
                        </Button>
                        <Button variant="secondary" onClick={showShortcuts}>
                            Show Keyboard Shortcuts
                        </Button>
                    </div>
                </header>

                <main>
                    <DemoSection id="keyboard-nav">
                        <SectionTitle>Keyboard Navigation</SectionTitle>
                        <p>
                            Full keyboard support with logical tab order, arrow key navigation,
                            and custom keyboard shortcuts.
                        </p>

                        <DemoGrid>
                            <KeyboardNavigationDemo />

                            <DemoCard>
                                <h3>Usage Example</h3>
                                <CodeBlock>{`
import { useKeyboardNavigation } from '@superior-ui/design-system';

const { containerRef } = useKeyboardNavigation({
  onArrowUp: () => console.log('Up'),
  onArrowDown: () => console.log('Down'),
  onEnter: () => console.log('Enter'),
  onEscape: () => console.log('Escape'),
  enabled: true
});

<div ref={containerRef} tabIndex={0}>
  {/* Keyboard navigable content */}
</div>
                `}</CodeBlock>
                            </DemoCard>
                        </DemoGrid>
                    </DemoSection>

                    <DemoSection id="focus-management">
                        <SectionTitle>Focus Management</SectionTitle>
                        <p>
                            Proper focus trapping for modals, focus restoration, and visible focus indicators.
                        </p>

                        <DemoGrid>
                            <FocusManagementDemo />

                            <DemoCard>
                                <h3>Focus Trap Usage</h3>
                                <CodeBlock>{`
import { FocusTrap } from '@superior-ui/design-system';

<FocusTrap active={isModalOpen} autoFocus={true}>
  <div role="dialog" aria-modal="true">
    <h2>Modal Title</h2>
    <input type="text" />
    <button>Close</button>
  </div>
</FocusTrap>
                `}</CodeBlock>
                            </DemoCard>
                        </DemoGrid>
                    </DemoSection>

                    <DemoSection id="screen-reader">
                        <SectionTitle>Screen Reader Support</SectionTitle>
                        <p>
                            Comprehensive screen reader support with ARIA labels, live regions,
                            and trading-specific announcements.
                        </p>

                        <DemoGrid>
                            <ScreenReaderDemo />

                            <DemoCard>
                                <h3>Screen Reader Hooks</h3>
                                <CodeBlock>{`
import { 
  useScreenReader, 
  useTradingAnnouncements 
} from '@superior-ui/design-system';

const { announcePolite, announceAssertive } = useScreenReader();
const { announcePriceChange } = useTradingAnnouncements();

// Announce price changes
announcePriceChange('BTC/USD', '$50,000', 2.5, 2.5);

// General announcements
announcePolite('Order submitted successfully');
announceAssertive('Connection lost!');
                `}</CodeBlock>
                            </DemoCard>
                        </DemoGrid>
                    </DemoSection>

                    <DemoSection id="trading-sim">
                        <SectionTitle>Trading Accessibility</SectionTitle>
                        <p>
                            Specialized accessibility features for trading interfaces including
                            price change announcements and order status updates.
                        </p>

                        <TradingPriceSimulator />
                    </DemoSection>

                    <DemoSection>
                        <SectionTitle>Accessibility Testing</SectionTitle>
                        <p>
                            Built-in accessibility testing tools with automated validation,
                            contrast checking, and remediation suggestions.
                        </p>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Button onClick={() => setShowTester(true)}>
                                Open Accessibility Tester
                            </Button>
                            <Button variant="outline">
                                Run Automated Tests
                            </Button>
                        </div>
                    </DemoSection>
                </main>

                {/* Accessibility Tester */}
                <AccessibilityTester
                    isOpen={showTester}
                    onClose={() => setShowTester(false)}
                />

                {/* Keyboard Shortcuts */}
                <KeyboardShortcuts
                    isOpen={isShortcutsVisible}
                    onClose={hideShortcuts}
                />
            </DemoContainer>
        </ThemeProvider>
    );
};

export default AccessibilityDemo;