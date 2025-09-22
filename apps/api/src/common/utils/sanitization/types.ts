/**
 * Redaction levels for sensitive data
 */
export enum RedactionLevel {
  FULL = "full", // Complete redaction
  PARTIAL = "partial", // Show partial data (e.g., last 4 digits)
  HASH = "hash", // Deterministic hash for tracking
  NONE = "none", // No redaction (dangerous!)
}

/**
 * Configuration options for the sanitizer
 */
export interface SanitizerConfig {
  redactionLevel?: RedactionLevel;
  customPatterns?: Record<string, RegExp>;
  excludeKeys?: string[];
  maxDepth?: number;
  maxMessageLength?: number;
  maxStackLines?: number;
  removeStackTrace?: boolean;
}

/**
 * Types of sensitive data that can be detected
 */
export type SensitiveDataType =
  | "email"
  | "phone"
  | "ssn"
  | "ip"
  | "dob"
  | "card"
  | "cvv"
  | "jwt"
  | "bearer"
  | "basic"
  | "apikey"
  | "path"
  | "stack_trace"
  | "node_modules"
  | "sensitive_file";

/**
 * Result of pattern matching
 */
export interface PatternMatch {
  type: SensitiveDataType;
  value: string;
  start: number;
  end: number;
}
