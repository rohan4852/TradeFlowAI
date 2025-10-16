import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

/**
 * Skip link component for keyboard navigation
 * Allows users to skip to main content or other important sections
 */
const SkipLinkWrapper = styled(motion.a)`
  position: absolute;
  top: -40px;
  left: 6px;
  background: ${props => props.theme.color.primary[600]};
  color: ${props => props.theme.color.text.inverse};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.borderRadius.md};
  text-decoration: none;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm};
  z-index: ${props => props.theme.zIndex.skipLink || 9999};
  box-shadow: ${props => props.theme.shadows.lg};
  border: 2px solid ${props => props.theme.color.primary[700]};
  
  &:focus {
    top: 6px;
    outline: 2px solid ${props => props.theme.color.background.primary};
    outline-offset: 2px;
  }
  
  &:hover {
    background: ${props => props.theme.color.primary[700]};
    border-color: ${props => props.theme.color.primary[800]};
  }
  
  &:active {
    background: ${props => props.theme.color.primary[800]};
    transform: translateY(1px);
  }
`;

/**
 * SkipLink component
 * 
 * @param {string} href - Target element ID or URL
 * @param {React.ReactNode} children - Link text
 * @param {function} onClick - Optional click handler
 */
const SkipLink = ({
    href,
    children = 'Skip to main content',
    onClick,
    className,
    ...props
}) => {
    const handleClick = (event) => {
        if (onClick) {
            onClick(event);
        }

        // If href is an element ID, focus the target element
        if (href && href.startsWith('#')) {
            const targetElement = document.querySelector(href);
            if (targetElement) {
                // Make target focusable if it isn't already
                if (!targetElement.hasAttribute('tabindex')) {
                    targetElement.setAttribute('tabindex', '-1');
                }

                // Focus the target element
                setTimeout(() => {
                    targetElement.focus();
                }, 100);
            }
        }
    };

    return (
        <SkipLinkWrapper
            href={href}
            onClick={handleClick}
            className={className}
            initial={{ opacity: 0, y: -10 }}
            whileFocus={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            {...props}
        >
            {children}
        </SkipLinkWrapper>
    );
};

/**
 * SkipLinks component for multiple skip links
 */
export const SkipLinks = ({ links = [], className, ...props }) => {
    const defaultLinks = [
        { href: '#main-content', text: 'Skip to main content' },
        { href: '#navigation', text: 'Skip to navigation' },
        { href: '#footer', text: 'Skip to footer' }
    ];

    const skipLinks = links.length > 0 ? links : defaultLinks;

    return (
        <div className={className} {...props}>
            {skipLinks.map((link, index) => (
                <SkipLink
                    key={index}
                    href={link.href}
                    onClick={link.onClick}
                    style={{ left: 6 + (index * 160) }} // Offset multiple skip links
                >
                    {link.text}
                </SkipLink>
            ))}
        </div>
    );
};

export default SkipLink;