/**
 * Global State Management
 * Centralized state for the dashboard application
 */

// Authentication State
let isAdmin = false;
let sessionValidationTimer = null;

// Data State
let currentData = null;
let originalData = null; // Backup of data from GitHub for discard functionality

// Draft Mode State
let draftMode = false; // When true, changes are only saved in memory
let unpublishedChanges = []; // Track all unpublished changes

// UI State
let refreshTimer = null;
let hasUnsavedData = false;
let currentEditType = null;
let currentEditIndex = null;
let pendingDeleteIndex = null;

/**
 * State getter/setter functions
 */
const DashboardState = {
    // Authentication
    getIsAdmin: () => isAdmin,
    isAdmin: () => isAdmin, // Alias for compatibility
    setIsAdmin: (value) => { isAdmin = value; },
    
    getSessionTimer: () => sessionValidationTimer,
    setSessionTimer: (value) => { sessionValidationTimer = value; },
    
    // Data
    getCurrentData: () => currentData,
    setCurrentData: (value) => { currentData = value; },
    
    getOriginalData: () => originalData,
    setOriginalData: (value) => { originalData = value; },
    
    // Draft Mode
    isDraftMode: () => draftMode,
    getDraftMode: () => draftMode, // Alias for compatibility
    setDraftMode: (value) => { draftMode = value; },
    
    getUnpublishedChanges: () => unpublishedChanges,
    setUnpublishedChanges: (value) => { unpublishedChanges = value; },
    addUnpublishedChange: (change) => { unpublishedChanges.push(change); },
    clearUnpublishedChanges: () => { unpublishedChanges = []; },
    
    // UI State
    getRefreshTimer: () => refreshTimer,
    setRefreshTimer: (value) => { refreshTimer = value; },
    
    hasUnsavedData: () => hasUnsavedData,
    setUnsavedData: (value) => { hasUnsavedData = value; },
    
    getCurrentEditType: () => currentEditType,
    setCurrentEditType: (value) => { currentEditType = value; },
    
    getCurrentEditIndex: () => currentEditIndex,
    setCurrentEditIndex: (value) => { currentEditIndex = value; },
    
    getPendingDeleteIndex: () => pendingDeleteIndex,
    setPendingDeleteIndex: (value) => { pendingDeleteIndex = value; },
    
    // Reset all state
    resetState: () => {
        isAdmin = false;
        sessionValidationTimer = null;
        currentData = null;
        originalData = null;
        draftMode = false;
        unpublishedChanges = [];
        refreshTimer = null;
        hasUnsavedData = false;
        currentEditType = null;
        currentEditIndex = null;
        pendingDeleteIndex = null;
    }
};

// Export state variables for backward compatibility (global scope)
if (typeof window !== 'undefined') {
    window.DashboardState = DashboardState;
    
    // Direct variable access (for legacy code compatibility)
    window.isAdmin = isAdmin;
    window.currentData = currentData;
    window.refreshTimer = refreshTimer;
    window.hasUnsavedData = hasUnsavedData;
    window.sessionValidationTimer = sessionValidationTimer;
    window.draftMode = draftMode;
    window.unpublishedChanges = unpublishedChanges;
    window.originalData = originalData;
    window.currentEditType = currentEditType;
    window.currentEditIndex = currentEditIndex;
    window.pendingDeleteIndex = pendingDeleteIndex;
}
