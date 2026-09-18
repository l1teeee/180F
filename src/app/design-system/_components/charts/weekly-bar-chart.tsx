// Realistic daily booking counts; the last entry is "today" and gets the ink highlight.
const BAR_VALUES = [24, 33, 28, 37, 31, 35, 26, 39, 29, 42];
const HIGHLIGHT_INDEX = BAR_VALUES.length - 1;
const CHART_HEIGHT = 160;
const GRID_LINES = [25, 50, 75];

export function WeeklyBarChart() {
  const maxValue = Math.max(...BAR_VALUES);
  const minValue = Math.min(...BAR_VALUES);
  const highlightValue = BAR_VALUES[HIGHLIGHT_INDEX];

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[15px] font-semibold text-ink">Weekly bookings</h3>
      <div className="relative" style={{ height: CHART_HEIGHT, marginTop: 56 }}>
        {/* horizontal grid only, no vertical grid, no axis lines (docs/03 section 6) */}
        <div className="absolute inset-0 z-0">
          {GRID_LINES.map((pct) => (
            <span
              key={pct}
              className="absolute inset-x-0 border-t border-dashed border-border-soft"
              style={{ top: `${pct}%` }}
            />
          ))}
        </div>
        <div className="relative z-10 flex h-full items-end justify-center gap-3">
          {BAR_VALUES.map((value, index) => {
            const isHighlight = index === HIGHLIGHT_INDEX;
            const heightPx = Math.round((value / maxValue) * CHART_HEIGHT);
            return (
              <div key={index} className="relative flex h-full w-8 flex-col items-center justify-end">
                {isHighlight ? (
                  <div className="absolute -top-14 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1">
                    <span className="rounded-pill bg-purple-xsoft px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-purple-deep tabular-nums">
                      Today · {highlightValue}
                    </span>
                    <span className="h-3 border-l border-dashed border-chart-connector" />
                  </div>
                ) : null}
                <div
                  className={`w-8 rounded-pill ${isHighlight ? "bg-ink" : "bg-hatch"}`}
                  style={{ height: heightPx }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <p className="sr-only">
        Weekly bookings bar chart, ten days shown, ranging from {minValue} to {maxValue} bookings.
        Today is highlighted at {highlightValue} bookings, the highest of the period.
      </p>
    </div>
  );
}
