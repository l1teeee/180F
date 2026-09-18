import { simulateLatency } from './latency';
import { getLastLoadedSnapshot } from './mock-demo-dataset';
import type { ClassRepository } from './types';

export const mockClassRepository: ClassRepository = {
  async list() {
    await simulateLatency('class-repository:list');
    return getLastLoadedSnapshot().sessions;
  },
};
