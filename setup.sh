#!/bin/bash

echo "🎟️  Eventbrite MCP Server Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build the project"
    exit 1
fi

echo "✅ Project built successfully"
echo ""

# Run tests
echo "🧪 Running tests..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi

echo "✅ All tests passed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your Eventbrite API credentials."
else
    echo "ℹ️  .env file already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit the .env file with your Eventbrite API key:"
echo "   nano .env"
echo ""
echo "2. Get your API key from: https://www.eventbrite.com/platform/"
echo ""
echo "3. Add this server to your Claude Desktop configuration:"
echo "   - Copy the configuration from claude-desktop-config.json"
echo "   - Update the absolute path to match your system"
echo "   - Add your API key to the env section"
echo ""
echo "4. Start the server:"
echo "   npm start"
echo ""
echo "For more information, see README.md" 