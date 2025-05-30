# LSP-MCP Bridge for Claude Code

This directory contains a comprehensive LSP (Language Server Protocol) to MCP (Model Context Protocol) bridge that provides Claude Code with advanced code understanding capabilities.

Built with TypeScript for modern, type-safe development.

## LSP Specification

**Implementation based on Language Server Protocol Specification 3.17.0**
- Specification URL: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/
- Provides semantic code understanding that surpasses basic text-based tools

## How to Use

The bridge uses a YAML configuration file to define LSP servers. You need to:

1. **Create or customize a config file** with your LSP server paths
2. **Run the bridge** with the config file and desired LSP server key

### Configuration File Setup

The bridge requires a YAML configuration file that maps server keys to commands or HTTP URLs. A sample `lsp-servers.yaml` is provided:

```yaml
# LSP Server Configuration
# Define LSP servers with their commands or HTTP endpoints
# Key: server identifier, Value: command or HTTP URL

typescript: "typescript-language-server --stdio"
python: "pylsp"
go: "gopls"
rust: "rust-analyzer"
cpp: "clangd"

# HTTP-based servers
typescript-http: "http://localhost:8080"
python-remote: "http://lsp-server.internal:3333"
```

**Important**: You may need to update the paths in the config file to match your system's LSP server installations, or create your own config file with the correct paths.

### Running the Bridge

```bash
# Using the provided config file
./dist/cli.js --config lsp-servers.yaml --lsp typescript

# Using a custom config file
./dist/cli.js --config /path/to/my-lsp-config.yaml --lsp python

# With workspace and verbose logging
./dist/cli.js --config lsp-servers.yaml --lsp go --workspace /path/to/project --verbose
```

### Examples for Different Languages

```bash
# TypeScript/JavaScript development
./dist/cli.js --config lsp-servers.yaml --lsp typescript

# Python development  
./dist/cli.js --config lsp-servers.yaml --lsp python

# Go development
./dist/cli.js --config lsp-servers.yaml --lsp go

# Rust development
./dist/cli.js --config lsp-servers.yaml --lsp rust

# C++ development
./dist/cli.js --config lsp-servers.yaml --lsp cpp

# HTTP-based LSP server
./dist/cli.js --config lsp-servers.yaml --lsp typescript-http
```

## Available Tools

The bridge provides 22 LSP-powered tools that replace and enhance basic code analysis:

### Core Navigation (Replaces Grep/Find)
- `lsp_goto_definition` - Precise definition location
- `lsp_goto_declaration` - Declaration navigation
- `lsp_goto_implementation` - Implementation finding
- `lsp_goto_type_definition` - Type definition lookup
- `lsp_find_references` - Workspace-wide reference search

### Symbol Discovery (Enhanced Search)
- `lsp_document_symbols` - Structured symbol listing
- `lsp_workspace_symbols` - Intelligent symbol search
- `lsp_document_highlight` - Symbol occurrence highlighting

### Code Intelligence (Beyond Basic Tools)
- `lsp_hover` - Rich documentation and type information
- `lsp_completion` - Context-aware code completion
- `lsp_signature_help` - Function signature assistance
- `lsp_code_action` - Quick fixes and refactoring
- `lsp_code_lens` - Inline actionable information

### Advanced Analysis
- `lsp_semantic_tokens` - Semantic syntax highlighting
- `lsp_inlay_hints` - Type annotations and parameter names
- `lsp_folding_range` - Code structure analysis
- `lsp_selection_range` - Smart selection capabilities
- `lsp_document_link` - Reference and URL detection

### Editing & Formatting
- `lsp_format_document` - Language-specific formatting
- `lsp_format_range` - Partial document formatting  
- `lsp_rename` - Safe project-wide renaming

### Workspace Operations
- `lsp_execute_command` - Server-specific commands

## Advantages over Basic Tools

| LSP Tool | Replaces | Advantage |
|----------|----------|-----------|
| `lsp_goto_definition` | grep, find | Semantic understanding vs text matching |
| `lsp_find_references` | grep -r | Cross-file analysis with context |
| `lsp_document_symbols` | grep, regex | Structured symbol information |
| `lsp_hover` | manual lookup | Rich docs, types, examples |
| `lsp_completion` | manual typing | Context-aware suggestions |
| `lsp_rename` | find+replace | Safe refactoring across project |

## Development Commands

