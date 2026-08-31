/**
 * Dashboard Localization
 * Provides English and Telugu text for the public dashboard view.
 */
(function () {
    const translations = {
        en: {
            dashboardTitle: 'Vinayaka Chavithi Dashboard',
            lastUpdated: 'Last Updated:',
            refresh: 'Refresh',
            adminLogin: 'Admin Login',
            welcomeText: 'Welcome to the Vinayaka Chavithi Community Financial Dashboard. Our celebration brings together devotion, community spirit, and transparency in managing resources for Lord Ganesha\'s festivities.',
            unity: '🙏 Unity in Devotion',
            transparency: '💰 Financial Transparency',
            celebration: '🎉 Community Celebration',
            highlights: 'Highlights',
            metricsTitle: 'Key Metrics Overview',
            metricsSubtitle: 'Real-time financial statistics at a glance',
            totalDonations: 'Total Donations',
            totalDonors: 'Total Donors',
            averageDonation: 'Average Donation',
            ladduWinnings: 'Laddu Winnings',
            addedToTotal: 'Added to Total Amount',
            totalAmount: 'Total Amount',
            totalExpenses: 'Total Expenses',
            balance: 'Balance',
            cheetiMembers: 'Cheeti Members',
            remainingBalance: 'Remaining Balance After Cheeti',
            balanceMinusCheeti: 'Balance minus total cheeti amount',
            estimatedInterest: 'Estimated Next Year Interest',
            currentYearMembers: 'From current year members',
            estimatedNextYearTotal: 'Estimated Total Amount Next Year',
            balancePlusInterest: 'Current balance plus estimated interest',
            donations: 'Donations',
            donationsSubtitle: 'All donation contributions',
            cheetiSubtitle: 'Cheeti amounts and estimated interest',
            expenses: 'Expenses',
            expensesSubtitle: 'All recorded festival expenses',
            committeeMembers: 'Committee Members',
            committeeSubtitle: 'Meet the dedicated team organizing this year\'s festival',
            footerCommittee: 'Vinayaka Chavithi Committee (Muchivolu)',
            footerTagline: '🙏 Powered by Community • 💎 Managed with Transparency • ✨ Blessed by Lord Ganesha',
            rank: 'Rank',
            name: 'Name',
            amount: 'Amount',
            interest: 'Interest',
            total: 'Total (inc. late fees)',
            paidDate: 'Paid Date',
            item: 'Item',
            expand: 'Expand',
            fitColumns: 'Fit Columns',
            normalView: 'Normal View',
            paidAmount: 'Paid Amount',
            remainingBalanceDue: 'Remaining Balance',
            receivedBy: 'Received By',
            paymentMode: 'Payment Mode',
            viewPaymentHistory: 'View payment history',
            paymentHistoryTitle: ({ name }) => `Payment History - ${name}`,
            historyDate: 'Date',
            historyAmount: 'Amount',
            historyReceivedBy: 'Received By',
            historyPaymentMode: 'Payment Mode',
            noInstallments: 'No installments recorded',
            closeAction: 'Close',
            allStatus: 'All Status',
            statusPaid: 'Paid',
            statusPending: 'Pending',
            allReceivers: 'All Receivers',
            allPaymentModes: 'All Payment Modes',
            clearFilters: 'Clear',
            importantPayment: 'Important: Cheeti Payment',
            sponsorLabel: ({ type }) => `${type} Sponsor:`,
            ladduWinner: 'Laddu Winner:',
            paymentNotice: ({ year, deadline, fee }) => ` Please pay your ${year} cheeti amount by ${deadline}. After this date, ₹${fee} will be added for each late day.`,
            roles: {
                Organizer: 'Organizer',
                President: 'President',
                'Vice President': 'Vice President',
                Secretary: 'Secretary',
                Treasurer: 'Treasurer',
                Member: 'Member'
            }
        },
        te: {
            dashboardTitle: 'వినాయక చవితి డాష్‌బోర్డ్',
            lastUpdated: 'చివరిసారి మార్చిన సమయం:',
            refresh: 'మళ్లీ లోడ్ చేయండి',
            adminLogin: 'అడ్మిన్ లాగిన్',
            welcomeText: 'వినాయక చవితి కమిటీ ఆర్థిక డాష్‌బోర్డ్‌కు స్వాగతం. భక్తి, ఐక్యత, పారదర్శకతతో శ్రీ వినాయకుని వేడుకల వనరులను నిర్వహించడానికి ఇది మన వేదిక.',
            unity: '🙏 భక్తిలో ఐక్యత',
            transparency: '💰 ఆర్థిక పారదర్శకత',
            celebration: '🎉 సామూహిక వేడుక',
            highlights: 'ముఖ్యాంశాలు',
            metricsTitle: 'ముఖ్య వివరాలు',
            metricsSubtitle: 'ఆర్థిక స్థితి ఒకే చోట',
            totalDonations: 'విరాళాలు',
            totalDonors: 'దాతలు',
            averageDonation: 'సగటు విరాళం',
            ladduWinnings: 'లడ్డూ వేలం మొత్తం',
            addedToTotal: 'ఆదాయంలో కలిపబడింది',
            totalAmount: 'ఆదాయం',
            totalExpenses: 'ఖర్చులు',
            balance: 'మిగులు',
            cheetiMembers: 'చీటీ సభ్యులు',
            remainingBalance: 'చీటీ తర్వాత మిగులు',
            balanceMinusCheeti: 'చీటీ మొత్తాన్ని తీసివేసిన తర్వాత',
            estimatedInterest: 'అంచనా వడ్డీ',
            currentYearMembers: 'ఈ సంవత్సరం సభ్యుల నుండి',
            estimatedNextYearTotal: 'వచ్చే ఏడాది అంచనా మొత్తం',
            balancePlusInterest: 'మిగులుకు అంచనా వడ్డీ కలిపి',
            donations: 'విరాళాలు',
            donationsSubtitle: 'అన్ని విరాళాల వివరాలు',
            cheetiSubtitle: 'చీటీ మొత్తాలు మరియు అంచనా వడ్డీ',
            expenses: 'ఖర్చులు',
            expensesSubtitle: 'వేడుకకు సంబంధించిన అన్ని ఖర్చులు',
            committeeMembers: 'కమిటీ సభ్యులు',
            committeeSubtitle: 'ఈ సంవత్సరం వేడుకను నిర్వహిస్తున్న కమిటీ సభ్యులు',
            footerCommittee: 'వినాయక చవితి కమిటీ (ముచ్చివోలు)',
            footerTagline: '🙏 సమాజ సహకారంతో • 💎 పారదర్శక నిర్వహణతో • ✨ శ్రీ వినాయకుని ఆశీస్సులతో',
            rank: 'క్రమ సంఖ్య',
            name: 'పేరు',
            amount: 'మొత్తం',
            interest: 'వడ్డీ',
            total: 'మొత్తం (ఆలస్య రుసుముతో)',
            paidDate: 'చెల్లించిన తేదీ',
            item: 'ఖర్చు వివరాలు',
            expand: 'విస్తరించు',
            fitColumns: 'నిలువు వరుసలు అమర్చు',
            normalView: 'సాధారణ వీక్షణ',
            paidAmount: 'చెల్లించిన మొత్తం',
            remainingBalanceDue: 'మిగిలిన బాకీ',
            receivedBy: 'స్వీకరించినవారు',
            paymentMode: 'చెల్లింపు విధానం',
            viewPaymentHistory: 'చెల్లింపు చరిత్రను చూడండి',
            paymentHistoryTitle: ({ name }) => `చెల్లింపు చరిత్ర - ${name}`,
            historyDate: 'తేదీ',
            historyAmount: 'మొత్తం',
            historyReceivedBy: 'స్వీకరించినవారు',
            historyPaymentMode: 'చెల్లింపు విధానం',
            noInstallments: 'చెల్లింపులు నమోదు కాలేదు',
            closeAction: 'మూసివేయి',
            allStatus: 'అన్ని స్థితులు',
            statusPaid: 'చెల్లించింది',
            statusPending: 'బాకీ ఉంది',
            allReceivers: 'అందరు స్వీకరించినవారు',
            allPaymentModes: 'అన్ని చెల్లింపు విధానాలు',
            clearFilters: 'తొలగించు',
            importantPayment: 'ముఖ్య గమనిక: చీటీ చెల్లింపు',
            sponsorLabel: ({ type }) => `${({
                Laddu: 'లడ్డూ',
                Prasadam: 'ప్రసాదం',
                'Vigraham (Idol)': 'విగ్రహం',
                Decorations: 'అలంకరణలు',
                Other: 'ఇతర'
            })[type] || type} స్పాన్సర్:`,
            ladduWinner: 'లడ్డూ విజేత:',
            paymentNotice: ({ year, deadline, fee }) => ` మీ ${year} చీటీ మొత్తాన్ని ${deadline} లోపు చెల్లించండి. గడువు తేదీ తర్వాత ప్రతి ఆలస్య రోజుకు ₹${fee} అదనంగా చెల్లించాలి.`,
            roles: {
                Organizer: 'నిర్వాహకుడు',
                President: 'అధ్యక్షుడు',
                'Vice President': 'ఉపాధ్యక్షుడు',
                Secretary: 'కార్యదర్శి',
                Treasurer: 'ఖజానాదారు',
                Member: 'సభ్యుడు'
            }
        }
    };

    let selectedLanguage = localStorage.getItem('dashboardLanguage') || 'en';

    function translate(key, values) {
        const value = translations[selectedLanguage]?.[key] || translations.en[key] || key;
        return typeof value === 'function' ? value(values || {}) : value;
    }

    function getLocale() {
        return selectedLanguage === 'te' ? 'te-IN' : 'en-IN';
    }

    function getRoleLabel(role) {
        return translations[selectedLanguage]?.roles?.[role] || role;
    }

    function applyLanguage(language) {
        selectedLanguage = translations[language] ? language : 'en';
        localStorage.setItem('dashboardLanguage', selectedLanguage);
        document.documentElement.lang = selectedLanguage;

        document.querySelectorAll('[data-i18n]').forEach(element => {
            element.textContent = translate(element.dataset.i18n);
        });

        const selector = document.getElementById('dashboardLanguageSelect');
        if (selector) selector.value = selectedLanguage;

        if (typeof processData === 'function' && window.DashboardState?.getCurrentData()) {
            processData();
        }
    }

    function initialize() {
        const selector = document.getElementById('dashboardLanguageSelect');
        if (selector) {
            selector.addEventListener('change', event => applyLanguage(event.target.value));
        }
        applyLanguage(selectedLanguage);
    }

    window.DashboardLocalization = { getLocale, getRoleLabel, initialize, translate };
}());
