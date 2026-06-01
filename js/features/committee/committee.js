/**
 * Committee Feature Module
 * Handles committee member management for next year
 */

// pendingDeleteIndex is managed in state.js
// Access via: window.pendingDeleteIndex or DashboardState.getPendingDeleteIndex()

/**
 * Add a new committee member to next year's committee
 * Validates for duplicates and required fields
 */
function addCommitteeMember() {
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const name = document.getElementById('committeeMemberName').value.trim();
    const role = document.getElementById('committeeMemberRole').value;
    
    if (!name || !role) {
        showError('Please enter member name and select a role');
        return;
    }
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    // Initialize committee_next_year array if it doesn't exist
    if (!currentData.committee_next_year) {
        currentData.committee_next_year = [];
    }
    
    // Check for duplicate name (case-insensitive)
    const duplicate = currentData.committee_next_year.find(m => 
        m.name.toLowerCase() === name.toLowerCase()
    );
    
    if (duplicate) {
        showError(`❌ Committee member "${name}" already exists. Duplicate names not allowed.`);
        return;
    }
    
    // Add new committee member
    const newMember = {
        name: name,
        role: role
    };
    
    currentData.committee_next_year.push(newMember);
    
    // Update state
    if (window.DashboardState) {
        window.DashboardState.setCurrentData(currentData);
    } else {
        window.currentData = currentData;
    }
    
    // Track change for draft mode (use new object to avoid reference issues)
    trackChange('add', 'committee_next_year', { name, role });
    
    // Clear form
    document.getElementById('committeeMemberName').value = '';
    document.getElementById('committeeMemberRole').value = '';
    
    showSuccess(`✅ ${name} added to next year's committee as ${role}`);
    
    // Update committee management list
    updateCommitteeManagementList();
    
    // Process data to update UI
    if (typeof processData === 'function') {
        processData();
    }
}

/**
 * Show committee delete confirmation modal
 * @param {number} index - Index of committee member to delete
 */
function showCommitteeDeleteModal(index) {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    if (!currentData.committee_next_year || !currentData.committee_next_year[index]) {
        showError('Committee member not found');
        return;
    }
    
    const member = currentData.committee_next_year[index];
    pendingDeleteIndex = index;
    
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
        pendingDeleteIndex = null;
    }
}

/**
 * Confirm committee member deletion
 * Calls deleteCommitteeMember with pending index
 */
function confirmCommitteeDelete() {
    if (pendingDeleteIndex === null) return;
    
    deleteCommitteeMember(pendingDeleteIndex);
    hideCommitteeDeleteModal();
}

/**
 * Delete a committee member from next year's committee
 * @param {number} index - Index of committee member to delete
 */
function deleteCommitteeMember(index) {
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    
    if (!isAdmin) {
        showError('You must be logged in as admin');
        return;
    }
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    if (!currentData.committee_next_year || !currentData.committee_next_year[index]) {
        showError('Committee member not found');
        return;
    }
    
    const member = currentData.committee_next_year[index];
    
    // Remove the member
    currentData.committee_next_year.splice(index, 1);
    
    // Update state
    if (window.DashboardState) {
        window.DashboardState.setCurrentData(currentData);
    } else {
        window.currentData = currentData;
    }
    
    // Track change for draft mode
    trackChange('delete', 'committee_next_year', member);
    
    showSuccess(`✅ ${member.name} removed from next year's committee`);
    
    // Update committee management list
    updateCommitteeManagementList();
    
    // Process data to update UI
    if (typeof processData === 'function') {
        processData();
    }
}

/**
 * Update committee management list UI
 * Shows current year (read-only) and next year (editable) committee members
 */
