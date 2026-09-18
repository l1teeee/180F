// ADR-008: confirmed + pending occupy a spot; cancelled and waitlist never do.
// full when available <= 0, almost_full when occupancyRate >= this threshold and not full.
// The arithmetic itself lives only in src/domain/selectors/sessions.ts - this file holds
// just the tunable number so it is not a magic literal duplicated at each call site.
export const ALMOST_FULL_OCCUPANCY_THRESHOLD = 0.85;
