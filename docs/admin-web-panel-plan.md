# Admin Web Panel - Implementation Plan (Nuxt 3)

## Overview
A separate Nuxt 3 web admin panel for managing routes, trips, vehicles, users, tickets, reports, and notifications. Built with Yarn and deployed on Firebase Hosting. Uses Firebase Auth and Firestore with role-based access. Designed for high usability, accessibility, and reliability with a clear design system, robust validation, testing, CI/CD, and observability.

## Tech Stack
- Framework: Nuxt 3 + TypeScript
- UI: Tailwind CSS + Naive UI (component library)
- State: Pinia
- Utilities: VueUse, Zod (validation), Day.js (dates)
- Charts: Apache ECharts
- Firebase (Web v10 modular): Auth, Firestore, Storage, Analytics, Cloud Messaging (optional), Remote Config (optional)
- Hosting: Firebase Hosting (static site via Nuxt generate; CI via GitHub Actions optional)
- Error monitoring: Sentry (optional but recommended)
- Testing: Vitest + Vue Test Utils (unit), Playwright (e2e)
- Linting & formatting: ESLint + Prettier, commitlint + Husky, lint-staged

## Authentication & Authorization
- Firebase Auth (Email/Password, Google)
- Role stored in `users/{uid}.role ∈ {admin, agent, customer}`
- Middleware guard: blocks access if role not in required set; redirects to `/login` or `/403`
- Firestore rules enforce server-side permissions (admins write; agents limited)
- Session handling: use Firebase onAuthStateChanged; SSR-safe checks via client plugin; persist minimal user profile + role in Pinia
- Optional second-factor for admin accounts via Firebase MFA
- Route meta-based RBAC: define `meta: { roles: ['admin','agent'] }` in pages

## Firestore Collections Used
- `users` (roles, profile)
- `routes` (name, origin, destination, basePrice, stops, isActive)
- `trips` (routeId, times, vehicleId, seats, isActive)
- `vehicles` (vehicleNumber, status, crew)
- `tickets` (userId, tripId, routeId, amount, status)
- `transactions` (amount, method, ticketId)
- `vehicleLocations` (for tracking)

Field guidelines (high-level):
- `users`: role, displayName, email, isActive, createdAt, updatedAt
- `routes`: name, origin, destination, basePrice, stops[], isActive, createdAt, updatedAt
- `trips`: routeId, departureTime, arrivalTime, vehicleId, totalSeats, reservedSeats, isActive, createdAt, updatedAt
- `vehicles`: vehicleNumber, status ∈ {online, offline, maintenance}, crew[], createdAt, updatedAt
- `tickets`: userId, tripId, routeId, amount, status ∈ {issued, used, cancelled, refunded}, issuedAt, updatedAt
- `transactions`: ticketId, amount, method ∈ {cash, mobileMoney, card}, reference, status, createdAt
- Timestamps via serverTimestamp()

Recommended indexes:
- `tickets`: userId ASC, issuedAt DESC
- `trips`: routeId ASC, isActive ASC, departureTime ASC
- `routes`: isActive ASC, name ASC
- `vehicles`: status ASC, vehicleNumber ASC
- `transactions`: ticketId ASC, createdAt DESC

## Pages
- Dashboard
  - KPIs: Tickets sold (today), Revenue (UGX), Active trips, Vehicles online
  - Charts (ECharts): Sales over time, Top routes, Payment breakdown
- Routes
  - List, filter, create, edit, activate/deactivate
- Trips
  - Schedule trips: departure/arrival, vehicle, seats; activate/cancel
  - Seat availability preview
- Vehicles
  - CRUD vehicles; assign to route/trip; crew assignment
- Tickets
  - Search/filter by id/user/date/status; view/cancel/use
- Users
  - List; promote/demote roles; deactivate
- Reports
  - Daily/weekly/monthly: tickets, revenue, top routes
  - CSV export
- Notifications (Phase 2)
  - Send schedule-change/booking/payment notifications via FCM

## UX & Design System
- Design language: modern, minimal, responsive; light/dark theme with system preference
- Components: Naive UI as base; custom wrappers for tables, forms, filters, date-range picker, seat-map, and chart cards
- Layout: persistent sidebar with collapsible sections; topbar with search, profile, and quick actions; breadcrumb and page-level actions
- Tables: server-side pagination, column filters, quick search, row selection, sticky header, empty/loading/error states
- Forms: Zod schemas with inline and summary validation, optimistic UI where safe; autosave for edits where applicable
- Feedback: toasts for success/error; confirm modals for destructive actions; non-blocking loaders
- Accessibility: keyboard navigation, focus states, semantic markup, color-contrast AA+, ARIA for critical components
- Internationalization-ready (Phase 2): Nuxt i18n module; copy kept in locale files

