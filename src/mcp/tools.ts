import { Tool } from './types';

// Navigation tools
export const navigationTools = {
  gotoDefinition: {
    name: 'lsp_goto_definition',
    description: 'Go to the definition of a symbol. Use this instead of grep/find for finding where functions, classes, or variables are defined',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' },
        line: { type: 'integer', description: 'Line number (0-based)' },
        character: { type: 'integer', description: 'Character position (0-based)' }
      },
      required: ['file_path', 'line', 'character']
    }
  } as Tool,

  gotoDeclaration: {
    name: 'lsp_goto_declaration',
    description: 'Go to the declaration of a symbol',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' },
        line: { type: 'integer', description: 'Line number (0-based)' },
        character: { type: 'integer', description: 'Character position (0-based)' }
      },
      required: ['file_path', 'line', 'character']
    }
  } as Tool,

  gotoImplementation: {
    name: 'lsp_goto_implementation',
    description: 'Go to the implementation(s) of an interface or abstract method. Use this instead of grep/find for locating concrete implementations',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' },
        line: { type: 'integer', description: 'Line number (0-based)' },
        character: { type: 'integer', description: 'Character position (0-based)' }
      },
      required: ['file_path', 'line', 'character']
    }
  } as Tool,

  gotoTypeDefinition: {
    name: 'lsp_goto_type_definition',
    description: 'Go to the type definition of a symbol. Use this instead of grep/find for finding where types or interfaces are defined',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' },
        line: { type: 'integer', description: 'Line number (0-based)' },
        character: { type: 'integer', description: 'Character position (0-based)' }
      },
      required: ['file_path', 'line', 'character']
    }
  } as Tool,

  findReferences: {
    name: 'lsp_find_references',
    description: 'Find all references to a symbol across the entire project. Use this instead of grep -r or find for locating all usages of functions, classes, or variables',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' },
        line: { type: 'integer', description: 'Line number (0-based)' },
        character: { type: 'integer', description: 'Character position (0-based)' }
      },
      required: ['file_path', 'line', 'character']
    }
  } as Tool
};

// Symbol tools
export const symbolTools = {
  documentSymbols: {
    name: 'lsp_document_symbols',
    description: 'Get all symbols (functions, classes, methods, variables) in a document. Use this instead of grep/find for listing symbols in a file',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' }
      },
      required: ['file_path']
    }
  } as Tool,

  workspaceSymbols: {
    name: 'lsp_workspace_symbols',
    description: 'Search for symbols (functions, classes, methods, variables) across the entire workspace. Use this instead of grep -r or find for searching code elements by name',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Symbol search query' }
      },
      required: ['query']
    }
  } as Tool,

  documentHighlight: {
    name: 'lsp_document_highlight',
    description: 'Highlight all occurrences of a symbol in a document. Use this instead of grep for finding all occurrences of a symbol within a single file',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' },
        line: { type: 'integer', description: 'Line number (0-based)' },
        character: { type: 'integer', description: 'Character position (0-based)' }
      },
      required: ['file_path', 'line', 'character']
    }
  } as Tool
};

// Intelligence tools
export const intelligenceTools = {
  hover: {
    name: 'lsp_hover',
    description: 'Get hover information (type, documentation, signature) for a symbol. Use this instead of searching for documentation or type information',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' },
        line: { type: 'integer', description: 'Line number (0-based)' },
        character: { type: 'integer', description: 'Character position (0-based)' }
      },
      required: ['file_path', 'line', 'character']
    }
  } as Tool,

  completion: {
    name: 'lsp_completion',
    description: 'Get code completion suggestions',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' },
        line: { type: 'integer', description: 'Line number (0-based)' },
        character: { type: 'integer', description: 'Character position (0-based)' },
        trigger_character: { type: 'string', description: 'Character that triggered completion' }
      },
      required: ['file_path', 'line', 'character']
    }
  } as Tool,

  signatureHelp: {
    name: 'lsp_signature_help',
    description: 'Get signature help for function calls',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' },
        line: { type: 'integer', description: 'Line number (0-based)' },
        character: { type: 'integer', description: 'Character position (0-based)' }
      },
      required: ['file_path', 'line', 'character']
    }
  } as Tool
};

