# 09 — Demo Flows

The interactive flows the demo must perform flawlessly in front of a gym owner. Each flow names the exact UI the presenter touches, what changes on screen, what changes in state, and the failure modes to guard against. Derived from master plan sections as cited; kernel docs win on any conflict (`02-ARCHITECTURE.md`, `03-DESIGN-SYSTEM.md`, `04-DOMAIN-MODEL.md`, `08-STATE-MANAGEMENT.md`, `13-DECISIONS.md`).

---

## Flow 1 — Demo login to dashboard

Master plan §16, §44.

**Why the owner cares:** the first ten seconds decide whether this looks like a real product. A slow, broken, or confusing login kills the pitch before it starts.

**Preconditions:** app served at `/`, no active session in `localStorage`. `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` may or may not be set — both paths must work.

**Steps:**

| # | Presenter touches | On screen | In state |
|---|---|---|---|
| 1 | Navigates to `/` | Server redirect to `/login` (unauthenticated) | none |
| 2 | Types `admin@demo.com` in Email | Field fills, inline validation clears | RHF field state only |
| 3 | Types `demo1234` in Password | Field fills (masked) | RHF field state only |
| 4 | Clicks **Sign in** | Button shows loading state | `createAuthProvider()` resolves: `SupabaseAuthProvider` if both env vars are set, else `DemoAuthProvider` (ADR-010) |
| 5 | — | Redirect to `/dashboard` | Auth session written to `localStorage` (demo path) or Supabase session cookie (Supabase path); `AuthGuard` in `(admin)/layout.tsx` passes |
| 6 | — | `(admin)/layout.tsx` mounts, `DemoDataProvider` fires `hydrateDemo()` | `useDemoRuntimeStore.status`: `idle` → `loading` → `ready`; all ten stores populated (ADR-005) |
| 7 | — | Dashboard skeletons resolve to real KPI cards, chart, lists | `demoToday` and `seededAt` set |

**Supabase-absent path (the default for this demo):** step 4 resolves `DemoAuthProvider` with no network call. No env-var warning is logged — missing Supabase config is the normal case, not an error path (`02-ARCHITECTURE.md` §7). The **Demo Mode** badge (§45) is visible in the top bar from the moment the shell renders, so the presenter can point to it if asked "is this real."

**Failure modes to guard against:**
- Wrong credentials must show an inline error, not a silent no-op or a thrown console error.
- If Supabase env vars are present but misconfigured, the app must not hard-fail login — `createAuthProvider()` selection is a build-time env check, not a runtime probe, so this only matters if env vars are set; document but do not build a fallback-on-network-error path unless Codex flags it as needed.
- Re-clicking **Sign in** while the request is pending must not double-submit.
- `AuthGuard`'s session-restore skeleton must not flash-then-redirect on a fresh load (would read as a bug on stage).
- The hydration gate (ADR-005) must complete before any data view renders — a dashboard KPI showing `0` or `undefined` for one frame reads as broken.

---

## Flow 2 — Reading the dashboard

Master plan §17–§21.

**Why the owner cares:** this is the "so what do I actually get" screen. Every number must be explainable in one sentence and must be provably live.

**Preconditions:** logged in, `useDemoRuntimeStore.status === 'ready'`.

**What each KPI means and where its number comes from:**

| Card | Meaning | Selector | Store slice read |
|---|---|---|---|
| Active members | Customers with `status: 'active'` | `selectActiveMembers` (`domain/selectors/customers.ts`) | `useCustomerStore.customers` |
| Active members delta | Active customers whose `joinedAt` falls in the current calendar month | `selectActiveMembers` (delta branch) | `useCustomerStore.customers`, `demoToday` |
| Today bookings | Bookings whose session date equals `demoToday`, status `confirmed` or `pending` | `selectTodayBookings` → `selectDashboardKpis` | `useBookingStore.bookings`, `useSessionStore.sessions` |
| Today bookings delta % | Today's count vs. yesterday's same computation | `selectDashboardKpis` | same, plus prior-day slice |
| Occupancy | `booked / capacity` aggregated across today's sessions (ADR-008) | `selectDashboardKpis` → `selectSessionOccupancy` per session | `useSessionStore.sessions`, `useBookingStore.bookings` |
| Today's classes | Count of sessions scheduled today; "N nearly full" = count where `occupancyState === 'almost_full'` | `selectDashboardKpis` | `useSessionStore.sessions`, `useBookingStore.bookings` |

