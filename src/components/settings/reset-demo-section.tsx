'use client';

// ADR-022 "Reset demo data", reachable from Settings. Rendered from BrandingSection (the last
// card on the page, so this lands at the bottom) rather than as its own top-level section in
// app/(admin)/settings/page.tsx - this task's file-ownership brief covers src/components/settings/**
// but not that page file, so this is the only way to make it reachable from Settings without
// editing a file outside that scope. See the render site in branding-section.tsx.
import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { SectionCard } from '@/components/shared/section-card';
import { useMessages } from '@/hooks/use-messages';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';

export function ResetDemoSection() {
  const m = useMessages();
  const resetDemoData = useDemoRuntimeStore((state) => state.resetDemoData);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleReset() {
    await resetDemoData();
    toast.success(m.settings.resetDemo.successToast);
  }

  return (
    <SectionCard title={m.settings.resetDemo.title}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-ink">{m.settings.resetDemo.label}</p>
          <p className="text-sm text-text-secondary">{m.settings.resetDemo.description}</p>
        </div>
        <Button type="button" variant="secondary" onClick={() => setConfirmOpen(true)}>
          <RotateCcw aria-hidden="true" />
          {m.settings.resetDemo.button}
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={m.settings.resetDemo.confirmTitle}
        description={m.settings.resetDemo.confirmDescription}
        confirmLabel={m.settings.resetDemo.confirmButton}
        destructive
        onConfirm={handleReset}
      />
    </SectionCard>
  );
}
