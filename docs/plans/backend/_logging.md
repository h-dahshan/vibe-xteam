# Logger Module Implementation Plan

## Overview

Production-ready logging module leveraging NestJS built-in Logger with Winston enhancement. Supports stdout/OTLP/both transports with intelligent buffering and failover mechanisms.

## Module Anatomy

```
apps/api/src/common/logger/
├── constants/
│   └── logger.constants.ts        # Log levels, patterns, defaults
├── decorators/
│   ├── log-exclude.decorator.ts   # Skip logging for endpoints
│   └── log-context.decorator.ts   # Add custom context to logs
├── interceptors/
│   └── logging.interceptor.ts     # Request/response logging
├── middleware/
│   └── correlation-id.middleware.ts # Generate correlation IDs
├── transports/
│   ├── otlp.transport.ts         # OTLP export with buffering
│   └── stdout.transport.ts       # Console output formatting
├── utils/
│   ├── masking.util.ts          # Sensitive data protection
│   ├── context.util.ts          # CLS context management
│   └── buffer.util.ts           # Memory/file buffer logic
├── logger.service.ts             # Core logger service
├── logger.service.spec.ts        # Service unit tests
├── logger.module.ts              # Module configuration
├── index.ts                      # Barrel exports
└── README.md                     # Documentation
```

## Implementation Phases

### PHASE 1: Core Logger Foundation ✅ COMPLETED

**Goal:** Basic structured logging with Winston + NestJS integration  
**Measurable Outcome:** Logs appear in stdout with proper format and levels  
**Status:** ✅ Fully implemented and tested (18/18 service tests passing)

#### What Was Built

```typescript
// Directory structure created:
apps/api/src/common/logger/
├── constants/
│   └── logger.constants.ts      # Log levels aligned with Winston NPM
├── decorators/                  # Empty - Ready for Phase 2
├── interceptors/                # Empty - Ready for Phase 2
├── middleware/                  # Empty - Ready for Phase 2
├── transports/                  # Empty - Ready for Phase 4
├── utils/                       # Empty - Ready for Phase 3
├── logger.service.ts            # Core service implementing NestJS LoggerService
├── logger.service.spec.ts       # 18/18 tests passing
├── logger.module.ts             # Global module
├── logger.module.spec.ts        # Module tests
└── index.ts                     # Barrel exports
```

#### Dependencies Used

```typescript
// From NestJS (Built-in)
- @nestjs/common: LoggerService interface, Injectable, Module, Global
- @nestjs/config: ConfigService (already configured)

// From 3rd Party
- winston: Core logging library (already installed)
- nest-winston: NestJS-Winston integration (INSTALLED - to be integrated in Phase 2)

// Custom Implementation
- Log level ladder aligned with Winston NPM levels
- Environment-based configuration via ConfigService
- OTEL-JSON formatting
- Metadata support on all log methods
```

#### Implementation Details

**1. logger.constants.ts**

```typescript
// Winston NPM levels alignment (corrected from original plan)
export const LOG_LEVELS_LADDER = {
  error: ["error"], // Priority 0
  warn: ["error", "warn"], // Priority 1
  info: ["error", "warn", "info"], // Priority 2
  verbose: ["error", "warn", "info", "verbose"], // Priority 4 (before debug)
  debug: ["error", "warn", "info", "verbose", "debug"], // Priority 5
};

// Note: verbose comes BEFORE debug in Winston NPM levels
// This differs from original plan but aligns with Winston standard
```

**2. logger.service.ts**

- Implements NestJS LoggerService interface
- Direct Winston instance (no mapping needed)
- NestJS `log()` method maps to Winston `'info'` level
- All methods support optional metadata parameter
- Stack trace control based on environment (dev/staging)
- Context support in all log methods

**3. logger.module.ts**

- Simple @Global() module
- Provides LoggerService for DI
- Integrated in AppModule imports

#### Key Implementation Choices

1. **Winston Level Alignment**: Changed from custom hierarchy to match Winston NPM exactly
2. **No Level Mapping**: Removed conversion logic - use Winston levels directly
3. **Metadata Support**: All log methods have overloaded signatures for metadata
4. **ConfigService Only**: No direct process.env access anywhere
5. **Direct Winston Usage**: Currently not using nest-winston utilities (Phase 2)

#### Success Metrics Achieved

