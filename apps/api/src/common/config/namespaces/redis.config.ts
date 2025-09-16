import { registerAs } from "@nestjs/config";
import type { RedisConfig } from "../types/config.types";

/**
 * Redis configuration namespace
 * Loads Redis connection and database allocation environment variables
 */
export default registerAs(
  "redis",
  (): RedisConfig => ({
    url: process.env.REDIS_URL!, // REQ
    password: process.env.REDIS_PASSWORD!, // REQ
    db: parseInt(process.env.REDIS_DB || "0", 10), // OPT with default
    sessionDb: parseInt(process.env.REDIS_SESSION_DB || "1", 10), // OPT with default
    rateLimitDb: parseInt(process.env.REDIS_RATE_LIMIT_DB || "2", 10), // OPT with default
    queueDb: parseInt(process.env.REDIS_QUEUE_DB || "3", 10), // OPT with default
  })
);
