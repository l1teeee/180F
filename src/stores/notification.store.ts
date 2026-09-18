// docs/08-STATE-MANAGEMENT.md section 1. push() takes `createdAt` from its caller (which
// already has useDemoRuntimeStore.demoNow in scope for its own eligibility check) rather than
// reading the demo clock itself - that keeps this store's only cross-store relationship an
// inbound one (docs/08 section 8.5's three edges), not an outbound read of another store.
import { create } from 'zustand';
import type { Notification } from '@/domain/types';
// Imported from the file directly, not the '@/services/repositories' barrel: unlike that
// barrel's actual repositories, this sequence has no future-backend swap seam (ADR-009) - a
// real backend would assign notification ids itself - so it does not belong to the barrel's
// promise that stores only reach mock-*.ts internals through it.
import { createLiveIdSequence } from '@/services/repositories/live-id-sequence';
import { scheduleSnapshotWrite } from './demo-persistence';

// `ntf-live-<n>`, the same reload-safe-sequence treatment mock-booking-repository.ts and
// mock-customer-repository.ts give their own live ids (see live-id-sequence.ts) - a plain
// module-level counter here would restart at 0 in a second tab or after a reload exactly like
// the customer-id bug did, and mint an id ADR-022's restored snapshot already used.
const nextLiveNotificationId = createLiveIdSequence('180f.demo.v1.liveNotificationSeq');

interface NotificationState {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  push: (input: Omit<Notification, 'id' | 'read'>) => void;
  markRead: (notificationId: string) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],

  setNotifications: (notifications) => set({ notifications }),

  push: (input) => {
    const notification: Notification = { ...input, id: `ntf-live-${nextLiveNotificationId()}`, read: false };
    set((state) => ({ notifications: [notification, ...state.notifications] }));
    scheduleSnapshotWrite();
  },

  markRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification,
      ),
    }));
    scheduleSnapshotWrite();
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
    }));
    scheduleSnapshotWrite();
  },
}));
