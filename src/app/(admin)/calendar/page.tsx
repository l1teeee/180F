'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.3. CalendarView owns the toolbar, the dynamically
// loaded FullCalendar wrapper (ADR-012) and the session details sheet.
// 'use client': this page fetches nothing (ADR-004, no server data fetching anywhere) and every
// other admin page is already a client component; it needs useMessages, which is a client hook.
import { PageHeader } from '@/components/layout/page-header';
import { CalendarView } from '@/components/calendar/calendar-view';
import { useMessages } from '@/hooks/use-messages';

export default function CalendarPage() {
  const m = useMessages();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={m.calendar.pageTitle} subtitle={m.calendar.pageSubtitle} />
      <CalendarView />
    </div>
  );
}
