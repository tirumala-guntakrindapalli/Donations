/**
 * GitHub API Service Module
 * Handles all GitHub API interactions
 * ⚠️ DATA CRITICAL - Handle with care
 */

/**
 * Get file SHA from GitHub
 * Required for updating files via GitHub API
 * @returns {Promise<string|null>} File SHA or null if error
 */
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

/**
 * Get file SHA for a specific year
 * @param {number} year - Year to get SHA for
 * @returns {Promise<string|null>} File SHA or null if error
 */
async function getYearFileSHA(year) {
    try {
        const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : CONFIG;
        const dataPath = config.getDataFilePath(year);
        const apiUrl = `${GITHUB_API_BASE}/repos/${config.GITHUB_OWNER}/${config.GITHUB_REPO}/contents/${dataPath}?ref=${config.GITHUB_BRANCH}`;
        
        const response = await fetch(apiUrl, {
            cache: 'no-store',
            headers: {
                'Authorization': `token ${config.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.status === 404) {
            // File doesn't exist
            return null;
        }
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.sha || null;
        
    } catch (error) {
        console.error('Error getting year file SHA:', error);
        return null;
    }
}

/**
 * Fetch raw JSON file from GitHub
 * @param {string} filePath - Path to file in repo
 * @returns {Promise<Object|null>} Parsed JSON data or null if error
 */
async function fetchGitHubFile(filePath) {
    try {
        const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : CONFIG;
        const apiUrl = `${GITHUB_API_BASE}/repos/${config.GITHUB_OWNER}/${config.GITHUB_REPO}/contents/${filePath}?ref=${config.GITHUB_BRANCH}`;
        
        const response = await fetch(apiUrl, {
            cache: 'no-store',
            headers: {
                'Authorization': `token ${config.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw'
            }
        });
        
        if (!response.ok) {
            return null;
        }
        
        return await response.json();
        
    } catch (error) {
        console.error(`Error fetching file ${filePath}:`, error);
        return null;
    }
}

/**
 * Update file on GitHub
 * @param {string} filePath - Path to file in repo
 * @param {Object} content - Content to save (will be JSON stringified)
 * @param {string} sha - File SHA (required for updates, null for new files)
 * @param {string} commitMessage - Commit message
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function updateGitHubFile(filePath, content, sha, commitMessage) {
    try {
        const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : CONFIG;
        const url = `${GITHUB_API_BASE}/repos/${config.GITHUB_OWNER || config.GITHUB_USERNAME}/${config.GITHUB_REPO}/contents/${filePath}`;
        
        // Convert content to base64
        const contentStr = JSON.stringify(content, null, 2);
        const encodedContent = btoa(unescape(encodeURIComponent(contentStr)));
        
        const body = {
            message: commitMessage,
            content: encodedContent,
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
        
        // Add SHA if updating existing file
        if (sha) {
            body.sha = sha;
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
        console.log(`✅ File updated on GitHub:`, result.content.html_url);
        
        return true;
        
    } catch (error) {
        console.error(`Error updating file ${filePath}:`, error);
        throw error;
    }
}

/**
 * Check if file exists on GitHub
 * @param {string} filePath - Path to file in repo
 * @returns {Promise<boolean>} True if file exists, false otherwise
 */
async function fileExistsOnGitHub(filePath) {
    try {
        const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : CONFIG;
        const apiUrl = `${GITHUB_API_BASE}/repos/${config.GITHUB_OWNER}/${config.GITHUB_REPO}/contents/${filePath}?ref=${config.GITHUB_BRANCH}`;
        
        const response = await fetch(apiUrl, {
            method: 'HEAD',
            cache: 'no-store',
            headers: {
                'Authorization': `token ${config.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        return response.ok;
        
    } catch (error) {
        console.error(`Error checking file existence ${filePath}:`, error);
        return false;
    }
}

/**
 * Fetch raw JSON from local file (test mode)
 * @param {string} filePath - Path to local file
 * @returns {Promise<Object|null>} Parsed JSON data or null if error
 */
async function fetchLocalFile(filePath) {
    try {
        const response = await fetch(filePath + '?t=' + new Date().getTime());
        
        if (!response.ok) {
            // Don't log 404 errors - these are expected for missing year files
            if (response.status !== 404) {
                console.error(`Error fetching local file ${filePath}: ${response.status} ${response.statusText}`);
            }
            return null;
        }
        
        return await response.json();
        
    } catch (error) {
        // Only log actual errors, not expected 404s
        if (!error.message?.includes('404')) {
            console.error(`Error fetching local file ${filePath}:`, error);
        }
        return null;
    }
}

/**
 * Generate timestamp for commit messages
 * @returns {string} Formatted timestamp (IST timezone)
 */
function generateCommitTimestamp() {
    return new Date().toLocaleString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true,
        timeZone: 'Asia/Kolkata'
    });
}

/**
 * Generate commit message
 * @param {string} action - Action description
 * @param {Object} options - Optional parameters
 * @returns {string} Formatted commit message
 */
function generateCommitMessage(action, options = {}) {
    const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : CONFIG;
    const env = config.DATA_ENVIRONMENT || 'prod';
    const timestamp = generateCommitTimestamp();
    const skipCI = options.skipCI !== false ? ' [skip ci]' : '';
    
    return `[Dashboard Bot] [${env}] ${action} | ${timestamp}${skipCI}`;
}

// Export for global access
if (typeof window !== 'undefined') {
    window.getFileSHA = getFileSHA;
    window.getYearFileSHA = getYearFileSHA;
    window.fetchGitHubFile = fetchGitHubFile;
    window.updateGitHubFile = updateGitHubFile;
    window.makeAuthenticatedRequest = updateGitHubFile; // Alias for compatibility
    window.fileExistsOnGitHub = fileExistsOnGitHub;
    window.fetchLocalFile = fetchLocalFile;
    window.generateCommitTimestamp = generateCommitTimestamp;
    window.generateCommitMessage = generateCommitMessage;
}

console.log('✅ GitHub API module loaded');
