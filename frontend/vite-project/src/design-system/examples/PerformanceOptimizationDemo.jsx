/**
 * Performance Optimization Demo
 * Demonstrates automatic fallback modes, intelligent caching, and budget enforcement
 */

import React, { useState, useEffect, useRef } from 'react';
import usePerformanceOptimization from '../hooks/usePerformanceOptimization';
import { Button } from '../components/atoms';

const PerformanceOptimizationDemo = () => {
    const [demoState, setDemoState] = useState({
        heavyComponents: 0,
        cacheOperations: 0,
        simulatedLoad: false
    });

    const heavyComponentsRef = useRef([]);

    // Initialize performance optimization with custom configuration
    const {
        optimizationState,
        startOptimization,
        stopOptimization,
        cache,
        virtualizeComponent,
        forceFallbackMode,
        getOptimizationReport
    } = usePerformanceOptimization({
        enableAutoFallback: true,
        enableBudgetEnforcement: true,
        enableIntelligentCaching: true,
        enableComponentVirtualization: true,
        budgets: {
            maxRenderTime: 16,
            maxMemoryUsage: 100 * 1024 * 1024,
            minFrameRate: 30,
            maxComponentCount: 500,
            maxDOMNodes: 2000
        },
        updateInterval: 1000
    });

    // Heavy component that consumes resources
    const HeavyComponent = ({ id, data }) => {
        const [localState, setLocalState] = useState(0);

        useEffect(() => {
            // Simulate heavy computation
            const interval = setInterval(() => {
                setLocalState(prev => prev + 1);
            }, 100);

            return () => clearInterval(interval);
        }, []);

        // Simulate expensive render
        const expensiveCalculation = () => {
            let result = 0;
            for (let i = 0; i < 10000; i++) {
                result += Math.random();
            }
            return result;
        };

        return (
            <div
                className="heavy-component"
                style={{
                    padding: '10px',
                    margin: '5px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    background: `hsl(${id * 30}, 50%, 95%)`
                }}
                data-react-component="true"
            >
                <h4>Heavy Component #{id}</h4>
                <p>Local State: {localState}</p>
                <p>Expensive Calc: {expensiveCalculation().toFixed(2)}</p>
                <p>Data: {JSON.stringify(data).substring(0, 50)}...</p>
            </div>
        );
    };

    // Large list component for virtualization demo
    const LargeList = ({ items }) => {
        const listRef = useRef(null);

        useEffect(() => {
            if (listRef.current && items.length > 100) {
                virtualizeComponent(listRef.current, items);
            }
        }, [items, virtualizeComponent]);

        return (
            <div
                ref={listRef}
                className="large-list"
                data-large-list="true"
                style={{
                    height: '300px',
                    overflow: 'auto',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                }}
            >
                {items.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            padding: '8px',
                            borderBottom: '1px solid #eee',
                            height: '40px'
                        }}
                    >
                        Item {index}: {item}
                    </div>
                ))}
            </div>
        );
    };

    // Add heavy components to stress test
    const addHeavyComponents = (count) => {
        const newComponents = [];
        for (let i = 0; i < count; i++) {
            newComponents.push({
                id: demoState.heavyComponents + i,
                data: {
                    timestamp: Date.now(),
                    randomData: Array(100).fill().map(() => Math.random())
                }
            });
        }

        heavyComponentsRef.current = [...heavyComponentsRef.current, ...newComponents];
        setDemoState(prev => ({
            ...prev,
            heavyComponents: prev.heavyComponents + count
        }));
    };

    // Remove heavy components
    const removeHeavyComponents = () => {
        heavyComponentsRef.current = [];
        setDemoState(prev => ({
            ...prev,
            heavyComponents: 0
        }));
    };

    // Simulate cache operations
    const performCacheOperations = () => {
        const operations = [
            () => cache.set('user:1', { name: 'John', age: 30 }, { tags: ['user'] }),
            () => cache.set('user:2', { name: 'Jane', age: 25 }, { tags: ['user'] }),
            () => cache.set('post:1', { title: 'Hello', content: 'World' }, { tags: ['post'], dependencies: ['user:1'] }),
            () => cache.get('user:1'),
            () => cache.get('user:2'),
            () => cache.get('nonexistent'),
            () => cache.invalidateByTag('user'),
            () => cache.set('temp:1', 'temporary data', { ttl: 1000 })
        ];

        operations.forEach((op, index) => {
            setTimeout(op, index * 100);
        });

        setDemoState(prev => ({
            ...prev,
            cacheOperations: prev.cacheOperations + operations.length
        }));
    };

    // Simulate heavy load
    const simulateHeavyLoad = () => {
        setDemoState(prev => ({ ...prev, simulatedLoad: true }));

        // Create many DOM elements
        const container = document.createElement('div');
        container.id = 'heavy-load-container';
        for (let i = 0; i < 1000; i++) {
            const element = document.createElement('div');
            element.textContent = `Heavy element ${i}`;
            element.setAttribute('data-non-essential', 'true');
            container.appendChild(element);
        }
        document.body.appendChild(container);

        // Remove after 5 seconds
        setTimeout(() => {
            const heavyContainer = document.getElementById('heavy-load-container');
            if (heavyContainer) {
                heavyContainer.remove();
            }
            setDemoState(prev => ({ ...prev, simulatedLoad: false }));
        }, 5000);
    };

    // Get performance report
    const showPerformanceReport = () => {
        const report = getOptimizationReport();
        console.log('Performance Optimization Report:', report);
        alert('Performance report logged to console. Check developer tools.');
    };

    // Generate large list items
    const largeListItems = Array(500).fill().map((_, i) => `Large list item ${i}`);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Performance Optimization Demo</h1>

            {/* Control Panel */}
            <div style={{
                background: '#f5f5f5',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h2>Control Panel</h2>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                    <Button
                        onClick={optimizationState.isActive ? stopOptimization : startOptimization}
                        variant={optimizationState.isActive ? 'secondary' : 'primary'}
                    >
                        {optimizationState.isActive ? 'Stop' : 'Start'} Optimization
                    </Button>

                    <Button onClick={() => addHeavyComponents(10)}>
                        Add 10 Heavy Components
                    </Button>

                    <Button onClick={() => addHeavyComponents(50)}>
                        Add 50 Heavy Components
                    </Button>

                    <Button onClick={removeHeavyComponents} variant="secondary">
                        Remove All Components
                    </Button>

                    <Button onClick={performCacheOperations}>
                        Perform Cache Operations
                    </Button>

                    <Button onClick={simulateHeavyLoad} disabled={demoState.simulatedLoad}>
                        {demoState.simulatedLoad ? 'Simulating Load...' : 'Simulate Heavy Load'}
                    </Button>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Button onClick={() => forceFallbackMode('normal')} size="small">
                        Force Normal Mode
                    </Button>

                    <Button onClick={() => forceFallbackMode('reduced')} size="small">
                        Force Reduced Mode
                    </Button>

                    <Button onClick={() => forceFallbackMode('minimal')} size="small">
                        Force Minimal Mode
                    </Button>

                    <Button onClick={showPerformanceReport} size="small" variant="outline">
                        Show Performance Report
                    </Button>
                </div>
            </div>

            {/* Status Dashboard */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
            }}>
                <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <h3>Optimization Status</h3>
                    <p><strong>Active:</strong> {optimizationState.isActive ? 'Yes' : 'No'}</p>
                    <p><strong>Mode:</strong> {optimizationState.currentMode}</p>
                    <p><strong>Score:</strong> {optimizationState.performanceScore}/100</p>
                    <p><strong>Active Optimizations:</strong> {optimizationState.activeOptimizations.length}</p>
                </div>

                <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <h3>Budget Violations</h3>
                    <p><strong>Count:</strong> {optimizationState.budgetViolations.length}</p>
                    {optimizationState.budgetViolations.slice(-3).map((violation, index) => (
                        <div key={index} style={{ fontSize: '12px', color: violation.severity === 'critical' ? 'red' : 'orange' }}>
                            {violation.type}: {violation.severity}
                        </div>
                    ))}
                </div>

                <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <h3>Cache Statistics</h3>
                    {optimizationState.cacheStats ? (
                        <>
                            <p><strong>Size:</strong> {optimizationState.cacheStats.size}/{optimizationState.cacheStats.maxSize}</p>
                            <p><strong>Hit Rate:</strong> {(optimizationState.cacheStats.hitRate * 100).toFixed(1)}%</p>
                            <p><strong>Efficiency:</strong> {optimizationState.cacheStats.efficiency?.toFixed(1) || 'N/A'}</p>
                        </>
                    ) : (
                        <p>No cache data available</p>
                    )}
                </div>

                <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <h3>Demo Statistics</h3>
                    <p><strong>Heavy Components:</strong> {demoState.heavyComponents}</p>
                    <p><strong>Cache Operations:</strong> {demoState.cacheOperations}</p>
                    <p><strong>Simulated Load:</strong> {demoState.simulatedLoad ? 'Active' : 'Inactive'}</p>
                </div>
            </div>

            {/* Performance Mode Indicator */}
            {optimizationState.currentMode !== 'normal' && (
                <div style={{
                    background: optimizationState.currentMode === 'minimal' ? '#ffebee' : '#fff3e0',
                    border: `1px solid ${optimizationState.currentMode === 'minimal' ? '#f44336' : '#ff9800'}`,
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: optimizationState.currentMode === 'minimal' ? '#d32f2f' : '#f57c00' }}>
                        Performance Mode: {optimizationState.currentMode.toUpperCase()}
                    </h3>
                    <p style={{ margin: 0 }}>
                        {optimizationState.currentMode === 'minimal'
                            ? 'Critical performance issues detected. Non-essential features disabled.'
                            : 'Performance degradation detected. Some optimizations applied.'
                        }
                    </p>
                </div>
            )}

            {/* Heavy Components Section */}
            <div style={{ marginBottom: '20px' }}>
                <h2>Heavy Components ({heavyComponentsRef.current.length})</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '10px',
                    maxHeight: '400px',
                    overflow: 'auto'
                }}>
                    {heavyComponentsRef.current.map(component => (
                        <HeavyComponent
                            key={component.id}
                            id={component.id}
                            data={component.data}
                        />
                    ))}
                </div>
            </div>

            {/* Virtualization Demo */}
            <div style={{ marginBottom: '20px' }}>
                <h2>Virtualization Demo</h2>
                <p>This list contains 500 items but only renders visible ones:</p>
                <LargeList items={largeListItems} />
            </div>

            {/* Performance Tips */}
            <div style={{
                background: '#e8f5e8',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #4caf50'
            }}>
                <h2>Performance Optimization Features</h2>
                <ul>
                    <li><strong>Automatic Fallback Modes:</strong> System automatically reduces visual complexity when performance degrades</li>
                    <li><strong>Intelligent Caching:</strong> Smart caching with TTL, tags, and dependency tracking</li>
                    <li><strong>Budget Enforcement:</strong> Automated actions when performance budgets are exceeded</li>
                    <li><strong>Component Virtualization:</strong> Large lists are automatically virtualized</li>
                    <li><strong>Real-time Monitoring:</strong> Continuous performance tracking and optimization</li>
                </ul>

                <h3>Try This:</h3>
                <ol>
                    <li>Start optimization monitoring</li>
                    <li>Add many heavy components to stress the system</li>
                    <li>Watch as the system automatically applies optimizations</li>
                    <li>Force different fallback modes to see the effects</li>
                    <li>Check the performance report in the console</li>
                </ol>
            </div>
        </div>
    );
};

export default PerformanceOptimizationDemo;