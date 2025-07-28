/**
 * Tool handlers for TropiPay MCP Server
 */

import { ToolContext, PaymentCardPayload } from '../types/index.js';

/**
 * Handle get_default_account_balance tool
 */
export async function handleGetAccountBalance(context: ToolContext) {
  try {
    const client = context.getTropiPayClient();
    const balance = await client.getBalance();
    return {
      content: [{
        type: "text",
        text: `💰 Current Default Account Balance (all amounts are in cents)\n\n` +
          `Balance: ${JSON.stringify(balance)}\n` +
          `Environment: ${context.tropiPayConfig.environment}\n` +
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

/**
 * Handle get_profile_data tool
 */
export async function handleGetProfileData(context: ToolContext) {
  try {
    const client = context.getTropiPayClient();
    const profile = await client.profile();
    return {
      content: [{
        type: "text",
        text: `👤 Profile Information\n\n` +
          `Name: ${profile.name || 'N/A'}\n` +
          `Email: ${profile.email || 'N/A'}\n` +
          `Country: ${profile.country || 'N/A'}\n` +
          `Phone: ${profile.phone || 'N/A'}\n` +
          `Environment: ${context.tropiPayConfig.environment}\n` +
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

/**
 * Handle get_movement_list tool
 */
export async function handleGetMovementList(args: any, context: ToolContext) {
  try {
    const limit = (args?.limit as number) || 10;
    const offset = (args?.offset as number) || 0;

    const client = context.getTropiPayClient();
    const movements = await client.movements(limit, offset);
    
    if (!movements || !movements.rows || movements.rows.length === 0) {
      return {
        content: [{
          type: "text",
          text: `📋 No movements found\n\nEnvironment: ${context.tropiPayConfig.environment}`
        }]
      };
    }

    return {
      content: [{
        type: "text",
        text: `📋 Account Movements Data (${movements.count || 0} total items, showing ${movements.rows?.length || 0})\n\n` +
          `Environment: ${context.tropiPayConfig.environment}\n` +
          `Retrieved: ${new Date().toISOString()}\n\n` +
          `💡 **Tip**: Use the 'tropipay_movements_schema' prompt for detailed field explanations.\n\n` +
          `**Raw Data (JSON):**\n\`\`\`json\n${movements?.rows || []}\n\`\`\``
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

/**
 * Handle get_accounts_list tool
 */
export async function handleGetAccounts(context: ToolContext) {
  try {
    const client = context.getTropiPayClient();
    const accountsData = await client.accounts.list();

    if (!accountsData || !Array.isArray(accountsData) || accountsData.length === 0) {
      return {
        content: [{
          type: "text",
          text: `🏦 No TropiPay accounts found\n\nThis could mean:\n- No accounts are configured for this user\n- The user doesn't have permission to view accounts\n- The API endpoint is not available\n\nEnvironment: ${context.tropiPayConfig.environment}`
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
          `Environment: ${context.tropiPayConfig.environment}\n` +
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
          `Environment: ${context.tropiPayConfig.environment}\n` +
          `Method attempted: client.accounts.list()`
      }]
    };
  }
}

/**
 * Handle list_deposit_accounts tool
 */
export async function handleListDepositAccounts(context: ToolContext) {
  try {
    const client = context.getTropiPayClient();
    const depositAccountsData = await client.depositAccounts.list();
    
    if (depositAccountsData?.rows?.length === 0) {
      return {
        content: [{
          type: "text",
          text: `🏦 No deposit accounts found\n\nThis could mean:\n- No deposit accounts are configured for this user\n- The user doesn't have permission to view deposit accounts\n- The API endpoint is not available\n\nEnvironment: ${context.tropiPayConfig.environment}`
        }]
      };
    }      

    return {
      content: [{
        type: "text",
        text: `🏦 TropiPay Deposit Accounts Data (${Array.isArray(depositAccountsData.rows) ? depositAccountsData.rows.length : 0} accounts found)\n\n` +
          `Environment: ${context.tropiPayConfig.environment}\n` +
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
          `Environment: ${context.tropiPayConfig.environment}\n` +
          `Method attempted: client.depositAccounts.list()`
      }]
    };
  }
}

/**
 * Handle create_paymentcard tool
 */
export async function handleCreatePaymentCard(args: any, context: ToolContext) {
  try {
    // Extract parameters from the request
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
    } = args as PaymentCardPayload;

    // Validate required fields and collect missing ones
    const requiredFields = {
      description: "Extra description of what is being paid",
      concept: "Payment concept/title",
      amount: "Payment amount (in cents, e.g., 3000 = $30.00)",
      currency: "Payment currency (allowed only : USD, EUR, USDC)"
    };

    const missingFields: string[] = [];

    // Check each required field
    Object.entries(requiredFields).forEach(([field, description]) => {
      const value = args[field as keyof typeof args];
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(`- **${field}**: ${description}`);
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
            `  "concept": "Product Purchase",\n` +
            `  "amount": 5000,\n` +
            `  "currency": "USD",\n` +
            `  "description": "Purchase of premium service", // optional\n` +
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
      singleUse: singleUse !== undefined ? singleUse : false,
      description: description !== undefined ? description : "",
      favorite: favorite !== undefined ? favorite : false,
      expirationDays: expirationDays !== undefined ? expirationDays : 0,
      reasonId: reasonId !== undefined ? reasonId : 21,
      lang: lang !== undefined ? lang : "es",
      urlSuccess: urlSuccess !== undefined ? urlSuccess : "",
      urlFailed: urlFailed !== undefined ? urlFailed : "",
      urlNotification: urlNotification !== undefined ? urlNotification : "",
      serviceDate: serviceDate !== undefined ? serviceDate : new Date().toISOString().split('T')[0],
    };

    // Create the payment card using tropipayjs
    const client = context.getTropiPayClient();
    const result = await client.paymentCards.create(paymentCardData);

    return {
      content: [{
        type: "text",
        text: `✅ Payment Card Created Successfully\n\n` +
          `🎯 **Payment Details:**\n` +
          `- Paymentcard id: ${result.id}\n` +
          `- Amount: ${(result.amount! / 100).toFixed(2)} ${result.currency}\n` +
          `- Short url: ${result.shortUrl}\n`+
          `- Reference: ${result.reference}\n` +
          `- Concept: ${result.concept}\n` +
          `- Marked as favorite: ${result.favorite}\n` +
          `- Single use paymentcard: ${result.singleUse}\n` +
          `- Expiration days: ${result.expirationDays}\n` +
          `- Reason id: ${result.reasonId}\n` +
          `- Language: ${result.lang}\n` +
          `- Url success: ${result.urlSuccess}\n` +
          `- Url failed: ${result.urlFailed}\n` +
          `- Url notification: ${result.urlNotification}\n` +
          `- Service date: ${result.serviceDate}\n` +
          `${description ? `- Description: ${description}\n` : ''}` +
          `\n📋 **API Response:**\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\`\n\n` +
          `Environment: ${context.tropiPayConfig.environment}\n` +
          `Created: ${new Date().toISOString()}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Failed to create payment card\n\n` +
          `Error: ${JSON.stringify(error)}\n\n` +
          `🔧 Technical details:\n` +
          `Environment: ${context.tropiPayConfig.environment}\n` +
          `Method attempted: client.paymentCards.create()`
      }]
    };
  }
}

/**
 * Handle test_connection tool
 */
export async function handleTestConnection(context: ToolContext) {
  try {
    const client = context.getTropiPayClient();
    // Test by getting balance (this will verify authentication)
    await client.getBalance();
    return {
      content: [{
        type: "text",
        text: `✅ TropiPay Connection Test Successful\n\n` +
          `Environment: ${context.tropiPayConfig.environment}\n` +
          `Base URL: ${context.tropiPayConfig.baseUrl}\n` +
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
