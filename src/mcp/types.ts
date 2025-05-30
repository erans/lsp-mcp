export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export type Handler = (args: Record<string, any>) => Promise<string>;