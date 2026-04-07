# 📁 Project Structure

## Current File Layout (April 2026)

```
Donations/
│
├── 🌐 WEB APPLICATION (Root Level)
│   ├── index.html                   # Public home page with stats & committee
│   ├── dashboard.html               # Admin dashboard (login required)
│   ├── simple-dashboard.js          # Dashboard functionality & logic (8000+ lines)
│   ├── styles.css                   # Global CSS styling
│   ├── dashboard-config.js          # Local config (GITIGNORED - never commit)
│   └── dashboard-config.template.js # Template for setup (safe to commit)
│
├── 🚀 SCRIPTS (Quick Access)
│   ├── start.sh                     # Start local development server
│   ├── stop.sh                      # Stop local development server
│   └── test.sh                      # Test runner
│
├── 📊 DATA/
│   ├── donations-2024.json          # 2024 donation data
│   ├── donations-2025.json          # 2025 donation data
│   ├── donations-2026.json          # 2026 donation data (current)
│   ├── Vinayaka Chavithi Donations - 2025.csv  # CSV archive
│   └── archive/                     # Historical data backups
│
├── 📚 DOCS/ (All Documentation)
│   ├── 📖 Setup & Deployment
│   │   ├── QUICK_SETUP.md           # ⭐ 4-step GitHub Pages deployment
│   │   ├── DEPLOYMENT_GUIDE.md      # Complete hosting guide
│   │   ├── GIT_WORKFLOW.md          # Git workflow explained
│   │   └── QUICKSTART.md            # Fast start guide
│   │
│   ├── 🔧 Configuration
│   │   ├── CONFIG_MODES.md          # ⭐ Local vs Production config
│   │   ├── SECURITY_SETUP.md        # Password hash setup
│   │   ├── SECURITY_NOTES.md        # Security model
│   │   └── SIMPLE_SETUP.md          # Simple setup guide
│   │
│   ├── 📋 Project Info
│   │   ├── DOCS_INDEX.md            # Master documentation index
│   │   ├── STRUCTURE.md             # This file - project organization
│   │   ├── VERIFICATION_REPORT.md   # Project verification checklist
│   │   └── PROJECT_STRUCTURE.md     # Detailed file descriptions
│   │
│   ├── 💡 Features & Usage
│   │   ├── USAGE_GUIDE.md           # Daily usage instructions
│   │   ├── YEAR_INITIALIZATION_GUIDE.md  # New year setup
│   │   ├── CHEETI_CYCLE_SYSTEM.md   # Cheeti payment explained
│   │   └── TESTING_GUIDE.md         # Testing procedures
│   │
│   └── 🔬 Technical
│       ├── ARCHITECTURE.md          # System architecture
│       ├── GITHUB_INTEGRATION.md    # GitHub API integration
│       ├── VERSION_COMPARISON.md    # Version history
│       └── SIMPLE_SOLUTION.md       # Technical details
│
├── 🔧 GITHUB/
│   └── workflows/
│       └── deploy.yml               # GitHub Actions auto-deployment
│
├── 🧪 TESTS/
│   └── test-modal.html              # Modal component testing
│
├── 📖 ROOT DOCUMENTATION
│   └── README.md                    # ⭐ Main project overview (start here)
│
└── 🔒 CONFIGURATION
    └── .gitignore                   # Protects dashboard-config.js from commits
```

## Key Files Explained

### Public Web Files

| File | Purpose | Access |
|------|---------|--------|
| **index.html** | Home page with stats, committee display | Public |
| **dashboard.html** | Full admin dashboard interface | Login required |
| **simple-dashboard.js** | Core functionality (8000+ lines) | Public code |
| **styles.css** | All styling and responsive design | Public |

### Configuration Files

| File | Purpose | Git Status |
|------|---------|------------|
| **dashboard-config.js** | Local config with password hash | **GITIGNORED** |
| **dashboard-config.template.js** | Safe template for setup | Committed |

### Data Files (Public)

| File | Purpose | Status |
|------|---------|--------|
| **donations-2024.json** | 2024 complete data | Archived |
| **donations-2025.json** | 2025 complete data | Archived |
| **donations-2026.json** | 2026 active data | Current year |

### Deployment Files

| File | Purpose | When Used |
|------|---------|-----------|
| **.github/workflows/deploy.yml** | Auto-deployment workflow | On git push |
| **.gitignore** | Protects sensitive files | Always |

### Documentation Hierarchy

**Root Level (Main Guides):**
- README.md - Start here
- QUICK_SETUP.md - Fast deployment
- DEPLOYMENT_GUIDE.md - Complete guide
- SECURITY_SETUP.md - Password setup

**docs/ (Detailed Guides):**
- Technical documentation
- System architecture
- Advanced features
- Development guides

## File Access Patterns

### Local Development
```bash
# Start server
./start.sh

# Access home page
http://localhost:8001/index.html

# Access dashboard
http://localhost:8001/dashboard.html

# Data loads from
http://localhost:8001/data/donations-2026.json
```

### GitHub Pages Production
```
# Base URL
https://username.github.io/repo-name/

# Home page
https://username.github.io/repo-name/index.html

# Dashboard
https://username.github.io/repo-name/dashboard.html

# Data loaded client-side from same origin
```

