import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import {
  beforeEach,
  afterEach,
  describe,
  it,
  expect,
  vi,
  beforeAll,
} from "vitest";
import { testData, toProcessEnv, createEnvSnapshot } from "./__fixtures__";
import { GLOBAL_MODULE_METADATA } from "@nestjs/common/constants";

describe("ConfigModule Integration", () => {
  let ConfigModule: any;
  let ConfigService: any;
  let module: TestingModule;
  let app: INestApplication;
  let configService: any;
  let envSnapshot: any;

  // Mock console methods
  beforeAll(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  beforeAll(async () => {
    // Save current environment and set up test environment
    envSnapshot = createEnvSnapshot();
    const testEnv = toProcessEnv(testData.complete());
    testEnv.setup();

    // Dynamic import
    const configModules = await import("./config.module");
    const configServices = await import("./config.service");

    ConfigModule = configModules.ConfigModule;
    ConfigService = configServices.ConfigService;
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    const testEnv = toProcessEnv(testData.complete());
    testEnv.clear();
    testEnv.setup();

    module = await Test.createTestingModule({
      imports: [ConfigModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    configService = module.get(ConfigService);
  });

  afterEach(async () => {
    await app?.close();
    await module?.close();
    const testEnv = toProcessEnv(testData.complete());
    testEnv.clear();
  });

  afterAll(() => {
    // Restore original environment
    envSnapshot.restore();
  });

  describe("Module Setup", () => {
    it("should create module and provide ConfigService", () => {
      expect(module).toBeDefined();
      expect(configService).toBeDefined();
      expect(configService).toBeInstanceOf(ConfigService);
    });

    it("should be marked as global module", () => {
      // Check for @Global decorator
      const isGlobal = Reflect.getMetadata(
        GLOBAL_MODULE_METADATA,
        ConfigModule
      );
      expect(isGlobal).toBe(true);
    });
  });

  describe("Configuration Loading", () => {
    it("should load all namespace configurations", () => {
      expect(configService.getApp()).toBeDefined();
      expect(configService.getAuth()).toBeDefined();
      expect(configService.getDatabase()).toBeDefined();
      expect(configService.getRedis()).toBeDefined();
      expect(configService.getStorage()).toBeDefined();
      expect(configService.getCommunication()).toBeDefined();
      expect(configService.getWebSocket()).toBeDefined();
      expect(configService.getSecurity()).toBeDefined();
      expect(configService.getObservability()).toBeDefined();
      expect(configService.getCache()).toBeDefined();
      expect(configService.getQueue()).toBeDefined();
      expect(configService.getCircuitBreaker()).toBeDefined();
      expect(configService.getHealth()).toBeDefined();
      expect(configService.getBusiness()).toBeDefined();
    });

    it("should transform and validate configuration values", () => {
      const authConfig = configService.getAuth();
      expect(typeof authConfig.jwtExpiresIn).toBe("number");
      expect(authConfig.jwtExpiresIn).toBe(3600);
      expect(typeof authConfig.bcryptSaltRounds).toBe("number");
      expect(authConfig.bcryptSaltRounds).toBe(10);

      const appConfig = configService.getApp();
      expect(Array.isArray(appConfig.localesSupported)).toBe(true);
      expect(appConfig.localesSupported).toEqual(["en", "ar"]);
    });

    it("should provide typed namespace access", () => {
      const authConfig = configService.get("auth");
      expect(authConfig).toBeDefined();
      expect(authConfig.jwtSecret).toBe("x".repeat(32));

      const appConfig = configService.getApp();
      expect(appConfig.name).toBe("test-app");

      const dbConfig = configService.getDatabase();
      expect(dbConfig.url).toContain("postgresql://");
    });
  });

  describe("Environment Detection", () => {
    it("should correctly detect environment", () => {
      expect(configService.isDevelopment).toBe(true);
      expect(configService.isProduction).toBe(false);
      expect(configService.isStaging).toBe(false);
      expect(configService.environment).toBe("development");
    });
  });

  describe("Caching", () => {
    it("should cache configuration values", () => {
      const config1 = configService.getApp();
      const config2 = configService.getApp();
      expect(config1).toBe(config2);
    });
  });

  describe("Integration", () => {
    it("should work with other NestJS services", async () => {
      // Define a test service
      const TestServiceToken = Symbol("TestService");

      class TestService {
        constructor(private readonly config: any) {}

        getAppInfo() {
          const appConfig = this.config.getApp();
          return {
            name: appConfig.name,
            version: appConfig.version,
            env: this.config.environment,
          };
        }
      }

      // Create module with test service
      const testModule = await Test.createTestingModule({
        imports: [ConfigModule],
        providers: [
          {
            provide: TestServiceToken,
            useFactory: (configService: any) => new TestService(configService),
            inject: [ConfigService],
          },
        ],
      }).compile();

      const testService = testModule.get(TestServiceToken) as TestService;
      const appInfo = testService.getAppInfo();

      expect(appInfo.name).toBe("test-app");
      expect(appInfo.version).toBe("1.0.0");
      expect(appInfo.env).toBe("development");

      await testModule.close();
    });
  });
});
