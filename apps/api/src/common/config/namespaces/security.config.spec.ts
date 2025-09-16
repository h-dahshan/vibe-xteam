import { describe, it, expect, beforeEach, afterEach } from "vitest";
import securityConfig from "./security.config";

describe("SecurityConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load security configuration from environment", () => {
    process.env.CORS_ORIGIN = "https://app.example.com";
    process.env.RATE_LIMIT_TTL = "120";
    process.env.RATE_LIMIT_MAX_HITS = "200";
    process.env.RATE_LIMIT_MAX_HITS_PER_IP = "20";

    const config = securityConfig();

    expect(config).toEqual({
      corsOrigin: "https://app.example.com",
      rateLimitTtl: 120,
      rateLimitMaxHits: 200,
      rateLimitMaxHitsPerIp: 20,
    });
  });

  it("should use default values only for optional fields", () => {
    // Set required field
    process.env.CORS_ORIGIN = "http://localhost:3001";
    // Clear optional fields
    delete process.env.RATE_LIMIT_TTL;
    delete process.env.RATE_LIMIT_MAX_HITS;
    delete process.env.RATE_LIMIT_MAX_HITS_PER_IP;

    const config = securityConfig();

    expect(config).toEqual({
      corsOrigin: "http://localhost:3001",
      rateLimitTtl: 60, // default for optional
      rateLimitMaxHits: 100, // default for optional
      rateLimitMaxHitsPerIp: 10, // default for optional
    });
  });

  it("should correctly parse numbers", () => {
    process.env.RATE_LIMIT_TTL = "30";
    process.env.RATE_LIMIT_MAX_HITS = "50";
    process.env.RATE_LIMIT_MAX_HITS_PER_IP = "5";

    const config = securityConfig();

    expect(typeof config.rateLimitTtl).toBe("number");
    expect(typeof config.rateLimitMaxHits).toBe("number");
    expect(typeof config.rateLimitMaxHitsPerIp).toBe("number");
  });
});
