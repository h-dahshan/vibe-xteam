import { z } from "zod";

/**
 * Authentication configuration schema - Required
 */
export const authSchema = z.object({
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+$/, "JWT_EXPIRES_IN must be a number (in seconds)")
    .default("3600")
    .transform((val) => parseInt(val, 10)),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters long"),
  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .regex(/^\d+$/, "JWT_REFRESH_EXPIRES_IN must be a number (in seconds)")
    .default("604800")
    .transform((val) => parseInt(val, 10)),
  BCRYPT_SALT_ROUNDS: z
    .string()
    .regex(/^\d+$/, "BCRYPT_SALT_ROUNDS must be a number")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(10).max(15))
    .default(12),
});

export type AuthSchemaType = z.infer<typeof authSchema>;
