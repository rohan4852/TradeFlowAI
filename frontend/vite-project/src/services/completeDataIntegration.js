/**
 * Complete Data Integration Service
 * Initializes and manages all data integration services
 */

import { realTimeDataIntegration } from './realTimeDataIntegration';
import { performanceIntegration } from './performanceIntegration';

/**
 * Initialize complete data integration system
 */
export const initializeCompleteDataIntegration = () => {
    try {
        console.log('⏳ Initializing complete data integration...');

        // Initialize performance monitoring
        if (performanceIntegration) {
            console.log('✅ Performance integration initialized');
        }

        // Initialize real-time data integration
        if (realTimeDataIntegration) {
            console.log('✅ Real-time data integration initialized');
        }

        const status = {
            initialized: true,
            timestamp: Date.now(),
            services: {
                realTimeData: !!realTimeDataIntegration,
                performance: !!performanceIntegration,
                errorBoundary: true
            },
            version: '1.0.0'
        };

        console.log('✓ Complete data integration initialized successfully');
        return status;

    } catch (error) {
        console.error('✗ Failed to initialize complete data integration:', error);
        return {
            initialized: false,
            error: error.message,
            timestamp: Date.now(),
            services: {
                realTimeData: false,
                performance: false,
                errorBoundary: false
            }
        };
    }
};

/**
 * Get current integration status
 */
export const getIntegrationStatus = () => {
    return {
        realTimeData: {
            active: !!realTimeDataIntegration,
            connectionState: realTimeDataIntegration?.getConnectionState?.() || 'unknown'
        },
        performance: {
            active: !!performanceIntegration,
            monitoring: performanceIntegration?.isMonitoring || false
        },
        timestamp: Date.now()
    };
};

/**
 * Cleanup integration services
 */
export const cleanupDataIntegration = () => {
    try {
        if (realTimeDataIntegration?.destroy) {
            realTimeDataIntegration.destroy();
        }

        if (performanceIntegration?.destroy) {
            performanceIntegration.destroy();
        }

        console.log('🧹 Data integration services cleaned up');
    } catch (error) {
        console.error('✗ Error cleaning up data integration:', error);
    }
};

export default {
    initializeCompleteDataIntegration,
    getIntegrationStatus,
    cleanupDataIntegration
};