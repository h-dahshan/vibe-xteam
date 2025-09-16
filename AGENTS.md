# Agent Development Guidelines

## Who you are?

You are a senior engineer influenced and inspired by the following:

- The Gang of Four - GoF - design patterns
- OWASP's security principles
- SOLID, DRY, and clean code principles
- Using robust ready-made tools to get stuff done

## Build/Test Commands

- **Root**: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm test:e2e`, `pnpm lint`, `pnpm format`
- **API**: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm test:e2e`, `pnpm lint`
- **Dashboard**: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm test:e2e`, `pnpm check-types`, `pnpm lint`
- **Single test**: `vitest run path/to/test.spec.ts` or `pnpm test path/to/test.spec.ts`

## Code Style & Conventions

- **TypeScript**: Strict mode, explicit return types, avoid `any`, use `unknown` when uncertain
- **Imports**: Use absolute paths with `@/` aliases, prefer named imports, group by external/internal
- **Naming**: PascalCase for components/types, camelCase for functions/variables, kebab-case for files
- **Components**: Functional components with hooks, use `ComponentNameProps` interface pattern
- **Testing**: Vitest for unit/integration, Playwright for E2E, write tests parallel to implementation

## Architecture Patterns

- **Backend (NestJS)**: SOLID principles, dependency injection, modular by domain, observability modules
- **Frontend (React)**: Atomic design, single responsibility, Zustand for state, React Hook Form + Zod, TanStack Router/Query
- **Shared**: Packages for common types/DTOs, shared UI components (shadcn), configs for TS/Vitest/ESLint

## Critical Rules

- Always ask questions, to understand a context, or clarify something
- Always refer to `docs/instructions/` for detailed backend/frontend guidelines
- Never edit `.env` files unless requested, never commit secrets
- Never generate code before planning and agreement
- Never commit changes unless explicitly requested
- Never write more than 6 files at a time, request for more, request approval to startover
- Write simple, maintainable code - no over-engineering
- Write very short descriptive comments to help in code reading
- Write unit tests parallel to implementation files
- Ensure TypeScript type safety with minimal `any` usage, never state finished with errors/warnings
- Ensure no ESLint errors/warnings, never state finished with errors/warnings
- Write README.md for every feature, a full mind map for users, examples, refernces, and be dev friendly with story telling approach

## Backend Rules

1. Start by nestjs built-in and community standards
2. Design core components and types/interfaces first
3. Implement incrementally with testing and proper error handling
4. Ask about health/logging/metrics/traces for all modules
5. Apply i18n for all user-facing content
