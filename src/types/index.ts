/**
 * Type definitions for TropiPay MCP Server
 */

/**
 * TropiPay API configuration
 */
export interface TropiPayConfig {
  environment: 'sandbox' | 'production';
  baseUrl?: string;
  clientId?: string;
  clientSecret?: string;
}

/**
 * Payment card creation payload
 */
export interface PaymentCardPayload {
  reference: string;
  concept: string;
  amount: number;
  currency: string;
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
}

/**
 * Tool execution context
 */
export interface ToolContext {
  tropiPayConfig: TropiPayConfig;
  getTropiPayClient: () => any;
}
