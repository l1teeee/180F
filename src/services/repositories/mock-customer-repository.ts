import type { Customer, ISODate, NewCustomerInput } from '@/domain/types';
import { simulateLatency } from './latency';
import { getLastLoadedSnapshot } from './mock-demo-dataset';
import type { CustomerRepository } from './types';

// Runtime-created customers use `cus-live-<n>`, extending the `bkg-live-<n>` convention
// docs/04-DOMAIN-MODEL.md section 6 documents for bookings to the one other entity Phase 2C
// creates at runtime (the public booking wizard's customer resolution, docs/08 section 8.2).
let liveCustomerCounter = 0;

export const mockCustomerRepository: CustomerRepository = {
  async list() {
    await simulateLatency('customer-repository:list');
    return getLastLoadedSnapshot().customers;
  },

  async create(input: NewCustomerInput & { membershipId: string }, joinedAt: ISODate): Promise<Customer> {
    await simulateLatency(`customer-repository:create:${input.email}`);
    liveCustomerCounter += 1;
    return {
      id: `cus-live-${liveCustomerCounter}`,
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
