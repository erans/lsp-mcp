import { describe, it, expect } from 'vitest';
import {
  extractPositionArgs,
  extractRangeArgs,
  extractIntArg,
  extractFormattingOptions,
  marshalResponse
} from '../mcp/common';

describe('MCP Common Utilities', () => {
  describe('extractPositionArgs', () => {
    it('should extract valid position arguments', () => {
      const args = {
        file_path: '/path/to/file.py',
        line: 10,
        character: 5
      };

      const result = extractPositionArgs(args);

      expect(result.filePath).toBe('/path/to/file.py');
      expect(result.line).toBe(10);
      expect(result.character).toBe(5);
    });

    it('should throw error for missing file_path', () => {
      const args = { line: 10, character: 5 };

      expect(() => extractPositionArgs(args)).toThrow(
        'file_path is required and must be a string'
      );
    });

    it('should throw error for missing line', () => {
      const args = { file_path: '/path/to/file.py', character: 5 };

      expect(() => extractPositionArgs(args)).toThrow('line is required');
    });

    it('should throw error for missing character', () => {
      const args = { file_path: '/path/to/file.py', line: 10 };

      expect(() => extractPositionArgs(args)).toThrow('character is required');
    });
  });

  describe('extractRangeArgs', () => {
    it('should extract valid range arguments', () => {
      const args = {
        file_path: '/path/to/file.py',
        start_line: 10,
        start_character: 5,
        end_line: 15,
        end_character: 20
      };

      const result = extractRangeArgs(args);

      expect(result.filePath).toBe('/path/to/file.py');
      expect(result.startLine).toBe(10);
      expect(result.startCharacter).toBe(5);
      expect(result.endLine).toBe(15);
      expect(result.endCharacter).toBe(20);
    });
  });

  describe('extractIntArg', () => {
    it('should extract integer from number', () => {
      expect(extractIntArg(42, 'test')).toBe(42);
    });

    it('should extract integer from float (floor)', () => {
      expect(extractIntArg(42.7, 'test')).toBe(42);
    });

    it('should extract integer from string', () => {
      expect(extractIntArg('42', 'test')).toBe(42);
    });

    it('should throw error for invalid string', () => {
      expect(() => extractIntArg('not-a-number', 'test')).toThrow(
        'test must be a number, got: not-a-number'
      );
    });

    it('should throw error for null/undefined', () => {
      expect(() => extractIntArg(null, 'test')).toThrow('test is required');
      expect(() => extractIntArg(undefined, 'test')).toThrow('test is required');
    });

    it('should throw error for invalid type', () => {
      expect(() => extractIntArg({}, 'test')).toThrow(
        'test must be a number, got: object'
      );
    });
  });

  describe('extractFormattingOptions', () => {
    it('should extract formatting options with defaults', () => {
      const result = extractFormattingOptions({});

      expect(result.tabSize).toBe(4);
      expect(result.insertSpaces).toBe(true);
    });

    it('should extract custom formatting options', () => {
      const args = {
        tab_size: 2,
        insert_spaces: false
      };

      const result = extractFormattingOptions(args);

      expect(result.tabSize).toBe(2);
      expect(result.insertSpaces).toBe(false);
    });
  });

  describe('marshalResponse', () => {
    it('should format response as JSON', () => {
      const data = { key: 'value', number: 42 };
      const result = marshalResponse(data);

      expect(result).toBe(JSON.stringify(data, null, 2));
    });

    it('should handle null and undefined', () => {
      expect(marshalResponse(null)).toBe('null');
      expect(marshalResponse(undefined)).toBe(undefined);
    });

    it('should handle arrays', () => {
      const data = [1, 2, 3];
      const result = marshalResponse(data);

      expect(result).toBe(JSON.stringify(data, null, 2));
    });
  });
});