# Environment Configuration Guide

## Quick Reference: Dev vs Prod Data

### For Local Development & Testing (Manual)

**Edit `dashboard-config.js`:**
```javascript
TEST_MODE: true,           // Use local files
DATA_ENVIRONMENT: 'dev',   // Use dev data folder
```

**Result:**
- Loads from `data/dev/` folder
- Safe to test features
- Changes don't affect production
- No GitHub API calls

---

### For Production Deployment (Automatic)

**GitHub Actions automatically sets:**
```javascript
TEST_MODE: false,          // Use GitHub API
DATA_ENVIRONMENT: 'prod',  // Use prod data folder
```

**No manual configuration needed!** The workflow file (`.github/workflows/deploy.yml`) automatically injects production settings during deployment.

**Result:**
- Loads from `data/prod/` via GitHub API
- Draft mode active
- Batch publishing enabled
- Protected production data

---

## Environment Configuration Summary

| Environment | TEST_MODE | DATA_ENVIRONMENT | Configured By | Data Source |
|-------------|-----------|------------------|---------------|-------------|
| **Local Dev** | `true` | `'dev'` | Manual (dashboard-config.js) | `data/dev/` local files |
| **Local Prod Test** | `true` | `'prod'` | Manual (dashboard-config.js) | `data/prod/` local files |
| **GitHub Pages** | `false` | `'prod'` | Auto (GitHub Actions) | `data/prod/` via API |

---

## Environment Switch Commands

### Switch to Dev
```bash
# Edit dashboard-config.js
DATA_ENVIRONMENT: 'dev'

# Reload page
./start.sh
```

### Switch to Prod (Local)
```bash
# Edit dashboard-config.js  
DATA_ENVIRONMENT: 'prod'

# Reload page
./start.sh
```

### Copy Prod to Dev (Reset Test Data)
```bash
cp data/prod/*.json data/dev/
```

### Backup Prod Data
```bash
cp -r data/prod data/archive/backup-$(date +%Y%m%d-%H%M%S)
```

---

## Verification

### Check Current Environment
Look at browser console on dashboard load:
```
🔧 Configuration Loaded
  - Test Mode: true
  - Data Environment: dev
  - Loading from: data/dev/donations-2025.json
```

### Verify Correct Folder Usage
1. Make a change in dashboard
2. Check which file was modified:
   ```bash
   git status
   ```
3. Should show `data/dev/donations-XXXX.json` for dev mode
4. Should show `data/prod/donations-XXXX.json` for prod mode

---

## Safety Checklist

Before making changes:
- [ ] Verify DATA_ENVIRONMENT setting
- [ ] Check console for correct path
- [ ] Confirm you're in the right environment
- [ ] Backup prod data if working in production

---

## Typical Scenarios

### Scenario 1: Testing New Feature
1. Set `DATA_ENVIRONMENT: 'dev'`
2. Restart server
3. Test feature freely
4. When satisfied, switch to `'prod'` for final check

### Scenario 2: Making Production Changes
1. Set `DATA_ENVIRONMENT: 'prod'`
2. Restart server
3. Use Draft Mode for all changes
4. Review changes in Publish preview
5. Publish All to commit

### Scenario 3: Dev Data Got Messy
1. Backup current dev data (if needed):
   ```bash
   cp -r data/dev data/archive/dev-backup-$(date +%Y%m%d)
   ```
2. Copy fresh prod data:
   ```bash
   cp data/prod/*.json data/dev/
   ```
3. Continue testing with clean data

---

## Common Issues

### "Changes not appearing"
- **Cause:** Wrong DATA_ENVIRONMENT setting
- **Fix:** Check console for loaded file path, adjust config

### "Accidentally changed prod data"
- **Cause:** Was in prod mode during testing
- **Fix:** Restore from git history or backup:
  ```bash
  git checkout data/prod/donations-XXXX.json
  ```

### "Can't tell which environment I'm in"
- **Cause:** No visual indicator
- **Fix:** Check console output or add this to dashboard:
  ```javascript
  console.log('Environment:', DASHBOARD_CONFIG.DATA_ENVIRONMENT);
  ```

---

## Future Enhancements

Potential improvements:
1. Visual indicator on dashboard showing current environment
2. Environment switcher in UI (admin only)
3. Automatic backup before prod changes
4. Diff view between prod and dev data

---

**Quick Tip:** Always start with `DATA_ENVIRONMENT: 'dev'` for safety. Switch to `'prod'` only when ready for real changes.
