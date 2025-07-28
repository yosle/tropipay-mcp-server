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
- `get_accounts`: List all TropiPay accounts

### Transactions
- `get_movement_list`: View transaction history with pagination
- `list_deposit_accounts`: List deposit accounts/beneficiaries

### Payment Links
- `create_paymentcard`: Create payment links (called payment cards in TropiPay)
  - **Required Fields**: reference, concept, amount, currency
  - **Optional Fields**: description, favorite, singleUse, expirationDays, reasonId, lang, urlSuccess, urlFailed, urlNotification, serviceDate, directPayment

### System
- `test_connection`: Verify API connectivity and authentication

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

To use this MCP server with clients like Gemini CLI or Claude Desktop, you'll need to add it to your client's configuration file:

1. Locate your client's configuration file:
   - **Claude Desktop**: 
     - Windows: `%APPDATA%/Claude/claude_desktop_config.json`
     - MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Gemini CLI**: Refer to Gemini's documentation for config file location

2. Add the TropiPay MCP Server configuration:

```json
{
  "mcpServers": {
    // ... other MCP server configurations ...
    "Tropipay MCP Server": {
      "command": "node",
      "args": [
        "path/to/tropipay-mcp-server/build/index.js"
      ],
      "env": {
        "TROPIPAY_CLIENT_ID": "your_client_id",
        "TROPIPAY_CLIENT_SECRET": "your_client_secret",
        "TROPIPAY_ENVIRONMENT": "sandbox",  // or "production"
        "TROPIPAY_BASE_URL": "https://sandbox.tropipay.me" 
         // Optional https://www.tropipay.com for live environment http://localhost:3001 for local development
      }
    }
  }
}
```

> **Note**: Replace `path/to/tropipay-mcp-server` with the actual path to your TropiPay MCP Server installation. Use escape backslash in Windows `"D:\\folder\\tropipay-mcp-server\\` or `"/folder/tropipay-mcp-server/` in Linux/Mac

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
