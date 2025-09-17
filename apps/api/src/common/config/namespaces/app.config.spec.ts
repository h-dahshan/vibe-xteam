import { describe, it, expect, beforeEach, afterEach } from "vitest";
import appConfig from "./app.config";

describe("AppConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it("should load app configuration from environment", () => {
    // Set test environment variables
    process.env.NODE_ENV = "production";
    process.env.APP_NAME = "test-app";
    process.env.APP_VERSION = "2.0.0";
    process.env.APP_URL = "https://example.com";
    process.env.API_PREFIX = "api";
    process.env.API_VERSION = "v2";
    process.env.LOCALES_SUPPORTED = "en, ar, fr";
    process.env.LOCALES_DEFAULT = "ar";
    process.env.LOCALES_FALLBACK = "en";

    const config = appConfig();

    expect(config).toEqual({
      nodeEnv: "production",
      name: "test-app",
      version: "2.0.0",
      url: "https://example.com",
      apiPrefix: "api",
      apiVersion: "v2",
      localesSupported: ["en", "ar", "fr"],
      localesDefault: "ar",
      localesFallback: "en",
    });
  });

  it("should use default values only for optional fields", () => {
    // Set required environment variables
    process.env.NODE_ENV = "test";
    process.env.APP_NAME = "test-app";
    process.env.APP_VERSION = "1.0.0";
    process.env.APP_URL = "http://localhost:3000";
    process.env.API_PREFIX = "api";
    process.env.API_VERSION = "v1";
    // Clear optional environment variables
    delete process.env.LOCALES_SUPPORTED;
    delete process.env.LOCALES_DEFAULT;
    delete process.env.LOCALES_FALLBACK;

    const config = appConfig();

    expect(config).toEqual({
      nodeEnv: "test",
      name: "test-app",
      version: "1.0.0",
      url: "http://localhost:3000",
      apiPrefix: "api",
      apiVersion: "v1",
      localesSupported: ["en"], // default for optional
      localesDefault: "en", // default for optional
      localesFallback: "en", // default for optional
    });
  });

  it("should correctly parse comma-separated locales", () => {
    process.env.LOCALES_SUPPORTED = "en,ar,fr,es";

    const config = appConfig();

    expect(config.localesSupported).toEqual(["en", "ar", "fr", "es"]);
  });

  it("should handle locales with spaces", () => {
    process.env.LOCALES_SUPPORTED = " en , ar , fr ";

    const config = appConfig();

    expect(config.localesSupported).toEqual(["en", "ar", "fr"]);
  });
});
