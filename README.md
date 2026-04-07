# 🕉️ Vinayaka Chavithi Donations Management System

Professional web-based dashboard for managing donations, tracking financials, and organizing committee members with multi-year support and secure admin access.

---

## 🚀 **Quick Start - Two Options**

### Option 1: GitHub Pages Hosting (Recommended)
Deploy online with full admin access from anywhere:

1. **Generate password hash**: `echo -n "YourPassword" | shasum -a 256`
2. **Push to GitHub** and add `ADMIN_PASSWORD_HASH` secret
3. **Enable GitHub Pages** with "GitHub Actions" source
4. **Access online**: `https://YOUR-USERNAME.github.io/repo-name/`

📖 **[See docs/QUICK_SETUP.md for complete 4-step guide](docs/QUICK_SETUP.md)**

### Option 2: Local Development
```bash
./start.sh    # Start local server
```
Open: http://localhost:8001/  
Login with your configured admin password

```bash
./stop.sh     # Stop server when done
```

📖 **[See docs/DEPLOYMENT_GUIDE.md for detailed setup](docs/DEPLOYMENT_GUIDE.md)**

---

## ✨ **Features**

### Public Features (No Login Required)
- 🏠 **Home Page** - View current stats, committee members, donation summary
- 📊 **Dashboard** - Interactive charts and financial reports
- 👥 **Committee Display** - Current year committee members with roles
- 📈 **Year Selection** - View data for 2024, 2025, 2026
- 📱 **Responsive Design** - Works on all devices

### Admin Features (Login Required)
- ✏️ **Manage Donations** - Add, view, filter donations
- 💰 **Cheeti Management** - Track loans and payment collections
- 👔 **Committee Management** - Manage current and next year committee
- 📊 **Expense Tracking** - Record and categorize expenses
- 🔄 **Year Initialization** - Auto-setup for new years
- 💾 **Data Export** - Download JSON files
- 🔐 **Secure Access** - SHA-256 password hash protection

---

## 📂 **Project Structure**

```
Donations/
├── index.html                    # Public home page
├── dashboard.html                # Admin dashboard
├── simple-dashboard.js           # Dashboard functionality
├── styles.css                    # Styling
├── dashboard-config.js           # Local config (gitignored)
├── dashboard-config.template.js  # Template for setup
├── data/
│   ├── donations-2024.json       # 2024 data
│   ├── donations-2025.json       # 2025 data
│   └── donations-2026.json       # 2026 data
├── .github/
│   └── workflows/
│       └── deploy.yml            # Auto-deployment workflow
├── docs/                         # Additional documentation
├── QUICK_SETUP.md                # Fast deployment guide
├── DEPLOYMENT_GUIDE.md           # Complete hosting guide
├── SECURITY_SETUP.md             # Password configuration
└── STRUCTURE.md                  # Detailed file layout
```

---

## 📚 **Documentation**

### Quick Start Guides
| Document | Purpose |
|----------|---------|
| **[docs/QUICK_SETUP.md](docs/QUICK_SETUP.md)** | Fast 4-step GitHub Pages deployment |
| **[docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** | Complete hosting guide with troubleshooting |
| **[docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md)** | Git workflow & which files to commit |

### Configuration & Security
| Document | Purpose |
|----------|---------|
| **[docs/CONFIG_MODES.md](docs/CONFIG_MODES.md)** | How configuration works in local vs production |
| **[docs/SECURITY_SETUP.md](docs/SECURITY_SETUP.md)** | Password hash generation and configuration |
| **[docs/SECURITY_NOTES.md](docs/SECURITY_NOTES.md)** | Security model and limitations |

### Project Organization
| Document | Purpose |
|----------|---------|
| **[docs/STRUCTURE.md](docs/STRUCTURE.md)** | Project organization and file purposes |
| **[docs/VERIFICATION_REPORT.md](docs/VERIFICATION_REPORT.md)** | Project verification checklist |

### Advanced Documentation
📁 **[View all documentation](docs/)** - Complete documentation index in `docs/DOCS_INDEX.md`

---

## 🔒 **Security**

- ✅ **GitHub Secrets** - Password hash stored securely (encrypted)
- ✅ **SHA-256 Hashing** - One-way password encryption
- ✅ **.gitignore Protection** - Local credentials never committed
- ✅ **Session Management** - Auto-logout after inactivity
- ✅ **Public Transparency** - Donation data intentionally public
- ✅ **Admin Controls** - Sensitive features require authentication

**Note**: This is a client-side application suitable for community transparency. The password hash is visible in browser but cannot be reversed to obtain the original password.

---

## 💡 **Usage**

### For Public Users
1. Visit the home page or dashboard
2. View donation stats, committee members, reports
3. No login required

### For Admins
1. Go to dashboard → Click "Admin Login"
2. Enter your password (not the hash!)
3. Access admin panel on the right
4. Manage donations, committee, expenses
5. Changes save automatically to JSON files

### Committee Management
- **Current Committee**: Visible to everyone
- **Next Year Planning**: Admin-only, plan ahead
- **Auto-Copy**: Next year's committee becomes current on year initialization

### Year Initialization
When starting a new year (e.g., 2027):
1. Dashboard detects year not initialized
2. Click "Initialize Year 2027"
3. System auto-copies previous year's "next year committee"
4. Calculates expected cheeti collections
5. Download generated JSON
6 Save as `donations-2027.json` in data folder

---

## 🚀 **Deployment Workflow**

### First Time Setup
1. Create GitHub repository
2. Add `ADMIN_PASSWORD_HASH` to GitHub Secrets
3. Push code (auto-deploys via GitHub Actions)
4. Site live at: `https://username.github.io/repo-name/`

### Making Updates
1. **Option A**: Edit on hosted dashboard → saves to GitHub
2. **Option B**: Edit locally → commit → push (auto-deploys)
3. GitHub Actions rebuilds and redeploys automatically
4. Changes live in 2-3 minutes

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `./start.sh`
5. Submit a pull request

---

## 📝 **License**

This project is open-source and available for community use.

---

## 🆘 **Support**

- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for troubleshooting
- Review [QUICK_SETUP.md](QUICK_SETUP.md) for setup help
- Verify settings in [SECURITY_SETUP.md](SECURITY_SETUP.md)

This project is for internal use by Vinayaka Chavithi Committee (Muchivolu).

---

## 📞 **Support**

For questions or issues:
- Review documentation in `/docs`
- Check the cheeti cycle system guide
- Verify year initialization steps

---

**Version**: 2.0 (Year-Based, Fixed Cycle)  
**Last Updated**: April 2026  
**Maintained by**: Vinayaka Chavithi Committee
