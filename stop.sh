#!/bin/bash

# Vinayaka Chavithi Dashboard - Stop Server Script
# This script stops the running Python HTTP server

PORT=8001

echo "=================================================="
echo "  Vinayaka Chavithi Dashboard - Server Shutdown  "
echo "=================================================="
echo ""

# Check if any process is running on the port
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "🔍 Found server running on port $PORT"
    echo ""
    echo "Process details:"
    lsof -i :$PORT
    echo ""
    echo "🛑 Stopping server..."
    
    # Kill the process
    lsof -ti:$PORT | xargs kill -9 2>/dev/null
    
    # Wait a moment
    sleep 1
    
    # Verify it's stopped
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "❌ Failed to stop server on port $PORT"
        exit 1
    else
        echo "✅ Server stopped successfully"
        echo ""
        echo "💡 Use './start.sh' to start the server again"
    fi
else
    echo "ℹ️  No server is running on port $PORT"
fi

echo "=================================================="
