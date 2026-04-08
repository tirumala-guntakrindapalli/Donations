# Draft Mode System - Complete Documentation

## Overview

The Draft Mode system provides a sophisticated change tracking and batch publishing mechanism for admin operations. All changes are tracked in memory with smart consolidation logic before being committed to GitHub in a single batch.

---

## Core Features

### ✅ Smart Change Tracking

All admin operations are tracked with intelligent consolidation:

1. **Add + Edit Same Item** → Single Addition (with final values)
2. **Add + Delete Same Item** → Both cancel out (0 changes)
3. **Edit + Edit Same Item** → Single Edit (keeps original old values)
4. **Delete + Add Same Item** → Converts to Edit
5. **Edit + Delete Same Item** → Removes edit, keeps delete
6. **Multiple Visibility Toggles** → Shows final state only
7. **Toggle Back to Original** → Cancels change entirely

### ✅ Batch Publishing

- All changes saved in memory
- Single commit when publishing
- Detailed preview before committing
- Automatic change summary in commit message
- Format: `[Dashboard Bot] 📦 Batch update: X added, Y edited, Z deleted [skip ci]`

### ✅ Year Switching Protection

- Prevents switching years with unpublished changes
- Custom confirmation modal with options:
  - **Publish & Switch** - Save changes then switch
  - **Discard & Switch** - Abandon changes and switch
  - **Cancel** - Stay on current year

---

## Tracked Operations

### Current Year Data (Draft Mode)

All these operations require "Publish All":

| Category | Add | Edit | Delete |
|----------|-----|------|--------|
| Donations | ✅ | ✅ | ✅ |
| Expenses | ✅ | ✅ | ✅ |
| Cheetis | ✅ | ✅ | ✅ |
| Sponsors | ✅ | ✅ | ✅ |
| Laddu Winners | ✅ | ✅ | ✅ |
| Committee Members | ✅ | ❌ | ✅ |
| Dashboard Visibility | ✅ (toggle) | N/A | N/A |

### Other Years (Immediate Save)

- **Other years' visibility toggles** - Saves immediately to different year files
- Reason: Avoids complexity of cross-file updates in draft mode

---

## Business Logic Validations

### Duplicate Prevention

**Donations:**
- ✅ No duplicate names (case-insensitive)

**Expenses:**
- ✅ No duplicate items (case-insensitive)

**Cheetis:**
- ✅ No duplicate names (case-insensitive)

**Sponsors:**
- ✅ No duplicate name+type combination (case-insensitive)
- Error: "Sponsor '{name}' with type '{type}' already exists"

**Committee Members:**
- ✅ No duplicate names (case-insensitive)

### Quantity Restrictions

**Laddu Winners:**
- ✅ Maximum one winner at a time
- Error: "A laddu winner already exists. Only one winner allowed. Please delete existing first."

---

## Implementation Details

### Global Variables

```javascript
let draftMode = false;              // Enabled in production (not TEST_MODE)
let unpublishedChanges = [];        // Array of tracked changes
let originalData = null;            // Snapshot for discard/comparison
```

### Change Tracking Structure

```javascript
{
    timestamp: "2025-04-08T10:30:00Z",
    action: "add|edit|delete|toggle_visibility",
    category: "donation|expense|cheeti|sponsor|committee|laddu|year_visibility",
    details: {
        // For ADD: { name, amount, ... }
        // For EDIT: { old: {...}, new: {...}, index: N }
        // For DELETE: { index: N, item: {...} }
        // For VISIBILITY: { year: 2025, enabled: true }
    }
}
```

### Smart Consolidation Logic

#### Item Key Generation

Each item has a unique key based on category:

```javascript
const getItemKey = (category, details) => {
    // Handle wrapped format from delete: { index, item: {...} }
    const actualItem = (details.item && typeof details.item === 'object') 
        ? details.item 
        : details;
    
    switch(category) {
        case 'donation':
        case 'cheeti':
            return `${actualItem.name}-${actualItem.amount}`;
        
        case 'expense':
            return `${actualItem.item}-${actualItem.amount}`;
        
        case 'sponsor':
            return `${actualItem.name}-${actualItem.type}`;
        
        case 'committee':
        case 'laddu':
            return actualItem.name;
    }
}
```

#### Consolidation Rules

**1. Add + Delete (Same Item)**
```javascript
if (action === 'delete') {
    const addIndex = unpublishedChanges.findIndex(c => 
        c.action === 'add' && 
        c.category === category && 
        getItemKey(category, c.details) === itemKey
    );
    
    if (addIndex !== -1) {
        unpublishedChanges.splice(addIndex, 1);  // Cancel both
        return;
    }
}
```

