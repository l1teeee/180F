// One module-level promise chain serializes every mutating booking action (ADR-017,
// docs/08-STATE-MANAGEMENT.md section 8.1), implemented exactly as specified there: two
// concurrent submissions on the last remaining spot must not both pass the capacity check,
// and a failed mutation must not poison the queue for the ones queued behind it.
let tail: Promise<unknown> = Promise.resolve();

export function serialize<T>(work: () => Promise<T>): Promise<T> {
  const run = tail.then(work, work);
  tail = run.catch(() => undefined);
  return run;
}
