/**
 * Resource handlers for TropiPay MCP Server
 */

import { TropiPayConfig } from '../types/index.js';
import { getTropiPayClient } from '../client/index.js';

/**
 * Get list of available resources
 */
export function getResourceList() {
  return [
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
      uri: "tropipay://account-states",
      mimeType: "application/json",
      name: "Account States Reference",
      description: "Complete reference of TropiPay account state codes and their meanings"
    }
  ];
}

/**
 * Handle resource reading requests
 */
export async function handleResourceRead(uri: string, config: TropiPayConfig) {
  const url = new URL(uri);
  const resource = url.pathname.replace(/^\//, '');

  switch (resource) {
    case 'config':
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify({
            environment: config.environment,
            baseUrl: config.baseUrl || `${config.environment === 'production' ? 'https://www.tropipay.com' : 'https://tropipay-dev.herokuapp.com'}/api/v2`,
            clientId: config.clientId ? `${config.clientId.substring(0, 8)}...` : 'Not configured',
            libraryVersion: '@yosle/tropipayjs v0.2.1',
            clientInitialized: !!config.clientId && !!config.clientSecret
          })
        }]
      };

    case 'status':
      try {
        const client = getTropiPayClient(config);
        return {
          contents: [{
            uri,
            mimeType: "application/json",
            text: JSON.stringify({
              status: 'connected',
              environment: config.environment,
              baseUrl: config.baseUrl,
              timestamp: new Date().toISOString()
            })
          }]
        };
      } catch (error) {
        return {
          contents: [{
            uri,
            mimeType: "application/json",
            text: JSON.stringify({
              status: 'error',
              environment: config.environment,
              baseUrl: config.baseUrl,
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString()
            })
          }]
        };
      }

    case 'movement-types':
      return {
        contents: [{
          uri,
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
                "description": "Credit received from payment card transactions"
              },
              "3": {
                "id": 3,
                "name": "Refund",
                "description": "Money returned for cancelled or disputed transactions"
              },
              "4": {
                "id": 4,
                "name": "Card Refund",
                "description": "Refund processed back to original payment card"
              },
              "5": {
                "id": 5,
                "name": "Top Up",
                "description": "Account balance increase from external funding source"
              },
              "6": {
                "id": 6,
                "name": "Exchange",
                "description": "Currency exchange between different account currencies"
              },
              "7": {
                "id": 7,
                "name": "ATM",
                "description": "ATM withdrawal or cash-related transactions"
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
          uri,
          mimeType: "application/json",
          text: JSON.stringify({
            title: "TropiPay Movement States Reference",
            description: "Complete reference of movement state codes and their meanings",
            movementStates: {
              "2": {
                "id": 2,
                "name": "Charged",
                "description": "Transaction has been charged but not yet completed"
              },
              "3": {
                "id": 3,
                "name": "Paid",
                "description": "Transaction has been successfully completed and paid"
              },
              "4": {
                "id": 4,
                "name": "Error",
                "description": "Transaction failed due to an error"
              },
              "5": {
                "id": 5,
                "name": "Pending In",
                "description": "Incoming transaction pending confirmation"
              },
              "6": {
                "id": 6,
                "name": "Cancelled",
                "description": "Transaction was cancelled before completion"
              }
            },
            lastUpdated: new Date().toISOString()
          })
        }]
      };

    case 'account-states':
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify({
            title: "TropiPay Account States Reference",
            description: "Complete reference of account state codes and their meanings",
            accountStates: {
              "0": {
                "id": 0,
                "name": "Active",
                "description": "Account is active and operational"
              },
              "1": {
                "id": 1,
                "name": "Inactive",
                "description": "Account is temporarily inactive"
              },
              "2": {
                "id": 2,
                "name": "Deleted",
                "description": "Account has been deleted or closed"
              }
            },
            lastUpdated: new Date().toISOString()
          })
        }]
      };

    default:
      throw new Error(`Unknown resource: ${resource}`);
  }
}
