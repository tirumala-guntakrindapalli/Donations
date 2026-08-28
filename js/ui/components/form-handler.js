/**
 * Form Handler Component
 * Manages form state and change tracking
 */

/**
 * Mark Form Changed
 * Sets unsaved data flag when form is modified
 * Used to track pending changes and warn before navigation
 */
function markFormChanged() {
    // Use DashboardState if available, otherwise fall back to window
    const DashboardState = window.DashboardState || {};
    
    if (DashboardState.setUnsavedData) {
        DashboardState.setUnsavedData(true);
    } else if (typeof window.hasUnsavedData !== 'undefined') {
        window.hasUnsavedData = true;
    }
}

// Export to window for backward compatibility
window.markFormChanged = markFormChanged;

console.log('✅ Form Handler component loaded');
