import { Module, Global } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { ConfigService } from "./config.service";
import { validateEnv } from "./validators/env.validator";

// Import all namespace configs
import appConfig from "./namespaces/app.config";
import authConfig from "./namespaces/auth.config";
import databaseConfig from "./namespaces/database.config";
import redisConfig from "./namespaces/redis.config";
import storageConfig from "./namespaces/storage.config";
import communicationConfig from "./namespaces/communication.config";
import websocketConfig from "./namespaces/websocket.config";
import securityConfig from "./namespaces/security.config";
import observabilityConfig from "./namespaces/observability.config";
import cacheConfig from "./namespaces/cache.config";
import queueConfig from "./namespaces/queue.config";
import circuitBreakerConfig from "./namespaces/circuit-breaker.config";
import healthConfig from "./namespaces/health.config";
import businessConfig from "./namespaces/business.config";

/**
 * Global configuration module
 * Provides centralized configuration management with validation
 */
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: false, // We make our wrapper global instead
      cache: true, // Enable caching for performance
      expandVariables: true, // Allow ${VAR} syntax in .env
      envFilePath: [".env.local", ".env"],
      load: [
        appConfig,
        authConfig,
        databaseConfig,
        redisConfig,
        storageConfig,
        communicationConfig,
        websocketConfig,
        securityConfig,
        observabilityConfig,
        cacheConfig,
        queueConfig,
        circuitBreakerConfig,
        healthConfig,
        businessConfig,
      ],
      validate: validateEnv, // Zod validation
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
