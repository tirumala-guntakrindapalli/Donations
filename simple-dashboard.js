// Simple GitHub-Based Dashboard
// Password-protected admin panel with GitHub API integration

// GitHub API Constants (fallback if not defined in config)
if (typeof GITHUB_API_BASE === 'undefined') {
    var GITHUB_API_BASE = 'https://api.github.com';
}
if (typeof GITHUB_RAW_BASE === 'undefined') {
    var GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';
}

// Global Variables
let isAdmin = false;
let currentData = null;
let refreshTimer = null;
let hasUnsavedData = false;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Simple Dashboard initializing...');
    setGeneratedDate();
    loadDataFromGitHub();
    setupEventListeners();
    
    // Restore admin session if exists
    restoreAdminSession();
});

// Setup Event Listeners
function setupEventListeners() {
    // Admin Login Button
    const loginBtn = document.getElementById('adminLoginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            // If already logged in, toggle the panel
            if (isAdmin) {
                toggleAdminPanel();
            } else {
                showLoginDialog();
            }
        });
    }
    
    // Refresh Button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadDataFromGitHub);
    }

    // Login Form Submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Cancel Login
    const cancelBtn = document.getElementById('cancelLogin');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideLoginDialog);
    }

    // Toggle Password Visibility
    const toggleBtn = document.getElementById('togglePassword');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', togglePasswordVisibility);
    }

    // Close modal on overlay click
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                hideLoginDialog();
            }
        });
    }

    // Close confirmation modal on overlay click
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                hideConfirmModal();
            }
        });
    }
}

// Show Login Dialog
function showLoginDialog() {
    const modal = document.getElementById('loginModal');
    const passwordInput = document.getElementById('adminPassword');
    
    if (modal) {
        // Prevent body scroll
        document.body.classList.add('modal-open');
        
        // Scroll to top before showing modal
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        modal.classList.add('show');
        
        // Focus on password input after a short delay
        setTimeout(() => {
            if (passwordInput) {
                passwordInput.focus();
                passwordInput.value = ''; // Clear any previous input
            }
        }, 150);
    }
}

// Hide Login Dialog
function hideLoginDialog() {
    const modal = document.getElementById('loginModal');
    const passwordInput = document.getElementById('adminPassword');
    
    if (modal) {
        modal.classList.remove('show');
    }
    
    // Re-enable body scroll
    document.body.classList.remove('modal-open');
    
    if (passwordInput) {
        passwordInput.value = '';
        passwordInput.type = 'password';
        const toggleIcon = document.querySelector('#togglePassword i');
        if (toggleIcon) {
            toggleIcon.className = 'fas fa-eye';
        }
    }
}

// Toggle Password Visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('adminPassword');
    const toggleIcon = document.querySelector('#togglePassword i');
    
    if (passwordInput && toggleIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            toggleIcon.className = 'fas fa-eye';
        }
    }
}

// Handle Login Form Submit
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
        
        // Get password hash from either DASHBOARD_CONFIG or CONFIG
        const adminPasswordHash = (typeof DASHBOARD_CONFIG !== 'undefined') 
            ? DASHBOARD_CONFIG.ADMIN_PASSWORD_HASH 
            : (typeof CONFIG !== 'undefined' ? CONFIG.ADMIN_PASSWORD_HASH : null);
        
        if (!adminPasswordHash) {
            throw new Error('Configuration not found');
        }
        
        if (hashedPassword === adminPasswordHash) {
            isAdmin = true;
            
            // Save admin session to sessionStorage
            saveAdminSession();
            
            // Clear login parameter from URL if present
            clearLoginUrlParameter();
            
            hideLoginDialog();
            showSuccess('✅ Login successful! Admin panel unlocked.');
            showAdminPanel();
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

// Simple SHA-256 hash function
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Show Admin Panel
function showAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.style.display = 'block';
    }
    
    // Show TEST MODE indicator if in test mode
    const testMode = (typeof DASHBOARD_CONFIG !== 'undefined') 
        ? DASHBOARD_CONFIG.TEST_MODE 
        : (typeof CONFIG !== 'undefined' ? CONFIG.TEST_MODE : true);
    
    const testModeIndicator = document.getElementById('testModeIndicator');
    if (testModeIndicator && testMode) {
        testModeIndicator.style.display = 'block';
    }
    
    updateAdminButton();
    
    // Show Actions column headers
    showActionsColumns();
    
    // Hide dashboard disabled message if showing (admin can always see dashboard)
    hideDashboardDisabledMessage();
    
    // Show cheeti paid dashboard for admin
    const cheetiPaidDashboard = document.getElementById('cheetiPaidDashboard');
    if (cheetiPaidDashboard) {
        cheetiPaidDashboard.classList.add('show');
    }
    
    // Populate cheeti paid table with current data
    if (currentData && currentData.cheeti) {
        populateCheetiPaidTable(currentData.cheeti);
    }
    
    // Update cheeti form based on current year
    updateCheetiForm();
    
    // Update cutover date display
    updateCutoverDisplay();
    
    // Update dashboard visibility status
    updateDashboardStatusDisplay();
    
    // Reprocess data to show dashboard for admin
    if (currentData) {
        // Temporarily bypass the visibility check
        const wasAdmin = isAdmin;
        isAdmin = true;
        
        // Extract and process data
        const donationsData = currentData.donations || [];
        const cheetiData = currentData.cheeti || [];
        const expensesData = currentData.expenses || [];
        const reportData = currentData.report || [];
        
        // Update metrics
        updateMetrics(donationsData, cheetiData, expensesData, reportData);
        
        // Create charts
        try {
            createFinancialChart(reportData);
            createExpensesChart(expensesData);
            createCheetiChart(cheetiData);
        } catch (e) {
            console.error('Error creating charts:', e);
        }
        
        // Populate tables
        populateDonorsTable(donationsData);
        populateCheetiTable(cheetiData);
        populateExpensesTable(expensesData);
        
        // Update announcements banner
        updateAnnouncements();
        
        // Update committee management list
        updateCommitteeManagementList();
        
        isAdmin = wasAdmin;
    }
}

// Toggle Admin Panel (Show/Hide)
function toggleAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (!panel) return;
    
    if (panel.style.display === 'none' || !panel.style.display) {
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
    
    updateAdminButton();
}

// Update Admin Button State
function updateAdminButton() {
    const loginBtn = document.getElementById('adminLoginBtn');
    const panel = document.getElementById('adminPanel');
    
    if (!loginBtn) return;
    
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

// Logout Admin
function logoutAdmin() {
    if (hasUnsavedData) {
        // Show custom confirmation modal instead of browser confirm
        showConfirmModal();
        return;
    }
    
    // If no unsaved data, logout directly
    performLogout();
}

// Show Confirmation Modal
function showConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.add('show');
        document.body.classList.add('modal-open');
    }
}

// Hide Confirmation Modal
function hideConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
    }
}

// Confirm Logout - User clicked "Yes, Logout"
function confirmLogout() {
    hideConfirmModal();
    hasUnsavedData = false; // Clear the flag before logout
    performLogout();
}

// Perform Logout - Actual logout logic
function performLogout() {
    // Reset admin state
    isAdmin = false;
    hasUnsavedData = false;
    
    // Clear admin session from sessionStorage
    clearAdminSession();
    
    // Hide Actions column headers
    hideActionsColumns();
    
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
    
    showSuccess('✅ Logged out successfully!');
    
    // Refresh tables to hide action buttons
    if (currentData) {
        processData();
    }
}

// Close Admin Panel (without logout)
function closeAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.style.display = 'none';
    }
    updateAdminButton();
}

// Mark form as changed (unsaved data)
function markFormChanged() {
    hasUnsavedData = true;
}

// Toggle payment fields visibility
function togglePaymentFields() {
    const paymentFields = document.getElementById('paymentFields');
    const isPaid = document.getElementById('cheetiPaid').checked;
    
    if (paymentFields) {
        paymentFields.style.display = isPaid ? 'block' : 'none';
        
        // Set default payment date to today if checked
        if (isPaid) {
            const dateInput = document.getElementById('cheetiPaymentDate');
            if (dateInput && !dateInput.value) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
        }
    }
}

// Set Cheeti Cutover Date
function setCheetiCutoverDate() {
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const cutoverDate = document.getElementById('cheetiCutoverDate').value;
    const lateFeePerDay = parseFloat(document.getElementById('cheetiLateFeePerDay').value) || 50;
    
    if (!cutoverDate) {
        showError('Please select a cutover date');
        return;
    }
    
    // Validate cutover date is in the next year
    const selectedYear = parseInt(currentData.year);
    const cutoverYear = new Date(cutoverDate).getFullYear();
    const expectedYear = selectedYear + 1;
    
    if (cutoverYear !== expectedYear) {
        showError(`⚠️ Cutover date should be in ${expectedYear} (next year). Members who borrowed in ${selectedYear} must pay in ${expectedYear}.`);
        return;
    }
    
    // Store in current year data
    if (!currentData.cheeti_settings) {
        currentData.cheeti_settings = {};
    }
    
    currentData.cheeti_settings.cutover_date = cutoverDate;
    currentData.cheeti_settings.late_fee_per_day = lateFeePerDay;
    
    // Update display
    updateCutoverDisplay();
    
    // Reset unsaved data flag
    hasUnsavedData = false;
    
    showSuccess(`✅ Cutover date set! Members must pay by ${new Date(cutoverDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`);
    
    // Save to GitHub
    saveDataToGitHub();
}

// Update Cutover Date Display
function updateCutoverDisplay() {
    const infoDiv = document.getElementById('currentCutoverInfo');
    const dateDisplay = document.getElementById('cutoverDateDisplay');
    const feeDisplay = document.getElementById('lateFeeRateDisplay');
    const appliesTo = document.getElementById('cutoverAppliesTo');
    
    const selectedYear = parseInt(currentData.year);
    const hasSettings = currentData && currentData.cheeti_settings && currentData.cheeti_settings.cutover_date;
    
    if (hasSettings) {
        const cutoverDate = new Date(currentData.cheeti_settings.cutover_date);
        const lateFeePerDay = currentData.cheeti_settings.late_fee_per_day || 50;
        const cutoverYear = cutoverDate.getFullYear();
        
        if (infoDiv) infoDiv.style.display = 'block';
        if (dateDisplay) dateDisplay.textContent = cutoverDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        if (feeDisplay) feeDisplay.textContent = `₹${lateFeePerDay}/day`;
        if (appliesTo) appliesTo.textContent = `Payment deadline for ${selectedYear} members`;
        
        // Update form fields
        const dateInput = document.getElementById('cheetiCutoverDate');
        const feeInput = document.getElementById('cheetiLateFeePerDay');
        if (dateInput) dateInput.value = currentData.cheeti_settings.cutover_date;
        if (feeInput) feeInput.value = lateFeePerDay;
    } else {
        if (infoDiv) infoDiv.style.display = 'none';
    }
}

// Toggle Dashboard Visibility for Members
function toggleDashboardVisibility() {
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const checkbox = document.getElementById('dashboardEnabledCheckbox');
    if (!checkbox) return;
    
    const isEnabled = checkbox.checked;
    
    // Store setting in data
    if (!currentData.settings) {
        currentData.settings = {};
    }
    
    currentData.settings.dashboard_enabled = isEnabled;
    
    // Update status display
    updateDashboardStatusDisplay();
    
    // Save to GitHub
    saveDataToGitHub().then(() => {
        const statusMsg = isEnabled 
            ? '✅ Dashboard is now visible to all members' 
            : '🔒 Dashboard is now hidden from members (only admins can view)';
        showSuccess(statusMsg);
    });
}

