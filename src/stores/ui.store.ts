// docs/08-STATE-MANAGEMENT.md section 1. Ephemeral shell state only - never persisted, never
// seeded by hydrateDemo.
import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  searchOpen: boolean;
  notificationsOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: true,
  searchOpen: false,
  notificationsOpen: false,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
}));
