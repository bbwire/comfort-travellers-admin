# Execution Roadmap

## Phases and milestones
1) Bootstrap + Auth (Week 1)
- Nuxt 3 scaffold, Tailwind, Pinia, Naive UI, ECharts
- Firebase init, auth flows (email/password + Google)
- Role guard and protected routes, basic layout (sidebar/topbar/breadcrumb)

Acceptance criteria
- Login/logout works; unauthorized routes redirect
- Role-based access enforced in UI; smoke test with admin/agent
- Lint/type-check pass; baseline unit tests

2) Routes (Week 2)
- CRUD, server-side pagination, filters (origin/destination/active)
- Zod validation; activate/deactivate; empty/loading/error states

Acceptance criteria
- Create/edit/delete routes with validation
- Firestore rules prevent non-admin writes
- Unit tests for store + form; e2e happy path

3) Trips (Week 3)
- Schedule trips: departure/arrival, vehicle, seats; activate/cancel
- Seat availability preview (read-only)

Acceptance criteria
- Create/edit/cancel trips with validation
- Seat preview reflects reserved seats accurately
- Rules block invalid writes; unit + e2e pass

4) Vehicles (Week 3-4)
- Vehicle CRUD, crew assignment; link to routes/trips

Acceptance criteria
- Vehicle lifecycle (online/offline/maintenance) operational
- Crew assignment persists; audit timestamps present

5) Tickets (Week 4)
- Search/filter by id/user/date/status; view/cancel/use

Acceptance criteria
- Issue/cancel/use adheres to allowed states
- Non-admin cannot mutate restricted fields per rules

6) Users (Week 5)
- List users; promote/demote roles; deactivate

Acceptance criteria
- Only admins can change roles; user deactivation enforced

7) Reports (Week 5-6)
- KPIs dashboard and ECharts; CSV export

Acceptance criteria
- Dashboard KPIs match Firestore data
- CSV export available for date ranges

8) Notifications (Phase 2, optional)
- FCM topic/user notifications

9) CI/CD & Hosting (Continuous; final hardening in Week 6)
- Static generate and Firebase Hosting deploy
- Sentry (optional), accessibility/performance checks

## Definition of Ready (DoR)
- User stories defined with acceptance criteria
- Designs or low-fi wireframes available
- Firestore schema impacts reviewed
- Necessary env vars provided
- Test data available or seed plan defined

## Definition of Done (DoD)
- Lint/type-check pass; unit tests added/updated
- e2e happy path for the feature
- Accessibility checked for core interactions
- Docs updated (README, plan, or component notes)
- Deployed to preview or production with changelog

## Testing strategy
- Unit: Vitest + Vue Test Utils for stores/components
- e2e: Playwright on key flows (auth, CRUD, search/filter, export)
- Performance: Lighthouse budget; lazy-load ECharts
- Accessibility: basic checks (tab order, focus, contrast), automated axe (optional)

## Environments
- Local: `.env.development`, Firebase Emulator optional later
- Preview: Firebase Hosting preview channels per PR
- Production: Hosting on main branch deploys

## Risks and mitigations
- Index gaps → monitor console links; add indexes promptly
- Permission mistakes → dual enforcement (UI + rules) and negative tests
- Data consistency → server timestamps, constrained state transitions
- Performance regressions → code-splitting and memoization patterns

## Deliverables per phase
- Source updates + tests
- Changelog entry
- Screenshots (or short Loom) of the flow
- Updated rules/indexes when applicable


