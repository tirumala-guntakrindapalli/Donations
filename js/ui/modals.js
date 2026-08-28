/**
 * Modal Management System
 * Handles all modal dialogs in the application
 */

// =============================================================================
// LOGIN MODAL
// =============================================================================

/**
 * Show login dialog
 */
function showLoginDialog() {
    console.log('🔐 showLoginDialog called');
    const modal = document.getElementById('loginModal');
    const passwordInput = document.getElementById('adminPassword');
    
    if (modal) {
        console.log('✅ loginModal found, showing...', { 
            currentDisplay: modal.style.display,
            hasShowClass: modal.classList.contains('show')
        });
        
        // Prevent body scroll
        document.body.classList.add('modal-open');
        
        // Scroll to top before showing modal
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        // Remove inline display style if it exists (let CSS class control it)
        modal.style.display = '';
        
        modal.classList.add('show');
        
        // Focus on password input after a short delay
        setTimeout(() => {
            if (passwordInput) {
                passwordInput.focus();
                passwordInput.value = ''; // Clear any previous input
            }
        }, 150);
    }
}

/**
 * Hide login dialog
 */
function hideLoginDialog() {
    const modal = document.getElementById('loginModal');
    const passwordInput = document.getElementById('adminPassword');
    
    if (modal) {
        modal.classList.remove('show');
    }
    
    // Re-enable body scroll
    document.body.classList.remove('modal-open');
    
    if (passwordInput) {
        passwordInput.value = '';
        passwordInput.type = 'password';
        const toggleIcon = document.querySelector('#togglePassword i');
        if (toggleIcon) {
            toggleIcon.className = 'fas fa-eye';
        }
    }
}

/**
 * Toggle password visibility in login dialog
 */
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('adminPassword');
    const toggleIcon = document.querySelector('#togglePassword i');
    
    if (passwordInput && toggleIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            toggleIcon.className = 'fas fa-eye';
        }
    }
}

// =============================================================================
// CONFIRMATION MODAL
// =============================================================================

/**
 * Show basic confirmation modal
 */
function showConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.add('show');
        document.body.classList.add('modal-open');
    }
}

/**
 * Hide confirmation modal
 */
function hideConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
    }
}

// =============================================================================
// CUSTOM CONFIRMATION MODAL
// =============================================================================

/**
 * Show custom confirmation dialog with promise-based response
 * @param {object} options - Modal options
 * @param {string} options.title - Modal title
 * @param {string} options.message - Modal message (HTML allowed)
 * @param {string} options.icon - FontAwesome icon class
 * @param {string} options.iconClass - CSS class for header
 * @param {string} options.iconColor - Icon color
 * @param {string} options.confirmText - Confirm button text
 * @param {string} options.cancelText - Cancel button text
 * @param {string} options.confirmBtnStyle - Inline CSS for confirm button
 * @returns {Promise<boolean>} True if confirmed, false if cancelled
 */