**Steps:**

| # | Presenter touches | On screen | In state |
|---|---|---|---|
| 1 | Points at the four KPI cards | Header reads "Good morning" (no real name, §17) | read-only, `useDashboardKpis()` hook |
| 2 | Points at the weekly bookings chart | Recharts bar chart, hatched bars, today/hovered bar solid ink | `selectWeeklyBookingTrend` over `bookings` |
| 3 | Hovers a bar | Custom tooltip shows exact count | no state change, presentation only |
| 4 | Points at class occupancy list | Horizontal bars per class type, percentage in tabular numerals | `selectClassOccupancy` |
| 5 | Points at upcoming classes | Next four sessions with time, class, instructor, spots, status pill | `selectUpcomingSessions(4)` |
| 6 | Points at recent bookings | Table/card list, status pills coloured per `03-DESIGN-SYSTEM.md` §5 | `selectRecentBookings` |

**Failure modes to guard against:**
- Any KPI computed from a hand-authored constant instead of a selector (a review failure, ADR-006).
- Occupancy KPI disagreeing with the class occupancy list's implied aggregate — both must derive from the same `selectSessionOccupancy` calls, not two independent formulas.
- Chart rendering with no accessible text summary (§49 forbids colour-only or chart-only data).
- Skeleton-to-content flash that reflows the page (layout shift after hydration is a named performance target, `02-ARCHITECTURE.md` §8).

---

## Flow 3 — Creating a booking from the admin dialog

Master plan §23–§24. **This is the flow that proves the single source of truth.**

**Why the owner cares:** it's the moment the "single system of record" promise stops being a slide and becomes a click.

**Preconditions:** on `/bookings` (or any screen with the **New booking** CTA), at least one session with `available > 0` exists in the dataset.

**Steps:**

| # | Presenter touches | On screen | In state |
|---|---|---|---|
| 1 | Clicks **+ New booking** (ink pill CTA) | `BookingDialog` opens | dialog mount only |
| 2 | Selects Customer | Field fills, avatar/name shown | RHF field |
| 3 | Selects Class → Date → Time | Session list narrows per selection; capacity line updates, e.g. `12 / 15 spots reserved` | capacity read live via `selectSessionOccupancy(sessionId)` |
| 4 | Selects Instructor (or it auto-fills from the session) | Field shows instructor | RHF field |
| 5 | Clicks **Confirm** / **Create** | Button enters pending state, Zod validation runs client-side | `useBookingStore.createBooking(input)`: guard checks session exists, `available > 0`, no duplicate active booking for this customer+session (invariant 3, `04-DOMAIN-MODEL.md` §7); `mutation: 'pending'` |
| 6 | — | Toast: **"Booking created successfully"** | `bookingRepository.create()` resolves (~300 ms simulated, `02-ARCHITECTURE.md` §4); `set({ bookings: [...bookings, created] })`; `mutation: 'idle'` |
| 7 | — | Dialog closes | `useNotificationStore.push({ type: 'booking_created', ... })` |

**Cross-screen synchronisation this single write produces** (no other write happens — every value below is a selector recomputation over the same `bookings` array, per `02-ARCHITECTURE.md` §4):

