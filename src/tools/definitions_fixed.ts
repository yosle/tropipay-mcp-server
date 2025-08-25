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
      "- `accountId`\n"+
      "🔍 **Process Flow:**\n"+
      "1. First ask user for: amount, currency, concept, and description\n"+
      "2. Optionally ask about: expiration days, single use, reference, redirect URLs\n"+
      "3. Then create the payment card with provided information\n\n"+
      "4. Return the payment card information to the user\n\n",
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
        accountId:{
          type:"number",
          description:"Id of the account that will be used to create the paymentcard. OPTIONAL. if not provided it will use the account selected by defaut for the user"
        }
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
  },
  {
    name: "list_paymentcards",
    description: "Get list of paymentcards (paylinks) created by the user",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "create_external_beneficiary",
    description: "Create a new external bank account beneficiary using TropiPay API.\n\n" +
      "**Required:** firstName, lastName, accountNumber, currency, countryDestinationId/countryISO\n\n" +
      "**Example:**\n" +
      "```json\n" +
      "{\n" +
      "  \"firstName\": \"Panfilo\",\n" +
      "  \"lastName\": \"Epifanio\",\n" +
      "  \"accountNumber\": \"ES91 2100 0418 4502 0005 1332\",\n" +
      "  \"currency\": \"EUR\",\n" +
      "  \"countryDestinationId\": 1,\n" +
      "  \"swift\": \"CAIXESBBXXX\",\n" +
      "  \"address\": \"Gran Via de les Corts Catalanes, 765\",\n" +
      "  \"city\": \"Barcelona\",\n" +
      "  \"province\": \"Barcelona\",\n" +
      "  \"postalCode\": \"08013\"\n" +
      "}\n" +
      "```",
    inputSchema: {
      type: "object",
      properties: {
        beneficiaryType: {
          type: "number",
          description: "Auto-set to 2 (External)."
        },
        beneficiaryPersonType: {
          type: "number",
          description: "Person type (1=individual). Optional."
        },
        alias: {
          type: "string",
          description: "Friendly name. Optional."
        },
        firstName: {
          type: "string",
          description: "First name. REQUIRED."
        },
        lastName: {
          type: "string",
          description: "Last name. REQUIRED."
        },
        secondLastName: {
          type: "string",
          description: "Second last name. Optional."
        },
        email: {
          type: "string",
          description: "Email. Optional."
        },
        accountNumber: {
          type: "string",
          description: "IBAN or account number. REQUIRED."
        },
        currency: {
          type: "string",
          description: "Currency code. REQUIRED."
        },
        type: {
          type: "number",
          description: "Auto-set to 7 (External account)."
        },
        userRelationTypeId: {
          type: "number",
          description: "Relation type (0=myself, 3=commercial). Default: 3."
        },
        swift: {
          type: "string",
          description: "SWIFT/BIC code. Recommended for international transfers."
        },
        countryDestinationId: {
          type: "number",
          description: "Country ID. REQUIRED if countryISO not provided."
        },
        countryISO: {
          type: "string",
          description: "Country ISO code. REQUIRED if countryDestinationId not provided."
        },
        documentExpirationDate: {
          type: "string",
          description: "Document expiration date. Optional."
        },
        phone: {
          type: "string",
          description: "Phone number. Format: '+343487879879'."
        },
        address: {
          type: "string",
          description: "Address. REQUIRED when userRelationTypeId ≠ 0."
        },
        city: {
          type: "string",
          description: "City name. Recommended for international transfers."
        },
        province: {
          type: "string",
          description: "Province/State. Recommended for international transfers."
        },
        postalCode: {
          type: "string",
          description: "Postal/ZIP code. REQUIRED when userRelationTypeId ≠ 0."
        },
        routingNumber: {
          type: "string",
          description: "Bank routing number. REQUIRED for US accounts."
        },
        paymentType: {
          type: "number",
          description: "Auto-set to 2 (Bank Deposit)."
        },
        searchBy: {
          type: "number",
          description: "Search criteria type. Optional."
        },
        searchValue: {
          type: "string",
          description: "Search value. Optional."
        },
        correspondent: {
          type: "string",
          description: "Correspondent bank info. Optional for international transfers."
        },
        state: {
          type: "number",
          description: "Status (0=Active, 1=Inactive, 2=Deleted). Default: 0."
        }
      },
      required: ["firstName", "lastName", "accountNumber", "currency"]
    }
  },
  {
    name: "create_internal_beneficiary",
    description: "Create a new internal TropiPay beneficiary using TropiPay API.\n\n" +
      "**Required:** alias, searchValue (email)\n\n" +
      "**Example:**\n" +
      "```json\n" +
      "{\n" +
      "  \"alias\": \"MR Buchman\",\n" +
      "  \"searchValue\": \"wick@gmail.com\",\n" +
      "  \"searchBy\": 1\n" +
      "}\n" +
      "```",
    inputSchema: {
      type: "object",
      properties: {
        beneficiaryType: {
          type: "number",
          description: "Auto-set to 1 (Internal/TropiPay)."
        },
        beneficiaryPersonType: {
          type: "number",
          description: "Person type (1=individual). Optional."
        },
        alias: {
          type: "string",
          description: "Friendly name. REQUIRED. Ex: 'MR Buchman'."
        },
        firstName: {
          type: "string",
          description: "First name. Optional."
        },
        lastName: {
          type: "string",
          description: "Last name. Optional."
        },
        secondLastName: {
          type: "string",
          description: "Second last name. Optional."
        },
        email: {
          type: "string",
          description: "Email. Optional if in searchValue."
        },
        accountNumber: {
          type: "string",
          description: "User email. Optional if searchValue provided."
        },
        currency: {
          type: "string",
          description: "Currency code. Optional."
        },
        type: {
          type: "number",
          description: "Auto-set to 9 (Tropipay account)."
        },
        userRelationTypeId: {
          type: "number",
          description: "Relation type (0=myself, 3=commercial). Default: 3."
        },
        searchBy: {
          type: "number",
          description: "Search criteria (1=email). Default: 1."
        },
        searchValue: {
          type: "string",
          description: "Email to search for. REQUIRED. Ex: 'wick@gmail.com'."
        },
        paymentType: {
          type: "number",
          description: "Auto-set."
        },
        state: {
          type: "number",
          description: "Status (0=Active, 1=Inactive, 2=Deleted). Default: 0."
        }
      },
      required: ["alias", "searchValue"]
    }
  },
  {
    name: "create_crypto_beneficiary",
    description: "Create a new crypto wallet beneficiary using TropiPay API.\n\n" +
      "**Required:** firstName, lastName, accountNumber (wallet address), currency, network\n\n" +
      "**Example:**\n" +
      "```json\n" +
      "{\n" +
      "  \"firstName\": \"John\",\n" +
      "  \"lastName\": \"Doe\",\n" +
      "  \"accountNumber\": \"5Hw3k2c4Z5oLWxfTMT8nBnhqWF4SWcAFQLnJTJPzNe2y\",\n" +
      "  \"currency\": \"USDC\",\n" +
      "  \"network\": \"SOLANA\"\n" +
      "}\n" +
      "```",
    inputSchema: {
      type: "object",
      properties: {
        beneficiaryType: {
          type: "number",
          description: "Auto-set to 3 (Crypto)."
        },
        alias: {
          type: "string",
          description: "Friendly name. Optional."
        },
        firstName: {
          type: "string",
          description: "First name. REQUIRED."
        },
        lastName: {
          type: "string",
          description: "Last name. REQUIRED."
        },
        accountNumber: {
          type: "string",
          description: "Crypto wallet address. REQUIRED."
        },
        currency: {
          type: "string",
          description: "Currency code (USDC, BTC). REQUIRED."
        },
        network: {
          type: "string",
          description: "Blockchain network (SOLANA, ETH). REQUIRED."
        },
        type: {
          type: "number",
          description: "Auto-set to 12 (Crypto wallet)."
        },
        userRelationTypeId: {
          type: "number",
          description: "Relation type (0=myself, 3=commercial). Default: 3."
        },
        paymentType: {
          type: "number",
          description: "Auto-set to 3 (Crypto)."
        },
        state: {
          type: "number",
          description: "Status (0=Active, 1=Inactive, 2=Deleted). Default: 0."
        }
      },
      required: ["firstName", "lastName", "accountNumber", "currency", "network"]
    }
  }
];
