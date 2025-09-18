import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { ClsService } from "nestjs-cls";
import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { LOG_METADATA_KEYS } from "../constants/logger.constants";

// TODO: check the tracing util in common/utils/tracing
/**
 * Middleware to handle correlation ID for request tracking
 * Extracts from header or generates new UUID v4
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // Extract correlation ID from header or generate new one
    const headerCorrelationId = req.headers["x-correlation-id"] as string;
    let correlationId: string;

    // Validate and use header ID if provided and valid
    if (headerCorrelationId && uuidValidate(headerCorrelationId)) {
      correlationId = headerCorrelationId;
    } else {
      // Generate new UUID v4 if not provided or invalid
      correlationId = uuidv4();
    }

    // Store in CLS context for propagation
    this.cls.set(LOG_METADATA_KEYS.CORRELATION_ID, correlationId);

    // Add to response headers for client tracking
    res.setHeader("X-Correlation-Id", correlationId);

    // Attach to request object for easy access
    (req as any).correlationId = correlationId;

    next();
  }
}
