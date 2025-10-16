import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/test-utils/setup.js'],
        globals: true,
        css: true,
        coverage: {
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/test-utils/',
                '**/*.d.ts',
                '**/*.config.js',
                '**/index.js',
                '**/*.stories.js',
                'src/main.jsx'
            ],
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80
                }
            }
        },
        include: [
            'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
            'src/**/__tests__/**/*.{js,jsx,ts,tsx}'
        ],
        exclude: [
            'node_modules/',
            'dist/',
            '.git/',
            '**/*.visual.test.js',
            '**/*.perf.test.js'
        ]
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@design-system': path.resolve(__dirname, './src/design-system'),
            '@test-utils': path.resolve(__dirname, './src/test-utils')
        }
    }
});