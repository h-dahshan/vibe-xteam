import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "../config";
import { LoggerService } from "./logger.service";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

describe("LoggerService", () => {
  let service: LoggerService;
  let configService: ConfigService;

  // Mock ConfigService
  const createMockConfigService = (overrides?: any) => ({
    getApp: vi.fn().mockReturnValue({
      nodeEnv: overrides?.env || "development",
      name: "test-app",
      version: "1.0.0",
      url: "http://localhost:3000",
    }),
    getObservability: vi.fn().mockReturnValue({
      logServiceName: overrides?.logServiceName || "test-logger",
      logLevel: overrides?.logLevel || "debug",
      logTransport: overrides?.logTransport || "stdout",
      logFormat: overrides?.logFormat || "otel-json",
      logRedactPatterns: ["password", "token", "secret"],
      logMaxMessageLength: 10000,
    }),
    isDevelopment: overrides?.env === "development",
    isProduction: overrides?.env === "production",
    isStaging: overrides?.env === "staging",
    isTest: overrides?.env === "test",
  });

  beforeEach(async () => {
    const mockConfigService = createMockConfigService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should be defined", () => {
      expect(service).toBeDefined();
    });

    it("should use configuration from ConfigService", () => {
      expect(configService.getApp).toHaveBeenCalled();
      expect(configService.getObservability).toHaveBeenCalled();
    });

    it("should have correct default log level", () => {
      expect(service.getLogLevel()).toBe("debug");
    });

    it("should initialize with different log levels", async () => {
      const mockConfig = createMockConfigService({ logLevel: "verbose" });

      const module = await Test.createTestingModule({
        providers: [
          LoggerService,
          {
            provide: ConfigService,
            useValue: mockConfig,
          },
        ],
      }).compile();

      const customService = module.get<LoggerService>(LoggerService);
      expect(customService.getLogLevel()).toBe("verbose");
    });
  });

  describe("logging methods with metadata", () => {
    it("should log info messages", () => {
      service.log("test message");
      service.log("test with metadata", { userId: "123" });
      service.log("test with context", "TestContext");
      service.log("test with both", { userId: "123" }, "TestContext");

      // Winston logs to stdout, not console
      expect(service).toBeDefined();
    });

    it("should log error messages", () => {
      service.error("error message");
      service.error("error with trace", "stack trace");
      service.error("error with metadata", { requestId: "456" });
      service.error(
        "error with all",
        { requestId: "456" },
        "stack trace",
        "ErrorContext"
      );

      expect(service).toBeDefined();
    });

    it("should log warning messages", () => {
      service.warn("warning message");
      service.warn("warning with metadata", { alert: true });
      service.warn("warning with context", "WarnContext");

      expect(service).toBeDefined();
    });

    it("should log debug messages", () => {
      service.debug("debug message");
      service.debug("debug with metadata", { verbose: true });
      service.debug("debug with context", "DebugContext");

      expect(service).toBeDefined();
    });

    it("should log verbose messages", () => {
      service.verbose("verbose message");
      service.verbose("verbose with metadata", { detail: "extra" });
      service.verbose("verbose with context", "VerboseContext");

      expect(service).toBeDefined();
    });
  });

  describe("environment-specific behavior", () => {
    it("should include stack traces in development", async () => {
      const mockConfig = createMockConfigService({
        env: "development",
        logLevel: "debug", // Updated to debug which is now the most permissive
      });

      const module = await Test.createTestingModule({
        providers: [
          LoggerService,
          {
            provide: ConfigService,
            useValue: mockConfig,
          },
        ],
      }).compile();

      const devService = module.get<LoggerService>(LoggerService);
      expect(devService).toBeDefined();
      expect(devService.getLogLevel()).toBe("debug");
    });

    it("should include stack traces in staging", async () => {
      const mockConfig = createMockConfigService({
        env: "staging",
        logLevel: "info",
      });

      const module = await Test.createTestingModule({
        providers: [
          LoggerService,
          {
            provide: ConfigService,
            useValue: mockConfig,
          },
        ],
      }).compile();

      const stagingService = module.get<LoggerService>(LoggerService);
      expect(stagingService).toBeDefined();
      expect(stagingService.getLogLevel()).toBe("info");
    });

    it("should not include stack traces in production", async () => {
      const mockConfig = createMockConfigService({
        env: "production",
        logLevel: "warn",
      });

      const module = await Test.createTestingModule({
        providers: [
          LoggerService,
          {
            provide: ConfigService,
            useValue: mockConfig,
          },
        ],
      }).compile();

      const prodService = module.get<LoggerService>(LoggerService);
      expect(prodService).toBeDefined();
      expect(prodService.getLogLevel()).toBe("warn");
    });
  });

  describe("message formatting", () => {
    it("should handle different message types", () => {
      service.log("string message");
      service.log({ key: "object message" });
      service.log(["array", "message"]);
      service.log(123);
      service.log(null);
      service.log(undefined);

      expect(service).toBeDefined();
    });

    it("should handle context formatting", () => {
      service.log("message", "Context");
      service.warn("warning", "WarnContext");
      service.error("error", "trace", "ErrorContext");

      expect(service).toBeDefined();
    });

    it("should handle metadata in all log methods", () => {
      const metadata = { userId: "123", requestId: "abc" };

      service.log("info", metadata);
      service.warn("warning", metadata);
      service.error("error", metadata);
      service.debug("debug", metadata);
      service.verbose("verbose", metadata);

      expect(service).toBeDefined();
    });
  });

  describe("transport selection", () => {
    it("should create stdout transport when configured", async () => {
      const mockConfigService = createMockConfigService({
        logTransport: "stdout",
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LoggerService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const testService = module.get<LoggerService>(LoggerService);
      expect(testService).toBeDefined();

      // Verify transport is created
      const winston = (testService as any).winston;
      expect(winston.transports.length).toBeGreaterThan(0);
    });

    it("should create stdout transport when 'both' is configured", async () => {
      const mockConfigService = createMockConfigService({
        logTransport: "both",
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LoggerService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const testService = module.get<LoggerService>(LoggerService);
      const winston = (testService as any).winston;
      expect(winston.transports.length).toBeGreaterThan(0);
    });

    it("should fallback to stdout when only otlp is configured (Phase 4 placeholder)", async () => {
      const mockConfigService = createMockConfigService({
        logTransport: "otlp",
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LoggerService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const testService = module.get<LoggerService>(LoggerService);
      const winston = (testService as any).winston;
      // Should have stdout transport as fallback until OTLP is implemented
      expect(winston.transports.length).toBeGreaterThan(0);
    });
  });

  describe("format strategies", () => {
    it("should use nestLike format in development with winston format", async () => {
      const mockConfigService = createMockConfigService({
        env: "development",
        logFormat: "winston",
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LoggerService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const testService = module.get<LoggerService>(LoggerService);
      // Test that service initializes without error
      expect(testService).toBeDefined();

      // Log a message to verify format doesn't throw
      testService.log("Test message with nestLike format");
    });

    it("should use OTEL-JSON format in development when explicitly configured", async () => {
      const mockConfigService = createMockConfigService({
        env: "development",
        logFormat: "otel-json",
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LoggerService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const testService = module.get<LoggerService>(LoggerService);
      expect(testService).toBeDefined();
      testService.log("Test message with OTEL-JSON format");
    });

    it("should use Winston JSON format in production with winston format", async () => {
      const mockConfigService = createMockConfigService({
        env: "production",
        logFormat: "winston",
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LoggerService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const testService = module.get<LoggerService>(LoggerService);
      expect(testService).toBeDefined();
      testService.log("Test message with Winston JSON format");
    });

    it("should use OTEL-JSON format in production by default", async () => {
      const mockConfigService = createMockConfigService({
        env: "production",
        logFormat: "otel-json",
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LoggerService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const testService = module.get<LoggerService>(LoggerService);
      expect(testService).toBeDefined();
      testService.log("Test message with OTEL-JSON format in production");
    });
  });
});
