#!/usr/bin/env node

// Mock LSP server that responds to basic requests using LSP protocol
let buffer = '';

function sendResponse(response) {
  const content = JSON.stringify(response);
  const header = `Content-Length: ${Buffer.byteLength(content, 'utf8')}\r\n\r\n`;
  process.stdout.write(header + content);
}

process.stdin.on('data', (chunk) => {
  buffer += chunk.toString();
  
  while (true) {
    const headerEnd = buffer.indexOf('\r\n\r\n');
    if (headerEnd === -1) break;
    
    const headers = buffer.substring(0, headerEnd);
    const contentLengthMatch = headers.match(/Content-Length:\s*(\d+)/);
    
    if (!contentLengthMatch) {
      buffer = buffer.substring(headerEnd + 4);
      continue;
    }
    
    const contentLength = parseInt(contentLengthMatch[1]);
    const messageStart = headerEnd + 4;
    
    if (buffer.length < messageStart + contentLength) {
      break; // Not enough data yet
    }
    
    const messageContent = buffer.substring(messageStart, messageStart + contentLength);
    buffer = buffer.substring(messageStart + contentLength);
    
    try {
      const request = JSON.parse(messageContent);
      
      if (request.method === 'initialize') {
        const response = {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            capabilities: {
              textDocumentSync: 1,
              hoverProvider: true,
              definitionProvider: true
            }
          }
        };
        sendResponse(response);
      } else if (request.method === 'initialized') {
        // No response needed for notifications
      } else {
        // Echo back other requests
        const response = {
          jsonrpc: '2.0',
          id: request.id,
          result: null
        };
        sendResponse(response);
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
});