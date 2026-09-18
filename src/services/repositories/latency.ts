// Deterministic (not random) simulated network latency, 250-450 ms, for every mock
// repository call. Not reused from src/lib/random.ts: that module's PRNG is scoped to seed
// generation determinism (ADR-005) and is off-limits to this layer anyway
// (docs/02-ARCHITECTURE.md section 5: services/repositories may import only domain/types and
// data) - this is a distinct, much smaller concern that does not need a shared seed stream.
const MIN_LATENCY_MS = 250;
const MAX_LATENCY_MS = 450;

// FNV-1a, 32-bit - same key always maps to the same delay, different keys spread across the
// range instead of every call taking an identical, suspiciously round number.
function hashToUnitInterval(key: string): number {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

export function deterministicLatencyMs(key: string): number {
  const unit = hashToUnitInterval(key);
  return Math.round(MIN_LATENCY_MS + unit * (MAX_LATENCY_MS - MIN_LATENCY_MS));
}

export function simulateLatency(key: string): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, deterministicLatencyMs(key)));
}
