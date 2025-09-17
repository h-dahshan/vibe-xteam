import { describe, it, expect } from "vitest";
import { envSchema } from "./env.schema";
import { testData } from "../__fixtures__";

describe("EnvSchema", () => {
  describe("Complete valid configuration", () => {
    it("should validate a complete configuration with all required fields", () => {
      const config = testData.complete();
      const result = envSchema.safeParse(config);

      if (!result.success) {
        console.log(
          "Validation errors:",
          JSON.stringify(result.error.issues, null, 2)
        );
      }
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe("development");
        expect(result.data.JWT_EXPIRES_IN).toBe(3600);
        expect(result.data.REDIS_DB).toBe(0);
        expect(result.data.LOCALES_SUPPORTED).toEqual(["en", "ar"]);
      }
    });

    it("should validate S3 storage configuration", () => {
      const config = testData.withS3();
      const result = envSchema.safeParse(config);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.SUPABASE_S3_BUCKET).toBe("test-bucket");
        expect(result.data.SUPABASE_S3_REGION).toBe("us-east-1");
      }
    });

    it("should validate production configuration", () => {
      const config = testData.production();
      const result = envSchema.safeParse(config);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe("production");
        expect(result.data.APP_URL).toBe("https://api.example.com");
        expect(result.data.LOG_LEVEL).toBe("warn");
      }
    });
  });

  describe("Optional configurations with defaults", () => {
    it("should apply defaults for all optional configs", () => {
      const config = testData.minimal();
      const result = envSchema.safeParse(config);

      if (!result.success) {
        console.log("Validation failed:", result.error.issues[0]);
      }
      expect(result.success).toBe(true);
      if (result.success) {
        // Check defaults are applied
        expect(result.data.CACHE_TTL).toBe(3600);
        expect(result.data.CACHE_MAX_ITEMS).toBe(1000);
        expect(result.data.CACHE_COMPRESSION).toBe(true);
        expect(result.data.QUEUE_CONCURRENCY).toBe(5);
        expect(result.data.QUEUE_MAX_RETRIES).toBe(3);
        expect(result.data.QUEUE_DELAY_RETRY).toBe(30); // Updated default
        expect(result.data.CIRCUIT_BREAKER_TIMEOUT).toBe(10);
        expect(result.data.HEALTH_CHECK_TIMEOUT).toBe(5);
        expect(result.data.HEALTH_CHECK_DATABASE).toBe(true);
        expect(result.data.DEFAULT_TIMEZONE).toBe("UTC");
        expect(result.data.BUSINESS_TIMEZONE).toBe("America/New_York");
        expect(result.data.LOG_LEVEL).toBe("info");
        expect(result.data.WEBSOCKET_PORT).toBe(3010); // Updated default

        // Debug: Log actual value if it doesn't match
        if (result.data.WEBSOCKET_PORT !== 3010) {
          console.log(
            "WEBSOCKET_PORT actual value:",
            result.data.WEBSOCKET_PORT
          );
        }
      }
    });

    it("should handle custom overrides with defaults", () => {
      const config = testData.custom({
        ...testData.minimal(),
        CACHE_TTL: "7200",
        QUEUE_CONCURRENCY: "10",
      });
      const result = envSchema.safeParse(config);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.CACHE_TTL).toBe(7200);
        expect(result.data.QUEUE_CONCURRENCY).toBe(10);
        // Other defaults should still apply
        expect(result.data.CACHE_MAX_ITEMS).toBe(1000);
      }
    });
  });

  describe("Validation errors", () => {
    it("should fail when storage has neither local nor S3 config", () => {
      const config = testData.missingStorage();
      const result = envSchema.safeParse(config);

      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.issues;
        expect(errors).toBeDefined();
        expect(errors.length).toBeGreaterThan(0);
      }
    });

    it("should fail for invalid email format", () => {
      const config = testData.invalidEmail();
      const result = envSchema.safeParse(config);

      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map((issue) => issue.message);
        expect(errorMessages.some((msg) => msg.includes("email"))).toBe(true);
      }
    });

    it("should fail for invalid Twilio phone number format", () => {
      const config = testData.invalidPhone();
      const result = envSchema.safeParse(config);

      expect(result.success).toBe(false);
    });

    it("should fail for Redis DB out of range", () => {
      const config = testData.redisDbOutOfRange();
      const result = envSchema.safeParse(config);

      expect(result.success).toBe(false);
    });

    it("should fail for short JWT secret", () => {
      const config = testData.shortJwtSecret();
      const result = envSchema.safeParse(config);

      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map((issue) => issue.message);
        expect(errorMessages.some((msg) => msg.includes("32 characters"))).toBe(
          true
        );
      }
    });

    it("should fail for invalid URL format", () => {
      const config = testData.invalidUrl();
      const result = envSchema.safeParse(config);

      expect(result.success).toBe(false);
    });

    it("should fail for invalid app version format", () => {
      const config = testData.invalidAppVersion();
      const result = envSchema.safeParse(config);

      expect(result.success).toBe(false);
    });

    it("should fail when required fields are missing", () => {
      const config = testData.noJwtSecret();
      const result = envSchema.safeParse(config);

      expect(result.success).toBe(false);
    });
  });

  describe("Type transformations", () => {
    it("should correctly transform string numbers to numbers", () => {
      const config = testData.custom({
        ...testData.minimal(),
        JWT_EXPIRES_IN: "7200",
        JWT_REFRESH_EXPIRES_IN: "1209600",
        BCRYPT_SALT_ROUNDS: "14",
        REDIS_DB: "5",
        RATE_LIMIT_TTL: "120",
      });
      const result = envSchema.safeParse(config);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.JWT_EXPIRES_IN).toBe("number");
        expect(result.data.JWT_EXPIRES_IN).toBe(7200);
        expect(typeof result.data.JWT_REFRESH_EXPIRES_IN).toBe("number");
        expect(result.data.JWT_REFRESH_EXPIRES_IN).toBe(1209600);
        expect(typeof result.data.BCRYPT_SALT_ROUNDS).toBe("number");
        expect(result.data.BCRYPT_SALT_ROUNDS).toBe(14);
        expect(typeof result.data.REDIS_DB).toBe("number");
        expect(result.data.REDIS_DB).toBe(5);
        expect(typeof result.data.RATE_LIMIT_TTL).toBe("number");
        expect(result.data.RATE_LIMIT_TTL).toBe(120);
      }
    });

    it("should correctly transform string booleans to booleans", () => {
      const config = testData.customComplete({
        CACHE_COMPRESSION: "false",
        HEALTH_CHECK_DATABASE: "true",
        HEALTH_CHECK_REDIS: "false",
      });
      const result = envSchema.safeParse(config);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.CACHE_COMPRESSION).toBe("boolean");
        expect(result.data.CACHE_COMPRESSION).toBe(false);
        expect(typeof result.data.HEALTH_CHECK_DATABASE).toBe("boolean");
        expect(result.data.HEALTH_CHECK_DATABASE).toBe(true);
        expect(typeof result.data.HEALTH_CHECK_REDIS).toBe("boolean");
        expect(result.data.HEALTH_CHECK_REDIS).toBe(false);
      }
    });

    it("should correctly transform comma-separated strings to arrays", () => {
      const config = testData.custom({
        ...testData.minimal(),
        LOCALES_SUPPORTED: "en,ar,fr",
        LOG_REDACT_PATTERNS: "password,token,secret,key",
        ALLOWED_FILE_TYPES: "jpg,png,gif,pdf",
      });
      const result = envSchema.safeParse(config);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.LOCALES_SUPPORTED).toEqual(["en", "ar", "fr"]);
        expect(result.data.LOG_REDACT_PATTERNS).toEqual([
          "password",
          "token",
          "secret",
          "key",
        ]);
        expect(result.data.ALLOWED_FILE_TYPES).toEqual([
          "jpg",
          "png",
          "gif",
          "pdf",
        ]);
      }
    });
  });

  describe("Environment-specific configurations", () => {
    it("should validate production configuration", () => {
      const config = testData.production();
      const result = envSchema.safeParse(config);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe("production");
        expect(result.data.APP_URL).toBe("https://api.example.com");
        expect(result.data.LOG_LEVEL).toBe("warn");
        expect(result.data.LOG_TRANSPORT).toBe("otlp");
      }
    });

    it("should validate development configuration", () => {
      const config = testData.development();
      const result = envSchema.safeParse(config);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe("development");
        expect(result.data.LOG_LEVEL).toBe("debug");
      }
    });
  });
});
