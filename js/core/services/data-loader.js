/**
 * Data Loader Module
 * Handles loading data from GitHub or local files
 * ⚠️ DATA CRITICAL - Ensure data integrity
 */

/**
 * Load data from GitHub (main function)
 * Loads current year data based on configuration
 * @returns {Promise<void>}
 */
async function loadDataFromGitHub() {
    showLoading('Loading data...');
    
    try {
        // Get current year or use config
        const currentYear = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG.currentYear : 2026;
        const testMode = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG.TEST_MODE : (typeof CONFIG !== 'undefined' ? CONFIG.TEST_MODE : true);
        
        // TEST MODE: Load local file for testing
        if (testMode) {
            console.log(`🧪 TEST MODE: Loading local data for year ${currentYear}...`);
            const dataPath = DASHBOARD_CONFIG.getDataFilePath(currentYear);
            const data = await fetchLocalFile(dataPath);
            
            if (!data) {
                console.warn(`⚠️ Data file not found for year ${currentYear}`);
                // Clear current data to prevent showing stale data
                if (window.DashboardState) {
                    DashboardState.setCurrentData({ 
                        year: currentYear.toString(),
                        sponsors: [], 
                        laddu_winners: [],
                        settings: { dashboard_enabled: true } // Enable dashboard to show welcome message instead of maintenance
                    });
                } else {
                    window.currentData = { 
                        year: currentYear.toString(),
                        sponsors: [], 
                        laddu_winners: [],
                        settings: { dashboard_enabled: true }
                    };
                }
                
                // Hide announcement banner
                const banner = document.getElementById('announcementBanner');
                if (banner) banner.style.display = 'none';
                
                if (typeof showYearNotInitializedWarning === 'function') {
                    showYearNotInitializedWarning(currentYear);
                }
                hideLoading();
                return;
            }
            
            if (window.DashboardState) {
                DashboardState.setCurrentData(data);
            } else {
                window.currentData = data;
            }
            console.log(`✅ Local data loaded successfully for year ${currentYear}`);
        } else {
            // PRODUCTION MODE: Load from GitHub Contents API (no CDN cache)
            const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : CONFIG;
            const dataPath = config.getDataFilePath(currentYear);
            const data = await fetchGitHubFile(dataPath);
            
            if (!data) {
                console.warn(`⚠️ Data file not found for year ${currentYear}`);
                // Clear current data to prevent showing stale data
                if (window.DashboardState) {
                    DashboardState.setCurrentData({ 
                        year: currentYear.toString(),
                        sponsors: [], 
                        laddu_winners: [],
                        settings: { dashboard_enabled: true }
                    });
                } else {
                    window.currentData = { 
                        year: currentYear.toString(),
                        sponsors: [], 
                        laddu_winners: [],
                        settings: { dashboard_enabled: true }
                    };
                }
                
                // Hide announcement banner
                const banner = document.getElementById('announcementBanner');
                if (banner) banner.style.display = 'none';
                
                if (typeof showYearNotInitializedWarning === 'function') {
                    showYearNotInitializedWarning(currentYear);
                }
                hideLoading();
                return;
            }
            
            if (window.DashboardState) {
                DashboardState.setCurrentData(data);
            } else {
                window.currentData = data;
            }
            
            console.log(`Data loaded successfully from GitHub API for year ${currentYear}:`, data);
        }
        
        // Hide warning if it was showing
        if (typeof hideYearNotInitializedWarning === 'function') {
            hideYearNotInitializedWarning();
        }
        
        // Reset draft mode for new year data
        if (window.DashboardState) {
            DashboardState.clearUnpublishedChanges();
            DashboardState.setOriginalData(JSON.parse(JSON.stringify(window.currentData || DashboardState.getCurrentData())));
        } else {
            if (typeof window.unpublishedChanges !== 'undefined') {
                window.unpublishedChanges = [];
            }
            if (typeof window.originalData !== 'undefined') {
                window.originalData = JSON.parse(JSON.stringify(window.currentData));
            }
        }
        
        if (typeof updateDraftModeUI === 'function') {
            updateDraftModeUI();
        }
        
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
            if (typeof processData === 'function') {
                processData();
            }
        }, 100);
        
        hideLoading();
        
        // Setup auto-refresh
        const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : (typeof CONFIG !== 'undefined' ? CONFIG : null);
        const refreshInterval = (config && config.ENABLE_AUTO_REFRESH) ? config.REFRESH_INTERVAL : null;
        const refreshTimer = window.DashboardState ? DashboardState.getRefreshTimer() : window.refreshTimer;
        
        if (refreshInterval && !refreshTimer) {
            const timer = setInterval(loadDataFromGitHub, refreshInterval);
            if (window.DashboardState) {
                DashboardState.setRefreshTimer(timer);
            } else {
                window.refreshTimer = timer;
            }
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Check console for details.');
        hideLoading();
    }
}

