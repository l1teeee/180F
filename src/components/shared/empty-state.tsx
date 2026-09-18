// docs/07-COMPONENT-ARCHITECTURE.md section 4. docs/06 section 4.6 / master plan section 47:
// heading, one line of supporting copy, one primary action button. Visual reused from
// src/app/design-system/_components/data-surfaces-section.tsx's "Empty state" example (the
// dot-field wash behind a dashed panel, docs/03 section 2 - dot field is permitted here).
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: LucideIcon;
}

export function EmptyState({ title, description, action, icon: Icon = Inbox }: EmptyStateProps) {
  return (
    <div className="bg-dotfield flex flex-col items-center justify-center gap-3 rounded-card-sm border border-dashed border-border px-6 py-10 text-center">
      <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-pill bg-surface-muted text-text-tertiary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-semibold text-ink">{title}</p>
        {description ? <p className="max-w-sm text-sm text-text-secondary">{description}</p> : null}
      </div>
      {action ? (
        <Button type="button" variant="primary" onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
