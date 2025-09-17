import { z } from "zod";

/**
 * Cache configuration schema - Optional with defaults
 */
export const cacheSchema = z.object({
  CACHE_TTL: z
    .string()
    .regex(/^\d+$/, "CACHE_TTL must be a number (in seconds)")
    .optional()
    .default("3600") // 1 hour default
    .transform((val) => parseInt(val, 10)),
  CACHE_MAX_ITEMS: z
    .string()
    .regex(/^\d+$/, "CACHE_MAX_ITEMS must be a number")
    .optional()
    .default("1000")
    .transform((val) => parseInt(val, 10)),
  CACHE_COMPRESSION: z
    .string()
    .optional()
    .default("true")
    .transform((val) => val.toLowerCase() === "true"),
});

export type CacheSchemaType = z.infer<typeof cacheSchema>;
