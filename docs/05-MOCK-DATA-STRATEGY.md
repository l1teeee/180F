# 05 — Mock Data Strategy

The exact generation specification for Phase 2B (`docs/10-IMPLEMENTATION-PLAN.md` Phase 2B). Authoritative for `src/data/**`. Deviates from master plan `9` only where ADR-007 already overrides it (full ledger, not 50-80 records); every other parameter below is settled and must not be changed without a new ADR.

`buildDemoDataset(demoToday: ISODate): DemoDataset` is the sole entry point. Given the same `demoToday`, it returns byte-identical output on every call, in any environment, forever. That is the acceptance test for this document.

---

## 1. Determinism model

### 1.1 Primitives (`src/lib/random.ts`)

```ts
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;   // [0, 1)
  };
}

// FNV-1a, 32-bit. Combines the base seed with a family + key string into
// one new seed so every (family, key) pair gets its own independent stream.
function hashSeed(seed: number, family: string, key: string): number {
  let h = 2166136261 >>> 0;
  for (const s of [String(seed), family, key]) {
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
  }
  return h >>> 0;
}

export function createStream(seed: number, family: string, key: string): () => number {
  return mulberry32(hashSeed(seed, family, key));
}
```

`SEED = 180180`, declared once in `seed.ts`, imported everywhere else — never re-declared.

### 1.2 Why keyed streams, not one global sequence

A single `mulberry32(SEED)` walked sequentially through the whole generator means inserting or removing anything anywhere upstream shifts every draw downstream — the classic "reshuffles the whole dataset" failure. Instead, every stream is `createStream(SEED, family, key)` where `key` is the entity's own id (or a fixed literal for a one-off draw). A customer's status draw depends only on `SEED` and that customer's id; a session's booking draws depend only on `SEED` and that session's id. Adding `cus-0149` changes nothing about `cus-0001..cus-0148` or any existing session, because none of their streams take the customer roster's length or order as an input. This is the concrete mechanism behind ADR-005's determinism requirement and the "adding a customer never reshuffles bookings" property.

Family names used below (string, not numeric — grep-able, self-documenting): `customer-status`, `customer-membership`, `customer-joined`, `schedule-cancel`, `booking-pick`, `booking-status`, `booking-source`, `booking-created`, `booking-jitter`, `cancelled-booking`, `waitlist`, `no-show`.

### 1.3 Forbidden inside `src/data/**`

`Math.random`, `Date.now`, `new Date()` with no argument, any I/O. Violating this is a Phase 2B review failure per ADR-005 and the CLAUDE.md "no error handling for scenarios that cannot happen" rule cuts the other way here: a banned call is a scenario that must not compile past review, not one to guard against at runtime.

### 1.4 `demoToday` and the single reference clock

`demoToday: ISODate` (`'YYYY-MM-DD'`, studio-local — `America/Bogota`, ADR per `docs/04` primitives) is the only external input. Every timestamp the generator produces derives from it plus fixed offsets — never from the wall clock the generator happens to run on.

Define once, in `seed.ts`:

```ts
const NOW_ANCHOR: ISODateTime = `${demoToday}T09:00:00.000-05:00`; // Bogota UTC-5, fixed offset (no DST)
```

`NOW_ANCHOR` stands in for "the moment someone is looking at this demo" — a fixed mid-morning point on `demoToday`. It is the upper bound for every `createdAt` and `checkedInAt` in the dataset, and the anchor the 10 hand-authored notifications count back from. Nothing in the dataset carries a timestamp after `NOW_ANCHOR`.

---

## 2. Window

`sessions` span `demoToday - 7` to `demoToday + 6`, inclusive — 14 calendar days. Because 14 is exactly two weeks, this window always contains exactly 10 weekdays and 4 weekend days (2 Saturdays, 2 Sundays) regardless of which weekday `demoToday` falls on — the weekday/weekend session-count totals below are constants of the spec, not a function of `demoToday`.