**2. Add + Edit (Same Item)**
```javascript
if (action === 'edit') {
    const addIndex = unpublishedChanges.findIndex(c => 
        c.action === 'add' && 
        c.category === category && 
        getItemKey(category, c.details) === getItemKey(category, details.old)
    );
    
    if (addIndex !== -1) {
        // Update ADD with new values (stays as ADD, not separate EDIT)
        unpublishedChanges[addIndex].details = details.new;
        return;
    }
}
```

**3. Edit + Edit (Same Item)**
```javascript
if (action === 'edit') {
    const existingEditIndex = unpublishedChanges.findIndex(c => 
        c.action === 'edit' && 
        c.category === category && 
        c.details.index === details.index
    );
    
    if (existingEditIndex !== -1) {
        // Keep original OLD values, update NEW values
        unpublishedChanges[existingEditIndex].details.new = details.new;
        return;
    }
}
```

**4. Delete + Add (Same Item)**
```javascript
if (action === 'add') {
    const deleteIndex = unpublishedChanges.findIndex(c => 
        c.action === 'delete' && 
        c.category === category && 
        getItemKey(category, c.details) === itemKey
    );
    
    if (deleteIndex !== -1) {
        // Convert to EDIT
        const deletedEntry = unpublishedChanges[deleteIndex];
        unpublishedChanges.splice(deleteIndex, 1);
        
        trackChange('edit', category, {
            old: deletedEntry.details.item,
            new: details,
            index: deletedEntry.details.index
        });
        return;
    }
}
```

**5. Visibility Toggle Consolidation**
```javascript
if (action === 'toggle_visibility' && category === 'year_visibility') {
    const year = details.year;
    const newState = details.enabled;
    
    const existingToggleIndex = unpublishedChanges.findIndex(c => 
        c.action === 'toggle_visibility' && 
        c.category === 'year_visibility' && 
        c.details.year === year
    );
    
    if (existingToggleIndex !== -1) {
        const originalState = originalData.settings?.dashboard_enabled === true;
        
        // If back to original, cancel change
        if (newState === originalState) {
            unpublishedChanges.splice(existingToggleIndex, 1);
            return;
        }
        
        // Otherwise update to new state
        unpublishedChanges[existingToggleIndex].details.enabled = newState;
        return;
    }
}
```

---

## Critical Bug Fixes

### 1. Object Reference Issue

**Problem:** When adding items, we were storing references to objects that could be modified later.

**Before (Broken):**
```javascript
const newExpense = { item, amount };
currentData.expenses.push(newExpense);
trackChange('add', 'expense', newExpense);  // ❌ Reference to same object
```

**After (Fixed):**
```javascript
const newExpense = { item, amount };
currentData.expenses.push(newExpense);
trackChange('add', 'expense', { item, amount });  // ✅ New object copy
```

**Impact:** Without this fix, editing a newly added item would break add+edit consolidation because the ADD entry's values would change too.

### 2. getItemKey Unwrapping

**Problem:** DELETE wraps items `{ index, item: {...} }` but ADD uses direct format `{item, amount}`.

**Solution:**
```javascript
const actualItem = (details.item && typeof details.item === 'object') 
    ? details.item   // Unwrap delete format
    : details;       // Use direct format (add/edit)
```

This ensures both formats generate the same key for matching.

### 3. Expense Key Pattern

**Problem:** Expenses initially used only `item` as key, unlike donations which used `name-amount`.

**Fixed:** Changed to `${item}-${amount}` for consistency with donations, enabling proper add+edit consolidation.

---

## User Interface

### Draft Mode Banner

```html
<div id="draftModeBanner" style="display: none;">
    <div class="draft-controls">
        <span id="draftModeInfo">
            <i class="fas fa-edit"></i>
            <span id="draftChangeCount">0</span> Unpublished Changes
        </span>
        <button id="publishAllBtn" onclick="publishAllChanges()">
            <i class="fas fa-cloud-upload-alt"></i> Publish All
        </button>
        <button id="discardChangesBtn" onclick="discardDraftChanges()">
            <i class="fas fa-undo"></i> Discard
        </button>
    </div>
</div>
```

### Year Switch Protection Modal

Custom modal appears when switching years with unpublished changes:

- **Title:** "⚠️ Unpublished Changes"
- **Message:** Shows number of unpublished changes
- **Actions:**
  - **Publish & Switch** (green) - Saves then switches
  - **Discard & Switch** (orange) - Abandons then switches
  - **Cancel** (gray) - Stays on current year

### Publish Preview Modal

Shows detailed preview of all changes grouped by action type:

```
📦 5 Changes Ready to Publish

➕ ADDITIONS (2)
💰 Donation: John Doe - ₹5000
💸 Expense: Decorations - ₹2000

✏️ EDITS (2)
💰 Donation: Jane Smith - ₹2000 → ₹3000
💸 Expense: Sound System - ₹5000 → ₹6000

🗑️ DELETIONS (1)
💰 Donation: Old Entry - ₹1000
```

---

## Key Functions

