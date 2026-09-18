import type { Customer, ISODate, NewCustomerInput } from '@/domain/types';
import { createLiveIdSequence } from './live-id-sequence';
import { simulateLatency } from './latency';
import { getLastLoadedSnapshot } from './mock-demo-dataset';
import type { CustomerRepository } from './types';

// Runtime-created customers use `cus-live-<n>`, extending the `bkg-live-<n>` convention
// docs/04-DOMAIN-MODEL.md section 6 documents for bookings to the one other entity Phase 2C
// creates at runtime (the public booking wizard's customer resolution, docs/08 section 8.2). See
// live-id-sequence.ts for why the sequence lives in localStorage rather than a plain
// module-level counter - for a customer id specifically, a collision is worse than for a
// booking: customer.store.ts's commitCustomer is idempotent BY ID, so a colliding id makes a
// genuinely new customer silently vanish into an existing, different customer's record instead
// of being added, rather than merely a duplicate React key.
const nextLiveCustomerId = createLiveIdSequence('180f.demo.v1.liveCustomerSeq');

export const mockCustomerRepository: CustomerRepository = {
  async list() {
    await simulateLatency('customer-repository:list');
    return getLastLoadedSnapshot().customers;
  },

  async create(input: NewCustomerInput & { membershipId: string }, joinedAt: ISODate): Promise<Customer> {
    await simulateLatency(`customer-repository:create:${input.email}`);
    return {
      id: `cus-live-${nextLiveCustomerId()}`,
      name: input.name,
      email: input.email,
      phone: input.phone,
      avatar: null,
      status: 'active',
      membershipId: input.membershipId,
      joinedAt,
    };
  },
};
