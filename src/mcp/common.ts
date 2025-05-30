export interface PositionArgs {
  filePath: string;
  line: number;
  character: number;
}

export interface RangeArgs {
  filePath: string;
  startLine: number;
  startCharacter: number;
  endLine: number;
  endCharacter: number;
}

export interface FormattingOptions {
  tabSize: number;
  insertSpaces: boolean;
}

export function extractPositionArgs(args: Record<string, any>): PositionArgs {
  const filePath = args.file_path;
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('file_path is required and must be a string');
  }

  const line = extractIntArg(args.line, 'line');
  const character = extractIntArg(args.character, 'character');

  return { filePath, line, character };
}

export function extractRangeArgs(args: Record<string, any>): RangeArgs {
  const filePath = args.file_path;
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('file_path is required and must be a string');
  }

  const startLine = extractIntArg(args.start_line, 'start_line');
  const startCharacter = extractIntArg(args.start_character, 'start_character');
  const endLine = extractIntArg(args.end_line, 'end_line');
  const endCharacter = extractIntArg(args.end_character, 'end_character');

  return { filePath, startLine, startCharacter, endLine, endCharacter };
}

export function extractIntArg(value: any, name: string): number {
  if (value === undefined || value === null) {
    throw new Error(`${name} is required`);
  }

  // Handle different number formats
  if (typeof value === 'number') {
    return Math.floor(value);
  }

  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(`${name} must be a number, got: ${value}`);
    }
    return parsed;
  }

  throw new Error(`${name} must be a number, got: ${typeof value}`);
}

export function extractFormattingOptions(args: Record<string, any>): FormattingOptions {
  const tabSize = args.tab_size !== undefined ? extractIntArg(args.tab_size, 'tab_size') : 4;
  const insertSpaces = args.insert_spaces !== undefined ? Boolean(args.insert_spaces) : true;
  
  return { tabSize, insertSpaces };
}

export function marshalResponse(result: any): string {
  return JSON.stringify(result, null, 2);
}