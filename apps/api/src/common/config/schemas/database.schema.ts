import { z } from "zod";

/**
 * Database configuration schema - Required
 */
export const databaseSchema = z.object({
  SUPABASE_DATABASE_URL: z
    .string()
    .min(1, "SUPABASE_DATABASE_URL is required")
    .startsWith(
      "postgresql://",
      "SUPABASE_DATABASE_URL must be a valid PostgreSQL URL"
    ),
  SUPABASE_DIRECT_URL: z
    .string()
    .min(1, "SUPABASE_DIRECT_URL is required")
    .startsWith(
      "postgresql://",
      "SUPABASE_DIRECT_URL must be a valid PostgreSQL URL"
    ),
});

export type DatabaseSchemaType = z.infer<typeof databaseSchema>;
