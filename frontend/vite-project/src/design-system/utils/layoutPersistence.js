/**
 * Layout Persistence Utilities
 * Handle saving and loading widget layouts to localStorage and user preferences
 */

// Storage keys
const STORAGE_KEYS = {
    LAYOUTS: 'widget_layouts',
    USER_PREFERENCES: 'widget_preferences',
    LAYOUT_HISTORY: 'layout_history'
};

// Default layout configuration
const DEFAULT_LAYOUT_CONFIG = {
    columns: 12,
    rowHeight: 200,
    gap: 16,
    responsive: true,
    snapToGrid: true
};

/**
 * Save layout to localStorage
 * @param {string} layoutId - Unique identifier for the layout
 * @param {Array} items - Array of widget items
 * @param {Object} config - Layout configuration
 */
export const saveLayout = (layoutId, items, config = {}) => {
    try {
        const layouts = getStoredLayouts();
        const timestamp = Date.now();

        const layoutData = {
            id: layoutId,
            items: items.map(item => ({
                id: item.id,
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
                type: item.type,
                props: item.props,
                minWidth: item.minWidth,
                minHeight: item.minHeight,
                maxWidth: item.maxWidth,
                maxHeight: item.maxHeight
            })),
            config: { ...DEFAULT_LAYOUT_CONFIG, ...config },
            timestamp,
            version: '1.0'
        };

        layouts[layoutId] = layoutData;
        localStorage.setItem(STORAGE_KEYS.LAYOUTS, JSON.stringify(layouts));

        // Save to history
        saveToHistory(layoutId, layoutData);

        return true;
    } catch (error) {
        console.error('Failed to save layout:', error);
        return false;
    }
};

/**
 * Load layout from localStorage
 * @param {string} layoutId - Unique identifier for the layout
 * @returns {Object|null} Layout data or null if not found
 */
export const loadLayout = (layoutId) => {
    try {
        const layouts = getStoredLayouts();
        return layouts[layoutId] || null;
    } catch (error) {
        console.error('Failed to load layout:', error);
        return null;
    }
};

/**
 * Get all stored layouts
 * @returns {Object} Object containing all layouts
 */
export const getStoredLayouts = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.LAYOUTS);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error('Failed to get stored layouts:', error);
        return {};
    }
};

/**
 * Delete a layout
 * @param {string} layoutId - Layout ID to delete
 * @returns {boolean} Success status
 */
export const deleteLayout = (layoutId) => {
    try {
        const layouts = getStoredLayouts();
        delete layouts[layoutId];
        localStorage.setItem(STORAGE_KEYS.LAYOUTS, JSON.stringify(layouts));
        return true;
    } catch (error) {
        console.error('Failed to delete layout:', error);
        return false;
    }
};

/**
 * Get layout list with metadata
 * @returns {Array} Array of layout metadata
 */
export const getLayoutList = () => {
    try {
        const layouts = getStoredLayouts();
        return Object.values(layouts).map(layout => ({
            id: layout.id,
            timestamp: layout.timestamp,
            itemCount: layout.items.length,
            config: layout.config,
            version: layout.version
        }));
    } catch (error) {
        console.error('Failed to get layout list:', error);
        return [];
    }
};

/**
 * Save user preferences
 * @param {Object} preferences - User preferences object
 */
export const saveUserPreferences = (preferences) => {
    try {
        const current = getUserPreferences();
        const updated = { ...current, ...preferences, timestamp: Date.now() };
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
        return true;
    } catch (error) {
        console.error('Failed to save user preferences:', error);
        return false;
    }
};

/**
 * Get user preferences
 * @returns {Object} User preferences object
 */
export const getUserPreferences = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
        return stored ? JSON.parse(stored) : {
            defaultLayout: 'main',
            autoSave: true,
            snapToGrid: true,
            showGridLines: false,
            animationsEnabled: true,
            theme: 'auto'
        };
    } catch (error) {
        console.error('Failed to get user preferences:', error);
        return {};
    }
};

/**
 * Save layout to history for undo/redo functionality
 * @param {string} layoutId - Layout ID
 * @param {Object} layoutData - Layout data
 */
const saveToHistory = (layoutId, layoutData) => {
    try {
        const history = getLayoutHistory();
        const layoutHistory = history[layoutId] || [];

        // Add new entry
        layoutHistory.push({
            ...layoutData,
            historyTimestamp: Date.now()
        });

        // Keep only last 10 entries
        if (layoutHistory.length > 10) {
            layoutHistory.shift();
        }

        history[layoutId] = layoutHistory;
        localStorage.setItem(STORAGE_KEYS.LAYOUT_HISTORY, JSON.stringify(history));
    } catch (error) {
        console.error('Failed to save to history:', error);
    }
};

/**
 * Get layout history
 * @returns {Object} Layout history object
 */
export const getLayoutHistory = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.LAYOUT_HISTORY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error('Failed to get layout history:', error);
        return {};
    }
};

