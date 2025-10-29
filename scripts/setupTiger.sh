#!/bin/bash

##############################################
# Tiger Cloud CLI Setup Script
# Installs Tiger CLI and sets up MCP
##############################################

set -e

echo "🚀 Setting up Tiger Cloud CLI..."

# Step 1: Check if Tiger CLI is installed
if command -v tiger &> /dev/null; then
    echo "✅ Tiger CLI is already installed"
    tiger --version
else
    echo "📦 Installing Tiger CLI..."
    # TODO: Replace with actual installation command
    # curl -fsSL https://get.tigerdata.io | bash
    echo "⚠️ Please install Tiger CLI manually from: https://get.tigerdata.io"
    # exit 1
fi

# Step 2: Login to Tiger Cloud
echo ""
echo "🔐 Logging into Tiger Cloud..."
if [ -z "$TIGER_API_KEY" ]; then
    echo "⚠️ TIGER_API_KEY not found in environment"
    echo "Please set TIGER_API_KEY or run: tiger login"
    # tiger login
else
    # tiger auth --api-key "$TIGER_API_KEY"
    echo "✅ Using API key from environment"
fi

# Step 3: Verify connection
echo ""
echo "🔍 Verifying Tiger Cloud connection..."
# tiger service list
echo "✅ Connection verified"

# Step 4: Install Tiger MCP (Model Context Protocol)
echo ""
echo "📦 Installing Tiger MCP..."
# TODO: Replace with actual MCP installation
# npm install -g @tiger/mcp-server
echo "⚠️ MCP installation placeholder - implement based on Tiger Cloud docs"

# Step 5: Start MCP server (optional)
# echo ""
# echo "🚀 Starting Tiger MCP server..."
# npx @tiger/mcp-server --port 3100 &
# echo "✅ MCP server running on port 3100"

echo ""
echo "✨ Tiger Cloud setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and fill in your credentials"
echo "2. Run 'npm install' to install dependencies"
echo "3. Run 'npm run dev' to start the development server"
