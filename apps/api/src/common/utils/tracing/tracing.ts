import * as crypto from "crypto";
import { createId } from "@paralleldrive/cuid2";
import {
  TraceFormat,
  TraceHeader,
  TraceContext,
  TraceHeaders,
  W3CTraceContext,
} from "./tracing.types";

/**
 * Static utility class for trace ID generation and manipulation
 * No dependency injection required - use directly via static methods
 */
export class TraceUtils {
  /**
   * Generate a trace ID in the specified format
   */
  static generateTraceId(format: TraceFormat = TraceFormat.HEX32): string {
    switch (format) {
      case TraceFormat.UUID:
        return crypto.randomUUID();
      case TraceFormat.CUID2:
        return createId();
      case TraceFormat.HEX16:
        return crypto.randomBytes(8).toString("hex");
      case TraceFormat.HEX32:
        return crypto.randomBytes(16).toString("hex");
      case TraceFormat.W3C:
        // W3C trace IDs are 32 hex characters
        return crypto.randomBytes(16).toString("hex");
      default:
        return crypto.randomBytes(16).toString("hex");
    }
  }

  /**
   * Generate a span ID (16 hex characters)
   */
  static generateSpanId(): string {
    return crypto.randomBytes(8).toString("hex");
  }

  /**
   * Generate a correlation ID with optional prefix
   */
  static generateCorrelationId(prefix?: string): string {
    const id = crypto.randomUUID();
    return prefix ? `${prefix}-${id}` : id;
  }

  /**
   * Generate W3C compliant trace ID (32 hex characters)
   */
  static generateW3CTraceId(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  /**
   * Generate W3C compliant span ID (16 hex characters)
   */
  static generateW3CSpanId(): string {
    return crypto.randomBytes(8).toString("hex");
  }

  /**
   * Validate if a string is a valid trace ID
   */
  static isValidTraceId(traceId: string): boolean {
    if (!traceId || typeof traceId !== "string") {
      return false;
    }

    // UUID format
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        traceId
      )
    ) {
      return true;
    }

    // CUID2 format (alphanumeric, typically 24+ chars, no hyphens)
    if (/^[a-z0-9]{20,}$/i.test(traceId)) {
      return true;
    }

    // W3C hex format (exactly 32 or 16 chars)
    if (/^[0-9a-f]{16}$/i.test(traceId) || /^[0-9a-f]{32}$/i.test(traceId)) {
      return true;
    }

    // Custom trace ID format: must be reasonably long and follow a pattern
    // Accept alphanumeric with hyphens/underscores but require:
    // - Minimum 12 characters (to avoid short strings like "not-a-uuid")
    // - Contains at least some numbers or follows a structured pattern
    if (
      traceId.length >= 12 &&
      traceId.length <= 128 &&
      /^[a-zA-Z0-9-_]+$/.test(traceId) &&
      (/\d/.test(traceId) || /^[a-z]+[-_][a-z0-9]/i.test(traceId))
    ) {
      return true;
    }

    return false;
  }

  /**
   * Sanitize a trace ID to ensure it's safe for headers/logging
   */
  static sanitizeTraceId(traceId: string): string {
    if (!traceId) {
      return "";
    }
    // Remove any non-alphanumeric characters except hyphens and underscores
    return traceId.replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 128);
  }

  /**
   * Extract trace context from HTTP headers
   */
  static extractTraceContext(
    headers: Record<string, string | string[] | undefined>
  ): TraceContext | null {
    // Normalize headers to lowercase for case-insensitive lookup
    const normalizedHeaders: Record<string, string> = {};
    for (const key in headers) {
      const value = headers[key];
      if (value && typeof value === "string") {
        normalizedHeaders[key.toLowerCase()] = value;
      }
    }

    // Try W3C traceparent first
    const traceparent =
      normalizedHeaders[TraceHeader.W3C_TRACEPARENT.toLowerCase()];
    if (traceparent) {
      const context = this.parseW3CTraceparent(traceparent);
      if (context) {
        return {
          traceId: context.traceId,
          spanId: context.parentId,
          traceFlags: parseInt(context.traceFlags, 16),
          correlationId:
            normalizedHeaders[TraceHeader.CORRELATION_ID.toLowerCase()],
          traceState:
            normalizedHeaders[TraceHeader.W3C_TRACESTATE.toLowerCase()],
        };
      }
    }

    // Try custom headers
    const traceId = normalizedHeaders[TraceHeader.TRACE_ID.toLowerCase()];
    const spanId = normalizedHeaders[TraceHeader.SPAN_ID.toLowerCase()];
    const correlationId =
      normalizedHeaders[TraceHeader.CORRELATION_ID.toLowerCase()];

    if (traceId || correlationId) {
      return {
        traceId: traceId || this.generateW3CTraceId(),
        spanId: spanId || this.generateW3CSpanId(),
        correlationId,
      };
    }

    return null;
  }

  /**
   * Parse W3C traceparent header
   * Format: version-traceid-parentid-traceflags
   * Example: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
   */
  static parseW3CTraceparent(traceparent: string): W3CTraceContext | null {
    if (!traceparent) {
      return null;
    }

    const parts = traceparent.split("-");
    if (parts.length !== 4) {
      return null;
    }

    const [version, traceId, parentId, traceFlags] = parts;

    // Validate version (should be "00")
    if (version !== "00") {
      return null;
    }

    // Validate trace ID (32 hex chars)
    if (!traceId || !/^[0-9a-f]{32}$/i.test(traceId)) {
      return null;
    }

    // Validate parent ID (16 hex chars)
    if (!parentId || !/^[0-9a-f]{16}$/i.test(parentId)) {
      return null;
    }

    // Validate trace flags (2 hex chars)
    if (!traceFlags || !/^[0-9a-f]{2}$/i.test(traceFlags)) {
      return null;
    }

    return {
      version,
      traceId,
      parentId,
      traceFlags,
    };
  }

  /**
   * Create W3C traceparent header
   */
  static createW3CTraceparent(
    traceId: string,
    spanId: string,
    sampled: boolean = true
  ): string {
    const flags = sampled ? "01" : "00";
    return `00-${traceId}-${spanId}-${flags}`;
  }

  /**
   * Create trace headers for propagation
   */
  static createTraceHeaders(context: TraceContext): TraceHeaders {
    const headers: TraceHeaders = {};

    if (context.traceId && context.spanId) {
      headers[TraceHeader.W3C_TRACEPARENT] = this.createW3CTraceparent(
        context.traceId,
        context.spanId,
        context.traceFlags === 1
      );
    }

    if (context.traceState) {
      headers[TraceHeader.W3C_TRACESTATE] = context.traceState;
    }

    if (context.traceId) {
      headers[TraceHeader.TRACE_ID] = context.traceId;
    }

    if (context.spanId) {
      headers[TraceHeader.SPAN_ID] = context.spanId;
    }

    if (context.correlationId) {
      headers[TraceHeader.CORRELATION_ID] = context.correlationId;
    }

    return headers;
  }

  /**
   * Generate a deterministic trace ID from a seed (useful for testing)
   */
  static generateDeterministicId(seed: string): string {
    const hash = crypto.createHash("sha256").update(seed).digest("hex");
    return hash.substring(0, 32);
  }

  /**
   * Convert trace ID between formats
   */
  static convertTraceId(traceId: string, toFormat: TraceFormat): string {
    // If invalid, generate new
    if (!this.isValidTraceId(traceId)) {
      return this.generateTraceId(toFormat);
    }

    // For now, generate a new ID in the target format
    // In production, you might want to implement actual conversion logic
    return this.generateTraceId(toFormat);
  }
}
