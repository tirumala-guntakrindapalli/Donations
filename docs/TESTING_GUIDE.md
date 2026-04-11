# 🧪 Testing Guide - Vinayaka Chavithi Dashboard

Complete testing checklist to validate all use cases in TEST MODE.

---

## 📋 Pre-Test Setup

### ✅ Verify Configuration
- [x] TEST_MODE = true (in dashboard-config.js)
- [x] Server running on http://localhost:8001
- [x] Admin password: `vinayaka2026`

### ✅ Data Files Present
```bash
data/
├── donations-2024.json  ✓
├── donations-2025.json  ✓
└── donations-2026.json  ✓
```

---

## 🎯 Test Cases Overview

| # | Category | Test Cases | Priority |
|---|----------|------------|----------|
| 1 | **Navigation & UI** | 5 tests | High |
| 2 | **Authentication** | 4 tests | High |
| 3 | **Year Selection** | 4 tests | High |
| 4 | **View Data** | 6 tests | Medium |
| 5 | **Admin - Donations** | 3 tests | High |
| 6 | **Admin - Cheeti (Current Year)** | 4 tests | High |
| 7 | **Admin - Cheeti (Past Year)** | 5 tests | High |
| 8 | **Admin - Expenses** | 3 tests | Medium |
| 9 | **Session Management** | 3 tests | High |
| 10 | **Year Initialization** | 3 tests | High |
| 11 | **Responsive Design** | 2 tests | Medium |
| 12 | **Edge Cases** | 4 tests | High |

**Total**: 46 Test Cases

---

## 📝 Detailed Test Cases

### 1️⃣ Navigation & UI Tests

#### Test 1.1: Welcome Page Load
**Steps:**
1. Open http://localhost:8001/
2. Verify Om logo displays
3. Check "Vinayaka Chavithi Committee" title
4. Verify "(Muchivolu)" location shows
5. Check year is dynamic (2026)

**Expected Result:** ✅ Welcome page loads with all elements

#### Test 1.2: Navigation to Dashboard
**Steps:**
1. From welcome page, click "View Dashboard"
2. Verify redirects to dashboard.html

**Expected Result:** ✅ Dashboard loads successfully

#### Test 1.3: Admin Login Button
**Steps:**
1. From welcome page, click "Admin Login"
2. Verify redirects to dashboard.html?login=true

**Expected Result:** ✅ Dashboard loads with login modal open

#### Test 1.4: Year Dropdown Display
**Steps:**
1. Open dashboard
2. Check year dropdown in header
3. Verify shows: 2024, 2025, 2026

**Expected Result:** ✅ Dropdown shows 3 years (current and 2 previous)

#### Test 1.5: UI Elements Render
**Steps:**
1. Check all cards display
2. Verify charts render
3. Check tables are visible

**Expected Result:** ✅ All UI elements render correctly

---

### 2️⃣ Authentication Tests

#### Test 2.1: Login Modal Display
**Steps:**
1. Open dashboard.html?login=true
2. Verify modal appears centered
3. Check password field exists
4. Check login button present

**Expected Result:** ✅ Login modal displays properly

#### Test 2.2: Successful Login
**Steps:**
1. Open login modal
2. Enter password: `vinayaka2026`
3. Click "Login"

**Expected Result:** 
- ✅ Modal closes
- ✅ Admin panel appears on right
- ✅ Success message shows
- ✅ URL parameter ?login=true removed

#### Test 2.3: Failed Login
**Steps:**
1. Open login modal
2. Enter wrong password: `wrong123`
3. Click "Login"

**Expected Result:**
- ❌ Error message: "Invalid password"
- ❌ Modal stays open
- ❌ Admin panel does not appear

#### Test 2.4: Logout Functionality
**Steps:**
1. Login as admin
2. Click "Logout" button in admin panel
3. If no unsaved data, confirm logout

**Expected Result:**
- ✅ Custom confirmation modal shows (if unsaved data)
- ✅ Admin panel closes
- ✅ Session cleared
- ✅ Success message shows

---

### 3️⃣ Year Selection Tests

#### Test 3.1: Default Year Load
**Steps:**
1. Open dashboard (no year parameter)
2. Check which year is selected

**Expected Result:** ✅ Current year (2026) loads by default