/**
 * Get layout history for specific layout
 * @param {string} layoutId - Layout ID
 * @returns {Array} Array of historical layout states
 */
export const getLayoutHistoryById = (layoutId) => {
    const history = getLayoutHistory();
    return history[layoutId] || [];
};

/**
 * Restore layout from history
 * @param {string} layoutId - Layout ID
 * @param {number} historyIndex - Index in history (0 = most recent)
 * @returns {Object|null} Historical layout data
 */
export const restoreFromHistory = (layoutId, historyIndex = 0) => {
    try {
        const history = getLayoutHistoryById(layoutId);
        if (history.length > historyIndex) {
            const historicalLayout = history[history.length - 1 - historyIndex];
            return {
                id: historicalLayout.id,
                items: historicalLayout.items,
                config: historicalLayout.config,
                timestamp: historicalLayout.timestamp
            };
        }
        return null;
    } catch (error) {
        console.error('Failed to restore from history:', error);
        return null;
    }
};

/**
 * Export layout data for sharing or backup
 * @param {string} layoutId - Layout ID to export
 * @returns {string} JSON string of layout data
 */
export const exportLayout = (layoutId) => {
    try {
        const layout = loadLayout(layoutId);
        if (layout) {
            return JSON.stringify(layout, null, 2);
        }
        return null;
    } catch (error) {
        console.error('Failed to export layout:', error);
        return null;
    }
};

/**
 * Import layout data from JSON string
 * @param {string} jsonData - JSON string containing layout data
 * @param {string} newLayoutId - Optional new ID for imported layout
 * @returns {boolean} Success status
 */
export const importLayout = (jsonData, newLayoutId = null) => {
    try {
        const layoutData = JSON.parse(jsonData);

        // Validate layout data structure
        if (!layoutData.items || !Array.isArray(layoutData.items)) {
            throw new Error('Invalid layout data structure');
        }

        const layoutId = newLayoutId || layoutData.id || `imported_${Date.now()}`;
        return saveLayout(layoutId, layoutData.items, layoutData.config);
    } catch (error) {
        console.error('Failed to import layout:', error);
        return false;
    }
};

/**
 * Clear all layout data (use with caution)
 * @param {boolean} includePreferences - Whether to clear user preferences too
 */
export const clearAllData = (includePreferences = false) => {
    try {
        localStorage.removeItem(STORAGE_KEYS.LAYOUTS);
        localStorage.removeItem(STORAGE_KEYS.LAYOUT_HISTORY);

        if (includePreferences) {
            localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
        }

        return true;
    } catch (error) {
        console.error('Failed to clear data:', error);
        return false;
    }
};

/**
 * Validate layout data integrity
 * @param {Object} layoutData - Layout data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateLayout = (layoutData) => {
    const errors = [];

    if (!layoutData) {
        errors.push('Layout data is null or undefined');
        return { isValid: false, errors };
    }

    if (!layoutData.items || !Array.isArray(layoutData.items)) {
        errors.push('Layout items must be an array');
    }

    if (layoutData.items) {
        layoutData.items.forEach((item, index) => {
            if (!item.id) {
                errors.push(`Item at index ${index} missing required id`);
            }
            if (typeof item.x !== 'number' || typeof item.y !== 'number') {
                errors.push(`Item ${item.id} missing valid x,y coordinates`);
            }
            if (typeof item.width !== 'number' || typeof item.height !== 'number') {
                errors.push(`Item ${item.id} missing valid width,height dimensions`);
            }
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Auto-save functionality
 * @param {string} layoutId - Layout ID
 * @param {Array} items - Widget items
 * @param {Object} config - Layout config
 * @param {number} debounceMs - Debounce delay in milliseconds
 */
export const createAutoSave = (layoutId, debounceMs = 1000) => {
    let timeoutId = null;

    return (items, config) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            const preferences = getUserPreferences();
            if (preferences.autoSave !== false) {
                saveLayout(layoutId, items, config);
            }
        }, debounceMs);
    };
};

/**
 * Get storage usage information
 * @returns {Object} Storage usage stats
 */
export const getStorageInfo = () => {
    try {
        const layouts = localStorage.getItem(STORAGE_KEYS.LAYOUTS) || '{}';
        const preferences = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES) || '{}';
        const history = localStorage.getItem(STORAGE_KEYS.LAYOUT_HISTORY) || '{}';

        return {
            layoutsSize: new Blob([layouts]).size,
            preferencesSize: new Blob([preferences]).size,
            historySize: new Blob([history]).size,
            totalSize: new Blob([layouts + preferences + history]).size,
            layoutCount: Object.keys(JSON.parse(layouts)).length
        };
    } catch (error) {
        console.error('Failed to get storage info:', error);
        return {
            layoutsSize: 0,
            preferencesSize: 0,
            historySize: 0,
            totalSize: 0,
            layoutCount: 0
        };
    }
};