import { describe, it, expect } from 'vitest';
import { Request, Response, Position, Range, Location } from '../lsp/types';

describe('LSP Types', () => {
  describe('Position', () => {
    it('should create a valid position', () => {
      const position: Position = {
        line: 10,
        character: 5
      };

      expect(position.line).toBe(10);
      expect(position.character).toBe(5);
    });
  });

  describe('Range', () => {
    it('should create a valid range', () => {
      const range: Range = {
        start: { line: 10, character: 5 },
        end: { line: 15, character: 20 }
      };

      expect(range.start.line).toBe(10);
      expect(range.start.character).toBe(5);
      expect(range.end.line).toBe(15);
      expect(range.end.character).toBe(20);
    });
  });

  describe('Location', () => {
    it('should create a valid location', () => {
      const location: Location = {
        uri: 'file:///path/to/file.py',
        range: {
          start: { line: 10, character: 5 },
          end: { line: 15, character: 20 }
        }
      };

      expect(location.uri).toBe('file:///path/to/file.py');
      expect(location.range.start.line).toBe(10);
    });
  });

  describe('Request', () => {
    it('should create a valid LSP request', () => {
      const request: Request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'textDocument/definition',
        params: {
          textDocument: { uri: 'file:///test.py' },
          position: { line: 10, character: 5 }
        }
      };

      expect(request.jsonrpc).toBe('2.0');
      expect(request.id).toBe(1);
      expect(request.method).toBe('textDocument/definition');
      expect(request.params).toBeDefined();
    });

    it('should create a notification (no id)', () => {
      const notification: Request = {
        jsonrpc: '2.0',
        method: 'textDocument/didOpen',
        params: {
          textDocument: {
            uri: 'file:///test.py',
            languageId: 'python',
            version: 1,
            text: 'print("hello")'
          }
        }
      };

      expect(notification.id).toBeUndefined();
      expect(notification.method).toBe('textDocument/didOpen');
    });
  });

  describe('Response', () => {
    it('should create a successful response', () => {
      const response: Response = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          uri: 'file:///test.py',
          range: {
            start: { line: 5, character: 0 },
            end: { line: 5, character: 10 }
          }
        }
      };

      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.result).toBeDefined();
      expect(response.error).toBeUndefined();
    });

    it('should create an error response', () => {
      const response: Response = {
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32601,
          message: 'Method not found'
        }
      };

      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.result).toBeUndefined();
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32601);
      expect(response.error?.message).toBe('Method not found');
    });
  });
});