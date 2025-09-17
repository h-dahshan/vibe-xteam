import { registerAs } from "@nestjs/config";
import type { BusinessConfig } from "../types/config.types";

/**
 * Business configuration namespace (optional)
 * Loads business logic settings with defaults
 */
export default registerAs(
  "business",
  (): BusinessConfig => ({
    defaultTimezone: process.env.DEFAULT_TIMEZONE || "UTC",
    businessTimezone: process.env.BUSINESS_TIMEZONE || "America/New_York",
  })
);
