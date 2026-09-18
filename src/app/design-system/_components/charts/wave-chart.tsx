const LINE_PATH =
  "M0,90 C40,78 55,72 66,70 C90,80 110,90 133,85 C160,78 180,58 200,50 C225,60 245,65 266,60 C295,45 310,32 333,30 C355,35 380,42 400,45";
const AREA_PATH = `${LINE_PATH} L400,120 L0,120 Z`;
// The focused point sits at the trend's peak.
const FOCUS_POINT = { x: 333, y: 30 };

export function WaveChart() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[15px] font-semibold text-ink">Booking trend</h3>
      <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="h-32 w-full" aria-hidden="true">
        <defs>
          <linearGradient id="ds-wave-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-purple)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--color-purple)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={AREA_PATH} fill="url(#ds-wave-gradient)" stroke="none" />
        <path d={LINE_PATH} fill="none" stroke="var(--color-purple)" strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={FOCUS_POINT.x} cy={FOCUS_POINT.y} r={3} fill="var(--color-purple)" stroke="white" strokeWidth={3} />
      </svg>
      <p className="sr-only">
        Booking trend area chart, six weeks shown, rising overall with a peak in week five before
        a slight pullback.
      </p>
    </div>
  );
}
