# Simple GitHub Dashboard - Architecture

## System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC DASHBOARD                         │
│                  (GitHub Pages Hosted)                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  View Mode (Anyone)                                   │  │
│  │  - Live charts & metrics                             │  │
│  │  - Real-time data display                            │  │
│  │  - Auto-refresh every 60s                            │  │
│  │  - No login required                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Admin Mode (Password Protected)                     │  │
│  │                                                       │  │
│  │  1. Click "Admin Login"                              │  │
│  │  2. Enter password → SHA-256 verification            │  │
│  │  3. Admin panel appears                              │  │
│  │  4. Add donations/cheeti/expenses                    │  │
│  │  5. Submit → GitHub API saves                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Reads from
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB REPOSITORY                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  data/donations-2026.json                            │  │
│  │                                                       │  │
│  │  {                                                    │  │
│  │    "year": "2026",                                   │  │
│  │    "lastUpdated": "2026-04-06T12:00:00Z",           │  │
│  │    "donations": [...],                               │  │
│  │    "cheeti": [...],                                  │  │
│  │    "expenses": [...]                                 │  │
│  │  }                                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Auto-commit on save: "Update data - [timestamp]"          │
│  Version control: Full history preserved                    │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow - Adding a Donation

```
User                    Dashboard              GitHub API           Repository
  |                         |                       |                    |
  | 1. Click               |                       |                    |
  |   "Admin Login"        |                       |                    |
  |----------------------->|                       |                    |
  |                        |                       |                    |
  | 2. Enter password      |                       |                    |
  |----------------------->| 3. SHA-256 hash       |                    |
  |                        |    verify             |                    |
  |                        |                       |                    |
  | 4. Admin panel shows   |                       |                    |
  |<-----------------------|                       |                    |
  |                        |                       |                    |
  | 5. Fill form           |                       |                    |
  |    - Name: John        |                       |                    |
  |    - Amount: 5000      |                       |                    |
  |----------------------->|                       |                    |
  |                        |                       |                    |
  | 6. Click submit        | 7. Add to JSON        |                    |
  |----------------------->|    object in memory   |                    |
  |                        |                       |                    |
  |                        | 8. Get current file   |                    |
  |                        |    SHA (for update)   |                    |
  |                        |---------------------->| 9. Return SHA      |
  |                        |                       |<-------------------|
  |                        |                       |                    |
  |                        | 10. Commit new JSON   |                    |
  |                        |     with message      |                    |
  |                        |---------------------->| 11. Save file      |
  |                        |                       |    Create commit   |
  |                        |                       |------------------->|
  |                        |                       |                    |
  | 12. Success message    |                       | 13. Commit saved   |
  |<-----------------------|<----------------------|<-------------------|
  |                        |                       |                    |
  |                        | 14. Auto-reload       |                    |
  |                        |     after 2s          |                    |
  |                        |                       |                    |
  |                        | 15. Fetch latest JSON |                    |
  |                        |---------------------->|                    |
  |                        |                       | 16. Return JSON    |
  | 17. Updated charts     |<----------------------|<-------------------|
  |<-----------------------|                       |                    |
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
├─────────────────────────────────────────────────────────────┤
│  ✓ HTML5                      - Structure                   │
│  ✓ CSS3                       - Styling                     │
│  ✓ JavaScript (ES6+)          - Logic                       │
│  ✓ Chart.js 4.4.0            - Visualizations               │
│  ✓ Font Awesome 6.4.0        - Icons                        │
│  ✓ Web Crypto API            - SHA-256 hashing              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
├─────────────────────────────────────────────────────────────┤
│  ✓ GitHub API v3            - Data storage & retrieval      │
│  ✓ GitHub Pages              - Static site hosting          │
│  ✓ Git                       - Version control              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      DATA STORAGE                            │
├─────────────────────────────────────────────────────────────┤
│  ✓ JSON                      - Data format                  │
│  ✓ GitHub Repository         - Storage location             │
│  ✓ Git Commits               - Version history              │
└─────────────────────────────────────────────────────────────┘
```

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION                            │
├─────────────────────────────────────────────────────────────┤
│  Password Input                                              │
│       ↓                                                      │
│  SHA-256 Hash (Client-side)                                 │
│       ↓                                                      │
│  Compare with stored hash                                    │
│       ↓                                                      │
│  ✓ Match → Grant admin access                               │
│  ✗ No match → Deny access                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    AUTHORIZATION                             │
├─────────────────────────────────────────────────────────────┤
│  GitHub Personal Access Token                                │
│       ↓                                                      │
│  Stored in config.js                                         │
│       ↓                                                      │
│  Sent with API requests                                      │
│       ↓                                                      │
│  Grants repository write access                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                            │
├─────────────────────────────────────────────────────────────┤
│  1. Public viewing (no auth)         → Anyone               │
│  2. Admin access (password)          → Editors              │
│  3. GitHub token (API)               → Repository           │
│  4. Private repo (optional)          → Code protection      │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

