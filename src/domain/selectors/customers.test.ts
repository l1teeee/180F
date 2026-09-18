// docs/08-STATE-MANAGEMENT.md section 4 / docs/11-TEST-PLAN.md section 3.
import { describe, expect, it } from 'vitest';
import type { Booking, ClassSession, Customer, MembershipPlan } from '@/domain/types';
import { buildDemoDataset } from '@/data/seed';
import { indexBookingsByCustomer } from './bookings';
import { selectCustomerStats, selectCustomerStatsFromBookings } from './customers';

const DEMO_TODAY = '2026-09-17';

const BASIC_PLAN: MembershipPlan = {
  id: 'plan-basic',
  name: 'Basic',
  monthlyPrice: 29,
  billingPeriod: 'monthly',
  classLimit: 8,
  benefits: ['8 classes per month'],
  accent: 'blue',
};

const UNLIMITED_PLAN: MembershipPlan = {
  id: 'plan-unlimited',
  name: 'Unlimited',
  monthlyPrice: 49,
  billingPeriod: 'monthly',
  classLimit: null,
  benefits: ['Unlimited classes'],
  accent: 'purple',
};

function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 'cus-0001',
    name: 'Customer 01',
    email: 'customer01@demo.180fitness.app',
    phone: '+57 300 000 0001',
    avatar: null,
    status: 'active',
    membershipId: 'plan-basic',
    joinedAt: '2024-01-05',
    ...overrides,
  };
}

function makeSession(overrides: Partial<ClassSession> = {}): ClassSession {
  return {
    id: 'ses-0001',
    classTypeId: 'ct-functional-training',
    instructorId: 'ins-01',
    date: '2026-09-10',
    startTime: '06:00',
    endTime: '06:50',
    capacity: 15,
    room: 'Studio A',
    status: 'completed',
    ...overrides,
  };
}

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'bkg-0001',
    customerId: 'cus-0001',
    sessionId: 'ses-0001',
    status: 'confirmed',
    source: 'website',
    createdAt: '2026-09-05T09:00:00.000-05:00',
    checkedInAt: null,
    cancelledAt: null,
    ...overrides,
  };
}

describe('selectCustomerStats', () => {
  it('attendanceRate is 0, not NaN, when the customer has no completed-session bookings', () => {
    const stats = selectCustomerStats(makeCustomer(), [], [], [BASIC_PLAN], DEMO_TODAY);
    expect(stats.attendanceRate).toBe(0);
    expect(Number.isNaN(stats.attendanceRate)).toBe(false);
  });

  it('attendanceRate = attended / (attended + no-show), rounded to a whole percent', () => {
    const sessions = [
      makeSession({ id: 'ses-a' }),
      makeSession({ id: 'ses-b' }),
      makeSession({ id: 'ses-c' }),
    ];
    const bookings = [
      makeBooking({ id: 'bkg-a', sessionId: 'ses-a', checkedInAt: '2026-09-10T06:00:00.000-05:00' }), // attended
      makeBooking({ id: 'bkg-b', sessionId: 'ses-b', checkedInAt: '2026-09-10T06:00:00.000-05:00' }), // attended
      makeBooking({ id: 'bkg-c', sessionId: 'ses-c', checkedInAt: null }), // no-show
    ];
    const stats = selectCustomerStats(makeCustomer(), bookings, sessions, [BASIC_PLAN], DEMO_TODAY);
    expect(stats.attendanceRate).toBe(67); // round(2/3 * 100)
    expect(stats.noShows).toBe(1);
  });

  it('remainingCredits is null for an unlimited plan', () => {
    const customer = makeCustomer({ membershipId: 'plan-unlimited' });
    const stats = selectCustomerStats(customer, [], [], [UNLIMITED_PLAN], DEMO_TODAY);
    expect(stats.membership.id).toBe('plan-unlimited');
    expect(stats.remainingCredits).toBeNull();
  });

  it('remainingCredits = classLimit - classesThisMonth (clamped to 0) for a limited plan', () => {
    const sessions = [1, 2, 3].map((n) =>
      makeSession({ id: `ses-${n}`, date: `2026-09-1${n}`, status: 'scheduled' }),
    );
    const bookings = sessions.map((session, i) =>
      makeBooking({ id: `bkg-${i}`, sessionId: session.id, status: 'confirmed' }),
    );
    const stats = selectCustomerStats(makeCustomer(), bookings, sessions, [BASIC_PLAN], DEMO_TODAY);
    expect(stats.classesThisMonth).toBe(3);
    expect(stats.remainingCredits).toBe(5); // 8 - 3
  });

  it('remainingCredits clamps to 0 rather than going negative on a limited plan', () => {
    const sessions = Array.from({ length: 10 }, (_, i) => makeSession({ id: `ses-${i}`, date: `2026-09-${10 + i}` }));
    const bookings = sessions.map((session, i) => makeBooking({ id: `bkg-${i}`, sessionId: session.id }));
    const stats = selectCustomerStats(makeCustomer(), bookings, sessions, [BASIC_PLAN], DEMO_TODAY);
    expect(stats.remainingCredits).toBe(0);
  });

  it('classesThisMonth counts only the demo-month non-cancelled bookings', () => {
    const sessions = [
      makeSession({ id: 'ses-this-month', date: '2026-09-05', status: 'scheduled' }),
      makeSession({ id: 'ses-last-month', date: '2026-08-20', status: 'completed' }),
    ];
    const bookings = [
      makeBooking({ id: 'bkg-1', sessionId: 'ses-this-month', status: 'confirmed' }),
      makeBooking({ id: 'bkg-2', sessionId: 'ses-last-month', status: 'confirmed' }),
      makeBooking({ id: 'bkg-3', sessionId: 'ses-this-month', status: 'cancelled' }),
    ];
    const stats = selectCustomerStats(makeCustomer(), bookings, sessions, [BASIC_PLAN], DEMO_TODAY);
    expect(stats.classesThisMonth).toBe(1);
  });
});

