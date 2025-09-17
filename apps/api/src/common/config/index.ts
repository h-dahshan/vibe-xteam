/**
 * Configuration module exports
 * Provides centralized access to configuration functionality
 */

export { ConfigModule } from "./config.module";
export { ConfigService } from "./config.service";

// Export configuration types
export type {
  AppConfig,
  AuthConfig,
  DatabaseConfig,
  RedisConfig,
  StorageConfig,
  CommunicationConfig,
  WebSocketConfig,
  SecurityConfig,
  ObservabilityConfig,
  CacheConfig,
  QueueConfig,
  CircuitBreakerConfig,
  HealthConfig,
  BusinessConfig,
  Config,
} from "./types/config.types";
