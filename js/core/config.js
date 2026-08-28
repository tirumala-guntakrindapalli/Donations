/**
 * Configuration Loader
 * Handles loading and waiting for DASHBOARD_CONFIG
 */

/**
 * Wait for config to be available
 * @param {Function} callback - Function to call when config is ready
 * @param {number} maxAttempts - Maximum number of attempts (default: 20)
 */
function waitForConfig(callback, maxAttempts = 20) {
    let attempts = 0;
    const checkConfig = setInterval(() => {
        attempts++;
        if (typeof DASHBOARD_CONFIG !== 'undefined') {
            clearInterval(checkConfig);
            console.log('✅ Dashboard config loaded successfully');
            callback();
        } else if (attempts >= maxAttempts) {
            clearInterval(checkConfig);
            console.error('❌ Dashboard config failed to load after 1 second');
            callback(); // Proceed anyway to avoid breaking the page
        }
    }, 50); // Check every 50ms
}

/**
 * Get configuration value safely
 * @param {string} key - Configuration key
 * @param {*} defaultValue - Default value if config not found
 * @returns {*} Configuration value or default
 */
function getConfig(key, defaultValue = null) {
    if (typeof DASHBOARD_CONFIG === 'undefined') {
        console.warn(`Config not loaded, using default for ${key}`);
        return defaultValue;
    }
    return DASHBOARD_CONFIG[key] !== undefined ? DASHBOARD_CONFIG[key] : defaultValue;
}

/**
 * Check if config is loaded
 * @returns {boolean} True if config is available
 */
function isConfigLoaded() {
    return typeof DASHBOARD_CONFIG !== 'undefined';
}

// Export for global access
if (typeof window !== 'undefined') {
    window.waitForConfig = waitForConfig;
    window.getConfig = getConfig;
    window.isConfigLoaded = isConfigLoaded;
}
