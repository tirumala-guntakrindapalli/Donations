/**
 * Draft Mode Manager Module
 * Handles draft mode functionality and change tracking
 * Allows admins to make multiple changes before publishing
 */

/**
 * Update draft mode UI
 * Shows/hides draft controls based on unpublished changes
 */
function updateDraftModeUI() {
    const draftControls = document.getElementById('draftModeControls');
    const countSpan = document.getElementById('unpublishedCount');
    
    const draftMode = window.DashboardState ? window.DashboardState.getDraftMode() : window.draftMode;
    const unpublishedChanges = window.DashboardState ? window.DashboardState.getUnpublishedChanges() : (window.unpublishedChanges || []);
    
    if (draftControls && draftMode && unpublishedChanges.length > 0) {
        draftControls.style.display = 'block';
        if (countSpan) {
            countSpan.textContent = unpublishedChanges.length;
        }
    } else if (draftControls) {
        draftControls.style.display = 'none';
    }
}

/**
 * Track a change in draft mode
 * Smart tracking that handles opposite actions and prevents duplicates
 * @param {string} action - Action type (add, edit, delete, toggle_visibility)
 * @param {string} category - Data category (donation, expense, cheeti, etc.)
 * @param {Object} details - Change details
 */
function trackChange(action, category, details) {
    const draftMode = window.DashboardState ? window.DashboardState.getDraftMode() : window.draftMode;
    const unpublishedChanges = window.DashboardState ? window.DashboardState.getUnpublishedChanges() : (window.unpublishedChanges || []);
    
    if (!draftMode) return;
    
    // Get a unique identifier for the item based on category
    const getItemKey = (cat, det) => {
        // Handle wrapped format from delete: { index, item: {...} }
        const actualItem = (det.item && typeof det.item === 'object') ? det.item : det;
        
        if (cat === 'donation') {
            const name = actualItem.name || '';
            const amount = actualItem.amount || 0;
            return `${name}-${amount}`;
        }
        if (cat === 'expense') {
            const item = actualItem.item || '';
            const amount = actualItem.amount || 0;
            return `${item}-${amount}`;
        }
        if (cat === 'cheeti') {
            const name = actualItem.name || '';
            const amount = actualItem.amount || 0;
            return `${name}-${amount}`;
        }
        if (cat === 'sponsor' || cat === 'sponsors') {
            const name = actualItem.name || '';
            const type = actualItem.type || '';
            return `${name}-${type}`;
        }
        if (cat === 'committee' || cat === 'committee_next' || cat === 'committee_next_year') {
            return actualItem.name;
        }
        if (cat === 'laddu') return actualItem.name;
        return null;
    };
    
    const itemKey = getItemKey(category, details);
    
    // Smart change tracking: handle opposite actions and multiple edits
    if (itemKey) {
        // Check if there's an opposite action for the same item
        if (action === 'delete') {
            // First, check if we have an edit for this item - remove it
            const editIndex = unpublishedChanges.findIndex(c => 
                c.action === 'edit' && 
                c.category === category && 
                c.details.index === details.index
            );
            
            if (editIndex !== -1) {
                // Remove the edit entry when deleting
                unpublishedChanges.splice(editIndex, 1);
            }
            
            // Then check if we're deleting something we just added
            const addIndex = unpublishedChanges.findIndex(c => 
                c.action === 'add' && 
                c.category === category && 
                getItemKey(category, c.details) === itemKey
            );
            
            if (addIndex !== -1) {
                // Remove the add entry - they cancel out
                unpublishedChanges.splice(addIndex, 1);
                if (window.DashboardState) {
                    window.DashboardState.setUnpublishedChanges(unpublishedChanges);
                }
                updateDraftModeUI();
                return; // Don't add the delete entry
            }
        } else if (action === 'add') {
            // If we're adding something we just deleted, remove the delete entry
            const deleteIndex = unpublishedChanges.findIndex(c => 
                c.action === 'delete' && 
                c.category === category && 
                getItemKey(category, c.details) === itemKey
            );
            
            if (deleteIndex !== -1) {
                // Get the deleted item details
                const deletedEntry = unpublishedChanges[deleteIndex];
                const deletedItem = deletedEntry.details.item;
                
                // Remove the delete entry and convert to edit
                unpublishedChanges.splice(deleteIndex, 1);
                
                // Restructure details for edit action
                details = {
                    old: deletedItem,
                    new: details,
                    index: deletedEntry.details.index
                };
                
                // This is effectively an edit, so track it as such
                action = 'edit';
            }
        } else if (action === 'edit') {
            // First check if we're editing something we just added
            const editItemKey = getItemKey(category, details.old);
            const addIndex = unpublishedChanges.findIndex(c => 
                c.action === 'add' && 
                c.category === category && 
                getItemKey(category, c.details) === editItemKey
            );
            
            if (addIndex !== -1) {
                // Update the add entry with the new values (keep it as an add, not edit)
                unpublishedChanges[addIndex] = {
                    timestamp: new Date().toISOString(),
                    action: 'add',
                    category: category,
                    details: details.new // Use the new values from the edit
                };
                if (window.DashboardState) {
                    window.DashboardState.setUnpublishedChanges(unpublishedChanges);
                }
                updateDraftModeUI();
                return; // Don't add a separate edit entry
            }
            
            // If we're editing the same item again, update the existing edit entry
            const existingEditIndex = unpublishedChanges.findIndex(c => 
                c.action === 'edit' && 
                c.category === category && 
                c.details.index === details.index
            );
            
            if (existingEditIndex !== -1) {
                // Update the existing edit entry with new values, but keep original "old" values
                const existingEdit = unpublishedChanges[existingEditIndex];
                unpublishedChanges[existingEditIndex] = {
                    timestamp: new Date().toISOString(),
                    action: 'edit',
                    category: category,
                    details: {
                        ...details,
                        old: existingEdit.details.old // Keep the original "old" values
                    }
                };
                if (window.DashboardState) {
                    window.DashboardState.setUnpublishedChanges(unpublishedChanges);
                }
                updateDraftModeUI();
                return; // Don't add a new entry
            }
        }
    }
    
    // Smart tracking for visibility toggles
    if (action === 'toggle_visibility' && category === 'year_visibility') {
        const year = details.year;
        const newState = details.enabled;
        
        const existingToggleIndex = unpublishedChanges.findIndex(c => 
            c.action === 'toggle_visibility' && 
            c.category === 'year_visibility' && 
            c.details.year === year
        );
        
        if (existingToggleIndex !== -1) {
            // Get the original state from originalData
            const originalData = window.DashboardState ? window.DashboardState.getOriginalData() : window.originalData;
            const originalState = originalData.settings && originalData.settings.dashboard_enabled === true;
            
            // If toggling back to original state, remove the change (cancel out)
            if (newState === originalState) {
                unpublishedChanges.splice(existingToggleIndex, 1);
                if (window.DashboardState) {
                    window.DashboardState.setUnpublishedChanges(unpublishedChanges);
                }
                updateDraftModeUI();
                return;
            } else {
                // Update existing toggle to new state
                unpublishedChanges[existingToggleIndex] = {
                    timestamp: new Date().toISOString(),
                    action: 'toggle_visibility',
                    category: 'year_visibility',
                    details: {
                        year: year,
                        enabled: newState
                    }
                };
                if (window.DashboardState) {
                    window.DashboardState.setUnpublishedChanges(unpublishedChanges);
                }
                updateDraftModeUI();
                return;
            }
        } else {
            // Check if this matches the original state
            const originalData = window.DashboardState ? window.DashboardState.getOriginalData() : window.originalData;
            const originalState = originalData.settings && originalData.settings.dashboard_enabled === true;
            
            // If toggling to the same state as original, don't track it
            if (newState === originalState) {
                return;
            }
        }
    }
    
    // Add the change
    unpublishedChanges.push({
        timestamp: new Date().toISOString(),
        action: action,
        category: category,
        details: details
    });
    
    if (window.DashboardState) {
        window.DashboardState.setUnpublishedChanges(unpublishedChanges);
    }
    
    updateDraftModeUI();
}