### Current Modular Architecture (Post-Restructuring)

```
Donations/
│
├── index.html                    # Main dashboard page
├── dashboard-config.js           # Configuration (credentials)
├── styles.css                   # Shared styling
│
├── js/                          # 31 Modular JavaScript Files
│   ├── app-loader.js           # Module orchestration & loading
│   │
│   ├── core/                    # Core Foundation (11 modules)
│   │   ├── constants.js         # Global constants
│   │   ├── config.js            # Config loading
│   │   ├── state.js             # Centralized state management
│   │   ├── event-handlers.js   # Event listeners
│   │   ├── app.js               # Application bootstrap
│   │   │
│   │   ├── utils/               # Utilities (3 modules)
│   │   │   ├── helpers.js       # Currency formatting
│   │   │   ├── validators.js   # Input validation
│   │   │   └── auth-helpers.js # SHA-256, UUID generation
│   │   │
│   │   ├── auth/                # Authentication (3 modules)
│   │   │   ├── authentication.js # Login/logout
│   │   │   ├── session.js       # Session management
│   │   │   └── password-reset.js # Password reset
│   │   │
│   │   └── services/            # Backend Services (4 modules)
│   │       ├── github-api.js    # GitHub API integration
│   │       ├── data-loader.js   # Data loading
│   │       ├── data-saver.js    # Data saving
│   │       └── draft-manager.js # Draft mode management
│   │
│   ├── ui/                      # UI Components (5 modules)
│   │   ├── toast.js             # Toast notifications
│   │   ├── modal.js             # Modal dialogs
│   │   ├── admin-panel.js       # Admin panel UI
│   │   │
│   │   └── components/          # Shared Components (2 modules)
│   │       ├── actions-column.js # Table action columns
│   │       └── form-handler.js   # Form state tracking
│   │
│   └── features/                # Feature Modules (15 modules)
│       ├── donations/           # Donations (1 module)
│       │   └── donations.js     # Donation CRUD
│       │
│       ├── expenses/            # Expenses (1 module)
│       │   └── expenses.js      # Expense CRUD
│       │
│       ├── cheeti/              # Cheeti (2 modules)
│       │   ├── cheeti.js        # Cheeti member CRUD
│       │   └── cheeti-payments.js # Payment tracking
│       │
│       ├── committee/           # Committee (1 module)
│       │   └── committee.js     # Committee management
│       │
│       ├── sponsors/            # Sponsors (1 module)
│       │   └── sponsors-laddu.js # Sponsors & laddu
│       │
│       ├── charts/              # Visualization (1 module)
│       │   └── charts.js        # Chart.js integration
│       │
│       ├── reports/             # Reports (1 module)
│       │   └── data-processor.js # Data processing & metrics
│       │
│       └── settings/            # Settings (3 modules)
│           ├── dashboard-visibility.js # Dashboard toggle
│           ├── year-visibility.js      # Year visibility
│           └── announcements.js        # Announcement banner
│
├── data/                        # Data Storage
│   ├── prod/                    # Production data
│   │   ├── donations-2024.json
│   │   └── donations-2025.json
│   ├── dev/                     # Development data
│   │   ├── donations-2024.json
│   │   └── donations-2025.json
│   └── archive/                 # Backups
│       └── simple-dashboard.js.backup-2026-04-11
│
├── tests/                       # Test Files
│   ├── test-phase1.html         # Foundation tests
│   ├── test-phase2.html         # UI tests
│   ├── ...                      # Phase 3-8 tests
│   └── test-integration.html    # Integration tests (8 tests)
│
└── docs/                        # Documentation
    ├── ARCHITECTURE.md          # This file
    ├── MODULES.md               # Module reference (31 modules)
    ├── STRUCTURE.md             # File structure
    ├── TESTING_GUIDE.md         # Testing documentation
    ├── DEPLOYMENT_GUIDE.md      # Deployment instructions
    └── ...                      # Additional docs
```

### Legacy File (Archived)

```
simple-dashboard.js (5,602 lines) → Archived in data/archive/
```

---

## Modular Architecture Overview

### Module Organization (31 Modules)

