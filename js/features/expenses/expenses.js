/**
 * Expenses Feature Module
 * Handles all expense-related operations (CRUD)
 */

/**
 * Add a new expense
 * Validates for duplicates and required fields
 */
function addExpense() {
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const item = document.getElementById('expenseItem').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    
    if (!item || !amount || amount <= 0) {
        showError('Please enter valid item and amount');
        return;
    }
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    // Check for duplicate item name (case-insensitive)
    if (!currentData.expenses) currentData.expenses = [];
    
    const duplicate = currentData.expenses.find(e => 
        e.item.toLowerCase() === item.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Expense item "${item}" already exists. Duplicate items not allowed.`);
        return;
    }
    
    const newExpense = {
        item: item,
        amount: amount
    };
    
    currentData.expenses.push(newExpense);
    
    // Update state
    if (window.DashboardState) {
        window.DashboardState.setCurrentData(currentData);
    } else {
        window.currentData = currentData;
    }
    
    // Track change for draft mode (use a new object to avoid reference issues)
    trackChange('add', 'expense', { item, amount });
    
    // Clear form
    document.getElementById('expenseItem').value = '';
    document.getElementById('expenseAmount').value = '';
    
    // Process data to update UI
    if (typeof processData === 'function') {
        processData();
    }
    
    showSuccess('✅ Expense added successfully!');
}

/**
 * Edit expense entry (inline editing)
 * @param {number} index - Index of expense to edit
 */
function editExpenseEntry(index) {
    const row = document.getElementById(`expense-row-${index}`);
    if (!row) return;
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const expense = currentData.expenses[index];
    if (!expense) return;
    
    // Replace cells with input fields
    row.querySelector('.item-cell').innerHTML = `
        <input type="text" class="edit-input" id="edit-expense-item-${index}" 
               value="${expense.item}" style="width: 100%;">
    `;
    
    row.querySelector('.amount-cell').innerHTML = `
        <input type="number" class="edit-input" id="edit-expense-amount-${index}" 
               value="${expense.amount}" min="0" step="1" style="width: 100%;">
    `;
    
    // Replace action button
    row.querySelector('td:last-child').innerHTML = `
        <button class="action-btn save" onclick="saveExpenseEntry(${index})">
            <i class="fas fa-save"></i> Save
        </button>
        <button class="action-btn cancel" onclick="cancelExpenseEdit()">
            <i class="fas fa-times"></i> Cancel
        </button>
    `;
}

/**
 * Save edited expense entry
 * @param {number} index - Index of expense being saved
 */
function saveExpenseEntry(index) {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const expense = currentData.expenses[index];
    if (!expense) return;
    
    const itemInput = document.getElementById(`edit-expense-item-${index}`);
    const amountInput = document.getElementById(`edit-expense-amount-${index}`);
    
    if (!itemInput || !amountInput) return;
    
    const newItem = itemInput.value.trim();
    const newAmount = parseFloat(amountInput.value) || 0;
    
    if (!newItem || newAmount <= 0) {
        showError('⚠️ Please enter valid item and amount');
        return;
    }
    
    // Check for duplicate item (exclude current expense)
    const duplicate = currentData.expenses.find((e, i) => 
        i !== index && e.item.toLowerCase() === newItem.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Expense item "${newItem}" already exists. Duplicate items not allowed.`);
        return;
    }
    
    // Store original values for tracking
    const oldExpense = { item: expense.item, amount: expense.amount };
    
    // Update expense data
    expense.item = newItem;
    expense.amount = newAmount;
    
    // Update state
    if (window.DashboardState) {
        window.DashboardState.setCurrentData(currentData);
    } else {
        window.currentData = currentData;
    }
    
    // Track change for draft mode
    trackChange('edit', 'expense', {
        old: oldExpense,
        new: { item: newItem, amount: newAmount },
        index: index
    });
    
    // Refresh UI
    if (typeof processData === 'function') {
        processData();
    }
    
    showSuccess('✅ Expense updated successfully!');
}

/**
 * Save expense from edit modal
 * @param {number} index - Index of expense being saved
 */
