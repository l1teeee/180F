'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.7 / master plan section 27.
import { ClassGrid } from '@/components/classes/class-grid';
import { PageHeader } from '@/components/layout/page-header';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { useClassesCatalog } from '@/hooks/use-classes-catalog';
import { useMessages } from '@/hooks/use-messages';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';

export default function ClassesPage() {
  const m = useMessages();
  const status = useDemoRuntimeStore((state) => state.status);
  const isSimulatedLoading = useSimulatedLoading('classes');
  const retryHydration = useDemoRuntimeStore((state) => state.retryHydration);
  const catalog = useClassesCatalog();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={m.classes.pageTitle} subtitle={m.classes.pageSubtitle} />
      {status === 'error' ? (
        <ErrorState title={m.classes.errorTitle} onRetry={retryHydration} />
      ) : status !== 'ready' || !catalog || isSimulatedLoading ? (
        <LoadingSkeleton
          variant="class-card"
          count={8}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        />
      ) : (
        <ClassGrid classTypes={catalog.classTypes} instructorById={catalog.instructorById} />
      )}
    </div>
  );
}
