import { CircleCheck, CircleX, Clock, FlaskConical, Hourglass, Info, type LucideIcon } from "lucide-react";

export type PillTone = "positive" | "pending" | "danger" | "neutralBrand" | "info";

// docs/03 section 5 "Pills and badges" table. Status is always icon-or-shape plus text,
// never colour alone (docs/03 section 10) - every tone gets its own default icon.
const TONE_STYLES: Record<PillTone, { className: string; icon: LucideIcon }> = {
  positive: { className: "bg-green-soft text-green-text", icon: CircleCheck },
  pending: { className: "bg-yellow-soft text-yellow-text", icon: Clock },
  danger: { className: "bg-danger-soft text-danger-text", icon: CircleX },
  neutralBrand: { className: "bg-purple-xsoft text-purple-deep", icon: Hourglass },
  info: { className: "bg-blue-soft text-blue-text", icon: Info },
};

interface PillProps {
  label: string;
  tone: PillTone;
  icon?: LucideIcon;
}

export function Pill({ label, tone, icon }: PillProps) {
  const { className, icon: DefaultIcon } = TONE_STYLES[tone];
  const Icon = icon ?? DefaultIcon;
  return (
    <span
      className={`inline-flex h-[26px] items-center gap-1.5 rounded-pill px-2.5 text-xs font-semibold whitespace-nowrap ${className}`}
    >
      <Icon aria-hidden="true" className="h-3 w-3 shrink-0" />
      {label}
    </span>
  );
}

export { FlaskConical };
