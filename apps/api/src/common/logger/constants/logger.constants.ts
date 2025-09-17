/**
 * Logger constants - minimal set, most config comes from ConfigService
 */

// Log level ladder pattern - matches Winston NPM levels order
// Winston NPM levels: error(0), warn(1), info(2), http(3), verbose(4), debug(5), silly(6)
export const LOG_LEVELS_LADDER = {
  error: ["error"],
  warn: ["error", "warn"],
  info: ["error", "warn", "info"],
  verbose: ["error", "warn", "info", "verbose"],
  debug: ["error", "warn", "info", "verbose", "debug"],
};

// Log metadata keys for structured logging
export const LOG_METADATA_KEYS = {
  CORRELATION_ID: "correlationId",
  USER_ID: "userId",
  TRACE_ID: "traceId",
  SPAN_ID: "spanId",
  REQUEST_ID: "requestId",
  METHOD: "method",
  PATH: "path",
  DURATION: "duration",
  STATUS_CODE: "statusCode",
  TIMESTAMP: "timestamp",
  SERVICE: "service",
  ENVIRONMENT: "environment",
};

// Type exports
export type LogLevel = keyof typeof LOG_LEVELS_LADDER;
export type LogMetadataKey =
  (typeof LOG_METADATA_KEYS)[keyof typeof LOG_METADATA_KEYS];
