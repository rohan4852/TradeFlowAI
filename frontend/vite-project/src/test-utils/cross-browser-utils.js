import { devices } from '@playwright/test';

/**
 * Cross-browser testing utilities for comprehensive browser compatibility testing
 */
export class CrossBrowserTester {
    constructor() {
        this.supportedBrowsers = [
            'chromium',
            'firefox',
            'webkit',
            'edge'
        ];

        this.deviceConfigs = {
            desktop: [
                { name: 'Desktop Chrome', ...devices['Desktop Chrome'] },
                { name: 'Desktop Firefox', ...devices['Desktop Firefox'] },
                { name: 'Desktop Safari', ...devices['Desktop Safari'] },
                { name: 'Desktop Edge', ...devices['Desktop Edge'] }
            ],
            mobile: [
                { name: 'iPhone 12', ...devices['iPhone 12'] },
                { name: 'iPhone 12 Pro', ...devices['iPhone 12 Pro'] },
                { name: 'Pixel 5', ...devices['Pixel 5'] },
                { name: 'Samsung Galaxy S21', ...devices['Galaxy S21'] }
            ],
            tablet: [
                { name: 'iPad Pro', ...devices['iPad Pro'] },
                { name: 'iPad Pro landscape', ...devices['iPad Pro landscape'] },
                { name: 'Galaxy Tab S4', ...devices['Galaxy Tab S4'] }
            ]
        };

        this.accessibilityConfigs = {
            highContrast: {
                colorScheme: 'dark',
                forcedColors: 'active'
            },
            reducedMotion: {
                reducedMotion: 'reduce'
            },
            largeText: {
                deviceScaleFactor: 1.5
            }
        };
    }

    /**
     * Get browser-specific test configurations
     */
    getBrowserConfigs() {
        return this.supportedBrowsers.map(browser => ({
            name: browser,
            use: this.getBrowserSpecificSettings(browser)
        }));
    }

    /**
     * Get browser-specific settings and workarounds
     */
    getBrowserSpecificSettings(browserName) {
        const baseSettings = {
            screenshot: 'only-on-failure',
            video: 'retain-on-failure',
            trace: 'on-first-retry'
        };

        switch (browserName) {
            case 'webkit':
                return {
                    ...baseSettings,
                    // Safari-specific settings
                    launchOptions: {
                        slowMo: 100 // Safari can be slower
                    },
                    contextOptions: {
                        permissions: ['camera', 'microphone'] // Safari permission handling
                    }
                };

            case 'firefox':
                return {
                    ...baseSettings,
                    // Firefox-specific settings
                    launchOptions: {
                        firefoxUserPrefs: {
                            'media.navigator.streams.fake': true,
                            'media.navigator.permission.disabled': true
                        }
                    }
                };

            case 'chromium':
                return {
                    ...baseSettings,
                    // Chrome-specific settings
                    launchOptions: {
                        args: [
                            '--disable-web-security',
                            '--disable-features=TranslateUI',
                            '--disable-ipc-flooding-protection'
                        ]
                    }
                };

            case 'edge':
                return {
                    ...baseSettings,
                    // Edge-specific settings
                    channel: 'msedge'
                };

            default:
                return baseSettings;
        }
    }

    /**
     * Get device-specific test configurations
     */
    getDeviceConfigs(category = 'all') {
        if (category === 'all') {
            return [
                ...this.deviceConfigs.desktop,
                ...this.deviceConfigs.mobile,
                ...this.deviceConfigs.tablet
            ];
        }

        return this.deviceConfigs[category] || [];
    }

    /**
     * Get accessibility-focused test configurations
     */
    getAccessibilityConfigs() {
        return Object.entries(this.accessibilityConfigs).map(([name, config]) => ({
            name: `Accessibility - ${name}`,
            use: {
                ...devices['Desktop Chrome'],
                ...config
            }
        }));
    }

    /**
     * Generate comprehensive test matrix
     */
    generateTestMatrix(options = {}) {
        const {
            includeBrowsers = true,
            includeDevices = true,
            includeAccessibility = true,
            deviceCategory = 'all'
        } = options;

        const matrix = [];

        if (includeBrowsers) {
            matrix.push(...this.getBrowserConfigs());
        }

        if (includeDevices) {
            matrix.push(...this.getDeviceConfigs(deviceCategory));
        }

        if (includeAccessibility) {
            matrix.push(...this.getAccessibilityConfigs());
        }

        return matrix;
    }

    /**
     * Browser feature detection utilities
     */
    getBrowserFeatures() {
        return {
            // CSS features
            css: {
                grid: 'CSS.supports("display", "grid")',
                flexbox: 'CSS.supports("display", "flex")',
                customProperties: 'CSS.supports("--custom", "property")',
                backdrop: 'CSS.supports("backdrop-filter", "blur(10px)")'
            },

            // JavaScript features
            javascript: {
                es6Modules: 'typeof Symbol !== "undefined"',
                asyncAwait: 'typeof (async () => {}) === "function"',
                webComponents: 'typeof customElements !== "undefined"',
                intersectionObserver: 'typeof IntersectionObserver !== "undefined"'
            },

            // Web APIs
            webAPIs: {
                webGL: 'typeof WebGLRenderingContext !== "undefined"',
                webWorkers: 'typeof Worker !== "undefined"',
                serviceWorkers: 'typeof navigator.serviceWorker !== "undefined"',
                webSockets: 'typeof WebSocket !== "undefined"',
                localStorage: 'typeof Storage !== "undefined"',
                sessionStorage: 'typeof sessionStorage !== "undefined"',
                indexedDB: 'typeof indexedDB !== "undefined"'
            },

            // Media features
            media: {
                webRTC: 'typeof RTCPeerConnection !== "undefined"',
                mediaDevices: 'typeof navigator.mediaDevices !== "undefined"',
                getUserMedia: 'typeof navigator.getUserMedia !== "undefined"'
            }
        };
    }

