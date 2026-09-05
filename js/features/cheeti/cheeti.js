/**
 * Cheeti (Chitfund) Feature Module
 * Handles all cheeti-related operations (CRUD) with interest calculations
 */

/**
 * Add a new cheeti member
 * Calculates interest and total amount
 */
function addCheetiMember() {
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const name = document.getElementById('cheetiName').value.trim();
    const amount = parseFloat(document.getElementById('cheetiAmount').value);
    const interestRate = parseFloat(document.getElementById('cheetiInterest').value) || 12;
    
    if (!name || !amount || amount <= 0) {
        showError('Please enter valid name and amount');
        return;
    }
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    // Check for duplicate name (case-insensitive)
    if (!currentData.cheeti) currentData.cheeti = [];
    
    const duplicate = currentData.cheeti.find(c => 
        c.name.toLowerCase() === name.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Cheeti member "${name}" already exists. Duplicate names not allowed.`);
        return;
    }
    
    // Calculate interest and total
    const interest = Math.round(amount * (interestRate / 100));
    const total = amount + interest;
    
    // New member for current year (will pay back next year)
    const cheetiMember = {
        slNo: currentData.cheeti.length + 1,
        name: name,
        amount: amount,
        interest: interest,
        total: total,
        paid: false,  // Not paid yet (will pay next year)
        paymentDate: null,
        lateFee: 0
    };
    
    currentData.cheeti.push(cheetiMember);
    
    // Update state
    if (window.DashboardState) {
        window.DashboardState.setCurrentData(currentData);
    } else {
        window.currentData = currentData;
    }
    
    // Track change for draft mode (use new object to avoid reference issues)
    trackChange('add', 'cheeti', { name, amount });
    
    // Clear form
    document.getElementById('cheetiName').value = '';
    document.getElementById('cheetiAmount').value = '';
    document.getElementById('cheetiInterestRate').value = '12';
    
    showSuccess('✅ Cheeti member added successfully!');
    
    // Process data to update UI
    if (typeof processData === 'function') {
        processData();
    }
}

/**
 * Edit cheeti member entry (inline editing)
 * @param {number} index - Index of cheeti member to edit
 */
function editCheetiMemberEntry(index) {
    const row = document.getElementById(`cheeti-member-row-${index}`);
    if (!row) return;
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const member = currentData.cheeti[index];
    if (!member) return;
    
    // Replace cells with input fields
    row.querySelector('.name-cell').innerHTML = `
        <input type="text" class="edit-input" id="edit-member-name-${index}" 
               value="${member.name}" style="width: 100%;">
    `;
    
    row.querySelector('.amount-cell').innerHTML = `
        <input type="number" class="edit-input" id="edit-member-amount-${index}" 
               value="${member.amount}" min="0" step="1" style="width: 100%;">
    `;
    
    // Replace action button
    row.querySelector('td:last-child').innerHTML = `
        <button class="action-btn save" onclick="saveCheetiMemberEntry(${index})">
            <i class="fas fa-save"></i> Save
        </button>
        <button class="action-btn cancel" onclick="cancelCheetiMemberEdit()">
            <i class="fas fa-times"></i> Cancel
        </button>
    `;
}

/**
 * Save edited cheeti member entry
 * @param {number} index - Index of cheeti member being saved
 */
function saveCheetiMemberEntry(index) {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const member = currentData.cheeti[index];
    if (!member) return;
    
    const nameInput = document.getElementById(`edit-member-name-${index}`);
    const amountInput = document.getElementById(`edit-member-amount-${index}`);
    
    if (!nameInput || !amountInput) return;
    
    const newName = nameInput.value.trim();
    const newAmount = parseFloat(amountInput.value) || 0;
    
    if (!newName || newAmount <= 0) {
        showError('⚠️ Please enter valid name and amount');
        return;
    }
    
    // Check for duplicate name (exclude current member)
    const duplicate = currentData.cheeti.find((c, i) => 
        i !== index && c.name.toLowerCase() === newName.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Cheeti member "${newName}" already exists. Duplicate names not allowed.`);
        return;
    }
    
    // Store original values for tracking
    const oldMember = { 
        name: member.name, 
        amount: member.amount, 
        interest: member.interest, 
        total: member.total 
    };
    
    // Get interest rate (default to 12% if not defined)
    const interestRate = 12;
    const newInterest = Math.round(newAmount * (interestRate / 100));
    
    // Update member data - preserve late fee and payment status
    member.name = newName;
    member.amount = newAmount;
    member.interest = newInterest;
    member.total = newAmount + newInterest + (member.lateFee || 0);
    
    // Update state
    if (window.DashboardState) {
        window.DashboardState.setCurrentData(currentData);
    } else {
        window.currentData = currentData;
    }
    
    // Track change for draft mode
    trackChange('edit', 'cheeti', {
        old: oldMember,
        new: { name: newName, amount: newAmount, interest: newInterest, total: member.total },
        index: index
    });
    
    // Refresh UI
    if (typeof processData === 'function') {
        processData();
    }
    
    showSuccess('✅ Cheeti member updated successfully!');
}

/**
 * Save cheeti member from edit modal
 * @param {number} index - Index of cheeti member being saved
 */
