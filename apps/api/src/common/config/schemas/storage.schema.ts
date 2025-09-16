import { z } from "zod";

/**
 * Storage configuration schema - Required (with conditional validation)
 */
export const storageSchema = z.object({
  MAX_FILE_SIZE: z
    .string()
    .regex(/^\d+$/, "MAX_FILE_SIZE must be a number (in bytes)")
    .optional()
    .default("10485760") // 10MB default
    .transform((val) => parseInt(val, 10)),

  ALLOWED_FILE_TYPES: z
    .string()
    .optional()
    .default("jpg,png,pdf,doc,docx")
    .transform((val) => val.split(",").map((s) => s.trim())),

  // Local storage (for development)
  LOCAL_STORAGE_PATH: z.string().optional(),

  // S3 storage (for production)
  SUPABASE_S3_REGION: z.string().min(1, "SUPABASE_S3_REGION is required"),
  SUPABASE_S3_BUCKET: z.string().min(1, "SUPABASE_S3_BUCKET is required"),
  SUPABASE_S3_ENDPOINT: z.url().min(1, "SUPABASE_S3_ENDPOINT is required"),
  SUPABASE_S3_ACCESS_KEY: z
    .string()
    .min(1, "SUPABASE_S3_ACCESS_KEY is required"),
  SUPABASE_S3_ACCESS_KEY_SECRET: z
    .string()
    .min(1, "SUPABASE_S3_ACCESS_KEY_SECRET is required"),
});

// We'll add storage validation as a separate check after merging all schemas
export type StorageSchemaType = z.infer<typeof storageSchema>;
