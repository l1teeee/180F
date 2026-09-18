// docs/06-ROUTES-AND-SCREENS.md section 3.12: toggleAutomation(id) flips active<->paused
// (a 'draft' automation activates too) and raises the matching toast - only "Automation
// activated" is named in master plan section 32, so its deactivate/pause counterpart follows
// the same status-label vocabulary already defined in domain/constants/status-styles.ts.
import { useMemo } from 'react';
import { toast } from 'sonner';
import type { Automation } from '@/domain/types';
import { useAutomationStore } from '@/stores/automation.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';

export interface AutomationsList {
  automations: Automation[];
  toggleAutomation: (id: string) => void;
}

export function useAutomationsList(): AutomationsList | null {
  const status = useDemoRuntimeStore((state) => state.status);
  const automations = useAutomationStore((state) => state.automations);
  const setAutomationStatus = useAutomationStore((state) => state.toggleAutomation);

  return useMemo(() => {
    if (status !== 'ready') return null;

    return {
      automations,
      toggleAutomation: (id: string) => {
        const current = automations.find((automation) => automation.id === id);
        if (!current) return;
        const nextStatus = current.status === 'active' ? 'paused' : 'active';
        setAutomationStatus(id, nextStatus);
        toast.success(nextStatus === 'active' ? 'Automation activated' : 'Automation paused');
      },
    };
  }, [status, automations, setAutomationStatus]);
}
