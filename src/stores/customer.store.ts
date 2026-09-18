// docs/08-STATE-MANAGEMENT.md section 1 lists addCustomer(); section 8.5's authoritative
// cross-store edge list calls the action createPublicBooking uses upsertByEmail() - both are
// implemented, since each is a real, distinct call shape (an explicit add vs. an
// identity-resolving upsert) rather than one superseding the other.
//
// upsertByEmail resolves identity and, for a genuinely new customer, calls the repository -
// but does NOT commit that new record to this store's state itself (docs/08 section 8.2: the
// customer and the booking that depends on it commit together, so a booking rejected after
// this call never leaves an orphan customer behind). commitCustomer is the separate,
// synchronous, idempotent step the caller uses once it knows the booking will also succeed.
import { create } from 'zustand';
import type { Customer, ISODate, NewCustomerInput } from '@/domain/types';
import { PUBLIC_DEFAULT_PLAN_ID } from '@/domain/constants';
import { customerRepository } from '@/services/repositories';
import { scheduleSnapshotWrite } from './demo-persistence';

interface CustomerState {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (input: NewCustomerInput, joinedAt: ISODate) => Promise<Customer>;
  // Resolves identity by lowercased, trimmed email: an existing customer is reused, never
  // duplicated (docs/08 section 8.2). Returns an uncommitted record for a new customer - the
  // caller commits it via commitCustomer once it knows the booking succeeded.
  upsertByEmail: (input: NewCustomerInput, joinedAt: ISODate) => Promise<Customer>;
  // Idempotent: a no-op if a customer with this id is already present, so callers can call it
  // unconditionally after a successful booking rather than tracking "was this new" themselves.
  commitCustomer: (customer: Customer) => void;
}

export const useCustomerStore = create<CustomerState>()((set, get) => ({
  customers: [],

  setCustomers: (customers) => set({ customers }),

  addCustomer: async (input, joinedAt) => {
    const created = await customerRepository.create(
      { ...input, membershipId: input.membershipId ?? PUBLIC_DEFAULT_PLAN_ID },
      joinedAt,
    );
    get().commitCustomer(created);
    return created;
  },

  upsertByEmail: async (input, joinedAt) => {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existing = get().customers.find((customer) => customer.email.trim().toLowerCase() === normalizedEmail);
    if (existing) return existing;
    return customerRepository.create({ ...input, membershipId: input.membershipId ?? PUBLIC_DEFAULT_PLAN_ID }, joinedAt);
  },

  commitCustomer: (customer) => {
    set((state) =>
      state.customers.some((existing) => existing.id === customer.id) ? state : { customers: [...state.customers, customer] },
    );
    scheduleSnapshotWrite();
  },
}));
