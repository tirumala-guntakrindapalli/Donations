/**
 * Dashboard Visibility Settings Module
 * Handles dashboard visibility toggle for members and admin
 */

/**
 * Toggle Dashboard Visibility
 * Admin can enable/disable dashboard visibility for members
 */
function toggleDashboardVisibility() {
    const DashboardState = window.DashboardState || {};
    const isAdmin = DashboardState.isAdmin ? DashboardState.isAdmin() : window.isAdmin;
    const currentData = DashboardState.getCurrentData ? DashboardState.getCurrentData() : window.currentData;
    const showError = window.showError;
    const showSuccess = window.showSuccess;
    const trackChange = window.trackChange;
    
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
    
    // Track change for draft mode
    if (trackChange) {
        trackChange('toggle_visibility', 'year_visibility', {
            year: parseInt(currentData.year),
            enabled: isEnabled
        });
    }
    
    // Update status display
    updateDashboardStatusDisplay();
    
    const statusMsg = isEnabled 
        ? '✅ Dashboard visibility enabled (pending publish)' 
        : '🔒 Dashboard visibility disabled (pending publish)';
    showSuccess(statusMsg);
}

/**
 * Toggle public visibility of the Cheeti members table
 */
function toggleCheetiMembersPublicVisibility() {
    const DashboardState = window.DashboardState || {};
    const isAdmin = DashboardState.isAdmin ? DashboardState.isAdmin() : window.isAdmin;
    const currentData = DashboardState.getCurrentData ? DashboardState.getCurrentData() : window.currentData;
    const checkbox = document.getElementById('cheetiMembersPublicCheckbox');

    if (!isAdmin) {
        window.showError('You must be logged in as admin');
        return;
    }

    if (!currentData || !checkbox) return;

    if (!currentData.settings) {
        currentData.settings = {};
    }

    currentData.settings.cheeti_members_public = checkbox.checked;

    if (window.trackChange) {
        window.trackChange('toggle_visibility', 'cheeti_members_visibility', {
            year: parseInt(currentData.year),
            enabled: checkbox.checked
        });
    }

    updateCheetiMembersVisibility();
    window.showSuccess(checkbox.checked
        ? 'Cheeti members table is visible to the public (pending publish)'
        : 'Cheeti members table is hidden from the public (pending publish)');
}

/**
 * Apply the Cheeti members table setting and update its admin control
 */
function updateCheetiMembersVisibility() {
    const DashboardState = window.DashboardState || {};
    const isAdmin = DashboardState.isAdmin ? DashboardState.isAdmin() : window.isAdmin;
    const currentData = DashboardState.getCurrentData ? DashboardState.getCurrentData() : window.currentData;
    const section = document.getElementById('cheetiMembersSection');
    const checkbox = document.getElementById('cheetiMembersPublicCheckbox');
    const statusInfo = document.getElementById('cheetiMembersVisibilityInfo');

    if (!currentData) return;

    // Preserve the public behavior of existing data unless an admin explicitly disables it.
    const isPublic = !currentData.settings || currentData.settings.cheeti_members_public !== false;

    const isVisible = isAdmin || isPublic;

    if (section) {
        section.style.display = isVisible ? '' : 'none';
    }

    // Cheeti-derived metric cards follow the cheeti members table visibility
    ['cheetiMembersMetricCard', 'remainingBalanceAfterCheetiMetricCard', 'cheetiInterestMetricCard', 'estimatedNextYearTotalMetricCard'].forEach(id => {
        const card = document.getElementById(id);
        if (card) {
            card.style.display = isVisible ? '' : 'none';
        }
    });

    if (checkbox) {
        checkbox.checked = isPublic;
    }

    if (statusInfo) {
        statusInfo.innerHTML = isPublic
            ? '<div style="background: #e8f5e9; color: #2e7d32; border-left: 3px solid #4caf50; padding: 8px 12px;"><i class="fas fa-check-circle"></i> Cheeti members table is visible to the public</div>'
            : '<div style="background: #ffebee; color: #c62828; border-left: 3px solid #f44336; padding: 8px 12px;"><i class="fas fa-eye-slash"></i> Cheeti members table is hidden from the public</div>';
    }
}

/**
 * Update Dashboard Status Display
 * Updates the UI to show current visibility status
 */
function updateDashboardStatusDisplay() {
    const DashboardState = window.DashboardState || {};
    const currentData = DashboardState.getCurrentData ? DashboardState.getCurrentData() : window.currentData;
    const loadAllYearsVisibility = window.loadAllYearsVisibility;
    
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
    if (loadAllYearsVisibility) {
        loadAllYearsVisibility();
    }

    updateCheetiMembersVisibility();
}

/**
 * Check Dashboard Visibility
 * Determines if dashboard should be shown to current user
 * @returns {boolean} - True if dashboard should be shown
 */
function checkDashboardVisibility() {
    const DashboardState = window.DashboardState || {};
    const isAdmin = DashboardState.isAdmin ? DashboardState.isAdmin() : window.isAdmin;
    const currentData = DashboardState.getCurrentData ? DashboardState.getCurrentData() : window.currentData;
    const showDashboardDisabledMessage = window.showDashboardDisabledMessage;
    
    // Admin always has access
    if (isAdmin) {
        return true;
    }
    
    // Check if dashboard is explicitly enabled for members
    // Dashboard is HIDDEN by default unless explicitly enabled
    const isEnabled = currentData && currentData.settings && currentData.settings.dashboard_enabled === true;
    
    if (!isEnabled) {
        // Dashboard is disabled for members
        if (showDashboardDisabledMessage) {
            showDashboardDisabledMessage();
        }
        return false;
    }
    
    return true;
}

/**
 * Show Dashboard Disabled Message
 * Displays a message to members when dashboard is disabled
 */
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
        const welcomeHero = document.querySelector('.welcome-hero');
        if (mainContent && welcomeHero) {
            // Insert after welcome-hero section
            welcomeHero.parentNode.insertBefore(messageDiv, welcomeHero.nextSibling);
        } else if (mainContent) {
            // Fallback if welcome-hero not found
            mainContent.insertBefore(messageDiv, mainContent.firstChild);
        } else {
            // Final fallback: append to body
            document.body.appendChild(messageDiv);
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
            
            <div style="
                width: 100px;
                height: 100px;
                margin: 30px auto;
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

/**
 * Hide Dashboard Disabled Message
 * Hides the maintenance message when dashboard is re-enabled
 */
function hideDashboardDisabledMessage() {
    const messageDiv = document.getElementById('dashboardDisabledMessage');
    if (messageDiv) {
        messageDiv.style.display = 'none';
    }
    
    // Show dashboard sections again
    const dashboardSections = document.querySelectorAll('.dashboard-section, .metrics-grid, .charts-row');
    dashboardSections.forEach(section => section.style.display = '');
    
    // Show header controls
    const headerControls = document.querySelector('.header-controls');
    if (headerControls) {
        headerControls.style.display = '';
    }
}

// Export to window for backward compatibility
window.toggleDashboardVisibility = toggleDashboardVisibility;
window.toggleCheetiMembersPublicVisibility = toggleCheetiMembersPublicVisibility;
window.updateCheetiMembersVisibility = updateCheetiMembersVisibility;
window.updateDashboardStatusDisplay = updateDashboardStatusDisplay;
window.checkDashboardVisibility = checkDashboardVisibility;
window.showDashboardDisabledMessage = showDashboardDisabledMessage;
window.hideDashboardDisabledMessage = hideDashboardDisabledMessage;

console.log('✅ Dashboard Visibility module loaded');