    /**
     * Test browser feature support
     */
    async testBrowserFeatures(page, features = null) {
        const featuresToTest = features || this.getBrowserFeatures();
        const results = {};

        for (const [category, categoryFeatures] of Object.entries(featuresToTest)) {
            results[category] = {};

            for (const [feature, testCode] of Object.entries(categoryFeatures)) {
                try {
                    results[category][feature] = await page.evaluate(testCode);
                } catch (error) {
                    results[category][feature] = false;
                }
            }
        }

        return results;
    }

    /**
     * Browser-specific workarounds and polyfills
     */
    getBrowserWorkarounds() {
        return {
            webkit: {
                // Safari workarounds
                dateInputPolyfill: `
          if (!Modernizr.inputtypes.date) {
            $('input[type="date"]').datepicker();
          }
        `,
                flexboxFixes: `
          .flex-container {
            display: -webkit-flex;
            display: flex;
          }
        `
            },

            firefox: {
                // Firefox workarounds
                scrollbarStyling: `
          /* Firefox scrollbar styling */
          * {
            scrollbar-width: thin;
            scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
          }
        `
            },

            edge: {
                // Edge workarounds
                gridSupport: `
          @supports not (display: grid) {
            .grid-container {
              display: flex;
              flex-wrap: wrap;
            }
          }
        `
            }
        };
    }

    /**
     * Performance testing configurations for different browsers
     */
    getPerformanceConfigs() {
        return {
            chromium: {
                metrics: ['FCP', 'LCP', 'FID', 'CLS', 'TTFB'],
                thresholds: {
                    FCP: 1800,
                    LCP: 2500,
                    FID: 100,
                    CLS: 0.1,
                    TTFB: 600
                }
            },
            firefox: {
                metrics: ['FCP', 'LCP', 'TTFB'],
                thresholds: {
                    FCP: 2000,
                    LCP: 3000,
                    TTFB: 800
                }
            },
            webkit: {
                metrics: ['FCP', 'LCP', 'TTFB'],
                thresholds: {
                    FCP: 2200,
                    LCP: 3200,
                    TTFB: 900
                }
            }
        };
    }

    /**
     * Generate browser compatibility report
     */
    generateCompatibilityReport(testResults) {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: 0,
                passed: 0,
                failed: 0,
                browsers: {}
            },
            details: testResults,
            recommendations: []
        };

        // Process test results
        for (const [browser, results] of Object.entries(testResults)) {
            report.summary.browsers[browser] = {
                total: results.length,
                passed: results.filter(r => r.status === 'passed').length,
                failed: results.filter(r => r.status === 'failed').length
            };

            report.summary.totalTests += results.length;
            report.summary.passed += report.summary.browsers[browser].passed;
            report.summary.failed += report.summary.browsers[browser].failed;
        }

        // Generate recommendations
        if (report.summary.browsers.webkit?.failed > 0) {
            report.recommendations.push('Consider Safari-specific CSS prefixes and polyfills');
        }

        if (report.summary.browsers.firefox?.failed > 0) {
            report.recommendations.push('Review Firefox-specific rendering differences');
        }

        if (report.summary.failed > report.summary.totalTests * 0.1) {
            report.recommendations.push('High failure rate detected - review cross-browser compatibility');
        }

        return report;
    }
}

/**
 * Cross-browser test helpers
 */
export const crossBrowserHelpers = {
    /**
     * Test component across all supported browsers
     */
    testAcrossBrowsers: async (testFn, options = {}) => {
        const tester = new CrossBrowserTester();
        const configs = tester.getBrowserConfigs();
        const results = {};

        for (const config of configs) {
            try {
                results[config.name] = await testFn(config);
            } catch (error) {
                results[config.name] = { error: error.message };
            }
        }

        return results;
    },

    /**
     * Test responsive behavior across devices
     */
    testAcrossDevices: async (testFn, deviceCategory = 'all') => {
        const tester = new CrossBrowserTester();
        const configs = tester.getDeviceConfigs(deviceCategory);
        const results = {};

        for (const config of configs) {
            try {
                results[config.name] = await testFn(config);
            } catch (error) {
                results[config.name] = { error: error.message };
            }
        }

        return results;
    },

    /**
     * Test accessibility across different configurations
     */
    testAccessibilityConfigs: async (testFn) => {
        const tester = new CrossBrowserTester();
        const configs = tester.getAccessibilityConfigs();
        const results = {};

        for (const config of configs) {
            try {
                results[config.name] = await testFn(config);
            } catch (error) {
                results[config.name] = { error: error.message };
            }
        }

        return results;
    },

    /**
     * Browser-specific test utilities
     */
    browserSpecific: {
        isWebKit: (browserName) => browserName === 'webkit',
        isFirefox: (browserName) => browserName === 'firefox',
        isChromium: (browserName) => browserName === 'chromium',
        isEdge: (browserName) => browserName === 'edge',

        skipIfBrowser: (browserName, skipBrowsers) => {
            return skipBrowsers.includes(browserName);
        },

        onlyInBrowser: (browserName, targetBrowsers) => {
            return targetBrowsers.includes(browserName);
        }
    }
};

export default CrossBrowserTester;