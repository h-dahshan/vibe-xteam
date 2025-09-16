/**
 * Configuration type definitions for the application
 * These interfaces define the structure of each configuration namespace
 */

// App configuration
export interface AppConfig {
  nodeEnv: "development" | "staging" | "production" | "test";
  name: string;
  version: string;
  url: string;
  apiPrefix: string;
  apiVersion: string;
  localesSupported: string[];
  localesDefault: string;
  localesFallback: string;
}

// Authentication configuration
export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: number;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: number;
  bcryptSaltRounds: number;
}

// Database configuration
export interface DatabaseConfig {
  url: string;
  directUrl: string;
}

// Redis configuration
export interface RedisConfig {
  url: string;
  password?: string;
  db: number;
  sessionDb: number;
  rateLimitDb: number;
  queueDb: number;
}

// Storage configuration
export interface StorageConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
  localStoragePath?: string;
  s3Region?: string;
  s3Bucket?: string;
  s3Endpoint?: string;
  s3AccessKey?: string;
  s3AccessKeySecret?: string;
}

// Communication configuration
export interface CommunicationConfig {
  resend: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
}

// WebSocket configuration
export interface WebSocketConfig {
  port: number;
  corsOrigin: string;
}

// Security configuration
export interface SecurityConfig {
  corsOrigin: string;
  rateLimitTtl: number;
  rateLimitMaxHits: number;
  rateLimitMaxHitsPerIp: number;
}

// Observability configuration
export interface ObservabilityConfig {
  logServiceName: string;
  logLevel: "error" | "warn" | "info" | "debug" | "verbose";
  logTransport: "stdout" | "otlp" | "both";
  logFormat: "otel-json" | "winston";
  logRedactPatterns: string[];
  logMaxMessageLength: number;
  // Optional OTLP configs
  logMemBufferEntries?: number;
  logMemBufferFlushInterval?: number;
  logBufferFilePath?: string;
  logBufferFileMaxSize?: number;
  logBufferFileDatePattern?: string;
  logBufferMaxFiles?: number;
  // OpenTelemetry
  otelServiceName: string;
  otelExporterProtocol?: string;
  otelExporterEndpoint?: string;
  otelExporterTimeout?: number;
  otelExporterHeaders?: string;
  // Sentry
  sentryDsn?: string;
  sentryEnvironment?: string;
}

// Cache configuration (optional)
export interface CacheConfig {
  ttl: number;
  maxItems: number;
  compression: boolean;
}

// Queue configuration (optional)
export interface QueueConfig {
  concurrency: number;
  maxRetries: number;
  delayRetry: number;
}

// Circuit breaker configuration (optional)
export interface CircuitBreakerConfig {
  timeout: number;
  errorThreshold: number;
  resetTimeout: number;
}

// Health check configuration (optional)
export interface HealthConfig {
  timeout: number;
  checkDatabase: boolean;
  checkRedis: boolean;
  checkExternalServices: boolean;
}

// Business configuration (optional)
export interface BusinessConfig {
  defaultTimezone: string;
  businessTimezone: string;
}

// Combined configuration interface
export interface Config {
  app: AppConfig;
  auth: AuthConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  storage: StorageConfig;
  communication: CommunicationConfig;
  websocket: WebSocketConfig;
  security: SecurityConfig;
  observability: ObservabilityConfig;
  cache: CacheConfig;
  queue: QueueConfig;
  circuitBreaker: CircuitBreakerConfig;
  health: HealthConfig;
  business: BusinessConfig;
}
