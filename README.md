# Eventbrite MCP Server

A Model Context Protocol (MCP) server that provides natural language access to the Eventbrite API. This server allows you to create, manage, and interact with Eventbrite events using conversational AI.

## Features

- **Create Events**: Create new events with natural language descriptions
- **List Events**: View and filter your events
- **Update Events**: Modify existing event details
- **Publish Events**: Make draft events live
- **Cancel Events**: Cancel events when needed
- **Venue Management**: Create and manage venues
- **Category Support**: Browse and use Eventbrite categories

## Setup

### 1. Get Eventbrite API Credentials

1. Go to [Eventbrite Developer Portal](https://www.eventbrite.com/platform/)
2. Create an account or sign in
3. Create a new app to get your API key
4. Note your Organization ID (optional, for listing organization events)

### 2. Environment Variables

Create a `.env` file in this directory or set the following environment variables:

```bash
EVENTBRITE_API_KEY=your_eventbrite_api_key_here
EVENTBRITE_ORGANIZATION_ID=your_organization_id_here  # Optional
```

### 3. Install Dependencies

```bash
cd src/mcp-servers/eventbrite
npm install
```

### 4. Build (Optional)

If you want to compile TypeScript:

```bash
npm run build
```

## Usage

### Running the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### MCP Client Configuration

Add this server to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "eventbrite": {
      "command": "node",
      "args": ["/path/to/cyber-guard/src/mcp-servers/eventbrite/index.js"],
      "env": {
        "EVENTBRITE_API_KEY": "your_api_key_here",
        "EVENTBRITE_ORGANIZATION_ID": "your_org_id_here"
      }
    }
  }
}
```

## Available Tools

### create_event
Create a new event on Eventbrite.

**Parameters:**
- `name` (required): Event name
- `start_date` (required): Start date/time in ISO 8601 format
- `end_date` (required): End date/time in ISO 8601 format
- `description`: Event description (HTML allowed)
- `timezone`: Event timezone (default: UTC)
- `currency`: Currency code (default: USD)
- `online_event`: Whether it's an online event (default: false)
- `listed`: Whether to list publicly (default: true)
- `capacity`: Maximum attendees
- `venue_name`: Venue name (for in-person events)
- `venue_address`: Venue address
- `venue_city`: Venue city
- `venue_region`: Venue state/region
- `venue_postal_code`: Venue postal code
- `venue_country`: Venue country (2-letter code)
- `category_id`: Eventbrite category ID
- `subcategory_id`: Eventbrite subcategory ID

### list_events
List your events with optional filtering.

**Parameters:**
- `status`: Filter by status (live, draft, canceled, etc.)
- `order_by`: Sort order (start_asc, start_desc, created_asc, created_desc)
- `page`: Page number for pagination

### get_event
Get detailed information about a specific event.

**Parameters:**
- `event_id` (required): The event ID

### update_event
Update an existing event.

**Parameters:**
- `event_id` (required): The event ID
- `name`: New event name
- `description`: New description
- `start_date`: New start date/time
- `end_date`: New end date/time
- `timezone`: New timezone

### publish_event
Publish a draft event to make it live.

**Parameters:**
- `event_id` (required): The event ID

### cancel_event
Cancel an event.

**Parameters:**
- `event_id` (required): The event ID

### list_categories
List available Eventbrite categories.

### create_venue
Create a new venue.

**Parameters:**
- `name` (required): Venue name
- `address`: Street address
- `city`: City
- `region`: State/region
- `postal_code`: Postal code
- `country`: Country (2-letter code)

## Example Natural Language Commands

Once connected to an MCP client, you can use natural language like:

- "Create a tech meetup event next Friday at 7 PM called 'AI and the Future'"
- "List all my upcoming events"
- "Update the description of event 123456789"
- "Publish the draft event with ID 987654321"
- "Create a venue called 'Tech Hub' in San Francisco"
- "Show me all available event categories"

## Error Handling

The server includes comprehensive error handling for:
- Missing API credentials
- Invalid event data
- Network errors
- Eventbrite API errors

## Development

### Project Structure

```
src/mcp-servers/eventbrite/
├── index.ts          # Main server implementation
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── README.md         # This file
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see the main project license for details.

## Support

For issues related to:
- **Eventbrite API**: Check [Eventbrite API Documentation](https://www.eventbrite.com/platform/api)
- **MCP Protocol**: Check [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- **This Server**: Open an issue in the main project repository 