# Year Initialization Guide

## 📅 How Year Management Works

The dashboard automatically manages years based on the current date. Available years are:
- **Current Year** (e.g., 2026)
- **Previous Year** (e.g., 2025)  
- **Two Years Ago** (e.g., 2024)

## 💰 Cheeti Cycle System

**Important**: Cheeti members follow a strict 1-year cycle:

- **2025 Cheeti Members** → Pay in **2026** (no exceptions)
- **2026 Cheeti Members** → Pay in **2027** (no exceptions)
- **2027 Cheeti Members** → Pay in **2028** (no exceptions)

This means:
- ✅ All members from Year N are **expected** to pay in Year N+1
- ❌ No "carry forward" of unpaid members
- 📊 Year 2026 income estimates are based on 2025 members

## 🆕 Creating a New Year

### Scenario: Year 2027 Begins

When January 1, 2027 arrives, the system will automatically:
1. Add **2027** to the year dropdown (Current Year)
2. Show **2026, 2025** as previous years
3. Remove **2024** from the dropdown (older than 2 years)

### First Time Loading 2027

When you first select year **2027**, you'll see:

```
⚠️ Year 2027 Not Initialized

The data file for year 2027 does not exist yet.
```

### Initialize New Year

Click **"Initialize Year 2027"**

This creates: `data/donations-2027.json` with:
- Empty donations array
- Empty cheeti members array (for 2027 loans)
- Empty expenses array
- **Estimated collections from 2026 cheeti members**
- Zero actual income/expenses

**Expected Collections**: The system automatically calculates how much income is expected from 2026 cheeti members who should pay in 2027.

## 📊 Estimated vs Actual Collections

### In Year 2026 Dashboard:

**Estimated Collections (from 2025)**
- Shows expected income from all 2025 cheeti members
- Calculated as: `Sum of (Amount + Interest)` for each 2025 member
- Example: 46 members × ₹30,912 = ₹1,421,952

**Actual Collections**
- Shows real payments received in 2026
- Updates as you record payments from 2025 members
- Should eventually match estimated (if everyone pays on time)

## 🔄 What Data is Calculated on Initialization?

### ✅ Automatically Calculated:
- **Estimated Cheeti Collections**: Based on previous year's members
- Expected payment details (name, amount, interest)
- Income estimates in financial report

### ❌ Start Empty:
- Donations (collected fresh in current year)
- Cheeti members (new loans given in current year)
- Expenses (spent in current year)
- Actual collections (recorded as payments come in)

## 💾 File Download Process (TEST MODE)

In TEST MODE, the system cannot automatically create files. Instead:

1. Click **"Initialize Year 2027"**
2. A file named `donations-2027.json` will automatically download
3. **Save this file to**: `data/donations-2027.json`
4. Refresh the dashboard
5. Year 2027 data will now load with estimated collections!

## 📊 Example: 2025 → 2026 Transition

### 2025 Data (Cheeti Members):
```json
{
  "year": "2025",
  "cheeti": [
    {
      "name": "Member A",
      "amount": 27600,
      "interest": 3312,
      "total": 30912
    },
    {
      "name": "Member B", 
      "amount": 27600,
      "interest": 3312,
      "total": 30912
    }
  ]
}
```

### 2026 Initialized:
```json
{
  "year": "2026",
  "cheeti": [],
  "cheeti_expected": [
    {
      "name": "Member A",
      "amount": 27600,
      "interest": 3312,
      "expectedTotal": 30912,
      "fromYear": 2025
    },
    {
      "name": "Member B",
      "amount": 27600,
      "interest": 3312,
      "expectedTotal": 30912,
      "fromYear": 2025
    }
  ],
  "report": [
    {
      "category": "Estimated Cheeti Collections (2025)",
      "amount": 61824,
      "type": "income_estimated"
    },
    {
      "category": "Actual Cheeti Collections",
      "amount": 0,
      "type": "income"
    }
  ]
}
```

