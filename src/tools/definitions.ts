/**
 * Tool definitions for TropiPay MCP Server
 */

export const toolDefinitions = [
  {
    name: "get_default_account_balance",
    description: "Get the current selected as default account balance from TropiPay",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "get_profile_data",
    description: "Get user profile information from TropiPay account",
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
    name: "get_accounts_list",
    description: "Get list of TropiPay accounts associated with the user",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "list_deposit_accounts",
    description: "Get list of deposit accounts (a.k.a beneficiaries).\n\n" +
      "💡 **Tip**: deposit accounts are also refered as beneficiaries can be internal (other Tropipay accounts) " +
      "or external (bank accounts, external cripto wallets)\n\n" +
      "📋 **Response Structure:**\n" +
      "- `Array of depositaccounts objects:\n" +
      "- `id`: Unique deposit account identifier\n" +
      "- `accountNumber`: IBAN for external bank accounts, wallet address for external crypto accounts, email of user for internal beneficiaries)\n" +
      "- `alias`: if not null, User-friendly account name/alias set by user\n" +
      "- `currency`: Account currency\n" +
      "- `type`: Account type (9=Tropipay account, 12=Crypto wallet, 7=Other, 8=BANDEC card, 4= BPA card, 3=BANMET card)\n" +
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
    description: "Create a new payment card (payment link) using TropiPay API.\n" +
      "**IMPORTANT:**"+
      "- NEVER create payment cards without first asking the user for required information"+
      "- ALWAYS collect: amount, currency, concept, and description before proceeding"+ 
      "- DO NOT generate or assume default values for required fields"+
      "- Ask clarifying questions if any information is missing or unclear"+
      "**Required Information to Collect from User:**\n" +
      " - `amount`, `currency`, `concept`, `description`\n"+
      "- Any specific requirements (expiration, single use, etc.)\n\n"+
      "📋 **Optional Fields:**\n" +
      "- `reference`\n" +
      "- `favorite`\n" +
      "- `singleUse`\n" +
      "- `expirationDays`\n" +
      "- `reasonId`\n" +
      "- `lang`\n" +
      "- `urlSuccess`\n" +
      "- `urlFailed`\n" +
      "- `urlNotification`\n" +
      "- `serviceDate`\n" +
      "🔍 **Process Flow:**\n" +
      "1. First ask user for: amount, currency, concept, and description\n"+
      "2. Optionally ask about: expiration days, single use, reference, redirect URLs\n"+
      "3. Then create the payment card with provided information\n\n"+
      "4. Return the payment card information to the user\n\n"
,
    inputSchema: {
      type: "object",
      properties: {
        reference: {
          type: "string",
          description: "Unique reference identifier for the payment. Required. generate if not provided"
        },
        concept: {
          type: "string",
          description: "Payment concept/title. REQUIRED - Must be provided by user, do not generate default values"
        },
        amount: {
          type: "number",
          description: "Payment amount in cents (e.g., 3000 = $30.00). REQUIRED - Must be provided by user, do not generate default values"
        },
        currency: {
          type: "string",
          description: "Payment currency (allowed: USD, EUR, USDC). REQUIRED - Must be provided by user, do not generate default values"
        },
        description: {
          type: "string",
          description: "Additional description for the payment. REQUIRED - Must be provided by user generate default values"
        },
        favorite: {
          type: "string",
          description: "Mark as favorite - true or false REQUIRED (set false if not provided)"
        },
        singleUse: {
          type: "string",
          description: "Whether the link can be used only once - true or false REQUIRED (set false if not provided)"
        },
        expirationDays: {
          type: "number",
          description: "Number of days until expiration REQUIRED (set 0 if not provided)"
        },
        reasonId: {
          type: "number",
          description: "Reason ID for the payment. REQUIRED - set 21 if not provided"
        },
        lang: {
          type: "string",
          description: "Language code like es, en (optional, set by user profile if not provided)"
        },
        urlSuccess: {
          type: "string",
          description: "Success redirect URL. REQUIRED. Set empty string if not provided"
        },
        urlFailed: {
          type: "string",
          description: "Failed payment redirect URL. REQUIRED. Set empty string if not provided"
        },
        urlNotification: {
          type: "string",
          description: "Webhook notification URL. REQUIRED. Set empty string if not provided"
        },
        serviceDate: {
          type: "string",
          description: "Service date in YYYY-MM-DD format REQUIRED. will be set today date by the mcp if not provided)"
        },
      },
      required: ["concept", "amount", "currency"]
    }
  },
  {
    name: "test_connection",
    description: "Test the connection to TropiPay API and verify authentication by retrieving the selected default account balance",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  }
];
