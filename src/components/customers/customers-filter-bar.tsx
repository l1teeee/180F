'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.5: SearchInput + status filter + membership filter,
// composed inside the shared FilterBar. Needs 'use client' for useMessages (the status labels
// come from this namespace, not CUSTOMER_STATUS_STYLE's own English label - docs/07 section 7:
// that map stays the single source of truth for accent, this namespace for the customers
// screens' text).
import { FilterBar } from '@/components/shared/filter-bar';
import { SearchInput } from '@/components/shared/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CustomerFilters, CustomerStatus, MembershipPlan } from '@/domain/types';
import { useMessages } from '@/hooks/use-messages';

export interface CustomersFilterBarProps {
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  membershipPlans: MembershipPlan[];
}

const EMPTY_FILTERS: CustomerFilters = { query: '', status: 'all', membershipId: 'all' };
const STATUS_OPTIONS: (CustomerStatus | 'all')[] = ['all', 'active', 'paused', 'inactive'];

export function CustomersFilterBar({ filters, onFiltersChange, membershipPlans }: CustomersFilterBarProps) {
  const m = useMessages();
  const hasActiveFilters = filters.query !== '' || filters.status !== 'all' || filters.membershipId !== 'all';

  return (
    <FilterBar onReset={hasActiveFilters ? () => onFiltersChange(EMPTY_FILTERS) : undefined}>
      <div className="w-full sm:max-w-xs">
        <SearchInput
          value={filters.query}
          onChange={(query) => onFiltersChange({ ...filters, query })}
          placeholder={m.customers.filters.searchPlaceholder}
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(status) => onFiltersChange({ ...filters, status: status as CustomerStatus | 'all' })}
      >
        <SelectTrigger aria-label={m.customers.filters.statusAriaLabel} className="w-full sm:w-44">
          <SelectValue placeholder={m.customers.filters.statusPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem key={status} value={status}>
              {status === 'all' ? m.customers.filters.allStatuses : m.customers.status[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.membershipId} onValueChange={(membershipId) => onFiltersChange({ ...filters, membershipId })}>
        <SelectTrigger aria-label={m.customers.filters.membershipAriaLabel} className="w-full sm:w-48">
          <SelectValue placeholder={m.customers.filters.membershipPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{m.customers.filters.allMemberships}</SelectItem>
          {membershipPlans.map((plan) => (
            <SelectItem key={plan.id} value={plan.id}>
              {plan.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
