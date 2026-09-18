// Plot geometry, shared by every curve so the four are visually comparable.
const WIDTH = 100;
const HEIGHT = 70;
const PAD = 10;
const Y_MIN = -0.15;
const Y_MAX = 1.35;

function mapX(t: number): number {
  return PAD + t * WIDTH;
}
function mapY(v: number): number {
  return PAD + HEIGHT - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * HEIGHT;
}

interface EasingCurveProps {
  label: string;
  /** The four cubic-bezier control values, in the same order CSS takes them. */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// A cubic-bezier(x1,y1,x2,y2) easing IS a cubic Bezier curve from (0,0) to (1,1) with those two
// control points - directly an SVG "C" path in the same unit square, just rescaled to pixels. This
// makes the difference between out/in/inout/emphasis visible (the emphasis curve's control point
// past y=1 draws as a visible bump above the "1" line, i.e. the overshoot) rather than only
// described in a token value nobody can picture.
export function EasingCurve({ label, x1, y1, x2, y2 }: EasingCurveProps) {
  const d = `M ${mapX(0)},${mapY(0)} C ${mapX(x1)},${mapY(y1)} ${mapX(x2)},${mapY(y2)} ${mapX(1)},${mapY(1)}`;
  const linearD = `M ${mapX(0)},${mapY(0)} L ${mapX(1)},${mapY(1)}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox={`0 0 ${PAD * 2 + WIDTH} ${PAD * 2 + HEIGHT}`}
        className="h-[88px] w-full max-w-[140px]"
        role="img"
        aria-label={`${label} easing curve, cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`}
      >
        {/* start/end reference lines */}
        <line
          x1={PAD}
          x2={PAD + WIDTH}
          y1={mapY(0)}
          y2={mapY(0)}
          stroke="var(--color-border-soft)"
          strokeWidth={1}
        />
        <line
          x1={PAD}
          x2={PAD + WIDTH}
          y1={mapY(1)}
          y2={mapY(1)}
          stroke="var(--color-border-soft)"
          strokeWidth={1}
        />
        {/* linear reference, for how far the curve departs from a straight, un-eased ramp */}
        <path d={linearD} fill="none" stroke="var(--color-border)" strokeWidth={1} strokeDasharray="2 3" />
        <path d={d} fill="none" stroke="var(--color-purple)" strokeWidth={2.5} strokeLinecap="round" />
      </svg>
      <span className="text-xs font-semibold text-ink">{label}</span>
    </div>
  );
}
