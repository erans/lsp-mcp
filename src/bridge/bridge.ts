import { AppConfig } from '../config';
import { LSPClient } from '../lsp/client';
import { MCPSDKServer } from '../mcp/sdk-server';
import { Registry } from '../mcp/registry';
import { HandlerRegistry } from '../mcp/handlers';
import { Config as LSPConfig } from '../lsp/types';
import * as winston from 'winston';

export class Bridge {
  private config: AppConfig;
  private lspClient: LSPClient;
  private mcpServer: MCPSDKServer;
  private logger: winston.Logger;
  private shutdownHandled = false;

  constructor(config: AppConfig, logger: winston.Logger) {
    this.config = config;
    this.logger = logger;

    const lspConfig: LSPConfig = {
      timeout: config.timeout,
      verbose: config.verbose,
    };

    this.lspClient = new LSPClient(lspConfig, logger);
    const handlerRegistry = new HandlerRegistry(this.lspClient);
    const registry = new Registry(handlerRegistry);
    this.mcpServer = new MCPSDKServer(registry, logger);
  }

  async start(): Promise<void> {
    // Don't log startup messages - they can interfere with JSON-RPC communication
    this.logger.debug('🚀 Starting MCP-LSP Bridge Server...');
    this.logger.debug(`LSP Command: ${this.config.lspCommand}`);
    this.logger.debug(`Workspace: ${this.config.workspacePath}`);
    this.logger.debug('Available LSP tools: goto_definition, find_references, goto_implementation, goto_type_definition, document_symbols, workspace_symbols, hover, completion, signature_help, rename, code_action, format_document, goto_declaration, document_highlight, code_lens, folding_range, selection_range, semantic_tokens, inlay_hints, document_link, format_range, execute_command');

    // Set up graceful shutdown
    this.setupShutdownHandler();

    // Start LSP client asynchronously (don't await)
    this.lspClient.start(this.config.lspCommand, this.config.workspacePath)
      .then(() => {
        this.logger.debug('LSP client started successfully');
        this.mcpServer.setLSPReady(true);
      })
      .catch((error) => {
        this.logger.error(`Failed to start LSP client: ${error}`);
        process.exit(1);
      });

    this.logger.debug('Press Ctrl+C to shutdown gracefully');

    // Start MCP server immediately (blocking)
    await this.mcpServer.start();
  }

  async stop(): Promise<void> {
    if (this.shutdownHandled) {
      return;
    }
    this.shutdownHandled = true;

    this.logger.info('Shutting down LSP client...');
    try {
      await this.lspClient.stop();
    } catch (error) {
      this.logger.error(`Error stopping LSP client: ${error}`);
      throw error;
    }

    this.logger.info('Bridge shutdown complete');
  }

  private setupShutdownHandler(): void {
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    
    signals.forEach((signal) => {
      process.on(signal, async () => {
        this.logger.info('Received shutdown signal...');
        try {
          await this.stop();
        } catch (error) {
          this.logger.error(`Error during shutdown: ${error}`);
        }
        process.exit(0);
      });
    });
  }
}