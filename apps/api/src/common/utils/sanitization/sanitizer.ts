import { RedactionLevel, SanitizerConfig } from "./types";
import {
  COMBINED_VALUE_PATTERN,
  REDACTION_LABELS,
  SENSITIVE_KEY_PATTERN,
} from "./patterns";

/**
 * High-performance sanitizer using single-pass traversal and compiled patterns
 */
export class Sanitizer {
  private readonly config: Required<SanitizerConfig>;
  private readonly visited = new WeakSet<object>();

  constructor(config: SanitizerConfig = {}) {
    this.config = {
      redactionLevel: config.redactionLevel || RedactionLevel.FULL,
      customPatterns: config.customPatterns || {},
      excludeKeys: config.excludeKeys || [],
      maxDepth: config.maxDepth || 100,
      maxMessageLength: config.maxMessageLength || 500,
      maxStackLines: config.maxStackLines || 10,
      removeStackTrace: config.removeStackTrace ?? false,
    };
  }

  /**
   * Sanitize any data structure
   */
  sanitize(data: unknown, depth = 0): unknown {
    // Prevent infinite recursion
    if (depth > this.config.maxDepth) {
      return "[MAX_DEPTH_EXCEEDED]";
    }

    // Handle null/undefined
    if (data == null) return data;

    // Handle Error instances
    if (data instanceof Error) {
      return this.sanitizeError(data);
    }

    // Handle strings with pattern matching
    if (typeof data === "string") {
      return this.sanitizeString(data);
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item, depth + 1));
    }

    // Handle objects
    if (typeof data === "object") {
      // Check if it's an error-like object
      if (this.isErrorLikeObject(data)) {
        return this.sanitizeErrorObject(data as Record<string, unknown>);
      }
      // Check circular references
      if (this.visited.has(data)) {
        return "[CIRCULAR]";
      }
      this.visited.add(data);

      const result: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(data)) {
        // Skip excluded keys
        if (this.config.excludeKeys.includes(key)) {
          result[key] = value;
          continue;
        }

        // Check if key itself is sensitive
        if (SENSITIVE_KEY_PATTERN.test(key)) {
          result[key] = "[REDACTED]";
        } else {
          // Recursively sanitize value
          result[key] = this.sanitize(value, depth + 1);
        }
      }

      return result;
    }

    // Return primitives as-is
    return data;
  }

  /**
   * Sanitize string values using mega-regex
   */
  private sanitizeString(value: string, skipTruncation = false): string {
    // Apply truncation if needed (unless skipped for stack traces)
    let processedValue = value;
    if (
      !skipTruncation &&
      this.config.maxMessageLength &&
      value.length > this.config.maxMessageLength
    ) {
      processedValue = value.substring(0, this.config.maxMessageLength) + "...";
    }

    // Single regex replace with all patterns
    return processedValue.replace(COMBINED_VALUE_PATTERN, (match, ...args) => {
      // Find which named group matched
      const groups = args[args.length - 1] as Record<string, string>;
      const matchedType = Object.keys(groups).find(
        (key) => groups[key] !== undefined
      );

      if (!matchedType) return match;

      // Special handling for CVV - preserve the label
      if (matchedType === "cvv") {
        const cvvMatch = match.match(
          /((?:cvv|CVV|cvc|CVC|cid|CID)[\s:]*)\d{3,4}/
        );
        if (cvvMatch) {
          return `${cvvMatch[1]}[CVV_REDACTED]`;
        }
      }

      // Apply redaction based on level
      if (this.config.redactionLevel === RedactionLevel.NONE) {
        return match;
      }

      if (this.config.redactionLevel === RedactionLevel.PARTIAL) {
        return this.partialRedact(match, matchedType);
      }

      if (this.config.redactionLevel === RedactionLevel.HASH) {
        return this.hashRedact(match, matchedType);
      }

      // Full redaction
      return `[${REDACTION_LABELS[matchedType] || "REDACTED"}]`;
    });
  }

  /**
   * Apply partial redaction to sensitive data
   */
  private partialRedact(value: string, type: string): string {
    switch (type) {
      case "email": {
        const parts = value.split("@");
        if (parts.length === 2 && parts[0] && parts[1]) {
          const username = parts[0];
          const domain = parts[1];
          const masked = username.substring(0, 2) + "***";
          return `${masked}@${domain}`;
        }
        return "[EMAIL_REDACTED]";
      }

      case "phone": {
        const digits = value.replace(/\D/g, "");
        if (digits.length >= 10) {
          return `***-***-${digits.slice(-4)}`;
        }
        return "[PHONE_REDACTED]";
      }

      case "ssn": {
        const digits = value.replace(/\D/g, "");
        if (digits.length === 9) {
          return `***-**-${digits.slice(-4)}`;
        }
        return "[SSN_REDACTED]";
      }

      case "card": {
        const digits = value.replace(/\D/g, "");
        if (digits.length >= 12) {
          return "*".repeat(digits.length - 4) + digits.slice(-4);
        }
        return "[CARD_REDACTED]";
      }

      case "apikey": {
        const match = value.match(/^([a-z]+_)/i);
        if (match) {
          return `${match[1]}****...${value.slice(-3)}`;
        }
        if (value.length > 10) {
          return `${value.substring(0, 4)}...${value.slice(-3)}`;
        }
        return "[APIKEY_REDACTED]";
      }

      case "jwt":
        return "[JWT_REDACTED]";

      default:
        return `[${REDACTION_LABELS[type] || "REDACTED"}]`;
    }
  }

  /**
   * Apply hash redaction - creates deterministic hash for tracking
   */
  private hashRedact(value: string, type: string): string {
    const hash = this.simpleHash(value);
    const label =
      REDACTION_LABELS[type]?.replace("_REDACTED", "") || type.toUpperCase();
    return `${label.toLowerCase()}_${hash}`;
  }

  /**
   * Simple hash function for consistent redaction
   * Creates deterministic hash from string value
   */
  private simpleHash(value: string): string {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36).substring(0, 8);
  }

  /**
   * Check if object looks like an error
   */
  private isErrorLikeObject(value: unknown): boolean {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    const obj = value as Record<string, unknown>;
    return (
      "message" in obj ||
      "stack" in obj ||
      "stackTrace" in obj ||
      "error" in obj ||
      "exception" in obj
    );
  }

  /**
   * Sanitize Error instances
   */
  private sanitizeError(error: Error): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {
      name: error.name,
      message: this.sanitizeString(error.message),
    };

    // Handle stack trace
    if (error.stack) {
      if (this.config.removeStackTrace) {
        sanitized.stack = "[STACK_TRACE_REMOVED]";
      } else {
        sanitized.stack = this.sanitizeStackTrace(error.stack);
      }
    }

    // Preserve error code if present
    if ("code" in error) {
      sanitized.code = (error as any).code;
    }

    return sanitized;
  }

  /**
   * Sanitize error-like objects
   */
  private sanitizeErrorObject(
    obj: Record<string, unknown>
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (key === "message") {
        // Sanitize message with truncation
        result[key] =
          typeof value === "string" ? this.sanitizeString(value) : value;
      } else if (key === "stack" || key === "stackTrace") {
        // Handle stack traces
        if (this.config.removeStackTrace) {
          result[key] = "[STACK_TRACE_REMOVED]";
        } else if (typeof value === "string") {
          result[key] = this.sanitizeStackTrace(value);
        } else {
          result[key] = value;
        }
      } else if (key === "error" || key === "exception") {
        // Recursively sanitize nested errors
        result[key] = this.sanitize(value);
      } else if (!SENSITIVE_KEY_PATTERN.test(key)) {
        // Keep non-sensitive fields
        result[key] = this.sanitize(value);
      } else {
        // Redact sensitive keys
        result[key] = "[REDACTED]";
      }
    }

    return result;
  }

  /**
   * Sanitize stack traces with line limiting
   */
  private sanitizeStackTrace(stack: string): string {
    // Process line by line to preserve structure for truncation
    const lines = stack.split("\n");

    // Apply truncation if configured
    let processedLines = lines;
    let truncated = false;
    if (this.config.maxStackLines && lines.length > this.config.maxStackLines) {
      processedLines = lines.slice(0, this.config.maxStackLines);
      truncated = true;
    }

    // Sanitize each line
    const sanitizedLines = processedLines.map((line) =>
      this.sanitizeString(line, true)
    );

    // Add truncation message if needed
    if (truncated) {
      sanitizedLines.push("    ... stack trace truncated");
    }

    return sanitizedLines.join("\n");
  }
}