// Update Dashboard Status Display
function updateDashboardStatusDisplay() {
    const checkbox = document.getElementById('dashboardEnabledCheckbox');
    const statusInfo = document.getElementById('dashboardStatusInfo');
    const currentYearDisplay = document.getElementById('currentYearDisplay');
    const currentYearBadge = document.getElementById('currentYearBadge');
    
    if (!currentData || !statusInfo) return;
    
    // Dashboard is HIDDEN by default unless explicitly enabled
    const isEnabled = currentData.settings && currentData.settings.dashboard_enabled === true;
    const selectedYear = currentData.year;
    
    // Update current year display
    if (currentYearDisplay) {
        currentYearDisplay.textContent = selectedYear;
    }
    
    // Update badge
    if (currentYearBadge) {
        if (isEnabled) {
            currentYearBadge.textContent = 'VISIBLE';
            currentYearBadge.style.background = '#4caf50';
            currentYearBadge.style.color = 'white';
        } else {
            currentYearBadge.textContent = 'HIDDEN';
            currentYearBadge.style.background = '#f44336';
            currentYearBadge.style.color = 'white';
        }
    }
    
    if (checkbox) {
        checkbox.checked = isEnabled;
    }
    
    if (isEnabled) {
        statusInfo.innerHTML = `
            <div style="background: #e8f5e9; color: #2e7d32; border-left: 3px solid #4caf50; padding: 8px 12px;">
                <i class="fas fa-check-circle"></i> <strong>Year ${selectedYear}:</strong> Visible to all members
            </div>
        `;
    } else {
        statusInfo.innerHTML = `
            <div style="background: #ffebee; color: #c62828; border-left: 3px solid #f44336; padding: 8px 12px;">
                <i class="fas fa-exclamation-circle"></i> <strong>Year ${selectedYear}:</strong> Hidden from members
            </div>
        `;
    }
    
    // Load all years visibility status
    loadAllYearsVisibility();
}

// Load All Years Visibility Status
async function loadAllYearsVisibility() {
    const listContainer = document.getElementById('allYearsVisibilityList');
    if (!listContainer) return;
    
    listContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;"><i class="fas fa-spinner fa-spin"></i> Loading years...</div>';
    
    try {
        const currentYear = new Date().getFullYear();
        const startYear = 2024; // Start from 2024
        const endYear = currentYear;
        
        const yearStatuses = [];
        
        // Load status for each year
        for (let year = startYear; year <= endYear; year++) {
            const yearData = await loadYearData(year);
            if (yearData) {
                // Dashboard is HIDDEN by default unless explicitly enabled
                const isEnabled = yearData.settings && yearData.settings.dashboard_enabled === true;
                yearStatuses.push({
                    year: year,
                    enabled: isEnabled,
                    isCurrent: year === parseInt(currentData.year)
                });
            }
        }
        
        if (yearStatuses.length === 0) {
            listContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">No years found</div>';
            return;
        }
        
        // Sort by year descending (newest first)
        yearStatuses.sort((a, b) => b.year - a.year);
        
        // Build the list
        let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';
        
        yearStatuses.forEach(({ year, enabled, isCurrent }) => {
            const bgColor = isCurrent ? '#e3f2fd' : 'white';
            const borderColor = isCurrent ? '#2196f3' : '#ddd';
            const statusColor = enabled ? '#4caf50' : '#f44336';
            const statusIcon = enabled ? 'fa-eye' : 'fa-eye-slash';
            const statusText = enabled ? 'Visible' : 'Hidden';
            
            html += `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 6px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-weight: 600; color: #333; font-size: 15px;">
                            ${isCurrent ? '<i class="fas fa-star" style="color: #ff9800;"></i> ' : ''}
                            ${year}
                        </span>
                        ${isCurrent ? '<span style="font-size: 11px; color: #666; background: #ff9800; color: white; padding: 2px 6px; border-radius: 3px;">ACTIVE</span>' : ''}
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="color: ${statusColor}; font-size: 13px; font-weight: 600;">
                            <i class="fas ${statusIcon}"></i> ${statusText}
                        </span>
                        <label style="display: flex; align-items: center; cursor: pointer; margin: 0;">
                            <input type="checkbox" ${enabled ? 'checked' : ''} onchange="toggleYearVisibility(${year}, this.checked)" style="width: 18px; height: 18px; cursor: pointer;" title="Toggle visibility">
                        </label>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        listContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading years visibility:', error);
        listContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #f44336;"><i class="fas fa-exclamation-triangle"></i> Error loading years</div>';
    }
}

// Toggle Visibility for Specific Year
async function toggleYearVisibility(year, isEnabled) {
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    try {
        showLoading(`Updating year ${year} visibility...`);
        
        // Load year data
        const yearData = await loadYearData(year);
        if (!yearData) {
            throw new Error(`Could not load data for year ${year}`);
        }
        
        // Update settings
        if (!yearData.settings) {
            yearData.settings = {};
        }
        yearData.settings.dashboard_enabled = isEnabled;
        
        // Save to file with descriptive commit message
        const action = isEnabled ? '✅ Enable' : '🔒 Disable';
        const commitMsg = `[Dashboard Bot] ${action} ${year} visibility | Admin action`;
        await saveYearDataToFile(year, yearData, commitMsg);
        
        // If we're updating the current year, refresh the display
        if (year === parseInt(currentData.year)) {
            currentData.settings = yearData.settings;
            updateDashboardStatusDisplay();
        } else {
            // Just refresh the all years list
            loadAllYearsVisibility();
        }
        
        hideLoading();
        
        const statusMsg = isEnabled 
            ? `✅ Year ${year} is now visible to members` 
            : `🔒 Year ${year} is now hidden from members`;
        showSuccess(statusMsg);
        
    } catch (error) {
        hideLoading();
        console.error(`Error toggling year ${year} visibility:`, error);
        showError(`Failed to update year ${year}: ${error.message}`);
    }
}

// Refresh All Years Visibility List
function refreshAllYearsVisibility() {
    loadAllYearsVisibility();
    showSuccess('🔄 Years list refreshed');
}

// Check Dashboard Visibility on Page Load
function checkDashboardVisibility() {
    // Admin always has access
    if (isAdmin) {
        return true;
    }
    
    // Check if dashboard is explicitly enabled for members
    // Dashboard is HIDDEN by default unless explicitly enabled
    const isEnabled = currentData && currentData.settings && currentData.settings.dashboard_enabled === true;
    
    if (!isEnabled) {
        // Dashboard is disabled for members
        showDashboardDisabledMessage();
        return false;
    }
    
    return true;
}

// Show Dashboard Disabled Message to Members
function showDashboardDisabledMessage() {
    // Hide all dashboard sections
    const dashboardSections = document.querySelectorAll('.dashboard-section, .metrics-grid, .charts-row, #announcementBanner');
    dashboardSections.forEach(section => section.style.display = 'none');
    
    // Hide header controls (but keep home button)
    const headerControls = document.querySelector('.header-controls');
    if (headerControls) {
        headerControls.style.display = 'none';
    }
    
    // Check if message already exists
    let messageDiv = document.getElementById('dashboardDisabledMessage');
    if (!messageDiv) {
        // Create message container
        messageDiv = document.createElement('div');
        messageDiv.id = 'dashboardDisabledMessage';
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.insertBefore(messageDiv, mainContent.firstChild);
        }
    }
    
    messageDiv.innerHTML = `
        <div style="
            max-width: 700px;
            margin: 80px auto;
            padding: 50px;
            background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
            border-radius: 20px;
            box-shadow: 0 15px 50px rgba(0,0,0,0.2);
            text-align: center;
            border: 3px solid #2196f3;
        ">
            <div style="
                width: 100px;
                height: 100px;
                margin: 0 auto 30px;
                background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: pulse 2s infinite;
            ">
                <i class="fas fa-tools" style="font-size: 50px; color: white;"></i>
            </div>
            
            <h2 style="
                color: #1565c0;
                margin-bottom: 20px;
                font-size: 32px;
                font-weight: 700;
            ">Dashboard Under Maintenance</h2>
            
            <p style="
                color: #546e7a;
                font-size: 18px;
                line-height: 1.8;
                margin-bottom: 30px;
            ">
                The dashboard is currently unavailable for viewing.<br>
                <strong>Please check back later.</strong>
            </p>
            
            <div style="
                background: #e3f2fd;
                padding: 20px;
                border-radius: 12px;
                margin: 30px 0;
                border-left: 4px solid #2196f3;
            ">
                <p style="
                    color: #0d47a1;
                    font-size: 16px;
                    line-height: 1.6;
                    margin: 0;
                ">
                    <i class="fas fa-info-circle"></i> 
                    Our team is working to update the information.<br>
                    Thank you for your patience!
                </p>
            </div>
            
            <a href="index.html" style="
                display: inline-block;
                background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
                color: white;
                text-decoration: none;
                padding: 18px 45px;
                border-radius: 30px;
                font-size: 18px;
                font-weight: 600;
                box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
                transition: all 0.3s ease;
                margin-top: 20px;
            " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(33, 150, 243, 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 6px 20px rgba(33, 150, 243, 0.4)'">
                <i class="fas fa-home"></i> Back to Home
            </a>
            
            <p style="
                color: #90a4ae;
                font-size: 14px;
                margin-top: 40px;
                font-style: italic;
            ">
                <i class="fas fa-clock"></i> The dashboard will be back online soon
            </p>
        </div>
        
        <style>
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7);
                }
                50% {
                    transform: scale(1.05);
                    box-shadow: 0 0 0 20px rgba(33, 150, 243, 0);
                }
            }
        </style>
    `;
    messageDiv.style.display = 'block';
}

// Hide Dashboard Disabled Message
function hideDashboardDisabledMessage() {
    const messageDiv = document.getElementById('dashboardDisabledMessage');
    if (messageDiv) {
        messageDiv.style.display = 'none';
    }
    
    // Show dashboard sections - remove inline style to restore CSS defaults
    const dashboardSections = document.querySelectorAll('.dashboard-section, .metrics-grid, .charts-row');
    dashboardSections.forEach(section => section.style.display = '');
    
    // Show announcement banner separately
    const announcementBanner = document.getElementById('announcementBanner');
    if (announcementBanner) {
        announcementBanner.style.display = '';
    }
    
    // Show header controls
    const headerControls = document.querySelector('.header-controls');
    if (headerControls) {
        headerControls.style.display = 'flex';
    }
}

// Calculate Late Fee based on Days Overdue
function calculateLateFee(paymentDate) {
    if (!currentData || !currentData.cheeti_settings || !currentData.cheeti_settings.cutover_date) {
        return 0;
    }
    
    const cutoverDate = new Date(currentData.cheeti_settings.cutover_date);
    const payDate = new Date(paymentDate);
    const lateFeePerDay = currentData.cheeti_settings.late_fee_per_day || 50;
    
    // If payment is on or before cutover date, no late fee
    if (payDate <= cutoverDate) {
        return 0;
    }
    
    // Calculate days overdue
    const daysOverdue = Math.ceil((payDate - cutoverDate) / (1000 * 60 * 60 * 24));
    const lateFee = daysOverdue * lateFeePerDay;
    
    return lateFee;
}

// Get Days Overdue
function getDaysOverdue(paymentDate) {
    if (!currentData || !currentData.cheeti_settings || !currentData.cheeti_settings.cutover_date) {
        return 0;
    }
    
    const cutoverDate = new Date(currentData.cheeti_settings.cutover_date);
    const payDate = new Date(paymentDate);
    
    // If payment is on or before cutover date, no days overdue
    if (payDate <= cutoverDate) {
        return 0;
    }
    
    // Calculate days overdue
    return Math.ceil((payDate - cutoverDate) / (1000 * 60 * 60 * 24));
}

// Auto-calculate late fee for admin panel payment form
function autoCalculateLateFeeForPaymentForm() {
    const dateInput = document.getElementById('repaymentDate');
    const lateFeeInput = document.getElementById('repaymentLateFee');
    const lateFeeInfo = document.getElementById('adminLateFeeInfo');
    const lateFeeAutoCalc = document.getElementById('adminLateFeeAutoCalc');
    const totalDueDisplay = document.getElementById('memberTotalDue');
    const memberSelect = document.getElementById('cheetiMemberSelect');
    
    if (!dateInput || !dateInput.value || !memberSelect || !memberSelect.value) return;
    
    const memberIndex = memberSelect.value;
    if (!currentData.cheeti || !currentData.cheeti[memberIndex]) return;
    
    const member = currentData.cheeti[memberIndex];
    const paymentDate = dateInput.value;
    const calculatedLateFee = calculateLateFee(paymentDate);
    const daysOverdue = getDaysOverdue(paymentDate);
    
    if (daysOverdue > 0 && currentData.cheeti_settings) {
        const lateFeePerDay = currentData.cheeti_settings.late_fee_per_day || 50;
        
        // Update late fee input
        if (lateFeeInput) lateFeeInput.value = calculatedLateFee;
        
        // Show calculation info
        if (lateFeeInfo) {
            lateFeeInfo.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: #ff9800;"></i> ${daysOverdue} day(s) overdue × ₹${lateFeePerDay}/day = ₹${calculatedLateFee.toLocaleString('en-IN')}`;
        }
        
        if (lateFeeAutoCalc) {
            lateFeeAutoCalc.textContent = '(Auto-calculated)';
        }
        
        // Update total due display
        if (totalDueDisplay) {
            const newTotal = (member.amount || 0) + (member.interest || 0) + calculatedLateFee;
            totalDueDisplay.textContent = `₹${newTotal.toLocaleString('en-IN')}`;
        }
    } else {
        // No late fee
        if (lateFeeInfo) lateFeeInfo.textContent = '';
        if (lateFeeAutoCalc) lateFeeAutoCalc.textContent = '';
        if (lateFeeInput) lateFeeInput.value = 0;
        
        // Reset total due display
        if (totalDueDisplay && member) {
            const newTotal = (member.amount || 0) + (member.interest || 0);
            totalDueDisplay.textContent = `₹${newTotal.toLocaleString('en-IN')}`;
        }
    }
}

