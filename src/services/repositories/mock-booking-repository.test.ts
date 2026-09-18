// Regression coverage for the booking-id collision (docs/04-DOMAIN-MODEL.md section 6,
// ADR-022 consequences): the admin dialog and the public flow both call create() below, and the
// strongest way to present this demo runs them in two separate browser tabs, each loading its
// own copy of this module.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const INPUT_A = { customerId: 'cus-a', sessionId: 'ses-a', source: 'reception' as const };
const INPUT_B = { customerId: 'cus-b', sessionId: 'ses-b', source: 'website' as const };
const CREATED_AT = '2026-09-18T09:00:00.000-05:00';

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

describe('mockBookingRepository.create - single source of ids', () => {
  it('mints different ids for a booking created through the admin path and one through the public path', async () => {
    const { mockBookingRepository } = await import('./mock-booking-repository');

    const admin = await mockBookingRepository.create(INPUT_A, CREATED_AT);
    const publicBooking = await mockBookingRepository.create(INPUT_B, CREATED_AT);

    expect(admin.id).not.toBe(publicBooking.id);
  });

  it('does not collide with an id already minted by another tab', async () => {
    // First "tab": a fresh copy of the module creates the first live booking.
    const tabA = await import('./mock-booking-repository');
    const first = await tabA.mockBookingRepository.create(INPUT_A, CREATED_AT);

    // A second tab loads its own fresh copy of the module - vi.resetModules() clears Vitest's
    // module registry so this import re-evaluates the file, the same reset a real browser tab
    // gets simply by being a separate page load. Only localStorage, not module state, survives
    // that reset, which is exactly the property this fix depends on.
    vi.resetModules();
    const tabB = await import('./mock-booking-repository');
    const second = await tabB.mockBookingRepository.create(INPUT_B, CREATED_AT);

    expect(second.id).not.toBe(first.id);
  });

  it('keeps minting unique ids across more than two tabs', async () => {
    const ids: string[] = [];
    for (let i = 0; i < 4; i += 1) {
      vi.resetModules();
      const tab = await import('./mock-booking-repository');
      const booking = await tab.mockBookingRepository.create(INPUT_A, CREATED_AT);
      ids.push(booking.id);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });
});