#### Test 3.2: Switch to Previous Year
**Steps:**
1. Select "2025" from dropdown
2. Wait for data to load

**Expected Result:**
- ✅ Data loads for 2025
- ✅ Charts update
- ✅ Tables show 2025 data
- ✅ Year display updates

#### Test 3.3: Switch to Old Year
**Steps:**
1. Select "2024" from dropdown
2. Wait for data to load

**Expected Result:**
- ✅ Data loads for 2024
- ✅ All visualizations update

#### Test 3.4: Form Switching Based on Year
**Steps:**
1. Login as admin
2. Select year 2026 → Check cheeti form (should be "Add New Member")
3. Select year 2025 → Check cheeti form (should be "Record Payment")

**Expected Result:**
- ✅ Form changes based on year context
- ✅ Current year: Add new member form
- ✅ Past year: Payment recording form

---

### 4️⃣ View Data Tests

#### Test 4.1: Metrics Display
**Steps:**
1. Select year 2026
2. Check all metric cards show values

**Expected Result:** ✅ All metrics display correctly:
- Total Donations
- Total Donors
- Total Expenses
- Net Balance
- Cheeti Members
- Cheeti Amount
- Estimated Collections
- Actual Collections

#### Test 4.2: Charts Render
**Steps:**
1. Scroll through dashboard
2. Verify all 5 charts load

**Expected Result:** ✅ Charts display:
1. Top Donors Bar Chart
2. Donation Distribution Pie Chart
3. Financial Report Bar Chart
4. Expenses Breakdown Pie Chart
5. Cheeti Analysis (if applicable)

#### Test 4.3: Donations Table
**Steps:**
1. Find "Donations Received" table
2. Check data displays

**Expected Result:**
- ✅ Table shows Sl.No, Name, Amount
- ✅ Data matches selected year

#### Test 4.4: Expenses Table
**Steps:**
1. Find "Expenses" table
2. Check data displays

**Expected Result:**
- ✅ Shows expense items and amounts
- ✅ Totals calculate correctly

#### Test 4.5: Cheeti Members Table
**Steps:**
1. Find "Cheeti Members" table
2. Check columns and data

**Expected Result:**
- ✅ Shows: Sl.No, Name, Amount, Interest, Total
- ✅ Data matches selected year

#### Test 4.6: Cheeti Paid Dashboard (Admin Only)
**Steps:**
1. Login as admin
2. Scroll to "Cheeti Paid Dashboard"
3. Check payment tracking table

**Expected Result:**
- ✅ Table shows with Edit/Save buttons
- ✅ Non-admin: table not visible

---

### 5️⃣ Admin - Donations Tests

#### Test 5.1: Add Donation (Valid)
**Steps:**
1. Login as admin
2. Select year 2026
3. Click "Donations" in admin panel
4. Enter: Name = "Test Donor", Amount = 5000
5. Click "Add Donation"

**Expected Result:**
- ✅ Success message shows
- ✅ Donation appears in table
- ✅ Metrics update
- ✅ Charts refresh
- ✅ Form clears

#### Test 5.2: Add Donation (Missing Data)
**Steps:**
1. Login as admin
2. Leave name empty, enter amount
3. Click "Add Donation"

**Expected Result:**
- ❌ Error: "Please enter donor name"
- ❌ Data not added

#### Test 5.3: Add Multiple Donations
**Steps:**
1. Add 3 donations in sequence
2. Check each appears

**Expected Result:**
- ✅ All donations added
- ✅ Sl.No increments correctly
- ✅ Total updates after each

---

### 6️⃣ Admin - Cheeti (Current Year) Tests

#### Test 6.1: Add New Cheeti Member (Valid)
**Steps:**
1. Login as admin
2. Select year 2026
3. Enter: Name = "Test Member", Amount = 27600
4. Click "Add Cheeti Member"

**Expected Result:**
- ✅ Success message
- ✅ Member added with auto-calculated interest
- ✅ Total = Amount + Interest
- ✅ Appears in cheeti table

#### Test 6.2: Add Cheeti Member (Missing Data)
**Steps:**
1. Leave name empty, enter amount
2. Click "Add Cheeti Member"

**Expected Result:**
- ❌ Error: "Please enter all fields"

#### Test 6.3: Auto-Calculate Interest
**Steps:**
1. Enter Amount: 27600
2. Check Interest field calculates (12% = 3312)