The application is organized into 11 categories with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                   MODULE ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. CORE FOUNDATION (3 modules)                             │
│     └─> Constants, Config, State Management                 │
│                                                              │
│  2. UTILITIES (3 modules)                                   │
│     └─> Helpers, Validators, Auth Utils                     │
│                                                              │
│  3. UI LAYER (3 modules)                                    │
│     └─> Toast, Modal, Admin Panel                           │
│                                                              │
│  4. AUTHENTICATION (3 modules)                              │
│     └─> Login/Logout, Session, Password Reset               │
│                                                              │
│  5. SERVICES (4 modules)                                    │
│     └─> GitHub API, Data Loader, Data Saver, Draft Manager  │
│                                                              │
│  6. CORE FEATURES (3 modules)                               │
│     └─> Donations, Expenses, Cheeti                         │
│                                                              │
│  7. SUPPORTING FEATURES (3 modules)                         │
│     └─> Cheeti Payments, Committee, Sponsors/Laddu          │
│                                                              │
│  8. VISUALIZATION (2 modules)                               │
│     └─> Charts, Data Processor                              │
│                                                              │
│  9. SETTINGS (3 modules)                                    │
│     └─> Dashboard Visibility, Year Visibility, Announcements│
│                                                              │
│  10. SHARED COMPONENTS (2 modules)                          │
│      └─> Actions Column, Form Handler                       │
│                                                              │
│  11. EVENTS & APPLICATION (2 modules)                       │
│      └─> Event Handlers, App Bootstrap                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Module Load Order (Critical)

Modules must load in dependency order to prevent undefined references:

```
Load Sequence:
1. Core Foundation (constants → config → state)
2. Utilities (helpers → validators → auth-helpers)
3. UI Layer (toast → modal → admin-panel)
4. Authentication (authentication → session → password-reset)
5. Services (github-api → data-loader → data-saver → draft-manager)
6. Core Features (donations, expenses, cheeti)
7. Supporting Features (cheeti-payments, committee, sponsors-laddu)
8. Visualization (charts, data-processor)
9. Settings (dashboard-visibility, year-visibility, announcements)
10. Shared Components (actions-column, form-handler)
11. Events & Application (event-handlers → app)
```

**See:** [MODULES.md](MODULES.md) for complete dependency graph and load order details.

### Module Loading System

**app-loader.js** orchestrates module loading:

```javascript
// Automatic module loading
const MODULE_LOAD_ORDER = [/* 31 modules in sequence */];

async function loadModulesDynamically() {
  for (const modulePath of MODULE_LOAD_ORDER) {
    await loadModule(modulePath);
  }
  verifyModulesLoaded(); // 27 module checks
}
```

**Benefits:**
- Dependency resolution
- Load time tracking (~200-400ms)
- Module verification
- Error handling
- Performance monitoring

---

## Modular Data Flow - Adding a Donation

The new modular architecture separates concerns across modules:

```
User                 UI Layer            Feature Module        Services              GitHub
  |                     |                     |                    |                    |
  | 1. Fill form        |                     |                    |                    |
  |-------------------->|                     |                    |                    |
  |                     |                     |                    |                    |
  | 2. Click submit     | 3. showToast()      |                    |                    |
  |-------------------->|<------------------->|                    |                    |
  |                     |                     |                    |                    |
  |                     |                     | 4. validateDonation()|                  |
  |                     |                     |    (validators.js) |                    |
  |                     |                     |------------------->|                    |
  |                     |                     |                    |                    |
  |                     |                     | 5. getCurrentData()|                    |
  |                     |                     |    (state.js)      |                    |
  |                     |                     |------------------->|                    |
  |                     |                     |                    |                    |
  |                     |                     | 6. Add to data      |                    |
  |                     |                     |    array           |                    |
  |                     |                     |                    |                    |
  |                     |                     | 7. setCurrentData()|                    |
  |                     |                     |    (state.js)      |                    |
  |                     |                     |------------------->|                    |
  |                     |                     |                    |                    |
  |                     |                     |                    | 8. saveDataToGitHub()|
  |                     |                     |                    |    (data-saver.js) |
  |                     |                     |                    |------------------->|
  |                     |                     |                    |                    |
  |                     |                     |                    |                    | 9. Commit
  |                     |                     |                    |<-------------------|
  |                     |                     |                    |                    |
  |                     |                     | 10. processData()  |                    |
  |                     |                     |     (data-processor)|                   |
  |                     |                     |------------------->|                    |
  |                     |                     |                    |                    |
  |                     |                     |     11. updateMetrics(),                |
  |                     |                     |         createFinancialChart(),         |
  |                     |                     |         updateAnnouncements()           |
  |                     |                     |                    |                    |
  | 12. Success toast   |                     |                    |                    |
  |<--------------------|<--------------------|                    |                    |
  |                     |                     |                    |                    |
  | 13. Updated UI      |                     |                    |                    |
  |<--------------------|                     |                    |                    |
```

### Module Responsibilities

**donations.js** (Feature Module):
- Form handling
- Input validation
- Business logic
- Calls: validators.js, state.js, data-saver.js

**state.js** (Core):
- Single source of truth
- Getter/setter methods
- No duplicate variables

**data-saver.js** (Service):
- GitHub API calls
- Error handling
- Commit message generation

