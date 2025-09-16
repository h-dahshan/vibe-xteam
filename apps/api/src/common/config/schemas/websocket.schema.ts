import { z } from "zod";

/**
 * WebSocket configuration schema - Required
 */
export const websocketSchema = z.object({
  WEBSOCKET_PORT: z
    .string()
    .regex(/^\d+$/, "WEBSOCKET_PORT must be a number")
    .default("3010")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1024).max(65535)),
  WEBSOCKET_CORS_ORIGIN: z.string().min(1, "WEBSOCKET_CORS_ORIGIN is required"),
});

export type WebSocketSchemaType = z.infer<typeof websocketSchema>;
