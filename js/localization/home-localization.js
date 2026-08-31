/**
 * Home Page Localization
 * Owns public home-page translations and the persisted language preference.
 */
(function () {
    const translations = {
        en: {
            adminLogin: 'Admin Login',
            committeeName: 'Vinayaka Chavithi Committee',
            heroSubtitle: 'Celebrating Together, Managing Transparently',
            welcomeLine1: 'Welcome',
            welcomeLine2: 'to',
            welcomeLine3: 'Our Community',
            welcomeText1: '🙏 <strong>Namaste!</strong> Welcome to the <span class="highlight">Vinayaka Chavithi Committee Portal</span>, your trusted platform for celebrating together with complete transparency and devotion. Experience the power of community unity in honoring Lord Ganesha\'s divine blessings.',
            welcomeText2: 'We believe in <strong>absolute transparency</strong> and <strong>efficient management</strong> of all community resources. This portal provides real-time insights into our collective efforts, ensuring every rupee and every contribution is honored and accounted for with the utmost integrity.',
            welcomeText3: '<strong>✨ Our Sacred Mission:</strong> To create a memorable, spiritually enriching Vinayaka Chavithi celebration that brings our community together while maintaining unwavering transparency in all financial and organizational matters. Together, we make Lord Ganesha\'s festival truly blessed!',
            featureDashboardTitle: 'Real-Time Dashboard',
            featureDashboardText: 'View live metrics, charts, and comprehensive reports of all donations and expenses with beautiful visualizations.',
            featureDonationsTitle: 'Donation Tracking',
            featureDonationsText: 'Complete transparency of all contributions from community members with detailed donor information and amounts.',
            featureCheetiTitle: 'Cheeti Management',
            featureCheetiText: 'Track monthly installments, member contributions, and payment schedules for our community savings fund.',
            featureExpensesTitle: 'Expense Reports',
            featureExpensesText: 'Detailed breakdown of all festival expenses including decorations, prasadam, and event management costs.',
            imageTemple: 'Temple Decorations',
            imageIdol: 'Lord Ganesha Idol',
            imagePrayers: 'Community Prayers',
            imagePrasadam: 'Prasadam Distribution',
            ctaTitle: '✨ Experience Complete Transparency ✨',
            exploreDashboard: 'Explore Dashboard',
            committeeMembers: 'Committee Members',
            committeeSubtitle: 'Meet the dedicated team organizing this year\'s festival',
            footerCommittee: 'Vinayaka Chavithi Committee (Muchivolu)',
            footerTagline: '🙏 Powered by Community • 💎 Managed with Transparency • ✨ Blessed by Lord Ganesha',
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
            adminLogin: 'అడ్మిన్ లాగిన్',
            committeeName: 'వినాయక చవితి కమిటీ',
            heroSubtitle: 'కలిసి వేడుక జరుపుకుందాం, పారదర్శకంగా నిర్వహించుకుందాం',
            welcomeLine1: 'మన కమ్యూనిటీకి',
            welcomeLine2: 'స్వాగతం',
            welcomeLine3: '',
            welcomeText1: '🙏 <strong>నమస్తే!</strong> <span class="highlight">వినాయక చవితి కమిటీ పోర్టల్‌కు</span> హృదయపూర్వక స్వాగతం. భక్తి, ఐక్యత మరియు సంపూర్ణ పారదర్శకతతో మనమంతా కలిసి వినాయక చవితిని జరుపుకునేందుకు ఇది మన విశ్వసనీయ వేదిక. శ్రీ వినాయకుని దివ్య ఆశీస్సులతో మన కమ్యూనిటీ ఐక్యతను మరింత బలోపేతం చేసుకుందాం.',
            welcomeText2: 'మన కమ్యూనిటీకి సంబంధించిన <strong>అన్ని వనరుల నిర్వహణలో సంపూర్ణ పారదర్శకత</strong> మరియు <strong>సమర్థవంతమైన నిర్వహణ</strong>కు మేము ప్రాధాన్యత ఇస్తాము. మన సమిష్టి కార్యక్రమాలు, విరాళాలు మరియు ఖర్చులకు సంబంధించిన వివరాలను ఈ పోర్టల్ ద్వారా ఎప్పటికప్పుడు తెలుసుకోవచ్చు. ప్రతి రూపాయి, ప్రతి విరాళం అత్యంత నిజాయితీ మరియు బాధ్యతతో వినియోగించబడేలా ఈ పోర్టల్ సహాయపడుతుంది.',
            welcomeText3: '<strong>✨ మన పవిత్ర లక్ష్యం:</strong> మన కమ్యూనిటీ సభ్యులందరినీ ఒక్కతాటిపైకి తీసుకువచ్చేలా, ఆధ్యాత్మికంగా సంపన్నమైన మరియు చిరస్మరణీయమైన వినాయక చవితి వేడుకను నిర్వహించడం. అదే సమయంలో అన్ని ఆర్థిక మరియు నిర్వహణ అంశాల్లో సంపూర్ణ పారదర్శకతను పాటించడం.<br><br><strong>మనమంతా కలిసి శ్రీ వినాయకుని పండుగను భక్తిశ్రద్ధలతో, ఆనందోత్సాహాలతో మరియు మరింత వైభవంగా జరుపుకుందాం! 🙏</strong>',
            featureDashboardTitle: 'డాష్‌బోర్డ్ వివరాలు',
            featureDashboardText: 'విరాళాలు, ఖర్చులు మరియు ముఖ్యమైన వివరాలను ఒకే చోట చూడండి.',
            featureDonationsTitle: 'విరాళాల వివరాలు',
            featureDonationsText: 'సభ్యుల విరాళాలు, దాతల వివరాలు మరియు మొత్తాలను పారదర్శకంగా చూడండి.',
            featureCheetiTitle: 'చీటీ నిర్వహణ',
            featureCheetiText: 'చీటీ సభ్యులు, చెల్లింపులు మరియు తిరిగి చెల్లించే వివరాలను నిర్వహించండి.',
            featureExpensesTitle: 'ఖర్చుల నివేదిక',
            featureExpensesText: 'అలంకరణలు, ప్రసాదం మరియు వేడుక నిర్వహణకు సంబంధించిన ఖర్చులను చూడండి.',
            imageTemple: 'ఆలయ అలంకరణలు',
            imageIdol: 'శ్రీ వినాయక విగ్రహం',
            imagePrayers: 'సామూహిక ప్రార్థనలు',
            imagePrasadam: 'ప్రసాదం పంపిణీ',
            ctaTitle: '✨ పూర్తి పారదర్శకతను చూడండి ✨',
            exploreDashboard: 'డాష్‌బోర్డ్ చూడండి',
            committeeMembers: 'కమిటీ సభ్యులు',
            committeeSubtitle: 'ఈ సంవత్సరం వేడుకను నిర్వహిస్తున్న మన కమిటీ సభ్యులు',
            footerCommittee: 'వినాయక చవితి కమిటీ (ముచ్చివోలు)',
            footerTagline: '🙏 సమాజ సహకారంతో • 💎 పారదర్శక నిర్వహణతో • ✨ శ్రీ వినాయకుని ఆశీస్సులతో',
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

    function translate(key) {
        return translations[selectedLanguage]?.[key] || translations.en[key] || key;
    }

    function applyLanguage(language) {
        selectedLanguage = translations[language] ? language : 'en';
        localStorage.setItem('dashboardLanguage', selectedLanguage);
        document.documentElement.lang = selectedLanguage;

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const translation = translate(element.dataset.i18n);
            element.innerHTML = translation;
            element.hidden = translation === '';
        });

        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) languageSelect.value = selectedLanguage;

        if (typeof window.renderHomeCommittee === 'function' && window.lastLoadedCommittee) {
            window.renderHomeCommittee(window.lastLoadedCommittee);
        }
    }

    function initialize() {
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', event => applyLanguage(event.target.value));
        }
        applyLanguage(selectedLanguage);
    }

    function getRoleLabel(role) {
        return translations[selectedLanguage]?.roles?.[role] || role;
    }

    window.HomeLocalization = {
        getRoleLabel,
        initialize,
        translate
    };
}());
