/**
 * Prompt definitions and handlers for TropiPay MCP Server
 */

/**
 * Get list of available prompts
 */
export function getPromptList() {
  return [
    {
      name: "tropipay_movements_schema",
      description: "Get comprehensive schema documentation for TropiPay movements/transactions data structure"
    },
    {
      name: "tropipay_accounts_schema", 
      description: "Get comprehensive schema documentation for TropiPay accounts data structure"
    }
  ];
}

/**
 * Handle prompt requests
 */
export function handlePrompt(name: string) {
  switch (name) {
    case "tropipay_movements_schema":
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `# TropiPay Movements Schema Documentation

## 🔄 Complete Field Reference

### **Core Identifiers**
- \`id\`: Integer - Unique movement identifier in TropiPay system (database primary key)
- \`bankOrderCode\`: String - Transaction identifier (TX prefix for regular, DEV for refunds)
- \`reference\`: String - User-defined reference for the transaction (can be null)

### **Financial Data**
- \`amount\`: Number - Transaction amount (+ for credits, - for debits)
- \`currency\`: String - Transaction currency code (USD, EUR, etc.)
- \`originalCurrencyAmount\`: Number - Amount in original currency (before conversion)
- \`destinationAmount\`: Number - Amount in destination currency (after conversion)
- \`destinationCurrency\`: String - Destination currency code
- \`conversionRate\`: Number - Applied exchange rate for this movement
- \`fee\`: Number - Transaction fee (if applicable)

### **Account & Balance Information**
- \`accountId\`: Integer - ID of the account that this movement belongs to
- \`balanceBefore\`: Number - Account balance before this transaction
- \`balanceAfter\`: Number - Account balance after this transaction

### **Transaction Classification**
- \`movementTypeId\`: Integer - Type classification:
  - \`1\`: Transfer (standard money transfer)
  - \`2\`: Card Credit (payment card transactions)
  - \`3\`: Refund (money returned for cancelled transactions)
  - \`4\`: Card Refund (refund to original payment card)
  - \`5\`: Top Up (account funding from external source)
  - \`6\`: Exchange (currency conversion)
  - \`7\`: ATM (cash withdrawal/ATM transactions)
  - \`8\`: Fee (service fees)
  - \`9\`: Adjustment (balance corrections)

### **Transaction Status**
- \`state\`: Integer - Transaction status:
  - \`2\`: Charged (charged but not completed)
  - \`3\`: Paid (successfully completed)
  - \`4\`: Error (failed transaction)
  - \`5\`: Pending In (incoming pending confirmation)
  - \`6\`: Cancelled (cancelled before completion)

### **Descriptive Information**
- \`conceptTransfer\`: String - Transaction description/concept
- \`paymentcard\`: String/UUID - Associated payment card UUID (null if not card-related)

### **Temporal Data**
- \`completedAt\` or \`createdAt\`: String/DateTime - Transaction timestamp
- \`date\`: String/DateTime - Transaction date (may be different format)

## 🎯 Usage Tips for LLM Processing

### **1. Transaction Direction Analysis**
- Positive \`amount\`: Credit/incoming money
- Negative \`amount\`: Debit/outgoing money
- Use \`balanceBefore\` and \`balanceAfter\` to verify direction

### **2. Transaction Categorization**
- Use \`movementTypeId\` for primary categorization
- Cross-reference with \`conceptTransfer\` for detailed descriptions
- Check \`paymentcard\` field to identify card-related transactions

### **3. Status-Based Filtering**
- \`state = 3\` (Paid): Completed successful transactions
- \`state = 5\` (Pending In): Transactions awaiting confirmation
- \`state = 4\` (Error): Failed transactions requiring attention
- \`state = 6\` (Cancelled): Cancelled transactions

### **4. Multi-Currency Handling**
- Use \`originalCurrencyAmount\` and \`destinationAmount\` for conversions
- \`conversionRate\` shows the applied exchange rate
- \`currency\` vs \`destinationCurrency\` for cross-currency analysis

### **5. Financial Reconciliation**
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
              text: `# TropiPay Accounts Schema Documentation

## 🏦 Complete Field Reference

### **Core Identifiers**
- \`id\`: Integer - Unique account identifier in TropiPay system (database primary key)
- \`accountNumber\`: String - Unique human-friendly identifier for the account
- \`alias\`: String - Account alias/name set by the user for easy identification

### **Account Classification**
- \`type\`: Integer - Account type classification:
  - \`1\`: Regular Account (standard wallet account)
  - \`2\`: Tropicard Account (card-linked account)
  - \`3\`: Other (special purpose accounts)
  - \`4\`: Pre-funded Account (accounts with pre-loaded funds)

### **Financial Information**
- \`balance\`: Number - Current available balance in the account currency
- \`pendingIn\`: Number - Pending incoming balance (charged but not yet ready to use)
- \`currency\`: String - Base currency for this account (USD, EUR, etc.)
- \`fee\`: Number - Associated fees (if applicable)

### **Account Status**
- \`state\`: Integer - Account status:
  - \`1\`: ACTIVE (account is operational)
  - \`2\`: PAUSED (temporarily suspended)
  - \`3\`: BLOCKED (restricted access)
  - \`4\`: DELETED (logically deleted, not physically removed)

### **Geographic & Temporal Data**
- \`country\`: String - Country where the account is registered
- \`created_at\`: String/DateTime - Date when the account was created
- \`updated_at\`: String/DateTime - Last modification date of account information

### **Account Features**
- \`isDefault\`: Boolean - Whether this account is selected as the default account
- \`permissions\`: Array - List of available operations for this account
- \`services\`: Array - Available services (determines what operations can be performed)

### **Usage Tips for LLM Processing**
1. **Account Selection**: Use \`isDefault\` to identify the primary account
2. **Balance Analysis**: Combine \`balance\` and \`pendingIn\` for complete financial picture
3. **Operational Limits**: Check \`state\` and \`permissions\` to determine available actions
4. **Multi-currency**: Group accounts by \`currency\` for currency-specific operations
5. **Account Health**: Monitor \`state\` for account status issues
6. **User Experience**: Use \`alias\` for user-friendly account references

This schema enables comprehensive account management, balance tracking, and operational decision-making based on account capabilities and restrictions.`
            }
          }
        ]
      };

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
}