function saveCheetiMemberFromModal(index) {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const member = currentData.cheeti[index];
    if (!member) return;
    
    const nameInput = document.getElementById('editName');
    const amountInput = document.getElementById('editAmount');
    
    if (!nameInput || !amountInput) return;
    
    const newName = nameInput.value.trim();
    const newAmount = parseFloat(amountInput.value) || 0;
    
    if (!newName || newAmount <= 0) {
        showError('⚠️ Please enter valid name and amount');
        return;
    }
    
    // Check for duplicate name (exclude current member)
    const duplicate = currentData.cheeti.find((c, i) => 
        i !== index && c.name.toLowerCase() === newName.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Cheeti member "${newName}" already exists. Duplicate names not allowed.`);
        return;
    }
    
    // Store original values for tracking
    const oldMember = { 
        name: member.name, 
        amount: member.amount, 
        interest: member.interest, 
        total: member.total 
    };
    
    // Get interest rate (default to 12% if not defined)
    const interestRate = 12;
    const newInterest = Math.round(newAmount * (interestRate / 100));
    
    // Update member data - preserve late fee and payment status
    member.name = newName;
    member.amount = newAmount;
    member.interest = newInterest;
    member.total = newAmount + newInterest + (member.lateFee || 0);
    
    // Update state
    if (window.DashboardState) {
        window.DashboardState.setCurrentData(currentData);
    } else {
        window.currentData = currentData;
    }
    
    hideEditModal();
    
    // Track change for draft mode
    trackChange('edit', 'cheeti', {
        old: oldMember,
        new: { name: newName, amount: newAmount, interest: newInterest, total: member.total },
        index: index
    });
    
    // Refresh UI
    if (typeof processData === 'function') {
        processData();
    }
    
    showSuccess('✅ Cheeti member updated successfully!');
}

/**
 * Cancel cheeti member edit
 * Refreshes the cheeti table to original state
 */
function cancelCheetiMemberEdit() {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    if (typeof populateCheetiTable === 'function') {
        populateCheetiTable(currentData.cheeti);
    }
}

/**
 * Calculate interest for a cheeti member
 * @param {number} amount - Principal amount
 * @param {number} interestRate - Interest rate (default 12%)
 * @returns {number} Calculated interest amount
 */
function calculateCheetiInterest(amount, interestRate = 12) {
    return Math.round(amount * (interestRate / 100));
}

/**
 * Validate cheeti member data
 * @param {string} name - Member name
 * @param {number} amount - Cheeti amount
 * @param {number} excludeIndex - Index to exclude from duplicate check (for editing)
 * @returns {Object} Validation result {valid: boolean, error: string}
 */
function validateCheetiMember(name, amount, excludeIndex = -1) {
    if (!name || name.trim().length === 0) {
        return { valid: false, error: 'Name is required' };
    }
    
    if (!amount || amount <= 0) {
        return { valid: false, error: 'Amount must be greater than 0' };
    }
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    // Check for duplicate name
    const duplicate = currentData.cheeti.find((c, i) => 
        i !== excludeIndex && c.name.toLowerCase() === name.toLowerCase()
    );
    
    if (duplicate) {
        return { valid: false, error: `Cheeti member "${name}" already exists` };
    }
    
    return { valid: true };
}

/**
 * Update cheeti form based on current year
 * Current year: Show "Add New Member" form
 * Past years: Show "Record Payment" form
 */
function updateCheetiForm() {
    const currentYear = new Date().getFullYear();
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const selectedYear = currentData ? parseInt(currentData.year) : currentYear;
    
    const newMemberForm = document.getElementById('cheetiNewMemberForm');
    const paymentForm = document.getElementById('cheetiPaymentForm');
    const formTitle = document.getElementById('cheetiFormTitle');
    
    if (!newMemberForm || !paymentForm) {
        console.warn('⚠️ Cheeti form elements not found');
        return;
    }
    
    console.log(`📅 Updating cheeti form: current=${currentYear}, selected=${selectedYear}`);
    
    if (selectedYear === currentYear) {
        // Current year: Show "Add New Member" form
        newMemberForm.style.display = 'block';
        paymentForm.style.display = 'none';
        if (formTitle) {
            formTitle.innerHTML = '<i class="fas fa-users"></i> Add Cheeti Member (Borrowing This Year)';
        }
        console.log('✅ Showing "Add New Member" form for current year');
    } else if (selectedYear < currentYear) {
        // Past year: Show "Record Payment" form
        newMemberForm.style.display = 'none';
        paymentForm.style.display = 'block';
        if (formTitle) {
            formTitle.innerHTML = '<i class="fas fa-money-check-alt"></i> Record Payment Collection';
        }
        console.log('✅ Showing "Record Payment" form for past year');
        
        // Populate member dropdown
        populateMemberDropdown();
        populateReceiverDropdown();
        populatePaymentModeDropdown();
    }
}

/**
 * Populate member dropdown for past year payment collection
 */
function populateMemberDropdown() {
    const memberSelect = document.getElementById('cheetiMemberSelect');
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    if (!memberSelect || !currentData || !currentData.cheeti) {
        console.warn('⚠️ Member select or cheeti data not found');
        return;
    }
    
    // Preserve current selection - this can be repopulated mid-edit (e.g. auto-refresh)
    const previousValue = memberSelect.value;
    
    // Clear existing options except first one
    memberSelect.innerHTML = '<option value="">-- Select Member --</option>';
    
    // Add members to dropdown
    currentData.cheeti.forEach((member, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${member.name} - ₹${member.amount.toLocaleString('en-IN')}`;
        memberSelect.appendChild(option);
    });
    
    if (previousValue && currentData.cheeti[previousValue]) {
        memberSelect.value = previousValue;
    }
    
    console.log(`✅ Populated member dropdown with ${currentData.cheeti.length} members`);
}

/**
 * Populate receiver dropdown with the incoming (next year) committee, who actually collects repayment
 */
function populateReceiverDropdown() {
    const receiverSelect = document.getElementById('repaymentReceiver');
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    if (!receiverSelect || !currentData) {
        return;
    }
    
    const committeeList = (currentData.committee_next_year && currentData.committee_next_year.length)
        ? currentData.committee_next_year
        : (currentData.committee || []);
    
    // Preserve current selection - this can be repopulated mid-edit (e.g. auto-refresh)
    const previousValue = receiverSelect.value;
    
    receiverSelect.innerHTML = '<option value="">-- Select Receiver --</option>';
    committeeList.forEach(m => {
        const option = document.createElement('option');
        option.value = m.name;
        option.textContent = m.role ? `${m.name} (${m.role})` : m.name;
        receiverSelect.appendChild(option);
    });
    
    if (previousValue && committeeList.some(m => m.name === previousValue)) {
        receiverSelect.value = previousValue;
    }
}

/**
 * Populate payment mode dropdown - rendered via JS (like the receiver dropdown) rather than
 * static HTML options, since statically-authored selects were seen mis-anchoring their native
 * dropdown on mobile; a JS-populated select does not have this issue.
 */
function populatePaymentModeDropdown() {
    const modeSelect = document.getElementById('repaymentMode');
    if (!modeSelect) return;
    
    const previousValue = modeSelect.value;
    const modes = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'];
    
    modeSelect.innerHTML = '<option value="">-- Select Payment Mode --</option>';
    modes.forEach(mode => {
        const option = document.createElement('option');
        option.value = mode;
        option.textContent = mode;
        modeSelect.appendChild(option);
    });
    
    if (previousValue && modes.includes(previousValue)) {
        modeSelect.value = previousValue;
    }
}

/**
 * Load member details when selected from dropdown (for payment collection)
 */
function loadMemberDetails() {
    const memberSelect = document.getElementById('cheetiMemberSelect');
    const memberDetails = document.getElementById('memberDetails');
    const repaymentDate = document.getElementById('repaymentDate');
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    if (!memberSelect || !memberDetails) {
        console.warn('⚠️ Member select or details elements not found');
        return;
    }
    
    const memberIndex = memberSelect.value;
    
    if (memberIndex === '' || !currentData || !currentData.cheeti || !currentData.cheeti[memberIndex]) {
        memberDetails.style.display = 'none';
        return;
    }
    
    const member = currentData.cheeti[memberIndex];
    
    // Show member details
    const principalEl = document.getElementById('memberPrincipal');
    const interestEl = document.getElementById('memberInterest');
    const totalDueEl = document.getElementById('memberTotalDue');
    const paidAmountEl = document.getElementById('memberPaidAmount');
    const remainingAmountEl = document.getElementById('memberRemainingAmount');
    const totalDue = (member.amount || 0) + (member.interest || 0) + (member.lateFee || 0);
    const paidAmount = member.paidAmount || 0;
    const remainingAmount = Math.max(0, totalDue - paidAmount);
    
    if (principalEl) principalEl.textContent = `₹${member.amount.toLocaleString('en-IN')}`;
    if (interestEl) interestEl.textContent = `₹${member.interest.toLocaleString('en-IN')}`;
    if (totalDueEl) totalDueEl.textContent = `₹${totalDue.toLocaleString('en-IN')}`;
    if (paidAmountEl) paidAmountEl.textContent = `₹${paidAmount.toLocaleString('en-IN')}`;
    if (remainingAmountEl) remainingAmountEl.textContent = `₹${remainingAmount.toLocaleString('en-IN')}`;
    
    memberDetails.style.display = 'block';
    
    // Set today's date as default payment date
    if (repaymentDate && !repaymentDate.value) {
        repaymentDate.value = new Date().toISOString().split('T')[0];
    }
    
    // Pre-fill existing payment data if available
    const paidCheckbox = document.getElementById('repaymentPaid');
    const lateFeeInput = document.getElementById('repaymentLateFee');
    
    if (member.paid && paidCheckbox) {
        paidCheckbox.checked = true;
        if (member.paymentDate && repaymentDate) {
            repaymentDate.value = member.paymentDate;
        }
        if (member.lateFee && lateFeeInput) {
            lateFeeInput.value = member.lateFee;
        }
    }
    
    const receiverSelect = document.getElementById('repaymentReceiver');
    if (receiverSelect) {
        receiverSelect.value = member.receiver || '';
    }
    
    const paymentModeSelect = document.getElementById('repaymentMode');
    if (paymentModeSelect) {
        paymentModeSelect.value = member.paymentMode || '';
    }
    
    console.log(`✅ Loaded details for member: ${member.name}`);
}

