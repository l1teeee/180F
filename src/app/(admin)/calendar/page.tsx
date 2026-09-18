// docs/06-ROUTES-AND-SCREENS.md section 3.3. CalendarView owns the toolbar, the dynamically
// loaded FullCalendar wrapper (ADR-012) and the session details sheet.
import { PageHeader } from '@/components/layout/page-header';
import { CalendarView } from '@/components/calendar/calendar-view';

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Calendar" subtitle="Weekly, monthly and daily view of every scheduled class." />
      <CalendarView />
    </div>
  );
}
