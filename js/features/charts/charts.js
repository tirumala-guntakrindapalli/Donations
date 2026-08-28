/**
 * Charts Module
 * Handles all chart creation and visualization using Chart.js
 */

/**
 * Create financial overview chart
 * Shows donations, cheeti collections, laddu winnings, and expenses
 * @param {Array} reportData - Report data (not used, calculated from currentData)
 */
function createFinancialChart(reportData) {
    const ctx = document.getElementById('financialChart');
    if (!ctx) return;
    
    const currentData = window.DashboardState ? window.DashboardState.getCurrentData() : window.currentData;
    
    // Build chart data from actual sources, not from the stale report array
    const chartData = [];
    
    // Donations
    const totalDonations = (currentData.donations || []).reduce((sum, d) => sum + d.amount, 0);
    if (totalDonations > 0) {
        chartData.push({
            category: 'Donations',
            amount: totalDonations,
            type: 'income'
        });
    }
    
    // Actual Cheeti Collections
    const cheetiCollections = (currentData.cheeti_collections || []).reduce((sum, c) => sum + (c.amount || 0), 0);
    if (cheetiCollections > 0) {
        chartData.push({
            category: 'Cheeti Collections',
            amount: cheetiCollections,
            type: 'income'
        });
    }
    
    // Laddu Winnings
    const ladduWinnings = (currentData.laddu_winners || []).reduce((sum, w) => sum + (w.amount || 0), 0);
    if (ladduWinnings > 0) {
        chartData.push({
            category: 'Laddu Winnings',
            amount: ladduWinnings,
            type: 'income'
        });
    }
    
    // Total Expenses
    const totalExpenses = (currentData.expenses || []).reduce((sum, e) => sum + e.amount, 0);
    if (totalExpenses > 0) {
        chartData.push({
            category: 'Total Expenses',
            amount: totalExpenses,
            type: 'expense'
        });
    }
    
    if (chartData.length === 0) return;
    
    // Destroy existing chart instance
    if (window.financialChartInstance) window.financialChartInstance.destroy();
    
    // Create new chart
    window.financialChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.map(r => r.category),
            datasets: [{
                label: 'Amount',
                data: chartData.map(r => r.amount),
                backgroundColor: chartData.map(r => {
                    if (r.type === 'expense') return '#e74c3c';
                    if (r.category === 'Laddu Winnings') return '#f39c12';
                    if (r.category === 'Donations') return '#3498db';
                    if (r.category === 'Cheeti Collections') return '#2ecc71';
                    return '#3498db';
                }),
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '₹' + context.parsed.y.toLocaleString('en-IN');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + (value/1000).toFixed(0) + 'K';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Create expenses breakdown pie chart
 * Shows distribution of expenses by category
 * @param {Array} expensesData - Array of expense objects
 */
function createExpensesChart(expensesData) {
    const ctx = document.getElementById('expensesChart');
    if (!ctx || !expensesData || expensesData.length === 0) return;
    
    // Destroy existing chart instance
    if (window.expensesChartInstance) window.expensesChartInstance.destroy();
    
    // Create new chart
    window.expensesChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: expensesData.map(e => e.item),
            datasets: [{
                data: expensesData.map(e => e.amount),
                backgroundColor: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 15, font: { size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            return label + ': ₹' + value.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });
}

/**
 * Create cheeti overview chart
 * Shows principal, interest, and total value breakdown
 * @param {Array} cheetiData - Array of cheeti member objects
 */
function createCheetiChart(cheetiData) {
    const ctx = document.getElementById('cheetiChart');
    if (!ctx || !cheetiData || cheetiData.length === 0) return;
    
    const totalPrincipal = cheetiData.reduce((sum, c) => sum + c.amount, 0);
    const totalInterest = cheetiData.reduce((sum, c) => sum + (c.interest || 0), 0);
    const totalValue = cheetiData.reduce((sum, c) => sum + (c.total || 0), 0);
    
    // Destroy existing chart instance
    if (window.cheetiChartInstance) window.cheetiChartInstance.destroy();
    
    // Create new chart
    window.cheetiChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Principal', 'Interest', 'Total Value'],
            datasets: [{
                label: 'Amount',
                data: [totalPrincipal, totalInterest, totalValue],
                backgroundColor: ['#3498db', '#2ecc71', '#9b59b6'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '₹' + context.parsed.y.toLocaleString('en-IN');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + (value/1000).toFixed(0) + 'K';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Destroy all chart instances
 * Useful for cleanup before recreating charts
 */
function destroyAllCharts() {
    if (window.financialChartInstance) {
        window.financialChartInstance.destroy();
        window.financialChartInstance = null;
    }
    if (window.expensesChartInstance) {
        window.expensesChartInstance.destroy();
        window.expensesChartInstance = null;
    }
    if (window.cheetiChartInstance) {
        window.cheetiChartInstance.destroy();
        window.cheetiChartInstance = null;
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.createFinancialChart = createFinancialChart;
    window.createExpensesChart = createExpensesChart;
    window.createCheetiChart = createCheetiChart;
    window.destroyAllCharts = destroyAllCharts;
}
