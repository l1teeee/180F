import { simulateLatency } from './latency';
import { getLastLoadedSnapshot } from './mock-demo-dataset';
import type { InstructorRepository } from './types';

export const mockInstructorRepository: InstructorRepository = {
  async list() {
    await simulateLatency('instructor-repository:list');
    return getLastLoadedSnapshot().instructors;
  },
};