**data-processor.js** (Visualization):
- Metrics calculation
- Chart updates
- Table population
- UI orchestration

## API Calls

### 1. Read Data (Public)
```
GET https://raw.githubusercontent.com/
    {username}/{repo}/{branch}/data/donations-2026.json

No authentication required
Returns: JSON file content
```

### 2. Get File SHA (Admin)
```
GET https://api.github.com/repos/
    {username}/{repo}/contents/data/donations-2026.json

Headers:
  Authorization: token {GITHUB_TOKEN}

Returns: File metadata including SHA
```

### 3. Update Data (Admin)
```
PUT https://api.github.com/repos/
    {username}/{repo}/contents/data/donations-2026.json

Headers:
  Authorization: token {GITHUB_TOKEN}
  Content-Type: application/json

Body:
  {
    "message": "Update data - 2026-04-06 14:30",
    "content": "{base64_encoded_json}",
    "sha": "{current_file_sha}",
    "branch": "main"
  }

Returns: Commit details
```

## Configuration

### simple-config.js
```javascript
GITHUB_USERNAME: 'john-doe'
GITHUB_REPO: 'vinayaka-chavithi-dashboard'
GITHUB_BRANCH: 'main'
GITHUB_TOKEN: 'ghp_xxxxxxxxxxxxxxxxxxxx'
DATA_FILE_PATH: 'data/donations-2026.json'
ADMIN_PASSWORD_HASH: '8d969eef6ecad3c29a3a629280e686cf...'
CURRENT_YEAR: '2026'
REFRESH_INTERVAL: 60000  // 60 seconds
```

## Deployment Options

### Option 1: Public Repo (Simple)
```
✓ Easy setup
✓ Free hosting
⚠ GitHub token visible in code
→ Use for low-security needs
```

### Option 2: Private Repo (Recommended)
```
✓ Token protected
✓ Code not public
✓ Free for personal use
→ Use for committee data
```

### Option 3: GitHub Actions (Advanced)
```
✓ Token in secrets
✓ Build process
✓ Most secure
→ Use for sensitive data
```

## Advantages Over Google Sheets

| Feature | Simple GitHub | Google Sheets |
|---------|--------------|---------------|
| Setup Time | 5 minutes | 30 minutes |
| Authentication | Simple password | Google OAuth |
| API Keys Needed | 1 (GitHub token) | 2 (API key + OAuth) |
| Configuration | 1 file | 2 consoles |
| Dependencies | GitHub only | Google Cloud + Sheets |
| Version Control | Built-in (Git) | Manual/third-party |
| Rollback | Easy (Git revert) | Manual restore |
| Cost | Free | Free (quota limits) |
| Complexity | Low | Medium-High |

## Backup & Recovery

### Automatic Backups
- Every save creates a Git commit
- Full history preserved
- Easy rollback to any point

### Manual Backup
```bash
# Clone repository
git clone https://github.com/username/repo.git

# All data in data/donations-2026.json
# All commits in .git/
```

### Restore Previous Version
```bash
# View commit history
git log data/donations-2026.json

# Restore to specific commit
git checkout {commit-hash} data/donations-2026.json
git commit -m "Restore data from {date}"
git push
```

## Performance

### Initial Load
- HTML download: ~50KB
- JavaScript: ~30KB
- CSS: ~15KB
- Chart.js: ~200KB
- Data JSON: ~10KB
**Total: ~305KB** (~1-2 seconds on 3G)

### Data Updates
- Form submission to GitHub: ~2-3 seconds
- Auto-refresh data: ~1 second
- Chart re-render: ~500ms

### Optimization
- CDN for Chart.js (cached)
- Simple config (no bloat)
- Minimal API calls
- Efficient JSON structure

## Scalability

### Current Design
- Supports up to **1000 donors**
- Supports up to **500 cheeti members**
- Supports up to **200 expenses**
- JSON file size: ~500KB max
- Load time: <3 seconds

### If You Outgrow
- Switch to database (Firebase, Supabase)
- Use GitHub Actions for processing
- Implement pagination
- Split data by year

## Future Enhancements

Possible additions:
- [ ] Export to PDF
- [ ] Email notifications
- [ ] SMS integration
- [ ] WhatsApp sharing
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Offline mode (PWA)
- [ ] Mobile app (React Native)
- [ ] Receipt generation
- [ ] Payment gateway integration

---

## Why This Architecture?

1. **Simplicity** - Minimal moving parts
2. **Reliability** - GitHub uptime is excellent
3. **Free** - Zero recurring costs
4. **Scalable** - Git handles versions well
5. **Secure** - Password + token protection
6. **Portable** - Easy to migrate data
7. **Maintainable** - Simple codebase
8. **Fast** - Static hosting is quick

Perfect for committee dashboards! 🎉
