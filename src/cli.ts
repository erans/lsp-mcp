#!/usr/bin/env node

import { Command } from 'commander';
import * as winston from 'winston';
import { createConfig } from './config';
import { Bridge } from './bridge/bridge';

async function main() {
  const program = new Command();

  program
    .name('lsp-mcp-bridge')
    .description('LSP (Language Server Protocol) to MCP (Model Context Protocol) bridge')
    .version('1.0.0');

  program
    .requiredOption('--config <path>', 'Path to YAML configuration file containing LSP server definitions')
    .requiredOption('--lsp <key>', 'LSP server key from configuration file')
    .option('--workspace <path>', 'Workspace path for LSP server', '.')
    .option('--verbose', 'Enable verbose logging of LSP requests and responses', false)
    .parse();

  const options = program.opts();

  // Note: requiredOption will handle validation of --config and --lsp arguments

  // Setup logging - CRITICAL: Only log errors to stderr to avoid interfering with JSON-RPC
  const logger = winston.createLogger({
    level: options.verbose ? 'debug' : 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.simple()
    ),
    transports: [
      new winston.transports.Console({
        stderrLevels: ['error', 'warn', 'info', 'debug'],  // ALL levels to stderr
        silent: !options.verbose   // Completely silent unless verbose mode
      })
    ]
  });

  if (options.verbose) {
    logger.info('Verbose mode enabled - will log LSP requests and responses');
  }

  try {
    const config = await createConfig(options.config, options.lsp, options.workspace, options.verbose);
    const bridge = new Bridge(config, logger);
    await bridge.start();
  } catch (error) {
    logger.error(`Error: ${error}`);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}