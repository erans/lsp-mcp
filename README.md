# LSP-MCP Bridge

> **⚠️ 🚨 EXPERIMENTAL PROJECT WARNING 🚨 ⚠️**
>
> **🛑 DO NOT USE THIS PROJECT FOR PRODUCTION CODE 🛑**
>
> This is an **EXPERIMENTAL** and **PROOF-OF-CONCEPT** implementation that should **ONLY** be used for:
> - ✅ Testing and evaluation purposes
> - ✅ Learning about LSP and MCP protocols
> - ✅ Development and experimentation
> - ✅ Contributing to the project
>
> **❌ DO NOT USE FOR:**
> - ❌ Production coding sessions
> - ❌ Important or critical work
> - ❌ Any scenario where code reliability matters
> - ❌ Writing production applications
> - ❌ Commercial software development
>
> **⚠️ RISKS AND LIMITATIONS:**
> - 🐛 May contain bugs that could affect your development workflow
> - 💥 Could potentially cause LSP server crashes or instability
> - 🔄 Breaking changes may occur without notice
> - 📝 Not suitable for mission-critical code editing
> - ⚡ Performance may not be optimized for large codebases
>
> **USE AT YOUR OWN RISK** - This project is provided "as-is" for educational and experimental purposes only.

A comprehensive bridge between Language Server Protocol (LSP) servers and Model Context Protocol (MCP) that provides Claude Code with advanced semantic code understanding capabilities.

## 📋 LSP Specification Support

**Implementation based on Language Server Protocol Specification 3.17.0**
- Specification URL: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/
- Provides semantic code understanding that surpasses basic text-based tools

**⚠️ Server Compatibility Note**: Not all LSP servers support all LSP methods. When a server doesn't support a requested operation, it will return an error and Claude Code will automatically fall back to traditional tools (grep, find, etc.) for that specific operation.

## 🚀 Features

- **22 LSP-powered tools** for semantic code analysis
- **Dual transport support** - stdio and HTTP LSP servers
- **Type-safe TypeScript** implementation with full async/await
- **Comprehensive error handling** and logging
- **Easy to extend** with modular architecture
- **Comprehensive tests** with Vitest framework

## 📦 Installation

### Option 1: Using npx (No installation required)

You can run the LSP-MCP bridge directly using npx without cloning or installing:

```bash
# Run directly from GitHub
npx github:erans/lsp-mcp --help

# Run with a specific LSP server
npx github:erans/lsp-mcp --config lsp-servers.yaml --lsp typescript --workspace /path/to/project
```

**Note**: You'll need to have a configuration file like [`lsp-servers.yaml`](https://github.com/erans/lsp-mcp/blob/main/lsp-servers.yaml) locally that defines your LSP server commands. Download it from the repository and customize it with your LSP server paths.

### Option 2: Clone and Build

```bash
# Clone the repository
git clone https://github.com/erans/lsp-mcp.git

# Change to the cloned directory
cd lsp-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## 🏃 Quick Start

```bash
# Run with TypeScript LSP server (included as dev dependency)
npm run dev -- --lsp="typescript-language-server --stdio"

# Run with Python LSP server
npm run dev -- --lsp="pylsp"

# Run with Go LSP server
npm run dev -- --lsp="gopls"

