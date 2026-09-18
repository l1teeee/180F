'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.3. Orchestrates the calendar screen: owns the
// toolbar/selection UI state next/dynamic can't own by itself, gates on the hydration status
// (docs/08-STATE-MANAGEMENT.md section 8.4), and is the one place ScheduleCalendar gets loaded
// through next/dynamic with ssr:false (ADR-012).
import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { CalendarApi } from '@fullcalendar/core';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionCard } from '@/components/shared/section-card';
import { ErrorState } from '@/components/shared/error-state';
import { useCalendarEvents } from '@/hooks/use-calendar-events';
import { useDemoStatus } from '@/hooks/use-demo-status';
import { useMessages } from '@/hooks/use-messages';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { CalendarToolbar, type CalendarViewName } from './calendar-toolbar';
import { SessionDetailsSheet } from './session-details-sheet';

// Event block heights per weekday column - fixed, so the placeholder looks like a week of classes
// without any randomness (ADR-005).
const SKELETON_DAY_BLOCKS: number[][] = [[64, 96, 64], [96, 64], [64, 64, 96], [96, 96], [64, 64], [96], [64, 96]];

function CalendarSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-52" />
      </div>
      <div className="grid grid-cols-7 gap-2">
        {SKELETON_DAY_BLOCKS.map((blocks, day) => (
          <div key={day} className="flex flex-col gap-2">
            <Skeleton className="h-6 w-full" />
            {blocks.map((height, index) => (
              <Skeleton key={index} className="w-full" style={{ height }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const ScheduleCalendar = dynamic(() => import('./schedule-calendar'), {
  ssr: false,
  loading: () => <CalendarSkeleton />,
});

export function CalendarView() {
  const m = useMessages();
  const status = useDemoStatus();
  const isSimulatedLoading = useSimulatedLoading('calendar');
  const demoToday = useDemoRuntimeStore((state) => state.demoToday);
  const demoNow = useDemoRuntimeStore((state) => state.demoNow);
  const events = useCalendarEvents();

  const [view, setView] = useState<CalendarViewName>('timeGridWeek');
  const [rangeTitle, setRangeTitle] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const calendarApiRef = useRef<CalendarApi | null>(null);

  // Stable identity (docs/08-STATE-MANAGEMENT.md section 6 point 5) so schedule-calendar.tsx's
  // mount-only effect never has a reason to refire.
  const handleApiReady = useCallback((api: CalendarApi) => {
    calendarApiRef.current = api;
  }, []);

  const handleViewChange = useCallback((next: CalendarViewName) => {
    setView(next);
    calendarApiRef.current?.changeView(next);
  }, []);

  if (status === 'error') {
    return (
      <SectionCard title={m.calendar.sectionTitle}>
        <ErrorState onRetry={() => void useDemoRuntimeStore.getState().retryHydration()} />
      </SectionCard>
    );
  }

  // Not SectionCard's own `action` slot: CardAction/CardHeader force that slot to shrink-0 in
  // a non-wrapping row, which pushed this toolbar's Week/Month/Day group off the card entirely
  // below ~1024px. Rendering the toolbar as the card body's own first row instead gives it the
  // full card width to wrap into (docs/06 section 3.3 "1024px: toolbar wraps view switch below
  // the date nav if needed").
  return (
    <SectionCard title={m.calendar.sectionTitle}>
      {status !== 'ready' || !demoToday || !demoNow || isSimulatedLoading ? (
        <CalendarSkeleton />
      ) : (
        <div className="flex flex-col gap-4">
          <CalendarToolbar
            view={view}
            onViewChange={handleViewChange}
            rangeTitle={rangeTitle}
            onToday={() => calendarApiRef.current?.today()}
            onPrev={() => calendarApiRef.current?.prev()}
            onNext={() => calendarApiRef.current?.next()}
          />
          <ScheduleCalendar
            events={events}
            initialView={view}
            demoToday={demoToday}
            demoNow={demoNow}
            onEventClick={setSelectedSessionId}
            onRangeChange={setRangeTitle}
            onApiReady={handleApiReady}
          />
          <SessionDetailsSheet
            sessionId={selectedSessionId}
            onOpenChange={(open) => {
              if (!open) setSelectedSessionId(null);
            }}
          />
        </div>
      )}
    </SectionCard>
  );
}
