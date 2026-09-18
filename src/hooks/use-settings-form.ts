// docs/08-STATE-MANAGEMENT.md section 8.7 (ADR-019): useSettingsStore.general is the single live
// owner of studio identity; every settings section writes through the same updateSection action
// so there is exactly one place that ever mutates settings.
import { useShallow } from 'zustand/react/shallow';
import { useSettingsStore } from '@/stores/settings.store';

export function useSettingsForm() {
  return useSettingsStore(
    useShallow((state) => ({ settings: state.settings, updateSection: state.updateSection })),
  );
}
