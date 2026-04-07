# 🎯 Quick Usage Guide

## Starting the Dashboard (2 Steps)

### Step 1: Start the Server
```bash
cd /path/to/Donations
./start.sh
```

You'll see:
```
==================================================
  Vinayaka Chavithi Dashboard - Server Startup   
==================================================

📁 Project Directory: /Users/.../Donations
🌐 Port: 8000

🚀 Starting Python HTTP server on port 8000...

📱 Dashboard URLs:
   • Simple GitHub Version: http://localhost:8000/simple-index.html
   • Static Demo Version:   http://localhost:8000/index.html
   • Test Modal:            http://localhost:8000/test-modal.html

🔐 Admin Login:
   Password: vinayaka2026

Press Ctrl+C to stop the server
==================================================
```

### Step 2: Open in Browser
Click the link or open manually:
- **Main Dashboard:** http://localhost:8000/simple-index.html

---

## Using the Dashboard

### View Mode (No Login Required)
- See all metrics, charts, and data tables
- Fully interactive visualizations
- Read-only access

### Admin Mode (Login Required)
1. Click **"Admin Login"** button (top right)
2. Enter password: `vinayaka2026`
3. Click **"Login"**
4. Admin panel slides in from the right

**Admin Panel Features:**
- ➕ Add new donations
- 👥 Add cheeti members
- 💰 Record expenses
- 💾 All changes auto-save (in TEST_MODE: to local file)

---

## Stopping the Server

### Method 1: Using Stop Script
```bash
./stop.sh
```

### Method 2: In Terminal
Press `Ctrl+C` in the terminal running the server

### Method 3: Force Stop
```bash
lsof -ti:8000 | xargs kill -9
```

---

## Common Tasks

### Check if Server is Running
```bash
lsof -i :8000
```

If running, you'll see:
```
COMMAND   PID  USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
Python  12345  user    4u  IPv6  ...       0t0  TCP *:irdmi (LISTEN)
```

### View Server Logs
Server logs appear in the terminal where you ran `./start.sh`

### Reload Dashboard
In browser: `Cmd+R` (Mac) or `F5` (Windows/Linux)

### Clear Cache & Reload
In browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)

---

## File Locations

```
Donations/
├── start.sh                  ← START script
├── stop.sh                   ← STOP script
├── simple-index.html         ← Main dashboard
├── simple-dashboard.js       ← Dashboard logic
├── simple-config.js          ← Configuration
├── data/
│   └── donations-2026.json   ← Data file
└── styles.css                ← Styling
```

---

## Customization

### Change Port (from 8000 to something else)
Edit `start.sh` and `stop.sh`:
```bash
PORT=8000  # Change this line
```

### Change Admin Password
See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md#change-admin-password)

### Modify Data
Edit `data/donations-2026.json` directly or use Admin Panel

---

## Troubleshooting

### "Port already in use"
```bash
./stop.sh    # Stop existing server
./start.sh   # Start fresh
```

### "Permission denied" on scripts
```bash
chmod +x start.sh stop.sh
```

### Browser shows old version
1. Hard refresh: `Cmd+Shift+R` 
2. Clear browser cache
3. Restart server

### Modal/Login not working
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify files are loaded
4. Try test-modal.html to isolate issue

---

## Production Deployment

### For GitHub Pages
1. Set `TEST_MODE: false` in simple-config.js
2. Add GitHub credentials in simple-config.js
3. Push to GitHub repository
4. Enable GitHub Pages in repo settings
5. Access at: `https://username.github.io/repo/simple-index.html`

### For Custom Server
1. Use a production web server (nginx, Apache)
2. Enable HTTPS
3. Change default password
4. Configure CORS if needed
5. Set up proper authentication

---

## Daily Usage Workflow

### For Committee Members (View Only)
1. Open: http://localhost:8000/simple-index.html
2. View metrics and reports
3. No login needed

### For Admins (Edit & Update)
1. Open: http://localhost:8000/simple-index.html
2. Click "Admin Login" → Enter password
3. Use admin panel to add/update data
4. Changes save automatically
5. Logout: Click "X" on admin panel

### For Updates & Maintenance
1. Edit files as needed
2. Refresh browser to see changes
3. No need to restart server for HTML/CSS/JS changes
4. Restart server only for configuration changes

---

## Need Help?

📖 **Documentation:**
- [README.md](README.md) - Overview
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Detailed structure
- [SIMPLE_SETUP.md](SIMPLE_SETUP.md) - Setup guide
- [VERSION_COMPARISON.md](VERSION_COMPARISON.md) - Version differences

🐛 **Issues:**
1. Check browser console for errors
2. Verify server is running: `lsof -i :8000`
3. Test with: http://localhost:8000/test-modal.html
4. Review file permissions: `ls -la *.sh`

---

**Last Updated:** April 6, 2026
