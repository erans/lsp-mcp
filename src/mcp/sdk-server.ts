import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Registry } from './registry';
import * as winston from 'winston';

export class MCPSDKServer {
  private server: Server;
  private registry: Registry;
  private logger: winston.Logger;
  private lspReady = false;

  constructor(registry: Registry, logger: winston.Logger) {
    this.registry = registry;
    this.logger = logger;
    
    // Create MCP server instance
    this.server = new Server(
      {
        name: 'lsp-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setLSPReady(ready: boolean): void {
    this.lspReady = ready;
    this.logger.debug(`LSP ready state changed to: ${ready}`);
  }

  private setupHandlers(): void {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = this.registry.getTools();
      return {
        tools: Object.values(tools),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      // Check if LSP is ready before processing tool calls
      if (!this.lspReady) {
        throw new Error('LSP not ready: Language Server Protocol client is still initializing');
      }

      const { name, arguments: args } = request.params;

      if (!this.registry.hasTool(name)) {
        throw new Error(`Unknown tool: ${name}`);
      }

      try {
        const result = await this.registry.handleTool(name, args || {});
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      } catch (error) {
        this.logger.error(`Error executing tool ${name}: ${error}`);
        throw error;
      }
    });

    // Log errors
    this.server.onerror = (error) => {
      this.logger.error('[MCP SDK Server Error]', error);
    };
  }

  async start(): Promise<void> {
    this.logger.debug('MCP SDK Server starting...');
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    this.logger.debug('MCP SDK Server ready and listening');
  }
}