/**
 * Populate cheeti table in detailed reports section
 * @param {Array} cheetiData - Array of cheeti member objects
 */
function populateCheetiTable(cheetiData) {
    const tbody = document.getElementById('cheetiTableBody');
    if (!tbody) {
        console.warn('⚠️ cheetiTableBody element not found');
        return;
    }
    
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    const formatCurrency = window.formatCurrency || function(amount) {
        return '₹' + amount.toLocaleString('en-IN');
    };
    const translate = window.DashboardLocalization?.translate || (key => ({ viewPaymentHistory: 'View payment history' }[key] || key));

    updateMemberCutoverNotice();

    const cutoverDateValue = currentData?.cheeti_settings?.cutover_date;
    const cutoverDate = cutoverDateValue ? new Date(`${cutoverDateValue}T00:00:00`) : null;
    
    tbody.innerHTML = cheetiData.map((c, index) => {
        const totalWithLateFee = (c.amount || 0) + (c.interest || 0) + (c.lateFee || 0);
        const remainingBalance = Math.max(0, totalWithLateFee - (c.paidAmount || 0));
        const paymentDate = c.paymentDate ? new Date(`${c.paymentDate}T00:00:00`) : null;
        const paidOnOrAfterCutover = paymentDate && cutoverDate && !Number.isNaN(cutoverDate.getTime()) && paymentDate >= cutoverDate;
        const formattedPaymentDate = paymentDate && !Number.isNaN(paymentDate.getTime())
            ? paymentDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : '-';
        
        // Installments can be collected by different committee members over time
        const paymentHistory = c.paymentHistory || [];
        const receivers = [...new Set(paymentHistory.map(p => p.receiver).filter(Boolean))];
        const showHistoryIcon = paymentHistory.length > 1 || receivers.length > 1;
        const lastReceiver = paymentHistory.length ? (paymentHistory[paymentHistory.length - 1].receiver || '-') : (c.receiver || '-');
        const lastPaymentMode = paymentHistory.length ? (paymentHistory[paymentHistory.length - 1].paymentMode || '-') : (c.paymentMode || '-');
        const receiverText = showHistoryIcon
            ? `${lastReceiver} <button class="action-btn" style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 4px 8px;" onclick="showCheetiPaymentHistory(${index})" title="${translate('viewPaymentHistory')}"><i class="fas fa-eye"></i></button>`
            : lastReceiver;
        
        return `
        <tr id="cheeti-member-row-${index}" data-index="${index}" data-status="${c.paid ? 'paid' : 'pending'}" data-receiver="${lastReceiver}" data-payment-mode="${lastPaymentMode}">
            <td>${c.slNo}</td>
            <td>${c.name}</td>
            <td>${formatCurrency(c.amount)}</td>
            <td>${formatCurrency(c.interest || 0)}</td>
            <td><strong>${formatCurrency(totalWithLateFee)}</strong></td>
            <td class="paid-amount-cell">${formatCurrency(c.paidAmount || 0)}</td>
            <td class="remaining-balance-cell"><strong>${formatCurrency(remainingBalance)}</strong></td>
            <td style="${paidOnOrAfterCutover ? 'color: #dc2626; font-weight: 700;' : ''}">${formattedPaymentDate}</td>
            <td>${receiverText}</td>
            <td>${lastPaymentMode}</td>
            <td style="${isAdmin ? '' : 'display: none;'}">
                ${isAdmin ? `<div style="display: flex; gap: 6px; justify-content: center;"><button class="action-btn edit" onclick="showEditModal('cheeti', ${index})">
                    <i class="fas fa-edit"></i> Edit
                </button><button class="action-btn delete" onclick="deleteItem('cheeti', ${index}, '${c.name.replace(/'/g, "\\'")}')">
                    <i class="fas fa-trash"></i> Delete
                </button></div>` : ''}
            </td>
        </tr>
    `;
    }).join('');
    
    populateCheetiReceiverFilterOptions(cheetiData, 'cheetiMembersReceiverFilter');
    filterCheetiTable('cheetiTableBody', 'cheetiMembers');
    
    console.log(`✅ Cheeti table populated with ${cheetiData.length} entries`);
}

/**
 * Show the payment deadline warning to members when a cutover date is configured.
 */
function updateMemberCutoverNotice() {
    const notice = document.getElementById('cheetiCutoverMemberNotice');
    const message = document.getElementById('cheetiCutoverMemberMessage');
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const cutoverDate = currentData?.cheeti_settings?.cutover_date;

    if (!notice || !message) return;

    if (!cutoverDate) {
        notice.style.display = 'none';
        message.textContent = '';
        return;
    }

    const deadline = new Date(`${cutoverDate}T00:00:00`);
    if (Number.isNaN(deadline.getTime())) {
        notice.style.display = 'none';
        message.textContent = '';
        return;
    }

    const selectedYear = currentData.year;
    const lateFeePerDay = currentData.cheeti_settings.late_fee_per_day || 50;
    const localization = window.DashboardLocalization;
    const locale = localization?.getLocale?.() || 'en-IN';
    let formattedDeadline = deadline.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    if (locale === 'te-IN') {
        const month = deadline.toLocaleDateString(locale, { month: 'long' });
        formattedDeadline = `${deadline.getFullYear()} ${month} ${deadline.getDate()}`;
    }

    const formattedFee = lateFeePerDay.toLocaleString(locale);
    message.textContent = localization
        ? localization.translate('paymentNotice', { year: selectedYear, deadline: formattedDeadline, fee: formattedFee })
        : ` Please pay your ${selectedYear} cheeti amount by ${formattedDeadline}. After this date, ₹${formattedFee} will be added for each late day.`;
    notice.style.display = 'block';
}

/**
 * Populate cheeti paid table in admin panel
 * Shows payment status for all cheeti members
 * @param {Array} cheetiData - Array of cheeti member objects
 */
