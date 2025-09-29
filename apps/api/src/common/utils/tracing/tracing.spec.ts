import { TraceUtils } from "./tracing";
import { TraceFormat, TraceContext } from "./tracing.types";

describe("TraceUtils", () => {
  describe("generateTraceId", () => {
    it("should generate UUID format", () => {
      const id = TraceUtils.generateTraceId(TraceFormat.UUID);
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it("should generate HEX32 format by default", () => {
      const id = TraceUtils.generateTraceId();
      expect(id).toMatch(/^[0-9a-f]{32}$/i);
      expect(id).toHaveLength(32);
    });

    it("should generate HEX16 format", () => {
      const id = TraceUtils.generateTraceId(TraceFormat.HEX16);
      expect(id).toMatch(/^[0-9a-f]{16}$/i);
      expect(id).toHaveLength(16);
    });

    it("should generate CUID2 format", () => {
      const id = TraceUtils.generateTraceId(TraceFormat.CUID2);
      expect(id).toMatch(/^[a-z0-9]+$/i);
      expect(id.length).toBeGreaterThanOrEqual(20);
    });

    it("should generate W3C format (32 hex)", () => {
      const id = TraceUtils.generateTraceId(TraceFormat.W3C);
      expect(id).toMatch(/^[0-9a-f]{32}$/i);
      expect(id).toHaveLength(32);
    });
  });

  describe("generateSpanId", () => {
    it("should generate 16 hex character span ID", () => {
      const spanId = TraceUtils.generateSpanId();
      expect(spanId).toMatch(/^[0-9a-f]{16}$/i);
      expect(spanId).toHaveLength(16);
    });

    it("should generate unique IDs", () => {
      const id1 = TraceUtils.generateSpanId();
      const id2 = TraceUtils.generateSpanId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("generateCorrelationId", () => {
    it("should generate UUID without prefix", () => {
      const id = TraceUtils.generateCorrelationId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it("should generate UUID with prefix", () => {
      const id = TraceUtils.generateCorrelationId("req");
      expect(id).toMatch(
        /^req-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it("should generate unique IDs", () => {
      const id1 = TraceUtils.generateCorrelationId();
      const id2 = TraceUtils.generateCorrelationId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("generateW3CTraceId", () => {
    it("should generate 32 hex character trace ID", () => {
      const traceId = TraceUtils.generateW3CTraceId();
      expect(traceId).toMatch(/^[0-9a-f]{32}$/i);
      expect(traceId).toHaveLength(32);
    });
  });

  describe("generateW3CSpanId", () => {
    it("should generate 16 hex character span ID", () => {
      const spanId = TraceUtils.generateW3CSpanId();
      expect(spanId).toMatch(/^[0-9a-f]{16}$/i);
      expect(spanId).toHaveLength(16);
    });
  });

  describe("isValidTraceId", () => {
    it("should validate UUID format", () => {
      expect(
        TraceUtils.isValidTraceId("550e8400-e29b-41d4-a716-446655440000")
      ).toBe(true);
      expect(TraceUtils.isValidTraceId("not-a-uuid")).toBe(false);
    });

    it("should validate hex32 format", () => {
      expect(TraceUtils.isValidTraceId("a".repeat(32))).toBe(true);
      expect(
        TraceUtils.isValidTraceId("0123456789abcdef" + "0".repeat(16))
      ).toBe(true);
    });

    it("should validate hex16 format", () => {
      expect(TraceUtils.isValidTraceId("b".repeat(16))).toBe(true);
      expect(TraceUtils.isValidTraceId("0123456789abcdef")).toBe(true);
    });

    it("should validate CUID2 format", () => {
      expect(TraceUtils.isValidTraceId("clh1o0p0f0000qzrmn831i7rn")).toBe(true);
    });

    it("should validate alphanumeric with hyphens", () => {
      expect(TraceUtils.isValidTraceId("trace-123-abc")).toBe(true);
      expect(TraceUtils.isValidTraceId("req_12345678")).toBe(true);
    });

    it("should reject invalid formats", () => {
      expect(TraceUtils.isValidTraceId("")).toBe(false);
      expect(TraceUtils.isValidTraceId("too-short")).toBe(false);
      expect(TraceUtils.isValidTraceId("invalid@chars")).toBe(false);
      // @ts-expect-error for testing
      expect(TraceUtils.isValidTraceId(null)).toBe(false);
      // @ts-expect-error for testing
      expect(TraceUtils.isValidTraceId(undefined)).toBe(false);
      // @ts-expect-error for testing
      expect(TraceUtils.isValidTraceId(123)).toBe(false);
    });
  });

  describe("sanitizeTraceId", () => {
    it("should remove invalid characters", () => {
      expect(TraceUtils.sanitizeTraceId("trace@123#abc")).toBe("trace123abc");
      expect(TraceUtils.sanitizeTraceId("id-with_underscores")).toBe(
        "id-with_underscores"
      );
    });

    it("should truncate to 128 characters", () => {
      const longId = "a".repeat(200);
      const sanitized = TraceUtils.sanitizeTraceId(longId);
      expect(sanitized).toHaveLength(128);
      expect(sanitized).toBe("a".repeat(128));
    });

    it("should handle empty input", () => {
      expect(TraceUtils.sanitizeTraceId("")).toBe("");
      // @ts-expect-error for testing
      expect(TraceUtils.sanitizeTraceId(null)).toBe("");
      // @ts-expect-error for testing
      expect(TraceUtils.sanitizeTraceId(undefined)).toBe("");
    });
  });

  describe("parseW3CTraceparent", () => {
    it("should parse valid traceparent header", () => {
      const traceparent =
        "00-12345678901234567890123456789012-1234567890123456-01";
      const result = TraceUtils.parseW3CTraceparent(traceparent);

      expect(result).toEqual({
        version: "00",
        traceId: "12345678901234567890123456789012",
        parentId: "1234567890123456",
        traceFlags: "01",
      });
    });

    it("should reject invalid version", () => {
      const traceparent =
        "99-12345678901234567890123456789012-1234567890123456-01";
      expect(TraceUtils.parseW3CTraceparent(traceparent)).toBeNull();
    });

    it("should reject invalid format", () => {
      expect(TraceUtils.parseW3CTraceparent("invalid")).toBeNull();
      expect(
        TraceUtils.parseW3CTraceparent("00-invalid-invalid-01")
      ).toBeNull();
      expect(TraceUtils.parseW3CTraceparent("")).toBeNull();
      // @ts-expect-error for testing
      expect(TraceUtils.parseW3CTraceparent(null)).toBeNull();
    });

    it("should reject wrong number of parts", () => {
      expect(
        TraceUtils.parseW3CTraceparent("00-12345678901234567890123456789012")
      ).toBeNull();
      expect(
        TraceUtils.parseW3CTraceparent(
          "00-12345678901234567890123456789012-1234567890123456-01-extra"
        )
      ).toBeNull();
    });

    it("should reject invalid trace ID length", () => {
      const traceparent =
        "00-123456789012345678901234567890-1234567890123456-01"; // 31 chars
      expect(TraceUtils.parseW3CTraceparent(traceparent)).toBeNull();
    });

    it("should reject invalid span ID length", () => {
      const traceparent =
        "00-12345678901234567890123456789012-123456789012345-01"; // 15 chars
      expect(TraceUtils.parseW3CTraceparent(traceparent)).toBeNull();
    });
  });

  describe("createW3CTraceparent", () => {
    it("should create valid traceparent header with sampling", () => {
      const traceId = "a".repeat(32);
      const spanId = "b".repeat(16);
      const result = TraceUtils.createW3CTraceparent(traceId, spanId, true);

      expect(result).toBe(`00-${"a".repeat(32)}-${"b".repeat(16)}-01`);
    });

    it("should create valid traceparent header without sampling", () => {
      const traceId = "c".repeat(32);
      const spanId = "d".repeat(16);
      const result = TraceUtils.createW3CTraceparent(traceId, spanId, false);

      expect(result).toBe(`00-${"c".repeat(32)}-${"d".repeat(16)}-00`);
    });

    it("should default to sampled", () => {
      const traceId = "e".repeat(32);
      const spanId = "f".repeat(16);
      const result = TraceUtils.createW3CTraceparent(traceId, spanId);

      expect(result).toBe(`00-${"e".repeat(32)}-${"f".repeat(16)}-01`);
    });
  });

  describe("extractTraceContext", () => {
    it("should extract W3C traceparent", () => {
      const headers = {
        traceparent: "00-12345678901234567890123456789012-1234567890123456-01",
        tracestate: "vendor1=value1,vendor2=value2",
      };
      const context = TraceUtils.extractTraceContext(headers);

      expect(context).toEqual({
        traceId: "12345678901234567890123456789012",
        spanId: "1234567890123456",
        traceFlags: 1,
        correlationId: undefined,
        traceState: "vendor1=value1,vendor2=value2",
      });
    });

    it("should extract custom headers", () => {
      const headers = {
        "x-trace-id": "trace-123",
        "x-span-id": "span-456",
        "x-correlation-id": "corr-789",
      };
      const context = TraceUtils.extractTraceContext(headers);

      expect(context).toEqual({
        traceId: "trace-123",
        spanId: "span-456",
        correlationId: "corr-789",
      });
    });

    it("should handle case-insensitive headers", () => {
      const headers = {
        "X-Trace-ID": "trace-123",
        "X-SPAN-ID": "span-456",
        "X-Correlation-Id": "corr-789",
      };
      const context = TraceUtils.extractTraceContext(headers);

      expect(context).toEqual({
        traceId: "trace-123",
        spanId: "span-456",
        correlationId: "corr-789",
      });
    });

    it("should generate IDs if only correlation ID present", () => {
      const headers = {
        "x-correlation-id": "corr-123",
      };
      const context = TraceUtils.extractTraceContext(headers);

      expect(context?.correlationId).toBe("corr-123");
      expect(context?.traceId).toMatch(/^[0-9a-f]{32}$/i);
      expect(context?.spanId).toMatch(/^[0-9a-f]{16}$/i);
    });

    it("should return null if no trace headers", () => {
      const headers = {
        "content-type": "application/json",
      };
      const context = TraceUtils.extractTraceContext(headers);

      expect(context).toBeNull();
    });

    it("should handle array header values", () => {
      const headers = {
        "x-trace-id": ["trace-123"],
        "x-correlation-id": "corr-789",
      };
      const context = TraceUtils.extractTraceContext(headers);

      expect(context).toEqual({
        traceId: expect.any(String),
        spanId: expect.any(String),
        correlationId: "corr-789",
      });
    });
  });

  describe("createTraceHeaders", () => {
    it("should create all trace headers", () => {
      const context: TraceContext = {
        traceId: "a".repeat(32),
        spanId: "b".repeat(16),
        correlationId: "corr-123",
        traceFlags: 1,
        traceState: "vendor=value",
      };
      const headers = TraceUtils.createTraceHeaders(context);

      expect(headers).toEqual({
        traceparent: `00-${"a".repeat(32)}-${"b".repeat(16)}-01`,
        tracestate: "vendor=value",
        "x-trace-id": "a".repeat(32),
        "x-span-id": "b".repeat(16),
        "x-correlation-id": "corr-123",
      });
    });

    it("should handle partial context", () => {
      const context: TraceContext = {
        traceId: "trace-123",
        spanId: "",
        correlationId: "corr-456",
      };
      const headers = TraceUtils.createTraceHeaders(context);

      expect(headers).toEqual({
        "x-trace-id": "trace-123",
        "x-correlation-id": "corr-456",
      });
      expect(headers.traceparent).toBeUndefined();
      expect(headers["x-span-id"]).toBeUndefined();
    });

    it("should handle unsampled traces", () => {
      const context: TraceContext = {
        traceId: "c".repeat(32),
        spanId: "d".repeat(16),
        traceFlags: 0,
      };
      const headers = TraceUtils.createTraceHeaders(context);

      expect(headers.traceparent).toBe(
        `00-${"c".repeat(32)}-${"d".repeat(16)}-00`
      );
    });
  });

  describe("generateDeterministicId", () => {
    it("should generate consistent ID from seed", () => {
      const seed = "test-seed";
      const id1 = TraceUtils.generateDeterministicId(seed);
      const id2 = TraceUtils.generateDeterministicId(seed);

      expect(id1).toBe(id2);
      expect(id1).toMatch(/^[0-9a-f]{32}$/i);
    });

    it("should generate different IDs for different seeds", () => {
      const id1 = TraceUtils.generateDeterministicId("seed1");
      const id2 = TraceUtils.generateDeterministicId("seed2");

      expect(id1).not.toBe(id2);
    });
  });

  describe("convertTraceId", () => {
    it("should generate new ID if input is invalid", () => {
      const result = TraceUtils.convertTraceId("invalid", TraceFormat.UUID);
      expect(result).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it("should generate ID in target format", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const result = TraceUtils.convertTraceId(uuid, TraceFormat.HEX32);
      expect(result).toMatch(/^[0-9a-f]{32}$/i);
    });
  });
});
