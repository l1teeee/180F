'use client';

// docs/06-ROUTES-AND-SCREENS.md section 3.12. Phase 7 write set (docs/12-AGENT-OWNERSHIP.md).
import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { AutomationCard } from '@/components/automations/automation-card';
import { WhatsAppPreview } from '@/components/automations/whatsapp-preview';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { useAutomationsList } from '@/hooks/use-automations-list';
import { useDemoStatus } from '@/hooks/use-demo-status';
import { useMessages } from '@/hooks/use-messages';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';

export default function AutomationsPage() {
  const m = useMessages();
  const status = useDemoStatus();
  const isSimulatedLoading = useSimulatedLoading('automations');
  const error = useDemoRuntimeStore((state) => state.error);
  const retryHydration = useDemoRuntimeStore((state) => state.retryHydration);
  const list = useAutomationsList();

  // AutomationCard's documented prop contract (docs/07 section 4) is { automation, onToggle }
  // only, with no selection callback, so "which automation is being previewed" is owned here,
  // one level up, as a small explicit control next to each card rather than a new prop on the
  // shared component. Defaults to the first automation once data is ready (docs/06 section 3.12:
  // "WhatsAppPreview shows its own skeleton until an automation is selected (default: the
  // first, Booking confirmation)").
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={m.automations.pageTitle} subtitle={m.automations.pageSubtitle} />
        <ErrorState description={error ?? m.automations.loadErrorFallback} onRetry={retryHydration} />
      </div>
    );
  }

  if (status !== 'ready' || !list || isSimulatedLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={m.automations.pageTitle} subtitle={m.automations.pageSubtitle} />
        <LoadingSkeleton
          variant="automation-card"
          count={4}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
        />
        <LoadingSkeleton variant="preview" />
      </div>
    );
  }

  const selected = list.automations.find((automation) => automation.id === selectedId) ?? list.automations[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={m.automations.pageTitle} subtitle={m.automations.pageSubtitle} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {list.automations.map((automation) => {
          const isSelected = selected?.id === automation.id;
          return (
            <div key={automation.id} className="flex flex-col gap-3">
              <AutomationCard automation={automation} onToggle={list.toggleAutomation} />
              <Button
                type="button"
                variant={isSelected ? 'primary' : 'ghost'}
                aria-pressed={isSelected}
                className="w-full"
                onClick={() => setSelectedId(automation.id)}
              >
                {isSelected ? m.automations.previewingButton : m.automations.previewButton}
              </Button>
            </div>
          );
        })}
      </div>

      {selected ? <WhatsAppPreview automation={selected} /> : null}
    </div>
  );
}
