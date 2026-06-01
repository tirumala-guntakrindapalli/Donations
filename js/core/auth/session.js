/**
 * Session Management Module
 * Handles admin session locking, validation, and persistence
 * ⚠️ SECURITY CRITICAL - Prevents multiple simultaneous admin logins
 */

// Session validation timer is managed in state.js
// Access via: window.sessionValidationTimer or DashboardState.getSessionTimer()

/**
 * Check for existing admin session in GitHub
 * @returns {Promise<Object>} Session check result {hasActiveSession, sessionId, loginTime, device}
 */
async function checkAdminSession() {
    try {
        const config = window.DASHBOARD_CONFIG || window.CONFIG;
        if (!config) throw new Error('Configuration not found');
        
        const REPO_OWNER = config.REPO_OWNER;
        const REPO_NAME = config.REPO_NAME;
        const GITHUB_TOKEN = config.GITHUB_TOKEN;
        
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/data/admin-session.lock`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.status === 404) {
            // No session lock file found
            return { hasActiveSession: false };
        }
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = atob(data.content); // Decode base64
        const sessionData = JSON.parse(content);
        
        return {
            hasActiveSession: true,
            sessionId: sessionData.sessionId,
            loginTime: sessionData.loginTime,
            device: sessionData.device,
            sha: data.sha // Save for deletion later
        };
    } catch (error) {
        console.error('Error checking admin session:', error);
        // If error checking session, assume no active session (fail gracefully)
        return { hasActiveSession: false };
    }
}

/**
 * Create admin session lock file in GitHub
 * Releases any existing session first
 */
async function createAdminSession() {
    try {
        const config = window.DASHBOARD_CONFIG || window.CONFIG;
        if (!config) throw new Error('Configuration not found');
        
        const REPO_OWNER = config.REPO_OWNER;
        const REPO_NAME = config.REPO_NAME;
        const GITHUB_TOKEN = config.GITHUB_TOKEN;
        
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/data/admin-session.lock`;
        
        // First, release any existing session (force login)
        await releaseAdminSession();
        
        // Generate unique session ID
        const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Get device info
        const device = navigator.userAgent.match(/\(([^)]+)\)/)?.[1] || 'Unknown Device';
        
        const sessionData = {
            sessionId: sessionId,
            loginTime: new Date().toISOString(),
            device: device
        };
        
        // Create new session lock file
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Create admin session lock',
                content: btoa(JSON.stringify(sessionData, null, 2)) // Encode to base64
            })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to create session: ${response.status}`);
        }
        
        // Store session ID locally
        sessionStorage.setItem('adminSessionId', sessionId);
        
        // Start session validation timer
        startSessionValidation();
        
        console.log('Admin session created:', sessionId);
    } catch (error) {
        console.error('Error creating admin session:', error);
        throw error;
    }
}

/**
 * Release admin session lock (delete lock file)
 */
async function releaseAdminSession() {
    try {
        const config = window.DASHBOARD_CONFIG || window.CONFIG;
        if (!config) return; // Silently fail if no config
        
        const REPO_OWNER = config.REPO_OWNER;
        const REPO_NAME = config.REPO_NAME;
        const GITHUB_TOKEN = config.GITHUB_TOKEN;
        
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/data/admin-session.lock`;
        
        // Get current file to get its SHA
        const getResponse = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (getResponse.status === 404) {
            // File doesn't exist, nothing to delete
            return;
        }
        
        if (!getResponse.ok) {
            throw new Error(`Failed to get session file: ${getResponse.status}`);
        }
        
        const fileData = await getResponse.json();
        
        // Delete the file
        const deleteResponse = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Release admin session lock',
                sha: fileData.sha
            })
        });
        
        if (!deleteResponse.ok) {
            throw new Error(`Failed to delete session: ${deleteResponse.status}`);
        }
        
        // Clear local session ID
        sessionStorage.removeItem('adminSessionId');
        
        console.log('Admin session released');
    } catch (error) {
        console.error('Error releasing admin session:', error);
        // Don't throw - allow logout to continue even if release fails
    }
}

/**
 * Validate admin session (check if session still exists in GitHub)
 * Called periodically to ensure session hasn't been taken by another admin
 */
