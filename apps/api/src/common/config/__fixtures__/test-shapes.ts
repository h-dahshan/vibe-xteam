/**
 * Transform flat environment variables to nested config object
 * Used by ConfigService tests
 */
export function toNestedConfig(flatEnv: Record<string, string>) {
  return {
    app: flatEnv.NODE_ENV
      ? {
          nodeEnv: flatEnv.NODE_ENV,
          name: flatEnv.APP_NAME,
          version: flatEnv.APP_VERSION,
          url: flatEnv.APP_URL,
          apiPrefix: flatEnv.API_PREFIX,
          apiVersion: flatEnv.API_VERSION,
          localesSupported: flatEnv.LOCALES_SUPPORTED?.split(",") || [],
          localesDefault: flatEnv.LOCALES_DEFAULT,
          localesFallback: flatEnv.LOCALES_FALLBACK,
        }
      : undefined,

    auth: flatEnv.JWT_SECRET
      ? {
          jwtSecret: flatEnv.JWT_SECRET,
          jwtExpiresIn: parseInt(flatEnv.JWT_EXPIRES_IN || "3600", 10),
          jwtRefreshSecret: flatEnv.JWT_REFRESH_SECRET,
          jwtRefreshExpiresIn: parseInt(
            flatEnv.JWT_REFRESH_EXPIRES_IN || "604800",
            10
          ),
          bcryptSaltRounds: parseInt(flatEnv.BCRYPT_SALT_ROUNDS || "10", 10),
        }
      : undefined,

    database: flatEnv.SUPABASE_DATABASE_URL
      ? {
          url: flatEnv.SUPABASE_DATABASE_URL,
          directUrl: flatEnv.SUPABASE_DIRECT_URL,
        }
      : undefined,

    redis: flatEnv.REDIS_URL
      ? {
          url: flatEnv.REDIS_URL,
          password: flatEnv.REDIS_PASSWORD || undefined,
          db: parseInt(flatEnv.REDIS_DB || "0", 10),
          ttl: parseInt(flatEnv.REDIS_TTL || "3600", 10),
          sessionDb: parseInt(flatEnv.REDIS_SESSION_DB || "1", 10),
          rateLimitDb: parseInt(flatEnv.REDIS_RATE_LIMIT_DB || "2", 10),
          queueDb: parseInt(flatEnv.REDIS_QUEUE_DB || "3", 10),
        }
      : undefined,

    storage:
      flatEnv.LOCAL_STORAGE_PATH || flatEnv.SUPABASE_S3_BUCKET
        ? {
            maxFileSize: parseInt(flatEnv.MAX_FILE_SIZE || "10485760", 10),
            allowedFileTypes: flatEnv.ALLOWED_FILE_TYPES?.split(",") || [],
            localStoragePath: flatEnv.LOCAL_STORAGE_PATH,
            s3Region: flatEnv.SUPABASE_S3_REGION,
            s3Bucket: flatEnv.SUPABASE_S3_BUCKET,
            s3Endpoint: flatEnv.SUPABASE_S3_ENDPOINT,
            s3AccessKey: flatEnv.SUPABASE_S3_ACCESS_KEY,
            s3AccessKeySecret: flatEnv.SUPABASE_S3_ACCESS_KEY_SECRET,
          }
        : undefined,

    communication: flatEnv.RESEND_API_KEY
      ? {
          resend: {
            apiKey: flatEnv.RESEND_API_KEY,
            fromEmail: flatEnv.RESEND_FROM_EMAIL,
            fromName: flatEnv.RESEND_FROM_NAME,
          },
          twilio: {
            accountSid: flatEnv.TWILIO_ACCOUNT_SID,
            authToken: flatEnv.TWILIO_AUTH_TOKEN,
            phoneNumber: flatEnv.TWILIO_PHONE_NUMBER,
          },
        }
      : undefined,

    websocket: flatEnv.WEBSOCKET_PORT
      ? {
          port: parseInt(flatEnv.WEBSOCKET_PORT || "3001", 10),
          corsOrigin: flatEnv.WEBSOCKET_CORS_ORIGIN,
        }
      : undefined,

    security: flatEnv.CORS_ORIGIN
      ? {
          corsOrigin: flatEnv.CORS_ORIGIN,
          rateLimitTtl: parseInt(flatEnv.RATE_LIMIT_TTL || "60", 10),
          rateLimitMaxHits: parseInt(flatEnv.RATE_LIMIT_MAX_HITS || "100", 10),
          rateLimitMaxHitsPerIp: parseInt(
            flatEnv.RATE_LIMIT_MAX_HITS_PER_IP || "10",
            10
          ),
        }
      : undefined,

    observability: flatEnv.LOG_SERVICE_NAME
      ? {
          logServiceName: flatEnv.LOG_SERVICE_NAME,
          logLevel: flatEnv.LOG_LEVEL || "info",
          logTransport: flatEnv.LOG_TRANSPORT || "stdout",
          logFormat: flatEnv.LOG_FORMAT || "otel-json",
          logRedactPatterns: flatEnv.LOG_REDACT_PATTERNS?.split(",") || [],
          logMaxMessageLength: parseInt(
            flatEnv.LOG_MAX_MESSAGE_LENGTH || "10000",
            10
          ),
          otelServiceName: flatEnv.OTEL_SERVICE_NAME,
        }
      : undefined,

    cache:
      flatEnv.CACHE_TTL !== undefined
        ? {
            ttl: parseInt(flatEnv.CACHE_TTL || "3600", 10),
            maxItems: parseInt(flatEnv.CACHE_MAX_ITEMS || "1000", 10),
            compression: flatEnv.CACHE_COMPRESSION === "true",
          }
        : undefined,

    queue:
      flatEnv.QUEUE_CONCURRENCY !== undefined
        ? {
            concurrency: parseInt(flatEnv.QUEUE_CONCURRENCY || "5", 10),
            maxRetries: parseInt(flatEnv.QUEUE_MAX_RETRIES || "3", 10),
            delayRetry: parseInt(flatEnv.QUEUE_DELAY_RETRY || "1", 10),
          }
        : undefined,

    circuitBreaker:
      flatEnv.CIRCUIT_BREAKER_TIMEOUT !== undefined
        ? {
            timeout: parseInt(flatEnv.CIRCUIT_BREAKER_TIMEOUT || "10", 10),
            errorThreshold: parseInt(
              flatEnv.CIRCUIT_BREAKER_ERROR_THRESHOLD || "5",
              10
            ),
            resetTimeout: parseInt(
              flatEnv.CIRCUIT_BREAKER_RESET_TIMEOUT || "60",
              10
            ),
          }
        : undefined,

    health:
      flatEnv.HEALTH_CHECK_TIMEOUT !== undefined
        ? {
            timeout: parseInt(flatEnv.HEALTH_CHECK_TIMEOUT || "5", 10),
            checkDatabase: flatEnv.HEALTH_CHECK_DATABASE === "true",
            checkRedis: flatEnv.HEALTH_CHECK_REDIS === "true",
            checkExternalServices:
              flatEnv.HEALTH_CHECK_EXTERNAL_SERVICES === "true",
          }
        : undefined,

    business:
      flatEnv.DEFAULT_TIMEZONE !== undefined
        ? {
            defaultTimezone: flatEnv.DEFAULT_TIMEZONE || "UTC",
            businessTimezone: flatEnv.BUSINESS_TIMEZONE || "America/New_York",
          }
        : undefined,
  };
}

/**
 * Create process.env setup/clear helpers
 * Used by module and integration tests
 */
export function toProcessEnv(flatEnv: Record<string, string>) {
  return {
    setup: () => {
      Object.entries(flatEnv).forEach(([key, value]) => {
        process.env[key] = value;
      });
    },
    clear: () => {
      Object.keys(flatEnv).forEach((key) => {
        delete process.env[key];
      });
    },
  };
}

/**
 * Create environment snapshot for restoring state
 */
export function createEnvSnapshot() {
  const snapshot = { ...process.env };
  return {
    restore: () => {
      process.env = { ...snapshot };
    },
  };
}
