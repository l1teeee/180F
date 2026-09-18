// Generator - docs/05-MOCK-DATA-STRATEGY.md section 6, amendment A1 (Codex H1) and amendment
// A4 (Codex M5). One booking row per occupied spot (ADR-007), plus cancelled and waitlist rows
// layered on top (they never occupy a spot, ADR-008), then a deterministic narrative pass
// (amendment A1) that guarantees the section 8 outcomes instead of hoping the statistical pass
// lands on them. Ids are assigned in generation order: taken-spot bookings first
// (session-chronological), then cancelled, then waitlist, then narrative top-ups (section 6.9
// extended - the pass runs after every other phase, so it only ever appends to the sequence).
import type { Booking, BookingSource, BookingStatus, ClassSession, Customer, ISODate, ISODateTime } from '@/domain/types';
import { addDaysISO, buildISODateTime, daysBetweenISO, subtractMinutesFromISODateTime } from '@/lib/dates';
import { createStream } from '@/lib/random';
import { indexBookingsBySession, selectSessionOccupancy } from '@/domain/selectors';
import { getSlotModulation } from './schedule';
import { settings } from './settings';

// Section 6.1 base target occupancy, keyed by classTypeId.
const BASE_TARGET_OCCUPANCY: Record<string, number> = {
  'ct-functional-training': 0.87,
  'ct-cycling': 0.94,
  'ct-yoga': 0.67,
  'ct-pilates': 0.72,
  'ct-hiit': 0.83,
  'ct-strength': 0.78,
  'ct-mobility': 0.62,
  'ct-boxing': 0.75,
};

const CANCELLED_BOOKING_RATE = 0.06;
const NO_SHOW_RATE = 0.08;
const CONFIRMED_SHARE = 0.88;

// Narrative pass targets (amendment A1).
const MIN_FULL_IN_HOT_WINDOW = 4;
const MIN_ALMOST_FULL_IN_WINDOW = 6;
const HOT_WINDOW_DAYS = 2; // [demoToday, demoToday + 2]
const MAX_OVERALL_OCCUPANCY = 0.87;

