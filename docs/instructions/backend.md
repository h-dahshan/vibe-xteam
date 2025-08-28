# Backend Development Guidelines - NestJS

## Core Principles & Modular Patterns

- Follow **SOLID principles** and **Clean Architecture** patterns
- Follow **single responsibility principle** for all classes and functions
- Structure modules by **feature/domain** rather than technical layers
- Implement **shared modules/services** for cross-cutting concerns
- Implement **separation of concerns** with clear layer boundaries
- Implement **factory pattern** for complex object creation
- Apply **dependency injection** extensively through NestJS decorators
- Use **Domain-Driven Design (DDD)** for complex business logic organization
- Use **barrel exports** (index.ts) for clean module interfaces
- Use **abstract classes and interfaces** for contracts and extensibility

---

## Type Safety

- Define **comprehensive interfaces** for all data structures
- Define **explicit return types** for all functions and methods
- Define **union types** and **literal types** for precise type definitions
- Avoid **any** type - use **unknown** when type is uncertain
- Use **TypeScript strict mode** with all strict flags enabled
- Use **mapped types** and **conditional types** for advanced scenarios
- Use **type guards** for runtime type validation
- Implement **generic types** where appropriate for reusability
- Implement **branded types** for domain-specific primitives
- Enable **strict null checks** and handle nullable values explicitly

---

## Environment Configuration & Validation

- Never commit **sensitive env files** to version control
- Create **configuration interfaces** with proper typing
- Document **all required environment variables** in README
- Use **@nestjs/config** with configuration namespaces
- Use **separate env files** per environment (.env.local, .env.staging, .env.prod)
- Use **default values** for non-critical configurations
- Implement **Zod or class-validator** for env variable validation
- Implement **configuration hot-reloading** for development
- Validate **all environment variables** at application startup

---

## Multi-Language Support & Localization

- Create **locale registries** for Arabic and English by default
- Create **translation helper utilities** for common patterns
- Create **translations in JSON files** organized by namespace
- Use **@nestjs/i18n** for internationalization
- Use **translation keys as constants** for system (non-user-driven) - no hardcoded strings
- Implement **fallback locale strategy** (Arabic → English → key)
- Implement **all user-facing messages** (errors, validations, notifications)
- Implement **locale detection** from user preferences, headers, or query param in order
- Validate **all locale files** for missing translations

---

## Response Standardization & REST

- Follow **REST resource naming** conventions (nouns, not verbs)
- Use **HTTP verbs correctly** (GET, POST, PATCH, DELETE)
- Use **standard HTTP status codes** (200, 201, 400, 401, 403, 404, 422, 500)
- Use **proper HTTP headers** (Content-Type, Cache-Control, ETag)
- Implement **global response interceptor** for consistent format
- Implement **pagination by default** with offset/limit or cursor-based
- Implement **standard query parameters** (page, limit, sort, filter, search)
- Implement **HATEOAS** links where beneficial
- Implement all request/response payload keys must be in **camelCase** format
- Success sample keys: `success`, `message`, `data`, `meta? -> {page, limit, total, totalPages}` meta is the pagination details for example
- Failure sample keys: `success`, `message`, `error -> {code, path, timestamp, details?}` details is the error stack hidden from production

---

## Data Validation & Sanitization

- Create **separate DTOs** for input, output, and internal operations
- Use **class-validator** with **class-transformer** for DTOs
- Use **custom validators** for business-specific validation rules
- Use **validation groups** for different scenarios (create vs update)
- Implement **validation pipes** globally with detailed error messages
- Implement **sanitization decorators** to prevent injection attacks
- Implement validations on **nested objects and arrays** with proper decorators
- Implement **conditional validation** based on other field values
- Implement **localized validation errors** with field-specific messages in same request payload structure
- Apply **whitelist and forbidNonWhitelisted** options globally

---

## Controller Design & Authorization

- Create **controllers thin** - delegate business logic to services
- Use **interceptors** for cross-cutting concerns (logging, caching)
- Use **custom decorators** for user extraction (@CurrentUser)
- Implement **guard decorators** for authentication
- Implement **role-based authorization** with custom decorators (@Roles)
- Implement **multipart form data** properly for file uploads
- Implement **request timeout** handling for long operations
- Validate **path parameters** including UUID format validation
- Validate **query parameters** including UUID format validation
- Apply **validation pipes** consistently across all endpoints
- Apply **rate limiting** at controller or endpoint level

---

## Swagger Documentation

