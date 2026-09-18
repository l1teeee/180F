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
import { useMessages } from '@/hooks/use-messages';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { cn } from '@/lib/cn';

export interface DemoBadgeProps {
  className?: string; // no other props; tooltip copy is fixed (§45)
}

export function DemoBadge({ className }: DemoBadgeProps) {
  const m = useMessages();
  const resetDemoData = useDemoRuntimeStore((state) => state.resetDemoData);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleReset() {
    await resetDemoData();
    toast.success(m.layout.demoDataResetToast);
  }

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <Tooltip>
        {/* TooltipTrigger renders its own <button> by default, so the badge classes go straight
            on it instead of nesting a separate Button/Badge as an asChild ref target. */}
        <TooltipTrigger className={cn(badgeVariants({ variant: 'neutralBrand' }), 'cursor-default')}>
          <FlaskConical aria-hidden="true" />
          {m.layout.demoModeLabel}
        </TooltipTrigger>
        <TooltipContent>{m.layout.demoModeTooltip}</TooltipContent>
      </Tooltip>
      {/* Visual size stays 26px to match the adjacent pill (docs/03 section 5 "Pills and
          badges"), but docs/03 section 10's 40px hit-target floor still applies - the ::before
          trick already used for the booking wizard's back links (e.g. time-step.tsx) extends the
          clickable area without changing what's drawn. */}
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        aria-label={m.layout.resetDemoData}
        title={m.layout.resetDemoData}
        className="relative inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-pill border border-border bg-surface text-text-secondary transition-colors duration-[var(--duration-fast)] ease-out before:absolute before:-inset-2 before:content-[''] hover:bg-surface-muted hover:text-ink"
      >
        <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={m.layout.resetDemoDataConfirmTitle}
        description={m.layout.resetDemoDataConfirmDescription}
        confirmLabel={m.common.reset}
        destructive
        onConfirm={handleReset}
      />
    </div>
  );
}
