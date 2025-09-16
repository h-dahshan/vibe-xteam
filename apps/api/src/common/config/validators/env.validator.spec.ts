import { describe, it, expect, beforeEach, vi } from "vitest";
import { validateEnv } from "./env.validator";
import { testData } from "../__fixtures__";

describe("validateEnv", () => {
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  describe("Required configurations", () => {
    it("should validate a complete valid configuration", () => {
      const validConfig = testData.complete();

      const result = validateEnv(validConfig);

      expect(result).toBeDefined();
      expect(result.NODE_ENV).toBe("development");
      expect(result.APP_NAME).toBe("test-app");
      expect(result.JWT_EXPIRES_IN).toBe(3600); // Transformed to number
      expect(result.BCRYPT_SALT_ROUNDS).toBe(10); // Transformed to number
    });

    it("should fail when required APP_NAME is missing", () => {
      const invalidConfig = testData.missingRequiredApp();

      expect(() => validateEnv(invalidConfig)).toThrow(
        "Application startup failed due to configuration errors"
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should fail when JWT_SECRET is too short", () => {
      const invalidConfig = testData.shortJwtSecret();

      expect(() => validateEnv(invalidConfig)).toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("JWT_SECRET")
      );
    });

    it("should fail when JWT_SECRET is missing", () => {
      const invalidConfig = testData.noJwtSecret();

      expect(() => validateEnv(invalidConfig)).toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should fail when database URL is not a PostgreSQL URL", () => {
      const invalidConfig = testData.custom({
        ...testData.complete(),
        SUPABASE_DATABASE_URL: "mysql://user:pass@localhost:3306/mydb", // Wrong protocol
      });

      expect(() => validateEnv(invalidConfig)).toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("SUPABASE_DATABASE_URL")
      );
    });
  });

  describe("Optional configurations", () => {
    it("should warn when optional configs are missing", () => {
      const configWithoutOptional = testData.minimal();
      // Minimal config doesn't have optional fields

      const result = validateEnv(configWithoutOptional);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("optional configurations are missing")
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("CACHE_TTL")
      );

      // Should use defaults
      expect(result.CACHE_TTL).toBe(3600);
      expect(result.CACHE_MAX_ITEMS).toBe(1000);
      expect(result.CACHE_COMPRESSION).toBe(true);
    });

    it("should use provided values for optional configs", () => {
      const configWithSomeOptional = testData.customComplete({
        // Cache configs provided
        CACHE_TTL: "7200",
        CACHE_MAX_ITEMS: "5000",
        CACHE_COMPRESSION: "false",
      });

      const result = validateEnv(configWithSomeOptional);

      expect(result).toBeDefined();

      // But should use provided values for cache configs
      expect(result.CACHE_TTL).toBe(7200);
      expect(result.CACHE_MAX_ITEMS).toBe(5000);
      expect(result.CACHE_COMPRESSION).toBe(false);
    });
  });

  describe("Type transformations", () => {
    it("should transform string numbers to actual numbers", () => {
      const config = testData.customComplete({
        JWT_EXPIRES_IN: "3600",
        BCRYPT_SALT_ROUNDS: "12",
        RATE_LIMIT_TTL: "120",
      });

      const result = validateEnv(config);

      expect(typeof result.JWT_EXPIRES_IN).toBe("number");
      expect(result.JWT_EXPIRES_IN).toBe(3600);
      expect(typeof result.BCRYPT_SALT_ROUNDS).toBe("number");
      expect(result.BCRYPT_SALT_ROUNDS).toBe(12);
      expect(typeof result.RATE_LIMIT_TTL).toBe("number");
      expect(result.RATE_LIMIT_TTL).toBe(120);
    });

    it("should transform comma-separated strings to arrays", () => {
      const config = testData.customComplete({
        LOCALES_SUPPORTED: "en, ar, fr", // With spaces
        LOG_REDACT_PATTERNS: "password, token, secret, key", // With spaces
      });

      const result = validateEnv(config);

      expect(Array.isArray(result.LOCALES_SUPPORTED)).toBe(true);
      expect(result.LOCALES_SUPPORTED).toEqual(["en", "ar", "fr"]);
      expect(Array.isArray(result.LOG_REDACT_PATTERNS)).toBe(true);
      expect(result.LOG_REDACT_PATTERNS).toEqual([
        "password",
        "token",
        "secret",
        "key",
      ]);
    });

    it("should transform string booleans to actual booleans", () => {
      const config = testData.customComplete({
        CACHE_COMPRESSION: "true",
        HEALTH_CHECK_DATABASE: "false",
      });

      const result = validateEnv(config);

      expect(typeof result.CACHE_COMPRESSION).toBe("boolean");
      expect(result.CACHE_COMPRESSION).toBe(true);
      expect(typeof result.HEALTH_CHECK_DATABASE).toBe("boolean");
      expect(result.HEALTH_CHECK_DATABASE).toBe(false);
    });
  });

  describe("Validation errors", () => {
    it("should fail for invalid email", () => {
      const invalidConfig = testData.invalidEmail();

      expect(() => validateEnv(invalidConfig)).toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("RESEND_FROM_EMAIL")
      );
    });

    it("should fail for invalid phone number", () => {
      const invalidConfig = testData.invalidPhone();

      expect(() => validateEnv(invalidConfig)).toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should fail for Redis DB out of range", () => {
      const invalidConfig = testData.redisDbOutOfRange();

      expect(() => validateEnv(invalidConfig)).toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should fail for missing storage configuration", () => {
      const invalidConfig = testData.missingStorage();

      expect(() => validateEnv(invalidConfig)).toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
