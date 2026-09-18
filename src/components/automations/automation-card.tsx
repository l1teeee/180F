'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3 "components/automations/" Phase 7, prop contract
// from section 4. Presentational only (docs/07 section 1 rule 3): automation is passed in,
// onToggle is owned by the page's hook - this card never reads a store itself.
import { StatusBadge } from '@/components/shared/status-badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { Automation } from '@/domain/types';
import { AUTOMATION_CHANNEL_LABEL, AUTOMATION_TRIGGER_LABEL } from './automation-labels';

export interface AutomationCardProps {
  automation: Automation;
  onToggle: (id: string) => void;
}

export function AutomationCard({ automation, onToggle }: AutomationCardProps) {
  const isActive = automation.status === 'active';

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[15px] font-semibold text-ink">{automation.name}</span>
        <Switch
          checked={isActive}
          onCheckedChange={() => onToggle(automation.id)}
          aria-label={`${isActive ? 'Deactivate' : 'Activate'} ${automation.name}`}
        />
      </div>

      <p className="text-sm text-text-secondary">{automation.description}</p>

      <div>
        <StatusBadge status={automation.status} />
      </div>

      <dl className="flex flex-col gap-1.5 border-t border-border pt-4 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-text-secondary">Channel</dt>
          <dd className="font-medium text-ink">{AUTOMATION_CHANNEL_LABEL[automation.channel]}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-text-secondary">Trigger</dt>
          <dd className="font-medium text-ink">{AUTOMATION_TRIGGER_LABEL[automation.trigger]}</dd>
        </div>
      </dl>
    </Card>
  );
}
