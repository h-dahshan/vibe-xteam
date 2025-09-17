import { registerAs } from "@nestjs/config";
import type { AuthConfig } from "../types/config.types";

/**
 * Authentication configuration namespace
 * Loads JWT and password-related environment variables
 */
export default registerAs(
  "auth",
  (): AuthConfig => ({
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: parseInt(process.env.JWT_EXPIRES_IN || "3600", 10),
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
    jwtRefreshExpiresIn: parseInt(
      process.env.JWT_REFRESH_EXPIRES_IN || "604800",
      10
    ),
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),
  })
);
