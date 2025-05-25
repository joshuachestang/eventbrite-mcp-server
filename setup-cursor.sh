#!/bin/bash

# Eventbrite MCP Server - Cursor IDE Setup Script
# This script sets up the Eventbrite MCP server for use with Cursor IDE

set -e

echo "🎯 Setting up Eventbrite MCP Server for Cursor IDE..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your Eventbrite API token"
else
    echo "✅ .env file already exists"
fi

# Get the current directory
CURRENT_DIR=$(pwd)

# Create Cursor configuration
echo "⚙️  Setting up Cursor IDE configuration..."

# Check if cursor-config.json exists and update the path
if [ -f "cursor-config.json" ]; then
    # Update the path in cursor-config.json to use the current directory
    sed -i.bak "s|/Users/joshuachestang/Apps/eventbrite-mcp-server|$CURRENT_DIR|g" cursor-config.json
    rm cursor-config.json.bak
    echo "✅ Updated cursor-config.json with current path: $CURRENT_DIR"
else
    echo "❌ cursor-config.json not found"
    exit 1
fi

# Test the build
echo "🧪 Testing the build..."
if [ -f "dist/index.js" ]; then
    echo "✅ Build successful - dist/index.js created"
else
    echo "❌ Build failed - dist/index.js not found"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file and add your Eventbrite API token:"
echo "   EVENTBRITE_API_TOKEN=your_token_here"
echo ""
echo "2. Copy the contents of cursor-config.json to your Cursor IDE settings:"
echo "   - Open Cursor IDE"
echo "   - Go to Settings > Extensions > MCP"
echo "   - Add the configuration from cursor-config.json"
echo ""
echo "3. Restart Cursor IDE to load the MCP server"
echo ""
echo "4. Test the server by running:"
echo "   npm test"
echo ""
echo "📖 For detailed setup instructions, see CURSOR_SETUP.md" 