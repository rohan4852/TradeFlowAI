export default {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    moduleNameMapping: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    moduleFileExtensions: ['js', 'jsx', 'json'],
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.(js|jsx)',
        '<rootDir>/src/**/?(*.)(spec|test).(js|jsx)',
    ],
    collectCoverageFrom: [
        'src/**/*.(js|jsx)',
        '!src/index.js',
        '!src/reportWebVitals.js',
        '!**/node_modules/**',
    ],
    coverageReporters: ['text', 'lcov', 'html'],
};