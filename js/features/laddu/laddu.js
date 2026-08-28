/**
 * Laddu Winners Feature Module
 * Handles laddu winner management (limited to one winner)
 */

/**
 * Add a new laddu winner
 * Only one winner is allowed at a time
 */
function addLadduWinner() {
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const name = document.getElementById('winnerName').value.trim();
    const amount = parseFloat(document.getElementById('winnerAmount').value) || 0;
    
    if (!name) {
        showError('Please enter winner name');
        return;
    }
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    // Initialize laddu_winners array if it doesn't exist
    if (!currentData.laddu_winners) currentData.laddu_winners = [];
    
    // Check if there's already a winner - only one winner allowed
    if (currentData.laddu_winners.length > 0) {
        showError('❌ A laddu winner already exists. Only one winner is allowed. Please delete the existing winner first.');
        return;
    }
    
    const newWinner = {
        slNo: currentData.laddu_winners.length + 1,
        name: name,
        amount: amount,
        date: new Date().toISOString()
    };
    
    currentData.laddu_winners.push(newWinner);
    
    // Update state
    if (window.DashboardState) {
        window.DashboardState.setCurrentData(currentData);
    } else {
        window.currentData = currentData;
    }
    
    // Track change for draft mode (use new object to avoid reference issues)
    trackChange('add', 'laddu', { name, amount });
    
    // Clear form
    document.getElementById('winnerName').value = '';
    document.getElementById('winnerAmount').value = '';
    
    showSuccess('✅ Laddu winner added successfully!');
    
    // Update announcements
    if (typeof updateAnnouncements === 'function') {
        updateAnnouncements();
    }
    
    // Update laddu winners management list
    updateLadduWinnersManagementList();
    
    // Process data to update UI
    if (typeof processData === 'function') {
        processData();
    }
}

/**
 * Update laddu winners management list UI
 * Shows current winner with delete button
 */
function updateLadduWinnersManagementList() {
    const listContainer = document.getElementById('ladduWinnersManagementList');
    if (!listContainer) return;
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const winners = currentData.laddu_winners || [];
    
    let html = '';
    
    html += `
        <div style="background: white; padding: 15px; border-radius: 8px; border: 2px solid #9c27b0;">
            <h5 style="margin: 0 0 12px 0; color: #6a1b9a;">
                <i class="fas fa-trophy"></i> Laddu Winners
                ${winners.length > 0 ? `<span style="font-size: 12px; color: #666; font-weight: normal;"> - ${winners.length} winner(s)</span>` : ''}
            </h5>
    `;
    
    if (winners.length === 0) {
        html += `
            <div style="text-align: center; padding: 20px; color: #999;">
                <i class="fas fa-trophy" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
                <p style="margin: 0;">No laddu winners added yet</p>
            </div>
        `;
    } else {
        html += `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${winners.map((winner, index) => {
                    const winDate = winner.date ? new Date(winner.date).toLocaleDateString('en-IN') : '';
                    const formattedAmount = typeof formatCurrency === 'function' ? formatCurrency(winner.amount) : `₹${winner.amount}`;
                    return `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #f3e5f5; border-radius: 6px; border-left: 4px solid #9c27b0;">
                            <div style="flex: 1;">
                                <strong style="color: #333;">${winner.name}</strong>
                                ${winner.amount > 0 ? `<span style="margin-left: 10px; color: #2e7d32; font-weight: 600;">${formattedAmount}</span>` : ''}
                                ${winDate ? `<span style="margin-left: 10px; color: #666; font-size: 12px;"><i class="fas fa-calendar"></i> ${winDate}</span>` : ''}
                            </div>
                            <button onclick="deleteLadduWinner(${index})" style="padding: 6px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Remove winner">
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
 * Delete a laddu winner
 * @param {number} index - Index of winner to delete
 */
async function deleteLadduWinner(index) {
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    if (!currentData.laddu_winners || !currentData.laddu_winners[index]) {
        showError('Laddu winner not found');
        return;
    }
    
    const winner = currentData.laddu_winners[index];
    
    // Show confirmation dialog
    const confirmation = await showCustomConfirm({
        title: '🗑️ Delete Winner',
        message: `<div style="text-align: center;"><p style="margin-bottom: 15px; font-size: 1.05rem;">Delete this laddu winner?</p><p style="font-size: 1.2rem; font-weight: 700; color: #2c3e50; margin-bottom: 15px;">${winner.name}</p><p style="color: #e74c3c; font-weight: 600;"><i class="fas fa-exclamation-triangle"></i> This action cannot be undone.</p></div>`,
        icon: 'fas fa-trash-alt',
        iconColor: '#e74c3c',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmBtnStyle: 'background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);'
    });
    
    if (!confirmation) return;
    
    // Remove the winner
    const deletedWinner = currentData.laddu_winners.splice(index, 1)[0];
    
    // Renumber slNo if exists
    if (currentData.laddu_winners.length > 0 && currentData.laddu_winners[0].hasOwnProperty('slNo')) {
        currentData.laddu_winners.forEach((item, idx) => {
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
    trackChange('delete', 'laddu', { index, item: deletedWinner });
    
    // Update laddu winners list
    updateLadduWinnersManagementList();
    
    // Update announcements
    if (typeof updateAnnouncements === 'function') {
        updateAnnouncements();
    }
    
    // Refresh UI
    if (typeof processData === 'function') {
        processData();
    }
    
    showSuccess('✅ Laddu winner deleted successfully');
}

/**
 * Validate laddu winner data
 * @param {string} name - Winner name
 * @param {boolean} checkLimit - Check if limit of 1 winner is reached
 * @returns {Object} Validation result {valid: boolean, error: string}
 */
function validateLadduWinner(name, checkLimit = true) {
    if (!name || name.trim().length === 0) {
        return { valid: false, error: 'Name is required' };
    }
    
    if (checkLimit) {
        const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
        const winners = currentData.laddu_winners || [];
        
        if (winners.length > 0) {
            return { valid: false, error: 'Only one laddu winner is allowed' };
        }
    }
    
    return { valid: true };
}

// Export for global access
if (typeof window !== 'undefined') {
    window.addLadduWinner = addLadduWinner;
    window.deleteLadduWinner = deleteLadduWinner;
    window.updateLadduWinnersManagementList = updateLadduWinnersManagementList;
    window.validateLadduWinner = validateLadduWinner;
}
