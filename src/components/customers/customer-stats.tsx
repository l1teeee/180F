'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 4: classes this month, attendance rate, no-shows,
// favorite class - the stats row on /customers/[id] (docs/06 section 3.6). `favoriteClassName` is
// one field beyond that document's literal `Pick<...>` prop shape: the Pick carries only
// `favoriteClassTypeId`, an id with nothing to display, so the caller resolves it (via
// useCustomersFavoriteClassName, docs/08-STATE-MANAGEMENT.md section 5) and passes the name down
// - needs 'use client' now for useMessages.
import { CalendarCheck, Heart, TrendingUp, UserX } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import type { CustomerWithStats } from '@/domain/types';
import { useMessages } from '@/hooks/use-messages';

export interface CustomerStatsProps {
  stats: Pick<CustomerWithStats, 'classesThisMonth' | 'attendanceRate' | 'noShows' | 'favoriteClassTypeId'>;
  favoriteClassName: string | null;
}

export function CustomerStats({ stats, favoriteClassName }: CustomerStatsProps) {
  const m = useMessages();
  // Stays at 2 columns rather than escalating to 4: this row always sits inside the detail
  // page's narrower 8/12 column (docs/06 section 3.6), which stops growing past roughly 960px
  // even on a very wide viewport (main is capped at max-w-[1500px]) - a 4-up grid here wraps
  // "Classes this month" onto three lines at the 1440px primary width with room to spare.
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <StatCard label={m.customers.detail.stats.classesThisMonth} value={stats.classesThisMonth} icon={CalendarCheck} accent="purple" />
      {/* attendanceRate is already 0..100 (docs/04-DOMAIN-MODEL.md section 3), not a 0..1 fraction
          - it renders directly as the StatCard value + a "%" unit, not through formatPercent. */}
      <StatCard label={m.customers.detail.stats.attendanceRate} value={stats.attendanceRate} unit="%" icon={TrendingUp} accent="green" />
      <StatCard label={m.customers.detail.stats.noShows} value={stats.noShows} icon={UserX} accent="pink" />
      <StatCard
        label={m.customers.detail.stats.favoriteClass}
        value={favoriteClassName ?? m.customers.detail.stats.noneYet}
        icon={Heart}
        accent="yellow"
      />
    </div>
  );
}
