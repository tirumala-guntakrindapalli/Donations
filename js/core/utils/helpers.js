/**
 * Helper Utilities
 * Generic helper functions for common tasks
 */

/**
 * Safely set text content of an element
 * @param {string} id - Element ID
 * @param {string} text - Text to set
 */
function safeSetText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

/**
 * Safely set HTML content of an element
 * @param {string} id - Element ID
 * @param {string} html - HTML to set
 */
function safeSetHTML(id, html) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = html;
    }
}

/**
 * Safely get element value
 * @param {string} id - Element ID
 * @returns {string|null} Element value or null
 */
function safeGetValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : null;
}

/**
 * Get category icon emoji
 * @param {string} category - Category name
 * @returns {string} Icon emoji
 */
function getCategoryIcon(category) {
    const icons = {
        'donation': '💰',
        'expense': '💸',
        'cheeti': '🎯',
        'sponsor': '🤝',
        'committee': '👥',
        'committee_next': '👥',
        'laddu': '🎁',
        'year_visibility': '📅'
    };
    return icons[category] || '📋';
}

/**
 * Capitalize first letter of string and replace underscores
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}

/**
 * Capitalize all words in a string
 * @param {string} str - String to capitalize
 * @returns {string} Title-cased string
 */
function toTitleCase(str) {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} True if empty
 */
function isEmpty(obj) {
    if (obj === null || obj === undefined) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    if (typeof obj === 'string') return obj.trim().length === 0;
    return false;
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} html - HTML string to escape
 * @returns {string} Escaped HTML
 */
function escapeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

/**
 * Parse query string to object
 * @param {string} queryString - Query string (e.g., "?foo=bar&baz=qux")
 * @returns {object} Parsed object
 */
function parseQueryString(queryString) {
    const params = new URLSearchParams(queryString);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}

/**
 * Download data as JSON file
 * @param {object} data - Data to download
 * @param {string} filename - Filename
 */
function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Export for global access
if (typeof window !== 'undefined') {
    window.safeSetText = safeSetText;
    window.safeSetHTML = safeSetHTML;
    window.safeGetValue = safeGetValue;
    window.getCategoryIcon = getCategoryIcon;
    window.capitalizeFirst = capitalizeFirst;
    window.toTitleCase = toTitleCase;
    window.deepClone = deepClone;
    window.isEmpty = isEmpty;
    window.debounce = debounce;
    window.sleep = sleep;
    window.generateId = generateId;
    window.escapeHTML = escapeHTML;
    window.parseQueryString = parseQueryString;
    window.downloadJSON = downloadJSON;
}
