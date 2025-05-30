import { spawn, ChildProcess } from 'child_process';
import { Transport, TransportReader, TransportWriter } from './interfaces';
import { Readable, Writable } from 'stream';
import { createInterface, Interface } from 'readline';

export class StdioTransport implements Transport, TransportReader, TransportWriter {
  private cmd: ChildProcess;
  private stdin: Writable;
  private stdout: Readable;
  private rl: Interface;
  private buffer: string = '';
  private messageQueue: Array<{ resolve: (value: Buffer) => void; reject: (reason: any) => void }> = [];
  private isProcessing = false;

  private parseCommand(command: string): string[] {
    const args: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < command.length; i++) {
      const char = command[i];
      
      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
      } else if (!inQuotes && char === ' ') {
        if (current.trim()) {
          args.push(current.trim());
          current = '';
        }
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      args.push(current.trim());
    }
    
    return args;
  }

  constructor(lspCommand: string, workspaceRoot: string) {
    const parts = this.parseCommand(lspCommand);
    if (parts.length === 0) {
      throw new Error('Empty LSP command');
    }

    const [command, ...args] = parts;
    
    if (!command) {
      throw new Error('Invalid LSP command');
    }
    
    this.cmd = spawn(command, args.filter(arg => arg.length > 0), {
      cwd: workspaceRoot,
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1'
      }
    });

    if (!this.cmd.stdin || !this.cmd.stdout) {
      throw new Error('Failed to create stdin/stdout pipes');
    }

    this.stdin = this.cmd.stdin;
    this.stdout = this.cmd.stdout;
    this.rl = createInterface({
      input: this.stdout,
      crlfDelay: Infinity
    });

    // Handle process errors - don't use console.error as it interferes with JSON-RPC
    this.cmd.on('error', () => {
      // Store error for later retrieval instead of logging to stderr
      // This prevents interference with JSON-RPC communication
    });

    this.cmd.on('exit', (code) => {
      if (code !== 0) {
        // Store exit code for later retrieval instead of logging to stderr
        // This prevents interference with JSON-RPC communication
      }
    });

    // Start processing data immediately
    this.stdout.on('data', (chunk: Buffer) => {
      this.buffer += chunk.toString();
      this.processBuffer();
    });

    this.stdout.on('error', (err) => {
      // Don't use console.error as it interferes with JSON-RPC
      // Reject all pending message reads
      while (this.messageQueue.length > 0) {
        const { reject } = this.messageQueue.shift()!;
        reject(err);
      }
    });
  }

  async send(msg: Buffer): Promise<void> {
    const header = `Content-Length: ${msg.length}\r\n\r\n`;
    return new Promise((resolve, reject) => {
      this.stdin.write(header, (err) => {
        if (err) {
          reject(new Error(`Writing header: ${err.message}`));
          return;
        }
        
        this.stdin.write(msg, (err) => {
          if (err) {
            reject(new Error(`Writing message: ${err.message}`));
            return;
          }
          resolve();
        });
      });
    });
  }

  private processBuffer(): void {
    if (this.isProcessing || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.messageQueue.length > 0 && this.buffer.length > 0) {
      const headerEndIndex = this.buffer.indexOf('\r\n\r\n');
      if (headerEndIndex === -1) {
        // Not enough data for headers yet
        break;
      }

      const headers = this.buffer.substring(0, headerEndIndex);
      const contentLengthMatch = headers.match(/Content-Length:\s*(\d+)/i);
      
      if (!contentLengthMatch) {
        const { reject } = this.messageQueue.shift()!;
        reject(new Error('No Content-Length header found'));
        this.buffer = this.buffer.substring(headerEndIndex + 4);
        continue;
      }

      const contentLength = parseInt(contentLengthMatch[1]!, 10);
      const messageStart = headerEndIndex + 4;
      const messageEnd = messageStart + contentLength;

      if (this.buffer.length < messageEnd) {
        // Not enough data for the full message yet
        break;
      }

      const message = this.buffer.substring(messageStart, messageEnd);
      this.buffer = this.buffer.substring(messageEnd);

      const { resolve } = this.messageQueue.shift()!;
      resolve(Buffer.from(message, 'utf8'));
    }

    this.isProcessing = false;
  }

  async receive(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this.messageQueue.push({ resolve, reject });
      this.processBuffer();
    });
  }

  async close(): Promise<void> {
    this.rl.close();
    this.stdin.end();
    this.cmd.kill();
    
    return new Promise((resolve) => {
      this.cmd.once('exit', () => {
        resolve();
      });
      
      // Force kill after timeout
      setTimeout(() => {
        this.cmd.kill('SIGKILL');
        resolve();
      }, 5000);
    });
  }

  reader(): NodeJS.ReadableStream {
    return this.stdout;
  }

  writer(): NodeJS.WritableStream {
    return this.stdin;
  }
}