#!/bin/bash

# Vinayaka Chavithi Dashboard - Start Server Script
# This script starts a local Python HTTP server for testing the dashboard

PORT=8001
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "=================================================="
echo "  Vinayaka Chavithi Dashboard - Server Startup   "
echo "=================================================="
echo ""
echo "📁 Project Directory: $PROJECT_DIR"
echo "🌐 Port: $PORT"
echo ""

# Check if port is already in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port $PORT is already in use!"
    echo ""
    echo "Checking what's running on port $PORT..."
    lsof -i :$PORT
    echo ""
    read -p "Do you want to stop the existing server and start a new one? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🛑 Stopping existing server..."
        lsof -ti:$PORT | xargs kill -9 2>/dev/null
        sleep 1
        echo "✅ Existing server stopped"
    else
        echo "❌ Startup cancelled"
        exit 1
    fi
fi

# Navigate to project directory
cd "$PROJECT_DIR" || exit 1

# Start Python HTTP server
echo ""
echo "🚀 Starting Python HTTP server on port $PORT..."
echo ""
echo "📱 Dashboard URLs:"
echo "   • Welcome Page:  http://localhost:$PORT/"
echo "   • Dashboard:     http://localhost:$PORT/dashboard.html"
echo ""
echo "📚 Documentation: ./docs/"
echo "📊 Data Files: ./data/"
echo ""
echo "🔐 Admin Login:"
echo "   Password: vinayaka2026"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================================="
echo ""

# Start server in foreground
python3 -m http.server $PORT
