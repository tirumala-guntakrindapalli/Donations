/**
 * Announcements Module
 * Manages announcement banner updates with sponsors and laddu winners
 */

/**
 * Update Announcements Banner
 * Displays sponsors and laddu winners in simple badge format
 */
async function updateAnnouncements() {
    const DashboardState = window.DashboardState || {};
    const currentData = DashboardState.getCurrentData ? DashboardState.getCurrentData() : window.currentData;
    const loadYearData = window.loadYearData;
    
    // Get the new announcements section elements
    const announcementsSection = document.getElementById('announcementsSection');
    const announcementsBadges = document.getElementById('announcementsBadges');
    
    // Hide the old scrolling banner
    const oldBanner = document.getElementById('announcementBanner');
    if (oldBanner) {
        oldBanner.style.display = 'none';
    }
    
    if (!announcementsSection || !announcementsBadges) return;
    
    let badges = [];
    let usingPreviousYear = false;
    let displayYear = null;
    
    // Check if current year has data
    const hasCurrentYearData = (currentData.sponsors && currentData.sponsors.length > 0) || 
                                (currentData.laddu_winners && currentData.laddu_winners.length > 0);
    
    let dataToUse = currentData;
    
    // If no current year data, try to load previous year (with error handling)
    if (!hasCurrentYearData) {
        try {
            const currentYear = (typeof DASHBOARD_CONFIG !== 'undefined') ? DASHBOARD_CONFIG.currentYear : new Date().getFullYear();
            const previousYear = currentYear - 1;
            const previousYearData = await loadYearData(previousYear);
            
            if (previousYearData) {
                dataToUse = previousYearData;
                usingPreviousYear = true;
                displayYear = previousYear;
            }
        } catch (error) {
            // Previous year data not available, use current (empty) data
            console.log('Previous year data not available for announcements');
        }
    }
    
    // Don't show year badge separately - it will be in the heading
    
    // Add sponsor badges
    if (dataToUse.sponsors && dataToUse.sponsors.length > 0) {
        dataToUse.sponsors.forEach(s => {
            const amountText = s.amount > 0 ? ` • ₹${s.amount.toLocaleString('en-IN')}` : '';
            badges.push({
                type: 'sponsor',
                icon: '🙏',
                text: `${s.type} Sponsor: ${s.name}${amountText}`
            });
        });
    }
    
    // Add laddu winner badges
    if (dataToUse.laddu_winners && dataToUse.laddu_winners.length > 0) {
        dataToUse.laddu_winners.forEach(w => {
            const amountText = w.amount > 0 ? ` • ₹${w.amount.toLocaleString('en-IN')}` : '';
            badges.push({
                type: 'winner',
                icon: '🏆',
                text: `Laddu Winner: ${w.name}${amountText}`
            });
        });
    }
    
    if (badges.length > 0) {
        // Clear existing badges
        announcementsBadges.innerHTML = '';
        
        // Create and add badges
        badges.forEach(badge => {
            const badgeEl = document.createElement('div');
            badgeEl.className = `announcement-badge ${badge.type}`;
            badgeEl.innerHTML = `
                <span class="badge-icon">${badge.icon}</span>
                <span>${badge.text}</span>
            `;
            announcementsBadges.appendChild(badgeEl);
        });
        
        // Update section heading to show year if using previous year data
        const sectionHeading = announcementsSection.querySelector('h3');
        if (sectionHeading) {
            if (usingPreviousYear && displayYear) {
                sectionHeading.innerHTML = `
                    <i class="fas fa-star" style="color: #ff9800;"></i>
                    ${displayYear} Highlights
                `;
            } else {
                sectionHeading.innerHTML = `
                    <i class="fas fa-star" style="color: #ff9800;"></i>
                    Highlights
                `;
            }
        }
        
        announcementsSection.style.display = 'block';
        
        console.log(`📢 Showing ${badges.length} announcements as badges${usingPreviousYear ? ` (${displayYear} data)` : ''}`);
    } else {
        announcementsSection.style.display = 'none';
    }
}

// Export to window for backward compatibility
window.updateAnnouncements = updateAnnouncements;

console.log('✅ Announcements module loaded');
