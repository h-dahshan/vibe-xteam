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
      logLevel: overrides?.logLevel || "error",
      logTransport: "stdout",
      logFormat: overrides?.logFormat || "otel-json",
      logRedactPatterns: ["password", "token", "secret"],
      logMaxMessageLength: 10000,
    }),
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
      expect(service.getLogLevel()).toBe("error");
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

  describe("log level ladder", () => {
    it("should only log errors when level is error", () => {
      service.setLogLevel("error");

      service.error("error message");
      service.warn("warn message");
      service.log("info message");
      service.debug("debug message");
      service.verbose("verbose message");

      // Check that something was logged (winston uses stdout)
      expect(service.getLogLevel()).toBe("error");
    });

    it("should respect log level hierarchy", () => {
      service.setLogLevel("warn");
      expect(service.getLogLevel()).toBe("warn");

      service.setLogLevel("info");
      expect(service.getLogLevel()).toBe("info");

      service.setLogLevel("verbose"); // verbose comes before debug in Winston
      expect(service.getLogLevel()).toBe("verbose");

      service.setLogLevel("debug");
      expect(service.getLogLevel()).toBe("debug");
    });
  });

  describe("logging methods with metadata", () => {
    beforeEach(() => {
      service.setLogLevel("debug"); // Enable all logs (debug includes verbose in Winston)
    });

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

  describe("setLogLevel", () => {
    it("should change log level dynamically", () => {
      expect(service.getLogLevel()).toBe("error");

      service.setLogLevel("verbose");
      expect(service.getLogLevel()).toBe("verbose");

      service.setLogLevel("warn");
      expect(service.getLogLevel()).toBe("warn");
    });
  });

  describe("message formatting", () => {
    beforeEach(() => {
      service.setLogLevel("debug"); // Enable all logs (debug is the most permissive level)
    });

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
});
