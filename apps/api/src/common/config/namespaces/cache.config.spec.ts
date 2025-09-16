import { describe, it, expect, beforeEach, afterEach } from "vitest";
import cacheConfig from "./cache.config";

describe("CacheConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load cache configuration from environment", () => {
    process.env.CACHE_TTL = "7200";
    process.env.CACHE_MAX_ITEMS = "5000";
    process.env.CACHE_COMPRESSION = "true";

    const config = cacheConfig();

    expect(config).toEqual({
      ttl: 7200,
      maxItems: 5000,
      compression: true,
    });
  });

  it("should use default values when not specified", () => {
    delete process.env.CACHE_TTL;
    delete process.env.CACHE_MAX_ITEMS;
    delete process.env.CACHE_COMPRESSION;

    const config = cacheConfig();

    expect(config).toEqual({
      ttl: 3600,
      maxItems: 1000,
      compression: false,
    });
  });

  it("should handle compression as boolean", () => {
    process.env.CACHE_COMPRESSION = "false";
    const config1 = cacheConfig();
    expect(config1.compression).toBe(false);

    process.env.CACHE_COMPRESSION = "true";
    const config2 = cacheConfig();
    expect(config2.compression).toBe(true);

    process.env.CACHE_COMPRESSION = "yes";
    const config3 = cacheConfig();
    expect(config3.compression).toBe(false);
  });
});
