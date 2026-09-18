// Regression coverage for the customer-id collision (independent audit, defect 1): a private
// in-memory counter restarts at zero on reload or in a second tab, so the next public customer
// can mint an id an earlier run already used. Worse than the same bug already fixed for booking
// ids (mock-booking-repository.test.ts): customer.store.ts's commitCustomer is idempotent BY ID,
// so a colliding id makes a genuinely new customer silently vanish into an existing, different
// customer's record instead of being added. Mirrors mock-booking-repository.test.ts's own
// vi.resetModules() technique - only localStorage, not module state, survives that reset, the
// same reset a real browser tab gets simply by being a separate page load.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const INPUT_A = { name: 'Alice', email: 'alice@example.com', phone: '+57 300 000 0001', membershipId: 'plan-day-pass' };
const INPUT_B = { name: 'Bob', email: 'bob@example.com', phone: '+57 300 000 0002', membershipId: 'plan-day-pass' };
const JOINED_AT = '2026-09-18';

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

describe('mockCustomerRepository.create - single source of ids', () => {
  it('mints different ids for two customers created in the same module instance', async () => {
    const { mockCustomerRepository } = await import('./mock-customer-repository');

    const alice = await mockCustomerRepository.create(INPUT_A, JOINED_AT);
    const bob = await mockCustomerRepository.create(INPUT_B, JOINED_AT);

    expect(alice.id).not.toBe(bob.id);
  });

  it('does not collide with an id already minted by another tab', async () => {
    // First "tab": a fresh copy of the module creates the first live customer.
    const tabA = await import('./mock-customer-repository');
    const alice = await tabA.mockCustomerRepository.create(INPUT_A, JOINED_AT);

    // A second tab loads its own fresh copy of the module - vi.resetModules() clears Vitest's
    // module registry so this import re-evaluates the file, the same reset a real browser tab
    // gets simply by being a separate page load. Only localStorage, not module state, survives
    // that reset, which is exactly the property this fix depends on.
    vi.resetModules();
    const tabB = await import('./mock-customer-repository');
    const bob = await tabB.mockCustomerRepository.create(INPUT_B, JOINED_AT);

    expect(bob.id).not.toBe(alice.id);
  });

  it('keeps minting unique ids across more than two tabs', async () => {
    const ids: string[] = [];
    for (let i = 0; i < 4; i += 1) {
      vi.resetModules();
      const tab = await import('./mock-customer-repository');
      const customer = await tab.mockCustomerRepository.create(INPUT_A, JOINED_AT);
      ids.push(customer.id);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });
});
