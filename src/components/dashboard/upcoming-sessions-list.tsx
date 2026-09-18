// docs/07-COMPONENT-ARCHITECTURE.md section 3: wraps UpcomingSessionCard items.
import { EmptyState } from '@/components/shared/empty-state';
import { UpcomingSessionCard } from './upcoming-session-card';
import type { SessionCard } from '@/domain/types';

export interface UpcomingSessionsListProps {
  sessions: SessionCard[];
}

export function UpcomingSessionsList({ sessions }: UpcomingSessionsListProps) {
  if (sessions.length === 0) {
    return <EmptyState title="No upcoming classes" description="Scheduled classes will show up here." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((session) => (
        <UpcomingSessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}
