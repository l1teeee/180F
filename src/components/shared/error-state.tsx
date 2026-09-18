'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 4. docs/06 section 4.7 / master plan section 48:
// "Something went wrong" / "[Try again]". Consumed by app/error.tsx, (admin)/error.tsx and every
// data view that reads useDemoRuntimeStore.status === 'error' (docs/08 section 8.4).
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMessages } from '@/hooks/use-messages';

export interface ErrorStateProps {
  title?: string; // default m.common.somethingWentWrong
  description?: string;
  onRetry?: () => void; // renders m.common.tryAgain
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  const m = useMessages();
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card-sm border border-border bg-surface px-6 py-10 text-center">
      <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-pill bg-danger-soft text-danger-deep">
        <TriangleAlert className="h-5 w-5" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-semibold text-ink">{title ?? m.common.somethingWentWrong}</p>
        {description ? <p className="max-w-sm text-sm text-text-secondary">{description}</p> : null}
      </div>
      {onRetry ? (
        <Button type="button" variant="primary" onClick={onRetry} className="mt-2">
          {m.common.tryAgain}
        </Button>
      ) : null}
    </div>
  );
}
