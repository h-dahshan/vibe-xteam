import { registerAs } from "@nestjs/config";
import type { DatabaseConfig } from "../types/config.types";

/**
 * Database configuration namespace
 * Loads database connection environment variables
 */
export default registerAs(
  "database",
  (): DatabaseConfig => ({
    url: process.env.SUPABASE_DATABASE_URL!,
    directUrl: process.env.SUPABASE_DIRECT_URL!,
  })
);
