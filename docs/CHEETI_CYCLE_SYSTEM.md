# Cheeti Cycle System - Quick Reference

## 🔄 How the Cheeti Cycle Works

### **Strict 1-Year Payment Cycle**

```
Year 2025: Give ₹27,600 to members
           ↓
Year 2026: Members pay back ₹27,600 + ₹3,312 interest = ₹30,912
           ↓
Year 2026: Give ₹27,600 to NEW members  
           ↓
Year 2027: Those members pay back ₹30,912
```

### **NO Carry Forward System**
- ✅ All 2025 members **MUST** pay in 2026
- ✅ All 2026 members **MUST** pay in 2027
- ❌ No "unpaid members carry forward to next year"
- ❌ Payment cycle is FIXED (1 year only)

## 📊 Financial Planning

### Example: Year 2026 Dashboard

**Income:**
- **Estimated Cheeti Collections (from 2025)**: ₹1,224,160
  - Based on 46 members × ₹30,912 each
  - All 2025 members expected to pay in 2026
  
- **Actual Cheeti Collections**: ₹0 → Updates as payments are recorded
  - Tracks real payments received
  - Should eventually equal estimated (if everyone pays)

- **Donations**: ₹55,885
- **Membership**: ₹13,000

**Expenses:**
- Total: ₹32,000

**Net Balance**: Estimated Income - Expenses

## 🎯 Year Initialization Process

### When Year 2027 Begins:

1. **Select "2027" from dropdown** → Shows "Not Initialized" warning

2. **Click "Initialize Year 2027"** → System automatically:
   - Creates empty data structure
   - Loads 2026 cheeti members
   - Calculates estimated collections for 2027
   - Generates `donations-2027.json` file

3. **Expected Collections Calculation:**
   ```javascript
   // All 2026 cheeti members
   2027_estimated = sum of (amount + interest) from all 2026 members
   ```

4. **Download & Save:**
   - File downloads automatically
   - Save as: `data/donations-2027.json`
   - Refresh browser

## 📋 Two Types of Admin Actions

### 1. Current Year (2026) - Add New Cheeti Members
```
Purpose: Give loans in 2026 (to be paid in 2027)

Form Fields:
├── Member Name
├── Amount (₹27,600)
├── Interest (₹3,312)
└── Total (₹30,912)

Result: Added to 2026 cheeti array
        → Becomes 2027 estimated collections
```

### 2. Previous Year (2025) - Record Payments
```
Purpose: Record 2025 members paying back in 2026

Form Fields:
├── Select Member (dropdown from 2025 list)
├── Payment Date
├── Late Fee (if any)
└── Mark as "Paid" ✓

Result: 
├── Updates 2025 member status
├── Adds to 2026 actual collections
└── Updates 2026 income
```

## 💡 Key Concepts

### Estimated vs Actual Collections

| Type | Description | When It Updates |
|------|-------------|----------------|
| **Estimated** | Expected income based on previous year members | On year initialization |
| **Actual** | Real money collected | As payments are recorded |

### Data Flow Example

```
2025 File (donations-2025.json)
└── cheeti: [46 members]
    └── Each: ₹27,600 + ₹3,312 = ₹30,912

Initialize 2026
└── Creates: donations-2026.json
    ├── cheeti_expected: [46 members from 2025]
    └── report:
        ├── Estimated Collections: ₹1,421,952
        └── Actual Collections: ₹0

Record Payments in 2026
└── Select 2025 year
    └── Record each member payment
        └── Updates 2026 actual collections!
```

## 🎬 Complete Workflow

### Month: January 2027

**Step 1**: Initialize new year
- Select 2027 from dropdown
- Click "Initialize Year 2027"
- System calculates: 2026 had X members = ₹Y expected
- Download `donations-2027.json`
- Save to `data/` folder

**Step 2**: Track 2026 payments (throughout 2027)
- Switch to year 2026 view
- Select member from dropdown
- Record payment date, late fee
- Mark as paid
- → Automatically adds to 2027 actual income

**Step 3**: Add new 2027 members
- Switch to year 2027 view
- Add new members taking loans in 2027
- → These become 2028 expected collections

## ✅ Validation Checklist

**At Year End (Dec 2026):**
- [ ] All 2025 members paid? (Expected = Actual)
- [ ] If not, track who's pending
- [ ] Record late fees for delayed payments
- [ ] Finalize 2026 cheeti member list

**At Year Start (Jan 2027):**
- [ ] Initialize 2027
- [ ] Verify estimated collections from 2026
- [ ] Start fresh donations/expenses tracking
- [ ] Continue recording 2026 member payments

## 🔧 Technical References

### Data Structure
```json
{
  "year": "2026",
  "cheeti": [],                    // Current year loans
  "cheeti_expected": [],           // Expected payments (from previous year)
  "cheeti_collections": [],        // Actual payments tracking
  "report": [
    {
      "category": "Estimated Cheeti Collections (2025)",
      "amount": 1224160,
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

### Formulas
```javascript
// Estimated Collections for Year N
estimated_N = sum(year_N-1_cheeti[].amount + year_N-1_cheeti[].interest)

// When payment recorded
actual_collections_N += amount + interest + lateFee
```

---

## 📚 Related Documents
- [Year Initialization Guide](./YEAR_INITIALIZATION_GUIDE.md)
- [Admin Panel User Guide](./README.md)

**Last Updated**: April 2026  
**System Version**: 2.0 (Fixed Cycle)