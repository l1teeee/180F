// Generator - docs/05-MOCK-DATA-STRATEGY.md section 4. 148 records, cus-0001..cus-0148,
// processed in id order. Status, membership and joinedAt are each an independent
// id-keyed stream (section 1.2: adding a customer never reshuffles another customer's draw).
import type { Customer, CustomerStatus, ISODate } from '@/domain/types';
import { addDaysISO, daysBetweenISO, getDayOfMonth, startOfMonthISO, subMonthsISO } from '@/lib/dates';
import { createStream } from '@/lib/random';

const CUSTOMER_COUNT = 148;
const NEW_THIS_MONTH_COUNT = 8;
const JOINED_HISTORY_MONTHS = 36;

// idx is the 0-based position after sorting all 148 ids by an id-keyed score ascending
// (section 4 "sort all 148 ids by score ascending... first N in that order").
function statusForRank(idx: number): CustomerStatus {
  if (idx < 132) return 'active';
  if (idx < 142) return 'paused'; // 132 + 10
  return 'inactive'; // remaining 6
}

function membershipIdForRank(idx: number): string {
  if (idx < 68) return 'plan-basic';
  if (idx < 118) return 'plan-unlimited'; // 68 + 50
  if (idx < 139) return 'plan-premium'; // 118 + 21
  return 'plan-day-pass'; // remaining 9
}

export function buildCustomers(seed: number, demoToday: ISODate): Customer[] {
  const ids = Array.from({ length: CUSTOMER_COUNT }, (_, k) => `cus-${String(k + 1).padStart(4, '0')}`);

  const statusRank = [...ids]
    .map((id) => ({ id, score: createStream(seed, 'customer-status', id)() }))
    .sort((a, b) => a.score - b.score);
  const statusById = new Map<string, CustomerStatus>(statusRank.map(({ id }, idx) => [id, statusForRank(idx)]));

  const membershipRank = [...ids]
    .map((id) => ({ id, score: createStream(seed, 'customer-membership', id)() }))
    .sort((a, b) => a.score - b.score);
  const membershipById = new Map<string, string>(
    membershipRank.map(({ id }, idx) => [id, membershipIdForRank(idx)]),
  );

  // One stream per customer, reused for two sequential draws: the first ranks who
  // "joined this month" (section 4), the second is that customer's day/offset draw.
  const joinedStreamById = new Map(ids.map((id) => [id, createStream(seed, 'customer-joined', id)]));
  const joinedFirstDraw = new Map(ids.map((id) => [id, joinedStreamById.get(id)!()]));
  const newThisMonthIds = new Set(
    [...ids].sort((a, b) => joinedFirstDraw.get(a)! - joinedFirstDraw.get(b)!).slice(0, NEW_THIS_MONTH_COUNT),
  );

  const monthStart = startOfMonthISO(demoToday);
  const historyRangeStart = subMonthsISO(monthStart, JOINED_HISTORY_MONTHS);
  const historyRangeDays = daysBetweenISO(historyRangeStart, monthStart);
  const dayOfMonth = getDayOfMonth(demoToday);

  const joinedAtById = new Map<string, ISODate>();
  for (const id of ids) {
    const secondDraw = joinedStreamById.get(id)!();
    if (newThisMonthIds.has(id)) {
      const day = 1 + Math.floor(secondDraw * dayOfMonth); // uniform in [1, dayOfMonth]
      joinedAtById.set(id, addDaysISO(monthStart, day - 1));
    } else {
      const offset = 1 + Math.floor(secondDraw * historyRangeDays); // uniform in [1, historyRangeDays]
      joinedAtById.set(id, addDaysISO(monthStart, -offset));
    }
  }

  return ids.map((id, k) => {
    const index = k + 1;
    const pad2 = String(index).padStart(2, '0');
    const pad4 = String(index).padStart(4, '0');
    return {
      id,
      name: `Customer ${pad2}`,
      email: `customer${pad2}@demo.180fitness.app`,
      phone: `+57 300 000 ${pad4}`,
      avatar: null,
      status: statusById.get(id)!,
      membershipId: membershipById.get(id)!,
      joinedAt: joinedAtById.get(id)!,
    };
  });
}
