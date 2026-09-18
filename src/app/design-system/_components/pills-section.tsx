import { Pill, type PillTone } from "./pill";
import { SectionShell } from "./section-shell";

const STATUS_PILLS: { label: string; tone: PillTone; meaning: string }[] = [
  { label: "Confirmed", tone: "positive", meaning: "Positive delta / Confirmed" },
  { label: "Pending", tone: "pending", meaning: "Pending / Warning" },
  { label: "Cancelled", tone: "danger", meaning: "Cancelled / Danger" },
  { label: "Waitlist", tone: "neutralBrand", meaning: "Waitlist / Neutral-brand" },
  { label: "Info", tone: "info", meaning: "Info" },
];

export function PillsSection() {
  return (
    <SectionShell
      index={5}
      title="Pills"
      description="Status is always icon-or-shape plus text, never colour alone."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STATUS_PILLS.map(({ label, tone, meaning }) => (
          <div
            key={label}
            className="flex flex-col items-start gap-2 rounded-card-sm border border-border bg-surface p-4"
          >
            <Pill label={label} tone={tone} />
            <span className="text-xs text-text-secondary">{meaning}</span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
