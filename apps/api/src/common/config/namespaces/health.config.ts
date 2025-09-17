import { registerAs } from "@nestjs/config";
import type { HealthConfig } from "../types/config.types";

/**
 * Health check configuration namespace (optional)
 * Loads health check settings with defaults
 */
export default registerAs(
  "health",
  (): HealthConfig => ({
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || "5", 10),
    checkDatabase: process.env.HEALTH_CHECK_DATABASE !== "false",
    checkRedis: process.env.HEALTH_CHECK_REDIS !== "false",
    checkExternalServices:
      process.env.HEALTH_CHECK_EXTERNAL_SERVICES !== "false",
  })
);
