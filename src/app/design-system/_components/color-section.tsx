import { SectionShell } from "./section-shell";

interface SwatchDef {
  token: string;
  hex: string;
  className: string;
}

const CANVAS_SURFACES: SwatchDef[] = [
  { token: "--color-background", hex: "#F7F7F5", className: "bg-background" },
  { token: "--color-canvas-wash", hex: "#F8F6FD", className: "bg-canvas-wash" },
  { token: "--color-surface", hex: "#FFFFFF", className: "bg-surface" },
  { token: "--color-surface-muted", hex: "#F1F1EF", className: "bg-surface-muted" },
  { token: "--color-surface-lilac", hex: "#F6F4FE", className: "bg-surface-lilac" },
];

const TEXT_LINES: SwatchDef[] = [
  { token: "--color-ink", hex: "#171717", className: "bg-ink" },
  { token: "--color-text-secondary", hex: "#737373", className: "bg-text-secondary" },
  { token: "--color-text-tertiary", hex: "#A3A3A3", className: "bg-text-tertiary" },
  { token: "--color-border", hex: "#ECECEA", className: "bg-border" },
  { token: "--color-border-soft", hex: "#F2F0FA", className: "bg-border-soft" },
];

const BRAND: SwatchDef[] = [
  { token: "--color-purple", hex: "#7869D4", className: "bg-purple" },
  { token: "--color-purple-deep", hex: "#5B4CBF", className: "bg-purple-deep" },
  { token: "--color-purple-soft", hex: "#DDD8FA", className: "bg-purple-soft" },
  { token: "--color-purple-xsoft", hex: "#F0EDFF", className: "bg-purple-xsoft" },
];

const PASTELS: SwatchDef[] = [
  { token: "--color-yellow", hex: "#F5D889", className: "bg-yellow" },
  { token: "--color-yellow-soft", hex: "#FFF4D3", className: "bg-yellow-soft" },
  { token: "--color-green", hex: "#BFE5CA", className: "bg-green" },
  { token: "--color-green-soft", hex: "#E7F5EB", className: "bg-green-soft" },
  { token: "--color-pink", hex: "#F2C9D3", className: "bg-pink" },
  { token: "--color-pink-soft", hex: "#FCEFF3", className: "bg-pink-soft" },
  { token: "--color-blue", hex: "#D8E6F6", className: "bg-blue" },
  { token: "--color-blue-soft", hex: "#EDF4FC", className: "bg-blue-soft" },
  { token: "--color-danger", hex: "#EF8F8F", className: "bg-danger" },
  { token: "--color-danger-soft", hex: "#FCEAEA", className: "bg-danger-soft" },
];

function Swatch({ token, hex, className }: SwatchDef) {
  return (
    <div className="flex flex-col gap-2 rounded-card-sm border border-border bg-surface p-3">
      <div className={`h-14 w-full rounded-field border border-border ${className}`} />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-ink">{token}</span>
        <span className="text-xs text-text-secondary tabular-nums">{hex}</span>
      </div>
    </div>
  );
}

function SwatchGroup({ label, items }: { label: string; items: SwatchDef[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">{label}</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <Swatch key={item.token} {...item} />
        ))}
      </div>
    </div>
  );
}

export function ColorSection() {
  return (
    <SectionShell
      index={2}
      title="Colour"
      description="Roughly 70% neutral, 20% pastel, 10% ink accent. Every value below lives once, in globals.css."
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SwatchGroup label="Canvas & surfaces" items={CANVAS_SURFACES} />
        <SwatchGroup label="Text & lines" items={TEXT_LINES} />
        <SwatchGroup label="Brand" items={BRAND} />
        <SwatchGroup label="Pastels" items={PASTELS} />
      </div>
    </SectionShell>
  );
}
