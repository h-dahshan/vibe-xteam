# Logger Module Phase 2 Implementation Plan

## Overview

Phase 2 enhances the existing Winston logger with nest-winston integration, multiple transport support, and comprehensive request context tracking through correlation IDs.

## Phase 2 Goals

1. **Integrate nest-winston** for better NestJS compatibility
2. **Implement multiple transports** (stdout/otlp/both) based on configuration
3. **Add correlation ID tracking** with nestjs-cls for distributed tracing
4. **Create request/response interceptor** for automatic request logging
5. **Build correlation ID middleware** for request context propagation

## Part A: nest-winston Integration & Transport Enhancement

### Current State

- Direct Winston usage without nest-winston utilities
- Single stdout transport hardcoded
- Basic JSON formatting

### Target State

- Full nest-winston integration with NestJS-specific formatting
- Dynamic transport selection based on configuration
- Enhanced formatting with nest-winston utilities

### Implementation Steps

#### 1. Update logger.service.ts

```typescript
// Key changes needed:
1. Import nest-winston utilities
2. Use utilities.format.nestLike() for better formatting
3. Support multiple transports based on config
4. Add transport factory methods
```

**Specific modifications:**

```typescript
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

private createTransports(): winston.transport[] {
  const transports: winston.transport[] = [];
  const logTransport = this.configService.getObservability().logTransport || 'stdout';

  if (logTransport === 'stdout' || logTransport === 'both') {
    transports.push(this.createStdoutTransport());
  }

  if (logTransport === 'otlp' || logTransport === 'both') {
    // Phase 4: transports.push(this.createOtlpTransport());
    // For now, just add a placeholder comment
  }

  return transports;
}

private createStdoutTransport(): winston.transport {
  const isProduction = this.configService.isProduction;

  return new winston.transports.Console({
    handleExceptions: true,
    handleRejections: true,
    format: isProduction
      ? this.getProductionFormat()
      : this.getDevelopmentFormat(),
  });
}

private getDevelopmentFormat(): winston.Logform.Format {
  return winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    winston.format.errors({ stack: this.includeStack }),
    nestWinstonModuleUtilities.format.nestLike(this.serviceName, {
      colors: true,
      prettyPrint: true,
      processId: true,
    }),
  );
}

private getProductionFormat(): winston.Logform.Format {
  // Keep existing OTEL-JSON format for production
  return this.getLogFormat(); // Current implementation
}
```

#### 2. Update Configuration Schema

Add transport configuration to the observability schema:

```typescript
// In config schemas
logTransport: z.enum(['stdout', 'otlp', 'both']).default('stdout'),
```

#### 3. Environment Variables Support

```bash
LOG_TRANSPORT=stdout  # Options: stdout, otlp, both
```

### Testing Requirements

- Test transport selection logic
- Verify nest-winston formatting in development
- Ensure production format remains OTEL-JSON
- Test configuration changes

## Part B: Correlation ID & Request Context

### Dependencies to Install

```json
{
  "nestjs-cls": "^4.4.1",
  "uuid": "^9.0.0"
}
```

### Implementation Steps

#### 1. Create correlation-id.middleware.ts

```typescript
// apps/api/src/common/logger/middleware/correlation-id.middleware.ts

import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { ClsService } from "nestjs-cls";
import { v4 as uuidv4 } from "uuid";
import { LOG_METADATA_KEYS } from "../constants/logger.constants";

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Extract or generate correlation ID
    const correlationId =
      (req.headers["x-correlation-id"] as string) || uuidv4();

    // Store in CLS context
    this.cls.set(LOG_METADATA_KEYS.CORRELATION_ID, correlationId);

    // Add to response headers
    res.setHeader("X-Correlation-Id", correlationId);

    // Attach to request for easy access
    (req as any).correlationId = correlationId;

    next();
  }
}
```

#### 2. Create context.util.ts

```typescript
// apps/api/src/common/logger/utils/context.util.ts

import { ClsService } from "nestjs-cls";
import { LOG_METADATA_KEYS } from "../constants/logger.constants";

export class LogContextUtil {
  static extractContext(cls: ClsService): Record<string, any> {
    const context: Record<string, any> = {};

    // Extract correlation ID
    const correlationId = cls.get(LOG_METADATA_KEYS.CORRELATION_ID);
    if (correlationId) {
      context.correlationId = correlationId;
    }

    // Extract user ID if available
    const userId = cls.get(LOG_METADATA_KEYS.USER_ID);
    if (userId) {
      context.userId = userId;
    }

    // Extract trace ID if available
    const traceId = cls.get(LOG_METADATA_KEYS.TRACE_ID);
    if (traceId) {
      context.traceId = traceId;
    }

    return context;
  }
}
```

#### 3. Update logger.service.ts for CLS Integration

```typescript
// Add ClsService injection
constructor(
  private readonly configService: ConfigService,
  @Optional() private readonly cls?: ClsService,
) {
  // ... existing constructor code
}

// Update logWithLevel to include CLS context
private logWithLevel(
  level: LogLevel,
  message: any,
  metadata?: Record<string, any>,
  context?: string,
  trace?: string
): void {
  if (!this.shouldLog(level)) return;

  // Extract CLS context if available
  const clsContext = this.cls ? LogContextUtil.extractContext(this.cls) : {};

  const logData: winston.LogEntry = {
    level: level,
    message: this.formatMessage(message, context),
    ...clsContext,  // Add CLS context first
    ...metadata,     // User metadata can override
  };

  if (trace) {
    logData.trace = trace;
  }

  this.winston.log(logData);
}
```

