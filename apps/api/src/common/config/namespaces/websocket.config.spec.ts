import { describe, it, expect, beforeEach, afterEach } from "vitest";
import websocketConfig from "./websocket.config";

describe("WebSocketConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load websocket configuration from environment", () => {
    process.env.WEBSOCKET_PORT = "3002";
    process.env.WEBSOCKET_CORS_ORIGIN = "https://app.example.com";

    const config = websocketConfig();

    expect(config).toEqual({
      port: 3002,
      corsOrigin: "https://app.example.com",
    });
  });

  it("should use default values only for optional fields", () => {
    // Set required field
    process.env.WEBSOCKET_CORS_ORIGIN = "http://localhost:3001";
    // Clear optional field
    delete process.env.WEBSOCKET_PORT;

    const config = websocketConfig();

    expect(config).toEqual({
      port: 3010, // Updated default
      corsOrigin: "http://localhost:3001",
    });
  });

  it("should correctly parse port as number", () => {
    process.env.WEBSOCKET_PORT = "8080";

    const config = websocketConfig();

    expect(typeof config.port).toBe("number");
    expect(config.port).toBe(8080);
  });
});
