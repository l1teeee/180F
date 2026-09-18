'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 4. Visual language reused from
// src/app/design-system/_components/cards-section.tsx's local StatCard: label -> metric+unit ->
// delta pill, an optional pastel icon square (docs/03 section 5 "Stat card"). Unlike that
// preview-only prototype this is not itself clickable (the documented contract has no onClick),
// so it does not apply the hover-lift pattern reserved for clickable cards/tiles (docs/03 12.2).
import { useEffect, useRef, useState } from 'react';
import { Minus, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AccentToken } from '@/domain/types';

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: { value: string; direction: 'up' | 'down' | 'flat' };
  icon?: LucideIcon;
  accent?: AccentToken;
  loading?: boolean;
}

const ACCENT_ICON_CLASSNAME: Record<AccentToken, string> = {
  purple: 'bg-purple-xsoft text-purple-deep',
  yellow: 'bg-yellow-soft text-yellow-text',
  green: 'bg-green-soft text-green-text',
  pink: 'bg-pink-soft text-danger-text',
  blue: 'bg-blue-soft text-blue-text',
};

const DELTA_BADGE_VARIANT = { up: 'positive', down: 'danger', flat: 'neutralBrand' } as const;
const DELTA_ICON: Record<'up' | 'down' | 'flat', LucideIcon> = { up: TrendingUp, down: TrendingDown, flat: Minus };

// Pattern 6 "Number roll" (docs/03 12.2/12.3.2) - counts up once on first arrival only,
// reimplemented from src/app/design-system/_components/number-roll.tsx's exact logic rather
// than imported from it: src/components/shared is consumed by every feature screen and must
// not depend on the design-system preview route's private components.
function AnimatedValue({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (hasAnimated.current || reduceMotion) {
      hasAnimated.current = true;
      const frame = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(frame);
    }
    const duration = 600;
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // approximates --ease-out for a rAF-driven count
      setDisplay(Math.round(eased * value));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        hasAnimated.current = true;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{display}</>;
}

function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-card-sm border border-border bg-surface p-[18px]">
      <div className="flex items-center justify-between">
        <span className="animate-shimmer h-4 w-24 rounded-pill" />
        <span className="animate-shimmer h-10 w-10 rounded-chip" />
      </div>
      <span className="animate-shimmer h-8 w-20 rounded-pill" />
      <span className="animate-shimmer h-[26px] w-28 rounded-pill" />
    </div>
  );
}

export function StatCard({ label, value, unit, delta, icon: Icon, accent, loading }: StatCardProps) {
  if (loading) return <StatCardSkeleton />;

  const DeltaIcon = delta ? DELTA_ICON[delta.direction] : null;

  return (
    <div className="flex flex-col gap-4 rounded-card-sm border border-border bg-surface p-[18px] shadow-card">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[15px] font-semibold text-ink">{label}</span>
        {Icon ? (
          <span
            aria-hidden="true"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-chip ${
              accent ? ACCENT_ICON_CLASSNAME[accent] : 'bg-surface-muted text-text-secondary'
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
        ) : null}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[32px] leading-none font-bold tracking-[-0.02em] text-ink tabular-nums">
          {typeof value === 'number' ? <AnimatedValue value={value} /> : value}
        </span>
        {unit ? <span className="text-sm font-semibold text-text-secondary">{unit}</span> : null}
      </div>
      {delta ? (
        <div>
          <Badge variant={DELTA_BADGE_VARIANT[delta.direction]}>
            {DeltaIcon ? <DeltaIcon aria-hidden="true" /> : null}
            {delta.value}
          </Badge>
        </div>
      ) : null}
    </div>
  );
}
