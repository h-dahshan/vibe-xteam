import { z } from "zod";

/**
 * Redis configuration schema - Required
 */
export const redisSchema = z.object({
  REDIS_URL: z
    .string()
    .min(1, "REDIS_URL is required")
    .regex(/^redis:\/\//, "REDIS_URL must be a valid Redis URL"),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z
    .string()
    .regex(/^\d+$/, "REDIS_DB must be a number (0-15)")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(0).max(15))
    .default(0),
  REDIS_SESSION_DB: z
    .string()
    .regex(/^\d+$/, "REDIS_SESSION_DB must be a number (0-15)")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(0).max(15))
    .default(1),
  REDIS_RATE_LIMIT_DB: z
    .string()
    .regex(/^\d+$/, "REDIS_RATE_LIMIT_DB must be a number (0-15)")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(0).max(15))
    .default(2),
  REDIS_QUEUE_DB: z
    .string()
    .regex(/^\d+$/, "REDIS_QUEUE_DB must be a number (0-15)")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(0).max(15))
    .default(3),
});

export type RedisSchemaType = z.infer<typeof redisSchema>;
