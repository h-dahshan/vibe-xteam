import { z } from "zod";

/**
 * Security configuration schema - Required
 */
export const securitySchema = z.object({
  CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required"),
  RATE_LIMIT_TTL: z
    .string()
    .regex(/^\d+$/, "RATE_LIMIT_TTL must be a number (in seconds)")
    .transform((val) => parseInt(val, 10))
    .default(60),
  RATE_LIMIT_MAX_HITS: z
    .string()
    .regex(/^\d+$/, "RATE_LIMIT_MAX_HITS must be a number")
    .transform((val) => parseInt(val, 10))
    .default(100),
  RATE_LIMIT_MAX_HITS_PER_IP: z
    .string()
    .regex(/^\d+$/, "RATE_LIMIT_MAX_HITS_PER_IP must be a number")
    .transform((val) => parseInt(val, 10))
    .default(10),
});

export type SecuritySchemaType = z.infer<typeof securitySchema>;