// Session Management Functions
// Save admin session to sessionStorage
function saveAdminSession() {
    try {
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminLoginTime', new Date().getTime().toString());
        console.log('✅ Admin session saved');
    } catch (error) {
        console.error('Failed to save admin session:', error);
    }
}

// Clear admin session from sessionStorage
function clearAdminSession() {
    try {
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminLoginTime');
        console.log('🔒 Admin session cleared');
    } catch (error) {
        console.error('Failed to clear admin session:', error);
    }
}

// Restore admin session from sessionStorage
function restoreAdminSession() {
    try {
        const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
        const loginTime = sessionStorage.getItem('adminLoginTime');
        
        if (isLoggedIn === 'true' && loginTime) {
            // Optional: Check if session is still valid (e.g., within 24 hours)
            const currentTime = new Date().getTime();
            const sessionAge = currentTime - parseInt(loginTime);
            const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (sessionAge < maxSessionAge) {
                // Restore admin state
                isAdmin = true;
                console.log('🔓 Admin session restored');
                
                // Clear login parameter from URL if present
                clearLoginUrlParameter();
                
                // Show admin panel if it was visible
                showAdminPanel();
                
                // Show success message
                setTimeout(() => {
                    showSuccess('✅ Welcome back! Session restored.');
                }, 500);
            } else {
                // Session expired
                console.log('⏱️ Admin session expired');
                clearAdminSession();
            }
        }
    } catch (error) {
        console.error('Failed to restore admin session:', error);
    }
}

// Clear login URL parameter
function clearLoginUrlParameter() {
    try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('login')) {
            url.searchParams.delete('login');
            // Update URL without reloading the page
            window.history.replaceState({}, document.title, url.pathname + url.search);
            console.log('🧹 Cleared login URL parameter');
        }
    } catch (error) {
        console.error('Failed to clear URL parameter:', error);
    }
}

// Update Cheeti Form Based on Selected Year
function updateCheetiForm() {
    const currentYear = new Date().getFullYear();
    const selectedYear = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG.currentYear : currentYear;
    
    const newMemberForm = document.getElementById('cheetiNewMemberForm');
    const paymentForm = document.getElementById('cheetiPaymentForm');
    const formTitle = document.getElementById('cheetiFormTitle');
    
    if (!newMemberForm || !paymentForm) return;
    
    if (selectedYear === currentYear) {
        // Current year: Show "Add New Member" form
        newMemberForm.style.display = 'block';
        paymentForm.style.display = 'none';
        if (formTitle) {
            formTitle.innerHTML = '<i class="fas fa-users"></i> Add Cheeti Member (Borrowing This Year)';
        }
    } else if (selectedYear < currentYear) {
        // Past year: Show "Record Payment" form
        newMemberForm.style.display = 'none';
        paymentForm.style.display = 'block';
        if (formTitle) {
            formTitle.innerHTML = '<i class="fas fa-money-check-alt"></i> Record Payment Collection';
        }
        // Populate member dropdown
        populateMemberDropdown();
    }
}

// Populate Member Dropdown for Past Year
function populateMemberDropdown() {
    const memberSelect = document.getElementById('cheetiMemberSelect');
    if (!memberSelect || !currentData || !currentData.cheeti) return;
    
    // Clear existing options except first one
    memberSelect.innerHTML = '<option value="">-- Select Member --</option>';
    
    // Add members to dropdown
    currentData.cheeti.forEach((member, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${member.name} - ₹${member.amount.toLocaleString('en-IN')}`;
        memberSelect.appendChild(option);
    });
}

// Load Member Details when Selected
function loadMemberDetails() {
    const memberSelect = document.getElementById('cheetiMemberSelect');
    const memberDetails = document.getElementById('memberDetails');
    const repaymentDate = document.getElementById('repaymentDate');
    
    if (!memberSelect || !memberDetails) return;
    
    const memberIndex = memberSelect.value;
    
    if (memberIndex === '' || !currentData || !currentData.cheeti || !currentData.cheeti[memberIndex]) {
        memberDetails.style.display = 'none';
        return;
    }
    
    const member = currentData.cheeti[memberIndex];
    
    // Show member details
    document.getElementById('memberPrincipal').textContent = `₹${member.amount.toLocaleString('en-IN')}`;
    document.getElementById('memberInterest').textContent = `₹${member.interest.toLocaleString('en-IN')}`;
    document.getElementById('memberTotalDue').textContent = `₹${(member.amount + member.interest).toLocaleString('en-IN')}`;
    
    memberDetails.style.display = 'block';
    
    // Set today's date as default payment date
    if (repaymentDate && !repaymentDate.value) {
        repaymentDate.value = new Date().toISOString().split('T')[0];
    }
    
    // Pre-fill existing payment data if available
    if (member.paid) {
        document.getElementById('repaymentPaid').checked = true;
        if (member.paymentDate) {
            repaymentDate.value = member.paymentDate;
        }
        if (member.lateFee) {
            document.getElementById('repaymentLateFee').value = member.lateFee;
        }
    }
}

// Load Data from GitHub
async function loadDataFromGitHub() {
    showLoading('Loading data...');
    
    try {
        // Get current year or use config
        const currentYear = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG.currentYear : 2026;
        const testMode = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG.TEST_MODE : (typeof CONFIG !== 'undefined' ? CONFIG.TEST_MODE : true);
        
        // TEST MODE: Load local file for testing
        if (testMode) {
            console.log(`🧪 TEST MODE: Loading local data for year ${currentYear}...`);
            const dataPath = `data/donations-${currentYear}.json`;
            const response = await fetch(dataPath + '?t=' + new Date().getTime());
            
            if (!response.ok) {
                console.warn(`⚠️ Data file not found for year ${currentYear}`);
                showYearNotInitializedWarning(currentYear);
                hideLoading();
                return;
            }
            
            currentData = await response.json();
            console.log(`✅ Local data loaded successfully for year ${currentYear}`);
        } else {
            // PRODUCTION MODE: Load from GitHub Contents API (no CDN cache)
            const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : CONFIG;
            const dataPath = `data/donations-${currentYear}.json`;
            const apiUrl = `${GITHUB_API_BASE}/repos/${config.GITHUB_OWNER}/${config.GITHUB_REPO}/contents/${dataPath}?ref=${config.GITHUB_BRANCH}`;
            
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `token ${config.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3.raw'
                }
            });
            
            if (!response.ok) {
                console.warn(`⚠️ Data file not found for year ${currentYear}`);
                showYearNotInitializedWarning(currentYear);
                hideLoading();
                return;
            }
            
            currentData = await response.json();
            
            console.log(`Data loaded successfully from GitHub API for year ${currentYear}:`, currentData);
        }
        
        // Hide warning if it was showing
        hideYearNotInitializedWarning();
        
        // Update year display in header if element exists
        const yearDisplay = document.querySelector('.header h1');
        if (yearDisplay && !yearDisplay.textContent.includes(currentYear)) {
            // Don't update if year selector is present
            if (!document.getElementById('yearSelect')) {
                yearDisplay.innerHTML = `<i class="fas fa-om"></i> Vinayaka Chavithi Dashboard ${currentYear}`;
            }
        }
        
        // Process and display data - delay slightly to ensure DOM is rendered
        setTimeout(() => {
            processData();
        }, 100);
        
        hideLoading();
        
        // Setup auto-refresh
        const refreshInterval = (typeof CONFIG !== 'undefined' && CONFIG.ENABLE_AUTO_REFRESH) ? CONFIG.REFRESH_INTERVAL : null;
        if (refreshInterval && !refreshTimer) {
            refreshTimer = setInterval(loadDataFromGitHub, refreshInterval);
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Check console for details.');
        hideLoading();
    }
}

// Show Year Not Initialized Warning
function showYearNotInitializedWarning(year) {
    // Hide all dashboard sections
    const dashboardSections = document.querySelectorAll('.dashboard-section');
    dashboardSections.forEach(section => section.style.display = 'none');
    
    // Check if warning already exists
    let warningDiv = document.getElementById('yearWarning');
    if (!warningDiv) {
        // Create warning container
        warningDiv = document.createElement('div');
        warningDiv.id = 'yearWarning';
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.insertBefore(warningDiv, mainContent.firstChild);
        }
    }
    
    warningDiv.innerHTML = `
        <div style="
            max-width: 600px;
            margin: 50px auto;
            padding: 40px;
            background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            text-align: center;
            border: 2px solid #ffa500;
        ">
            <div style="
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: pulse 2s infinite;
            ">
                <i class="fas fa-exclamation-triangle" style="font-size: 40px; color: white;"></i>
            </div>
            
            <h2 style="
                color: #2c3e50;
                margin-bottom: 15px;
                font-size: 28px;
            ">Year ${year} Not Initialized</h2>
            
            <p style="
                color: #7f8c8d;
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 30px;
            ">
                The data file for year <strong>${year}</strong> does not exist yet.<br>
                ${isAdmin ? 'Click the button below to initialize this year\'s data.' : 'Please contact the administrator to initialize this year.'}
            </p>
            
            ${isAdmin ? `
                <button onclick="initializeNewYear(${year})" style="
                    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                    color: white;
                    border: none;
                    padding: 15px 40px;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
                    transition: all 0.3s ease;
                    margin: 10px;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 7px 20px rgba(231, 76, 60, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 5px 15px rgba(231, 76, 60, 0.3)'">
                    <i class="fas fa-plus-circle"></i> Initialize Year ${year}
                </button>
                
                <p style="
                    color: #95a5a6;
                    font-size: 14px;
                    margin-top: 20px;
                    font-style: italic;
                    line-height: 1.6;
                ">
                    <i class="fas fa-info-circle"></i> This will create year ${year} with:<br>
                    • Empty data structure<br>
                    • Estimated collections from ${year - 1} cheeti members
                </p>
            ` : ''}
        </div>
    `;
    warningDiv.style.display = 'block';
}

// Hide Year Not Initialized Warning
function hideYearNotInitializedWarning() {
    // Show all dashboard sections
    const dashboardSections = document.querySelectorAll('.dashboard-section');
    dashboardSections.forEach(section => section.style.display = 'block');
    
    // Hide warning
    const warningDiv = document.getElementById('yearWarning');
    if (warningDiv) {
        warningDiv.style.display = 'none';
    }
}

// Initialize New Year Data
async function initializeNewYear(year) {
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    showLoading(`Initializing year ${year}...`);
    
    try {
        // Load previous year data to calculate estimated collections
        const previousYear = year - 1;
        const previousData = await loadYearData(previousYear);
        
        let estimatedCollections = 0;
        let estimatedDetails = [];
        let committeeMembers = [];
        
        // Calculate estimated collections from previous year's cheeti members
        // All members from previous year are expected to pay in current year
        if (previousData && previousData.cheeti && previousData.cheeti.length > 0) {
            previousData.cheeti.forEach(member => {
                const expectedAmount = member.amount + member.interest;
                estimatedCollections += expectedAmount;
                estimatedDetails.push({
                    name: member.name,
                    amount: member.amount,
                    interest: member.interest,
                    expectedTotal: expectedAmount,
                    fromYear: previousYear
                });
            });
            console.log(`📊 Estimated collections from ${previousYear}: ₹${estimatedCollections.toLocaleString('en-IN')}`);
        }
        
        // Copy committee from previous year's committee_next_year
        if (previousData && previousData.committee_next_year && previousData.committee_next_year.length > 0) {
            committeeMembers = [...previousData.committee_next_year];
            console.log(`👥 Copied ${committeeMembers.length} committee members from ${previousYear}'s next year committee`);
        }
        
        const newYearData = {
            year: year.toString(),
            lastUpdated: new Date().toISOString(),
            donations: [],
            cheeti: [],
            cheeti_collections: [],
            cheeti_expected: estimatedDetails, // Store expected collections details
            expenses: [],
            sponsors: [],
            laddu_winners: [],
            committee: committeeMembers, // Committee for this year (from previous year's next_year)
            committee_next_year: [], // Empty - to be populated for next year
            report: [
                { category: "Donations", amount: 0, type: "income" },
                { category: `Estimated Cheeti Collections (${previousYear})`, amount: estimatedCollections, type: "income_estimated" },
                { category: "Actual Cheeti Collections", amount: 0, type: "income" },
                { category: "Total Expenses", amount: 0, type: "expense" }
            ]
        };
        
        // Save the new year data
        const initCommitMsg = `[Dashboard Bot] 🎉 Initialize ${year} | ${estimatedCollections > 0 ? `₹${estimatedCollections.toLocaleString('en-IN')} estimated` : 'Fresh start'}`;
        await saveYearDataToFile(year, newYearData, initCommitMsg);
        
        let successMsg = `✅ Year ${year} initialized successfully!`;
        if (estimatedCollections > 0) {
            successMsg += ` Expected collections: ₹${estimatedCollections.toLocaleString('en-IN')}.`;
        }
        if (committeeMembers.length > 0) {
            successMsg += ` Committee: ${committeeMembers.length} member(s).`;
        }
        showSuccess(successMsg);
        
        // Reload the dashboard
        setTimeout(() => {
            loadDataFromGitHub();
        }, 2000);
        
    } catch (error) {
        console.error('Error initializing new year:', error);
        showError('Failed to initialize year. Check console for details.');
        hideLoading();
    }
}

