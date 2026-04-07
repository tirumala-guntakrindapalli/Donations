# GitHub Integration Guide

## 🔄 How Year Initialization Works in Different Modes

### 📋 Overview

The dashboard operates in **two modes** depending on your configuration:

---

## 🧪 TEST MODE (Local Development)

**Current Configuration:** `TEST_MODE: true` in `dashboard-config.js`

### What Happens When You Click "Initialize Year":

1. ✅ System calculates estimated collections from previous year
2. ✅ Creates JSON data structure
3. 📥 **Downloads file to your computer**
4. ⚠️ **You manually save it** to `data/donations-YYYY.json`
5. 🔄 Refresh page to load the new year

### Why This Approach?
- 🔒 **Security**: Browsers can't write to local file system directly
- 🧪 **Testing**: Safe testing without affecting production data
- 🎯 **Control**: You verify the data before placing it

### Steps:
```bash
1. Click "Initialize Year 2027"
2. File downloads: donations-2027.json
3. Move file: downloads/ → project/data/
4. Refresh browser
5. Select year 2027 → Data loads! ✅
```

---

## 🚀 PRODUCTION MODE (GitHub Integration)

**Configuration:** `TEST_MODE: false` in `dashboard-config.js`

### What Happens When You Click "Initialize Year":

1. ✅ System calculates estimated collections from previous year
2. ✅ Creates JSON data structure
3. 🔗 **Connects to GitHub API**
4. 📤 **Commits file directly** to your repository
5. ✅ **Automatic**: File appears in `data/donations-YYYY.json`
6. 🔄 Dashboard automatically reloads with new year

### GitHub API Workflow:

```javascript
// 1. Check if file exists
GET /repos/{owner}/{repo}/contents/data/donations-2027.json

// 2. Create new file (or update if exists)
PUT /repos/{owner}/{repo}/contents/data/donations-2027.json
{
  "message": "Initialize year 2027 with estimated collections",
  "content": "<base64-encoded-json>",
  "branch": "main"
}

// 3. GitHub creates commit
// 4. File is now in your repository
```

### No Manual Steps Required! 🎉
- ✅ File created automatically
- ✅ Git commit created with message
- ✅ Data available immediately
- ✅ Version controlled in Git history

---

## 🔧 Setting Up GitHub Integration

### Step 1: Update Configuration

Edit `dashboard-config.js`:

```javascript
const DASHBOARD_CONFIG = {
    // CHANGE THIS TO FALSE FOR PRODUCTION
    TEST_MODE: false,  // ← Change from true to false
    
    // Your GitHub Configuration
    GITHUB_OWNER: 'your-github-username',      // Your username
    GITHUB_REPO: 'vinayaka-chavithi-dashboard', // Your repo name
    GITHUB_BRANCH: 'main',                      // Branch name
    GITHUB_TOKEN: 'ghp_xxxxxxxxxxxxxxxxxxxx',   // Personal Access Token
    
    // ... rest of config
};
```

### Step 2: Get GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click: **"Generate new token (classic)"**
3. Set scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (if using GitHub Actions)
4. Copy the token (starts with `ghp_`)
5. Paste into `GITHUB_TOKEN` in config

⚠️ **Security**: Never commit your token to Git!

### Step 3: Deploy to GitHub Pages

1. **Push your code:**
   ```bash
   git add .
   git commit -m "Setup dashboard"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to: Repository → Settings → Pages
   - Source: Deploy from branch
   - Branch: `main` / `root`
   - Save

3. **Access Dashboard:**
   ```
   https://your-username.github.io/repo-name/
   ```

---

## 📊 Comparison Table

| Feature | TEST MODE | PRODUCTION MODE |
|---------|-----------|-----------------|
| **File Creation** | Manual (download) | Automatic (GitHub API) |
| **Commit to Git** | No | Yes ✅ |
| **Version Control** | Manual | Automatic ✅ |
| **Admin Action** | Download + Place | One Click ✅ |
| **Data Sync** | Manual refresh | Auto-reload ✅ |
| **Best For** | Development, Testing | Live deployment |
| **Security** | Local only | Requires GitHub token |

---

## 🔐 Security Best Practices

### For TEST MODE:
✅ No security concerns - everything local

### For PRODUCTION MODE:

1. **Don't Commit Token**
   ```javascript
   // ❌ NEVER DO THIS
   GITHUB_TOKEN: 'ghp_realtoken123',
   
   // ✅ INSTEAD
   // Keep token in environment variable or separate file
   GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
   ```

2. **Use Environment Variables**
   - For GitHub Pages, consider using GitHub Secrets
   - Inject at build time

3. **Token Permissions**
   - Only give `repo` scope
   - Use fine-grained tokens (beta) for better control
   - Set expiration dates

4. **Alternative: GitHub Actions**
   - No token in frontend code
   - API endpoint triggers workflow
   - More secure for sensitive operations

---

## 🎯 Recommended Workflow

### During Development:
```javascript
TEST_MODE: true
```
- Test locally
- Verify data structure
- Manual file placement
- Safe experimentation

### In Production:
```javascript
TEST_MODE: false
```
- Automatic GitHub commits
- Team collaboration
- Version history
- One-click operations

---

## 💡 Example: Year 2027 Initialization

### TEST MODE Flow:
```
1. Admin clicks "Initialize 2027"
2. Browser downloads: donations-2027.json
3. Admin saves to: data/donations-2027.json
4. Admin refreshes page
5. Year 2027 available ✅
```

### PRODUCTION MODE Flow:
```
1. Admin clicks "Initialize 2027"
2. GitHub API creates file directly
3. Git commit: "Initialize year 2027..."
4. Dashboard auto-reloads
5. Year 2027 available ✅
```

**Time Saved:** ~2 minutes per year initialization! ⚡

---

## 🐛 Troubleshooting

### TEST MODE Issues:

**File not loading after placement**
- ✅ Check filename: `donations-2027.json` (exact)
- ✅ Check location: `data/` folder
- ✅ Check JSON syntax (use validator)

### PRODUCTION MODE Issues:

**"Failed to save to GitHub"**
- ❌ Check: Token is valid and not expired
- ❌ Check: Token has `repo` scope
- ❌ Check: Repository owner/name correct
- ❌ Check: Branch exists

**"403 Forbidden"**
- Token lacks permissions
- Regenerate token with correct scopes

**"404 Not Found"**
- Repository name or owner incorrect
- Branch name wrong

---

## 📚 Related Documentation

- [Testing Guide](./TESTING_GUIDE.md) - Test both modes
- [Year Initialization Guide](./YEAR_INITIALIZATION_GUIDE.md) - Detailed year setup
- [Cheeti Cycle System](./CHEETI_CYCLE_SYSTEM.md) - Business logic

---

**Last Updated:** April 7, 2026  
**Version:** 2.0 with GitHub Integration
