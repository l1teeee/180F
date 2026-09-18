// Route skeleton only - Phase 6 replaces this with ClassGrid, 8 ClassCards (docs/06 section 3.7).
import { Dumbbell } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { SectionCard } from '@/components/shared/section-card';

export default function ClassesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Classes" subtitle="The full class catalog and weekly demand." />
      <SectionCard title="Class catalog">
        <EmptyState
          icon={Dumbbell}
          title="This screen isn't built yet"
          description="Phase 6 adds the 8 class-type cards with weekly sessions and average occupancy."
        />
      </SectionCard>
    </div>
  );
}
