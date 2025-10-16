import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Input, Icon, Label, useTheme } from '../index';

// Demo container
const DemoContainer = styled.div`
  padding: ${props => props.theme.spacing[8]};
  max-width: 1200px;
  margin: 0 auto;
  background: ${props => props.theme.color.background.primary};
  min-height: 100vh;
`;

// Section wrapper
const Section = styled.section`
  margin-bottom: ${props => props.theme.spacing[12]};
  padding: ${props => props.theme.spacing[6]};
  
  background: ${props => props.theme.color.background.secondary};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.color.border.primary};
`;

// Section title
const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.color.text.primary};
  margin-bottom: ${props => props.theme.spacing[6]};
  border-bottom: 2px solid ${props => props.theme.color.primary[500]};
  padding-bottom: ${props => props.theme.spacing[2]};
`;

// Grid layout for examples
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing[6]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

// Example card
const ExampleCard = styled.div`
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.color.background.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.color.border.primary};
`;

// Example title
const ExampleTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.color.text.primary};
  margin-bottom: ${props => props.theme.spacing[3]};
`;

// Component showcase
const ComponentShowcase = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[3]};
  align-items: center;
`;

// Theme toggle button
const ThemeToggle = styled.div`
  position: fixed;
  top: ${props => props.theme.spacing[4]};
  right: ${props => props.theme.spacing[4]};
  z-index: ${props => props.theme.zIndex.sticky};
