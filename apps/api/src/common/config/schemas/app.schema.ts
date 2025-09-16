import { z } from "zod";

/**
 * App configuration schema
 */
export const appSchema = z.object({
  // REQUIRED - Core application settings
  NODE_ENV: z.enum(["development", "staging", "production", "test"]),
  APP_NAME: z.string().min(1, "APP_NAME is required"),
  APP_VERSION: z
    .string()
    .regex(
      /^\d+\.\d+\.\d+$/,
      "APP_VERSION must follow semantic versioning (x.y.z)"
    ),
  APP_URL: z.url("APP_URL must be a valid URL"),
  API_PREFIX: z.string().min(1, "API_PREFIX is required"),
  API_VERSION: z.string().min(1, "API_VERSION is required"),

  // OPTIONAL - Localization settings
  LOCALES_SUPPORTED: z
    .string()
    .optional()
    .default("en")
    .transform((val) => val.split(",").map((s) => s.trim()))
    .pipe(z.array(z.string()).min(1)),
  LOCALES_DEFAULT: z.string().default("en"),
  LOCALES_FALLBACK: z.string().default("en"),
});

export type AppSchemaType = z.infer<typeof appSchema>;