// Save Year Data to File
async function saveYearDataToFile(year, data, commitMessage = null) {
    const testMode = (typeof DASHBOARD_CONFIG !== 'undefined') 
        ? DASHBOARD_CONFIG.TEST_MODE 
        : (typeof CONFIG !== 'undefined' ? CONFIG.TEST_MODE : true);
    
    if (testMode) {
        // TEST MODE: Download file for manual placement
        console.log(`📝 Year ${year} Data Structure:`);
        console.log(JSON.stringify(data, null, 2));
        
        // Create a downloadable file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `donations-${year}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSuccess(`✅ File downloaded! Save it as: data/donations-${year}.json`);
        
        return true;
    }
    
    // PRODUCTION MODE: Save directly to GitHub
    try {
        const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : CONFIG;
        const filePath = `data/donations-${year}.json`;
        
        // Check if file already exists (get SHA if it does)
        let existingSha = null;
        const checkUrl = `${GITHUB_API_BASE}/repos/${config.GITHUB_OWNER}/${config.GITHUB_REPO}/contents/${filePath}?ref=${config.GITHUB_BRANCH}`;
        const checkResponse = await fetch(checkUrl, {
            cache: 'no-store',
            headers: {
                'Authorization': `token ${config.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (checkResponse.ok) {
            const existingFile = await checkResponse.json();
            console.log(`📋 GitHub API response for ${filePath}:`, existingFile);
            existingSha = existingFile.sha || null;
            console.warn(`⚠️ File ${filePath} already exists. SHA: ${existingSha}`);
            if (!existingSha) {
                console.error('❌ SHA is missing from GitHub response! Full response:', JSON.stringify(existingFile));
            }
        } else {
            console.log(`✅ Creating new file: ${filePath}`);
        }

        // Prepare content
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
        
        // Create/Update file via GitHub API
        const url = `${GITHUB_API_BASE}/repos/${config.GITHUB_OWNER}/${config.GITHUB_REPO}/contents/${filePath}`;
        
        const timestamp = new Date().toLocaleString('en-IN', { 
            day: '2-digit', month: 'short', year: 'numeric', 
            hour: '2-digit', minute: '2-digit', hour12: true,
            timeZone: 'Asia/Kolkata'
        });
        const defaultMsg = `[Dashboard Bot] 📊 Update ${year} data | ${timestamp}`;
        
        const body = {
            message: commitMessage || defaultMsg,
            content: content,
            branch: config.GITHUB_BRANCH,
            author: {
                name: "Donations Bot",
                email: "bot@vinayaka-donations.local"
            },
            committer: {
                name: "Donations Bot",
                email: "bot@vinayaka-donations.local"
            }
        };
        
        // SHA is required when updating existing file
        if (existingSha) {
            body.sha = existingSha;
        }
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${config.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`GitHub API error: ${errorData.message || response.statusText}`);
        }
        
        const result = await response.json();
        console.log(`✅ File created/updated on GitHub:`, result.content.html_url);
        
        showSuccess(`✅ Year ${year} initialized and saved to GitHub!`);
        
        return true;
        
    } catch (error) {
        console.error('Error saving to GitHub:', error);
        throw error;
    }
}

// Process and Display Data
function processData() {
    if (!currentData) return;
    
    // Check dashboard visibility for non-admin users
    if (!checkDashboardVisibility()) {
        // Dashboard is disabled for members
        return;
    }
    
    // Dashboard is visible - ensure maintenance message is hidden
    hideDashboardDisabledMessage();
    
    // Extract data arrays
    const donationsData = currentData.donations || [];
    const cheetiData = currentData.cheeti || [];
    const expensesData = currentData.expenses || [];
    const reportData = currentData.report || [];
    
    // Update metrics
    updateMetrics(donationsData, cheetiData, expensesData, reportData);
    
    // Create charts
    try {
        createFinancialChart(reportData);
        createExpensesChart(expensesData);
        createCheetiChart(cheetiData);
    } catch (e) {
        console.error('Error creating charts:', e);
    }
    
    // Populate tables
    populateDonorsTable(donationsData);
    populateCheetiTable(cheetiData);
    populateExpensesTable(expensesData);
    
    // Populate committee table if data exists
    const committeeData = currentData.committee || [];
    populateCommitteeTable(committeeData);
    
    // Update announcements banner
    updateAnnouncements();
    
    // Populate cheeti paid table if admin
    if (isAdmin) {
        populateCheetiPaidTable(cheetiData);
        // Update cheeti form based on selected year
        updateCheetiForm();
        // Update committee management list
        updateCommitteeManagementList();
    }
}

// Update Metrics
function updateMetrics(donations, cheeti, expenses, report) {
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalDonors = donations.length;
    const avgDonation = totalDonors > 0 ? totalDonations / totalDonors : 0;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Calculate laddu winnings total
    const ladduWinnings = (currentData.laddu_winners || []).reduce((sum, w) => sum + (w.amount || 0), 0);
    
    // Total income includes all report amounts (including estimated collections) plus laddu winnings
    const reportIncome = report.reduce((sum, r) => {
        if (r.amount > 0) {
            return sum + r.amount;
        }
        return sum;
    }, 0);
    const totalIncome = reportIncome + ladduWinnings;
    const balance = totalIncome - totalExpenses;
    const cheetiMembers = cheeti.length;
    const cheetiInterest = cheeti.reduce((sum, c) => sum + (c.interest || 0), 0);
    
    safeSetText('totalDonations', formatCurrency(totalDonations));
    safeSetText('totalDonors', totalDonors);
    safeSetText('avgDonation', formatCurrency(avgDonation));
    safeSetText('totalIncome', formatCurrency(totalIncome));
    safeSetText('totalExpenses', formatCurrency(totalExpenses));
    safeSetText('balance', formatCurrency(balance));
    safeSetText('ladduWinnings', formatCurrency(ladduWinnings));
    safeSetText('cheetiMembers', cheetiMembers);
    safeSetText('cheetiInterest', formatCurrency(cheetiInterest));
}

// Save Data to GitHub
async function saveDataToGitHub() {
    if (!isAdmin) {
        showError('You must be logged in as admin to save data');
        return Promise.reject(new Error('Not logged in'));
    }
    
    // Get test mode from either DASHBOARD_CONFIG or CONFIG
    const testMode = (typeof DASHBOARD_CONFIG !== 'undefined') 
        ? DASHBOARD_CONFIG.TEST_MODE 
        : (typeof CONFIG !== 'undefined' ? CONFIG.TEST_MODE : true);
    
    // TEST MODE: Update in memory and refresh UI (temporary - lost on page refresh)
    if (testMode) {
        console.log('🧪 TEST MODE: Data saved in memory (temporary)');
        console.log('💡 Changes will be visible until page refresh');
        console.log('📊 Current data:', currentData);
        
        // Update timestamp
        currentData.lastUpdated = new Date().toISOString();
        
        // Refresh the UI with updated data
        processData();
        
        showSuccess('✅ Changes saved temporarily! (Lost on refresh - TEST MODE)');
        
        return Promise.resolve();
    }
    
    showLoading('Saving data to GitHub...');
    
    try {
        // Get current file SHA (required for update)
        const sha = await getFileSHA();
        
        if (!sha) {
            throw new Error('Could not get file SHA');
        }
        
        // Prepare data
        currentData.lastUpdated = new Date().toISOString();
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(currentData, null, 2))));
        
        // Get config (DASHBOARD_CONFIG or CONFIG)
        const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : CONFIG;
        
        // Update file via GitHub API
        const url = `${GITHUB_API_BASE}/repos/${config.GITHUB_OWNER || config.GITHUB_USERNAME}/${config.GITHUB_REPO}/contents/${config.DATA_FILE_PATH || config.getDataFilePath(config.currentYear)}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${config.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `[Dashboard Bot] 💰 Update donations & expenses | ${new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}`,
                content: content,
                sha: sha,
                branch: config.GITHUB_BRANCH,
                author: {
                    name: "Donations Bot",
                    email: "bot@vinayaka-donations.local"
                },
                committer: {
                    name: "Donations Bot",
                    email: "bot@vinayaka-donations.local"
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }
        
        showSuccess('✅ Data saved successfully to GitHub!');
        hideLoading();
        
        // Reload data after save
        setTimeout(() => loadDataFromGitHub(), 2000);
        
        return Promise.resolve();
        
    } catch (error) {
        console.error('Error saving data:', error);
        showError('Failed to save data to GitHub. Check console for details.');
        hideLoading();
        return Promise.reject(error);
    }
}

// Get File SHA from GitHub
async function getFileSHA() {
    try {
        // Get config (DASHBOARD_CONFIG or CONFIG)
        const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : CONFIG;
        
        const url = `${GITHUB_API_BASE}/repos/${config.GITHUB_OWNER || config.GITHUB_USERNAME}/${config.GITHUB_REPO}/contents/${config.DATA_FILE_PATH || config.getDataFilePath(config.currentYear)}?ref=${config.GITHUB_BRANCH}`;
        
        const response = await fetch(url, {
            cache: 'no-store',
            headers: {
                'Authorization': `token ${config.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to get file SHA');
        }
        
        const data = await response.json();
        return data.sha;
        
    } catch (error) {
        console.error('Error getting file SHA:', error);
        return null;
    }
}

// Add Donation
function addDonation() {
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const name = document.getElementById('donationName').value.trim();
    const amount = parseFloat(document.getElementById('donationAmount').value);
    
    if (!name || !amount || amount <= 0) {
        showError('Please enter valid name and amount');
        return;
    }
    
    // Check for duplicate name (case-insensitive)
    if (!currentData.donations) currentData.donations = [];
    
    const duplicate = currentData.donations.find(d => 
        d.name.toLowerCase() === name.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Donor "${name}" already exists. Duplicate names not allowed.`);
        return;
    }
    
    currentData.donations.push({
        slNo: currentData.donations.length + 1,
        name: name,
        amount: amount
    });
    
    // Clear form
    document.getElementById('donationName').value = '';
    document.getElementById('donationAmount').value = '';
    
    // Reset unsaved data flag
    hasUnsavedData = false;
    
    // Save to GitHub
    saveDataToGitHub();
}

// Add Cheeti Member
function addCheetiMember() {
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const name = document.getElementById('cheetiName').value.trim();
    const amount = parseFloat(document.getElementById('cheetiAmount').value);
    const interestRate = parseFloat(document.getElementById('cheetiInterest').value) || 12;
    
    if (!name || !amount || amount <= 0) {
        showError('Please enter valid name and amount');
        return;
    }
    
    // Check for duplicate name (case-insensitive)
    if (!currentData.cheeti) currentData.cheeti = [];
    
    const duplicate = currentData.cheeti.find(c => 
        c.name.toLowerCase() === name.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Cheeti member "${name}" already exists. Duplicate names not allowed.`);
        return;
    }
    
    // Calculate interest and total
    const interest = Math.round(amount * (interestRate / 100));
    const total = amount + interest;
    
    // New member for current year (will pay back next year)
    const cheetiMember = {
        slNo: currentData.cheeti.length + 1,
        name: name,
        amount: amount,
        interest: interest,
        total: total,
        paid: false,  // Not paid yet (will pay next year)
        paymentDate: null,
        lateFee: 0
    };
    
    currentData.cheeti.push(cheetiMember);
    
    // Clear form
    document.getElementById('cheetiName').value = '';
    document.getElementById('cheetiAmount').value = '';
    document.getElementById('cheetiInterestRate').value = '12';
    
    // Reset unsaved data flag
    hasUnsavedData = false;
    
    showSuccess('✅ Cheeti member added successfully!');
    
    // Save to GitHub
    saveDataToGitHub();
}

// Record Payment for Past Year Member
function recordPayment() {
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const memberIndex = document.getElementById('cheetiMemberSelect').value;
    const paymentDate = document.getElementById('repaymentDate').value;
    const lateFee = parseFloat(document.getElementById('repaymentLateFee').value) || 0;
    const isPaid = document.getElementById('repaymentPaid').checked;
    
    if (!memberIndex || memberIndex === '') {
        showError('Please select a member');
        return;
    }
    
    if (!paymentDate) {
        showError('Please enter payment date');
        return;
    }
    
    if (!currentData.cheeti || !currentData.cheeti[memberIndex]) {
        showError('Member not found');
        return;
    }
    
    const member = currentData.cheeti[memberIndex];
    
    // Auto-calculate late fee if cutover date is set (in case user didn't trigger auto-calc)
    const autoCalculatedLateFee = calculateLateFee(paymentDate);
    const finalLateFee = autoCalculatedLateFee > 0 ? autoCalculatedLateFee : lateFee;
    const daysOverdue = getDaysOverdue(paymentDate);
    
    const paymentAmount = member.amount + member.interest + finalLateFee;
    
    // Update member payment details in past year data
    currentData.cheeti[memberIndex].paid = isPaid;
    currentData.cheeti[memberIndex].paymentDate = isPaid ? paymentDate : null;
    currentData.cheeti[memberIndex].lateFee = finalLateFee;
    currentData.cheeti[memberIndex].total = paymentAmount;
    
    // Store days overdue if applicable
    if (daysOverdue > 0) {
        currentData.cheeti[memberIndex].days_overdue = daysOverdue;
    } else {
        currentData.cheeti[memberIndex].days_overdue = 0;
    }
    
    // If payment is marked as paid, add to current year's income
    if (isPaid) {
        addCheetiCollectionToCurrentYear(member.name, paymentAmount, paymentDate);
    }
    
    // Clear form
    document.getElementById('cheetiMemberSelect').value = '';
    document.getElementById('repaymentDate').value = '';
    document.getElementById('repaymentLateFee').value = '0';
    document.getElementById('repaymentPaid').checked = false;
    document.getElementById('memberDetails').style.display = 'none';
    
    // Clear auto-calculation UI elements
    const adminLateFeeInfo = document.getElementById('adminLateFeeInfo');
    const adminLateFeeAutoCalc = document.getElementById('adminLateFeeAutoCalc');
    if (adminLateFeeInfo) adminLateFeeInfo.textContent = '';
    if (adminLateFeeAutoCalc) adminLateFeeAutoCalc.textContent = '';
    
    // Reset unsaved data flag
    hasUnsavedData = false;
    
    showSuccess('✅ Payment recorded successfully!');
    
    // Save to GitHub
    saveDataToGitHub();
}

// Add Cheeti Collection to Current Year
async function addCheetiCollectionToCurrentYear(memberName, amount, paymentDate) {
    try {
        const currentYear = new Date().getFullYear();
        const selectedYear = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG.currentYear : currentYear;
        
        // Only add to current year if we're recording payment from a past year
        if (selectedYear >= currentYear) {
            console.log('Not adding collection - already in current year');
            return;
        }
        
        // Load current year data
        const currentYearData = await loadYearData(currentYear);
        
        if (!currentYearData) {
            console.error('Could not load current year data');
            return;
        }
        
        // Initialize cheeti_collections array if it doesn't exist
        if (!currentYearData.cheeti_collections) {
            currentYearData.cheeti_collections = [];
        }
        
        // Add the collection
        currentYearData.cheeti_collections.push({
            slNo: currentYearData.cheeti_collections.length + 1,
            memberName: memberName,
            amount: amount,
            fromYear: selectedYear,
            collectionDate: paymentDate,
            addedOn: new Date().toISOString()
        });
        
        // Update report - add to income
        if (!currentYearData.report) {
            currentYearData.report = [];
        }
        
        // Add or update Cheeti Collections in report
        const cheetiCollectionIndex = currentYearData.report.findIndex(r => r.category === 'Cheeti Collections');
        if (cheetiCollectionIndex >= 0) {
            currentYearData.report[cheetiCollectionIndex].amount += amount;
        } else {
            currentYearData.report.push({
                category: 'Cheeti Collections',
                amount: amount,
                type: 'income'
            });
        }
        
        // Save current year data
        await saveYearData(currentYear, currentYearData);
        
        console.log(`✅ Added ₹${amount} collection to ${currentYear} income`);
        showSuccess(`✅ Payment added to ${currentYear} income: ₹${amount.toLocaleString('en-IN')}`);
        
    } catch (error) {
        console.error('Error adding cheeti collection to current year:', error);
        showError('⚠️ Payment recorded but failed to add to current year income');
    }
}

// Load data for a specific year
async function loadYearData(year) {
    try {
        const testMode = (typeof DASHBOARD_CONFIG !== 'undefined') 
            ? DASHBOARD_CONFIG.TEST_MODE 
            : (typeof CONFIG !== 'undefined' ? CONFIG.TEST_MODE : true);
        
        const dataPath = `data/donations-${year}.json`;

        if (testMode) {
            const response = await fetch(dataPath + '?t=' + new Date().getTime());
            if (!response.ok) {
                throw new Error(`Failed to load data for year ${year}`);
            }
            return await response.json();
        }

        // GitHub mode - fetch from GitHub Contents API (no CDN cache)
        const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : CONFIG;
        const apiUrl = `${GITHUB_API_BASE}/repos/${config.GITHUB_OWNER}/${config.GITHUB_REPO}/contents/${dataPath}?ref=${config.GITHUB_BRANCH}`;
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `token ${config.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to load data for year ${year} from GitHub`);
        }
        return await response.json();
        
    } catch (error) {
        console.error(`Error loading data for year ${year}:`, error);
        return null;
    }
}

// Save data for a specific year
async function saveYearData(year, data) {
    try {
        const testMode = (typeof DASHBOARD_CONFIG !== 'undefined') 
            ? DASHBOARD_CONFIG.TEST_MODE 
            : (typeof CONFIG !== 'undefined' ? CONFIG.TEST_MODE : true);
        
        if (testMode) {
            // In test mode, we can't actually save to files
            console.log(`📝 Would save to year ${year}:`, data);
            console.log('⚠️ TEST MODE: Automatic file save not available. Data logged to console.');
            return true;
        }

        // GitHub mode - save via GitHub API
        const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : CONFIG;
        const dataPath = `data/donations-${year}.json`;
        const apiUrl = `${GITHUB_API_BASE}/repos/${config.GITHUB_OWNER || config.GITHUB_USERNAME}/${config.GITHUB_REPO}/contents/${dataPath}`;

        // Get current SHA for the year file
        let sha = null;
        const shaResponse = await fetch(apiUrl + `?ref=${config.GITHUB_BRANCH}`, {
            cache: 'no-store',
            headers: {
                'Authorization': `token ${config.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (shaResponse.ok) {
            const shaData = await shaResponse.json();
            console.log(`📋 saveYearData SHA response for ${year}:`, shaData);
            sha = shaData.sha || null;
            if (!sha && shaData) {
                console.error('❌ SHA missing in saveYearData! Response:', JSON.stringify(shaData));
            }
        }

        data.lastUpdated = new Date().toISOString();
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

        const timestamp = new Date().toLocaleString('en-IN', { 
            day: '2-digit', month: 'short', year: 'numeric', 
            hour: '2-digit', minute: '2-digit', hour12: true,
            timeZone: 'Asia/Kolkata'
        });
        const body = {
            message: `[Dashboard Bot] 🔄 Cross-year sync ${year} | ${timestamp}`,
            content: content,
            branch: config.GITHUB_BRANCH,
            author: {
                name: "Donations Bot",
                email: "bot@vinayaka-donations.local"
            },
            committer: {
                name: "Donations Bot",
                email: "bot@vinayaka-donations.local"
            }
        };
        if (sha) body.sha = sha;

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${config.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`GitHub API error saving year ${year}: ${response.statusText}`);
        }
        return true;
        
    } catch (error) {
        console.error(`Error saving data for year ${year}:`, error);
        throw error;
    }
}

// Add Expense
function addExpense() {
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const item = document.getElementById('expenseItem').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    
    if (!item || !amount || amount <= 0) {
        showError('Please enter valid item and amount');
        return;
    }
    
    // Check for duplicate item name (case-insensitive)
    if (!currentData.expenses) currentData.expenses = [];
    
    const duplicate = currentData.expenses.find(e => 
        e.item.toLowerCase() === item.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Expense item "${item}" already exists. Duplicate items not allowed.`);
        return;
    }
    
    currentData.expenses.push({
        item: item,
        amount: amount
    });
    
    // Clear form
    document.getElementById('expenseItem').value = '';
    document.getElementById('expenseAmount').value = '';
    
    // Reset unsaved data flag
    hasUnsavedData = false;
    
    // Save to GitHub
    saveDataToGitHub();
}

// Toggle Custom Sponsor Type Field
function toggleCustomSponsorType() {
    const typeSelect = document.getElementById('sponsorType');
    const customTypeGroup = document.getElementById('customSponsorTypeGroup');
    const customTypeInput = document.getElementById('customSponsorType');
    
    if (typeSelect && customTypeGroup) {
        if (typeSelect.value === 'Other') {
            customTypeGroup.style.display = 'block';
            if (customTypeInput) customTypeInput.focus();
        } else {
            customTypeGroup.style.display = 'none';
            if (customTypeInput) customTypeInput.value = '';
        }
    }
}

// Add Sponsor
function addSponsor() {
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const name = document.getElementById('sponsorName').value.trim();
    let type = document.getElementById('sponsorType').value;
    const customType = document.getElementById('customSponsorType').value.trim();
    const amount = parseFloat(document.getElementById('sponsorAmount').value) || 0;
    
    // If "Other" is selected, use custom type
    if (type === 'Other') {
        if (!customType) {
            showError('Please enter a custom sponsorship type');
            return;
        }
        type = customType;
    }
    
    if (!name || !type) {
        showError('Please enter sponsor name and type');
        return;
    }
    
    // Initialize sponsors array if it doesn't exist
    if (!currentData.sponsors) currentData.sponsors = [];
    
    currentData.sponsors.push({
        slNo: currentData.sponsors.length + 1,
        name: name,
        type: type,
        amount: amount
    });
    
    // Clear form
    document.getElementById('sponsorName').value = '';
    document.getElementById('sponsorType').value = '';
    document.getElementById('customSponsorType').value = '';
    document.getElementById('customSponsorTypeGroup').style.display = 'none';
    document.getElementById('sponsorAmount').value = '';
    
    // Reset unsaved data flag
    hasUnsavedData = false;
    
    showSuccess('✅ Sponsor added successfully!');
    
    // Update announcements
    updateAnnouncements();
    
    // Save to GitHub
    saveDataToGitHub();
}

// Add Laddu Winner
function addLadduWinner() {
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const name = document.getElementById('winnerName').value.trim();
    const amount = parseFloat(document.getElementById('winnerAmount').value) || 0;
    
    if (!name) {
        showError('Please enter winner name');
        return;
    }
    
    // Initialize laddu_winners array if it doesn't exist
    if (!currentData.laddu_winners) currentData.laddu_winners = [];
    
    currentData.laddu_winners.push({
        slNo: currentData.laddu_winners.length + 1,
        name: name,
        amount: amount,
        date: new Date().toISOString()
    });
    
    // Clear form
    document.getElementById('winnerName').value = '';
    document.getElementById('winnerAmount').value = '';
    
    // Reset unsaved data flag
    hasUnsavedData = false;
    
    showSuccess('✅ Laddu winner added successfully!');
    
    // Update announcements
    updateAnnouncements();
    
    // Save to GitHub
    saveDataToGitHub();
}

// Update Announcements Banner
async function updateAnnouncements() {
    const banner = document.getElementById('announcementBanner');
    const text1 = document.getElementById('announcementText');
    const text2 = document.getElementById('announcementText2');
    
    if (!banner || !text1 || !text2) return;
    
    let announcements = [];
    let usingPreviousYear = false;
    
    // Check if current year has data
    const hasCurrentYearData = (currentData.sponsors && currentData.sponsors.length > 0) || 
                                (currentData.laddu_winners && currentData.laddu_winners.length > 0);
    
    let dataToUse = currentData;
    
    // If no current year data, try to load previous year
    if (!hasCurrentYearData) {
        const currentYear = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG.currentYear : new Date().getFullYear();
        const previousYear = currentYear - 1;
        const previousYearData = await loadYearData(previousYear);
        
        if (previousYearData) {
            dataToUse = previousYearData;
            usingPreviousYear = true;
        }
    }
    
    // Add sponsor announcements
    if (dataToUse.sponsors && dataToUse.sponsors.length > 0) {
        const sponsorTexts = dataToUse.sponsors.map(s => {
            const amountText = s.amount > 0 ? ` - ₹${s.amount.toLocaleString('en-IN')}` : '';
            return `🙏 ${s.type} sponsored by ${s.name}${amountText}`;
        });
        announcements.push(...sponsorTexts);
    }
    
    // Add laddu winner announcements
    if (dataToUse.laddu_winners && dataToUse.laddu_winners.length > 0) {
        const winnerTexts = dataToUse.laddu_winners.map(w => {
            const amountText = w.amount > 0 ? ` for ₹${w.amount.toLocaleString('en-IN')}` : '';
            return `🏆 ${w.name} won Laddu${amountText}`;
        });
        announcements.push(...winnerTexts);
    }
    
    if (announcements.length > 0) {
        // Add year indicator if using previous year data
        if (usingPreviousYear) {
            const currentYear = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG.currentYear : new Date().getFullYear();
            announcements.unshift(`📅 Showing ${currentYear - 1} highlights`);
        }
        
        // Split announcements between two text elements for better scrolling
        const half = Math.ceil(announcements.length / 2);
        text1.textContent = announcements.slice(0, half).join('   •   ');
        text2.textContent = announcements.slice(half).join('   •   ');
        banner.style.display = 'block';
    } else {
        banner.style.display = 'none';
    }
}

// Helper Functions
function safeSetText(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
}

function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN', {maximumFractionDigits: 0});
}

// Show/Hide Actions Columns
function showActionsColumns() {
    const headers = ['donorActionsHeader', 'cheetiActionsHeader', 'expenseActionsHeader'];
    headers.forEach(id => {
        const header = document.getElementById(id);
        if (header) header.style.display = '';
    });
}

function hideActionsColumns() {
    const headers = ['donorActionsHeader', 'cheetiActionsHeader', 'expenseActionsHeader'];
    headers.forEach(id => {
        const header = document.getElementById(id);
        if (header) header.style.display = 'none';
    });
}

// Edit Modal Functions
let currentEditType = null;
let currentEditIndex = null;

function showEditModal(type, index) {
    const modal = document.getElementById('editModal');
    const title = document.getElementById('editModalTitle');
    const body = document.getElementById('editModalBody');
    
    currentEditType = type;
    currentEditIndex = index;
    
    body.innerHTML = ''; // Clear previous content
    
    if (type === 'donor') {
        const donor = currentData.donations[index];
        title.textContent = 'Edit Donor';
        body.innerHTML = `
            <div class="edit-form-group">
                <label for="editName">Name</label>
                <input type="text" id="editName" value="${donor.name}" required>
            </div>
            <div class="edit-form-group">
                <label for="editAmount">Amount (₹)</label>
                <input type="number" id="editAmount" value="${donor.amount}" min="0" step="1" required>
            </div>
        `;
    } else if (type === 'cheeti') {
        const member = currentData.cheeti[index];
        title.textContent = 'Edit Cheeti Member';
        body.innerHTML = `
            <div class="edit-form-group">
                <label for="editName">Name</label>
                <input type="text" id="editName" value="${member.name}" required>
            </div>
            <div class="edit-form-group">
                <label for="editAmount">Amount (₹)</label>
                <input type="number" id="editAmount" value="${member.amount}" min="0" step="1" required>
            </div>
            <p style="color: #7f8c8d; font-size: 0.9rem; margin-top: 10px;">
                <i class="fas fa-info-circle"></i> Interest will be calculated automatically at 12%
            </p>
        `;
    } else if (type === 'expense') {
        const expense = currentData.expenses[index];
        title.textContent = 'Edit Expense';
        body.innerHTML = `
            <div class="edit-form-group">
                <label for="editItem">Item</label>
                <input type="text" id="editItem" value="${expense.item}" required>
            </div>
            <div class="edit-form-group">
                <label for="editAmount">Amount (₹)</label>
                <input type="number" id="editAmount" value="${expense.amount}" min="0" step="1" required>
            </div>
        `;
    } else if (type === 'cheeti-payment') {
        const member = currentData.cheeti[index];
        title.textContent = 'Edit Payment Details';
        const dateValue = member.paymentDate || '';
        
        // Check if cutover date is set
        let cutoverInfo = '';
        if (currentData.cheeti_settings && currentData.cheeti_settings.cutover_date) {
            const cutoverDate = new Date(currentData.cheeti_settings.cutover_date);
            const lateFeePerDay = currentData.cheeti_settings.late_fee_per_day || 50;
            cutoverInfo = `
                <div style="background: #fff3e0; padding: 12px; border-radius: 6px; margin-bottom: 15px; border-left: 3px solid #ff9800;">
                    <div style="color: #e65100; font-size: 0.85rem;">
                        <i class="fas fa-calendar-times"></i> <strong>Payment Deadline:</strong> ${cutoverDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
                        <i class="fas fa-money-bill-wave"></i> <strong>Late Fee Rate:</strong> ₹${lateFeePerDay}/day after deadline
                    </div>
                </div>
            `;
        }
        
        body.innerHTML = `
            ${cutoverInfo}
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Member: ${member.name}</h4>
                <p style="margin: 5px 0; color: #7f8c8d;">Principal: ${formatCurrency(member.amount)}</p>
                <p style="margin: 5px 0; color: #7f8c8d;">Interest: ${formatCurrency(member.interest || 0)}</p>
            </div>
            <div class="edit-form-group">
                <label for="editPaymentDate">Payment Date</label>
                <input type="date" id="editPaymentDate" value="${dateValue}" onchange="autoCalculateLateFee()">
            </div>
            <div class="edit-form-group">
                <label for="editLateFee">Late Fee (₹) <span id="lateFeeAutoCalc" style="color: #ff9800; font-size: 0.85rem;"></span></label>
                <input type="number" id="editLateFee" value="${member.lateFee || 0}" min="0" step="1">
                <div id="lateFeeInfo" style="color: #666; font-size: 0.85rem; margin-top: 5px;"></div>
            </div>
            <div class="edit-form-group">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                    <input type="checkbox" id="editPaid" ${member.paid ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;">
                    <span>Payment Received</span>
                </label>
            </div>
            <p style="color: #7f8c8d; font-size: 0.9rem; margin-top: 15px;">
                <i class="fas fa-info-circle"></i> Total Due: <span id="totalDueAmount">${formatCurrency((member.amount || 0) + (member.interest || 0) + (member.lateFee || 0))}</span>
            </p>
        `;
        
        // Auto-calculate late fee if payment date is set
        setTimeout(() => autoCalculateLateFee(), 100);
    }
    
    modal.classList.add('show');
    document.body.classList.add('modal-open');
}

function hideEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    currentEditType = null;
    currentEditIndex = null;
}

function saveEditModal() {
    if (currentEditType === 'donor') {
        saveDonorFromModal(currentEditIndex);
    } else if (currentEditType === 'cheeti') {
        saveCheetiMemberFromModal(currentEditIndex);
    } else if (currentEditType === 'expense') {
        saveExpenseFromModal(currentEditIndex);
    } else if (currentEditType === 'cheeti-payment') {
        saveCheetiPaymentFromModal(currentEditIndex);
    }
}

function saveDonorFromModal(index) {
    const donor = currentData.donations[index];
    if (!donor) return;
    
    const nameInput = document.getElementById('editName');
    const amountInput = document.getElementById('editAmount');
    
    if (!nameInput || !amountInput) return;
    
    const newName = nameInput.value.trim();
    const newAmount = parseFloat(amountInput.value) || 0;
    
    if (!newName || newAmount <= 0) {
        showError('⚠️ Please enter valid name and amount');
        return;
    }
    
    // Check for duplicate name (exclude current donor)
    const duplicate = currentData.donations.find((d, i) => 
        i !== index && d.name.toLowerCase() === newName.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Donor "${newName}" already exists. Duplicate names not allowed.`);
        return;
    }
    
    // Update donor data
    donor.name = newName;
    donor.amount = newAmount;
    
    hideEditModal();
    
    // Save to GitHub
    showLoading('Saving changes...');
    saveDataToGitHub().then(() => {
        hideLoading();
        showSuccess('✅ Donor updated successfully!');
    }).catch(error => {
        hideLoading();
        showError('❌ Failed to save: ' + error.message);
    });
}

function saveCheetiMemberFromModal(index) {
    const member = currentData.cheeti[index];
    if (!member) return;
    
    const nameInput = document.getElementById('editName');
    const amountInput = document.getElementById('editAmount');
    
    if (!nameInput || !amountInput) return;
    
    const newName = nameInput.value.trim();
    const newAmount = parseFloat(amountInput.value) || 0;
    
    if (!newName || newAmount <= 0) {
        showError('⚠️ Please enter valid name and amount');
        return;
    }
    
    // Check for duplicate name (exclude current member)
    const duplicate = currentData.cheeti.find((c, i) => 
        i !== index && c.name.toLowerCase() === newName.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Cheeti member "${newName}" already exists. Duplicate names not allowed.`);
        return;
    }
    
    // Get interest rate (default to 12% if not defined)
    const interestRate = 12;
    const newInterest = Math.round(newAmount * (interestRate / 100));
    
    // Update member data - preserve late fee and payment status
    member.name = newName;
    member.amount = newAmount;
    member.interest = newInterest;
    member.total = newAmount + newInterest + (member.lateFee || 0);
    
    hideEditModal();
    
    // Save to GitHub
    showLoading('Saving changes...');
    saveDataToGitHub().then(() => {
        hideLoading();
        showSuccess('✅ Cheeti member updated successfully!');
    }).catch(error => {
        hideLoading();
        showError('❌ Failed to save: ' + error.message);
    });
}

function saveExpenseFromModal(index) {
    const expense = currentData.expenses[index];
    if (!expense) return;
    
    const itemInput = document.getElementById('editItem');
    const amountInput = document.getElementById('editAmount');
    
    if (!itemInput || !amountInput) return;
    
    const newItem = itemInput.value.trim();
    const newAmount = parseFloat(amountInput.value) || 0;
    
    if (!newItem || newAmount <= 0) {
        showError('⚠️ Please enter valid item and amount');
        return;
    }
    
    // Check for duplicate item (exclude current expense)
    const duplicate = currentData.expenses.find((e, i) => 
        i !== index && e.item.toLowerCase() === newItem.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Expense item "${newItem}" already exists. Duplicate items not allowed.`);
        return;
    }
    
    // Update expense data
    expense.item = newItem;
    expense.amount = newAmount;
    
    hideEditModal();
    
    // Save to GitHub
    showLoading('Saving changes...');
    saveDataToGitHub().then(() => {
        hideLoading();
        showSuccess('✅ Expense updated successfully!');
    }).catch(error => {
        hideLoading();
        showError('❌ Failed to save: ' + error.message);
    });
}

function saveCheetiPaymentFromModal(index) {
    const member = currentData.cheeti[index];
    if (!member) return;
    
    const lateFeeInput = document.getElementById('editLateFee');
    const paidInput = document.getElementById('editPaid');
    const dateInput = document.getElementById('editPaymentDate');
    
    if (!lateFeeInput || !paidInput || !dateInput) return;
    
    const lateFee = parseFloat(lateFeeInput.value) || 0;
    const isPaid = paidInput.checked;
    const paymentDate = dateInput.value;
    
    // Update member payment details
    member.lateFee = lateFee;
    member.paid = isPaid;
    member.paymentDate = isPaid ? paymentDate : null;
    member.total = (member.amount || 0) + (member.interest || 0) + lateFee;
    
    // Store days overdue if applicable
    if (paymentDate) {
        const daysOverdue = getDaysOverdue(paymentDate);
        if (daysOverdue > 0) {
            member.days_overdue = daysOverdue;
        } else {
            member.days_overdue = 0;
        }
    }
    
    hideEditModal();
    
    // Save to GitHub
    showLoading('Saving changes...');
    saveDataToGitHub().then(() => {
        hideLoading();
        showSuccess('✅ Payment details updated successfully!');
    }).catch(error => {
        hideLoading();
        showError('❌ Failed to save: ' + error.message);
    });
}

// Auto-calculate late fee based on payment date
function autoCalculateLateFee() {
    const dateInput = document.getElementById('editPaymentDate');
    const lateFeeInput = document.getElementById('editLateFee');
    const lateFeeInfo = document.getElementById('lateFeeInfo');
    const lateFeeAutoCalc = document.getElementById('lateFeeAutoCalc');
    const totalDueAmount = document.getElementById('totalDueAmount');
    
    if (!dateInput || !dateInput.value) {
        console.log('❌ Auto-calc skipped: No payment date');
        return;
    }
    
    const paymentDate = dateInput.value;
    const calculatedLateFee = calculateLateFee(paymentDate);
    const daysOverdue = getDaysOverdue(paymentDate);
    
    console.log('📅 Auto-calculating late fee...', {
        paymentDate,
        daysOverdue,
        calculatedLateFee,
        hasSettings: !!(currentData && currentData.cheeti_settings),
        cutoverDate: currentData?.cheeti_settings?.cutover_date,
        lateFeePerDay: currentData?.cheeti_settings?.late_fee_per_day
    });
    
    if (daysOverdue > 0 && currentData.cheeti_settings) {
        const lateFeePerDay = currentData.cheeti_settings.late_fee_per_day || 50;
        
        // Update late fee input
        if (lateFeeInput) lateFeeInput.value = calculatedLateFee;
        
        // Show calculation info
        if (lateFeeInfo) {
            lateFeeInfo.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: #ff9800;"></i> ${daysOverdue} day(s) overdue × ₹${lateFeePerDay}/day = ₹${calculatedLateFee.toLocaleString('en-IN')}`;
        }
        
        if (lateFeeAutoCalc) {
            lateFeeAutoCalc.textContent = '(Auto-calculated)';
        }
        
        // Update total due
        if (totalDueAmount && currentEditIndex !== null) {
            const member = currentData.cheeti[currentEditIndex];
            const newTotal = (member.amount || 0) + (member.interest || 0) + calculatedLateFee;
            totalDueAmount.textContent = formatCurrency(newTotal);
        }
        
        console.log('✅ Late fee auto-calculated:', calculatedLateFee);
    } else {
        // No late fee
        if (lateFeeInfo) lateFeeInfo.textContent = '';
        if (lateFeeAutoCalc) lateFeeAutoCalc.textContent = '';
        if (lateFeeInput) lateFeeInput.value = 0;
        
        // Update total due
        if (totalDueAmount && currentEditIndex !== null) {
            const member = currentData.cheeti[currentEditIndex];
            const newTotal = (member.amount || 0) + (member.interest || 0);
            totalDueAmount.textContent = formatCurrency(newTotal);
        }
        
        console.log('ℹ️ No late fee:', daysOverdue <= 0 ? 'Payment on time' : 'No cutover settings');
    }
}

function setGeneratedDate() {
    const element = document.getElementById('generatedDate');
    if (element) {
        const date = new Date();
        element.textContent = date.toLocaleString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }
}

function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');
    if (overlay) overlay.style.display = 'flex';
    if (text) text.textContent = message;
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showError(message) {
    showToast(message, 'error');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}

// Chart Functions
function createFinancialChart(reportData) {
    const ctx = document.getElementById('financialChart');
    if (!ctx || !reportData || reportData.length === 0) return;
    
    // Filter out estimated amounts - only show actual income and expenses
    const actualData = reportData.filter(r => r.type !== 'income_estimated');
    
    // Add laddu winnings to the chart if present
    const ladduWinnings = (currentData.laddu_winners || []).reduce((sum, w) => sum + (w.amount || 0), 0);
    if (ladduWinnings > 0) {
        actualData.push({
            category: 'Laddu Winnings',
            amount: ladduWinnings,
            type: 'income'
        });
    }
    
    if (!actualData || actualData.length === 0) return;
    
    if (window.financialChartInstance) window.financialChartInstance.destroy();
    
    window.financialChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: actualData.map(r => r.category),
            datasets: [{
                label: 'Amount',
                data: actualData.map(r => r.amount),
                backgroundColor: actualData.map(r => {
                    if (r.category === 'Total Amount') return '#2ecc71';
                    if (r.category === 'Total Expenses') return '#e74c3c';
                    if (r.category === 'Laddu Winnings') return '#f39c12';
                    return '#3498db';
                }),
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '₹' + context.parsed.y.toLocaleString('en-IN');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + (value/1000).toFixed(0) + 'K';
                        }
                    }
                }
            }
        }
    });
}

function createExpensesChart(expensesData) {
    const ctx = document.getElementById('expensesChart');
    if (!ctx || !expensesData || expensesData.length === 0) return;
    
    if (window.expensesChartInstance) window.expensesChartInstance.destroy();
    
    window.expensesChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: expensesData.map(e => e.item),
            datasets: [{
                data: expensesData.map(e => e.amount),
                backgroundColor: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 15, font: { size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            return label + ': ₹' + value.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });
}

function createCheetiChart(cheetiData) {
    const ctx = document.getElementById('cheetiChart');
    if (!ctx || !cheetiData || cheetiData.length === 0) return;
    
    const totalPrincipal = cheetiData.reduce((sum, c) => sum + c.amount, 0);
    const totalInterest = cheetiData.reduce((sum, c) => sum + (c.interest || 0), 0);
    const totalValue = cheetiData.reduce((sum, c) => sum + (c.total || 0), 0);
    
    if (window.cheetiChartInstance) window.cheetiChartInstance.destroy();
    
    window.cheetiChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Principal', 'Interest', 'Total Value'],
            datasets: [{
                label: 'Amount',
                data: [totalPrincipal, totalInterest, totalValue],
                backgroundColor: ['#3498db', '#2ecc71', '#9b59b6'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '₹' + context.parsed.y.toLocaleString('en-IN');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + (value/1000).toFixed(0) + 'K';
                        }
                    }
                }
            }
        }
    });
}

