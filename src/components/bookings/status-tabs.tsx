'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.4: "Tabs: All, Confirmed, Pending, Cancelled,
// Waitlist, each showing a live count." Used as a plain controlled segmented switch - the actual
// panel it switches (BookingsTable) lives outside this component's tree (FilterBar sits between
// them in the page layout), so this renders TabsList/TabsTrigger only, no TabsContent.
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BOOKINGS_TAB_KEYS, type BookingsTabKey } from '@/hooks/use-bookings-tab-counts';
import { useMessages } from '@/hooks/use-messages';

export interface StatusTabsProps {
  value: BookingsTabKey;
  onValueChange: (value: BookingsTabKey) => void;
  counts: Record<BookingsTabKey, number>;
}

export function StatusTabs({ value, onValueChange, counts }: StatusTabsProps) {
  const m = useMessages();
  // Keyed by the domain id, never a second status->colour map (CLAUDE.md rule 6 / docs/07
  // section 7 anti-patterns): status-styles.ts still owns the accent, this only owns the copy.
  const TAB_LABEL: Record<BookingsTabKey, string> = {
    all: m.bookings.tabs.all,
    confirmed: m.bookings.bookingStatusLabel.confirmed,
    pending: m.bookings.bookingStatusLabel.pending,
    cancelled: m.bookings.bookingStatusLabel.cancelled,
    waitlist: m.bookings.bookingStatusLabel.waitlist,
  };

  return (
    <Tabs value={value} onValueChange={(next) => onValueChange(next as BookingsTabKey)}>
      {/* Horizontally scrollable at 390px (docs/06 section 3.4 responsive row) rather than
          wrapping, so five tabs never break into a ragged second line. Scrollbar hidden (still
          scrollable by touch/trackpad) - a bare OS scrollbar under a pill tab row is exactly the
          "reads as stock" look docs/03's graphic line rejects. */}
      {/* h-12 grows the list to fit the 40px trigger below plus its 4px p-1 padding on each
          side; sm: hands both back to the shared 40px/32px pair above that breakpoint. */}
      <TabsList className="h-12 w-full justify-start overflow-x-auto [scrollbar-width:none] sm:h-10 sm:w-fit [&::-webkit-scrollbar]:hidden">
        {BOOKINGS_TAB_KEYS.map((tab) => (
          // Base TabsTrigger is a fixed 32px (ui/tabs.tsx); the 40px minimum touch target holds
          // at mobile width, matching every other control here (docs/03 section 5 "controls 40px
          // tall") - sm: hands it back to the shared 32px pill above that breakpoint.
          <TabsTrigger key={tab} value={tab} className="h-10 flex-none gap-2 sm:h-8">
            {TAB_LABEL[tab]}
            <span className="tabular-nums text-text-tertiary">{counts[tab]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