function showCustomConfirm({ title, message, icon, iconClass, iconColor, confirmText, cancelText, confirmBtnStyle }) {
    // Debug logging to track modal calls with stack trace
    console.log('🔔 showCustomConfirm called:', { title, confirmText, cancelText });
    console.trace('Call stack:');
    
    // Safety check - don't show modal if no meaningful content
    if (!title && !message) {
        console.warn('⚠️ showCustomConfirm called with no title/message - ignoring');
        return Promise.resolve(false);
    }
    
    return new Promise((resolve) => {
        const modal = document.getElementById('customConfirmModal');
        
        // Defensive check - ensure modal exists
        if (!modal) {
            console.error('customConfirmModal not found');
            resolve(false);
            return;
        }
        
        const titleEl = document.getElementById('customConfirmTitle');
        const messageEl = document.getElementById('customConfirmMessage');
        const iconEl = document.getElementById('customConfirmIcon');
        const headerEl = document.getElementById('customConfirmHeader');
        const confirmTextEl = document.getElementById('customConfirmProceedText');
        const cancelTextEl = document.getElementById('customConfirmCancelText');
        const confirmBtn = document.getElementById('customConfirmProceedBtn');
        const cancelBtn = document.getElementById('customConfirmCancelBtn');

        // Set content
        if (titleEl) titleEl.textContent = title || 'Confirm Action';
        if (messageEl) messageEl.innerHTML = message || 'Are you sure?';
        if (confirmTextEl) confirmTextEl.textContent = confirmText || 'Confirm';
        if (cancelTextEl) cancelTextEl.textContent = cancelText || 'Cancel';
        
        // Hide cancel button if cancelText is empty or not provided
        if (cancelBtn) {
            if (!cancelText || cancelText.trim() === '') {
                cancelBtn.style.display = 'none';
            } else {
                cancelBtn.style.display = '';
            }
        }

        // Set icon and color
        if (iconEl) {
            iconEl.className = icon || 'fas fa-question-circle';
            iconEl.style.color = iconColor || '#e74c3c';
            iconEl.style.filter = iconColor ? `drop-shadow(0 4px 8px ${iconColor}40)` : 'drop-shadow(0 4px 8px rgba(231, 76, 60, 0.3))';
        }

        // Set header class for color
        if (headerEl && iconClass) {
            headerEl.className = 'confirm-modal-header ' + iconClass;
        }

        // Set confirm button style
        if (confirmBtn && confirmBtnStyle) {
            confirmBtn.style.cssText = confirmBtnStyle;
        } else if (confirmBtn) {
            confirmBtn.style.cssText = '';
        }

        // Show modal
        if (modal) {
            modal.style.display = 'flex';
            document.body.classList.add('modal-open');
            console.log('✅ Modal displayed');
        }

        // Handle confirm
        const handleConfirm = () => {
            cleanup();
            resolve(true);
        };

        // Handle cancel
        const handleCancel = () => {
            cleanup();
            resolve(false);
        };

        // Cleanup function
        const cleanup = () => {
            if (modal) {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
                console.log('✅ Modal hidden');
            }
            if (confirmBtn) confirmBtn.removeEventListener('click', handleConfirm);
            if (cancelBtn && cancelText && cancelText.trim() !== '') {
                cancelBtn.removeEventListener('click', handleCancel);
            }
            document.removeEventListener('keydown', handleEscape);
        };

        // Attach event listeners
        if (confirmBtn) confirmBtn.addEventListener('click', handleConfirm);
        if (cancelBtn && cancelText && cancelText.trim() !== '') {
            cancelBtn.addEventListener('click', handleCancel);
        }

        // Close on escape key (only if cancel button is visible - i.e., not an "Okay" only modal)
        const handleEscape = (e) => {
            if (e.key === 'Escape' && cancelText && cancelText.trim() !== '') {
                cleanup();
                resolve(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
    });
}

// =============================================================================
// EDIT MODAL
// =============================================================================

/**
 * Show edit modal for different data types
 * @param {string} type - Edit type: 'donor', 'cheeti', 'expense', 'cheeti-payment'
 * @param {number} index - Index of item to edit
 */
function showEditModal(type, index) {
    const modal = document.getElementById('editModal');
    const title = document.getElementById('editModalTitle');
    const body = document.getElementById('editModalBody');
    
    // Store current edit context
    if (typeof window.DashboardState !== 'undefined') {
        DashboardState.setCurrentEditType(type);
        DashboardState.setCurrentEditIndex(index);
    } else {
        window.currentEditType = type;
        window.currentEditIndex = index;
    }
    
    body.innerHTML = ''; // Clear previous content
    
    const currentData = window.currentData || (window.DashboardState && DashboardState.getCurrentData());
    
    if (type === 'donor') {
        const donor = currentData.donations[index];
        title.textContent = 'Edit Donor';
        body.innerHTML = `
            <div class="edit-form-group">
                <label for="editName">Name</label>
                <input type="text" id="editName" value="${donor.name}" required>
            </div>
            <div class="edit-form-group">
                <label for="editAmount">Amount (₹)</label>
                <input type="number" id="editAmount" value="${donor.amount}" min="0" step="1" required>
            </div>
        `;
    } else if (type === 'cheeti') {
        const member = currentData.cheeti[index];
        title.textContent = 'Edit Cheeti Member';
        body.innerHTML = `
            <div class="edit-form-group">
                <label for="editName">Name</label>
                <input type="text" id="editName" value="${member.name}" required>
            </div>
            <div class="edit-form-group">
                <label for="editAmount">Amount (₹)</label>
                <input type="number" id="editAmount" value="${member.amount}" min="0" step="1" required>
            </div>
            <p style="color: #7f8c8d; font-size: 0.9rem; margin-top: 10px;">
                <i class="fas fa-info-circle"></i> Interest will be calculated automatically at 12%
            </p>
        `;
    } else if (type === 'expense') {
        const expense = currentData.expenses[index];
        title.textContent = 'Edit Expense';
        body.innerHTML = `
            <div class="edit-form-group">
                <label for="editItem">Item</label>
                <input type="text" id="editItem" value="${expense.item}" required>
            </div>
            <div class="edit-form-group">
                <label for="editAmount">Amount (₹)</label>
                <input type="number" id="editAmount" value="${expense.amount}" min="0" step="1" required>
            </div>
        `;
    } else if (type === 'cheeti-payment') {
        const member = currentData.cheeti[index];
        title.textContent = 'Edit Payment Details';
        const dateValue = member.paymentDate || '';
        
        // Check if cutover date is set
        let cutoverInfo = '';
        if (currentData.cheeti_settings && currentData.cheeti_settings.cutover_date) {
            const cutoverDate = new Date(currentData.cheeti_settings.cutover_date);
            const lateFeePerDay = currentData.cheeti_settings.late_fee_per_day || 50;
            cutoverInfo = `
                <div style="background: #fff3e0; padding: 12px; border-radius: 6px; margin-bottom: 15px; border-left: 3px solid #ff9800;">
                    <div style="color: #e65100; font-size: 0.85rem;">
                        <i class="fas fa-calendar-times"></i> <strong>Payment Deadline:</strong> ${cutoverDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
                        <i class="fas fa-money-bill-wave"></i> <strong>Late Fee Rate:</strong> ₹${lateFeePerDay}/day after deadline
                    </div>
                </div>
            `;
        }
        
        body.innerHTML = `
            ${cutoverInfo}
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Member: ${member.name}</h4>
                <p style="margin: 5px 0; color: #7f8c8d;">Principal: ${formatCurrency(member.amount)}</p>
                <p style="margin: 5px 0; color: #7f8c8d;">Interest: ${formatCurrency(member.interest || 0)}</p>
            </div>
            <div class="edit-form-group">
                <label for="editPaymentDate">Payment Date</label>
                <input type="date" id="editPaymentDate" value="${dateValue}" onchange="autoCalculateLateFee()">
            </div>
            <div class="edit-form-group">
                <label for="editLateFee">Late Fee (₹) <span id="lateFeeAutoCalc" style="color: #ff9800; font-size: 0.85rem;"></span></label>
                <input type="number" id="editLateFee" value="${member.lateFee || 0}" min="0" step="1">
                <div id="lateFeeInfo" style="color: #666; font-size: 0.85rem; margin-top: 5px;"></div>
            </div>
            <div class="edit-form-group">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                    <input type="checkbox" id="editPaid" ${member.paid ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;">
                    <span>Payment Received</span>
                </label>
            </div>
            <p style="color: #7f8c8d; font-size: 0.9rem; margin-top: 15px;">
                <i class="fas fa-info-circle"></i> Total Due: <span id="totalDueAmount">${formatCurrency((member.amount || 0) + (member.interest || 0) + (member.lateFee || 0))}</span>
            </p>
        `;
        
        // Auto-calculate late fee if payment date is set
        setTimeout(() => {
            if (typeof autoCalculateLateFee === 'function') {
                autoCalculateLateFee();
            }
        }, 100);
    }
    
    modal.classList.add('show');
    document.body.classList.add('modal-open');
}

/**
 * Hide edit modal
 */
function hideEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    
    // Clear edit context
    if (typeof window.DashboardState !== 'undefined') {
        DashboardState.setCurrentEditType(null);
        DashboardState.setCurrentEditIndex(null);
    } else {
        window.currentEditType = null;
        window.currentEditIndex = null;
    }
}

/**
 * Save edit modal - delegates to appropriate save function
 */
function saveEditModal() {
    const currentEditType = window.currentEditType || (window.DashboardState && DashboardState.getCurrentEditType());
    const currentEditIndex = window.currentEditIndex || (window.DashboardState && DashboardState.getCurrentEditIndex());
    
    if (currentEditType === 'donor') {
        saveDonorFromModal(currentEditIndex);
    } else if (currentEditType === 'cheeti') {
        saveCheetiMemberFromModal(currentEditIndex);
    } else if (currentEditType === 'expense') {
        saveExpenseFromModal(currentEditIndex);
    } else if (currentEditType === 'cheeti-payment') {
        saveCheetiPaymentFromModal(currentEditIndex);
    }
}

// =============================================================================
// COMMITTEE DELETE MODAL
// =============================================================================

/**
 * Show committee member delete confirmation
 * @param {number} index - Index of committee member to delete
 */
function showCommitteeDeleteModal(index) {
    const currentData = window.currentData || (window.DashboardState && DashboardState.getCurrentData());
    
    if (!currentData.committee_next_year || !currentData.committee_next_year[index]) {
        showError('Committee member not found');
        return;
    }
    
    const member = currentData.committee_next_year[index];
    
    // Store pending delete index
    if (typeof window.DashboardState !== 'undefined') {
        DashboardState.setPendingDeleteIndex(index);
    } else {
        window.pendingDeleteIndex = index;
    }
    
    const modal = document.getElementById('committeeDeleteModal');
    const message = document.getElementById('committeeDeleteMessage');
    
    if (modal && message) {
        message.innerHTML = `<p style="margin: 0; font-size: 15px; color: #333;">Are you sure you want to remove <strong>${member.name}</strong> (<strong>${member.role}</strong>) from next year's committee?</p>`;
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }
}

/**
 * Hide committee delete confirmation modal
 */
function hideCommitteeDeleteModal() {
    const modal = document.getElementById('committeeDeleteModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        
        // Clear pending delete index
        if (typeof window.DashboardState !== 'undefined') {
            DashboardState.setPendingDeleteIndex(null);
        } else {
            window.pendingDeleteIndex = null;
        }
    }
}

/**
 * Confirm committee member deletion
 */
function confirmCommitteeDelete() {
    const pendingDeleteIndex = window.pendingDeleteIndex || (window.DashboardState && DashboardState.getPendingDeleteIndex());
    
    if (pendingDeleteIndex === null) return;
    
    // Call delete function (defined in committee manager)
    if (typeof deleteCommitteeMember === 'function') {
        deleteCommitteeMember(pendingDeleteIndex);
    }
    
    hideCommitteeDeleteModal();
}

// Export for global access
if (typeof window !== 'undefined') {
    window.showLoginDialog = showLoginDialog;
    window.hideLoginDialog = hideLoginDialog;
    window.togglePasswordVisibility = togglePasswordVisibility;
    window.showConfirmModal = showConfirmModal;
    window.hideConfirmModal = hideConfirmModal;
    window.showCustomConfirm = showCustomConfirm;
    window.showEditModal = showEditModal;
    window.hideEditModal = hideEditModal;
    window.saveEditModal = saveEditModal;
    window.showCommitteeDeleteModal = showCommitteeDeleteModal;
    window.hideCommitteeDeleteModal = hideCommitteeDeleteModal;
    window.confirmCommitteeDelete = confirmCommitteeDelete;
}