function populateCheetiPaidTable(cheetiData) {
    const tbody = document.getElementById('cheetiPaidTableBody');
    if (!tbody) {
        console.warn('⚠️ cheetiPaidTableBody element not found');
        return;
    }
    
    const formatCurrency = window.formatCurrency || function(amount) {
        return '₹' + amount.toLocaleString('en-IN');
    };
    
    tbody.innerHTML = cheetiData.map((c, index) => {
        const totalDue = (c.amount || 0) + (c.interest || 0) + (c.lateFee || 0);
        const remainingBalance = Math.max(0, totalDue - (c.paidAmount || 0));
        const statusClass = c.paid ? 'paid' : 'unpaid';
        const statusText = c.paid ? '✓ Paid' : '✗ Pending';
        const formattedDate = c.paymentDate ? new Date(c.paymentDate).toLocaleDateString('en-IN') : '-';
        
        // Installments can be collected by different committee members over time
        const paymentHistory = c.paymentHistory || [];
        const receivers = [...new Set(paymentHistory.map(p => p.receiver).filter(Boolean))];
        const showHistoryIcon = paymentHistory.length > 1 || receivers.length > 1;
        const lastReceiver = paymentHistory.length ? (paymentHistory[paymentHistory.length - 1].receiver || '-') : (c.receiver || '-');
        const lastPaymentMode = paymentHistory.length ? (paymentHistory[paymentHistory.length - 1].paymentMode || '-') : (c.paymentMode || '-');
        const receiverText = showHistoryIcon
            ? `${lastReceiver} <button class="action-btn" style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 4px 8px;" onclick="showCheetiPaymentHistory(${index})" title="View payment history"><i class="fas fa-eye"></i></button>`
            : lastReceiver;
        
        return `
            <tr id="cheeti-row-${index}" data-index="${index}" data-status="${c.paid ? 'paid' : 'pending'}" data-receiver="${lastReceiver}" data-payment-mode="${lastPaymentMode}">
                <td>${c.slNo}</td>
                <td>${c.name}</td>
                <td>${formatCurrency(c.amount || 0)}</td>
                <td>${formatCurrency(c.interest || 0)}</td>
                <td class="late-fee-cell">${formatCurrency(c.lateFee || 0)}</td>
                <td><strong>${formatCurrency(totalDue)}</strong></td>
                <td class="paid-amount-cell">${formatCurrency(c.paidAmount || 0)}</td>
                <td class="remaining-balance-cell"><strong>${formatCurrency(remainingBalance)}</strong></td>
                <td class="status-cell">
                    <span class="paid-status ${statusClass}">${statusText}</span>
                </td>
                <td class="date-cell">${formattedDate}</td>
                <td>${receiverText}</td>
                <td>${lastPaymentMode}</td>
                <td>
                    <div style="display: flex; gap: 6px; justify-content: center;"><button class="action-btn edit" onclick="editCheetiEntry(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button><button class="action-btn delete" onclick="deleteItem('cheeti', ${index}, '${c.name.replace(/'/g, "\\'")}')">
                        <i class="fas fa-trash"></i> Delete
                    </button></div>
                </td>
            </tr>
        `;
    }).join('');
    
    populateCheetiReceiverFilterOptions(cheetiData, 'cheetiPaidReceiverFilter');
    filterCheetiTable('cheetiPaidTableBody', 'cheetiPaid');
    
    console.log(`✅ Cheeti paid table populated with ${cheetiData.length} entries`);
}

/**
 * Populate a receiver filter dropdown with the distinct receivers found in the current data,
 * preserving the currently selected value if it still exists.
 * @param {Array} cheetiData - Array of cheeti member objects
 * @param {string} selectId - Id of the receiver <select> filter to populate
 */
function populateCheetiReceiverFilterOptions(cheetiData, selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const receivers = new Set();
    cheetiData.forEach(c => {
        if (c.receiver) receivers.add(c.receiver);
        (c.paymentHistory || []).forEach(p => { if (p.receiver) receivers.add(p.receiver); });
    });
    
    const previousValue = select.value;
    select.innerHTML = '<option value="">All Receivers</option>' +
        [...receivers].sort().map(name => `<option value="${name}">${name}</option>`).join('');
    
    if (previousValue && receivers.has(previousValue)) {
        select.value = previousValue;
    }
}

/**
 * Filter a cheeti table's rows by Status / Received By / Payment Mode using the row's data attributes.
 * @param {string} tbodyId - Id of the table body to filter
 * @param {string} filterPrefix - Prefix used for the filter <select> ids (e.g. 'cheetiMembers', 'cheetiPaid')
 */
function filterCheetiTable(tbodyId, filterPrefix) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    
    const status = document.getElementById(`${filterPrefix}StatusFilter`)?.value || '';
    const receiver = document.getElementById(`${filterPrefix}ReceiverFilter`)?.value || '';
    const mode = document.getElementById(`${filterPrefix}ModeFilter`)?.value || '';
    
    tbody.querySelectorAll('tr[data-index]').forEach(row => {
        const matchesStatus = !status || row.dataset.status === status;
        const matchesReceiver = !receiver || row.dataset.receiver === receiver;
        const matchesMode = !mode || row.dataset.paymentMode === mode;
        row.style.display = (matchesStatus && matchesReceiver && matchesMode) ? '' : 'none';
    });
}

/**
 * Reset all quick filters for a given cheeti table
 * @param {string} filterPrefix - Prefix used for the filter <select> ids
 */
function clearCheetiFilters(filterPrefix) {
    ['StatusFilter', 'ReceiverFilter', 'ModeFilter'].forEach(suffix => {
        const el = document.getElementById(`${filterPrefix}${suffix}`);
        if (el) el.value = '';
    });
    const tbodyId = filterPrefix === 'cheetiMembers' ? 'cheetiTableBody' : 'cheetiPaidTableBody';
    filterCheetiTable(tbodyId, filterPrefix);
}

/**
 * Show a date-wise breakdown of installments and who received each one
 * @param {number} index - Index of cheeti member
 */
