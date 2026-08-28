/**
 * Donations Feature Module
 * Handles all donation-related operations (CRUD)
 */

/**
 * Add a new donation
 * Validates for duplicates and required fields
 */
function addDonation() {
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const name = document.getElementById('donationName').value.trim();
    const amount = parseFloat(document.getElementById('donationAmount').value);
    
    if (!name || !amount || amount <= 0) {
        showError('Please enter valid name and amount');
        return;
    }
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    // Check for duplicate name (case-insensitive)
    if (!currentData.donations) currentData.donations = [];
    
    const duplicate = currentData.donations.find(d => 
        d.name.toLowerCase() === name.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Donor "${name}" already exists. Duplicate names not allowed.`);
        return;
    }
    
    // Add new donation
    currentData.donations.push({
        slNo: currentData.donations.length + 1,
        name: name,
        amount: amount
    });
    
    // Update state
    if (window.DashboardState) {
        window.DashboardState.setCurrentData(currentData);
    } else {
        window.currentData = currentData;
    }
    
    // Track change for draft mode
    trackChange('add', 'donation', { name, amount });
    
    // Clear form
    document.getElementById('donationName').value = '';
    document.getElementById('donationAmount').value = '';
    
    // Reset unsaved data flag
    if (window.DashboardState) {
        window.DashboardState.setUnsavedData(false);
    } else {
        window.hasUnsavedData = false;
    }
    
    // Refresh UI to show new donation
    if (typeof processData === 'function') {
        processData();
    }
    
    showSuccess(`✅ Donation from ${name} added successfully!`);
}

/**
 * Edit donation entry (inline editing)
 * @param {number} index - Index of donation to edit
 */
function editDonorEntry(index) {
    const row = document.getElementById(`donor-row-${index}`);
    if (!row) return;
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const donor = currentData.donations[index];
    if (!donor) return;
    
    // Replace cells with input fields
    row.querySelector('.name-cell').innerHTML = `
        <input type="text" class="edit-input" id="edit-donor-name-${index}" 
               value="${donor.name}" style="width: 100%;">
    `;
    
    row.querySelector('.amount-cell').innerHTML = `
        <input type="number" class="edit-input" id="edit-donor-amount-${index}" 
               value="${donor.amount}" min="0" step="1" style="width: 100%;">
    `;
    
    // Replace action button
    row.querySelector('td:last-child').innerHTML = `
        <button class="action-btn save" onclick="saveDonorEntry(${index})">
            <i class="fas fa-save"></i> Save
        </button>
        <button class="action-btn cancel" onclick="cancelDonorEdit()">
            <i class="fas fa-times"></i> Cancel
        </button>
    `;
}

/**
 * Save edited donation entry
 * @param {number} index - Index of donation being saved
 */
function saveDonorEntry(index) {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const donor = currentData.donations[index];
    if (!donor) return;
    
    const nameInput = document.getElementById(`edit-donor-name-${index}`);
    const amountInput = document.getElementById(`edit-donor-amount-${index}`);
    
    if (!nameInput || !amountInput) return;
    
    const newName = nameInput.value.trim();
    const newAmount = parseFloat(amountInput.value) || 0;
    
    if (!newName || newAmount <= 0) {
        showError('⚠️ Please enter valid name and amount');
        return;
    }
    
    // Check for duplicate name (exclude current donor)
    const duplicate = currentData.donations.find((d, i) => 
        i !== index && d.name.toLowerCase() === newName.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Donor "${newName}" already exists. Duplicate names not allowed.`);
        return;
    }
    
    // Store original values for tracking
    const oldDonor = { name: donor.name, amount: donor.amount };
    
    // Update donor data
    donor.name = newName;
    donor.amount = newAmount;
    
    // Update state
    if (window.DashboardState) {
        window.DashboardState.setCurrentData(currentData);
    } else {
        window.currentData = currentData;
    }
    
    // Track change for draft mode
    trackChange('edit', 'donation', {
        old: oldDonor,
        new: { name: newName, amount: newAmount },
        index: index
    });
    
    // Refresh UI
    if (typeof processData === 'function') {
        processData();
    }
    
    showSuccess('✅ Donor updated successfully!');
}

/**
 * Save donation from edit modal
 * @param {number} index - Index of donation being saved
 */