/**
 * Load data for a specific year
 * @param {number} year - Year to load data for
 * @returns {Promise<Object|null>} Year data or null if error
 */
async function loadYearData(year) {
    try {
        const testMode = (typeof DASHBOARD_CONFIG !== 'undefined') 
            ? DASHBOARD_CONFIG.TEST_MODE 
            : (typeof CONFIG !== 'undefined' ? CONFIG.TEST_MODE : true);
        
        const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : CONFIG;
        const dataPath = config.getDataFilePath(year);

        if (testMode) {
            const data = await fetchLocalFile(dataPath);
            if (!data) {
                // Don't throw error - just return null for missing files
                return null;
            }
            return data;
        }

        // GitHub mode - fetch from GitHub Contents API (no CDN cache)
        const data = await fetchGitHubFile(dataPath);
        if (!data) {
            // Don't throw error - just return null for missing files
            return null;
        }
        return data;
        
    } catch (error) {
        // Only log if it's not a simple "file not found" case
        if (!error.message?.includes('Failed to load data')) {
            console.error(`Error loading data for year ${year}:`, error);
        }
        return null;
    }
}

/**
 * Sync committee from previous year (manual only)
 * @param {number} currentYear - Current year
 * @param {boolean} isManual - Whether this is a manual sync
 * @returns {Promise<void>}
 */
async function syncCommitteeFromPreviousYear(currentYear, isManual = false) {
    const isAdmin = window.DashboardState ? DashboardState.isAdmin() : window.isAdmin;
    const currentData = window.DashboardState ? DashboardState.getCurrentData() : window.currentData;
    
    console.log(`🔍 Sync check: isAdmin=${isAdmin}, currentData exists=${!!currentData}, isManual=${isManual}`);
    
    // Only run if manually triggered
    if (!isManual) {
        console.log('⏭️ Skipping automatic committee sync (manual sync only)');
        return;
    }
    
    if (!isAdmin || !currentData) {
        console.log('⏭️ Skipping committee sync (not admin or no data)');
        return;
    }
    
    console.log(`🔄 Starting committee sync for year ${currentYear}...`);
    
    try {
        const previousYear = currentYear - 1;
        
        // Load previous year data
        const previousYearData = await loadYearData(previousYear);
        
        if (!previousYearData) {
            console.log(`⏭️ No data found for previous year ${previousYear}`);
            showWarning(`No data found for year ${previousYear}`);
            return;
        }
        
        // Check if previous year has committee
        if (!previousYearData.committee || previousYearData.committee.length === 0) {
            console.log(`⏭️ No committee members found in ${previousYear}`);
            showInfo(`No committee members found in year ${previousYear}`);
            return;
        }
        
        // Copy committee (excluding any year-specific fields)
        const committeeMembers = previousYearData.committee.map(member => ({
            ...member,
            // Reset any year-specific data if needed
        }));
        
        // Update current data
        if (window.DashboardState) {
            const data = DashboardState.getCurrentData();
            data.committee = committeeMembers;
            DashboardState.setCurrentData(data);
        } else {
            window.currentData.committee = committeeMembers;
        }
        
        showSuccess(`✅ Synced ${committeeMembers.length} committee members from ${previousYear}`);
        
        // Refresh UI
        if (typeof processData === 'function') {
            processData();
        }
        
    } catch (error) {
        console.error('Error syncing committee:', error);
        showError('Failed to sync committee from previous year');
    }
}

/**
 * Reload current data (refresh from source)
 * @returns {Promise<void>}
 */
async function reloadCurrentData() {
    await loadDataFromGitHub();
}

/**
 * Check if year data exists
 * @param {number} year - Year to check
 * @returns {Promise<boolean>} True if year data exists
 */
async function yearDataExists(year) {
    try {
        const testMode = (typeof DASHBOARD_CONFIG !== 'undefined') 
            ? DASHBOARD_CONFIG.TEST_MODE 
            : (typeof CONFIG !== 'undefined' ? CONFIG.TEST_MODE : true);
        
        const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : CONFIG;
        const dataPath = config.getDataFilePath(year);
        
        if (testMode) {
            const data = await fetchLocalFile(dataPath);
            return data !== null;
        }
        
        return await fileExistsOnGitHub(dataPath);
        
    } catch (error) {
        console.error(`Error checking if year ${year} exists:`, error);
        return false;
    }
}

