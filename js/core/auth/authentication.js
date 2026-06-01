/**
 * Authentication Module
 * Handles login, logout, and password verification
 * ⚠️ SECURITY CRITICAL - Handle with care
 */

/**
 * SHA-256 hash function for password verification
 * @param {string} message - Plain text message to hash
 * @returns {Promise<string>} Hexadecimal hash string
 */
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * Handle login form submission
 * @param {Event} e - Form submit event
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const passwordInput = document.getElementById('adminPassword');
    const password = passwordInput.value.trim();
    
    if (!password) {
        showError('❌ Please enter a password');
        return;
    }
    
    showLoading('Verifying password...');
    
    try {
        // Hash the password and compare
        const hashedPassword = await sha256(password);
        
        hideLoading();
        
        // Get password hash from configuration
        const adminPasswordHash = (typeof DASHBOARD_CONFIG !== 'undefined') 
            ? DASHBOARD_CONFIG.ADMIN_PASSWORD_HASH 
            : (typeof CONFIG !== 'undefined' ? CONFIG.ADMIN_PASSWORD_HASH : null);
        
        if (!adminPasswordHash) {
            throw new Error('Configuration not found');
        }
        
        if (hashedPassword === adminPasswordHash) {
            // CHECK FOR EXISTING ADMIN SESSION (only in production mode)
            const testMode = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG.TEST_MODE : true;
            
            if (!testMode) {
                showLoading('Checking for active sessions...');
                
                const sessionCheck = await checkAdminSession();
                
                if (sessionCheck.hasActiveSession) {
                    hideLoading();
                    
                    // Hide the login dialog before showing the conflict warning
                    hideLoginDialog();
                    
                    const sessionTime = new Date(sessionCheck.loginTime).toLocaleString('en-IN', { 
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true 
                    });
                    
                    const confirmation = await showCustomConfirm({
                        title: '⚠️ Admin Already Logged In',
                        message: `
                            <div style="text-align: left; line-height: 1.8;">
                                <p style="color: #e74c3c; font-weight: 700; font-size: 1.1rem; margin-bottom: 15px;">
                                    <i class="fas fa-user-lock"></i> Another admin session is active!
                                </p>
                                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                                    <p style="margin: 5px 0;"><strong>Device/Browser:</strong> ${sessionCheck.device || 'Unknown'}</p>
                                    <p style="margin: 5px 0;"><strong>Login time:</strong> ${sessionTime}</p>
                                    <p style="margin: 5px 0;"><strong>Session ID:</strong> ${sessionCheck.sessionId.substring(0, 8)}...</p>
                                </div>
                                <p style="margin-bottom: 10px;">
                                    <strong style="color: #e67e22;">Only ONE admin can be logged in at a time.</strong>
                                </p>
                                <p style="font-size: 0.95rem; color: #666;">
                                    If this is you on another device, click <strong>"Force Login"</strong> to logout the other session and login here.
                                </p>
                                <p style="font-size: 0.95rem; color: #666;">
                                    If someone else is working, click <strong>"Cancel"</strong> and try again later.
                                </p>
                            </div>
                        `,
                        icon: 'fas fa-exclamation-triangle',
                        iconColor: '#f39c12',
                        confirmText: 'Force Login',
                        cancelText: 'Cancel',
                        confirmBtnStyle: 'background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);'
                    });
                    
                    if (!confirmation) {
                        // User cancelled - show login dialog again and clear password
                        showLoginDialog();
                        passwordInput.value = '';
                        return; // User cancelled - don't login
                    }
                    
                    // User chose to force login - will release old session below
                    showLoading('Releasing previous session...');
                }
            }
            
            // Set admin state
            if (window.DashboardState) {
                DashboardState.setIsAdmin(true);
            } else {
                window.isAdmin = true;
            }
            
            // Create admin session lock (releases any existing session)
            if (!testMode) {
                await createAdminSession();
            }
            
            // Save admin session to sessionStorage
            saveAdminSession();
            
            // Clear login parameter from URL if present
            clearLoginUrlParameter();
            
            hideLoading();
            hideLoginDialog();
            
            // Show loading animation before refresh
            showLoading('Loading admin panel...');
            setTimeout(() => {
                window.location.reload();
            }, 300); // Brief animation before refresh
        } else {
            showError('❌ Incorrect password! Check the hint below.');
            passwordInput.select();
        }
    } catch (error) {
        hideLoading();
        showError('❌ Login failed: ' + error.message);
        console.error('Login error:', error);
    }
}

