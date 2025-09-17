import { registerAs } from "@nestjs/config";
import type { ObservabilityConfig } from "../types/config.types";

/**
 * Observability configuration namespace
 * Loads logging, tracing, and monitoring settings
 */
export default registerAs(
  "observability",
  (): ObservabilityConfig => ({
    // Logging configuration
    logServiceName: process.env.LOG_SERVICE_NAME!, // REQ
    logLevel: (process.env.LOG_LEVEL ||
      "info") as ObservabilityConfig["logLevel"], // OPT with default
    logTransport: (process.env.LOG_TRANSPORT ||
      "stdout") as ObservabilityConfig["logTransport"], // OPT with default
    logFormat: (process.env.LOG_FORMAT ||
      "otel-json") as ObservabilityConfig["logFormat"], // OPT with default
    logRedactPatterns: process.env.LOG_REDACT_PATTERNS?.split(",").map((s) =>
      s.trim()
    ) || ["password", "token", "secret", "key", "authorization"], // OPT with default
    logMaxMessageLength: parseInt(
      process.env.LOG_MAX_MESSAGE_LENGTH || "10000",
      10
    ), // OPT with default

    // Optional buffer settings
    logMemBufferEntries: process.env.LOG_MEM_BUFFER_ENTRIES
      ? parseInt(process.env.LOG_MEM_BUFFER_ENTRIES, 10)
      : undefined,
    logMemBufferFlushInterval: process.env.LOG_MEM_BUFFER_FLUSH_INTERVAL
      ? parseInt(process.env.LOG_MEM_BUFFER_FLUSH_INTERVAL, 10)
      : undefined,
    logBufferFilePath: process.env.LOG_BUFFER_FILE_PATH,
    logBufferFileMaxSize: process.env.LOG_BUFFER_FILE_MAX_SIZE
      ? parseInt(process.env.LOG_BUFFER_FILE_MAX_SIZE, 10)
      : undefined,
    logBufferFileDatePattern: process.env.LOG_BUFFER_FILE_DATE_PATTERN,
    logBufferMaxFiles: process.env.LOG_BUFFER_MAX_FILES
      ? parseInt(process.env.LOG_BUFFER_MAX_FILES, 10)
      : undefined,

    // OpenTelemetry configuration
    otelServiceName: process.env.OTEL_SERVICE_NAME!, // REQ
    otelExporterProtocol: process.env.OTEL_EXPORTER_OTLP_PROTOCOL, // OPT
    otelExporterEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT!, // REQ
    otelExporterTimeout: process.env.OTEL_EXPORTER_OTLP_TIMEOUT
      ? parseInt(process.env.OTEL_EXPORTER_OTLP_TIMEOUT, 10)
      : undefined, // OPT
    otelExporterHeaders: process.env.OTEL_EXPORTER_OTLP_HEADERS, // OPT

    // Sentry configuration
    sentryDsn: process.env.SENTRY_DSN!, // REQ
    sentryEnvironment: process.env.SENTRY_ENVIRONMENT!, // REQ
  })
);
