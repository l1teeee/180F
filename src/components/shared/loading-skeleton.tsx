// docs/07-COMPONENT-ARCHITECTURE.md section 4. Shape variants used across every screen while
// useDemoRuntimeStore.status !== 'ready' (docs/08 section 8.4), built on the ui/skeleton shimmer
// primitive (docs/03 12.2 pattern 5 - the only looping animation besides the send spinner).
import type { ReactElement } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

export interface LoadingSkeletonProps {
  variant:
    | 'card'
    | 'table-row'
    | 'chart'
    | 'kpi'
    | 'text'
    | 'class-card'
    | 'person-card'
    | 'plan-card'
    | 'automation-card'
    | 'preview'
    | 'form-section';
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

// The variants below each mirror one real card (or section) of a screen, so a loading screen
// already has the shape of what is about to appear instead of a generic grey block.

// components/classes/class-card.tsx
function ClassCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="size-11 shrink-0 rounded-chip" />
        <Skeleton className="h-3 w-12" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-[17px] w-2/3" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
      </div>
      <Skeleton className="h-5 w-32" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-2 w-full rounded-pill" />
      </div>
      <div className="flex items-center justify-between border-t border-border pt-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="size-6 rounded-pill" />
      </div>
    </div>
  );
}

// components/instructors/instructor-card.tsx
function PersonCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 shrink-0 rounded-pill" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-pill" />
        <Skeleton className="h-6 w-24 rounded-pill" />
      </div>
      <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
        {[0, 1, 2].map((slot) => (
          <div key={slot} className="flex flex-col gap-2">
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

// components/memberships/membership-card.tsx
function PlanCardSkeleton() {
  return (
    <div className="flex flex-col gap-5 rounded-card border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-16 rounded-pill" />
      </div>
      <Skeleton className="h-9 w-32" />
      <div className="flex flex-col gap-2.5">
        {['w-full', 'w-5/6', 'w-full', 'w-2/3'].map((width, index) => (
          <Skeleton key={index} className={`h-3.5 ${width}`} />
        ))}
      </div>
      <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
        <Skeleton className="h-3.5 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}

// components/automations/automation-card.tsx plus the preview button the page puts under it
function AutomationCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="size-11 shrink-0 rounded-chip" />
          <Skeleton className="h-6 w-11 rounded-pill" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-[17px] w-3/4" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

// components/automations/whatsapp-preview.tsx
function PreviewSkeleton() {
  return (
    <div className="flex flex-col gap-5 rounded-card border border-border bg-surface p-6">
      <Skeleton className="h-5 w-48" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-14 w-2/3 rounded-card-sm" />
        <Skeleton className="ml-auto h-10 w-1/2 rounded-card-sm" />
        <Skeleton className="h-16 w-3/5 rounded-card-sm" />
      </div>
    </div>
  );
}

// components/settings/*-section.tsx - docs/06 section 4.5's "form-section"
function FormSectionSkeleton() {
  return (
    <div className="flex flex-col gap-6 rounded-card border border-border bg-surface p-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3.5 w-64 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {[0, 1, 2, 3].map((field) => (
          <div key={field} className="flex flex-col gap-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}

const VARIANT_RENDER: Record<LoadingSkeletonProps['variant'], () => ReactElement> = {
  card: CardSkeleton,
  'table-row': TableRowSkeleton,
  chart: ChartSkeleton,
  kpi: KpiSkeleton,
  text: TextSkeleton,
  'class-card': ClassCardSkeleton,
  'person-card': PersonCardSkeleton,
  'plan-card': PlanCardSkeleton,
  'automation-card': AutomationCardSkeleton,
  preview: PreviewSkeleton,
  'form-section': FormSectionSkeleton,
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
