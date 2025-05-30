#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

// Eventbrite API configuration
const EVENTBRITE_API_BASE = 'https://www.eventbriteapi.com/v3';

interface EventbriteConfig {
  apiKey: string;
  organizationId?: string;
}

interface EventData {
  name: {
    html: string;
  };
  description?: {
    html: string;
  };
  start: {
    timezone: string;
    utc: string;
  };
  end: {
    timezone: string;
    utc: string;
  };
  currency: string;
  online_event?: boolean;
  listed?: boolean;
  shareable?: boolean;
  invite_only?: boolean;
  show_remaining?: boolean;
  capacity?: number;
  venue_id?: string;
  category_id?: string;
  subcategory_id?: string;
  format_id?: string;
}

interface VenueData {
  name: string;
  address: {
    address_1?: string;
    address_2?: string;
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
  };
}

class EventbriteMCPServer {
  private server: Server;
  private config: EventbriteConfig;

  constructor() {
    this.server = new Server(
      {
        name: 'eventbrite-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.config = {
      apiKey: process.env.EVENTBRITE_API_KEY || '',
      organizationId: process.env.EVENTBRITE_ORGANIZATION_ID,
    };

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_event',
            description: 'Create a new event on Eventbrite',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'The name of the event',
                },
                description: {
                  type: 'string',
                  description: 'The description of the event (HTML allowed)',
                },
                start_date: {
                  type: 'string',
                  description: 'Start date and time in ISO 8601 format (e.g., 2024-12-25T10:00:00)',
                },
                end_date: {
                  type: 'string',
                  description: 'End date and time in ISO 8601 format (e.g., 2024-12-25T18:00:00)',
                },
                timezone: {
                  type: 'string',
                  description: 'Timezone for the event (e.g., America/New_York, Europe/London)',
                  default: 'UTC',
                },
                currency: {
                  type: 'string',
                  description: 'Currency code (e.g., USD, EUR, GBP)',
                  default: 'USD',
                },
                online_event: {
                  type: 'boolean',
                  description: 'Whether this is an online event',
                  default: false,
                },
                listed: {
                  type: 'boolean',
                  description: 'Whether the event should be publicly listed',
                  default: true,
                },
                capacity: {
                  type: 'number',
                  description: 'Maximum number of attendees',
                },
                venue_name: {
                  type: 'string',
                  description: 'Name of the venue (for in-person events)',
                },
                venue_address: {
                  type: 'string',
                  description: 'Address of the venue',
                },
                venue_city: {
                  type: 'string',
                  description: 'City of the venue',
                },
                venue_region: {
                  type: 'string',
                  description: 'State/region of the venue',
                },
                venue_postal_code: {
                  type: 'string',
                  description: 'Postal code of the venue',
                },
                venue_country: {
                  type: 'string',
                  description: 'Country of the venue (2-letter code, e.g., US, GB)',
                },
                category_id: {
                  type: 'string',
                  description: 'Eventbrite category ID (optional)',
                },
                subcategory_id: {
                  type: 'string',
                  description: 'Eventbrite subcategory ID (optional)',
                },
              },
              required: ['name', 'start_date', 'end_date'],
            },
          },
          {
            name: 'list_events',
            description: 'List events for the authenticated user or organization',
            inputSchema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  description: 'Filter by event status (live, draft, canceled, etc.)',
                },
                order_by: {
                  type: 'string',
                  description: 'Order events by (start_asc, start_desc, created_asc, created_desc)',
                  default: 'start_asc',
                },
                page: {
                  type: 'number',
                  description: 'Page number for pagination',
                  default: 1,
                },
              },
            },
          },
          {
            name: 'get_event',
            description: 'Get details of a specific event',
            inputSchema: {
              type: 'object',
              properties: {
                event_id: {
                  type: 'string',
                  description: 'The ID of the event to retrieve',
                },
              },
              required: ['event_id'],
            },
          },
          {
            name: 'update_event',
            description: 'Update an existing event',
            inputSchema: {
              type: 'object',
              properties: {
                event_id: {
                  type: 'string',
                  description: 'The ID of the event to update',
                },
                name: {
                  type: 'string',
                  description: 'The new name of the event',
                },
                description: {
                  type: 'string',
                  description: 'The new description of the event',
                },
                start_date: {
                  type: 'string',
                  description: 'New start date and time in ISO 8601 format',
                },
                end_date: {
                  type: 'string',
                  description: 'New end date and time in ISO 8601 format',
                },
                timezone: {
                  type: 'string',
                  description: 'New timezone for the event',
                },
              },
              required: ['event_id'],
            },
          },
          {
            name: 'publish_event',
            description: 'Publish a draft event to make it live',
            inputSchema: {
              type: 'object',
              properties: {
                event_id: {
                  type: 'string',
                  description: 'The ID of the event to publish',
                },
              },
              required: ['event_id'],
            },
          },
          {
            name: 'cancel_event',
            description: 'Cancel an event',
            inputSchema: {
              type: 'object',
              properties: {
                event_id: {
                  type: 'string',
                  description: 'The ID of the event to cancel',
                },
              },
              required: ['event_id'],
            },
          },
          {
            name: 'delete_event',
            description: 'Delete an event (permanently removes the event)',
            inputSchema: {
              type: 'object',
              properties: {
                event_id: {
                  type: 'string',
                  description: 'The ID of the event to delete',
                },
              },
              required: ['event_id'],
            },
          },
          {
            name: 'delete_canceled_events',
            description: 'Delete all events that are marked as canceled',
            inputSchema: {
              type: 'object',
              properties: {
                confirm: {
                  type: 'boolean',
                  description: 'Set to true to confirm deletion of all canceled events',
                },
              },
              required: ['confirm'],
            },
          },
          {
            name: 'list_categories',
            description: 'List available event categories',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'create_venue',
            description: 'Create a new venue',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the venue',
                },
                address: {
                  type: 'string',
                  description: 'Street address of the venue',
                },
                city: {
                  type: 'string',
                  description: 'City of the venue',
                },
                region: {
                  type: 'string',
                  description: 'State/region of the venue',
                },
                postal_code: {
                  type: 'string',
                  description: 'Postal code of the venue',
                },
                country: {
                  type: 'string',
                  description: 'Country of the venue (2-letter code)',
                },
              },
              required: ['name'],
            },
          },
          {
            name: 'create_webhook',
            description: 'Create a webhook for Eventbrite events',
            inputSchema: {
              type: 'object',
              properties: {
                endpoint_url: {
                  type: 'string',
                  description: 'The URL where webhook notifications will be sent',
                },
                actions: {
                  type: 'string',
                  description: 'Comma-separated list of actions to trigger webhook (e.g., "order.placed,attendee.updated,event.published")',
                },
                event_id: {
                  type: 'string',
                  description: 'Optional: Specific event ID to monitor (leave empty for all events)',
                },
              },
              required: ['endpoint_url', 'actions'],
            },
          },
          {
            name: 'list_webhooks',
            description: 'List all webhooks for the organization',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'delete_webhook',
            description: 'Delete a webhook',
            inputSchema: {
              type: 'object',
              properties: {
                webhook_id: {
                  type: 'string',
                  description: 'The ID of the webhook to delete',
                },
              },
              required: ['webhook_id'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!this.config.apiKey) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Eventbrite API key not configured. Please set EVENTBRITE_API_KEY environment variable.'
        );
      }

      try {
        switch (name) {
          case 'create_event':
            return await this.createEvent(args);
          case 'list_events':
            return await this.listEvents(args);
          case 'get_event':
            return await this.getEvent(args);
          case 'update_event':
            return await this.updateEvent(args);
          case 'publish_event':
            return await this.publishEvent(args);
          case 'cancel_event':
            return await this.cancelEvent(args);
          case 'delete_event':
            return await this.deleteEvent(args);
          case 'delete_canceled_events':
            return await this.deleteCanceledEvents(args);
          case 'list_categories':
            return await this.listCategories();
          case 'create_venue':
            return await this.createVenue(args);
          case 'create_webhook':
            return await this.createWebhook(args);
          case 'list_webhooks':
            return await this.listWebhooks();
          case 'delete_webhook':
            return await this.deleteWebhook(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async makeEventbriteRequest(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any
  ) {
    const config: any = {
      method,
      url: `${EVENTBRITE_API_BASE}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    // For GET requests, use params for query parameters
    // For POST/PATCH requests, use data for request body
    if (method === 'GET' && data) {
      config.params = data;
    } else if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  }

  private async createEvent(args: any) {
    const {
      name,
      description,
      start_date,
      end_date,
      timezone = 'UTC',
      currency = 'USD',
      online_event = false,
      listed = true,
      capacity,
      venue_name,
      venue_address,
      venue_city,
      venue_region,
      venue_postal_code,
      venue_country,
      category_id,
      subcategory_id,
    } = args;

    let venue_id;

    // Create venue if venue details are provided and it's not an online event
    if (!online_event && venue_name) {
      const venueData: VenueData = {
        name: venue_name,
        address: {
          address_1: venue_address,
          city: venue_city,
          region: venue_region,
          postal_code: venue_postal_code,
          country: venue_country,
        },
      };

      const venueResponse = await this.makeEventbriteRequest('POST', '/venues/', {
        venue: venueData,
      });
      venue_id = venueResponse.id;
    }

    const eventData: EventData = {
      name: {
        html: name,
      },
      start: {
        timezone,
        utc: new Date(start_date).toISOString().replace('.000Z', 'Z'),
      },
      end: {
        timezone,
        utc: new Date(end_date).toISOString().replace('.000Z', 'Z'),
      },
      currency,
      online_event,
      listed,
      shareable: true,
      invite_only: false,
      show_remaining: true,
    };

    if (description) {
      eventData.description = { html: description };
    }

    if (capacity) {
      eventData.capacity = capacity;
    }

    if (venue_id) {
      eventData.venue_id = venue_id;
    }

    if (category_id) {
      eventData.category_id = category_id;
    }

    if (subcategory_id) {
      eventData.subcategory_id = subcategory_id;
    }

    // Use organization endpoint for event creation
    const endpoint = this.config.organizationId 
      ? `/organizations/${this.config.organizationId}/events/`
      : '/events/';
    
    const response = await this.makeEventbriteRequest('POST', endpoint, {
      event: eventData,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Event created successfully!\n\nEvent ID: ${response.id}\nName: ${response.name.text}\nURL: ${response.url}\nStatus: ${response.status}\n\nStart: ${response.start.local}\nEnd: ${response.end.local}\nTimezone: ${response.start.timezone}`,
        },
      ],
    };
  }

  private async listEvents(args: any) {
    const { status, order_by = 'start_asc', page = 1 } = args;

    const params: any = {
      order_by,
      page,
    };

    if (status) {
      params.status = status;
    }

    // Use organization events endpoint if organization ID is available
    const endpoint = this.config.organizationId 
      ? `/organizations/${this.config.organizationId}/events/`
      : '/users/me/owned_events/';

    const response = await this.makeEventbriteRequest('GET', endpoint, params);

    const eventsList = response.events.map((event: any) => ({
      id: event.id,
      name: event.name.text,
      status: event.status,
      start: event.start.local,
      end: event.end.local,
      url: event.url,
      capacity: event.capacity,
      online_event: event.online_event,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${response.pagination.object_count} events:\n\n${eventsList
            .map(
              (event: any) =>
                `• ${event.name} (${event.status})\n  ID: ${event.id}\n  Start: ${event.start}\n  URL: ${event.url}`
            )
            .join('\n\n')}`,
        },
      ],
    };
  }

  private async getEvent(args: any) {
    const { event_id } = args;

    const response = await this.makeEventbriteRequest('GET', `/events/${event_id}/`);

    return {
      content: [
        {
          type: 'text',
          text: `Event Details:\n\nID: ${response.id}\nName: ${response.name.text}\nStatus: ${response.status}\nDescription: ${response.description?.text || 'No description'}\n\nStart: ${response.start.local}\nEnd: ${response.end.local}\nTimezone: ${response.start.timezone}\n\nCapacity: ${response.capacity || 'Unlimited'}\nOnline Event: ${response.online_event}\nListed: ${response.listed}\n\nURL: ${response.url}`,
        },
      ],
    };
  }

  private async updateEvent(args: any) {
    const { event_id, name, description, start_date, end_date, timezone } = args;

    const updateData: any = {};

    if (name) {
      updateData.name = { html: name };
    }

    if (description) {
      updateData.description = { html: description };
    }

    if (start_date && timezone) {
      updateData.start = {
        timezone,
        utc: new Date(start_date).toISOString().replace('.000Z', 'Z'),
      };
    }

    if (end_date && timezone) {
      updateData.end = {
        timezone,
        utc: new Date(end_date).toISOString().replace('.000Z', 'Z'),
      };
    }

    const response = await this.makeEventbriteRequest('POST', `/events/${event_id}/`, {
      event: updateData,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Event updated successfully!\n\nEvent ID: ${response.id}\nName: ${response.name.text}\nStatus: ${response.status}\nURL: ${response.url}`,
        },
      ],
    };
  }

  private async publishEvent(args: any) {
    const { event_id } = args;

    const response = await this.makeEventbriteRequest('POST', `/events/${event_id}/publish/`);

    return {
      content: [
        {
          type: 'text',
          text: `Event published successfully!\n\nEvent ID: ${event_id}\nStatus: ${response.status}\nPublished: ${response.published}`,
        },
      ],
    };
  }

  private async cancelEvent(args: any) {
    const { event_id } = args;

    const response = await this.makeEventbriteRequest('POST', `/events/${event_id}/cancel/`);

    return {
      content: [
        {
          type: 'text',
          text: `Event canceled successfully!\n\nEvent ID: ${event_id}\nStatus: ${response.status}`,
        },
      ],
    };
  }

  private async deleteEvent(args: any) {
    const { event_id } = args;

    const response = await this.makeEventbriteRequest('DELETE', `/events/${event_id}/`);

    return {
      content: [
        {
          type: 'text',
          text: `Event deleted successfully!\n\nEvent ID: ${event_id}`,
        },
      ],
    };
  }

  private async deleteCanceledEvents(args: any) {
    const { confirm } = args;

    if (!confirm) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'Confirmation not provided. Please set confirm to true to delete all canceled events.'
      );
    }

    // First, get all canceled events
    const listResponse = await this.listEvents({ status: 'canceled' });
    
    // Extract event IDs from the response
    const canceledEventsResponse = await this.makeEventbriteRequest('GET', 
      this.config.organizationId 
        ? `/organizations/${this.config.organizationId}/events/`
        : '/users/me/owned_events/', 
      { status: 'canceled' }
    );

    const canceledEvents = canceledEventsResponse.events || [];
    
    if (canceledEvents.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No canceled events found to delete.',
          },
        ],
      };
    }

    // Delete each canceled event
    const deletionResults = [];
    for (const event of canceledEvents) {
      try {
        await this.makeEventbriteRequest('DELETE', `/events/${event.id}/`);
        deletionResults.push(`✅ Deleted: ${event.name.text} (ID: ${event.id})`);
      } catch (error) {
        deletionResults.push(`❌ Failed to delete: ${event.name.text} (ID: ${event.id}) - ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Deletion of canceled events completed!\n\nTotal canceled events found: ${canceledEvents.length}\n\nResults:\n${deletionResults.join('\n')}`,
        },
      ],
    };
  }

  private async listCategories() {
    const response = await this.makeEventbriteRequest('GET', '/categories/');

    const categoriesList = response.categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      short_name: category.short_name,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Available Categories:\n\n${categoriesList
            .map((category: any) => `• ${category.name} (ID: ${category.id})`)
            .join('\n')}`,
        },
      ],
    };
  }

  private async createVenue(args: any) {
    const { name, address, city, region, postal_code, country } = args;

    const venueData: VenueData = {
      name,
      address: {
        address_1: address,
        city,
        region,
        postal_code,
        country,
      },
    };

    const response = await this.makeEventbriteRequest('POST', '/venues/', {
      venue: venueData,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Venue created successfully!\n\nVenue ID: ${response.id}\nName: ${response.name}\nAddress: ${response.address.localized_address_display}`,
        },
      ],
    };
  }

  private async createWebhook(args: any) {
    const { endpoint_url, actions, event_id } = args;

    const response = await this.makeEventbriteRequest('POST', '/webhooks/', {
      endpoint_url,
      actions,
      event_id,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Webhook created successfully!\n\nWebhook ID: ${response.id}\nEndpoint URL: ${response.endpoint_url}\nActions: ${response.actions.join(', ')}\nEvent ID: ${response.event_id || 'All events'}`,
        },
      ],
    };
  }

  private async listWebhooks() {
    const response = await this.makeEventbriteRequest('GET', '/webhooks/');

    const webhooksList = response.webhooks.map((webhook: any) => ({
      id: webhook.id,
      endpoint_url: webhook.endpoint_url,
      actions: webhook.actions,
      event_id: webhook.event_id,
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Available Webhooks:\n\n${webhooksList
            .map((webhook: any) => `• ID: ${webhook.id}\n  Endpoint URL: ${webhook.endpoint_url}\n  Actions: ${webhook.actions}\n  Event ID: ${webhook.event_id}`)
            .join('\n\n')}`,
        },
      ],
    };
  }

  private async deleteWebhook(args: any) {
    const { webhook_id } = args;

    const response = await this.makeEventbriteRequest('DELETE', `/webhooks/${webhook_id}/`);

    return {
      content: [
        {
          type: 'text',
          text: `Webhook deleted successfully!\n\nWebhook ID: ${webhook_id}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Eventbrite MCP server running on stdio');
  }
}

const server = new EventbriteMCPServer();
server.run().catch(console.error); 