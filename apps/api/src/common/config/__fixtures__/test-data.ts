const minimalBase = {
  // App
  NODE_ENV: "development",
  APP_NAME: "test-app",
  APP_VERSION: "1.0.0",
  APP_URL: "http://localhost:3000",
  API_PREFIX: "api",
  API_VERSION: "v1",
  LOCALES_SUPPORTED: "en,ar",
  LOCALES_DEFAULT: "en",
  LOCALES_FALLBACK: "en",

  // Auth
  JWT_SECRET: "x".repeat(32), // Minimum 32 chars
  JWT_EXPIRES_IN: "3600",
  JWT_REFRESH_SECRET: "r".repeat(32), // Minimum 32 chars
  JWT_REFRESH_EXPIRES_IN: "604800",
  BCRYPT_SALT_ROUNDS: "10",

  // Database
  SUPABASE_DATABASE_URL: "postgresql://test:test@localhost:5432/test",
  SUPABASE_DIRECT_URL: "postgresql://test:test@localhost:5432/test",

  // Redis
  REDIS_URL: "redis://localhost:6379",
  REDIS_PASSWORD: "",
  REDIS_DB: "0",
  REDIS_TTL: "3600",
  REDIS_SESSION_DB: "1",
  REDIS_RATE_LIMIT_DB: "2",
  REDIS_QUEUE_DB: "3",

  // Storage (S3 is now required)
  SUPABASE_S3_REGION: "us-east-1",
  SUPABASE_S3_BUCKET: "test-bucket",
  SUPABASE_S3_ENDPOINT: "https://s3.amazonaws.com",
  SUPABASE_S3_ACCESS_KEY: "test-access-key",
  SUPABASE_S3_ACCESS_KEY_SECRET: "test-secret-key",
  // Optional storage fields
  LOCAL_STORAGE_PATH: "./uploads",
  MAX_FILE_SIZE: "10485760",
  ALLOWED_FILE_TYPES: "jpg,png,pdf",

  // Communication
  RESEND_API_KEY: "re_test_key_123456789",
  RESEND_FROM_EMAIL: "test@example.com",
  RESEND_FROM_NAME: "Test App",
  TWILIO_ACCOUNT_SID: "AC00000000000000000000000000000000",
  TWILIO_AUTH_TOKEN: "test-auth-token-123",
  TWILIO_PHONE_NUMBER: "+12345678901",

  // WebSocket
  WEBSOCKET_CORS_ORIGIN: "http://localhost:3000",

  // Security
  CORS_ORIGIN: "http://localhost:3000",
  RATE_LIMIT_TTL: "60",
  RATE_LIMIT_MAX_HITS: "100",
  RATE_LIMIT_MAX_HITS_PER_IP: "10",

  // Observability
  LOG_SERVICE_NAME: "test-service",
  LOG_LEVEL: "info",
  LOG_TRANSPORT: "stdout",
  LOG_FORMAT: "otel-json",
  LOG_REDACT_PATTERNS: "password,token,secret",
  LOG_MAX_MESSAGE_LENGTH: "10000",
  OTEL_SERVICE_NAME: "test-service",
  OTEL_EXPORTER_OTLP_ENDPOINT: "https://otlp.example.com",
  SENTRY_DSN: "https://xxx@sentry.io/xxx",
  SENTRY_ENVIRONMENT: "test",
};

// Optional fields with defaults
const optionalFields = {
  CACHE_TTL: "3600",
  CACHE_MAX_ITEMS: "1000",
  CACHE_COMPRESSION: "true",
  QUEUE_CONCURRENCY: "5",
  QUEUE_MAX_RETRIES: "3",
  QUEUE_DELAY_RETRY: "30",
  CIRCUIT_BREAKER_TIMEOUT: "10",
  CIRCUIT_BREAKER_ERROR_THRESHOLD: "5",
  CIRCUIT_BREAKER_RESET_TIMEOUT: "60",
  HEALTH_CHECK_TIMEOUT: "5",
  HEALTH_CHECK_DATABASE: "true",
  HEALTH_CHECK_REDIS: "true",
  HEALTH_CHECK_EXTERNAL_SERVICES: "true",
  DEFAULT_TIMEZONE: "UTC",
  BUSINESS_TIMEZONE: "America/New_York",
  WEBSOCKET_PORT: "3010",
};

// Note: S3 fields are now required and included in minimalBase

/**
 * Test data generator functions
 */
export const testData = {
  // Valid configs
  minimal: () => ({ ...minimalBase }),

  complete: () => ({
    ...minimalBase,
    ...optionalFields,
  }),

  withS3: () => {
    // S3 is already in minimalBase now, just return complete config
    return { ...minimalBase, ...optionalFields };
  },

  production: () => ({
    ...minimalBase,
    ...optionalFields,
    NODE_ENV: "production",
    APP_URL: "https://api.example.com",
    WEBSOCKET_CORS_ORIGIN: "https://app.example.com",
    CORS_ORIGIN: "https://app.example.com",
    LOG_LEVEL: "warn",
    LOG_TRANSPORT: "otlp",
  }),

  development: () => ({
    ...minimalBase,
    ...optionalFields,
    NODE_ENV: "development",
    LOG_LEVEL: "debug",
  }),

  // Invalid configs
  noJwtSecret: () => {
    const data = { ...minimalBase };

    // @ts-expect-error for testing
    delete data.JWT_SECRET;

    return data;
  },

  shortJwtSecret: () => ({
    ...minimalBase,
    JWT_SECRET: "too-short",
  }),

  invalidEmail: () => ({
    ...minimalBase,
    RESEND_FROM_EMAIL: "not-an-email",
  }),

  invalidPhone: () => ({
    ...minimalBase,
    TWILIO_PHONE_NUMBER: "1234567890", // Missing + and format
  }),

  invalidUrl: () => ({
    ...minimalBase,
    APP_URL: "not-a-url",
  }),

  redisDbOutOfRange: () => ({
    ...minimalBase,
    REDIS_DB: "16", // Valid range is 0-15
  }),

  missingStorage: () => {
    const data = { ...minimalBase };

    // Remove S3 required fields to test storage validation
    // @ts-expect-error for testing
    delete data.SUPABASE_S3_REGION;
    // @ts-expect-error for testing
    delete data.SUPABASE_S3_BUCKET;
    // @ts-expect-error for testing
    delete data.SUPABASE_S3_ENDPOINT;
    // @ts-expect-error for testing
    delete data.SUPABASE_S3_ACCESS_KEY;
    // @ts-expect-error for testing
    delete data.SUPABASE_S3_ACCESS_KEY_SECRET;

    return data;
  },

  missingRequiredApp: () => {
    const data = { ...minimalBase };

    // @ts-expect-error for testing
    delete data.APP_NAME;

    return data;
  },

  invalidAppVersion: () => ({
    ...minimalBase,
    APP_VERSION: "invalid-version",
  }),

  // Custom builder
  custom: (overrides: Record<string, any>) => ({
    ...minimalBase,
    ...overrides,
  }),

  customComplete: (overrides: Record<string, any>) => ({
    ...minimalBase,
    ...optionalFields,
    ...overrides,
  }),
};
