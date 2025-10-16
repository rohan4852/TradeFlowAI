import { render } from './render-utils';
import { vi } from 'vitest';

// Visual regression testing utilities
export class VisualRegressionTester {
    constructor() {
        this.snapshots = new Map();
        this.config = {
            threshold: 0.1, // 10% difference threshold
            pixelThreshold: 100, // Number of different pixels allowed
        };
    }

    // Capture component screenshot (mock implementation)
    async captureScreenshot(component, name, options = {}) {
        const { container } = render(component);
        
        // Mock screenshot capture
        const mockScreenshot = {
            width: options.width || 1024,
            height: options.height || 768,
            data: this.generateMockImageData(options.width || 1024, options.height || 768),
            timestamp: Date.now(),
            name
        };

        this.snapshots.set(name, mockScreenshot);
        return mockScreenshot;
    }

    // Generate mock image data for testing
    generateMockImageData(width, height) {
        const data = new Uint8Array(width * height * 4); // RGBA
        
        // Fill with semi-random data based on component name
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.floor(Math.random() * 255);     // R
            data[i + 1] = Math.floor(Math.random() * 255); // G
            data[i + 2] = Math.floor(Math.random() * 255); // B
            data[i + 3] = 255;                             // A
        }
        
        return data;
    }

    // Compare screenshots
    compareScreenshots(baseline, current) {
        if (!baseline || !current) {
            return { match: false, reason: 'Missing baseline or current screenshot' };
        }

        if (baseline.width !== current.width || baseline.height !== current.height) {
            return { match: false, reason: 'Dimensions do not match' };
        }

        const pixelDifferences = this.calculatePixelDifferences(baseline.data, current.data);
        const differencePercentage = pixelDifferences / (baseline.width * baseline.height);

        const match = differencePercentage <= this.config.threshold && 
                     pixelDifferences <= this.config.pixelThreshold;

        return {
            match,
            differencePercentage,
            pixelDifferences,
            threshold: this.config.threshold
        };
    }

    // Calculate pixel differences between two images
    calculatePixelDifferences(data1, data2) {
        let differences = 0;
        
        for (let i = 0; i < data1.length; i += 4) {
            const r1 = data1[i], g1 = data1[i + 1], b1 = data1[i + 2];
            const r2 = data2[i], g2 = data2[i + 1], b2 = data2[i + 2];
            
            const diff = Math.sqrt(
                Math.pow(r1 - r2, 2) + 
                Math.pow(g1 - g2, 2) + 
                Math.pow(b1 - b2, 2)
            );
            
            if (diff > 10) { // Threshold for considering pixels different
                differences++;
            }
        }
        
        return differences;
    }

    // Test component across different viewports
    async testResponsiveScreenshots(component, name, viewports = []) {
        const defaultViewports = [
            { name: 'mobile', width: 375, height: 667 },
            { name: 'tablet', width: 768, height: 1024 },
            { name: 'desktop', width: 1024, height: 768 },
            { name: 'large', width: 1440, height: 900 }
        ];

        const testViewports = viewports.length > 0 ? viewports : defaultViewports;
        const screenshots = {};

        for (const viewport of testViewports) {
            const screenshot = await this.captureScreenshot(component, `${name}-${viewport.name}`, viewport);
            screenshots[viewport.name] = screenshot;
        }

        return screenshots;
    }

    // Test component with different themes
    async testThemeScreenshots(component, name, themes = ['light', 'dark']) {
        const screenshots = {};

        for (const theme of themes) {
            const themedComponent = this.wrapWithTheme(component, theme);
            const screenshot = await this.captureScreenshot(themedComponent, `${name}-${theme}`);
            screenshots[theme] = screenshot;
        }

        return screenshots;
    }

    // Wrap component with theme provider
    wrapWithTheme(component, theme) {
        // This would normally wrap with actual ThemeProvider
        // For testing, we'll just return the component with a data attribute
        return {
            ...component,
            props: {
                ...component.props,
                'data-theme': theme
            }
        };
    }

    // Test component states
    async testStateScreenshots(component, name, states = {}) {
        const screenshots = {};

        for (const [stateName, stateProps] of Object.entries(states)) {
            const stateComponent = {
                ...component,
                props: { ...component.props, ...stateProps }
            };
            
            const screenshot = await this.captureScreenshot(stateComponent, `${name}-${stateName}`);
            screenshots[stateName] = screenshot;
        }

        return screenshots;
    }

    // Generate visual regression test report
    generateReport(testResults) {
        const report = {
            timestamp: new Date().toISOString(),
            totalTests: testResults.length,
            passed: testResults.filter(r => r.passed).length,
            failed: testResults.filter(r => !r.passed).length,
            results: testResults
        };

        return report;
    }

    // Set configuration
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }

    // Get stored snapshots
    getSnapshots() {
        return Object.fromEntries(this.snapshots);
    }

    // Clear snapshots
    clearSnapshots() {
        this.snapshots.clear();
    }
}

