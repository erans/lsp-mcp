
export interface Client {
  start(lspCommand: string, workspacePath: string): Promise<void>;
  stop(): Promise<void>;
  
  // Navigation methods
  getDefinition(filePath: string, line: number, character: number): Promise<any[]>;
  getDeclaration(filePath: string, line: number, character: number): Promise<any[]>;
  getReferences(filePath: string, line: number, character: number): Promise<any[]>;
  getImplementation(filePath: string, line: number, character: number): Promise<any[]>;
  getTypeDefinition(filePath: string, line: number, character: number): Promise<any[]>;
  
  // Symbol methods
  getDocumentSymbols(filePath: string): Promise<any[]>;
  getWorkspaceSymbols(query: string): Promise<any[]>;
  getDocumentHighlight(filePath: string, line: number, character: number): Promise<any[]>;
  
  // Intelligence methods
  getHover(filePath: string, line: number, character: number): Promise<any>;
  getCompletion(filePath: string, line: number, character: number, triggerCharacter: string): Promise<any[]>;
  getSignatureHelp(filePath: string, line: number, character: number): Promise<any>;
  
  // Editing methods
  renameSymbol(filePath: string, line: number, character: number, newName: string): Promise<any>;
  getCodeActions(filePath: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number, diagnostics: any[]): Promise<any[]>;
  formatDocument(filePath: string, tabSize: number, insertSpaces: boolean): Promise<any[]>;
  formatRange(filePath: string, startLine: number, startChar: number, endLine: number, endChar: number, tabSize: number, insertSpaces: boolean): Promise<any[]>;
  
  // Advanced methods
  getSemanticTokens(filePath: string): Promise<any>;
  getInlayHints(filePath: string, startLine: number, startChar: number, endLine: number, endChar: number): Promise<any[]>;
  getCodeLens(filePath: string): Promise<any[]>;
  getFoldingRange(filePath: string): Promise<any[]>;
  getSelectionRange(filePath: string, positions: Array<{line: number, character: number}>): Promise<any[]>;
  getDocumentLink(filePath: string): Promise<any[]>;
  
  // Workspace methods
  executeCommand(command: string, args: any[]): Promise<any>;
}

export interface Transport {
  send(msg: Buffer): Promise<void>;
  receive(): Promise<Buffer>;
  close(): Promise<void>;
}

export interface TransportReader {
  reader(): NodeJS.ReadableStream;
}

export interface TransportWriter {
  writer(): NodeJS.WritableStream;
}