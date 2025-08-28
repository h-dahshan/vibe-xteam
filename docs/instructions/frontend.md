# Frontend Development Guidelines - React

## Ecosystem Tools & Technology Stack

### Core Framework & Build Tools

- **React 18+** with concurrent features and Suspense
- **Vite** for development and build tooling
- **TypeScript 5+** with strict configuration
- **ESLint** with React hooks rules and accessibility plugins
- **Prettier** for consistent code formatting
- **Husky** with lint-staged for pre-commit hooks

### Routing & Navigation

- **TanStack Router** for client-side routing
- Use **nested routing** for complex application structures
- Use **lazy loading** for route-based code splitting
- Implement **route guards** for protected routes
- Implement **programmatic navigation** with proper history management

### State Management

- **Zustand** for simple to medium complexity state (recommended)
- **Context API** only for theme, auth, and simple shared state
- **TanStack Query** for server state management
- Avoid **prop drilling** - use state management solutions
<!-- - **Redux Toolkit (RTK)** with RTK Query for complex applications -->

### Form Management & Validation

- **React Hook Form** for performant form handling
- **Zod** for runtime schema validation and TypeScript inference
- **Hookform/resolvers** for seamless integration
- Implement **controlled components** sparingly
- Implement **field-level validation** with real-time feedback

### Styling & UI Components

- **Tailwind CSS** for utility-first styling approach
- **Shadcn** for accessible primitive components, **Stale** base colors and **Blue** theme
- **Lucide React** for consistent iconography
- **Framer Motion** for smooth animations and transitions
- **CSS Modules** or **Styled Components** for component-specific styles when needed, 2nd choice

### API Integration

- **fetch API** for request/response handling
- **TanStack Query** for caching, synchronization, and background updates
- Implement **reusable** abstract integration layer with **auth & retry** in mind
- Implement **retry logic** and **error boundary** integration
- Implement **optimistic updates** for better user experience
- Apply **request deduplication** to prevent duplicate calls

### Testing Framework

- **Vitest** for unit and integration testing
- **React Testing Library** for component testing
- **Playwright** for end-to-end testing
- **MSW (Mock Service Worker)** for API mocking
<!-- - **Storybook** for component documentation and testing -->

### Development & Quality Tools

- **React DevTools** for debugging and profiling
- **React Query DevTools** for query state inspection
- **Bundle Analyzer** for build optimization analysis
- **Lighthouse CI** for automated performance auditing
<!-- - **Chromatic** for visual regression testing with Storybook -->

---

## TypeScript Configuration & Best Practices

- Use **strict mode** with all strict compiler options
- Use **explicit return types** for all functions and components
- Use **union types** for component variants and states
- Use **Props interfaces** with proper naming (ComponentNameProps)
- Use **type assertions** sparingly and with type guards
- Use **satisfies operator** for type narrowing without widening
- Use **const assertions** for immutable data structures
- Use **utility types** (Pick, Omit, Partial) for type transformations
- Avoid **any** type - use **unknown** or proper type guards
- Implement **API response types** matching backend contracts
- Implement **generic components** for reusable type-safe components
- Implement **conditional types** for advanced prop relationships
- Implement **branded types** for domain-specific values
- Implement **discriminated unions** for complex state management
- Implement **module declaration** for third-party library types

---

## Accessibility (A11y) Standards

- Target **WCAG 2.1 AA compliance** as minimum standard
- Use **semantic HTML elements** (header, nav, main, aside, footer)
- Use **ARIA labels** and **descriptions** for interactive elements
- Use **ARIA landmarks** for screen reader navigation
- Use **aria-live regions** for dynamic content updates
- Implement **proper heading hierarchy** (h1, h2, h3) without skipping levels
- Implement **form labels** and **error announcements**
- Implement **alternative text** for all images and media content
- Implement **keyboard navigation** support for all interactive elements
- Implement **focus management** with visible focus indicators
- Implement **screen reader** testing with NVDA or JAWS
- Implement **skip links** for main content navigation
- Apply **color contrast ratios** meeting WCAG standards (4.5:1 normal, 3:1 large)
- Apply **reduced motion** preferences for animations
- Test with **automated accessibility tools** (axe-core with Lighthouse)

---

## Responsive Design & Mobile-First Approach

- Use **Tailwind's responsive breakpoints** (sm, md, lg, xl, 2xl)
- Use **responsive images** with srcset and sizes attributes
- Use **viewport meta tag** with proper scaling settings
- Use **aspect-ratio** property for consistent media containers
- Use **orientation change** handling for tablet experiences
- Implement **responsive navigation** patterns (burger menus, drawer navigation)
- Implement **mobile-first design** philosophy with progressive enhancement
- Implement **fluid typography** with clamp() or responsive units
- Implement **flexible grid systems** with CSS Grid and Flexbox by Tailwind
- Implement **touch-friendly** interface elements (minimum 44px touch targets)
- Implement **responsive tables** with horizontal scrolling or stacking
- Implement **container queries** for component-level responsiveness
- Implement **print stylesheets** for better printing experience
- Implement **safe area insets** for mobile devices with notches
- Test on **real devices** and various screen sizes

