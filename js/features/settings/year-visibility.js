/**
 * Year Visibility Settings Module
 * Manages visibility settings for different years
 */

/**
 * Load All Years Visibility Status
 * Displays a list of all years with their visibility status
 */
async function loadAllYearsVisibility() {
    const DashboardState = window.DashboardState || {};
    const currentData = DashboardState.getCurrentData ? DashboardState.getCurrentData() : window.currentData;
    const loadYearData = window.loadYearData;
    
    const listContainer = document.getElementById('allYearsVisibilityList');
    if (!listContainer) return;
    
    listContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;"><i class="fas fa-spinner fa-spin"></i> Loading years...</div>';
    
    try {
        // Get available years from config (same as year dropdown)
        const availableYears = (typeof DASHBOARD_CONFIG !== 'undefined') 
            ? DASHBOARD_CONFIG.AVAILABLE_YEARS 
            : [];
        
        if (availableYears.length === 0) {
            listContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #f44336;"><i class="fas fa-exclamation-triangle"></i> No years configured</div>';
            return;
        }
        
        const yearStatuses = [];
        
        // Load status for each configured year (only if file exists)
        for (const year of availableYears) {
            try {
                const yearData = await loadYearData(year);
                if (yearData) {
                    // Dashboard is HIDDEN by default unless explicitly enabled
                    const isEnabled = yearData.settings && yearData.settings.dashboard_enabled === true;
                    yearStatuses.push({
                        year: year,
                        enabled: isEnabled,
                        isCurrent: year === parseInt(currentData.year)
                    });
                } else {
                    // Year is configured but file doesn't exist yet
                    yearStatuses.push({
                        year: year,
                        enabled: false,
                        isCurrent: year === parseInt(currentData.year),
                        noData: true
                    });
                }
            } catch (error) {
                // Skip years that have errors
                console.log(`Error loading year ${year}:`, error.message);
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
        
        yearStatuses.forEach(({ year, enabled, isCurrent, noData }) => {
            const bgColor = isCurrent ? '#e3f2fd' : (noData ? '#f5f5f5' : 'white');
            const borderColor = isCurrent ? '#2196f3' : (noData ? '#ccc' : '#ddd');
            const statusColor = noData ? '#999' : (enabled ? '#4caf50' : '#f44336');
            const statusIcon = noData ? 'fa-database' : (enabled ? 'fa-eye' : 'fa-eye-slash');
            const statusText = noData ? 'No Data' : (enabled ? 'Visible' : 'Hidden');
            
            html += `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 6px; ${noData ? 'opacity: 0.7;' : ''}">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-weight: 600; color: #333; font-size: 15px;">
                            ${isCurrent ? '<i class="fas fa-star" style="color: #ff9800;"></i> ' : ''}
                            ${year}
                        </span>
                        ${isCurrent ? '<span style="font-size: 11px; background: #ff9800; color: white; padding: 2px 6px; border-radius: 3px;">ACTIVE</span>' : ''}
                        ${noData ? '<span style="font-size: 11px; background: #999; color: white; padding: 2px 6px; border-radius: 3px;">NOT INITIALIZED</span>' : ''}
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="color: ${statusColor}; font-size: 13px; font-weight: 600;">
                            <i class="fas ${statusIcon}"></i> ${statusText}
                        </span>
                        <label style="display: flex; align-items: center; cursor: ${noData ? 'not-allowed' : 'pointer'}; margin: 0;">
                            <input type="checkbox" ${enabled ? 'checked' : ''} ${noData ? 'disabled' : ''} onchange="toggleYearVisibility(${year}, this.checked)" style="width: 18px; height: 18px; cursor: ${noData ? 'not-allowed' : 'pointer'};" title="${noData ? 'Year not initialized yet' : 'Toggle visibility'}">
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

/**
 * Toggle Visibility for Specific Year
 * Enables or disables visibility for a specific year
 * @param {number} year - Year to toggle
 * @param {boolean} isEnabled - New visibility state
 */
async function toggleYearVisibility(year, isEnabled) {
    const DashboardState = window.DashboardState || {};
    const isAdmin = DashboardState.isAdmin ? DashboardState.isAdmin() : window.isAdmin;
    const currentData = DashboardState.getCurrentData ? DashboardState.getCurrentData() : window.currentData;
    const showError = window.showError;
    const showSuccess = window.showSuccess;
    const showLoading = window.showLoading;
    const hideLoading = window.hideLoading;
    const trackChange = window.trackChange;
    const updateDashboardStatusDisplay = window.updateDashboardStatusDisplay;
    const loadAllYearsVisibility = window.loadAllYearsVisibility;
    const loadYearData = window.loadYearData;
    const saveYearDataToFile = window.saveYearDataToFile;
    
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    // Check if this is the current year - if so, use draft mode
    if (year === parseInt(currentData.year)) {
        // Update settings
        if (!currentData.settings) {
            currentData.settings = {};
        }
        currentData.settings.dashboard_enabled = isEnabled;
        
        // Track change for draft mode
        if (trackChange) {
            trackChange('toggle_visibility', 'year_visibility', {
                year: year,
                enabled: isEnabled
            });
        }
        
        // Update status display
        if (updateDashboardStatusDisplay) {
            updateDashboardStatusDisplay();
        }
        
        // Refresh the all years list
        if (loadAllYearsVisibility) {
            loadAllYearsVisibility();
        }
        
        const statusMsg = isEnabled 
            ? `✅ Year ${year} visibility enabled (pending publish)` 
            : `🔒 Year ${year} visibility disabled (pending publish)`;
        showSuccess(statusMsg);
        return;
    }
    
    // For other years, save immediately (affects different file)
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
        const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : (typeof CONFIG !== 'undefined' ? CONFIG : {});
        const env = config.DATA_ENVIRONMENT || 'prod';
        const commitMsg = `[Dashboard Bot] [${env}] ${action} ${year} visibility | Admin action [skip ci]`;
        await saveYearDataToFile(year, yearData, commitMsg);
        
        // Refresh the all years list
        if (loadAllYearsVisibility) {
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

/**
 * Refresh All Years Visibility List
 * Reloads the years visibility list
 */
function refreshAllYearsVisibility() {
    const loadAllYearsVisibility = window.loadAllYearsVisibility;
    const showSuccess = window.showSuccess;
    
    if (loadAllYearsVisibility) {
        loadAllYearsVisibility();
    }
    showSuccess('🔄 Years list refreshed');
}

// Export to window for backward compatibility
window.loadAllYearsVisibility = loadAllYearsVisibility;
window.toggleYearVisibility = toggleYearVisibility;
window.refreshAllYearsVisibility = refreshAllYearsVisibility;

console.log('✅ Year Visibility module loaded');
