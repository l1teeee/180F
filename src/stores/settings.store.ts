// docs/08-STATE-MANAGEMENT.md section 1. Per ADR-019 this store owns studio identity
// (general.studioName/email/phone/address/timezone) from hydration onward - every screen,
// including the public booking confirmation, reads it rather than useCatalogStore.
import { create } from 'zustand';
import type { StudioSettings } from '@/domain/types';

interface SettingsState {
  settings: StudioSettings | null;
  setSettings: (settings: StudioSettings) => void;
  updateSection: <K extends keyof StudioSettings>(section: K, changes: Partial<StudioSettings[K]>) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  settings: null,

  setSettings: (settings) => set({ settings }),

  updateSection: (section, changes) =>
    set((state) => {
      if (!state.settings) return state;
      return {
        settings: { ...state.settings, [section]: { ...state.settings[section], ...changes } },
      };
    }),
}));
