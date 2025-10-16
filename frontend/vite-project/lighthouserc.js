module.exports = {
    ci: {
        collect: {
            url: [
                'http://localhost:5173',
                'http://localhost:5173/dashboard',
                'http://localhost:5173/charts',
                'http://localhost:5173/portfolio'
            ],
            startServerCommand: 'npm run dev',
            startServerReadyPattern: 'Local:.*:5173',
            startServerReadyTimeout: 30000,
            numberOfRuns: 3,
            settings: {
                chromeFlags: '--no-sandbox --disable-dev-shm-usage',
                preset: 'desktop',
                onlyCategories: ['accessibility', 'performance', 'best-practices'],
                skipAudits: [
                    'uses-http2',
                    'redirects-http'
                ]
            }
        },
        assert: {
            assertions: {
                'categories:accessibility': ['error', { minScore: 0.9 }],
                'categories:performance': ['warn', { minScore: 0.8 }],
                'categories:best-practices': ['warn', { minScore: 0.9 }],
                'color-contrast': 'error',
                'heading-order': 'error',
                'label': 'error',
                'landmark-one-main': 'error',
                'meta-viewport': 'error',
                'button-name': 'error',
                'link-name': 'error',
                'image-alt': 'error',
                'input-image-alt': 'error',
                'form-field-multiple-labels': 'error',
                'frame-title': 'error',
                'duplicate-id': 'error'
            }
        },
        upload: {
            target: 'temporary-public-storage'
        },
        server: {
            port: 9001,
            storage: './lighthouse-ci-results'
        }
    }
};