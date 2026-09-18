// docs/07-COMPONENT-ARCHITECTURE.md section 4. Master plan §45: a discreet "Demo Mode" badge,
// visible but not intrusive. Visual decision reused verbatim from
// src/app/design-system/_components/header.tsx (Pill label="Demo Mode" tone="neutralBrand"
// icon={FlaskConical}), rebuilt on the production ui/badge + ui/tooltip primitives.
import { FlaskConical } from 'lucide-react';
import { badgeVariants } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';

export interface DemoBadgeProps {
  className?: string; // no other props; tooltip copy is fixed (§45)
}

const TOOLTIP_COPY = 'Some data and functionality in this environment are simulated.';

export function DemoBadge({ className }: DemoBadgeProps) {
  return (
    <Tooltip>
      {/* TooltipTrigger renders its own <button> by default, so the badge classes go straight
          on it instead of nesting a separate Button/Badge as an asChild ref target. */}
      <TooltipTrigger className={cn(badgeVariants({ variant: 'neutralBrand' }), 'cursor-default', className)}>
        <FlaskConical aria-hidden="true" />
        Demo Mode
      </TooltipTrigger>
      <TooltipContent>{TOOLTIP_COPY}</TooltipContent>
    </Tooltip>
  );
}
