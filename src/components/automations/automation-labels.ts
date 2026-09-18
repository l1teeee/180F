// Small lookups shared by automation-card.tsx and whatsapp-preview.tsx, kept in one place so the
// two components can't drift (docs/07-COMPONENT-ARCHITECTURE.md section 7). Text now lives in
// the i18n dictionary (src/i18n/dictionaries/{es,en}/automations.ts) rather than here, so these
// take the active messages object and only own the domain-id -> dictionary-key mapping.
import type { AutomationChannel, AutomationTrigger } from '@/domain/types';
import type { Messages } from '@/i18n/messages';

export function automationChannelLabel(m: Messages['automations'], channel: AutomationChannel): string {
  return m.channelLabel[channel];
}

export function automationTriggerLabel(m: Messages['automations'], trigger: AutomationTrigger): string {
  return m.triggerLabel[trigger];
}
