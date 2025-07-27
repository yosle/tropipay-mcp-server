/**
 * Tool definitions for TropiPay MCP Server
 */

export const toolDefinitions = [
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
];
