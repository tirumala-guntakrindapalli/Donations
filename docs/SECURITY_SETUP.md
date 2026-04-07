# Security Setup Guide

## 🔒 Protecting Sensitive Credentials

This project uses **client-side authentication** which means some security limitations exist. However, we can protect admin credentials and GitHub tokens from being committed to version control.

## ✅ What's Protected

### 1. Admin Password
- **Stored as**: SHA-256 hash (not plain text)
- **Location**: `dashboard-config.js` (gitignored)
- **Security**: Even if someone sees the hash, they cannot reverse it to get the password

### 2. GitHub Token (if used)
- **Location**: `dashboard-config.js` (gitignored)
- **Security**: Never committed to repository
- **Only needed**: When TEST_MODE = false (production)

## 📋 Setup Instructions

### Step 1: Create Your Config File

```bash
# Copy the template to create your actual config
cp dashboard-config.template.js dashboard-config.js
```

### Step 2: Generate Password Hash

```bash
# On macOS/Linux terminal:
echo -n "your-password-here" | shasum -a 256

# The output will be a long string like:
# 878ac4dc632642f325d672200e5ecfc036f8c0e051a7fb701269858eb4539cb1
```

### Step 3: Update dashboard-config.js

Open `dashboard-config.js` and replace:

```javascript
ADMIN_PASSWORD_HASH: 'REPLACE_WITH_YOUR_SHA256_HASH',
```

with your generated hash:

```javascript
ADMIN_PASSWORD_HASH: '878ac4dc632642f325d672200e5ecfc036f8c0e051a7fb701269858eb4539cb1',
```

### Step 4: (Optional) Add GitHub Token for Production

If you want to enable GitHub integration:

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` scope
3. Add it to `dashboard-config.js`:

```javascript
GITHUB_TOKEN: 'ghp_yourActualTokenHere123456789',
```

## 🛡️ Security Checklist

- [x] `.gitignore` created - protects `dashboard-config.js`
- [x] `dashboard-config.template.js` created - safe to commit
- [x] Password stored as SHA-256 hash (irreversible)
- [x] GitHub token in gitignored file
- [x] Instructions documented

## ⚠️ Important Notes

### What Gets Committed to Git:
- ✅ `dashboard-config.template.js` (no sensitive data)
- ✅ `.gitignore` (protects sensitive files)
- ✅ All HTML/CSS/JS application files
- ✅ JSON data files (public data for transparency)

### What NEVER Gets Committed:
- ❌ `dashboard-config.js` (contains your actual password hash and tokens)
- ❌ `.DS_Store` or editor files

## 🔐 Password Security Best Practices

### Current Setup:
1. **Password is hashed** - stored as SHA-256, cannot be reversed
2. **Hash is in gitignored file** - won't be committed
3. **Client-side verification** - JavaScript checks the hash on login

### Limitations:
- If someone has access to your `dashboard-config.js` file on the server, they can see the hash
- They still cannot get your password from the hash
- But they could copy the hash to log in

### Recommendations:
1. **Use a strong password** - at least 12 characters
2. **Don't reuse passwords** - unique to this dashboard
3. **Change periodically** - regenerate hash every few months
4. **Limit access** - only authorized admins should have the password

## 📝 Verification

### Check if config is protected:

```bash
# Verify .gitignore exists and contains dashboard-config.js
cat .gitignore

# Try to add dashboard-config.js to git (should be ignored)
git status

# dashboard-config.js should NOT appear in untracked files
```

### Test the setup:

1. Open `dashboard.html`
2. Click "Admin Login"
3. Enter your password
4. Should successfully log in

## 🆘 Troubleshooting

### "Configuration not found" error:
- Make sure `dashboard-config.js` exists (copy from template)
- Check that the file is in the same directory as `dashboard.html`

### Password not working:
- Verify you hashed the password correctly
- Make sure there are no extra spaces or newlines
- Use `echo -n` (the -n is important to avoid newline)

### Hash visible in browser:
- This is normal - the hash is meant to be in the browser
- The important thing is the hash cannot be reversed to get the password
- The actual password is never stored anywhere

## 🎯 Summary

Your setup is now secure:
- ✅ Admin password is hashed (SHA-256)
- ✅ Config file is gitignored
- ✅ GitHub token won't be committed
- ✅ Template file is safe to share

**Remember**: While the hash is visible in the client's browser, they cannot reverse it to get your password, and the actual password is never stored in plain text.
