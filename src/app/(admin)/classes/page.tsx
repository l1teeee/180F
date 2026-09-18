'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.7 / master plan section 27.
import { ClassGrid } from '@/components/classes/class-grid';
import { PageHeader } from '@/components/layout/page-header';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { useClassesCatalog } from '@/hooks/use-classes-catalog';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';

export default function ClassesPage() {
  const status = useDemoRuntimeStore((state) => state.status);
  const retryHydration = useDemoRuntimeStore((state) => state.retryHydration);
  const catalog = useClassesCatalog();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Classes" subtitle="The full class catalog and weekly demand." />
      {status === 'error' ? (
        <ErrorState onRetry={retryHydration} />
      ) : status !== 'ready' || !catalog ? (
        <LoadingSkeleton
          variant="card"
          count={8}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        />
      ) : (
        <ClassGrid classTypes={catalog.classTypes} instructorById={catalog.instructorById} />
      )}
    </div>
  );
}
