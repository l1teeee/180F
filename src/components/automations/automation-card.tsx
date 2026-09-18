'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3 "components/automations/" Phase 7, prop contract
// from section 4. Presentational only (docs/07 section 1 rule 3): automation is passed in,
// onToggle is owned by the page's hook - this card never reads a store itself.
import { StatusBadge } from '@/components/shared/status-badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { Automation } from '@/domain/types';
import { useMessages } from '@/hooks/use-messages';
import { automationChannelLabel, automationTriggerLabel } from './automation-labels';

export interface AutomationCardProps {
  automation: Automation;
  onToggle: (id: string) => void;
}

export function AutomationCard({ automation, onToggle }: AutomationCardProps) {
  const m = useMessages();
  const isActive = automation.status === 'active';
  // src/data/automations.ts's name/description are hand-authored English config, not seeded
  // demo data (CLAUDE.md mock-data rule 5) - the text a viewer reads is owned by this namespace,
  // keyed by that file's automation id (CLAUDE.md rule 6).
  const name = m.automations.nameById[automation.id] ?? automation.name;
  const description = m.automations.descriptionById[automation.id] ?? automation.description;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[15px] font-semibold text-ink">{name}</span>
        <Switch
          checked={isActive}
          onCheckedChange={() => onToggle(automation.id)}
          aria-label={`${isActive ? m.automations.deactivateAria : m.automations.activateAria} ${name}`}
        />
      </div>

      <p className="text-sm text-text-secondary">{description}</p>

      <div>
        <StatusBadge status={automation.status} label={m.automations.statusLabel[automation.status]} />
      </div>

      <dl className="flex flex-col gap-1.5 border-t border-border pt-4 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-text-secondary">{m.automations.fields.channel}</dt>
          <dd className="font-medium text-ink">{automationChannelLabel(m.automations, automation.channel)}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-text-secondary">{m.automations.fields.trigger}</dt>
          <dd className="font-medium text-ink">{automationTriggerLabel(m.automations, automation.trigger)}</dd>
        </div>
      </dl>
    </Card>
  );
}
