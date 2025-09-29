/**
 * Type definitions and constants for tracing utilities
 * Used by both Logger and OTEL modules
 */

// ============================================================================
// Enums (Constants)
// ============================================================================

// Metadata keys for CLS (Continuation Local Storage)
export enum MetadataKey {
  // Tracing identifiers
  CORRELATION_ID = "correlationId",
  TRACE_ID = "traceId",
  SPAN_ID = "spanId",
  PARENT_SPAN_ID = "parentSpanId",
  REQUEST_ID = "requestId",

  // User context
  USER_ID = "userId",
  ORGANIZATION_ID = "organizationId",
  TENANT_ID = "tenantId",

  // Request context
  METHOD = "method",
  PATH = "path",
  URL = "url",
  DURATION = "duration",
  STATUS_CODE = "statusCode",
  IP_ADDRESS = "ipAddress",
  USER_AGENT = "userAgent",

  // System context
  SERVICE = "service",
  ENVIRONMENT = "environment",
  VERSION = "version",
  HOSTNAME = "hostname",
  TIMESTAMP = "timestamp",

  // Trace flags
  TRACE_FLAGS = "traceFlags",
  TRACE_STATE = "traceState",
}

// HTTP headers for trace propagation
export enum TraceHeader {
  // Custom headers
  CORRELATION_ID = "x-correlation-id",
  TRACE_ID = "x-trace-id",
  SPAN_ID = "x-span-id",
  REQUEST_ID = "x-request-id",

  // W3C Trace Context
  W3C_TRACEPARENT = "traceparent",
  W3C_TRACESTATE = "tracestate",

  // Other standards
  B3_TRACE_ID = "x-b3-traceid",
  B3_SPAN_ID = "x-b3-spanid",
  B3_PARENT_SPAN_ID = "x-b3-parentspanid",
  B3_SAMPLED = "x-b3-sampled",

  // AWS
  AWS_TRACE_ID = "x-amzn-trace-id",
}

// Span attribute keys for OpenTelemetry
export enum SpanAttribute {
  // Custom attributes
  CORRELATION_ID = "correlation.id",
  PARENT_SPAN_ID = "parent.span.id",
  USER_ID = "user.id",
  ORGANIZATION_ID = "organization.id",
  REQUEST_ID = "request.id",

  // Standard OpenTelemetry attributes
  HTTP_METHOD = "http.method",
  HTTP_URL = "http.url",
  HTTP_TARGET = "http.target",
  HTTP_HOST = "http.host",
  HTTP_SCHEME = "http.scheme",
  HTTP_STATUS_CODE = "http.status_code",
  HTTP_USER_AGENT = "http.user_agent",

  // Network attributes
  NET_PEER_IP = "net.peer.ip",
  NET_PEER_PORT = "net.peer.port",
  NET_HOST_NAME = "net.host.name",

  // Error attributes
  ERROR_TYPE = "error.type",
  ERROR_MESSAGE = "error.message",
  ERROR_STACK = "error.stack",
}

// Trace ID formats
export enum TraceFormat {
  UUID = "uuid", // Standard UUID v4
  CUID2 = "cuid2", // Collision-resistant IDs
  HEX16 = "hex16", // 16 character hex (span IDs)
  HEX32 = "hex32", // 32 character hex (trace IDs)
  W3C = "w3c", // W3C Trace Context format
}

// ============================================================================
// Interfaces
// ============================================================================

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  correlationId?: string;
  traceFlags?: number;
  traceState?: string;
  baggage?: Record<string, string>;
}

export interface TraceHeaders {
  [key: string]: string | undefined;
  traceparent?: string;
  tracestate?: string;
  "x-trace-id"?: string;
  "x-span-id"?: string;
  "x-correlation-id"?: string;
}

export interface W3CTraceContext {
  version: string;
  traceId: string;
  parentId: string;
  traceFlags: string;
}