- ✅ Logs appear in stdout with JSON format
- ✅ Different log levels work correctly (Winston-aligned)
- ✅ Ladder pattern enables correct levels
- ✅ Integration with ConfigService works
- ✅ OTEL-JSON format supported
- ✅ Stack traces in dev/staging only
- ✅ Context support in all messages
- ✅ Metadata support on all methods
- ✅ 18/18 unit tests passing

#### Integration Status

- ✅ Integrated in `apps/api/src/app.module.ts`
- ✅ Global logger configured in `apps/api/src/main.ts` with `bufferLogs: true`
- ✅ Using ConfigService from `apps/api/src/common/config`
- ✅ Ready for application-wide usage

#### What's Next

Phase 2 will enhance the current implementation with:

- nest-winston utilities integration for better NestJS formatting
- Multiple transport support (stdout/otlp/both)
- Correlation ID tracking with nestjs-cls
- Request/Response interceptor
- Correlation ID middleware

---

### PHASE 2: Request Context & Correlation

**Goal:** Every log has correlation ID, context propagates through async calls  
**Measurable Outcome:** All logs within a request share same correlation ID

#### Dependencies Used

```typescript
// From NestJS (Built-in)
- @nestjs/common: MiddlewareConsumer, NestMiddleware

// From 3rd Party
- nestjs-cls: CLS for async context (TO INSTALL)
- uuid: Generate correlation IDs (TO INSTALL)

// Custom Implementation
- Correlation ID extraction from headers
- Context enrichment logic
```

#### Implementation Details

**1. correlation-id.middleware.ts**

- Generate UUID v4 for each request
- Extract existing ID from x-correlation-id header
- Store in CLS context for propagation

**2. context.util.ts**

- Helper utilities for context management
- Extract log context (correlationId, userId, traceId)
- Enrich with request metadata

**3. Update logger.service.ts**

- Add CLS awareness to all log methods
- Automatic correlation ID injection

#### Success Metrics

- ✅ Correlation ID in every log entry
- ✅ ID propagates through async operations
- ✅ Headers work for distributed tracing
- ✅ Performance impact < 1ms per request

---

### PHASE 3: Smart Logging & Security

**Goal:** Automatic request/response logging with sensitive data protection  
**Measurable Outcome:** Requests logged without exposing secrets

#### Dependencies Used

```typescript
// From NestJS (Built-in)
- @nestjs/common: NestInterceptor, ExecutionContext, CallHandler
- rxjs/operators: tap, catchError

// From 3rd Party
- None (all custom implementation)

// Custom Implementation
- Smart masking algorithm
- Payload truncation logic
- Decorator metadata handling
```

#### Implementation Details

**1. masking.util.ts**

- Smart email masking (john@example.com → j\*\*\*@example.com)
- Recursive object traversal for nested data
- Pattern-based field detection
- Configurable from environment variables

**2. logging.interceptor.ts**

- NestJS interceptor for request/response
- Check @LogExclude decorator
- Mask sensitive data in payloads
- Truncate at 10K characters
- Track request duration

**3. log-exclude.decorator.ts**

- Decorator to skip logging for specific endpoints
- Useful for health checks

#### Success Metrics

- ✅ Passwords, tokens masked in logs
- ✅ Email shows as j\*\*\*@example.com
- ✅ Request duration tracked
- ✅ Payloads truncated at 10K chars
- ✅ Health endpoints excluded from logging

---

### PHASE 4: OTLP Transport & Resilience

**Goal:** Logs exported to OTLP with automatic failover  
**Measurable Outcome:** Zero log loss even when OTLP is down

#### Dependencies Used

```typescript
// From NestJS (Built-in)
- None (transport layer is independent)

// From 3rd Party
- @opentelemetry/exporter-logs-otlp-http: OTLP export (TO INSTALL)
- winston-transport: Custom transport base (TO INSTALL)

// Custom Implementation
- Memory buffer management (1000 entries default)
- File buffer failover
- Retry logic with backoff
- Health checking
```

#### Implementation Details

**1. otlp.transport.ts**

- Custom Winston transport extending winston-transport
- Memory buffer with configurable size
- Automatic failover to file when memory full
- Batch export with 5s flush interval
- Health monitoring for OTLP endpoint

**2. buffer.util.ts**

- FileBuffer class for persistent storage
- Rotating file buffer by date/size
- Recovery mechanism to sync buffered logs
- Cleanup of synced files

#### Success Metrics

- ✅ Logs exported to OTLP successfully
- ✅ Automatic failover works
- ✅ Buffer recovers when OTLP returns
- ✅ No log loss during downtime
- ✅ Performance remains stable

