import { Test, TestingModule } from "@nestjs/testing";
import { LoggerModule } from "./logger.module";
import { LoggerService } from "./logger.service";
import { ConfigService } from "../config";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { GLOBAL_MODULE_METADATA } from "@nestjs/common/constants";

describe("LoggerModule", () => {
  let module: TestingModule;

  // Mock ConfigService to avoid environment validation
  const mockConfigService = {
    getApp: vi.fn().mockReturnValue({
      nodeEnv: "development",
      name: "test-app",
      version: "1.0.0",
      url: "http://localhost:3000",
    }),
    getObservability: vi.fn().mockReturnValue({
      logServiceName: "test-logger",
      logLevel: "error",
      logTransport: "stdout",
      logFormat: "otel-json",
      logRedactPatterns: ["password", "token"],
      logMaxMessageLength: 10000,
    }),
    isDevelopment: true,
    isProduction: false,
    isStaging: false,
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();
  });

  it("should be defined", () => {
    expect(module).toBeDefined();
  });

  it("should provide LoggerService", () => {
    const loggerService = module.get<LoggerService>(LoggerService);
    expect(loggerService).toBeDefined();
    expect(loggerService).toBeInstanceOf(LoggerService);
  });

  it("should export LoggerService", () => {
    const exports = Reflect.getMetadata("exports", LoggerModule);
    expect(exports).toContain(LoggerService);
  });

  it("should be a global module", () => {
    const isGlobal = Reflect.getMetadata(GLOBAL_MODULE_METADATA, LoggerModule);
    expect(isGlobal).toBe(true);
  });

  it("should have LoggerService as a provider", () => {
    const providers = Reflect.getMetadata("providers", LoggerModule);
    expect(providers).toContain(LoggerService);
  });

  it("should use ConfigService for configuration", () => {
    const loggerService = module.get<LoggerService>(LoggerService);
    expect(loggerService).toBeDefined();
    // Creating logger should call config methods
    expect(mockConfigService.getApp).toHaveBeenCalled();
    expect(mockConfigService.getObservability).toHaveBeenCalled();
  });
});
