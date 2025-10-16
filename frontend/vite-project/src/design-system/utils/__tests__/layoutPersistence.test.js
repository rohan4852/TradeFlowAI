import {
    saveLayout,
    loadLayout,
    getStoredLayouts,
    deleteLayout,
    saveUserPreferences,
    getUserPreferences,
    validateLayout,
    exportLayout,
    importLayout,
    clearAllData
} from '../layoutPersistence';

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};

global.localStorage = localStorageMock;

describe('layoutPersistence', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('saveLayout', () => {
        it('saves layout to localStorage', () => {
            const items = [
                { id: '1', x: 0, y: 0, width: 2, height: 1 }
            ];
            const config = { columns: 12 };

            localStorageMock.getItem.mockReturnValue('{}');

            const result = saveLayout('test-layout', items, config);

            expect(result).toBe(true);
            expect(localStorageMock.setItem).toHaveBeenCalled();
        });

        it('handles save errors gracefully', () => {
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('Storage full');
            });

            const result = saveLayout('test-layout', []);

            expect(result).toBe(false);
        });
    });

    describe('loadLayout', () => {
        it('loads layout from localStorage', () => {
            const mockLayout = {
                id: 'test-layout',
                items: [{ id: '1', x: 0, y: 0, width: 2, height: 1 }]
            };

            localStorageMock.getItem.mockReturnValue(
                JSON.stringify({ 'test-layout': mockLayout })
            );

            const result = loadLayout('test-layout');

            expect(result).toEqual(mockLayout);
        });

        it('returns null for non-existent layout', () => {
            localStorageMock.getItem.mockReturnValue('{}');

            const result = loadLayout('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('validateLayout', () => {
        it('validates correct layout data', () => {
            const validLayout = {
                items: [
                    { id: '1', x: 0, y: 0, width: 2, height: 1 }
                ]
            };

            const result = validateLayout(validLayout);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('detects invalid layout data', () => {
            const invalidLayout = {
                items: [
                    { x: 0, y: 0, width: 2, height: 1 } // missing id
                ]
            };

            const result = validateLayout(invalidLayout);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('user preferences', () => {
        it('saves and loads user preferences', () => {
            const preferences = { autoSave: false, theme: 'dark' };

            localStorageMock.getItem.mockReturnValue('{}');

            saveUserPreferences(preferences);

            expect(localStorageMock.setItem).toHaveBeenCalled();
        });

        it('returns default preferences when none exist', () => {
            localStorageMock.getItem.mockReturnValue(null);

            const preferences = getUserPreferences();

            expect(preferences).toHaveProperty('defaultLayout');
            expect(preferences).toHaveProperty('autoSave');
        });
    });
});