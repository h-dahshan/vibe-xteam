import { registerAs } from "@nestjs/config";
import type { StorageConfig } from "../types/config.types";

/**
 * Storage configuration namespace
 * Loads file storage environment variables (local or S3)
 */
const x = registerAs(
  "storage",
  (): StorageConfig => ({
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760", 10), // OPT with default
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(",").map((s) =>
      s.trim()
    ) || ["jpg", "png", "pdf", "doc", "docx"], // OPT with default
    localStoragePath: process.env.LOCAL_STORAGE_PATH, // OPT
    s3Region: process.env.SUPABASE_S3_REGION!, // REQ
    s3Bucket: process.env.SUPABASE_S3_BUCKET!, // REQ
    s3Endpoint: process.env.SUPABASE_S3_ENDPOINT!, // REQ
    s3AccessKey: process.env.SUPABASE_S3_ACCESS_KEY!, // REQ
    s3AccessKeySecret: process.env.SUPABASE_S3_ACCESS_KEY_SECRET!, // REQ
  })
);

export default x;
