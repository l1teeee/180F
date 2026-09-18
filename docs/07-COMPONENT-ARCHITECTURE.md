# 07 — Component Architecture

Component inventory and composition rules. Derived from `GYM_DEMO_MASTER_PLAN.md` §51 (reusable components) and `/docs/02-ARCHITECTURE.md` §2 (directory layout) and §5 (layering table). Every deviation is recorded in `/docs/13-DECISIONS.md`.

---

## 1. Composition rules

1. **Pages compose, components present, logic lives in hooks and selectors.** A route file (`src/app/**/page.tsx`) assembles components and passes them data from hooks; it contains no JSX-level business logic (`/docs/02-ARCHITECTURE.md` §1, §5).
2. **No business arithmetic inside JSX.** Occupancy rates, deltas, counts, filtering, sorting and grouping happen in `domain/selectors/**`, exposed to components through `src/hooks/**`. A component that needs a number calls a hook (`useDashboardKpis`, `useUpcomingSessions`, …) — it never computes one from raw store arrays itself.
3. **Props are data, not stores.** A component never calls `useXStore()` to read the slice it renders unless it *is* the hook-bound container for that slice (the top of a feature tree, e.g. `BookingsTable`'s parent page). Presentational components under it receive typed props only.
4. **No component imports `src/data` or a repository.** Per the layering table in `/docs/02-ARCHITECTURE.md` §5, `components` may import `hooks`, `domain/types`, `domain/constants` and `lib` — nothing from `src/data` or `src/services/repositories`. Repository calls live inside store actions.
5. **Abstraction only when it earns its place** (master plan §51): create a shared component when there is clear semantic ownership, the pattern repeats across screens, and reuse improves consistency. Three explicit similar JSX blocks beat one premature wrapper. This is why, for example, KPI rows compose `StatCard` directly rather than gaining a bespoke `KpiRow` abstraction per feature when the layout differs each time.

---

## 2. Client and server boundaries

Per ADR-004 (client-first rendering), the split is narrow and structural, not per-file judgment:

| File | Rendering | Why |
|---|---|---|
| `src/app/layout.tsx` | Server | Fonts, `<Providers>`, `<Toaster>` mount only; no store reads. |
| `src/app/page.tsx` | Server | `redirect('/dashboard')`, nothing else. |
| `src/app/not-found.tsx` | Server | Static content, no data. |
| `src/app/error.tsx` | Client | Next.js requires error boundaries to be client components (`'use client'`); renders `ErrorState`. |
| `src/app/(auth)/login/page.tsx` | Client | React Hook Form + `useAuth()`. |
| `src/app/(admin)/layout.tsx` | Client | `AuthGuard` + `AppShell`, per `/docs/02-ARCHITECTURE.md` §2. |
| every `(admin)/**/page.tsx` | Client | Reads Zustand-backed hooks (KPIs, tables, calendar, detail views). |
| `src/app/book/layout.tsx`, `book/**/page.tsx` | Client | Public wizard reads session/booking state through the same stores. |

Everything else — every file under `src/components/**` — is rendered exclusively inside one of the client trees above. Individual shared/presentational components (`StatCard`, `SectionCard`, `PageHeader`, …) do not themselves read stores and carry no `'use client'` requirement of their own, but they live inside a client boundary already established by their route, so no server/client split exists below the route level.

### Dynamic imports (ADR-012)

`next/dynamic` with `ssr: false`, one skeleton fallback each:

| Component | Directory | Fallback |
|---|---|---|
| `ScheduleCalendar` (FullCalendar wrapper) | `components/calendar/` | `CalendarSkeleton` |
| `WeeklyBookingsChart` (Recharts) | `components/dashboard/` | `LoadingSkeleton variant="chart"` |
| `ClassWeekdayChart` (Recharts) | `components/classes/` | `LoadingSkeleton variant="chart"` |

`InstructorDetail`'s "calendar preview" (master plan §30) renders a short list of `UpcomingSessionCard` items for that instructor, not a second `ScheduleCalendar` instance — FullCalendar loads "only where needed" (master plan §22), and a detail-page preview does not need the full grid.

---

## 3. Component inventory

One table per directory in `/docs/02-ARCHITECTURE.md` §2. "Client/Server" reflects section 2 above (every entry below is Client unless noted). Phase references `/docs/10-IMPLEMENTATION-PLAN.md`.

### `components/layout/` — Phase 2D

| Component | Responsibility | Props (TypeScript) | Phase |
|---|---|---|---|
| `Providers` | Mounts `AuthProvider`, `DemoDataProvider`, toast host | `{ children: ReactNode }` | 2D |
| `DemoDataProvider` | Calls `hydrateDemo()` on mount, renders children unconditionally | `{ children: ReactNode }` | 2D |
| `AppShell` | Desktop/tablet frame: sidebar + top bar + main content slot | `{ children: ReactNode }` | 2D |
| `AppSidebar` | 240 px nav, active-item styling, drawer under `lg` | `{ items: NavItem[] }` | 2D |
| `MobileNav` | Drawer/sheet variant of the sidebar for `< lg` | `{ items: NavItem[]; open: boolean; onOpenChange: (v: boolean) => void }` | 2D |
| `TopBar` | Search trigger, notifications bell, help, profile menu | `{ user: { name: string; role: string } }` | 2D |
| `PageHeader` | Title + subtitle + right-aligned actions slot | `{ title: string; subtitle?: string; actions?: ReactNode }` | 2D |
| `DemoBadge` | "Demo Mode" pill with tooltip (§45) | `{ className?: string }` | 2D |

### `components/dashboard/` — Phase 3

| Component | Responsibility | Props | Phase |
|---|---|---|---|
| `DashboardHeader` | Greeting line + subtitle (§17) | `{ greeting: string; subtitle: string }` | 3 |
| `WeeklyBookingsChart` | Recharts bar/area of `WeeklyBookingPoint[]` with tooltip + text summary | `{ data: WeeklyBookingPoint[] }` | 3 |
| `ClassOccupancyList` | Stack of `OccupancyBar` from `ClassOccupancyPoint[]` | `{ data: ClassOccupancyPoint[] }` | 3 |
| `UpcomingSessionsList` | Wraps `UpcomingSessionCard` items | `{ sessions: SessionCard[] }` | 3 |
| `UpcomingSessionCard` | Time, class, instructor, spots, status, avatar, mini occupancy indicator (§20) — the concrete realisation of master plan §51's `SessionCard` | `{ session: SessionCard }` | 3 |
| `RecentBookingsTable` | Wraps `DataTable<BookingRow>` for the dashboard's recent-bookings panel | `{ rows: BookingRow[] }` | 3 |
| `DashboardSkeleton` | Full-page loading composition while `useDemoStatus() !== 'ready'` | none | 3 |

### `components/calendar/` — Phase 4

| Component | Responsibility | Props | Phase |
|---|---|---|---|
| `CalendarToolbar` | Week/Month/Day switch + ink "Today" control | `{ view: 'week' \| 'month' \| 'day'; onViewChange: (v: 'week' \| 'month' \| 'day') => void; onToday: () => void }` | 4 |
| `ScheduleCalendar` | Dynamic FullCalendar wrapper, class-accent events, click → sheet | `{ events: SessionCard[]; view: 'week' \| 'month' \| 'day'; onEventClick: (sessionId: string) => void }` | 4 |
| `CalendarSkeleton` | Grid-shaped skeleton while the FullCalendar chunk loads | none | 4 |
| `SessionDetailsSheet` | Class, date, time, instructor, room, capacity, bookings, available spots; "View bookings" / "Edit class" | `{ sessionId: string \| null; open: boolean; onOpenChange: (v: boolean) => void }` | 4 |

### `components/bookings/` — Phase 4

| Component | Responsibility | Props | Phase |
|---|---|---|---|
| `StatusTabs` | All / Confirmed / Pending / Cancelled / Waitlist tabs | `{ value: BookingStatus \| 'all'; onChange: (v: BookingStatus \| 'all') => void; counts: Record<BookingStatus \| 'all', number> }` | 4 |
| `BookingFilters` | Search + status + date + source controls (composes `FilterBar`, `SearchInput`) | `{ filters: BookingFilters; onChange: (f: BookingFilters) => void }` | 4 |
| `BookingsTable` | Wraps `DataTable<BookingRow>` with the §23 column set | `{ rows: BookingRow[] }` | 4 |
| `BookingDialog` | New-booking form (RHF + Zod), live capacity display, submit → `createBooking` | `{ open: boolean; onOpenChange: (v: boolean) => void; presetSessionId?: string }` | 4 |

### `components/customers/` — Phase 5

| Component | Responsibility | Props | Phase |
|---|---|---|---|
| `CustomersTable` | Wraps `DataTable<CustomerWithStats>` with the §25 column set | `{ rows: CustomerWithStats[] }` | 5 |
| `CustomerProfile` | Header (avatar, `Customer XX`, status), contact info, membership card | `{ customer: CustomerWithStats }` | 5 |
| `CustomerStats` | Classes this month, attendance rate, no-shows, favorite class | `{ stats: Pick<CustomerWithStats, 'classesThisMonth' \| 'attendanceRate' \| 'noShows' \| 'favoriteClassTypeId'> }` | 5 |
| `ActivityTimeline` | Renders `CustomerActivityEntry[]` (§26) | `{ entries: CustomerActivityEntry[] }` | 5 |

### `components/classes/` — Phase 6

| Component | Responsibility | Props | Phase |
|---|---|---|---|
| `ClassGrid` | Grid of the 8 `ClassCard`s | `{ classTypes: ClassTypeWithStats[] }` | 6 |
| `ClassCard` | Icon, name, description, weekly sessions, avg occupancy, instructor avatars (§27) | `{ classType: ClassTypeWithStats; instructors: Instructor[] }` | 6 |
| `ClassDetail` | Name, description, duration, capacity, instructor `AvatarGroup`, weekly schedule | `{ classType: ClassTypeWithStats; instructors: Instructor[]; sessions: SessionCard[] }` | 6 |
| `ClassWeekdayChart` | Dynamic Recharts bookings-by-weekday | `{ data: { day: string; bookings: number }[] }` | 6 |

### `components/instructors/` — Phase 6

| Component | Responsibility | Props | Phase |
|---|---|---|---|
| `InstructorGrid` | Grid of the 6 `InstructorCard`s | `{ instructors: InstructorWithStats[] }` | 6 |
| `InstructorCard` | Avatar, specialty, weekly sessions, rating, status (§29) | `{ instructor: InstructorWithStats }` | 6 |
| `InstructorDetail` | Specialty, rating, bio, weekly schedule, stats, recent classes, session-list calendar preview | `{ instructor: InstructorWithStats; upcoming: SessionCard[] }` | 6 |

### `components/memberships/` — Phase 7

| Component | Responsibility | Props | Phase |
|---|---|---|---|
| `MembershipCard` | Plan name, price, benefits, "Edit plan" / "View members" actions (§31) — master plan §51's `MembershipCard` | `{ plan: MembershipPlan; memberCount: number; onEdit: () => void; onViewMembers: () => void }` | 7 |
| `PlanEditDialog` | Local-state-only plan edit form | `{ plan: MembershipPlan \| null; open: boolean; onOpenChange: (v: boolean) => void }` | 7 |

### `components/automations/` — Phase 7

| Component | Responsibility | Props | Phase |
|---|---|---|---|
| `AutomationCard` | Name, channel, trigger, status, toggle | `{ automation: Automation; onToggle: (id: string) => void }` | 7 |
| `WhatsAppPreview` | Message-bubble preview, "Send test" (simulated ~800 ms) and "Edit template" (§33) | `{ automation: Automation }` | 7 |

### `components/booking/` (public wizard) — Phase 8

| Component | Responsibility | Props | Phase |
|---|---|---|---|
| `WizardProgress` | 4-step indicator | `{ step: 1 \| 2 \| 3 \| 4 }` | 8 |
| `ClassSelectStep` | Step 1: class cards (icon, duration, description, available sessions) | `{ classTypes: ClassType[]; onSelect: (classTypeId: string) => void }` | 8 |
| `DateSelectStep` | Step 2: horizontal date selector | `{ classTypeId: string; onSelect: (date: ISODate) => void }` | 8 |
| `TimeSelectStep` | Step 3: time slots with capacity, full slots disabled (§37) | `{ classTypeId: string; date: ISODate; onSelect: (sessionId: string) => void }` | 8 |
| `CustomerFormStep` | Step 4: name/phone/email (RHF + Zod), submit guard against double-submit | `{ sessionId: string; onSubmit: (input: PublicBookingInput) => Promise<void> }` | 8 |
| `BookingSuccess` | Confirmation screen: class, date, time, location, "Add to calendar" / "View booking" / "Book another class" | `{ booking: BookingRow }` | 8 |
| `PublicBookingWizard` | Owns step state, orchestrates the four steps and `BookingSuccess` (UI flow state, not business logic — legitimate per §1 rule 5) | `{ presetClassTypeId?: string }` | 8 |

### `components/shared/` — Phase 2D

Full prop contracts in section 4. One-line responsibilities:

| Component | Responsibility |
|---|---|
| `StatCard` | Label → metric + unit → delta pill, optional pastel accent icon |
| `SectionCard` | Card chrome (header + action slot + body), flat or hero variant |
| `StatusBadge` | Status pill from the single status→colour map |
| `SourceBadge` | Booking-source pill (website/whatsapp/instagram/reception) |
| `AvatarGroup` | Overlapping avatars with `+N` overflow chip |
| `DataTable` | Generic table: columns, client pagination, mobile card renderer |
| `SearchInput` | Icon-leading search field |
| `FilterBar` | Row layout for filter controls |
| `EmptyState` | Polished "nothing here" panel with optional CTA |
| `ErrorState` | "Something went wrong" + "Try again" |
| `LoadingSkeleton` | Skeleton variants (card, table-row, chart, kpi, text) |
| `OccupancyBar` | Horizontal capacity bar with accent fill and percentage |
| `ConfirmDialog` | Generic confirm/cancel dialog for destructive or blocking actions |
| `PageHeader` | (listed under layout/ above; shared contract lives with the rest of section 4) |
| `DemoBadge` | (listed under layout/ above; shared contract lives with the rest of section 4) |

### `components/ui/` — Phase 2D

shadcn/ui primitives, restyled. Full restyle mapping in section 5.

| Primitive | Used directly by |
|---|---|
| `button` | every CTA, icon button, dialog action |
| `card` | `SectionCard`, `StatCard`, `ClassCard`, `InstructorCard`, `MembershipCard` |
| `dialog` | `BookingDialog`, `PlanEditDialog`, `ConfirmDialog` |
| `sheet` | `SessionDetailsSheet`, `MobileNav` |
| `input` | `SearchInput`, all form fields |
| `select` | `BookingFilters`, `SectionCard` header control |
| `tabs` | `StatusTabs` |
| `table` | `DataTable` |
| `badge` | `StatusBadge`, `SourceBadge` |
| `avatar` | `AvatarGroup` |
| `dropdown-menu` | `TopBar` profile menu, table row actions |
| `popover` | global search results, filter popovers |
| `command` | global search (§41) |
| `switch` | `AutomationCard` toggle |
| `skeleton` | `LoadingSkeleton` |
| `tooltip` | `DemoBadge`, icon-button `aria-label` companions |
| `separator` | `SectionCard` internal dividers, sidebar sections |
| `label` | every form field |
| `form` | `BookingDialog`, `CustomerFormStep`, `PlanEditDialog`, login |
| `sonner` | root toast host (`Providers`) |

---

## 4. Shared component contracts

```ts
// components/shared/stat-card.tsx
interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: { value: string; direction: 'up' | 'down' | 'flat' };
  icon?: LucideIcon;
  accent?: AccentToken;
  loading?: boolean;
}

// components/shared/section-card.tsx
interface SectionCardProps {
  title: string;
  action?: ReactNode;          // e.g. a ghost "Monthly ▾" select or a "⋮" icon button
  variant?: 'flat' | 'hero';   // hero = --gradient-card-lilac
  children: ReactNode;
  className?: string;
}

// components/shared/status-badge.tsx
interface StatusBadgeProps {
  status: BookingStatus | CustomerStatus | InstructorStatus | AutomationStatus | OccupancyState;
  label?: string;   // override the default label from the status->colour map
}

// components/shared/source-badge.tsx
interface SourceBadgeProps {
  source: BookingSource;
}

// components/shared/avatar-group.tsx
interface AvatarGroupProps {
  people: { id: string; name: string; avatar: string | null }[];
  max?: number;                 // default 4, rest collapse into "+N"
  size?: 28 | 32 | 40;
}

// components/shared/data-table.tsx
interface DataTableColumn<Row> {
  id: string;
  header: string;
  cell: (row: Row) => ReactNode;
  className?: string;
}

interface DataTableProps<Row> {
  rows: Row[];                                   // already filtered by the caller's hook/selector
  columns: DataTableColumn<Row>[];
  rowKey: (row: Row) => string;
  pageSize?: number;                              // default 10, client-side pagination
  renderMobileCard?: (row: Row) => ReactNode;      // used below `md`, per §14
  emptyState?: ReactNode;
  onRowClick?: (row: Row) => void;
}

// components/shared/search-input.tsx
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
}

// components/shared/filter-bar.tsx
interface FilterBarProps {
  children: ReactNode;    // a row of Select / SearchInput controls
  onReset?: () => void;
}

// components/shared/empty-state.tsx
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: LucideIcon;
}

// components/shared/error-state.tsx
interface ErrorStateProps {
  title?: string;          // default 'Something went wrong'
  description?: string;
  onRetry?: () => void;    // renders 'Try again'
}

// components/shared/loading-skeleton.tsx
interface LoadingSkeletonProps {
  variant: 'card' | 'table-row' | 'chart' | 'kpi' | 'text';
  count?: number;           // repeats, e.g. N table rows
  className?: string;
}

// components/shared/occupancy-bar.tsx
interface OccupancyBarProps {
  rate: number;             // 0..1
  accent: AccentToken;
  label?: string;           // left-side label, e.g. class name
  showPercentage?: boolean; // default true, tabular numerals on the right
}

// components/shared/confirm-dialog.tsx
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;    // default 'Confirm'
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

// components/layout/page-header.tsx
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;      // the single ink CTA per screen, when the screen has one (§51)
}

// components/layout/demo-badge.tsx
interface DemoBadgeProps {
  className?: string;       // no other props; tooltip copy is fixed (§45)
}
```

`DataTable` never filters, sorts by a hidden default, or paginates server-side — it renders the `rows` it is given and owns only pagination-through-the-given-set and the mobile/desktop render switch. Filtering and sorting are the caller's hook's job (`useBookingRows`, `filterCustomers`, …), per `/docs/08-STATE-MANAGEMENT.md` §4 and the anti-pattern in section 7 below.

---

## 5. shadcn/ui primitives (Phase 2D) and their restyle

Installed via the shadcn CLI into `src/components/ui/`, then restyled so no screen reads as stock shadcn (`/docs/03-DESIGN-SYSTEM.md` §9, a review failure otherwise per master plan §3 and §69).

| Primitive | Restyled to |
|---|---|
| `button` | Variants mapped to the §5 button table: primary (`--color-purple` fill), ink (`--color-ink` fill, `--radius-pill`, one hero CTA per screen), secondary (white + border), ghost, icon (40 px circle). |
| `card` | `--radius-card`, `1px solid --color-border`, `--shadow-card`; hero variant swaps to `--gradient-card-lilac` + `--color-border-soft`. |
| `dialog` | `--radius-card` (24 px), `--shadow-raise` once open, default shadcn focus trap kept as-is (§49). |
| `sheet` | Same radius/shadow treatment as `dialog` on the sliding panel edge. |
| `input` | 40 px height, `--radius-field`, `1px solid --color-border`, focus = purple border + 3 px `rgba(120,105,212,0.18)` ring. |
| `select` | Same field styling as `input`; a borderless/ghost variant powers `SectionCard`'s "Monthly ▾" header control. |
| `tabs` | Active tab = `--color-purple-xsoft` background pill, inactive = secondary text; powers `StatusTabs`. |
| `table` | No outer border, `1px --color-border` row dividers, 52 px rows, 12 px/600 uppercase header in `--color-text-tertiary`, hover row `--color-surface-muted`; base for `DataTable`. |
| `badge` | 26 px height, `--radius-pill`, 12 px/600 text, 10 px horizontal padding; base for `StatusBadge` / `SourceBadge` with the §5 colour table. |
| `avatar` | Circular, deterministic pastel initials fallback from the token set; base for `AvatarGroup`'s `-8px` overlap + white 2 px ring. |
| `dropdown-menu` | `TopBar` profile menu, `DataTable` row "⋮" actions. |
| `popover` | Global search results panel, filter popovers in `FilterBar`. |
| `command` | Global search (§41): grouped results, keyboard navigation, roving focus. |
| `switch` | `AutomationCard` toggle; on = `--color-purple`. |
| `skeleton` | Base shimmer block; `LoadingSkeleton` composes it per variant. |
| `tooltip` | `DemoBadge` copy, `aria-label` companions on icon-only buttons, chart annotation pill. |
| `separator` | `SectionCard` internal dividers, `AppSidebar` section breaks (primary/secondary nav). |
| `label` | Every form field, paired 1:1 with its input for accessibility (§49). |
| `form` | shadcn's RHF-bound `Form`/`FormField` wrapper; used by `BookingDialog`, `CustomerFormStep`, `PlanEditDialog`, login. |
| `sonner` | Toast host mounted once in `Providers`; carries every toast copy in the master plan (§24, §32, §33). |

Restyle rule: radii move to the `/docs/03-DESIGN-SYSTEM.md` §3 scale, shadows to `--shadow-card` / `--shadow-raise`, focus rings to the purple ring, default `rounded-md` is replaced everywhere. The shadcn→token variable bridge (docs/03 §9) means most of this restyle is automatic; per-component overrides handle radius, shadow and variant additions only.

---

## 6. Naming and file conventions

- Files: kebab-case (`stat-card.tsx`, `upcoming-session-card.tsx`).
- Components: PascalCase (`StatCard`, `UpcomingSessionCard`).
- One exported component per file. The file's default/named export is the component; no multi-component barrel files inside feature directories.
- Colocated sub-components are allowed when private to their parent — e.g. a small `SessionStatusDot` used only inside `upcoming-session-card.tsx` can live in that same file, unexported.
- Index barrels (`index.ts` re-exporting the directory) exist only in `src/domain/**` and `src/components/ui/**`. No barrel file under `src/components/dashboard/`, `bookings/`, etc. — import each component from its own file so the dependency graph stays traceable.
- Props interfaces are named `<Component>Props` and live in the same file as the component, not in a shared types file (except the domain types they reference, which come from `domain/types`).

---

## 7. Anti-patterns that fail review

| Anti-pattern | Why it fails | Correct pattern |
|---|---|---|
| Prop drilling beyond two levels | Signals the data belongs in a hook, not in props passed through intermediate components that don't use it. | The consuming component calls the hook directly (`useDashboardKpis`, `useBookingRows`, …). |
| A second status→colour map anywhere outside `src/domain/constants` | Creates the exact drift ADR-006 exists to prevent — two components could render different colours for the same status. | Exactly one map, in `src/domain/constants`, consumed by `StatusBadge`/`SourceBadge` only. |
| Inline hex colours (`style={{ color: '#7869D4' }}`, arbitrary Tailwind `[#...]` values) | Bypasses the token system in `/docs/03-DESIGN-SYSTEM.md` §1; the whole point of the `@theme` block is one colour source. | Tailwind utility classes bound to the CSS variables, or the token name in `domain/constants`. |
| `useEffect` that copies store state into local component state | Duplicate source of truth, listed as forbidden in `/docs/08-STATE-MANAGEMENT.md` §7. | Read the store slice directly (narrow selection + `useShallow`) or derive with `useMemo`. |
| A component that owns both list logic (filtering/sorting/pagination) and presentation | Makes the logic untestable without mounting a component and unreusable by any other view of the same data. | Filtering/sorting live in a selector or hook (`filterBookings`, `useBookingRows`); the component only receives `rows` and renders them, per `DataTable`'s contract in section 4. |