function saveExpenseFromModal(index) {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const expense = currentData.expenses[index];
    if (!expense) return;
    
    const itemInput = document.getElementById('editItem');
    const amountInput = document.getElementById('editAmount');
    
    if (!itemInput || !amountInput) return;
    
    const newItem = itemInput.value.trim();
    const newAmount = parseFloat(amountInput.value) || 0;
    
    if (!newItem || newAmount <= 0) {
        showError('⚠️ Please enter valid item and amount');
        return;
    }
    
    // Check for duplicate item (exclude current expense)
    const duplicate = currentData.expenses.find((e, i) => 
        i !== index && e.item.toLowerCase() === newItem.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Expense item "${newItem}" already exists. Duplicate items not allowed.`);
        return;
    }
    
    // Store original values for tracking
    const oldExpense = { item: expense.item, amount: expense.amount };
    
    // Update expense data
    expense.item = newItem;
    expense.amount = newAmount;
    
    // Update state
    if (window.DashboardState) {
        window.DashboardState.setCurrentData(currentData);
    } else {
        window.currentData = currentData;
    }
    
    hideEditModal();
    
    // Track change for draft mode
    trackChange('edit', 'expense', {
        old: oldExpense,
        new: { item: newItem, amount: newAmount },
        index: index
    });
    
    // Refresh UI
    if (typeof processData === 'function') {
        processData();
    }
    
    showSuccess('✅ Expense updated successfully!');
}

/**
 * Cancel expense edit
 * Refreshes the expenses table to original state
 */
function cancelExpenseEdit() {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    if (typeof populateExpensesTable === 'function') {
        populateExpensesTable(currentData.expenses);
    }
}

/**
 * Validate expense data
 * @param {string} item - Expense item name
 * @param {number} amount - Expense amount
 * @param {number} excludeIndex - Index to exclude from duplicate check (for editing)
 * @returns {Object} Validation result {valid: boolean, error: string}
 */
function validateExpense(item, amount, excludeIndex = -1) {
    if (!item || item.trim().length === 0) {
        return { valid: false, error: 'Item name is required' };
    }
    
    if (!amount || amount <= 0) {
        return { valid: false, error: 'Amount must be greater than 0' };
    }
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    // Check for duplicate item
    const duplicate = currentData.expenses.find((e, i) => 
        i !== excludeIndex && e.item.toLowerCase() === item.toLowerCase()
    );
    
    if (duplicate) {
        return { valid: false, error: `Expense item "${item}" already exists` };
    }
    
    return { valid: true };
}

/**
 * Populate expenses table in detailed reports section
 * @param {Array} expensesData - Array of expense objects
 */
function populateExpensesTable(expensesData) {
    const tbody = document.querySelector('#expensesTable tbody');
    if (!tbody) {
        console.warn('⚠️ expensesTable tbody not found');
        return;
    }
    
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    const formatCurrency = window.formatCurrency || function(amount) {
        return '₹' + amount.toLocaleString('en-IN');
    };
    
    tbody.innerHTML = expensesData.map((e, index) => `
        <tr id="expense-row-${index}" data-index="${index}">
            <td>${e.item}</td>
            <td>${formatCurrency(e.amount)}</td>
            <td style="${isAdmin ? '' : 'display: none;'}">
                ${isAdmin ? `<div style="display: flex; gap: 6px; justify-content: center;"><button class="action-btn edit" onclick="showEditModal('expense', ${index})">
                    <i class="fas fa-edit"></i> Edit
                </button><button class="action-btn delete" onclick="deleteItem('expense', ${index}, '${e.item.replace(/'/g, "\\'")}')">
                    <i class="fas fa-trash"></i> Delete
                </button></div>` : ''}
            </td>
        </tr>
    `).join('');
    
    console.log(`✅ Expenses table populated with ${expensesData.length} entries`);
}

// Export for global access
if (typeof window !== 'undefined') {
    window.addExpense = addExpense;
    window.editExpenseEntry = editExpenseEntry;
    window.saveExpenseEntry = saveExpenseEntry;
    window.saveExpenseFromModal = saveExpenseFromModal;
    window.cancelExpenseEdit = cancelExpenseEdit;
    window.validateExpense = validateExpense;
    window.populateExpensesTable = populateExpensesTable;
}