- Create docs for **all endpoints** with proper descriptions, and examples
- Create docs for **all parameters** (path, query, body) with examples
- Create **response schemas** for all status codes (200, 400, 401, 403, 500)
- Create **reusable schema components** for common structures
- Use **@nestjs/swagger** with comprehensive decorators
- Use **@ApiTags**, **@ApiOperation**, **@ApiBearerAuth**, **@ApiBody**, **@ApiResponse**, **@ApiParam**, **@ApiQuery**, and any other informatic decorators
- Implement **error response examples** for each endpoint
- Implement **multiple environment** swagger configurations

---

## Common Services & Reusability

- Create **shared service modules** for common functionalities
- Create **abstract base services** for common CRUD operations
- Create **notification service** abstraction for multiple channels
- Create **file service** abstraction for multiple storage providers
- Use **factory providers** for service configuration
- Use **cache service** wrapper for multiple cache providers
- Use **queue service** for background processing
- Implement **utility services** like (DateService, CryptoService, ValidationService)
- Implement **event emitter service** for loose coupling
- Implement **audit service** for tracking entity changes

---

## Data Layer & ORM

### General ORM Guidelines

- Use **repository pattern** for data access abstraction
- Use **database indexes** for frequently queried columns
- Use **eager/lazy loading** strategies appropriately
- Use **connection pooling** with appropriate limits
<!-- - Use **read replicas** for read-heavy operations where possible -->
- Use **database migrations** for schema version control and separate production
- Implement **unit of work** pattern for transaction management
- Implement **soft delete** with isDeleted boolean column by default
- Implement a filter for **soft-deleted records** in all queries by default

### Prisma Guidelines

- Use **Prisma schema** with proper field types and relations
- Use **Prisma transactions** for multi-operation consistency
- Use **Prisma generate** in CI/CD pipeline
- Implement **Prisma middleware** for soft delete filtering
- Implement **custom Prisma repository** classes for complex queries
- Apply **select and include** strategically to avoid N+1 problems

<!-- ### TypeORM Guidelines

- Use **Active Record** or **Data Mapper** pattern consistently
- Implement **custom repositories** extending base repository
- Use **QueryBuilder** for complex queries instead of raw SQL
- Apply **entity decorators** properly (@Entity, @Column, @OneToMany)
- Implement **database subscribers** for audit trails
- Use **TypeORM migrations** with proper up/down methods -->

---

## Security Standards

- Create **CORS configs** - from env files - with specific origins, methods, and headers
- Use **secure cookie settings** (httpOnly, secure, sameSite)
- Use **bcrypt** for password hashing with appropriate salt rounds
- Use **global rate limiting** per IP and per user with Redis store
- Use **custom low-level rate limiting** per IP and per user with Redis store
- Implement **JWT authentication** with refresh token rotation
- Implement **CSRF protection** for state-changing operations and forms
- Implement **XSS protection** with content sanitization
- Implement **Helmet** for security headers
- Implement **RBAC** with granular permissions, even if initially bypassed
<!-- - Implement **API key authentication** for service-to-service calls -->

---

## Observability

### Health

- Implement **/health** endpoints with comprehensive checks for
  - liveness: **/health/live** for app health self-checks
  - readiness: **/health/ready** for whole system components health
- Implement **structured health check responses** with service status details
- Implement **graceful shutdown** handling

### Logging

- Never include **sensitive data** in logs (passwords, tokens, PII)
- Never include **stack and context** in responses in **production**
- Create **global exception filter** for centralized error logging with **stack and context**
- Create **custom exception classes** extending base HTTP exceptions
- Implement **structured logging** with **correlation IDs**
- Implement **request/response** cycles logging with appropriate execution time and detail level (path, query, sanitized payloads, etc.)
- Implement **log levels** appropriately (error, warn, info, debug, verbose)
- Implement **structured logging** for faild DB queries and failed calls to APIs, queues, cache(hit/miss)
- Implement **log rotation & retention policies**
- Tools: **Winston** for logging -> **Grafana Alloy** -> **Grafana/Loki** -> **Grafana/Visualization**
  <!-- - Implement **error tracking** with services like Sentry -->

### Metrics

- Track **system metrics** like CPU, memory, disk, GC events
- Track **app metrics** like request rate, latency distribution, error rate
- Track **database metrics** like query times, connection pool usage
- Track **cache metrics** like hit/miss ratio, eviction rate
- Track **queue metrics** like length, oldest message age, queue time, throughput, errors, retrials
- Track **business metrics** derived from feature details
- Track **external services health** (APIs, s3, queues, cache)
- Implement **alerting** for critical thresholds (oncall - apps)
- Tools: **OTel SDK** -> **Grafana Alloy** -> **Prometheus** -> **Grafana/Visualization**

