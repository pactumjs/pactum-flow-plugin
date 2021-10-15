export * as reporter from './reporter';

interface Config {
  projectId?: string;
  projectName?: string;
  version?: string;
  url?: string;
  token?: string;
  batchSize?: number;
  username?: string;
  password?: string;
  publish?: boolean;
  dir?: boolean | string;
}

/**
 * config type matching
 */
export type config = Config;
