// Plain display-label maps shared by automation-card.tsx and whatsapp-preview.tsx, kept in one
// place so the two components can't drift (docs/07-COMPONENT-ARCHITECTURE.md section 7 - not a
// status->colour map, StatusBadge already owns automation.status via domain/constants, but a
// label string repeated in two component files is the same kind of duplication to avoid).
import type { AutomationChannel, AutomationTrigger } from '@/domain/types';

export const AUTOMATION_CHANNEL_LABEL: Record<AutomationChannel, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  sms: 'SMS',
};

export const AUTOMATION_TRIGGER_LABEL: Record<AutomationTrigger, string> = {
  booking_created: 'New booking',
  session_24h_before: '24 hours before session',
  customer_inactive_30d: 'Inactive 30+ days',
  customer_birthday: "Customer's birthday",
};
