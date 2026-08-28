/**
 * Formatting Utilities
 * Functions for formatting currency, dates, and other display values
 */

/**
 * Format amount as Indian currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string (e.g., "₹5,000")
 */
function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN', {maximumFractionDigits: 0});
}

/**
 * Set the generated date in the footer
 * Updates the element with ID 'generatedDate' to current date/time
 */
function setGeneratedDate() {
    const element = document.getElementById('generatedDate');
    if (element) {
        const date = new Date();
        element.textContent = date.toLocaleString('en-US', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
        });
    }
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
function formatDate(date, options = {}) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return dateObj.toLocaleString('en-US', { ...defaultOptions, ...options });
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 * @param {Date} date - Date to format
 * @returns {string} ISO date string
 */
function formatDateISO(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    return num.toLocaleString('en-IN');
}

// Export for global access
if (typeof window !== 'undefined') {
    window.formatCurrency = formatCurrency;
    window.setGeneratedDate = setGeneratedDate;
    window.formatDate = formatDate;
    window.formatDateISO = formatDateISO;
    window.formatNumber = formatNumber;
}
