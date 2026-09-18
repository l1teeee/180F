// docs/08-STATE-MANAGEMENT.md section 4 / docs/11-TEST-PLAN.md section 3.
import { describe, expect, it } from 'vitest';
import type { Booking, ClassSession, Customer } from '@/domain/types';
import { filterBookings, indexBookingsByCustomer, indexBookingsBySession, selectRecentBookings } from './bookings';

const SESSIONS: ClassSession[] = [
  { id: 'ses-1', classTypeId: 'ct-a', instructorId: 'ins-01', date: '2026-09-17', startTime: '06:00', endTime: '06:50', capacity: 10, room: 'Studio A', status: 'scheduled' },
  { id: 'ses-2', classTypeId: 'ct-a', instructorId: 'ins-01', date: '2026-09-18', startTime: '06:00', endTime: '06:50', capacity: 10, room: 'Studio A', status: 'scheduled' },
];

const CUSTOMERS: Customer[] = [
  { id: 'cus-0001', name: 'Jamie Rivera', email: 'jamie@demo.180fitness.app', phone: '+57 300 000 0001', avatar: null, status: 'active', membershipId: 'plan-basic', joinedAt: '2024-01-01' },
  { id: 'cus-0002', name: 'Alex Morgan', email: 'alex@demo.180fitness.app', phone: '+57 300 000 0002', avatar: null, status: 'active', membershipId: 'plan-basic', joinedAt: '2024-01-01' },
];

const BOOKINGS: Booking[] = [
  { id: 'bkg-1', customerId: 'cus-0001', sessionId: 'ses-1', status: 'confirmed', source: 'website', createdAt: '2026-09-01T09:00:00.000-05:00', checkedInAt: null, cancelledAt: null },
  { id: 'bkg-2', customerId: 'cus-0002', sessionId: 'ses-1', status: 'pending', source: 'whatsapp', createdAt: '2026-09-02T09:00:00.000-05:00', checkedInAt: null, cancelledAt: null },
  { id: 'bkg-3', customerId: 'cus-0001', sessionId: 'ses-2', status: 'cancelled', source: 'reception', createdAt: '2026-09-03T09:00:00.000-05:00', checkedInAt: null, cancelledAt: '2026-09-03T10:00:00.000-05:00' },
  { id: 'bkg-4', customerId: 'cus-0002', sessionId: 'ses-2', status: 'waitlist', source: 'instagram', createdAt: '2026-09-04T09:00:00.000-05:00', checkedInAt: null, cancelledAt: null },
];

describe('filterBookings', () => {
  it('status "all" and source "all" are no-ops', () => {
    const result = filterBookings(BOOKINGS, SESSIONS, CUSTOMERS, { query: '', status: 'all', source: 'all', date: null });
    expect(result).toHaveLength(4);
  });

  it('a filter set matching nothing returns [], not undefined', () => {
    const result = filterBookings(BOOKINGS, SESSIONS, CUSTOMERS, { query: 'nobody', status: 'all', source: 'all', date: null });
    expect(result).toEqual([]);
  });

  it('query matches the booking customer name, case-insensitively', () => {
    const result = filterBookings(BOOKINGS, SESSIONS, CUSTOMERS, { query: 'jamie', status: 'all', source: 'all', date: null });
    expect(result.map((b) => b.id)).toEqual(['bkg-1', 'bkg-3']);
  });

  it('all four filters combine as an AND, each narrowing independently', () => {
    // Only bkg-2 is: pending, whatsapp, on 2026-09-17, customer "Alex Morgan"
    const result = filterBookings(BOOKINGS, SESSIONS, CUSTOMERS, {
      query: 'morgan',
      status: 'pending',
      source: 'whatsapp',
      date: '2026-09-17',
    });
    expect(result.map((b) => b.id)).toEqual(['bkg-2']);
  });

  it('narrows to [] when one of the four combined filters excludes every match', () => {
    const result = filterBookings(BOOKINGS, SESSIONS, CUSTOMERS, {
      query: 'morgan',
      status: 'pending',
      source: 'whatsapp',
      date: '2026-09-18', // wrong date for bkg-2
    });
    expect(result).toEqual([]);
  });
});

describe('indexBookingsBySession / indexBookingsByCustomer', () => {
  it('groups bookings by session id', () => {
    const index = indexBookingsBySession(BOOKINGS);
    expect(index.get('ses-1')?.map((b) => b.id)).toEqual(['bkg-1', 'bkg-2']);
    expect(index.get('ses-2')?.map((b) => b.id)).toEqual(['bkg-3', 'bkg-4']);
  });

  it('groups bookings by customer id', () => {
    const index = indexBookingsByCustomer(BOOKINGS);
    expect(index.get('cus-0001')?.map((b) => b.id)).toEqual(['bkg-1', 'bkg-3']);
  });
});

describe('selectRecentBookings', () => {
  it('returns the most recently created bookings first, limited to `limit`', () => {
    const result = selectRecentBookings(BOOKINGS, 2);
    expect(result.map((b) => b.id)).toEqual(['bkg-4', 'bkg-3']);
  });
});