/**
 * Publish all unpublished changes
 * Commits all draft changes to GitHub
 * @returns {Promise<void>}
 */
async function publishAllChanges() {
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    const unpublishedChanges = window.DashboardState ? window.DashboardState.getUnpublishedChanges() : (window.unpublishedChanges || []);
    
    if (!isAdmin || unpublishedChanges.length === 0) {
        showError('No changes to publish');
        return;
    }
    
    // Generate and show preview of all changes
    const preview = generateChangesPreview();
    
    const confirmation = await showCustomConfirm({
        title: '📦 Publish Changes',
        message: preview,
        icon: 'fas fa-cloud-upload-alt',
        iconColor: '#10b981',
        confirmText: 'Publish',
        cancelText: 'Cancel',
        confirmBtnStyle: 'background: linear-gradient(135deg, #27ae60 0%, #229954 100%);'
    });
    
    if (!confirmation) return;
    
    showLoading('Publishing changes...');
    
    try {
        // Generate commit message summarizing changes
        const changeSummary = generateChangeSummary();
        
        // Save to GitHub with custom commit message
        await saveDataToGitHub(changeSummary);
        
        // Process pending cross-year updates (if any)
        if (window.pendingCrossYearUpdates && window.pendingCrossYearUpdates.length > 0) {
            showLoading(`Publishing cross-year updates (${window.pendingCrossYearUpdates.length})...`);
            
            // Group updates by target year to batch commits
            const updatesByYear = {};
            window.pendingCrossYearUpdates.forEach(update => {
                if (!updatesByYear[update.targetYear]) {
                    updatesByYear[update.targetYear] = [];
                }
                updatesByYear[update.targetYear].push(update);
            });
            
            // Process each year only once (batch all updates per year)
            for (const [targetYear, updates] of Object.entries(updatesByYear)) {
                try {
                    const currentYearData = await loadYearData(parseInt(targetYear));
                    
                    if (currentYearData) {
                        // Initialize arrays if needed
                        if (!currentYearData.cheeti_collections) {
                            currentYearData.cheeti_collections = [];
                        }
                        
                        // Apply all updates for this year in one batch
                        updates.forEach(update => {
                            // Check if member already exists in collections
                            const existingIndex = currentYearData.cheeti_collections.findIndex(
                                c => c.memberName === update.memberName && c.fromYear === update.fromYear
                            );
                            
                            if (existingIndex >= 0) {
                                // Update existing entry
                                currentYearData.cheeti_collections[existingIndex] = {
                                    ...currentYearData.cheeti_collections[existingIndex],
                                    amount: update.amount,
                                    collectionDate: update.paymentDate,
                                    addedOn: new Date().toISOString()
                                };
                            } else {
                                // Add new collection
                                currentYearData.cheeti_collections.push({
                                    slNo: currentYearData.cheeti_collections.length + 1,
                                    memberName: update.memberName,
                                    amount: update.amount,
                                    fromYear: update.fromYear,
                                    collectionDate: update.paymentDate,
                                    addedOn: new Date().toISOString()
                                });
                            }
                        });
                        
                        // Save once per year (all updates batched)
                        await saveYearData(parseInt(targetYear), currentYearData);
                        
                        console.log(`✅ Published ${updates.length} cross-year update(s) to ${targetYear}`);
                    }
                } catch (error) {
                    console.error(`Error processing cross-year updates for ${targetYear}:`, error);
                }
            }
            
            // Clear pending updates
            window.pendingCrossYearUpdates = [];
        }
        
        // Clear draft state
        if (window.DashboardState) {
            window.DashboardState.clearUnpublishedChanges();
            const currentData = window.DashboardState.getCurrentData();
            window.DashboardState.setOriginalData(JSON.parse(JSON.stringify(currentData)));
        } else {
            window.unpublishedChanges = [];
            window.originalData = JSON.parse(JSON.stringify(window.currentData));
        }
        
        updateDraftModeUI();
        
        showSuccess(`✅ Published ${changeSummary.totalChanges} changes successfully!`);
        hideLoading();
        
    } catch (error) {
        console.error('Error publishing changes:', error);
        showError('Failed to publish changes. Check console for details.');
        hideLoading();
    }
}

