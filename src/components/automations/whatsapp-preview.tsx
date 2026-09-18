'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3 "components/automations/" Phase 7 + docs/03
// section 11.4-F "Message preview dialog" pattern, used here inline (full width, below the card
// grid) rather than inside an actual <Dialog> - docs/06 section 3.12's layout puts this panel
// directly on the page, not behind a trigger. The documented prop contract is `{ automation }`
// only, so sending/editing state lives behind the useAutomationPreview hook, not extra props.
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Automation } from '@/domain/types';
import { useAutomationPreview } from '@/hooks/use-automations-preview';
import { useMessages } from '@/hooks/use-messages';
import { automationChannelLabel, automationTriggerLabel } from './automation-labels';

export interface WhatsAppPreviewProps {
  automation: Automation;
}

export function WhatsAppPreview({ automation }: WhatsAppPreviewProps) {
  const m = useMessages();
  const { body, message, isSending, sendTest, editTemplate } = useAutomationPreview(automation);
  const name = m.automations.nameById[automation.id] ?? automation.name;

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[20px] leading-tight font-[650] text-ink">{m.automations.preview.heading}</span>
          <p className="text-sm text-text-secondary">{name}</p>
        </div>
        {/* docs/03 section 11.4-F: never removable - nothing here may look like a real send. */}
        <Badge variant="neutralBrand">{m.automations.preview.simulatedBadge}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-text-secondary">{m.automations.fields.channel}</dt>
              <dd className="font-medium text-ink">{automationChannelLabel(m.automations, automation.channel)}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-text-secondary">{m.automations.fields.trigger}</dt>
              <dd className="font-medium text-ink">{automationTriggerLabel(m.automations, automation.trigger)}</dd>
            </div>
          </dl>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-[0.04em] text-text-secondary uppercase">
              {m.automations.preview.messageTemplateLabel}
            </span>
            <pre className="rounded-field border border-border bg-surface-muted p-3 font-sans text-sm whitespace-pre-wrap text-text-secondary">
              {body}
            </pre>
          </div>
        </div>

        {/* A phone-style chat surface rather than the bubble floating alone: on a wide card the
            bubble's own 320px cap otherwise leaves a large dead gap next to the template column,
            and a contained "chat window" reads more deliberately as a simulation (master plan
            33 / 66.9), not an unfinished layout. */}
        <div className="flex flex-col justify-end gap-3 rounded-card-sm bg-surface-muted p-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-green-soft text-xs font-semibold text-green-text"
            >
              180
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-ink">180 Fitness Studio</span>
              <span className="text-xs text-text-secondary">{m.automations.preview.chatSubtitle}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="max-w-[320px] rounded-card-sm rounded-tr-none bg-green-soft p-4 text-sm whitespace-pre-line text-ink shadow-card">
              {message}
            </div>
            <span className="text-xs text-text-secondary">{m.automations.preview.deliveredLabel}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={editTemplate}>
          {m.automations.preview.editTemplateButton}
        </Button>
        <Button type="button" variant="primary" onClick={sendTest} disabled={isSending}>
          {isSending ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
          {m.automations.preview.sendTestButton}
        </Button>
      </div>
    </Card>
  );
}