// Mutable indexes threaded through all generation phases below - they exist because
// later phases must know what earlier phases already booked (section 6.7/6.8 eligibility
// and the section 6.3 per-customer daily cap span all of taken-spot, waitlist and narrative
// phases).
interface GenerationState {
  sessionActiveCustomers: Map<string, Set<string>>; // sessionId -> customers with a non-cancelled booking there
  dailyCount: Map<string, number>; // key is customerId + pipe + date -> non-cancelled/waitlist bookings that day
  bookedCountBySession: Map<string, number>; // sessionId -> confirmed+pending count (section 6.2)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Scores every candidate with its own (family, keyPrefix + customerId) stream and
// returns ids sorted ascending - the score-then-sort mechanism sections 6.3/6.7/6.8 share.
function rankActiveCustomers(activeCustomers: Customer[], seed: number, family: string, keyPrefix: string): string[] {
  return activeCustomers
    .map((customer) => ({ id: customer.id, score: createStream(seed, family, `${keyPrefix}:${customer.id}`)() }))
    .sort((a, b) => a.score - b.score)
    .map((entry) => entry.id);
}

function markActive(state: GenerationState, sessionId: string, customerId: string): void {
  const existing = state.sessionActiveCustomers.get(sessionId);
  if (existing) {
    existing.add(customerId);
  } else {
    state.sessionActiveCustomers.set(sessionId, new Set([customerId]));
  }
}

// Walks a ranked candidate list and greedily accepts up to `count`, skipping anyone who
// already holds a non-cancelled booking for this session or is at the daily cap (section 6.3
// conditions 1-2, reused as-is by the waitlist and narrative phases).
function acceptCandidates(
  rankedIds: string[],
  count: number,
  session: Pick<ClassSession, 'id' | 'date'>,
  state: GenerationState,
  maxPerDay: number,
): string[] {
  const accepted: string[] = [];
  for (const customerId of rankedIds) {
    if (accepted.length >= count) break;
    if (state.sessionActiveCustomers.get(session.id)?.has(customerId)) continue;

    const dayKey = `${customerId}|${session.date}`;
    const dayCount = state.dailyCount.get(dayKey) ?? 0;
    if (dayCount >= maxPerDay) continue;

    accepted.push(customerId);
    state.dailyCount.set(dayKey, dayCount + 1);
    markActive(state, session.id, customerId);
  }
  return accepted;
}

// Inverse-CDF weighted pick over { id, weight } entries for a draw in [0, 1).
function pickWeighted(weighted: { id: string; weight: number }[], draw: number): string {
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return weighted[0].id;
  let cursor = draw * total;
  for (const entry of weighted) {
    cursor -= entry.weight;
    if (cursor < 0) return entry.id;
  }
  return weighted[weighted.length - 1].id;
}

// Section 6.2 asks for "uniform thirds" over [-1, 0, 1]. The narrative pass (amendment A1,
// below) is what now guarantees the section 8 outcomes, but this 25/35/40 bias is kept per
// that amendment's explicit allowance ("you may keep the jitter if the narrative pass still
// needs it") - it still shapes which sessions the pass has to touch, just no longer carries
// sole responsibility for the >= 4 full / >= 6 almost_full outcomes.
function pickJitter(draw: number): -1 | 0 | 1 {
  if (draw < 0.25) return -1;
  if (draw < 0.6) return 0;
  return 1;
}

// Section 6.2: target occupancy (base x slot modulation, clamped) -> rounded -> +/-1 jitter,
// clamped to capacity.
function computeBookedCount(session: ClassSession, seed: number): number {
  const baseTarget = BASE_TARGET_OCCUPANCY[session.classTypeId] ?? 0.7;
  const target = clamp(baseTarget * getSlotModulation(session), 0.35, 1.0);
  const raw = Math.round(session.capacity * target);
  const jitterDraw = createStream(seed, 'booking-jitter', session.id)();
  const jitter = pickJitter(jitterDraw);
  return clamp(raw + jitter, 0, session.capacity);
}

// Section 6.4: 45% website / 30% whatsapp / 10% instagram / 15% reception.
function pickBookingSource(seed: number, bookingId: string): BookingSource {
  const draw = createStream(seed, 'booking-source', bookingId)();
  if (draw < 0.45) return 'website';
  if (draw < 0.75) return 'whatsapp';
  if (draw < 0.85) return 'instagram';
  return 'reception';
}

// Section 6.5: createdAt is 1-14 days before the session (or before demoToday for a
// same-day/past session), at a 07:00-20:xx time of day, clamped to never exceed NOW_ANCHOR.
function computeCreatedAt(
  seed: number,
  demoToday: ISODate,
  nowAnchor: ISODateTime,
  session: ClassSession,
  bookingId: string,
): ISODateTime {
  const daysUntilSession = Math.max(0, daysBetweenISO(demoToday, session.date));
  const minDays = Math.max(1, daysUntilSession);
  const maxDays = 14;
  const dayDraw = createStream(seed, 'booking-created', bookingId)();
  const n = minDays + Math.floor(dayDraw * (maxDays - minDays + 1));

  // One stream, two sequential draws (hour, then minute) - same second-draw pattern
  // customers.ts uses, so the minute component is deterministic without a new family name.
  const timeStream = createStream(seed, 'booking-created', `${bookingId}:t`);
  const hour = 7 + Math.floor(timeStream() * 14); // 07:00 - 20:59
  const minute = Math.floor(timeStream() * 60);
  const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  const createdAt = buildISODateTime(addDaysISO(session.date, -n), time);
  return createdAt > nowAnchor ? subtractMinutesFromISODateTime(nowAnchor, 5) : createdAt;
}

// Section 6.6: only a confirmed booking on a completed session can be checked in; an 8%
// no-show slice keeps checkedInAt null even then.
function computeCheckedInAt(
  seed: number,
  session: ClassSession,
  status: BookingStatus,
  bookingId: string,
): ISODateTime | null {
  if (session.status !== 'completed' || status !== 'confirmed') return null;
  const isNoShow = createStream(seed, 'no-show', bookingId)() < NO_SHOW_RATE;
  return isNoShow ? null : buildISODateTime(session.date, session.startTime);
}

// Whole minutes from `referenceDate` (00:00) to a fixed-offset ISODateTime - a pure helper for
// amendment A4's "pick a point between createdAt and an upper bound" below. Not reused
// anywhere else, so it stays private to this generator rather than joining lib/dates.ts.
const ISO_DATETIME_PATTERN = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):\d{2}\.\d{3}-05:00$/;

function minutesSinceReference(dateTime: ISODateTime, referenceDate: ISODate): number {
  const match = ISO_DATETIME_PATTERN.exec(dateTime);
  if (!match) {
    throw new Error(`minutesSinceReference: unexpected ISODateTime format "${dateTime}"`);
  }
  const [, datePart, hh, mm] = match;
  const dayOffset = daysBetweenISO(referenceDate, datePart);
  return dayOffset * 1440 + Number(hh) * 60 + Number(mm);
}

