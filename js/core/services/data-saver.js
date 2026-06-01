/**
 * Data Saver Module
 * Handles saving data to GitHub or local storage
 * ⚠️ DATA CRITICAL - Ensure data integrity before saving
 */

/**
 * Save data to GitHub (main function)
 * Saves current data based on mode (test, draft, or production)
 * @param {Object} customSummary - Optional custom commit summary
 * @returns {Promise<void>}
 */
async function saveDataToGitHub(customSummary = null) {
    const isAdmin = window.DashboardState ? DashboardState.isAdmin() : window.isAdmin;
    
    if (!isAdmin) {
        showError('You must be logged in as admin to save data');
        return Promise.reject(new Error('Not logged in'));
    }
    
    // Get test mode from either DASHBOARD_CONFIG or CONFIG
    const testMode = (typeof DASHBOARD_CONFIG !== 'undefined') 
        ? DASHBOARD_CONFIG.TEST_MODE 
        : (typeof CONFIG !== 'undefined' ? CONFIG.TEST_MODE : true);
    
    const currentData = window.DashboardState ? DashboardState.getCurrentData() : window.currentData;
    
    // TEST MODE: Update in memory and refresh UI (temporary - lost on page refresh)
    if (testMode) {
        console.log('🧪 TEST MODE: Data saved in memory only (not persisted to file)');
        console.log('⚠️  Changes will be lost on page refresh or auto-refresh');
        console.log('📊 Current data:', currentData);
        
        // Update timestamp
        currentData.lastUpdated = new Date().toISOString();
        if (window.DashboardState) {
            DashboardState.setCurrentData(currentData);
        } else {
            window.currentData = currentData;
        }
        
        // Refresh the UI with updated data
        if (typeof processData === 'function') {
            processData();
        }
        
        // Only show success message if not called from publish flow
        if (!customSummary) {
            showSuccess('⚠️ TEST MODE: Changes saved in memory only! To persist, manually update the JSON file.');
        } else {
            showSuccess('✅ Published successfully! ⚠️ TEST MODE: Update JSON file manually or changes will be lost on refresh.');
        }
        
        return Promise.resolve();
    }
    
    // Get draft mode
    const draftMode = window.DashboardState ? DashboardState.getDraftMode() : window.draftMode;
    
    // DRAFT MODE: Just update memory and UI, don't commit to GitHub yet
    if (draftMode && !customSummary) {
        console.log('📝 DRAFT MODE: Changes saved in memory only');
        currentData.lastUpdated = new Date().toISOString();
        if (window.DashboardState) {
            DashboardState.setCurrentData(currentData);
        } else {
            window.currentData = currentData;
        }
        if (typeof processData === 'function') {
            processData();
        }
        return Promise.resolve();
    }
    
    showLoading('Saving data...');
    
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
        const env = config.DATA_ENVIRONMENT || 'prod';
        
        // Generate commit message
        const commitMessage = customSummary 
            ? customSummary.message 
            : `[Dashboard Bot] [${env}] 💰 Update donations & expenses | ${generateCommitTimestamp()} [skip ci]`;
        
        // Update file via GitHub API
        const url = `${GITHUB_API_BASE}/repos/${config.GITHUB_OWNER || config.GITHUB_USERNAME}/${config.GITHUB_REPO}/contents/${config.DATA_FILE_PATH || config.getDataFilePath(config.currentYear)}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${config.GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: commitMessage,
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
        
        // Only show success message if not called from publish flow
        if (!customSummary) {
            showSuccess('✅ Data saved successfully!');
        }
        hideLoading();
        
        // Smart reload: Wait for GitHub API to propagate, then verify
        // Only reload if API has newer data than our current version
        const savedTimestamp = currentData.lastUpdated;
        setTimeout(async () => {
            try {
                const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : CONFIG;
                const dataPath = config.getDataFilePath(config.currentYear);
                const apiUrl = `${GITHUB_API_BASE}/repos/${config.GITHUB_OWNER}/${config.GITHUB_REPO}/contents/${dataPath}?ref=${config.GITHUB_BRANCH}&_=${Date.now()}`;
                
                const response = await fetch(apiUrl, {
                    cache: 'no-store',
                    headers: {
                        'Authorization': `token ${config.GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3.raw'
                    }
                });
                
                if (response.ok) {
                    const apiData = await response.json();
                    
                    // Only reload if API data is newer or different
                    if (apiData.lastUpdated && apiData.lastUpdated >= savedTimestamp) {
                        // Check if data structure is intact (all arrays present)
                        const hasAllArrays = apiData.donations !== undefined && 
                                            apiData.cheeti !== undefined && 
                                            apiData.expenses !== undefined;
                        
                        if (hasAllArrays) {
                            console.log('✅ API data verified - all arrays intact');
                            if (window.DashboardState) {
                                DashboardState.setCurrentData(apiData);
                            } else {
                                window.currentData = apiData;
                            }
                            if (typeof processData === 'function') {
                                processData();
                            }
                        } else {
                            console.warn('⚠️ API data incomplete - keeping current data');
                        }
                    } else {
                        console.log('⚠️ API data stale - keeping current data');
                    }
                } else {
                    console.warn('Failed to verify saved data from API');
                }
            } catch (error) {
                console.error('Error verifying saved data:', error);
                // Keep current data on error
            }
        }, 10000); // Wait 10 seconds for GitHub API propagation
        
        return Promise.resolve();
        
    } catch (error) {
        console.error('Error saving data:', error);
        showError('Failed to save data. Check console for details.');
        hideLoading();
        return Promise.reject(error);
    }
}