// Editing tools
export const editingTools = {
  rename: {
    name: 'lsp_rename',
    description: 'Rename a symbol safely across the entire workspace. Use this instead of find/replace or sed for renaming functions, variables, or classes',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' },
        line: { type: 'integer', description: 'Line number (0-based)' },
        character: { type: 'integer', description: 'Character position (0-based)' },
        new_name: { type: 'string', description: 'New name for the symbol' }
      },
      required: ['file_path', 'line', 'character', 'new_name']
    }
  } as Tool,

  codeAction: {
    name: 'lsp_code_action',
    description: 'Get available code actions (quick fixes, refactorings)',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' },
        start_line: { type: 'integer', description: 'Start line number (0-based)' },
        start_character: { type: 'integer', description: 'Start character position (0-based)' },
        end_line: { type: 'integer', description: 'End line number (0-based)' },
        end_character: { type: 'integer', description: 'End character position (0-based)' },
        diagnostics: { type: 'array', description: 'List of diagnostics', items: { type: 'object' } }
      },
      required: ['file_path', 'start_line', 'start_character', 'end_line', 'end_character']
    }
  } as Tool,

  formatDocument: {
    name: 'lsp_format_document',
    description: 'Format an entire document',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' },
        tab_size: { type: 'integer', description: 'Number of spaces for a tab' },
        insert_spaces: { type: 'boolean', description: 'Use spaces instead of tabs' }
      },
      required: ['file_path']
    }
  } as Tool,

  formatRange: {
    name: 'lsp_format_range',
    description: 'Format a specific range in a document',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' },
        start_line: { type: 'integer', description: 'Start line number (0-based)' },
        start_character: { type: 'integer', description: 'Start character position (0-based)' },
        end_line: { type: 'integer', description: 'End line number (0-based)' },
        end_character: { type: 'integer', description: 'End character position (0-based)' },
        tab_size: { type: 'integer', description: 'Number of spaces for a tab' },
        insert_spaces: { type: 'boolean', description: 'Use spaces instead of tabs' }
      },
      required: ['file_path', 'start_line', 'start_character', 'end_line', 'end_character']
    }
  } as Tool
};

// Advanced tools
export const advancedTools = {
  semanticTokens: {
    name: 'lsp_semantic_tokens',
    description: 'Get semantic tokens for syntax highlighting',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' }
      },
      required: ['file_path']
    }
  } as Tool,

  inlayHints: {
    name: 'lsp_inlay_hints',
    description: 'Get inlay hints for a range',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' },
        start_line: { type: 'integer', description: 'Start line number (0-based)' },
        start_character: { type: 'integer', description: 'Start character position (0-based)' },
        end_line: { type: 'integer', description: 'End line number (0-based)' },
        end_character: { type: 'integer', description: 'End character position (0-based)' }
      },
      required: ['file_path', 'start_line', 'start_character', 'end_line', 'end_character']
    }
  } as Tool,

  codeLens: {
    name: 'lsp_code_lens',
    description: 'Get code lens information',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' }
      },
      required: ['file_path']
    }
  } as Tool,

  foldingRange: {
    name: 'lsp_folding_range',
    description: 'Get folding ranges for a document',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' }
      },
      required: ['file_path']
    }
  } as Tool,

  selectionRange: {
    name: 'lsp_selection_range',
    description: 'Get selection ranges for positions',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' },
        positions: { 
          type: 'array', 
          description: 'List of positions',
          items: {
            type: 'object',
            properties: {
              line: { type: 'integer' },
              character: { type: 'integer' }
            },
            required: ['line', 'character']
          }
        }
      },
      required: ['file_path', 'positions']
    }
  } as Tool,

  documentLink: {
    name: 'lsp_document_link',
    description: 'Get document links',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' }
      },
      required: ['file_path']
    }
  } as Tool
};

// Workspace tools
export const workspaceTools = {
  executeCommand: {
    name: 'lsp_execute_command',
    description: 'Execute a workspace command',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Command to execute' },
        arguments: { type: 'array', description: 'Command arguments', items: {} }
      },
      required: ['command']
    }
  } as Tool
};