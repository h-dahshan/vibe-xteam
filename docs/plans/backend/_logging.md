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

### PHASE 1: Core Logger Foundation

**Goal:** Basic structured logging with Winston + NestJS integration  
**Measurable Outcome:** Logs appear in stdout with proper format and levels

#### Dependencies Used

```typescript
// From NestJS (Built-in)
- @nestjs/common: Logger, Injectable, Module, Global
- @nestjs/config: ConfigService (already configured)

// From 3rd Party
- winston: Core logging library (already installed)
- nest-winston: NestJS-Winston integration (TO INSTALL)

// Custom Implementation
- Log level ladder logic (custom hierarchy)
- Environment-based configuration
- OTEL-JSON formatting
```

#### Implementation Details

**1. logger.constants.ts**

```typescript
// Custom ladder pattern for log levels
export const LOG_LEVELS_LADDER = {
  error: ["error"],
  warn: ["error", "warn"],
  info: ["error", "warn", "log"], // NestJS uses 'log' for info
  debug: ["error", "warn", "log", "debug"],
  verbose: ["error", "warn", "log", "debug", "verbose"],
};

// Environment-specific defaults
export const ENV_LOG_LEVELS = {
  development: "verbose",
  staging: "info",
  production: "warn",
  test: "error",
};

// Stack trace configuration
export const STACK_TRACE_ENVIRONMENTS = ["development", "staging"];
```

**2. logger.service.ts**

- Extends NestJS Logger class for compatibility
- Winston instance as underlying transport
- Custom level checking via ladder pattern
- Format selection based on environment

**3. logger.module.ts**

- Global Dynamic Module with forRoot() pattern
- Integration with existing ConfigModule
- Provider registration for DI

#### Success Metrics

- ✅ Logs appear in stdout with JSON format
- ✅ Different log levels work correctly
- ✅ Ladder pattern enables correct levels
- ✅ Integration with ConfigService works

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
