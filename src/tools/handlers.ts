/**
 * Tool handlers for TropiPay MCP Server
 */

import { ToolContext, PaymentCardPayload } from '../types/index.js';

/**
 * Handle get_account_balance tool
 */
export async function handleGetAccountBalance(context: ToolContext) {
  try {
    const client = context.getTropiPayClient();
    const balance = await client.getBalance();
    return {
      content: [{
        type: "text",
        text: `💰 Current Default Account Balance\n\n` +
          `Balance: $${balance.balance}\n` +
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

    // Return the complete JSON data for maximum LLM flexibility
    let movementsJson;
    try {
      // Create a clean copy to avoid circular references
      const cleanMovements = {
        count: movements.count || 0,
        rows: movements.rows || [],
        // Include any other top-level properties but filter out potential problematic ones
        ...(movements.offset !== undefined && { offset: movements.offset }),
        ...(movements.limit !== undefined && { limit: movements.limit })
      };
      movementsJson = JSON.stringify(cleanMovements, null, 2);
    } catch (jsonError) {
      // Fallback to a safe representation if JSON serialization fails
      movementsJson = JSON.stringify({
        error: "JSON serialization failed",
        count: movements?.count || 0,
        rowsLength: movements?.rows?.length || 0,
        message: "Raw data could not be serialized safely"
      }, null, 2);
    }

    return {
      content: [{
        type: "text",
        text: `📋 Account Movements Data (${movements.count || 0} total items, showing ${movements.rows?.length || 0})\n\n` +
          `Environment: ${context.tropiPayConfig.environment}\n` +
          `Retrieved: ${new Date().toISOString()}\n\n` +
          `💡 **Tip**: Use the 'tropipay_movements_schema' prompt for detailed field explanations.\n\n` +
          `**Raw Data (JSON):**\n\`\`\`json\n${movementsJson}\n\`\`\``
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
 * Handle get_accounts tool
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
      directPayment
    } = args as PaymentCardPayload;

    // Validate required fields and collect missing ones
    const requiredFields = {
      reference: "Unique reference identifier for the payment",
      concept: "Payment concept/title",
      amount: "Payment amount (in cents, e.g., 3000 = $30.00)",
      currency: "Payment currency (USD, EUR, etc.)"
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
            `  "reference": "my-payment-001",\n` +
            `  "concept": "Product Purchase",\n` +
            `  "amount": 5000,\n` +
            `  "currency": "USD",\n` +
            `  "description": "Purchase of premium service", // optional\n` +
            `  "singleUse": "true", // optional\n` +
            `  "expirationDays": 7 // optional\n` +
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
      ...(description && { description }),
      ...(favorite && { favorite }),
      ...(singleUse && { singleUse }),
      ...(expirationDays && { expirationDays }),
      ...(reasonId && { reasonId }),
      ...(lang && { lang }),
      ...(urlSuccess && { urlSuccess }),
      ...(urlFailed && { urlFailed }),
      ...(urlNotification && { urlNotification }),
      ...(serviceDate && { serviceDate }),
      ...(directPayment && { directPayment })
    };

    // Create the payment card using tropipayjs
    const client = context.getTropiPayClient();
    const result = await client.paymentCards.create(paymentCardData);

    return {
      content: [{
        type: "text",
        text: `✅ Payment Card Created Successfully\n\n` +
          `🎯 **Payment Details:**\n` +
          `- Reference: ${reference}\n` +
          `- Concept: ${concept}\n` +
          `- Amount: ${(amount! / 100).toFixed(2)} ${currency}\n` +
          `- Currency: ${currency}\n` +
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
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
          `📝 Possible causes:\n` +
          `- Invalid card details (reference, concept, amount)\n` +
          `- Insufficient permissions to create payment cards\n` +
          `- API endpoint not available in current environment\n` +
          `- Network connectivity issues\n` +
          `- Invalid amount format or currency\n\n` +
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
