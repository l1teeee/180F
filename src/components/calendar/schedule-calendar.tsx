'use client';

// docs/13-DECISIONS.md ADR-003/ADR-012: FullCalendar only ever renders on the client, loaded by
// calendar-view.tsx through next/dynamic with ssr:false. This file is the one place
// @fullcalendar/* is imported, so that dynamic boundary stays a single, clean leaf component.
//
// Exposes the FullCalendar imperative API through a plain onApiReady callback rather than a
// forwarded ref: the component this file exports is loaded through next/dynamic, and a callback
// prop needs no ref-forwarding support from that dynamic-import boundary to reach the parent.
import { useEffect, useRef } from 'react';
import type { CalendarApi, DatesSetArg, EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core';
import FullCalendarComponent from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { TriangleAlert } from 'lucide-react';
import type { CalendarSessionEventProps } from '@/hooks/use-calendar-events';
import type { ISODate, ISODateTime } from '@/domain/types';
import type { CalendarViewName } from './calendar-toolbar';

export interface ScheduleCalendarProps {
  events: EventInput[];
  initialView: CalendarViewName;
  demoToday: ISODate; // ADR-018 - the only clock this component reads, never the real one
  demoNow: ISODateTime;
  onEventClick: (sessionId: string) => void;
  onRangeChange: (title: string) => void;
  onApiReady: (api: CalendarApi) => void;
}

// docs/03-DESIGN-SYSTEM.md section 10 "status is never colour alone": the accent fill already
// carries the class type, so this label carries the fact colour alone cannot - overbooked (an
// explicit warning icon, task brief: "must read overbooked and say so explicitly rather than
// hiding it behind the clamp") or, failing that, the raw booked/capacity count.
function renderEventContent(arg: EventContentArg) {
  const props = arg.event.extendedProps as CalendarSessionEventProps;
  return (
    <div className="flex w-full items-center justify-between gap-1 overflow-hidden px-0.5 text-[11px] leading-tight">
      <span className="truncate font-semibold">{arg.event.title}</span>
      {props.overbooked ? (
        <TriangleAlert aria-label="Overbooked" className="h-3 w-3 shrink-0 text-danger-text" />
      ) : (
        <span className="shrink-0 tabular-nums">
          {props.occupancyState === 'full' ? 'FULL' : `${props.booked}/${props.capacity}`}
        </span>
      )}
    </div>
  );
}

export default function ScheduleCalendar({
  events,
  initialView,
  demoToday,
  demoNow,
  onEventClick,
  onRangeChange,
  onApiReady,
}: ScheduleCalendarProps) {
  const calendarRef = useRef<FullCalendarComponent>(null);

  // Runs once on mount - by then FullCalendarComponent's own componentDidMount has already run
  // synchronously, so getApi() is available. calendar-view.tsx passes a useCallback-stabilised
  // onApiReady, so this never needs to refire on a later prop change.
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) onApiReady(api);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-[720px] [--fc-border-color:var(--color-border)] [--fc-today-bg-color:var(--color-purple-xsoft)] [--fc-now-indicator-color:var(--color-danger-deep)] [--fc-page-bg-color:transparent]">
      <FullCalendarComponent
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={initialView}
        // ADR-018: initialDate/now read the demo clock, never new Date().
        initialDate={demoToday}
        now={demoNow}
        headerToolbar={false}
        height="100%"
        firstDay={1}
        slotMinTime="06:00:00"
        slotMaxTime="21:00:00"
        nowIndicator
        expandRows
        dayMaxEvents={3}
        eventDisplay="block"
        events={events}
        eventContent={renderEventContent}
        eventClick={(arg: EventClickArg) => onEventClick(arg.event.id)}
        datesSet={(arg: DatesSetArg) => onRangeChange(arg.view.title)}
      />
    </div>
  );
}