**Expected Result:** ✅ Interest = 3312, Total = 30912

#### Test 6.4: Form Shows for Current Year Only
**Steps:**
1. Select year 2025 (past year)
2. Check form changes to payment recording

**Expected Result:**
- ✅ "Add New Member" form hidden
- ✅ "Record Payment" form shown

---

### 7️⃣ Admin - Cheeti (Past Year) Tests

#### Test 7.1: Member Dropdown Populates
**Steps:**
1. Login as admin
2. Select year 2025
3. Check member dropdown in payment form

**Expected Result:**
- ✅ Dropdown shows all 2025 members
- ✅ Format: "Sl.No - Member Name"

#### Test 7.2: Load Member Details
**Steps:**
1. Select a member from dropdown
2. Check details display below

**Expected Result:**
- ✅ Shows Principal, Interest, Total Due
- ✅ Values match member data

#### Test 7.3: Record Payment (Valid)
**Steps:**
1. Select member
2. Enter Payment Date: 2026-04-01
3. Enter Late Fee: 500
4. Check "Paid" checkbox
5. Click "Record Payment"

**Expected Result:**
- ✅ Success message
- ✅ Payment recorded in 2025 data
- ✅ Added to 2026 income (cross-year tracking)
- ✅ Form clears

#### Test 7.4: Record Payment (Missing Data)
**Steps:**
1. Select member, leave date empty
2. Click "Record Payment"

**Expected Result:**
- ❌ Error: "Please enter payment date"

#### Test 7.5: Late Fee Adds to Total
**Steps:**
1. Member total due: ₹30,912
2. Add late fee: ₹500
3. Record payment

**Expected Result:**
- ✅ Total collected: ₹31,412
- ✅ Added to 2026 income

---

### 8️⃣ Admin - Expenses Tests

#### Test 8.1: Add Expense (Valid)
**Steps:**
1. Login as admin
2. Enter: Item = "Test Expense", Amount = 1000
3. Click "Add Expense"

**Expected Result:**
- ✅ Success message
- ✅ Expense added to table
- ✅ Metrics update

#### Test 8.2: Add Expense (Missing Data)
**Steps:**
1. Leave item empty, enter amount
2. Click "Add Expense"

**Expected Result:**
- ❌ Error: "Please enter all fields"

#### Test 8.3: Multiple Expenses Total
**Steps:**
1. Add 3 expenses
2. Check total calculates correctly

**Expected Result:** ✅ Total expenses sum correctly

---

### 9️⃣ Session Management Tests

#### Test 9.1: Session Persists on Refresh
**Steps:**
1. Login as admin
2. Refresh page (F5)
3. Check if still logged in

**Expected Result:**
- ✅ Admin panel still visible
- ✅ No login modal shown
- ✅ Session restored from sessionStorage

#### Test 9.2: Session Expires After 24 Hours
**Steps:**
1. Login as admin
2. Manually set session timestamp to >24 hours ago (browser console):
   ```javascript
   sessionStorage.setItem('adminSessionTime', Date.now() - 25*60*60*1000);
   ```
3. Refresh page

**Expected Result:**
- ❌ Session expired
- ❌ Login modal appears

