import { z } from "zod";

/**
 * Health check configuration schema - Optional with defaults
 */
export const healthSchema = z.object({
  HEALTH_CHECK_TIMEOUT: z
    .string()
    .regex(/^\d+$/, "HEALTH_CHECK_TIMEOUT must be a number (in seconds)")
    .optional()
    .default("5")
    .transform((val) => parseInt(val, 10)),
  HEALTH_CHECK_DATABASE: z
    .string()
    .optional()
    .default("true")
    .transform((val) => val.toLowerCase() === "true"),
  HEALTH_CHECK_REDIS: z
    .string()
    .optional()
    .default("true")
    .transform((val) => val.toLowerCase() === "true"),
  HEALTH_CHECK_EXTERNAL_SERVICES: z
    .string()
    .optional()
    .default("true")
    .transform((val) => val.toLowerCase() === "true"),
});

export type HealthSchemaType = z.infer<typeof healthSchema>;
