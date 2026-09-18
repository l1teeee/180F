// docs/07-COMPONENT-ARCHITECTURE.md section 3: stack of OccupancyBar (shared) from
// ClassOccupancyPoint[], ordered by demand (master plan section 19, useDashboardClassOccupancy).
// docs/03-DESIGN-SYSTEM.md section 6 "Occupancy bars": horizontal, accent fill, percentage in
// tabular numerals to the right - all handled inside the shared OccupancyBar itself.
import { EmptyState } from '@/components/shared/empty-state';
import { OccupancyBar } from '@/components/shared/occupancy-bar';
import type { ClassOccupancyPoint } from '@/domain/types';

export interface ClassOccupancyListProps {
  data: ClassOccupancyPoint[];
}

export function ClassOccupancyList({ data }: ClassOccupancyListProps) {
  if (data.length === 0) {
    return <EmptyState title="No classes scheduled" description="Class occupancy will appear once classes run." />;
  }

  return (
    <div className="flex flex-col gap-4">
      {data.map((point) => (
        <OccupancyBar key={point.classTypeId} label={point.name} accent={point.accent} rate={point.occupancyRate} />
      ))}
    </div>
  );
}
