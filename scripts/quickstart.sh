#!/bin/bash

##############################################
# Quick Start Script for Agentic Orchestrator
# Automates initial setup
##############################################

set -e

echo "🚀 Agentic Orchestrator - Quick Start"
echo "======================================"
echo ""

# Step 1: Check Node.js
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Step 2: Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm run install:all

# Step 3: Setup environment
echo ""
echo "⚙️ Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file (please configure it)"
else
    echo "✅ .env file already exists"
fi

# Step 4: Make scripts executable
echo ""
echo "🔧 Making scripts executable..."
chmod +x scripts/*.sh

# Step 5: Check Docker
echo ""
echo "🐳 Checking Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker detected"
    echo "   To start local PostgreSQL: cd docker && docker-compose up -d"
else
    echo "⚠️ Docker not found - you'll need to provide your own PostgreSQL"
fi

# Done
echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env file with your credentials"
echo "   2. Start PostgreSQL (Docker or your own instance)"
echo "   3. Run: psql \$DATABASE_URL -f scripts/enableSearch.sql"
echo "   4. Run: cd server && npm run seed"
echo "   5. Run: npm run dev"
echo ""
echo "🌐 Application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "📖 See README.md for detailed documentation"
echo "📖 See SETUP_COMPLETE.md for next steps"
