// docs/08-STATE-MANAGEMENT.md section 1. sendTestMessage() never makes a real network call
// (CLAUDE.md "Rules that get work rejected") - it only simulates the round trip so the
// WhatsApp preview UI has something to show a pending state for.
import { create } from 'zustand';
import type { Automation, AutomationStatus } from '@/domain/types';

// A fixed UI-feedback delay, not a data-latency simulation (src/services/repositories/latency.ts
// is a different concern - see that file's own comment) - a constant is already deterministic.
// Master plan section 33 / docs/06 specify ~800ms.
const TEST_MESSAGE_DELAY_MS = 800;

interface AutomationState {
  automations: Automation[];
  sending: string | null;
  setAutomations: (automations: Automation[]) => void;
  toggleAutomation: (automationId: string, status: AutomationStatus) => void;
  sendTestMessage: (automationId: string) => Promise<void>;
}

export const useAutomationStore = create<AutomationState>()((set) => ({
  automations: [],
  sending: null,

  setAutomations: (automations) => set({ automations }),

  toggleAutomation: (automationId, status) =>
    set((state) => ({
      automations: state.automations.map((automation) =>
        automation.id === automationId ? { ...automation, status } : automation,
      ),
    })),

  sendTestMessage: async (automationId) => {
    set({ sending: automationId });
    try {
      await new Promise((resolve) => setTimeout(resolve, TEST_MESSAGE_DELAY_MS));
    } finally {
      set({ sending: null });
    }
  },
}));
