import { Client, Transport } from './interfaces';
import { Config, Request, Response, ClientCapabilities } from './types';
import { StdioTransport } from './stdio-transport';
import { HTTPTransport } from './http-transport';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as winston from 'winston';

export class LSPClient implements Client {
  private transport?: Transport;
  private initialized = false;
  private requestId = 0;
  private config: Config;
  private logger: winston.Logger;
  private initializationPromise?: Promise<void>;

  constructor(config: Config, logger: winston.Logger) {
    this.config = config;
    this.logger = logger;
  }

  async start(lspCommand: string, workspacePath: string): Promise<void> {
    // Store the initialization promise so we can await it later
    this.initializationPromise = this._start(lspCommand, workspacePath);
    return this.initializationPromise;
  }

  private async _start(lspCommand: string, workspacePath: string): Promise<void> {
    this.logger.info(`Starting LSP server: ${lspCommand} for workspace: ${workspacePath}`);

    // Check if this is an HTTP endpoint
    if (lspCommand.startsWith('http://') || lspCommand.startsWith('https://')) {
      // HTTP transport
      try {
        this.transport = new HTTPTransport(lspCommand);
      } catch (error) {
        throw new Error(`Failed to create HTTP transport: ${error}`);
      }
    } else {
      // Stdio transport
      const parts = lspCommand.split(' ').filter(p => p.length > 0);
      if (parts.length === 0) {
        throw new Error('Empty LSP command');
      }

      // Special handling for gopls - ensure it runs in stdio mode
      if (parts[0] === 'gopls' && parts.length === 1) {
        lspCommand = lspCommand + ' serve -rpc.trace';
        this.logger.info(`Adjusted gopls command: ${lspCommand}`);
      }

      try {
        this.transport = new StdioTransport(lspCommand, workspacePath);
      } catch (error) {
        throw new Error(`Failed to create stdio transport: ${error}`);
      }
    }

    await this.initialize(workspacePath);
  }

  async ensureInitialized(): Promise<void> {
    if (this.initialized) {
      return;
    }
    if (this.initializationPromise) {
      await this.initializationPromise;
    } else {
      throw new Error('LSP client not started');
    }
  }

  private async initialize(workspacePath: string): Promise<void> {
    this.logger.info(`Initializing LSP server for workspace: ${workspacePath}`);

    const capabilities = this.buildClientCapabilities();

    // Convert relative path to absolute path and create proper file URI
    const absolutePath = path.resolve(workspacePath);
    const rootUri = `file://${absolutePath}`;

    const initParams = {
      processId: process.pid,
      rootUri,
      capabilities,
    };

    this.logger.info('Sending LSP initialize request...');
    const result = await this.sendRequest('initialize', initParams);
    
    this.logger.info(`LSP initialize response: ${result != null}`);

    this.logger.info('Sending LSP initialized notification...');
    await this.sendNotification('initialized', {});

    this.initialized = true;
    this.logger.info('LSP server initialized successfully');
  }

  private buildClientCapabilities(): ClientCapabilities {
    return {
      textDocument: {
        definition: { dynamicRegistration: true },
        declaration: { dynamicRegistration: true },
        references: { dynamicRegistration: true, includeDeclaration: true },
        implementation: { dynamicRegistration: true },
        typeDefinition: { dynamicRegistration: true },
        documentSymbol: { dynamicRegistration: true },
        hover: { dynamicRegistration: true, contentFormat: ['markdown', 'plaintext'] },
        completion: {
          dynamicRegistration: true,
          completionItem: {
            snippetSupport: true,
            commitCharactersSupport: true,
            documentationFormat: ['markdown', 'plaintext'],
          },
        },
        signatureHelp: {
          dynamicRegistration: true,
          signatureInformation: {
            documentationFormat: ['markdown', 'plaintext'],
          },
        },
        rename: { dynamicRegistration: true, prepareSupport: true },
        codeAction: { dynamicRegistration: true },
        formatting: { dynamicRegistration: true },
        synchronization: {
          dynamicRegistration: true,
          willSave: false,
          didSave: false,
          willSaveWaitUntil: false,
        },
      },
      workspace: {
        symbol: { dynamicRegistration: true },
        workspaceFolders: true,
        configuration: true,
      },
    };
  }

  private async sendRequest(method: string, params: any): Promise<any> {
    if (!this.transport) {
      throw new Error('Transport not initialized');
    }

    const id = ++this.requestId;
    const request: Request = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    if (this.config.verbose) {
      this.logger.debug(`LSP Request: ${JSON.stringify(request, null, 2)}`);
    }

    const content = Buffer.from(JSON.stringify(request), 'utf8');
    await this.transport.send(content);

    const response = await this.readResponseWithTimeout(id);
    
    if (this.config.verbose) {
      this.logger.debug(`LSP Response: ${JSON.stringify(response, null, 2)}`);
    }

    if (response.error) {
      throw new Error(`LSP error: ${response.error.message}`);
    }

    return response.result;
  }

