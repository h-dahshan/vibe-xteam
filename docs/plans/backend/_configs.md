# Configuration Module Implementation Plan

## Executive Summary

This document outlines the comprehensive plan for implementing the Configuration Module for the NestJS backend application. The module leverages NestJS's built-in `@nestjs/config` package while adding custom enhancements for type safety, validation with Zod, and a developer-friendly namespace-based access pattern.

## Design Decisions

### 1. Core Technology Stack

- **Base Framework**: `@nestjs/config` (v4.0.2) - Already installed
- **Validation Library**: Zod (v4.1.8) - Already installed
- **Environment Loading**: dotenv (via @nestjs/config)
- **Type System**: TypeScript with strict typing

### 2. Architecture Decisions

#### 2.1 Use NestJS Built-in Features

- ✅ Use `ConfigModule.forRoot()` for global configuration
- ✅ Use `registerAs()` for namespace organization
- ✅ Use ConfigService as the underlying service
- ✅ Leverage built-in caching for performance
- ❌ NOT reinventing existing NestJS functionality

#### 2.2 Environment Strategy

- Single `.env` file regardless of environment
- Environment determined by `NODE_ENV` variable
- Environment flags exposed as helper methods (isProduction, isDevelopment, etc.)

#### 2.3 Validation Strategy

**Required Configurations** (Fail at startup if missing):

- Application core settings (APP_NAME, APP_URL, API_PREFIX)
- Authentication (JWT secrets, bcrypt rounds)
- Database (connection URLs)
- Communication services (Resend, Twilio)
- Storage (S3 or local paths)
- Redis connection
- WebSocket configuration
- Security settings (CORS)

**Optional Configurations** (Use defaults with warnings):

- Cache settings (TTL, max items, compression)
- Queue settings (concurrency, retries)
- Circuit breaker settings
- Logging buffer settings (lines 127-137 in .env.example)
- Health check settings
- Business settings (timezone)

#### 2.4 Access Pattern (Updated)

- **Namespace-based access** with single-level object return
- Instead of: `configService.get('auth.jwtSecret')`
- We use: `configService.get('auth').jwtSecret`
- Returns typed namespace objects for better autocomplete and type safety

#### 2.5 Type Safety

- Full TypeScript interfaces for all configuration values
- Zod schemas for runtime validation
- Type inference from Zod schemas
- No `any` types allowed

## Implementation Structure

```
apps/api/src/common/config/
├── index.ts                          # Barrel export
├── config.module.ts                  # Main ConfigModule setup
├── config.module.spec.ts             # Module tests (parallel to implementation)
├── config.service.ts                 # Extended ConfigService with typed namespaces
├── config.service.spec.ts            # Service tests (parallel to implementation)
├── config.constants.ts               # Constants and tokens
│
├── namespaces/                       # Namespace configurations using registerAs()
│   ├── app.config.ts                # App namespace
│   ├── app.config.spec.ts          # App config tests
│   ├── auth.config.ts              # Auth & JWT namespace
│   ├── auth.config.spec.ts         # Auth config tests
│   ├── database.config.ts          # Database namespace
│   ├── database.config.spec.ts     # Database config tests
│   ├── redis.config.ts             # Redis & cache namespace
│   ├── redis.config.spec.ts        # Redis config tests
│   ├── storage.config.ts           # File storage namespace
│   ├── storage.config.spec.ts      # Storage config tests
│   ├── communication.config.ts     # Email/SMS namespace
│   ├── communication.config.spec.ts # Communication config tests
│   ├── observability.config.ts     # Logging & monitoring namespace
│   ├── observability.config.spec.ts # Observability config tests
│   ├── health.config.ts            # Health checks namespace
│   ├── health.config.spec.ts       # Health config tests
│   ├── security.config.ts          # CORS & rate limiting namespace
│   ├── security.config.spec.ts     # Security config tests
│   ├── queue.config.ts             # Queue settings namespace
│   ├── queue.config.spec.ts        # Queue config tests
│   ├── circuit-breaker.config.ts   # Circuit breaker namespace
│   ├── circuit-breaker.config.spec.ts # Circuit breaker tests
│   ├── business.config.ts          # Business logic namespace
│   └── business.config.spec.ts     # Business config tests
│
├── schemas/                         # Zod validation schemas
│   ├── env.schema.ts               # Root environment schema
│   ├── env.schema.spec.ts          # Schema validation tests
│   ├── required/                   # Required config schemas
│   │   ├── app.schema.ts
│   │   ├── auth.schema.ts
│   │   ├── database.schema.ts
│   │   ├── redis.schema.ts
│   │   ├── storage.schema.ts
│   │   ├── communication.schema.ts
│   │   ├── websocket.schema.ts
│   │   └── security.schema.ts
│   └── optional/                   # Optional config schemas with defaults
│       ├── cache.schema.ts
│       ├── queue.schema.ts
│       ├── circuit-breaker.schema.ts
│       ├── logging-buffer.schema.ts
│       ├── health.schema.ts
│       └── business.schema.ts
│
├── types/                          # TypeScript type definitions
│   └── config.types.ts            # All configuration interfaces
│
├── validators/                     # Custom validators
│   ├── env.validator.ts          # Main validation function using Zod
│   └── env.validator.spec.ts     # Validator tests
│
└── README.md                      # Module documentation
```

