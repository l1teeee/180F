// docs/08-STATE-MANAGEMENT.md section 1.
import { create } from 'zustand';
import type { ClassSession } from '@/domain/types';

interface SessionState {
  sessions: ClassSession[];
  setSessions: (sessions: ClassSession[]) => void;
  updateSession: (sessionId: string, changes: Partial<Omit<ClassSession, 'id'>>) => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  sessions: [],

  setSessions: (sessions) => set({ sessions }),

  updateSession: (sessionId, changes) =>
    set((state) => ({
      sessions: state.sessions.map((session) => (session.id === sessionId ? { ...session, ...changes } : session)),
    })),
}));