function populateDonorsTable(donationsData) {
    const tbody = document.getElementById('donorsTableBody');
    if (!tbody) return;
    
    const sortedData = donationsData.sort((a, b) => b.amount - a.amount);
    
    tbody.innerHTML = sortedData.map((d, i) => {
        const originalIndex = donationsData.indexOf(d);
        return `
        <tr id="donor-row-${originalIndex}" data-index="${originalIndex}">
            <td>${i + 1}</td>
            <td>${d.name}</td>
            <td>${formatCurrency(d.amount)}</td>
            <td style="${isAdmin ? '' : 'display: none;'}">
                ${isAdmin ? `<button class="action-btn edit" onclick="showEditModal('donor', ${originalIndex})">
                    <i class="fas fa-edit"></i> Edit
                </button>` : ''}
            </td>
        </tr>
    `}).join('');
}

function populateCheetiTable(cheetiData) {
    const tbody = document.getElementById('cheetiTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = cheetiData.map((c, index) => {
        const totalWithLateFee = (c.amount || 0) + (c.interest || 0) + (c.lateFee || 0);
        return `
        <tr id="cheeti-member-row-${index}" data-index="${index}">
            <td>${c.slNo}</td>
            <td>${c.name}</td>
            <td>${formatCurrency(c.amount)}</td>
            <td>${formatCurrency(c.interest || 0)}</td>
            <td><strong>${formatCurrency(totalWithLateFee)}</strong></td>
            <td style="${isAdmin ? '' : 'display: none;'}">
                ${isAdmin ? `<button class="action-btn edit" onclick="showEditModal('cheeti', ${index})">
                    <i class="fas fa-edit"></i> Edit
                </button>` : ''}
            </td>
        </tr>
    `}).join('');
}

