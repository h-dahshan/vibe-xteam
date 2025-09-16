import { envSchema, optionalConfigKeys } from "../schemas/env.schema";

/**
 * Validates environment configuration using Zod schema
 * @param config - Raw environment configuration object
 * @returns Validated and transformed configuration
 * @throws Error if required configurations are missing or invalid
 */
export function validateEnv(config: Record<string, unknown>) {
  // Perform Zod validation
  const result = envSchema.safeParse(config);

  if (!result.success) {
    // Format and display validation errors
    console.error("❌ Configuration validation failed:\n");

    const errors = result.error.issues;
    const errorMessages: string[] = [];

    // Collect all error messages
    errors.forEach((error) => {
      errorMessages.push(
        `  ❗ ${error.path.join("/")}:${error.code}: ${error.message}`
      );
    });

    // Print all errors
    errorMessages.forEach((msg) => console.error(msg));
    console.error("\n");

    throw new Error(
      "Application startup failed due to configuration errors. Please check your .env file."
    );
  }

  // Log warnings for missing optional configurations
  console.log("🔍 Checking optional configurations...\n");

  const missingOptional = optionalConfigKeys.filter((key) => !config[key]);

  if (missingOptional.length > 0) {
    console.warn(
      "⚠️  The following optional configurations are missing (using defaults):"
    );
    missingOptional.forEach((key) => {
      console.warn(`   • ${key}`);
    });
    console.warn("\n");
  } else {
    console.log("✅ All optional configurations provided\n");
  }

  return result.data;
}
