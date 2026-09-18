import { Flame, Sparkles, Zap, type LucideIcon } from "lucide-react";
import { SectionShell } from "./section-shell";

interface TileDef {
  name: string;
  sublabel: string;
  tag: string;
  tagIcon: LucideIcon;
  gradientVar: string;
  textClassName: string;
}

const TILES: TileDef[] = [
  {
    name: "Power Yoga",
    sublabel: "14 sessions this week",
    tag: "Popular",
    tagIcon: Flame,
    gradientVar: "var(--gradient-tile-purple)",
    textClassName: "text-white",
  },
  {
    name: "HIIT Circuit",
    sublabel: "12 sessions this week",
    tag: "High intensity",
    tagIcon: Zap,
    gradientVar: "var(--gradient-tile-yellow)",
    textClassName: "text-ink",
  },
  {
    name: "Strength Lab",
    sublabel: "9 sessions this week",
    tag: "New",
    tagIcon: Sparkles,
    gradientVar: "var(--gradient-tile-ink)",
    textClassName: "text-white",
  },
];

// Abstract wavy sparkline only - no stock photography of people (docs/03 section 5 and ADR-015).
function TileSparkline() {
  return (
    <svg
      viewBox="0 0 200 60"
      preserveAspectRatio="none"
      className="absolute inset-x-0 bottom-0 h-16 w-full"
      aria-hidden="true"
    >
      <path
        d="M0,40 C30,20 50,50 80,35 C110,20 130,45 160,30 C180,22 190,28 200,25 L200,60 L0,60 Z"
        fill="white"
        fillOpacity={0.16}
      />
      <path
        d="M0,48 C35,32 55,54 90,42 C120,32 140,50 170,40 C185,35 195,38 200,37"
        fill="none"
        stroke="white"
        strokeOpacity={0.35}
        strokeWidth={1.5}
      />
    </svg>
  );
}

export function CategoryTilesSection() {
  return (
    <SectionShell
      index={9}
      title="Category tiles"
      description="Abstract pastel waves, never stock photography of people."
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {TILES.map(({ name, sublabel, tag, tagIcon: TagIcon, gradientVar, textClassName }) => (
          // A real <button>: in a live product this tile navigates to that class's sessions,
          // which is what makes hover lift and press (pattern 1-2, docs/03 12.2 - "clickable
          // cards and tiles only") apply here rather than decorating a static surface.
          <button
            key={name}
            type="button"
            className="relative flex h-[160px] w-full flex-col justify-between overflow-hidden rounded-tile p-5 text-left shadow-tile transition-[transform,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-raise active:scale-[0.98] active:duration-[var(--duration-instant)]"
            style={{ backgroundImage: gradientVar }}
          >
            <div className={`relative z-10 flex flex-col gap-2 ${textClassName}`}>
              <h3 className="text-base font-bold">{name}</h3>
              <p className="text-xs font-medium opacity-80">{sublabel}</p>
              <span className="inline-flex w-fit items-center gap-1 rounded-pill bg-white px-2.5 py-1 text-xs font-semibold text-ink">
                <TagIcon aria-hidden="true" className="h-3 w-3" />
                {tag}
              </span>
            </div>
            <TileSparkline />
          </button>
        ))}
      </div>
    </SectionShell>
  );
}
