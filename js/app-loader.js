/**
 * Application Module Loader
 * Loads all modular JavaScript files in the correct dependency order
 * 
 * This file documents the loading order and can be used as a reference
 * for adding script tags to HTML files.
 * 
 * Load Order:
 * 1. Core Foundation (Constants, Config, State)
 * 2. Utilities (Helpers, Formatters, Validators)
 * 3. UI Layer (Toast, Loading, Modals)
 * 4. Authentication (Auth, Session, Admin)
 * 5. Services (GitHub API, Data Management)
 * 6. Features (Donations, Expenses, Cheeti, etc.)
 * 7. Settings (Dashboard Visibility, Announcements)
 * 8. Components (Actions Column, Form Handler)
 * 9. Events & App Init
 */

// Module Loading Configuration
const MODULE_LOAD_ORDER = [
    // Phase 1: Core Foundation
    'js/core/constants.js',
    'js/core/config.js',
    'js/core/state.js',
    
    // Phase 1: Utilities
    'js/core/utils/formatters.js',
    'js/core/utils/validators.js',
    'js/core/utils/helpers.js',
    
    // Phase 2: UI Layer
    'js/ui/toast.js',
    'js/ui/loading.js',
    'js/ui/modals.js',
    
    // Phase 3: Authentication
    'js/core/auth/authentication.js',
    'js/core/auth/session.js',
    'js/core/auth/admin-panel.js',
    
    // Phase 4: Services
    'js/core/services/github-api.js',
    'js/core/services/data-loader.js',
    'js/core/services/data-saver.js',
    'js/core/services/draft-manager.js',
    
    // Phase 5A: Core Financial Features
    'js/features/donations/donations.js',
    'js/features/expenses/expenses.js',
    'js/features/cheeti/cheeti.js',
    
    // Phase 5B: Supporting Features
    'js/features/committee/committee.js',
    'js/features/sponsors/sponsors.js',
    'js/features/laddu/laddu.js',
    
    // Phase 6: Visualization & Reports
    'js/features/charts/charts.js',
    'js/features/reports/data-processor.js',
    
    // Phase 7: Settings & Configuration
    'js/features/settings/dashboard-visibility.js',
    'js/features/settings/year-visibility.js',
    'js/features/settings/announcements.js',
    
    // Phase 8: Shared Components
    'js/ui/components/actions-column.js',
    'js/ui/components/form-handler.js',
    
    // Phase 2 & 1: Events and App Initialization (LAST)
    'js/core/events.js',
    'js/core/app.js'
];

/**
 * Generate HTML script tags for all modules
 * @returns {string} HTML script tags
 */
function generateScriptTags() {
    return MODULE_LOAD_ORDER
        .map(path => `    <script src="${path}"></script>`)
        .join('\n');
}

/**
 * Dynamically load modules in order (for testing)
 * Note: For production, use static script tags in HTML
 */
async function loadModulesDynamically() {
    console.log('🚀 Starting module loading...');
    const startTime = performance.now();
    
    for (let i = 0; i < MODULE_LOAD_ORDER.length; i++) {
        const modulePath = MODULE_LOAD_ORDER[i];
        try {
            await loadScript(modulePath);
            console.log(`✅ [${i + 1}/${MODULE_LOAD_ORDER.length}] Loaded: ${modulePath}`);
        } catch (error) {
            console.error(`❌ Failed to load: ${modulePath}`, error);
            throw error;
        }
    }
    
    const endTime = performance.now();
    const loadTime = (endTime - startTime).toFixed(2);
    console.log(`✅ All ${MODULE_LOAD_ORDER.length} modules loaded successfully in ${loadTime}ms`);
    
    return true;
}

/**
 * Load a single script dynamically
 * @param {string} src - Script source path
 * @returns {Promise} Promise that resolves when script loads
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}

/**
 * Verify all modules loaded correctly
 * Checks that key functions are available in window scope
 */
function verifyModulesLoaded() {
    const checks = [
        // Phase 1
        { name: 'Constants', test: () => typeof GITHUB_API_BASE !== 'undefined' },
        { name: 'Config', test: () => typeof waitForConfig === 'function' },
        { name: 'State', test: () => typeof DashboardState !== 'undefined' },
        { name: 'Formatters', test: () => typeof formatCurrency === 'function' },
        { name: 'Helpers', test: () => typeof safeSetText === 'function' },
        
        // Phase 2
        { name: 'Toast', test: () => typeof showToast === 'function' },
        { name: 'Loading', test: () => typeof showLoading === 'function' },
        { name: 'Modals', test: () => typeof showLoginDialog === 'function' },
        
        // Phase 3
        { name: 'Authentication', test: () => typeof login === 'function' },
        { name: 'Session', test: () => typeof validateSession === 'function' },
        
        // Phase 4
        { name: 'GitHub API', test: () => typeof makeAuthenticatedRequest === 'function' },
        { name: 'Data Loader', test: () => typeof loadData === 'function' },
        { name: 'Draft Manager', test: () => typeof enableDraftMode === 'function' },
        
        // Phase 5
        { name: 'Donations', test: () => typeof addDonation === 'function' },
        { name: 'Expenses', test: () => typeof addExpense === 'function' },
        { name: 'Cheeti', test: () => typeof addCheetiMember === 'function' },
        { name: 'Committee', test: () => typeof addCommitteeMember === 'function' },
        { name: 'Sponsors', test: () => typeof addSponsor === 'function' },
        { name: 'Laddu', test: () => typeof addLadduWinner === 'function' },
        
        // Phase 6
        { name: 'Charts', test: () => typeof createFinancialChart === 'function' },
        { name: 'Data Processor', test: () => typeof processData === 'function' },
        
        // Phase 7
        { name: 'Dashboard Visibility', test: () => typeof toggleDashboardVisibility === 'function' },
        { name: 'Announcements', test: () => typeof updateAnnouncements === 'function' },
        
        // Phase 8
        { name: 'Actions Column', test: () => typeof showActionsColumns === 'function' },
        { name: 'Form Handler', test: () => typeof markFormChanged === 'function' },
        
        // Events & App
        { name: 'Events', test: () => typeof setupEventListeners === 'function' },
        { name: 'App', test: () => typeof initializeApp === 'function' }
    ];
    
    console.log('\n🔍 Verifying module loading...\n');
    
    let passed = 0;
    let failed = 0;
    
    checks.forEach(check => {
        try {
            if (check.test()) {
                console.log(`✅ ${check.name}`);
                passed++;
            } else {
                console.error(`❌ ${check.name} - Not loaded`);
                failed++;
            }
        } catch (error) {
            console.error(`❌ ${check.name} - Error:`, error.message);
            failed++;
        }
    });
    
    console.log(`\n📊 Verification Results: ${passed}/${checks.length} modules verified`);
    
    if (failed > 0) {
        console.error(`⚠️ ${failed} module(s) failed verification`);
        return false;
    }
    
    console.log('✅ All modules verified successfully!');
    return true;
}

// Export for use in HTML
if (typeof window !== 'undefined') {
    window.MODULE_LOAD_ORDER = MODULE_LOAD_ORDER;
    window.generateScriptTags = generateScriptTags;
    window.loadModulesDynamically = loadModulesDynamically;
    window.verifyModulesLoaded = verifyModulesLoaded;
}

console.log('✅ App Loader module loaded');
console.log(`📦 ${MODULE_LOAD_ORDER.length} modules configured for loading`);
