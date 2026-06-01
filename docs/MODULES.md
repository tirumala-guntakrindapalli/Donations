# 📦 Module Reference Guide

Complete reference for all 31 modules in the restructured Donations Dashboard.

**Last Updated:** April 11, 2026  
**Total Modules:** 31  
**Architecture:** ES6+ with Window Exports (Backward Compatible)

---

## 📑 Table of Contents

1. [Core Foundation](#core-foundation)
2. [Utilities](#utilities)
3. [UI Layer](#ui-layer)
4. [Authentication](#authentication)
5. [Services](#services)
6. [Core Features](#core-features)
7. [Supporting Features](#supporting-features)
8. [Visualization](#visualization)
9. [Settings & Configuration](#settings--configuration)
10. [Shared Components](#shared-components)
11. [Events & Application](#events--application)
12. [Module Dependencies](#module-dependencies)
13. [Load Order](#load-order)

---

## 🏗️ Core Foundation

### 1. constants.js
**Path:** `js/core/constants.js`  
**Size:** ~60 lines  
**Dependencies:** None

**Purpose:** Global constants and configuration values.

**Exports:**
- `GITHUB_API_BASE` - GitHub API base URL
- `GITHUB_RAW_BASE` - GitHub raw content URL
- `DATA_STRUCTURE` - Default data object structure

**Usage:**
```javascript
console.log(GITHUB_API_BASE);
const newData = {...DATA_STRUCTURE};
```

---

### 2. config.js
**Path:** `js/core/config.js`  
**Size:** ~80 lines  
**Dependencies:** None

**Purpose:** Dashboard configuration management and loading.

**Exports:**
- `waitForConfig()` - Async config loader with retry logic
- `CONFIG` - Global config object (after loading)

**Usage:**
```javascript
await waitForConfig();
console.log(CONFIG.owner, CONFIG.repo);
```

**Notes:**
- Loads from `dashboard-config.js`
- Retry logic: 50ms intervals, 100 attempts max
- Required for GitHub API operations

---

### 3. state.js
**Path:** `js/core/state.js`  
**Size:** ~100 lines  
**Dependencies:** None

**Purpose:** Centralized application state management.

**State Variables:**
- `isAdmin` - Admin authentication status
- `currentData` - Current year's financial data
- `refreshTimer` - Auto-refresh interval
- `draftMode` - Draft editing enabled
- `unpublishedChanges` - Draft change tracking
- `originalData` - Pre-draft original data
- `sessionValidationTimer` - Session validation interval
- `currentEditType` - Edit operation type
- `currentEditIndex` - Edit operation index
- `pendingDeleteIndex` - Delete confirmation index

**Exports:**
- `DashboardState` - State manager object with getters/setters
- All state variables to `window` namespace

**Usage:**
```javascript
DashboardState.setIsAdmin(true);
const data = DashboardState.getCurrentData();
DashboardState.setDraftMode(true);
```

**Notes:**
- Single source of truth for app state
- All modules access state through this module
- Prevents duplicate variable declarations

---

## 🔧 Utilities

### 4. helpers.js
**Path:** `js/core/utils/helpers.js`  
**Size:** ~45 lines  
**Dependencies:** None

**Purpose:** Utility functions for formatting and calculations.

**Exports:**
- `formatCurrency(amount)` - Format number as Indian Rupees
- `parseFloat(value)` - Safe float parsing
- `parseInt(value)` - Safe integer parsing

**Usage:**
```javascript
formatCurrency(50000); // "₹50,000.00"
parseFloat("123.45");  // 123.45
parseInt("100");       // 100
```

---

### 5. validators.js
**Path:** `js/core/utils/validators.js`  
**Size:** ~100 lines  
**Dependencies:** state.js

**Purpose:** Input validation and constraint checking.

**Exports:**
- `isValidName(name)` - Validate name (3-50 chars, letters/spaces)
- `isValidAmount(amount)` - Validate amount (positive number)
- `isDuplicateName(name, array, excludeIndex)` - Check duplicates (case-insensitive)
- `sanitizeInput(input)` - XSS prevention

**Usage:**
```javascript
if (isValidName("John Doe")) { /* valid */ }
if (isValidAmount(1000)) { /* valid */ }
if (!isDuplicateName("John", donors, -1)) { /* unique */ }
const safe = sanitizeInput(userInput);
```

---

### 6. auth-helpers.js
**Path:** `js/core/utils/auth-helpers.js`  
**Size:** ~60 lines  
**Dependencies:** None

**Purpose:** Authentication utility functions.

**Exports:**
- `sha256(message)` - SHA-256 hashing
- `generateSessionId()` - UUID v4 generator
- `getDeviceInfo()` - Device fingerprint

**Usage:**
```javascript
const hash = await sha256("password123");
const sessionId = generateSessionId();
const device = getDeviceInfo(); // "Chrome on macOS"
```

---

## 🎨 UI Layer

### 7. toast.js
**Path:** `js/ui/toast.js`  
**Size:** ~30 lines  
**Dependencies:** None

**Purpose:** Toast notification system.

**Exports:**
- `showToast(message, type)` - Show toast (success/error/info)

**Usage:**
```javascript
showToast("Saved successfully!", "success");
showToast("Error occurred", "error");
showToast("Loading...", "info");
```

**Notes:**
- Auto-dismisses after 3 seconds
- Types: success (green), error (red), info (blue)

---

### 8. modal.js
**Path:** `js/ui/modal.js`  
**Size:** ~150 lines  
**Dependencies:** state.js

**Purpose:** Modal dialog management system.

**Exports:**
- `openModal(modalId)` - Open modal by ID
- `closeModal(modalId)` - Close modal by ID
- `closeAllModals()` - Close all open modals
- `populateEditModal(type, index, data)` - Pre-fill edit modal

**Usage:**
```javascript
openModal('donationModal');
closeModal('donationModal');
closeAllModals();
populateEditModal('donor', 0, donorData);
```

**Modal IDs:**
- `donationModal` - Add/edit donations
- `cheetiMemberModal` - Add/edit cheeti members
- `expenseModal` - Add/edit expenses
- `committeeModal` - Add committee members
- `confirmDeleteModal` - Delete confirmation

---

### 9. admin-panel.js
**Path:** `js/ui/admin-panel.js`  
**Size:** ~120 lines  
**Dependencies:** state.js

**Purpose:** Admin panel visibility and control.

**Exports:**
- `showAdminPanel()` - Show admin controls
- `hideAdminPanel()` - Hide admin controls
- `updateAdminUI()` - Refresh admin UI state

**Usage:**
```javascript
showAdminPanel();
hideAdminPanel();
updateAdminUI(); // Auto-called after login/logout
```

**Notes:**
- Controls: Add buttons, action columns, save/publish buttons
- Draft mode indicators
- Year selector enablement

---

## 🔐 Authentication

### 10. authentication.js
**Path:** `js/core/auth/authentication.js`  
**Size:** ~180 lines  
**Dependencies:** state.js, auth-helpers.js, session.js, toast.js

**Purpose:** User authentication and password management.

**Exports:**
- `handleLogin()` - Process login form
- `logoutAdmin()` - Logout and cleanup
- `sha256(message)` - Password hashing (alias)

**Aliases:**
- `window.login` → `handleLogin`
- `window.logout` → `logoutAdmin`
- `window.hashPassword` → `sha256`

**Usage:**
```javascript
await handleLogin(); // Reads from login form
await logoutAdmin();
```

**Security:**
- SHA-256 password hashing
- Session locking (prevents simultaneous logins)
- Session persistence in sessionStorage

---

### 11. session.js
**Path:** `js/core/auth/session.js`  
**Size:** ~240 lines  
**Dependencies:** state.js, github-api.js, toast.js

**Purpose:** Admin session management and locking.

**Exports:**
- `checkExistingAdminSession()` - Check for active session
- `acquireAdminSession(sessionId, device)` - Lock session
- `releaseAdminSession()` - Release session
- `validateAdminSession()` - Heartbeat validation
- `restoreAdminSession()` - Restore from sessionStorage

**Aliases:**
- `window.validateSession` → `validateAdminSession`

**Usage:**
```javascript
const session = await checkExistingAdminSession();
if (!session.hasActiveSession) {
  await acquireAdminSession(sessionId, device);
}
await releaseAdminSession();
```

**Notes:**
- ⚠️ **SECURITY CRITICAL** - Prevents multiple simultaneous admin logins
- Session heartbeat: 30-second intervals
- Auto-restore on page reload

---

### 12. password-reset.js
**Path:** `js/core/auth/password-reset.js`  
**Size:** ~70 lines  
**Dependencies:** github-api.js, toast.js, auth-helpers.js

**Purpose:** Admin password reset functionality.

**Exports:**
- `handlePasswordReset()` - Process password reset form

**Usage:**
```javascript
await handlePasswordReset(); // Connected to reset form
```

**Notes:**
- Requires current password verification
- Updates password in GitHub config
- Auto-logout after successful reset

---

## 🌐 Services

### 13. github-api.js
**Path:** `js/core/services/github-api.js`  
**Size:** ~120 lines  
**Dependencies:** config.js, state.js

**Purpose:** GitHub API integration for data persistence.

**Exports:**
- `updateGitHubFile(path, content, message)` - Save file to GitHub
- `fetchFromGitHub(path)` - Load file from GitHub

**Aliases:**
- `window.makeAuthenticatedRequest` → `updateGitHubFile`

**Usage:**
```javascript
// Save data
await updateGitHubFile(
  'data/prod/donations-2024.json',
  JSON.stringify(data, null, 2),
  'Update donations'
);

// Load data
const data = await fetchFromGitHub('data/prod/donations-2024.json');
```

**Notes:**
- Authenticated requests using PAT from config
- Automatic base64 encoding for file content
- Error handling with user-friendly messages

---

### 14. data-loader.js
**Path:** `js/core/services/data-loader.js`  
**Size:** ~490 lines  
**Dependencies:** github-api.js, state.js, config.js, constants.js, toast.js

**Purpose:** Load financial data from GitHub.

**Exports:**
- `loadDataFromGitHub(year, mode)` - Load year's data
- `loadSelectedYear()` - Load from year selector

**Aliases:**
- `window.loadData` → `loadDataFromGitHub`

**Usage:**
```javascript
await loadDataFromGitHub(2024, 'prod');
await loadSelectedYear(); // Uses selected year from dropdown
```

**Notes:**
- Supports prod/dev/draft modes
- Fallback to empty structure if file not found
- Auto-refresh data display after load
- Validation and error handling

---

### 15. data-saver.js
**Path:** `js/core/services/data-saver.js`  
**Size:** ~380 lines  
**Dependencies:** github-api.js, state.js, config.js, toast.js

**Purpose:** Save financial data to GitHub.

**Exports:**
- `saveDataToGitHub(targetMode)` - Save to prod/dev/draft
- `saveData()` - Save current mode
- `publishData()` - Publish draft to prod

**Aliases:**
- `window.saveData` → `saveDataToGitHub`

**Usage:**
```javascript
await saveDataToGitHub('prod');
await saveData(); // Saves to current mode
await publishData(); // Draft → Prod
```

**Notes:**
- Draft mode: saves to draft files
- Publish: copies draft to prod
- Auto-commit messages
- Settings saved separately (year visibility, dashboard status)

---

### 16. draft-manager.js
**Path:** `js/core/services/draft-manager.js`  
**Size:** ~120 lines  
**Dependencies:** state.js, admin-panel.js

**Purpose:** Draft mode management and UI control.

**Exports:**
- `enableDraftMode()` - Enable draft editing
- `disableDraftMode()` - Disable draft editing
- `updateDraftModeUI()` - Update UI indicators

**Aliases:**
- `window.enableDraftMode` → `updateDraftModeUI`

**Usage:**
```javascript
enableDraftMode();
disableDraftMode();
updateDraftModeUI(); // Refresh UI
```

**Notes:**
- Visual indicators: banner, button states
- Unpublished changes tracking
- Prevents data loss warnings

---

## 💰 Core Features

### 17. donations.js
**Path:** `js/features/donations/donations.js`  
**Size:** ~310 lines  
**Dependencies:** state.js, validators.js, toast.js, modal.js

**Purpose:** Donation CRUD operations.

**Exports:**
- `addDonation()` - Add new donation
- `editDonorEntry(index)` - Inline edit
- `saveDonorEntry(index)` - Save inline edit
- `cancelDonorEdit()` - Cancel edit
- `saveDonorFromModal(index)` - Save from modal
- `validateDonation(name, amount, excludeIndex)` - Validation

**Usage:**
```javascript
addDonation(); // From form
editDonorEntry(0); // Start editing index 0
saveDonorEntry(0); // Save changes
saveDonorFromModal(0); // Save from modal
```

**Notes:**
- Duplicate detection (case-insensitive)
- Admin-only operations
- Draft mode integration
- Both inline and modal editing

---

### 18. expenses.js
**Path:** `js/features/expenses/expenses.js`  
**Size:** ~310 lines  
**Dependencies:** state.js, validators.js, toast.js, modal.js

**Purpose:** Expense CRUD operations.

**Exports:**
- `addExpense()` - Add new expense
- `editExpenseEntry(index)` - Inline edit
- `saveExpenseEntry(index)` - Save inline edit
- `cancelExpenseEdit()` - Cancel edit
- `saveExpenseFromModal(index)` - Save from modal
- `validateExpense(item, amount, excludeIndex)` - Validation

**Usage:**
```javascript
addExpense(); // From form
editExpenseEntry(0);
saveExpenseEntry(0);
saveExpenseFromModal(0);
```

**Notes:**
- Similar structure to donations module
- Category tracking
- Duplicate validation

---

### 19. cheeti.js
**Path:** `js/features/cheeti/cheeti.js`  
**Size:** ~340 lines  
**Dependencies:** state.js, validators.js, toast.js, modal.js

**Purpose:** Cheeti member management and interest calculations.

**Exports:**
- `addCheetiMember()` - Add new member
- `editCheetiMemberEntry(index)` - Inline edit
- `saveCheetiMemberEntry(index)` - Save inline edit
- `cancelCheetiMemberEdit()` - Cancel edit
- `saveCheetiMemberFromModal(index)` - Save from modal
- `calculateCheetiInterest(amount, rate)` - Calculate interest
- `validateCheetiMember(name, amount, excludeIndex)` - Validation

**Usage:**
```javascript
const interest = calculateCheetiInterest(10000, 12);
addCheetiMember();
editCheetiMemberEntry(0);
```

**Notes:**
- Interest calculation (default 12%)
- Payment tracking across years
- Late fee management
- Winner/sponsor metadata

---

## 🎯 Supporting Features

### 20. cheeti-payments.js
**Path:** `js/features/cheeti/cheeti-payments.js`  
**Size:** ~270 lines  
**Dependencies:** state.js, toast.js, data-loader.js, data-saver.js

**Purpose:** Cheeti payment recording across years.

**Exports:**
- `recordCheetiPayment(index)` - Record payment for member

**Usage:**
```javascript
recordCheetiPayment(0); // Record payment for member at index 0
```

**Notes:**
- Cross-year payment tracking
- Updates current and previous year data
- Auto-saves changes
- Payment status indicators

---

### 21. committee.js
**Path:** `js/features/committee/committee.js`  
**Size:** ~260 lines  
**Dependencies:** state.js, validators.js, toast.js, modal.js, data-loader.js, data-saver.js

**Purpose:** Next year's committee member management.

**Exports:**
- `addCommitteeMember()` - Add member to next year
- `deleteCommitteeMember(index)` - Delete member
- `confirmDeleteCommitteeMember()` - Confirm deletion
- `cancelDeleteCommitteeMember()` - Cancel deletion
- `syncCommitteeMembersToNextYear()` - Copy to next year

**Usage:**
```javascript
addCommitteeMember();
deleteCommitteeMember(0);
confirmDeleteCommitteeMember();
syncCommitteeMembersToNextYear();
```

**Notes:**
- Next year planning
- Sync feature for continuity
- Duplicate validation
- Deferred save (separate file)

---

### 22. sponsors-laddu.js
**Path:** `js/features/sponsors/sponsors-laddu.js`  
**Size:** ~305 lines  
**Dependencies:** state.js, validators.js, toast.js

**Purpose:** Manage sponsors and laddu prasad distributors.

**Exports:**
- `addSponsor()` - Add sponsor
- `deleteSponsor(index)` - Delete sponsor
- `addLadduPerson()` - Add laddu distributor
- `deleteLadduPerson(index)` - Delete distributor

**Usage:**
```javascript
addSponsor();
deleteSponsor(0);
addLadduPerson();
deleteLadduPerson(0);
```

**Notes:**
- Simple add/delete operations
- Name validation
- Draft mode support
- Used in announcements

---

## 📊 Visualization

### 23. charts.js
**Path:** `js/features/charts/charts.js`  
**Size:** ~150 lines  
**Dependencies:** state.js, helpers.js (Chart.js library)

**Purpose:** Financial data visualization with Chart.js.

**Exports:**
- `createFinancialChart(reportData)` - Financial bar chart
- `createExpensesChart(expensesData)` - Expenses pie chart
- `createCheetiChart(cheetiData)` - Cheeti bar chart
- `destroyAllCharts()` - Cleanup utility

**Usage:**
```javascript
createFinancialChart(reportData);
createExpensesChart(expenses);
createCheetiChart(cheetiMembers);
destroyAllCharts(); // Before recreating
```

**Notes:**
- Chart.js v4.4.0
- Responsive design
- Currency formatting in tooltips
- Proper instance management

---

### 24. data-processor.js
**Path:** `js/features/reports/data-processor.js`  
**Size:** ~275 lines  
**Dependencies:** state.js, helpers.js, toast.js

**Purpose:** Data processing, metrics calculation, and UI orchestration.

**Exports:**
- `processData()` - Main orchestrator (updates all UI)
- `updateMetrics()` - Calculate and display metrics
- `calculateFinancialSummary()` - Financial summary object

**Usage:**
```javascript
processData(); // Refresh entire UI
updateMetrics(); // Update metrics only
const summary = calculateFinancialSummary();
```

**Notes:**
- Orchestrates: metrics, charts, tables, announcements
- Calculates: totals, balance, averages
- Admin vs public UI differences

---

## ⚙️ Settings & Configuration

### 25. dashboard-visibility.js
**Path:** `js/features/settings/dashboard-visibility.js`  
**Size:** ~130 lines  
**Dependencies:** state.js, data-saver.js, toast.js

**Purpose:** Dashboard public visibility control.

**Exports:**
- `toggleDashboardVisibility()` - Toggle visibility
- `updateDashboardStatusDisplay()` - Update status UI
- `checkDashboardVisibility()` - Check if visible
- `showDashboardDisabledMessage()` - Show maintenance message
- `hideDashboardDisabledMessage()` - Hide message

**Usage:**
```javascript
await toggleDashboardVisibility();
updateDashboardStatusDisplay();
if (checkDashboardVisibility()) { /* visible */ }
```

**Notes:**
- Public maintenance mode
- Professional maintenance UI
- Status persisted in GitHub

---

### 26. year-visibility.js
**Path:** `js/features/settings/year-visibility.js`  
**Size:** ~195 lines  
**Dependencies:** state.js, data-loader.js, data-saver.js, toast.js

**Purpose:** Multi-year visibility management.

**Exports:**
- `loadAllYearsVisibility()` - Load visibility settings
- `toggleYearVisibility(year, isEnabled)` - Toggle year
- `refreshAllYearsVisibility()` - Refresh UI

**Usage:**
```javascript
await loadAllYearsVisibility();
await toggleYearVisibility(2024, false);
await refreshAllYearsVisibility();
```

**Notes:**
- Control which years are visible to public
- Immediate save (not draft mode)
- Used in year selector population

---

### 27. announcements.js
**Path:** `js/features/settings/announcements.js`  
**Size:** ~130 lines  
**Dependencies:** state.js, helpers.js

**Purpose:** Announcement banner with sponsors and winners.

**Exports:**
- `updateAnnouncements()` - Update announcement banner

**Usage:**
```javascript
updateAnnouncements(); // Auto-called by processData()
```

**Notes:**
- Displays sponsors and cheeti winners
- Previous year fallback
- Auto-hides when no data

---

## 🧩 Shared Components

### 28. actions-column.js
**Path:** `js/ui/components/actions-column.js`  
**Size:** ~35 lines  
**Dependencies:** None

**Purpose:** Table action column visibility control.

**Exports:**
- `showActionsColumns()` - Show edit/delete buttons
- `hideActionsColumns()` - Hide buttons

**Usage:**
```javascript
showActionsColumns(); // On admin login
hideActionsColumns(); // On logout
```

**Notes:**
- Controls 3 tables: donors, cheeti, expenses
- Simple DOM manipulation

---

### 29. form-handler.js
**Path:** `js/ui/components/form-handler.js`  
**Size:** ~30 lines  
**Dependencies:** state.js

**Purpose:** Form state change tracking.

**Exports:**
- `markFormChanged()` - Mark form as dirty

**Usage:**
```javascript
markFormChanged(); // Called on input change
```

**Notes:**
- Integrates with DashboardState
- Enables unsaved changes warning

---

## 🚀 Events & Application

### 30. event-handlers.js
**Path:** `js/core/event-handlers.js`  
**Size:** ~140 lines  
**Dependencies:** Multiple feature modules

**Purpose:** Global event listeners setup.

**Exports:**
- `initializeEventHandlers()` - Attach all event listeners

**Usage:**
```javascript
initializeEventHandlers(); // Called by app.js
```

**Notes:**
- Form submissions
- Button clicks
- Keyboard shortcuts
- Modal controls

---

### 31. app.js
**Path:** `js/core/app.js`  
**Size:** ~130 lines  
**Dependencies:** All modules

**Purpose:** Application initialization and bootstrap.

**Exports:**
- `initializeDashboard()` - Main initialization function

**Aliases:**
- `window.initializeApp` → `initializeDashboard`

**Usage:**
```javascript
// Auto-called on DOMContentLoaded
initializeDashboard();
```

**Init Sequence:**
1. Wait for config
2. Initialize event handlers
3. Restore admin session (if exists)
4. Load initial data (current year)
5. Update UI
6. Footer year update
7. Modal cleanup

---

## 🔗 Module Dependencies

### Dependency Graph

```
app.js
├── config.js
├── state.js
├── event-handlers.js
│   ├── authentication.js
│   │   ├── session.js
│   │   │   └── github-api.js
│   │   ├── auth-helpers.js
│   │   └── toast.js
│   ├── data-loader.js
│   ├── data-saver.js
│   ├── draft-manager.js
│   ├── donations.js
│   ├── expenses.js
│   ├── cheeti.js
│   ├── cheeti-payments.js
│   ├── committee.js
│   ├── sponsors-laddu.js
│   └── settings modules
├── data-loader.js
└── data-processor.js
    ├── charts.js
    ├── table modules
    └── announcements.js
```

### Dependency Levels

**Level 0 (No Dependencies):**
- constants.js
- config.js
- state.js
- helpers.js
- auth-helpers.js
- toast.js
- actions-column.js

**Level 1 (Foundation Only):**
- validators.js (state.js)
- modal.js (state.js)
- admin-panel.js (state.js)
- github-api.js (config.js, state.js)

**Level 2 (Services):**
- authentication.js
- session.js
- password-reset.js
- data-loader.js
- data-saver.js
- draft-manager.js

**Level 3 (Features):**
- donations.js
- expenses.js
- cheeti.js
- cheeti-payments.js
- committee.js
- sponsors-laddu.js
- charts.js
- data-processor.js
- settings modules

**Level 4 (Application):**
- event-handlers.js
- app.js

---

## 📋 Load Order

**Critical:** Modules must load in dependency order to avoid undefined references.

**Correct Load Sequence (31 modules):**

```javascript
// 1. Core Foundation
'js/core/constants.js',
'js/core/config.js',
'js/core/state.js',

// 2. Utilities
'js/core/utils/helpers.js',
'js/core/utils/validators.js',
'js/core/utils/auth-helpers.js',

// 3. UI Layer
'js/ui/toast.js',
'js/ui/modal.js',
'js/ui/admin-panel.js',

// 4. Authentication
'js/core/auth/authentication.js',
'js/core/auth/session.js',
'js/core/auth/password-reset.js',

// 5. Services
'js/core/services/github-api.js',
'js/core/services/data-loader.js',
'js/core/services/data-saver.js',
'js/core/services/draft-manager.js',

// 6. Core Features
'js/features/donations/donations.js',
'js/features/expenses/expenses.js',
'js/features/cheeti/cheeti.js',

// 7. Supporting Features
'js/features/cheeti/cheeti-payments.js',
'js/features/committee/committee.js',
'js/features/sponsors/sponsors-laddu.js',

// 8. Visualization
'js/features/charts/charts.js',
'js/features/reports/data-processor.js',

// 9. Settings
'js/features/settings/dashboard-visibility.js',
'js/features/settings/year-visibility.js',
'js/features/settings/announcements.js',

// 10. Components
'js/ui/components/actions-column.js',
'js/ui/components/form-handler.js',

// 11. Events & App
'js/core/event-handlers.js',
'js/core/app.js'
```

**See:** [app-loader.js](../js/app-loader.js) for automated loading.

---

## 🎯 Best Practices

### Module Design Principles

1. **Single Responsibility:** Each module has one clear purpose
2. **Minimal Dependencies:** Only import what's needed
3. **Window Exports:** Backward compatibility with legacy code
4. **State Centralization:** All state in state.js
5. **Error Handling:** Graceful failures with user feedback

### Adding New Modules

1. **Choose correct category:** core/features/ui/services
2. **Import dependencies:** Load after dependencies
3. **Export to window:** Maintain backward compatibility
4. **Add to app-loader.js:** Update load order
5. **Create tests:** Test in isolation and integration
6. **Document:** Update this file

### Migration to ES6 Modules

Future migration path:

```javascript
// Instead of window exports
export { functionName };

// Instead of global access
import { functionName } from './module.js';
```

**Benefits:**
- Tree shaking
- Better IDE support
- Explicit dependencies
- Smaller bundle size

**Required Changes:**
- Add `type="module"` to script tags
- Update all imports/exports
- Remove window exports
- Update tests

---

## 📚 Additional Resources

- [Architecture Guide](ARCHITECTURE.md)
- [Testing Guide](TESTING_GUIDE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Project Structure](STRUCTURE.md)
- [GitHub Integration](GITHUB_INTEGRATION.md)

---

**Questions or Issues?** See [DOCS_INDEX.md](DOCS_INDEX.md) for complete documentation index.
