#!/usr/bin/env node

/**
 * TropiPay MCP Server
 * 
 * This MCP server integrates with the TropiPay electronic wallet API.
 * It supports both sandbox and production environments and provides
 * tools and resources for interacting with TropiPay services.
 * 
 * Environment Configuration:
 * - TROPIPAY_ENVIRONMENT: 'sandbox' or 'production' (default: 'sandbox')
 * - TROPIPAY_CLIENT_ID: Your TropiPay client ID
 * - TROPIPAY_CLIENT_SECRET: Your TropiPay client secret
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Tropipay } from "@yosle/tropipayjs";
import { config } from "process";

/**
 * TropiPay API configuration
 */
interface TropiPayConfig {
  environment: 'sandbox' | 'production' ;
  baseUrl?: string;
  clientId?: string;
  clientSecret?: string;
}

/**
 * Get TropiPay configuration from environment variables
 */
function getTropiPayConfig(): TropiPayConfig {
  const environment = (process.env.TROPIPAY_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox';
  
  // Check for custom base URL first, then fall back to environment-based URLs
  const customBaseUrl = process.env.TROPIPAY_BASE_URL;

  
  return {
    environment,
    baseUrl: customBaseUrl,
    clientId: process.env.TROPIPAY_CLIENT_ID,
    clientSecret: process.env.TROPIPAY_CLIENT_SECRET
  };
}

const tropiPayConfig = getTropiPayConfig();

/**
 * Create TropiPay client instance
 */
function createTropiPayClient(): Tropipay | null {
  if (!tropiPayConfig.clientId || !tropiPayConfig.clientSecret) {
    return null;
  }

  // Check if custom base URL is provided
  const customBaseUrl = process.env.TROPIPAY_BASE_URL;
  
  if (customBaseUrl) {
    // Use custom base URL
    return new Tropipay({
      clientId: tropiPayConfig.clientId,
      clientSecret: tropiPayConfig.clientSecret,
      customTropipayUrl: customBaseUrl
    });
  } else {
    // Use environment-based serverMode
    const serverMode = tropiPayConfig.environment === 'production' ? 'LIVE' : 'SANDBOX';
    return new Tropipay({
      clientId: tropiPayConfig.clientId,
      clientSecret: tropiPayConfig.clientSecret,
      serverMode: serverMode as any // Cast to any to avoid TypeScript issues
    });
  }
}

let tropiPayClient: Tropipay | null = null;

/**
 * Get or create TropiPay client instance
 */
function getTropiPayClient(): Tropipay {
  if (!tropiPayClient) {
    tropiPayClient = createTropiPayClient();
    if (!tropiPayClient) {
      throw new Error('TropiPay credentials not configured. Please set TROPIPAY_CLIENT_ID and TROPIPAY_CLIENT_SECRET environment variables.');
    }
  }
  return tropiPayClient;
}

/**
 * Create an MCP server with capabilities for resources, tools, and prompts
 * to interact with the TropiPay API.
 */
const server = new Server(
  {
    name: "TropiPay MCP Server",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

/**
 * Handler for listing available TropiPay resources.
 * Exposes configuration and status information as resources.
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "tropipay://config",
        mimeType: "application/json",
        name: "TropiPay Configuration",
        description: "Current TropiPay API configuration and environment settings"
      },
      {
        uri: "tropipay://status",
        mimeType: "application/json",
        name: "API Status",
        description: "TropiPay API connection status and health check"
      }
    ]
  };
});

/**
 * Handler for reading TropiPay resource contents.
 * Returns configuration or status information based on the URI.
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri);
  const resource = url.pathname.replace(/^\//, '');

  switch (resource) {
    case 'config':
      return {
        contents: [{
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify({
            environment: tropiPayConfig.environment,
            baseUrl: tropiPayConfig.baseUrl,
            hasCredentials: !!(tropiPayConfig.clientId && tropiPayConfig.clientSecret),
            clientId: tropiPayConfig.clientId ? `${tropiPayConfig.clientId.substring(0, 8)}...` : 'Not configured',
            libraryVersion: '@yosle/tropipayjs v0.2.1',
            clientInitialized: !!tropiPayClient
          }, null, 2)
        }]
      };
    
    case 'status':
      try {
        const client = getTropiPayClient();
        return {
          contents: [{
            uri: request.params.uri,
            mimeType: "application/json",
            text: JSON.stringify({
              status: 'ready',
              environment: tropiPayConfig.environment,
              baseUrl: tropiPayConfig.baseUrl,
              clientReady: true,
              timestamp: new Date().toISOString()
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          contents: [{
            uri: request.params.uri,
            mimeType: "application/json",
            text: JSON.stringify({
              status: 'error',
              environment: tropiPayConfig.environment,
              baseUrl: tropiPayConfig.baseUrl,
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString()
            }, null, 2)
          }]
        };
      }
    
    default:
      throw new Error(`Resource ${resource} not found`);
  }
});

/**
 * Handler that lists available TropiPay tools.
 * These tools use the tropipayjs library for TropiPay API operations.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_account_balance",
        description: "Get the current account balance from TropiPay (requires ALLOW_GET_BALANCE scope)",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "get_profile_data",
        description: "Get user profile information from TropiPay (requires ALLOW_GET_PROFILE_DATA scope)",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "get_movement_list",
        description: "Get list of account movements/transactions (requires ALLOW_GET_MOVEMENT_LIST scope)",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of movements to retrieve (default: 10)",
              minimum: 1,
              maximum: 100
            },
            offset: {
              type: "number",
              description: "Number of movements to skip (default: 0)",
              minimum: 0
            }
          },
          required: []
        }
      },
      {
        name: "get_accounts",
        description: "Get list of TropiPay accounts associated with the user",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "test_connection",
        description: "Test the connection to TropiPay API and verify authentication",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      }
    ]
  };
});

/**
 * Handler for TropiPay tool execution.
 * Implements the various TropiPay API operations using tropipayjs library.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const client = getTropiPayClient();

    switch (request.params.name) {
      case "get_account_balance": {
        try {
          const balance = await client.getBalance();
          return {
            content: [{
              type: "text",
              text: `💰 Account Balance\n\n` +
                    `Balance: $${balance.balance}\n` +
                    `Environment: ${tropiPayConfig.environment}\n` +
                    `Retrieved: ${new Date().toISOString()}`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `❌ Failed to get balance: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }

      case "get_profile_data": {
        try {
          const profile = await client.profile();
          return {
            content: [{
              type: "text",
              text: `👤 Profile Information\n\n` +
                    `Name: ${profile.name || 'N/A'}\n` +
                    `Email: ${profile.email || 'N/A'}\n` +
                    `Country: ${profile.country || 'N/A'}\n` +
                    `Phone: ${profile.phone || 'N/A'}\n` +
                    `Environment: ${tropiPayConfig.environment}\n` +
                    `Retrieved: ${new Date().toISOString()}`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `❌ Failed to get profile: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }

      case "get_movement_list": {
        try {
          const limit = (request.params.arguments?.limit as number) || 10;
          const offset = (request.params.arguments?.offset as number) || 0;
          
          const movements = await client.movements(limit, offset);
          
          if (!movements || movements.length === 0) {
            return {
              content: [{
                type: "text",
                text: `📋 No movements found\n\nEnvironment: ${tropiPayConfig.environment}`
              }]
            };
          }

          const movementsList = movements.map((movement: any, index: number) => 
            `${index + 1}. ${movement.type || 'Unknown'} - $${movement.amount || '0'} ${movement.currency || ''} (${movement.date || 'No date'})`
          ).join('\n');

          return {
            content: [{
              type: "text",
              text: `📋 Account Movements (${movements.length} items)\n\n` +
                    movementsList +
                    `\n\nEnvironment: ${tropiPayConfig.environment}\n` +
                    `Retrieved: ${new Date().toISOString()}`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `❌ Failed to get movements: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }

      case "get_accounts": {
        try {
          // Try to get accounts using the accounts property/method
          const accountsData = await client.accounts.list();
          
          if (!accountsData || !Array.isArray(accountsData) || accountsData.length === 0) {
            return {
              content: [{
                type: "text",
                text: `🏦 No TropiPay accounts found\n\nThis could mean:\n- No accounts are configured for this user\n- The user doesn't have permission to view accounts\n- The API endpoint is not available\n\nEnvironment: ${tropiPayConfig.environment}`
              }]
            };
          }

          // Helper function to explain account field meanings
          const explainAccountField = (field: string, value: any): string => {
            const explanations: { [key: string]: string } = {
              'alias': 'Account alias set by the user',
              'id': 'Unique account identifier in TropiPay system',
              'accountNumber':'Unique human friendly identifier ',
              'type': 'Account type (Regular Account: 1, Tropicard Account: 2, Other: 3,  Pre funded account: 4)',
              'currency': 'Base currency for this account (USD, EUR, etc.)',
              'pendingIn':'Pending in balance. Charged but still not reaady to use balance',
              'balance': 'Current available balance in the account currency',
              'state': 'Account status (ACTIVE: 1, PAUSED: 2, BLOCKED: 3, DELETED (logic delete): 4)',
              'country': 'Country where the account is registered',
              'created_at': 'Date when the account was created',
              'updated_at': 'Last modification date of account information',
              'isDefault':'Selected as default account'
            };
            
            const explanation = explanations[field] || 'Account information field';
            return value ? `${value} (${explanation})` : `N/A (${explanation})`;
          };

          const accountsList = accountsData.map((account: any, index: number) => {
            const accountInfo = [
              `💼 Account #${index + 1}:`,
              `   🏷️  Name/ID: ${explainAccountField('name', account.name || account.id)}`,
              `   📊 Type: ${explainAccountField('type', account.type)}`,
              `   💱 Currency: ${explainAccountField('currency', account.currency)}`,
              `   💰 Balance: $${account.balance || '0'} (Current available funds)`,
              `   ✅ State: ${explainAccountField('status', account.status)}`
            ];
            
            // Add additional fields if present
            if (account.country) {
              accountInfo.push(`   🌍 Country: ${explainAccountField('country', account.country)}`);
            }
            if (account.created_at) {
              accountInfo.push(`   📅 Created: ${explainAccountField('created_at', account.created_at)}`);
            }
            if (account.permissions && Array.isArray(account.permissions)) {
              accountInfo.push(`   🔐 Permissions: ${account.permissions.join(', ')} (Available operations for this account)`);
            }
            
            return accountInfo.join('\n');
          }).join('\n\n');

          // Add contextual information for the LLM
          const contextInfo = [
            `\n📝 CONTEXT FOR ANALYSIS:`,
            `- Total accounts found: ${accountsData.length}`,
            `- Account services help determine available operations for this account`,
            `- Balance shows immediately available funds (may not include pending transactions)`,
            `- Each account may have different permissions and limitations based on verification level`,
            `- Multi-currency accounts allow operations in different currencies`
          ].join('\n');

          return {
            content: [{
              type: "text",
              text: `🏦 TropiPay Accounts Overview\n\n` +
                    accountsList +
                    contextInfo +
                    `\n\n🔧 Technical Info:\n` +
                    `Environment: ${tropiPayConfig.environment}\n` +
                    `Retrieved: ${new Date().toISOString()}\n` +
                    `API Endpoint: accounts.list()`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `❌ Failed to retrieve TropiPay accounts\n\n` +
                    `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
                    `📝 Possible causes:\n` +
                    `- Invalid or expired authentication credentials\n` +
                    `- Insufficient permissions to access account information\n` +
                    `- API endpoint not available in current environment\n` +
                    `- Network connectivity issues\n` +
                    `- The tropipayjs library method signature may have changed\n\n` +
                    `🔧 Technical details:\n` +
                    `Environment: ${tropiPayConfig.environment}\n` +
                    `Method attempted: client.accounts.list()`
            }]
          };
        }
      }

      case "test_connection": {
        try {
          // Test by getting balance (this will verify authentication)
          await client.getBalance();
          return {
            content: [{
              type: "text",
              text: `✅ TropiPay Connection Test Successful\n\n` +
                    `Environment: ${tropiPayConfig.environment}\n` +
                    `Base URL: ${tropiPayConfig.baseUrl}\n` +
                    `Library: @yosle/tropipayjs v0.2.1\n` +
                    `Authentication: Valid\n` +
                    `Timestamp: ${new Date().toISOString()}`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `❌ Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
});

/**
 * Handler that lists available TropiPay prompts.
 * Provides prompts for common TropiPay operations and guidance.
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "tropipay_setup_guide",
        description: "Guide for setting up TropiPay MCP server with proper credentials and environment",
      },
      {
        name: "tropipay_api_overview",
        description: "Overview of available TropiPay API operations and how to use them",
      }
    ]
  };
});

/**
 * Handler for TropiPay prompts.
 * Provides helpful guidance and setup information.
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  switch (request.params.name) {
    case "tropipay_setup_guide":
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `# TropiPay MCP Server Setup Guide\n\n## Environment Configuration\n\nTo use this TropiPay MCP server, you need to configure the following environment variables:\n\n### Required Variables:\n- \`TROPIPAY_CLIENT_ID\`: Your TropiPay application client ID\n- \`TROPIPAY_CLIENT_SECRET\`: Your TropiPay application client secret\n\n### Optional Variables:\n- \`TROPIPAY_ENVIRONMENT\`: Set to 'sandbox' (default) or 'production'\n\n## Current Configuration:\n- Environment: ${tropiPayConfig.environment}\n- Base URL: ${tropiPayConfig.baseUrl}\n- Credentials: ${tropiPayConfig.clientId && tropiPayConfig.clientSecret ? 'Configured ✅' : 'Not configured ❌'}\n\n## Getting Started:\n1. Obtain your TropiPay API credentials from the TropiPay developer portal\n2. Set the environment variables\n3. Use the available tools to interact with TropiPay services\n\nPlease provide the TropiPay API endpoints you'd like to integrate for full functionality.`
            }
          }
        ]
      };
    
    case "tropipay_api_overview":
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `# TropiPay API Overview\n\n## Available Tools:\n\n### 🔧 test_connection\nTest the connection to TropiPay API and verify configuration.\n\n### 💰 get_account_balance\nRetrieve current account balance (implementation pending endpoint details).\n\n## Available Resources:\n\n### 📋 Configuration (tropipay://config)\nView current TropiPay configuration and environment settings.\n\n### 📊 Status (tropipay://status)\nCheck API connection status and health.\n\n## Environment: ${tropiPayConfig.environment}\n## Base URL: ${tropiPayConfig.baseUrl}\n\n*More tools and resources will be added as you provide TropiPay endpoint specifications.*`
            }
          }
        ]
      };
    
    default:
      throw new Error(`Unknown prompt: ${request.params.name}`);
  }
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
