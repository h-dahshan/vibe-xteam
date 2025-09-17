import { describe, it, expect, beforeEach, afterEach } from "vitest";
import observabilityConfig from "./observability.config";

describe("ObservabilityConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load observability configuration from environment", () => {
    // Set all observability env vars
    process.env.LOG_SERVICE_NAME = "test-service";
    process.env.LOG_LEVEL = "debug";
    process.env.LOG_TRANSPORT = "both";
    process.env.LOG_FORMAT = "winston";
    process.env.LOG_REDACT_PATTERNS = "password,apikey,secret";
    process.env.LOG_MAX_MESSAGE_LENGTH = "5000";
    process.env.LOG_MEM_BUFFER_ENTRIES = "500";
    process.env.LOG_MEM_BUFFER_FLUSH_INTERVAL = "10";
    process.env.LOG_BUFFER_FILE_PATH = "./logs/test";
    process.env.LOG_BUFFER_FILE_MAX_SIZE = "5242880";
    process.env.LOG_BUFFER_FILE_DATE_PATTERN = "YYYY-MM-DD";
    process.env.LOG_BUFFER_MAX_FILES = "10";
    process.env.OTEL_SERVICE_NAME = "otel-test";
    process.env.OTEL_EXPORTER_OTLP_PROTOCOL = "grpc";
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "https://otlp.test.com";
    process.env.OTEL_EXPORTER_OTLP_TIMEOUT = "10";
    process.env.OTEL_EXPORTER_OTLP_HEADERS = "Authorization=Bearer test";
    process.env.SENTRY_DSN = "https://test@sentry.io/123";
    process.env.SENTRY_ENVIRONMENT = "test";

    const config = observabilityConfig();

    expect(config).toEqual({
      logServiceName: "test-service",
      logLevel: "debug",
      logTransport: "both",
      logFormat: "winston",
      logRedactPatterns: ["password", "apikey", "secret"],
      logMaxMessageLength: 5000,
      logMemBufferEntries: 500,
      logMemBufferFlushInterval: 10,
      logBufferFilePath: "./logs/test",
      logBufferFileMaxSize: 5242880,
      logBufferFileDatePattern: "YYYY-MM-DD",
      logBufferMaxFiles: 10,
      otelServiceName: "otel-test",
      otelExporterProtocol: "grpc",
      otelExporterEndpoint: "https://otlp.test.com",
      otelExporterTimeout: 10,
      otelExporterHeaders: "Authorization=Bearer test",
      sentryDsn: "https://test@sentry.io/123",
      sentryEnvironment: "test",
    });
  });

  it("should use default values only for optional fields", () => {
    // Set required fields
    process.env.LOG_SERVICE_NAME = "my-service";
    process.env.OTEL_SERVICE_NAME = "my-otel-service";
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "https://otlp.example.com";
    process.env.SENTRY_DSN = "https://xxx@sentry.io/xxx";
    process.env.SENTRY_ENVIRONMENT = "development";
    // Clear optional env vars
    delete process.env.LOG_LEVEL;
    delete process.env.LOG_TRANSPORT;
    delete process.env.LOG_FORMAT;
    delete process.env.LOG_REDACT_PATTERNS;
    delete process.env.LOG_MAX_MESSAGE_LENGTH;

    const config = observabilityConfig();

    expect(config.logServiceName).toBe("my-service");
    expect(config.logLevel).toBe("info"); // default for optional
    expect(config.logTransport).toBe("stdout"); // default for optional
    expect(config.logFormat).toBe("otel-json"); // default for optional
    expect(config.logRedactPatterns).toEqual([
      "password",
      "token",
      "secret",
      "key",
      "authorization",
    ]); // default for optional
    expect(config.logMaxMessageLength).toBe(10000); // default for optional
    expect(config.otelServiceName).toBe("my-otel-service");
    expect(config.otelExporterEndpoint).toBe("https://otlp.example.com");
    expect(config.sentryDsn).toBe("https://xxx@sentry.io/xxx");
    expect(config.sentryEnvironment).toBe("development");
  });

  it("should handle optional fields as undefined", () => {
    // Clear optional env vars
    delete process.env.LOG_MEM_BUFFER_ENTRIES;
    delete process.env.OTEL_EXPORTER_OTLP_PROTOCOL;
    delete process.env.SENTRY_DSN;

    const config = observabilityConfig();

    expect(config.logMemBufferEntries).toBeUndefined();
    expect(config.otelExporterProtocol).toBeUndefined();
    expect(config.sentryDsn).toBeUndefined();
  });
});
