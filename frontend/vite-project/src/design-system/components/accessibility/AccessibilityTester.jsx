import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../atoms';
import { createGlassmorphism } from '../../effects';
import { accessibilityAudit, contrastValidation, keyboardTesting, ariaValidation } from '../../utils/accessibilityTesting';

/**
 * Accessibility testing panel component
 */
const TesterPanel = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 400px;
  max-height: 80vh;
  ${props => createGlassmorphism(props.theme, { intensity: 'strong' })}
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[4]};
  z-index: ${props => props.theme.zIndex.modal};
  box-shadow: ${props => props.theme.shadows.xl};
  border: 1px solid ${props => props.theme.color.border.primary};
  overflow-y: auto;
`;

const TesterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[4]};
  padding-bottom: ${props => props.theme.spacing[3]};
  border-bottom: 1px solid ${props => props.theme.color.border.primary};
`;

const TesterTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.color.text.primary};
  margin: 0;
`;

const TestSection = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const SectionTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.color.text.primary};
  margin: 0 0 ${props => props.theme.spacing[2]} 0;
`;

const TestResults = styled.div`
  background: ${props => props.theme.color.background.secondary};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing[3]};
  margin-top: ${props => props.theme.spacing[2]};
  font-family: ${props => props.theme.typography.fontFamily.monospace};
  font-size: ${props => props.theme.typography.fontSize.sm};
  max-height: 200px;
  overflow-y: auto;
`;

const ScoreDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const ScoreBar = styled.div`
  flex: 1;
  height: 8px;
  background: ${props => props.theme.color.background.tertiary};
  border-radius: 4px;
  overflow: hidden;
`;

const ScoreFill = styled.div`
  height: 100%;
  background: ${props => {
        if (props.score >= 90) return props.theme.color.semantic.success;
        if (props.score >= 70) return props.theme.color.semantic.warning;
        return props.theme.color.semantic.error;
    }};
  width: ${props => props.score}%;
  transition: width 0.3s ease;
`;

const ScoreText = styled.span`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => {
        if (props.score >= 90) return props.theme.color.semantic.success;
        if (props.score >= 70) return props.theme.color.semantic.warning;
        return props.theme.color.semantic.error;
    }};
`;

const IssueList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const IssueItem = styled.li`
  padding: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[1]};
  background: ${props => {
        switch (props.severity) {
            case 'critical': return props.theme.color.semantic.error + '20';
            case 'serious': return props.theme.color.semantic.warning + '20';
            case 'moderate': return props.theme.color.primary[500] + '20';
            default: return props.theme.color.background.secondary;
        }
    }};
  border-left: 3px solid ${props => {
        switch (props.severity) {
            case 'critical': return props.theme.color.semantic.error;
            case 'serious': return props.theme.color.semantic.warning;
            case 'moderate': return props.theme.color.primary[500];
            default: return props.theme.color.border.primary;
        }
    }};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
  flex-wrap: wrap;
`;

/**
 * AccessibilityTester component
 * Provides a UI for running accessibility tests and viewing results
 */