# Run with built version
./dist/cli.js --verbose --lsp="typescript-language-server --stdio"
```

## 🛠️ Available Tools

> **📝 Note for Claude Code Users**: While Claude Code has access to both traditional tools (grep, find, replace) and these LSP-powered tools, the LSP tools provide superior semantic understanding for code analysis. To encourage Claude to use LSP tools, try prompts like:
>
> *"Use lsp_find_references instead of grep to find all usages of the registerTool function"*
>
> *"Don't use text search - use lsp_workspace_symbols to search for all classes containing 'Handler' in their name"*
>
> *"Use lsp_goto_definition instead of grep to find where the Transport interface is defined"*

The bridge provides 22 LSP-powered tools organized by category:

### 🧭 Navigation Tools (5)
- `lsp_goto_definition` - Go to symbol definition
- `lsp_goto_declaration` - Go to symbol declaration
- `lsp_goto_implementation` - Find implementations
- `lsp_goto_type_definition` - Go to type definition
- `lsp_find_references` - Find all references

### 🔍 Symbol Tools (3)
- `lsp_document_symbols` - List document symbols
- `lsp_workspace_symbols` - Search workspace symbols
- `lsp_document_highlight` - Highlight symbol occurrences

### 🧠 Intelligence Tools (3)
- `lsp_hover` - Get hover information
- `lsp_completion` - Code completion suggestions
- `lsp_signature_help` - Function signature help

### ✏️ Editing Tools (4)
- `lsp_rename` - Rename symbols safely
- `lsp_code_action` - Get code actions/fixes
- `lsp_format_document` - Format entire document
- `lsp_format_range` - Format code range

### 🔬 Advanced Tools (6)
- `lsp_semantic_tokens` - Semantic highlighting
- `lsp_inlay_hints` - Type hints and annotations
- `lsp_code_lens` - Inline actionable information
- `lsp_folding_range` - Code folding ranges
- `lsp_selection_range` - Smart text selection
- `lsp_document_link` - Extract document links

### 🌐 Workspace Tools (1)
- `lsp_execute_command` - Execute LSP commands

## 🔧 Development

For contributors and developers working on this project:

```bash
npm run build         # Build TypeScript to JavaScript
npm run test          # Run tests with Vitest
npm run lint          # Lint code with ESLint
npm run format        # Format code with Prettier
```

## 🏗️ Architecture

```
src/
├── lsp/                    # LSP Client Implementation
│   ├── client.ts           # Main LSP client with all methods
│   ├── interfaces.ts       # TypeScript interfaces
│   ├── types.ts            # LSP protocol types
│   ├── stdio-transport.ts  # Stdio transport layer
│   └── http-transport.ts   # HTTP transport layer
├── mcp/                    # MCP Server Implementation
│   ├── server.ts           # MCP protocol server
│   ├── registry.ts         # Tool registry and management
│   ├── handlers.ts         # Request handlers for all tools
│   ├── tools.ts            # Tool definitions and schemas
│   ├── types.ts            # MCP protocol types
│   └── common.ts           # Utility functions
├── bridge/                 # Bridge Orchestration
│   └── bridge.ts           # Main bridge component
├── __tests__/              # Test Suite
│   ├── config.test.ts      # Configuration tests
│   ├── lsp-types.test.ts   # LSP type tests
│   └── mcp-common.test.ts  # MCP utility tests
├── cli.ts                  # CLI entry point
├── config.ts               # Configuration management
└── index.ts                # Main exports
```

## 🧪 Testing

The project includes comprehensive tests with Vitest:

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test src/__tests__/config.test.ts

# Run tests in watch mode
npm run test -- --watch
```

**Test Coverage:**
- Configuration validation
- Type definitions and interfaces
- MCP utility functions
- Error handling scenarios
- Input parameter validation

## 📋 Language Server Requirements

Install the appropriate LSP server for your target language:

| Language | LSP Server | Installation |
|----------|------------|--------------|
| **Python** | pylsp | `pip install python-lsp-server` |
| **TypeScript/JavaScript** | typescript-language-server | `npm install -g typescript-language-server` |
| **Go** | gopls | `go install golang.org/x/tools/gopls@latest` |
| **Rust** | rust-analyzer | Install via rustup |
| **C++** | clangd | Install via package manager |
| **Java** | jdtls | Download from Eclipse JDT |
| **C#** | OmniSharp | Install via .NET tools |

## 🔧 Configuration

### Why Configuration Files?

The LSP-MCP bridge uses configuration files to manage LSP server settings because:

- **Multiple Parameters**: LSP servers require various parameters (commands, paths, workspaces)
- **Command Line Complexity**: Passing all parameters via CLI arguments becomes unwieldy
- **Reusability**: Save configurations for different projects and language setups
- **Environment Flexibility**: Support both local binaries and remote HTTP servers

### LSP Server Configuration (YAML)

Create a YAML file mapping server keys to commands or HTTP URLs:

```yaml
# Example: lsp-servers.yaml
typescript: "typescript-language-server --stdio"
python: "pylsp"
go: "gopls"
rust: "rust-analyzer"
cpp: "clangd"

# Full paths if not in PATH
typescript-full: "/usr/local/bin/typescript-language-server --stdio"
python-venv: "/opt/python/venv/bin/pylsp"

# HTTP-based LSP servers
typescript-http: "http://localhost:8080"
remote-python: "http://lsp-server.internal:3333"

# Mock server for testing
mock: "mock"
```

### Claude Code Integration

The easiest way to use this bridge with Claude Code is through MCP configuration:

#### Method 1: Using --mcp-config (Recommended)

Create an MCP configuration file:

**Option A: Using npx (no cloning required)**
```json
{
  "mcpServers": {
    "lsp-bridge": {
      "command": "npx",
      "args": [
        "github:erans/lsp-mcp",
        "--config", "/path/to/your/lsp-servers.yaml",
        "--lsp", "typescript",
        "--workspace", "/path/to/your/project"
      ],
      "env": {}
    }
  }
}
```

**Option B: Using cloned repository**
```json
{
  "mcpServers": {
    "lsp-bridge": {
      "command": "node",
      "args": [
        "/path/to/lsp-mcp/dist/cli.js",
        "--config", "/path/to/lsp-mcp/lsp-servers.yaml",
        "--lsp", "typescript",
        "--workspace", "/path/to/your/project"
      ],
      "env": {}
    }
  }
}
```

Then run Claude Code with:
```bash
claude-code --mcp-config /path/to/mcp-config.json
```

