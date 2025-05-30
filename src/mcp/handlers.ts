import { Client } from '../lsp/interfaces';
import { extractPositionArgs, extractRangeArgs, extractFormattingOptions, extractIntArg, marshalResponse } from './common';

export class HandlerRegistry {
  constructor(private lspClient: Client) {}

  // Navigation handlers
  async handleGotoDefinition(args: Record<string, any>): Promise<string> {
    const { filePath, line, character } = extractPositionArgs(args);
    const result = await this.lspClient.getDefinition(filePath, line, character);
    return marshalResponse(result);
  }

  async handleGotoDeclaration(args: Record<string, any>): Promise<string> {
    const { filePath, line, character } = extractPositionArgs(args);
    const result = await this.lspClient.getDeclaration(filePath, line, character);
    return marshalResponse(result);
  }

  async handleGotoImplementation(args: Record<string, any>): Promise<string> {
    const { filePath, line, character } = extractPositionArgs(args);
    const result = await this.lspClient.getImplementation(filePath, line, character);
    return marshalResponse(result);
  }

  async handleGotoTypeDefinition(args: Record<string, any>): Promise<string> {
    const { filePath, line, character } = extractPositionArgs(args);
    const result = await this.lspClient.getTypeDefinition(filePath, line, character);
    return marshalResponse(result);
  }

  async handleFindReferences(args: Record<string, any>): Promise<string> {
    const { filePath, line, character } = extractPositionArgs(args);
    const result = await this.lspClient.getReferences(filePath, line, character);
    return marshalResponse(result);
  }

  // Symbol handlers
  async handleDocumentSymbols(args: Record<string, any>): Promise<string> {
    const filePath = args.file_path;
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('file_path is required and must be a string');
    }
    const result = await this.lspClient.getDocumentSymbols(filePath);
    return marshalResponse(result);
  }

  async handleWorkspaceSymbols(args: Record<string, any>): Promise<string> {
    const query = args.query;
    if (query === undefined || query === null) {
      throw new Error('query is required');
    }
    const result = await this.lspClient.getWorkspaceSymbols(String(query));
    return marshalResponse(result);
  }

  async handleDocumentHighlight(args: Record<string, any>): Promise<string> {
    const { filePath, line, character } = extractPositionArgs(args);
    const result = await this.lspClient.getDocumentHighlight(filePath, line, character);
    return marshalResponse(result);
  }

  // Intelligence handlers
  async handleHover(args: Record<string, any>): Promise<string> {
    const { filePath, line, character } = extractPositionArgs(args);
    const result = await this.lspClient.getHover(filePath, line, character);
    return marshalResponse(result);
  }

  async handleCompletion(args: Record<string, any>): Promise<string> {
    const { filePath, line, character } = extractPositionArgs(args);
    const triggerCharacter = args.trigger_character || '';
    const result = await this.lspClient.getCompletion(filePath, line, character, triggerCharacter);
    return marshalResponse(result);
  }

  async handleSignatureHelp(args: Record<string, any>): Promise<string> {
    const { filePath, line, character } = extractPositionArgs(args);
    const result = await this.lspClient.getSignatureHelp(filePath, line, character);
    return marshalResponse(result);
  }

  // Editing handlers
  async handleRename(args: Record<string, any>): Promise<string> {
    const { filePath, line, character } = extractPositionArgs(args);
    const newName = args.new_name;
    if (!newName || typeof newName !== 'string') {
      throw new Error('new_name is required and must be a string');
    }
    const result = await this.lspClient.renameSymbol(filePath, line, character, newName);
    return marshalResponse(result);
  }

  async handleCodeAction(args: Record<string, any>): Promise<string> {
    const { filePath, startLine, startCharacter, endLine, endCharacter } = extractRangeArgs(args);
    const diagnostics = args.diagnostics || [];
    const result = await this.lspClient.getCodeActions(filePath, startLine, startCharacter, endLine, endCharacter, diagnostics);
    return marshalResponse(result);
  }

  async handleFormatDocument(args: Record<string, any>): Promise<string> {
    const filePath = args.file_path;
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('file_path is required and must be a string');
    }
    const { tabSize, insertSpaces } = extractFormattingOptions(args);
    const result = await this.lspClient.formatDocument(filePath, tabSize, insertSpaces);
    return marshalResponse(result);
  }

  async handleFormatRange(args: Record<string, any>): Promise<string> {
    const { filePath, startLine, startCharacter, endLine, endCharacter } = extractRangeArgs(args);
    const { tabSize, insertSpaces } = extractFormattingOptions(args);
    const result = await this.lspClient.formatRange(filePath, startLine, startCharacter, endLine, endCharacter, tabSize, insertSpaces);
    return marshalResponse(result);
  }

  // Advanced handlers
  async handleSemanticTokens(args: Record<string, any>): Promise<string> {
    const filePath = args.file_path;
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('file_path is required and must be a string');
    }
    const result = await this.lspClient.getSemanticTokens(filePath);
    return marshalResponse(result);
  }

  async handleInlayHints(args: Record<string, any>): Promise<string> {
    const { filePath, startLine, startCharacter, endLine, endCharacter } = extractRangeArgs(args);
    const result = await this.lspClient.getInlayHints(filePath, startLine, startCharacter, endLine, endCharacter);
    return marshalResponse(result);
  }

  async handleCodeLens(args: Record<string, any>): Promise<string> {
    const filePath = args.file_path;
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('file_path is required and must be a string');
    }
    const result = await this.lspClient.getCodeLens(filePath);
    return marshalResponse(result);
  }

  async handleFoldingRange(args: Record<string, any>): Promise<string> {
    const filePath = args.file_path;
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('file_path is required and must be a string');
    }
    const result = await this.lspClient.getFoldingRange(filePath);
    return marshalResponse(result);
  }

  async handleSelectionRange(args: Record<string, any>): Promise<string> {
    const filePath = args.file_path;
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('file_path is required and must be a string');
    }
    
    const positions = args.positions;
    if (!Array.isArray(positions)) {
      throw new Error('positions must be an array');
    }

    // Validate and convert positions
    const validatedPositions = positions.map((pos, index) => {
      if (!pos || typeof pos !== 'object') {
        throw new Error(`positions[${index}] must be an object`);
      }
      return {
        line: extractIntArg(pos.line, `positions[${index}].line`),
        character: extractIntArg(pos.character, `positions[${index}].character`)
      };
    });

    const result = await this.lspClient.getSelectionRange(filePath, validatedPositions);
    return marshalResponse(result);
  }

  async handleDocumentLink(args: Record<string, any>): Promise<string> {
    const filePath = args.file_path;
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('file_path is required and must be a string');
    }
    const result = await this.lspClient.getDocumentLink(filePath);
    return marshalResponse(result);
  }

  // Workspace handlers
  async handleExecuteCommand(args: Record<string, any>): Promise<string> {
    const command = args.command;
    if (!command || typeof command !== 'string') {
      throw new Error('command is required and must be a string');
    }
    const commandArgs = args.arguments || [];
    const result = await this.lspClient.executeCommand(command, commandArgs);
    return marshalResponse(result);
  }
}