import { describe, it, expect, beforeEach, afterEach } from "vitest";
import queueConfig from "./queue.config";

describe("QueueConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load queue configuration from environment", () => {
    process.env.QUEUE_CONCURRENCY = "10";
    process.env.QUEUE_MAX_RETRIES = "5";
    process.env.QUEUE_DELAY_RETRY = "2";

    const config = queueConfig();

    expect(config).toEqual({
      concurrency: 10,
      maxRetries: 5,
      delayRetry: 2,
    });
  });

  it("should use default values when not specified", () => {
    delete process.env.QUEUE_CONCURRENCY;
    delete process.env.QUEUE_MAX_RETRIES;
    delete process.env.QUEUE_DELAY_RETRY;

    const config = queueConfig();

    expect(config).toEqual({
      concurrency: 5,
      maxRetries: 3,
      delayRetry: 30, // Updated default
    });
  });

  it("should correctly parse string numbers to integers", () => {
    process.env.QUEUE_CONCURRENCY = "20";
    process.env.QUEUE_MAX_RETRIES = "10";
    process.env.QUEUE_DELAY_RETRY = "5";

    const config = queueConfig();

    expect(typeof config.concurrency).toBe("number");
    expect(typeof config.maxRetries).toBe("number");
    expect(typeof config.delayRetry).toBe("number");
  });
});
