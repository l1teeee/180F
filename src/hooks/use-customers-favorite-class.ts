// CustomerStats (docs/07-COMPONENT-ARCHITECTURE.md section 4) carries only `favoriteClassTypeId`
// - resolving it to a display name needs `classTypes`, which docs/08-STATE-MANAGEMENT.md section
// 5 confines to src/hooks, so the lookup lives here rather than inside the presentational
// component or the page.
import { useMemo } from 'react';
import { useCatalogStore } from '@/stores/catalog.store';

export function useCustomersFavoriteClassName(classTypeId: string | null): string | null {
  const classTypes = useCatalogStore((state) => state.classTypes);

  return useMemo(() => {
    if (!classTypeId) return null;
    return classTypes.find((classType) => classType.id === classTypeId)?.name ?? null;
  }, [classTypes, classTypeId]);
}
