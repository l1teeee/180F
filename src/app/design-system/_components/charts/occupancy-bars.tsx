import { BarFill } from "../bar-fill";

const OCCUPANCY_ROWS: { name: string; value: number; fillClassName: string }[] = [
  { name: "Power Yoga", value: 92, fillClassName: "bg-purple" },
  { name: "HIIT Circuit", value: 78, fillClassName: "bg-yellow" },
  { name: "Spin Express", value: 65, fillClassName: "bg-green" },
];

export function OccupancyBars() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[15px] font-semibold text-ink">Class occupancy</h3>
      <div className="flex flex-col gap-4">
        {OCCUPANCY_ROWS.map((row) => (
          <div key={row.name} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-sm font-medium text-ink">{row.name}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-pill bg-surface-muted">
              <BarFill value={row.value} className={row.fillClassName} />
            </span>
            <span className="w-10 shrink-0 text-right text-sm font-semibold text-ink tabular-nums">
              {row.value}%
            </span>
          </div>
        ))}
      </div>
      <p className="sr-only">
        Class occupancy: {OCCUPANCY_ROWS.map((row) => `${row.name} ${row.value}%`).join(", ")}.
      </p>
    </div>
  );
}
