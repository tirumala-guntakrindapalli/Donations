/**
 * Admin Panel Module
 * Handles admin panel UI controls and visibility
 */

/**
 * Show admin panel
 * Displays admin controls and enables draft mode
 */
function showAdminPanel() {
    console.log('👁️ showAdminPanel() called');
    const panel = document.getElementById('adminPanel');
    if (!panel) {
        console.error('❌ adminPanel element not found');
        return;
    }
    
    console.log('✅ Setting panel display to block');
    panel.style.display = 'block';
    
    // Enable draft mode by default when admin logs in
    if (window.DashboardState) {
        DashboardState.setDraftMode(true);
    } else if (typeof window.draftMode !== 'undefined') {
        window.draftMode = true;
    }
    
    // Update draft mode button if it exists
    const draftBtn = document.getElementById('draftModeBtn');
    if (draftBtn) {
        draftBtn.innerHTML = '<i class="fas fa-eye"></i> Draft Mode ON';
        draftBtn.classList.remove('btn-secondary');
        draftBtn.classList.add('btn-info');
        draftBtn.title = 'Click to turn OFF draft mode';
    }
    
    // Show Actions column headers if function exists
    if (typeof showActionsColumns === 'function') {
        showActionsColumns();
    }
    
    // Show cheeti paid dashboard if it exists
    const cheetiPaidDashboard = document.getElementById('cheetiPaidDashboard');
    if (cheetiPaidDashboard) {
        cheetiPaidDashboard.classList.add('show');
    }
    
    // Update cheeti form based on current year
    if (typeof updateCheetiForm === 'function') {
        updateCheetiForm();
    }
    
    // Update login button state
    updateAdminButton();
}

/**
 * Toggle admin panel visibility
 */
function toggleAdminPanel() {
    console.log('🔄 toggleAdminPanel() called');
    const panel = document.getElementById('adminPanel');
    if (!panel) {
        console.error('❌ adminPanel element not found in toggleAdminPanel');
        return;
    }
    
    console.log('📊 Current panel display:', panel.style.display);
    
    if (panel.style.display === 'none' || !panel.style.display) {
        console.log('➡️ Panel is hidden, calling showAdminPanel()');
        showAdminPanel();
    } else {
        console.log('➡️ Panel is visible, calling closeAdminPanel()');
        closeAdminPanel();
    }
}

/**
 * Close admin panel
 */
function closeAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (!panel) return;
    
    panel.style.display = 'none';
    
    // Update button to show "Show Admin Panel"
    updateAdminButton();
}

/**
 * Update admin button state (Login/Panel)
 * Changes button appearance based on login status
 * Note: Click handlers are managed by events.js
 */
function updateAdminButton() {
    const loginBtn = document.getElementById('adminLoginBtn');
    const panel = document.getElementById('adminPanel');
    
    if (!loginBtn) return;
    
    const isAdmin = window.DashboardState ? DashboardState.isAdmin() : window.isAdmin;
    
    if (isAdmin) {
        const isPanelVisible = panel && panel.style.display === 'block';
        
        loginBtn.classList.remove('btn-primary');
        loginBtn.classList.add('btn-success');
        loginBtn.disabled = false; // Keep button enabled
        
        if (isPanelVisible) {
            loginBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Admin Panel';
            loginBtn.title = 'Click to hide admin panel';
        } else {
            loginBtn.innerHTML = '<i class="fas fa-eye"></i> Show Admin Panel';
            loginBtn.title = 'Click to show admin panel';
        }
    } else {
        loginBtn.innerHTML = '<i class="fas fa-lock"></i> Admin Login';
        loginBtn.classList.remove('btn-success');
        loginBtn.classList.add('btn-primary');
        loginBtn.disabled = false;
        loginBtn.title = 'Login as admin';
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.showAdminPanel = showAdminPanel;
    window.toggleAdminPanel = toggleAdminPanel;
    window.closeAdminPanel = closeAdminPanel;
    window.updateAdminButton = updateAdminButton;
}