---

### PHASE 5: Documentation & Polish

**Goal:** Production-ready with comprehensive docs  
**Measurable Outcome:** Any developer can use the logger effectively

#### Deliverables

1. Complete README.md with:
   - Quick start guide
   - Configuration reference
   - Usage examples
   - API documentation
   - Performance benchmarks
   - Troubleshooting guide
   - Best practices

#### Success Metrics

- ✅ Clear usage examples
- ✅ Performance benchmarks documented
- ✅ Troubleshooting guide included
- ✅ Best practices defined

---

## Configuration

### Environment Variables

```bash
# Logging Configuration
LOG_SERVICE_NAME=my-app                    # Required
LOG_LEVEL=info                              # Optional (error|warn|info|debug|verbose)
LOG_TRANSPORT=stdout                        # Optional (stdout|otlp|both)
LOG_FORMAT=otel-json                        # Optional (otel-json|winston)
LOG_REDACT_PATTERNS=password,token,secret   # Optional
LOG_MAX_MESSAGE_LENGTH=10000                # Optional

# OTLP Buffer Configuration
LOG_MEM_BUFFER_ENTRIES=1000                 # Optional
LOG_MEM_BUFFER_FLUSH_INTERVAL=5             # Optional (seconds)
LOG_BUFFER_FILE_PATH=./logs/otlp-buffer     # Optional
LOG_BUFFER_FILE_MAX_SIZE=10485760           # Optional (bytes)
LOG_BUFFER_FILE_DATE_PATTERN=YYYY-MM-DD     # Optional
LOG_BUFFER_MAX_FILES=5                      # Optional

# OpenTelemetry
OTEL_SERVICE_NAME=my-app                    # Required
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp    # Required
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf   # Optional
OTEL_EXPORTER_OTLP_HEADERS=key=value        # Optional
OTEL_EXPORTER_OTLP_TIMEOUT=5                # Optional (seconds)
```

### Log Level Ladder

- `error`: Only error logs
- `warn`: Error + Warning logs
- `info`: Error + Warning + Info logs
- `debug`: Error + Warning + Info + Debug logs
- `verbose`: All logs including verbose

### Environment Defaults

- Development: `verbose`
- Staging: `info`
- Production: `warn` (with optional DEBUG_STACK flag)
- Test: `error`

---

## Key Features

### 1. NestJS Integration

- Extends built-in Logger class
- Compatible with existing NestJS code
- Uses dependency injection
- Global module pattern

### 2. Correlation ID Tracking

- Automatic UUID v4 generation
- Header propagation for distributed systems
- CLS-based async context
- Zero configuration required

### 3. Sensitive Data Protection

- Configurable masking patterns
- Smart masking (partial email/phone)
- Deep object traversal
- Performance optimized

### 4. Request/Response Logging

- Automatic via interceptor
- Duration tracking
- Payload truncation
- Selective exclusion

### 5. OTLP Resilience

- Memory buffer (1000 entries)
- File buffer failover
- Automatic recovery
- Batch export

---

## Testing Strategy

### Unit Tests

- Mock Winston transports
- Mock CLS service
- Test each component isolation
- 80% coverage target

### Integration Tests

- Test correlation ID flow
- Test masking effectiveness
- Test buffer failover
- Test OTLP export

### Performance Tests

- Measure logging overhead
- Buffer performance
- Masking impact
- Memory usage

---

## Dependencies Summary

### To Install

```json
{
  "nest-winston": "^1.10.2",
  "nestjs-cls": "^4.4.1",
  "uuid": "^9.0.0",
  "@opentelemetry/exporter-logs-otlp-http": "^0.50.0",
  "winston-transport": "^4.7.0"
}
```

### Already Available

- winston
- @nestjs/common
- @nestjs/config
- @opentelemetry/api

---

## Implementation Breakdown

### Overall Distribution

- **Using NestJS built-in**: ~25%
- **Using 3rd party tools**: ~35%
- **Custom implementation**: ~40%

### Per Phase

- **Phase 1**: 40% NestJS, 30% 3rd party, 30% custom
- **Phase 2**: 30% NestJS, 40% 3rd party, 30% custom
- **Phase 3**: 20% NestJS, 0% 3rd party, 80% custom
- **Phase 4**: 0% NestJS, 20% 3rd party, 80% custom
- **Phase 5**: 100% documentation

This balance ensures we leverage proven tools where they fit perfectly, while building custom solutions for our specific requirements.
