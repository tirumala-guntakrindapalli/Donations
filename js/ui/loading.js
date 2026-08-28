/**
 * Loading Overlay System
 * Shows/hides loading indicators during async operations
 */

/**
 * Show loading overlay with message
 * @param {string} message - Loading message to display
 */
function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');
    
    if (overlay) {
        overlay.style.display = 'flex';
    }
    
    if (text) {
        text.textContent = message;
    }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    
    if (overlay) {
        overlay.style.display = 'none';
    }
}

/**
 * Show loading with automatic hide after duration
 * @param {string} message - Loading message
 * @param {number} duration - Duration in milliseconds
 */
function showLoadingWithTimeout(message, duration = 2000) {
    showLoading(message);
    setTimeout(hideLoading, duration);
}

/**
 * Show loading and return a promise that hides it
 * @param {string} message - Loading message
 * @param {Promise} promise - Promise to wait for
 * @returns {Promise} The original promise
 */
async function showLoadingDuring(message, promise) {
    showLoading(message);
    try {
        const result = await promise;
        hideLoading();
        return result;
    } catch (error) {
        hideLoading();
        throw error;
    }
}

/**
 * Update loading message while overlay is visible
 * @param {string} message - New message to display
 */
function updateLoadingMessage(message) {
    const text = document.getElementById('loadingText');
    if (text) {
        text.textContent = message;
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
    window.showLoadingWithTimeout = showLoadingWithTimeout;
    window.showLoadingDuring = showLoadingDuring;
    window.updateLoadingMessage = updateLoadingMessage;
}
