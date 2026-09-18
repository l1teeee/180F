// docs/08-STATE-MANAGEMENT.md section 1. push() takes `createdAt` from its caller (which
// already has useDemoRuntimeStore.demoNow in scope for its own eligibility check) rather than
// reading the demo clock itself - that keeps this store's only cross-store relationship an
// inbound one (docs/08 section 8.5's three edges), not an outbound read of another store.
import { create } from 'zustand';
import type { Notification } from '@/domain/types';
import { scheduleSnapshotWrite } from './demo-persistence';

let liveNotificationCounter = 0;

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
    liveNotificationCounter += 1;
    const notification: Notification = { ...input, id: `ntf-live-${liveNotificationCounter}`, read: false };
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
