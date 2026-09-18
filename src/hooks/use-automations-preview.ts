// docs/03-DESIGN-SYSTEM.md section 11.4-F + docs/06-ROUTES-AND-SCREENS.md section 3.12. Renders
// one automation's message for the WhatsApp preview bubble. This preview is not tied to any real
// booking or customer, so the sample class name is a fixed illustrative value
// (src/i18n/dictionaries/{es,en}/automations.ts samplePreview.className) and the sample session
// day/time is "tomorrow, 6pm" relative to the seeded demoToday - both match the literal preview
// copy in docs/06 3.12 and master plan section 33, the same kind of hand-authored demo content
// src/data/automations.ts's templates already were. studioName and customerFirstName instead
// come from the live settings/customer stores, so they never drift from what the rest of the app
// shows. The message text itself is translated (automations.messageTemplateById) rather than
// interpolated from src/data/automations.ts's English messageTemplate string - a Spanish demo
// that shows English WhatsApp messages is exactly the kind of mismatch a studio owner would
// notice (CLAUDE.md "a number that disagrees between two screens" applies just as much to copy).
import { useMemo } from 'react';
import { toast } from 'sonner';
import type { Automation, ISODate } from '@/domain/types';
import { useAutomationStore } from '@/stores/automation.store';
import { useCustomerStore } from '@/stores/customer.store';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useDateLocale } from './use-date-locale';
import { useMessages } from './use-messages';

const FALLBACK_STUDIO_NAME = '180 Fitness Studio';
const FALLBACK_CUSTOMER_NAME = 'Customer 01';
const FALLBACK_DEMO_TODAY: ISODate = '2026-09-18';
const SAMPLE_SESSION_TIME = '18:00';

// Mirrors use-date-locale.ts's own local-date construction (duplicated, not imported: that file
// only exports the hook, not this helper) - local-time construct-and-read stays a symmetric pair.
function addDaysISO(date: ISODate, days: number): ISODate {
  const [year, month, day] = date.split('-').map(Number);
  const next = new Date(year, month - 1, day + days);
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, '0');
  const d = String(next.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}` as ISODate;
}

interface TemplateValues {
  className: string;
  sessionDayLabel: string;
  sessionTime: string;
  customerFirstName: string;
  studioName: string;
}

// automations.messageTemplateById's functions take positional args, not a values object, and
// each automation id needs a different subset in a different order (see the dictionary file's
// own comment) - this is the one place that maps domain id -> argument order, matching
// automation-card.tsx / automation-labels.ts's existing "look text up keyed by domain id"
// convention (CLAUDE.md rule 6).
const TEMPLATE_ARGS_BY_ID: Record<string, (values: TemplateValues) => string[]> = {
  'auto-01': (v) => [v.className, v.sessionDayLabel, v.sessionTime],
  'auto-02': (v) => [v.className, v.sessionTime, v.studioName],
  'auto-03': (v) => [v.customerFirstName, v.studioName],
  'auto-04': (v) => [v.customerFirstName],
};

export interface AutomationPreview {
  body: string; // the rendered message template alone, \n preserved
  message: string; // automation.name + a blank line + body, \n preserved
  isSending: boolean;
  sendTest: () => void;
  editTemplate: () => void;
}

export function useAutomationPreview(automation: Automation): AutomationPreview {
  const m = useMessages();
  const { formatDisplayDate, formatDisplayTime } = useDateLocale();
  const sendingId = useAutomationStore((state) => state.sending);
  const sendTestMessage = useAutomationStore((state) => state.sendTestMessage);
  const firstCustomerName = useCustomerStore((state) => state.customers[0]?.name ?? FALLBACK_CUSTOMER_NAME);
  const studioName = useSettingsStore((state) => state.settings?.general.studioName ?? FALLBACK_STUDIO_NAME);
  const demoToday = useDemoRuntimeStore((state) => state.demoToday ?? FALLBACK_DEMO_TODAY);

  const body = useMemo(() => {
    const sampleSessionDate = addDaysISO(demoToday, 1);
    const values: TemplateValues = {
      className: m.automations.samplePreview.className,
      sessionDayLabel: formatDisplayDate(sampleSessionDate),
      sessionTime: formatDisplayTime(SAMPLE_SESSION_TIME),
      customerFirstName: firstCustomerName,
      studioName,
    };
    const hasTemplate = automation.id in m.automations.messageTemplateById && automation.id in TEMPLATE_ARGS_BY_ID;
    if (!hasTemplate) return automation.description;
    const buildTemplate = m.automations.messageTemplateById[automation.id];
    const buildArgs = TEMPLATE_ARGS_BY_ID[automation.id];
    return buildTemplate(...buildArgs(values));
  }, [automation.id, automation.description, demoToday, firstCustomerName, studioName, formatDisplayDate, formatDisplayTime, m.automations]);

  const name = m.automations.nameById[automation.id] ?? automation.name;
  const message = `${name}\n\n${body}`;

  return {
    body,
    message,
    isSending: sendingId === automation.id,
    sendTest: () => {
      void sendTestMessage(automation.id).then(() => toast.success(m.automations.preview.sendTestSuccessToast));
    },
    // No template editor exists in this demo (master plan sections 31-33 scope Phase 7 to
    // catalog display and simulated sending only) - mirrors the login page's "Forgot password"
    // precedent for a documented-but-inert affordance (src/app/(auth)/login/page.tsx).
    editTemplate: () => toast.info(m.automations.preview.editTemplateToast),
  };
}