---

## Foundational Best Practices

- Use **consistent naming conventions**
  - (kebab-case for files, PascalCase for components, camelCase for functions)
- Use **absolute imports** with path aliases (@/components, @/utils)
- Use **lazy loading** for routes and heavy components
- Use **code splitting** strategies for bundle optimization
- Use **environment configuration** for different deployment stages
- Implement **component-based architecture** with single responsibility
- Implement **atomic design methodology** (atoms, molecules, organisms)
- Implement **barrel exports** (index.ts) for clean imports
- Implement **error boundaries** at appropriate component levels
- Implement **progressive enhancement** for core functionality
- Implement **feature flags** for gradual rollouts
- Apply **separation of concerns** (UI logic vs business logic)
- Apply **self-contained folder structure** by feature or domain
  - each module should have all its deps, components, locales, integrations, state, subrouting, etc...
  - elevate shared stuff to src/ in proper domain directory

---

## React Best Practices & Patterns

- Use **React.StrictMode** in development for detecting side effects
- Use **functional components** with hooks exclusively
- Use **useEffect** and **useState** sparingly
- Use **useReducer** for complex state logic instead of multiple useState
- Use **useCallback** and **useMemo** judiciously for performance
- Use **React.memo** for expensive pure components
- Use **concurrent features** (startTransition, useDeferredValue) for performance
- Use **portal patterns** for modals and overlays
<!-- - Use **React DevTools Profiler** for performance optimization -->
- Implement **custom hooks** for reusable stateful logic
- Implement **error boundaries** for graceful error handling
- Implement **Suspense boundaries** for loading states
- Implement **key props** correctly for list rendering optimization
- Implement **ref forwarding** for component composition
- Implement **virtualization** for large lists (react-window, react-virtualized)
- Implement **compound component pattern** for flexible component APIs
- Implement **render props** or **children as function** patterns when needed
- Implement **code splitting** at component level with React.lazy, if needed

---

## Core Web Vitals & Performance

### Largest Contentful Paint (LCP)

- Implement **preloading** for critical resources
- Apply **image optimization** and **responsive images**
- Minimize **render-blocking resources**
<!-- - Use **CDN** for static asset delivery -->

### First Input Delay (FID)

- Use **code splitting** to reduce main thread blocking
- Implement **Web Workers** for heavy computations
- Apply **React concurrent features** for better responsiveness
- Optimize **JavaScript bundle size** and **execution time**
<!-- - Use **requestIdleCallback** for non-critical tasks -->

### Cumulative Layout Shift (CLS)

- Use **aspect-ratio** for maintaining layout stability
- Use **skeleton loading** instead of spinners
- Avoid **dynamically injected content** above viewport
- Define **explicit dimensions** for images and media
- Apply **font loading strategies** (font-display: swap)

### Additional Performance Optimizations

- Use **intersection observer** for lazy loading
- Implement **service workers** for caching strategies
- Implement **bundle analysis** and **tree shaking**
- Apply **resource hints** (preload, prefetch, preconnect)
<!-- - Use **performance monitoring** tools (Web Vitals, Lighthouse CI) -->

---

## Testing Strategy & Implementation

### Unit Testing

- Test **component behavior** not implementation details
- Use **screen queries** from React Testing Library
- Test **user interactions** rather than internal state
- Apply **accessibility-first** testing approach (getByRole, getByLabelText)
- Mock **external dependencies** and **API calls**
- Test **error states** and **edge cases**
- Use **custom render** utilities for provider setup

### Integration Testing

- Use **MSW** for API integration testing
- Test **component integration** with real dependencies
- Test **user workflows** across multiple components
- Test **responsive behavior** with different viewport sizes
- Apply **realistic data** scenarios in tests

### E2E Testing

- Use **Page Object Model** for maintainable tests
- Use **parallel test execution** for faster feedback
- Test **critical user journeys** end-to-end
- Test **cross-browser compatibility**
- Test **performance metrics** in E2E scenarios
- Apply **visual regression testing** for UI consistency

### Testing Best Practices

- Maintain **high test coverage** (80%+ for critical paths)
- Use **test-driven development** (TDD) for complex features
- Use **snapshot testing** sparingly and maintain them properly
- Apply **testing pyramid** approach (more unit tests, fewer E2E)
<!-- - Implement **continuous testing** in CI/CD pipeline -->

---

## DateTime Management

