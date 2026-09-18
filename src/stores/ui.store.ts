// docs/08-STATE-MANAGEMENT.md section 1. Ephemeral shell state - never seeded by hydrateDemo.
//
// `sidebarCollapsed` is the one exception to "never persisted" (docs/03 section 14.4): it is a
// per-viewer interface preference, not demo data, so it survives a reload like the auth session
// does. The store itself stays a plain synchronous value with no persist middleware - the read
// from `localStorage` happens once, in an effect after AppSidebar mounts, never during render,
// the same hydration discipline ADR-005 applies to demo data. That keeps server-rendered HTML
// and the first client render identical (both start from `false`) so React has nothing to
// reconcile, and only flips state - a normal post-mount update, not a hydration mismatch - once
// the effect reads what was actually stored.
import { create } from 'zustand';

export const SIDEBAR_COLLAPSED_STORAGE_KEY = '180f.ui.sidebar';

interface UiState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  searchOpen: boolean;
  notificationsOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSearchOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()((set, get) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  searchOpen: false,
  notificationsOpen: false,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebarCollapsed: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
}));
