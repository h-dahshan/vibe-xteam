import { ClsService } from "nestjs-cls";
import { LOG_METADATA_KEYS } from "../constants/logger.constants";

/**
 * Utility class for extracting context from CLS
 * Provides centralized context management for logging
 */
export class LogContextUtil {
  /**
   * Extract all relevant context from CLS service
   * Returns empty object if no context available
   */
  static extractContext(cls: ClsService): Record<string, any> {
    if (!cls) {
      return {};
    }

    const context: Record<string, any> = {};

    // Extract correlation ID
    const correlationId = cls.get(LOG_METADATA_KEYS.CORRELATION_ID);
    if (correlationId) {
      context.correlationId = correlationId;
    }

    // Extract user ID if available
    const userId = cls.get(LOG_METADATA_KEYS.USER_ID);
    if (userId) {
      context.userId = userId;
    }

    // Extract trace ID if available (for distributed tracing)
    const traceId = cls.get(LOG_METADATA_KEYS.TRACE_ID);
    if (traceId) {
      context.traceId = traceId;
    }

    // Extract span ID if available (for distributed tracing)
    const spanId = cls.get(LOG_METADATA_KEYS.SPAN_ID);
    if (spanId) {
      context.spanId = spanId;
    }

    // Extract request ID if different from correlation ID
    const requestId = cls.get(LOG_METADATA_KEYS.REQUEST_ID);
    if (requestId && requestId !== correlationId) {
      context.requestId = requestId;
    }

    return context;
  }

  /**
   * Set user context in CLS
   * Useful after authentication
   */
  static setUserContext(cls: ClsService, userId: string | number): void {
    if (cls && userId) {
      cls.set(LOG_METADATA_KEYS.USER_ID, userId);
    }
  }

  /**
   * Set trace context for distributed tracing
   * Useful when integrating with OpenTelemetry
   */
  static setTraceContext(
    cls: ClsService,
    traceId: string,
    spanId?: string
  ): void {
    if (cls) {
      if (traceId) {
        cls.set(LOG_METADATA_KEYS.TRACE_ID, traceId);
      }
      if (spanId) {
        cls.set(LOG_METADATA_KEYS.SPAN_ID, spanId);
      }
    }
  }
}