#### 4. Update logger.module.ts for CLS

```typescript
import { ClsModule } from "nestjs-cls";

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request) =>
          req.headers["x-correlation-id"] || uuidv4(),
      },
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
```

#### 5. Create logging.interceptor.ts

```typescript
// apps/api/src/common/logger/interceptors/logging.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { LoggerService } from "../logger.service";
import { ClsService } from "nestjs-cls";
import { LOG_METADATA_KEYS } from "../constants/logger.constants";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggerService,
    private readonly cls: ClsService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;
    const startTime = Date.now();

    // Get correlation ID from CLS
    const correlationId = this.cls.get(LOG_METADATA_KEYS.CORRELATION_ID);

    // Log incoming request
    this.logger.log(
      "Incoming request",
      {
        method,
        url,
        correlationId,
        userAgent: headers["user-agent"],
      },
      "HTTP"
    );

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;
        const statusCode = context.switchToHttp().getResponse().statusCode;

        // Log successful response
        this.logger.log(
          "Request completed",
          {
            method,
            url,
            statusCode,
            duration,
            correlationId,
          },
          "HTTP"
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        // Log error response
        this.logger.error(
          "Request failed",
          {
            method,
            url,
            error: error.message,
            duration,
            correlationId,
          },
          error.stack,
          "HTTP"
        );

        throw error;
      })
    );
  }
}
```

## Implementation Order

### Step 1: Install Dependencies

```bash
pnpm add nestjs-cls uuid
```

### Step 2: nest-winston Integration (Part A)

1. Update logger.service.ts with transport factory methods
2. Add nest-winston formatting utilities
3. Update configuration schema
4. Test transport selection

### Step 3: CLS Setup (Part B - Foundation)

1. Configure ClsModule in logger.module.ts
2. Create context.util.ts
3. Update logger.service.ts with CLS injection

### Step 4: Middleware & Interceptor (Part B - Implementation)

1. Create correlation-id.middleware.ts
2. Create logging.interceptor.ts
3. Register middleware in app.module.ts
4. Register interceptor globally

### Step 5: Testing

1. Test correlation ID propagation
2. Test request/response logging
3. Test CLS context in async operations
4. Test nest-winston formatting

## Testing Strategy

### Unit Tests

- Mock ClsService for logger tests
- Test correlation ID generation/extraction
- Test interceptor logging logic
- Test middleware header handling

### Integration Tests

```typescript
// Test correlation ID flow
it("should propagate correlation ID through request", async () => {
  const response = await request(app.getHttpServer())
    .get("/test")
    .set("X-Correlation-Id", "test-id-123");

  expect(response.headers["x-correlation-id"]).toBe("test-id-123");
  // Verify logs contain correlation ID
});

// Test automatic ID generation
it("should generate correlation ID if not provided", async () => {
  const response = await request(app.getHttpServer()).get("/test");

  expect(response.headers["x-correlation-id"]).toBeDefined();
  expect(response.headers["x-correlation-id"]).toMatch(/^[0-9a-f-]{36}$/);
});
```

## Success Criteria

### Part A: nest-winston Integration

- ✅ Multiple transports work based on configuration
- ✅ Development logs use nestLike format with colors
- ✅ Production logs maintain OTEL-JSON format
- ✅ Transport selection is dynamic

### Part B: Correlation ID & Context

- ✅ Every log entry has correlation ID
- ✅ Correlation ID propagates through async operations
- ✅ Request/response automatically logged
- ✅ Response headers include correlation ID
- ✅ CLS context available throughout request lifecycle

## Configuration Examples

### Development

```bash
LOG_TRANSPORT=stdout
LOG_LEVEL=debug
LOG_FORMAT=nest-like  # New option for nest-winston format
```

### Production

```bash
LOG_TRANSPORT=both
LOG_LEVEL=info
LOG_FORMAT=otel-json
```

## Files to Create/Modify

### New Files

1. `middleware/correlation-id.middleware.ts`
2. `utils/context.util.ts`
3. `interceptors/logging.interceptor.ts`

### Modified Files

1. `logger.service.ts` - Add transport factory, CLS integration
2. `logger.module.ts` - Add ClsModule configuration
3. `constants/logger.constants.ts` - Already has metadata keys
4. `app.module.ts` - Register middleware and interceptor

## Performance Considerations

1. **CLS Performance**: ~0.5ms overhead per request
2. **Correlation ID**: UUID v4 generation is fast (~0.1ms)
3. **Interceptor**: Minimal overhead, avoid logging large payloads
4. **Memory**: CLS context cleared automatically after request

## Migration Notes

- Existing logs will continue working
- New logs automatically get correlation ID
- No breaking changes to existing API
- Backward compatible with Phase 1

## Next Steps (Phase 3)

After Phase 2 completion:

- Implement smart masking utilities
- Add payload truncation
- Create @LogExclude decorator
- Enhanced security features
