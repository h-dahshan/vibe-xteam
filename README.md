# Vibe XTeam

This is a monorepo:turborepo project.
Bootstrapped by the community nestjs+nextjs example.
Revamped and reconfigured, prepared for XTeam product.

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

    ├── apps
    │   ├── api                       # nestjs app (https://nestjs.com).
    |   |-- dashboard                 # Reactjs app - TS/Vite (https://vite.dev).
    │   └── landing                   # Nextjs app (https://nextjs.org).
    └── packages
        ├── @repo/api                 # Shared `NestJS` resources.
        ├── @repo/eslint-config       # `eslint` configurations (includes `prettier`)
        ├── @repo/typescript-config   # `tsconfig.json`s used throughout the monorepo
        └── @repo/ui                  # Shareable stub React component library.

Each package and application are 100% [TypeScript](https://www.typescriptlang.org/) safe.

### Utilities

This `Turborepo` has some additional tools already set for you:

- [TypeScript](https://www.typescriptlang.org) for static type-safety
- [ESLint](https://eslint.org) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Vitest](https://vitest.dev) & [Playwright](https://playwright.dev) for testing

### Commands

This `Turborepo` already configured useful commands for all your apps and packages.

#### Run

```bash
pnpm dev
```

#### Test

```bash
pnpm test
pnpm test:e2e
```

#### Lint

```bash
pnpm lint
```

#### Format

```bash
pnpm format
```

#### Build

```bash
pnpm run build
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```bash
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```bash
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