const AccessibilityTester = ({
    isOpen = false,
    onClose,
    targetContainer = null,
    className,
    ...props
}) => {
    const [isVisible, setIsVisible] = useState(isOpen);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [activeTest, setActiveTest] = useState(null);
    const containerRef = useRef(null);

    // Get target container for testing
    const getTargetContainer = () => {
        return targetContainer || document.body;
    };

    // Run full accessibility audit
    const runFullAudit = async () => {
        setIsLoading(true);
        setActiveTest('full');

        try {
            const auditResults = await accessibilityAudit.runFullAudit(getTargetContainer());
            setResults(auditResults);
        } catch (error) {
            console.error('Accessibility audit failed:', error);
            setResults({ error: error.message });
        } finally {
            setIsLoading(false);
            setActiveTest(null);
        }
    };

    // Run contrast validation
    const runContrastTest = () => {
        setIsLoading(true);
        setActiveTest('contrast');

        setTimeout(() => {
            try {
                const contrastResults = contrastValidation.validatePageContrast(getTargetContainer());
                setResults({ contrast: contrastResults });
            } catch (error) {
                setResults({ error: error.message });
            } finally {
                setIsLoading(false);
                setActiveTest(null);
            }
        }, 100);
    };

    // Run keyboard navigation test
    const runKeyboardTest = () => {
        setIsLoading(true);
        setActiveTest('keyboard');

        setTimeout(() => {
            try {
                const keyboardResults = keyboardTesting.testTabOrder(getTargetContainer());
                setResults({ keyboard: keyboardResults });
            } catch (error) {
                setResults({ error: error.message });
            } finally {
                setIsLoading(false);
                setActiveTest(null);
            }
        }, 100);
    };

    // Run ARIA validation
    const runAriaTest = () => {
        setIsLoading(true);
        setActiveTest('aria');

        setTimeout(() => {
            try {
                const ariaResults = ariaValidation.validateAriaAttributes(getTargetContainer());
                setResults({ aria: ariaResults });
            } catch (error) {
                setResults({ error: error.message });
            } finally {
                setIsLoading(false);
                setActiveTest(null);
            }
        }, 100);
    };

    // Clear results
    const clearResults = () => {
        setResults(null);
    };

    // Handle close
    const handleClose = () => {
        setIsVisible(false);
        if (onClose) onClose();
    };

    // Render test results
    const renderResults = () => {
        if (!results) return null;

        if (results.error) {
            return (
                <TestResults>
                    <div style={{ color: 'red' }}>Error: {results.error}</div>
                </TestResults>
            );
        }

        return (
            <TestResults>
                {results.score !== undefined && (
                    <ScoreDisplay>
                        <span>Score:</span>
                        <ScoreBar>
                            <ScoreFill score={results.score} />
                        </ScoreBar>
                        <ScoreText score={results.score}>{results.score}%</ScoreText>
                    </ScoreDisplay>
                )}

                {results.contrast && (
                    <div>
                        <strong>Contrast Results:</strong>
                        <div>Total elements: {results.contrast.summary.total}</div>
                        <div>Passing: {results.contrast.summary.passing}</div>
                        <div>Failing: {results.contrast.summary.failing}</div>
                    </div>
                )}

                {results.keyboard && (
                    <div>
                        <strong>Keyboard Results:</strong>
                        <div>Total elements: {results.keyboard.summary.total}</div>
                        <div>Accessible: {results.keyboard.summary.accessible}</div>
                        <div>With visible focus: {results.keyboard.summary.withVisibleFocus}</div>
                    </div>
                )}

                {results.aria && (
                    <div>
                        <strong>ARIA Results:</strong>
                        <div>Total elements: {results.aria.summary.total}</div>
                        <div>Valid: {results.aria.summary.valid}</div>
                        <div>Invalid: {results.aria.summary.invalid}</div>
                    </div>
                )}

                {results.violations && results.violations.length > 0 && (
                    <div>
                        <strong>Issues:</strong>
                        <IssueList>
                            {results.violations.slice(0, 5).map((violation, index) => (
                                <IssueItem key={index} severity={violation.impact}>
                                    <strong>{violation.id}:</strong> {violation.description}
                                </IssueItem>
                            ))}
                        </IssueList>
                    </div>
                )}

                {results.recommendations && results.recommendations.length > 0 && (
                    <div>
                        <strong>Recommendations:</strong>
                        <ul>
                            {results.recommendations.slice(0, 3).map((rec, index) => (
                                <li key={index}>{rec.action}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </TestResults>
        );
    };

    return (
        <AnimatePresence>
            {(isVisible || isOpen) && (
                <TesterPanel
                    ref={containerRef}
                    className={className}
                    initial={{ opacity: 0, x: 400 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 400 }}
                    transition={{ duration: 0.3 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="tester-title"
                    {...props}
                >
                    <TesterHeader>
                        <TesterTitle id="tester-title">
                            Accessibility Tester
                        </TesterTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            aria-label="Close accessibility tester"
                        >
                            ✕
                        </Button>
                    </TesterHeader>

                    <TestSection>
                        <SectionTitle>Run Tests</SectionTitle>
                        <ButtonGroup>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={runFullAudit}
                                disabled={isLoading}
                                loading={isLoading && activeTest === 'full'}
                            >
                                Full Audit
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={runContrastTest}
                                disabled={isLoading}
                                loading={isLoading && activeTest === 'contrast'}
                            >
                                Contrast
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={runKeyboardTest}
                                disabled={isLoading}
                                loading={isLoading && activeTest === 'keyboard'}
                            >
                                Keyboard
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={runAriaTest}
                                disabled={isLoading}
                                loading={isLoading && activeTest === 'aria'}
                            >
                                ARIA
                            </Button>
                        </ButtonGroup>

                        {results && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearResults}
                            >
                                Clear Results
                            </Button>
                        )}
                    </TestSection>

                    {results && (
                        <TestSection>
                            <SectionTitle>Results</SectionTitle>
                            {renderResults()}
                        </TestSection>
                    )}
                </TesterPanel>
            )}
        </AnimatePresence>
    );
};

/**
 * Hook for using accessibility tester
 */
export const useAccessibilityTester = () => {
    const [isOpen, setIsOpen] = useState(false);

    const openTester = () => setIsOpen(true);
    const closeTester = () => setIsOpen(false);
    const toggleTester = () => setIsOpen(!isOpen);

    return {
        isOpen,
        openTester,
        closeTester,
        toggleTester
    };
};

export default AccessibilityTester;