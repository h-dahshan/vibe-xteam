import { z } from "zod";

/**
 * Queue configuration schema - Optional with defaults
 */
export const queueSchema = z.object({
  QUEUE_CONCURRENCY: z
    .string()
    .regex(/^\d+$/, "QUEUE_CONCURRENCY must be a number")
    .optional()
    .default("5")
    .transform((val) => parseInt(val, 10)),
  QUEUE_MAX_RETRIES: z
    .string()
    .regex(/^\d+$/, "QUEUE_MAX_RETRIES must be a number")
    .optional()
    .default("3")
    .transform((val) => parseInt(val, 10)),
  QUEUE_DELAY_RETRY: z
    .string()
    .regex(/^\d+$/, "QUEUE_DELAY_RETRY must be a number (in seconds)")
    .optional()
    .default("30")
    .transform((val) => parseInt(val, 10)),
});

export type QueueSchemaType = z.infer<typeof queueSchema>;
