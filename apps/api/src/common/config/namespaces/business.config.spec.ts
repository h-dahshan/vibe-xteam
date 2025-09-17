import { describe, it, expect, beforeEach, afterEach } from "vitest";
import businessConfig from "./business.config";

describe("BusinessConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load business configuration from environment", () => {
    process.env.DEFAULT_TIMEZONE = "Europe/London";
    process.env.BUSINESS_TIMEZONE = "Asia/Tokyo";

    const config = businessConfig();

    expect(config).toEqual({
      defaultTimezone: "Europe/London",
      businessTimezone: "Asia/Tokyo",
    });
  });

  it("should use default values when not specified", () => {
    delete process.env.DEFAULT_TIMEZONE;
    delete process.env.BUSINESS_TIMEZONE;

    const config = businessConfig();

    expect(config).toEqual({
      defaultTimezone: "UTC",
      businessTimezone: "America/New_York",
    });
  });

  it("should handle various timezone formats", () => {
    process.env.DEFAULT_TIMEZONE = "GMT";
    process.env.BUSINESS_TIMEZONE = "America/Los_Angeles";

    const config = businessConfig();

    expect(config.defaultTimezone).toBe("GMT");
    expect(config.businessTimezone).toBe("America/Los_Angeles");
  });
});
