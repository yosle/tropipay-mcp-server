/**
 * TropiPay client management
 */

import { Tropipay } from "@yosle/tropipayjs";
import { TropiPayConfig } from '../types/index.js';

let tropiPayClient: Tropipay | null = null;

/**
 * Create TropiPay client instance
 */
function createTropiPayClient(config: TropiPayConfig): Tropipay | null {
  if (!config.clientId || !config.clientSecret) {
    return null;
  }

  // Check if custom base URL is provided
  if (config.baseUrl) {
    // Use custom base URL
    return new Tropipay({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      customTropipayUrl: config.baseUrl
    });
  } else {
    // Use environment-based serverMode
    const serverMode = config.environment === 'production' ? 'LIVE' : 'SANDBOX';
    return new Tropipay({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      serverMode: serverMode as any // Cast to any to avoid TypeScript issues
    });
  }
}

/**
 * Get or create TropiPay client instance
 */
export function getTropiPayClient(config: TropiPayConfig): Tropipay {
  if (!tropiPayClient) {
    tropiPayClient = createTropiPayClient(config);
    if (!tropiPayClient) {
      throw new Error('TropiPay credentials not configured. Please set TROPIPAY_CLIENT_ID and TROPIPAY_CLIENT_SECRET environment variables.');
    }
  }
  return tropiPayClient;
}
