/**
 * Global Constants for Donations Dashboard
 * Contains API endpoints, configuration defaults, and shared constants
 */

// GitHub API Constants (fallback if not defined in config)
if (typeof GITHUB_API_BASE === 'undefined') {
    var GITHUB_API_BASE = 'https://api.github.com';
}

if (typeof GITHUB_RAW_BASE === 'undefined') {
    var GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';
}

// Export constants for module usage
const Constants = {
    GITHUB_API_BASE,
    GITHUB_RAW_BASE,
    
    // Modal IDs
    MODALS: {
        LOGIN: 'loginModal',
        CONFIRM: 'confirmModal',
        CUSTOM_CONFIRM: 'customConfirmModal',
        COMMITTEE_DELETE: 'committeeDeleteModal',
        EDIT: 'editModal'
    },
    
    // Category icons
    CATEGORY_ICONS: {
        'donation': '💰',
        'expense': '💸',
        'cheeti': '🎯',
        'sponsor': '🤝',
        'committee': '👥',
        'committee_next': '👥',
        'laddu': '🎁',
        'year_visibility': '📅'
    },
    
    // Toast types
    TOAST_TYPES: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    },
    
    // Toast icons
    TOAST_ICONS: {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    },
    
    // Session constants
    SESSION: {
        VALIDATION_INTERVAL: 30000, // 30 seconds
        STORAGE_KEY: 'adminSession'
    }
};

// Export for global access (backward compatibility)
if (typeof window !== 'undefined') {
    window.DashboardConstants = Constants;
}
