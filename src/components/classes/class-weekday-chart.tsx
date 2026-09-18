'use client';

// docs/07-COMPONENT-ARCHITECTURE.md section 3 "ClassWeekdayChart". docs/03-DESIGN-SYSTEM.md
// section 6 "Weekly bookings": rounded-pill bars, hatch fill, the highlighted bar (here: today's
// weekday) solid ink, horizontal-only dashed grid, no axis lines, a lavender annotation pill with
// a dashed connector on the highlighted value, white tooltip card. Loaded by the caller through
// next/dynamic with ssr:false (ADR-012) - this file is the leaf, so the dynamic boundary is just
// the one import line at the call site.
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ClassWeekdayBookingPoint } from '@/domain/selectors';
import { useMessages } from '@/hooks/use-messages';
import type { Messages } from '@/i18n/messages';

// selectClassWeekdayBookings (src/domain/selectors/classes.ts, not owned by this namespace)
// emits `day` as one of these seven fixed English codes - a matching KEY, not a sentence, since
// the domain layer may not pick a locale (docs/02-ARCHITECTURE.md section 1). This chart is the
// one place that code is turned into the active language's weekday abbreviation, through
// `m.classes.weekdayShort`; every internal comparison (the highlighted bar) keeps comparing the
// raw codes, never the translated text.
type WeekdayCode = keyof Messages['classes']['weekdayShort'];

function translateWeekday(code: string, weekdayShort: Messages['classes']['weekdayShort']): string {
  return weekdayShort[code as WeekdayCode] ?? code;
}

export interface ClassWeekdayChartProps {
  data: ClassWeekdayBookingPoint[];
  highlightDay: string; // today's weekday CODE, e.g. 'Thu' - must match one entry's `day`, not translated
}

const CHART_HEIGHT = 240;
const BAR_SIZE = 32;

interface BarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ClassWeekdayBookingPoint;
}

// A closure factory (not a plain component) so the shape function can close over `highlightDay`
// without Recharts needing to know about it - Recharts calls `shape` as a plain function per bar.
function makeBarShape(highlightDay: string, chartTodayLabel: (n: number) => string) {
  return function BarShape({ x = 0, y = 0, width = 0, height = 0, payload }: BarShapeProps) {
    const isHighlight = payload?.day === highlightDay;
    const radius = Math.min(width / 2, 16);
    const centerX = x + width / 2;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={Math.max(height, 1)}
          rx={radius}
          ry={radius}
          fill={isHighlight ? 'var(--color-ink)' : 'url(#classWeekdayHatch)'}
        />
        {isHighlight ? (
          <g>
            <line
              x1={centerX}
              y1={Math.max(y - 16, 0)}
              x2={centerX}
              y2={Math.max(y - 4, 0)}
              stroke="var(--color-chart-connector)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <rect
              x={centerX - 38}
              y={Math.max(y - 40, 0)}
              width={76}
              height={24}
              rx={12}
              fill="var(--color-purple-xsoft)"
            />
            <text
              x={centerX}
              y={Math.max(y - 40, 0) + 16}
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              fill="var(--color-purple-deep)"
            >
              {chartTodayLabel(payload?.bookings ?? 0)}
            </text>
          </g>
        ) : null}
      </g>
    );
  };
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: { value?: number }[];
}

function ChartTooltip({
  active,
  label,
  payload,
  bookingsCount,
  weekdayShort,
}: ChartTooltipProps & { bookingsCount: (n: number) => string; weekdayShort: Messages['classes']['weekdayShort'] }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-card-sm bg-surface px-3 py-2 text-[13px] shadow-card">
      <p className="text-text-secondary">{label ? translateWeekday(label, weekdayShort) : ''}</p>
      <p className="font-semibold text-ink">{bookingsCount(payload[0]?.value ?? 0)}</p>
    </div>
  );
}

export function ClassWeekdayChart({ data, highlightDay }: ClassWeekdayChartProps) {
  const m = useMessages();
  // Motion pattern 8 "Chart draw" (docs/03 12.2/12.3): draws once on mount, never again - a
  // later data change (e.g. a booking created elsewhere while this page is open) must move the
  // bars instantly, not replay the grow-in. Recharts' own onAnimationEnd flips this off after
  // the first run completes, rather than a timer guessing at the duration. The reduced-motion
  // check reads `window` in the lazy initializer, not an effect (react-hooks/set-state-in-effect):
  // this file is only ever mounted client-side, through next/dynamic's ssr:false (ADR-012), so
  // there is no SSR pass where `window` would be unavailable.
  const [isAnimationActive, setIsAnimationActive] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const values = data.map((point) => point.bookings);
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 0;

  return (
    <div className="flex flex-col gap-2">
      <div style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 48, right: 8, left: 8, bottom: 4 }} barCategoryGap="28%">
            <defs>
              {/* Hatch pattern for non-highlighted bars, built from existing tokens only - no
                  hex literal (CLAUDE.md "no hex colour anywhere else"); bg-hatch in globals.css
                  is an HTML background-image utility and cannot be applied to an SVG bar fill. */}
              <pattern id="classWeekdayHatch" width={10} height={10} patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
                <rect width={10} height={10} fill="var(--color-purple-xsoft)" />
                <rect width={5} height={10} fill="var(--color-surface-lilac)" />
              </pattern>
            </defs>
            <CartesianGrid horizontal vertical={false} strokeDasharray="4 4" stroke="var(--color-border-soft)" />
            <XAxis
              dataKey="day"
              tickFormatter={(value: string) => translateWeekday(value, m.classes.weekdayShort)}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 600 }}
              dy={8}
            />
            <YAxis hide domain={[0, (dataMax: number) => dataMax + 4]} />
            <Tooltip
              content={<ChartTooltip bookingsCount={m.classes.bookingsCount} weekdayShort={m.classes.weekdayShort} />}
              cursor={false}
            />
            <Bar
              dataKey="bookings"
              barSize={BAR_SIZE}
              shape={makeBarShape(highlightDay, m.classes.chartTodayLabel)}
              isAnimationActive={isAnimationActive}
              animationDuration={400}
              onAnimationEnd={() => setIsAnimationActive(false)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">
        {m.classes.weekdayBookingsSummary(
          minValue,
          maxValue,
          translateWeekday(highlightDay, m.classes.weekdayShort),
          data
            .map((point) => m.classes.weekdayEntry(translateWeekday(point.day, m.classes.weekdayShort), point.bookings))
            .join(', '),
        )}
      </p>
    </div>
  );
}
