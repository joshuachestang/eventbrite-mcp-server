# Cursor IDE Setup Guide

This guide will help you set up the Eventbrite MCP Server for use with Cursor IDE.

## Prerequisites

- Node.js 16 or higher
- Cursor IDE installed
- An Eventbrite API token

## Quick Setup

Run the automated setup script:

```bash
./setup-cursor.sh
```

This script will:
- Install dependencies
- Build the project
- Create configuration files
- Set up environment variables

## Manual Setup

If you prefer to set up manually:

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Eventbrite API token:

```env
EVENTBRITE_API_TOKEN=your_token_here
```

### 4. Configure Cursor IDE

1. Open Cursor IDE
2. Go to Settings (Cmd/Ctrl + ,)
3. Search for "MCP" in the settings
4. Find the MCP configuration section
5. Add the following configuration:

```json
{
  "mcpServers": {
    "eventbrite": {
      "command": "node",
      "args": ["/path/to/eventbrite-mcp-server/dist/index.js"],
      "env": {
        "EVENTBRITE_API_TOKEN": "your_token_here"
      }
    }
  }
}
```

**Important**: Replace `/path/to/eventbrite-mcp-server` with the actual path to your project directory.

### 5. Restart Cursor IDE

After adding the configuration, restart Cursor IDE to load the MCP server.

## Verification

### Test the Server

Run the test script to verify everything is working:

```bash
npm test
```

### Test in Cursor IDE

1. Open a new chat in Cursor IDE
2. Try asking: "Create a test event using Eventbrite"
3. The AI should be able to use the Eventbrite tools

## Available Tools

Once configured, you'll have access to these Eventbrite tools:

- **create_event** - Create new events
- **list_events** - List your events
- **get_event** - Get event details
- **update_event** - Update existing events
- **publish_event** - Publish draft events
- **cancel_event** - Cancel events
- **create_venue** - Create venues
- **list_categories** - List event categories

## Usage Examples

### Creating an Event

Ask Cursor AI:
```
"Create a tech meetup event called 'AI Workshop' for next Friday at 7 PM in San Francisco"
```

### Listing Events

Ask Cursor AI:
```
"Show me all my upcoming events"
```

### Getting Event Details

Ask Cursor AI:
```
"Get details for event ID 123456789"
```

## Troubleshooting

### Common Issues

#### 1. "Command not found" error

**Problem**: Cursor can't find the node command or the script file.

**Solution**: 
- Ensure Node.js is installed and in your PATH
- Verify the path in the configuration is correct
- Use absolute paths in the configuration

#### 2. "Permission denied" error

**Problem**: The script file doesn't have execute permissions.

**Solution**:
```bash
chmod +x dist/index.js
```

#### 3. "API token invalid" error

**Problem**: The Eventbrite API token is missing or invalid.

**Solution**:
- Check your `.env` file has the correct token
- Verify the token is valid in your Eventbrite account
- Ensure the token has the necessary permissions

#### 4. "Module not found" error

**Problem**: Dependencies are not installed or the build failed.

**Solution**:
```bash
npm install
npm run build
```

### Debug Mode

To enable debug logging, add this to your environment:

```env
DEBUG=eventbrite-mcp:*
```

### Checking Logs

Cursor IDE logs can be found in:
- **macOS**: `~/Library/Logs/Cursor/`
- **Windows**: `%APPDATA%\Cursor\logs\`
- **Linux**: `~/.config/Cursor/logs/`

## Configuration Options

### Environment Variables

- `EVENTBRITE_API_TOKEN` - Your Eventbrite API token (required)
- `EVENTBRITE_API_BASE_URL` - API base URL (optional, defaults to https://www.eventbriteapi.com/v3)
- `DEBUG` - Enable debug logging (optional)

### Advanced Configuration

You can customize the MCP server configuration:

```json
{
  "mcpServers": {
    "eventbrite": {
      "command": "node",
      "args": ["/path/to/eventbrite-mcp-server/dist/index.js"],
      "env": {
        "EVENTBRITE_API_TOKEN": "your_token_here",
        "DEBUG": "eventbrite-mcp:*"
      },
      "timeout": 30000,
      "retries": 3
    }
  }
}
```

## Getting Help

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Run `npm test` to verify the setup
3. Check Cursor IDE logs for error messages
4. Open an issue on GitHub with:
   - Your operating system
   - Node.js version
   - Error messages
   - Steps to reproduce

## Next Steps

- Read the main [README.md](README.md) for usage examples
- Check out the [API documentation](https://www.eventbrite.com/platform/api)
- Explore the available tools and their parameters
- Join the community discussions

## Updates

To update the MCP server:

```bash
git pull origin main
npm install
npm run build
```

Then restart Cursor IDE to load the updated version. 