## Implementation Phases

### Phase 1: Core Setup

1. Create directory structure
2. Define TypeScript interfaces in `types/config.types.ts`
3. Create Zod schemas for validation
4. Implement environment validator with parallel tests

### Phase 2: Namespace Configuration

1. Create namespace configurations using `registerAs()`
2. Each namespace loads its specific environment variables
3. Apply transformations (string to number, string to boolean)
4. Set default values for optional configs
5. Write spec files parallel to each namespace

### Phase 3: Service Implementation

1. Create `ConfigService` wrapper extending NestJS ConfigService
2. Override `get()` method to return typed namespace objects
3. Add environment flag helpers (isProduction, isDevelopment, etc.)
4. Add validation and type guards
5. Write `config.service.spec.ts` parallel to implementation

### Phase 4: Module Integration

1. Configure `ConfigModule.forRoot()` with:
   - Global registration
   - Namespace loaders
   - Zod validation
   - Caching enabled
2. Export extended `ConfigService`
3. Write `config.module.spec.ts` using NestJS testing utilities

### Phase 5: Documentation

1. Create comprehensive README
2. Add JSDoc comments to all public methods
3. Document usage examples

## Code Examples

### 1. Namespace Configuration (using NestJS registerAs)

```typescript
// namespaces/auth.config.ts
import { registerAs } from "@nestjs/config";

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: number;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: number;
  bcryptSaltRounds: number;
}

export default registerAs(
  "auth",
  (): AuthConfig => ({
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: parseInt(process.env.JWT_EXPIRES_IN!, 10),
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
    jwtRefreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN!, 10),
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS!, 10) || 12,
  })
);
```

### 2. Parallel Test File

```typescript
// namespaces/auth.config.spec.ts
import { describe, it, expect, beforeEach } from "vitest";
import authConfig from "./auth.config";

describe("AuthConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load auth configuration from environment", () => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "3600";

    const config = authConfig();

    expect(config.jwtSecret).toBe("test-secret");
    expect(config.jwtExpiresIn).toBe(3600);
  });

  it("should use default bcrypt salt rounds when not provided", () => {
    delete process.env.BCRYPT_SALT_ROUNDS;

    const config = authConfig();

    expect(config.bcryptSaltRounds).toBe(12);
  });
});
```

### 3. ConfigService with Namespace Access (Updated)

```typescript
// config.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";
import type { AuthConfig } from "./namespaces/auth.config";
import type { AppConfig } from "./namespaces/app.config";
import type { DatabaseConfig } from "./namespaces/database.config";
// ... other config type imports

@Injectable()
export class ConfigService extends NestConfigService {
  constructor() {
    super();
  }

  // Override get method to return typed namespace objects
  get<T = any>(propertyPath: string): T {
    const value = super.get<T>(propertyPath);

    // Return typed namespace objects for single-level access
    switch (propertyPath) {
      case "auth":
        return value as T;
      case "app":
        return value as T;
      case "database":
        return value as T;
      // ... other namespaces
      default:
        return value;
    }
  }

  // Typed namespace getters for better DX
  getAuth(): AuthConfig {
    return this.get<AuthConfig>("auth");
  }

  getApp(): AppConfig {
    return this.get<AppConfig>("app");
  }

  getDatabase(): DatabaseConfig {
    return this.get<DatabaseConfig>("database");
  }

  // Environment flags
  get isProduction(): boolean {
    return this.get<AppConfig>("app").nodeEnv === "production";
  }

  get isDevelopment(): boolean {
    return this.get<AppConfig>("app").nodeEnv === "development";
  }

  get isStaging(): boolean {
    return this.get<AppConfig>("app").nodeEnv === "staging";
  }

  get isTest(): boolean {
    return this.get<AppConfig>("app").nodeEnv === "test";
  }
}
```

### 4. Module Test Using NestJS Testing Utilities

```typescript
// config.module.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "./config.module";
import { ConfigService } from "./config.service";

describe("ConfigModule", () => {
  let module: TestingModule;
  let configService: ConfigService;

  beforeEach(async () => {
    // Set required environment variables
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test-secret-min-32-characters-long";
    // ... other required env vars

    module = await Test.createTestingModule({
      imports: [ConfigModule],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(async () => {
    await module.close();
  });

  it("should be defined", () => {
    expect(module).toBeDefined();
  });

  it("should provide ConfigService", () => {
    expect(configService).toBeDefined();
  });

  it("should load auth configuration", () => {
    const authConfig = configService.get("auth");
    expect(authConfig).toBeDefined();
    expect(authConfig.jwtSecret).toBe("test-secret-min-32-characters-long");
  });

  it("should detect test environment", () => {
    expect(configService.isTest).toBe(true);
    expect(configService.isProduction).toBe(false);
  });
});
```

