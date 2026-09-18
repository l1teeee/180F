// Independent audit defect 2: the Promote control must stay disabled - and say why - whenever
// selectPromotionEligibility would refuse it, not only when the session is at capacity
// (ADR-024 point 2/3). Seeds the stores this component now reads directly, the same convention
// src/stores/booking.store.test.ts uses for the stores it reads via getState().
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Booking, BookingRow, ClassSession, ClassType, Customer, Instructor, StudioSettings } from '@/domain/types';
import { useBookingStore } from '@/stores/booking.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { useSessionStore } from '@/stores/session.store';
import { useSettingsStore } from '@/stores/settings.store';
import { BookingsTable } from './bookings-table';

const DEMO_TODAY = '2026-09-17';
const DEMO_NOW = '2026-09-17T09:00:00.000-05:00';

const CLASS_TYPE: ClassType = {
  id: 'ct-functional-training',
  name: 'Functional Training',
  description: 'Full-body compound movements.',
  durationMinutes: 50,
  defaultCapacity: 15,
  category: 'strength',
  accent: 'purple',
  icon: 'Dumbbell',
};

const INSTRUCTOR: Instructor = {
  id: 'ins-01',
  name: 'Instructor 01',
  avatar: null,
  specialty: 'Functional Training',
  rating: 4.8,
  status: 'available',
  bio: 'Bio',
};

function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 'cus-a',
    name: 'Customer A',
    email: 'customer-a@demo.180fitness.app',
    phone: '+57 300 000 0001',
    avatar: null,
    status: 'active',
    membershipId: 'plan-unlimited',
    joinedAt: '2026-01-01',
    ...overrides,
  };
}

function makeSession(overrides: Partial<ClassSession> = {}): ClassSession {
  return {
    id: 'ses-target',
    classTypeId: CLASS_TYPE.id,
    instructorId: INSTRUCTOR.id,
    date: DEMO_TODAY,
    startTime: '18:00',
    endTime: '18:50',
    capacity: 2,
    room: 'Studio A',
    status: 'scheduled',
    ...overrides,
  };
}

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'bkg-wait',
    customerId: 'cus-a',
    sessionId: 'ses-target',
    status: 'waitlist',
    source: 'reception',
    createdAt: DEMO_NOW,
    checkedInAt: null,
    cancelledAt: null,
    ...overrides,
  };
}

function makeSettings(overrides: Partial<StudioSettings['booking']> = {}): StudioSettings {
  return {
    general: {
      studioName: '180 Fitness Studio',
      email: 'hello@180fitness.app',
      phone: '+57 601 000 0180',
      address: 'Carrera 11 # 93-45, Bogotá',
      timezone: 'America/Bogota',
    },
    booking: { cancellationWindowHours: 12, maxReservationsPerDay: 2, waitlistEnabled: true, advanceBookingDays: 14, ...overrides },
    notifications: { whatsappConfirmations: true, emailConfirmations: false, reminderHoursBefore: 24 },
    branding: { logo: null, primaryColor: '#7869D4', accentColor: '#F5D889' },
  };
}

function toRow(booking: Booking, session: ClassSession, customer: Customer): BookingRow {
  return { ...booking, customer, session, classType: CLASS_TYPE, instructor: INSTRUCTOR };
}

function seedStores(sessions: ClassSession[], bookings: Booking[], settingsOverrides: Partial<StudioSettings['booking']> = {}) {
  useSessionStore.setState({ sessions });
  useBookingStore.setState({ bookings, mutation: 'idle' });
  useSettingsStore.setState({ settings: makeSettings(settingsOverrides) });
  useDemoRuntimeStore.setState({ status: 'ready', demoToday: DEMO_TODAY, demoNow: DEMO_NOW, error: null });
}

