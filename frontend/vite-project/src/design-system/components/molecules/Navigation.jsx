import React, { forwardRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../ThemeProvider';
import { Button, Icon, Label } from '../atoms';
import {
    createGlassmorphism,
    tradingGlassPresets,
    animationPresets,
    hoverEffects,
    staggerAnimations
} from '../../effects';

// Navigation container
const NavigationContainer = styled(motion.nav)`
  display: flex;
  align-items: center;
  ${props => tradingGlassPresets.navigation(props.theme)}
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.borderRadius.lg};
  position: relative;
  overflow: hidden;

  ${props => props.vertical && css`
    flex-direction: column;
    align-items: stretch;
    width: ${props.width || '240px'};
    height: 100%;
    padding: ${props.theme.spacing[4]};
  `}

  ${props => props.compact && css`
    padding: ${props.theme.spacing[2]} ${props.theme.spacing[3]};
  `}
`;

// Navigation item
const NavigationItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  position: relative;
  text-decoration: none;
  color: ${props => props.theme.color.text.primary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  font-size: ${props => props.theme.typography.fontSize.sm};
  user-select: none;

  &:hover {
    background-color: ${props => props.theme.color.background.secondary};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  ${props => props.active && css`
    background-color: ${props.theme.color.primary[500]}20;
    color: ${props.theme.color.primary[600]};
    font-weight: ${props.theme.typography.fontWeight.semibold};

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 60%;
      background-color: ${props.theme.color.primary[500]};
      border-radius: 0 2px 2px 0;
    }
  `}

  ${props => props.disabled && css`
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  `}

  ${props => props.compact && css`
    padding: ${props.theme.spacing[1]} ${props.theme.spacing[2]};
    font-size: ${props.theme.typography.fontSize.xs};
  `}
`;

// Navigation group
const NavigationGroup = styled.div`
  display: flex;
  flex-direction: ${props => props.vertical ? 'column' : 'row'};
  gap: ${props => props.theme.spacing[1]};
  align-items: ${props => props.vertical ? 'stretch' : 'center'};

  ${props => !props.vertical && css`
    margin-right: ${props.theme.spacing[4]};
  `}

  ${props => props.vertical && css`
    margin-bottom: ${props.theme.spacing[4]};
  `}
`;

// Navigation group title
const GroupTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.color.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: ${props => props.theme.spacing[2]};
  padding: 0 ${props => props.theme.spacing[3]};
`;

// Breadcrumb container
const BreadcrumbContainer = styled(motion.nav)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  ${props => createGlassmorphism(props.theme, { intensity: 'subtle' })}
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  overflow-x: auto;
  white-space: nowrap;
`;

// Breadcrumb item
const BreadcrumbItem = styled(motion.span)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  color: ${props => props.active ? props.theme.color.text.primary : props.theme.color.text.secondary};
  font-weight: ${props => props.active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.normal};
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: color ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};

  &:hover {
    color: ${props => props.clickable ? props.theme.color.primary[500] : 'inherit'};
  }
`;

// Breadcrumb separator
const BreadcrumbSeparator = styled.span`
  color: ${props => props.theme.color.text.tertiary};
  font-size: ${props => props.theme.typography.fontSize.xs};
`;

// Tab container
const TabContainer = styled(motion.div)`
  display: flex;
  ${props => createGlassmorphism(props.theme, { intensity: 'light' })}
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[1]};
  position: relative;
  overflow: hidden;

  ${props => props.vertical && css`
    flex-direction: column;
    width: ${props.width || '200px'};
  `}
`;

// Tab item
const TabItem = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  border: none;
  background: transparent;
  color: ${props => props.active ? props.theme.color.text.primary : props.theme.color.text.secondary};
  font-weight: ${props => props.active ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  font-size: ${props => props.theme.typography.fontSize.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  position: relative;
  z-index: 1;
  white-space: nowrap;

  &:hover {
    color: ${props => props.theme.color.text.primary};
    background-color: ${props => props.theme.color.background.secondary}50;
  }

  ${props => props.active && css`
    background-color: ${props.theme.color.background.primary};
    box-shadow: ${props.theme.shadows.sm};
  `}

  ${props => props.disabled && css`
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  `}
`;

// Mobile menu overlay
const MobileMenuOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${props => props.theme.zIndex.overlay};
  backdrop-filter: blur(4px);
`;

// Mobile menu container
const MobileMenuContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  ${props => tradingGlassPresets.sidebar(props.theme)}
  padding: ${props => props.theme.spacing[6]} ${props => props.theme.spacing[4]};
  z-index: ${props => props.theme.zIndex.modal};
  overflow-y: auto;
`;

// Navigation component
const Navigation = forwardRef(({
    items = [],
    vertical = false,
    compact = false,
    width,
    activeItem,
    onItemClick,
    className,
    testId,
    ...props
}, ref) => {
    const { theme } = useTheme();

    const handleItemClick = (item, index) => {
        if (item.disabled) return;
        if (onItemClick) {
            onItemClick(item, index);
        }
    };

    return (
        <NavigationContainer
            ref={ref}
            vertical={vertical}
            compact={compact}
            width={width}
            className={className}
            theme={theme}
            data-testid={testId}
            {...animationPresets.fadeIn}
            {...props}
        >
            {items.map((item, index) => (
                <NavigationItem
                    key={item.key || index}
                    active={activeItem === item.key || activeItem === index}
                    disabled={item.disabled}
                    compact={compact}
                    onClick={() => handleItemClick(item, index)}
                    theme={theme}
                    {...hoverEffects.cardSubtle}
                    {...staggerAnimations.item}
                    transition={{ delay: index * 0.05 }}
                >
                    {item.icon && (
                        <Icon
                            name={item.icon}
                            size="sm"
                            color={activeItem === item.key || activeItem === index ? 'primary' : 'current'}
                        />
                    )}
                    <span>{item.label}</span>
                    {item.badge && (
                        <Label
                            size="xs"
                            badge={item.badge}
                            badgeVariant={item.badgeVariant || 'primary'}
                        />
                    )}
                </NavigationItem>
            ))}
        </NavigationContainer>
    );
});

Navigation.displayName = 'Navigation';

// NavigationGroup component
export const NavGroup = ({ title, children, vertical = false, ...props }) => {
    const { theme } = useTheme();

    return (
        <NavigationGroup vertical={vertical} theme={theme} {...props}>
            {title && <GroupTitle theme={theme}>{title}</GroupTitle>}
            {children}
        </NavigationGroup>
    );
};

// Breadcrumb component
export const Breadcrumb = forwardRef(({
    items = [],
    separator = '/',
    onItemClick,
    className,
    testId,
    ...props
}, ref) => {
    const { theme } = useTheme();

    return (
        <BreadcrumbContainer
            ref={ref}
            className={className}
            theme={theme}
            data-testid={testId}
            {...animationPresets.slideRight}
            {...props}
        >
            {items.map((item, index) => (
                <React.Fragment key={item.key || index}>
                    <BreadcrumbItem
                        active={index === items.length - 1}
                        clickable={!!onItemClick && index < items.length - 1}
                        onClick={() => onItemClick?.(item, index)}
                        theme={theme}
                        {...staggerAnimations.item}
                        transition={{ delay: index * 0.1 }}
                    >
                        {item.icon && <Icon name={item.icon} size="xs" />}
                        {item.label}
                    </BreadcrumbItem>
                    {index < items.length - 1 && (
                        <BreadcrumbSeparator theme={theme}>
                            {separator}
                        </BreadcrumbSeparator>
                    )}
                </React.Fragment>
            ))}
        </BreadcrumbContainer>
    );
});

Breadcrumb.displayName = 'Breadcrumb';

// Tabs component
export const Tabs = forwardRef(({
    items = [],
    activeTab,
    onTabChange,
    vertical = false,
    width,
    className,
    testId,
    ...props
}, ref) => {
    const { theme } = useTheme();

    return (
        <TabContainer
            ref={ref}
            vertical={vertical}
            width={width}
            className={className}
            theme={theme}
            data-testid={testId}
            {...animationPresets.fadeIn}
            {...props}
        >
            {items.map((item, index) => (
                <TabItem
                    key={item.key || index}
                    active={activeTab === item.key || activeTab === index}
                    disabled={item.disabled}
                    onClick={() => !item.disabled && onTabChange?.(item, index)}
                    theme={theme}
                    {...hoverEffects.cardSubtle}
                    {...staggerAnimations.item}
                    transition={{ delay: index * 0.05 }}
                >
                    {item.icon && (
                        <Icon
                            name={item.icon}
                            size="sm"
                            color={activeTab === item.key || activeTab === index ? 'primary' : 'current'}
                        />
                    )}
                    {item.label}
                    {item.badge && (
                        <Label
                            size="xs"
                            badge={item.badge}
                            badgeVariant={item.badgeVariant || 'neutral'}
                        />
                    )}
                </TabItem>
            ))}
        </TabContainer>
    );
});

Tabs.displayName = 'Tabs';

// Mobile Navigation component
export const MobileNavigation = forwardRef(({
    items = [],
    isOpen = false,
    onClose,
    onItemClick,
    className,
    testId,
    ...props
}, ref) => {
    const { theme } = useTheme();

    const handleItemClick = (item, index) => {
        if (item.disabled) return;
        if (onItemClick) {
            onItemClick(item, index);
        }
        if (onClose) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <MobileMenuOverlay
                        onClick={onClose}
                        theme={theme}
                        {...animationPresets.modalBackdrop}
                    />
                    <MobileMenuContainer
                        ref={ref}
                        className={className}
                        theme={theme}
                        data-testid={testId}
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        {...props}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing[6] }}>
                            <Label size="lg" weight="bold" color="primary">
                                Menu
                            </Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                leftIcon={<Icon name="close" />}
                            />
                        </div>

                        <motion.div {...staggerAnimations.container}>
                            {items.map((item, index) => (
                                <NavigationItem
                                    key={item.key || index}
                                    disabled={item.disabled}
                                    onClick={() => handleItemClick(item, index)}
                                    theme={theme}
                                    {...staggerAnimations.item}
                                    style={{ marginBottom: theme.spacing[2] }}
                                >
                                    {item.icon && <Icon name={item.icon} size="sm" />}
                                    <span>{item.label}</span>
                                    {item.badge && (
                                        <Label
                                            size="xs"
                                            badge={item.badge}
                                            badgeVariant={item.badgeVariant || 'primary'}
                                        />
                                    )}
                                </NavigationItem>
                            ))}
                        </motion.div>
                    </MobileMenuContainer>
                </>
            )}
        </AnimatePresence>
    );
});

MobileNavigation.displayName = 'MobileNavigation';

export default Navigation;