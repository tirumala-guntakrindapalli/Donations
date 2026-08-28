/**
 * Actions Column Component
 * Manages visibility of action columns in tables (Edit/Delete buttons)
 */

/**
 * Show Actions Columns
 * Displays action columns in all tables (donors, cheeti, expenses)
 * Used when admin is logged in to enable editing
 */
function showActionsColumns() {
    const headers = ['donorActionsHeader', 'cheetiActionsHeader', 'expenseActionsHeader'];
    headers.forEach(id => {
        const header = document.getElementById(id);
        if (header) header.style.display = '';
    });
}

/**
 * Hide Actions Columns
 * Hides action columns in all tables
 * Used when admin logs out or for regular members
 */
function hideActionsColumns() {
    const headers = ['donorActionsHeader', 'cheetiActionsHeader', 'expenseActionsHeader'];
    headers.forEach(id => {
        const header = document.getElementById(id);
        if (header) header.style.display = 'none';
    });
}

// Export to window for backward compatibility
window.showActionsColumns = showActionsColumns;
window.hideActionsColumns = hideActionsColumns;

console.log('✅ Actions Column component loaded');
