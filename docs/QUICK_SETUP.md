# Quick Setup: GitHub Secrets for Admin Dashboard

## Fast Track - 3 Steps to Get Admin Dashboard Working

### Step 1: Generate Your Password Hash

Open Terminal and run this command:

```bash
# Replace 'YourStrongPassword123!' with your actual password
echo -n "YourStrongPassword123!" | shasum -a 256
```

**Example output:**
```
5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8
```

📋 **Copy the hash** (the long string of letters and numbers)

### Step 2: Add Secret to GitHub

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret** (green button)
5. Fill in:
   - **Name**: `ADMIN_PASSWORD_HASH`
   - **Secret**: Paste the hash you copied
6. Click **Add secret**

### Step 3: Trigger Deployment

**Option A: Push a commit**
```bash
git add .
git commit -m "Setup complete"
git push
```

**Option B: Manual trigger**
1. Go to **Actions** tab in your repository
2. Click **Deploy to GitHub Pages** (left sidebar)
3. Click **Run workflow** → **Run workflow**

### Step 4: Test Your Dashboard

Wait 2-3 minutes, then visit:
```
https://YOUR-USERNAME.github.io/vinayaka-chavithi-donations/dashboard.html
```

1. Enter the password you used in Step 1 (NOT the hash!)
2. Click Login
3. ✅ You should see the full admin dashboard!

---

## Password Security Tips

✅ **DO:**
- Use a strong password (12+ characters)
- Mix uppercase, lowercase, numbers, symbols
- Use a unique password just for this site
- Store password in password manager

❌ **DON'T:**
- Use simple passwords like "admin123"
- Reuse passwords from other sites
- Share your password in chat/email
- Commit the actual password to Git

---

## Troubleshooting

**Login not working?**
- Make sure you're entering the PASSWORD, not the hash
- Verify the secret name is exactly: `ADMIN_PASSWORD_HASH`
- Check Actions tab for deployment errors

**Deployment failed?**
- Go to Settings → Pages
- Set Source to: **GitHub Actions** (not "Deploy from a branch")
- Try running workflow again

**Still stuck?**
- Check the Actions tab for detailed error logs
- See full [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## Changing Your Password Later

1. Generate new hash: `echo -n "NewPassword456!" | shasum -a 256`
2. Go to Settings → Secrets → Actions
3. Click on `ADMIN_PASSWORD_HASH`
4. Click **Update secret**
5. Paste new hash → **Update secret**
6. Wait 2-3 minutes for redeployment
7. Use new password to login
