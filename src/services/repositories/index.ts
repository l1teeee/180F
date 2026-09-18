// Factory/barrel (docs/02-ARCHITECTURE.md section 2 directory layout). Every store imports
// repositories only from here, never from a mock-*.ts file directly - that one indirection
// is the whole of the future-backend seam ADR-009 asks for: swapping to a real backend later
// means changing the exports below, not every call site.
export { loadDemoDataset } from './mock-demo-dataset';
export { mockBookingRepository as bookingRepository } from './mock-booking-repository';
export { mockCustomerRepository as customerRepository } from './mock-customer-repository';
export { mockClassRepository as classRepository } from './mock-class-repository';
export { mockInstructorRepository as instructorRepository } from './mock-instructor-repository';
export type {
  BookingRepository,
  ClassRepository,
  CustomerRepository,
  InstructorRepository,
  LoadDemoDataset,
} from './types';