/**
 * Logout admin user
 */
function logoutAdmin() {
    const hasUnsavedData = window.hasUnsavedData || (window.DashboardState && DashboardState.hasUnsavedData());
    const unpublishedChanges = window.unpublishedChanges || (window.DashboardState && DashboardState.getUnpublishedChanges()) || [];
    
    // Check both form changes and draft changes
    if (hasUnsavedData || unpublishedChanges.length > 0) {
        // Update modal message based on type of unsaved data
        updateLogoutModalMessage();
        // Show custom confirmation modal instead of browser confirm
        showConfirmModal();
        return;
    }
    
    // If no unsaved data, logout directly
    performLogout();
}

/**
 * Update logout modal message based on unsaved data type
 */
function updateLogoutModalMessage() {
    const modalBody = document.querySelector('#confirmModal .confirm-modal-body');
    if (!modalBody) return;
    
    const hasUnsavedData = window.hasUnsavedData || (window.DashboardState && DashboardState.hasUnsavedData());
    const unpublishedChanges = window.unpublishedChanges || (window.DashboardState && DashboardState.getUnpublishedChanges()) || [];
    
    let message = '<p><strong>Warning:</strong> ';
    
    if (hasUnsavedData && unpublishedChanges.length > 0) {
        message += `You have unsaved form data and <strong>${unpublishedChanges.length} unpublished changes</strong> that will be lost if you continue.`;
    } else if (unpublishedChanges.length > 0) {
        message += `You have <strong>${unpublishedChanges.length} unpublished changes</strong> that will be lost if you continue.`;
    } else {
        message += 'You have unsaved form data that will be lost if you continue.';
    }
    
    message += '</p><p style="margin-top: 10px;">Are you sure you want to logout?</p>';
    
    modalBody.innerHTML = message;
}

/**
 * Confirm logout - User clicked "Yes, Logout"
 */
function confirmLogout() {
    hideConfirmModal();
    
    if (window.DashboardState) {
        DashboardState.setUnsavedData(false);
        DashboardState.clearUnpublishedChanges();
    } else {
        window.hasUnsavedData = false;
        window.unpublishedChanges = [];
    }
    
    performLogout();
}

/**
 * Perform actual logout logic
 */
async function performLogout() {
    // Reset admin state
    if (window.DashboardState) {
        DashboardState.setIsAdmin(false);
        DashboardState.setUnsavedData(false);
    } else {
        window.isAdmin = false;
        window.hasUnsavedData = false;
    }
    
    // Stop session validation timer
    stopSessionValidation();
    
    // Release admin session lock (only in production mode)
    const testMode = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG.TEST_MODE : true;
    if (!testMode) {
        await releaseAdminSession();
    }
    
    // Clear admin session from sessionStorage
    clearAdminSession();
    
    // Hide Actions column headers
    if (typeof hideActionsColumns === 'function') {
        hideActionsColumns();
    }
    
    // Hide admin panel
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.style.display = 'none';
    }
    
    // Hide cheeti paid dashboard
    const cheetiPaidDashboard = document.getElementById('cheetiPaidDashboard');
    if (cheetiPaidDashboard) {
        cheetiPaidDashboard.classList.remove('show');
    }
    
    // Reset login button
    const loginBtn = document.getElementById('adminLoginBtn');
    if (loginBtn) {
        loginBtn.innerHTML = '<i class="fas fa-lock"></i> Admin Login';
        loginBtn.classList.remove('btn-success');
        loginBtn.classList.add('btn-primary');
        loginBtn.disabled = false;
        loginBtn.title = 'Login as admin';
    }
    
    // Show loading animation before refresh
    showLoading('Logging out...');
    setTimeout(() => {
        window.location.reload();
    }, 300); // Brief animation before refresh
}

// Export for global access
if (typeof window !== 'undefined') {
    window.sha256 = sha256;
    window.hashPassword = sha256; // Alias for compatibility
    window.handleLogin = handleLogin;
    window.login = handleLogin; // Alias for compatibility
    window.logout = logoutAdmin; // Alias for compatibility
    window.logoutAdmin = logoutAdmin;
    window.updateLogoutModalMessage = updateLogoutModalMessage;
    window.confirmLogout = confirmLogout;
    window.performLogout = performLogout;
}

console.log('✅ Authentication module loaded');