  private async sendNotification(method: string, params: any): Promise<void> {
    if (!this.transport) {
      throw new Error('Transport not initialized');
    }

    const notification: Request = {
      jsonrpc: '2.0',
      method,
      params,
    };

    const content = Buffer.from(JSON.stringify(notification), 'utf8');
    await this.transport.send(content);
  }

  private async readResponseWithTimeout(expectedId: number): Promise<Response> {
    if (!this.transport) {
      throw new Error('Transport not initialized');
    }

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout waiting for LSP response with id ${expectedId}`)), this.config.timeout);
    });

    const responsePromise = (async () => {
      while (true) {
        let message: Buffer;
        try {
          message = await this.transport!.receive();
        } catch (error) {
          this.logger.error(`Error receiving message from transport: ${error}`);
          throw error;
        }

        let response: Response;
        try {
          response = JSON.parse(message.toString('utf8'));
        } catch (error) {
          this.logger.error(`Failed to parse LSP message: ${error}`);
          this.logger.error(`Raw message: ${message.toString('utf8')}`);
          continue;
        }

        // Check if this is the response we're waiting for
        if (response.id !== undefined && response.id === expectedId) {
          return response;
        }

        // If it's a response but with a different ID, warn about it
        if (response.id !== undefined && response.id !== expectedId) {
          this.logger.warn(`Received response with unexpected id ${response.id}, expected ${expectedId}`);
          continue;
        }

        if (response.method) {
          // Log different notification types with appropriate detail
          if (response.method === 'window/logMessage') {
            const logLevel = response.params?.type === 1 ? 'ERROR' : 
                           response.params?.type === 2 ? 'WARN' : 
                           response.params?.type === 3 ? 'INFO' : 'DEBUG';
            this.logger.debug(`LSP ${logLevel}: ${response.params?.message}`);
          } else if (response.method === 'window/showMessage') {
            this.logger.info(`LSP message: ${response.params?.message}`);
          } else {
            this.logger.debug(`Received LSP notification: ${response.method}`);
          }
          continue;
        }

        // If we get here, it's neither a response nor a notification
        this.logger.warn(`Received unexpected LSP message: ${JSON.stringify(response)}`);
      }
    })();

    return Promise.race([responsePromise, timeoutPromise]);
  }

  private async openDocument(filePath: string): Promise<void> {
    const content = await fs.readFile(filePath, 'utf8');
    const ext = path.extname(filePath).slice(1);
    
    // Map file extensions to language IDs
    const languageMap: Record<string, string> = {
      py: 'python',
      js: 'javascript',
      ts: 'typescript',
      tsx: 'typescriptreact',
      jsx: 'javascriptreact',
      go: 'go',
      rs: 'rust',
      cpp: 'cpp',
      c: 'c',
      java: 'java',
      rb: 'ruby',
      php: 'php',
      cs: 'csharp',
      swift: 'swift',
      kt: 'kotlin',
      scala: 'scala',
      r: 'r',
      lua: 'lua',
      dart: 'dart',
      // Add more as needed
    };

    const languageId = languageMap[ext] || 'plaintext';

    const params = {
      textDocument: {
        uri: `file://${filePath}`,
        languageId,
        version: 1,
        text: content,
      },
    };

    await this.sendNotification('textDocument/didOpen', params);
  }

  async stop(): Promise<void> {
    if (!this.transport) {
      return;
    }

    this.logger.info('Terminating LSP connection...');

    if (this.initialized) {
      try {
        await this.sendRequest('shutdown', {});
        await this.sendNotification('exit', {});
      } catch (error) {
        this.logger.error(`Error during shutdown: ${error}`);
      }
    }

    await this.transport.close();
  }

  // Navigation methods
  async getDefinition(filePath: string, line: number, character: number): Promise<any[]> {
    await this.ensureInitialized();
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
      position: { line, character },
    };
    const result = await this.sendRequest('textDocument/definition', params);
    return Array.isArray(result) ? result : [result];
  }

  async getDeclaration(filePath: string, line: number, character: number): Promise<any[]> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
      position: { line, character },
    };
    const result = await this.sendRequest('textDocument/declaration', params);
    return Array.isArray(result) ? result : [result];
  }

  async getReferences(filePath: string, line: number, character: number): Promise<any[]> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
      position: { line, character },
      context: { includeDeclaration: true },
    };
    const result = await this.sendRequest('textDocument/references', params);
    return result || [];
  }

  async getImplementation(filePath: string, line: number, character: number): Promise<any[]> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
      position: { line, character },
    };
    const result = await this.sendRequest('textDocument/implementation', params);
    return Array.isArray(result) ? result : [result];
  }

  async getTypeDefinition(filePath: string, line: number, character: number): Promise<any[]> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
      position: { line, character },
    };
    const result = await this.sendRequest('textDocument/typeDefinition', params);
    return Array.isArray(result) ? result : [result];
  }

  // Symbol methods
  async getDocumentSymbols(filePath: string): Promise<any[]> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
    };
    const result = await this.sendRequest('textDocument/documentSymbol', params);
    return result || [];
  }

  async getWorkspaceSymbols(query: string): Promise<any[]> {
    const params = { query };
    const result = await this.sendRequest('workspace/symbol', params);
    return result || [];
  }

  async getDocumentHighlight(filePath: string, line: number, character: number): Promise<any[]> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
      position: { line, character },
    };
    const result = await this.sendRequest('textDocument/documentHighlight', params);
    return result || [];
  }

  // Intelligence methods
  async getHover(filePath: string, line: number, character: number): Promise<any> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
      position: { line, character },
    };
    return await this.sendRequest('textDocument/hover', params);
  }

  async getCompletion(filePath: string, line: number, character: number, triggerCharacter: string): Promise<any[]> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
      position: { line, character },
      context: triggerCharacter ? { triggerKind: 2, triggerCharacter } : { triggerKind: 1 },
    };
    const result = await this.sendRequest('textDocument/completion', params);
    return Array.isArray(result) ? result : (result?.items || []);
  }

  async getSignatureHelp(filePath: string, line: number, character: number): Promise<any> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
      position: { line, character },
    };
    return await this.sendRequest('textDocument/signatureHelp', params);
  }

  // Editing methods
  async renameSymbol(filePath: string, line: number, character: number, newName: string): Promise<any> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
      position: { line, character },
      newName,
    };
    return await this.sendRequest('textDocument/rename', params);
  }

  async getCodeActions(filePath: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number, diagnostics: any[]): Promise<any[]> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
      range: {
        start: { line: startLine, character: startCharacter },
        end: { line: endLine, character: endCharacter },
      },
      context: { diagnostics },
    };
    const result = await this.sendRequest('textDocument/codeAction', params);
    return result || [];
  }

  async formatDocument(filePath: string, tabSize: number, insertSpaces: boolean): Promise<any[]> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
      options: { tabSize, insertSpaces },
    };
    const result = await this.sendRequest('textDocument/formatting', params);
    return result || [];
  }

  async formatRange(filePath: string, startLine: number, startChar: number, endLine: number, endChar: number, tabSize: number, insertSpaces: boolean): Promise<any[]> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
      range: {
        start: { line: startLine, character: startChar },
        end: { line: endLine, character: endChar },
      },
      options: { tabSize, insertSpaces },
    };
    const result = await this.sendRequest('textDocument/rangeFormatting', params);
    return result || [];
  }

  // Advanced methods
  async getSemanticTokens(filePath: string): Promise<any> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
    };
    return await this.sendRequest('textDocument/semanticTokens/full', params);
  }

  async getInlayHints(filePath: string, startLine: number, startChar: number, endLine: number, endChar: number): Promise<any[]> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
      range: {
        start: { line: startLine, character: startChar },
        end: { line: endLine, character: endChar },
      },
    };
    const result = await this.sendRequest('textDocument/inlayHint', params);
    return result || [];
  }

  async getCodeLens(filePath: string): Promise<any[]> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
    };
    const result = await this.sendRequest('textDocument/codeLens', params);
    return result || [];
  }

  async getFoldingRange(filePath: string): Promise<any[]> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
    };
    const result = await this.sendRequest('textDocument/foldingRange', params);
    return result || [];
  }

  async getSelectionRange(filePath: string, positions: Array<{line: number, character: number}>): Promise<any[]> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
      positions,
    };
    const result = await this.sendRequest('textDocument/selectionRange', params);
    return result || [];
  }

  async getDocumentLink(filePath: string): Promise<any[]> {
    await this.openDocument(filePath);
    const params = {
      textDocument: { uri: `file://${filePath}` },
    };
    const result = await this.sendRequest('textDocument/documentLink', params);
    return result || [];
  }

  // Workspace methods
  async executeCommand(command: string, args: any[]): Promise<any> {
    const params = {
      command,
      arguments: args,
    };
    return await this.sendRequest('workspace/executeCommand', params);
  }
}