"Today" = the session date equal to `demoToday`. Sessions with `date < demoToday` are `completed` (status), one exception below. Sessions with `date >= demoToday` are `scheduled`.

---

## 3. Catalogue (hand-authored, not generated)

One file per table, `src/data/<name>.ts`, exporting a plain `const` array or object literal typed against `src/domain/types/entities.ts`. No PRNG in these files except where a table below says so.

### 3.1 `organization.ts`

| Field | Value |
|---|---|
| `id` | `'org-180fitness'` |
| `name` | `'180 Fitness Studio'` |
| `logo` | `null` |
| `timezone` | `'America/Bogota'` |
| `address` | `'Carrera 11 # 93-45, Bogotá'` |
| `phone` | `'+57 601 000 0180'` |
| `email` | `'hello@180fitness.app'` |

### 3.2 `classes.ts` — 8 `ClassType` records

| id | name | duration | capacity | category | accent | icon |
|---|---|---|---|---|---|---|
| `ct-functional-training` | Functional Training | 50 | 15 | strength | purple | `Dumbbell` |
| `ct-cycling` | Cycling | 45 | 20 | cardio | yellow | `Bike` |
| `ct-yoga` | Yoga | 60 | 18 | mind_body | green | `Flower2` |
| `ct-pilates` | Pilates | 50 | 12 | mind_body | blue | `Anchor` |
| `ct-hiit` | HIIT | 40 | 20 | cardio | pink | `Flame` |
| `ct-strength` | Strength | 55 | 15 | strength | purple | `Weight` |
| `ct-mobility` | Mobility | 45 | 18 | mind_body | green | `StretchHorizontal` |
| `ct-boxing` | Boxing | 50 | 16 | combat | pink | `Swords` |

`description` is one hand-written sentence per class type (studio-voice, not generated).

### 3.3 `instructors.ts` — 6 `Instructor` records

| id | name | rating | status | specialty (primary) | secondary eligibility |
|---|---|---|---|---|---|
| `ins-01` | Instructor 01 | 4.8 | available | Functional Training | Strength |
| `ins-02` | Instructor 02 | 4.6 | in_class | Cycling | HIIT |
| `ins-03` | Instructor 03 | 4.9 | available | Yoga | Mobility |
| `ins-04` | Instructor 04 | 4.5 | in_class | Pilates | Mobility |
| `ins-05` | Instructor 05 | 4.7 | off_today | Strength | Functional Training |
| `ins-06` | Instructor 06 | 4.9 | available | Boxing | HIIT |

Ratings and statuses are the literal values above — not generated (matches "rating 4.5-4.9, one decimal" and the three-available/two-in_class/one-off_today distribution: `ins-01`, `ins-03`, `ins-06` available; `ins-02`, `ins-04` in_class; `ins-05` off_today). The secondary column is not a database field — it feeds the eligibility table in §5.2 and is encoded there as `ELIGIBLE_INSTRUCTORS: Record<classTypeId, instructorId[]>`. Every class type has exactly two eligible instructors, which the schedule generator round-robins between.

### 3.4 `memberships.ts` — 4 `MembershipPlan` records

| id | name | price | period | classLimit | benefits | accent |
|---|---|---|---|---|---|---|
| `plan-basic` | Basic | 29 | monthly | 8 | `['8 classes per month']` | blue |
| `plan-unlimited` | Unlimited | 49 | monthly | `null` | `['Unlimited classes']` | purple |
| `plan-premium` | Premium | 69 | monthly | `null` | `['Unlimited classes', 'Priority booking', '1 guest pass']` | yellow |
| `plan-day-pass` | Day Pass | 8 | one_time | 1 | `['Single class']` | green |

### 3.5 `automations.ts` — 4 `Automation` records

All channel `whatsapp` (master plan `32`).

| id | name | trigger | status |
|---|---|---|---|
| `auto-01` | Booking confirmation | `booking_created` | active |
| `auto-02` | 24-hour reminder | `session_24h_before` | active |
| `auto-03` | Inactive customer reminder | `customer_inactive_30d` | paused |
| `auto-04` | Birthday message | `customer_birthday` | draft |