| Screen | What visibly changes | Selector |
|---|---|---|
| Bookings table | New row appears, matching filters/tab | `filterBookings` / `selectBookingsByCustomer` etc. |
| Dashboard — Today bookings KPI | Increments if the session is today | `selectTodayBookings` → `selectDashboardKpis` |
| Dashboard — Occupancy KPI | Recomputes if the session is today | `selectDashboardKpis` |
| Calendar | The session's event chip shows one more booked spot; colour/occupancy state may cross a threshold | `selectSessionOccupancy` |
| Class occupancy list (dashboard + class detail) | The class type's average bar moves | `selectClassOccupancy` |
| Customer's activity timeline | New entry: "Reserved `<Class name>`" | `selectCustomerActivity` |
| Notification dropdown | New unread item, badge count `+1` | `useNotificationStore.notifications` |

**Failure modes to guard against:**
- Any of the seven surfaces above **not** moving on the next render — this is the single highest-value bug to catch before a demo, because it directly contradicts the pitch.
- Creating a booking on a session at `available === 0` must be rejected by the store guard even if the UI somehow let it through (defense in depth; ADR-008 invariant `booked <= capacity` must never break).
- Duplicate submit (double-click **Confirm**) must not create two bookings — `mutation` state blocks it.
- Toast firing before the store write actually resolves (would show success while a later-arriving error invalidates it).
- Dialog closing before the notification is pushed, so the presenter opens the bell and finds nothing new.

---

## Flow 4 — Cancelling a booking

Not separately numbered in the master plan; specified by `02-ARCHITECTURE.md` §4 and ADR-008.

**Why the owner cares:** cancellations are constant in a real studio; the owner needs to see the spot come back and a waitlisted customer get offered it, not a stuck "ghost" reservation.

**Preconditions:** a `confirmed` or `pending` booking exists on a session that also has at least one `waitlist` booking (for the promotion half of this flow to be visible).

**Steps:**

| # | Presenter touches | On screen | In state |
|---|---|---|---|
| 1 | Opens the booking's row menu (Bookings table or Customer activity) | Row action menu | none |
| 2 | Clicks **Cancel booking** | `ConfirmDialog` opens | none |
| 3 | Confirms | Row status pill flips to **Cancelled** (danger/pink) | `useBookingStore.cancelBooking(id)`: `status → 'cancelled'` (booking record kept, not deleted — audit trail) |
| 4 | — | If a `waitlist` booking exists for the same session, a promotion prompt/toast appears: **"Promote next waitlisted customer?"** | none yet — promotion is an explicit user action, not automatic (`02-ARCHITECTURE.md` §4) |
| 5 | Clicks **Promote** | Waitlisted row's status pill flips to **Confirmed** | `useBookingStore.promoteFromWaitlist(sessionId)`: that booking's `status → 'confirmed'` |
| 6 | — | Toast: booking cancelled / customer promoted | `useNotificationStore.push` for both events |

**What moves everywhere (same mechanism as Flow 3, symmetric direction):**

| Screen | Effect of the cancellation | Effect of the promotion (if taken) |
|---|---|---|
| Bookings table | Row → Cancelled | Promoted row → Confirmed |
| Dashboard KPIs | Today bookings / occupancy decrease if session is today | Occupancy recovers |
| Calendar / SessionDetailsSheet | `available` count `+1`, `occupancyState` may drop from `full` | `available` count `-1` again |
| Class occupancy list | Class average moves down | Moves back up |
| Customer activity timeline (cancelling customer) | New entry: "Cancelled `<Class name>`" | — |
| Customer activity timeline (promoted customer) | — | New entry reflecting the confirmed booking |
| Notifications | New unread item | New unread item |

