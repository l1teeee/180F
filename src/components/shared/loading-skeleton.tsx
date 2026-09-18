// docs/07-COMPONENT-ARCHITECTURE.md section 4. Shape variants used across every screen while
// useDemoRuntimeStore.status !== 'ready' (docs/08 section 8.4), built on the ui/skeleton shimmer
// primitive (docs/03 12.2 pattern 5 - the only looping animation besides the send spinner).
import type { ReactElement } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

export interface LoadingSkeletonProps {
  variant: 'card' | 'table-row' | 'chart' | 'kpi' | 'text';
  count?: number; // repeats, e.g. N table rows
  className?: string;
}

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <div className="flex h-[52px] items-center gap-4 border-b border-border px-3">
      <Skeleton className="h-8 w-8 shrink-0 rounded-pill" />
      <Skeleton className="h-3 flex-1 max-w-40" />
      <Skeleton className="h-3 flex-1 max-w-28" />
      <Skeleton className="h-[26px] w-20 shrink-0" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-64 flex-col justify-end gap-3 rounded-card border border-border bg-surface p-6">
      <div className="flex flex-1 items-end gap-3">
        {[40, 65, 50, 80, 55, 70, 45].map((height, index) => (
          <Skeleton key={index} className="flex-1 rounded-pill" style={{ height: `${height}%` }} />
        ))}
      </div>
      <Skeleton className="h-3 w-1/4" />
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-card-sm border border-border bg-surface p-[18px]">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-chip" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-[26px] w-28" />
    </div>
  );
}

function TextSkeleton() {
  return <Skeleton className="h-4 w-full" />;
}

const VARIANT_RENDER: Record<LoadingSkeletonProps['variant'], () => ReactElement> = {
  card: CardSkeleton,
  'table-row': TableRowSkeleton,
  chart: ChartSkeleton,
  kpi: KpiSkeleton,
  text: TextSkeleton,
};

export function LoadingSkeleton({ variant, count = 1, className }: LoadingSkeletonProps) {
  const Render = VARIANT_RENDER[variant];
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {Array.from({ length: count }, (_, index) => (
        <Render key={index} />
      ))}
    </div>
  );
}
