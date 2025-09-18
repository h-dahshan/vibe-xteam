# Logger Module Phase 2B Implementation Plan - Correlation ID & Request Context

## Overview

Implementation of correlation ID tracking and automatic request/response logging using nestjs-cls for async context propagation.

## Goals

1. **Correlation ID Tracking**: Every request gets a unique ID that propagates through all logs
2. **Request Context**: Automatic logging of incoming requests and responses
3. **Async Context Propagation**: IDs persist through async operations
4. **Header Support**: Accept and return correlation IDs via headers

## Implementation Details

### Dependencies to Install

```bash
pnpm add nestjs-cls uuid
pnpm add -D @types/uuid
```

### Components to Build

#### 1. Correlation ID Middleware

**File**: `apps/api/src/common/logger/middleware/correlation-id.middleware.ts`

**Purpose**:

- Extract correlation ID from `X-Correlation-Id` header (optional)
- Generate UUID v4 if not provided
- Store in CLS context for propagation
- Add to response headers

**Key Features**:

- Optional correlation ID (not required)
- UUID v4 format validation
- Response header setting
- Request object attachment

#### 2. Context Utilities

**File**: `apps/api/src/common/logger/utils/context.util.ts`

**Purpose**:

- Extract context from CLS service
- Centralized context management
- Type-safe context extraction

**Context Fields**:

- correlationId
- userId (if available)
- traceId (if available)
- requestId (if different from correlationId)

#### 3. Logging Interceptor

**File**: `apps/api/src/common/logger/interceptors/logging.interceptor.ts`

**Purpose**:

- Log all incoming HTTP requests
- Log responses with duration and status code
- Handle errors with proper context
- Redact sensitive data based on config

**Features**:

- Request logging (method, URL, correlation ID)
- Response logging (status, duration)
- Error logging with stack traces
- Payload truncation (configurable via LOG_MAX_MESSAGE_LENGTH)
- Sensitive data redaction (using LOG_REDACT_PATTERNS from config)

#### 4. Logger Service Enhancement

**Updates to**: `logger.service.ts`

**Changes**:

- Optional CLS service injection
- Auto-include CLS context in all logs
- Merge CLS context with user metadata

**Backward Compatibility**:

- Works without CLS (optional injection)
- Existing logs continue to work
- CLS context merged with user metadata (user metadata takes precedence)

#### 5. Module Configuration

**Updates to**: `logger.module.ts`

**Changes**:

- Import and configure ClsModule
- Register correlation ID middleware
- Register logging interceptor globally
- Configure CLS with proper settings

### Configuration

**Environment Variables** (already in observability schema):

- `LOG_REDACT_PATTERNS`: Patterns to redact (default: password,token,secret,key,authorization)
- `LOG_MAX_MESSAGE_LENGTH`: Max message length (default: 10000)

### Testing Strategy

#### Unit Tests

1. **Middleware Tests**:
   - ID generation when not provided
   - ID extraction from headers
   - Response header setting
   - CLS storage

2. **Interceptor Tests**:
   - Request logging
   - Response logging with duration
   - Error handling
   - Data redaction
   - Payload truncation

3. **Context Util Tests**:
   - Context extraction
   - Missing context handling
   - Type safety

4. **Logger Service Tests**:
   - CLS context inclusion
   - Metadata merging
   - Works without CLS

#### Integration Tests

1. **End-to-End Flow**:
   - Request with correlation ID header
   - Verify ID in all logs
   - Verify response header
   - Test async operations

2. **Performance Tests**:
   - Measure overhead (< 1ms target)
   - Memory usage with CLS
   - High concurrency scenarios

### Implementation Order

#### Block 1: Foundation (2 files)

1. Install dependencies
2. Create correlation-id.middleware.ts
3. Create context.util.ts

#### Block 2: Core Implementation (2 files)

1. Create logging.interceptor.ts
2. Update logger.service.ts with CLS support

#### Block 3: Integration (2 files)

1. Update logger.module.ts
2. Write comprehensive tests

### Success Criteria

- ✅ Every log entry contains correlation ID when available
- ✅ Correlation ID propagates through async operations
- ✅ Request/response automatically logged with context
- ✅ Response headers include correlation ID
- ✅ Sensitive data properly redacted
- ✅ Large payloads truncated
- ✅ Performance overhead < 1ms
- ✅ Backward compatible

### Security Considerations

1. **Data Redaction**:
   - Use LOG_REDACT_PATTERNS from config
   - Redact in request/response bodies
   - Never log Authorization headers

2. **UUID Validation**:
   - Validate incoming correlation IDs
   - Reject invalid formats
   - Generate new if invalid

3. **Payload Limits**:
   - Truncate large messages
   - Prevent memory issues
   - Configurable limits

### Performance Considerations

1. **CLS Overhead**: ~0.5ms per request
2. **UUID Generation**: ~0.1ms
3. **Context Extraction**: Minimal (cached)
4. **Memory**: CLS automatically cleaned after request

### Notes

- Correlation ID is optional per requirements
- Redaction patterns come from config service
- Payload truncation is configurable
- All changes are backward compatible
- Tests will be written parallel to implementation
