'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.3: "A toolbar with view switching and a Today control
// using the ink pill treatment." Pure presentational - it knows nothing about FullCalendar's own
// API; schedule-calendar.tsx exposes today/prev/next through an imperative handle and calendar-
// view.tsx wires the two together, so this component only ever calls the callbacks it is given.
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type CalendarViewName = 'timeGridWeek' | 'dayGridMonth' | 'timeGridDay';

const VIEW_OPTIONS: { view: CalendarViewName; label: string }[] = [
  { view: 'timeGridWeek', label: 'Week' },
  { view: 'dayGridMonth', label: 'Month' },
  { view: 'timeGridDay', label: 'Day' },
];

export interface CalendarToolbarProps {
  view: CalendarViewName;
  onViewChange: (view: CalendarViewName) => void;
  rangeTitle: string;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function CalendarToolbar({ view, onViewChange, rangeTitle, onToday, onPrev, onNext }: CalendarToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Button type="button" variant="icon" aria-label="Previous period" onClick={onPrev}>
          <ChevronLeft aria-hidden="true" />
        </Button>
        <Button type="button" variant="icon" aria-label="Next period" onClick={onNext}>
          <ChevronRight aria-hidden="true" />
        </Button>
        <Button type="button" variant="secondary" onClick={onToday}>
          Today
        </Button>
        <span className="pl-1 text-sm font-semibold whitespace-nowrap text-ink">{rangeTitle}</span>
      </div>

      {/* The "ink pill" treatment: the active view is the same filled-black pill as
          Button variant="ink" elsewhere (docs/03 section 5); inactive views are plain ghost text
          in the same row, functioning as a small segmented control. */}
      <div
        role="group"
        aria-label="Calendar view"
        className="flex items-center gap-1 rounded-field bg-surface-muted p-1"
      >
        {VIEW_OPTIONS.map((option) => (
          <Button
            key={option.view}
            type="button"
            variant={option.view === view ? 'ink' : 'ghost'}
            aria-pressed={option.view === view}
            onClick={() => onViewChange(option.view)}
            className="h-8 px-4"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
