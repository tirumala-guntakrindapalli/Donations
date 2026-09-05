/**
 * Data Processing Module
 * Handles data processing, metrics calculation, and UI updates
 */

/**
 * Update metrics display
 * Calculates and displays all dashboard metrics (totals, averages, etc.)
 * @param {Array} donations - Donations data
 * @param {Array} cheeti - Cheeti members data
 * @param {Array} expenses - Expenses data
 * @param {Array} report - Report data (not used, calculated from actual data)
 */
function updateMetrics(donations, cheeti, expenses, report) {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalDonors = donations.length;
    const avgDonation = totalDonors > 0 ? totalDonations / totalDonors : 0;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Calculate laddu winnings total
    const ladduWinnings = (currentData.laddu_winners || []).reduce((sum, w) => sum + (w.amount || 0), 0);
    
    // Calculate actual cheeti collections
    const actualCheetiCollections = (currentData.cheeti_collections || []).reduce((sum, c) => sum + (c.amount || 0), 0);
    
    // Total income = donations + actual cheeti collections + laddu winnings
    // Note: We calculate directly from data arrays, not from the report array which may be stale
    const carriedForwardBalance = currentData.carried_forward_balance || 0;
    const totalIncome = carriedForwardBalance + totalDonations + actualCheetiCollections + ladduWinnings;
    const balance = totalIncome - totalExpenses;
    const totalCheetiAmount = cheeti.reduce((sum, member) => sum + (member.amount || 0), 0);
    const remainingBalanceAfterCheeti = balance - totalCheetiAmount;
    const cheetiMembers = cheeti.length;
    const cheetiInterest = cheeti.reduce((sum, c) => sum + (c.interest || 0), 0);
    const estimatedNextYearTotal = balance + cheetiInterest;
    
    // Update DOM elements
    const safeSetText = window.safeSetText || function(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };
    
    const formatCurrency = window.formatCurrency || function(amount) {
        return '₹' + amount.toLocaleString('en-IN');
    };
    
    safeSetText('totalDonations', formatCurrency(totalDonations));
    safeSetText('totalDonors', totalDonors);
    safeSetText('avgDonation', formatCurrency(avgDonation));
    safeSetText('totalIncome', formatCurrency(totalIncome));
    safeSetText('totalExpenses', formatCurrency(totalExpenses));
    safeSetText('balance', formatCurrency(balance));
    safeSetText('remainingBalanceAfterCheeti', formatCurrency(remainingBalanceAfterCheeti));
    safeSetText('ladduWinnings', formatCurrency(ladduWinnings));
    safeSetText('cheetiMembers', cheetiMembers);
    safeSetText('cheetiInterest', formatCurrency(cheetiInterest));
    safeSetText('estimatedNextYearTotal', formatCurrency(estimatedNextYearTotal));
}

/**
 * Process and display all dashboard data
 * Main orchestrator function that updates all UI components
 */
function processData() {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    if (!currentData) return;
    
    // Check dashboard visibility for non-admin users
    if (typeof checkDashboardVisibility === 'function') {
        if (!checkDashboardVisibility()) {
            // Dashboard is disabled for members
            return;
        }
    }
    
    // Dashboard is visible - ensure maintenance message is hidden
    if (typeof hideDashboardDisabledMessage === 'function') {
        hideDashboardDisabledMessage();
    }

    if (typeof updateCheetiMembersVisibility === 'function') {
        updateCheetiMembersVisibility();
    }
    
    // Extract data arrays
    const donationsData = currentData.donations || [];
    const cheetiData = currentData.cheeti || [];
    const expensesData = currentData.expenses || [];
    const reportData = currentData.report || [];
    
    // Update metrics
    updateMetrics(donationsData, cheetiData, expensesData, reportData);
    
    // Create charts
    try {
        if (typeof createFinancialChart === 'function') {
            createFinancialChart(reportData);
        }
        if (typeof createExpensesChart === 'function') {
            createExpensesChart(expensesData);
        }
        if (typeof createCheetiChart === 'function') {
            createCheetiChart(cheetiData);
        }
    } catch (e) {
        console.error('Error creating charts:', e);
    }
    
    // Populate tables
    if (typeof populateDonorsTable === 'function') {
        populateDonorsTable(donationsData);
    }
    if (typeof populateCheetiTable === 'function') {
        populateCheetiTable(cheetiData);
    }
    if (typeof populateExpensesTable === 'function') {
        populateExpensesTable(expensesData);
    }
    
    // Populate committee table if data exists
    const committeeData = currentData.committee || [];
    if (typeof populateCommitteeTable === 'function') {
        populateCommitteeTable(committeeData);
    }
    
    // Update announcements banner
    if (typeof updateAnnouncements === 'function') {
        updateAnnouncements();
    }
    
    // Admin-only updates
    const isAdmin = window.DashboardState ? window.DashboardState.isAdmin() : window.isAdmin;
    if (isAdmin) {
        if (typeof populateCheetiPaidTable === 'function') {
            populateCheetiPaidTable(cheetiData);
        }
        // Update cheeti form based on selected year
        if (typeof updateCheetiForm === 'function') {
            updateCheetiForm();
        }
        // Update management lists
        if (typeof updateCommitteeManagementList === 'function') {
            updateCommitteeManagementList();
        }
        if (typeof updateSponsorsManagementList === 'function') {
            updateSponsorsManagementList();
        }
        if (typeof updateLadduWinnersManagementList === 'function') {
            updateLadduWinnersManagementList();
        }
    }
    
    // Refresh table modal if it's open
    if (typeof refreshTableModal === 'function') {
        refreshTableModal();
    }
}

/**
 * Calculate financial summary
 * Returns object with all calculated totals
 * @returns {Object} Financial summary
 */
function calculateFinancialSummary() {
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    if (!currentData) return null;
    
    const donations = currentData.donations || [];
    const expenses = currentData.expenses || [];
    const cheeti = currentData.cheeti || [];
    const ladduWinners = currentData.laddu_winners || [];
    const cheetiCollections = currentData.cheeti_collections || [];
    const carriedForwardBalance = currentData.carried_forward_balance || 0;
    
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalCheetiPrincipal = cheeti.reduce((sum, c) => sum + c.amount, 0);
    const totalCheetiInterest = cheeti.reduce((sum, c) => sum + (c.interest || 0), 0);
    const totalLadduWinnings = ladduWinners.reduce((sum, w) => sum + (w.amount || 0), 0);
    const totalCheetiCollections = cheetiCollections.reduce((sum, c) => sum + (c.amount || 0), 0);
    
    const totalIncome = carriedForwardBalance + totalDonations + totalCheetiCollections + totalLadduWinnings;
    const balance = totalIncome - totalExpenses;
    
    return {
        totalDonations,
        totalDonors: donations.length,
        avgDonation: donations.length > 0 ? totalDonations / donations.length : 0,
        totalExpenses,
        expenseCount: expenses.length,
        totalIncome,
        balance,
        carriedForwardBalance,
        totalCheetiPrincipal,
        totalCheetiInterest,
        totalCheetiValue: totalCheetiPrincipal + totalCheetiInterest,
        cheetiMembers: cheeti.length,
        totalLadduWinnings,
        totalCheetiCollections
    };
}

// Export for global access
if (typeof window !== 'undefined') {
    window.updateMetrics = updateMetrics;
    window.processData = processData;
    window.calculateFinancialSummary = calculateFinancialSummary;
}
