import { testData } from "./test-data";
import { toProcessEnv, createEnvSnapshot } from "./test-shapes";

export { testData } from "./test-data";
export { toNestedConfig, toProcessEnv, createEnvSnapshot } from "./test-shapes";

export const testConfig = {
  complete: () => testData.complete(),
  minimal: () => testData.minimal(),
  withS3: () => testData.withS3(),
  with: (overrides: Record<string, any>) => testData.custom(overrides),
  completeWith: (overrides: Record<string, any>) =>
    testData.customComplete(overrides),
  invalid: {
    missingStorage: () => testData.missingStorage(),
    invalidEmail: () => testData.invalidEmail(),
    invalidPhone: () => testData.invalidPhone(),
    redisDbOutOfRange: () => testData.redisDbOutOfRange(),
    shortJwtSecret: () => testData.shortJwtSecret(),
    invalidUrl: () => testData.invalidUrl(),
    invalidAppVersion: () => testData.invalidAppVersion(),
    missingAuth: () => testData.noJwtSecret(),
  },
};

export const testEnv = {
  setup: (config: Record<string, any>) => toProcessEnv(config).setup(),
  clear: () => {
    // Clear all known env vars
    const allKeys = Object.keys(testData.complete());
    allKeys.forEach((key) => delete process.env[key]);
  },
  snapshot: () => createEnvSnapshot(),
};

export class EnvironmentSnapshot {
  private snapshot: NodeJS.ProcessEnv;

  constructor() {
    this.snapshot = { ...process.env };
  }

  restore() {
    process.env = { ...this.snapshot };
  }
}
