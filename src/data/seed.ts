// Orchestrator - docs/05-MOCK-DATA-STRATEGY.md section 10. buildDemoDataset(demoToday) is
// the sole entry point: given the same demoToday it returns byte-identical output on every
// call (section 1.1's seeded streams), which is what src/data/seed.test.ts proves.
import type { Booking, ClassSession, DemoDataset, ISODate, ISODateTime } from '@/domain/types';
import { addDaysISO, buildISODateTime, isWeekendISO } from '@/lib/dates';
import { indexBookingsBySession, selectSessionOccupancy } from '@/domain/selectors';
import { organization } from './organization';
import { classTypes } from './classes';
import { buildInstructors } from './instructors';
import { membershipPlans } from './memberships';
import { automations } from './automations';
import { buildNotifications } from './notifications';
import { settings } from './settings';
import { buildCustomers } from './customers';
import { buildSchedule } from './schedule';
import { buildBookings } from './bookings';

// SEED = 180180 (docs/05-MOCK-DATA-STRATEGY.md section 1.1), declared once, here, and
// threaded into every generator as a parameter - never re-declared or re-imported.
const SEED = 180180;

function assertInvariant(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`buildDemoDataset: narrative assertion failed - ${message}`);
  }
}

// docs/05-MOCK-DATA-STRATEGY.md section 8's nine assertions, numbered to match that table.
// Occupancy arithmetic goes through selectSessionOccupancy (docs/02-ARCHITECTURE.md section 5
// now permits src/data to import domain/selectors) so the generator's self-check and the
// application share one formula instead of a private copy that can drift (ADR-008).
function assertNarrative(dataset: DemoDataset, demoToday: ISODate): void {
  const { sessions, bookings } = dataset;
  const bookingsBySession = indexBookingsBySession(bookings);
  const occupancyBySession = new Map(
    sessions.map((session) => [session.id, selectSessionOccupancy(session, bookingsBySession.get(session.id) ?? [])]),
  );

  // 1
  const horizonEnd = addDaysISO(demoToday, 2);
  const fullInNext3Days = sessions.filter((session) => {
    if (session.status === 'cancelled') return false;
    if (session.date < demoToday || session.date > horizonEnd) return false;
    return occupancyBySession.get(session.id)!.occupancyState === 'full';
  });
  assertInvariant(
    fullInNext3Days.length >= 4,
    `expected >= 4 full sessions in the next 3 days, got ${fullInNext3Days.length}`,
  );

  // 2
  const almostFullCount = sessions.filter(
    (session) => session.status !== 'cancelled' && occupancyBySession.get(session.id)!.occupancyState === 'almost_full',
  ).length;
  assertInvariant(almostFullCount >= 6, `expected >= 6 almost_full sessions, got ${almostFullCount}`);

  // 3
  const availableCount = sessions.filter(
    (session) => session.status !== 'cancelled' && occupancyBySession.get(session.id)!.occupancyState === 'available',
  ).length;
  assertInvariant(availableCount >= 1, `expected >= 1 available session, got ${availableCount}`);

  // 4
  const statuses = new Set(bookings.map((booking) => booking.status));
  for (const status of ['confirmed', 'pending', 'cancelled', 'waitlist'] as const) {
    assertInvariant(statuses.has(status), `missing booking status: ${status}`);
  }

  // 5
  const sources = new Set(bookings.map((booking) => booking.source));
  for (const source of ['website', 'whatsapp', 'instagram', 'reception'] as const) {
    assertInvariant(sources.has(source), `missing booking source: ${source}`);
  }

  // 6
  const sessionById = new Map(sessions.map((session) => [session.id, session]));
  const bookingCountByClassType = new Map<string, number>();
  for (const booking of bookings) {
    const session = sessionById.get(booking.sessionId);
    if (!session) continue;
    bookingCountByClassType.set(
      session.classTypeId,
      (bookingCountByClassType.get(session.classTypeId) ?? 0) + 1,
    );
  }
  const rankedClassTypes = [...bookingCountByClassType.entries()].sort((a, b) => b[1] - a[1]);
  const top2ClassTypeIds = rankedClassTypes.slice(0, 2).map(([classTypeId]) => classTypeId);
  assertInvariant(
    top2ClassTypeIds.includes('ct-functional-training'),
    `expected ct-functional-training in the top 2 class types by booking count, ranking was ${JSON.stringify(rankedClassTypes)}`,
  );

  // 7
  const weekdaySessions = sessions.filter((session) => !isWeekendISO(session.date));
  const weekendSessions = sessions.filter((session) => isWeekendISO(session.date));
  const weekdayAvgSessionsPerDay = weekdaySessions.length / 10;
  const weekendAvgSessionsPerDay = weekendSessions.length / 4;
  assertInvariant(
    weekdayAvgSessionsPerDay !== weekendAvgSessionsPerDay,
    'expected weekday and weekend sessions/day to differ',
  );

  const sumBooked = (list: ClassSession[]) =>
    list.reduce((sum, session) => sum + (occupancyBySession.get(session.id)?.booked ?? 0), 0);
  const weekdayBookingsPerSession = sumBooked(weekdaySessions) / weekdaySessions.length;
  const weekendBookingsPerSession = sumBooked(weekendSessions) / weekendSessions.length;
  assertInvariant(
    weekdayBookingsPerSession !== weekendBookingsPerSession,
    'expected weekday and weekend bookings/session to differ',
  );

  // 8
  if (!isWeekendISO(demoToday)) {
    const todayCount = sessions.filter((session) => session.date === demoToday).length;
    assertInvariant(todayCount === 6, `expected 6 sessions today, got ${todayCount}`);
  }

  // 9
  let totalBooked = 0;
  let totalCapacity = 0;
  for (const session of sessions) {
    if (session.status === 'cancelled') continue;
    totalBooked += occupancyBySession.get(session.id)?.booked ?? 0;
    totalCapacity += session.capacity;
  }
  const overallOccupancy = totalCapacity > 0 ? totalBooked / totalCapacity : 0;
  assertInvariant(
    overallOccupancy >= 0.8 && overallOccupancy <= 0.87,
    `expected overall occupancy in [0.80, 0.87], got ${overallOccupancy.toFixed(4)}`,
  );

  // Amendment A2 (Codex M9): the seed must never schedule a session today for an instructor it
  // then labels off_today. Derivation already makes this true by construction (see
  // instructors.ts) - asserted here too so a future edit that reintroduces a hand-authored or
  // otherwise-drifted status fails loudly instead of shipping a contradiction.
  const todaySessionsByInstructor = new Map<string, ClassSession[]>();
  for (const session of sessions) {
    if (session.date !== demoToday || session.status === 'cancelled') continue;
    const list = todaySessionsByInstructor.get(session.instructorId);
    if (list) list.push(session);
    else todaySessionsByInstructor.set(session.instructorId, [session]);
  }
  for (const instructor of dataset.instructors) {
    if (instructor.status !== 'off_today') continue;
    const todaySessions = todaySessionsByInstructor.get(instructor.id) ?? [];
    assertInvariant(
      todaySessions.length === 0,
      `instructor "${instructor.id}" is labelled off_today but has ${todaySessions.length} session(s) today`,
    );
  }
}

export function buildDemoDataset(demoToday: ISODate): DemoDataset {
  const nowAnchor: ISODateTime = buildISODateTime(demoToday, '09:00');

  const customers = buildCustomers(SEED, demoToday);
  const sessions = buildSchedule(SEED, demoToday);
  const bookings: Booking[] = buildBookings(SEED, demoToday, nowAnchor, customers, sessions);
  const instructors = buildInstructors(sessions, demoToday, nowAnchor);
  const notifications = buildNotifications(nowAnchor);

  const dataset: DemoDataset = {
    organization,
    classTypes,
    instructors,
    membershipPlans,
    customers,
    sessions,
    bookings,
    automations,
    notifications,
    settings,
    demoToday,
    demoNow: nowAnchor,
  };

  assertNarrative(dataset, demoToday);
  return dataset;
}
