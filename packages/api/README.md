# @repo/api - Shared API Types & DTOs

This package contains shared types, DTOs, and entities used across the monorepo.

## Export Strategy

We use **domain-level barrel exports** for clean, maintainable exports:

```
src/
├── index.ts                 # Main entry point - re-exports all domains
├── example/
│   ├── index.ts            # Domain barrel - exports all DTOs & entities
│   ├── dto/
│   │   ├── create-example.dto.ts
│   │   └── update-example.dto.ts
│   └── entities/
│       └── example.entity.ts
```

Each domain has a single `index.ts` that exports everything from that domain.

## Usage

### Import individual items (recommended)

```typescript
import { Example, CreateExampleDto, UpdateExampleDto } from "@repo/api";
```

### Import from specific paths (if needed)

```typescript
import { CreateExampleDto } from "@repo/api/dist/example/dto";
```

## Best Practices

1. **One barrel per domain** - Each domain has a single `index.ts` that exports everything
2. **Use wildcard exports** - `export * from "./file"` is cleaner than listing each export
3. **Group by domain logic** - Keep related DTOs, entities, enums together by domain
4. **Avoid default exports** - Named exports work better with auto-imports and refactoring tools

## Adding New Domains

When adding a new domain (e.g., users):

1. Create the directory structure:

   ```
   src/users/
   ├── index.ts              # Single barrel for the domain
   ├── dto/
   │   ├── create-user.dto.ts
   │   └── update-user.dto.ts
   └── entities/
       └── user.entity.ts
   ```

2. Add exports to `users/index.ts`:

   ```typescript
   // Export all DTOs
   export * from "./dto/create-user.dto";
   export * from "./dto/update-user.dto";

   // Export all entities
   export * from "./entities/user.entity";

   // Export any other domain items (enums, interfaces, etc.)
   ```

3. Re-export from main `src/index.ts`:

   ```typescript
   export * from "./users";
   ```

4. Build the package:
   ```bash
   pnpm build
   ```

## Benefits of This Approach

- ✅ **No manual maintenance** - New exports are automatically available
- ✅ **Clean imports** - Users can import from the package root
- ✅ **Type safety** - Full TypeScript support with classes as types
- ✅ **Tree-shaking friendly** - Bundlers can optimize unused exports
- ✅ **IDE friendly** - Auto-imports work seamlessly
