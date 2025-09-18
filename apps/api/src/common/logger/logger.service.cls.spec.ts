import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "../config";
import { ClsService } from "nestjs-cls";
import { LoggerService } from "./logger.service";
import { LOG_METADATA_KEYS } from "./constants/logger.constants";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

describe("LoggerService with CLS", () => {
  let service: LoggerService;

  // Mock ConfigService
  const createMockConfigService = () => ({
    getApp: vi.fn().mockReturnValue({
      nodeEnv: "development",
      name: "test-app",
      version: "1.0.0",
      url: "http://localhost:3000",
    }),
    getObservability: vi.fn().mockReturnValue({
      logServiceName: "test-logger",
      logLevel: "info",
      logTransport: "stdout",
      logFormat: "otel-json",
      logRedactPatterns: ["password", "token", "secret"],
      logMaxMessageLength: 10000,
    }),
    isDevelopment: false,
    isProduction: true,
    isStaging: false,
    isTest: false,
  });

  // Mock CLS Service
  const createMockClsService = () => ({
    get: vi.fn((key: string) => {
      if (key === LOG_METADATA_KEYS.CORRELATION_ID) {
        return "test-correlation-id";
      }
      if (key === LOG_METADATA_KEYS.USER_ID) {
        return "user-123";
      }
      return undefined;
    }),
    set: vi.fn(),
  });

  beforeEach(async () => {
    const mockConfigService = createMockConfigService();
    const mockClsService = createMockClsService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: ClsService,
          useValue: mockClsService,
        },
      ],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("CLS context integration", () => {
    it("should include CLS context in logs when available", () => {
      const winston = (service as any).winston;
      const logSpy = vi.spyOn(winston, "log");

      service.log("Test message with CLS");

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "info",
          message: "Test message with CLS",
          correlationId: "test-correlation-id",
          userId: "user-123",
        })
      );
    });

    it("should merge CLS context with user metadata", () => {
      const winston = (service as any).winston;
      const logSpy = vi.spyOn(winston, "log");

      service.log("Test message", { customField: "custom-value" });

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "info",
          message: "Test message",
          correlationId: "test-correlation-id",
          userId: "user-123",
          customField: "custom-value",
        })
      );
    });

    it("should allow user metadata to override CLS context", () => {
      const winston = (service as any).winston;
      const logSpy = vi.spyOn(winston, "log");

      service.log("Test message", { userId: "override-user" });

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "info",
          message: "Test message",
          correlationId: "test-correlation-id",
          userId: "override-user", // User metadata overrides CLS
        })
      );
    });

    it("should work without CLS service", async () => {
      // Create logger without CLS
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

      const loggerWithoutCls = module.get<LoggerService>(LoggerService);
      const winston = (loggerWithoutCls as any).winston;
      const logSpy = vi.spyOn(winston, "log");

      loggerWithoutCls.log("Test without CLS");

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "info",
          message: "Test without CLS",
          // No CLS context fields
        })
      );

      expect(logSpy).toHaveBeenCalledWith(
        expect.not.objectContaining({
          correlationId: expect.anything(),
          userId: expect.anything(),
        })
      );
    });
  });
});
