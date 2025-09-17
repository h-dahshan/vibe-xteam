import { describe, it, expect, beforeEach, afterEach } from "vitest";
import redisConfig from "./redis.config";

describe("RedisConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load Redis configuration from environment", () => {
    process.env.REDIS_URL = "redis://localhost:6380";
    process.env.REDIS_PASSWORD = "secret-password";
    process.env.REDIS_DB = "5";
    // REDIS_TTL removed - using CACHE_TTL instead
    process.env.REDIS_SESSION_DB = "2";
    process.env.REDIS_RATE_LIMIT_DB = "3";
    process.env.REDIS_QUEUE_DB = "4";

    const config = redisConfig();

    expect(config).toEqual({
      url: "redis://localhost:6380",
      password: "secret-password",
      db: 5,
      // ttl property removed from RedisConfig
      sessionDb: 2,
      rateLimitDb: 3,
      queueDb: 4,
    });
  });

  it("should use default values only for optional fields", () => {
    // Set required fields
    process.env.REDIS_URL = "redis://localhost:6379";
    process.env.REDIS_PASSWORD = "test-password";
    // Clear optional fields
    delete process.env.REDIS_DB;
    delete process.env.REDIS_SESSION_DB;
    delete process.env.REDIS_RATE_LIMIT_DB;
    delete process.env.REDIS_QUEUE_DB;

    const config = redisConfig();

    expect(config).toEqual({
      url: "redis://localhost:6379",
      password: "test-password",
      db: 0, // default for optional
      sessionDb: 1, // default for optional
      rateLimitDb: 2, // default for optional
      queueDb: 3, // default for optional
    });
  });

  it("should handle Redis URL with authentication", () => {
    process.env.REDIS_URL = "redis://user:password@redis.example.com:6379";

    const config = redisConfig();

    expect(config.url).toContain("user:password");
    expect(config.url).toContain("redis.example.com");
  });

  it("should correctly parse database numbers", () => {
    process.env.REDIS_DB = "15";
    process.env.REDIS_SESSION_DB = "14";
    process.env.REDIS_RATE_LIMIT_DB = "13";
    process.env.REDIS_QUEUE_DB = "12";

    const config = redisConfig();

    expect(config.db).toBe(15);
    expect(config.sessionDb).toBe(14);
    expect(config.rateLimitDb).toBe(13);
    expect(config.queueDb).toBe(12);
  });
});
