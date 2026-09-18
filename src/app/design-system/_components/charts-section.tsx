import { SectionShell } from "./section-shell";
import { WeeklyBarChart } from "./charts/weekly-bar-chart";
import { WaveChart } from "./charts/wave-chart";
import { OccupancyBars } from "./charts/occupancy-bars";

export function ChartsSection() {
  return (
    <SectionShell
      index={7}
      title="Charts"
      description="Hand-built with CSS and inline SVG. Restrained, always paired with a text summary."
    >
      <div className="flex flex-col gap-8">
        <div className="rounded-card-sm border border-border-soft bg-canvas-wash p-5">
          <WeeklyBarChart />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-card-sm border border-border-soft bg-canvas-wash p-5">
            <WaveChart />
          </div>
          <div className="rounded-card-sm border border-border-soft bg-canvas-wash p-5">
            <OccupancyBars />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