function populateCheetiPaidTable(cheetiData) {
    const tbody = document.getElementById('cheetiPaidTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = cheetiData.map((c, index) => {
        const totalDue = (c.amount || 0) + (c.interest || 0) + (c.lateFee || 0);
        const statusClass = c.paid ? 'paid' : 'unpaid';
        const statusText = c.paid ? '✓ Paid' : '✗ Pending';
        const formattedDate = c.paymentDate ? new Date(c.paymentDate).toLocaleDateString('en-IN') : '-';
        
        return `
            <tr id="cheeti-row-${index}" data-index="${index}">
                <td>${c.slNo}</td>
                <td>${c.name}</td>
                <td>${formatCurrency(c.amount || 0)}</td>
                <td>${formatCurrency(c.interest || 0)}</td>
                <td class="late-fee-cell">${formatCurrency(c.lateFee || 0)}</td>
                <td><strong>${formatCurrency(totalDue)}</strong></td>
                <td class="status-cell">
                    <span class="paid-status ${statusClass}">${statusText}</span>
                </td>
                <td class="date-cell">${formattedDate}</td>
                <td>
                    <button class="action-btn edit" onclick="editCheetiEntry(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Edit Cheeti Entry - Show Modal
function editCheetiEntry(index) {
    showEditModal('cheeti-payment', index);
}

// Note: Cheeti payment editing now uses modal (see saveCheetiPaymentFromModal)

// Edit Donor Entry
function editDonorEntry(index) {
    const row = document.getElementById(`donor-row-${index}`);
    if (!row) return;
    
    const donor = currentData.donations[index];
    if (!donor) return;
    
    // Replace cells with input fields
    row.querySelector('.name-cell').innerHTML = `
        <input type="text" class="edit-input" id="edit-donor-name-${index}" 
               value="${donor.name}" style="width: 100%;">
    `;
    
    row.querySelector('.amount-cell').innerHTML = `
        <input type="number" class="edit-input" id="edit-donor-amount-${index}" 
               value="${donor.amount}" min="0" step="1" style="width: 100%;">
    `;
    
    // Replace action button
    row.querySelector('td:last-child').innerHTML = `
        <button class="action-btn save" onclick="saveDonorEntry(${index})">
            <i class="fas fa-save"></i> Save
        </button>
        <button class="action-btn cancel" onclick="cancelDonorEdit()">
            <i class="fas fa-times"></i> Cancel
        </button>
    `;
}

// Save Donor Entry
function saveDonorEntry(index) {
    const donor = currentData.donations[index];
    if (!donor) return;
    
    const nameInput = document.getElementById(`edit-donor-name-${index}`);
    const amountInput = document.getElementById(`edit-donor-amount-${index}`);
    
    if (!nameInput || !amountInput) return;
    
    const newName = nameInput.value.trim();
    const newAmount = parseFloat(amountInput.value) || 0;
    
    if (!newName || newAmount <= 0) {
        showError('⚠️ Please enter valid name and amount');
        return;
    }
    
    // Check for duplicate name (exclude current donor)
    const duplicate = currentData.donations.find((d, i) => 
        i !== index && d.name.toLowerCase() === newName.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Donor "${newName}" already exists. Duplicate names not allowed.`);
        return;
    }
    
    // Update donor data
    donor.name = newName;
    donor.amount = newAmount;
    
    // Save to GitHub
    showLoading('Saving changes...');
    saveDataToGitHub().then(() => {
        showSuccess('✅ Donor updated successfully!');
    }).catch(error => {
        showError('❌ Failed to save: ' + error.message);
    });
}

