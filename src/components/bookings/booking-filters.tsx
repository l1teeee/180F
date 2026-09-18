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
import { useMessages } from '@/hooks/use-messages';

export interface BookingFiltersBarProps {
  filters: BookingFilters;
  onFiltersChange: (filters: BookingFilters) => void;
  onReset: () => void;
}

// Iterated for the domain ids only (BOOKING_STATUS_STYLE/BOOKING_SOURCE_STYLE still own the
// accent) - the label text itself is looked up in m.bookings, never the constant's own English
// label, per CLAUDE.md rule 6.
const STATUS_KEYS = Object.keys(BOOKING_STATUS_STYLE) as (keyof typeof BOOKING_STATUS_STYLE)[];
const SOURCE_KEYS = Object.keys(BOOKING_SOURCE_STYLE) as (keyof typeof BOOKING_SOURCE_STYLE)[];

export function BookingFiltersBar({ filters, onFiltersChange, onReset }: BookingFiltersBarProps) {
  const m = useMessages();

  return (
    <FilterBar onReset={onReset}>
      <div className="w-full sm:w-64">
        <SearchInput
          value={filters.query}
          onChange={(query) => onFiltersChange({ ...filters, query })}
          placeholder={m.bookings.filters.searchPlaceholder}
        />
      </div>

      <Select value={filters.status} onValueChange={(status) => onFiltersChange({ ...filters, status: status as BookingFilters['status'] })}>
        <SelectTrigger aria-label={m.bookings.filters.filterByStatus} className="w-full sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{m.bookings.filters.allStatuses}</SelectItem>
          {STATUS_KEYS.map((status) => (
            <SelectItem key={status} value={status}>
              {m.bookings.bookingStatusLabel[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.source} onValueChange={(source) => onFiltersChange({ ...filters, source: source as BookingFilters['source'] })}>
        <SelectTrigger aria-label={m.bookings.filters.filterBySource} className="w-full sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{m.bookings.filters.allSources}</SelectItem>
          {SOURCE_KEYS.map((source) => (
            <SelectItem key={source} value={source}>
              {m.bookings.bookingSourceLabel[source]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        id="bookings-date-filter"
        name="date"
        aria-label={m.bookings.filters.filterByDate}
        value={filters.date ?? ''}
        onChange={(event) => onFiltersChange({ ...filters, date: event.target.value || null })}
        className="w-full sm:w-40"
      />
    </FilterBar>
  );
}
