// Anchored to NOW_ANCHOR, not wall-clock time, so this stays a pure function of its input
// (docs/05-MOCK-DATA-STRATEGY.md section 3.6). Offsets are fixed minutes-before-anchor; the
// three smallest (most recent) are unread.
import type { ISODateTime, Notification } from '@/domain/types';
import { subtractMinutesFromISODateTime } from '@/lib/dates';

interface NotificationSeed {
  id: string;
  type: Notification['type'];
  offsetMinutes: number;
  read: boolean;
  title: string;
  description: string;
}

const NOTIFICATION_SEEDS: NotificationSeed[] = [
  { id: 'ntf-01', type: 'booking_created', offsetMinutes: 4, read: false, title: 'New booking received', description: 'Functional Training, 06:00 AM' },
  { id: 'ntf-02', type: 'waitlist_promoted', offsetMinutes: 11, read: false, title: 'Waitlist spot opened up', description: 'Cycling, 05:30 PM — promoted from waitlist' },
  { id: 'ntf-03', type: 'booking_created', offsetMinutes: 18, read: false, title: 'New booking received', description: 'Yoga, 07:30 AM' },
  { id: 'ntf-04', type: 'session_full', offsetMinutes: 27, read: true, title: 'Class is full', description: 'HIIT, 09:00 AM has reached capacity' },
  { id: 'ntf-05', type: 'booking_cancelled', offsetMinutes: 39, read: true, title: 'Booking cancelled', description: 'Boxing, 12:15 PM' },
  { id: 'ntf-06', type: 'membership_renewed', offsetMinutes: 54, read: true, title: 'Membership renewed', description: 'Unlimited plan renewed for another month' },
  { id: 'ntf-07', type: 'booking_created', offsetMinutes: 71, read: true, title: 'New booking received', description: 'Strength, 09:00 AM' },
  { id: 'ntf-08', type: 'session_full', offsetMinutes: 96, read: true, title: 'Class is full', description: 'Functional Training, 07:00 PM has reached capacity' },
  { id: 'ntf-09', type: 'booking_cancelled', offsetMinutes: 122, read: true, title: 'Booking cancelled', description: 'Pilates, 07:30 AM' },
  { id: 'ntf-10', type: 'booking_created', offsetMinutes: 168, read: true, title: 'New booking received', description: 'Mobility, 12:15 PM' },
];

export function buildNotifications(nowAnchor: ISODateTime): Notification[] {
  return NOTIFICATION_SEEDS.map((seed) => ({
    id: seed.id,
    type: seed.type,
    title: seed.title,
    description: seed.description,
    createdAt: subtractMinutesFromISODateTime(nowAnchor, seed.offsetMinutes),
    read: seed.read,
  }));
}