function updateCommitteeManagementList() {
    const listContainer = document.getElementById('committeeManagementList');
    if (!listContainer) return;
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const currentYear = parseInt(currentData.year);
    const nextYear = currentYear + 1;
    
    // Get current and next year committee
    const currentCommittee = currentData.committee || [];
    const nextYearCommittee = currentData.committee_next_year || [];
    
    const roleColors = {
        'Organizer': '#e74c3c',
        'President': '#3498db',
        'Vice President': '#9b59b6',
        'Secretary': '#1abc9c',
        'Treasurer': '#f39c12',
        'Member': '#34495e'
    };
    
    let html = '';
    
    // Show current year committee (read-only)
    if (currentCommittee.length > 0) {
        html += `
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #2196f3;">
                <h5 style="margin: 0 0 12px 0; color: #1565c0;">
                    <i class="fas fa-users"></i> Current Committee (${currentYear})
                    <span style="font-size: 12px; color: #666; font-weight: normal;"> - Read Only</span>
                </h5>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${currentCommittee.map(member => {
                        const roleColor = roleColors[member.role] || '#34495e';
                        return `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #f5f5f5; border-radius: 6px;">
                                <div>
                                    <strong style="color: #333;">${member.name}</strong>
                                    <span style="margin-left: 10px; padding: 3px 10px; background: ${roleColor}; color: white; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                        ${member.role}
                                    </span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Show next year committee (editable)
    html += `
        <div style="background: white; padding: 15px; border-radius: 8px; border: 2px solid #4caf50;">
            <h5 style="margin: 0 0 12px 0; color: #2e7d32;">
                <i class="fas fa-users"></i> Next Year Committee (${nextYear})
                ${nextYearCommittee.length > 0 ? `<span style="font-size: 12px; color: #666; font-weight: normal;"> - ${nextYearCommittee.length} member(s)</span>` : ''}
            </h5>
    `;
    
    if (nextYearCommittee.length === 0) {
        html += `
            <div style="text-align: center; padding: 20px; color: #999;">
                <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
                <p style="margin: 0;">No members added yet for next year</p>
            </div>
        `;
    } else {
        html += `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${nextYearCommittee.map((member, index) => {
                    const roleColor = roleColors[member.role] || '#34495e';
                    return `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #e8f5e9; border-radius: 6px; border-left: 4px solid #4caf50;">
                            <div>
                                <strong style="color: #333;">${member.name}</strong>
                                <span style="margin-left: 10px; padding: 3px 10px; background: ${roleColor}; color: white; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                    ${member.role}
                                </span>
                            </div>
                            <button onclick="showCommitteeDeleteModal(${index})" style="padding: 6px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Remove member">
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
 * Validate committee member data
 * @param {string} name - Member name
 * @param {string} role - Member role
 * @param {number} excludeIndex - Index to exclude from duplicate check (for editing)
 * @returns {Object} Validation result {valid: boolean, error: string}
 */
function validateCommitteeMember(name, role, excludeIndex = -1) {
    if (!name || name.trim().length === 0) {
        return { valid: false, error: 'Name is required' };
    }
    
    if (!role || role.trim().length === 0) {
        return { valid: false, error: 'Role is required' };
    }
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const committee = currentData.committee_next_year || [];
    
    // Check for duplicate name
    const duplicate = committee.find((m, i) => 
        i !== excludeIndex && m.name.toLowerCase() === name.toLowerCase()
    );
    
    if (duplicate) {
        return { valid: false, error: `Committee member "${name}" already exists` };
    }
    
    return { valid: true };
}

/**
 * Populate committee display table
 * Shows current year committee (visible to all) and next year committee (admin only)
 * @param {Array} committeeData - Current year committee members
 */
function populateCommitteeTable(committeeData) {
    const committeeGrid = document.getElementById('committeeGrid');
    const committeeSection = document.getElementById('committeeSection');
    
    if (!committeeGrid || !committeeSection) {
        console.warn('⚠️ Committee grid or section not found');
        return;
    }
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    const currentYear = parseInt(currentData.year);
    const nextYear = currentYear + 1;
    const nextYearCommittee = currentData.committee_next_year || [];
    
    // Hide the section if no committee data at all
    if (!committeeData || committeeData.length === 0) {
        committeeSection.style.display = 'none';
        console.log('ℹ️ No committee data - hiding section');
        return;
    }
    
    // Show the section if we have current committee data
    committeeSection.style.display = 'block';
    
    // Role colors mapping
    const roleColors = {
        'Organizer': '#e74c3c',
        'President': '#3498db',
        'Vice President': '#9b59b6',
        'Secretary': '#1abc9c',
        'Treasurer': '#f39c12',
        'Member': '#34495e'
    };
    
    let html = '';
    
    // Show current year committee (visible to everyone)
    if (committeeData && committeeData.length > 0) {
        html += `
            <div style="background: white; padding: 20px; border-radius: 12px; ${isAdmin && nextYearCommittee.length > 0 ? 'margin-bottom: 20px;' : ''} border: 2px solid #2196f3;">
                <h3 style="margin: 0 0 15px 0; color: #1565c0; font-size: 1.3rem;">
                    <i class="fas fa-users"></i> Current Committee (${currentYear})
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    ${committeeData.map((member) => {
                        const roleColor = roleColors[member.role] || '#34495e';
                        const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                        
                        return `
                            <div class="committee-card" style="min-height: auto;">
                                <div class="committee-avatar">${initials}</div>
                                <h3 class="committee-name">${member.name}</h3>
                                <span class="committee-role" style="background: ${roleColor};">
                                    ${member.role}
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Show next year committee (only visible to admins)
    if (isAdmin && nextYearCommittee.length > 0) {
        html += `
            <div style="background: white; padding: 20px; border-radius: 12px; border: 2px solid #4caf50;">
                <h3 style="margin: 0 0 15px 0; color: #2e7d32; font-size: 1.3rem;">
                    <i class="fas fa-user-plus"></i> Next Year's Committee (${nextYear}) 
                    <span style="font-size: 0.8rem; color: #666; font-weight: normal;">(Admin Only)</span>
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    ${nextYearCommittee.map((member) => {
                        const roleColor = roleColors[member.role] || '#34495e';
                        const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                        
                        return `
                            <div class="committee-card" style="min-height: auto;">
                                <div class="committee-avatar">${initials}</div>
                                <h3 class="committee-name">${member.name}</h3>
                                <span class="committee-role" style="background: ${roleColor};">
                                    ${member.role}
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    committeeGrid.innerHTML = html;
    console.log(`✅ Committee table populated: ${committeeData.length} current, ${nextYearCommittee.length} next year`);
}

/**
 * Manual committee sync triggered by admin button
 * Syncs committee from previous year's planning
 */
async function manualSyncCommittee() {
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    
    if (!isAdmin) {
        showError('❌ Admin access required to sync committee');
        return;
    }
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    if (!currentData) {
        showError('❌ No data loaded');
        return;
    }
    
    const currentYear = currentData ? parseInt(currentData.year) : new Date().getFullYear();
    
    // Check if year is initialized (has essential data arrays)
    // A year is considered uninitialized if it has no donations array or if donations/expenses/cheeti are all empty
    const hasEssentialData = currentData.donations || currentData.expenses || currentData.cheeti || currentData.committee;
    const isYearInitialized = hasEssentialData && (
        (currentData.donations && currentData.donations.length > 0) ||
        (currentData.expenses && currentData.expenses.length > 0) ||
        (currentData.cheeti && currentData.cheeti.length > 0) ||
        (currentData.committee && currentData.committee.length > 0)
    );
    
    if (!isYearInitialized) {
        // Show modal popup for better visibility
        if (typeof showCustomConfirm === 'function') {
            await showCustomConfirm({
                title: '⚠️ Year Not Initialized',
                message: `
                    <div style="text-align: center; line-height: 1.8;">
                        <p style="font-size: 1.1rem; color: #2c3e50; margin-bottom: 15px;">
                            <strong>Year ${currentYear} has not been initialized yet.</strong>
                        </p>
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffa500; margin-bottom: 15px;">
                            <p style="margin: 0; color: #856404;">
                                <i class="fas fa-info-circle"></i> You must initialize the year before syncing committee data.
                            </p>
                        </div>
                        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3; margin-top: 15px;">
                            <p style="margin: 0; color: #1565c0; font-weight: 600;">
                                <i class="fas fa-arrow-right"></i> Look for the <strong>"Initialize Year ${currentYear}"</strong> button on the welcome screen below.
                            </p>
                        </div>
                    </div>
                `,
                icon: 'fas fa-exclamation-triangle',
                iconColor: '#ffa500',
                confirmText: 'Close',
                cancelText: '', // Hide cancel button by setting empty text
                confirmBtnStyle: 'background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);'
            });
        } else {
            showError(`❌ Year ${currentYear} has not been initialized yet. Please initialize the year first before syncing committee.`);
        }
        
        // Show the year initialization warning if function exists
        if (typeof showYearNotInitializedWarning === 'function') {
            showYearNotInitializedWarning(currentYear);
        }
        
        return;
    }
    
    showLoading('Syncing committee from previous year...');
    
    try {
        await syncCommitteeFromPreviousYear(currentYear, true); // Pass true for manual sync
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('❌ Failed to sync committee: ' + error.message);
        console.error('Committee sync error:', error);
    }
}

/**
 * Sync committee from previous year's committee_next_year planning
 * @param {number} currentYear - Current year to sync committee for
 * @param {boolean} isManual - Whether this is a manual sync (triggered by admin)
 */
async function syncCommitteeFromPreviousYear(currentYear, isManual = false) {
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    console.log(`🔍 Sync check: isAdmin=${isAdmin}, currentData exists=${!!currentData}, isManual=${isManual}`);
    
    // Only run if manually triggered
    if (!isManual) {
        console.log('⏭️ Skipping automatic committee sync (manual sync only)');
        return;
    }
    
    if (!isAdmin || !currentData) {
        console.log('⏭️ Skipping committee sync (not admin or no data)');
        return;
    }
    
    console.log(`🔄 Starting committee sync for year ${currentYear}...`);
    
    try {
        const previousYear = currentYear - 1;
        
        // Load previous year data
        let previousYearData = null;
        if (typeof loadYearData === 'function') {
            previousYearData = await loadYearData(previousYear);
        }
        
        if (!previousYearData) {
            console.log(`ℹ️ No previous year (${previousYear}) data found for committee sync`);
            if (isManual) {
                showInfo(`ℹ️ No data found for ${previousYear} to sync from`);
            }
            return;
        }
        
        // Check if previous year has committee_next_year defined
        const nextYearCommittee = previousYearData.committee_next_year;
        if (!nextYearCommittee || nextYearCommittee.length === 0) {
            console.log(`ℹ️ No next year committee planning found in ${previousYear}`);
            if (isManual) {
                showInfo(`ℹ️ No committee planning found in ${previousYear} for ${currentYear}`);
            }
            return;
        }
        
        // Check if current year's committee is different
        const currentCommittee = currentData.committee || [];
        
        // Compare committees (simple JSON stringify comparison)
        const isDifferent = JSON.stringify(currentCommittee) !== JSON.stringify(nextYearCommittee);
        
        if (isDifferent) {
            console.log(`🔄 Committee sync needed: ${previousYear}'s planning differs from ${currentYear}'s committee`);
            console.log(`   Previous year planned ${nextYearCommittee.length} members, current has ${currentCommittee.length} members`);
            
            // Update current year's committee with previous year's planning
            currentData.committee = JSON.parse(JSON.stringify(nextYearCommittee));
            
            // Update state
            if (window.DashboardState) {
                window.DashboardState.setCurrentData(currentData);
            } else {
                window.currentData = currentData;
            }
            
            // Mark as unpublished change
            const changeDescription = `Synced from ${previousYear} planning - updated from ${currentCommittee.length} to ${nextYearCommittee.length} members`;
            
            const unpublishedChanges = window.DashboardState ? window.DashboardState.getUnpublishedChanges() : (window.unpublishedChanges || []);
            
            unpublishedChanges.push({
                action: 'edit',
                category: 'committee',
                type: 'committee_sync',
                description: changeDescription,
                timestamp: new Date().toISOString(),
                from: `${previousYear} committee_next_year`,
                to: `${currentYear} committee`,
                name: 'Committee Members',
                oldValue: `${currentCommittee.length} members`,
                newValue: `${nextYearCommittee.length} members`
            });
            
            // Update state with new unpublished changes
            if (window.DashboardState) {
                window.DashboardState.setUnpublishedChanges(unpublishedChanges);
            } else {
                window.unpublishedChanges = unpublishedChanges;
            }
            
            // Update draft mode UI
            if (typeof updateDraftModeUI === 'function') {
                updateDraftModeUI();
            }
            
            // Reprocess data to update committee table
            if (typeof processData === 'function') {
                processData();
            }
            
            // Show success notification
            showSuccess(`✅ Committee synced from ${previousYear}! Updated from ${currentCommittee.length} to ${nextYearCommittee.length} members. Click "Publish All" to save.`);
            
            console.log(`✅ Committee synced successfully from ${previousYear} to ${currentYear}`);
        } else {
            console.log(`✅ Committee already in sync with ${previousYear} planning`);
            if (isManual) {
                showInfo(`ℹ️ Committee is already in sync with ${previousYear} planning (${nextYearCommittee.length} members)`);
            }
        }
        
    } catch (error) {
        console.error('Error syncing committee from previous year:', error);
        if (isManual) {
            throw error; // Re-throw for manual sync to handle
        }
    }
}

// Export for global access
try {
    if (typeof window !== 'undefined') {
        window.addCommitteeMember = addCommitteeMember;
        window.deleteCommitteeMember = deleteCommitteeMember;
        window.showCommitteeDeleteModal = showCommitteeDeleteModal;
        window.hideCommitteeDeleteModal = hideCommitteeDeleteModal;
        window.confirmCommitteeDelete = confirmCommitteeDelete;
        window.updateCommitteeManagementList = updateCommitteeManagementList;
        window.validateCommitteeMember = validateCommitteeMember;
        window.populateCommitteeTable = populateCommitteeTable;
        window.manualSyncCommittee = manualSyncCommittee;
        window.syncCommitteeFromPreviousYear = syncCommitteeFromPreviousYear;
    }
    console.log('✅ Committee module loaded');
} catch (error) {
    console.error('❌ Committee module error:', error);
}
