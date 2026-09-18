# 02 — Architecture

Authoritative technical architecture for the 180 Fitness Studio demo. Derived from `GYM_DEMO_MASTER_PLAN.md`; every deviation is recorded in `/docs/13-DECISIONS.md`.

---

## 1. Shape of the system

A single Next.js 16 App Router application. No backend, no database, no API routes. The entire domain lives in the browser:

```
seed generator (pure, deterministic)
        |
        v
mock repositories  (async, simulated latency)   <-- the only future-backend seam
        |
        v
Zustand stores     (live demo state, the single source of truth)
        |
        v
pure selectors     (domain/selectors/**: every derived number)
        |
        v
hooks              (bind store slices + selectors, control re-renders)
        |
        v
React components   (presentation only)
```

Rules that follow from that diagram:

1. A component never computes a business number inline. It calls a hook, which calls a selector.
2. A selector never imports a store. Selectors are pure functions of their arguments.
3. A store never imports a component. Stores import repositories and types only.
4. `src/data/**` is the seed layer; nothing outside `src/services/repositories/**` imports it.
5. Business logic never imports Next.js, React or UI packages.

---

## 2. Directory layout

```text
src/
  app/
    layout.tsx                 root layout (server): fonts, <Providers>, <Toaster>
    page.tsx                   redirect -> /dashboard
    globals.css                Tailwind v4 @theme design tokens + shadcn bridge
    not-found.tsx
    error.tsx
    (auth)/
      login/page.tsx
    (admin)/
      layout.tsx               AuthGuard + AppShell (client)
      error.tsx
      dashboard/page.tsx
      calendar/page.tsx
      bookings/page.tsx
      customers/page.tsx
      customers/[id]/page.tsx
      classes/page.tsx
      classes/[id]/page.tsx
      instructors/page.tsx
      instructors/[id]/page.tsx
      memberships/page.tsx
      automations/page.tsx
      settings/page.tsx
    book/
      layout.tsx               public shell (no sidebar, mobile-first)
      page.tsx                 booking wizard
      [classId]/page.tsx       wizard with the class preselected

  components/
    layout/      AppSidebar, TopBar, MobileNav, AppShell, PageHeader, DemoBadge
    dashboard/   KPI cards, weekly chart, occupancy list, upcoming classes, recent bookings
    calendar/    ScheduleCalendar (dynamic), SessionDetailsSheet, CalendarToolbar
    bookings/    BookingsTable, BookingFilters, BookingDialog, StatusTabs
    customers/   CustomersTable, CustomerStats, CustomerProfile, ActivityTimeline
    classes/     ClassCard, ClassGrid, ClassDetail, ClassWeekdayChart
    instructors/ InstructorCard, InstructorGrid, InstructorDetail
    memberships/ MembershipCard, PlanEditDialog
    automations/ AutomationCard, WhatsAppPreview
    booking/     Public wizard steps 1-4, BookingSuccess, WizardProgress
    shared/      StatCard, SectionCard, StatusBadge, AvatarGroup, DataTable,
                 SearchInput, FilterBar, EmptyState, ErrorState, LoadingSkeleton,
                 ConfirmDialog, OccupancyBar, SourceBadge
    ui/          shadcn/ui primitives (customised)

  data/
    seed.ts            buildDemoDataset(demoToday) — the deterministic generator
    organization.ts    classes.ts      instructors.ts   memberships.ts
    customers.ts       schedule.ts     bookings.ts      automations.ts
    notifications.ts   settings.ts

  domain/
    types/       entity + view-model + input types (the contract)
    selectors/   bookings.ts sessions.ts customers.ts classes.ts
                 instructors.ts dashboard.ts search.ts
    constants/   occupancy thresholds, status labels, source labels, nav items,
                 class accents, time formats

  stores/        demo-runtime, catalog, instructor, customer, session,
                 booking, automation, notification, settings, ui

  services/
    auth/          auth-provider.ts (interface), demo-auth-provider.ts,
                   supabase-auth-provider.ts, create-auth-provider.ts, auth-context.tsx
    repositories/  types.ts + mock-*.ts implementations, index.ts factory

  hooks/         useDemoData, useDashboardKpis, useBookingFilters,
                 useGlobalSearch, useMediaQuery, useSimulatedDelay

  lib/           cn.ts, dates.ts, format.ts, random.ts (seeded PRNG), env.ts

  test/          setup.ts, factories.ts

e2e/             Playwright specs
```

`src/styles/` from the master plan's sketch is folded into `src/app/globals.css`: Tailwind v4 is CSS-first and a second stylesheet location would split the token definition.

---

## 3. Rendering model

Client-first (ADR-004). Server components: `app/layout.tsx`, `app/page.tsx`, static route shells. Everything that reads demo data is a client component.

Boot sequence:

1. Server renders the shell (sidebar chrome, page headers, empty card frames).
2. `Providers` (client) mounts `AuthProvider` + `DemoDataProvider`.
3. `DemoDataProvider` runs `hydrateDemo()` in an effect: resolves `demoToday`, calls repositories (250–450 ms simulated latency), fills every store, sets `status = 'ready'`.
4. Data views render skeletons while `status !== 'ready'`, then real content.

This is the hydration-safety mechanism (ADR-005), not decoration: no data-derived DOM exists during SSR, so no mismatch is possible.

---

## 4. Data flow for a mutation

Creating a booking (admin dialog or public wizard):

