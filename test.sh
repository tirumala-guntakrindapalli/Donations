#!/bin/bash

# Vinayaka Chavithi Dashboard - Quick Test Runner
# Interactive guide for testing all use cases

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🧪 Vinayaka Chavithi Dashboard - Testing Suite           ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check if server is running
if ! lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Server is not running on port 8001!"
    echo ""
    read -p "Do you want to start the server? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./start.sh &
        sleep 2
        echo "✅ Server started on port 8000"
    else
        echo "❌ Cannot run tests without server. Exiting."
        exit 1
    fi
fi

echo "✅ Server is running on port 8000"
echo ""

# Test Mode Check
if grep -q "TEST_MODE: true" dashboard-config.js; then
    echo "✅ TEST_MODE is enabled"
else
    echo "⚠️  TEST_MODE is not enabled!"
    echo "Please set TEST_MODE: true in dashboard-config.js"
    exit 1
fi

echo ""
echo "📊 Test Configuration:"
echo "   • Environment: TEST MODE (Local)"
echo "   • Server: http://localhost:8001"
echo "   • Admin Password: vinayaka2026"
echo "   • Data Files: 2024, 2025, 2026"
echo ""

# Menu
while true; do
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                    🎯 Test Categories                         ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "  1. 🚀 Quick Test (6 critical tests - 15 mins)"
    echo "  2. 🎨 Navigation & UI Tests (5 tests)"
    echo "  3. 🔐 Authentication Tests (4 tests)"
    echo "  4. 📅 Year Selection Tests (4 tests)"
    echo "  5. 👀 View Data Tests (6 tests)"
    echo "  6. 💰 Admin - Donations Tests (3 tests)"
    echo "  7. 📝 Admin - Cheeti Current Year (4 tests)"
    echo "  8. 💳 Admin - Cheeti Past Year (5 tests)"
    echo "  9. 💵 Admin - Expenses Tests (3 tests)"
    echo " 10. ⏱️  Session Management Tests (3 tests)"
    echo " 11. 🆕 Year Initialization Tests (3 tests)"
    echo " 12. 📱 Responsive Design Tests (2 tests)"
    echo " 13. 🐛 Edge Cases Tests (4 tests)"
    echo ""
    echo " 14. 📋 View Full Testing Guide"
    echo " 15. 🌐 Open Dashboard in Browser"
    echo ""
    echo "  0. ❌ Exit"
    echo ""
    read -p "Select test category (0-15): " choice

    case $choice in
        1)
            echo ""
            echo "╔═══════════════════════════════════════════════════════════════╗"
            echo "║              🚀 QUICK TEST (Critical Path)                    ║"
            echo "╚═══════════════════════════════════════════════════════════════╝"
            echo ""
            echo "This will guide you through 6 essential tests:"
            echo ""
            echo "✅ Test 1: Authentication"
            echo "   1. Open http://localhost:8001"
            echo "   2. Click 'Admin Login'"
            echo "   3. Enter password: vinayaka2026"
            echo "   4. Verify admin panel appears"
            read -p "Press Enter when done..."
            
            echo ""
            echo "✅ Test 2: Year Selection & Form Switching"
            echo "   1. Select year 2026 from dropdown"
            echo "   2. Check cheeti form shows 'Add New Member'"
            echo "   3. Select year 2025"
            echo "   4. Check form changes to 'Record Payment'"
            read -p "Press Enter when done..."
            
            echo ""
            echo "✅ Test 3: Add Donation"
            echo "   1. Select year 2026"
            echo "   2. In admin panel, enter:"
            echo "      Name: Test Donor"
            echo "      Amount: 5000"
            echo "   3. Click 'Add Donation'"
            echo "   4. Verify appears in table"
            read -p "Press Enter when done..."
            
            echo ""
            echo "✅ Test 4: Add Cheeti Member"
            echo "   1. Still on 2026"
            echo "   2. Enter:"
            echo "      Name: Test Member"
            echo "      Amount: 27600"
            echo "   3. Verify interest auto-calculates (3312)"
            echo "   4. Click 'Add Cheeti Member'"
            read -p "Press Enter when done..."
            
            echo ""
            echo "✅ Test 5: Record Payment"
            echo "   1. Select year 2025"
            echo "   2. Choose a member from dropdown"
            echo "   3. Enter payment date"
            echo "   4. Add late fee: 500"
            echo "   5. Check 'Paid' and submit"
            echo "   6. Verify success message"
            read -p "Press Enter when done..."
            
            echo ""
            echo "✅ Test 6: Session Persistence"
            echo "   1. Refresh page (F5)"
            echo "   2. Verify admin panel still visible"
            echo "   3. No login required"
            read -p "Press Enter when done..."
            
            echo ""
            echo "🎉 Quick Test Complete!"
            echo ""
            read -p "Press Enter to continue..."
            ;;
            
        2)
            echo ""
            echo "🎨 Navigation & UI Tests"
            echo "========================"
            echo ""
            echo "Test 2.1: Welcome Page Load"
            echo "   • Open http://localhost:8001/"
            echo "   • Verify Om logo, title, location"
            echo ""
            echo "Test 2.2: Navigation to Dashboard"
            echo "   • Click 'View Dashboard'"
            echo ""
            echo "Test 2.3: Admin Login Button"
            echo "   • Click 'Admin Login' from welcome"
            echo "   • Verify modal opens"
            echo ""
            echo "Test 2.4: Year Dropdown"
            echo "   • Check dropdown shows 2024, 2025, 2026"
            echo ""
            echo "Test 2.5: UI Elements"
            echo "   • Verify cards, charts, tables render"
            echo ""
            read -p "Press Enter to continue..."
            ;;
            
        14)
            echo ""
            echo "📋 Opening Full Testing Guide..."
            open docs/TESTING_GUIDE.md 2>/dev/null || cat docs/TESTING_GUIDE.md | less
            ;;
            
        15)
            echo ""
            echo "🌐 Opening Dashboard..."
            open http://localhost:8001/ 2>/dev/null || echo "Please open: http://localhost:8001/"
            ;;
            
        0)
            echo ""
            echo "👋 Thank you for testing!"
            echo ""
            exit 0
            ;;
            
        *)
            echo ""
            echo "⚠️  Invalid choice. Please select 0-15."
            echo ""
            ;;
    esac
done
