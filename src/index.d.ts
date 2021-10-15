export * as reporter from './reporter';

interface Config {
  projectId?: string;
  projectName?: string;
  version?: string;
  url?: string;
  token?: string;
  batchSize?: number;
}

/**
 * config type matching
 */
export type config = Config;
