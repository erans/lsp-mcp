import axios, { AxiosInstance } from 'axios';
import { Transport } from './interfaces';
import { EventEmitter } from 'events';

export class HTTPTransport implements Transport {
  private client: AxiosInstance;
  private msgQueue: Buffer[] = [];
  private errorQueue: Error[] = [];
  private closed = false;
  private eventEmitter = new EventEmitter();

  constructor(endpoint: string) {
    this.client = axios.create({
      baseURL: endpoint,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/vscode-jsonrpc; charset=utf-8'
      },
      validateStatus: () => true // We'll handle status codes ourselves
    });

    // Test connection
    this.testConnection();
  }

  private async testConnection(): Promise<void> {
    try {
      const testMsg = JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'initialize',
        params: {}
      });

      const response = await this.client.post('', testMsg, {
        headers: {
          'Content-Length': Buffer.byteLength(testMsg).toString()
        }
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error ${response.status}: ${response.data}`);
      }
    } catch (error) {
      throw new Error(`Failed to connect to LSP server: ${error}`);
    }
  }

  async send(msg: Buffer): Promise<void> {
    if (this.closed) {
      throw new Error('Transport is closed');
    }

    try {
      const response = await this.client.post('', msg, {
        headers: {
          'Content-Length': msg.length.toString()
        }
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error ${response.status}: ${response.data}`);
      }

      // Queue response for receive
      const responseData = typeof response.data === 'string' 
        ? Buffer.from(response.data, 'utf8')
        : Buffer.from(JSON.stringify(response.data), 'utf8');
      
      this.msgQueue.push(responseData);
      this.eventEmitter.emit('message');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to send request: ${error.message}`);
      }
      throw error;
    }
  }

  async receive(): Promise<Buffer> {
    if (this.closed) {
      throw new Error('Transport is closed');
    }

    // Check if we have queued messages
    if (this.msgQueue.length > 0) {
      return this.msgQueue.shift()!;
    }

    // Check if we have queued errors
    if (this.errorQueue.length > 0) {
      throw this.errorQueue.shift()!;
    }

    // Wait for new message
    return new Promise<Buffer>((resolve, reject) => {
      const cleanup = () => {
        this.eventEmitter.removeListener('message', messageHandler);
        this.eventEmitter.removeListener('close', closeHandler);
      };

      const messageHandler = () => {
        cleanup();
        if (this.msgQueue.length > 0) {
          resolve(this.msgQueue.shift()!);
        } else if (this.errorQueue.length > 0) {
          reject(this.errorQueue.shift()!);
        }
      };

      const closeHandler = () => {
        cleanup();
        reject(new Error('Transport closed'));
      };

      this.eventEmitter.once('message', messageHandler);
      this.eventEmitter.once('close', closeHandler);
    });
  }

  async close(): Promise<void> {
    if (!this.closed) {
      this.closed = true;
      this.eventEmitter.emit('close');
      this.eventEmitter.removeAllListeners();
    }
  }

}