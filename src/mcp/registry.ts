import { Tool, Handler } from './types';
import { HandlerRegistry } from './handlers';
import { navigationTools, symbolTools, intelligenceTools, editingTools, advancedTools, workspaceTools } from './tools';

export class Registry {
  private tools: Map<string, Tool> = new Map();
  private handlers: Map<string, Handler> = new Map();
  private handlerRegistry: HandlerRegistry;

  constructor(handlerRegistry: HandlerRegistry) {
    this.handlerRegistry = handlerRegistry;
    this.registerTools();
  }

  private registerTools(): void {
    // Register navigation tools
    this.registerTool(navigationTools.gotoDefinition, this.handlerRegistry.handleGotoDefinition.bind(this.handlerRegistry));
    this.registerTool(navigationTools.gotoDeclaration, this.handlerRegistry.handleGotoDeclaration.bind(this.handlerRegistry));
    this.registerTool(navigationTools.gotoImplementation, this.handlerRegistry.handleGotoImplementation.bind(this.handlerRegistry));
    this.registerTool(navigationTools.gotoTypeDefinition, this.handlerRegistry.handleGotoTypeDefinition.bind(this.handlerRegistry));
    this.registerTool(navigationTools.findReferences, this.handlerRegistry.handleFindReferences.bind(this.handlerRegistry));

    // Register symbol tools
    this.registerTool(symbolTools.documentSymbols, this.handlerRegistry.handleDocumentSymbols.bind(this.handlerRegistry));
    this.registerTool(symbolTools.workspaceSymbols, this.handlerRegistry.handleWorkspaceSymbols.bind(this.handlerRegistry));
    this.registerTool(symbolTools.documentHighlight, this.handlerRegistry.handleDocumentHighlight.bind(this.handlerRegistry));

    // Register intelligence tools
    this.registerTool(intelligenceTools.hover, this.handlerRegistry.handleHover.bind(this.handlerRegistry));
    this.registerTool(intelligenceTools.completion, this.handlerRegistry.handleCompletion.bind(this.handlerRegistry));
    this.registerTool(intelligenceTools.signatureHelp, this.handlerRegistry.handleSignatureHelp.bind(this.handlerRegistry));

    // Register editing tools
    this.registerTool(editingTools.rename, this.handlerRegistry.handleRename.bind(this.handlerRegistry));
    this.registerTool(editingTools.codeAction, this.handlerRegistry.handleCodeAction.bind(this.handlerRegistry));
    this.registerTool(editingTools.formatDocument, this.handlerRegistry.handleFormatDocument.bind(this.handlerRegistry));
    this.registerTool(editingTools.formatRange, this.handlerRegistry.handleFormatRange.bind(this.handlerRegistry));

    // Register advanced tools
    this.registerTool(advancedTools.semanticTokens, this.handlerRegistry.handleSemanticTokens.bind(this.handlerRegistry));
    this.registerTool(advancedTools.inlayHints, this.handlerRegistry.handleInlayHints.bind(this.handlerRegistry));
    this.registerTool(advancedTools.codeLens, this.handlerRegistry.handleCodeLens.bind(this.handlerRegistry));
    this.registerTool(advancedTools.foldingRange, this.handlerRegistry.handleFoldingRange.bind(this.handlerRegistry));
    this.registerTool(advancedTools.selectionRange, this.handlerRegistry.handleSelectionRange.bind(this.handlerRegistry));
    this.registerTool(advancedTools.documentLink, this.handlerRegistry.handleDocumentLink.bind(this.handlerRegistry));

    // Register workspace tools
    this.registerTool(workspaceTools.executeCommand, this.handlerRegistry.handleExecuteCommand.bind(this.handlerRegistry));
  }

  private registerTool(tool: Tool, handler: Handler): void {
    this.tools.set(tool.name, tool);
    this.handlers.set(tool.name, handler);
  }

  getTools(): Record<string, Tool> {
    const result: Record<string, Tool> = {};
    this.tools.forEach((tool, name) => {
      result[name] = tool;
    });
    return result;
  }

  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  async handleTool(name: string, args: Record<string, any>): Promise<string> {
    const handler = this.handlers.get(name);
    if (!handler) {
      throw new Error(`No handler for tool: ${name}`);
    }
    return handler(args);
  }
}