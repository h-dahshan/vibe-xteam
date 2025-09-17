import { describe, it, expect, beforeEach, afterEach } from "vitest";
import communicationConfig from "./communication.config";

describe("CommunicationConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load communication configuration from environment", () => {
    // Set test environment variables
    process.env.RESEND_API_KEY = "re_test_key_123";
    process.env.RESEND_FROM_EMAIL = "hello@example.com";
    process.env.RESEND_FROM_NAME = "Test App";
    process.env.TWILIO_ACCOUNT_SID = "AC123456789";
    process.env.TWILIO_AUTH_TOKEN = "test-auth-token";
    process.env.TWILIO_PHONE_NUMBER = "+1234567890";

    const config = communicationConfig();

    expect(config).toEqual({
      resend: {
        apiKey: "re_test_key_123",
        fromEmail: "hello@example.com",
        fromName: "Test App",
      },
      twilio: {
        accountSid: "AC123456789",
        authToken: "test-auth-token",
        phoneNumber: "+1234567890",
      },
    });
  });

  it("should require all communication fields", () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM_EMAIL = "noreply@example.com";
    process.env.RESEND_FROM_NAME = "My App"; // Now required
    process.env.TWILIO_ACCOUNT_SID = "AC987654321";
    process.env.TWILIO_AUTH_TOKEN = "auth-token";
    process.env.TWILIO_PHONE_NUMBER = "+9876543210";

    const config = communicationConfig();

    expect(config.resend.fromName).toBe("My App");
  });
});