### trackChange(action, category, details)

Records a change and applies smart consolidation logic.

**Parameters:**
- `action` - 'add', 'edit', 'delete', or 'toggle_visibility'
- `category` - Data category (donation, expense, etc.)
- `details` - Change details (varies by action)

**Returns:** Nothing (updates global `unpublishedChanges` array)

### publishAllChanges()

Shows preview and publishes all changes in single commit.

**Flow:**
1. Generate preview with all changes
2. Show custom confirmation modal
3. If confirmed: Save to GitHub with summary
4. Clear draft state
5. Update UI

### discardDraftChanges()

Reverts all unpublished changes.

**Flow:**
1. Restore `currentData` from `originalData` snapshot
2. Clear `unpublishedChanges` array
3. Refresh UI
4. Update draft banner

### updateDraftModeUI()

Updates the draft mode banner visibility and counter.

**Logic:**
- Shows banner if `draftMode` enabled and changes exist
- Updates counter badge
- Hides if no changes

---

## Testing Scenarios

### Scenario 1: Add + Edit + Delete Cycle

**Steps:**
1. Add expense "Test1" - ₹100
2. Edit to ₹200
3. Delete it

**Expected:**
- After step 1: 1 addition
- After step 2: 1 addition (₹200) - consolidated
- After step 3: 0 changes - cancelled out

### Scenario 2: Multiple Edits

**Steps:**
1. Edit existing donation ₹1000 → ₹2000
2. Edit same donation ₹2000 → ₹3000

**Expected:**
- Only 1 edit showing: ₹1000 → ₹3000 (consolidated)

### Scenario 3: Visibility Toggle

**Steps:**
1. Toggle dashboard OFF (was ON)
2. Toggle dashboard ON
3. Toggle dashboard OFF

**Expected:**
- Final state: 1 visibility change showing OFF

### Scenario 4: Year Switch Protection

**Steps:**
1. Make 3 changes
2. Try to switch to 2024
3. See warning modal

**Expected:**
- Modal shows "3 Unpublished Changes"
- Can choose to publish, discard, or cancel

---

## Limitations

### What's NOT in Draft Mode

1. **Other years' visibility** - Immediately saves to those year files
2. **Committee member edits** - No edit functionality yet
3. **File uploads** - Not applicable to draft mode

### Known Constraints

1. **Refresh loses draft** - Changes only in memory, not localStorage
2. **No partial publish** - All-or-nothing batch commit
3. **No change ordering** - Preview shows grouped by action, not chronological

---

## Future Enhancements

### Potential Improvements

1. **Draft Persistence**
   - Save to localStorage
   - Survive page refreshes
   - Auto-recovery on crashes

2. **Change History View**
   - Timeline of changes
   - Ability to undo specific change
   - Reorder changes before publish

3. **Partial Publishing**
   - Select specific changes to publish
   - Stage/unstage mechanism
   - Multiple draft branches

4. **Collaborative Editing**
   - Conflict detection
   - Merge strategies
   - Real-time notifications

5. **Advanced Operations**
   - Bulk operations
   - Import/export drafts
   - Change templates

---

## Performance Considerations

### Memory Usage

- Each change: ~100-200 bytes
- 100 changes: ~20KB
- No practical limit for typical usage

### Consolidation Efficiency

- O(n) search for matching changes
- Typical case: <10 changes = negligible
- Worst case: 100 changes = <10ms

### UI Updates

- Batch updates minimize reflows
- Draft banner toggles don't refresh tables
- Preview generation: O(n) over changes

---

## Maintenance Notes

### Adding New Categories

To add draft tracking for a new category:

1. **Add tracking call:**
   ```javascript
   trackChange('add', 'new_category', { data });
   ```

2. **Add to getItemKey():**
   ```javascript
   if (cat === 'new_category') return item.uniqueField;
   ```

3. **Add to preview formatter:**
   ```javascript
   case 'new_category':
       return formatNewCategory(details);
   ```

4. **Add icon to getCategoryIcon():**
   ```javascript
   'new_category': '🆕'
   ```

### Debugging Tips

**Enable console logging:**
```javascript
console.log('Tracking:', action, category, details);
console.log('Current changes:', unpublishedChanges);
```

**Check consolidation:**
```javascript
// Add debug logging in trackChange() before returns
console.log('Consolidated:', action, 'with existing change');
```

---

## Summary

The Draft Mode system provides:
- ✅ Intelligent change tracking with automatic consolidation
- ✅ Batch publishing with detailed preview
- ✅ Year switching protection
- ✅ Business logic validations
- ✅ Clean commit history with skip CI
- ✅ Excellent admin UX with rollback capability

All main operations follow the principle: **Track in memory → Consolidate intelligently → Publish once**

---

**Version:** 2.0  
**Last Updated:** April 8, 2026  
**Author:** GitHub Copilot Agent
