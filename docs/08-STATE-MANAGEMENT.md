# 08 — State Management

Zustand 5, client-only, in-memory. No `persist` middleware for demo data (§24: browser-session lifetime is enough); the only persisted value is the demo auth session in `localStorage`.

---

## 1. Store inventory

| Store | File | State | Actions |
|---|---|---|---|
| `useDemoRuntimeStore` | `stores/demo-runtime.store.ts` | `status: 'idle'\|'loading'\|'ready'\|'error'`, `demoToday: ISODate \| null`, `demoNow: ISODateTime \| null`, `error: string \| null` | `hydrateDemo()`, `retryHydration()`, `resetDemo()` |
| `useCatalogStore` | `stores/catalog.store.ts` | `organization`, `classTypes[]`, `membershipPlans[]` | `setCatalog()`, `updatePlan()` |
| `useInstructorStore` | `stores/instructor.store.ts` | `instructors[]` | `setInstructors()`, `setInstructorStatus()` |
| `useCustomerStore` | `stores/customer.store.ts` | `customers[]` | `setCustomers()`, `addCustomer()` |
| `useSessionStore` | `stores/session.store.ts` | `sessions[]` | `setSessions()`, `updateSession()` |
| `useBookingStore` | `stores/booking.store.ts` | `bookings[]`, `mutation: 'idle'\|'pending'` | `setBookings()`, `createBooking()`, `createPublicBooking()`, `cancelBooking()`, `checkIn()`, `promoteFromWaitlist()` |
| `useAutomationStore` | `stores/automation.store.ts` | `automations[]`, `sending: string \| null` | `setAutomations()`, `toggleAutomation()`, `sendTestMessage()` |
| `useNotificationStore` | `stores/notification.store.ts` | `notifications[]` | `setNotifications()`, `push()`, `markRead()`, `markAllRead()` |
| `useSettingsStore` | `stores/settings.store.ts` | `settings: StudioSettings` | `setSettings()`, `updateSection()` |
| `useUiStore` | `stores/ui.store.ts` | `sidebarOpen`, `searchOpen`, `notificationsOpen` | setters |

Master plan §43 names six stores. `useDemoRuntimeStore` (hydration gate + demo clock, ADR-005), `useCatalogStore` (immutable reference data + plan editing), `useInstructorStore` (instructor entities and status) and `useUiStore` (ephemeral shell state) are the four additions; each owns a distinct entity set, which is the "reason" §43 requires for splitting.

---

## 2. Store conventions

- One file per store, named `<name>.store.ts`, default export none — named hook export only.
- State and actions live in the same `create<T>()` call; actions are defined with `set`/`get`, never outside.
- Actions that mutate go through a repository (ADR-009) and are `async`.
- Cross-store writes are allowed only through `useOtherStore.getState().action()` inside an action, never inside a component or selector. Exactly three such edges exist. **The authoritative list is section 8.5; the three lines below are superseded by it.**
  - `createBooking` -> `useNotificationStore.push`
  - `cancelBooking` -> `useNotificationStore.push`
  - public booking -> `useCustomerStore.addCustomer` before `createBooking`
- No store subscribes to another store.
- Components select the narrowest slice possible. Array or object selections use `useShallow`:

```ts
const { bookings, mutation } = useBookingStore(
  useShallow((s) => ({ bookings: s.bookings, mutation: s.mutation }))
);
```

Selecting the whole store (`useBookingStore()`) is a review failure.

---

## 3. Hydration

> **Superseded by section 8.4.** The sketch below shows the seeding order, which is still correct, but its error handling and guard are not: use the version in section 8.4, which recovers from a failed load.

```ts
// stores/demo-runtime.store.ts (shape)
hydrateDemo: async () => {
  if (get().status !== 'idle') return;              // guard: React 19 StrictMode double-effect
  set({ status: 'loading' });
  const demoToday = todayISO();                     // client-only, ADR-005
  const dataset = await loadDemoDataset(demoToday); // repositories, simulated latency
  useCatalogStore.getState().setCatalog(dataset);
  useInstructorStore.getState().setInstructors(dataset.instructors);
  useCustomerStore.getState().setCustomers(dataset.customers);
  useSessionStore.getState().setSessions(dataset.sessions);
  useBookingStore.getState().setBookings(dataset.bookings);
  useAutomationStore.getState().setAutomations(dataset.automations);
  useNotificationStore.getState().setNotifications(dataset.notifications);
  useSettingsStore.getState().setSettings(dataset.settings);
  set({ status: 'ready', demoToday, seededAt: new Date().toISOString() });
}
```