// Amendment A4 (Codex M5): a seeded cancellation's cancelledAt is between createdAt and the
// earlier of the session start and NOW_ANCHOR. Deterministic, via its own stream so it never
// competes with any other draw keyed on the same booking id.
function computeCancelledAt(
  seed: number,
  nowAnchor: ISODateTime,
  session: ClassSession,
  createdAt: ISODateTime,
  bookingId: string,
): ISODateTime {
  const sessionStartsAt = buildISODateTime(session.date, session.startTime);
  const upperBound = sessionStartsAt < nowAnchor ? sessionStartsAt : nowAnchor;

  const referenceDate = createdAt.slice(0, 10);
  const createdAtMinutes = minutesSinceReference(createdAt, referenceDate);
  const upperBoundMinutes = minutesSinceReference(upperBound, referenceDate);
  const span = upperBoundMinutes - createdAtMinutes;
  if (span <= 0) return upperBound; // edge clamp: createdAt already at/after the bound

  const draw = createStream(seed, 'cancelled-at', bookingId)();
  const offsetMinutes = 1 + Math.floor(draw * span); // 1..span minutes after createdAt
  return subtractMinutesFromISODateTime(upperBound, span - offsetMinutes);
}

// Phase A (section 6.2/6.3): one booking per occupied spot, sessions in chronological order.
function buildTakenSpotBookings(
  seed: number,
  demoToday: ISODate,
  nowAnchor: ISODateTime,
  sessions: ClassSession[],
  activeCustomers: Customer[],
  state: GenerationState,
  maxPerDay: number,
  nextBookingId: () => string,
): Booking[] {
  const bookings: Booking[] = [];

  for (const session of sessions) {
    if (session.status === 'cancelled') continue;

    const booked = computeBookedCount(session, seed);
    state.bookedCountBySession.set(session.id, booked);
    if (booked === 0) continue;

    const ranked = rankActiveCustomers(activeCustomers, seed, 'booking-pick', session.id);
    const accepted = acceptCandidates(ranked, booked, session, state, maxPerDay);

    accepted.forEach((customerId, spotIndex) => {
      const statusDraw = createStream(seed, 'booking-status', `${session.id}:${spotIndex}`)();
      const status: BookingStatus = statusDraw < CONFIRMED_SHARE ? 'confirmed' : 'pending';
      const id = nextBookingId();
      bookings.push({
        id,
        customerId,
        sessionId: session.id,
        status,
        source: pickBookingSource(seed, id),
        createdAt: computeCreatedAt(seed, demoToday, nowAnchor, session, id),
        checkedInAt: computeCheckedInAt(seed, session, status, id),
        cancelledAt: null,
      });
    });
  }

  return bookings;
}

// Phase B (section 6.7, amendment A4): ~6% of taken spots get an extra cancelled row on a
// different, demand-weighted session/customer pair. These never touch bookedCountBySession or
// dailyCount.
function buildCancelledBookings(
  seed: number,
  demoToday: ISODate,
  nowAnchor: ISODateTime,
  sessions: ClassSession[],
  activeCustomers: Customer[],
  state: GenerationState,
  nextBookingId: () => string,
): Booking[] {
  const sessionsById = new Map(sessions.map((session) => [session.id, session]));
  const weighted = sessions
    .map((session) => ({ id: session.id, weight: state.bookedCountBySession.get(session.id) ?? 0 }))
    .filter((entry) => entry.weight > 0);
  const totalTakenSpots = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  const count = Math.round(totalTakenSpots * CANCELLED_BOOKING_RATE);

  const bookings: Booking[] = [];
  for (let n = 0; n < count; n++) {
    const sessionDraw = createStream(seed, 'cancelled-booking', `session:${n}`)();
    const session = sessionsById.get(pickWeighted(weighted, sessionDraw));
    if (!session) continue;

    const eligible = activeCustomers.filter(
      (customer) => !state.sessionActiveCustomers.get(session.id)?.has(customer.id),
    );
    if (eligible.length === 0) continue;
    const customerId = rankActiveCustomers(eligible, seed, 'cancelled-booking', `customer:${n}`)[0];

    const id = nextBookingId();
    const createdAt = computeCreatedAt(seed, demoToday, nowAnchor, session, id);
    bookings.push({
      id,
      customerId,
      sessionId: session.id,
      status: 'cancelled',
      source: pickBookingSource(seed, id),
      createdAt,
      checkedInAt: null, // cancelled bookings are never checked in
      cancelledAt: computeCancelledAt(seed, nowAnchor, session, createdAt, id),
    });
  }
  return bookings;
}

