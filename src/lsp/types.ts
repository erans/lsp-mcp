export interface Request {
  jsonrpc: string;
  id?: number;
  method: string;
  params?: any;
}

export interface Response {
  jsonrpc: string;
  id?: number;
  result?: any;
  error?: Error;
  method?: string;
  params?: any;
}

export interface Error {
  code: number;
  message: string;
  data?: any;
}

export interface Position {
  line: number;
  character: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export interface Location {
  uri: string;
  range: Range;
}

export interface TextDocumentIdentifier {
  uri: string;
}

export interface VersionedTextDocumentIdentifier extends TextDocumentIdentifier {
  version: number;
}

export interface TextDocumentItem {
  uri: string;
  languageId: string;
  version: number;
  text: string;
}

export interface CompletionContext {
  triggerKind: number;
  triggerCharacter?: string;
}

export interface FormattingOptions {
  tabSize: number;
  insertSpaces: boolean;
}

export interface ClientCapabilities {
  textDocument?: TextDocumentClientCapabilities;
  workspace?: WorkspaceClientCapabilities;
}

export interface TextDocumentClientCapabilities {
  definition?: DefinitionClientCapabilities;
  declaration?: DeclarationClientCapabilities;
  references?: ReferencesClientCapabilities;
  implementation?: ImplementationClientCapabilities;
  typeDefinition?: TypeDefinitionClientCapabilities;
  documentSymbol?: DocumentSymbolClientCapabilities;
  hover?: HoverClientCapabilities;
  completion?: CompletionClientCapabilities;
  signatureHelp?: SignatureHelpClientCapabilities;
  rename?: RenameClientCapabilities;
  codeAction?: CodeActionClientCapabilities;
  formatting?: FormattingClientCapabilities;
  synchronization?: SynchronizationCapabilities;
}

export interface WorkspaceClientCapabilities {
  symbol?: WorkspaceSymbolClientCapabilities;
  workspaceFolders?: boolean;
  configuration?: boolean;
}

export interface DefinitionClientCapabilities {
  dynamicRegistration?: boolean;
}

export interface DeclarationClientCapabilities {
  dynamicRegistration?: boolean;
}

export interface ReferencesClientCapabilities {
  dynamicRegistration?: boolean;
  includeDeclaration?: boolean;
}

export interface ImplementationClientCapabilities {
  dynamicRegistration?: boolean;
}

export interface TypeDefinitionClientCapabilities {
  dynamicRegistration?: boolean;
}

export interface DocumentSymbolClientCapabilities {
  dynamicRegistration?: boolean;
}

export interface HoverClientCapabilities {
  dynamicRegistration?: boolean;
  contentFormat?: string[];
}

export interface CompletionClientCapabilities {
  dynamicRegistration?: boolean;
  completionItem?: CompletionItemCapabilities;
}

export interface CompletionItemCapabilities {
  snippetSupport?: boolean;
  commitCharactersSupport?: boolean;
  documentationFormat?: string[];
}

export interface SignatureHelpClientCapabilities {
  dynamicRegistration?: boolean;
  signatureInformation?: SignatureInformationCapabilities;
}

export interface SignatureInformationCapabilities {
  documentationFormat?: string[];
}

export interface RenameClientCapabilities {
  dynamicRegistration?: boolean;
  prepareSupport?: boolean;
}

export interface CodeActionClientCapabilities {
  dynamicRegistration?: boolean;
}

export interface FormattingClientCapabilities {
  dynamicRegistration?: boolean;
}

export interface SynchronizationCapabilities {
  dynamicRegistration?: boolean;
  willSave?: boolean;
  didSave?: boolean;
  willSaveWaitUntil?: boolean;
}

export interface WorkspaceSymbolClientCapabilities {
  dynamicRegistration?: boolean;
}

export interface Config {
  timeout: number;
  verbose: boolean;
}