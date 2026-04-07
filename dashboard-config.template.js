// Enhanced Dashboard Configuration Template
// COPY THIS FILE TO dashboard-config.js AND UPDATE WITH YOUR ACTUAL VALUES
// DO NOT COMMIT dashboard-config.js TO GITHUB - IT'S IN .gitignore

const DASHBOARD_CONFIG = {
    // Available Years (dynamically generated: current year and 2 previous years)
    AVAILABLE_YEARS: (() => {
        const currentYear = new Date().getFullYear();
        return [currentYear - 2, currentYear - 1, currentYear];
    })(),
    
    // Default Year (current year)
    DEFAULT_YEAR: new Date().getFullYear(),
    
    // Current Selected Year (will be updated dynamically)
    currentYear: new Date().getFullYear(),
    
    // Admin Configuration
    // ⚠️ IMPORTANT: Generate your password hash by running:
    // echo -n "your-password" | shasum -a 256
    ADMIN_PASSWORD_HASH: 'REPLACE_WITH_YOUR_SHA256_HASH', // Example: 878ac4dc632642f325d672200e5ecfc036f8c0e051a7fb701269858eb4539cb1
    
    // Test Mode (true = load from local files, false = load from GitHub)
    TEST_MODE: true,
    
    // GitHub Integration
    USE_GITHUB: false,  // Set to true when using GitHub API (requires token)
    
    // GitHub Configuration (FOR LOCAL DEVELOPMENT ONLY)
    // ⚠️ NOTE: When deployed to GitHub Pages, these values are AUTOMATICALLY
    //          injected from GitHub Secrets and repository metadata by the workflow.
    //          You only need to set these if running locally with TEST_MODE = false.
    // ⚠️ IMPORTANT: Never commit your actual GitHub token to the repository
    GITHUB_OWNER: 'your-github-username',      // Your GitHub username (auto-detected in production)
    GITHUB_REPO: 'vinayaka-chavithi-dashboard', // Your repository name (auto-detected in production)
    GITHUB_BRANCH: 'main',                      // Your branch name (fixed in production)
    GITHUB_TOKEN: '',                           // Your Personal Access Token (from secrets in production)
    
    // Data File Paths (year-based)
    getDataFilePath: function(year) {
        return `data/donations-${year}.json`;
    },
    
    // Form Templates for Dynamic Forms
    FORM_TEMPLATES: {
        'donation': {
            name: 'Donation Form',
            icon: 'hand-holding-heart',
            color: '#667eea',
            fields: [
                { name: 'name', label: 'Donor Name', type: 'text', required: true },
                { name: 'amount', label: 'Amount (₹)', type: 'number', required: true, min: 1 },
                { name: 'date', label: 'Date', type: 'date', required: true },
                { name: 'category', label: 'Category', type: 'select', options: ['General', 'Special', 'Cheeti', 'Other'], required: true },
                { name: 'notes', label: 'Notes', type: 'textarea', required: false }
            ],
            dataKey: 'donations'
        },
        'cheeti': {
            name: 'Cheeti Member Form',
            icon: 'users',
            color: '#f093fb',
            fields: [
                { name: 'name', label: 'Member Name', type: 'text', required: true },
                { name: 'amount', label: 'Principal Amount (₹)', type: 'number', required: true, min: 1 },
                { name: 'interest', label: 'Interest (%)', type: 'number', required: true, min: 0, max: 100 },
                { name: 'date', label: 'Date', type: 'date', required: true },
                { name: 'notes', label: 'Notes', type: 'textarea', required: false }
            ],
            dataKey: 'cheeti'
        },
        'expense': {
            name: 'Expense Form',
            icon: 'receipt',
            color: '#fa709a',
            fields: [
                { name: 'item', label: 'Item/Description', type: 'text', required: true },
                { name: 'amount', label: 'Amount (₹)', type: 'number', required: true, min: 1 },
                { name: 'date', label: 'Date', type: 'date', required: true },
                { name: 'category', label: 'Category', type: 'select', options: ['Decoration', 'Food', 'Transport', 'Misc', 'Other'], required: true },
                { name: 'vendor', label: 'Vendor', type: 'text', required: false },
                { name: 'notes', label: 'Notes', type: 'textarea', required: false }
            ],
            dataKey: 'expenses'
        }
    },
    
    // Auto-refresh Configuration
    ENABLE_AUTO_REFRESH: false, // Set to true to enable auto-refresh
    REFRESH_INTERVAL: 300000    // 5 minutes (in milliseconds)
};

// Instructions:
// 1. Copy this file to dashboard-config.js
// 2. Update ADMIN_PASSWORD_HASH with your password hash
// 3. If using GitHub (TEST_MODE = false), update GitHub settings and add your token
// 4. The dashboard-config.js file will not be committed (it's in .gitignore)

// ================================================================================================
// 📝 IMPORTANT: LOCAL vs PRODUCTION CONFIGURATION
// ================================================================================================
//
// This template file is ONLY for LOCAL DEVELOPMENT.
// When you push to GitHub, the workflow automatically generates a production config.
//
// 🧪 LOCAL DEVELOPMENT (this file → dashboard-config.js):
//    - You manually set all values in dashboard-config.js
//    - Config file is gitignored (never committed)
//    - Used when running: ./start.sh (local server)
//
// 🚀 PRODUCTION DEPLOYMENT (GitHub Actions generates config):
//    - Workflow creates dashboard-config.js automatically
//    - Values come from GitHub Secrets and repository metadata
//    - Generated during deployment, never committed
//
// What the workflow generates:
//    const DASHBOARD_CONFIG = {
//        TEST_MODE: false,                                    // ← Production mode
//        USE_GITHUB: true,                                    // ← Use GitHub API
//        ADMIN_PASSWORD_HASH: '${{ secrets.ADMIN_PASSWORD_HASH }}',  // ← From Secret
//        GITHUB_OWNER: '${{ github.repository_owner }}',      // ← Auto-detected
//        GITHUB_REPO: '${{ github.event.repository.name }}',  // ← Auto-detected
//        GITHUB_BRANCH: 'main',                               // ← Fixed value
//        GITHUB_TOKEN: '${{ secrets.DONATIONS_PAT }}', // ← From Secret (optional)
//        // ... rest of config
//    };
//
// You ONLY need to set GitHub Secrets:
//    - ADMIN_PASSWORD_HASH (required)
//    - DONATIONS_PAT (optional, for GitHub API writes)
//
// Everything else is automatic! 🎉
// ================================================================================================
