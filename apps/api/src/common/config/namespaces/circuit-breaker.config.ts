import { registerAs } from "@nestjs/config";
import type { CircuitBreakerConfig } from "../types/config.types";

/**
 * Circuit breaker configuration namespace (optional)
 * Loads circuit breaker settings with defaults
 */
export default registerAs(
  "circuitBreaker",
  (): CircuitBreakerConfig => ({
    timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || "10", 10),
    errorThreshold: parseInt(
      process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD || "5",
      10
    ),
    resetTimeout: parseInt(
      process.env.CIRCUIT_BREAKER_RESET_TIMEOUT || "60",
      10
    ),
  })
);
