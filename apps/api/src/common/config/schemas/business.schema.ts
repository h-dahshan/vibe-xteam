import { z } from "zod";

/**
 * Business configuration schema - Optional with defaults
 */
export const businessSchema = z.object({
  DEFAULT_TIMEZONE: z.string().default("UTC"),
  BUSINESS_TIMEZONE: z.string().default("America/New_York"),
});

export type BusinessSchemaType = z.infer<typeof businessSchema>;