describe('selectCustomerStats over the real dataset', () => {
  const dataset = buildDemoDataset(DEMO_TODAY);

  it('resolves every active customer without throwing, for both limited and unlimited plans', () => {
    const limitedPlanIds = new Set(dataset.membershipPlans.filter((p) => p.classLimit !== null).map((p) => p.id));
    const unlimitedPlanIds = new Set(dataset.membershipPlans.filter((p) => p.classLimit === null).map((p) => p.id));
    let sawLimited = false;
    let sawUnlimited = false;

    for (const customer of dataset.customers) {
      const stats = selectCustomerStats(customer, dataset.bookings, dataset.sessions, dataset.membershipPlans, DEMO_TODAY);
      expect(stats.attendanceRate).toBeGreaterThanOrEqual(0);
      expect(stats.attendanceRate).toBeLessThanOrEqual(100);
      if (limitedPlanIds.has(customer.membershipId)) {
        sawLimited = true;
        expect(stats.remainingCredits).not.toBeNull();
      }
      if (unlimitedPlanIds.has(customer.membershipId)) {
        sawUnlimited = true;
        expect(stats.remainingCredits).toBeNull();
      }
    }

    expect(sawLimited).toBe(true);
    expect(sawUnlimited).toBe(true);
  });
});

// docs/08-STATE-MANAGEMENT.md section 8.8: use-customers-rows.ts builds indexBookingsByCustomer
// once per render and passes each customer's slice here instead of selectCustomerStats
// rescanning the full ledger per row. This proves that real usage pattern produces exactly the
// same view model as the full-ledger call for every customer, not just a hand-picked one.
describe('selectCustomerStatsFromBookings', () => {
  const sessions = [
    makeSession({ id: 'ses-a', date: '2026-09-10' }),
    makeSession({ id: 'ses-b', date: '2026-09-11' }),
  ];
  const customerA = makeCustomer({ id: 'cus-0001' });
  const customerB = makeCustomer({ id: 'cus-0002' });
  const bookings: Booking[] = [
    makeBooking({ id: 'bkg-a1', customerId: 'cus-0001', sessionId: 'ses-a' }),
    makeBooking({ id: 'bkg-a2', customerId: 'cus-0001', sessionId: 'ses-b' }),
    makeBooking({ id: 'bkg-b1', customerId: 'cus-0002', sessionId: 'ses-a' }),
  ];

  it("matches selectCustomerStats when given each customer's bookings pre-filtered by an index", () => {
    const bookingsByCustomer = indexBookingsByCustomer(bookings);

    for (const customer of [customerA, customerB]) {
      const viaFullLedger = selectCustomerStats(customer, bookings, sessions, [BASIC_PLAN], DEMO_TODAY);
      const viaIndex = selectCustomerStatsFromBookings(
        customer,
        bookingsByCustomer.get(customer.id) ?? [],
        sessions,
        [BASIC_PLAN],
        DEMO_TODAY,
      );
      expect(viaIndex).toEqual(viaFullLedger);
    }
  });
});
