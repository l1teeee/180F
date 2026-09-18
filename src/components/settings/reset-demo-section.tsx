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
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';

export function ResetDemoSection() {
  const resetDemoData = useDemoRuntimeStore((state) => state.resetDemoData);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleReset() {
    await resetDemoData();
    toast.success('Demo data has been reset.');
  }

  return (
    <SectionCard title="Demo data">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-ink">Reset demo data</p>
          <p className="text-sm text-text-secondary">
            Discards every booking, edit and message made in this session and reseeds today&apos;s demo from
            scratch. Use this before a fresh run-through.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => setConfirmOpen(true)}>
          <RotateCcw aria-hidden="true" />
          Reset demo data
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Reset demo data?"
        description="This cannot be undone. Every booking, edit and message made in this session will be discarded and today's demo will reseed from scratch."
        confirmLabel="Reset"
        destructive
        onConfirm={handleReset}
      />
    </SectionCard>
  );
}
