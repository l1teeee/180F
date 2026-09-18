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
import { AUTOMATION_CHANNEL_LABEL, AUTOMATION_TRIGGER_LABEL } from './automation-labels';

export interface WhatsAppPreviewProps {
  automation: Automation;
}

export function WhatsAppPreview({ automation }: WhatsAppPreviewProps) {
  const { message, isSending, sendTest, editTemplate } = useAutomationPreview(automation);

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[20px] leading-tight font-[650] text-ink">Message preview</span>
          <p className="text-sm text-text-secondary">{automation.name}</p>
        </div>
        {/* docs/03 section 11.4-F: never removable - nothing here may look like a real send. */}
        <Badge variant="neutralBrand">Simulated</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-text-secondary">Channel</dt>
              <dd className="font-medium text-ink">{AUTOMATION_CHANNEL_LABEL[automation.channel]}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-text-secondary">Trigger</dt>
              <dd className="font-medium text-ink">{AUTOMATION_TRIGGER_LABEL[automation.trigger]}</dd>
            </div>
          </dl>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-[0.04em] text-text-secondary uppercase">Message template</span>
            <pre className="rounded-field border border-border bg-surface-muted p-3 font-sans text-sm whitespace-pre-wrap text-text-secondary">
              {automation.messageTemplate}
            </pre>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="max-w-[320px] rounded-card-sm rounded-tr-none bg-green-soft p-4 text-sm whitespace-pre-line text-ink shadow-card">
            {message}
          </div>
          <span className="text-xs text-text-secondary">Delivered</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={editTemplate}>
          Edit template
        </Button>
        <Button type="button" variant="primary" onClick={sendTest} disabled={isSending}>
          {isSending ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
          Send test
        </Button>
      </div>
    </Card>
  );
}