## Nuxt Structure
- `middleware/auth.global.ts`: fetch user + role; protect routes
- `plugins/firebase.client.ts`: init Firebase app, auth, firestore
- `plugins/naive-ui.client.ts`: register Naive UI
- `plugins/echarts.client.ts`: register ECharts
- `plugins/sentry.client.ts` (optional): error monitoring
- `layouts/default.vue`: sidebar, topbar, breadcrumbs, dark mode
- `pages/`
  - `index.vue` (Dashboard)
  - `routes/index.vue`, `routes/new.vue`, `routes/[id].vue`
  - `trips/index.vue`, `trips/new.vue`, `trips/[id].vue`
  - `vehicles/index.vue`, `vehicles/new.vue`, `vehicles/[id].vue`
  - `tickets/index.vue`, `tickets/[id].vue`
  - `users/index.vue`, `users/[id].vue`
  - `reports/index.vue`
- `stores/`
  - `auth.store.ts`, `routes.store.ts`, `trips.store.ts`, `vehicles.store.ts`, `tickets.store.ts`, `users.store.ts`
- `components/`
  - tables, forms, filters, date-range, seat-map, charts (ECharts wrappers)
- `lib/`
  - `repositories/` Firestore data access layer per collection (CRUD, queries)
  - `validation/` Zod schemas
  - `utils/` helpers (date, currency, firestore converters)

## Security Rules Alignment (High-level)
- Admins: write all admin-managed collections
- Agents: limited writes (issue/cancel tickets), read routes/trips/vehicles
- Customers: read-only where appropriate
- Validate critical fields; use server timestamps
- Example enforcement:
  - Only admins can create/edit `routes`, `trips`, `vehicles`, `users.roles`
  - Agents can create `tickets`, update `tickets.status` with constraints
  - Deny writes to sensitive fields from clients; validate numeric ranges and references
- Consider adding Cloud Functions (Phase 2) for complex server-side validations or transactional writes

## Milestones
1. Bootstrap + Auth
   - Nuxt 3 with Yarn, Tailwind, Pinia, Naive UI, ECharts
   - Firebase init, auth flows, role guard
2. Routes
   - Routes CRUD + validation (Zod)
3. Trips
   - Trip scheduling, seat availability preview, actions
4. Vehicles
   - Vehicle CRUD, crew assignment
5. Tickets
   - Search/filter, detail, cancel/use
6. Users
   - Role management, deactivate
7. Reports
   - KPIs + ECharts dashboards + CSV export
8. Notifications (Phase 2)
   - FCM topic/user notifications for events
9. CI/CD & Hosting
   - Firebase Hosting, GitHub Actions, environment secrets
10. Observability & Hardening
    - Sentry, performance budget, accessibility audit, rule reviews

## Acceptance Criteria (per milestone)
- All CRUD screens include form validation, loading/error states, and optimistic UI where safe
- Access controls enforced both in UI and Firestore rules; manual URL access blocked
- Lighthouse: Performance ≥ 90, Accessibility ≥ 95 on key pages
- Unit tests: critical stores/components ≥ 70% coverage; e2e happy paths for auth and CRUD flows
- Zero ESLint errors; Prettier formatting applied; type-check passes

## Yarn Commands (setup)
- Create: `yarn dlx nuxi init comfort-admin`
- Dev deps: `yarn add -D tailwindcss postcss autoprefixer @types/node`
- App deps: `yarn add firebase pinia @vueuse/core naive-ui echarts zod dayjs`
- Tailwind init: `npx tailwindcss init -p`
- Dev: `yarn dev`
 - Static build: `yarn generate` (outputs `.output/public`)
- Linting/Formatting: `yarn add -D eslint @nuxtjs/eslint-config-typescript prettier eslint-config-prettier eslint-plugin-import eslint-plugin-unused-imports`
- Git hooks: `yarn add -D husky lint-staged @commitlint/cli @commitlint/config-conventional`
- Testing: `yarn add -D vitest @vue/test-utils @vitejs/plugin-vue playwright @playwright/test`
- Sentry (optional): `yarn add @sentry/vue @sentry/tracing`

## Firebase Hosting
- Initialize: `firebase init hosting`
  - Select project, set `public` to `.output/public`
- Build & deploy (static):
  - Generate static site: `yarn generate` (Nuxt 3 → `.output/public`)
  - Deploy: `firebase deploy --only hosting`
  - Preview (optional): `firebase hosting:channel:deploy preview-<branch>`
