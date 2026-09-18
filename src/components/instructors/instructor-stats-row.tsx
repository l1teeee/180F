// docs/06-ROUTES-AND-SCREENS.md section 3.10 stats row: classes this month, reservations,
// occupancy, rating. No business arithmetic here beyond a display-unit conversion (rate -> whole
// percentage points) - every value itself already comes from selectInstructorStats.
import { StatCard } from '@/components/shared/stat-card';
import type { InstructorWithStats } from '@/domain/types';
import { useMessages } from '@/hooks/use-messages';

function toPercentValue(rate: number): number {
  return Math.round(rate * 100);
}

export function InstructorStatsRow({ instructor }: { instructor: InstructorWithStats }) {
  const m = useMessages();
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label={m.instructors.stats.classesThisMonth} value={instructor.classesThisMonth} accent="purple" />
      <StatCard label={m.instructors.stats.reservations} value={instructor.reservations} accent="blue" />
      <StatCard label={m.instructors.stats.occupancy} value={toPercentValue(instructor.occupancyRate)} unit="%" accent="green" />
      <StatCard
        label={m.instructors.stats.rating}
        value={instructor.rating.toFixed(1)}
        unit={m.instructors.stats.ratingUnit}
        accent="yellow"
      />
    </div>
  );
}
