// Shared by every runtime id generator (mock-booking-repository.ts, mock-customer-repository.ts,
// notification.store.ts). ADR-022's strongest way to present this demo runs the admin dialog and
// the public flow in two separate browser tabs, each loading its own copy of whichever module
// mints the id, and a reload re-evaluates every module too. A private in-memory counter starts
// at 0 again in each case, so the next id minted collides with one an earlier run (or another
// tab) already used - for a customer id, customer.store.ts's commitCustomer is idempotent BY ID,
// so a colliding id makes a genuinely new record silently vanish into an existing, different
// one instead of being added, rather than merely a duplicate React key.
//
// Reading and writing one shared sequence per entity kind in localStorage - the same mechanism
// ADR-022 already uses to keep the ledger itself in sync - gives every entry point, in every tab,
// a single source of ids instead of one counter each. The number itself carries no meaning beyond
// uniqueness, so it is never reset: a new day or a mid-day "Reset demo data" both just resume
// from a higher number, never risk two records sharing an id.
export function createLiveIdSequence(storageKey: string): () => number {
  let fallbackCounter = 0;

  return function nextId(): number {
    try {
      const stored = Number(localStorage.getItem(storageKey));
      const next = (Number.isFinite(stored) && stored > 0 ? stored : 0) + 1;
      localStorage.setItem(storageKey, String(next));
      return next;
    } catch {
      // Storage unavailable (private mode, quota, a non-browser test context): fall back to a
      // counter that is at least unique within this module instance, same fail-soft posture as
      // demo-persistence.ts's own localStorage access.
      fallbackCounter += 1;
      return fallbackCounter;
    }
  };
}