### 5. ConfigModule Setup

```typescript
// config.module.ts
import { Module, Global } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { ConfigService } from "./config.service";
import { validateEnv } from "./validators/env.validator";

// Import all namespace configs
import appConfig from "./namespaces/app.config";
import authConfig from "./namespaces/auth.config";
import databaseConfig from "./namespaces/database.config";
// ... other configs

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: false, // We'll make our wrapper global instead
      cache: true,
      load: [
        appConfig,
        authConfig,
        databaseConfig,
        // ... other namespace configs
      ],
      validate: validateEnv, // Zod validation function
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
```

### 6. Usage in Services

```typescript
// example.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@/common/config";

@Injectable()
export class ExampleService {
  constructor(private readonly configService: ConfigService) {}

  async someMethod() {
    // Namespace-based access with full type safety
    const authConfig = this.configService.get("auth");
    const jwtSecret = authConfig.jwtSecret;

    // Or use typed getter methods
    const auth = this.configService.getAuth();
    const dbConfig = this.configService.getDatabase();

    // Environment flags
    if (this.configService.isDevelopment) {
      // Development-specific logic
    }
  }
}
```

## Testing Strategy (Updated)

### 1. Parallel Test Files

- Each implementation file has a corresponding `.spec.ts` file
- Tests are located next to the code they test
- Follows NestJS testing conventions

### 2. NestJS Testing Utilities

- Use `Test.createTestingModule()` for module tests
- Use `TestingModule` for dependency injection in tests
- Mock dependencies using NestJS providers

### 3. Test Coverage

- Unit tests for each namespace configuration
- Integration tests for ConfigModule
- Validation tests for Zod schemas
- Environment flag detection tests
- Error scenario tests

## Example Test Structure

```typescript
// Using NestJS testing utilities for module testing
import { Test, TestingModule } from "@nestjs/testing";

describe("ConfigModule Integration", () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  // ... tests
});
```

## Naming Conventions (Updated)

- **Module**: `config.module.ts` (not app-config.module.ts)
- **Service**: `config.service.ts` (not app-config.service.ts)
- **Tests**: `*.spec.ts` parallel to implementation files
- **Namespaces**: `{namespace}.config.ts` (e.g., auth.config.ts)
- **Schemas**: `{namespace}.schema.ts` (e.g., auth.schema.ts)

## Validation Flow

1. **Application Startup**
   - Load `.env` file
   - Parse environment variables
   - Run Zod validation

2. **Required Configs**
   - Validate all required fields exist
   - Validate format/type constraints
   - Fail fast with clear error messages if validation fails

3. **Optional Configs**
   - Apply default values
   - Log warnings for missing optional configs
   - Continue startup with defaults

4. **Runtime Access**
   - All configs cached after initial load
   - Type-safe access through ConfigService
   - No runtime validation needed (already validated at startup)

## Error Handling

### Startup Validation Errors

```typescript
// validators/env.validator.ts
export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.format();
    console.error('❌ Configuration validation failed:');

    // Pretty print errors
    Object.entries(errors).forEach(([key, value]) => {
      if (key !== '_errors' && value) {
        console.error(`  ${key}: ${JSON.stringify(value)}`);
      }
    });

    throw new Error('Application startup failed due to configuration errors');
  }

  // Log warnings for optional configs with defaults
  const optionalConfigs = ['CACHE_TTL', 'QUEUE_CONCURRENCY', ...];
  optionalConfigs.forEach(key => {
    if (!config[key]) {
      console.warn(`⚠️  Optional config ${key} not provided, using default value`);
    }
  });

  return result.data;
}
```

## Migration Path

For existing code using direct `process.env`:

1. Replace `process.env.JWT_SECRET` with `configService.get('auth').jwtSecret`
2. Inject `ConfigService` instead of using process.env
3. Update tests to use NestJS testing utilities

## Benefits

1. **Type Safety**: Full TypeScript support with IntelliSense
2. **Validation**: Fail fast with clear errors for misconfigurations
3. **Developer Experience**: Namespace access with autocomplete
4. **Maintainability**: Centralized configuration management
5. **Testing**: Parallel test files with NestJS testing utilities
6. **Performance**: Built-in caching for config values
7. **NestJS Native**: Leverages framework features without reinventing
8. **Consistent Naming**: Follows NestJS conventions

## Next Steps

1. Review and approve updated plan
2. Create directory structure
3. Implement in phases as outlined
4. Write parallel tests for each component
5. Update existing code to use new ConfigService
6. Document usage in README

## Success Criteria

- [ ] All required configs validated at startup
- [ ] Optional configs use defaults with warnings
- [ ] Full TypeScript type safety
- [ ] Namespace access pattern working (`configService.get('auth').jwtSecret`)
- [ ] Environment flags (isProduction, etc.) functional
- [ ] All tests parallel to implementations
- [ ] NestJS testing utilities used for module tests
- [ ] Consistent naming convention (config.service, config.module)
- [ ] 90%+ test coverage
- [ ] Zero runtime config errors
- [ ] Clear documentation and examples