`messageTemplate` values (master plan `33`, rendered by `WhatsAppPreview` with `{{placeholders}}` the component interpolates from the selected session/customer — the stored string is the template, not a rendered instance):

```
auto-01  Booking confirmation
Your reservation is confirmed.

{{className}}
{{sessionDayLabel}}
{{sessionTime}}

We look forward to seeing you.

auto-02  24-hour reminder
Reminder: you have {{className}} tomorrow at {{sessionTime}}.
See you at {{studioName}}!

auto-03  Inactive customer reminder
Hi {{customerFirstName}}, we miss you at {{studioName}}!
It's been a while — come back for a free trial class this week.

auto-04  Birthday message
Happy birthday, {{customerFirstName}}! 🎉
Enjoy a free class on us this month.
```

### 3.6 `notifications.ts` — 10 `Notification` records

Anchored to `NOW_ANCHOR` (§1.4), not to wall-clock time, so the file stays pure. Offsets are fixed minutes-before-anchor, hand-picked to span the "last 3 hours" window; the 3 smallest offsets (most recent) are `read: false`.

| id | type | offset before `NOW_ANCHOR` | read |
|---|---|---|---|
| `ntf-01` | `booking_created` | 4 min | false |
| `ntf-02` | `waitlist_promoted` | 11 min | false |
| `ntf-03` | `booking_created` | 18 min | false |
| `ntf-04` | `session_full` | 27 min | true |
| `ntf-05` | `booking_cancelled` | 39 min | true |
| `ntf-06` | `membership_renewed` | 54 min | true |
| `ntf-07` | `booking_created` | 71 min | true |
| `ntf-08` | `session_full` | 96 min | true |
| `ntf-09` | `booking_cancelled` | 122 min | true |
| `ntf-10` | `booking_created` | 168 min | true |

`title`/`description` are one hand-written line per row (e.g. `ntf-01`: "New booking received" / "Functional Training, 06:00 AM"), following the master plan `42` examples. `createdAt = NOW_ANCHOR minus offset`.

### 3.7 `settings.ts` — `StudioSettings`

| Section | Field | Value |
|---|---|---|
| general | studioName / email / phone / address / timezone | copied from `organization.ts` |
| booking | cancellationWindowHours | 12 |
| booking | maxReservationsPerDay | 2 |
| booking | waitlistEnabled | true |
| booking | advanceBookingDays | 14 |
| notifications | whatsappConfirmations | true |
| notifications | emailConfirmations | false |
| notifications | reminderHoursBefore | 24 |
| branding | logo | `null` |
| branding | primaryColor | `#7869D4` (`docs/03` `--color-purple`) |
| branding | accentColor | `#F5D889` (`docs/03` `--color-yellow`) |

---

## 4. `customers.ts` — generator

148 records, `cus-0001..cus-0148`, processed in id order.

**Identity** (index `i` = 1..148):

```
id     = `cus-${pad4(i)}`
name   = `Customer ${pad2(i)}`                        // pad2: min 2 digits, natural beyond
email  = `customer${pad2(i)}@demo.180fitness.app`
phone  = `+57 300 000 ${pad4(i)}`
avatar = null
```

`pad2(148) → '148'`, `pad2(7) → '07'` — matches `docs/04` §2 examples exactly (`customer01@...`, `+57 300 000 0001`).

**Status** (132 active / 10 paused / 6 inactive): for every customer compute `score = createStream(SEED, 'customer-status', id)()`. Sort all 148 ids by `score` ascending. First 132 in that order → `active`, next 10 → `paused`, last 6 → `inactive`. (Sorting by an id-keyed score, not by id itself, spreads the non-active customers across the id range instead of clustering them at the end — more realistic in a table sorted by join date or name.)

