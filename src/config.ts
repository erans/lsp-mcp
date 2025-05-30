import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';

export interface LspServerConfig {
  [key: string]: string;
}

export interface AppConfig {
  lspCommand: string;
  workspacePath: string;
  verbose: boolean;
  timeout: number;
}

export async function createConfig(configFilePath: string, lspKey: string, workspacePath: string, verbose: boolean): Promise<AppConfig> {
  const lspServers = await loadLspConfig(configFilePath);
  const lspCommand = lspServers[lspKey];
  
  if (!lspCommand) {
    const availableKeys = Object.keys(lspServers).join(', ');
    throw new Error(`LSP server key '${lspKey}' not found in config. Available keys: ${availableKeys}`);
  }

  const config: AppConfig = {
    lspCommand,
    workspacePath,
    verbose,
    timeout: 30000, // 30 seconds in milliseconds
  };

  await validateConfig(config);
  return config;
}

export async function loadLspConfig(configFilePath: string): Promise<LspServerConfig> {
  try {
    const configData = await fs.readFile(configFilePath, 'utf8');
    const config = yaml.load(configData) as LspServerConfig;
    
    if (!config || typeof config !== 'object') {
      throw new Error('Config file must contain a YAML object');
    }
    
    return config;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load config file '${configFilePath}': ${error.message}`);
    }
    throw error;
  }
}

async function validateConfig(config: AppConfig): Promise<void> {
  if (!config.lspCommand) {
    throw new Error('LSP command cannot be empty');
  }

  if (!config.workspacePath) {
    config.workspacePath = process.cwd();
  }

  try {
    await fs.access(config.workspacePath);
  } catch (error) {
    throw new Error(`Workspace path does not exist: ${config.workspacePath}`);
  }
}