function showCheetiPaymentHistory(index) {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const member = currentData && currentData.cheeti ? currentData.cheeti[index] : null;
    if (!member) return;
    
    const formatCurrency = window.formatCurrency || function(amount) {
        return '₹' + amount.toLocaleString('en-IN');
    };
    const translate = window.DashboardLocalization?.translate || (key => ({
        historyDate: 'Date', historyAmount: 'Amount', historyReceivedBy: 'Received By', historyPaymentMode: 'Payment Mode',
        noInstallments: 'No installments recorded', closeAction: 'Close'
    }[key] || key));
    
    const history = [...(member.paymentHistory || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const rows = history.map(p => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${p.date ? new Date(p.date).toLocaleDateString('en-IN') : '-'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${formatCurrency(p.amount || 0)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${p.receiver || '-'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${p.paymentMode || '-'}</td>
        </tr>
    `).join('');
    
    const message = `
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
                <tr>
                    <th style="padding: 8px; border-bottom: 2px solid #dee2e6;">${translate('historyDate')}</th>
                    <th style="padding: 8px; border-bottom: 2px solid #dee2e6;">${translate('historyAmount')}</th>
                    <th style="padding: 8px; border-bottom: 2px solid #dee2e6;">${translate('historyReceivedBy')}</th>
                    <th style="padding: 8px; border-bottom: 2px solid #dee2e6;">${translate('historyPaymentMode')}</th>
                </tr>
            </thead>
            <tbody>${rows || `<tr><td colspan="4" style="padding: 8px; text-align: center;">${translate('noInstallments')}</td></tr>`}</tbody>
        </table>
    `;
    
    if (typeof showCustomConfirm === 'function') {
        showCustomConfirm({
            title: window.DashboardLocalization ? window.DashboardLocalization.translate('paymentHistoryTitle', { name: member.name }) : `Payment History - ${member.name}`,
            message,
            icon: 'fas fa-history',
            iconColor: '#8b5cf6',
            confirmText: translate('closeAction'),
            cancelText: ''
        });
    }
}

/**
 * Edit cheeti entry - show modal for payment editing
 * @param {number} index - Index of cheeti member
 */
function editCheetiEntry(index) {
    if (typeof showEditModal === 'function') {
        showEditModal('cheeti-payment', index);
    }
}

/**
 * Save cheeti payment details from edit modal
 * Updates payment status, late fee, and payment date
 * @param {number} index - Index of cheeti member
 */
async function saveCheetiPaymentFromModal(index) {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const member = currentData.cheeti[index];
    if (!member) return;
    
    const lateFeeInput = document.getElementById('editLateFee');
    const paidInput = document.getElementById('editPaid');
    const dateInput = document.getElementById('editPaymentDate');
    const receiverInput = document.getElementById('editReceiver');
    const paymentModeInput = document.getElementById('editPaymentMode');
    
    if (!lateFeeInput || !paidInput || !dateInput) return;
    
    const lateFee = parseFloat(lateFeeInput.value) || 0;
    const isPaid = paidInput.checked;
    const paymentDate = dateInput.value;
    const receiver = receiverInput ? receiverInput.value : (member.receiver || '');
    const paymentMode = paymentModeInput ? paymentModeInput.value : (member.paymentMode || '');
    
    if (isPaid && !receiver) {
        showError('Please select who received the payment');
        return;
    }
    
    if (isPaid && !paymentMode) {
        showError('Please select the payment mode');
        return;
    }
    
    // Store original values for tracking
    const oldPayment = { 
        name: member.name,
        lateFee: member.lateFee, 
        paid: member.paid, 
        paymentDate: member.paymentDate,
        total: member.total,
        receiver: member.receiver,
        paymentMode: member.paymentMode,
        paidAmount: member.paidAmount || 0,
        paymentHistory: member.paymentHistory ? [...member.paymentHistory] : []
    };
    
    // Update member payment details
    member.lateFee = lateFee;
    member.paid = isPaid;
    member.paymentDate = isPaid ? paymentDate : null;
    member.total = (member.amount || 0) + (member.interest || 0) + lateFee;
    member.receiver = receiver;
    member.paymentMode = paymentMode;
    // Keep paidAmount in sync so Remaining Balance reflects a reverted (unpaid) status
    member.paidAmount = isPaid ? member.total : 0;
    // Reverting clears prior installments too, otherwise old receivers/amounts would still show up
    if (!isPaid) {
        member.paymentHistory = [];
    }
    
    // Store days overdue if applicable
    if (paymentDate) {
        const daysOverdue = getDaysOverdue(paymentDate);
        if (daysOverdue > 0) {
            member.days_overdue = daysOverdue;
        } else {
            member.days_overdue = 0;
        }
    }
    
    // Update state
    if (window.DashboardState) {
        window.DashboardState.setCurrentData(currentData);
    } else {
        window.currentData = currentData;
    }
    
    if (typeof hideEditModal === 'function') {
        hideEditModal();
    }
    
    // Track change for draft mode (payment status update is an edit)
    trackChange('edit', 'cheeti', {
        old: oldPayment,
        new: { name: member.name, lateFee: lateFee, paid: isPaid, paymentDate: paymentDate, total: member.total, receiver: receiver, paymentMode: paymentMode, paidAmount: member.paidAmount, paymentHistory: member.paymentHistory },
        index: index,
        type: 'payment_update'
    });
    if (isPaid && paymentDate) {
        await addCheetiCollectionToCurrentYear(member.name, member.total, paymentDate, { replaceExisting: true, isFinalPayment: true });
    } else if (oldPayment.paid || (oldPayment.paidAmount && oldPayment.paidAmount > 0)) {
        // Covers both a full revert and a partial-installment revert (paidAmount reset to 0 here)
        await removeCheetiCollectionFromNextYear(member);
    }
    
    // Refresh UI
    if (typeof processData === 'function') {
        processData();
    }
    
    showSuccess('✅ Payment details updated successfully!');
}

/**
 * Calculate late fee based on payment date and cutover settings
 * @param {string} paymentDate - Payment date in ISO format
 * @returns {number} Calculated late fee
 */
function calculateLateFee(paymentDate) {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    if (!currentData || !currentData.cheeti_settings || !currentData.cheeti_settings.cutover_date) {
        return 0;
    }
    
    const cutoverDate = new Date(currentData.cheeti_settings.cutover_date);
    const payDate = new Date(paymentDate);
    const lateFeePerDay = currentData.cheeti_settings.late_fee_per_day || 50;
    
    // If payment is on or before cutover date, no late fee
    if (payDate <= cutoverDate) {
        return 0;
    }
    
    // Calculate days overdue
    const daysOverdue = Math.ceil((payDate - cutoverDate) / (1000 * 60 * 60 * 24));
    const lateFee = daysOverdue * lateFeePerDay;
    
    return lateFee;
}

/**
 * Get number of days overdue based on cutover date
 * @param {string} paymentDate - Payment date in ISO format
 * @returns {number} Days overdue (0 if on time)
 */
function getDaysOverdue(paymentDate) {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    if (!currentData || !currentData.cheeti_settings || !currentData.cheeti_settings.cutover_date) {
        return 0;
    }
    
    const cutoverDate = new Date(currentData.cheeti_settings.cutover_date);
    const payDate = new Date(paymentDate);
    
    // If payment is on or before cutover date, no days overdue
    if (payDate <= cutoverDate) {
        return 0;
    }
    
    // Calculate days overdue
    return Math.ceil((payDate - cutoverDate) / (1000 * 60 * 60 * 24));
}

/**
 * Auto-calculate late fee when payment date changes in edit modal
 * Updates late fee input and displays calculation details
 */
function autoCalculateLateFee() {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const currentEditIndex = window.currentEditIndex || (window.DashboardState && window.DashboardState.getCurrentEditIndex());
    
    const dateInput = document.getElementById('editPaymentDate');
    const lateFeeInput = document.getElementById('editLateFee');
    const lateFeeInfo = document.getElementById('lateFeeInfo');
    const lateFeeAutoCalc = document.getElementById('lateFeeAutoCalc');
    const totalDueAmount = document.getElementById('totalDueAmount');
    
    if (!dateInput || !dateInput.value) {
        console.log('❌ Auto-calc skipped: No payment date');
        return;
    }
    
    const paymentDate = dateInput.value;
    const calculatedLateFee = calculateLateFee(paymentDate);
    const daysOverdue = getDaysOverdue(paymentDate);
    
    console.log('📅 Auto-calculating late fee...', {
        paymentDate,
        daysOverdue,
        calculatedLateFee,
        hasSettings: !!(currentData && currentData.cheeti_settings),
        cutoverDate: currentData?.cheeti_settings?.cutover_date,
        lateFeePerDay: currentData?.cheeti_settings?.late_fee_per_day
    });
    
    const formatCurrency = window.formatCurrency || function(amount) {
        return '₹' + amount.toLocaleString('en-IN');
    };
    
    if (daysOverdue > 0 && currentData.cheeti_settings) {
        const lateFeePerDay = currentData.cheeti_settings.late_fee_per_day || 50;
        
        // Update late fee input
        if (lateFeeInput) lateFeeInput.value = calculatedLateFee;
        
        // Show calculation info
        if (lateFeeInfo) {
            lateFeeInfo.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: #ff9800;"></i> ${daysOverdue} day(s) overdue × ₹${lateFeePerDay}/day = ₹${calculatedLateFee.toLocaleString('en-IN')}`;
        }
        
        if (lateFeeAutoCalc) {
            lateFeeAutoCalc.textContent = '(Auto-calculated)';
        }
        
        // Update total due
        if (totalDueAmount && currentEditIndex !== null && currentEditIndex !== undefined) {
            const member = currentData.cheeti[currentEditIndex];
            if (member) {
                const newTotal = (member.amount || 0) + (member.interest || 0) + calculatedLateFee;
                totalDueAmount.textContent = formatCurrency(newTotal);
            }
        }
        
        console.log('✅ Late fee auto-calculated:', calculatedLateFee);
    } else {
        // No late fee calculated, but don't overwrite existing late fee
        if (lateFeeInfo) lateFeeInfo.textContent = '';
        if (lateFeeAutoCalc) lateFeeAutoCalc.textContent = '';
        // Don't set lateFeeInput.value to 0 - keep existing value
        
        // Update total due with current late fee value
        if (totalDueAmount && currentEditIndex !== null && currentEditIndex !== undefined && lateFeeInput) {
            const member = currentData.cheeti[currentEditIndex];
            if (member) {
                const currentLateFee = parseFloat(lateFeeInput.value) || 0;
                const newTotal = (member.amount || 0) + (member.interest || 0) + currentLateFee;
                totalDueAmount.textContent = formatCurrency(newTotal);
            }
        }
        
        console.log('ℹ️ No late fee auto-calculation:', daysOverdue <= 0 ? 'Payment on time' : 'No cutover settings');
    }
}

/**
 * Add cheeti collection to current/next year's income
 * When a past year payment is recorded, add it to the target year's income
 * @param {string} memberName - Name of the cheeti member
 * @param {number} amount - Total amount collected (principal + interest + late fee)
 * @param {string} paymentDate - Payment date in ISO format
 */
async function addCheetiCollectionToCurrentYear(memberName, amount, paymentDate, options = {}) {
    try {
        const { replaceExisting = false, isFinalPayment = false } = options;
        const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
        const selectedYear = currentData ? parseInt(currentData.year) : new Date().getFullYear();
        const targetYear = selectedYear + 1; // Add to the next year after selected year
        const draftMode = window.DashboardState ? window.DashboardState.getDraftMode() : window.draftMode;
        
        // Only add to next year if we're recording payment from a past year
        if (selectedYear >= new Date().getFullYear()) {
            console.log('Not adding collection - already in current real-world year');
            return;
        }
        
        // In draft mode, store the pending cross-year update but don't save to GitHub yet
        if (draftMode) {
            console.log(`📝 DRAFT MODE: Pending cross-year update - ₹${amount} will be added to ${targetYear} when you publish`);
            showInfo(`ℹ️ Payment tracked. When you publish, ₹${amount.toLocaleString('en-IN')} will also be added to ${targetYear}'s income.`);
            
            // Store pending update for later
            if (!window.pendingCrossYearUpdates) {
                window.pendingCrossYearUpdates = [];
            }
            window.pendingCrossYearUpdates.push({
                targetYear: targetYear,
                memberName: memberName,
                amount: amount,
                paymentDate: paymentDate,
                fromYear: selectedYear,
                replaceExisting,
                isFinalPayment
            });
            return;
        }
        
        // Load target year data (next year after selected)
        const targetYearData = await loadYearData(targetYear);
        
        if (!targetYearData) {
            console.error(`Could not load target year ${targetYear} data`);
            return;
        }
        
        // Initialize cheeti_collections array if it doesn't exist
        if (!targetYearData.cheeti_collections) {
            targetYearData.cheeti_collections = [];
        }
        
        // Check if member already exists in collections (prevent duplicates from multiple edits)
        const existingIndex = targetYearData.cheeti_collections.findIndex(
            c => c.memberName === memberName && c.fromYear === selectedYear
        );
        
        if (existingIndex >= 0) {
            // Update existing entry instead of creating duplicate
            console.log(`🔄 Updating existing collection for ${memberName} (duplicate prevented)`);
            targetYearData.cheeti_collections[existingIndex] = {
                ...targetYearData.cheeti_collections[existingIndex],
                amount: replaceExisting ? amount : (targetYearData.cheeti_collections[existingIndex].amount || 0) + amount,
                collectionDate: paymentDate,
                addedOn: new Date().toISOString()
            };
        } else {
            // Add new collection
            targetYearData.cheeti_collections.push({
                slNo: targetYearData.cheeti_collections.length + 1,
                memberName: memberName,
                amount: amount,
                fromYear: selectedYear,
                collectionDate: paymentDate,
                addedOn: new Date().toISOString()
            });
        }
        
        // Remove from cheeti_expected to avoid double counting
        if (isFinalPayment && targetYearData.cheeti_expected) {
            const expectedIndex = targetYearData.cheeti_expected.findIndex(
                e => e.name === memberName && e.fromYear === selectedYear
            );
            if (expectedIndex >= 0) {
                console.log(`🔄 Removing ${memberName} from cheeti_expected (already paid)`);
                targetYearData.cheeti_expected.splice(expectedIndex, 1);
            }
        }
        
        // Save target year data (uses data-saver module)
        if (typeof saveYearData === 'function') {
            await saveYearData(targetYear, targetYearData);
        }
        
        console.log(`✅ Added ₹${amount} collection to ${targetYear} income`);
        showSuccess(`✅ Payment added to ${targetYear} income: ₹${amount.toLocaleString('en-IN')}`);
        
    } catch (error) {
        console.error('Error adding cheeti collection to target year:', error);
        showError('⚠️ Payment recorded but failed to add to target year income');
    }
}

/**
 * Remove a reverted full payment from the following year's income.
 * @param {Object} member - The borrowing-year cheeti member
 */
async function removeCheetiCollectionFromNextYear(member) {
    try {
        const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
        const selectedYear = currentData ? parseInt(currentData.year, 10) : new Date().getFullYear();
        const targetYear = selectedYear + 1;
        const draftMode = window.DashboardState ? window.DashboardState.getDraftMode() : window.draftMode;
        
        // Mirror addCheetiCollectionToCurrentYear's guard: cross-year income only applies to past-year borrowers
        if (selectedYear >= new Date().getFullYear()) {
            console.log('Not removing collection - already in current real-world year');
            return;
        }
        
        const expectedCollection = {
            name: member.name,
            amount: member.amount || 0,
            interest: member.interest || 0,
            expectedTotal: (member.amount || 0) + (member.interest || 0),
            fromYear: selectedYear
        };

        if (draftMode) {
            if (!window.pendingCrossYearUpdates) {
                window.pendingCrossYearUpdates = [];
            }
            window.pendingCrossYearUpdates.push({
                operation: 'remove',
                targetYear,
                memberName: member.name,
                fromYear: selectedYear,
                expectedCollection
            });
            showInfo(`ℹ️ Payment reverted. When you publish, ${member.name}'s payment will also be removed from ${targetYear}'s income.`);
            return;
        }

        const targetYearData = await loadYearData(targetYear);
        if (!targetYearData || !targetYearData.cheeti_collections) return;

        const collectionIndex = targetYearData.cheeti_collections.findIndex(
            collection => collection.memberName === member.name && collection.fromYear === selectedYear
        );
        if (collectionIndex === -1) return;

        targetYearData.cheeti_collections.splice(collectionIndex, 1);
        targetYearData.cheeti_collections.forEach((collection, index) => {
            collection.slNo = index + 1;
        });

        if (!targetYearData.cheeti_expected) {
            targetYearData.cheeti_expected = [];
        }
        const expectedExists = targetYearData.cheeti_expected.some(
            expected => expected.name === member.name && expected.fromYear === selectedYear
        );
        if (!expectedExists) {
            targetYearData.cheeti_expected.push(expectedCollection);
        }

        if (typeof saveYearData === 'function') {
            await saveYearData(targetYear, targetYearData);
        }
        console.log(`✅ Removed reverted ${selectedYear} payment from ${targetYear} income`);
    } catch (error) {
        console.error('Error removing reverted cheeti collection:', error);
        showError('⚠️ Payment was reverted but could not be removed from next year income');
    }
}

/**
 * Record payment for a cheeti member (from admin panel payment form)
 * Used for past years to record when members paid back their loans
 */
async function recordPayment() {
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const memberIndex = document.getElementById('cheetiMemberSelect').value;
    const paymentDate = document.getElementById('repaymentDate').value;
    const paymentAmount = parseFloat(document.getElementById('repaymentAmount').value);
    const lateFee = parseFloat(document.getElementById('repaymentLateFee').value) || 0;
    const markFullyPaid = document.getElementById('repaymentPaid').checked;
    const receiverInput = document.getElementById('repaymentReceiver');
    const receiver = receiverInput ? receiverInput.value : '';
    const paymentModeInput = document.getElementById('repaymentMode');
    const paymentMode = paymentModeInput ? paymentModeInput.value : '';
    
    if (!memberIndex || memberIndex === '') {
        showError('Please select a member');
        return;
    }
    
    if (!paymentDate) {
        showError('Please enter payment date');
        return;
    }

    if (!paymentAmount || paymentAmount <= 0) {
        showError('Please enter the amount received');
        return;
    }
    
    if (!receiver) {
        showError('Please select who received the payment');
        return;
    }
    
    if (!paymentMode) {
        showError('Please select the payment mode');
        return;
    }
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    if (!currentData.cheeti || !currentData.cheeti[memberIndex]) {
        showError('Member not found');
        return;
    }
    
    const member = currentData.cheeti[memberIndex];
    
    // Store old values for tracking
    const oldMember = {
        name: member.name,
        paid: member.paid || false,
        paymentDate: member.paymentDate || null,
        lateFee: member.lateFee || 0,
        total: member.total || (member.amount + member.interest),
        paidAmount: member.paidAmount || 0,
        receiver: member.receiver || '',
        paymentMode: member.paymentMode || ''
    };
    
    // Partial payments do not clear the deadline: calculate the fee using this payment date.
    // Only an installment that clears the entire outstanding amount marks the member as paid.
    const autoCalculatedLateFee = calculateLateFee(paymentDate);
    const finalLateFee = autoCalculatedLateFee > 0 ? autoCalculatedLateFee : lateFee;
    const daysOverdue = getDaysOverdue(paymentDate);
    
    const totalDue = member.amount + member.interest + finalLateFee;
    const previousPaidAmount = member.paidAmount || 0;
    const remainingBeforePayment = totalDue - previousPaidAmount;

    if (paymentAmount > remainingBeforePayment) {
        showError(`Amount received cannot exceed the remaining ₹${remainingBeforePayment.toLocaleString('en-IN')}`);
        return;
    }

    const paidAmount = previousPaidAmount + paymentAmount;
    const isFullyPaid = paidAmount >= totalDue;

    if (markFullyPaid && !isFullyPaid) {
        showError(`₹${Math.max(0, totalDue - paidAmount).toLocaleString('en-IN')} is still remaining. Do not mark this payment as fully paid.`);
        return;
    }
    
    // Update member payment details in past year data
    currentData.cheeti[memberIndex].paid = isFullyPaid;
    currentData.cheeti[memberIndex].paymentDate = paymentDate;
    currentData.cheeti[memberIndex].lateFee = finalLateFee;
    currentData.cheeti[memberIndex].total = totalDue;
    currentData.cheeti[memberIndex].paidAmount = paidAmount;
    currentData.cheeti[memberIndex].receiver = receiver;
    currentData.cheeti[memberIndex].paymentMode = paymentMode;
    currentData.cheeti[memberIndex].paymentHistory = member.paymentHistory || [];
    currentData.cheeti[memberIndex].paymentHistory.push({ amount: paymentAmount, date: paymentDate, receiver: receiver, paymentMode: paymentMode });
    
    // Store days overdue if applicable
    if (daysOverdue > 0) {
        currentData.cheeti[memberIndex].days_overdue = daysOverdue;
    } else {
        currentData.cheeti[memberIndex].days_overdue = 0;
    }
    
    // Update state
    if (window.DashboardState) {
        window.DashboardState.setCurrentData(currentData);
    } else {
        window.currentData = currentData;
    }
    
    // Track change for draft mode
    trackChange('edit', 'cheeti', {
        type: 'payment_update',
        old: oldMember,
        new: {
            name: member.name,
            paid: isFullyPaid,
            paymentDate,
            lateFee: finalLateFee,
            total: totalDue,
            paidAmount,
            receiver,
            paymentMode
        },
        index: memberIndex
    });
    
    // Every installment is income in the following year; expected collections clear only after full payment.
    await addCheetiCollectionToCurrentYear(member.name, paymentAmount, paymentDate, { isFinalPayment: isFullyPaid });
    
    // Update draft mode UI to show unpublished changes
    if (typeof updateDraftModeUI === 'function') {
        updateDraftModeUI();
    }
    
    // Update UI immediately to show payment status change
    if (typeof processData === 'function') {
        processData();
    }
    
    // Clear form
    document.getElementById('cheetiMemberSelect').value = '';
    document.getElementById('repaymentDate').value = '';
    document.getElementById('repaymentAmount').value = '';
    document.getElementById('repaymentLateFee').value = '0';
    document.getElementById('repaymentPaid').checked = false;
    const repaymentReceiverEl = document.getElementById('repaymentReceiver');
    if (repaymentReceiverEl) repaymentReceiverEl.value = '';
    const repaymentModeEl = document.getElementById('repaymentMode');
    if (repaymentModeEl) repaymentModeEl.value = '';
    const memberDetails = document.getElementById('memberDetails');
    if (memberDetails) memberDetails.style.display = 'none';
    
    // Clear auto-calculation UI elements
    const adminLateFeeInfo = document.getElementById('adminLateFeeInfo');
    const adminLateFeeAutoCalc = document.getElementById('adminLateFeeAutoCalc');
    if (adminLateFeeInfo) adminLateFeeInfo.textContent = '';
    if (adminLateFeeAutoCalc) adminLateFeeAutoCalc.textContent = '';
    
    showSuccess(isFullyPaid ? '✅ Full payment recorded successfully!' : `✅ Partial payment recorded. ₹${(totalDue - paidAmount).toLocaleString('en-IN')} remains.`);
    
    // Save to GitHub (only if not in draft mode)
    const draftMode = window.DashboardState ? window.DashboardState.getDraftMode() : window.draftMode;
    if (!draftMode && typeof saveDataToGitHub === 'function') {
        await saveDataToGitHub();
    }
}

/**
 * Auto-calculate late fee for payment form
 * Updates the payment form UI when payment date changes
 */
function autoCalculateLateFeeForPaymentForm() {
    const dateInput = document.getElementById('repaymentDate');
    const lateFeeInput = document.getElementById('repaymentLateFee');
    const lateFeeInfo = document.getElementById('adminLateFeeInfo');
    const lateFeeAutoCalc = document.getElementById('adminLateFeeAutoCalc');
    const totalDueDisplay = document.getElementById('memberTotalDue');
    const remainingAmountDisplay = document.getElementById('memberRemainingAmount');
    const memberSelect = document.getElementById('cheetiMemberSelect');
    
    if (!dateInput || !dateInput.value || !memberSelect || !memberSelect.value) return;
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    const memberIndex = memberSelect.value;
    if (!currentData.cheeti || !currentData.cheeti[memberIndex]) return;
    
    const member = currentData.cheeti[memberIndex];
    const paymentDate = dateInput.value;
    const calculatedLateFee = calculateLateFee(paymentDate);
    const daysOverdue = getDaysOverdue(paymentDate);
    
    if (daysOverdue > 0 && currentData.cheeti_settings) {
        const lateFeePerDay = currentData.cheeti_settings.late_fee_per_day || 50;
        
        // Update late fee input
        if (lateFeeInput) lateFeeInput.value = calculatedLateFee;
        
        // Show calculation info
        if (lateFeeInfo) {
            lateFeeInfo.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: #ff9800;"></i> ${daysOverdue} day(s) overdue × ₹${lateFeePerDay}/day = ₹${calculatedLateFee.toLocaleString('en-IN')}`;
        }
        
        if (lateFeeAutoCalc) {
            lateFeeAutoCalc.textContent = '(Auto-calculated)';
        }
        
        // Update total due and remaining amount displays
        const newTotal = (member.amount || 0) + (member.interest || 0) + calculatedLateFee;
        if (totalDueDisplay) {
            totalDueDisplay.textContent = `₹${newTotal.toLocaleString('en-IN')}`;
        }
        if (remainingAmountDisplay) {
            const paidAmount = member.paidAmount || 0;
            remainingAmountDisplay.textContent = `₹${Math.max(0, newTotal - paidAmount).toLocaleString('en-IN')}`;
        }
    } else {
        // No late fee
        if (lateFeeInfo) lateFeeInfo.textContent = '';
        if (lateFeeAutoCalc) lateFeeAutoCalc.textContent = '';
        if (lateFeeInput) lateFeeInput.value = 0;
        
        // Reset total due and remaining amount displays
        if (member) {
            const newTotal = (member.amount || 0) + (member.interest || 0);
            if (totalDueDisplay) {
                totalDueDisplay.textContent = `₹${newTotal.toLocaleString('en-IN')}`;
            }
            if (remainingAmountDisplay) {
                const paidAmount = member.paidAmount || 0;
                remainingAmountDisplay.textContent = `₹${Math.max(0, newTotal - paidAmount).toLocaleString('en-IN')}`;
            }
        }
    }
}

/**
 * Set Cheeti Cutover Date
 * Sets the deadline by which cheeti members must pay back their loans
 * Any payment after this date incurs a late fee
 */
async function setCheetiCutoverDate() {
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const cutoverDate = document.getElementById('cheetiCutoverDate').value;
    const lateFeePerDay = parseFloat(document.getElementById('cheetiLateFeePerDay').value) || 50;
    
    if (!cutoverDate) {
        showError('Please select a cutover date');
        return;
    }
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    // Validate cutover date is in the next year
    const selectedYear = parseInt(currentData.year);
    const cutoverYear = new Date(cutoverDate).getFullYear();
    const expectedYear = selectedYear + 1;
    
    if (cutoverYear !== expectedYear) {
        showError(`⚠️ Cutover date should be in ${expectedYear} (next year). Members who borrowed in ${selectedYear} must pay in ${expectedYear}.`);
        return;
    }
    
    // Store in current year data
    if (!currentData.cheeti_settings) {
        currentData.cheeti_settings = {};
    }
    
    currentData.cheeti_settings.cutover_date = cutoverDate;
    currentData.cheeti_settings.late_fee_per_day = lateFeePerDay;
    
    // Update state
    if (window.DashboardState) {
        window.DashboardState.setCurrentData(currentData);
    } else {
        window.currentData = currentData;
    }
    
    // Track change in draft mode
    trackChange('update', 'cheeti_settings', { 
        action: 'Set cutover date',
        cutover_date: cutoverDate,
        late_fee_per_day: lateFeePerDay
    });
    
    // Update display
    updateCutoverDisplay();
    
    const formattedDate = new Date(cutoverDate).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    showSuccess(`✅ Cutover date set! Members must pay by ${formattedDate}.`);
    
    // Save to GitHub (only if not in draft mode)
    const draftMode = window.DashboardState ? window.DashboardState.getDraftMode() : window.draftMode;
    if (!draftMode && typeof saveDataToGitHub === 'function') {
        await saveDataToGitHub();
    }
}

/**
 * Update Cutover Date Display
 * Shows current cutover date settings in the UI
 */
function updateCutoverDisplay() {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    // Check if currentData is loaded
    if (!currentData) {
        console.log('currentData not yet loaded, skipping cutover display update');
        return;
    }
    
    const infoDiv = document.getElementById('currentCutoverInfo');
    const dateDisplay = document.getElementById('cutoverDateDisplay');
    const feeDisplay = document.getElementById('lateFeeRateDisplay');
    const appliesTo = document.getElementById('cutoverAppliesTo');
    
    const selectedYear = parseInt(currentData.year);
    const hasSettings = currentData && currentData.cheeti_settings && currentData.cheeti_settings.cutover_date;
    
    if (hasSettings) {
        const cutoverDate = new Date(currentData.cheeti_settings.cutover_date);
        const lateFeePerDay = currentData.cheeti_settings.late_fee_per_day || 50;
        
        if (infoDiv) infoDiv.style.display = 'block';
        if (dateDisplay) dateDisplay.textContent = cutoverDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        if (feeDisplay) feeDisplay.textContent = `₹${lateFeePerDay}/day`;
        if (appliesTo) appliesTo.textContent = `Payment deadline for ${selectedYear} members`;
        
        // Update form fields with existing values
        const dateInput = document.getElementById('cheetiCutoverDate');
        const feeInput = document.getElementById('cheetiLateFeePerDay');
        if (dateInput) dateInput.value = currentData.cheeti_settings.cutover_date;
        if (feeInput) feeInput.value = lateFeePerDay;
    } else {
        if (infoDiv) infoDiv.style.display = 'none';
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.addCheetiMember = addCheetiMember;
    window.editCheetiMemberEntry = editCheetiMemberEntry;
    window.saveCheetiMemberEntry = saveCheetiMemberEntry;
    window.saveCheetiMemberFromModal = saveCheetiMemberFromModal;
    window.cancelCheetiMemberEdit = cancelCheetiMemberEdit;
    window.calculateCheetiInterest = calculateCheetiInterest;
    window.validateCheetiMember = validateCheetiMember;
    window.updateCheetiForm = updateCheetiForm;
    window.populateMemberDropdown = populateMemberDropdown;
    window.populateReceiverDropdown = populateReceiverDropdown;
    window.populatePaymentModeDropdown = populatePaymentModeDropdown;
    window.loadMemberDetails = loadMemberDetails;
    window.populateCheetiTable = populateCheetiTable;
    window.showCheetiPaymentHistory = showCheetiPaymentHistory;
    window.populateCheetiReceiverFilterOptions = populateCheetiReceiverFilterOptions;
    window.filterCheetiTable = filterCheetiTable;
    window.clearCheetiFilters = clearCheetiFilters;
    window.updateMemberCutoverNotice = updateMemberCutoverNotice;
    window.populateCheetiPaidTable = populateCheetiPaidTable;
    window.editCheetiEntry = editCheetiEntry;
    window.saveCheetiPaymentFromModal = saveCheetiPaymentFromModal;
    window.calculateLateFee = calculateLateFee;
    window.getDaysOverdue = getDaysOverdue;
    window.autoCalculateLateFee = autoCalculateLateFee;
    window.autoCalculateLateFeeForPaymentForm = autoCalculateLateFeeForPaymentForm;
    window.addCheetiCollectionToCurrentYear = addCheetiCollectionToCurrentYear;
    window.recordPayment = recordPayment;
    window.setCheetiCutoverDate = setCheetiCutoverDate;
    window.updateCutoverDisplay = updateCutoverDisplay;
}
