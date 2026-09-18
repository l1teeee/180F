// Repository contracts (ADR-009). Each interface exposes only the operations Phase 2C
// actually wires up - no generic Repository<T>, no list/create/cancel forced onto entities
// that never get created or cancelled in this demo.
//
// DemoDataset itself now carries demoToday/demoNow (docs/04-DOMAIN-MODEL.md section 3,
// ADR-018) - the DemoDatasetSnapshot workaround this file used to define is gone, and
// LoadDemoDataset returns the dataset directly.
import type { Booking, ClassSession, Customer, DemoDataset, Instructor, ISODate, ISODateTime, NewBookingInput, NewCustomerInput } from '@/domain/types';

// The sole entry point hydrateDemo() calls (docs/08-STATE-MANAGEMENT.md section 8.4).
export type LoadDemoDataset = (demoToday: ISODate) => Promise<DemoDataset>;

export interface BookingRepository {
  list(): Promise<Booking[]>;
  // `createdAt` is passed in (sourced from useDemoRuntimeStore.demoNow by the caller) rather
  // than read from the wall clock here - ADR-018 confines every non-formatting `new Date()`
  // to hydrateDemo, and a repository has no business reading the demo clock itself.
  create(input: NewBookingInput, createdAt: ISODateTime): Promise<Booking>;
  cancel(bookingId: string): Promise<void>;
}

export interface CustomerRepository {
  list(): Promise<Customer[]>;
  // `joinedAt` is passed in (sourced from the demo clock by the caller) rather than read from
  // the wall clock here, mirroring BookingRepository.create's `createdAt` parameter above -
  // same ADR-018 reasoning. `membershipId` is required here (unlike the optional field
  // NewCustomerInput exposes to a form) - this layer may import only domain/types and data
  // (docs/02-ARCHITECTURE.md section 5), not domain/constants, so it cannot itself default to
  // PUBLIC_DEFAULT_PLAN_ID. The caller (useCustomerStore) is what applies that fallback, once,
  // explicitly, so this repository never has to guess at a silent default.
  create(input: NewCustomerInput & { membershipId: string }, joinedAt: ISODate): Promise<Customer>;
}

// "Class" here means the bookable ClassSession instance (the store it feeds is
// useSessionStore), not the ClassType catalog entry - sessions are the entity with a
// repository-shaped lifecycle in this demo; class types are static reference data seeded
// once through loadDemoDataset, same as the catalog and settings stores.
export interface ClassRepository {
  list(): Promise<ClassSession[]>;
}

export interface InstructorRepository {
  list(): Promise<Instructor[]>;
}
