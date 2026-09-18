# 06 — Routes and Screens

Screen-by-screen build specification. Route list is `/docs/02-ARCHITECTURE.md` §6 verbatim, extended only with the internal `/design-system` tooling route (section 5 below). Component names are `/docs/02-ARCHITECTURE.md` §2 verbatim; where that section describes a feature directory generically without fixing individual component names, this document fixes them and flags the decision as its own, open to Opus revision (master plan §0.2). Copy strings are master plan literals unless marked "derived" or "this document's decision."

---

## 1. Route table

| Route | Group | Shell | Phase (docs/10) | Notes |
|---|---|---|---|---|
| `/` | — | none | 2A | server redirect to `/dashboard` |
| `/login` | `(auth)` | split-screen | 9 | demo credentials, Supabase when configured |
| `/dashboard` | `(admin)` | AppShell | 3 | KPIs, weekly chart, occupancy, upcoming, recent |
| `/calendar` | `(admin)` | AppShell | 4 | FullCalendar week/month/day + session sheet |
| `/bookings` | `(admin)` | AppShell | 4 | tabs, filters, table, new booking |
| `/customers` | `(admin)` | AppShell | 5 | KPI row, search, filters, paginated table |
| `/customers/[id]` | `(admin)` | AppShell | 5 | profile, stats, membership, activity timeline |
| `/classes` | `(admin)` | AppShell | 6 | 8 class-type cards |
| `/classes/[id]` | `(admin)` | AppShell | 6 | KPIs, weekday chart, weekly schedule |
| `/instructors` | `(admin)` | AppShell | 6 | 6 instructor cards |
| `/instructors/[id]` | `(admin)` | AppShell | 6 | stats, bio, schedule, recent classes |
| `/memberships` | `(admin)` | AppShell | 7 | 4 plans, edit/view members (local) |
| `/automations` | `(admin)` | AppShell | 7 | 4 automations, toggles, WhatsApp preview |
| `/settings` | `(admin)` | AppShell | 9 | general, booking, notifications, branding |
| `/book` | public | BookingShell | 8 | mobile-first 4-step wizard + success |
| `/book/[classId]` | public | BookingShell | 8 | same wizard, class preselected |

Standing shell components: `AppShell`, `AppSidebar`, `TopBar`, `MobileNav`, `PageHeader`, `DemoBadge` (all `components/layout/`), built in Phase 2D.

Unknown `[id]` values call `notFound()`; see Navigation contract below.

---

## 2. Navigation contract

### Sidebar items