`DemoDataProvider` (a client component in `components/layout/`) calls `hydrateDemo()` from a mount effect and renders `children` unconditionally; each view decides its own skeleton from `status`. The `status !== 'idle'` guard makes the double invocation of effects under React 19 StrictMode harmless.

---

## 4. Selectors

Pure functions in `src/domain/selectors/`. Signature style: data in, value out. No store imports, no React imports.

```ts
// domain/selectors/sessions.ts
export function selectSessionOccupancy(
  session: ClassSession,
  bookings: Booking[],       // already narrowed to this session
): SessionWithOccupancy;

export function indexBookingsBySession(bookings: Booking[]): Map<string, Booking[]>;
export function selectUpcomingSessions(...): SessionCard[];
export function selectAlmostFullSessions(...): SessionCard[];
```

Required selector set (master plan §43 names in brackets):

| File | Exports |
|---|---|
| `bookings.ts` | `selectTodayBookings` [getTodayBookings], `selectRecentBookings` [getRecentBookings], `selectBookingsBySession` [getBookingsBySession], `selectBookingsByCustomer` [getBookingsByCustomer], `selectBookingsByClass` [getBookingsByClass], `selectWeeklyBookingTrend`, `filterBookings`, `indexBookingsBySession`, `indexBookingsByCustomer` |
| `sessions.ts` | `selectSessionOccupancy`, `selectUpcomingSessions` [getUpcomingSessions], `selectAlmostFullSessions` [getAlmostFullSessions], `selectSessionsByDate`, `selectSessionsByClassType`, `selectSessionsByInstructor`, `toSessionCard` |
| `classes.ts` | `selectClassOccupancy` [getClassOccupancy], `selectClassPopularity` [getClassPopularity], `selectClassWeekdayBookings`, `selectClassTypeStats` |
| `customers.ts` | `selectCustomerStats`, `selectActiveMembers` [getActiveMembers], `selectNewThisMonth`, `selectCustomerActivity`, `filterCustomers` |
| `instructors.ts` | `selectInstructorStats` |
| `dashboard.ts` | `selectDashboardKpis` |
| `search.ts` | `selectGlobalSearch` |

Naming: the codebase uses the `selectX` prefix consistently; the `getX` names in §43 map 1:1 as shown. Every selector in this table gets at least one unit test (Phase 10).

---

## 5. Hooks

`src/hooks/` is the only place allowed to bind stores to selectors. Hooks memoise so a table of 1,000 bookings is indexed once per render, not per row.

```ts
export function useDashboardKpis(): DashboardKpis | null;   // null while loading
export function useUpcomingSessions(limit = 4): SessionCard[];
export function useRecentBookings(limit = 6): BookingRow[];
export function useBookingRows(filters: BookingFilters): BookingRow[];
export function useSessionCard(sessionId: string): SessionCard | null;
export function useCustomerProfile(customerId: string): CustomerWithStats | null;
export function useGlobalSearch(query: string): SearchResult[];
export function useDemoStatus(): 'idle' | 'loading' | 'ready' | 'error';
```

---

## 6. Re-render discipline

1. Narrow selections + `useShallow` (section 2).
2. `useMemo` around every selector call that walks the booking ledger; dependency arrays list the exact store slices used.
3. Index maps (`Map<sessionId, Booking[]>`) are built in the hook, then read by children — never rebuilt inside a row component.
4. Row components are `memo`-wrapped where a list exceeds ~20 items.
5. No object or array literal is passed as a prop from a render body without `useMemo` when the child is memoised.

---

## 7. Forbidden patterns

- Reading store state inside a selector.
- `useEffect` that copies store state into local component state.
- A second source of truth for any count (ADR-006).
- `persist` middleware on demo data.
- `Math.random()` / `Date.now()` inside seed generation (ADR-005).
- Mutating store arrays in place; every action returns new arrays.

---

## 8. Mutation protocol (ADR-017, from Codex H2, H3, H4, H5)

The original sketch validated capacity, then awaited the repository, then appended to a captured array. Codex demonstrated two defects in that shape: two concurrent submissions both pass the capacity check on the last remaining spot, and the captured-array append discards a concurrent write. Both are fixed structurally.