/**
 * Generate preview HTML for changes
 * @returns {string} HTML preview
 */
function generateChangesPreview() {
    const unpublishedChanges = window.DashboardState ? window.DashboardState.getUnpublishedChanges() : (window.unpublishedChanges || []);
    
    // Group changes by action
    const grouped = {
        add: [],
        edit: [],
        delete: [],
        toggle_visibility: []
    };
    
    unpublishedChanges.forEach(change => {
        if (grouped[change.action]) {
            grouped[change.action].push(change);
        }
    });
    
    let preview = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #2c3e50; font-size: 1.1rem;">
                📦 <strong>${unpublishedChanges.length}</strong> Change${unpublishedChanges.length !== 1 ? 's' : ''} Ready to Publish
            </h3>
        </div>
        <div style="text-align: left; max-height: 350px; overflow-y: auto;">
    `;
    
    // Show additions
    if (grouped.add.length > 0) {
        preview += `
            <div style="margin-bottom: 15px; padding: 12px; background: #d4edda; border-left: 4px solid #28a745; border-radius: 6px;">
                <div style="font-weight: 600; color: #155724; margin-bottom: 8px;">
                    ➕ ADDITIONS (${grouped.add.length})
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
        `;
        grouped.add.forEach((change) => {
            const details = formatChangeDetails(change);
            const categoryIcon = getCategoryIconForChange(change.category);
            preview += `
                <div style="background: rgba(255,255,255,0.6); padding: 8px 12px; border-radius: 6px; display: flex; align-items: center; gap: 8px; font-size: 0.95rem;">
                    <span style="font-size: 1.2rem;">${categoryIcon}</span>
                    <span style="color: #155724;"><strong>${capitalizeFirstLetter(change.category)}:</strong> ${details}</span>
                </div>
            `;
        });
        preview += `</div></div>`;
    }
    
    // Show edits
    if (grouped.edit.length > 0) {
        preview += `
            <div style="margin-bottom: 15px; padding: 12px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 6px;">
                <div style="font-weight: 600; color: #856404; margin-bottom: 8px;">
                    ✏️ EDITS (${grouped.edit.length})
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
        `;
        grouped.edit.forEach((change) => {
            const details = formatChangeDetails(change);
            const categoryIcon = getCategoryIconForChange(change.category);
            preview += `
                <div style="background: rgba(255,255,255,0.6); padding: 8px 12px; border-radius: 6px; display: flex; align-items: center; gap: 8px; font-size: 0.95rem;">
                    <span style="font-size: 1.2rem;">${categoryIcon}</span>
                    <span style="color: #856404;"><strong>${capitalizeFirstLetter(change.category)}:</strong> ${details}</span>
                </div>
            `;
        });
        preview += `</div></div>`;
    }
    
    // Show deletions
    if (grouped.delete.length > 0) {
        preview += `
            <div style="margin-bottom: 15px; padding: 12px; background: #f8d7da; border-left: 4px solid #dc3545; border-radius: 6px;">
                <div style="font-weight: 600; color: #721c24; margin-bottom: 8px;">
                    🗑️ DELETIONS (${grouped.delete.length})
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
        `;
        grouped.delete.forEach((change) => {
            const details = formatChangeDetails(change);
            const categoryIcon = getCategoryIconForChange(change.category);
            preview += `
                <div style="background: rgba(255,255,255,0.6); padding: 8px 12px; border-radius: 6px; display: flex; align-items: center; gap: 8px; font-size: 0.95rem;">
                    <span style="font-size: 1.2rem;">${categoryIcon}</span>
                    <span style="color: #721c24;"><strong>${capitalizeFirstLetter(change.category)}:</strong> ${details}</span>
                </div>
            `;
        });
        preview += `</div></div>`;
    }
    
    preview += `
        </div>
        <div style="text-align: center; margin-top: 20px; padding: 15px 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 10px; border: 2px solid #10b981;">
            <p style="margin: 0; color: #2c3e50; font-weight: 600; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <i class="fas fa-rocket" style="color: #10b981;"></i>
                Confirm and publish all these changes?
            </p>
        </div>
    `;
    
    return preview;
}

/**
 * Get category icon for change preview
 * @param {string} category - Category name
 * @returns {string} Emoji icon
 */
function getCategoryIconForChange(category) {
    const icons = {
        'donation': '💰',
        'donations': '💰',
        'expense': '💸',
        'expenses': '💸',
        'cheeti': '🎯',
        'cheeti_settings': '⚙️',
        'sponsor': '🤝',
        'sponsors': '🤝',
        'committee': '👥',
        'committee_next_year': '👥',
        'committee_next': '👥',
        'laddu': '🎁',
        'year_visibility': '📅'
    };
    return icons[category] || '📋';
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}

/**
 * Format change details for display
 * @param {Object} change - Change object
 * @returns {string} Formatted details
 */
function formatChangeDetails(change) {
    const details = change.details;
    
    switch (change.category) {
        case 'donation':
            if (change.action === 'edit') {
                return `${details.old.name} - ₹${details.old.amount} → ${details.new.name} - ₹${details.new.amount}`;
            }
            if (change.action === 'delete') {
                return `${details.item?.name || 'Unknown'} - ₹${details.item?.amount || 0}`;
            }
            return `${details.name || 'Unknown'} - ₹${details.amount || 0}`;
            
        case 'expense':
            if (change.action === 'edit') {
                return `${details.old.item} - ₹${details.old.amount} → ${details.new.item} - ₹${details.new.amount}`;
            }
            if (change.action === 'delete') {
                return `${details.item?.item || 'Unknown'} - ₹${details.item?.amount || 0}`;
            }
            return `${details.item || 'Unknown'} - ₹${details.amount || 0}`;
            
        case 'cheeti':
            if (change.action === 'edit') {
                if (change.details.type === 'payment_update') {
                    const oldAmount = details.old.total || 0;
                    const newAmount = details.new.total || 0;
                    const oldStatus = details.old.paid ? '✅ Paid' : '❌ Unpaid';
                    const newStatus = details.new.paid ? '✅ Paid' : '❌ Unpaid';
                    return `${details.new.name} - ${oldStatus} ₹${oldAmount} → ${newStatus} ₹${newAmount}`;
                }
                return `${details.old.name} - ₹${details.old.amount} → ${details.new.name} - ₹${details.new.amount}`;
            }
            if (change.action === 'delete') {
                return `${details.item?.name || 'Unknown'} - ₹${details.item?.amount || 0}`;
            }
            return `${details.name || 'Unknown'} - ₹${details.amount || 0}`;
            
        case 'committee':
        case 'committee_next':
        case 'committee_next_year':
            if (change.action === 'delete') {
                // Handle two patterns:
                // 1. From deleteItem: { index, item: {role, name} }
                // 2. From committee.js: {role, name} directly
                const item = details.item || details;
                return `${item.name || 'Unknown'} (${item.role || 'Member'})`;
            }
            if (change.action === 'edit') {
                return `${details.old?.name || 'Unknown'} (${details.old?.role || 'Member'}) → ${details.new?.name || 'Unknown'} (${details.new?.role || 'Member'})`;
            }
            return `${details.name || 'Unknown'} (${details.role || 'Member'})`;
            
        case 'sponsor':
        case 'sponsors':
            if (change.action === 'delete') {
                const item = details.item || details;
                return `${item.name || 'Unknown'}`;
            }
            if (change.action === 'edit') {
                return `${details.old?.name || 'Unknown'} → ${details.new?.name || 'Unknown'}`;
            }
            return `${details.name || 'Unknown'}`;
            
        case 'laddu':
            if (change.action === 'delete') {
                const item = details.item || details;
                return `${item.name || 'Unknown'}`;
            }
            if (change.action === 'edit') {
                return `${details.old?.name || 'Unknown'} → ${details.new?.name || 'Unknown'}`;
            }
            return `${details.name || 'Unknown'}`;
            
        case 'cheeti_settings':
            if (details.action === 'Set cutover date') {
                const date = new Date(details.cutover_date);
                const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return `Cutover date: ${formattedDate}, Late fee: ₹${details.late_fee_per_day}/day`;
            }
            return details.action || 'Settings updated';
            
        case 'year_visibility':
            return `Year ${details.year} visibility ${details.enabled ? 'enabled' : 'disabled'}`;
            
        default:
            // Fallback for unknown categories
            if (details.name) {
                return details.name;
            }
            return JSON.stringify(details).substring(0, 50);
    }
}

/**
 * Generate change summary for commit message
 * @returns {Object} Summary object with message and statistics
 */
function generateChangeSummary() {
    const unpublishedChanges = window.DashboardState ? window.DashboardState.getUnpublishedChanges() : (window.unpublishedChanges || []);
    
    const summary = {
        additions: 0,
        edits: 0,
        deletions: 0,
        visibilityToggles: 0,
        byCategory: {}
    };
    
    unpublishedChanges.forEach(change => {
        if (change.action === 'add') summary.additions++;
        else if (change.action === 'edit') summary.edits++;
        else if (change.action === 'delete') summary.deletions++;
        else if (change.action === 'toggle_visibility') summary.visibilityToggles++;
        
        if (!summary.byCategory[change.category]) {
            summary.byCategory[change.category] = 0;
        }
        summary.byCategory[change.category]++;
    });
    
    summary.totalChanges = unpublishedChanges.length;
    
    // Build commit message
    const parts = [];
    if (summary.additions > 0) parts.push(`${summary.additions} added`);
    if (summary.edits > 0) parts.push(`${summary.edits} edited`);
    if (summary.deletions > 0) parts.push(`${summary.deletions} deleted`);
    if (summary.visibilityToggles > 0) parts.push(`${summary.visibilityToggles} visibility changed`);
    
    const config = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG : (typeof CONFIG !== 'undefined' ? CONFIG : {});
    const env = config.DATA_ENVIRONMENT || 'prod';
    summary.message = `[Dashboard Bot] [${env}] 📦 Batch update: ${parts.join(', ')} [skip ci]`;
    
    return summary;
}

/**
 * Discard all unpublished draft changes
 * Clears draft changes and reloads latest data from source
 */
async function discardDraftChanges() {
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    const unpublishedChanges = window.DashboardState ? window.DashboardState.getUnpublishedChanges() : (window.unpublishedChanges || []);
    
    if (!isAdmin || unpublishedChanges.length === 0) {
        showError('No changes to discard');
        return;
    }
    
    const confirmation = await showCustomConfirm({
        title: '🗑️ Discard Changes',
        message: `<strong>Discard ${unpublishedChanges.length} unpublished changes?</strong><br><br>This will reload the latest data and lose all local changes.`,
        icon: 'fas fa-exclamation-triangle',
        iconColor: '#f39c12',
        confirmText: 'Discard',
        cancelText: 'Keep Changes',
        confirmBtnStyle: 'background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);'
    });
    
    if (!confirmation) return;
    
    // Clear draft changes
    if (window.DashboardState) {
        window.DashboardState.setUnpublishedChanges([]);
    } else {
        window.unpublishedChanges = [];
    }
    
    // Clear pending cross-year updates
    if (window.pendingCrossYearUpdates) {
        window.pendingCrossYearUpdates = [];
    }
    
    updateDraftModeUI();
    
    // Trigger the same refresh as the refresh button
    if (typeof loadDataFromGitHub === 'function') {
        await loadDataFromGitHub();
    }
    
    showSuccess('✅ Changes discarded. Data reloaded.');
}

/**
 * Generic delete function for all data types
 * Shows confirmation dialog and handles deletion with draft mode tracking
 * @param {string} category - Data category (donation, expense, cheeti, sponsor, committee, committee_next, laddu)
 * @param {number} index - Index of item to delete
 * @param {string} name - Name/description of item for confirmation message
 */
async function deleteItem(category, index, name) {
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const confirmation = await showCustomConfirm({
        title: '🗑️ Delete Item',
        message: `<div style="text-align: center;"><p style="margin-bottom: 15px; font-size: 1.05rem;">Delete this ${category}?</p><p style="font-size: 1.2rem; font-weight: 700; color: #2c3e50; margin-bottom: 15px;">${name || `Item #${index + 1}`}</p><p style="color: #e74c3c; font-weight: 600;"><i class="fas fa-exclamation-triangle"></i> This action cannot be undone.</p></div>`,
        icon: 'fas fa-trash-alt',
        iconColor: '#e74c3c',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmBtnStyle: 'background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);'
    });
    
    if (!confirmation) return;
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    let dataArray;
    let categoryName;
    
    switch(category) {
        case 'donation':
            dataArray = currentData.donations;
            categoryName = 'Donation';
            break;
        case 'expense':
            dataArray = currentData.expenses;
            categoryName = 'Expense';
            break;
        case 'cheeti':
            dataArray = currentData.cheeti;
            categoryName = 'Cheeti Member';
            break;
        case 'sponsor':
            dataArray = currentData.sponsors;
            categoryName = 'Sponsor';
            break;
        case 'committee':
            dataArray = currentData.committee;
            categoryName = 'Committee Member';
            break;
        case 'committee_next':
            dataArray = currentData.committee_next_year;
            categoryName = 'Next Year Committee Member';
            break;
        case 'laddu':
            dataArray = currentData.laddu_winners;
            categoryName = 'Laddu Winner';
            break;
        default:
            showError('Unknown category');
            return;
    }
    
    if (!dataArray || index < 0 || index >= dataArray.length) {
        showError('Invalid item');
        return;
    }
    
    // Remove the item
    const deletedItem = dataArray.splice(index, 1)[0];
    
    // Renumber sl_no if exists
    if (dataArray.length > 0 && dataArray[0].hasOwnProperty('slNo')) {
        dataArray.forEach((item, idx) => {
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
    trackChange('delete', category, { index, item: deletedItem });
    
    // Refresh UI to show updated data
    if (typeof processData === 'function') {
        processData();
    }
    
    showSuccess(`✅ ${categoryName} deleted successfully`);
}

// Export for global access
if (typeof window !== 'undefined') {
    window.updateDraftModeUI = updateDraftModeUI;
    window.enableDraftMode = updateDraftModeUI; // Alias for compatibility
    window.trackChange = trackChange;
    window.publishAllChanges = publishAllChanges;
    window.discardDraftChanges = discardDraftChanges;
    window.deleteItem = deleteItem;
    window.generateChangesPreview = generateChangesPreview;
    window.generateChangeSummary = generateChangeSummary;
    window.formatChangeDetails = formatChangeDetails;
    window.getCategoryIconForChange = getCategoryIconForChange;
    window.capitalizeFirstLetter = capitalizeFirstLetter;
}

console.log('✅ Draft Manager module loaded');