- CI (optional): GitHub Actions generates static and deploys on `main`
- Service account: set `FIREBASE_SERVICE_ACCOUNT` (JSON) or use `firebase-token` in CI secrets
- Preview channels per PR; automatic expiry; comment back URLs

## Environment
- `.env` variables (exposed via Nuxt runtime config):
  - `NUXT_PUBLIC_FIREBASE_API_KEY`, `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NUXT_PUBLIC_FIREBASE_PROJECT_ID`, `NUXT_PUBLIC_FIREBASE_APP_ID`, `NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, etc.
- Non-public runtime config in `.env` (do not expose): Sentry DSN, analytics toggle, feature flags
- `.env.example` committed; `.env` ignored; safe defaults and required-keys check on boot
- Separate env files per environment: `.env.development`, `.env.staging`, `.env.production`

## Data Access Layer
- Create collection-specific repositories (CRUD + queries); centralize Firestore converters and constraints
- Prefer batched writes for multi-document updates; retries on transient errors
- Client-side caching via Pinia + shallow refs; invalidate on writes

## UX Guidelines
- Tables with server-side pagination & filters
- Zod for form schema validation
- Toasts/modals for CRUD ops
- Keyboard shortcuts: `/` search, `N` new item
- Empty states: informative with CTAs; skeletons for loading; error panels with retry
- Mobile and tablet responsive; critical flows test at 375px, 768px, 1280px

## Static Generation Constraints
- Use client-side Firebase SDK only; no server routes or server middleware
- Ensure all data fetching happens on client lifecycle hooks; guard pages via client middleware
- Enable SPA-style history fallback: `"rewrites": [{ "source": "**", "destination": "/index.html" }]` in `firebase.json` if needed
- Avoid server-only APIs; prefer Firestore client rules + optional Cloud Functions (Phase 2)
- Dynamic routes should be pre-rendered only if known at build time; otherwise render via client

## Performance & Accessibility
- Code-splitting at page and large component boundaries; lazy-load ECharts
- Use `v-memo`, `computed`, and `defineModel/defineProps` patterns to reduce re-renders
- Preload key fonts; avoid layout shift; optimize icons via unplugin-icons or SVG sprites
- Accessibility checks via Playwright Axe (optional) and manual audits

## Analytics & Monitoring
- Firebase Analytics events: login, logout, route_create/update, trip_schedule, vehicle_update, ticket_issue/cancel/use, report_export
- Sentry: capture frontend errors with user context (uid, role), PII-safe

## Code Quality & Workflow
- ESLint + Prettier enforced via Husky pre-commit; lint-staged for staged files
- Conventional commits via commitlint
- Branching: feature branches → PR → preview deploy; squash merge
- PR template with checklist (tests, screenshots, accessibility, performance baseline)

## CI/CD
- GitHub Actions:
  - Install via Yarn; restore cache
  - Lint, type-check, unit tests, build
  - Playwright e2e on preview URL (optional)
  - Deploy to Firebase Hosting on `main`
- Required secrets: `FIREBASE_SERVICE_ACCOUNT` or `FIREBASE_TOKEN`, `NUXT_ENV_*` as needed

## Firestore Rules (Outline)
- Validate roles and ownership for each collection
- Deny write to server-managed fields (createdAt/updatedAt, totals)
- Reference existence checks (routeId, tripId, vehicleId) where feasible
- Ticket state machine enforcement in rules or Cloud Functions (if needed)

## Migration & Seed Data
- Seed scripts (Node or Firebase CLI) for demo data: routes, vehicles, sample trips/tickets
- Backup plan: scheduled exports (via Cloud Scheduler + Functions) or manual `gcloud` export (Phase 2)

## Risks & Mitigations
- Permissions drift → reinforce in Firestore rules and code guards
- Index gaps → capture console error links and add to indexes config
- Data consistency → prefer server timestamps and transactional updates where needed
- Vendor lock-in → isolate data access via repositories; document schemas
- Performance regressions → baseline Lighthouse, CI checks, lazy-loading heavy libs

## Next Steps
- Confirm branding and navigation items
- Scaffold project with the dependencies listed
- Implement auth shell + protected routes
- Start with Routes CRUD, then Trips scheduling

## Deliverables
- Source code with documented `README.md`
- `.env.example` with all required variables
- Firestore rules and indexes files (exported)
- CI pipeline config and deploy status
- Test reports and coverage summary

## Branding & UI Inputs (from stakeholder)
- Logo, brand colors, typography preferences
- Primary KPIs to highlight on dashboard
- Navigation structure approval and copy tone