### 8.1 Serialize, then re-validate at commit

Every mutating action goes through one module-level promise chain in `stores/mutation-queue.ts`:

```ts
let tail: Promise<unknown> = Promise.resolve();

export function serialize<T>(work: () => Promise<T>): Promise<T> {
  const run = tail.then(work, work);
  tail = run.catch(() => undefined);   // a failure must not poison the queue
  return run;
}
```

Inside the serialized work, the order is fixed:

1. Read the **current** ledger with `get()`.
2. Check eligibility with the shared selector (section 8.3).
3. Await the repository call.
4. Commit with a functional update — `set((s) => ...)`, never a captured array — and **re-check capacity against `s.bookings` inside that updater**. If the spot is gone, commit nothing and return a rejection.

Step 4 is what makes invariant 6 hold. Step 1 alone is not enough.

### 8.2 Public booking is one action

`createPublicBooking(input: PublicBookingInput)` owns the pending flag from its first line, so a second submit is rejected before any state changes. It resolves customer identity by lowercased, trimmed email, reusing an existing customer when one matches. It creates the customer and the booking in a single commit, so a rejected booking never leaves an orphan customer behind. This replaces the previous "public booking -> addCustomer, then createBooking" edge.

### 8.3 One eligibility function

`selectBookingEligibility(session, customer, bookings, settings, demoNow): BookingEligibility` lives in `domain/selectors/bookings.ts` and is the only place booking rules exist. It enforces: session exists, session not cancelled, session has not started, capacity (ADR-008), no duplicate active booking, `maxReservationsPerDay`, `advanceBookingDays`, and `waitlistEnabled`. A waitlist request requires the session to be **full at that moment**; a confirmed or pending request requires it not to be.

Both the UI (to disable a control and explain why) and the store action (to reject) call it. A disabled button and a rejected action can therefore never disagree.

`selectCancellationEligibility(...)` applies `cancellationWindowHours` the same way. Admin actions may pass an explicit `override: true`; the public flow never can.

### 8.4 Hydration can fail and recover

```ts
hydrateDemo: async () => {
  const { status } = get();
  if (status === 'loading' || status === 'ready') return;   // 'error' may retry
  set({ status: 'loading', error: null });
  try {
    const dataset = await loadDemoDataset(todayISO());
    // ... fill every store synchronously ...
    set({ status: 'ready', demoToday: dataset.demoToday, demoNow: dataset.demoNow });
  } catch (err) {
    set({ status: 'error', error: err instanceof Error ? err.message : 'Unknown error' });
  }
}
```

Views render `ErrorState` with a Try again button when `status === 'error'`; the button calls `hydrateDemo()` again. `app/global-error.tsx` covers a render failure in the root layout itself, which no route-level `error.tsx` can catch.

### 8.5 Cross-store edges, revised

Exactly three, replacing the list in section 2:

- `createBooking` and `cancelBooking` -> `useNotificationStore.push`
- `createPublicBooking` -> `useCustomerStore.upsertByEmail` and `useNotificationStore.push`, both inside the single commit
- `hydrateDemo` -> every store's `set*` seeding action

### 8.6 The clock (ADR-018)

`useDemoRuntimeStore.demoNow` is the only clock the application reads for demo-relative reasoning: relative timestamps, "has this session started", the dashboard's notion of today, and FullCalendar's `now` and `initialDate`. `new Date()` appears only inside `hydrateDemo` when resolving the calendar date, and inside `lib/dates.ts` for formatting.

### 8.7 Studio identity has one live owner (ADR-019)

`useSettingsStore.general` owns studio name, email, phone, address and timezone from hydration onwards; it is seeded from the `Organization` record. Every screen, including the public booking confirmation, reads the settings store. `useCatalogStore.organization` keeps only `id` and `logo`.

### 8.8 Re-render discipline addendum (Codex positive note)

`useShallow` cannot stabilise an array of freshly constructed view models: the objects are new on every call, so the shallow comparison always fails. Select **raw store slices** with `useShallow`, then derive view models inside a `useMemo` in the hook. Join tables through `Map` indexes built once per hook call; never `sessions.find(...)` inside a `bookings.map(...)`, which is ~92,400 comparisons per recomputation at this dataset size.