- Use **date-fns** for lightweight date manipulation
- Use timezoned **ISO 8601 format** for date storage and API communication
- Use **date validation** with proper error handling
- Use **business day calculations** excluding weekends and holidays
- Use **time zone conversion** utilities for global applications
- Implement **timezone-aware** date handling with proper libraries
- Implement **date formatting** based on user locale preferences
- Implement **relative time** formatting (1 hour ago, yesterday)
- Implement **duration calculations** with proper library support
- Implement **recurring date** patterns for scheduling
- Apply **localization** for date and time display formats
- Apply **calendar integration** for date picker components
- Apply **date range** handling with validation
- Apply **Arabic calendar** support for Arabic localization

---

## Forms Management & User Experience

- Use **React Hook Form** for performant form handling
- Use **smart defaults** and **auto-completion** where appropriate
- Use **conditional field rendering** based on user selections
- Use **uncontrolled components** for better performance
- Implement **accessibility** features (labels, error associations, announcements)
- Implement **Zod schemas** for type-safe validation
- Implement **field-level validation** with real-time feedback
- Implement **form state persistence** for long forms
- Implement **progressive disclosure** for complex forms, if needed
- Implement **multi-step forms** with progress indicators, if needed
- Implement local **draft saving** for forms with significant user investment
- Implement **keyboard shortcuts** for power users
- Implement **mobile-optimized** input types and patterns
- Apply **error prevention** strategies rather than just error handling
<!-- - Apply **form analytics** for optimization insights -->

---

## Internationalization (i18n) & Localization

- Use **react-i18next** for comprehensive i18n support
- Use **interpolation** and **pluralization** features
- Use **translation key** constants to prevent typos
- Use **namespace organization** for translation files
- Use **locale detection** from browser, then from user preferences
- Implement **lazy loading** for translation resources
- Implement **RTL (Right-to-Left)** support for Arabic content
- Implement **locale-specific** formatting for numbers, dates, currencies
- Implement **fallback strategies** for missing translations
- Implement **context-aware translations** for better accuracy
- Implement **pseudo-localization** for testing
- Implement **SEO optimization** for multilingual content
- Implement **dynamic locale switching** without page refresh
- Implement **accessibility** considerations for RTL layouts
<!-- - Use **translation management** platforms for team collaboration -->

---

## Error Handling & User Experience

- Use **global error handlers** for unhandled promise rejections
- Use **toast notifications** for non-critical errors
- Use **accessible error** announcements for screen readers
- Use **loading states** to prevent user confusion
- Implement **React Error Boundaries** at strategic levels
<!-- - Implement **error reporting** to monitoring services (Sentry) -->
- Implement **user-friendly error messages** instead of technical details
- Implement **retry mechanisms** for transient failures
- Implement **fallback UI** for component errors
- Implement **offline support** with appropriate messaging
- Implement **form validation** with clear error indicators
- Implement **progressive enhancement** for graceful degradation
- Implement **error categorization** (network, validation, application)
- Implement **user guidance** for error resolution
<!-- - Apply **error analytics** for improvement insights -->

## Security Best Practices

- Use **sanitization** for user-generated content (DOMPurify)
- Use **environment variables** for sensitive configuration
- Use **security headers** (HSTS, X-Frame-Options, X-Content-Type-Options)
- Use **secure communication** protocols and practices
- Use **secure coding patterns** to prevent XSS and injection attacks
- Implement **Content Security Policy (CSP)** headers
- Implement **secure authentication** token handling
- Implement **secure development** practices and code review
- Implement **secure storage** practices for sensitive data
- Implement **input validation**
- Implement **session management** best practices
  <!-- - Apply **regular security audits** and penetration testing -->
  <!-- - Apply **dependency vulnerability** scanning regularly -->

## Bundle Optimization & Performance

- Use **dynamic imports** for conditional feature loading
- Use **asset optimization** (images, fonts, icons)
- Use **lazy loading** for images and non-critical content
- Use **modern JavaScript** features with appropriate polyfills
- Implement **code splitting** at route and component levels
- Implement **tree shaking** to eliminate dead code
- Implement **prefetching** strategies for anticipated navigation
- Implement **service worker** caching for better performance
- Implement **resource prioritization** for critical rendering path
- Implement **progressive web app** features where beneficial
  <!-- - Implement **edge caching** strategies for static assets -->
  <!-- - Implement **module federation** for micro-frontend architectures -->

## Development Workflow & DevOps

- Use **feature branches** with pull request workflows
- Implement **automated testing** in CI/CD pipeline
- Apply **code review** processes with checklist guidelines
- Use **semantic versioning** for release management
- Implement **automated deployment** with proper staging
- Apply **environment parity** between development and production
- Use **feature flags** for controlled feature rollouts
- Implement **monitoring and alerting** for production issues
- Apply **rollback strategies** for deployment failures
- Use **performance monitoring** and **real user monitoring (RUM)**
- Implement **A/B testing** infrastructure for feature validation
- Apply **documentation** standards for code and processes
- Use **dependency management** with regular updates
- Implement **security scanning** in development pipeline
- Apply **backup and recovery** procedures for critical data
