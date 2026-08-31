/**
 * Application Initializer
 * Main entry point for the dashboard application
 */

/**
 * Initialize the dashboard application
 */
async function initializeDashboard() {
    console.log('🚀 Simple Dashboard initializing...');
    
    // Log configuration
    if (typeof DASHBOARD_CONFIG !== 'undefined') {
        console.log('🔧 Configuration:', {
            'Test Mode': DASHBOARD_CONFIG.TEST_MODE,
            'Data Environment': DASHBOARD_CONFIG.DATA_ENVIRONMENT || 'not set (will use dev)',
            'Data Path': DASHBOARD_CONFIG.getDataFilePath(new Date().getFullYear())
        });
    }
    
    // Update generated date
    setGeneratedDate();
    
    // Setup event listeners
    setupEventListeners();
    
    // Restore admin session FIRST (before loading data)
    // This ensures isAdmin is set before processData() runs
    restoreAdminSession();
    
    // THEN load data (now isAdmin will be correct)
    await loadDataFromGitHub();
    
    console.log('✅ Dashboard initialized successfully');
}

/**
 * Perform initial DOM setup
 */
function setupInitialDOM() {
    // Update footer year dynamically
    const footerYear = document.getElementById('footerYear');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }
    
    // Force hide all modals on page load (defensive cleanup)
    const modalsToHide = ['customConfirmModal', 'confirmModal', 'loginModal', 'committeeDeleteModal'];
    modalsToHide.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }
    });
    document.body.classList.remove('modal-open');
    
    console.log('✅ All modals forcibly hidden on page load');
}

/**
 * DOMContentLoaded event handler
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, starting initialization...');
    
    // Initial DOM setup
    setupInitialDOM();

    // Set member-facing language before loading dashboard data.
    if (window.DashboardLocalization) {
        window.DashboardLocalization.initialize();
    }
    
    // Wait for config and then initialize
    waitForConfig(async function() {
        await initializeDashboard();
    });
});

// Export for global access
if (typeof window !== 'undefined') {
    window.initializeDashboard = initializeDashboard;
    window.initializeApp = initializeDashboard; // Alias for compatibility
    window.setupInitialDOM = setupInitialDOM;
}

console.log('✅ App module loaded');