#### Test 9.3: Unsaved Data Warning
**Steps:**
1. Login as admin
2. Start filling a form (don't submit)
3. Click "Logout"

**Expected Result:**
- ⚠️ Custom warning modal appears
- ⚠️ "You have unsaved changes" message
- ⚠️ Cancel and Logout buttons

---

### 🔟 Year Initialization Tests

#### Test 10.1: Missing Year Warning
**Steps:**
1. Edit dashboard-config.js, modify START_YEAR or wait for next year:
   ```javascript
   START_YEAR: 2021,  // Years 2021-2026 will be available (if current year is 2026)
   ```
2. To test future year (2027), the year must naturally arrive since AVAILABLE_YEARS only shows START_YEAR to current year

**Expected Result:**
- ⚠️ New years automatically appear when the calendar year changes
- ⚠️ If a new year's data file doesn't exist: "Year 2027 Not Initialized" warning shows
- ⚠️ If admin: Initialize button visible
- ⚠️ If not admin: Contact admin message

**Note:** To manually test initialization for 2027, you would need to modify the AVAILABLE_YEARS getter to artificially include currentYear + 1.

#### Test 10.2: Initialize New Year
**Steps:**
1. Login as admin
2. Select uninitialized year (2027)
3. Click "Initialize Year 2027"
4. Wait for file download

**Expected Result:**
- ✅ donations-2027.json downloads
- ✅ Includes estimated collections from 2026
- ✅ Empty data structure created
- ⚠️ Manual: Save file to data/ folder

#### Test 10.3: Estimated Collections Calculation
**Steps:**
1. Check 2026 has 2 cheeti members (₹30,912 each)
2. Initialize 2027
3. Check estimated collections in downloaded file

**Expected Result:**
- ✅ Estimated = 2 × ₹30,912 = ₹61,824
- ✅ Shows in report as "Estimated Cheeti Collections (2026)"

---

### 1️⃣1️⃣ Responsive Design Tests

#### Test 11.1: Mobile View
**Steps:**
1. Open browser DevTools (F12)
2. Toggle device toolbar (mobile view)
3. Test iPhone 12 Pro size
4. Navigate through dashboard

**Expected Result:**
- ✅ Admin panel adapts to mobile
- ✅ Charts resize properly
- ✅ Tables scroll horizontally
- ✅ All buttons accessible

#### Test 11.2: Tablet View
**Steps:**
1. Test iPad view (768px width)
2. Check layout adapts

**Expected Result:**
- ✅ Two-column to single-column layout
- ✅ Admin panel adjusts width
- ✅ Forms remain usable

---

### 1️⃣2️⃣ Edge Cases Tests

#### Test 12.1: Zero Data Year
**Steps:**
1. Create empty year file (all arrays empty)
2. Load that year

**Expected Result:**
- ✅ Dashboard loads without errors
- ✅ Shows "No data available" messages
- ✅ Charts show empty state

#### Test 12.2: Large Numbers
**Steps:**
1. Add donation with amount: 1,00,00,000 (1 crore)
2. Check formatting

**Expected Result:**
- ✅ Number formatted with commas
- ✅ Display: ₹1,00,00,000
- ✅ Calculations correct

#### Test 12.3: Special Characters in Names
**Steps:**
1. Add donor: "Test & Co. (Pvt.) Ltd."
2. Check displays correctly

**Expected Result:**
- ✅ Name displays without issues
- ✅ No HTML encoding problems

#### Test 12.4: Concurrent Admin Actions
**Steps:**
1. Add donation
2. Immediately add cheeti member
3. Immediately add expense

**Expected Result:**
- ✅ All actions process correctly
- ✅ No data loss
- ✅ UI updates properly

---

## 🎯 Test Execution Summary

### Quick Test (15 minutes)
✅ Must-Run Tests:
- Authentication (2.2)
- Year Selection (3.4)
- Add Donation (5.1)
- Add Cheeti Member (6.1)
- Record Payment (7.3)
- Session Persistence (9.1)

### Full Test (45 minutes)
Run all 46 test cases systematically

### Critical Path (Priority High)
- Tests marked "High" priority (32 tests)

---

## 📊 Test Results Template

```
Date: ___________
Tester: __________
Environment: TEST MODE (Local)

| Test # | Description | Status | Notes |
|--------|-------------|--------|-------|
| 1.1 | Welcome Page | ☐ Pass ☐ Fail | |
| 1.2 | Navigation | ☐ Pass ☐ Fail | |
... (continue for all tests)

Summary:
- Total Tests: 46
- Passed: __
- Failed: __
- Blocked: __
- Pass Rate: ___%
```

---

## 🐛 Known Issues / Limitations

1. **TEST MODE**: Cannot actually save files (downloads JSON instead)
2. **Cross-Year Income**: Displays in console, needs manual file save
3. **Session Storage**: Clears on browser close
4. **GitHub API**: Not tested in TEST_MODE

---

## 🚀 Next Steps After Testing

1. ✅ Fix any failed tests
2. ✅ Document issues found
3. ✅ Test in production mode (with GitHub API)
4. ✅ Deploy to live environment
5. ✅ User acceptance testing

---

**Test Environment Details:**
- Mode: TEST_MODE = true
- Server: http://localhost:8001
- Data: Local JSON files
- Auth: vinayaka2026
- Browser: Latest Chrome/Safari

**Last Updated**: April 7, 2026
