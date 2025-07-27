/**
 * Configuration management for TropiPay MCP Server
 */

import { TropiPayConfig } from '../types/index.js';

/**
 * Get TropiPay configuration from environment variables
 */
export function getTropiPayConfig(): TropiPayConfig {
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
