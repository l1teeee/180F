const DURATIONS: { token: string; value: string; usedFor: string }[] = [
  { token: "--duration-instant", value: "100ms", usedFor: "Press feedback" },
  { token: "--duration-fast", value: "150ms", usedFor: "Hover, scrim, exits" },
  { token: "--duration-base", value: "200ms", usedFor: "The default for anything entering" },
  { token: "--duration-slow", value: "260ms", usedFor: "Larger surfaces, progress fills" },
  { token: "--duration-deliberate", value: "320ms", usedFor: "Bottom sheet, mobile drawer" },
];

const EASINGS: { token: string; value: string; usedFor: string }[] = [
  { token: "--ease-out", value: "cubic-bezier(0.22, 1, 0.36, 1)", usedFor: "Entrances - the default" },
  { token: "--ease-in", value: "cubic-bezier(0.4, 0, 1, 1)", usedFor: "Exits" },
  { token: "--ease-inout", value: "cubic-bezier(0.65, 0, 0.35, 1)", usedFor: "Moving between two visible states" },
  {
    token: "--ease-emphasis",
    value: "cubic-bezier(0.34, 1.26, 0.64, 1)",
    usedFor: "One restrained overshoot - success check, switch knob only",
  },
];

function TokenTable({
  caption,
  rows,
}: {
  caption: string;
  rows: { token: string; value: string; usedFor: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">{caption}</span>
      <div className="overflow-x-auto rounded-card-sm border border-border">
        <table className="w-full min-w-[480px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="h-10 px-3 text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">
                Token
              </th>
              <th scope="col" className="h-10 px-3 text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">
                Value
              </th>
              <th scope="col" className="h-10 px-3 text-xs font-semibold tracking-[0.04em] text-text-tertiary uppercase">
                Used for
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.token}>
                <td className="h-11 px-3 font-mono text-xs font-semibold text-ink">{row.token}</td>
                <td className="h-11 px-3 text-xs text-text-secondary tabular-nums">{row.value}</td>
                <td className="h-11 px-3 text-sm text-text-secondary">{row.usedFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// docs/03 12.1 "Tokens" - the five one-shot durations and four easings, as a table rather than a
// wall of CSS, so the reviewer can scan values against what each is for.
export function TokensTable() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <TokenTable caption="Durations" rows={DURATIONS} />
      <TokenTable caption="Easings" rows={EASINGS} />
    </div>
  );
}

export const SHIMMER_DURATION_NOTE =
  "A sixth duration, --duration-shimmer (1400ms), isn't a one-shot transition timing like the five above - it drives the shimmer loop in pattern 5 below, the only pattern besides the simulated WhatsApp send spinner that repeats.";