#### Method 2: Direct Claude Code Configuration

Add to your Claude Code configuration file (`~/.config/claude-code/config.json`):

**Option A: Using npx (no cloning required)**
```json
{
  "mcpServers": {
    "lsp-bridge": {
      "command": "npx",
      "args": [
        "github:erans/lsp-mcp",
        "--config", "/path/to/your/lsp-servers.yaml",
        "--lsp", "typescript",
        "--workspace", "/path/to/your/project"
      ]
    }
  }
}
```

**Option B: Using cloned repository**
```json
{
  "mcpServers": {
    "lsp-bridge": {
      "command": "node",
      "args": [
        "/path/to/lsp-mcp/dist/cli.js",
        "--config", "/path/to/lsp-mcp/lsp-servers.yaml",
        "--lsp", "typescript",
        "--workspace", "/path/to/your/project"
      ]
    }
  }
}
```

#### Method 3: Command Line MCP Server Arguments

Use Claude Code's built-in MCP server command line arguments:

**Option A: Using npx (no cloning required)**
```bash
# Add the LSP bridge as an MCP server directly via CLI
claude mcp add lsp-bridge -- npx github:erans/lsp-mcp --config /path/to/your/lsp-servers.yaml --lsp typescript --workspace /path/to/your/project

# Or run Claude Code with inline MCP server configuration
claude-code --mcp-server="npx github:erans/lsp-mcp --config /path/to/your/lsp-servers.yaml --lsp typescript --workspace /path/to/your/project"
```

**Option B: Using cloned repository**
```bash
# Add the LSP bridge as an MCP server directly via CLI
claude mcp add lsp-bridge -- node /path/to/lsp-mcp/dist/cli.js --config /path/to/lsp-mcp/lsp-servers.yaml --lsp typescript --workspace /path/to/your/project

# Or run Claude Code with inline MCP server configuration
claude-code --mcp-server="node /path/to/lsp-mcp/dist/cli.js --config /path/to/lsp-mcp/lsp-servers.yaml --lsp typescript --workspace /path/to/your/project"
```

**Advantages of Method 3:**
- No configuration files needed
- Quick setup for testing and evaluation
- Easy to modify parameters on the fly
- Ideal for temporary or one-off usage

#### Workspace Parameter Importance

**⚠️ Critical**: Always set the `--workspace` parameter as it:

- **Initializes LSP Server**: The workspace path is passed to the language server for proper initialization
- **Enables Project Context**: Allows the LSP server to understand project structure and dependencies
- **Improves Accuracy**: Provides better symbol resolution and cross-file analysis
- **Required for Tools**: Many LSP tools (`lsp_workspace_symbols`, `lsp_find_references`) need workspace context

Without workspace configuration, many LSP features will not work correctly.

### CLI Options

| Option | Description | Example |
|--------|-------------|---------|
| `--config <path>` | **Required** - Path to YAML config file | `--config lsp-servers.yaml` |
| `--lsp <key>` | **Required** - LSP server key from config | `--lsp typescript` |
| `--workspace <path>` | **Critical** - Workspace directory for LSP | `--workspace "/path/to/project"` |
| `--verbose` | Enable verbose logging | `--verbose` |

### Environment Variables

- `NODE_ENV` - Set to `development` for debug logging
- `LSP_TIMEOUT` - Override default 30s timeout (in milliseconds)

## 🐛 Troubleshooting

### Common Issues

1. **LSP server not found**
   ```bash
   # Ensure LSP server is installed and in PATH
   which pylsp
   npm list -g typescript-language-server

   # Update paths in your config file
   # Example: use full path if not in PATH
   python: "/usr/local/bin/pylsp"
   ```

2. **Config file errors**
   ```bash
   # Check YAML syntax
   # Ensure proper indentation and quotes
   # Available keys shown in error message
   ```

3. **Permission errors**
   ```bash
   # Make CLI executable
   chmod +x ./dist/cli.js
   ```

4. **Build errors**
   ```bash
   # Clean and rebuild
   npm run clean
   npm install
   npm run build
   ```

5. **Test failures**
   ```bash
   # Run tests with verbose output
   npm run test -- --reporter=verbose
   ```

## 📊 Advantages over Basic Tools

| LSP Tool | Replaces | Key Advantage |
|----------|----------|---------------|
| `lsp_goto_definition` | grep, find | Semantic understanding vs text matching |
| `lsp_find_references` | grep -r | Cross-file analysis with context |
| `lsp_document_symbols` | grep patterns | Structured symbol information |
| `lsp_hover` | manual docs lookup | Rich documentation with examples |
| `lsp_completion` | manual typing | Context-aware intelligent suggestions |
| `lsp_rename` | find and replace | Safe refactoring across entire project |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with tests
4. Run the test suite: `npm run test`
5. Ensure code quality: `npm run lint && npm run format`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

