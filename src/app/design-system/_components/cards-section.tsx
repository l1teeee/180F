import { CalendarCheck, Gauge, MoreHorizontal, Users, type LucideIcon } from "lucide-react";
import { NumberRoll } from "./number-roll";
import { Pill, type PillTone } from "./pill";
import { SectionShell } from "./section-shell";

interface StatCardProps {
  label: string;
  value: number;
  unit?: string;
  delta: string;
  deltaTone: PillTone;
  icon: LucideIcon;
  accentClassName: string;
}

// A real <button> (not a div): in a live product a KPI card like this drills into its own detail
// view, which is also what makes it a legitimate target for hover lift and press (pattern 1-2,
// docs/03 12.2 - "clickable cards and tiles only") rather than decorating a non-interactive
// surface. The metric itself rolls up once on first arrival (pattern 6, NumberRoll).
function StatCard({ label, value, unit, delta, deltaTone, icon: Icon, accentClassName }: StatCardProps) {
  return (
    <button
      type="button"
      className="flex w-full flex-col gap-4 rounded-card-sm border border-border bg-surface p-[18px] text-left transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-raise active:scale-[0.98] active:duration-[var(--duration-instant)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-semibold text-ink">{label}</span>
        <span className={`flex h-10 w-10 items-center justify-center rounded-chip ${accentClassName}`}>
          <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[32px] leading-none font-bold tracking-[-0.02em] text-ink tabular-nums">
          <NumberRoll value={value} />
        </span>
        {unit ? <span className="text-sm font-semibold text-text-secondary">{unit}</span> : null}
      </div>
      <div>
        <Pill label={delta} tone={deltaTone} />
      </div>
    </button>
  );
}

export function CardsSection() {
  return (
    <SectionShell index={6} title="Cards" description="24px corners, near-invisible shadow, one card family, three uses.">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Flat white card */}
          <div className="rounded-card border border-border bg-surface p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[20px] font-[650] text-ink">Recent activity</h3>
              <button
                type="button"
                aria-label="More options"
                className="flex h-8 w-8 items-center justify-center rounded-pill text-text-secondary transition-colors duration-200 hover:bg-surface-muted"
              >
                <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center justify-between gap-4 text-sm">
                <span className="text-text-secondary">
                  Customer 04 booked <span className="font-semibold text-ink">Power Yoga</span>
                </span>
                <span className="shrink-0 text-xs text-text-tertiary tabular-nums">2m ago</span>
              </li>
              <li className="flex items-center justify-between gap-4 text-sm">
                <span className="text-text-secondary">
                  Instructor 02 started <span className="font-semibold text-ink">HIIT Circuit</span>
                </span>
                <span className="shrink-0 text-xs text-text-tertiary tabular-nums">18m ago</span>
              </li>
              <li className="flex items-center justify-between gap-4 text-sm">
                <span className="text-text-secondary">
                  Customer 11 joined the <span className="font-semibold text-ink">Spin Express</span> waitlist
                </span>
                <span className="shrink-0 text-xs text-text-tertiary tabular-nums">41m ago</span>
              </li>
            </ul>
          </div>

          {/* Lilac gradient hero card */}
          <div
            className="flex flex-col justify-between gap-6 rounded-card border border-border-soft p-6 shadow-card sm:flex-row sm:items-center"
            style={{ backgroundImage: "var(--gradient-card-lilac)" }}
          >
            <div className="flex flex-col gap-2">
              <h3 className="text-[20px] font-[650] text-ink">Welcome back, Studio Team</h3>
              <p className="max-w-md text-[15px] font-medium text-text-secondary">
                12 classes are scheduled today across 3 rooms. Occupancy is trending up week over week.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-fit shrink-0 items-center justify-center rounded-pill bg-ink px-5 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
            >
              + New booking
            </button>
          </div>
        </div>

        {/* KPI stat cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <StatCard
            label="Active members"
            value={148}
            delta="+8 this month"
            deltaTone="positive"
            icon={Users}
            accentClassName="bg-purple-xsoft text-purple-deep"
          />
          <StatCard
            label="Today's bookings"
            value={74}
            delta="+12% vs yesterday"
            deltaTone="positive"
            icon={CalendarCheck}
            accentClassName="bg-yellow-soft text-yellow-text"
          />
          <StatCard
            label="Occupancy"
            value={87}
            unit="%"
            delta="+3 pts vs last week"
            deltaTone="positive"
            icon={Gauge}
            accentClassName="bg-green-soft text-green-text"
          />
        </div>
      </div>
    </SectionShell>
  );
}
