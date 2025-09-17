import { z } from "zod";

// Import all schemas from flat structure
import { appSchema } from "./app.schema";
import { authSchema } from "./auth.schema";
import { businessSchema } from "./business.schema";
import { cacheSchema } from "./cache.schema";
import { circuitBreakerSchema } from "./circuit-breaker.schema";
import { communicationSchema } from "./communication.schema";
import { databaseSchema } from "./database.schema";
import { healthSchema } from "./health.schema";
import { observabilitySchema } from "./observability.schema";
import { queueSchema } from "./queue.schema";
import { redisSchema } from "./redis.schema";
import { securitySchema } from "./security.schema";
import { storageSchema } from "./storage.schema";
import { websocketSchema } from "./websocket.schema";

/**
 * Combined environment schema
 * Merges all configuration schemas
 * Note: Each schema internally defines which fields are required vs optional
 */
export const envSchema = z
  .object({
    // Application & Core configs
    ...appSchema.shape,
    ...authSchema.shape,
    ...businessSchema.shape,

    // Infrastructure
    ...databaseSchema.shape,
    ...redisSchema.shape,
    ...storageSchema.shape,

    // Services
    ...cacheSchema.shape,
    ...circuitBreakerSchema.shape,
    ...communicationSchema.shape,
    ...healthSchema.shape,
    ...queueSchema.shape,

    // API & Security
    ...securitySchema.shape,
    ...websocketSchema.shape,

    // Monitoring
    ...observabilitySchema.shape,
  })
  .refine(
    (data) => {
      // Either local storage path OR S3 config must be provided
      const hasLocal = !!data.LOCAL_STORAGE_PATH;
      const hasS3 = !!(
        data.SUPABASE_S3_BUCKET &&
        data.SUPABASE_S3_ACCESS_KEY &&
        data.SUPABASE_S3_ACCESS_KEY_SECRET
      );
      return hasLocal || hasS3;
    },
    {
      message:
        "Either LOCAL_STORAGE_PATH or complete S3 configuration must be provided",
      path: ["storage"],
    }
  );

export type EnvSchemaType = z.infer<typeof envSchema>;

/**
 * List of optional configuration keys for warning messages
 */
export const optionalConfigKeys = [
  // Cache configs
  "CACHE_TTL",
  "CACHE_MAX_ITEMS",
  "CACHE_COMPRESSION",
  // Queue configs
  "QUEUE_CONCURRENCY",
  "QUEUE_MAX_RETRIES",
  "QUEUE_DELAY_RETRY",
  // Circuit breaker configs
  "CIRCUIT_BREAKER_TIMEOUT",
  "CIRCUIT_BREAKER_ERROR_THRESHOLD",
  "CIRCUIT_BREAKER_RESET_TIMEOUT",
  // Logging buffer configs (lines 127-137)
  "LOG_MEM_BUFFER_ENTRIES",
  "LOG_MEM_BUFFER_FLUSH_INTERVAL",
  "LOG_BUFFER_FILE_PATH",
  "LOG_BUFFER_FILE_MAX_SIZE",
  "LOG_BUFFER_FILE_DATE_PATTERN",
  "LOG_BUFFER_MAX_FILES",
  // Health configs
  "HEALTH_CHECK_TIMEOUT",
  "HEALTH_CHECK_DATABASE",
  "HEALTH_CHECK_REDIS",
  "HEALTH_CHECK_EXTERNAL_SERVICES",
  // Business configs
  "DEFAULT_TIMEZONE",
  "BUSINESS_TIMEZONE",
];
