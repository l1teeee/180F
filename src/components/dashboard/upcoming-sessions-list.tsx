// docs/07-COMPONENT-ARCHITECTURE.md section 3: wraps UpcomingSessionCard items.
import { UpcomingSessionCard } from './upcoming-session-card';
import type { SessionCard } from '@/domain/types';

export interface UpcomingSessionsListProps {
  sessions: SessionCard[];
}

export function UpcomingSessionsList({ sessions }: UpcomingSessionsListProps) {
  return (
    <div className="flex flex-col gap-3">
      {sessions.map((session) => (
        <UpcomingSessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}
