'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.4: "Tabs: All, Confirmed, Pending, Cancelled,
// Waitlist, each showing a live count." Used as a plain controlled segmented switch - the actual
// panel it switches (BookingsTable) lives outside this component's tree (FilterBar sits between
// them in the page layout), so this renders TabsList/TabsTrigger only, no TabsContent.
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BOOKINGS_TAB_KEYS, type BookingsTabKey } from '@/hooks/use-bookings-tab-counts';
import { BOOKING_STATUS_STYLE } from '@/domain/constants';

const TAB_LABEL: Record<BookingsTabKey, string> = {
  all: 'All',
  confirmed: BOOKING_STATUS_STYLE.confirmed.label,
  pending: BOOKING_STATUS_STYLE.pending.label,
  cancelled: BOOKING_STATUS_STYLE.cancelled.label,
  waitlist: BOOKING_STATUS_STYLE.waitlist.label,
};

export interface StatusTabsProps {
  value: BookingsTabKey;
  onValueChange: (value: BookingsTabKey) => void;
  counts: Record<BookingsTabKey, number>;
}

export function StatusTabs({ value, onValueChange, counts }: StatusTabsProps) {
  return (
    <Tabs value={value} onValueChange={(next) => onValueChange(next as BookingsTabKey)}>
      {/* Horizontally scrollable at 390px (docs/06 section 3.4 responsive row) rather than
          wrapping, so five tabs never break into a ragged second line. */}
      <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
        {BOOKINGS_TAB_KEYS.map((tab) => (
          <TabsTrigger key={tab} value={tab} className="flex-none gap-2">
            {TAB_LABEL[tab]}
            <span className="tabular-nums text-text-tertiary">{counts[tab]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
