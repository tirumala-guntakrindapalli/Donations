# GitHub Pages Deployment Guide

## Overview
This guide will help you deploy your Vinayaka Chavithi Donations website to GitHub Pages for free hosting.

## Prerequisites
- GitHub account ([Sign up here](https://github.com/join))
- Git installed on your computer
- Your website files (already set up with security)

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the "+" icon in the top right → "New repository"
3. Repository settings:
   - **Name**: `vinayaka-chavithi-donations` (or your preferred name)
   - **Description**: "Vinayaka Chavithi Donations Management System"
   - **Visibility**: 
     - ✅ **Public** (required for free GitHub Pages)
     - Note: Your `.gitignore` protects sensitive credentials
   - **DO NOT** initialize with README (you already have files)
4. Click "Create repository"

## Step 2: Initialize Git & Push Code

Open Terminal in your project folder and run:

```bash
# Initialize git repository (if not already done)
git init

# Add all files (dashboard-config.js will be ignored automatically)
git add .

# Verify dashboard-config.js is NOT staged
git status
# You should see it listed under "Untracked files" or not at all

# Create initial commit
git commit -m "Initial commit: Donations management system"

# Add GitHub as remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/vinayaka-chavithi-donations.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" section (left sidebar)
4. Under "Source":
   - Select: **GitHub Actions** (not "Deploy from a branch")
   - This allows our workflow to handle deployment
5. The first deployment will happen automatically when you complete Step 4
6. Your site will be available at:
   ```
   https://YOUR-USERNAME.github.io/vinayaka-chavithi-donations/
   ```

## Step 4: Configure GitHub Secrets (Admin Dashboard)

To enable the admin dashboard on your hosted site, we'll use **GitHub Secrets** to securely store credentials.

### 4.1: Generate Your Password Hash

On your local machine, run:

```bash
# Replace 'your-password' with your actual admin password
echo -n "your-password" | shasum -a 256
```

Copy the output hash (it will look like: `5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8`)

### 4.2: Add Secrets to GitHub Repository

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

**Required Secret:**
- **Name**: `ADMIN_PASSWORD_HASH`
- **Value**: Paste your password hash from step 4.1

**Optional Secrets** (for GitHub integration features):
- **Name**: `DONATIONS_PAT`
- **Value**: Leave empty or add a GitHub personal access token
- **Name**: `GITHUB_REPO`
- **Value**: Your repository name (e.g., `vinayaka-chavithi-donations`)
- **Name**: `GITHUB_OWNER`
- **Value**: Your GitHub username

### 4.3: How It Works

✅ **GitHub Actions Workflow** (already set up in `.github/workflows/deploy.yml`):
1. When you push to `main` branch, workflow runs automatically
2. Creates `dashboard-config.js` from your secrets (never committed to repo)
3. Deploys complete site to GitHub Pages
4. Admin dashboard works on hosted site!

🔒 **Security Benefits**:
- Password hash stored in GitHub Secrets (encrypted)
- Never appears in repository code
- Only you (repo owner) can see/edit secrets
- Injected at build time, not stored in Git

⚠️ **Important Notes**:
- Password hash will be visible in browser (client-side JavaScript)
- This is acceptable because:
  - SHA-256 hash is one-way (cannot reverse to get password)
  - Use a strong password (12+ characters, mixed case, numbers, symbols)
  - Change password by updating the secret
- For maximum security, use a password ONLY for this site

## Step 5: Update Links & Verify

After deployment (takes about 2-3 minutes), verify your site:

1. **Home Page**: `https://YOUR-USERNAME.github.io/vinayaka-chavithi-donations/`
   - ✅ Should load with purple gradient
   - ✅ Committee members visible
   - ✅ Stats showing

2. **Admin Dashboard**: `https://YOUR-USERNAME.github.io/vinayaka-chavithi-donations/dashboard.html`
   - ✅ Login page loads
   - ✅ Enter your password (the one you hashed in Step 4.1)
   - ✅ Dashboard unlocks with all admin features
   - ✅ Add/remove donations, manage committee

## Step 6: Workflow - Making Updates

### Option A: Through Web Dashboard (Recommended)

1. **Login to hosted dashboard**:
   - Visit `https://YOUR-USERNAME.github.io/vinayaka-chavithi-donations/dashboard.html`
   - Enter your admin password
   - Make changes (add donations, manage committee, etc.)

2. **Save and commit changes**:
   - Dashboard has "Save to GitHub" functionality
   - Changes committed directly to repository
   - Site auto-rebuilds and deploys

### Option B: Local Development (Advanced)

1. **Make changes locally**:
   ```bash
   # Run local server
   python3 -m http.server 8000
   # Open http://localhost:8000/dashboard.html
   # Make changes
   ```

2. **Push updates to GitHub**:
   ```bash
   git add .
   git commit -m "Updated donations for April 2026"
   git push
   ```

3. **Automatic deployment**:
   - GitHub Actions workflow runs automatically
   - Injects credentials from secrets
   - Deploys updated site
   - Wait 2-3 minutes for changes to appear

### For Public Users:
- Visit `https://YOUR-USERNAME.github.io/vinayaka-chavithi-donations/`
- View current stats, reports, committee members
- No login needed for viewing
- Admins can login for management

## Troubleshooting

### Issue: Site not loading after deployment
**Fix**: 
- Check **Actions** tab in GitHub repository for workflow status
- Look for green checkmark (success) or red X (failure)
- Click on failed workflow to see error details
- Verify GitHub Pages source is set to "GitHub Actions"

### Issue: Dashboard login not working on hosted site
**Fix**: 
- Verify `ADMIN_PASSWORD_HASH` secret is set correctly in repository Settings → Secrets
- Regenerate hash: `echo -n "your-password" | shasum -a 256`
- Update secret with new hash
- Wait for next deployment or manually trigger workflow (Actions tab → Run workflow)

### Issue: "Workflow run failed" in GitHub Actions
**Fix**: 
- Go to repository Settings → Pages
- Ensure source is set to **"GitHub Actions"** (not "Deploy from a branch")
- Check Actions tab for error message
- Common issue: Secrets not set - add `ADMIN_PASSWORD_HASH` in Settings → Secrets

### Issue: Images/styles not loading
**Fix**: 
- Files should work as-is (using relative paths)
- If issues persist, check browser console for errors
- Clear browser cache: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### Issue: Changes not appearing after push
**Fix**: 
- Check Actions tab - workflow should run automatically on push
- Wait 2-3 minutes for deployment
- Hard refresh: Ctrl+Shift+R or Cmd+Shift+R
- Workflow can be manually triggered: Actions tab → Deploy to GitHub Pages → Run workflow

## File Structure After Deployment

```
Your Local Machine:
├── .github/
│   └── workflows/
│       └── deploy.yml               # ✅ GitHub Actions workflow
├── dashboard-config.js              # ✅ ONLY HERE (gitignored)
├── dashboard-config.template.js     # In Git (safe template)
├── dashboard.html                   # In Git (works everywhere!)
├── index.html                       # In Git (works everywhere)
├── simple-dashboard.js              # Dashboard functionality
├── styles.css                       # Styling
├── data/
│   ├── donations-2024.json          # In Git (public data)
│   ├── donations-2025.json          # In Git (public data)
│   └── donations-2026.json          # In Git (public data)
└── .gitignore                       # In Git (protects config)

GitHub Repository:
├── .github/workflows/deploy.yml     # Workflow configuration
├── dashboard-config.template.js     # Template for reference
├── dashboard.html                   # ✅ Admin dashboard source
├── index.html                       # ✅ Home page source
├── simple-dashboard.js              # ✅ Dashboard functionality
├── styles.css                       # ✅ Styling
├── data/
│   ├── donations-2024.json          # ✅ Public data
│   ├── donations-2025.json          # ✅ Public data
│   └── donations-2026.json          # ✅ Public data
└── .gitignore                       # Protects local credentials

GitHub Secrets (Settings → Secrets):
├── ADMIN_PASSWORD_HASH              # 🔒 Your password hash (encrypted)
├── DONATIONS_PAT                    # 🔒 Optional GitHub token
├── GITHUB_REPO                      # Repository name
└── GITHUB_OWNER                     # Your username

GitHub Pages (Deployed Site):
https://YOUR-USERNAME.github.io/vinayaka-chavithi-donations/
├── dashboard-config.js              # ✅ Generated from secrets at build time
├── dashboard.html                   # ✅ FULLY FUNCTIONAL admin dashboard
├── index.html                       # ✅ Home page works
├── simple-dashboard.js              # ✅ Dashboard functionality
├── styles.css                       # ✅ Styling
└── data/*.json                      # ✅ Public transparency
```

## Custom Domain (Optional)

If you own a domain like `vinayakachavithi.com`:

1. Go to repository Settings → Pages
2. Enter your domain in "Custom domain"
3. Configure DNS with your domain provider:
   ```
   Type: CNAME
   Name: www
   Value: YOUR-USERNAME.github.io
   ```
4. Wait for DNS propagation (up to 24 hours)

## Summary

✅ **What works on GitHub Pages**:
- 🏠 Home page with stats and committee
- 📊 Public reports and transparency
- 🔐 **FULL admin dashboard with login**
- ✏️ **Add/edit/delete donations online**
- 👥 **Manage committee members online**
- ⚡ Fast, free hosting
- 🔄 Automatic deployments on git push
- 🔒 Secure credential management via GitHub Secrets

❌ **What doesn't require local setup anymore**:
- Everything works online! 🎉

🔒 **Security maintained**:
- Admin credentials stored in encrypted GitHub Secrets
- Password hash (SHA-256) visible in browser but cannot be reversed
- Strong password recommended (12+ characters, unique to this site)
- Local development still possible if preferred
- Public donation data intentionally transparent

## Next Steps

1. ✅ Create GitHub repository
2. ✅ Push your code (credentials auto-protected by .gitignore)
3. ✅ Enable GitHub Pages with "GitHub Actions" source
4. ✅ **Add ADMIN_PASSWORD_HASH secret** (critical step!)
5. ✅ Wait for automatic deployment (check Actions tab)
6. ✅ Login to hosted dashboard and start managing
7. ✅ Share public URL with community
8. ✅ Manage everything online - no local server needed!

---

**Questions?** Check [GitHub Pages Documentation](https://docs.github.com/en/pages) or [GitHub Actions Documentation](https://docs.github.com/en/actions)
