# TropiPay MCP Server

![](https://badge.mcpx.dev?type=server 'MCP Server')
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for interacting with TropiPay's payment platform. This server provides a standardized interface for AI assistants in various development environments to perform TropiPay operations through tools and resources.

## ✨ Features

- **Authentication**: Handles OAuth 2.0 client credentials flow with TropiPay
- **Modular Architecture**: Clean separation of concerns with TypeScript
- **TropiPay API Integration**: Comprehensive wrapper around TropiPay's functionality
- **Tool-Based Interface**: Easy integration with AI assistants
- **Environment Support**: Configure for sandbox or production environments
- **Editor Compatibility**: Works with VS Code, Cursor, Windsurf, and other MCP-compatible editors

## 🛠️ Available Tools

### Account Management
- `get_default_account_balance`: Retrieve current default account balance
- `get_profile_data`: Get user profile information
- `get_accounts_list`: List all TropiPay accounts

### Transactions
- `get_movement_list`: View transaction history with pagination
- `list_deposit_accounts`: List deposit accounts/beneficiaries (bank accounts, crypto wallets, etc.)
- `list_paymentcards`: Get list of payment cards (payment links) created by the user

### Beneficiary Management
- `create_internal_beneficiary`: Create a new internal TropiPay beneficiary
  - **Required Fields**: alias, searchValue (email)
- `create_external_beneficiary`: Create a new external bank account beneficiary
  - **Required Fields**: firstName, lastName, accountNumber, currency, countryDestinationId/countryISO
- `create_crypto_beneficiary`: Create a new crypto wallet beneficiary
  - **Required Fields**: firstName, lastName, accountNumber (wallet address), currency, network

### Payment Links
- `create_paymentcard`: Create payment links (called payment cards in TropiPay)
  - **Required Fields**: amount, currency, concept, description
  - **Optional Fields**: reference, favorite, singleUse, expirationDays, reasonId, lang, urlSuccess, urlFailed, urlNotification, serviceDate, accountId

### System
- `test_connection`: Verify API connectivity and authentication

## 📚 Available Resources

The TropiPay MCP Server provides the following reference resources:

- `tropipay://config`: Current TropiPay API configuration and environment settings
- `tropipay://status`: TropiPay API connection status and health check
- `tropipay://movement-types`: Complete reference of TropiPay movementType IDs and their meanings
- `tropipay://movement-states`: Complete reference of TropiPay movement state codes and their meanings
- `tropipay://account-states`: Complete reference of TropiPay account state codes and their meanings

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- TropiPay API credentials (Client ID and Client Secret)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yosle/tropipay-mcp-server.git
   cd tropipay-mcp-server
   npm install
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### MCP Client Configuration

This MCP server can be used with any MCP-compatible client such as Claude Desktop, Windsurf, Cline, or other AI assistants that support the Model Context Protocol.

#### Configuration File Locations

Locate your client's MCP configuration file:

- **Claude Desktop**:
  - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
  - MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - Linux: `~/.config/Claude/claude_desktop_config.json`

- **Windsurf**:
  - Windows: `%USERPROFILE%\.codeium\windsurf\mcp_config.json`
  - MacOS: `~/.codeium/windsurf/mcp_config.json`
  - Linux: `~/.codeium/windsurf/mcp_config.json`

- **Cline**: Refer to the [Cline documentation](https://github.com/cline/cline) for configuration details

#### Installation Methods

##### Option 1: Using npx (Recommended)

You can run the server directly with npx:

```json
{
  "mcpServers": {
    "tropipay": {
      "command": "npx",
      "args": ["-y", "tropipay-mcp-server"],
      "env": {
        "TROPIPAY_CLIENT_ID": "your_client_id",
        "TROPIPAY_CLIENT_SECRET": "your_client_secret",
        "TROPIPAY_BASE_URL": "https://sandbox.tropipay.me"
      }
    }
  }
}
```

##### Option 2: Local Development/Installation

For local development or if you've cloned the repository:

```json
{
  "mcpServers": {
    "Tropipay MCP Server": {
      "command": "node",
      "args": [
        "D:\\proyectos\\tropipay-mcp-server\\tropipay-mcp-server\\build\\index.js"
      ],
      "env": {
        "TROPIPAY_CLIENT_ID": "your_client_id",
        "TROPIPAY_CLIENT_SECRET": "your_client_secret",
        "TROPIPAY_BASE_URL": "https://sandbox.tropipay.me"
      }
    }
  }
}
```

#### Environment Variables

Configure the following environment variables in your MCP client configuration:

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `TROPIPAY_CLIENT_ID` | ✅ Yes | Your TropiPay API client ID | - |
| `TROPIPAY_CLIENT_SECRET` | ✅ Yes | Your TropiPay API client secret | - |
| `TROPIPAY_ENVIRONMENT` | ❌ No | Environment: `sandbox` or `production` | `sandbox` |
| `TROPIPAY_BASE_URL` | ❌ No | Custom API base URL (overrides environment) | Based on environment |

#### Base URL Options

- **Sandbox**: `https://sandbox.tropipay.me` (default)
- **Production**: `https://www.tropipay.com`
- **Local Development**: `http://localhost:3001` (or your custom endpoint)

> **Important Notes**:
> - For Windows paths, use double backslashes: `"D:\\folder\\tropipay-mcp-server\\build\\index.js"`
> - For Linux/Mac paths, use forward slashes: `"/home/user/tropipay-mcp-server/build/index.js"`
> - The `-y` flag in npx automatically confirms package installation
> - Make sure to run `npm run build` before using the local installation method

## 🏗️ Project Structure

```
src/
├── client/         # TropiPay client initialization and management
├── config/         # Configuration management
├── resources/      # MCP resource handlers
├── tools/          # Tool definitions and handlers
│   ├── definitions.ts
│   └── handlers.ts
├── types/          # TypeScript type definitions
└── index.ts        # Main server entry point
```

## 🔍 Usage Examples
```prompt
Get a list of my beneficiaries 
```

### Getting Account Balance

```
Get the balance in all my Tropipay accounts 
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.