**Expected Income for 2026**: ₹61,824 (from 2025 members)

## 🎯 Best Practices

### At Year End (December):
1. ✅ Finalize all current year data
2. ✅ Record as many payments as possible
3. ✅ Close books for the year

### At Year Start (January):
1. ✅ Select new year from dropdown
2. ✅ Click **"Initialize Year"**
3. ✅ Download and save the JSON file
4. ✅ Review estimated collections from previous year
5. ✅ Start recording new donations, expenses, and cheeti members

### Throughout the Year:
- **Previous Year Tab**: Record payments from last year's members
- **Current Year Tab**: Add new cheeti members, donations, expenses
- **Monitor Progress**: Compare estimated vs actual collections

## 🛠️ Technical Details

### Year Calculation
```javascript
const currentYear = new Date().getFullYear(); // 2027
const availableYears = [
    currentYear - 2, // 2025
    currentYear - 1, // 2026  
    currentYear      // 2027
];
```

### Estimated Collections Formula
```javascript
// For Year 2027, calculate from 2026 cheeti members
estimatedCollections = 2026_cheeti_members.reduce((total, member) => {
    return total + member.amount + member.interest;
}, 0);
```

### File Naming Convention
- Pattern: `donations-{YEAR}.json`
- Example: `donations-2027.json`
- Location: `data/` folder

### Data Structure
Every year file must have:
```json
{
  "year": "YYYY",
  "lastUpdated": "ISO-8601 Date",
  "donations": [],
  "cheeti": [],
  "cheeti_collections": [],
  "cheeti_expected": [],
  "expenses": [],
  "report": []
}
```

## ❓ FAQ

### Q: What happens to 2024 data when 2027 starts?
**A**: It's not deleted, just removed from the dropdown. The file `donations-2024.json` remains in the `data/` folder for historical records.

### Q: Do all 2025 members have to pay in 2026?
**A**: Yes! This is a **strict 1-year cycle**. All 2025 members are expected to pay back in 2026. No carry-forward.

### Q: What if a 2025 member doesn't pay in 2026?
**A**: They're still tracked in the 2026 "Expected Collections" list. You can record late fees when they eventually pay.

### Q: Can I manually create the year file?
**A**: Yes! Copy the structure from an existing year file, update the year, and calculate estimated collections manually.

### Q: How is estimated income calculated?
**A**: `Sum of (Principal + Interest)` for ALL previous year cheeti members. Example: If 2025 has 46 members with ₹30,912 each, 2026 estimated = ₹1,421,952.

### Q: What if I forget to initialize?
**A**: No problem! The system will show a friendly warning with an initialization button whenever you select an uninitialized year.

### Q: Can non-admins initialize a year?
**A**: No, only logged-in admins can initialize years. Regular users will see a message to contact the administrator.

## 🚀 Quick Start Checklist

- [ ] Year changes (e.g., 2027 begins)
- [ ] Login as admin
- [ ] Select new year from dropdown
- [ ] See "Year Not Initialized" warning
- [ ] Click **"Initialize Year 2027"**
- [ ] Download the JSON file
- [ ] Save to `data/donations-2027.json`
- [ ] Refresh dashboard
- [ ] Verify estimated collections from 2026
- [ ] Start adding 2027 data!

## 📈 Payment Recording Workflow

### For Current Year (2026)
**Add NEW cheeti members who will pay in 2027**
- Go to Admin Panel
- Add member name and amount
- They're automatically added to 2026 cheeti list
- They become 2027's "expected collections"

### For Previous Year (2025)
**Record payments FROM 2025 members**
- Select year 2025 from dropdown
- Login as admin
- Select member from dropdown
- Record payment date, late fee (if any)
- Mark as "Paid"
- This adds to 2026's actual collections

---

**Last Updated**: April 2026  
**Version**: 2.0
**Cycle System**: Fixed 1-Year Cycle (No Carry Forward)
