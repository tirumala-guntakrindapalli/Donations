/**
 * Sponsors Feature Module
 * Handles sponsor management and custom sponsor types
 */

/**
 * Toggle custom sponsor type field visibility
 * Shows/hides custom type input when "Other" is selected
 */
function toggleCustomSponsorType() {
    const typeSelect = document.getElementById('sponsorType');
    const customTypeGroup = document.getElementById('customSponsorTypeGroup');
    const customTypeInput = document.getElementById('customSponsorType');
    
    if (typeSelect && customTypeGroup) {
        if (typeSelect.value === 'Other') {
            customTypeGroup.style.display = 'block';
            if (customTypeInput) customTypeInput.focus();
        } else {
            customTypeGroup.style.display = 'none';
            if (customTypeInput) customTypeInput.value = '';
        }
    }
}

/**
 * Add a new sponsor
 * Validates for duplicate name+type combinations and required fields
 */
function addSponsor() {
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const name = document.getElementById('sponsorName').value.trim();
    let type = document.getElementById('sponsorType').value;
    const customType = document.getElementById('customSponsorType').value.trim();
    const amount = parseFloat(document.getElementById('sponsorAmount').value) || 0;
    
    // If "Other" is selected, use custom type
    if (type === 'Other') {
        if (!customType) {
            showError('Please enter a custom sponsorship type');
            return;
        }
        type = customType;
    }
    
    if (!name || !type) {
        showError('Please enter sponsor name and type');
        return;
    }
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    // Initialize sponsors array if it doesn't exist
    if (!currentData.sponsors) currentData.sponsors = [];
    
    // Check for duplicate sponsor (same name and type combination)
    const duplicate = currentData.sponsors.find(s => 
        s.name.toLowerCase() === name.toLowerCase() && 
        s.type.toLowerCase() === type.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Sponsor "${name}" with type "${type}" already exists. Duplicate sponsors not allowed.`);
        return;
    }
    
    const newSponsor = {
        slNo: currentData.sponsors.length + 1,
        name: name,
        type: type,
        amount: amount
    };
    
    currentData.sponsors.push(newSponsor);
    
    // Update state
    if (window.DashboardState) {
        window.DashboardState.setCurrentData(currentData);
    } else {
        window.currentData = currentData;
    }
    
    // Track change for draft mode (use new object to avoid reference issues)
    trackChange('add', 'sponsor', { name, type, amount });
    
    // Clear form
    document.getElementById('sponsorName').value = '';
    document.getElementById('sponsorType').value = '';
    document.getElementById('customSponsorType').value = '';
    document.getElementById('customSponsorTypeGroup').style.display = 'none';
    document.getElementById('sponsorAmount').value = '';
    
    showSuccess('✅ Sponsor added successfully!');
    
    // Update announcements
    if (typeof updateAnnouncements === 'function') {
        updateAnnouncements();
    }
    
    // Update sponsors management list
    updateSponsorsManagementList();
    
    // Process data to update UI
    if (typeof processData === 'function') {
        processData();
    }
}

/**
 * Update sponsors management list UI
 * Shows all current sponsors with delete buttons
 */
function updateSponsorsManagementList() {
    const listContainer = document.getElementById('sponsorsManagementList');
    if (!listContainer) return;
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const sponsors = currentData.sponsors || [];
    
    let html = '';
    
    html += `
        <div style="background: white; padding: 15px; border-radius: 8px; border: 2px solid #ff9800;">
            <h5 style="margin: 0 0 12px 0; color: #e65100;">
                <i class="fas fa-hands-helping"></i> Current Sponsors
                ${sponsors.length > 0 ? `<span style="font-size: 12px; color: #666; font-weight: normal;"> - ${sponsors.length} sponsor(s)</span>` : ''}
            </h5>
    `;
    
    if (sponsors.length === 0) {
        html += `
            <div style="text-align: center; padding: 20px; color: #999;">
                <i class="fas fa-hands-helping" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
                <p style="margin: 0;">No sponsors added yet</p>
            </div>
        `;
    } else {
        html += `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${sponsors.map((sponsor, index) => {
                    const formattedAmount = typeof formatCurrency === 'function' ? formatCurrency(sponsor.amount) : `₹${sponsor.amount}`;
                    return `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #fff3e0; border-radius: 6px; border-left: 4px solid #ff9800;">
                            <div style="flex: 1;">
                                <strong style="color: #333;">${sponsor.name}</strong>
                                <span style="margin-left: 10px; padding: 3px 10px; background: #ff9800; color: white; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                    ${sponsor.type}
                                </span>
                                ${sponsor.amount > 0 ? `<span style="margin-left: 10px; color: #2e7d32; font-weight: 600;">${formattedAmount}</span>` : ''}
                            </div>
                            <button onclick="deleteSponsor(${index})" style="padding: 6px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Remove sponsor">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    html += '</div>';
    
    listContainer.innerHTML = html;
}

/**
 * Delete a sponsor
 * @param {number} index - Index of sponsor to delete
 */
async function deleteSponsor(index) {
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    if (!currentData.sponsors || !currentData.sponsors[index]) {
        showError('Sponsor not found');
        return;
    }
    
    const sponsor = currentData.sponsors[index];
    
    // Show confirmation dialog
    const confirmation = await showCustomConfirm({
        title: '🗑️ Delete Sponsor',
        message: `<div style="text-align: center;"><p style="margin-bottom: 15px; font-size: 1.05rem;">Delete this sponsor?</p><p style="font-size: 1.2rem; font-weight: 700; color: #2c3e50; margin-bottom: 5px;">${sponsor.name}</p><p style="font-size: 0.95rem; color: #666; margin-bottom: 15px;">${sponsor.type}</p><p style="color: #e74c3c; font-weight: 600;"><i class="fas fa-exclamation-triangle"></i> This action cannot be undone.</p></div>`,
        icon: 'fas fa-trash-alt',
        iconColor: '#e74c3c',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmBtnStyle: 'background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);'
    });
    
    if (!confirmation) return;
    
    // Remove the sponsor
    const deletedSponsor = currentData.sponsors.splice(index, 1)[0];
    
    // Renumber slNo for remaining sponsors
    if (currentData.sponsors.length > 0 && currentData.sponsors[0].hasOwnProperty('slNo')) {
        currentData.sponsors.forEach((item, idx) => {
            item.slNo = idx + 1;
        });
    }
    
    // Update state
    if (window.DashboardState) {
        window.DashboardState.setCurrentData(currentData);
    } else {
        window.currentData = currentData;
    }
    
    // Track change for draft mode
    trackChange('delete', 'sponsor', { index, item: deletedSponsor });
    
    // Update sponsors list
    updateSponsorsManagementList();
    
    // Update announcements
    if (typeof updateAnnouncements === 'function') {
        updateAnnouncements();
    }
    
    // Refresh UI
    if (typeof processData === 'function') {
        processData();
    }
    
    showSuccess('✅ Sponsor deleted successfully');
}

/**
 * Validate sponsor data
 * @param {string} name - Sponsor name
 * @param {string} type - Sponsor type
 * @param {number} excludeIndex - Index to exclude from duplicate check (for editing)
 * @returns {Object} Validation result {valid: boolean, error: string}
 */
function validateSponsor(name, type, excludeIndex = -1) {
    if (!name || name.trim().length === 0) {
        return { valid: false, error: 'Name is required' };
    }
    
    if (!type || type.trim().length === 0) {
        return { valid: false, error: 'Type is required' };
    }
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const sponsors = currentData.sponsors || [];
    
    // Check for duplicate name+type combination
    const duplicate = sponsors.find((s, i) => 
        i !== excludeIndex && 
        s.name.toLowerCase() === name.toLowerCase() &&
        s.type.toLowerCase() === type.toLowerCase()
    );
    
    if (duplicate) {
        return { valid: false, error: `Sponsor "${name}" with type "${type}" already exists` };
    }
    
    return { valid: true };
}

// Export for global access
if (typeof window !== 'undefined') {
    window.toggleCustomSponsorType = toggleCustomSponsorType;
    window.addSponsor = addSponsor;
    window.deleteSponsor = deleteSponsor;
    window.updateSponsorsManagementList = updateSponsorsManagementList;
    window.validateSponsor = validateSponsor;
}
