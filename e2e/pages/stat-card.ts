// Shared StatCard reader used by dashboard.page.ts and customer-detail.page.ts.
// StatCard (src/components/shared/stat-card.tsx) renders no ARIA role of its own - it is a
// plain, unlabelled <div> - so there is no role/accessible-name locator available for "the
// card for this KPI". Verified against a live a11y snapshot of /dashboard (see e2e/README.md):
// the label text's second DOM ancestor is always the card root, e.g.
//   <span>Active members</span>                                  <- the label itself
//   <div class="... justify-between ...">Active members</div>    <- ancestor::div[1]
//   <div class="... rounded-card-sm ...">Active members132...</div> <- ancestor::div[2], the card
// Walking from that real, visible label text is the least brittle hook the actual markup
// offers - it is a text locator, not a CSS class selector.
import type { Locator, Page } from '@playwright/test';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function statCard(scope: Page | Locator, label: string): Locator {
  return scope.getByText(label, { exact: true }).locator('xpath=ancestor::div[2]');
}

async function readOnce(scope: Page | Locator, label: string): Promise<number> {
  const text = (await statCard(scope, label).innerText()).trim();
  const match = new RegExp(`^${escapeRegExp(label)}\\s*(\\d+)`).exec(text);
  if (!match) {
    throw new Error(`Could not read a numeric KPI value for "${label}" from card text "${text}"`);
  }
  return Number(match[1]);
}

/** Reads the integer that immediately follows the label inside its card, e.g. "Today's bookings87..." -> 87. */
export async function statCardValue(scope: Page | Locator, label: string): Promise<number> {
  const page = 'page' in scope ? scope.page() : scope;
  // AnimatedValue (src/components/shared/stat-card.tsx) mounts at 0 and only sets its real
  // value from inside a requestAnimationFrame callback scheduled by its own effect - true even
  // with reducedMotion:'reduce' (playwright.config.ts), which only skips the ~600ms tween, not
  // that one deferred frame. A read straight after a client-side nav can land before that
  // frame has fired and committed. Poll frame-by-frame (a real rendering signal, not a fixed
  // sleep) until two consecutive reads agree, so the wait is exactly as long as the animation
  // actually takes on this run.
  let previous = await readOnce(scope, label);
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
    const current = await readOnce(scope, label);
    if (current === previous) return current;
    previous = current;
  }
  return previous;
}