```
form submit (RHF + Zod)
  -> useBookingStore.createBooking(input)
       -> serialize(...)                            one mutation at a time
       -> selectBookingEligibility(current ledger)  the same check the UI used
       -> bookingRepository.create(input)           ~300 ms simulated
       -> set(s => re-check capacity against s.bookings, then append)
            commit nothing and reject if the spot went while awaiting
       -> useNotificationStore.push({ type: 'booking_created' })
  -> toast "Booking created successfully"
```

The re-check inside the functional updater is not defensive padding: without it, two submissions on the last remaining spot both pass the first check and overbook the session (ADR-017). The same protocol governs cancellation, waitlist promotion and the public booking flow.

Nothing else is written. The dashboard KPI, calendar event, class occupancy, customer stats and instructor stats all change because they are selector outputs over `bookings`. That is the mechanical guarantee behind master plan §9.

Cancellation is symmetric: status flips to `cancelled`, the spot is released, and a waitlisted booking for the same session is surfaced for promotion (demo-level, explicit user action).

---

## 5. Layering rules (Clean Architecture)

| Layer | May import | Must never import |
|---|---|---|
| `domain/types` | nothing | anything |
| `domain/constants` | `domain/types` | stores, React, Next |
| `domain/selectors` | `domain/types`, `domain/constants`, `date-fns` | stores, React, Next, `src/data` |
| `data` | `domain/types`, `domain/selectors`, `lib/random`, `lib/dates` | stores, services, React |
| `services/repositories` | `domain/types`, `data` | stores, React |
| `services/auth` | `domain/types`, `lib/env` | stores, `src/data` |
| `stores` | `domain/**`, `services/**` | React components |
| `hooks` | `stores`, `domain/**`, React | components |
| `components` | `hooks`, `domain/types`, `domain/constants`, `lib` | `src/data`, repositories |

The generator may import `domain/selectors` so its self-checks use the same occupancy formula the application uses, rather than a private copy that can drift. Selectors are pure and import nothing, so this adds no cycle.

`src/data` is reachable from the UI only through a repository. That single rule is what makes the Supabase swap a contained change.

---

## 6. Routes

| Route | Group | Shell | Notes |
|---|---|---|---|
| `/` | — | none | server redirect to `/dashboard` |
| `/login` | `(auth)` | split-screen | demo credentials, Supabase when configured |
| `/dashboard` | `(admin)` | AppShell | KPIs, weekly chart, occupancy, upcoming, recent |
| `/calendar` | `(admin)` | AppShell | FullCalendar week/month/day + session sheet |
| `/bookings` | `(admin)` | AppShell | tabs, filters, table, new booking |
| `/customers` | `(admin)` | AppShell | KPI row, search, filters, paginated table |
| `/customers/[id]` | `(admin)` | AppShell | profile, stats, membership, activity timeline |
| `/classes` | `(admin)` | AppShell | 8 class-type cards |
| `/classes/[id]` | `(admin)` | AppShell | KPIs, weekday chart, weekly schedule |
| `/instructors` | `(admin)` | AppShell | 6 instructor cards |
| `/instructors/[id]` | `(admin)` | AppShell | stats, bio, schedule, recent classes |
| `/memberships` | `(admin)` | AppShell | 4 plans, edit/view members (local) |
| `/automations` | `(admin)` | AppShell | 4 automations, toggles, WhatsApp preview |
| `/settings` | `(admin)` | AppShell | general, booking, notifications, branding |
| `/book` | public | BookingShell | mobile-first 4-step wizard + success |
| `/book/[classId]` | public | BookingShell | same wizard, class preselected |
| `/design-system` | internal | none | token and component preview, never linked from navigation, excluded from the demo narrative |

Unknown `[id]` values call `notFound()` and render the route's `not-found.tsx`. `(admin)/error.tsx` provides the reusable "Something went wrong / Try again" boundary.

---

## 7. Authentication

`(admin)/layout.tsx` renders `<AuthGuard>`: while the provider restores a session it shows a full-page skeleton; with no session it `router.replace('/login')`. Demo-level only, stated plainly in the UI and README (§44, §66.9).

Provider selection happens once, in `lib/env.ts` + `createAuthProvider()`:

```
NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_KEY  ->  SupabaseAuthProvider
otherwise                                                   ->  DemoAuthProvider
```

Missing env vars are the normal case, not an error path; nothing logs a warning that would look broken in front of a client.

---

## 8. Performance posture

- FullCalendar and every chart: `next/dynamic`, `ssr: false`, skeleton fallback (ADR-012).
- Zustand subscriptions are narrow; list-shaped selections use `useShallow`.
- Expensive derivations (occupancy maps, filtered tables) are computed once per render pass in a `useMemo` keyed on the store slices they read, not per row.
- Booking lookups by session/customer use `Map` indexes built once, never `filter` inside a `map`.
- Icons imported by name; no barrel re-export of all Lucide icons.
- Target: dashboard interactive quickly on a cold `next dev` start, no layout shift after skeletons resolve.

---

## 9. Accessibility posture

Semantic landmarks (`nav`, `main`, `header`), labelled form fields, visible focus rings on the pastel background, dialog/sheet focus traps from the shadcn primitives, keyboard-navigable global search with roving focus, textual summaries next to charts, and status conveyed by label + shape, never colour alone (§49).

---

## 10. What this architecture deliberately does not include

No API routes, no server actions for data, no database, no ORM, no queue, no real messaging or payment integration, no multi-tenancy, no dark mode, no i18n framework, no state library besides Zustand, no CSS framework besides Tailwind. Anything on that list arriving in a diff is a review failure (§66.7, §66.8).
