import { registerAs } from "@nestjs/config";
import type { CacheConfig } from "../types/config.types";

/**
 * Cache configuration namespace (optional)
 * Loads caching settings with defaults
 */
export default registerAs(
  "cache",
  (): CacheConfig => ({
    ttl: parseInt(process.env.CACHE_TTL || "3600", 10),
    maxItems: parseInt(process.env.CACHE_MAX_ITEMS || "1000", 10),
    compression: process.env.CACHE_COMPRESSION === "true",
  })
);
