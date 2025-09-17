import { registerAs } from "@nestjs/config";
import type { AppConfig } from "../types/config.types";

/**
 * Application configuration namespace
 * Loads app-specific environment variables
 */
export default registerAs(
  "app",
  (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV! as AppConfig["nodeEnv"], // REQ
    name: process.env.APP_NAME!, // REQ
    version: process.env.APP_VERSION!, // REQ
    url: process.env.APP_URL!, // REQ
    apiPrefix: process.env.API_PREFIX!, // REQ
    apiVersion: process.env.API_VERSION!, // REQ
    localesSupported: process.env.LOCALES_SUPPORTED?.split(",").map((s) =>
      s.trim()
    ) || ["en"], // OPT with default
    localesDefault: process.env.LOCALES_DEFAULT || "en", // OPT with default
    localesFallback: process.env.LOCALES_FALLBACK || "en", // OPT with default
  })
);
