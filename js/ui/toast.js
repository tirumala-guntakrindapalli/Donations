/**
 * Toast Notification System
 * Displays temporary notification messages to users in a stacked FIFO mode
 */

/**
 * Get or create toast container
 * @returns {HTMLElement} Toast container element
 */
function getToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
 */
function showToast(message, type = 'info') {
    const container = getToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${getToastIcon(type)} toast-icon"></i>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close" aria-label="Close">&times;</button>
        <div class="toast-progress"></div>
    `;
    
    // Add to container (FIFO - new messages go to the end)
    container.appendChild(toast);
    
    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeToast(toast, container);
    });
    
    // Also allow clicking the entire toast to dismiss
    toast.addEventListener('click', () => {
        removeToast(toast, container);
    });
    
    // Show animation with bounce effect
    setTimeout(() => {
        toast.classList.add('show', 'bounce');
    }, 50);
    
    // Remove bounce class after animation
    setTimeout(() => {
        toast.classList.remove('bounce');
    }, 550);
    
    // Hide and remove after 3 seconds (FIFO - oldest messages removed first)
    const timeout = setTimeout(() => {
        removeToast(toast, container);
    }, 3000);
    
    // Store timeout ID so we can clear it if user closes manually
    toast._timeout = timeout;
}

/**
 * Remove toast from DOM
 * @param {HTMLElement} toast - Toast element to remove
 * @param {HTMLElement} container - Toast container element
 */
function removeToast(toast, container) {
    if (!toast || !toast.parentElement) return;
    
    // Clear timeout if exists
    if (toast._timeout) {
        clearTimeout(toast._timeout);
    }
    
    toast.classList.remove('show');
    setTimeout(() => {
        toast.remove();
        // Clean up container if empty
        if (container && container.children.length === 0) {
            container.remove();
        }
    }, 400);
}

/**
 * Get icon for toast type
 * @param {string} type - Toast type
 * @returns {string} FontAwesome icon name
 */
function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}

/**
 * Show success toast
 * @param {string} message - Success message
 */
function showSuccess(message) {
    showToast(message, 'success');
}

/**
 * Show error toast
 * @param {string} message - Error message
 */
function showError(message) {
    showToast(message, 'error');
}

/**
 * Show warning toast
 * @param {string} message - Warning message
 */
function showWarning(message) {
    showToast(message, 'warning');
}

/**
 * Show info toast
 * @param {string} message - Info message
 */
function showInfo(message) {
    showToast(message, 'info');
}

/**
 * Show toast with custom duration
 * @param {string} message - Message to display
 * @param {string} type - Toast type
 * @param {number} duration - Duration in milliseconds
 */
function showToastWithDuration(message, type = 'info', duration = 3000) {
    const container = getToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Custom progress animation duration
    const progressDuration = duration / 1000;
    
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${getToastIcon(type)} toast-icon"></i>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close" aria-label="Close">&times;</button>
        <div class="toast-progress" style="animation-duration: ${progressDuration}s;"></div>
    `;
    
    container.appendChild(toast);
    
    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeToast(toast, container);
    });
    
    // Also allow clicking the entire toast to dismiss
    toast.addEventListener('click', () => {
        removeToast(toast, container);
    });
    
    // Show animation with bounce effect
    setTimeout(() => {
        toast.classList.add('show', 'bounce');
    }, 50);
    
    // Remove bounce class after animation
    setTimeout(() => {
        toast.classList.remove('bounce');
    }, 550);
    
    // Hide and remove after specified duration
    const timeout = setTimeout(() => {
        removeToast(toast, container);
    }, duration);
    
    // Store timeout ID
    toast._timeout = timeout;
}

// Export for global access
if (typeof window !== 'undefined') {
    window.getToastContainer = getToastContainer;
    window.showToast = showToast;
    window.removeToast = removeToast;
    window.getToastIcon = getToastIcon;
    window.showSuccess = showSuccess;
    window.showError = showError;
    window.showWarning = showWarning;
    window.showInfo = showInfo;
    window.showToastWithDuration = showToastWithDuration;
}
