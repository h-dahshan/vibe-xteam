import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { Request, Response } from "express";
import { ClsService } from "nestjs-cls";
import { LoggerService } from "../logger.service";
import { ConfigService } from "../../config";
import { LOG_METADATA_KEYS } from "../constants/logger.constants";

// TODO: check sanitization util in common/util/sanitization
/**
 * Interceptor for automatic request/response logging
 * Logs method, URL, duration, status code with correlation ID
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly maxMessageLength: number;
  private readonly redactPatterns: string[];

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly cls: ClsService
  ) {
    const o11y = this.configService.getObservability();
    this.maxMessageLength = o11y.logMaxMessageLength;
    this.redactPatterns = o11y.logRedactPatterns;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, headers, body } = request;
    const startTime = Date.now();

    // Get correlation ID from CLS
    const correlationId = this.cls.get(LOG_METADATA_KEYS.CORRELATION_ID);

    // Prepare request metadata
    const requestMetadata = {
      url,
      method,
      correlationId,
      ip: request.ip,
      userAgent: headers["user-agent"],
    };

    // Log incoming request with redacted body if present
    const redactedBody = body ? this.redactSensitiveData(body) : undefined;
    const truncatedBody = redactedBody
      ? this.truncatePayload(redactedBody)
      : undefined;

    this.logger.log(
      "Incoming request",
      {
        ...requestMetadata,
        ...(truncatedBody && { body: truncatedBody }),
      } as Record<string, any>,
      "HTTP"
    );

    return next.handle().pipe(
      tap((responseBody) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Redact and truncate response body if needed
        const redactedResponse = responseBody
          ? this.redactSensitiveData(responseBody)
          : undefined;
        const truncatedResponse = redactedResponse
          ? this.truncatePayload(redactedResponse)
          : undefined;

        // Log successful response
        this.logger.log(
          "Request completed",
          {
            statusCode,
            duration: `${duration}ms`,
            ...requestMetadata,
            ...(truncatedResponse && { response: truncatedResponse }),
          } as Record<string, any>,
          "HTTP"
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        // Determine status code from error
        let statusCode: number;
        let errorMessage: string;

        if (error instanceof HttpException) {
          statusCode = error.getStatus();
          errorMessage = error.message;
        } else {
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          errorMessage = error.message || "Internal server error";
        }

        // Log error response
        this.logger.error(
          "Request failed",
          {
            statusCode,
            duration: `${duration}ms`,
            error: errorMessage,
            ...requestMetadata,
          },
          // TODO: is this stack a string or maybe an object?
          error.stack,
          "HTTP"
        );

        // Re-throw the error to maintain normal error flow
        throw error;
      })
    );
  }

  /**
   * Redact sensitive data from objects based on configured patterns
   */
  private redactSensitiveData(data: unknown): unknown {
    if (!data || typeof data !== "object") {
      return data;
    }

    // TODO: check safeStringify at common/utils/safe-stringify
    // Deep clone to avoid modifying original
    const cloned = JSON.parse(JSON.stringify(data));

    const redact = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(redact);
      }

      if (typeof obj === "object" && obj !== null) {
        for (const key of Object.keys(obj)) {
          // Check if key matches any redact pattern
          const shouldRedact = this.redactPatterns.some((pattern) =>
            key.toLowerCase().includes(pattern.toLowerCase())
          );

          if (shouldRedact) {
            obj[key] = "[REDACTED]";
          } else if (typeof obj[key] === "object") {
            obj[key] = redact(obj[key]);
          }
        }
      }

      return obj;
    };

    return redact(cloned);
  }

  /**
   * Truncate payload if it exceeds max length
   */
  private truncatePayload(data: any): any {
    const stringified = JSON.stringify(data);

    if (stringified.length <= this.maxMessageLength) {
      return data;
    }

    // Truncate and add indicator
    const truncated = stringified.substring(0, this.maxMessageLength);

    try {
      // Try to parse truncated JSON, may fail if cut mid-string
      return JSON.parse(truncated);
    } catch {
      // If parsing fails, return string with truncation indicator
      return `${truncated}... [TRUNCATED - original length: ${stringified.length}]`;
    }
  }
}
