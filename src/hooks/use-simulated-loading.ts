'use client';

// Demo-only "fetching" phase. Client request, and it supersedes docs/06 section 4.5 / ADR-005's
// "no screen fakes a longer delay than its data actually takes to resolve": the demo has no
// backend and every store is already filled by the time a section opens, so each screen used to
// appear in a single frame and read as fake. Now each section shows its skeleton for a short,
// fixed time after it mounts, the way a real round trip would.
//
// The durations are fixed per section (no Math.random / Date.now, ADR-005) and live in one table
// so they are easy to tune. Call it unconditionally at the top of the screen, before any early
// return, and OR the result into the screen's existing `status !== 'ready'` skeleton condition.
import { useEffect, useState } from 'react';

const SECTION_LOADING_MS = {
  dashboard: 900,
  calendar: 850,
  bookings: 750,
  customers: 750,
  customerDetail: 700,
  classes: 650,
  classDetail: 700,
  instructors: 600,
  instructorDetail: 700,
  memberships: 600,
  automations: 650,
  settings: 550,
  publicBooking: 500,
} as const;

export type LoadingSection = keyof typeof SECTION_LOADING_MS;

// body[data-section-loading] is present while any section is still "fetching", the same kind of
// real signal as body[data-demo-status] (DemoDataProvider): the Playwright harness waits on it
// instead of guessing a delay. A counter, not a boolean, so a section unmounting mid-navigation
// can never clear the flag for the section that mounts right after it.
let sectionsLoading = 0;

function markSectionLoading(): void {
  sectionsLoading += 1;
  document.body.dataset.sectionLoading = 'true';
}

function markSectionLoaded(): void {
  sectionsLoading -= 1;
  if (sectionsLoading === 0) delete document.body.dataset.sectionLoading;
}

export function useSimulatedLoading(section: LoadingSection): boolean {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    markSectionLoading();
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      markSectionLoaded();
    };
    const timer = setTimeout(() => {
      setIsLoading(false);
      settle();
    }, SECTION_LOADING_MS[section]);
    return () => {
      clearTimeout(timer);
      settle();
    };
  }, [section]);

  return isLoading;
}