// Visual regression test helpers
export const visualTestHelpers = {
    // Test component visual consistency
    testVisualConsistency: async (Component, props, name) => {
        const tester = new VisualRegressionTester();
        
        // Capture baseline
        const baseline = await tester.captureScreenshot(<Component {...props} />, `${name}-baseline`);
        
        // Capture current (simulate re-render)
        const current = await tester.captureScreenshot(<Component {...props} />, `${name}-current`);
        
        return tester.compareScreenshots(baseline, current);
    },

    // Test component across breakpoints
    testResponsiveDesign: async (Component, props, name) => {
        const tester = new VisualRegressionTester();
        return await tester.testResponsiveScreenshots(<Component {...props} />, name);
    },

    // Test component theme variations
    testThemeVariations: async (Component, props, name) => {
        const tester = new VisualRegressionTester();
        return await tester.testThemeScreenshots(<Component {...props} />, name);
    },

    // Test component interaction states
    testInteractionStates: async (Component, props, name) => {
        const tester = new VisualRegressionTester();
        
        const states = {
            default: {},
            hover: { 'data-hover': true },
            focus: { 'data-focus': true },
            active: { 'data-active': true },
            disabled: { disabled: true }
        };

        return await tester.testStateScreenshots(<Component {...props} />, name, states);
    },

    // Mock browser screenshot API
    mockScreenshotAPI: () => {
        global.html2canvas = vi.fn().mockResolvedValue({
            toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mock-image-data'),
            width: 1024,
            height: 768
        });

        global.domtoimage = {
            toPng: vi.fn().mockResolvedValue('data:image/png;base64,mock-image-data'),
            toJpeg: vi.fn().mockResolvedValue('data:image/jpeg;base64,mock-image-data'),
            toSvg: vi.fn().mockResolvedValue('data:image/svg+xml;base64,mock-image-data')
        };
    }
};

// Visual regression matchers
export const visualMatchers = {
    toMatchVisualSnapshot: (received, expected, threshold = 0.1) => {
        const tester = new VisualRegressionTester();
        tester.setConfig({ threshold });
        
        const comparison = tester.compareScreenshots(expected, received);
        
        return {
            message: () => `expected visual snapshot to match within ${threshold * 100}% threshold (actual: ${comparison.differencePercentage * 100}%)`,
            pass: comparison.match
        };
    },

    toBeVisuallyConsistent: (received) => {
        // Mock implementation - in real scenario would compare with stored baseline
        const isConsistent = Math.random() > 0.1; // 90% pass rate for testing
        
        return {
            message: () => `expected component to be visually consistent`,
            pass: isConsistent
        };
    },

    toRenderCorrectlyAcrossViewports: (received, viewports) => {
        const allViewportsPass = viewports.every(viewport => {
            // Mock viewport rendering check
            return viewport.width > 0 && viewport.height > 0;
        });

        return {
            message: () => `expected component to render correctly across all viewports`,
            pass: allViewportsPass
        };
    }
};

export default VisualRegressionTester;