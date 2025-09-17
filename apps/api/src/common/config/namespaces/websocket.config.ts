import { registerAs } from "@nestjs/config";
import type { WebSocketConfig } from "../types/config.types";

/**
 * WebSocket configuration namespace
 * Loads WebSocket server settings
 */
export default registerAs(
  "websocket",
  (): WebSocketConfig => ({
    port: parseInt(process.env.WEBSOCKET_PORT || "3010", 10), // OPT with default
    corsOrigin: process.env.WEBSOCKET_CORS_ORIGIN!, // REQ
  })
);
