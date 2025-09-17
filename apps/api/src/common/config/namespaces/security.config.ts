import { registerAs } from "@nestjs/config";
import type { SecurityConfig } from "../types/config.types";

/**
 * Security configuration namespace
 * Loads CORS and rate limiting settings
 */
export default registerAs(
  "security",
  (): SecurityConfig => ({
    corsOrigin: process.env.CORS_ORIGIN!, // REQ
    rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL || "60", 10), // OPT with default
    rateLimitMaxHits: parseInt(process.env.RATE_LIMIT_MAX_HITS || "100", 10), // OPT with default
    rateLimitMaxHitsPerIp: parseInt(
      process.env.RATE_LIMIT_MAX_HITS_PER_IP || "10",
      10
    ), // OPT with default
  })
);