function saveDonorFromModal(index) {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const donor = currentData.donations[index];
    if (!donor) return;
    
    const nameInput = document.getElementById('editName');
    const amountInput = document.getElementById('editAmount');
    
    if (!nameInput || !amountInput) return;
    
    const newName = nameInput.value.trim();
    const newAmount = parseFloat(amountInput.value) || 0;
    
    if (!newName || newAmount <= 0) {
        showError('⚠️ Please enter valid name and amount');
        return;
    }
    
    // Check for duplicate name (exclude current donor)
    const duplicate = currentData.donations.find((d, i) => 
        i !== index && d.name.toLowerCase() === newName.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Donor "${newName}" already exists. Duplicate names not allowed.`);
        return;
    }
    
    // Store original values for tracking
    const oldDonor = { name: donor.name, amount: donor.amount };
    
    // Update donor data
    donor.name = newName;
    donor.amount = newAmount;
    
    // Update state
    if (window.DashboardState) {
        window.DashboardState.setCurrentData(currentData);
    } else {
        window.currentData = currentData;
    }
    
    hideEditModal();
    
    // Track change for draft mode
    trackChange('edit', 'donation', {
        old: oldDonor,
        new: { name: newName, amount: newAmount },
        index: index
    });
    
    // Refresh UI
    if (typeof processData === 'function') {
        processData();
    }
    
    showSuccess('✅ Donor updated successfully!');
}

/**
 * Cancel donation edit
 * Refreshes the donations table to original state
 */
function cancelDonorEdit() {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    if (typeof populateDonorsTable === 'function') {
        populateDonorsTable(currentData.donations);
    }
}

/**
 * Validate donation data
 * @param {string} name - Donor name
 * @param {number} amount - Donation amount
 * @param {number} excludeIndex - Index to exclude from duplicate check (for editing)
 * @returns {Object} Validation result {valid: boolean, error: string}
 */
function validateDonation(name, amount, excludeIndex = -1) {
    if (!name || name.trim().length === 0) {
        return { valid: false, error: 'Name is required' };
    }
    
    if (!amount || amount <= 0) {
        return { valid: false, error: 'Amount must be greater than 0' };
    }
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    // Check for duplicate name
    const duplicate = currentData.donations.find((d, i) => 
        i !== excludeIndex && d.name.toLowerCase() === name.toLowerCase()
    );
    
    if (duplicate) {
        return { valid: false, error: `Donor "${name}" already exists` };
    }
    
    return { valid: true };
}

/**
 * Populate donors table in detailed reports section
 * @param {Array} donationsData - Array of donation objects
 */
function populateDonorsTable(donationsData) {
    const tbody = document.getElementById('donorsTableBody');
    if (!tbody) {
        console.warn('⚠️ donorsTableBody element not found');
        return;
    }
    
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    const formatCurrency = window.formatCurrency || function(amount) {
        return '₹' + amount.toLocaleString('en-IN');
    };
    
    // Create a copy before sorting to preserve original indices
    const sortedData = [...donationsData].sort((a, b) => b.amount - a.amount);
    
    tbody.innerHTML = sortedData.map((d, i) => {
        const originalIndex = donationsData.indexOf(d);
        return `
        <tr id="donor-row-${originalIndex}" data-index="${originalIndex}">
            <td>${i + 1}</td>
            <td>${d.name}</td>
            <td>${formatCurrency(d.amount)}</td>
            <td style="${isAdmin ? '' : 'display: none;'}">
                ${isAdmin ? `<div style="display: flex; gap: 6px; justify-content: center;"><button class="action-btn edit" onclick="showEditModal('donor', ${originalIndex})">
                    <i class="fas fa-edit"></i> Edit
                </button><button class="action-btn delete" onclick="deleteItem('donation', ${originalIndex}, '${d.name.replace(/'/g, "\\'")}')">
                    <i class="fas fa-trash"></i> Delete
                </button></div>` : ''}
            </td>
        </tr>
    `;
    }).join('');
    
    console.log(`✅ Donors table populated with ${donationsData.length} entries`);
}

// Export for global access
if (typeof window !== 'undefined') {
    window.addDonation = addDonation;
    window.editDonorEntry = editDonorEntry;
    window.saveDonorEntry = saveDonorEntry;
    window.saveDonorFromModal = saveDonorFromModal;
    window.cancelDonorEdit = cancelDonorEdit;
    window.validateDonation = validateDonation;
    window.populateDonorsTable = populateDonorsTable;
}