### Code References (JavaScript)
```javascript
// From root HTML files, load data:
fetch('data/donations-2026.json')

// Load config:
const config = DashboardConfig;  // Global from dashboard-config.js

// Load committee:
const committee = data.committee;
```

## Why This Structure?

### ✅ Best Practices

1. **Root-level web files** - Standard for static sites, GitHub Pages
2. **Separated data folder** - Clear data/code separation
3. **Protected credentials** - .gitignore prevents leaks
4. **Organized docs** - Easy to find guides
5. **Auto-deployment** - GitHub Actions workflow

### 🔒 Security First

- Sensitive files gitignored
- Template files for safe sharing
- Clear separation of public/private data
- Secrets managed via GitHub Secrets (production)

### 📦 Deployment Ready

- GitHub Pages compatible structure
- GitHub Actions workflow included
- No build step required (static files)
- Auto-deploy on push to main

## Adding New Years

When creating data for 2027:
```
data/
├── donations-2024.json  # Keep for history
├── donations-2025.json  # Keep for history  
├── donations-2026.json  # Keep for history
└── donations-2027.json  # NEW - created via dashboard
```

Dashboard automatically detects and offers initialization.

---

**Note**: This structure balances simplicity, security, and professional organization while remaining GitHub Pages compatible.
<a href="docs/SIMPLE_SETUP.md">Setup Guide</a>       <!-- Down into docs/ -->
```

## Quick Navigation

### Start Using
```bash
./start.sh                              # Start server
open http://localhost:8000/simple-index.html
```

### View Documentation
```bash
cd docs
open DOCS_INDEX.md                      # Master index
```

### Edit Configuration
```bash
nano simple-config.js                   # Edit config
```

### Update Data
```bash
nano data/donations-2026.json          # Edit data
```

## File Descriptions

### Root Level

#### Scripts
- **start.sh** - Starts Python HTTP server on port 8000, displays URLs
- **stop.sh** - Stops server gracefully, shows process info

#### Dashboard
- **simple-index.html** - Primary dashboard with admin login
- **simple-dashboard.js** - Main application logic
- **simple-config.js** - Settings (password, GitHub config, TEST_MODE)
- **index.html** - Static demo (no backend needed)
- **dashboard.js** - Static version logic
- **styles.css** - Global styles and theme

#### Documentation
- **README.md** - Project overview and quick start

### `/data` Folder
- **donations-2026.json** - Current year data (JSON format)
- **Vinayaka Chavithi Donations - 2025.csv** - Previous year data

### `/docs` Folder
- **DOCS_INDEX.md** - Complete documentation index
- **USAGE_GUIDE.md** - How to use daily ⭐ START HERE
- **PROJECT_STRUCTURE.md** - Detailed file organization
- **SIMPLE_SETUP.md** - Setup instructions
- **SIMPLE_SOLUTION.md** - Technical implementation
- **QUICKSTART.md** - Fast setup steps
- **VERSION_COMPARISON.md** - Compare versions
- **ARCHITECTURE.md** - System design

### `/tests` Folder
- **test-modal.html** - Test login modal in isolation
- **demo.html** - Demo/testing page

## Benefits of This Structure

✅ **Professional** - Standard web project layout
✅ **Organized** - Related files grouped together
✅ **Scalable** - Easy to add more files/folders
✅ **Clean Root** - Only essential files visible
✅ **Easy Deployment** - GitHub Pages compatible
✅ **Clear Separation** - Code, data, docs, tests separated
✅ **Quick Access** - Scripts and main files at root

## Moving Between Old and New Structure

### Old Structure (Everything at Root)
```
Donations/
├── All .html, .js, .css files
├── All .md documentation files
├── data/ folder
└── No organization
```

### New Structure (Organized)
```
Donations/
├── Essential files only (HTML, JS, CSS, scripts)
├── data/ - Data files
├── docs/ - Documentation
├── tests/ - Testing
└── README.md
```

## For Developers

### Adding New Files

**New dashboard feature:**
- Add to root: `new-feature.html`, `new-feature.js`

**New documentation:**
- Add to `/docs` folder
- Update `docs/DOCS_INDEX.md`

**New data source:**
- Add to `/data` folder
- Update config in `simple-config.js`

**New test:**
- Add to `/tests` folder

### Deployment Checklist

For GitHub Pages:
1. ✅ Main files at root (simple-index.html, etc.)
2. ✅ Relative paths for resources
3. ✅ Update simple-config.js (TEST_MODE, GitHub settings)
4. ✅ Commit and push
5. ✅ Enable GitHub Pages
6. ✅ Access at username.github.io/repo/simple-index.html

## Summary

| Location | Purpose | Access |
|----------|---------|--------|
| **Root** | Main dashboard & scripts | Direct |
| **data/** | Data storage | `./data/...` |
| **docs/** | All documentation | `./docs/...` |
| **tests/** | Testing & demos | `./tests/...` |

---

**Last Updated:** April 6, 2026  
**Structure Version:** 2.0 (Organized)