### Tracing

- Propagate **trace IDs** across services (HTTP headers)
- **Correlate** traces with logs & metrics for faster debugging
- Identify **bottlenecks** (e.g., DB query 2s, API call 1s)
- Trace **end-to-end request flow** (e.g., API → DB → cache → external APIs)
- Tools: **OTel SDK** -> **Grafana Alloy** -> **Grafana/Tempo** -> **Grafana/Visualization**

---

## Communication Services

### General Communication Guidelines

- Create **communication service abstraction** layer
- Use **queue-based** communication for reliability
- Implement **retry mechanisms** for failed communications
- Implement **opt-out mechanisms** for all communication types
- Apply **template management** system for all communications

### Resend Integration

- Use **Resend API** for transactional emails
- Use **email templates** with proper localization
- Implement **email tracking** and delivery status monitoring
- Implement **bounce and complaint** handling
- Apply **rate limiting** per domain and recipient

### Twilio Integration

- Use **Twilio API** for SMS and voice communications
- Use **message templates** for different notification types
- Implement **delivery status** tracking and webhooks
- Implement **phone number validation** before sending
- Apply **cost optimization** strategies for international messaging

---

## Caching & Invalidation

- Use **Redis** for distributed caching in production
- Use **write-through caching** for frequently updated data
- Use **cache namespacing** to avoid key collisions
- Use **cache compression** for large data structures
- Implement **cache-aside pattern** for data retrieval
- Implement **cache warming** for critical data
- Implement **cache invalidation** triggers on data updates
- Implement **circuit breaker** pattern for cache failures
- Apply **TTL (Time To Live)** strategies appropriately
- Monitor **cache hit ratios** and optimize accordingly

---

## File Upload & Storage

- Use **cloud storage** (AWS S3, Azure Blob) for production
- Use **virus scanning** integration (ClamAV or cloud services)
- Use **CDN integration** for fast file delivery
- Implement **file type validation** with mime-type checking
- Implement **file size limits** per file type and user role
- Implement **image optimization** and multiple resolution support
- Implement **content moderation** for image uploads
- Implement **file cleanup** jobs for orphaned uploads
- Generate **secure upload URLs** with time-limited access
- Apply **access control** with signed URLs for private files

---

## Testing Requirements

### Unit Testing

- Use **Jest** with NestJS testing utilities
- Mock **external dependencies** properly
- Test **all service methods** with various scenarios
- Test **error scenarios** and edge cases
- Achieve **minimum 80% code coverage**

### Integration Testing

- Use **test database** with proper setup/teardown
- Validate **database transactions** and rollbacks
- Test **API endpoints** with supertest
- Test **authentication and authorization** flows
- Test **file upload and external service** integrations

### E2E Testing

- Use **test data factories** for consistent test setup
- Validate **performance requirements** in E2E tests
- Test **complete user workflows**
- Test **real database** with migration rollbacks
- Implement **parallel test execution** where possible

---

## Event-Driven Architecture

- Use **@nestjs/event-emitter** for internal events
- Use **message queues** (Bull, BullMQ) for async processing
- Use **retry mechanism** with exponential backoff
- Use **idempotent event handlers** to handle duplicates
- Implement **domain events** for business logic decoupling
- Implement **saga pattern** for distributed transactions
- Implement **event versioning** for backward compatibility
- Apply **event sourcing** for audit-heavy domains
- Apply **dead letter queues** for failed message handling
- Monitor **queue health** and processing times

---

## Real-Time Communications

- Use **@nestjs/websockets** with Socket.IO
- Implement **connection authentication** and authorization
- Implement **connection cleanup** and memory management
- Implement **rate limiting** for WebSocket messages

---

## Background Jobs & Task Management

- Use **Bull Queue** with Redis for job processing
- Use **cron-based** scheduling for recurring tasks
- Use **job event listeners** for monitoring and alerting
- Use **job concurrency limits** to prevent resource exhaustion
- Use **worker scaling** based on queue depth
- Implement **job prioritization** and scheduling
- Implement **job progress tracking** and status updates
- Implement **job result persistence** for audit trails
- Implement **job cleanup** for completed and failed jobs
- Implement **job retry mechanism** with increasing delays
- Implement **job timeout handling** for long-running tasks
- Monitor **job processing metrics** and failure rates
