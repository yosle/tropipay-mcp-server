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
  environment: 'sandbox' | 'production';
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
      },
      {
        uri: "tropipay://movement-types",
        mimeType: "application/json",
        name: "Movement Types Reference",
        description: "Complete reference of TropiPay movementType IDs and their meanings"
      },
      {
        uri: "tropipay://movement-states",
        mimeType: "application/json",
        name: "Movement States Reference",
        description: "Complete reference of TropiPay movement state codes and their meanings"
      },
      {
        uri: "tropipay://account-types",
        mimeType: "application/json",
        name: "Account Types Reference",
        description: "Complete reference of TropiPay account type IDs and their meanings"
      },
      {
        uri: "tropipay://account-states",
        mimeType: "application/json",
        name: "Account States Reference",
        description: "Complete reference of TropiPay account state codes and their meanings"
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
          })
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
            })
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
            })
          }]
        };
      }

    case 'movement-types':
      return {
        contents: [{
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify({
            title: "TropiPay Movement Types Reference",
            description: "Complete reference of movement type IDs and their meanings",
            movementTypes: {
              "1": {
                "id": 1,
                "name": "Transfer",
                "description": "Standard money transfer between accounts or to external recipients"
              },
              "2": {
                "id": 2,
                "name": "Card Credit",
                "description": "Credit received from card transactions or card-related operations"
              },
              "3": {
                "id": 3,
                "name": "Refund",
                "description": "Money returned from a previous transaction or service"
              },
              "4": {
                "id": 4,
                "name": "Card Refund",
                "description": "Refund specifically related to card transactions"
              },
              "5": {
                "id": 5,
                "name": "Top Up",
                "description": "Adding funds to the account from external sources"
              },
              "6": {
                "id": 6,
                "name": "Exchange",
                "description": "Currency exchange operations"
              },
              "7": {
                "id": 7,
                "name": "ATM",
                "description": "ATM withdrawals or ATM-related transactions"
              },
              "8": {
                "id": 8,
                "name": "Fee",
                "description": "Service fees charged for various operations"
              },
              "9": {
                "id": 9,
                "name": "Adjustment",
                "description": "Account balance adjustments or corrections"
              }
            },
            lastUpdated: new Date().toISOString()
          })
        }]
      };

    case 'movement-states':
      return {
        contents: [{
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify({
            title: "TropiPay Movement States Reference",
            description: "Complete reference of movement state codes and their meanings",
            movementStates: {
              "2": {
                "id": 2,
                "name": "Charged",
                "description": "Transaction has been charged but may not be fully processed",
                "category": "processing"
              },
              "3": {
                "id": 3,
                "name": "Paid",
                "description": "Transaction has been successfully completed and paid",
                "category": "completed"
              },
              "4": {
                "id": 4,
                "name": "Error",
                "description": "Transaction failed due to an error",
                "category": "failed"
              },
              "5": {
                "id": 5,
                "name": "Pending In",
                "description": "Incoming transaction is pending processing",
                "category": "pending"
              },
              "6": {
                "id": 6,
                "name": "Cancelled",
                "description": "Transaction was cancelled before completion",
                "category": "cancelled"
              }
            },
            categories: {
              "processing": "Transaction is being processed",
              "completed": "Transaction completed successfully",
              "failed": "Transaction failed",
              "pending": "Transaction awaiting processing",
              "cancelled": "Transaction was cancelled"
            },
            lastUpdated: new Date().toISOString()
          })
        }]
      };

    case 'account-types':
      return {
        contents: [{
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify({
            title: "TropiPay Account Types Reference",
            description: "Complete reference of account type IDs and their meanings",
            accountTypes: {
              "1": {
                "id": 1,
                "name": "Regular Account",
                "description": "Standard wallet account for general use",
                "features": ["transfers", "payments", "balance_management"]
              },
              "2": {
                "id": 2,
                "name": "Tropicard Account",
                "description": "Account linked to a TropiCard for card transactions",
                "features": ["card_transactions", "atm_access", "pos_payments"]
              },
              "3": {
                "id": 3,
                "name": "Other",
                "description": "Special purpose accounts with specific use cases",
                "features": ["specialized_operations"]
              },
              "4": {
                "id": 4,
                "name": "Pre-funded Account",
                "description": "Accounts with pre-loaded funds for specific purposes",
                "features": ["pre_loaded_balance", "restricted_operations"]
              }
            },
            lastUpdated: new Date().toISOString()
          })
        }]
      };

    case 'account-states':
      return {
        contents: [{
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify({
            title: "TropiPay Account States Reference",
            description: "Complete reference of account state codes and their meanings",
            accountStates: {
              "1": {
                "id": 1,
                "name": "ACTIVE",
                "description": "Account is operational and can perform all allowed operations",
                "category": "operational",
                "allowedOperations": ["transfers", "payments", "withdrawals", "deposits"]
              },
              "2": {
                "id": 2,
                "name": "PAUSED",
                "description": "Account is temporarily suspended, limited operations allowed",
                "category": "restricted",
                "allowedOperations": ["view_balance", "view_history"]
              },
              "3": {
                "id": 3,
                "name": "BLOCKED",
                "description": "Account access is restricted, no operations allowed",
                "category": "blocked",
                "allowedOperations": []
              },
              "4": {
                "id": 4,
                "name": "DELETED",
                "description": "Account is logically deleted but not physically removed",
                "category": "inactive",
                "allowedOperations": []
              }
            },
            categories: {
              "operational": "Account is fully functional",
              "restricted": "Account has limited functionality",
              "blocked": "Account is blocked from operations",
              "inactive": "Account is no longer active"
            },
            lastUpdated: new Date().toISOString()
          })
        }]
      };

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
        description: "Get list of account movements/transactions (requires ALLOW_GET_MOVEMENT_LIST scope).\n\n" +
          "📋 **Response Structure:**\n" +
          "- `count`: Total number of movements available\n" +
          "- `rows`: Array of movement objects with the following key fields:\n" +
          "- `id`: Unique movement identifier\n" +
          "- `amount`: Transaction amount (+ for credits, - for debits)\n" +
          "- `currency`: Currency code (USD, EUR, etc.)\n" +
          "- `movementTypeId`: Type classification (1=Transfer, 2=Card Credit, 3=Refund, 4=Card Refund, 5=Top Up, 6=Exchange, 7=ATM, 8=Fee, 9=Adjustment)\n" +
          "- `state`: Transaction status (2=Charged, 3=Paid, 4=Error, 5=Pending In, 6=Cancelled)\n" +
          "- `bankOrderCode`: Transaction identifier (TX prefix for regular, DEV for refunds)\n" +
          "- `balanceBefore`/`balanceAfter`: Account balance before/after transaction\n" +
          "- `reference`: User-defined reference\n" +
          "- `conceptTransfer`: Transaction description\n" +
          "- `completedAt`/`createdAt`: Transaction timestamps\n" +
          "- `fee`: Transaction fee (if applicable)\n\n" +
          "- `accountId`: Id of the account that this movement belongs\n" +
          "- `originalCurrencyAmount`: Amount in original currency\n" +
          "- `destinationAmount`: Amount in destination currency\n" +
          "- `destinationCurrency`: Destination currency code\n" +
          "- `conversionRate`: Applied rate for this movement\n" +
          "- `paymentcard`: uuid of asociated paymentcard to this movement or null otherwise\n" +
          "💡 **Tip**: Use the 'tropipay_movements_schema' prompt for detailed field explanations.",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of movements to retrieve (default: 10)",
              minimum: 1,
              maximum: 50
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
        name: "list_deposit_accounts",
        description: "Get list of deposit accounts(a.k.a beneficiaries) available for the user.\n\n" +
          "💡 **Tip**: depositaccount are also refered as beneficiaries can be internal(other Tropipay accounts) " +
          "or external (bank accounts, external cripto wallets)\n\n" +
          "📋 **Response Structure:**\n" +
          "- `Array of depositaccounts objects:\n" +
          "- `id`: Unique deposit account identifier\n" +
          "- `accountNumber`: IBAN for external bank accounts, wallet address for external crypto accounts, email of user for internal beneficiaries)\n" +
          "- `alias`: if not null, User-friendly account name/alias set by user\n" +
          "- `currency`: Account currency\n" +
          "- `type`: Account type (9=Tropipay account, 12=crypto, 7=Other, 8=BANDEC card, 4= BPA card, 3=BANMET card)\n" +
          "- `state`: Account status (0=Active, 1=Inactive, 2=Deleted)\n" +
          "- `countrydestination`: Object with info about the country where the account is registered,slug, name etc\n" +
          "- `userRelationTypeId`: Type of relation with the user (0=myself, 3=commercial)\n" +
          "- `createdAt`/`updatedAt`: Account creation and modification timestamps\n" +
          "- `firstName`: First name of the beneficiary with the account\n" +
          "- `lastName`: Last name of the beneficiary with the account",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "create_paymentcard",
        description: "Create a new payment card (payment link) using TropiPay API.\n\n" +
          "📋 **Required Fields:**\n" +
          "- `reference`: Unique reference identifier for the payment\n" +
          "- `concept`: Payment concept/title\n" +
          "- `amount`: Payment amount (in cents, e.g., 3000 = $30.00)\n" +
          "- `currency`: Payment currency (USD, EUR, etc.)\n\n" +
          "📋 **Optional Fields:**\n" +
          "- `description`: Additional description for the payment\n" +
          "- `favorite`: Mark as favorite (true/false)\n" +
          "- `singleUse`: Whether the link can be used only once (true/false)\n" +
          "- `expirationDays`: Number of days until expiration\n" +
          "- `reasonId`: Reason ID for the payment\n" +
          "- `lang`: Language code (es, en, etc.)\n" +
          "- `urlSuccess`: Success redirect URL\n" +
          "- `urlFailed`: Failed payment redirect URL\n" +
          "- `urlNotification`: Webhook notification URL\n" +
          "- `serviceDate`: Service date (YYYY-MM-DD format)\n" +
          "- `directPayment`: Enable direct payment (true/false)\n\n" +
          "⚠️ **Important**: All mandatory fields must be provided. If any are missing, you will be prompted to provide them.",
        inputSchema: {
          type: "object",
          properties: {
            reference: {
              type: "string",
              description: "Unique reference identifier for the payment"
            },
            concept: {
              type: "string",
              description: "Payment concept/title"
            },
            amount: {
              type: "number",
              description: "Payment amount in cents (e.g., 3000 = $30.00)"
            },
            currency: {
              type: "string",
              description: "Payment currency (USD, EUR, etc.)"
            },
            description: {
              type: "string",
              description: "Additional description for the payment (optional)"
            },
            favorite: {
              type: "string",
              description: "Mark as favorite - true or false (optional)"
            },
            singleUse: {
              type: "string",
              description: "Whether the link can be used only once - true or false (optional)"
            },
            expirationDays: {
              type: "number",
              description: "Number of days until expiration (optional)"
            },
            reasonId: {
              type: "number",
              description: "Reason ID for the payment (optional)"
            },
            lang: {
              type: "string",
              description: "Language code like es, en (optional)"
            },
            urlSuccess: {
              type: "string",
              description: "Success redirect URL (optional)"
            },
            urlFailed: {
              type: "string",
              description: "Failed payment redirect URL (optional)"
            },
            urlNotification: {
              type: "string",
              description: "Webhook notification URL (optional)"
            },
            serviceDate: {
              type: "string",
              description: "Service date in YYYY-MM-DD format (optional)"
            },
            directPayment: {
              type: "string",
              description: "Enable direct payment - true or false (optional)"
            }
          },
          required: ["reference", "concept", "amount", "currency"]
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
              text: `💰 Current Default Account Balance\n\n` +
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

          // Use the correct method to get movements from TropiPay API
          // The movements method expects separate parameters: limit and offset
          const movements = await client.movements(limit, offset);
          if (!movements || !movements.rows || movements.rows.length === 0) {
            return {
              content: [{
                type: "text",
                text: `📋 No movements found\n\nEnvironment: ${tropiPayConfig.environment}`
              }]
            };
          }

          // Return the complete JSON data for maximum LLM flexibility
          // Use safe JSON serialization to avoid circular references and invalid characters
          let movementsJson;
          try {
            // Create a clean copy to avoid circular references
            const cleanMovements = {
              count: movements.count || 0,
              rows: movements.rows || [],
              // Include any other top-level properties but filter out potential problematic ones
              ...(movements.offset !== undefined && { offset: movements.offset }),
              ...(movements.limit !== undefined && { limit: movements.limit })
            };
            movementsJson = JSON.stringify(cleanMovements, null, 2);
          } catch (jsonError) {
            // Fallback to a safe representation if JSON serialization fails
            movementsJson = JSON.stringify({
              error: "JSON serialization failed",
              count: movements?.count || 0,
              rowsLength: movements?.rows?.length || 0,
              message: "Raw data could not be serialized safely"
            }, null, 2);
          }

          return {
            content: [{
              type: "text",
              text: `📋 Account Movements Data (${movements.count || 0} total items, showing ${movements.rows?.length || 0})\n\n` +
                `Environment: ${tropiPayConfig.environment}\n` +
                `Retrieved: ${new Date().toISOString()}\n\n` +
                `💡 **Tip**: Use the 'tropipay_movements_schema' prompt for detailed field explanations.\n\n` +
                `**Raw Data (JSON):**\n\`\`\`json\n${movementsJson}\n\`\`\``
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

          const cleanAccounts = accountsData.map(account => ({
            id: account.id,
            alias: account.alias,
            balance: account.balance,
            pendingIn: account.pendingIn,
            pendingOut: account.pendingOut,
            accountNumber: account.accountNumber,
            currency: account.currency,            
            type: account.type,
            state: account.state,
            isDefault: account.isDefault,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt
          })); 

          return {
            content: [{
              type: "text",
              text: `🏦 TropiPay Accounts Data (${Array.isArray(accountsData) ? accountsData.length : 0} accounts found)\n\n` +
                `Environment: ${tropiPayConfig.environment}\n` +
                `Retrieved: ${new Date().toISOString()}\n\n` +
                `💡 **Tip**: Use the 'tropipay_accounts_schema' prompt for detailed field explanations.\n\n` +
                `**Raw Data (JSON):**\n\`\`\`json\n${JSON.stringify(cleanAccounts)}\n\`\`\``
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

      case "list_deposit_accounts": {
        try {
          // Try to get deposit accounts using the depositAccounts property/method
          const depositAccountsData = await client.depositAccounts.list();
          if ( depositAccountsData?.rows?.length === 0) {
            return {
              content: [{
                type: "text",
                text: `🏦 No deposit accounts found\n\nThis could mean:\n- No deposit accounts are configured for this user\n- The user doesn't have permission to view deposit accounts\n- The API endpoint is not available\n\nEnvironment: ${tropiPayConfig.environment}`
              }]
            };
          }      

          return {
            content: [{
              type: "text",
              text: `🏦 TropiPay Deposit Accounts Data (${Array.isArray(depositAccountsData.rows) ? depositAccountsData.rows.length : 0} accounts found)\n\n` +
                `Environment: ${tropiPayConfig.environment}\n` +
                `Retrieved: ${new Date().toISOString()}\n\n` +
                `💡 **Tip**: Use the 'tropipay_accounts_schema' prompt for detailed field explanations.\n\n` +
                `**Raw Data (JSON):**\n\`\`\`json\n${JSON.stringify(depositAccountsData,null, 2)}\n\`\`\``
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `❌ Failed to retrieve TropiPay deposit accounts\n\n` +
                `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
                `📝 Possible causes:\n` +
                `- Invalid or expired authentication credentials\n` +
                `- Insufficient permissions to access deposit account information\n` +
                `- API endpoint not available in current environment\n` +
                `- Network connectivity issues\n` +
                `- The tropipayjs library method signature may have changed\n\n` +
                `🔧 Technical details:\n` +
                `Environment: ${tropiPayConfig.environment}\n` +
                `Method attempted: client.depositAccounts.list()`
            }]
          };
        }
      }

      case "create_paymentcard": {
        try {
          // Extract parameters from the request
          const args = request.params.arguments || {};
          const {
            reference,
            concept,
            amount,
            currency,
            description,
            favorite,
            singleUse,
            expirationDays,
            reasonId,
            lang,
            urlSuccess,
            urlFailed,
            urlNotification,
            serviceDate,
            directPayment
          } = args as {
            reference?: string;
            concept?: string;
            amount?: number;
            currency?: string;
            description?: string;
            favorite?: string;
            singleUse?: string;
            expirationDays?: number;
            reasonId?: number;
            lang?: string;
            urlSuccess?: string;
            urlFailed?: string;
            urlNotification?: string;
            serviceDate?: string;
            directPayment?: string;
          };

          // Validate required fields and collect missing ones
          const requiredFields = {
            reference: "Unique reference identifier for the payment",
            concept: "Payment concept/title",
            amount: "Payment amount (in cents, e.g., 3000 = $30.00)",
            currency: "Payment currency (USD, EUR, etc.)"
          };

          const missingFields: string[] = [];
          const providedValues: Record<string, any> = {};

          // Check each required field
          Object.entries(requiredFields).forEach(([field, description]) => {
            const value = args[field as keyof typeof args];
            if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
              missingFields.push(`- **${field}**: ${description}`);
            } else {
              providedValues[field] = value;
            }
          });

          // If there are missing fields, prompt the user to provide them
          if (missingFields.length > 0) {
            return {
              content: [{
                type: "text",
                text: `❌ Missing Required Fields for Payment Card Creation\n\n` +
                  `The following mandatory fields are missing or empty:\n\n${missingFields.join('\n')}\n\n` +
                  `📝 **Please provide all required fields:**\n\n` +
                  `Example usage:\n\`\`\`\n` +
                  `{\n` +
                  `  "reference": "my-payment-001",\n` +
                  `  "concept": "Product Purchase",\n` +
                  `  "amount": 5000,\n` +
                  `  "currency": "USD",\n` +
                  `  "description": "Purchase of premium service", // optional\n` +
                  `  "singleUse": "true", // optional\n` +
                  `  "expirationDays": 7 // optional\n` +
                  `}\n\`\`\`\n\n` +
                  `💡 **Note**: Amount should be in cents (e.g., 5000 = $50.00)`
              }]
            };
          }

          // All required fields are present, proceed with payment card creation
          const paymentCardData: any = {
            reference: reference!,
            concept: concept!,
            amount: amount!,
            currency: currency!,
            ...(description && { description }),
            ...(favorite && { favorite }),
            ...(singleUse && { singleUse }),
            ...(expirationDays && { expirationDays }),
            ...(reasonId && { reasonId }),
            ...(lang && { lang }),
            ...(urlSuccess && { urlSuccess }),
            ...(urlFailed && { urlFailed }),
            ...(urlNotification && { urlNotification }),
            ...(serviceDate && { serviceDate }),
            ...(directPayment && { directPayment })
          };

          // Create the payment card using tropipayjs
          const result = await client.paymentCards.create(paymentCardData);

          return {
            content: [{
              type: "text",
              text: `✅ Payment Card Created Successfully\n\n` +
                `🎯 **Payment Details:**\n` +
                `- Reference: ${reference}\n` +
                `- Concept: ${concept}\n` +
                `- Amount: ${(amount! / 100).toFixed(2)} ${currency}\n` +
                `- Currency: ${currency}\n` +
                `${description ? `- Description: ${description}\n` : ''}` +
                `\n📋 **API Response:**\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\`\n\n` +
                `Environment: ${tropiPayConfig.environment}\n` +
                `Created: ${new Date().toISOString()}`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `❌ Failed to create payment card\n\n` +
                `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
                `📝 Possible causes:\n` +
                `- Invalid card details (PAN, CVV, expiration date)\n` +
                `- Insufficient permissions to create payment cards\n` +
                `- API endpoint not available in current environment\n` +
                `- Network connectivity issues\n` +
                `- Invalid card number format or expired card\n\n` +
                `🔧 Technical details:\n` +
                `Environment: ${tropiPayConfig.environment}\n` +
                `Method attempted: client.paymentCards.create()`
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
      },
      {
        name: "tropipay_movements_schema",
        description: "Detailed explanation of TropiPay movements data structure, field meanings, and value interpretations",
      },
      {
        name: "tropipay_accounts_schema",
        description: "Detailed explanation of TropiPay accounts data structure, field meanings, and account types",

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
              text: `# TropiPay MCP Server Setup Guide\n\n
              ## Environment Configuration\n\n
              
              To use this TropiPay MCP server, you need to configure the following environment variables:\n\n
              ### Required Variables:\n
              - \`TROPIPAY_CLIENT_ID\`: Your TropiPay application client ID\n
              - \`TROPIPAY_CLIENT_SECRET\`: Your TropiPay application client secret\n\n
              
              ### Optional Variables:\n
              - \`TROPIPAY_ENVIRONMENT\`: Set to 'sandbox' (default) or 'production'\n\n
              
              ## Current Configuration:\n
              - Environment: ${tropiPayConfig.environment}\n
              - Base URL: ${tropiPayConfig.baseUrl}\n
              - Credentials: ${tropiPayConfig.clientId && tropiPayConfig.clientSecret ? 'Configured ✅' : 'Not configured ❌'}\n\n
              
              ## Getting Started:\n
              1. Obtain your TropiPay API credentials from the TropiPay developer portal\n
              2. Set the environment variables\n3. Use the available tools to interact with TropiPay services\n\n
              
              Please provide the TropiPay API endpoints you'd like to integrate for full functionality.`
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
              text: `# TropiPay API Overview\n\n## Available Tools:\n\n### 🔧 test_connection\nTest the connection to TropiPay API and verify configuration.\n\n### 💰 get_account_balance\nRetrieve current account balance (implementation pending endpoint details).\n\n## Available Resources:\n\n### 📋 Configuration (tropipay://config)\nView current TropiPay configuration and environment settings.\n\n### 📈 Status (tropipay://status)\nCheck API connection status and health.\n\n## Environment: ${tropiPayConfig.environment}\n## Base URL: ${tropiPayConfig.baseUrl}\n\n*More tools and resources will be added as you provide TropiPay endpoint specifications.*`
            }
          }
        ]
      };

    case "tropipay_movements_schema":
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `# 📋 TropiPay Movements Schema Documentation

## 🎯 Purpose
This documentation provides a complete reference for understanding TropiPay movement (transaction) data structures. Each field is explained with its data type, purpose, and usage context to enable effective LLM processing and analysis.

## 📖 Complete Field Reference

### **🔑 Core Identifiers**
- \`id\`: Integer - Unique movement identifier (database primary key)
  - Used for: Direct transaction lookup, database operations
  - Example: 123456789

- \`bankOrderCode\`: String - Transaction identifier that can be shared by related operations
  - Format patterns:
    - \`TX\` prefix: Regular transactions (e.g., "TX123456")
    - \`DEV\` prefix: Devolutions/refunds (e.g., "DEV123456")
  - Used for: Grouping related transactions, tracking refunds

### **💰 Financial Data**
- \`amount\`: Number - Transaction amount
  - Positive values: Credits (money received)
  - Negative values: Debits (money sent/spent)
  - Currency: Matches the \`currency\` field
  - Example: 100.50, -25.00

- \`currency\`: String - Currency code (ISO 4217 format)
  - Common values: "USD", "EUR", "CUP"
  - Used for: Multi-currency operations, exchange rate calculations

- \`balanceAfter\`: Number - Account balance after this transaction
  - Critical for: Balance verification, transaction validation
  - Formula: balanceBefore + amount = balanceAfter

- \`balanceBefore\`: Number - Account balance before this transaction
  - Used for: Transaction impact analysis, balance tracking

- \`fee\`: Number - Transaction fee (if applicable)
  - Usually positive value representing cost
  - May be 0 for fee-free transactions

### **📊 Transaction Classification**
- \`movementTypeId\`: Integer - Movement type classification
  - \`1\`: **Transfer** - Standard money transfer between accounts or to external recipients
  - \`2\`: **Card Credit** - Credit received from card transactions or card-related operations
  - \`3\`: **Refund** - Money returned from a previous transaction or service
  - \`4\`: **Card Refund** - Refund specifically related to card transactions
  - \`5\`: **Top Up** - Adding funds to the account from external sources
  - \`6\`: **Exchange** - Currency exchange operations
  - \`7\`: **ATM** - ATM withdrawals or ATM-related transactions
  - \`8\`: **Fee** - Service fees charged for various operations
  - \`9\`: **Adjustment** - Account balance adjustments or corrections

### **🚦 Transaction Status**
- \`state\`: Integer - Transaction state (lifecycle status)
  - \`2\`: **Charged** - For card credit charges is the final completed state, for out movements it means the money has been debited from the account but not yet send
  - \`3\`: **Paid** - Transaction has been successfully completed and paid. Final state for external bank transfers.
  - \`4\`: **Error** - Transaction failed due to an error
  - \`5\`: **Pending In** - Incoming transaction is pending processing
  - \`6\`: **Cancelled** - Transaction was cancelled before completion

### **📝 Descriptive Fields**
- \`conceptTransfer\`: String - Transaction concept/description
  - Purpose: Usually used in external bank transfers, sent to destination
  - Contains: User-provided or system-generated description
  - Example: "Payment for services", "Salary transfer"

- \`reference\`: String - User-defined reference
  - Purpose: Custom reference set by user (non-unique, user-defined)
  - Used for: Personal organization, invoice numbers, notes
  - Example: "INV-2024-001", "Rent January"

### **📅 Temporal Data**
- \`completedAt\` or \`createdAt\`: String/DateTime - Transaction timestamp
  - Format: ISO 8601 datetime string
  - Used for: Chronological sorting, date range filtering
  - Example: "2024-01-15T14:30:00Z"

### **🔍 Additional Fields (Context-Dependent)**
- \`accountId\`: Integer - Associated account identifier
- \`userId\`: Integer - User who initiated the transaction
- \`destinationAccount\`: String - Target account for transfers
- \`sourceAccount\`: String - Origin account for incoming transfers

## 🤖 Usage Tips for LLM Processing

### **1. Transaction Filtering & Categorization**
- Use \`movementTypeId\` for grouping by transaction type
- Use \`state\` for filtering by completion status
- Combine both for specific analysis (e.g., "failed transfers")

### **2. Financial Analysis**
- \`balanceBefore\` + \`amount\` should equal \`balanceAfter\` for validation
- Sum \`amount\` values for period totals
- Group by \`currency\` for multi-currency analysis

### **3. Related Transaction Discovery**
- Group by \`bankOrderCode\` to find related operations
- Look for DEV-prefixed codes to find refunds
- Match \`reference\` fields for user-grouped transactions

### **4. User Experience Enhancement**
- Use \`reference\` and \`conceptTransfer\` for user-friendly descriptions
- Prioritize \`reference\` if available, fallback to \`conceptTransfer\`
- Format \`amount\` with proper currency symbols

### **5. Error Handling & Monitoring**
- Check \`state\` for failed (4) or pending (5) transactions
- Monitor \`fee\` values for cost analysis
- Validate balance calculations for data integrity

### **6. Temporal Analysis**
- Sort by \`date\`/\`created_at\` for chronological views
- Group by date ranges for period analysis
- Use timestamps for transaction timing analysis

## 🎯 Common Use Cases

1. **Transaction History**: Display chronological list with user-friendly descriptions
2. **Balance Reconciliation**: Verify account balance changes over time
3. **Expense Categorization**: Group transactions by type and analyze spending patterns
4. **Refund Tracking**: Find original transactions and their corresponding refunds
5. **Fee Analysis**: Calculate total fees paid over specific periods
6. **Multi-currency Management**: Handle transactions across different currencies

This comprehensive schema enables sophisticated financial analysis, transaction categorization, and balance reconciliation for TropiPay movement data.`
            }
          }
        ]
      };

    case "tropipay_accounts_schema":
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `# TropiPay Accounts Schema Documentation\n\n## 🏦 Complete Field Reference\n\n### **Core Identifiers**\n- \`id\`: Integer - Unique account identifier in TropiPay system (database primary key)\n- \`accountNumber\`: String - Unique human-friendly identifier for the account\n- \`alias\`: String - Account alias/name set by the user for easy identification\n\n### **Account Classification**\n- \`type\`: Integer - Account type classification:\n  - \`1\`: Regular Account (standard wallet account)\n  - \`2\`: Tropicard Account (card-linked account)\n  - \`3\`: Other (special purpose accounts)\n  - \`4\`: Pre-funded Account (accounts with pre-loaded funds)\n\n### **Financial Information**\n- \`balance\`: Number - Current available balance in the account currency\n- \`pendingIn\`: Number - Pending incoming balance (charged but not yet ready to use)\n- \`currency\`: String - Base currency for this account (USD, EUR, etc.)\n- \`fee\`: Number - Associated fees (if applicable)\n\n### **Account Status**\n- \`state\`: Integer - Account status:\n  - \`1\`: ACTIVE (account is operational)\n  - \`2\`: PAUSED (temporarily suspended)\n  - \`3\`: BLOCKED (restricted access)\n  - \`4\`: DELETED (logically deleted, not physically removed)\n\n### **Geographic & Temporal Data**\n- \`country\`: String - Country where the account is registered\n- \`created_at\`: String/DateTime - Date when the account was created\n- \`updated_at\`: String/DateTime - Last modification date of account information\n\n### **Account Features**\n- \`isDefault\`: Boolean - Whether this account is selected as the default account\n- \`permissions\`: Array - List of available operations for this account\n- \`services\`: Array - Available services (determines what operations can be performed)\n\n### **Usage Tips for LLM Processing**\n1. **Account Selection**: Use \`isDefault\` to identify the primary account\n2. **Balance Analysis**: Combine \`balance\` and \`pendingIn\` for complete financial picture\n3. **Operational Limits**: Check \`state\` and \`permissions\` to determine available actions\n4. **Multi-currency**: Group accounts by \`currency\` for currency-specific operations\n5. **Account Health**: Monitor \`state\` for account status issues\n6. **User Experience**: Use \`alias\` for user-friendly account references\n\nThis schema enables comprehensive account management, balance tracking, and operational decision-making based on account capabilities and restrictions.`
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
