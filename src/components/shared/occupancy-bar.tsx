'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 4. docs/03 section 6 "Occupancy bars": horizontal,
// 8px tall, fully rounded, track --color-surface-muted, fill in the class accent, percentage in
// tabular numerals to the right.
import { useEffect, useRef, useState } from 'react';
import type { AccentToken } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatPercent } from '@/lib/format';

export interface OccupancyBarProps {
  rate: number; // 0..1
  accent: AccentToken;
  label?: string; // left-side label, e.g. class name
  showPercentage?: boolean; // default true, tabular numerals on the right
  className?: string;
}

// Accent -> solid fill class (not the pastel *-soft tokens): matches the design-system preview's
// OccupancyBars chart (src/app/design-system/_components/charts/occupancy-bars.tsx), which fills
// with bg-purple / bg-yellow / bg-green directly.
const ACCENT_FILL_CLASSNAME: Record<AccentToken, string> = {
  purple: 'bg-purple',
  yellow: 'bg-yellow',
  green: 'bg-green',
  pink: 'bg-pink',
  blue: 'bg-blue',
};

// Pattern 7 "Bar fill" (docs/03 12.2/12.3.2): width animates 0 -> final once, on first arrival,
// and never again - reimplemented from src/app/design-system/_components/bar-fill.tsx's exact
// logic rather than imported from it, for the same reason stat-card.tsx's AnimatedValue is local.
function BarFill({ percent, className }: { percent: number; className: string }) {
  const [width, setWidth] = useState(0);
  const [skipTransition, setSkipTransition] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const instant = hasAnimated.current || reduceMotion;
    hasAnimated.current = true;
    const frame = requestAnimationFrame(() => {
      setSkipTransition(instant);
      setWidth(percent);
    });
    return () => cancelAnimationFrame(frame);
  }, [percent]);

  return (
    <span
      className={cn(
        'block h-full rounded-pill',
        !skipTransition && 'transition-[width] duration-[var(--duration-slow)] ease-out',
        className,
      )}
      style={{ width: `${width}%` }}
    />
  );
}

export function OccupancyBar({ rate, accent, label, showPercentage = true, className }: OccupancyBarProps) {
  const percent = Math.max(0, Math.min(100, Math.round(rate * 100)));
  return (
    // w-full sizes this correctly as a block child; min-w-0 + flex-1 size it correctly as a flex
    // child too (its own inner track span is flex-1, which otherwise collapses to 0px width when
    // the parent hands it no basis - docs/03 section 6 "Occupancy bars").
    <div className={cn('flex w-full min-w-0 flex-1 items-center gap-3', className)}>

      {label ? <span className="w-28 shrink-0 truncate text-sm font-medium text-ink">{label}</span> : null}
      <span className="h-2 flex-1 overflow-hidden rounded-pill bg-surface-muted">
        <BarFill percent={percent} className={ACCENT_FILL_CLASSNAME[accent]} />
      </span>
      {showPercentage ? (
        <span className="w-10 shrink-0 text-right text-sm font-semibold text-ink tabular-nums">
          {formatPercent(rate, 0)}
        </span>
      ) : null}
    </div>
  );
}