**Membership** (Basic 68 / Unlimited 50 / Premium 21 / Day Pass 9 — `round(148 × pct)`, sums exactly to 148): same technique, independent family `customer-membership`, independent sort, first 68 → `plan-basic`, next 50 → `plan-unlimited`, next 21 → `plan-premium`, last 9 → `plan-day-pass`.

**`joinedAt`**: reserve the 8 customers with the lowest `createStream(SEED, 'customer-joined', id)()` score for "joined this month." Each gets a day drawn uniformly (via a second draw on the same stream) between the 1st of `demoToday`'s calendar month and `demoToday` itself. The remaining 140 get a day drawn uniformly across the 36 months before the current month's start — i.e. an offset in `[1, daysBetween(monthStart(demoToday) - 36 months, monthStart(demoToday))]` days, subtracted from `monthStart(demoToday)`. This is what feeds the dashboard's "+8 this month" KPI (`selectNewThisMonth`).

---

## 5. `schedule.ts` — generator

### 5.1 Slot templates (fixed, identical every week in the window)

| Day type | Slots |
|---|---|
| Weekday (Mon-Fri) | 06:00, 07:30, 09:00, 12:15, 17:30, 19:00 |
| Weekend (Sat-Sun) | 08:00, 09:30, 11:00, 17:00 |

### 5.2 Weekly class-type template

Peaks (06:00, 17:30, 19:00 weekday) are Functional Training / Cycling only, per master plan requirement. Non-peak weekday slots alternate two class types by weekday parity (Mon/Wed/Fri vs Tue/Thu) so each keeps one modulation category (§6.1). Weekend gets its own, lighter mix.

| Slot | Mon / Wed / Fri | Tue / Thu | Room | Modulation |
|---|---|---|---|---|
| 06:00 | Functional Training | Functional Training | Studio A | peak ×1.08 |
| 07:30 | Yoga | Pilates | Mat Room | none |
| 09:00 | Strength | HIIT | Studio A / Studio B | none |
| 12:15 | Boxing | Mobility | Studio A / Mat Room | midday ×0.82 |
| 17:30 | Cycling | Cycling | Cycle Room | peak ×1.08 |
| 19:00 | Functional Training | Functional Training | Studio A | peak ×1.08 |

| Weekend slot | Class type | Room | Modulation |
|---|---|---|---|
| 08:00 | Cycling | Cycle Room | weekend morning ×1.05 |
| 09:30 | Functional Training | Studio A | weekend morning ×1.05 |
| 11:00 | Yoga | Mat Room | weekend morning ×1.05 |
| 17:00 | Boxing | Studio A | weekend evening ×0.85 |

