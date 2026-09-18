'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3: wraps UpcomingSessionCard items.
import { EmptyState } from '@/components/shared/empty-state';
import { UpcomingSessionCard } from './upcoming-session-card';
import type { SessionCard } from '@/domain/types';
import { useMessages } from '@/hooks/use-messages';

export interface UpcomingSessionsListProps {
  sessions: SessionCard[];
}

export function UpcomingSessionsList({ sessions }: UpcomingSessionsListProps) {
  const m = useMessages();

  if (sessions.length === 0) {
    return (
      <EmptyState
        title={m.dashboard.emptyStates.noUpcomingClasses.title}
        description={m.dashboard.emptyStates.noUpcomingClasses.description}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((session) => (
        <UpcomingSessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}
