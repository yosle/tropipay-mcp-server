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
 * - TROPIPAY_BASE_URL: Custom base URL (optional)
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

// Import modular components
import { getTropiPayConfig } from './config/index.js';
import { getTropiPayClient } from './client/index.js';
import { getResourceList, handleResourceRead } from './resources/index.js';
import { toolDefinitions } from './tools/definitions.js';
import {
  handleGetAccountBalance,
  handleGetProfileData,
  handleGetMovementList,
  handleGetAccounts,
  handleListDepositAccounts,
  handleCreatePaymentCard,
  handleTestConnection
} from './tools/handlers.js';
import { getPromptList, handlePrompt } from './prompts/index.js';
import { ToolContext } from './types/index.js';

// Initialize configuration
const tropiPayConfig = getTropiPayConfig();

// Create tool context
const toolContext: ToolContext = {
  tropiPayConfig,
  getTropiPayClient: () => getTropiPayClient(tropiPayConfig)
};

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
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: getResourceList()
  };
});

/**
 * Handler for reading TropiPay resource contents.
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  return await handleResourceRead(request.params.uri, tropiPayConfig);
});

/**
 * Handler for listing available tools.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: toolDefinitions
  };
});

/**
 * Handler for tool execution.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "get_default_account_balance":
        return await handleGetAccountBalance(toolContext);
      
      case "get_profile_data":
        return await handleGetProfileData(toolContext);
      
      case "get_movement_list":
        return await handleGetMovementList(request.params.arguments, toolContext);
      
      case "get_accounts_list":
        return await handleGetAccounts(toolContext);
      
      case "list_deposit_accounts":
        return await handleListDepositAccounts(toolContext);
      
      case "create_paymentcard":
        return await handleCreatePaymentCard(request.params.arguments, toolContext);
      
      case "test_connection":
        return await handleTestConnection(toolContext);
      
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
 * Handler for listing available prompts.
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: getPromptList()
  };
});

/**
 * Handler for getting prompt content.
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  return handlePrompt(request.params.name);
});

/**
 * Start the server using stdio transport.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