/**
 * Show Year Not Initialized Warning
 * Displays a message when a year's data file doesn't exist
 * @param {number} year - The year that needs initialization
 */
function showYearNotInitializedWarning(year) {
    // Hide all dashboard sections
    const dashboardSections = document.querySelectorAll('.dashboard-section');
    dashboardSections.forEach(section => section.style.display = 'none');
    
    // Get admin status
    const isAdmin = window.DashboardState ? DashboardState.getIsAdmin() : (window.isAdmin || false);
    
    // Check if warning already exists
    let warningDiv = document.getElementById('yearWarning');
    if (!warningDiv) {
        // Create warning container
        warningDiv = document.createElement('div');
        warningDiv.id = 'yearWarning';
        const mainContent = document.getElementById('mainContent');
        const welcomeHero = document.querySelector('.welcome-hero');
        
        if (mainContent && welcomeHero) {
            // Insert after welcome hero
            welcomeHero.insertAdjacentElement('afterend', warningDiv);
        } else if (mainContent) {
            // Fallback to first child if welcome hero not found
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
            ">🎉 Welcome to Year ${year}!</h2>
            
            <p style="
                color: #7f8c8d;
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 30px;
            ">
                This year's festival records haven't been created yet.<br><br>
                ${isAdmin ? 'Click the button below to get started with ' + year + ' data.' : 'Please reach out to your committee organizer to get started with ' + year + ' data.'}
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
                    • Estimated collections from ${year - 1} cheeti members<br>
                    • Committee members from ${year - 1}'s next year planning
                </p>
            ` : ''}
        </div>
    `;
    warningDiv.style.display = 'block';
}

/**
 * Hide Year Not Initialized Warning
 * Hides the year initialization message and shows dashboard
 */
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

/**
 * Initialize New Year Data
 * Creates a new year's data file with estimated collections and committee
 * @param {number} year - The year to initialize
 */
async function initializeNewYear(year) {
    const isAdmin = window.DashboardState ? DashboardState.getIsAdmin() : (window.isAdmin || false);
    
    if (!isAdmin) {
        showToast('You must be logged in as admin', 'error');
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
            cheeti_expected: estimatedDetails, // Store expected collections details for reference
            expenses: [],
            sponsors: [],
            laddu_winners: [],
            committee: committeeMembers, // Committee for this year (from previous year's next_year)
            committee_next_year: [], // Empty - to be populated for next year
            settings: {
                dashboard_enabled: true
            }
        };
        
        // Save the new year data
        const config = window.DASHBOARD_CONFIG || window.CONFIG || {};
        const dataPath = config.getDataFilePath ? config.getDataFilePath(year) : `data/dev/donations-${year}.json`;
        const fileName = dataPath.split('/').pop();
        
        // In TEST MODE: Download file for manual placement
        console.log(`📝 Year ${year} Data Structure:`);
        console.log(JSON.stringify(newYearData, null, 2));
        
        // Create a downloadable file
        const blob = new Blob([JSON.stringify(newYearData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        let successMsg = `✅ Year ${year} initialized! File downloaded: ${fileName}`;
        if (estimatedCollections > 0) {
            successMsg += `\n📊 Expected collections: ₹${estimatedCollections.toLocaleString('en-IN')}`;
        }
        if (committeeMembers.length > 0) {
            successMsg += `\n👥 Committee: ${committeeMembers.length} member(s)`;
        }
        successMsg += `\n\n💡 Next: Save the file to ${dataPath} and reload this page`;
        
        showToast(successMsg, 'success', 8000); // Show for 8 seconds with instructions
        hideLoading();
        
    } catch (error) {
        console.error('Error initializing new year:', error);
        showToast('Failed to initialize year. Check console for details.', 'error');
        hideLoading();
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.loadDataFromGitHub = loadDataFromGitHub;
    window.loadData = loadDataFromGitHub; // Alias for compatibility
    window.loadYearData = loadYearData;
    window.syncCommitteeFromPreviousYear = syncCommitteeFromPreviousYear;
    window.reloadCurrentData = reloadCurrentData;
    window.yearDataExists = yearDataExists;
    window.showYearNotInitializedWarning = showYearNotInitializedWarning;
    window.hideYearNotInitializedWarning = hideYearNotInitializedWarning;
    window.initializeNewYear = initializeNewYear;
}

console.log('✅ Data Loader module loaded');
