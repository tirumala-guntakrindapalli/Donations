# Data Folder Structure

This folder contains all JSON data files for the Vinayaka Chavithi Donations Management System, organized by environment.

## Folder Structure

```
data/
├── prod/               # Production data files
│   ├── donations-2024.json
│   ├── donations-2025.json
│   └── donations-2026.json
├── dev/                # Development/testing data files
│   ├── donations-2024.json
│   ├── donations-2025.json
│   └── donations-2026.json
├── archive/           # Historical/backup files
└── README.md          # This file
```

## Environment Separation

### Production (`prod/`)
- **Purpose:** Real production data used in deployed application
- **Usage:** GitHub Pages deployment, live dashboard
- **Protection:** Changes committed only through "Publish All" in production
- **Access:** Admin only in production environment

### Development (`dev/`)
- **Purpose:** Testing and development data
- **Usage:** Local development, testing new features
- **Safety:** Can be modified freely without affecting production
- **Refresh:** Can be reset/copied from prod as needed

## Configuration

Control which environment is used via `dashboard-config.js`:

**Local Development (Manual):**
```javascript
// For testing with dev data (recommended)
TEST_MODE: true,
DATA_ENVIRONMENT: 'dev'

// For testing with prod data (careful!)
TEST_MODE: true,
DATA_ENVIRONMENT: 'prod'
```

**Production Deployment (Automatic):**
```javascript
// Set automatically by GitHub Actions workflow
TEST_MODE: false,
DATA_ENVIRONMENT: 'prod'  // ← Injected by .github/workflows/deploy.yml
```

**No manual production config needed!** The deployment workflow automatically sets `DATA_ENVIRONMENT: 'prod'` when deploying to GitHub Pages.

## File Naming Convention

All data files follow the pattern: `donations-{YEAR}.json`

Each file contains:
- Donations
- Expenses
- Cheeti members
- Sponsors
- Committee members
- Laddu winners
- Settings (dashboard visibility)

## How It Works

1. **Local Development:**
   - Set `DATA_ENVIRONMENT: 'dev'` in config
   - Loads data from `data/dev/` folder
   - Test changes without affecting production
   - Changes stay local until committed

2. **Production Deployment:**
   - Set `DATA_ENVIRONMENT: 'prod'` in config (or let GitHub workflow inject it)
   - Loads data from `data/prod/` folder via GitHub API
   - Admin changes use Draft Mode
   - Batch publish creates single commit to prod files

3. **Environment Switch:**
   - Simply change `DATA_ENVIRONMENT` in config
   - Restart server to apply changes
   - No code changes needed

## Benefits

✅ **Safety:** Test features without touching production data  
✅ **Flexibility:** Switch environments with single config change  
✅ **Backup:** Dev folder can serve as working backup  
✅ **Clarity:** Clear separation between prod and test data  
✅ **Workflow:** Draft mode works with prod, free testing in dev

## Typical Workflows

### Local Testing New Feature
```bash
# 1. Ensure dev environment
DATA_ENVIRONMENT: 'dev' in config

# 2. Start local server
./start.sh

# 3. Test feature with dev data
# Make changes, test, iterate

# 4. When ready, switch to prod for final validation
DATA_ENVIRONMENT: 'prod'
```

### Refreshing Dev Data from Prod
```bash
# Copy production data to dev for testing
cp data/prod/*.json data/dev/
```

### Backing Up Production Data
```bash
# Create timestamped backup
cp -r data/prod data/archive/backup-$(date +%Y%m%d)
```

## Important Notes

⚠️ **Always verify** which environment you're in before making changes  
⚠️ **Never commit** sensitive test data to production folder  
⚠️ **Backup regularly** production data before major changes  
⚠️ **Test first** in dev environment before deploying to production

## Git Workflow

Both `prod/` and `dev/` folders are tracked in git:
- Production data in `prod/` is the source of truth
- Development data in `dev/` can diverge for testing
- Commit only when changes are intentional
- Use draft mode + publish in production to ensure atomic updates

---

**Last Updated:** April 8, 2026  
**Environment Separation Implemented:** v2.0