// Phase C (section 6.8): every full session (booked === capacity, post-jitter) gets 1-4
// waitlist rows, subject to the same eligibility and daily-cap rules as phase A.
function buildWaitlistBookings(
  seed: number,
  demoToday: ISODate,
  nowAnchor: ISODateTime,
  sessions: ClassSession[],
  activeCustomers: Customer[],
  state: GenerationState,
  maxPerDay: number,
  nextBookingId: () => string,
): Booking[] {
  const bookings: Booking[] = [];

  for (const session of sessions) {
    if (session.status === 'cancelled') continue;
    const booked = state.bookedCountBySession.get(session.id) ?? 0;
    if (booked !== session.capacity) continue;

    const countDraw = createStream(seed, 'waitlist', session.id)();
    const count = 1 + Math.floor(countDraw * 4);

    const ranked = rankActiveCustomers(activeCustomers, seed, 'waitlist', session.id);
    const accepted = acceptCandidates(ranked, count, session, state, maxPerDay);

    for (const customerId of accepted) {
      const id = nextBookingId();
      bookings.push({
        id,
        customerId,
        sessionId: session.id,
        status: 'waitlist',
        source: pickBookingSource(seed, id),
        createdAt: computeCreatedAt(seed, demoToday, nowAnchor, session, id),
        checkedInAt: null, // waitlist bookings never get checked in (docs/04 section 7 invariant 4)
        cancelledAt: null,
      });
    }
  }

  return bookings;
}

// Phase D (amendment A1, Codex H1): a deterministic narrative pass. The statistical pass
// above reproduces 3 (not the required >= 4) full sessions in the next 3 days on most weekday
// anchors - fixed here structurally, not by re-tuning the jitter further. Runs against a live
// working set (`bookings` + `bySession`, kept in sync by addBooking/removeBooking below) so
// every occupancy read always reflects every earlier top-up or trim in the same pass.
function addBooking(bookings: Booking[], bySession: Map<string, Booking[]>, booking: Booking): void {
  bookings.push(booking);
  const list = bySession.get(booking.sessionId);
  if (list) {
    list.push(booking);
  } else {
    bySession.set(booking.sessionId, [booking]);
  }
}

function removeBooking(bookings: Booking[], bySession: Map<string, Booking[]>, booking: Booking): void {
  const index = bookings.indexOf(booking);
  if (index !== -1) bookings.splice(index, 1);
  const list = bySession.get(booking.sessionId);
  if (!list) return;
  const listIndex = list.indexOf(booking);
  if (listIndex !== -1) list.splice(listIndex, 1);
}

function occupancyStateOf(session: ClassSession, bySession: Map<string, Booking[]>) {
  return selectSessionOccupancy(session, bySession.get(session.id) ?? []);
}