`;

const AtomicComponentsDemo = () => {
    const { theme, isDark, toggleTheme } = useTheme();
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLoadingDemo = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 3000);
    };

    return (
        <DemoContainer theme={theme}>
            <ThemeToggle theme={theme}>
                <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Icon name={isDark ? 'eye' : 'eyeOff'} />}
                    onClick={toggleTheme}
                >
                    {isDark ? 'Light' : 'Dark'} Mode
                </Button>
            </ThemeToggle>

            <h1 style={{
                fontSize: theme.typography.fontSize['4xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.color.text.primary,
                textAlign: 'center',
                marginBottom: theme.spacing[12],
            }}>
                Atomic Components Demo
            </h1>

            {/* Button Examples */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Button Components</SectionTitle>

                <Grid theme={theme}>
                    <ExampleCard theme={theme}>
                        <ExampleTitle theme={theme}>Button Variants</ExampleTitle>
                        <ComponentShowcase theme={theme}>
                            <Button variant="primary">Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="danger">Danger</Button>
                        </ComponentShowcase>
                    </ExampleCard>

                    <ExampleCard theme={theme}>
                        <ExampleTitle theme={theme}>Button Sizes</ExampleTitle>
                        <ComponentShowcase theme={theme}>
                            <Button size="xs">Extra Small</Button>
                            <Button size="sm">Small</Button>
                            <Button size="md">Medium</Button>
                            <Button size="lg">Large</Button>
                            <Button size="xl">Extra Large</Button>
                        </ComponentShowcase>
                    </ExampleCard>

                    <ExampleCard theme={theme}>
                        <ExampleTitle theme={theme}>Button States</ExampleTitle>
                        <ComponentShowcase theme={theme}>
                            <Button>Normal</Button>
                            <Button loading={loading} onClick={handleLoadingDemo}>
                                {loading ? 'Loading...' : 'Click to Load'}
                            </Button>
                            <Button disabled>Disabled</Button>
                        </ComponentShowcase>
                    </ExampleCard>

                    <ExampleCard theme={theme}>
                        <ExampleTitle theme={theme}>Buttons with Icons</ExampleTitle>
                        <ComponentShowcase theme={theme}>
                            <Button leftIcon={<Icon name="plus" />}>Add Item</Button>
                            <Button rightIcon={<Icon name="chevronRight" />}>Next</Button>
                            <Button
                                leftIcon={<Icon name="trendUp" />}
                                rightIcon={<Icon name="dollar" />}
                                variant="outline"
                            >
                                Buy Order
                            </Button>
                        </ComponentShowcase>
                    </ExampleCard>
                </Grid>

                <ExampleCard theme={theme}>
                    <ExampleTitle theme={theme}>Full Width Button</ExampleTitle>
                    <Button fullWidth variant="primary" size="lg">
                        Full Width Button
                    </Button>
                </ExampleCard>
            </Section>

            {/* Input Examples */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Input Components</SectionTitle>

                <Grid theme={theme}>
                    <ExampleCard theme={theme}>
                        <ExampleTitle theme={theme}>Input Variants</ExampleTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4] }}>
                            <Input
                                variant="default"
                                placeholder="Default input"
                                label="Default Variant"
                            />
                            <Input
                                variant="filled"
                                placeholder="Filled input"
                                label="Filled Variant"
                            />
                            <Input
                                variant="outline"
                                placeholder="Outline input"
                                label="Outline Variant"
                            />
                        </div>
                    </ExampleCard>

                    <ExampleCard theme={theme}>
                        <ExampleTitle theme={theme}>Input Sizes</ExampleTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4] }}>
                            <Input size="sm" placeholder="Small input" label="Small Size" />
                            <Input size="md" placeholder="Medium input" label="Medium Size" />
                            <Input size="lg" placeholder="Large input" label="Large Size" />
                        </div>
                    </ExampleCard>

                    <ExampleCard theme={theme}>
                        <ExampleTitle theme={theme}>Input States</ExampleTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4] }}>
                            <Input
                                placeholder="Normal input"
                                label="Normal State"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <Input
                                placeholder="Error input"
                                label="Error State"
                                error
                                errorMessage="This field is required"
                            />
                            <Input
                                placeholder="Disabled input"
                                label="Disabled State"
                                disabled
                            />
                            <Input
                                placeholder="Read-only input"
                                label="Read-only State"
                                value="Read-only value"
                                readOnly
                            />
                        </div>
                    </ExampleCard>

                    <ExampleCard theme={theme}>
                        <ExampleTitle theme={theme}>Inputs with Icons</ExampleTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4] }}>
                            <Input
                                placeholder="Search..."
                                label="Search Input"
                                leftIcon={<Icon name="search" />}
                            />
                            <Input
                                type="password"
                                placeholder="Password"
                                label="Password Input"
                                rightIcon={<Icon name="eye" />}
                            />
                            <Input
                                type="number"
                                placeholder="0.00"
                                label="Price Input"
                                leftIcon={<Icon name="dollar" />}
                                rightIcon={<Icon name="percent" />}
                            />
                        </div>
                    </ExampleCard>
                </Grid>

                <ExampleCard theme={theme}>
                    <ExampleTitle theme={theme}>Input Types</ExampleTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing[4] }}>
                        <Input type="email" placeholder="email@example.com" label="Email" />
                        <Input type="tel" placeholder="+1 (555) 123-4567" label="Phone" />
                        <Input type="url" placeholder="https://example.com" label="Website" />
                        <Input type="search" placeholder="Search terms" label="Search" />
                    </div>
                </ExampleCard>
            </Section>

            {/* Icon Examples */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Icon Components</SectionTitle>

                <Grid theme={theme}>
                    <ExampleCard theme={theme}>
                        <ExampleTitle theme={theme}>Icon Sizes</ExampleTitle>
                        <ComponentShowcase theme={theme}>
                            <Icon name="search" size="xs" />
                            <Icon name="search" size="sm" />
                            <Icon name="search" size="md" />
                            <Icon name="search" size="lg" />
                            <Icon name="search" size="xl" />
                            <Icon name="search" size="2xl" />
                        </ComponentShowcase>
                    </ExampleCard>

                    <ExampleCard theme={theme}>
                        <ExampleTitle theme={theme}>Icon Colors</ExampleTitle>
                        <ComponentShowcase theme={theme}>
                            <Icon name="trendUp" color="bull" size="lg" />
                            <Icon name="trendDown" color="bear" size="lg" />
                            <Icon name="info" color="info" size="lg" />
                            <Icon name="check" color="success" size="lg" />
                            <Icon name="alert" color="warning" size="lg" />
                            <Icon name="close" color="error" size="lg" />
                        </ComponentShowcase>
                    </ExampleCard>

                    <ExampleCard theme={theme}>
                        <ExampleTitle theme={theme}>Trading Icons</ExampleTitle>
                        <ComponentShowcase theme={theme}>
                            <Icon name="trendUp" size="lg" />
                            <Icon name="trendDown" size="lg" />
                            <Icon name="candlestick" size="lg" />
                            <Icon name="volume" size="lg" />
                            <Icon name="dollar" size="lg" />
                            <Icon name="percent" size="lg" />
                        </ComponentShowcase>
                    </ExampleCard>

                    <ExampleCard theme={theme}>
                        <ExampleTitle theme={theme}>Interactive Icons</ExampleTitle>
                        <ComponentShowcase theme={theme}>

                            <Icon name="settings" interactive size="lg" />
                            <Icon name="menu" interactive size="lg" />
                            <Icon name="close" interactive size="lg" />
                            <Icon name="plus" interactive size="lg" />
                            <Icon name="minus" interactive size="lg" />
                        </ComponentShowcase>
                    </ExampleCard>
                </Grid>

                <ExampleCard theme={theme}>
                    <ExampleTitle theme={theme}>Loading Animation</ExampleTitle>
                    <ComponentShowcase theme={theme}>
                        <Icon name="loading" size="sm" />
                        <Icon name="loading" size="md" />
                        <Icon name="loading" size="lg" />
                        <Icon name="loading" size="xl" />
                    </ComponentShowcase>
                </ExampleCard>
            </Section>

            {/* Label Examples */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Label Components</SectionTitle>

                <Grid theme={theme}>
                    <ExampleCard theme={theme}>
                        <ExampleTitle theme={theme}>Label Sizes</ExampleTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
                            <Label size="xs">Extra Small Label</Label>
                            <Label size="sm">Small Label</Label>
                            <Label size="md">Medium Label</Label>
                            <Label size="lg">Large Label</Label>
                            <Label size="xl">Extra Large Label</Label>
                        </div>
                    </ExampleCard>

                    <ExampleCard theme={theme}>
                        <ExampleTitle theme={theme}>Label Colors</ExampleTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
                            <Label color="primary">Primary Label</Label>
                            <Label color="secondary">Secondary Label</Label>
                            <Label color="success">Success Label</Label>
                            <Label color="warning">Warning Label</Label>
                            <Label color="error">Error Label</Label>
                            <Label color="bull">Bull Market</Label>
                            <Label color="bear">Bear Market</Label>
                        </div>
                    </ExampleCard>

                    <ExampleCard theme={theme}>
                        <ExampleTitle theme={theme}>Label States</ExampleTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
                            <Label required>Required Field</Label>
                            <Label optional>Optional Field</Label>
                            <Label disabled>Disabled Label</Label>
                            <Label uppercase>Uppercase Label</Label>
                            <Label truncate style={{ maxWidth: '200px' }}>
                                This is a very long label that will be truncated
                            </Label>
                        </div>
                    </ExampleCard>

                    <ExampleCard theme={theme}>
                        <ExampleTitle theme={theme}>Labels with Badges</ExampleTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
                            <Label badge="New" badgeVariant="primary">Feature Label</Label>
                            <Label badge="Pro" badgeVariant="success">Premium Feature</Label>
                            <Label badge="Beta" badgeVariant="warning">Beta Feature</Label>
                            <Label badge="Deprecated" badgeVariant="error">Old Feature</Label>
                        </div>
                    </ExampleCard>
                </Grid>

                <ExampleCard theme={theme}>
                    <ExampleTitle theme={theme}>Interactive Labels</ExampleTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
                        <Label interactive onClick={() => alert('Label clicked!')}>
                            Clickable Label
                        </Label>
                        <Label tooltip="This label has a tooltip">
                            Label with Tooltip
                        </Label>
                    </div>
                </ExampleCard>
            </Section>

            {/* Combined Examples */}
            <Section theme={theme}>
                <SectionTitle theme={theme}>Combined Examples</SectionTitle>

                <ExampleCard theme={theme}>
                    <ExampleTitle theme={theme}>Trading Form</ExampleTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: theme.spacing[6] }}>
                        <div>
                            <Input
                                label="Symbol"
                                placeholder="AAPL"
                                leftIcon={<Icon name="search" />}
                                helperText="Enter stock symbol"
                            />
                        </div>
                        <div>
                            <Input
                                label="Quantity"
                                type="number"
                                placeholder="100"
                                leftIcon={<Icon name="volume" />}
                                required
                            />
                        </div>
                        <div>
                            <Input
                                label="Price"
                                type="number"
                                placeholder="150.00"
                                leftIcon={<Icon name="dollar" />}
                                rightIcon={<Icon name="percent" />}
                                helperText="Price per share"
                            />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <div style={{ display: 'flex', gap: theme.spacing[3], marginTop: theme.spacing[4] }}>
                                <Button
                                    variant="primary"
                                    leftIcon={<Icon name="trendUp" color="current" />}
                                    fullWidth
                                >
                                    Buy Order
                                </Button>
                                <Button
                                    variant="danger"
                                    leftIcon={<Icon name="trendDown" color="current" />}
                                    fullWidth
                                >
                                    Sell Order
                                </Button>
                            </div>
                        </div>
                    </div>
                </ExampleCard>
            </Section>
        </DemoContainer>
    );
};

export default AtomicComponentsDemo;