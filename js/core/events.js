/**
 * Event Listeners Setup
 * Centralized event handler registration for the dashboard
 */

/**
 * Setup all event listeners for the dashboard
 */
function setupEventListeners() {
    console.log('🎯 Setting up event listeners...');
    
    // Admin Login Button
    setupAdminLoginButton();
    
    // Refresh Button
    setupRefreshButton();
    
    // Prevent accidental page refresh with unpublished changes
    setupBeforeUnloadWarning();
    
    // Login Form Events
    setupLoginFormEvents();
    
    // Modal Overlay Clicks
    setupModalOverlayClicks();
    
    console.log('✅ Event listeners setup complete');
}

/**
 * Setup admin login button click handler
 */
function setupAdminLoginButton() {
    const loginBtn = document.getElementById('adminLoginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isAdmin = window.isAdmin || (window.DashboardState && DashboardState.getIsAdmin());
            console.log('🔐 Admin Login button clicked, isAdmin:', isAdmin);
            
            // If already logged in, toggle the panel
            if (isAdmin) {
                if (typeof toggleAdminPanel === 'function') {
                    toggleAdminPanel();
                }
            } else {
                showLoginDialog();
            }
        });
        console.log('✅ Admin login button listener attached');
    }
}

/**
 * Setup refresh button click handler
 */
function setupRefreshButton() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefreshClick);
        console.log('✅ Refresh button listener attached');
    }
}

/**
 * Setup beforeunload warning for unpublished changes
 */
function setupBeforeUnloadWarning() {
    window.addEventListener('beforeunload', (e) => {
        const isAdmin = window.isAdmin || (window.DashboardState && DashboardState.getIsAdmin());
        const unpublishedChanges = window.unpublishedChanges || (window.DashboardState && DashboardState.getUnpublishedChanges()) || [];
        
        if (isAdmin && unpublishedChanges.length > 0) {
            e.preventDefault();
            e.returnValue = ''; // Required for Chrome
            return ''; // Some browsers show custom message
        }
    });
    console.log('✅ Beforeunload warning attached');
}

/**
 * Setup login form event listeners
 */
function setupLoginFormEvents() {
    // Login Form Submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('✅ Login form submit listener attached');
    }

    // Cancel Login Button
    const cancelBtn = document.getElementById('cancelLogin');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideLoginDialog);
        console.log('✅ Cancel login button listener attached');
    }

    // Toggle Password Visibility Button
    const toggleBtn = document.getElementById('togglePassword');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', togglePasswordVisibility);
        console.log('✅ Toggle password button listener attached');
    }
}

/**
 * Setup modal overlay click handlers
 */
function setupModalOverlayClicks() {
    // Login Modal - close on overlay click
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                hideLoginDialog();
            }
        });
        console.log('✅ Login modal overlay listener attached');
    }

    // Confirmation Modal - close on overlay click
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                hideConfirmModal();
            }
        });
        console.log('✅ Confirm modal overlay listener attached');
    }
}

/**
 * Handle refresh button click
 */
async function handleRefreshClick() {
    const isAdmin = window.isAdmin || (window.DashboardState && DashboardState.getIsAdmin());
    const unpublishedChanges = window.unpublishedChanges || (window.DashboardState && DashboardState.getUnpublishedChanges()) || [];
    
    // Check if admin has unpublished changes
    if (isAdmin && unpublishedChanges.length > 0) {
        const confirmation = await showCustomConfirm({
            title: '⚠️ Refresh Data',
            message: `<strong>Warning:</strong> You have <strong>${unpublishedChanges.length} unpublished changes</strong>.<br><br>Refreshing will reload the latest data and <span style="color: #e74c3c;">discard all local changes</span>.<br><br>Are you sure you want to continue?`,
            icon: 'fas fa-sync-alt',
            iconColor: '#f39c12',
            confirmText: 'Refresh',
            cancelText: 'Cancel',
            confirmBtnStyle: 'background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);'
        });
        
        if (!confirmation) return;
        
        // Clear unpublished changes before refresh
        if (window.DashboardState) {
            DashboardState.clearUnpublishedChanges();
            if (typeof updateDraftModeUI === 'function') {
                updateDraftModeUI();
            }
        } else {
            window.unpublishedChanges = [];
        }
    }
    
    // Show loading animation before refresh
    showLoading('Refreshing data...');
    setTimeout(() => {
        window.location.reload();
    }, 300); // Brief animation before refresh
}

/**
 * Add event listener with automatic cleanup
 * @param {HTMLElement|string} element - Element or element ID
 * @param {string} event - Event type
 * @param {Function} handler - Event handler function
 * @param {object} options - Event listener options
 * @returns {Function} Cleanup function
 */
function addEventListenerWithCleanup(element, event, handler, options = {}) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (!el) {
        console.warn(`Element not found for event listener: ${element}`);
        return () => {};
    }
    
    el.addEventListener(event, handler, options);
    
    // Return cleanup function
    return () => {
        el.removeEventListener(event, handler, options);
    };
}

/**
 * Setup delegated event listener
 * @param {string} selector - CSS selector for target elements
 * @param {string} event - Event type
 * @param {Function} handler - Event handler function
 */
function setupDelegatedEventListener(selector, event, handler) {
    document.addEventListener(event, (e) => {
        if (e.target.matches(selector)) {
            handler(e);
        }
    });
}

/**
 * Debounced event handler creator
 * @param {Function} handler - Event handler function
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} Debounced handler
 */
function createDebouncedEventHandler(handler, delay = 300) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => handler.apply(this, args), delay);
    };
}

// Export for global access
if (typeof window !== 'undefined') {
    window.setupEventListeners = setupEventListeners;
    window.handleRefreshClick = handleRefreshClick;
    window.addEventListenerWithCleanup = addEventListenerWithCleanup;
    window.setupDelegatedEventListener = setupDelegatedEventListener;
    window.createDebouncedEventHandler = createDebouncedEventHandler;
}
