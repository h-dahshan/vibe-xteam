/**
 * Safely stringify an object, handling circular references
 */
export function safeStringify(
  obj: unknown,
  replacer?: (key: string, value: unknown) => unknown,
  space?: string | number
): string {
  const seen = new WeakSet();

  const circularReplacer = (key: string, value: unknown): unknown => {
    // Handle circular references
    if (value !== null && typeof value === "object") {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }

    // Apply custom replacer if provided
    if (replacer) {
      return replacer(key, value);
    }

    return value;
  };

  try {
    return JSON.stringify(obj, circularReplacer, space);
  } catch (error) {
    // Fallback for any other stringify errors
    return `[Unable to stringify: ${error instanceof Error ? error.message : "Unknown error"}]`;
  }
}