Room is a fixed per-class-type assignment (Cycling → Cycle Room, Yoga/Pilates/Mobility → Mat Room, everything else → Studio A, except the Tue/Thu 09:00 slot which uses Studio B so the two Studio-A classes that day, 06:00 and 19:00 Functional, aren't the only entries in the room log). `session.capacity = classType.defaultCapacity` always — no per-session override in this demo.

Instance counts over the 14-day window (10 weekdays: 6 Mon/Wed/Fri-type + 4 Tue/Thu-type; 4 weekend days): Functional Training 24, Cycling 14, Yoga 10, Boxing 10, Strength 6, Mobility 4, HIIT 4, Pilates 4 — 76 sessions total.

### 5.3 Instructor assignment

`ELIGIBLE_INSTRUCTORS[classTypeId]` = the two instructor ids from §3.3 (primary + secondary). For a session at day-offset `d` (0-indexed position within the 14-day window) on slot `s` (0-indexed position within that day's slot list):

```
index = (d + s) % ELIGIBLE_INSTRUCTORS[classTypeId].length   // length is always 2
instructorId = ELIGIBLE_INSTRUCTORS[classTypeId][index]
```

No PRNG needed — purely positional, so it is trivially deterministic and, because the two Functional slots on the same day (06:00 at `s=0`, 19:00 at `s=5`) differ in `s` by an odd number, they never resolve to the same instructor twice in a row on the same day. No instructor is ever double-booked: two sessions share a `(date, time)` only if they're the same slot, and a slot holds exactly one class type/session.

### 5.4 Session status and the one cancellation

`date < demoToday` → `completed`. `date >= demoToday` → `scheduled`. Exception: pick one session in `[demoToday - 7, demoToday - 1]` via

```
picks = allSessionsInPastWeek        // chronological order, stable
n = floor(createStream(SEED, 'schedule-cancel', 'pick')() * picks.length)
picks[n].status = 'cancelled'
```

That session is excluded from booking generation entirely (§6.3) and from every occupancy calculation — a cancelled class has no demand signal to model.

### 5.5 Ids

`ses-0001..ses-0076`, assigned in chronological order (date, then slot index) across the full window — stable regardless of which day `demoToday` lands on.

---

## 6. `bookings.ts` — generator

One `Booking` row per occupied spot (ADR-007), plus cancelled and waitlist rows layered on top (ADR-008: they never occupy a spot). Only `active`-status customers (132) are ever selected as demand for this 14-day window — `paused` and `inactive` customers are exactly the ones with no recent activity, which is what the status means.

### 6.1 Target occupancy and modulation

| Class type | Base target |
|---|---|
| Functional Training | 0.87 |
| Cycling | 0.94 |
| Yoga | 0.67 |
| Pilates | 0.72 |
| HIIT | 0.83 |
| Strength | 0.78 |
| Mobility | 0.62 |
| Boxing | 0.75 |

Slot modulation multiplies the base target (§5.2 "Modulation" column): peak ×1.08, midday ×0.82, weekend morning ×1.05, weekend evening ×0.85, unlisted (plain weekday morning) ×1.0. Result is clamped to `[0.35, 1.0]`.

### 6.2 Per-session booked count

```
target = clamp(baseTarget[classTypeId] * slotModulation, 0.35, 1.0)
raw    = round(session.capacity * target)
jitter = pick([-1, 0, 1], createStream(SEED, 'booking-jitter', session.id)())   // uniform thirds
booked = clamp(raw + jitter, 0, session.capacity)
```

`booked` splits 88% `confirmed` / 12% `pending` (per spot, via `createStream(SEED, 'booking-status', session.id + ':' + spotIndex)()`).

### 6.3 Customer selection (respects the daily cap)

Sessions are processed in chronological order (`date`, then slot index) so the per-customer daily counter is well-defined. Skip the one `cancelled` session (§5.4).

For each session: build the candidate pool = all 132 active customers, score each with `createStream(SEED, 'booking-pick', session.id + ':' + customerId)()`, sort ascending. Walk the sorted list, taking a customer if and only if:

1. they do not already hold a non-cancelled booking for this session (never true on a fresh walk, relevant once cancellations/waitlist reuse the same session), and
2. their running count of bookings dated `session.date` (across every session already processed that day) is `< settings.booking.maxReservationsPerDay` (2).

Stop once `booked` customers are accepted. Each accepted customer becomes one `Booking`: `status` from §6.2, `customerId`, `sessionId`, a fresh sequential `id`.

### 6.4 Source

45% website / 30% whatsapp / 10% instagram / 15% reception, drawn per booking via `createStream(SEED, 'booking-source', booking-id-so-far)()` against the cumulative distribution in that order.

### 6.5 `createdAt`

```
daysUntilSession = max(0, sessionDate - demoToday)         // 0 for today/past sessions
minDays = max(1, daysUntilSession)                          // must still land on/before demoToday
maxDays = 14
n = minDays + floor(createStream(SEED,'booking-created', booking.id)() * (maxDays - minDays + 1))
timeOfDay = 7 + floor(createStream(SEED,'booking-created', booking.id + ':t')() * 14)   // 07:00-21:00
createdAt = (sessionDate - n days) at timeOfDay:MM
if createdAt > NOW_ANCHOR: createdAt = NOW_ANCHOR - 5min     // edge clamp, rare
```

### 6.6 `checkedInAt`

Only for `completed` sessions (`date < demoToday`) and `confirmed` bookings. 8% no-show slice keeps `checkedInAt = null`; the rest get `checkedInAt = sessionDate at session.startTime`.

```
isNoShow = createStream(SEED, 'no-show', booking.id)() < 0.08
checkedInAt = (session.status === 'completed' && booking.status === 'confirmed' && !isNoShow)
  ? `${session.date}T${session.startTime}...`
  : null
```

`pending` and `waitlist` bookings never get `checkedInAt` (matches `docs/04` §7 invariant 4).

### 6.7 Cancelled bookings (~6% of taken spots, additional rows)

`round(totalTakenSpots * 0.06)` extra `Booking` rows with `status = 'cancelled'`. For each: pick a session (weighted by its own taken-spot count, via `createStream(SEED,'cancelled-booking', 'session:'+n)`), then pick a customer from the active pool who does **not** already hold a non-cancelled booking for that session (`createStream(SEED,'cancelled-booking','customer:'+n)`, filtered, first eligible by score). `source` and `createdAt` follow §6.4/§6.5 using the same booking id. These rows do not count against `booked` or the daily cap — a cancelled reservation never held the spot by the time the dataset is read.

### 6.8 Waitlist (1-4 per full session)

A session is full when `booked === capacity` (post-jitter, §6.2). For each full session: `count = 1 + floor(createStream(SEED,'waitlist', session.id)() * 4)` (range 1-4). Select `count` active customers not already holding a non-cancelled booking for that session, same scoring/eligibility mechanism as §6.3, respecting the daily cap. Each becomes a `Booking` with `status = 'waitlist'`, `source`/`createdAt` per §6.4/§6.5.

### 6.9 Ids

`bkg-00001..bkg-NNNNN` in generation order: taken-spot bookings first (session-chronological), then cancelled, then waitlist. Order is fixed and reproducible, not just "some order" — required for byte-identical output.

---

## 7. Worked check (why the targets in §6.1 land in range)

Using §5.2's instance counts and §6.1's targets/modulation, pre-jitter expected totals:

| Class type | Sessions | Capacity total | Booked total (≈) | Occupancy |
|---|---|---|---|---|
| Functional Training | 24 | 360 | 336 | 0.93 |
| Cycling | 14 | 280 | 280 | 1.00 |
| Yoga | 10 | 180 | 124 | 0.69 |
| Boxing | 10 | 160 | 100 | 0.63 |
| Strength | 6 | 90 | 72 | 0.80 |
| HIIT | 4 | 80 | 68 | 0.85 |
| Mobility | 4 | 72 | 36 | 0.50 |
| Pilates | 4 | 48 | 36 | 0.75 |
| **Total** | **76** | **1270** | **1052** | **0.828** |

0.828 sits inside the required 0.80-0.87 band, Functional Training (336 bookings) is the single highest by demand with Cycling (280) second — satisfying "Functional Training among the top two." Cycling landing at 1.00 pre-jitter is exactly what produces the "at least 4 full sessions in the next 3 days" outcome (every Cycling session is at or within 1 seat of full); Functional Training's 0.93 and HIIT's 0.85 land in `almost_full` (ADR-008 threshold `>= 0.85` and not full); Mobility's 0.50 and Boxing's 0.63 are comfortably `available`. This table is a design check, not a substitute for the runtime assertion in §8 — if an implementation detail (rounding mode, jitter distribution) pulls the actual generated aggregate outside `[0.80, 0.87]`, fix it by adjusting jitter bias or a template cell and re-run the assertion; do not relax the assertion.

---

## 8. Required assertions (`buildDemoDataset` throws if any fail — fail fast, ADR-005 spirit)

From master plan `10`, each restated as a concrete, checkable condition:

| # | Assertion |
|---|---|
| 1 | `sessions.filter(s => s.status !== 'cancelled')` in `[demoToday, demoToday+2]` contains ≥ 4 sessions with `occupancyState === 'full'` |
| 2 | ≥ 6 sessions in the whole window have `occupancyState === 'almost_full'` |
| 3 | ≥ 1 session has `occupancyState === 'available'` (in practice: dozens do) |
| 4 | all four `BookingStatus` values appear at least once (`confirmed`, `pending`, `cancelled`, `waitlist`) |
| 5 | all four `BookingSource` values appear at least once |
| 6 | Functional Training is in the top 2 class types by total booking count |
| 7 | weekday average sessions/day (6) ≠ weekend average sessions/day (4), and weekday total bookings/session ≠ weekend total bookings/session (they differ by construction, §5.2/§6.1) |
| 8 | `sessions.filter(s => s.date === demoToday).length === 6` whenever `demoToday` falls Mon-Fri (always true by §5.1; the KPI only claims 6 on a weekday) |
| 9 | overall occupancy (confirmed+pending / capacity, excluding the cancelled session) is in `[0.80, 0.87]` |

These run once inside `buildDemoDataset` (throw with a descriptive message on failure) and are duplicated as unit tests over a fixed sample `demoToday` (Phase 2B, per `docs/10`).

---

## 9. Entity invariants (`docs/04-DOMAIN-MODEL.md` §7 — unit-tested against the generated dataset)

1. Every `Booking.customerId` resolves to a `Customer`; every `Booking.sessionId` resolves to a `ClassSession`.
2. `booked <= capacity` for every session (booked = confirmed + pending, ADR-008).
3. A customer has at most one non-cancelled booking per session.
4. `checkedInAt` is non-null only for bookings whose session is `completed` and whose status is `confirmed`.
5. Waitlist bookings exist only on sessions where `available <= 0`.
6. No customer exceeds `settings.booking.maxReservationsPerDay` (2) non-cancelled-or-waitlist bookings on any single date.

Invariant 6 is this document's addition to the `docs/04` list (the max-per-day rule is a generation constraint, not stated as a numbered invariant there, but it is asserted the same way).

---

## 10. Module layout

```
src/data/
  seed.ts            orchestrator — the only exported buildDemoDataset(demoToday)
  organization.ts    hand-authored (§3.1)
  classes.ts         hand-authored (§3.2)
  instructors.ts      hand-authored (§3.3)
  memberships.ts     hand-authored (§3.4)
  automations.ts     hand-authored (§3.5)
  notifications.ts   hand-authored (§3.6)
  settings.ts        hand-authored (§3.7)
  customers.ts       generator (§4)
  schedule.ts        generator (§5) — exports sessions, keyed by classes.ts + instructors.ts
  bookings.ts        generator (§6) — depends on customers.ts + schedule.ts output
```

`seed.ts` shape:

```ts
export interface DemoDataset {
  organization: Organization;
  classTypes: ClassType[];
  instructors: Instructor[];
  membershipPlans: MembershipPlan[];
  customers: Customer[];
  sessions: ClassSession[];
  bookings: Booking[];
  automations: Automation[];
  notifications: Notification[];
  settings: StudioSettings;
}

export function buildDemoDataset(demoToday: ISODate): DemoDataset {
  const NOW_ANCHOR = `${demoToday}T09:00:00.000-05:00`;
  const customers = buildCustomers(SEED);
  const sessions = buildSchedule(SEED, demoToday);
  const bookings = buildBookings(SEED, demoToday, NOW_ANCHOR, customers, sessions);
  const dataset = { organization, classTypes, instructors, membershipPlans,
    customers, sessions, bookings, automations, notifications: buildNotifications(NOW_ANCHOR),
    settings };
  assertNarrative(dataset, demoToday);   // §8
  return dataset;
}
```

**Import boundary** (`docs/02-ARCHITECTURE.md` §5, ADR-009): `src/data/**` is reachable only through `src/services/repositories/**`. No store, hook, selector or component ever imports from `src/data` directly — grep for `from '@/data` (or the relative equivalent) outside `src/services/repositories` is a review failure at every phase from 2C onward.

---

## 11. How to replace this with a real backend

The repositories in `src/services/repositories/**` are the only seam (ADR-009). `loadDemoDataset()` today calls `buildDemoDataset(demoToday)` synchronously (wrapped in the repositories' simulated latency); a future `SupabaseBookingRepository` (etc.) implements the same repository interface (`list()`, `create()`, `cancel()`) against real tables shaped like `src/domain/types/entities.ts` — which is exactly why ADR-006 keeps volatile counters off the entities. Swapping the seam means: implement the Supabase repositories, flip `createRepositories()`'s selection the same way `createAuthProvider()` already branches on env vars (ADR-010), and delete `src/data/**`. No store, selector, hook or component changes, because none of them ever imported `src/data` directly (§10).

---

# Amendments (Opus, after the Codex architecture review)

These override anything above that disagrees with them. Each was reproduced by Codex against the spec as originally written.

## A1 — The narrative outcomes must be guaranteed, not hoped for (Codex H1)

Reproducing the specified PRNG yields **3** full sessions in the next three days for a Thursday anchor (and 3, 3, 2, 3 for Thursday through Sunday). The spec asserts at least 4, so `buildDemoDataset` would throw on most days of the week.

The generator therefore runs a deterministic **narrative pass** after the statistical pass, before any assertion:

1. Rank the sessions in `[demoToday, demoToday + 2]` by generated occupancy, descending.
2. Walk that ranking and top up sessions to exactly `capacity` until at least **4** are full. A top-up adds ordinary `confirmed` bookings drawn from the same customer stream, so the ledger stays the single source of truth.
3. Continue down the ranking until at least **6** sessions across the whole window sit in `almost_full` (occupancy >= 0.85, not full).
4. Re-check the global occupancy band afterwards. If the top-ups push overall occupancy above 0.87, remove the same number of bookings from the lowest-demand sessions outside the next three days, lowest first, until the band holds.

The pass is pure and ordered, so determinism is preserved.

**Testing:** the invariant suite runs `buildDemoDataset` for seven anchors, one per weekday (for example 2026-09-14 through 2026-09-20), and asserts every narrative outcome for each. A single-anchor test is not acceptable.

## A2 — Complete instructor eligibility, and derived status (Codex M9)

Section 3.3 promised two eligible instructors per class type but supplied one for Cycling, Yoga, Pilates and Boxing. The complete table is:

| Class type | Eligible instructors |
|---|---|
| Functional Training | ins-01, ins-05 |
| Strength | ins-05, ins-01 |
| Cycling | ins-02, ins-06 |
| HIIT | ins-02, ins-06 |
| Yoga | ins-03, ins-04 |
| Mobility | ins-03, ins-04 |
| Pilates | ins-04, ins-03 |
| Boxing | ins-06, ins-02 |

`Instructor.status` is **not** hand-authored. It is derived at seed time from the schedule and `demoNow`:

- `in_class` when the instructor has a session whose interval contains `demoNow`;
- `off_today` when the instructor has no session dated `demoToday`;
- `available` otherwise.

The seed must not assign a session today to an instructor it then labels `off_today`.

## A3 — Public customers get a default plan (Codex M2)

`PUBLIC_DEFAULT_PLAN_ID = 'plan-day-pass'`. A customer created through the public booking flow is `status: 'active'`, `membershipId: PUBLIC_DEFAULT_PLAN_ID`, `joinedAt: demoToday`, `avatar: null`. Identity is resolved by lowercased, trimmed email: if a customer with that email already exists, it is reused and no new record is created.

## A4 — Every booking carries `cancelledAt` (Codex M5)

Seeded cancelled bookings receive a `cancelledAt` between `createdAt` and the earlier of the session start and `NOW_ANCHOR`. Non-cancelled bookings carry `null`.

## A5 — One clock (Codex M1)

`NOW_ANCHOR` is exported from the dataset as `demoNow` and stored in `useDemoRuntimeStore`. Every relative label ("2 minutes ago"), every "is this session in the past" decision, and FullCalendar's `now` all read that value. Nothing in the running application calls `new Date()` for demo-relative reasoning.
