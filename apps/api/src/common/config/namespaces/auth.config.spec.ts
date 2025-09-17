import { describe, it, expect, beforeEach, afterEach } from "vitest";
import authConfig from "./auth.config";

describe("AuthConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load auth configuration from environment", () => {
    process.env.JWT_SECRET = "test-secret-key-minimum-32-characters";
    process.env.JWT_EXPIRES_IN = "7200";
    process.env.JWT_REFRESH_SECRET = "refresh-secret-key-minimum-32-chars";
    process.env.JWT_REFRESH_EXPIRES_IN = "1209600";
    process.env.BCRYPT_SALT_ROUNDS = "14";

    const config = authConfig();

    expect(config).toEqual({
      jwtSecret: "test-secret-key-minimum-32-characters",
      jwtExpiresIn: 7200,
      jwtRefreshSecret: "refresh-secret-key-minimum-32-chars",
      jwtRefreshExpiresIn: 1209600,
      bcryptSaltRounds: 14,
    });
  });

  it("should use default values for optional fields", () => {
    process.env.JWT_SECRET = "test-secret-key-minimum-32-characters";
    process.env.JWT_REFRESH_SECRET = "refresh-secret-key-minimum-32-chars";
    delete process.env.JWT_EXPIRES_IN;
    delete process.env.JWT_REFRESH_EXPIRES_IN;
    delete process.env.BCRYPT_SALT_ROUNDS;

    const config = authConfig();

    expect(config).toEqual({
      jwtSecret: "test-secret-key-minimum-32-characters",
      jwtExpiresIn: 3600,
      jwtRefreshSecret: "refresh-secret-key-minimum-32-chars",
      jwtRefreshExpiresIn: 604800,
      bcryptSaltRounds: 12,
    });
  });

  it("should correctly parse string numbers to integers", () => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_REFRESH_SECRET = "refresh-secret";
    process.env.JWT_EXPIRES_IN = "3600";
    process.env.JWT_REFRESH_EXPIRES_IN = "604800";
    process.env.BCRYPT_SALT_ROUNDS = "10";

    const config = authConfig();

    expect(typeof config.jwtExpiresIn).toBe("number");
    expect(config.jwtExpiresIn).toBe(3600);
    expect(typeof config.jwtRefreshExpiresIn).toBe("number");
    expect(config.jwtRefreshExpiresIn).toBe(604800);
    expect(typeof config.bcryptSaltRounds).toBe("number");
    expect(config.bcryptSaltRounds).toBe(10);
  });
});
