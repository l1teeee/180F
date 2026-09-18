// docs/06-ROUTES-AND-SCREENS.md section 3.5: SearchInput + status filter + membership filter,
// composed inside the shared FilterBar. Purely prop-driven (no store/hook reads), so it carries
// no 'use client' directive of its own - same convention as shared/filter-bar.tsx.
import { FilterBar } from '@/components/shared/filter-bar';
import { SearchInput } from '@/components/shared/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CUSTOMER_STATUS_STYLE } from '@/domain/constants';
import type { CustomerFilters, CustomerStatus, MembershipPlan } from '@/domain/types';

export interface CustomersFilterBarProps {
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  membershipPlans: MembershipPlan[];
}

const EMPTY_FILTERS: CustomerFilters = { query: '', status: 'all', membershipId: 'all' };
const STATUS_OPTIONS: (CustomerStatus | 'all')[] = ['all', 'active', 'paused', 'inactive'];

export function CustomersFilterBar({ filters, onFiltersChange, membershipPlans }: CustomersFilterBarProps) {
  const hasActiveFilters = filters.query !== '' || filters.status !== 'all' || filters.membershipId !== 'all';

  return (
    <FilterBar onReset={hasActiveFilters ? () => onFiltersChange(EMPTY_FILTERS) : undefined}>
      <div className="w-full sm:max-w-xs">
        <SearchInput
          value={filters.query}
          onChange={(query) => onFiltersChange({ ...filters, query })}
          placeholder="Search customers..."
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(status) => onFiltersChange({ ...filters, status: status as CustomerStatus | 'all' })}
      >
        <SelectTrigger aria-label="Filter by status" className="w-full sm:w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem key={status} value={status}>
              {status === 'all' ? 'All statuses' : CUSTOMER_STATUS_STYLE[status].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.membershipId} onValueChange={(membershipId) => onFiltersChange({ ...filters, membershipId })}>
        <SelectTrigger aria-label="Filter by membership" className="w-full sm:w-48">
          <SelectValue placeholder="Membership" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All memberships</SelectItem>
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