/**
 * Save data for a specific year
 * @param {number} year - Year to save data for
 * @param {Object} data - Data to save
 * @returns {Promise<boolean>} True if successful
 */
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
        const dataPath = config.getDataFilePath(year);

        // Get current SHA for the year file
        const sha = await getYearFileSHA(year);
        
        // Update timestamp
        data.lastUpdated = new Date().toISOString();

        const timestamp = generateCommitTimestamp();
        const env = config.DATA_ENVIRONMENT || 'prod';
        const commitMessage = `[Dashboard Bot] [${env}] 📊 Update ${year} data | ${timestamp} [skip ci]`;

        // Use the updateGitHubFile function
        await updateGitHubFile(dataPath, data, sha, commitMessage);
        
        return true;
        
    } catch (error) {
        console.error(`Error saving year ${year} data:`, error);
        throw error;
    }
}

/**
 * Save year data to file (with custom commit message)
 * @param {number} year - Year to save
 * @param {Object} data - Data to save
 * @param {string} commitMessage - Custom commit message
 * @returns {Promise<boolean>} True if successful
 */
async function saveYearDataToFile(year, data, commitMessage = null) {
    const testMode = (typeof DASHBOARD_CONFIG !== 'undefined') 
        ? DASHBOARD_CONFIG.TEST_MODE 
        : (typeof CONFIG !== 'undefined' ? CONFIG.TEST_MODE : true);
    
    if (testMode) {
        // TEST MODE: Download file for manual placement
        console.log(`📝 Year ${year} Data Structure:`);
        console.log(JSON.stringify(data, null, 2));
        
        // Create a downloadable file
        const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : CONFIG;
        const fileName = config.getDataFilePath(year).split('/').pop();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSuccess(`✅ File downloaded! Save it as: ${config.getDataFilePath(year)}`);
        
        return true;
    }
    
    // PRODUCTION MODE: Save directly to GitHub
    try {
        const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : CONFIG;
        const filePath = config.getDataFilePath(year);
        
        // Check if file already exists (get SHA if it does)
        const existingSha = await getYearFileSHA(year);
        
        if (existingSha) {
            console.warn(`⚠️ File ${filePath} already exists. SHA: ${existingSha}`);
        } else {
            console.log(`✅ Creating new file: ${filePath}`);
        }

        // Generate commit message
        const timestamp = generateCommitTimestamp();
        const env = config.DATA_ENVIRONMENT || 'prod';
        const defaultMsg = `[Dashboard Bot] [${env}] 📊 Update ${year} data | ${timestamp} [skip ci]`;
        
        // Use the updateGitHubFile function
        await updateGitHubFile(filePath, data, existingSha, commitMessage || defaultMsg);
        
        showSuccess(`✅ Year ${year} initialized and saved successfully!`);
        
        return true;
        
    } catch (error) {
        console.error('Error saving to GitHub:', error);
        throw error;
    }
}

/**
 * Download data as JSON file (for backup or manual editing)
 * @param {Object} data - Data to download
 * @param {string} filename - Filename for download
 */
function downloadDataAsJSON(data, filename = 'donations-data.json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess(`✅ Downloaded ${filename}`);
}

// Export for global access
if (typeof window !== 'undefined') {
    window.saveDataToGitHub = saveDataToGitHub;
    window.saveData = saveDataToGitHub; // Alias for compatibility
    window.saveYearData = saveYearData;
    window.saveYearDataToFile = saveYearDataToFile;
    window.downloadDataAsJSON = downloadDataAsJSON;
}

console.log('✅ Data Saver module loaded');