// Cancel Donor Edit
function cancelDonorEdit() {
    populateDonorsTable(currentData.donations);
}

// Edit Cheeti Member Entry
function editCheetiMemberEntry(index) {
    const row = document.getElementById(`cheeti-member-row-${index}`);
    if (!row) return;
    
    const member = currentData.cheeti[index];
    if (!member) return;
    
    // Replace cells with input fields
    row.querySelector('.name-cell').innerHTML = `
        <input type="text" class="edit-input" id="edit-member-name-${index}" 
               value="${member.name}" style="width: 100%;">
    `;
    
    row.querySelector('.amount-cell').innerHTML = `
        <input type="number" class="edit-input" id="edit-member-amount-${index}" 
               value="${member.amount}" min="0" step="1" style="width: 100%;">
    `;
    
    // Replace action button
    row.querySelector('td:last-child').innerHTML = `
        <button class="action-btn save" onclick="saveCheetiMemberEntry(${index})">
            <i class="fas fa-save"></i> Save
        </button>
        <button class="action-btn cancel" onclick="cancelCheetiMemberEdit()">
            <i class="fas fa-times"></i> Cancel
        </button>
    `;
}

// Save Cheeti Member Entry
function saveCheetiMemberEntry(index) {
    const member = currentData.cheeti[index];
    if (!member) return;
    
    const nameInput = document.getElementById(`edit-member-name-${index}`);
    const amountInput = document.getElementById(`edit-member-amount-${index}`);
    
    if (!nameInput || !amountInput) return;
    
    const newName = nameInput.value.trim();
    const newAmount = parseFloat(amountInput.value) || 0;
    
    if (!newName || newAmount <= 0) {
        showError('⚠️ Please enter valid name and amount');
        return;
    }
    
    // Check for duplicate name (exclude current member)
    const duplicate = currentData.cheeti.find((c, i) => 
        i !== index && c.name.toLowerCase() === newName.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Cheeti member "${newName}" already exists. Duplicate names not allowed.`);
        return;
    }
    
    // Get interest rate (default to 12% if not defined)
    const interestRate = 12;
    const newInterest = Math.round(newAmount * (interestRate / 100));
    
    // Update member data - preserve late fee and payment status
    member.name = newName;
    member.amount = newAmount;
    member.interest = newInterest;
    member.total = newAmount + newInterest + (member.lateFee || 0);
    
    // Save to GitHub
    showLoading('Saving changes...');
    saveDataToGitHub().then(() => {
        showSuccess('✅ Cheeti member updated successfully!');
    }).catch(error => {
        showError('❌ Failed to save: ' + error.message);
    });
}

// Cancel Cheeti Member Edit
function cancelCheetiMemberEdit() {
    populateCheetiTable(currentData.cheeti);
}

// Edit Expense Entry
function editExpenseEntry(index) {
    const row = document.getElementById(`expense-row-${index}`);
    if (!row) return;
    
    const expense = currentData.expenses[index];
    if (!expense) return;
    
    // Replace cells with input fields
    row.querySelector('.item-cell').innerHTML = `
        <input type="text" class="edit-input" id="edit-expense-item-${index}" 
               value="${expense.item}" style="width: 100%;">
    `;
    
    row.querySelector('.amount-cell').innerHTML = `
        <input type="number" class="edit-input" id="edit-expense-amount-${index}" 
               value="${expense.amount}" min="0" step="1" style="width: 100%;">
    `;
    
    // Replace action button
    row.querySelector('td:last-child').innerHTML = `
        <button class="action-btn save" onclick="saveExpenseEntry(${index})">
            <i class="fas fa-save"></i> Save
        </button>
        <button class="action-btn cancel" onclick="cancelExpenseEdit()">
            <i class="fas fa-times"></i> Cancel
        </button>
    `;
}

// Save Expense Entry
function saveExpenseEntry(index) {
    const expense = currentData.expenses[index];
    if (!expense) return;
    
    const itemInput = document.getElementById(`edit-expense-item-${index}`);
    const amountInput = document.getElementById(`edit-expense-amount-${index}`);
    
    if (!itemInput || !amountInput) return;
    
    const newItem = itemInput.value.trim();
    const newAmount = parseFloat(amountInput.value) || 0;
    
    if (!newItem || newAmount <= 0) {
        showError('⚠️ Please enter valid item and amount');
        return;
    }
    
    // Check for duplicate item (exclude current expense)
    const duplicate = currentData.expenses.find((e, i) => 
        i !== index && e.item.toLowerCase() === newItem.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Expense item "${newItem}" already exists. Duplicate items not allowed.`);
        return;
    }
    
    // Update expense data
    expense.item = newItem;
    expense.amount = newAmount;
    
    // Save to GitHub
    showLoading('Saving changes...');
    saveDataToGitHub().then(() => {
        showSuccess('✅ Expense updated successfully!');
    }).catch(error => {
        showError('❌ Failed to save: ' + error.message);
    });
}

