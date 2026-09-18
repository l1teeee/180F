// docs/07-COMPONENT-ARCHITECTURE.md section 4. Thin chrome wrapper over the restyled ui/card
// primitive (docs/03 section 5 "Card"): title left, an optional action slot right, hero variant
// swaps the flat white surface for --gradient-card-lilac per docs/03 section 5.
import type { ReactNode } from 'react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/cn';

export interface SectionCardProps {
  title: string;
  action?: ReactNode; // e.g. a ghost "Monthly ▾" select or a "⋮" icon button
  variant?: 'flat' | 'hero';
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, action, variant = 'flat', children, className }: SectionCardProps) {
  return (
    <Card
      className={cn(variant === 'hero' && 'border-border-soft', className)}
      style={variant === 'hero' ? { backgroundImage: 'var(--gradient-card-lilac)' } : undefined}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