function runNarrativePass(
  seed: number,
  demoToday: ISODate,
  nowAnchor: ISODateTime,
  sessions: ClassSession[],
  activeCustomers: Customer[],
  bookings: Booking[],
  bySession: Map<string, Booking[]>,
  state: GenerationState,
  maxPerDay: number,
  nextBookingId: () => string,
): void {
  const activeSessions = sessions.filter((session) => session.status !== 'cancelled');
  const windowEnd = addDaysISO(demoToday, HOT_WINDOW_DAYS);
  const hotSessions = activeSessions.filter((session) => session.date >= demoToday && session.date <= windowEnd);

  // Step 1: rank the hot-window sessions by their statistical-pass occupancy, descending -
  // one fixed ranking, walked (not re-sorted) by steps 2 and 3.
  const ranked = [...hotSessions].sort((a, b) => {
    const rateA = occupancyStateOf(a, bySession).occupancyRate;
    const rateB = occupancyStateOf(b, bySession).occupancyRate;
    return rateB - rateA;
  });

  // Adds ordinary confirmed bookings for `session`, drawn from the same customer stream
  // section 6.3 already ranked for it (acceptCandidates skips whoever that stream already
  // placed there, so this only ever reaches further down the same ranking), one at a time so
  // the caller can stop exactly when the occupancy state it wants is reached.
  function topUpByOne(session: ClassSession): boolean {
    const rankedCustomers = rankActiveCustomers(activeCustomers, seed, 'booking-pick', session.id);
    const [customerId] = acceptCandidates(rankedCustomers, 1, session, state, maxPerDay);
    if (!customerId) return false; // pool exhausted; assertNarrative surfaces any resulting shortfall
    const id = nextBookingId();
    addBooking(bookings, bySession, {
      id,
      customerId,
      sessionId: session.id,
      status: 'confirmed',
      source: pickBookingSource(seed, id),
      createdAt: computeCreatedAt(seed, demoToday, nowAnchor, session, id),
      checkedInAt: null, // sessions in the hot window are never 'completed' (date >= demoToday)
      cancelledAt: null,
    });
    return true;
  }

  function topUpUntilFull(session: ClassSession): void {
    while (occupancyStateOf(session, bySession).occupancyState !== 'full') {
      if (!topUpByOne(session)) return;
    }
  }

  function topUpUntilAlmostFull(session: ClassSession): void {
    // A no-op when already almost_full or full - both cases already count toward, or have
    // graduated past, the count step 3 is trying to grow.
    while (occupancyStateOf(session, bySession).occupancyState === 'available') {
      if (!topUpByOne(session)) return;
    }
  }

  const countFull = (list: ClassSession[]) =>
    list.filter((session) => occupancyStateOf(session, bySession).occupancyState === 'full').length;
  const countAlmostFull = (list: ClassSession[]) =>
    list.filter((session) => occupancyStateOf(session, bySession).occupancyState === 'almost_full').length;

  // Step 2: top up, walking the ranking, until >= 4 hot-window sessions are full.
  let cursor = 0;
  while (cursor < ranked.length && countFull(ranked) < MIN_FULL_IN_HOT_WINDOW) {
    topUpUntilFull(ranked[cursor]);
    cursor += 1;
  }

  // Step 3: continue down the SAME ranking until >= 6 sessions ACROSS THE WHOLE WINDOW are
  // almost_full - sessions elsewhere in the window that the statistical pass already put in
  // that band count toward this total without being touched again.
  while (cursor < ranked.length && countAlmostFull(activeSessions) < MIN_ALMOST_FULL_IN_WINDOW) {
    topUpUntilAlmostFull(ranked[cursor]);
    cursor += 1;
  }

  // Step 4: re-check the global band. If the top-ups pushed it above 0.87, trim from the
  // lowest-occupancy sessions OUTSIDE the hot window, lowest first, until it holds again.
  function overallOccupancy(): number {
    let bookedSum = 0;
    let capacitySum = 0;
    for (const session of activeSessions) {
      bookedSum += occupancyStateOf(session, bySession).booked;
      capacitySum += session.capacity;
    }
    return capacitySum > 0 ? bookedSum / capacitySum : 0;
  }

  const coldSessions = activeSessions.filter((session) => session.date < demoToday || session.date > windowEnd);

  while (overallOccupancy() > MAX_OVERALL_OCCUPANCY) {
    const lowest = coldSessions
      .map((session) => ({ session, occupancy: occupancyStateOf(session, bySession) }))
      .filter((entry) => entry.occupancy.booked > 0)
      .sort((a, b) => a.occupancy.occupancyRate - b.occupancy.occupancyRate)[0];
    if (!lowest) break; // nothing left to trim; assertNarrative surfaces the band failure

    const removable = (bySession.get(lowest.session.id) ?? []).filter(
      (booking) => booking.status === 'confirmed' || booking.status === 'pending',
    );
    const toRemove = removable[removable.length - 1];
    if (!toRemove) break;
    removeBooking(bookings, bySession, toRemove);
  }
}

export function buildBookings(
  seed: number,
  demoToday: ISODate,
  nowAnchor: ISODateTime,
  customers: Customer[],
  sessions: ClassSession[],
): Booking[] {
  const activeCustomers = customers.filter((customer) => customer.status === 'active');
  const maxPerDay = settings.booking.maxReservationsPerDay;

  const state: GenerationState = {
    sessionActiveCustomers: new Map(),
    dailyCount: new Map(),
    bookedCountBySession: new Map(),
  };

  let bookingSequence = 0;
  const nextBookingId = () => `bkg-${String(++bookingSequence).padStart(5, '0')}`;

  const takenSpot = buildTakenSpotBookings(seed, demoToday, nowAnchor, sessions, activeCustomers, state, maxPerDay, nextBookingId);
  const cancelled = buildCancelledBookings(seed, demoToday, nowAnchor, sessions, activeCustomers, state, nextBookingId);
  const waitlist = buildWaitlistBookings(seed, demoToday, nowAnchor, sessions, activeCustomers, state, maxPerDay, nextBookingId);

  const bookings = [...takenSpot, ...cancelled, ...waitlist];
  const bySession = indexBookingsBySession(bookings);

  runNarrativePass(seed, demoToday, nowAnchor, sessions, activeCustomers, bookings, bySession, state, maxPerDay, nextBookingId);

  return bookings;
}
