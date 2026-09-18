'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 4. Master plan §45: a discreet "Demo Mode" badge,
// visible but not intrusive. Visual decision reused verbatim from
// src/app/design-system/_components/header.tsx (Pill label="Demo Mode" tone="neutralBrand"
// icon={FlaskConical}), rebuilt on the production ui/badge + ui/tooltip primitives.
//
// ADR-022 adds the "Reset demo data" action next to the badge (also reachable from Settings,
// src/components/settings/reset-demo-section.tsx): a small icon button rather than making the
// badge itself clickable, so the badge's own role/name ("Demo Mode") and tooltip stay exactly
// what §45 specifies. Needs its own 'use client' (useState + a store hook), matching every
// other hook-using component in this codebase.
import { useState } from 'react';
import { FlaskConical, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { badgeVariants } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { cn } from '@/lib/cn';

export interface DemoBadgeProps {
  className?: string; // no other props; tooltip copy is fixed (§45)
}

const TOOLTIP_COPY = 'Some data and functionality in this environment are simulated.';

export function DemoBadge({ className }: DemoBadgeProps) {
  const resetDemoData = useDemoRuntimeStore((state) => state.resetDemoData);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleReset() {
    await resetDemoData();
    toast.success('Demo data has been reset.');
  }

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <Tooltip>
        {/* TooltipTrigger renders its own <button> by default, so the badge classes go straight
            on it instead of nesting a separate Button/Badge as an asChild ref target. */}
        <TooltipTrigger className={cn(badgeVariants({ variant: 'neutralBrand' }), 'cursor-default')}>
          <FlaskConical aria-hidden="true" />
          Demo Mode
        </TooltipTrigger>
        <TooltipContent>{TOOLTIP_COPY}</TooltipContent>
      </Tooltip>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        aria-label="Reset demo data"
        title="Reset demo data"
        className="inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-text-secondary transition-colors duration-[var(--duration-fast)] ease-out hover:bg-surface-muted hover:text-ink"
      >
        <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Reset demo data?"
        description="This cannot be undone. Every booking, edit and message made in this session will be discarded and today's demo will reseed from scratch."
        confirmLabel="Reset"
        destructive
        onConfirm={handleReset}
      />
    </div>
  );
}
