import { z } from "zod";

/**
 * Observability configuration schema - Mixed (some required, some optional)
 */
export const observabilitySchema = z.object({
  // Required logging configs
  LOG_SERVICE_NAME: z.string().min(1, "LOG_SERVICE_NAME is required"),
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "debug", "verbose"])
    .default("info"),
  LOG_TRANSPORT: z.enum(["stdout", "otlp", "both"]).default("stdout"),
  LOG_FORMAT: z.enum(["otel-json", "winston"]).default("otel-json"),
  LOG_REDACT_PATTERNS: z
    .string()
    .transform((val) => val.split(",").map((s) => s.trim()))
    .pipe(z.array(z.string()))
    .default(["password", "token", "secret", "key", "authorization"]),
  LOG_MAX_MESSAGE_LENGTH: z
    .string()
    .regex(/^\d+$/, "LOG_MAX_MESSAGE_LENGTH must be a number")
    .transform((val) => parseInt(val, 10))
    .default(10000),

  // Optional OTLP buffer configs (lines 127-137 in .env.example)
  LOG_MEM_BUFFER_ENTRIES: z
    .string()
    .regex(/^\d+$/, "LOG_MEM_BUFFER_ENTRIES must be a number")
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  LOG_MEM_BUFFER_FLUSH_INTERVAL: z
    .string()
    .regex(
      /^\d+$/,
      "LOG_MEM_BUFFER_FLUSH_INTERVAL must be a number (in seconds)"
    )
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  LOG_BUFFER_FILE_PATH: z.string().optional(),
  LOG_BUFFER_FILE_MAX_SIZE: z
    .string()
    .regex(/^\d+$/, "LOG_BUFFER_FILE_MAX_SIZE must be a number (in bytes)")
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  LOG_BUFFER_FILE_DATE_PATTERN: z.string().optional(),
  LOG_BUFFER_MAX_FILES: z
    .string()
    .regex(/^\d+$/, "LOG_BUFFER_MAX_FILES must be a number")
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),

  // Required OpenTelemetry configs
  OTEL_SERVICE_NAME: z.string().min(1, "OTEL_SERVICE_NAME is required"),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.url(),
  OTEL_EXPORTER_OTLP_PROTOCOL: z.string().optional(),
  OTEL_EXPORTER_OTLP_HEADERS: z
    .string()
    .optional()
    .transform((val) =>
      val ? val.split(",").map((s) => s.trim()) : undefined
    ),
  OTEL_EXPORTER_OTLP_TIMEOUT: z
    .string()
    .regex(/^\d+$/, "OTEL_EXPORTER_OTLP_TIMEOUT must be a number (in seconds)")
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),

  // Required Sentry configs for production
  SENTRY_DSN: z.url().min(1, "SENTRY_DSN is required"),
  SENTRY_ENVIRONMENT: z.string().min(1, "SENTRY_ENVIRONMENT is required"),
});

export type ObservabilitySchemaType = z.infer<typeof observabilitySchema>;
