'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.4: "Filters: search, status, date and source,
// combinable, in a FilterBar." Composes the shared FilterBar (docs/07-COMPONENT-ARCHITECTURE.md
// section 4) with the four controls; filter state itself is held by the page
// (docs/08-STATE-MANAGEMENT.md section 6: transient filter input, not store state).
import { FilterBar } from '@/components/shared/filter-bar';
import { SearchInput } from '@/components/shared/search-input';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BOOKING_SOURCE_STYLE, BOOKING_STATUS_STYLE } from '@/domain/constants';
import type { BookingFilters } from '@/domain/types';

export interface BookingFiltersBarProps {
  filters: BookingFilters;
  onFiltersChange: (filters: BookingFilters) => void;
  onReset: () => void;
}

const STATUS_OPTIONS = Object.entries(BOOKING_STATUS_STYLE) as [keyof typeof BOOKING_STATUS_STYLE, { label: string }][];
const SOURCE_OPTIONS = Object.entries(BOOKING_SOURCE_STYLE) as [keyof typeof BOOKING_SOURCE_STYLE, { label: string }][];

export function BookingFiltersBar({ filters, onFiltersChange, onReset }: BookingFiltersBarProps) {
  return (
    <FilterBar onReset={onReset}>
      <div className="w-full sm:w-64">
        <SearchInput
          value={filters.query}
          onChange={(query) => onFiltersChange({ ...filters, query })}
          placeholder="Search by customer..."
        />
      </div>

      <Select value={filters.status} onValueChange={(status) => onFiltersChange({ ...filters, status: status as BookingFilters['status'] })}>
        <SelectTrigger aria-label="Filter by status" className="w-full sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUS_OPTIONS.map(([status, style]) => (
            <SelectItem key={status} value={status}>
              {style.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.source} onValueChange={(source) => onFiltersChange({ ...filters, source: source as BookingFilters['source'] })}>
        <SelectTrigger aria-label="Filter by source" className="w-full sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sources</SelectItem>
          {SOURCE_OPTIONS.map(([source, style]) => (
            <SelectItem key={source} value={source}>
              {style.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        id="bookings-date-filter"
        name="date"
        aria-label="Filter by date"
        value={filters.date ?? ''}
        onChange={(event) => onFiltersChange({ ...filters, date: event.target.value || null })}
        className="w-full sm:w-40"
      />
    </FilterBar>
  );
}
