// Hand-authored profiles - docs/05-MOCK-DATA-STRATEGY.md section 3.3, amendment A2 (Codex
// M9). `status` is deliberately NOT part of the hand-authored profile: amendment A2 requires
// it derived from the schedule and demoNow, so a hand-picked value can never again contradict
// the generated sessions (the original spec labelled ins-05 off_today while also scheduling
// it every weekday). Ratings are the literal table values, still not generated.
import type { ClassSession, Instructor, InstructorStatus, ISODate, ISODateTime } from '@/domain/types';
import { buildISODateTime } from '@/lib/dates';

type InstructorProfile = Omit<Instructor, 'status'>;

export const INSTRUCTOR_PROFILES: InstructorProfile[] = [
  {
    id: 'ins-01',
    name: 'Instructor 01',
    avatar: null,
    specialty: 'Functional Training',
    rating: 4.8,
    bio: 'Coaches functional strength and conditioning with a focus on clean movement patterns.',
  },
  {
    id: 'ins-02',
    name: 'Instructor 02',
    avatar: null,
    specialty: 'Cycling',
    rating: 4.6,
    bio: 'Leads high-energy cycling rides built around intervals, climbs and music.',
  },
  {
    id: 'ins-03',
    name: 'Instructor 03',
    avatar: null,
    specialty: 'Yoga',
    rating: 4.9,
    bio: 'Guides yoga practice that balances strength, breath and flexibility.',
  },
  {
    id: 'ins-04',
    name: 'Instructor 04',
    avatar: null,
    specialty: 'Pilates',
    rating: 4.5,
    bio: 'Teaches precise, low-impact Pilates work built around core control.',
  },
  {
    id: 'ins-05',
    name: 'Instructor 05',
    avatar: null,
    specialty: 'Strength',
    rating: 4.7,
    bio: 'Specialises in barbell strength training and progressive overload.',
  },
  {
    id: 'ins-06',
    name: 'Instructor 06',
    avatar: null,
    specialty: 'Boxing',
    rating: 4.9,
    bio: 'Brings boxing fundamentals to every level, from footwork to combinations.',
  },
];

// classTypeId -> the two instructor ids the schedule generator round-robins between
// (docs/05-MOCK-DATA-STRATEGY.md section 5.2/5.3). Complete eight-row table, amendment A2 -
// the original section 3.3 table supplied only one instructor for Cycling, Yoga, Pilates and
// Boxing.
export const ELIGIBLE_INSTRUCTORS: Record<string, [string, string]> = {
  'ct-functional-training': ['ins-01', 'ins-05'],
  'ct-strength': ['ins-05', 'ins-01'],
  'ct-cycling': ['ins-02', 'ins-06'],
  'ct-hiit': ['ins-02', 'ins-06'],
  'ct-yoga': ['ins-03', 'ins-04'],
  'ct-mobility': ['ins-03', 'ins-04'],
  'ct-pilates': ['ins-04', 'ins-03'],
  'ct-boxing': ['ins-06', 'ins-02'],
};

// Amendment A2: in_class when a (non-cancelled) session today contains demoNow; off_today
// when the instructor has no session dated demoToday at all; available otherwise. Deriving
// this from the actual schedule is what makes "never schedule a session today for an
// instructor labelled off_today" true by construction rather than a rule someone can forget.
function deriveInstructorStatus(
  instructorId: string,
  sessions: ClassSession[],
  demoToday: ISODate,
  demoNow: ISODateTime,
): InstructorStatus {
  const todaySessions = sessions.filter(
    (session) => session.instructorId === instructorId && session.date === demoToday && session.status !== 'cancelled',
  );

  const inClass = todaySessions.some((session) => {
    const startsAt = buildISODateTime(session.date, session.startTime);
    const endsAt = buildISODateTime(session.date, session.endTime);
    return demoNow >= startsAt && demoNow < endsAt;
  });
  if (inClass) return 'in_class';

  if (todaySessions.length === 0) return 'off_today';

  return 'available';
}

export function buildInstructors(sessions: ClassSession[], demoToday: ISODate, demoNow: ISODateTime): Instructor[] {
  return INSTRUCTOR_PROFILES.map((profile) => ({
    ...profile,
    status: deriveInstructorStatus(profile.id, sessions, demoToday, demoNow),
  }));
}