// Cancel Expense Edit
function cancelExpenseEdit() {
    populateExpensesTable(currentData.expenses);
}

function populateExpensesTable(expensesData) {
    const tbody = document.querySelector('#expensesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = expensesData.map((e, index) => `
        <tr id="expense-row-${index}" data-index="${index}">
            <td>${e.item}</td>
            <td>${formatCurrency(e.amount)}</td>
            <td style="${isAdmin ? '' : 'display: none;'}">
                ${isAdmin ? `<button class="action-btn edit" onclick="showEditModal('expense', ${index})">
                    <i class="fas fa-edit"></i> Edit
                </button>` : ''}
            </td>
        </tr>
    `).join('');
}

// Committee Management Functions

// Add Committee Member for Next Year
function addCommitteeMember() {
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const name = document.getElementById('committeeMemberName').value.trim();
    const role = document.getElementById('committeeMemberRole').value;
    
    if (!name || !role) {
        showError('Please enter member name and select a role');
        return;
    }
    
    // Initialize committee_next_year array if it doesn't exist
    if (!currentData.committee_next_year) {
        currentData.committee_next_year = [];
    }
    
    // Check for duplicate name (case-insensitive)
    const duplicate = currentData.committee_next_year.find(m => 
        m.name.toLowerCase() === name.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Committee member "${name}" already exists. Duplicate names not allowed.`);
        return;
    }
    
    // Add new committee member
    currentData.committee_next_year.push({
        name: name,
        role: role
    });
    
    // Clear form
    document.getElementById('committeeMemberName').value = '';
    document.getElementById('committeeMemberRole').value = '';
    
    // Reset unsaved data flag
    hasUnsavedData = false;
    
    showSuccess(`✅ ${name} added to next year's committee as ${role}`);
    
    // Update committee management list
    updateCommitteeManagementList();
    
    // Save to GitHub
    saveDataToGitHub();
}

// Store index for deletion confirmation
let pendingDeleteIndex = null;

// Show Committee Delete Confirmation Modal
function showCommitteeDeleteModal(index) {
    if (!currentData.committee_next_year || !currentData.committee_next_year[index]) {
        showError('Committee member not found');
        return;
    }
    
    const member = currentData.committee_next_year[index];
    pendingDeleteIndex = index;
    
    const modal = document.getElementById('committeeDeleteModal');
    const message = document.getElementById('committeeDeleteMessage');
    
    if (modal && message) {
        message.innerHTML = `<p style="margin: 0; font-size: 15px; color: #333;">Are you sure you want to remove <strong>${member.name}</strong> (<strong>${member.role}</strong>) from next year's committee?</p>`;
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }
}

// Hide Committee Delete Confirmation Modal
function hideCommitteeDeleteModal() {
    const modal = document.getElementById('committeeDeleteModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        pendingDeleteIndex = null;
    }
}

// Confirm Committee Member Deletion
function confirmCommitteeDelete() {
    if (pendingDeleteIndex === null) return;
    
    deleteCommitteeMember(pendingDeleteIndex);
    hideCommitteeDeleteModal();
}

// Delete Committee Member
function deleteCommitteeMember(index) {
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    if (!currentData.committee_next_year || !currentData.committee_next_year[index]) {
        showError('Committee member not found');
        return;
    }
    
    const member = currentData.committee_next_year[index];
    
    // Remove the member
    currentData.committee_next_year.splice(index, 1);
    
    // Reset unsaved data flag
    hasUnsavedData = false;
    
    showSuccess(`✅ ${member.name} removed from next year's committee`);
    
    // Update committee management list
    updateCommitteeManagementList();
    
    // Save to GitHub
    saveDataToGitHub();
}

// Update Committee Management List
function updateCommitteeManagementList() {
    const listContainer = document.getElementById('committeeManagementList');
    if (!listContainer || !isAdmin) return;
    
    const currentYear = parseInt(currentData.year);
    const nextYear = currentYear + 1;
    
    // Get current and next year committee
    const currentCommittee = currentData.committee || [];
    const nextYearCommittee = currentData.committee_next_year || [];
    
    const roleColors = {
        'Organizer': '#e74c3c',
        'President': '#3498db',
        'Vice President': '#9b59b6',
        'Secretary': '#1abc9c',
        'Treasurer': '#f39c12',
        'Member': '#34495e'
    };
    
    let html = '';
    
    // Show current year committee (read-only)
    if (currentCommittee.length > 0) {
        html += `
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #2196f3;">
                <h5 style="margin: 0 0 12px 0; color: #1565c0;">
                    <i class="fas fa-users"></i> Current Committee (${currentYear})
                    <span style="font-size: 12px; color: #666; font-weight: normal;"> - Read Only</span>
                </h5>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${currentCommittee.map(member => {
                        const roleColor = roleColors[member.role] || '#34495e';
                        return `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #f5f5f5; border-radius: 6px;">
                                <div>
                                    <strong style="color: #333;">${member.name}</strong>
                                    <span style="margin-left: 10px; padding: 3px 10px; background: ${roleColor}; color: white; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                        ${member.role}
                                    </span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Show next year committee (editable)
    html += `
        <div style="background: white; padding: 15px; border-radius: 8px; border: 2px solid #4caf50;">
            <h5 style="margin: 0 0 12px 0; color: #2e7d32;">
                <i class="fas fa-user-plus"></i> Next Year's Committee (${nextYear})
                ${nextYearCommittee.length > 0 ? `<span style="font-size: 12px; color: #666; font-weight: normal;"> - ${nextYearCommittee.length} member(s)</span>` : ''}
            </h5>
    `;
    
    if (nextYearCommittee.length === 0) {
        html += `
            <div style="text-align: center; padding: 20px; color: #999;">
                <i class="fas fa-users-slash" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
                <p style="margin: 0;">No committee members added for ${nextYear} yet</p>
            </div>
        `;
    } else {
        html += `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${nextYearCommittee.map((member, index) => {
                    const roleColor = roleColors[member.role] || '#34495e';
                    return `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #f5f5f5; border-radius: 6px;">
                            <div>
                                <strong style="color: #333;">${member.name}</strong>
                                <span style="margin-left: 10px; padding: 3px 10px; background: ${roleColor}; color: white; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                    ${member.role}
                                </span>
                            </div>
                            <button onclick="showCommitteeDeleteModal(${index})" style="padding: 6px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Remove member">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    html += '</div>';
    
    listContainer.innerHTML = html;
}

function populateCommitteeTable(committeeData) {
    const committeeGrid = document.getElementById('committeeGrid');
    const committeeSection = document.getElementById('committeeSection');
    
    if (!committeeGrid || !committeeSection) return;
    
    const currentYear = parseInt(currentData.year);
    const nextYear = currentYear + 1;
    const nextYearCommittee = currentData.committee_next_year || [];
    
    // Hide the section if no committee data at all
    if (!committeeData || committeeData.length === 0) {
        committeeSection.style.display = 'none';
        return;
    }
    
    // Show the section if we have current committee data
    committeeSection.style.display = 'block';
    
    // Role colors mapping
    const roleColors = {
        'Organizer': '#e74c3c',
        'President': '#3498db',
        'Vice President': '#9b59b6',
        'Secretary': '#1abc9c',
        'Treasurer': '#f39c12',
        'Member': '#34495e'
    };
    
    let html = '';
    
    // Show current year committee (visible to everyone)
    if (committeeData && committeeData.length > 0) {
        html += `
            <div style="background: white; padding: 20px; border-radius: 12px; ${isAdmin && nextYearCommittee.length > 0 ? 'margin-bottom: 20px;' : ''} border: 2px solid #2196f3;">
                <h3 style="margin: 0 0 15px 0; color: #1565c0; font-size: 1.3rem;">
                    <i class="fas fa-users"></i> Current Committee (${currentYear})
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    ${committeeData.map((member) => {
                        const roleColor = roleColors[member.role] || '#34495e';
                        const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                        
                        return `
                            <div class="committee-card" style="min-height: auto;">
                                <div class="committee-avatar">${initials}</div>
                                <h3 class="committee-name">${member.name}</h3>
                                <span class="committee-role" style="background: ${roleColor};">
                                    ${member.role}
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Show next year committee (only visible to admins)
    if (isAdmin && nextYearCommittee.length > 0) {
        html += `
            <div style="background: white; padding: 20px; border-radius: 12px; border: 2px solid #4caf50;">
                <h3 style="margin: 0 0 15px 0; color: #2e7d32; font-size: 1.3rem;">
                    <i class="fas fa-user-plus"></i> Next Year's Committee (${nextYear}) 
                    <span style="font-size: 0.8rem; color: #666; font-weight: normal;">(Admin Only)</span>
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    ${nextYearCommittee.map((member) => {
                        const roleColor = roleColors[member.role] || '#34495e';
                        const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                        
                        return `
                            <div class="committee-card" style="min-height: auto;">
                                <div class="committee-avatar">${initials}</div>
                                <h3 class="committee-name">${member.name}</h3>
                                <span class="committee-role" style="background: ${roleColor};">
                                    ${member.role}
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    committeeGrid.innerHTML = html;
}

console.log('Simple GitHub Dashboard loaded!');
