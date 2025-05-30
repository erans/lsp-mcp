import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { createConfig, loadLspConfig } from '../config';

describe('Config', () => {
  const testDir = path.join(__dirname, 'temp-test-workspace');
  const testConfigFile = path.join(__dirname, 'test-lsp-servers.yaml');
  
  const testConfigContent = {
    typescript: 'typescript-language-server --stdio',
    python: 'pylsp',
    go: 'gopls',
    rust: 'rust-analyzer',
    cpp: 'clangd'
  };

  beforeEach(async () => {
    // Create a temporary directory for testing
    await fs.mkdir(testDir, { recursive: true });
    
    // Create test config file
    await fs.writeFile(testConfigFile, yaml.dump(testConfigContent));
  });

  afterEach(async () => {
    // Clean up
    try {
      await fs.rmdir(testDir, { recursive: true });
      await fs.unlink(testConfigFile);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should create a valid config with all required fields', async () => {
    const config = await createConfig(testConfigFile, 'python', testDir, false);

    expect(config.lspCommand).toBe('pylsp');
    expect(config.workspacePath).toBe(testDir);
    expect(config.verbose).toBe(false);
    expect(config.timeout).toBe(30000);
  });

  it('should enable verbose mode when specified', async () => {
    const config = await createConfig(testConfigFile, 'go', testDir, true);

    expect(config.verbose).toBe(true);
  });

  it('should use current directory when workspace path is empty', async () => {
    const config = await createConfig(testConfigFile, 'rust', '', false);

    expect(config.workspacePath).toBe(process.cwd());
  });

  it('should throw error for unknown LSP key', async () => {
    await expect(createConfig(testConfigFile, 'unknown-lsp', testDir, false)).rejects.toThrow(
      "LSP server key 'unknown-lsp' not found in config"
    );
  });

  it('should throw error for non-existent workspace path', async () => {
    const nonExistentPath = path.join(__dirname, 'does-not-exist');
    await expect(createConfig(testConfigFile, 'python', nonExistentPath, false)).rejects.toThrow(
      `Workspace path does not exist: ${nonExistentPath}`
    );
  });

  it('should throw error for non-existent config file', async () => {
    const nonExistentConfig = path.join(__dirname, 'non-existent.yaml');
    await expect(createConfig(nonExistentConfig, 'python', testDir, false)).rejects.toThrow(
      `Failed to load config file '${nonExistentConfig}'`
    );
  });

  it('should load LSP config from YAML file', async () => {
    const config = await loadLspConfig(testConfigFile);
    
    expect(config.typescript).toBe('typescript-language-server --stdio');
    expect(config.python).toBe('pylsp');
    expect(config.go).toBe('gopls');
    expect(config.rust).toBe('rust-analyzer');
    expect(config.cpp).toBe('clangd');
  });
});