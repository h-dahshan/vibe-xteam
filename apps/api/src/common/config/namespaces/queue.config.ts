import { registerAs } from "@nestjs/config";
import type { QueueConfig } from "../types/config.types";

/**
 * Queue configuration namespace (optional)
 * Loads job queue settings with defaults
 */
export default registerAs(
  "queue",
  (): QueueConfig => ({
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || "5", 10), // OPT with default
    maxRetries: parseInt(process.env.QUEUE_MAX_RETRIES || "3", 10), // OPT with default
    delayRetry: parseInt(process.env.QUEUE_DELAY_RETRY || "30", 10), // OPT with default (changed to 30)
  })
);
