import { useMemo } from 'react';
import { selectGlobalSearch } from '@/domain/selectors';
import type { SearchResult } from '@/domain/types';
import { useCatalogStore } from '@/stores/catalog.store';
import { useCustomerStore } from '@/stores/customer.store';
import { useInstructorStore } from '@/stores/instructor.store';

export function useGlobalSearch(query: string): SearchResult[] {
  const customers = useCustomerStore((state) => state.customers);
  const classTypes = useCatalogStore((state) => state.classTypes);
  const instructors = useInstructorStore((state) => state.instructors);

  return useMemo(
    () => selectGlobalSearch(query, customers, classTypes, instructors),
    [query, customers, classTypes, instructors],
  );
}