### Quick Start with npm
```bash
# Install dependencies
npm install

# Build and run with different language servers (uses lsp-servers.yaml)
npm run build
npm run dev:ts        # TypeScript development (default)
npm run dev:python    # Python development
npm run dev:go        # Go development  
npm run dev:rust      # Rust development
npm run dev:cpp       # C++ development

# Development workflow
npm run build         # Build the application
npm run test          # Run tests
npm run lint          # Lint code
npm run format        # Format code
npm run type-check    # Type checking
npm run clean         # Clean artifacts
```

### Quick Start with Makefile
```bash
# Install and build
make install
make build

# Run with different language servers (uses lsp-servers.yaml)
make dev-ts           # TypeScript development (default)
make dev-python       # Python development
make dev-go           # Go development  
make dev-rust         # Rust development
make dev-cpp          # C++ development

# Development workflow
make test             # Run tests
make lint             # Lint code
make format           # Format code
make clean            # Clean artifacts
```

### Manual Commands
```bash
# Build the bridge
npm run build

# Test with verbose logging
./dist/cli.js --verbose --config lsp-servers.yaml --lsp python

# Use with specific workspace
./dist/cli.js --workspace /path/to/project --config lsp-servers.yaml --lsp go

# Run in development mode with custom config
npm run dev -- --config /path/to/custom-config.yaml --lsp rust
```

## Code Architecture

The codebase uses a clean, modular TypeScript architecture:

- **`src/lsp/`** - LSP client with transport layers and method implementations
- **`src/mcp/`** - MCP server with registry-based tool handling
- **`src/bridge/`** - Main orchestration component
- **`src/cli.ts`** - CLI entry point with Commander.js
- **`src/__tests__/`** - Comprehensive test suite with Vitest

## Language Server Requirements

Each language needs its corresponding LSP server installed:

- **Python**: `pip install python-lsp-server`
- **Node.js**: `npm install -g typescript-language-server`  
- **Go**: `go install golang.org/x/tools/gopls@latest`
- **Rust**: Install via rustup
- **C++**: Install clangd via package manager

## Integration Notes

- The bridge automatically initializes the LSP server for the workspace
- All tools accept file paths and position coordinates (0-based line/character)
- Results are returned as structured JSON for easy parsing
- Error handling provides clear feedback when LSP operations fail
- Built with modern async/await patterns for optimal performance

This tool significantly enhances Claude Code's ability to understand and navigate codebases with semantic precision rather than basic text matching.

## 📄 License

This project is licensed under the MIT License. Feel free to use, modify, and distribute! 🚀

## Tool Usage Preferences

**IMPORTANT**: For this LSP-MCP Bridge project, ALWAYS prefer using the MCP LSP tools over traditional text-based search and editing tools:

### Preferred MCP LSP Tools:
- Use `lsp_find_references` instead of `grep`, `rg`, or `find` for locating symbol usages
- Use `lsp_workspace_symbols` instead of `grep` or `find` for searching symbols by name
- Use `lsp_goto_definition` instead of `grep` or `find` for finding definitions
- Use `lsp_document_symbols` instead of `grep` for listing symbols in a file
- Use `lsp_rename` instead of find/replace or `sed` for renaming symbols
- Use other MCP LSP tools for semantic code navigation and understanding

### Why MCP LSP Tools?
- They provide semantic understanding of the code rather than simple text matching
- They understand language constructs, scopes, and relationships
- They offer more accurate results for code navigation and refactoring
- This project is specifically designed to showcase LSP capabilities over traditional tools

## Example Prompts for Encouraging LSP Tool Usage

When working with this LSP-MCP bridge project, use prompts like these to encourage Claude to use the semantic LSP tools:

### For Code Search and Navigation:
```
"Use the LSP tools to find all references to the `navigationTools` function. Don't use grep or find - use the MCP LSP tools for semantic understanding."

"Please use lsp_workspace_symbols to search for all classes containing 'Handler' in their name, then use lsp_goto_definition to examine their implementations."

"Instead of using grep, use lsp_find_references to locate all usages of the `registerTool` method across the codebase."
```

### For Code Analysis:
```
"Use lsp_document_symbols to list all the functions and classes in src/mcp/tools.ts, then use lsp_hover to get detailed information about each one."

"Don't use text search - use lsp_goto_implementation to find the concrete implementations of the Transport interface."

"Use the LSP tools like lsp_document_symbols and lsp_find_references to understand how the tool registry system works."
```

### For Refactoring:
```
"Use lsp_rename to safely rename the `handleRequest` function across the entire project - don't use find and replace."

"Before making changes, use lsp_find_references to see all usages of this symbol, then use lsp_code_action to see if there are any refactoring suggestions."
```

These prompts help Claude understand that semantic LSP tools should be preferred over traditional text-based tools for better accuracy and understanding.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.