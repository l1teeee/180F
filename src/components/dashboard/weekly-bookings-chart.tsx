'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3 "WeeklyBookingsChart": Recharts bar/area of
// WeeklyBookingPoint[] with tooltip + text summary (master plan section 18). Visual language
// from docs/03-DESIGN-SYSTEM.md section 6: fully rounded bars filled with the hatch pattern, the
// highlighted bar (today - selectWeeklyBookingTrend's last point) solid ink, horizontal dashed
// grid only, no vertical grid, no axis lines, a lavender annotation pill with a dashed connector
// on the highlighted value, custom tooltip. Its caller loads it through next/dynamic with
// ssr:false (ADR-012) - this file is the dynamic boundary's leaf, the only file under
// components/dashboard/ that imports 'recharts'.
//
// The SVG <pattern> below approximates globals.css's `bg-hatch` utility (a
// repeating-linear-gradient between two private hex values scoped to that one CSS utility)
// rather than duplicating it: Recharts bars fill via the SVG `fill` attribute, which cannot
// consume a CSS `background-image` utility, and copying bg-hatch's own hex pair here would be a
// second, untracked colour source (docs/07 section 7 anti-patterns: no inline hex outside the
// token system). Built instead from two already-registered tokens (--color-purple-xsoft,
// --color-surface) that read as the same restrained hatch motif.
import { useId, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import type { BarShapeProps, TooltipContentProps } from 'recharts';
import type { WeeklyBookingPoint } from '@/domain/types';

export interface WeeklyBookingsChartProps {
  data: WeeklyBookingPoint[];
}

const CHART_HEIGHT = 260;
const CHART_TOP_MARGIN = 56; // headroom for the annotation pill above the tallest bar

// TooltipContentProps (not TooltipProps - that one omits `payload`, `active` etc. since those
// are the props a *consumer* passes into <Tooltip>, not what a content renderer receives) left
// at its own default generics so it matches <Tooltip content={CustomTooltip} /> below, which is
// also left unparametrized.
function CustomTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  // Recharts types the original datum loosely (`payload?: any` on BarRectangleItem) since it
  // cannot know a consumer's row shape generically - this is the one place that gap is bridged
  // back to our own domain type, not a blanket `any`.
  const point = payload[0]?.payload as WeeklyBookingPoint | undefined;
  if (!point) return null;
  return (
    <div className="rounded-card-sm bg-surface px-3 py-2 text-[13px] shadow-card">
      <p className="font-medium text-text-secondary">{point.label}</p>
      <p className="font-semibold text-ink tabular-nums">{point.bookings} bookings</p>
    </div>
  );
}

export function WeeklyBookingsChart({ data }: WeeklyBookingsChartProps) {
  const hatchId = useId();
  const highlightIndex = data.length - 1; // selectWeeklyBookingTrend: the last point is always demoToday
  const highlight = data[highlightIndex];

  const { min, max } = useMemo(
    () => ({
      min: data.length ? Math.min(...data.map((point) => point.bookings)) : 0,
      max: data.length ? Math.max(...data.map((point) => point.bookings)) : 0,
    }),
    [data],
  );

  // This component only ever renders client-side (its caller loads it via next/dynamic
  // ssr:false), so there is no server-rendered markup to hydrate against and reading
  // matchMedia directly during render - rather than the effect-based pattern shared/stat-card.tsx
  // and shared/occupancy-bar.tsx use for the same check - cannot mismatch or flash.
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function renderBar(props: BarShapeProps) {
    const { x, y, width, height, index } = props;
    const isHighlight = index === highlightIndex;
    const radius = Math.min(width / 2, 16);
    const label = `Today · ${highlight?.bookings ?? 0}`;
    const pillWidth = label.length * 6.5 + 20;
    const pillCenterX = x + width / 2;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={radius}
          ry={radius}
          fill={isHighlight ? undefined : `url(#${hatchId})`}
          className={isHighlight ? 'fill-ink' : undefined}
        />
        {isHighlight ? (
          // docs/06-ROUTES-AND-SCREENS.md section 3.2, 390px row: the chart keeps its x-axis but
          // drops the annotation pill if it collides - simplest reliable rule is to hide it below
          // the `sm` breakpoint, where the narrow SectionCard column has no room for it.
          <g className="hidden sm:block">
            <line
              x1={pillCenterX}
              x2={pillCenterX}
              y1={y - 30}
              y2={y - 6}
              strokeWidth={1}
              strokeDasharray="3 3"
              className="stroke-chart-connector"
            />
            <rect x={pillCenterX - pillWidth / 2} y={y - 54} width={pillWidth} height={24} rx={12} className="fill-purple-xsoft" />
            <text
              x={pillCenterX}
              y={y - 42}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-purple-deep text-xs font-semibold tabular-nums"
            >
              {label}
            </text>
          </g>
        ) : null}
      </g>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: CHART_TOP_MARGIN, right: 8, left: 8, bottom: 0 }} barCategoryGap="28%">
            <defs>
              <pattern id={hatchId} width={12} height={12} patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
                <rect width={12} height={12} className="fill-surface" />
                <rect width={6} height={12} className="fill-purple-xsoft" />
              </pattern>
            </defs>
            <CartesianGrid horizontal vertical={false} stroke="var(--color-border-soft)" strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              dy={8}
              tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12, fontWeight: 600 }}
            />
            <Tooltip cursor={false} content={CustomTooltip} />
            <Bar
              dataKey="bookings"
              shape={renderBar}
              isAnimationActive={!prefersReducedMotion}
              animationDuration={400}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">
        {data.length > 0
          ? `Weekly bookings from ${data[0]?.label} to ${data[highlightIndex]?.label}, ranging from ${min} to ${max} bookings. ${
              highlight ? `${highlight.label} is highlighted at ${highlight.bookings} bookings.` : ''
            }`
          : 'No weekly booking data available.'}
      </p>
    </div>
  );
}
