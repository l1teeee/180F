// docs/03-DESIGN-SYSTEM.md section 11.4-F + docs/06-ROUTES-AND-SCREENS.md section 3.12. Renders
// one automation's messageTemplate for the WhatsApp preview bubble. This preview is not tied to
// any real booking or customer, so className/sessionDayLabel/sessionTime are fixed illustrative
// sample values matching the literal preview copy in docs/06 3.12 and master plan section 33 -
// the same kind of hand-authored demo content src/data/automations.ts's templates already are.
// studioName and customerFirstName instead come from the live settings/customer stores, so they
// never drift from what the rest of the app shows.
import { useMemo } from 'react';
import { toast } from 'sonner';
import type { Automation } from '@/domain/types';
import { useAutomationStore } from '@/stores/automation.store';
import { useCustomerStore } from '@/stores/customer.store';
import { useSettingsStore } from '@/stores/settings.store';

const SAMPLE_CLASS_NAME = 'Functional Training';
const SAMPLE_SESSION_DAY_LABEL = 'Friday, September 18';
const SAMPLE_SESSION_TIME = '6:00 PM';
const FALLBACK_STUDIO_NAME = '180 Fitness Studio';
const FALLBACK_CUSTOMER_NAME = 'Customer 01';

function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => values[key] ?? match);
}

export interface AutomationPreview {
  message: string; // automation.name + a blank line + the rendered template, \n preserved
  isSending: boolean;
  sendTest: () => void;
  editTemplate: () => void;
}

export function useAutomationPreview(automation: Automation): AutomationPreview {
  const sendingId = useAutomationStore((state) => state.sending);
  const sendTestMessage = useAutomationStore((state) => state.sendTestMessage);
  const firstCustomerName = useCustomerStore((state) => state.customers[0]?.name ?? FALLBACK_CUSTOMER_NAME);
  const studioName = useSettingsStore((state) => state.settings?.general.studioName ?? FALLBACK_STUDIO_NAME);

  const message = useMemo(() => {
    const body = interpolate(automation.messageTemplate, {
      className: SAMPLE_CLASS_NAME,
      sessionDayLabel: SAMPLE_SESSION_DAY_LABEL,
      sessionTime: SAMPLE_SESSION_TIME,
      customerFirstName: firstCustomerName,
      studioName,
    });
    return `${automation.name}\n\n${body}`;
  }, [automation.name, automation.messageTemplate, firstCustomerName, studioName]);

  return {
    message,
    isSending: sendingId === automation.id,
    sendTest: () => {
      void sendTestMessage(automation.id).then(() => toast.success('Test message sent'));
    },
    // No template editor exists in this demo (master plan sections 31-33 scope Phase 7 to
    // catalog display and simulated sending only) - mirrors the login page's "Forgot password"
    // precedent for a documented-but-inert affordance (src/app/(auth)/login/page.tsx).
    editTemplate: () => toast.info("Editing templates isn't available in this demo."),
  };
}
