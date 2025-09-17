import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";
import type {
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
} from "./types/config.types";

/**
 * Extended ConfigService with typed namespace getters
 * Provides type-safe access to configuration namespaces
 */
@Injectable()
export class ConfigService extends NestConfigService {
  /**
   * Get app configuration
   */
  getApp(): AppConfig {
    return this.get<AppConfig>("app")!;
  }

  /**
   * Get authentication configuration
   */
  getAuth(): AuthConfig {
    return this.get<AuthConfig>("auth")!;
  }

  /**
   * Get database configuration
   */
  getDatabase(): DatabaseConfig {
    return this.get<DatabaseConfig>("database")!;
  }

  /**
   * Get Redis configuration
   */
  getRedis(): RedisConfig {
    return this.get<RedisConfig>("redis")!;
  }

  /**
   * Get storage configuration
   */
  getStorage(): StorageConfig {
    return this.get<StorageConfig>("storage")!;
  }

  /**
   * Get communication configuration
   */
  getCommunication(): CommunicationConfig {
    return this.get<CommunicationConfig>("communication")!;
  }

  /**
   * Get WebSocket configuration
   */
  getWebSocket(): WebSocketConfig {
    return this.get<WebSocketConfig>("websocket")!;
  }

  /**
   * Get security configuration
   */
  getSecurity(): SecurityConfig {
    return this.get<SecurityConfig>("security")!;
  }

  /**
   * Get observability configuration
   */
  getObservability(): ObservabilityConfig {
    return this.get<ObservabilityConfig>("observability")!;
  }

  /**
   * Get cache configuration
   */
  getCache(): CacheConfig {
    return this.get<CacheConfig>("cache")!;
  }

  /**
   * Get queue configuration
   */
  getQueue(): QueueConfig {
    return this.get<QueueConfig>("queue")!;
  }

  /**
   * Get circuit breaker configuration
   */
  getCircuitBreaker(): CircuitBreakerConfig {
    return this.get<CircuitBreakerConfig>("circuitBreaker")!;
  }

  /**
   * Get health check configuration
   */
  getHealth(): HealthConfig {
    return this.get<HealthConfig>("health")!;
  }

  /**
   * Get business configuration
   */
  getBusiness(): BusinessConfig {
    return this.get<BusinessConfig>("business")!;
  }

  /**
   * Check if running in production environment
   */
  get isProduction(): boolean {
    return this.getApp().nodeEnv === "production";
  }

  /**
   * Check if running in development environment
   */
  get isDevelopment(): boolean {
    return this.getApp().nodeEnv === "development";
  }

  /**
   * Check if running in staging environment
   */
  get isStaging(): boolean {
    return this.getApp().nodeEnv === "staging";
  }

  /**
   * Check if running in test environment
   */
  get isTest(): boolean {
    return this.getApp().nodeEnv === "test";
  }

  /**
   * Get current environment
   */
  get environment(): string {
    return this.getApp().nodeEnv;
  }
}