async function validateAdminSession() {
    try {
        const localSessionId = sessionStorage.getItem('adminSessionId');
        if (!localSessionId) {
            // No local session ID - force logout
            forceLogoutDueToSessionLoss();
            return;
        }
        
        const sessionCheck = await checkAdminSession();
        
        if (!sessionCheck.hasActiveSession) {
            // Session file deleted - force logout
            forceLogoutDueToSessionLoss();
            return;
        }
        
        if (sessionCheck.sessionId !== localSessionId) {
            // Session ID changed - another admin logged in - force logout
            forceLogoutDueToSessionLoss();
            return;
        }
        
        // Session is valid - continue
    } catch (error) {
        console.error('Error validating session:', error);
        // Don't logout on validation error - might be network issue
    }
}

/**
 * Start session validation timer
 * Validates session every 10 seconds
 */
function startSessionValidation() {
    // Clear any existing timer
    if (sessionValidationTimer) {
        clearInterval(sessionValidationTimer);
    }
    
    // Validate immediately
    validateAdminSession();
    
    // Then validate every 10 seconds
    sessionValidationTimer = setInterval(validateAdminSession, 10000);
}

/**
 * Stop session validation timer
 */
function stopSessionValidation() {
    if (sessionValidationTimer) {
        clearInterval(sessionValidationTimer);
        sessionValidationTimer = null;
    }
}

/**
 * Force logout due to session loss
 * Called when session is stolen by another admin
 */
function forceLogoutDueToSessionLoss() {
    // Stop validation timer
    stopSessionValidation();
    
    // Reset admin state
    if (window.DashboardState) {
        DashboardState.setIsAdmin(false);
    } else {
        window.isAdmin = false;
    }
    
    // Clear admin session from sessionStorage
    clearAdminSession();
    
    // Show error message
    showError('⚠️ Session lost - Another admin has logged in. Reloading page...');
    
    // Reload page after showing message
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

/**
 * Save admin session to sessionStorage
 * Allows session to persist across page reloads (for 24 hours)
 */
function saveAdminSession() {
    const sessionData = {
        isAdmin: true,
        timestamp: Date.now()
    };
    sessionStorage.setItem('adminSession', JSON.stringify(sessionData));
}

/**
 * Clear admin session from sessionStorage
 */
function clearAdminSession() {
    sessionStorage.removeItem('adminSession');
    sessionStorage.removeItem('adminSessionId');
}

/**
 * Restore admin session from sessionStorage
 * Called on page load to check if user was previously logged in
 */
function restoreAdminSession() {
    try {
        const sessionData = sessionStorage.getItem('adminSession');
        if (!sessionData) return false;
        
        const session = JSON.parse(sessionData);
        
        // Check if session is less than 24 hours old
        const sessionAge = Date.now() - session.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (sessionAge > maxAge) {
            // Session expired
            clearAdminSession();
            return false;
        }
        
        // Session is valid - restore admin state
        if (window.DashboardState) {
            DashboardState.setIsAdmin(true);
        } else {
            window.isAdmin = true;
        }
        
        // Show admin panel
        if (typeof showAdminPanel === 'function') {
            showAdminPanel();
        }
        
        // Start session validation timer (only in production mode)
        const testMode = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG.TEST_MODE : true;
        if (!testMode) {
            startSessionValidation();
        }
        
        return true;
    } catch (error) {
        console.error('Error restoring admin session:', error);
        clearAdminSession();
        return false;
    }
}

/**
 * Clear login parameter from URL
 * Removes ?login=true after successful login
 */
function clearLoginUrlParameter() {
    // Check if URL has ?login=true parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('login')) {
        // Remove the parameter
        urlParams.delete('login');
        
        // Build new URL
        const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
        
        // Update URL without reload
        window.history.replaceState({}, document.title, newUrl);
    }
}

// Export for global access
try {
    if (typeof window !== 'undefined') {
        window.checkAdminSession = checkAdminSession;
        window.createAdminSession = createAdminSession;
        window.releaseAdminSession = releaseAdminSession;
        window.validateAdminSession = validateAdminSession;
        window.validateSession = validateAdminSession; // Alias for compatibility
        window.startSessionValidation = startSessionValidation;
        window.stopSessionValidation = stopSessionValidation;
        window.forceLogoutDueToSessionLoss = forceLogoutDueToSessionLoss;
        window.saveAdminSession = saveAdminSession;
        window.clearAdminSession = clearAdminSession;
        window.restoreAdminSession = restoreAdminSession;
        window.clearLoginUrlParameter = clearLoginUrlParameter;
    }
    console.log('✅ Session module loaded');
} catch (error) {
    console.error('❌ Session module error:', error);
}
