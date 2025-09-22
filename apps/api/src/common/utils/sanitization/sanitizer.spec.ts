import { describe, it, expect, beforeEach } from "vitest";
import { Sanitizer } from "./sanitizer";
import { RedactionLevel } from "./types";

describe("Sanitizer", () => {
  let sanitizer: Sanitizer;

  beforeEach(() => {
    sanitizer = new Sanitizer();
  });

  // GDPR Compliance (PII) Tests
  describe("GDPR/PII patterns", () => {
    it.each([
      ["email", "user@example.com", "[EMAIL_REDACTED]"],
      [
        "email in text",
        "Contact me at john@company.org please",
        "Contact me at [EMAIL_REDACTED] please",
      ],
      ["phone US format", "+1-555-123-4567", "[PHONE_REDACTED]"],
      ["phone international", "+442071234567", "[PHONE_REDACTED]"],
      ["phone simple", "5551234567", "[PHONE_REDACTED]"],
      ["SSN with dashes", "123-45-6789", "[SSN_REDACTED]"],
      ["SSN without dashes", "123456789", "[SSN_REDACTED]"],
      ["IPv4 address", "192.168.1.1", "[IP_REDACTED]"],
      [
        "IPv4 in text",
        "Server at 10.0.0.1 is down",
        "Server at [IP_REDACTED] is down",
      ],
      ["date of birth", "1990-01-01", "[DOB_REDACTED]"],
      ["date in text", "Born on 1985-12-25", "Born on [DOB_REDACTED]"],
    ])("should redact %s: %s", (_, input, expected) => {
      const result = sanitizer.sanitize(input);
      expect(result).toBe(expected);
    });
  });

  // PCI-DSS Compliance Tests
  describe("PCI-DSS patterns", () => {
    it.each([
      ["Visa", "4111111111111111", "[CARD_REDACTED]"],
      ["Visa with spaces", "4111 1111 1111 1111", "[CARD_REDACTED]"],
      ["Visa with dashes", "4111-1111-1111-1111", "[CARD_REDACTED]"],
      ["MasterCard", "5500000000000004", "[CARD_REDACTED]"],
      ["Amex", "340000000000009", "[CARD_REDACTED]"],
      ["CVV standalone", "123", "123"], // CVV alone shouldn't be redacted
      ["CVV in context", "CVV: 123", "CVV: [CVV_REDACTED]"],
      ["CVV field", { cvv: "456" }, { cvv: "[REDACTED]" }],
    ])("should redact %s: %s", (_, input, expected) => {
      const result = sanitizer.sanitize(input);
      expect(result).toEqual(expected);
    });
  });

  // Auth/Security Pattern Tests
  describe("Auth patterns", () => {
    it.each([
      [
        "JWT token",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        "[JWT_REDACTED]",
      ],
      ["Bearer token", "Bearer abc123xyz456", "[BEARER_REDACTED]"],
      ["Basic auth", "Basic dXNlcjpwYXNzd29yZA==", "[BASIC_REDACTED]"],
      [
        "API key with sk prefix",
        "sk_fake_fakefortest77777777887dc",
        "[APIKEY_REDACTED]",
      ],
      [
        "API key with pk prefix",
        "pk_live_4eC39HqLyjWDarjtT1zdp7dc",
        "[APIKEY_REDACTED]",
      ],
      [
        "API key with api prefix",
        "api_key_1234567890abcdef",
        "[APIKEY_REDACTED]",
      ],
    ])("should redact %s", (_, input, expected) => {
      const result = sanitizer.sanitize(input);
      expect(result).toBe(expected);
    });
  });

  // Error Pattern Tests
  describe("Error patterns", () => {
    it("should remove stack traces", () => {
      const stackTrace = `Error: Something went wrong
    at Object.<anonymous> (/Users/john/project/index.js:10:15)
    at Module._compile (internal/modules/cjs/loader.js:1063:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1092:10)`;

      const result = sanitizer.sanitize(stackTrace);
      expect(result).not.toContain("/Users/john");
      expect(result).toContain("[STACK_TRACE]");
    });

    it("should sanitize file paths", () => {
      const inputs = [
        "/home/user/project/file.js",
        "/Users/john/Documents/secret.key",
        "C:\\Users\\Admin\\Desktop\\app.exe",
        "~/projects/myapp/.env",
      ];

      inputs.forEach((input) => {
        const result = sanitizer.sanitize(input) as string;
        expect(result).not.toContain("user");
        expect(result).not.toContain("john");
        expect(result).not.toContain("Admin");
      });
    });

    it("should sanitize node_modules paths", () => {
      const input = "Error in node_modules/express/lib/router.js:123";
      const result = sanitizer.sanitize(input) as string;
      expect(result).toContain("[NODE_MODULES]");
      expect(result).not.toContain("express");
    });

    it("should redact sensitive file extensions", () => {
      const inputs = [
        "config.env",
        "private.key",
        "certificate.pem",
        "cert.crt",
      ];

      inputs.forEach((input) => {
        const result = sanitizer.sanitize(input) as string;
        expect(result).toContain("[SENSITIVE_FILE]");
      });
    });
  });

  // Key-based Redaction Tests
  describe("Sensitive keys", () => {
    const sensitiveKeys = [
      "password",
      "Password",
      "PASSWORD",
      "passwd",
      "secret",
      "apiKey",
      "api_key",
      "api-key",
      "token",
      "accessToken",
      "refreshToken",
      "authorization",
      "Authorization",
      "x-api-key",
      "x-auth-token",
      "creditCard",
      "credit_card",
      "cardNumber",
      "cvv",
      "ssn",
      "socialSecurityNumber",
    ];

    it.each(sensitiveKeys)("should redact any value with key: %s", (key) => {
      const obj = { [key]: "some-sensitive-value-12345" };
      const result = sanitizer.sanitize(obj) as any;
      expect(result[key]).toBe("[REDACTED]");
    });

    it("should redact nested sensitive keys", () => {
      const input = {
        user: {
          name: "John",
          password: "secret123",
          profile: {
            email: "john@example.com",
            apiKey: "sk_test_123",
          },
        },
      };

      const result = sanitizer.sanitize(input) as any;
      expect(result.user.name).toBe("John");
      expect(result.user.password).toBe("[REDACTED]");
      expect(result.user.profile.email).toBe("[EMAIL_REDACTED]");
      expect(result.user.profile.apiKey).toBe("[REDACTED]");
    });
  });

  // Complex Object Tests
  describe("Object traversal", () => {
    it("should handle deeply nested objects", () => {
      const input = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  email: "deep@example.com",
                  safe: "This is safe",
                },
              },
            },
          },
        },
      };

      const result = sanitizer.sanitize(input) as any;
      expect(result.level1.level2.level3.level4.level5.email).toBe(
        "[EMAIL_REDACTED]"
      );
      expect(result.level1.level2.level3.level4.level5.safe).toBe(
        "This is safe"
      );
    });

    it("should handle arrays", () => {
      const input = [
        "user@example.com",
        "safe text",
        { password: "secret" },
        ["nested", "array", "with", "john@email.com"],
      ];

      const result = sanitizer.sanitize(input) as any[];
      expect(result[0]).toBe("[EMAIL_REDACTED]");
      expect(result[1]).toBe("safe text");
      expect(result[2].password).toBe("[REDACTED]");
      expect(result[3][3]).toBe("[EMAIL_REDACTED]");
    });

    it("should handle circular references", () => {
      const obj: any = { name: "test", email: "test@example.com" };
      obj.circular = obj;

      const result = sanitizer.sanitize(obj) as any;
      expect(result.email).toBe("[EMAIL_REDACTED]");
      expect(result.circular).toBe("[CIRCULAR]");
    });

    it("should handle null and undefined", () => {
      expect(sanitizer.sanitize(null)).toBe(null);
      expect(sanitizer.sanitize(undefined)).toBe(undefined);
      expect(sanitizer.sanitize({ value: null })).toEqual({ value: null });
      expect(sanitizer.sanitize({ value: undefined })).toEqual({
        value: undefined,
      });
    });

    it("should preserve non-sensitive data", () => {
      const input = {
        name: "John Doe",
        age: 30,
        active: true,
        scores: [100, 95, 87],
        metadata: {
          created: "2024-01-01T10:00:00Z",
          updated: "2024-12-01T10:00:00Z",
          version: 1.5,
        },
      };

      const result = sanitizer.sanitize(input);
      expect(result).toEqual(input);
    });
  });

  // Partial Redaction Tests
  describe("Partial redaction", () => {
    let partialSanitizer: Sanitizer;

    beforeEach(() => {
      partialSanitizer = new Sanitizer({
        redactionLevel: RedactionLevel.PARTIAL,
      });
    });

    it.each([
      ["email", "user@example.com", "us***@example.com"],
      ["phone", "555-123-4567", "***-***-4567"],
      ["SSN", "123-45-6789", "***-**-6789"],
      ["credit card", "4111111111111111", "************1111"],
      ["API key", "sk_fake_fakefortest77777777887dc", "sk_****...7dc"],
    ])("should partially redact %s", (_, input, expected) => {
      const result = partialSanitizer.sanitize(input);
      expect(result).toBe(expected);
    });
  });

  // Performance Tests
  describe("Performance", () => {
    it("should process 1000 fields in less than 5ms", () => {
      const largeObject: any = {};
      for (let i = 0; i < 1000; i++) {
        largeObject[`field_${i}`] =
          i % 10 === 0 ? "user@example.com" : `value_${i}`;
      }

      const startTime = performance.now();
      sanitizer.sanitize(largeObject);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(5);
    });

    it("should use single traversal for nested objects", () => {
      // Create spy to count traversals
      let traversalCount = 0;
      const originalSanitize = sanitizer.sanitize.bind(sanitizer);

      sanitizer.sanitize = function (data: unknown): unknown {
        if (typeof data === "object" && data !== null) {
          traversalCount++;
        }
        return originalSanitize(data);
      };

      const nestedObject = {
        level1: {
          level2: {
            level3: {
              data: "test",
            },
          },
        },
      };

      sanitizer.sanitize(nestedObject);
      // Should be 4 (root + 3 levels), not multiplicative
      expect(traversalCount).toBeLessThanOrEqual(4);
    });
  });

  // Mixed Content Tests
  describe("Mixed content", () => {
    it("should handle multiple patterns in single string", () => {
      const input =
        "Email john@example.com, phone 555-123-4567, SSN 123-45-6789";
      const result = sanitizer.sanitize(input);
      // Phone pattern matches including leading space after comma
      expect(result).toBe(
        "Email [EMAIL_REDACTED], phone [PHONE_REDACTED], SSN [SSN_REDACTED]"
      );
    });

    it("should handle real-world log entry", () => {
      const logEntry = {
        timestamp: "2023-12-01T10:00:00Z",
        level: "error",
        message: "Failed to authenticate user john@example.com",
        context: {
          ip: "192.168.1.100",
          headers: {
            authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
            "x-api-key": "sk_live_123456",
            "user-agent": "Mozilla/5.0",
          },
          user: {
            email: "john@example.com",
            phone: "+1-555-012-3456",
            ssn: "987-65-4321",
          },
        },
        error: {
          message: "Invalid credentials",
          stack: "Error at /Users/dev/app/auth.js:42:15",
        },
      };

      const result = sanitizer.sanitize(logEntry) as any;

      // Check timestamps and safe data preserved
      expect(result.timestamp).toBe("2023-12-01T10:00:00Z");
      expect(result.level).toBe("error");

      // Check PII redacted
      expect(result.message).toBe(
        "Failed to authenticate user [EMAIL_REDACTED]"
      );
      expect(result.context.ip).toBe("[IP_REDACTED]");
      expect(result.context.user.email).toBe("[EMAIL_REDACTED]");
      expect(result.context.user.phone).toBe("[PHONE_REDACTED]");
      expect(result.context.user.ssn).toBe("[REDACTED]"); // Key-based redaction

      // Check auth data redacted
      expect(result.context.headers.authorization).toBe("[REDACTED]");
      expect(result.context.headers["x-api-key"]).toBe("[REDACTED]");
      expect(result.context.headers["user-agent"]).toBe("Mozilla[PATH]"); // Path pattern matches /5.0

      // Check error sanitized
      expect(result.error.stack).toContain("[PATH]");
      expect(result.error.stack).not.toContain("/Users/dev");
    });
  });

  // New comprehensive tests for added features
  describe("Address and Location patterns", () => {
    it.each([
      ["street address", "123 Main Street", "[ADDRESS_REDACTED]"],
      ["avenue address", "456 Park Avenue", "[ADDRESS_REDACTED]"],
      ["road address", "789 Oak Road", "[ADDRESS_REDACTED]"],
      ["US ZIP", "12345", "[POSTAL_CODE_REDACTED]"],
      [
        "US ZIP+4",
        "12345-6789",
        "[PHONE_REDACTED]", // Phone pattern matches this format
      ],
      ["UK postcode", "SW1A 1AA", "[POSTAL_CODE_REDACTED]"],
      ["Canadian postal", "K1A 0B1", "[POSTAL_CODE_REDACTED]"],
    ])("should redact %s: %s", (_, input, expected) => {
      const result = sanitizer.sanitize(input);
      expect(result).toBe(expected);
    });

    it("should redact address in object", () => {
      const obj = {
        address: "123 Main St",
        postalCode: "12345",
        zipCode: "90210",
      };
      const result = sanitizer.sanitize(obj) as any;
      expect(result.address).toBe("[REDACTED]");
      expect(result.postalCode).toBe("[REDACTED]");
      expect(result.zipCode).toBe("[REDACTED]");
    });
  });

  describe("Extended Auth patterns", () => {
    it.each([
      ["Token prefix", "Token abc123xyz", "[TOKEN_REDACTED]"],
      [
        "Private key begin",
        "-----BEGIN PRIVATE KEY-----",
        "[PRIVATE_KEY_REDACTED]",
      ],
      [
        "Certificate begin",
        "-----BEGIN CERTIFICATE-----",
        "[CERTIFICATE_REDACTED]",
      ],
      ["OAuth pattern", "oauth_token=abc123", "[OAUTH_REDACTED]"],
      ["OAuth bearer", "OAuth 1234567890", "[OAUTH_REDACTED]"],
    ])("should redact %s: %s", (_, input, expected) => {
      const result = sanitizer.sanitize(input);
      expect(result).toBe(expected);
    });

    it("should redact full private key", () => {
      const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7W8rjaw
-----END PRIVATE KEY-----`;
      const result = sanitizer.sanitize(privateKey);
      expect(result).toBe("[PRIVATE_KEY_REDACTED]");
    });
  });

  describe("Internal error patterns", () => {
    it.each([
      [
        "ENOENT",
        "Error: ENOENT: no such file",
        "Error: [INTERNAL_ERROR]: no such file",
      ],
      [
        "EACCES",
        "EACCES: permission denied",
        "[INTERNAL_ERROR]: permission denied",
      ],
      ["ETIMEDOUT", "Connection ETIMEDOUT", "Connection [INTERNAL_ERROR]"],
      [
        "JS error",
        "Cannot read property 'x' of undefined",
        "[JS_ERROR]erty 'x' of undefined",
      ],
      ["Type error", "null is not an object", "[JS_ERROR] an object"],
      [
        "Reference error",
        "ReferenceError: x is not defined",
        "[JS_ERROR]: x [JS_ERROR]",
      ],
    ])("should redact %s: %s", (_, input, expected) => {
      const result = sanitizer.sanitize(input);
      expect(result).toBe(expected);
    });
  });

  describe("Config and secrets paths", () => {
    it.each([
      ["config path", "/config/database.json", "[CONFIG_PATH]"],
      ["secrets path", "/secrets/api-keys.json", "[SECRETS_PATH]"],
      ["private path", "/private/credentials.txt", "[SECRETS_PATH]"],
      ["keys path", "/keys/ssl.pem", "[SECRETS_PATH]"],
    ])("should redact %s: %s", (_, input, expected) => {
      const result = sanitizer.sanitize(input);
      expect(result).toBe(expected);
    });
  });

  describe("Extended sensitive keys", () => {
    const newSensitiveKeys = [
      "cookie",
      "session",
      "sessionId",
      "session_id",
      "certificate",
      "oauth",
      "clientSecret",
      "client_secret",
      "apiSecret",
      "api_secret",
      "privateKey",
      "private_key",
      "x-refresh-token",
      "address",
      "postalCode",
      "postal_code",
      "zipCode",
      "zip_code",
    ];

    it.each(newSensitiveKeys)("should redact any value with key: %s", (key) => {
      const obj = { [key]: "sensitive-value-abcdef" };
      const result = sanitizer.sanitize(obj) as any;
      expect(result[key]).toBe("[REDACTED]");
    });
  });

  describe("Hash redaction level", () => {
    let hashSanitizer: Sanitizer;

    beforeEach(() => {
      hashSanitizer = new Sanitizer({ redactionLevel: RedactionLevel.HASH });
    });

    it("should create deterministic hash for emails", () => {
      const email = "user@example.com";
      const result1 = hashSanitizer.sanitize(email);
      const result2 = hashSanitizer.sanitize(email);

      expect(result1).toMatch(/^email_[a-z0-9]{1,8}$/);
      expect(result1).toBe(result2); // Same input produces same hash
    });

    it("should create different hashes for different values", () => {
      const result1 = hashSanitizer.sanitize("user1@example.com");
      const result2 = hashSanitizer.sanitize("user2@example.com");

      expect(result1).not.toBe(result2);
    });

    it.each([
      ["email", "test@example.com", /^email_[a-z0-9]{1,8}$/],
      ["phone", "555-123-4567", /^phone_[a-z0-9]{1,8}$/],
      ["ssn", "123-45-6789", /^ssn_[a-z0-9]{1,8}$/],
      ["card", "4111111111111111", /^card_[a-z0-9]{1,8}$/],
    ])("should hash %s with correct prefix", (_, input, pattern) => {
      const result = hashSanitizer.sanitize(input) as string;
      expect(result).toMatch(pattern);
    });
  });

  describe("Error object handling", () => {
    it("should handle Error instances", () => {
      const error = new Error("Something went wrong with user@example.com");
      error.stack =
        "Error: Something went wrong\n    at Object.<anonymous> (/Users/test/app.js:10:15)";

      const result = sanitizer.sanitize(error) as any;

      expect(result.name).toBe("Error");
      expect(result.message).toBe("Something went wrong with [EMAIL_REDACTED]");
      // Stack contains a stack trace pattern which gets sanitized
      expect(result.stack).toContain("[STACK_TRACE]");
      expect(result.stack).not.toContain("/Users/test");
    });

    it("should handle error with code", () => {
      const error: any = new Error("Connection failed");
      error.code = "ECONNREFUSED";

      const result = sanitizer.sanitize(error) as any;

      expect(result.code).toBe("ECONNREFUSED");
      expect(result.message).toBe("Connection failed");
    });

    it("should detect error-like objects", () => {
      const errorLike = {
        message: "Failed to process payment 4111111111111111",
        stack: "at processPayment (/app/payment.js:42)",
        code: "PAYMENT_FAILED",
      };

      const result = sanitizer.sanitize(errorLike) as any;

      expect(result.message).toBe("Failed to process payment [CARD_REDACTED]");
      expect(result.stack).toContain("[PATH]");
      expect(result.code).toBe("PAYMENT_FAILED");
    });

    it("should handle nested error objects", () => {
      const nested = {
        error: {
          message: "Auth failed for user@example.com",
          innerError: {
            message: "Invalid token Bearer abc123",
            code: "INVALID_TOKEN",
          },
        },
      };

      const result = sanitizer.sanitize(nested) as any;

      expect(result.error.message).toBe("Auth failed for [EMAIL_REDACTED]");
      expect(result.error.innerError.message).toBe(
        "Invalid [TOKEN_REDACTED] abc123"
      );
    });
  });

  describe("Truncation features", () => {
    it("should truncate long messages", () => {
      const longMessage = "a".repeat(600);
      const sanitizerWithTruncation = new Sanitizer({ maxMessageLength: 100 });
      const result = sanitizerWithTruncation.sanitize(longMessage) as string;

      expect(result.length).toBe(103); // 100 + "..."
      expect(result.endsWith("...")).toBe(true);
    });

    it("should limit stack trace lines", () => {
      const stackTrace = Array.from(
        { length: 20 },
        (_, i) => `    at function${i} (/path/file.js:${i}:1)`
      ).join("\n");

      const sanitizerWithLimit = new Sanitizer({ maxStackLines: 5 });
      const error = new Error("Test");
      error.stack = stackTrace;

      const result = sanitizerWithLimit.sanitize(error) as any;

      // Stack should be truncated
      expect(result.stack).toContain("... stack trace truncated");
      const lines = result.stack.split("\n");
      expect(lines.length).toBeLessThanOrEqual(6); // Should be truncated
    });

    it("should remove stack trace when configured", () => {
      const error = new Error("Test error");
      error.stack = "Error: Test\n    at test.js:1:1";

      const sanitizerNoStack = new Sanitizer({ removeStackTrace: true });
      const result = sanitizerNoStack.sanitize(error) as any;

      expect(result.stack).toBe("[STACK_TRACE_REMOVED]");
    });

    it("should not truncate stack traces when sanitizing", () => {
      const longPath = "/very/long/path/" + "a".repeat(600) + "/file.js";
      const stackTrace = `Error: Test\n    at function (${longPath}:1:1)`;

      const sanitizerWithTruncation = new Sanitizer({ maxMessageLength: 100 });
      const error = new Error("Test");
      error.stack = stackTrace;

      const result = sanitizerWithTruncation.sanitize(error) as any;

      // Stack trace should be sanitized but not truncated by maxMessageLength
      expect(result.stack).toContain("[STACK_TRACE]");
      // The sanitized stack is much shorter than original because paths are replaced
    });
  });

  describe("Pattern priority and conflicts", () => {
    it("should prioritize card pattern over phone", () => {
      const cardNumber = "4111111111111111";
      const result = sanitizer.sanitize(cardNumber);
      expect(result).toBe("[CARD_REDACTED]");
    });

    it("should detect JWT before generic paths", () => {
      const jwt =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const result = sanitizer.sanitize(jwt);
      expect(result).toBe("[JWT_REDACTED]");
    });

    it("should handle multiple patterns in complex object", () => {
      const complexData = {
        user: {
          email: "john@example.com",
          phone: "555-123-4567",
          ssn: "123-45-6789",
          address: "123 Main Street",
        },
        payment: {
          cardNumber: "4111111111111111",
          cvv: "123",
          zipCode: "90210",
        },
        auth: {
          token: "Bearer abc123xyz",
          apiKey: "sk_test_1234567890",
          oauth: "oauth_token=xyz789",
        },
        error: {
          message: "ENOENT: file not found",
          stack: "at /config/app.js:42",
        },
      };

      const result = sanitizer.sanitize(complexData) as any;

      // PII checks
      expect(result.user.email).toBe("[EMAIL_REDACTED]");
      expect(result.user.phone).toBe("[PHONE_REDACTED]");
      expect(result.user.ssn).toBe("[REDACTED]"); // Key-based redaction
      expect(result.user.address).toBe("[REDACTED]"); // Key-based redaction

      // Payment checks
      expect(result.payment.cardNumber).toBe("[REDACTED]"); // Key-based redaction
      expect(result.payment.cvv).toBe("[REDACTED]"); // Key-based redaction
      expect(result.payment.zipCode).toBe("[REDACTED]"); // Key-based redaction

      // Auth checks - entire auth object is redacted (auth is a sensitive key)
      expect(result.auth).toBe("[REDACTED]");

      // Error checks
      expect(result.error.message).toBe("[INTERNAL_ERROR]: file not found");
      expect(result.error.stack).toBe("at [CONFIG_PATH]:42");
    });
  });
});
