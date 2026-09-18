import { Search } from "lucide-react";
import { Pill, type PillTone } from "./pill";
import { SectionShell } from "./section-shell";

const PASTEL_AVATAR_CLASSES = ["bg-purple-xsoft", "bg-yellow-soft", "bg-green-soft", "bg-blue-soft", "bg-pink-soft"];

interface TableRow {
  customer: string;
  initials: string;
  class: string;
  date: string;
  status: string;
  tone: PillTone;
}

const TABLE_ROWS: TableRow[] = [
  { customer: "Customer 01", initials: "01", class: "Power Yoga", date: "Today, 9:00 AM", status: "Confirmed", tone: "positive" },
  { customer: "Customer 02", initials: "02", class: "HIIT Circuit", date: "Today, 11:30 AM", status: "Pending", tone: "pending" },
  { customer: "Customer 03", initials: "03", class: "Spin Express", date: "Tomorrow, 6:00 PM", status: "Confirmed", tone: "positive" },
  { customer: "Customer 04", initials: "04", class: "Strength Lab", date: "Sep 15, 8:00 AM", status: "Cancelled", tone: "danger" },
  { customer: "Customer 05", initials: "05", class: "Power Yoga", date: "Sep 19, 7:00 AM", status: "Waitlist", tone: "neutralBrand" },
];

function SubLabel({ children }: { children: string }) {
  return (
    <span className="text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">{children}</span>
  );
}

export function DataSurfacesSection() {
  return (
    <SectionShell index={10} title="Data surfaces" description="Search, tables, avatars, empty and loading states.">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <SubLabel>Search input</SubLabel>
          <div className="relative w-full max-w-sm">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-tertiary"
            />
            <input
              type="text"
              aria-label="Search customers, classes"
              placeholder="Search customers, classes..."
              className="h-10 w-full rounded-field border border-border bg-surface pr-3 pl-9 text-sm text-ink placeholder:text-text-tertiary focus:border-purple"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <SubLabel>Table</SubLabel>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr>
                  <th scope="col" className="h-11 px-3 text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">
                    Customer
                  </th>
                  <th scope="col" className="h-11 px-3 text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">
                    Class
                  </th>
                  <th scope="col" className="h-11 px-3 text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">
                    Date
                  </th>
                  <th scope="col" className="h-11 px-3 text-right text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {TABLE_ROWS.map((row, index) => (
                  <tr key={row.customer} className="transition-colors duration-150 hover:bg-surface-muted">
                    <td className="h-[52px] px-3">
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-pill text-xs font-semibold text-ink tabular-nums ${PASTEL_AVATAR_CLASSES[index % PASTEL_AVATAR_CLASSES.length]}`}
                        >
                          {row.initials}
                        </span>
                        <span className="text-sm font-medium text-ink">{row.customer}</span>
                      </span>
                    </td>
                    <td className="h-[52px] px-3 text-sm text-text-secondary">{row.class}</td>
                    <td className="h-[52px] px-3 text-sm text-text-secondary tabular-nums">{row.date}</td>
                    <td className="h-[52px] px-3 text-right">
                      <Pill label={row.status} tone={row.tone} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <SubLabel>Avatar group</SubLabel>
            <div className="flex items-center">
              {TABLE_ROWS.map((row, index) => (
                <span
                  key={row.customer}
                  style={{ marginLeft: index === 0 ? 0 : -8 }}
                  className={`flex h-9 w-9 items-center justify-center rounded-pill border-2 border-surface text-xs font-semibold text-ink tabular-nums ${PASTEL_AVATAR_CLASSES[index % PASTEL_AVATAR_CLASSES.length]}`}
                >
                  {row.initials}
                </span>
              ))}
              <span
                style={{ marginLeft: -8 }}
                className="flex h-9 w-9 items-center justify-center rounded-pill border-2 border-surface bg-surface-muted text-xs font-semibold text-text-secondary tabular-nums"
              >
                +5
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <SubLabel>Empty state</SubLabel>
            <div className="bg-dotfield flex flex-col items-center justify-center gap-3 rounded-card-sm border border-dashed border-border px-6 py-8 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-surface-muted text-text-tertiary">
                <Search aria-hidden="true" className="h-5 w-5" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-[15px] font-semibold text-ink">No customers match your search</p>
                <p className="text-sm text-text-secondary">Try a different name or clear the filters.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <SubLabel>Loading skeleton</SubLabel>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[0, 1].map((key) => (
              <div key={key} className="flex items-center gap-3 rounded-card-sm border border-border bg-surface p-4">
                <span className="animate-shimmer h-9 w-9 shrink-0 rounded-pill" />
                <span className="flex flex-1 flex-col gap-2">
                  <span className="animate-shimmer h-3 w-2/3 rounded-pill" />
                  <span className="animate-shimmer h-3 w-1/3 rounded-pill" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
