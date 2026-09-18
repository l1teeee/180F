// Generator - docs/05-MOCK-DATA-STRATEGY.md section 5. 14-day window (demoToday-7 ..
// demoToday+6), 76 sessions, ses-0001..ses-0076 assigned in chronological order.
import type { ClassSession, ISODate, TimeOfDay } from '@/domain/types';
import { addDaysISO, addMinutesToTimeOfDay, getWeekdayIndex, isWeekendISO } from '@/lib/dates';
import { createStream } from '@/lib/random';
import { classTypes } from './classes';
import { ELIGIBLE_INSTRUCTORS } from './instructors';

const PAST_DAYS = 7;
const WINDOW_DAYS = 14;

interface SlotTemplateRow {
  time: TimeOfDay;
  classTypeId: string;
  room: string;
}

// Section 5.2 "Mon / Wed / Fri" column.
const WEEKDAY_TEMPLATE_MWF: SlotTemplateRow[] = [
  { time: '06:00', classTypeId: 'ct-functional-training', room: 'Studio A' },
  { time: '07:30', classTypeId: 'ct-yoga', room: 'Mat Room' },
  { time: '09:00', classTypeId: 'ct-strength', room: 'Studio A' },
  { time: '12:15', classTypeId: 'ct-boxing', room: 'Studio A' },
  { time: '17:30', classTypeId: 'ct-cycling', room: 'Cycle Room' },
  { time: '19:00', classTypeId: 'ct-functional-training', room: 'Studio A' },
];

// Section 5.2 "Tue / Thu" column. The 09:00 slot uses Studio B so the two Studio-A
// Functional Training classes that day are not the room's only entries.
const WEEKDAY_TEMPLATE_TUTH: SlotTemplateRow[] = [
  { time: '06:00', classTypeId: 'ct-functional-training', room: 'Studio A' },
  { time: '07:30', classTypeId: 'ct-pilates', room: 'Mat Room' },
  { time: '09:00', classTypeId: 'ct-hiit', room: 'Studio B' },
  { time: '12:15', classTypeId: 'ct-mobility', room: 'Mat Room' },
  { time: '17:30', classTypeId: 'ct-cycling', room: 'Cycle Room' },
  { time: '19:00', classTypeId: 'ct-functional-training', room: 'Studio A' },
];

// Section 5.2 weekend table.
const WEEKEND_TEMPLATE: SlotTemplateRow[] = [
  { time: '08:00', classTypeId: 'ct-cycling', room: 'Cycle Room' },
  { time: '09:30', classTypeId: 'ct-functional-training', room: 'Studio A' },
  { time: '11:00', classTypeId: 'ct-yoga', room: 'Mat Room' },
  { time: '17:00', classTypeId: 'ct-boxing', room: 'Studio A' },
];

// Modulation depends only on (weekday-type, time), never on which class type occupies the
// slot - the section 5.2 "Modulation" column is per-slot, not per-class-type.
const WEEKDAY_MODULATION: Record<TimeOfDay, number> = {
  '06:00': 1.08, // peak
  '07:30': 1.0,
  '09:00': 1.0,
  '12:15': 0.82, // midday
  '17:30': 1.08, // peak
  '19:00': 1.08, // peak
};

const WEEKEND_MODULATION: Record<TimeOfDay, number> = {
  '08:00': 1.05, // weekend morning
  '09:30': 1.05, // weekend morning
  '11:00': 1.05, // weekend morning
  '17:00': 0.85, // weekend evening
};

// Exported so bookings.ts (section 6.1/6.2 target-occupancy math) can read the same
// per-slot multiplier without ClassSession itself carrying a "modulation" field it was
// never given (docs/04-DOMAIN-MODEL.md section 2 is the fixed entity contract).
export function getSlotModulation(session: Pick<ClassSession, 'date' | 'startTime'>): number {
  const table = isWeekendISO(session.date) ? WEEKEND_MODULATION : WEEKDAY_MODULATION;
  return table[session.startTime] ?? 1.0;
}

function templateForDate(date: ISODate): SlotTemplateRow[] {
  if (isWeekendISO(date)) return WEEKEND_TEMPLATE;
  const weekdayIndex = getWeekdayIndex(date);
  const isMonWedFri = weekdayIndex === 1 || weekdayIndex === 3 || weekdayIndex === 5;
  return isMonWedFri ? WEEKDAY_TEMPLATE_MWF : WEEKDAY_TEMPLATE_TUTH;
}

// Section 5.4: exactly one session in the past week becomes 'cancelled', chosen by a
// single seeded draw over that week's sessions in stable (chronological) order.
function withOneCancellation(seed: number, demoToday: ISODate, sessions: ClassSession[]): ClassSession[] {
  const pastWeekStart = addDaysISO(demoToday, -PAST_DAYS);
  const pastWeekEnd = addDaysISO(demoToday, -1);
  const pastWeekIds = sessions
    .filter((s) => s.date >= pastWeekStart && s.date <= pastWeekEnd)
    .map((s) => s.id);
  if (pastWeekIds.length === 0) return sessions;

  const draw = createStream(seed, 'schedule-cancel', 'pick')();
  const cancelledId = pastWeekIds[Math.floor(draw * pastWeekIds.length)];
  return sessions.map((s) => (s.id === cancelledId ? { ...s, status: 'cancelled' } : s));
}

export function buildSchedule(seed: number, demoToday: ISODate): ClassSession[] {
  const classTypeById = new Map(classTypes.map((ct) => [ct.id, ct]));
  const sessions: ClassSession[] = [];
  let sessionIndex = 0;

  for (let d = 0; d < WINDOW_DAYS; d++) {
    const date = addDaysISO(demoToday, d - PAST_DAYS);
    const template = templateForDate(date);

    template.forEach((slot, s) => {
      const classType = classTypeById.get(slot.classTypeId);
      if (!classType) {
        throw new Error(`buildSchedule: unknown classTypeId "${slot.classTypeId}"`);
      }
      const eligible = ELIGIBLE_INSTRUCTORS[slot.classTypeId];
      if (!eligible) {
        throw new Error(`buildSchedule: no eligible instructors for "${slot.classTypeId}"`);
      }

      sessionIndex += 1;
      sessions.push({
        id: `ses-${String(sessionIndex).padStart(4, '0')}`,
        classTypeId: slot.classTypeId,
        instructorId: eligible[(d + s) % eligible.length],
        date,
        startTime: slot.time,
        endTime: addMinutesToTimeOfDay(slot.time, classType.durationMinutes),
        capacity: classType.defaultCapacity,
        room: slot.room,
        status: date < demoToday ? 'completed' : 'scheduled',
      });
    });
  }

  return withOneCancellation(seed, demoToday, sessions);
}
