import { describe, it, expect, beforeEach, afterEach } from "vitest";
import healthConfig from "./health.config";

describe("HealthConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load health configuration from environment", () => {
    process.env.HEALTH_CHECK_TIMEOUT = "10";
    process.env.HEALTH_CHECK_DATABASE = "true";
    process.env.HEALTH_CHECK_REDIS = "true";
    process.env.HEALTH_CHECK_EXTERNAL_SERVICES = "true";

    const config = healthConfig();

    expect(config).toEqual({
      timeout: 10,
      checkDatabase: true,
      checkRedis: true,
      checkExternalServices: true,
    });
  });

  it("should use default values when not specified", () => {
    delete process.env.HEALTH_CHECK_TIMEOUT;
    delete process.env.HEALTH_CHECK_DATABASE;
    delete process.env.HEALTH_CHECK_REDIS;
    delete process.env.HEALTH_CHECK_EXTERNAL_SERVICES;

    const config = healthConfig();

    expect(config).toEqual({
      timeout: 5,
      checkDatabase: true,
      checkRedis: true,
      checkExternalServices: true,
    });
  });

  it("should disable checks when set to false", () => {
    process.env.HEALTH_CHECK_DATABASE = "false";
    process.env.HEALTH_CHECK_REDIS = "false";
    process.env.HEALTH_CHECK_EXTERNAL_SERVICES = "false";

    const config = healthConfig();

    expect(config.checkDatabase).toBe(false);
    expect(config.checkRedis).toBe(false);
    expect(config.checkExternalServices).toBe(false);
  });

  it("should enable checks for any value other than false", () => {
    process.env.HEALTH_CHECK_DATABASE = "no";
    process.env.HEALTH_CHECK_REDIS = "0";
    process.env.HEALTH_CHECK_EXTERNAL_SERVICES = "";

    const config = healthConfig();

    // Only "false" string disables, everything else enables
    expect(config.checkDatabase).toBe(true);
    expect(config.checkRedis).toBe(true);
    expect(config.checkExternalServices).toBe(true);
  });
});
