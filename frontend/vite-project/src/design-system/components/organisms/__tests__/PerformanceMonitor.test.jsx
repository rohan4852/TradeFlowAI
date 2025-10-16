/**
 * PerformanceMonitor Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeProvider } from '../../../ThemeProvider';
import { PerformanceMonitor } from '../PerformanceMonitor';

// Mock performance APIs
const mockPerformance = {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    memory: {
        usedJSHeapSize: 50 * 1024 * 1024, // 50MB
        totalJSHeapSize: 100 * 1024 * 1024, // 100MB
        jsHeapSizeLimit: 2 * 1024 * 1024 * 1024 // 2GB
    }
};

// Mock PerformanceObserver
const mockPerformanceObserver = vi.fn();
mockPerformanceObserver.prototype.observe = vi.fn();
mockPerformanceObserver.prototype.disconnect = vi.fn();

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn(cb => setTimeout(cb, 16));

// Mock usePerformanceMonitoring hook
const mockMetrics = {
    frameRate: 60,
    averageRenderTime: 12.5,
    memoryUsage: {
        used: 50 * 1024 * 1024,
        total: 100 * 1024 * 1024,
        limit: 2 * 1024 * 1024 * 1024,
        percentage: 2.5
    },
    componentCount: 25,
    performanceScore: 95,
    memoryTrend: 'stable'
};

const mockUsePerformanceMonitoring = {
    metrics: mockMetrics,
    isMonitoring: true,
    startMonitoring: vi.fn(),
    stopMonitoring: vi.fn(),
    getPerformanceReport: vi.fn(() => mockMetrics),
    clearMetrics: vi.fn()
};

vi.mock('../../../hooks/usePerformanceMonitoring', () => ({
    usePerformanceMonitoring: () => mockUsePerformanceMonitoring
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
    <ThemeProvider>
        {children}
    </ThemeProvider>
);

describe('PerformanceMonitor', () => {
    beforeEach(() => {
        // Setup global mocks
        global.performance = mockPerformance;
        global.PerformanceObserver = mockPerformanceObserver;
        global.requestAnimationFrame = mockRequestAnimationFrame;

        // Reset all mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Rendering', () => {
        it('renders performance monitor when visible', () => {
            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
            expect(screen.getByText('Frame Rate:')).toBeInTheDocument();
            expect(screen.getByText('60.0 FPS')).toBeInTheDocument();
        });

        it('does not render when not visible', () => {
            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={false} />
                </TestWrapper>
            );

            expect(screen.queryByText('Performance Monitor')).not.toBeInTheDocument();
        });

        it('renders minimized state correctly', async () => {
            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            const toggleButton = screen.getByLabelText('Minimize monitor');
            fireEvent.click(toggleButton);

            await waitFor(() => {
                expect(screen.queryByText('Frame Rate:')).not.toBeInTheDocument();
            });
        });
    });

    describe('Metrics Display', () => {
        it('displays frame rate metrics correctly', () => {
            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            expect(screen.getByText('60.0 FPS')).toBeInTheDocument();
        });

        it('displays render time metrics correctly', () => {
            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            expect(screen.getByText('12.5 ms')).toBeInTheDocument();
        });

        it('displays memory usage correctly', () => {
            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            expect(screen.getByText('47.7 MB')).toBeInTheDocument();
        });

        it('displays component count correctly', () => {
            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            expect(screen.getByText('25')).toBeInTheDocument();
        });

        it('displays performance score correctly', () => {
            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            expect(screen.getByText('95/100')).toBeInTheDocument();
        });
    });

    describe('Status Colors', () => {
        it('shows good status for high frame rate', () => {
            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            const fpsValue = screen.getByText('60.0 FPS');
            expect(fpsValue).toHaveStyle({ color: expect.stringContaining('success') });
        });

        it('shows warning status for low frame rate', () => {
            const lowFpsMetrics = {
                ...mockMetrics,
                frameRate: 25
            };

            vi.mocked(mockUsePerformanceMonitoring.metrics).frameRate = 25;

            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            // Component should show warning color for low FPS
            expect(screen.getByText('25.0 FPS')).toBeInTheDocument();
        });

        it('shows critical status for very low frame rate', () => {
            vi.mocked(mockUsePerformanceMonitoring.metrics).frameRate = 10;

            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            expect(screen.getByText('10.0 FPS')).toBeInTheDocument();
        });
    });

    describe('Alerts', () => {
        it('displays performance alerts when enabled', async () => {
            // Mock low performance metrics that should trigger alerts
            const alertMetrics = {
                ...mockMetrics,
                frameRate: 20, // Below 30 FPS threshold
                averageRenderTime: 25, // Above 16ms threshold
                memoryUsage: {
                    ...mockMetrics.memoryUsage,
                    percentage: 85 // Above 80% threshold
                }
            };

            vi.mocked(mockUsePerformanceMonitoring.metrics) = alertMetrics;

            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} enableAlerts={true} />
                </TestWrapper>
            );

            // Wait for alerts to be processed
            await waitFor(() => {
                expect(screen.getByText(/Low frame rate/)).toBeInTheDocument();
            });
        });

        it('calls onAlert callback when alerts are triggered', async () => {
            const onAlert = vi.fn();

            const alertMetrics = {
                ...mockMetrics,
                frameRate: 15 // Critical threshold
            };

            vi.mocked(mockUsePerformanceMonitoring.metrics) = alertMetrics;

            render(
                <TestWrapper>
                    <PerformanceMonitor
                        isVisible={true}
                        enableAlerts={true}
                        onAlert={onAlert}
                    />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(onAlert).toHaveBeenCalled();
            });
        });
    });

    describe('Controls', () => {
        it('calls startMonitoring when start button is clicked', () => {
            vi.mocked(mockUsePerformanceMonitoring.isMonitoring) = false;

            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            const startButton = screen.getByText('Start');
            fireEvent.click(startButton);

            expect(mockUsePerformanceMonitoring.startMonitoring).toHaveBeenCalled();
        });

        it('calls stopMonitoring when stop button is clicked', () => {
            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            const stopButton = screen.getByText('Stop');
            fireEvent.click(stopButton);

            expect(mockUsePerformanceMonitoring.stopMonitoring).toHaveBeenCalled();
        });

        it('calls clearMetrics when clear button is clicked', () => {
            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            const clearButton = screen.getByText('Clear');
            fireEvent.click(clearButton);

            expect(mockUsePerformanceMonitoring.clearMetrics).toHaveBeenCalled();
        });
    });

    describe('Mini Chart', () => {
        it('renders canvas element for mini chart', () => {
            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            const canvas = screen.getByRole('img', { hidden: true }); // Canvas has img role
            expect(canvas).toBeInTheDocument();
        });

        it('updates chart when metrics change', async () => {
            const { rerender } = render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            // Change metrics
            vi.mocked(mockUsePerformanceMonitoring.metrics).frameRate = 45;

            rerender(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('45.0 FPS')).toBeInTheDocument();
            });
        });
    });

    describe('Responsive Behavior', () => {
        it('adapts to mobile viewport', () => {
            // Mock mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });

            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
        });
    });

    describe('Memory Leak Detection', () => {
        it('shows memory leak alert when trend is increasing', async () => {
            const leakMetrics = {
                ...mockMetrics,
                memoryTrend: 'increasing'
            };

            vi.mocked(mockUsePerformanceMonitoring.metrics) = leakMetrics;

            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} enableAlerts={true} />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText(/Potential memory leak detected/)).toBeInTheDocument();
            });
        });
    });

    describe('Performance Thresholds', () => {
        it('correctly identifies critical performance issues', () => {
            const criticalMetrics = {
                ...mockMetrics,
                frameRate: 10, // Critical
                averageRenderTime: 40, // Critical
                memoryUsage: {
                    ...mockMetrics.memoryUsage,
                    percentage: 95 // Critical
                }
            };

            vi.mocked(mockUsePerformanceMonitoring.metrics) = criticalMetrics;

            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            expect(screen.getByText('10.0 FPS')).toBeInTheDocument();
            expect(screen.getByText('40.0 ms')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('provides proper ARIA labels for controls', () => {
            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            expect(screen.getByLabelText('Minimize monitor')).toBeInTheDocument();
        });

        it('supports keyboard navigation', () => {
            render(
                <TestWrapper>
                    <PerformanceMonitor isVisible={true} />
                </TestWrapper>
            );

            const toggleButton = screen.getByLabelText('Minimize monitor');
            toggleButton.focus();
            expect(document.activeElement).toBe(toggleButton);
        });
    });

    describe('Configuration', () => {
        it('respects updateInterval configuration', () => {
            render(
                <TestWrapper>
                    <PerformanceMonitor
                        isVisible={true}
                        updateInterval={2000}
                    />
                </TestWrapper>
            );

            expect(mockUsePerformanceMonitoring.startMonitoring).toHaveBeenCalled();
        });

        it('respects position configuration', () => {
            render(
                <TestWrapper>
                    <PerformanceMonitor
                        isVisible={true}
                        position="bottom-left"
                    />
                </TestWrapper>
            );

            expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
        });
    });
});