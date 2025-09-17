import { describe, it, expect, beforeEach, afterEach } from "vitest";
import circuitBreakerConfig from "./circuit-breaker.config";

describe("CircuitBreakerConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load circuit breaker configuration from environment", () => {
    process.env.CIRCUIT_BREAKER_TIMEOUT = "20";
    process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD = "10";
    process.env.CIRCUIT_BREAKER_RESET_TIMEOUT = "120";

    const config = circuitBreakerConfig();

    expect(config).toEqual({
      timeout: 20,
      errorThreshold: 10,
      resetTimeout: 120,
    });
  });

  it("should use default values when not specified", () => {
    delete process.env.CIRCUIT_BREAKER_TIMEOUT;
    delete process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD;
    delete process.env.CIRCUIT_BREAKER_RESET_TIMEOUT;

    const config = circuitBreakerConfig();

    expect(config).toEqual({
      timeout: 10,
      errorThreshold: 5,
      resetTimeout: 60,
    });
  });

  it("should correctly parse string numbers to integers", () => {
    process.env.CIRCUIT_BREAKER_TIMEOUT = "15";
    process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD = "3";
    process.env.CIRCUIT_BREAKER_RESET_TIMEOUT = "30";

    const config = circuitBreakerConfig();

    expect(typeof config.timeout).toBe("number");
    expect(typeof config.errorThreshold).toBe("number");
    expect(typeof config.resetTimeout).toBe("number");
  });
});
