// The one function hydrateDemo() calls (docs/08-STATE-MANAGEMENT.md section 8.4). Wraps
// buildDemoDataset with simulated latency and caches by demoToday so the other mock
// repositories' list() methods (and a StrictMode-doubled hydrateDemo call, belt-and-suspenders
// alongside the store's own status guard) never re-run the generator's narrative-assertion
// pass for data that was already built.
import { buildDemoDataset } from '@/data/seed';
import type { DemoDataset, ISODate } from '@/domain/types';
import { simulateLatency } from './latency';
import type { LoadDemoDataset } from './types';

let cache: { demoToday: ISODate; dataset: DemoDataset } | null = null;

function getOrBuildDataset(demoToday: ISODate): DemoDataset {
  if (cache && cache.demoToday === demoToday) return cache.dataset;
  const dataset = buildDemoDataset(demoToday);
  cache = { demoToday, dataset };
  return dataset;
}

export const loadDemoDataset: LoadDemoDataset = async (demoToday) => {
  await simulateLatency(`load-demo-dataset:${demoToday}`);
  return getOrBuildDataset(demoToday);
};

// The other mock-*-repository.ts list() methods read reference data from whichever dataset
// hydrateDemo most recently loaded, rather than taking their own demoToday parameter: there
// is exactly one demoToday per browser session (ADR-005), so "the last loaded snapshot" and
// "the current demo dataset" are the same thing. Throws if called before the first
// loadDemoDataset() - nothing in this app should call a list() that early.
export function getLastLoadedSnapshot(): DemoDataset {
  if (!cache) {
    throw new Error('getLastLoadedSnapshot: loadDemoDataset() has not resolved yet.');
  }
  return cache.dataset;
}
