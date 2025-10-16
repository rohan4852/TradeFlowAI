#!/usr/bin/env node

/**
 * Comprehensive test runner for cross-browser and accessibility testing
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

class TestRunner {
    constructor() {
        this.results = {
            crossBrowser: {},
            accessibility: {},
            responsive: {},
            themes: {},
            performance: {}
        };

        this.config = {
            outputDir: './test-results',
            reportFormats: ['json', 'html', 'junit'],
            parallel: true,
            retries: 2,
            timeout: 30000
        };
    }

    /**
     * Run all test suites
     */
    async runAllTests(options = {}) {
        console.log('✓ Starting comprehensive test suite...\n');

        const startTime = Date.now();

        try {
            // Ensure output directory exists
            await this.ensureOutputDir();

            // Run test suites based on options
            if (options.crossBrowser !== false) {
                await this.runCrossBrowserTests();
            }

            if (options.accessibility !== false) {
                await this.runAccessibilityTests();
            }

            if (options.responsive !== false) {
                await this.runResponsiveTests();
            }

            if (options.themes !== false) {
                await this.runThemeTests();
            }

            if (options.performance !== false) {
                await this.runPerformanceTests();
            }

            // Generate comprehensive report
            const report = await this.generateReport();
            await this.saveReport(report);

            const duration = Date.now() - startTime;
            console.log(`\n✅ All tests completed in ${duration}ms`);
            console.log(`📊 Report saved to ${this.config.outputDir}/comprehensive-report.html`);

            return report;

        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            throw error;
        }
    }

    /**
     * Run cross-browser compatibility tests
     */
    async runCrossBrowserTests() {
        console.log('🌐 Running cross-browser tests...');

        try {
            const result = await this.runCommand('playwright', [
                'test',
                '--config=playwright.config.js',
                '--grep=cross-browser',
                '--reporter=json'
            ]);

            this.results.crossBrowser = JSON.parse(result.stdout);
            console.log('✅ Cross-browser tests completed');

        } catch (error) {
            console.error('❌ Cross-browser tests failed:', error.message);
            this.results.crossBrowser = { error: error.message };
        }
    }

    /**
     * Run accessibility tests
     */
    async runAccessibilityTests() {
        console.log('♿ Running accessibility tests...');

        try {
            // Run Playwright accessibility tests
            const playwrightResult = await this.runCommand('playwright', [
                'test',
                '--config=playwright.config.js',
                '--grep=accessibility',
                '--reporter=json'
            ]);

            // Run PA11y tests
            const pa11yResult = await this.runCommand('pa11y-ci', [
                '--config=.pa11yci.json',
                '--reporter=json'
            ]);

            // Run Lighthouse accessibility audit
            const lighthouseResult = await this.runCommand('lhci', [
                'autorun',
                '--config=lighthouserc.js'
            ]);

            this.results.accessibility = {
                playwright: JSON.parse(playwrightResult.stdout),
                pa11y: JSON.parse(pa11yResult.stdout),
                lighthouse: lighthouseResult.stdout
            };

            console.log('✅ Accessibility tests completed');

        } catch (error) {
            console.error('❌ Accessibility tests failed:', error.message);
            this.results.accessibility = { error: error.message };
        }
    }

    /**
     * Run responsive design tests
     */
    async runResponsiveTests() {
        console.log('📱 Running responsive design tests...');

        try {
            const result = await this.runCommand('playwright', [
                'test',
                '--config=playwright.config.js',
                '--grep=responsive',
                '--reporter=json'
            ]);

            this.results.responsive = JSON.parse(result.stdout);
            console.log('✅ Responsive tests completed');

        } catch (error) {
            console.error('❌ Responsive tests failed:', error.message);
            this.results.responsive = { error: error.message };
        }
    }

    /**
     * Run theme variation tests
     */
    async runThemeTests() {
        console.log('🎨 Running theme variation tests...');

        try {
            const result = await this.runCommand('playwright', [
                'test',
                '--config=playwright.config.js',
                '--grep=theme',
                '--reporter=json'
            ]);

            this.results.themes = JSON.parse(result.stdout);
            console.log('✅ Theme tests completed');

        } catch (error) {
            console.error('❌ Theme tests failed:', error.message);
            this.results.themes = { error: error.message };
        }
    }

    /**
     * Run performance tests
     */
    async runPerformanceTests() {
        console.log('⚡ Running performance tests...');

        try {
            // Run Lighthouse performance audit
            const lighthouseResult = await this.runCommand('lhci', [
                'autorun',
                '--config=lighthouserc.js',
                '--preset=perf'
            ]);

            // Run custom performance tests
            const customResult = await this.runCommand('npm', [
                'run',
                'test:performance'
            ]);

            this.results.performance = {
                lighthouse: lighthouseResult.stdout,
                custom: customResult.stdout
            };

            console.log('✅ Performance tests completed');

        } catch (error) {
            console.error('❌ Performance tests failed:', error.message);
            this.results.performance = { error: error.message };
        }
    }

    /**
     * Generate comprehensive test report
     */
    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: 0,
                passed: 0,
                failed: 0,
                skipped: 0,
                duration: 0
            },
            suites: {},
            recommendations: [],
            criticalIssues: []
        };

        // Process each test suite
        for (const [suiteName, results] of Object.entries(this.results)) {
            if (results.error) {
                report.suites[suiteName] = {
                    status: 'error',
                    error: results.error
                };
                continue;
            }

            const suiteReport = this.processSuiteResults(suiteName, results);
            report.suites[suiteName] = suiteReport;

            // Update summary
            report.summary.totalTests += suiteReport.totalTests || 0;
            report.summary.passed += suiteReport.passed || 0;
            report.summary.failed += suiteReport.failed || 0;
            report.summary.skipped += suiteReport.skipped || 0;
        }

        // Generate recommendations
        report.recommendations = this.generateRecommendations(report);
        report.criticalIssues = this.identifyCriticalIssues(report);

        return report;
    }

    /**
     * Process individual suite results
     */
    processSuiteResults(suiteName, results) {
        const suiteReport = {
            name: suiteName,
            status: 'unknown',
            totalTests: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            details: results
        };

        // Process based on suite type
        switch (suiteName) {
            case 'crossBrowser':
                if (results.suites) {
                    results.suites.forEach(suite => {
                        suite.specs.forEach(spec => {
                            suiteReport.totalTests++;
                            if (spec.ok) suiteReport.passed++;
                            else suiteReport.failed++;
                        });
                    });
                }
                break;

            case 'accessibility':
                if (results.playwright && results.playwright.suites) {
                    // Process Playwright accessibility results
                    results.playwright.suites.forEach(suite => {
                        suite.specs.forEach(spec => {
                            suiteReport.totalTests++;
                            if (spec.ok) suiteReport.passed++;
                            else suiteReport.failed++;
                        });
                    });
                }
                break;

            case 'responsive':
            case 'themes':
                if (results.suites) {
                    results.suites.forEach(suite => {
                        suite.specs.forEach(spec => {
                            suiteReport.totalTests++;
                            if (spec.ok) suiteReport.passed++;
                            else suiteReport.failed++;
                        });
                    });
                }
                break;
        }

        // Determine overall status
        if (suiteReport.failed === 0) {
            suiteReport.status = 'passed';
        } else if (suiteReport.passed > suiteReport.failed) {
            suiteReport.status = 'mostly-passed';
        } else {
            suiteReport.status = 'failed';
        }

        return suiteReport;
    }

    /**
     * Generate recommendations based on test results
     */
    generateRecommendations(report) {
        const recommendations = [];

        // Cross-browser recommendations
        if (report.suites.crossBrowser?.failed > 0) {
            recommendations.push({
                category: 'Cross-Browser',
                priority: 'high',
                message: 'Address cross-browser compatibility issues before deployment',
                details: 'Some features may not work correctly in all supported browsers'
            });
        }

        // Accessibility recommendations
        if (report.suites.accessibility?.failed > 0) {
            recommendations.push({
                category: 'Accessibility',
                priority: 'critical',
                message: 'Fix accessibility violations to ensure inclusive design',
                details: 'Accessibility issues can prevent users with disabilities from using the application'
            });
        }

        // Responsive design recommendations
        if (report.suites.responsive?.failed > 0) {
            recommendations.push({
                category: 'Responsive Design',
                priority: 'medium',
                message: 'Improve responsive design for better mobile experience',
                details: 'Layout issues detected on mobile and tablet devices'
            });
        }

        // Theme recommendations
        if (report.suites.themes?.failed > 0) {
            recommendations.push({
                category: 'Theming',
                priority: 'low',
                message: 'Ensure consistent theming across all components',
                details: 'Some components may not render correctly in all theme variations'
            });
        }

        // Performance recommendations
        if (report.suites.performance?.failed > 0) {
            recommendations.push({
                category: 'Performance',
                priority: 'medium',
                message: 'Optimize performance for better user experience',
                details: 'Performance metrics below recommended thresholds'
            });
        }

        return recommendations;
    }

    /**
     * Identify critical issues that need immediate attention
     */
    identifyCriticalIssues(report) {
        const criticalIssues = [];

        // Check for critical accessibility violations
        if (report.suites.accessibility?.failed > report.suites.accessibility?.totalTests * 0.1) {
            criticalIssues.push({
                type: 'accessibility',
                severity: 'critical',
                message: 'High number of accessibility violations detected',
                impact: 'Users with disabilities may not be able to use the application'
            });
        }

        // Check for widespread cross-browser issues
        if (report.suites.crossBrowser?.failed > report.suites.crossBrowser?.totalTests * 0.2) {
            criticalIssues.push({
                type: 'compatibility',
                severity: 'high',
                message: 'Significant cross-browser compatibility issues',
                impact: 'Application may not work correctly for many users'
            });
        }

        // Check for mobile usability issues
        if (report.suites.responsive?.failed > report.suites.responsive?.totalTests * 0.15) {
            criticalIssues.push({
                type: 'mobile',
                severity: 'high',
                message: 'Mobile usability issues detected',
                impact: 'Poor experience for mobile users'
            });
        }

        return criticalIssues;
    }

    /**
     * Save report in multiple formats
     */
    async saveReport(report) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        // Save JSON report
        await fs.writeFile(
            path.join(this.config.outputDir, `comprehensive-report-${timestamp}.json`),
            JSON.stringify(report, null, 2)
        );

        // Save HTML report
        const htmlReport = this.generateHTMLReport(report);
        await fs.writeFile(
            path.join(this.config.outputDir, 'comprehensive-report.html'),
            htmlReport
        );

        // Save JUnit XML report
        const junitReport = this.generateJUnitReport(report);
        await fs.writeFile(
            path.join(this.config.outputDir, `junit-report-${timestamp}.xml`),
            junitReport
        );
    }

    /**
     * Generate HTML report
     */
    generateHTMLReport(report) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .suite { margin-bottom: 30px; }
        .suite h2 { color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
        .status-passed { color: #28a745; }
        .status-failed { color: #dc3545; }
        .status-warning { color: #ffc107; }
        .recommendations { background: #e7f3ff; padding: 15px; border-radius: 5px; }
        .critical-issues { background: #ffe6e6; padding: 15px; border-radius: 5px; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Comprehensive Test Report</h1>
    <p>Generated: ${report.timestamp}</p>
    
    <div class="summary">
        <h2>Summary</h2>
        <table>
            <tr><td>Total Tests:</td><td>${report.summary.totalTests}</td></tr>
            <tr><td>Passed:</td><td class="status-passed">${report.summary.passed}</td></tr>
            <tr><td>Failed:</td><td class="status-failed">${report.summary.failed}</td></tr>
            <tr><td>Skipped:</td><td class="status-warning">${report.summary.skipped}</td></tr>
        </table>
    </div>

    ${Object.entries(report.suites).map(([name, suite]) => `
        <div class="suite">
            <h2>${name.charAt(0).toUpperCase() + name.slice(1)} Tests</h2>
            <p>Status: <span class="status-${suite.status}">${suite.status}</span></p>
            <table>
                <tr><td>Total:</td><td>${suite.totalTests}</td></tr>
                <tr><td>Passed:</td><td class="status-passed">${suite.passed}</td></tr>
                <tr><td>Failed:</td><td class="status-failed">${suite.failed}</td></tr>
            </table>
        </div>
    `).join('')}

    ${report.recommendations.length > 0 ? `
        <div class="recommendations">
            <h2>Recommendations</h2>
            <ul>
                ${report.recommendations.map(rec => `
                    <li><strong>${rec.category}:</strong> ${rec.message}</li>
                `).join('')}
            </ul>
        </div>
    ` : ''}

    ${report.criticalIssues.length > 0 ? `
        <div class="critical-issues">
            <h2>Critical Issues</h2>
            <ul>
                ${report.criticalIssues.map(issue => `
                    <li><strong>${issue.type}:</strong> ${issue.message}</li>
                `).join('')}
            </ul>
        </div>
    ` : ''}
</body>
</html>`;
    }

    /**
     * Generate JUnit XML report
     */
    generateJUnitReport(report) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="Comprehensive Tests" tests="${report.summary.totalTests}" failures="${report.summary.failed}" time="0">
    ${Object.entries(report.suites).map(([name, suite]) => `
        <testsuite name="${name}" tests="${suite.totalTests}" failures="${suite.failed}" time="0">
            ${suite.status === 'failed' ? `<failure message="${name} tests failed" />` : ''}
        </testsuite>
    `).join('')}
</testsuites>`;
    }

    /**
     * Ensure output directory exists
     */
    async ensureOutputDir() {
        try {
            await fs.access(this.config.outputDir);
        } catch {
            await fs.mkdir(this.config.outputDir, { recursive: true });
        }
    }

    /**
     * Run command and return result
     */
    async runCommand(command, args) {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true
            });

            let stdout = '';
            let stderr = '';

            process.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve({ stdout, stderr });
                } else {
                    reject(new Error(`Command failed with code ${code}: ${stderr}`));
                }
            });

            process.on('error', (error) => {
                reject(error);
            });
        });
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const runner = new TestRunner();

    const options = {
        crossBrowser: !process.argv.includes('--no-cross-browser'),
        accessibility: !process.argv.includes('--no-accessibility'),
        responsive: !process.argv.includes('--no-responsive'),
        themes: !process.argv.includes('--no-themes'),
        performance: !process.argv.includes('--no-performance')
    };

    runner.runAllTests(options)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

export default TestRunner;