| Item | Icon (this doc's decision, Lucide) | Route | Section |
|---|---|---|---|
| Dashboard | `LayoutDashboard` | `/dashboard` | primary |
| Calendar | `Calendar` | `/calendar` | primary |
| Bookings | `CalendarCheck` | `/bookings` | primary |
| Customers | `Users` | `/customers` | primary |
| Classes | `Dumbbell` | `/classes` | primary |
| Instructors | `UserRound` | `/instructors` | primary |
| Memberships | `CreditCard` | `/memberships` | primary |
| Automations | `Zap` | `/automations` | secondary |
| Settings | `Settings` | `/settings` | secondary |

Icon names are not fixed by any kernel document (master plan §15 only requires "Lucide icons"); Sonnet may substitute a visually equivalent icon without an ADR, but must not change the item list or grouping.

**Active-state rule:** `AppSidebar` compares each item's `route` against `usePathname()`. An item is active when the pathname equals the route or starts with `${route}/` (so `/customers/cus-0042` keeps `Customers` active). Active style per `/docs/03-DESIGN-SYSTEM.md` §5 Navigation: `--color-purple-xsoft` background, `--color-ink` text, `--color-purple` 3 px left rail. At most one item is active at a time; `/dashboard` (via `/` redirect) is the only default-active state, on first load before any navigation.

Bottom block (static, not a link): `Administrator` / `Admin` / `Logout` (master plan §15).

### No-404 rule

Master plan §52 forbids dead navigation. Every sidebar link, every `PageHeader` back-link, every table row link, every `SearchResult.href` and every dashboard "view all" link points to a route in section 1's table with a concrete, always-resolvable path. Detail routes never link to an id that does not exist in the seeded dataset — list-to-detail links are always built from the same row object being rendered, never from a hand-typed id.

### Not-found behavior for unknown entity ids

`/customers/[id]`, `/classes/[id]`, `/instructors/[id]` resolve their entity from the relevant store in a Server-rendered-shell/Client-data pattern (ADR-004): the page component looks up the id in `useCustomerStore` / `useCatalogStore.classTypes` / `useInstructorStore` once `status === 'ready'`; if the id is not found, it calls `notFound()`. Per `/docs/02-ARCHITECTURE.md` §2, only `src/app/not-found.tsx` exists (no route-group-specific `not-found.tsx`), so this is the boundary that renders for every unknown id across all three detail routes — Next.js walks up from the triggering segment to the nearest `not-found.tsx`, which is the root one. It renders inside the `(admin)` `AppShell` because the shell layout itself did not throw; only the leaf page did.

---

## 3. Screens

### 3.1 Login — `/login`

**Phase:** 9. **Master plan:** §16.

**Layout, 1440 px:** split-screen, no `AppShell`. Two columns, roughly 55/45: left = full-bleed abstract boutique-fitness visual panel (dot-field pattern per `/docs/03-DESIGN-SYSTEM.md` §2, no stock photography per §9 privacy rule); right = centered login card, max-width 400 px, vertically centered.

**Copy (literal):**
- Supporting line: `Manage your classes, customers and bookings from one place.`
- Fields: `Email`, `Password`, `Remember me`
- Secondary link: `Forgot password`
- CTA: `Sign in`
- Demo credentials shown on the card: `admin@demo.com` / `demo1234`

**Components:** login form (RHF + Zod) inside a `Card` (`components/ui`); no `AppSidebar`/`TopBar`.

**Data / selector:** none. Reads `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` via `lib/env.ts` to pick `DemoAuthProvider` vs `SupabaseAuthProvider` (ADR-010); submits through `useAuth().signIn()`. Successful sign-in redirects to `/dashboard`.

**Loading:** submit button shows a spinner and disables while `signIn()` resolves; no page-level skeleton (nothing to hydrate before auth).

**Empty:** not applicable (a form, not a data view).

**Error:** invalid credentials render an inline field-level error below the form, not the global `ErrorState`; a thrown provider error (e.g. Supabase unreachable) falls back to `app/error.tsx` (§48 copy, section 4.7).

**Responsive:**
| Breakpoint | Behavior |
|---|---|
| 1024 px | Same split layout, visual panel narrows, card stays 400 px |
| 768 px | Visual panel hidden, card centered full-width column, 24 px side padding |
| 390 px | Card fills viewport minus 16 px gutters (`/docs/03-DESIGN-SYSTEM.md` §8) |

---

### 3.2 Dashboard — `/dashboard`

**Phase:** 3. **Master plan:** §17–21.

**Layout, 1440 px:** `AppShell` (240 px sidebar + content, max-width 1500 px, 28 px padding). 12-column bento (this document's decision — master plan §12 gives the aesthetic, not the column spans):
- Row 1: four `StatCard`s, span 3 each — Active members, Today's bookings, Occupancy, Today's classes.
- Row 2: `WeeklyBookingsChart` inside a `SectionCard`, span 8; `ClassOccupancyList` inside a `SectionCard`, span 4.
- Row 3: `UpcomingSessionsList` inside a `SectionCard`, span 4; `RecentBookingsTable` (`DataTable`) inside a `SectionCard`, span 8.
Grid gap 24 px per `/docs/03-DESIGN-SYSTEM.md` §3 (dashboard bento value).

**Copy (literal):**
- Header: `Good morning` / `Here's what's happening at your studio today.` — no real person's name (§17).
- KPI card 1, `Active members`: value derived via `selectActiveMembers` (132 with the seeded dataset); delta `+8 this month` derived via `selectNewThisMonth`. Master plan §17 prints `148`, which is the *total* customer count from §9, not the active-membership count §9 also gives as 132. The KPI is derived and agrees with the `/customers` `Active memberships` tile (ADR-016).
- KPI card 2, `Today's bookings`: value derived; delta label pattern `+12% vs yesterday`
- KPI card 3, `Occupancy`: value derived; master plan example target `87%`
- KPI card 4, `Today's classes`: value derived; example pattern `6` / `2 nearly full`
- Upcoming class statuses: `Available`, `Almost full`, `Full`

**Components:** `StatCard` ×4, `SectionCard` ×3 (shared), `WeeklyBookingsChart` and `UpcomingSessionsList` (names owned by `/docs/07-COMPONENT-ARCHITECTURE.md` §3), `OccupancyBar` (shared, inside the occupancy list), `RecentBookingsTable` using `DataTable` + `StatusBadge` + `SourceBadge` (shared).

**Data / selector:**
| Region | Hook | Selector |
|---|---|---|
| KPI row | `useDashboardKpis()` | `selectDashboardKpis` → `DashboardKpis` (fields `activeMembers`, `activeMembersDelta`, `todayBookings`, `todayBookingsDeltaPct`, `occupancyRate`, `todayClasses`, `todayAlmostFull`) |
| Weekly chart | inline in `WeeklyBookingsChart` | `selectWeeklyBookingTrend` → `WeeklyBookingPoint[]` (`{date, label, bookings}`) |
| Class occupancy | inline in `ClassOccupancyList` | `selectClassOccupancy` → `ClassOccupancyPoint[]` |
| Upcoming classes | `useUpcomingSessions(4)` | `selectUpcomingSessions` → `SessionCard[]` |
| Recent bookings | `useRecentBookings(6)` | `selectRecentBookings` → `BookingRow[]` |

`Today's bookings`, `Occupancy`, `Today's classes`, the weekly chart's seven values, and every `ClassOccupancyPoint.occupancyRate` are derived numbers, not literals — the seeded dataset (`/docs/05-MOCK-DATA-STRATEGY.md`) is tuned so they land near the master plan's examples (`87%` occupancy, the `Mon 18 … Sun 25` weekly pattern, `Functional Training 87% / Cycling 94% / Yoga 67% / Pilates 72% / HIIT 83%`) without hard-coding them.

**Loading:** `useDemoStatus() !== 'ready'` renders `LoadingSkeleton` variants for all five regions (250–450 ms per ADR-005), matching each region's final shape (4 stat-card skeletons, a chart-area skeleton, a list skeleton, a table skeleton).

**Empty:** none of the five regions can be legitimately empty once seeded (the dataset always has bookings, sessions and class types); no empty-state design is needed here.

**Error:** any selector throwing (should not happen against a valid seed) is caught by `(admin)/error.tsx`, §48 copy.

**Responsive:**
| Breakpoint | Behavior |
|---|---|
| 1024 px | KPI row becomes 2×2 (`/docs/03-DESIGN-SYSTEM.md` §8); chart/occupancy row and upcoming/recent row each stay side by side but narrower |
| 768 px | Sidebar becomes drawer (`MobileNav`); every region stacks to one column, in master-plan order 17→21; `RecentBookingsTable` becomes a card list |
| 390 px | 16 px gutters; KPI cards stack fully; chart keeps its `x`-axis but drops the annotation pill if it collides |

---

### 3.3 Calendar — `/calendar`

**Phase:** 4. **Master plan:** §22.

**Layout, 1440 px:** `AppShell`; single full-width `SectionCard` containing `CalendarToolbar` (view switch Week/Month/Day, Today control, date navigation) as a header row, and `ScheduleCalendar` filling the remaining card height. `SessionDetailsSheet` is a right-side sheet (shadcn `Sheet`), width ~420 px, overlapping content, opened by clicking an event.

**Copy:** view labels `Week` / `Month` / `Day` (default `Week`, §22); sheet actions `View bookings`, `Edit class`.

**Components:** `ScheduleCalendar` (FullCalendar wrapper, `next/dynamic`, `ssr:false` per ADR-012), `SessionDetailsSheet`, `CalendarToolbar` (all `components/calendar/`).

**Data / selector:** `useSessionStore.sessions` joined with `useCatalogStore.classTypes` (for the class-accent colour, `/docs/03-DESIGN-SYSTEM.md` §6) and `useInstructorStore.instructors` to build FullCalendar events; `selectSessionsByDate` / `selectSessionsByClassType` / `selectSessionsByInstructor` (`domain/selectors/sessions.ts`) scope the visible range. Clicking an event calls `useSessionCard(sessionId)` → `selectSessionOccupancy` + `toSessionCard` to populate the sheet (capacity, booked, available spots, waitlist count).

**Loading:** `LoadingSkeleton` calendar-shaped placeholder (toolbar + grid lines) while `status !== 'ready'`, 250–450 ms.

**Empty:** a day/week/month with zero sessions renders FullCalendar's native empty grid (no custom `EmptyState` — an empty calendar cell is itself the empty state); this cannot occur given the seeded two-week window (`/docs/05-MOCK-DATA-STRATEGY.md`) but the grid degrades gracefully if it did.

**Error:** `(admin)/error.tsx`, §48 copy.

**Responsive:**
| Breakpoint | Behavior |
|---|---|
| 1024 px | Sidebar persists; toolbar wraps view switch below the date nav if needed |
| 768 px | Sidebar → drawer; default view forced to `Day` on first mobile visit for readability; `SessionDetailsSheet` becomes full-width bottom sheet |
| 390 px | Day view only exposed in the toolbar (Week/Month remain reachable via a "more" control); 16 px gutters |

---

### 3.4 Bookings — `/bookings`

**Phase:** 4. **Master plan:** §23–24.

**Layout, 1440 px:** `AppShell`; `PageHeader` (title + subtitle + `New booking` CTA, Ink button variant per `/docs/03-DESIGN-SYSTEM.md` §5); `FilterBar` row (`SearchInput` + Status select + Date select + Source select); `StatusTabs`; full-width `BookingsTable` (`DataTable`) with pagination footer.

**Copy (literal):**
- Header: `Bookings` / `Manage all class reservations.`
- Tabs: `All`, `Confirmed`, `Pending`, `Cancelled`, `Waitlist`
- New booking CTA: `New booking`
- Capacity line inside the dialog: `12 / 15 spots reserved` (pattern, value derived)
- Success toast: `Booking created successfully`

**Table columns:** Customer, Class, Instructor, Date, Time, Source, Status.

**Components:** `PageHeader` (`components/layout/`), `FilterBar` (`components/shared/`), and `StatusTabs`, `BookingFilters`, `BookingsTable`, `BookingDialog` (`components/bookings/`; `BookingFilters` composes the shared `FilterBar`), plus `StatusBadge` + `SourceBadge` (shared) in each row.

**Data / selector:** filters (`BookingFilters`: `query`, `status`, `source`, `date`) held in local component state (no dedicated store — `/docs/08-STATE-MANAGEMENT.md` §1 names no bookings-filter store, and §7 forbids a component-owned copy of *store* state, not of transient filter input). `useBookingRows(filters)` → `filterBookings` + `indexBookingsBySession`/`indexBookingsByCustomer` (`domain/selectors/bookings.ts`) → `BookingRow[]` (booking joined with customer, session, classType, instructor).

**New booking flow (§24):** `BookingDialog` fields Customer, Class, Date, Time, Instructor; Zod-validated `NewBookingInput`; submit calls `useBookingStore.createBooking(input)`, which per ADR-009/ADR-006 goes through the mock `BookingRepository` (~300 ms simulated), appends to `bookings[]`, and pushes a `useNotificationStore` entry (the one documented cross-store edge in `/docs/08-STATE-MANAGEMENT.md` §2). The table, the dashboard KPI, the calendar event and the relevant `ClassOccupancyPoint` all update because they are selector outputs over the same `bookings[]` array (ADR-006, master plan §9/§24).

**Loading:** `BookingsTable` renders a `LoadingSkeleton` table variant while `status !== 'ready'`; `BookingDialog`'s submit button shows a spinner and is disabled during `mutation === 'pending'` (guards duplicate submit).

**Empty:** filtered result set of zero rows renders `EmptyState` with the master-plan-literal copy: `No bookings found` / `Try changing your filters or create a new booking.` / `[Create booking]` button that opens `BookingDialog` (§47).

**Error:** `(admin)/error.tsx`, §48 copy; a failed `createBooking()` shows an inline dialog error and a toast, the dialog stays open so the user can retry without re-entering data.

**Responsive:**
| Breakpoint | Behavior |
|---|---|
| 1024 px | `FilterBar` wraps to two rows if needed; table unchanged |
| 768 px | Sidebar → drawer; `BookingsTable` becomes a card list (one card per booking, same seven fields stacked) per `/docs/03-DESIGN-SYSTEM.md` §8 |
| 390 px | `BookingDialog` becomes a full-height bottom sheet; `StatusTabs` becomes a horizontally scrollable pill row |

---

### 3.5 Customers — `/customers`

**Phase:** 5. **Master plan:** §25.

**Layout, 1440 px:** `AppShell`; `PageHeader`; KPI row of four `StatCard`s (span 3 each); `FilterBar` (`SearchInput` + status filter); full-width `CustomersTable` with pagination.

**Copy:** KPI labels `Total customers`, `Active memberships`, `New this month`, `Inactive` (§25, no literal example values given — all four are derived).

**Table columns:** Avatar, Customer, Membership, Last visit, Classes this month, Status.

**Components:** `PageHeader`, `StatCard` ×4, `FilterBar`, `CustomersTable` (`components/customers/`), `AvatarGroup`/`StatusBadge` (shared) per row.

**Data / selector:** `useCustomerStore.customers` joined with `useCatalogStore.membershipPlans`. KPI values: `Total customers` = `customers.length`; `Active memberships` = `selectActiveMembers(customers)` (`getActiveMembers`); `New this month` = `selectNewThisMonth(customers)`; `Inactive` = `filterCustomers(customers, {status:'inactive'})` count — this last mapping is not named individually in `/docs/08-STATE-MANAGEMENT.md` §4 and is this document's decision, reusing the existing `filterCustomers` selector rather than adding a new one. Table rows use `CustomerWithStats` from `selectCustomerStats` (per-row `lastVisit`, `classesThisMonth`, `membership`).

**Loading:** KPI `StatCard`s and table both show `LoadingSkeleton` variants, 250–450 ms.

**Empty:** filtered zero-row state uses `EmptyState`: `No customers found` / `Try changing your filters.` (this document's copy, parallel to §47's bookings example — no separate literal is given for this screen).

**Error:** `(admin)/error.tsx`, §48 copy.

**Responsive:**
| Breakpoint | Behavior |
|---|---|
| 1024 px | KPI row 2×2 |
| 768 px | Sidebar → drawer; `CustomersTable` becomes a card list; KPI row stacks to 2×2 still fits, drops to 1-column under 640 px internally handled by the `StatCard` grid |
| 390 px | KPI cards fully stacked; table cards show Avatar + Customer + Status only, remaining fields inside an expandable row |

---

### 3.6 Customer detail — `/customers/[id]`

**Phase:** 5. **Master plan:** §26.

**Layout, 1440 px:** `AppShell`; two columns — left `SectionCard`, span 4: avatar, `Customer XX`, `StatusBadge`, info list (email, phone, member since, membership, remaining credits), membership card below; right column, span 8: stats row of four `StatCard`s (classes this month, attendance rate, no-shows, favorite class) followed by `ActivityTimeline` in a `SectionCard`.

**Copy (literal), activity example entries:**
```
Attended Functional Training
Reserved Cycling
Cancelled Yoga
Membership renewed
```

**Components:** `CustomerProfile`, `CustomerStats`, `ActivityTimeline` (`components/customers/`), `StatCard` ×4 (shared).

**Data / selector:** `useCustomerProfile(customerId)` → `selectCustomerStats` → `CustomerWithStats` (email, phone, joinedAt, membership, remainingCredits, classesThisMonth, attendanceRate, noShows, favoriteClassTypeId — all derived per-customer, not literals). Activity timeline: `selectCustomerActivity` → `CustomerActivityEntry[]`. Unknown `id` → `notFound()` (section 2 above).

**Loading:** `LoadingSkeleton` for both columns while the profile hook returns `null` (pre-`ready` state).

**Empty:** a customer with no activity yet renders `ActivityTimeline`'s own `EmptyState`: `No activity yet` (this document's copy — no literal given, and every seeded customer has at least a `joined` entry so this path is reachable only for a hypothetical zero-history customer).

**Error:** `(admin)/error.tsx`, §48 copy.

**Responsive:**
| Breakpoint | Behavior |
|---|---|
| 1024 px | Columns stay side by side, left column narrows to span 5, right to span 7 |
| 768 px | Sidebar → drawer; columns stack, profile card first, stats row second (2×2), timeline last |
| 390 px | Stats row stacks to one column; 16 px gutters |

---

### 3.7 Classes — `/classes`

**Phase:** 6. **Master plan:** §27.

**Layout, 1440 px:** `AppShell`; `PageHeader`; `ClassGrid`, 4 columns × 2 rows at 1440 (8 class types, span 3 each).

**Copy (literal), the 8 class types:**
```
Functional Training
Cycling
Yoga
Pilates
HIIT
Strength
Mobility
Boxing
```

**Card content:** icon (from `ClassType.icon`, seed data), name, description, weekly sessions, average occupancy, assigned instructors.

**Components:** `ClassGrid`, `ClassCard` (`components/classes/`), `AvatarGroup` (shared, assigned instructors).

**Data / selector:** `useCatalogStore.classTypes` joined with `selectClassTypeStats` (`domain/selectors/classes.ts`) → `ClassTypeWithStats` (`weeklySessions`, `averageOccupancy`, `instructorIds` resolved against `useInstructorStore`). Values are derived; the dataset is tuned toward Functional Training appearing among the higher-demand classes (master plan §10).

**Loading:** `LoadingSkeleton` card-grid variant, 8 placeholders, 250–450 ms.

**Empty:** not reachable — the 8 class types are fixed catalog data, always present after hydration.

**Error:** `(admin)/error.tsx`, §48 copy.

**Responsive:**
| Breakpoint | Behavior |
|---|---|
| 1024 px | `ClassGrid` becomes 3 columns |
| 768 px | Sidebar → drawer; grid becomes 2 columns |
| 390 px | Grid becomes 1 column; 16 px gutters |

---

### 3.8 Class detail — `/classes/[id]`

**Phase:** 6. **Master plan:** §28.

**Layout, 1440 px:** `AppShell`; header block (name, description, duration, capacity, `AvatarGroup` of instructors) full width; KPI row of three `StatCard`s (`Average occupancy`, `Bookings this month`, `Cancellation rate`), span 4 each; `ClassWeekdayChart` full width below in a `SectionCard`; weekly schedule list (sessions for this class type) below the chart.

**Components:** `ClassDetail`, `ClassWeekdayChart` (`components/classes/`), `StatCard` ×3, `AvatarGroup` (shared).

**Data / selector:** `useCatalogStore.classTypes` lookup by id (→ `notFound()` if absent) + `selectClassTypeStats` for the KPI row; `selectClassWeekdayBookings` for the chart (bookings by weekday, derived); `selectSessionsByClassType` for the weekly schedule list.

**Loading:** header and chart both show `LoadingSkeleton` variants.

**Empty:** not reachable for a valid class-type id (every class type has sessions in the seeded two-week window).

**Error:** `(admin)/error.tsx`, §48 copy; unknown id → root `not-found.tsx`.

**Responsive:**
| Breakpoint | Behavior |
|---|---|
| 1024 px | KPI row stays 3-across, narrower |
| 768 px | Sidebar → drawer; KPI row becomes 1-column stack; chart and schedule list stack |
| 390 px | Header block stacks (avatar group wraps below the text); 16 px gutters |

---

### 3.9 Instructors — `/instructors`

**Phase:** 6. **Master plan:** §29.

**Layout, 1440 px:** `AppShell`; `PageHeader`; `InstructorGrid`, 3 columns × 2 rows at 1440 (6 instructors, span 4 each).

**Copy (literal), the 6 instructors:**
```
Instructor 01
Instructor 02
Instructor 03
Instructor 04
Instructor 05
Instructor 06
```

Statuses: `Available`, `In class`, `Off today`.

**Card content:** avatar, specialty, weekly sessions, rating, status.

**Components:** `InstructorGrid`, `InstructorCard` (`components/instructors/`), `StatusBadge` (shared).

**Data / selector:** `useInstructorStore.instructors` joined with `selectInstructorStats` (`domain/selectors/instructors.ts`) → `InstructorWithStats` (`weeklySessions`, `classesThisMonth`, `reservations`, `occupancyRate` — all derived).

**Loading:** `LoadingSkeleton` card-grid variant, 6 placeholders.

**Empty:** not reachable — 6 instructors are fixed seed data.

**Error:** `(admin)/error.tsx`, §48 copy.

**Responsive:**
| Breakpoint | Behavior |
|---|---|
| 1024 px | Grid stays 3 columns, narrower |
| 768 px | Sidebar → drawer; grid becomes 2 columns |
| 390 px | Grid becomes 1 column; 16 px gutters |

---

### 3.10 Instructor detail — `/instructors/[id]`

**Phase:** 6. **Master plan:** §30.

**Layout, 1440 px:** `AppShell`; two columns — left, span 4: avatar, name, specialty, rating, bio, `StatusBadge`; right, span 8: stats row of four `StatCard`s (classes this month, reservations, occupancy, rating), weekly schedule below, recent classes list and calendar preview at the bottom.

**Components:** `InstructorDetail` (`components/instructors/`), `StatCard` ×4 (shared), a compact read-only calendar preview reusing `ScheduleCalendar` in a constrained height (not the full `/calendar` toolbar).

**Data / selector:** `useInstructorStore.instructors` lookup by id (→ `notFound()` if absent) + `selectInstructorStats`; recent classes and the calendar preview from `selectSessionsByInstructor`.

**Loading:** `LoadingSkeleton` for both columns.

**Empty:** `Off today` instructors can have a schedule with zero sessions for the current day — the weekly-schedule list still shows the rest of the week; no dedicated empty state needed beyond the list naturally omitting today.

**Error:** `(admin)/error.tsx`, §48 copy; unknown id → root `not-found.tsx`.

**Responsive:**
| Breakpoint | Behavior |
|---|---|
| 1024 px | Columns stay side by side, narrower |
| 768 px | Sidebar → drawer; columns stack, profile first |
| 390 px | Stats row stacks to one column; calendar preview switches to a simple agenda list instead of a grid |

---

### 3.11 Memberships — `/memberships`

**Phase:** 7. **Master plan:** §31.

**Layout, 1440 px:** `AppShell`; `PageHeader`; grid of 4 `MembershipCard`s, span 3 each.

**Copy (literal), the 4 plans:**
```
Basic         $29/month    8 classes/month
Unlimited     $49/month    Unlimited classes
Premium       $69/month    Unlimited classes, Priority booking, 1 guest pass
Day Pass      $8           Single class
```

Card actions: `Edit plan`, `View members`.

**Components:** `MembershipCard`, `PlanEditDialog` (`components/memberships/`).

**Data / selector:** `useCatalogStore.membershipPlans` (static catalog, no selector needed — plans are not derived). `Edit plan` opens `PlanEditDialog`, writes through `useCatalogStore.updatePlan()` (local state only, no payments per §31/§2.2). `View members` filters `useCustomerStore.customers` by `membershipId` inline (no dedicated selector is named for this in `/docs/08-STATE-MANAGEMENT.md` §4 — this document's decision is a plain array filter inside the `MembershipCard` handler, since it is a one-off UI action, not a cross-screen derived number).

**Loading:** `LoadingSkeleton` card-grid variant, 4 placeholders.

**Empty:** not reachable — 4 plans are fixed catalog data.

**Error:** `(admin)/error.tsx`, §48 copy.

**Responsive:**
| Breakpoint | Behavior |
|---|---|
| 1024 px | Grid becomes 2×2 |
| 768 px | Sidebar → drawer; grid stays 2×2, cards narrower |
| 390 px | Grid becomes 1 column; 16 px gutters |

---

### 3.12 Automations — `/automations`

**Phase:** 7. **Master plan:** §32–33.

**Layout, 1440 px:** `AppShell`; `PageHeader`; `AutomationCard` grid, 4 columns, span 3 each, full width; `WhatsAppPreview` panel below, full width, showing the currently-selected automation's message template.

**Copy (literal), the 4 automations:**
```
Booking confirmation     Status: Active    Channel: WhatsApp    Trigger: New booking
24-hour reminder         Status: Active    Channel: WhatsApp
Inactive customer reminder   Status: Paused    Channel: WhatsApp
Birthday message          Status: Draft     Channel: WhatsApp
```

Toggle toast: `Automation activated`.

**WhatsApp simulation copy (literal), preview body:**
```
Booking confirmation

Your reservation is confirmed.

Functional Training

Friday, September 18
6:00 PM

We look forward to seeing you.
```
Status: `Delivered`. Buttons: `Send test`, `Edit template`. `Send test` toast: `Test message sent`.

**Components:** `AutomationCard`, `WhatsAppPreview` (`components/automations/`).

**Data / selector:** `useAutomationStore.automations`; `toggleAutomation(id)` flips `AutomationStatus` locally and fires the `Automation activated` toast (only when the new state is `active`, per §32's example); `sendTestMessage(id)` sets `sending: id`, awaits a ~800 ms simulated delay (master plan §33, no repository call — this is UI-only, not persisted data), clears `sending`, and shows the `Test message sent` toast. No external API is called anywhere in this screen (§2.2, §66.9; Codex verifies this explicitly per `/docs/10-IMPLEMENTATION-PLAN.md` Phase 7).

**Loading:** `LoadingSkeleton` card-grid variant, 4 placeholders; `WhatsAppPreview` shows its own skeleton until an automation is selected (default: the first, `Booking confirmation`).

**Empty:** not reachable — 4 automations are fixed seed data.

**Error:** `(admin)/error.tsx`, §48 copy.

**Responsive:**
| Breakpoint | Behavior |
|---|---|
| 1024 px | Card grid becomes 2×2 |
| 768 px | Sidebar → drawer; card grid stays 2×2, narrower; `WhatsAppPreview` full width below |
| 390 px | Card grid becomes 1 column; `WhatsAppPreview` renders as a phone-width chat bubble mock |

---

### 3.13 Settings — `/settings`

**Phase:** 9. **Master plan:** §40.

**Layout, 1440 px:** `AppShell`; `PageHeader`; four `SectionCard`s stacked full width, each with a 2-column field grid inside: `General`, `Booking`, `Notifications`, `Branding`.

**Fields:**
| Section | Fields |
|---|---|
| General | Studio name, Email, Phone, Address, Timezone |
| Booking | Cancellation window, Max reservations per day, Waitlist enabled, Advance booking period |
| Notifications | WhatsApp confirmations, Email confirmations, Reminder timing |
| Branding | Logo, Primary color, Accent color |

**Components:** four form sections inside `SectionCard` (shared), using shadcn `Form`/`Input`/`Switch`/`Select` primitives.

**Data / selector:** `useSettingsStore.settings` → `StudioSettings`; each section's save action calls `updateSection(section, patch)` (local state only, §40: "all settings are local/demo state"). Reflected live in `AppShell` where applicable (studio name, branding colors — per ADR-013/ADR-011 constraints, branding changes restyle CSS custom properties, not the fixed token palette itself).

**Loading:** `LoadingSkeleton` form-section variant ×4 while `status !== 'ready'`.

**Empty:** not applicable — settings always have seeded default values.

**Error:** `(admin)/error.tsx`, §48 copy.

**Responsive:**
| Breakpoint | Behavior |
|---|---|
| 1024 px | Each section's field grid stays 2 columns, narrower |
| 768 px | Sidebar → drawer; field grids become 1 column |
| 390 px | Sections remain full-width single-column cards; 16 px gutters |

---

### 3.14 Public booking — `/book`, `/book/[classId]`

**Phase:** 8 (high priority). **Master plan:** §34–38.

**Shell:** `BookingShell` (public layout, no `AppSidebar`/`TopBar`, mobile-first per §34). At 1440 px the wizard content is centered in a max-width ~480 px column against a branded background (dot-field pattern, `/docs/03-DESIGN-SYSTEM.md` §2) — desktop is a constrained view of the mobile-first design, not a separate desktop layout (§34: "mobile-first"). `WizardProgress` (4-step indicator) sits above the step content on every step.

`/book/[classId]` renders the same wizard with step 1's selection pre-set to the given class type and, if the id does not resolve to a real `ClassType`, falls back to step 1 unselected rather than a 404 (public flow must never dead-end, §52) — this is this document's decision, since the master plan does not specify not-found behavior for this route.

#### Step 1 — Choose class (§35)

**Copy (literal), class cards:** Functional Training, Cycling, Yoga, Pilates, HIIT. Card content: icon, duration, short description, available sessions.

**Components:** `PublicBookingWizard` step 1 (`components/booking/`), `ClassCard` reused from `components/classes/`.

**Data / selector:** `useCatalogStore.classTypes` filtered to the 5 listed (this document's decision: the public flow surfaces a curated subset, not all 8 admin class types, per §35's explicit list); available-session counts via `selectSessionsByClassType` + `selectSessionOccupancy`.

#### Step 2 — Choose date (§36)

**Copy (literal) pattern:** `THU 17`, `FRI 18`, `SAT 19`, `SUN 20`, `MON 21` (dates derived from `demoToday`, format is the literal).

**Components:** horizontal date selector (`components/booking/`, step 2).

**Data / selector:** dates enumerated from `demoToday` (`useDemoRuntimeStore.demoToday`) forward across the advance-booking window; selected-day sessions come from `selectSessionsByDate`.

#### Step 3 — Choose time (§37)

**Copy (literal) pattern:**
```
6:00 AM    12 / 15 spots
9:00 AM    14 / 15 spots
5:00 PM     8 / 15 spots
6:00 PM     FULL
7:00 PM    18 / 20 spots
```

**Components:** time-slot list (`components/booking/`, step 3).

**Data / selector:** `selectSessionsByClassType` + `selectSessionsByDate` narrowed to the chosen class/date, each mapped through `selectSessionOccupancy` for `booked`/`available`/`occupancyState`. `occupancyState === 'full'` (ADR-008: `available <= 0`) disables the slot, replacing the spots count with `FULL`.

#### Step 4 — Customer info (§38)

**Copy (literal):** fields `Name`, `Phone`, `Email`; CTA `Confirm reservation`.

**Components:** step 4 form (RHF + Zod, `PublicBookingInput` schema per `/docs/04-DOMAIN-MODEL.md` §4).

**Data / selector:** on submit — `useCustomerStore.addCustomer()` then `useBookingStore.createBooking()` (the documented cross-store edge, `/docs/08-STATE-MANAGEMENT.md` §2); submit button disabled during `mutation === 'pending'` to prevent double submission (§38, and the Phase 8 adversarial case list in `/docs/10-IMPLEMENTATION-PLAN.md`). On success, navigates to the success screen (3.15).

**Loading (all 4 steps):** each step's data-bearing region (class list, date strip, time-slot list) shows `LoadingSkeleton` while `status !== 'ready'`, 250–450 ms; step 4's submit shows a spinner during the ~300 ms simulated `createBooking()` call.

**Empty:** a class/date combination with zero sessions (should not occur inside the seeded two-week window, but is reachable at the tail of the advance-booking window) shows `EmptyState`: `No sessions available for this day` / prompts the visitor back to step 2 (this document's copy — no literal given).

**Error:** thrown errors inside the wizard fall back to the root `app/error.tsx` (`BookingShell` has no route-group-specific error boundary listed in `/docs/02-ARCHITECTURE.md` §2), §48 copy; a failed submit at step 4 shows an inline form error and keeps entered data so the visitor is not made to retype it.

**Responsive:**
| Breakpoint | Behavior |
|---|---|
| 1024 px | Wizard column widens slightly (~560 px), still centered, single-column steps |
| 768 px | Wizard fills the viewport width minus 24 px padding |
| 390 px | Reference mobile-first layout (§34): full-width steps, 16 px gutters, date strip and time-slot list scroll natively |

---

### 3.15 Booking success — `/book` (step 5, post-submit)

**Phase:** 8. **Master plan:** §39.

**Layout:** centered single column inside `BookingShell`, same ~480 px constraint at desktop, full-width at mobile: large success indicator, then a details card, then three stacked buttons.

**Copy (literal):**
- Heading: `Your class is booked!`
- Message: `Your confirmation has been sent by WhatsApp.` — explicitly simulated, no real message is sent (§33, §39, §2.2).
- Buttons: `Add to calendar`, `View booking`, `Book another class`

**Details shown:** class, date, time, studio location (from `Organization.address`).

**Components:** `BookingSuccess` (`components/booking/`).

**Data / selector:** reads the just-created `Booking` (returned by `createBooking()`) joined with its `ClassSession` → `ClassType` and the singleton `useCatalogStore.organization` for the studio location. No new selector — it composes existing entities held in local wizard state from step 4's result, avoiding a second store read that could race a subsequent mutation.

**Loading:** none — this screen only renders after `createBooking()` has already resolved.

**Empty:** not applicable — reachable only with a valid created booking.

**Error:** not applicable at this screen; failures are handled at step 4 before navigation occurs.

**Responsive:**
| Breakpoint | Behavior |
|---|---|
| 1024 px | Same centered column, unchanged |
| 768 px | Column fills viewport minus 24 px padding |
| 390 px | Buttons stack full-width, 16 px gutters, success indicator scales down slightly to keep all three buttons above the fold on common device heights |

---

## 4. Global surfaces

### 4.1 App shell

**Phase:** 2D. **Master plan:** §15.

`AppSidebar` (240 px, collapses to a `MobileNav` drawer below `lg` per `/docs/03-DESIGN-SYSTEM.md` §8): logo placeholder at top, primary nav (Dashboard, Calendar, Bookings, Customers, Classes, Instructors, Memberships), secondary nav (Automations, Settings), bottom block `Administrator` / `Admin` / `Logout` (static, not a link — §15 lists no destination for it).

`TopBar`: global search (`SearchInput`, placeholder `Search customers, classes...`), notifications (bell icon + unread count pill `3` as the literal example), help (icon button, no destination specified by the master plan — this document's decision: opens a static help popover, out of demo scope for content), profile/avatar (opens a menu with `Logout`, mirroring the sidebar's bottom block for parity on drawer layouts where the sidebar is hidden).

**Data:** nav active-state per section 2 above; unread-notification count from `useNotificationStore.notifications.filter(n => !n.read).length`.

### 4.2 Global search

**Phase:** 2D (UI), reading selectors delivered in Phase 2B/2C. **Master plan:** §41.

Dropdown opened from `TopBar`'s `SearchInput`, results grouped by type.

**Copy (literal) example:**
```
Customer 04
Customer

Functional Training
Class

Instructor 02
Instructor
```

**Data / selector:** `useGlobalSearch(query)` → `selectGlobalSearch` (`domain/selectors/search.ts`) → `SearchResult[]` (`{id, kind, label, sublabel, href}`), searching `customers`, `classTypes`, `instructors`. Clicking a result navigates to `href` (always a resolvable detail route, section 2's no-404 rule). Keyboard navigation (arrow keys + Enter, roving focus) is required (§41, and the accessibility posture in `/docs/02-ARCHITECTURE.md` §9).

**Empty:** zero matches renders `No results for "<query>"` inside the dropdown (this document's copy).

### 4.3 Notifications

**Phase:** 2D (UI) / 2C (store). **Master plan:** §42.

Dropdown from `TopBar`'s bell icon.

**Copy (literal) examples:**
```
New booking received
2 minutes ago

Functional Training is full
10 minutes ago

Booking cancelled
25 minutes ago
```

**Data / selector:** `useNotificationStore.notifications`, newest first; `markRead(id)` on click, `markAllRead()` from a header action. Unread rows carry a visual unread indicator (dot + background tint, not colour alone — §49).

**Empty:** zero notifications renders `You're all caught up` (this document's copy; unreachable at first load since the seed includes 10 notifications per `/docs/05-MOCK-DATA-STRATEGY.md` target, but reachable after `markAllRead()` if the dropdown were also mutated to remove read items — it is not; notifications stay listed, only their read state changes, so this empty state is a defensive fallback, not a normal path).

### 4.4 Demo Mode badge

**Phase:** 2D. **Master plan:** §45.

`DemoBadge` component, placed in `TopBar` next to the profile control (this document's decision — §45 requires only that it be "visible but not visually intrusive," not a fixed position).

**Copy (literal):** label `Demo Mode`; tooltip `Some data and functionality in this environment are simulated.`

No data dependency — static.

### 4.5 Loading states

**Phase:** 2D (the `LoadingSkeleton` component itself); used by every phase thereafter. **Master plan:** §46. **ADR:** ADR-005.

Target 250–450 ms simulated latency, driven by the hydration gate (`useDemoRuntimeStore.status`) and by each mutation's repository call (`~300 ms` bookings, `~800 ms` WhatsApp test send). `LoadingSkeleton` exposes shape variants used across screens: card, table row, chart, form-section, card-grid. No screen fakes a longer delay than its data actually takes to resolve (§46: "do not intentionally make navigation feel slow").

### 4.6 Empty states

**Phase:** 2D (the `EmptyState` component); per-screen copy as specified in section 3. **Master plan:** §47.

Canonical shape: heading, one line of supporting copy, one primary action button. The literal master-plan example (`No bookings found` / `Try changing your filters or create a new booking.` / `[Create booking]`) is reproduced exactly on the Bookings screen (3.4); every other screen's empty-state copy in section 3 is this document's parallel wording in the same voice, since the master plan gives only that one worked example.

### 4.7 Error states

**Phase:** 2D (the `ErrorState` component and `app/error.tsx` / `(admin)/error.tsx` boundaries). **Master plan:** §48.

**Copy (literal):** `Something went wrong` / `[Try again]`.

`app/error.tsx` is the root boundary (covers `(auth)` and `book/`, since neither has its own `error.tsx` per `/docs/02-ARCHITECTURE.md` §2); `(admin)/error.tsx` covers every admin route. `Try again` calls the Next.js error boundary's `reset()`. No screen in section 3 defines a different error copy — all reference this shared component.

---

## 5. Internal development route — `/design-system`

Not part of the master plan, not part of `/docs/02-ARCHITECTURE.md` §6's route table, not linked from `AppSidebar`, `TopBar`, or any other screen, and excluded from the demo presentation script (`/docs/15-DEMO-SCRIPT.md`) and from the §65 acceptance checklist. It exists solely as a token and component preview for implementers: a static page rendering the `/docs/03-DESIGN-SYSTEM.md` colour tokens, type scale, shadows, radii, and the shared `components/ui/` and `components/shared/` primitives in isolation, so visual regressions are visible without navigating the seeded app.

Built incrementally alongside Phase 2A (tokens) and Phase 2D (shared components) by whichever agent is writing the component in question, under standing Sonnet write ownership for `src/app/design-system/**` (not listed in `/docs/12-AGENT-OWNERSHIP.md` because it carries no phase-acceptance gate — Opus adds it there only if a future phase needs to assign it explicitly). It must never import from `src/data`, `src/stores`, or any repository — it renders tokens and static prop examples only, so it cannot drift into a second source of truth for demo data (§9, ADR-006).