**Failure modes to guard against:**
- Cancelling a booking must never delete the record — `checkedInAt`/audit history and invariant 1 (`04-DOMAIN-MODEL.md` §7) depend on the row persisting with `status: 'cancelled'`.
- Promotion offered on a session with no waitlist entries (invariant 5: waitlist bookings only exist where `available <= 0`, so this should be structurally impossible — verify the UI doesn't show the prompt regardless).
- `available` count not recovering immediately (would look like the "single source of truth" claim from Flow 3 is one-directional only).
- Promoting a customer who already holds a non-cancelled booking on that session (invariant 3) — must be blocked the same way `createBooking` blocks it.

---

## Flow 5 — Calendar inspection

Master plan §22.

**Why the owner cares:** this is the screen that most resembles what front-desk staff will live in daily — it has to feel instantly familiar and fast.

**Preconditions:** on `/calendar`, default view is Week (§22).

**Steps:**

| # | Presenter touches | On screen | In state |
|---|---|---|---|
| 1 | Loads `/calendar` | FullCalendar week view, class-accent-coloured event chips | `useSessionStore.sessions` mapped through `toSessionCard` |
| 2 | Clicks the **Day** view control | Calendar re-renders as a single day, same events | no store change, view-local UI state |
| 3 | Clicks a session event chip | `SessionDetailsSheet` opens | none — sheet reads the session by id |
| 4 | Reads capacity line, e.g. `12 / 15 spots` | Sheet shows class, date, time, instructor, room, capacity, bookings, available spots | `selectSessionOccupancy(sessionId, bookings)` — same selector Flow 3 verified |
| 5 | Clicks **View bookings** | Navigates to `/bookings` filtered to that session/date | `BookingFilters.date` set |
| 6 | Closes sheet, clicks **Edit class** (from another session) | Local/demo-only edit affordance opens (§22: "Edit may remain local/demo only") | no persisted mutation required |

**Failure modes to guard against:**
- Week ↔ Day view switch losing the currently-selected date context.
- The sheet's capacity numbers not matching the dashboard/class-detail numbers for the same session (must be the identical `selectSessionOccupancy` call — see Consistency Contract).
- FullCalendar loaded eagerly instead of via `next/dynamic` (`ssr: false`) — a slow first calendar paint or an SSR console error is a direct violation of ADR-012.
- Clicking **Edit class** implying a real persistence layer exists — must read as clearly demo-scoped.

---

## Flow 6 — Customer profile deep dive

Master plan §25–§26.

**Why the owner cares:** shows the owner what they'd know about any given member without digging through spreadsheets or a paper binder.

**Preconditions:** on `/customers`, at least one customer with recent activity.

**Steps:**

| # | Presenter touches | On screen | In state |
|---|---|---|---|
| 1 | Loads `/customers` | Top metrics: Total customers, Active memberships, New this month, Inactive | `selectActiveMembers`, `selectNewThisMonth`, plain counts over `customers` |
| 2 | Types in search | Table filters live | `filterCustomers` |
| 3 | Applies a status filter | Table narrows further | `CustomerFilters.status` |
| 4 | Clicks a row / avatar | Navigates to `/customers/[id]` | `useCustomerProfile(id)` hook |
| 5 | — | Header: avatar, `Customer XX`, status pill; email, phone, member since, membership, remaining credits | `selectCustomerStats` → `CustomerWithStats` |
| 6 | — | Stats: classes this month, attendance rate, no-shows, favorite class | same selector |
| 7 | — | Membership card + recent activity timeline (Attended / Reserved / Cancelled / Membership renewed) | `selectCustomerActivity` |

**Failure modes to guard against:**
- Unknown `[id]` in the URL must call `notFound()` and render the route's `not-found.tsx`, not a blank page or a thrown error (`02-ARCHITECTURE.md` §6).
- `remainingCredits` showing a number for a customer on an unlimited plan — must render `null` → "Unlimited," never `0` or a stale credit count.
- Activity timeline entries not matching bookings actually visible elsewhere for that customer (same booking ledger, `selectCustomerActivity` must read `useBookingStore.bookings`, not a separate mock list).
- Table-to-detail navigation losing the current search/filter state on back navigation (mobile card view below `md`, `03-DESIGN-SYSTEM.md` §8, must also preserve it).

---

## Flow 7 — Classes and instructors

Master plan §27–§30.

**Why the owner cares:** confirms the platform understands their actual class catalogue and staffing, not a generic "services" list.

**Preconditions:** on `/classes`, 8 class-type cards present; on `/instructors`, 6 instructor cards present.

**Steps:**

| # | Presenter touches | On screen | In state |
|---|---|---|---|
| 1 | Loads `/classes` | 8 cards: icon, name, description, weekly sessions, average occupancy, assigned instructors, consistent category accent | `selectClassTypeStats` per class type |
| 2 | Clicks a class card | `/classes/[id]` — name, description, duration, capacity, instructor avatar group, weekly schedule | same selector, single class |
| 3 | Reads class KPIs | Average occupancy, bookings this month, cancellation rate | `selectClassTypeStats` |
| 4 | Reads bookings-by-weekday chart | Recharts bar chart | `selectClassWeekdayBookings` |
| 5 | Loads `/instructors` | 6 cards: avatar, specialty, weekly sessions, rating, status pill (Available / In class / Off today) | `selectInstructorStats` per instructor |
| 6 | Clicks an instructor card | `/instructors/[id]` — specialty, rating, bio, weekly schedule, stats (classes this month, reservations, occupancy, rating), recent classes, calendar preview | `selectInstructorStats`, single instructor |

**Failure modes to guard against:**
- An instructor's `weeklySessions` on the card disagreeing with the count implied by their detail-page schedule — both come from `selectInstructorStats`, never a separate hand-counted value.
- A class's average occupancy on the card disagreeing with the same class's occupancy bar on the dashboard occupancy list — both are `selectClassOccupancy` / `selectClassTypeStats` over the identical `bookings`/`sessions` slices.
- Instructor status pill (`available` / `in_class` / `off_today`) conveyed by colour alone (§49 forbids this — must pair with the text label, already true per `StatusBadge`).
- `[id]` detail routes not covered by `not-found.tsx` for an invalid id.

---

## Flow 8 — Memberships and automations

Master plan §31–§33.

**Why the owner cares:** this is where the demo pitches *future* value (WhatsApp automation) without overselling something that isn't real. The presenter must be able to say "this part is simulated" and have the UI visibly agree.

**Preconditions:** on `/memberships` (4 plans) and `/automations` (4 automation cards).

**Steps — memberships:**

| # | Presenter touches | On screen | In state |
|---|---|---|---|
| 1 | Loads `/memberships` | Basic $29/8 classes, Unlimited $49, Premium $69 + priority + 1 guest pass, Day Pass $8 | `useCatalogStore.membershipPlans` |
| 2 | Clicks **Edit plan** | Local edit dialog opens | demo-only, no persistence claim |
| 3 | Clicks **View members** | Filtered customer list for that plan | `filterCustomers({ membershipId })` |

**Steps — automations and WhatsApp simulation:**

| # | Presenter touches | On screen | In state |
|---|---|---|---|
| 4 | Loads `/automations` | 4 cards: Booking confirmation (Active), 24-hour reminder (Active), Inactive customer reminder (Paused), Birthday message (Draft) | `useAutomationStore.automations` |
| 5 | Clicks a toggle (e.g. activates the paused automation) | Toggle animates to on, status label updates | `toggleAutomation(id)`: `status` flips in local state only |
| 6 | — | Toast: **"Automation activated"** | `useNotificationStore` optional push |
| 7 | Clicks into the Booking confirmation card's preview | WhatsApp-style message bubble renders the template (booking confirmation copy, status **Delivered**) | `messageTemplate` rendered client-side, no network call |
| 8 | Clicks **Send test** | Button enters loading state for **~800 ms** (simulated) | `useAutomationStore.sending = automationId` |
| 9 | — (after ~800 ms) | Toast: **"Test message sent"**; button returns to idle | `sending = null` |
| 10 | — | No message is transmitted anywhere — stated explicitly in the UI copy near the preview or in the toast/tooltip | no network request exists in this code path at all |

**Failure modes to guard against:**
- **Send test** completing instantly (no ~800 ms delay) reads as fake in a different way — the delay is specified precisely because it should feel like a real send, while the accompanying copy makes clear it is not.
- Any toast or label implying delivery to a real phone number without the word "test"/"simulated" nearby — this is a named demo hazard (see Demo Hazards below).
- A network tab check during rehearsal showing any outbound request when **Send test** is clicked — Phase 7's gate is a grep proof that no external endpoint is contacted (`10-IMPLEMENTATION-PLAN.md`).
- Toggling an automation twice quickly leaving it in a state inconsistent with its label.

---

## Flow 9 — Public booking on a phone

Master plan §34–§39. High-priority flow.

**Why the owner cares:** this is what their own customers would use to book a class — it has to look as polished as a consumer fitness app, not an admin form shrunk down.

**Preconditions:** viewport switched to mobile (or a phone), route `/book`, no admin sidebar. At least one class with a full session (to demonstrate disabling) and one with open capacity.

**Steps:**

| # | Presenter touches | On screen | In state |
|---|---|---|---|
| 1 | Navigates to `/book` | Mobile-first hero, class cards: Functional Training, Cycling, Yoga, Pilates, HIIT — icon, duration, description, available sessions | `useCatalogStore.classTypes` filtered to the five listed |
| 2 | Taps a class card | Step advances to date selection; `WizardProgress` updates | wizard-local step state |
| 3 | Taps a date in the horizontal selector (`THU 17 … MON 21`) | Selected date gets a visually distinct state | wizard-local |
| 4 | Views time slots | Each slot shows capacity, e.g. `9:00 AM  14 / 15 spots`; a `FULL` slot is visibly disabled (not just low-contrast — non-interactive) | `selectSessionOccupancy` per candidate session |
| 5 | Taps an open slot | Step advances to the customer form | wizard-local |
| 6 | Fills Name, Phone, Email | RHF + Zod validate as fields blur; invalid email or missing phone shows inline errors | `PublicBookingInput` schema (`04-DOMAIN-MODEL.md` §4) |
| 7 | Taps **Confirm reservation** | Button enters pending/disabled state | submit guarded against re-entry — a second tap while pending is a no-op, not a second booking |
| 8 | — | Success screen: large success indicator, class, date, time, studio location, heading **"Your class is booked!"**, message **"Your confirmation has been sent by WhatsApp"** (explicitly simulated, §39) | on success: `useCustomerStore.addCustomer()` (new public customer) then `useBookingStore.createBooking()` (cross-store edge documented in `08-STATE-MANAGEMENT.md` §2); `source: 'website'` |
| 9 | Taps **Book another class** | Wizard resets to step 1 | wizard-local state reset only |

**The booking appearing back in the admin data — verification steps for the presenter:**

| # | Presenter touches | On screen |
|---|---|---|
| 10 | Switches viewport back to desktop, opens `/bookings` | The just-created booking is the newest row, `source: Website` |
| 11 | Opens `/dashboard` | Today bookings KPI includes it if the session is today |
| 12 | Opens `/calendar`, the same session | `available` count is one lower than before |

**Failure modes to guard against (the eleven adversarial cases from `10-IMPLEMENTATION-PLAN.md` Phase 8, verify all before the demo):**
- Selecting a full class/slot — must be disabled, not merely styled differently.
- Invalid email format — inline error, submit blocked.
- Missing required phone — inline error, submit blocked.
- Reaching the customer-info step with no class selected (deep link, back-button edge case) — must redirect to step 1, not crash.
- Reaching confirm with no time selected — submit blocked.
- Double-submit (rapid double-tap on **Confirm reservation**) — must create exactly one booking.
- Back navigation mid-wizard — must not lose already-entered fields for that session, and must not leave the wizard in a step/data-mismatch state.
- Mobile viewport specifically (390 px class target, `10-IMPLEMENTATION-PLAN.md` Phase 3 gate) — no horizontal scroll, all tap targets ≥ 40 px (`03-DESIGN-SYSTEM.md` §10).
- Capacity shown at step 3 becoming stale by the time of submit (another booking landed in between) — the guard inside `createBooking` (session exists, `available > 0`, no duplicate) is the backstop; a graceful "this class just filled up" message is required if it fires.
- Successful booking's count actually updating in the admin stores (steps 10–12 above) — this is the same single-source-of-truth mechanism as Flow 3, just entered from the public route.
- Repeating the whole flow a second time in the same session (Book another class) — must not carry over stale form state from the first booking.

---

## Flow 10 — Global search and notifications

Master plan §41–§42.

**Why the owner cares:** these are the "I use this fifty times a day" affordances; they have to be fast and keyboard-friendly, not decorative.

**Preconditions:** logged in, anywhere in the admin shell.

**Steps — search:**

| # | Presenter touches | On screen | In state |
|---|---|---|---|
| 1 | Clicks/focuses the top-bar search (`Search customers, classes...`) | Dropdown opens (possibly empty state until typing) | `useUiStore.searchOpen = true` |
| 2 | Types a query | Results grouped by type: Customer / Class / Instructor, each with a sublabel | `useGlobalSearch(query)` → `selectGlobalSearch` |
| 3 | Uses Arrow Down/Up | Roving focus moves through grouped results | keyboard-only, no store write |
| 4 | Presses Enter (or clicks a result) | Navigates to the correct entity route (`/customers/[id]`, `/classes/[id]`, `/instructors/[id]`) | `searchOpen = false` |

**Steps — notifications:**

| # | Presenter touches | On screen | In state |
|---|---|---|---|
| 5 | Clicks the bell icon | Dropdown opens, unread badge visible (e.g. `3`) before opening | `useUiStore.notificationsOpen = true` |
| 6 | Reads entries | e.g. "New booking received — 2 minutes ago", "Functional Training is full — 10 minutes ago", "Booking cancelled — 25 minutes ago" | `useNotificationStore.notifications`, sorted by `createdAt` desc |
| 7 | Clicks an unread entry | Entry's unread indicator clears | `markRead(id)` |
| 8 | Clicks **Mark all as read** (if present) | Badge count drops to 0 | `markAllRead()` |

**Failure modes to guard against:**
- Search with zero results showing nothing instead of a polished empty state (§47).
- Search unreachable by keyboard alone (Tab to focus, arrows to navigate, Enter to select, Escape to close) — accessibility floor, `03-DESIGN-SYSTEM.md` §10.
- Notification badge count not matching the actual unread count in the dropdown (two places reading the same `notifications` array must agree — same class of bug as the KPI-consistency hazard).
- A notification generated by Flow 3/4 not appearing here — this flow is the final visible checkpoint of the single-source-of-truth chain and must not silently miss an event.

---

## Consistency contract

Every number that appears on more than one screen, the selector that produces it, and every screen that must agree. If a review or rehearsal finds two of these values disagreeing, that is a release-blocking bug — not a polish item — because it directly contradicts the demo's core claim (master plan §9, ADR-006).

| Number | Selector (single source) | Screens that must always agree |
|---|---|---|
| Today's bookings count | `selectTodayBookings` → `selectDashboardKpis` | Dashboard KPI, Bookings page (date-filtered to today), Calendar day view implied total |
| Occupancy rate — per session | `selectSessionOccupancy` | Calendar event chip, `SessionDetailsSheet`, `BookingDialog` capacity line, Public booking time-slot capacity, Class detail (as an input to the class average) |
| Occupancy rate — per class type | `selectClassOccupancy` | Dashboard class occupancy list, `/classes` card, `/classes/[id]` average-occupancy KPI |
| Overall today occupancy | `selectDashboardKpis` (aggregates `selectSessionOccupancy` across today's sessions) | Dashboard KPI card only — no other screen shows an aggregate, so this has no cross-screen twin, but its inputs must trace to the per-session numbers above |
| Session `available` spots | `SessionWithOccupancy.available` (from `selectSessionOccupancy`) | `SessionDetailsSheet`, `BookingDialog`, Public booking time slots, implicitly the calendar event's visual state |
| Active members | `selectActiveMembers` | Dashboard KPI, `/customers` top metric |
| New customers this month | `selectNewThisMonth` | Dashboard "Active members +N this month" delta, `/customers` top metric "New this month" |
| Customer classes this month / attendance rate | `selectCustomerStats` | `/customers` table columns, `/customers/[id]` stats block |
| Instructor weekly sessions | `selectInstructorStats` | `/instructors` card, `/instructors/[id]` stats, implied by their schedule view |
| Booking status counts (Confirmed / Pending / Cancelled / Waitlist) | `filterBookings` counts per status | Bookings page tab badges, any status summary shown elsewhere for the same date/class filter |
| Notification unread count | length of `notifications.filter(n => !n.read)` | Top-bar bell badge, notifications dropdown header |
| Booking ledger itself | `useBookingStore.bookings` | Bookings table, Dashboard recent bookings, Calendar, Customer activity timeline, Class detail bookings-this-month, Instructor detail reservations — every one of these reads the same array, never a parallel copy |

---

## Demo hazards

Things that would visibly break the story in front of a client, and the guard that prevents each.

| Hazard | Guard |
|---|---|
| A full class accepting a booking | `createBooking` guard checks `available > 0` before writing (store-level, not just UI-level); ADR-008 defines `booked <= capacity` as an invariant asserted by unit tests; Public booking additionally disables full slots in the UI (§37) so the guard is never even reached from that path |
| A stale KPI (a number that doesn't move after a mutation) | Every KPI and list is a selector call over live Zustand state, re-evaluated on every render that touches the relevant slice (ADR-006); forbidden-pattern list in `08-STATE-MANAGEMENT.md` §7 bans copying store state into local component state, which is the usual cause of staleness |
| A hydration warning in the console | ADR-005's hydration gate: no data-derived DOM renders until `useDemoRuntimeStore.status === 'ready'`, which is only set client-side after `hydrateDemo()`; no `Date.now()` / `Math.random()` anywhere in seed generation or render |
| An empty state where data should be | `DemoDataProvider` hydrates the full dataset (148 customers, ~1,000–1,200 bookings per ADR-007, two weeks of sessions) before any route is reachable past `AuthGuard`; `EmptyState` components render only for a genuinely empty *filtered* result, never for un-hydrated base data — verify by checking `status` is the gate, not an array length of zero |
| A 404 from a sidebar link | Phase 2D creates placeholder pages for every admin route before the sidebar is wired (`10-IMPLEMENTATION-PLAN.md` Phase 2D: "navigation is never dead"); every `[id]` route has a `not-found.tsx` for invalid ids so a bad link degrades to a designed page, not a framework error screen |
| A toast claiming a WhatsApp message was sent without the simulated label | §33's **Send test** flow only ever shows "Test message sent" (never "Message sent" or a customer-facing phrasing), and no code path makes a real network call — Phase 7's gate is a grep proof of that; the public-booking success screen's WhatsApp line is paired with the explicit note that the statement is simulated (§39) |
| Two screens showing different numbers for the same thing | Enforced structurally by the Consistency Contract above — every number traces to exactly one selector; a second independent computation of the same fact anywhere in the codebase is a review failure |
| A waitlist booking silently consuming a capacity slot | ADR-008: only `confirmed` and `pending` count toward `booked`; `waitlist` and `cancelled` never do — asserted by the dataset invariant tests (`04-DOMAIN-MODEL.md` §7, invariant 5) |
| Double-submitting a form creating two records | `mutation: 'pending'` on the booking store, and the public-wizard submit button disabling on first tap, both block re-entry before the async repository call resolves (ADR-009) |
| Console errors or React warnings visible if DevTools happen to be open | §52's zero-tolerance list (no console errors, no React warnings, no hydration errors, no unhandled promises, no duplicate keys) is a Phase 11/12 gate, not optional polish |
| A screen that still reads as default shadcn | `03-DESIGN-SYSTEM.md` §9's token bridge plus the dedicated Phase 2D restyle pass and Phase 11 polish pass; named explicitly as a review failure in both the design system doc and ADR-015 |
