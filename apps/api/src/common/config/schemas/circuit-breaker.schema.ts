import { z } from "zod";

/**
 * Circuit breaker configuration schema - Optional with defaults
 */
export const circuitBreakerSchema = z.object({
  CIRCUIT_BREAKER_TIMEOUT: z
    .string()
    .regex(/^\d+$/, "CIRCUIT_BREAKER_TIMEOUT must be a number (in seconds)")
    .optional()
    .default("10")
    .transform((val) => parseInt(val, 10)),
  CIRCUIT_BREAKER_ERROR_THRESHOLD: z
    .string()
    .regex(/^\d+$/, "CIRCUIT_BREAKER_ERROR_THRESHOLD must be a number")
    .optional()
    .default("5")
    .transform((val) => parseInt(val, 10)),
  CIRCUIT_BREAKER_RESET_TIMEOUT: z
    .string()
    .regex(
      /^\d+$/,
      "CIRCUIT_BREAKER_RESET_TIMEOUT must be a number (in seconds)"
    )
    .optional()
    .default("60")
    .transform((val) => parseInt(val, 10)),
});

export type CircuitBreakerSchemaType = z.infer<typeof circuitBreakerSchema>;
