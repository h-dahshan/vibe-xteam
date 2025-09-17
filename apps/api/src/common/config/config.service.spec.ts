import { describe, it, expect, beforeEach } from "vitest";
import { ConfigService } from "./config.service";
import { testData, toNestedConfig } from "./__fixtures__";

describe("ConfigService", () => {
  let configService: ConfigService;
  let mockConfigData: any;

  beforeEach(() => {
    // Use our test fixtures to generate config data
    mockConfigData = toNestedConfig(testData.complete());

    // Create ConfigService with the transformed data
    configService = new ConfigService(mockConfigData);
  });

  describe("Namespace getters", () => {
    it("should get app configuration", () => {
      const app = configService.getApp();
      expect(app).toBeDefined();
      expect(app.name).toBe("test-app");
      expect(app.nodeEnv).toBe("development");
      expect(app.localesSupported).toEqual(["en", "ar"]);
    });

    it("should get auth configuration", () => {
      const auth = configService.getAuth();
      expect(auth).toBeDefined();
      expect(auth.jwtSecret).toBe("x".repeat(32));
      expect(auth.jwtExpiresIn).toBe(3600);
      expect(auth.bcryptSaltRounds).toBe(10);
    });

    it("should get database configuration", () => {
      const db = configService.getDatabase();
      expect(db).toBeDefined();
      expect(db.url).toBe("postgresql://test:test@localhost:5432/test");
      expect(db.directUrl).toBe("postgresql://test:test@localhost:5432/test");
    });

    it("should get redis configuration", () => {
      const redis = configService.getRedis();
      expect(redis).toBeDefined();
      expect(redis.url).toBe("redis://localhost:6379");
      expect(redis.db).toBe(0);
      expect(redis.sessionDb).toBe(1);
      expect(redis.rateLimitDb).toBe(2);
      expect(redis.queueDb).toBe(3);
    });

    it("should get storage configuration", () => {
      const storage = configService.getStorage();
      expect(storage).toBeDefined();
      expect(storage.maxFileSize).toBe(10485760);
      expect(storage.allowedFileTypes).toEqual(["jpg", "png", "pdf"]);
      expect(storage.localStoragePath).toBe("./uploads");
    });

    it("should get communication configuration", () => {
      const comm = configService.getCommunication();
      expect(comm).toBeDefined();
      expect(comm.resend.apiKey).toBe("re_test_key_123456789");
      expect(comm.resend.fromEmail).toBe("test@example.com");
      expect(comm.twilio.accountSid).toBe("AC00000000000000000000000000000000");
    });

    it("should get websocket configuration", () => {
      const ws = configService.getWebSocket();
      expect(ws).toBeDefined();
      expect(ws.port).toBe(3010);
      expect(ws.corsOrigin).toBe("http://localhost:3000");
    });

    it("should get security configuration", () => {
      const security = configService.getSecurity();
      expect(security).toBeDefined();
      expect(security.corsOrigin).toBe("http://localhost:3000");
      expect(security.rateLimitTtl).toBe(60);
      expect(security.rateLimitMaxHits).toBe(100);
    });

    it("should get observability configuration", () => {
      const obs = configService.getObservability();
      expect(obs).toBeDefined();
      expect(obs.logServiceName).toBe("test-service");
      expect(obs.logLevel).toBe("info");
      expect(obs.logRedactPatterns).toEqual(["password", "token", "secret"]);
    });

    it("should get cache configuration", () => {
      const cache = configService.getCache();
      expect(cache).toBeDefined();
      expect(cache.ttl).toBe(3600);
      expect(cache.maxItems).toBe(1000);
      expect(cache.compression).toBe(true);
    });

    it("should get queue configuration", () => {
      const queue = configService.getQueue();
      expect(queue).toBeDefined();
      expect(queue.concurrency).toBe(5);
      expect(queue.maxRetries).toBe(3);
      expect(queue.delayRetry).toBe(30);
    });

    it("should get circuit breaker configuration", () => {
      const cb = configService.getCircuitBreaker();
      expect(cb).toBeDefined();
      expect(cb.timeout).toBe(10);
      expect(cb.errorThreshold).toBe(5);
      expect(cb.resetTimeout).toBe(60);
    });

    it("should get health configuration", () => {
      const health = configService.getHealth();
      expect(health).toBeDefined();
      expect(health.timeout).toBe(5);
      expect(health.checkDatabase).toBe(true);
      expect(health.checkRedis).toBe(true);
      expect(health.checkExternalServices).toBe(true);
    });

    it("should get business configuration", () => {
      const business = configService.getBusiness();
      expect(business).toBeDefined();
      expect(business.defaultTimezone).toBe("UTC");
      expect(business.businessTimezone).toBe("America/New_York");
    });
  });

  describe("Environment helpers", () => {
    it("should detect test environment", () => {
      expect(configService.isDevelopment).toBe(true);
      expect(configService.isProduction).toBe(false);
      expect(configService.isStaging).toBe(false);
    });

    it("should return current environment", () => {
      expect(configService.environment).toBe("development");
    });

    it("should detect production environment", () => {
      const prodConfig = toNestedConfig(testData.production());
      const prodService = new ConfigService(prodConfig);

      expect(prodService.isProduction).toBe(true);
      expect(prodService.isDevelopment).toBe(false);
      expect(prodService.isTest).toBe(false);
      expect(prodService.isStaging).toBe(false);
    });

    it("should detect development environment", () => {
      const devConfig = toNestedConfig(testData.development());
      const devService = new ConfigService(devConfig);

      expect(devService.isDevelopment).toBe(true);
      expect(devService.isProduction).toBe(false);
      expect(devService.isTest).toBe(false);
      expect(devService.isStaging).toBe(false);
    });

    it("should detect staging environment", () => {
      const stagingData = testData.custom({
        ...testData.minimal(),
        NODE_ENV: "staging",
      });
      const stagingConfig = toNestedConfig(stagingData);
      const stagingService = new ConfigService(stagingConfig);

      expect(stagingService.isStaging).toBe(true);
      expect(stagingService.isProduction).toBe(false);
      expect(stagingService.isDevelopment).toBe(false);
      expect(stagingService.isTest).toBe(false);
    });
  });

  describe("Configuration with minimal setup", () => {
    it("should work with minimal required configuration", () => {
      const minimalConfig = toNestedConfig(testData.minimal());
      const minimalService = new ConfigService(minimalConfig);

      const app = minimalService.getApp();
      expect(app).toBeDefined();
      expect(app.name).toBe("test-app");
      expect(app.nodeEnv).toBe("development");
    });
  });

  describe("Configuration with S3 storage", () => {
    it("should handle S3 storage configuration", () => {
      const s3Config = toNestedConfig(testData.withS3());
      const s3Service = new ConfigService(s3Config);

      const storage = s3Service.getStorage();
      expect(storage).toBeDefined();
      expect(storage.s3Bucket).toBe("test-bucket");
      expect(storage.s3Region).toBe("us-east-1");
      expect(storage.localStoragePath).toBe("./uploads"); // Now has default value
    });
  });

  describe("Configuration with custom values", () => {
    it("should handle custom configuration values", () => {
      const customData = testData.customComplete({
        APP_NAME: "custom-app",
        JWT_EXPIRES_IN: "7200",
        CACHE_TTL: "1800",
      });
      const customConfig = toNestedConfig(customData);
      const customService = new ConfigService(customConfig);

      expect(customService.getApp().name).toBe("custom-app");
      expect(customService.getAuth().jwtExpiresIn).toBe(7200);
      expect(customService.getCache().ttl).toBe(1800);
    });
  });
});
