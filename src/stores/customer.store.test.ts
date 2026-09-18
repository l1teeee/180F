// docs/08-STATE-MANAGEMENT.md section 1 (addCustomer), section 8.2 (upsertByEmail resolves
// identity by email and does not commit a new customer itself; commitCustomer is the separate,
// idempotent-by-id step the caller uses once it knows the booking will also succeed).
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Customer } from '@/domain/types';
import { useCustomerStore } from './customer.store';

const JOINED_AT = '2026-09-18';

function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 'cus-live-1',
    name: 'Alice',
    email: 'alice@example.com',
    phone: '+57 300 000 0001',
    avatar: null,
    status: 'active',
    membershipId: 'plan-day-pass',
    joinedAt: JOINED_AT,
    ...overrides,
  };
}

beforeEach(() => {
  useCustomerStore.setState({ customers: [] });
});

describe('addCustomer', () => {
  it('creates and commits a new customer', async () => {
    const created = await useCustomerStore
      .getState()
      .addCustomer({ name: 'Alice', email: 'alice@example.com', phone: '+57 300 000 0001' }, JOINED_AT);

    expect(created.name).toBe('Alice');
    expect(useCustomerStore.getState().customers).toEqual([created]);
  });
});

describe('upsertByEmail', () => {
  it('reuses an existing customer by email (trimmed, case-insensitive) rather than creating a duplicate', async () => {
    const alice = makeCustomer();
    useCustomerStore.setState({ customers: [alice] });

    const resolved = await useCustomerStore
      .getState()
      .upsertByEmail({ name: 'Alice Again', email: ' ALICE@Example.com ', phone: '+57 300 000 9999' }, JOINED_AT);

    expect(resolved.id).toBe(alice.id);
    expect(useCustomerStore.getState().customers).toHaveLength(1);
  });

  it('does not commit a genuinely new customer itself - the caller commits once the booking also succeeds', async () => {
    const resolved = await useCustomerStore
      .getState()
      .upsertByEmail({ name: 'Bob', email: 'bob@example.com', phone: '+57 300 000 0002' }, JOINED_AT);

    expect(resolved.name).toBe('Bob');
    expect(useCustomerStore.getState().customers).toHaveLength(0);
  });
});

describe('commitCustomer', () => {
  it('is idempotent for an id already present - the existing record is never overwritten', () => {
    const alice = makeCustomer();
    useCustomerStore.setState({ customers: [alice] });

    useCustomerStore.getState().commitCustomer({ ...alice, name: 'Someone else entirely' });

    const customers = useCustomerStore.getState().customers;
    expect(customers).toHaveLength(1);
    expect(customers[0]?.name).toBe('Alice');
  });

  it('adds a customer whose id is not yet present', () => {
    const alice = makeCustomer();
    useCustomerStore.setState({ customers: [alice] });

    useCustomerStore.getState().commitCustomer(makeCustomer({ id: 'cus-live-2', name: 'Bob', email: 'bob@example.com' }));

    expect(useCustomerStore.getState().customers).toHaveLength(2);
  });
});

describe('customer identity survives a reload (independent audit defect 1, single source of ids)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not let a second public customer silently reuse a first one\'s persisted id after the repository module resets', async () => {
    // "Tab 1": create Alice through the same upsertByEmail + commitCustomer pair
    // createPublicBooking uses for the public flow.
    vi.resetModules();
    const tab1 = await import('./customer.store');
    const alice = await tab1.useCustomerStore.getState().upsertByEmail(
      { name: 'Alice', email: 'alice@example.com', phone: '+57 300 000 0001' },
      JOINED_AT,
    );
    tab1.useCustomerStore.getState().commitCustomer(alice);
    expect(tab1.useCustomerStore.getState().customers).toEqual([alice]);

    // Simulated reload / second tab: the module registry resets, so a private in-memory counter
    // would restart at zero here (this is the exact bug: the next create() would then mint
    // "cus-live-1" again). localStorage - where the fix keeps the id sequence, same as ADR-022's
    // own snapshot - survives, same as a real browser reload. The fresh store starts empty in
    // memory; setState below stands in for hydrateDemo() restoring Alice from that snapshot.
    vi.resetModules();
    const tab2 = await import('./customer.store');
    tab2.useCustomerStore.setState({ customers: [alice] });

    const bob = await tab2.useCustomerStore.getState().upsertByEmail(
      { name: 'Bob', email: 'bob@example.com', phone: '+57 300 000 0002' },
      JOINED_AT,
    );

    // The defect: bob.id collided with alice.id, so commitCustomer's idempotency-by-id guard
    // silently dropped Bob and a booking built from `bob` would have pointed at Alice.
    expect(bob.id).not.toBe(alice.id);

    tab2.useCustomerStore.getState().commitCustomer(bob);
    const customers = tab2.useCustomerStore.getState().customers;
    expect(customers).toHaveLength(2);
    expect(customers.find((c) => c.email === 'alice@example.com')?.id).toBe(alice.id);
    expect(customers.find((c) => c.email === 'bob@example.com')?.id).toBe(bob.id);
  });
});
