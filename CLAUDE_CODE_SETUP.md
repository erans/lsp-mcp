# Claude Code LSP-MCP Bridge Setup

## Quick Start

The LSP-MCP bridge is now fixed and ready to use with Claude Code. Here's how to use it:

### 1. Build the Project
```bash
npm install
npm run build
```

### 2. Configure Claude Code

Add this server to your Claude Code MCP configuration:

```json
{
  "mcpServers": {
    "lsp-bridge": {
      "command": "node",
      "args": [
        "/home/eran/work/lsp-mcp/dist/cli.js",
        "--config", "/home/eran/work/lsp-mcp/lsp-servers.yaml",
        "--lsp", "typescript"
      ]
    }
  }
}
```

Replace `"typescript"` with the language server you want to use:
- `typescript` - TypeScript/JavaScript
- `python` - Python (requires `python-lsp-server`)
- `go` - Go (requires `gopls`)
- `rust` - Rust (requires `rust-analyzer`)
- `cpp` - C++ (requires `clangd`)
- `mock` - Mock server for testing

### 3. What Was Fixed

The issue was that the MCP server wasn't responding to Claude Code's immediate initialization request because:

1. **Logging to stdout**: The verbose logging was writing to stdout, which interfered with the JSON-RPC protocol. Fixed by redirecting all logs to stderr.

2. **Blocking initialization**: The LSP client initialization was blocking the MCP server from starting. Fixed by starting the LSP client asynchronously, allowing the MCP server to respond immediately.

### 4. Available LSP Tools

Once connected, you'll have access to 22 powerful LSP tools:

- **Navigation**: `lsp_goto_definition`, `lsp_goto_declaration`, `lsp_goto_implementation`, `lsp_goto_type_definition`, `lsp_find_references`
- **Symbols**: `lsp_document_symbols`, `lsp_workspace_symbols`, `lsp_document_highlight`
- **Intelligence**: `lsp_hover`, `lsp_completion`, `lsp_signature_help`
- **Refactoring**: `lsp_code_action`, `lsp_rename`
- **Formatting**: `lsp_format_document`, `lsp_format_range`
- **Advanced**: `lsp_semantic_tokens`, `lsp_inlay_hints`, `lsp_code_lens`, `lsp_folding_range`, `lsp_selection_range`, `lsp_document_link`, `lsp_execute_command`

### 5. Testing

To verify the server works correctly:

```bash
# Test immediate response
node test-mcp-direct.js

# Test full MCP flow
node test-full-flow.js
```

Both tests should complete successfully without timeouts.