beforeEach(() => {
  useSessionStore.setState({ sessions: [] });
  useBookingStore.setState({ bookings: [], mutation: 'idle' });
  useSettingsStore.setState({ settings: null });
  useDemoRuntimeStore.setState({ status: 'idle', demoToday: null, demoNow: null, error: null });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('BookingsTable Promote control (ADR-024 point 2/3)', () => {
  it('disables Promote and explains why when the session has a free seat but the customer is at the daily limit', () => {
    const targetSession = makeSession({ id: 'ses-target', capacity: 2 });
    const sessionOne = makeSession({ id: 'ses-1', startTime: '06:00', endTime: '06:50' });
    const sessionTwo = makeSession({ id: 'ses-2', startTime: '07:00', endTime: '07:50' });
    const customer = makeCustomer();
    const waitlisted = makeBooking({ id: 'bkg-wait', customerId: customer.id, sessionId: targetSession.id, status: 'waitlist' });

    seedStores(
      [targetSession, sessionOne, sessionTwo],
      [
        waitlisted,
        makeBooking({ id: 'bkg-seat-1', customerId: customer.id, sessionId: sessionOne.id, status: 'confirmed' }),
        makeBooking({ id: 'bkg-seat-2', customerId: customer.id, sessionId: sessionTwo.id, status: 'confirmed' }),
      ],
      { maxReservationsPerDay: 2 },
    );

    render(
      <BookingsTable
        rows={[toRow(waitlisted, targetSession, customer)]}
        onCancelRequest={vi.fn()}
        onCreateBooking={vi.fn()}
        onPromoteRequest={vi.fn()}
        promotableSessionIds={new Set([targetSession.id])}
        promotingId={null}
      />,
    );

    // DataTable renders both the desktop table and the mobile card in the DOM at once (CSS
    // breakpoints hide one, which jsdom does not evaluate) - scope to the desktop table so the
    // query is not ambiguous, mirroring src/components/shared/data-table.test.tsx's own pattern.
    const promoteButton = within(screen.getByRole('table')).getByRole('button', { name: 'Promote' });
    expect(promoteButton).toBeDisabled();
    expect(promoteButton).toHaveAttribute('title', 'This customer already has 2 booking(s) on this day.');
    // The capacity-only signal must not read as promotable either, now that the daily limit
    // refuses it.
    expect(screen.queryByText('Seat open')).not.toBeInTheDocument();
  });

  it('enables Promote when every eligibility rule passes, and clicking it reports the row', async () => {
    const user = userEvent.setup();
    const targetSession = makeSession({ id: 'ses-target', capacity: 2 });
    const customer = makeCustomer();
    const waitlisted = makeBooking({ id: 'bkg-wait', customerId: customer.id, sessionId: targetSession.id, status: 'waitlist' });
    const onPromoteRequest = vi.fn();

    seedStores([targetSession], [waitlisted]);

    const row = toRow(waitlisted, targetSession, customer);
    render(
      <BookingsTable
        rows={[row]}
        onCancelRequest={vi.fn()}
        onCreateBooking={vi.fn()}
        onPromoteRequest={onPromoteRequest}
        promotableSessionIds={new Set([targetSession.id])}
        promotingId={null}
      />,
    );

    const promoteButton = within(screen.getByRole('table')).getByRole('button', { name: 'Promote' });
    expect(promoteButton).toBeEnabled();
    expect(promoteButton).toHaveAttribute('title', 'Promote to confirmed');

    await user.click(promoteButton);
    expect(onPromoteRequest).toHaveBeenCalledWith(row);
  });

  it('disables Promote when the session has already started, even with a free seat', () => {
    const targetSession = makeSession({ id: 'ses-target', capacity: 2, date: DEMO_TODAY, startTime: '08:00', endTime: '08:50' });
    const customer = makeCustomer();
    const waitlisted = makeBooking({ id: 'bkg-wait', customerId: customer.id, sessionId: targetSession.id, status: 'waitlist' });

    seedStores([targetSession], [waitlisted]);

    render(
      <BookingsTable
        rows={[toRow(waitlisted, targetSession, customer)]}
        onCancelRequest={vi.fn()}
        onCreateBooking={vi.fn()}
        onPromoteRequest={vi.fn()}
        promotableSessionIds={new Set([targetSession.id])}
        promotingId={null}
      />,
    );

    const promoteButton = within(screen.getByRole('table')).getByRole('button', { name: 'Promote' });
    expect(promoteButton).toBeDisabled();
    expect(promoteButton).toHaveAttribute('title', 'This session has already started.');
  });
});
